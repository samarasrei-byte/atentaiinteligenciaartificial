import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Security headers for all responses
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-IR-PAYMENT] ${step}${detailsStr}`);
};

// =====================================================
// CENTRALIZED PRICING - Single Source of Truth
// These MUST match src/lib/servicePricing.ts
// =====================================================
const IR_PRICES = {
  simples: { baseCents: 15000, subscriberDiscount: 20 }, // R$ 150,00 → R$ 120,00
  completo: { baseCents: 35000, subscriberDiscount: 20 }, // R$ 350,00 → R$ 280,00
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
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError) throw new Error(`Authentication error: ${authError.message}`);
    
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Rate limiting check
    const rateLimitResult = await checkRateLimit(supabaseClient, user.id, 'create-ir-payment');
    logStep("Rate limit check", { 
      allowed: rateLimitResult.allowed, 
      remaining: rateLimitResult.remaining 
    });

    if (!rateLimitResult.allowed) {
      logStep("Rate limit exceeded", { userId: user.id });
      return new Response(
        JSON.stringify({ 
          error: "Muitas tentativas. Por favor, aguarde antes de tentar novamente.",
          retry_after: rateLimitResult.retry_after 
        }),
        {
          headers: { 
            ...corsHeaders, 
            ...securityHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(rateLimitResult.retry_after || 60)
          },
          status: 429,
        }
      );
    }

    const { requestId, irType } = await req.json();
    logStep("Request data", { requestId, irType });

    // Validate irType
    if (!requestId || !irType || !['simples', 'completo'].includes(irType)) {
      throw new Error("Missing required fields: requestId, irType (must be 'simples' or 'completo')");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // =====================================================
    // SERVER-SIDE VALIDATION: Check subscription status
    // CRITICAL: Never trust frontend price calculations
    // =====================================================
    const { isSubscriber, plan } = await checkSubscription(stripe, user.email);
    logStep("Subscription status", { isSubscriber, plan });

    // Get base price from centralized config
    const priceConfig = IR_PRICES[irType as keyof typeof IR_PRICES];
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
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Build product description with discount info
    let productDescription = `Declaração de Imposto de Renda - Modalidade ${irType === 'simples' ? 'Simples' : 'Completa'}`;
    if (isSubscriber) {
      productDescription += ` | ${priceConfig.subscriberDiscount}% OFF para assinante!`;
    }

    // Create checkout session with SERVER-VALIDATED price
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Declaração IR ${irType === 'simples' ? 'Simples' : 'Completo'}${isSubscriber ? ' (Desconto Assinante)' : ''}`,
              description: productDescription,
            },
            unit_amount: finalPriceCents, // SERVER-CALCULATED PRICE
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?type=ir&request_id=${requestId}`,
      cancel_url: `${req.headers.get("origin")}/ir`,
      metadata: {
        user_id: user.id,
        request_id: requestId,
        ir_type: irType,
        service_type: "ir",
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
      isSubscriber
    });

    // Update request with session ID and final prices
    await supabaseClient
      .from("ir_requests")
      .update({ 
        stripe_session_id: session.id,
        base_price_cents: basePriceCents,
        final_price_cents: finalPriceCents,
        discount_applied: isSubscriber,
      })
      .eq("id", requestId);

    return new Response(JSON.stringify({ 
      url: session.url,
      originalPrice: basePriceCents,
      discountApplied,
      finalPrice: finalPriceCents,
      isSubscriber,
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
