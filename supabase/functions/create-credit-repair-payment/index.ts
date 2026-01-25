import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CREDIT-REPAIR-PAYMENT] ${step}${detailsStr}`);
};

// =====================================================
// CENTRALIZED PRICING - Single Source of Truth
// These MUST match src/lib/servicePricing.ts
// =====================================================
const CREDIT_REPAIR_PRICES = {
  pf: { baseCents: 68000, subscriberDiscount: 10 }, // R$ 680,00 → R$ 612,00
  pj: { baseCents: 89000, subscriberDiscount: 10 }, // R$ 890,00 → R$ 801,00
};

// Rate limiting configuration
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_SECONDS = 60;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset_at: string;
  retry_after?: number;
}

async function checkRateLimit(
  supabaseClient: any,
  identifier: string,
  endpoint: string
): Promise<RateLimitResult> {
  try {
    const { data, error } = await supabaseClient.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_endpoint: endpoint,
      p_max_requests: RATE_LIMIT_MAX_REQUESTS,
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS
    });

    if (error) {
      logStep("Rate limit check error", { error: error.message });
      return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS, reset_at: new Date().toISOString() };
    }

    return data as RateLimitResult;
  } catch (error) {
    logStep("Rate limit exception", { error: String(error) });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS, reset_at: new Date().toISOString() };
  }
}

// Check if user has active subscription via Stripe
async function checkSubscription(stripe: Stripe, email: string): Promise<{ isSubscriber: boolean; plan: string | null }> {
  try {
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) {
      return { isSubscriber: false, plan: null };
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      const productId = subscription.items.data[0].price.product as string;
      return { isSubscriber: true, plan: productId };
    }

    return { isSubscriber: false, plan: null };
  } catch (error) {
    logStep("Error checking subscription", { error: String(error) });
    return { isSubscriber: false, plan: null };
  }
}

// Determine service type (PF or PJ) from request
function getServiceType(request: any): 'pf' | 'pj' {
  // Check if service_price_cents matches PJ price, otherwise default to PF
  if (request.service_price_cents >= 89000) {
    return 'pj';
  }
  return 'pf';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { ...corsHeaders, ...securityHeaders } });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData?.user) {
      throw new Error("User authentication failed");
    }

    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Rate limiting check
    const rateLimitResult = await checkRateLimit(supabaseClient, user.id, 'create-credit-repair-payment');
    if (!rateLimitResult.allowed) {
      logStep("Rate limit exceeded", { userId: user.id });
      return new Response(
        JSON.stringify({ 
          error: "Muitas tentativas. Aguarde antes de tentar novamente.",
          retry_after: rateLimitResult.retry_after 
        }),
        {
          headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
          status: 429,
        }
      );
    }

    const { requestId } = await req.json();
    if (!requestId) {
      throw new Error("Request ID is required");
    }
    logStep("Request ID received", { requestId });

    // Fetch request details
    const { data: request, error: requestError } = await supabaseClient
      .from("credit_repair_requests")
      .select("*")
      .eq("id", requestId)
      .eq("user_id", user.id)
      .single();

    if (requestError || !request) {
      throw new Error("Credit repair request not found or unauthorized");
    }

    logStep("Request found", { 
      id: request.id,
      servicePriceCents: request.service_price_cents,
      status: request.status
    });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // =====================================================
    // SERVER-SIDE VALIDATION: Check subscription status
    // CRITICAL: Never trust frontend price calculations
    // =====================================================
    const { isSubscriber, plan } = await checkSubscription(stripe, user.email || '');
    logStep("Subscription status", { isSubscriber, plan });

    // Determine service type and get centralized price
    const serviceType = getServiceType(request);
    const priceConfig = CREDIT_REPAIR_PRICES[serviceType];
    const basePriceCents = priceConfig.baseCents;
    
    // Calculate final price SERVER-SIDE
    let finalPriceCents = basePriceCents;
    let discountApplied = 0;
    
    if (isSubscriber) {
      discountApplied = Math.round(basePriceCents * (priceConfig.subscriberDiscount / 100));
      finalPriceCents = basePriceCents - discountApplied;
      logStep("Subscriber discount applied", { 
        originalPrice: basePriceCents, 
        discount: discountApplied, 
        finalPrice: finalPriceCents,
        discountPercent: priceConfig.subscriberDiscount
      });
    }

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email || '', limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    const bureauxCount = request.bureaus_selected?.length || 8;
    const productDescription = `Regularização em ${bureauxCount} plataformas: SPC, Serasa, SCPC, Boa Vista, Quod, Cenprot, Registrato, CADIN${isSubscriber ? ` | ${priceConfig.subscriberDiscount}% OFF para assinante!` : ''}`;

    // Create checkout session with SERVER-VALIDATED price and 4x installments
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Limpa Nome ${serviceType === 'pj' ? 'Empresa (CNPJ)' : 'Pessoa Física'}${isSubscriber ? ' (Desconto Assinante)' : ''}`,
              description: productDescription,
              metadata: {
                request_id: requestId,
                service_type: serviceType,
              },
            },
            unit_amount: finalPriceCents, // SERVER-CALCULATED PRICE
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_method_types: ["card"],
      payment_method_options: {
        card: {
          installments: {
            enabled: true,
          },
        },
      },
      success_url: `${req.headers.get("origin")}/payment-success?type=credit-repair&request_id=${requestId}`,
      cancel_url: `${req.headers.get("origin")}/limpa-nome?cancelled=true`,
      metadata: {
        request_id: requestId,
        user_id: user.id,
        service_type: "credit_repair",
        plan_type: serviceType,
        original_price_cents: basePriceCents.toString(),
        discount_applied_cents: discountApplied.toString(),
        final_price_cents: finalPriceCents.toString(),
        is_subscriber: isSubscriber.toString(),
      },
    });

    logStep("Checkout session created", { 
      sessionId: session.id, 
      basePriceCents,
      discountApplied,
      finalPriceCents,
      isSubscriber,
      serviceType
    });

    // Update request with SERVER-VALIDATED prices
    const { error: updateError } = await supabaseClient
      .from("credit_repair_requests")
      .update({
        stripe_session_id: session.id,
        service_price_cents: basePriceCents,
        final_price_cents: finalPriceCents,
        discount_applied: isSubscriber,
        payment_status: "pending",
      })
      .eq("id", requestId);

    if (updateError) {
      logStep("Warning: Failed to update request", { error: updateError.message });
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id,
      originalPrice: basePriceCents,
      discountApplied,
      finalPrice: finalPriceCents,
      isSubscriber,
      serviceType,
      installments: 4,
      installmentValue: Math.round(finalPriceCents / 4),
    }), {
      headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
