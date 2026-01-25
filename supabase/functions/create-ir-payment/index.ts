import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-IR-PAYMENT] ${step}${detailsStr}`);
};

// =====================================================
// CENTRALIZED PRICING - Single Source of Truth
// OFFICIAL PRICES (Updated 2025-01-25):
// - IR Simples: R$ 200,00 (20% off for subscribers = R$ 160,00)
// - IR Completo: R$ 420,00 (20% off for subscribers = R$ 336,00)
// =====================================================
const IR_PRICES = {
  simples: { baseCents: 20000, subscriberDiscount: 20 }, // R$ 200,00 → R$ 160,00
  completo: { baseCents: 42000, subscriberDiscount: 20 }, // R$ 420,00 → R$ 336,00
};

// Rate limiting configuration
const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_SECONDS = 60;

// Check rate limit using service client
async function checkRateLimit(
  identifier: string,
  endpoint: string
): Promise<{ allowed: boolean; remaining: number; retryAfter?: number }> {
  try {
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data, error } = await serviceClient.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_endpoint: endpoint,
      p_max_requests: RATE_LIMIT_REQUESTS,
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
    } as Record<string, unknown>);

    if (error) {
      logStep('Rate limit check error', { error: error.message });
      return { allowed: true, remaining: RATE_LIMIT_REQUESTS };
    }

    const result = data as { allowed: boolean; remaining: number; retry_after?: number };
    return {
      allowed: result.allowed,
      remaining: result.remaining,
      retryAfter: result.retry_after,
    };
  } catch (error) {
    logStep('Rate limit exception', { error: String(error) });
    return { allowed: true, remaining: RATE_LIMIT_REQUESTS };
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
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");
    
    const { requestId, irType } = await req.json();
    if (!requestId) throw new Error("Request ID is required");
    if (!irType || !['simples', 'completo'].includes(irType)) {
      throw new Error("Invalid IR type. Must be 'simples' or 'completo'");
    }
    logStep("Request received", { requestId, irType });

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Rate limiting
    const rateLimit = await checkRateLimit(user.id, 'create-ir-payment');
    if (!rateLimit.allowed) {
      logStep('Rate limit exceeded', { userId: user.id, retryAfter: rateLimit.retryAfter });
      return new Response(JSON.stringify({ 
        error: 'Muitas tentativas. Aguarde antes de tentar novamente.',
        retryAfter: rateLimit.retryAfter
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the IR request
    const { data: request, error: requestError } = await supabaseClient
      .from('ir_requests')
      .select('*')
      .eq('id', requestId)
      .eq('user_id', user.id)
      .single();

    if (requestError || !request) {
      throw new Error("IR request not found");
    }

    logStep("IR request found", { requestId, irType: request.ir_type });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // SERVER-SIDE PRICING - Never trust frontend prices
    const priceConfig = IR_PRICES[irType as keyof typeof IR_PRICES];
    const basePriceCents = priceConfig.baseCents;
    const subscriberDiscountPercent = priceConfig.subscriberDiscount;

    // Check if user is a subscriber via Stripe
    const { isSubscriber, plan } = await checkSubscription(stripe, user.email);
    logStep("Subscription status", { isSubscriber, plan });

    // Calculate final price server-side
    let finalPriceCents = basePriceCents;
    let discountAppliedCents = 0;
    
    if (isSubscriber) {
      discountAppliedCents = Math.round(basePriceCents * (subscriberDiscountPercent / 100));
      finalPriceCents = basePriceCents - discountAppliedCents;
      logStep("Subscriber discount applied", { 
        basePrice: basePriceCents, 
        discount: discountAppliedCents, 
        finalPrice: finalPriceCents,
        discountPercent: subscriberDiscountPercent
      });
    }

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    const origin = req.headers.get("origin") || "https://lovable.dev";
    
    // Build product description
    const irTypeName = irType === 'simples' ? 'Simples' : 'Completo';
    let productDescription = `Declaração de Imposto de Renda ${irTypeName} - Ano ${new Date().getFullYear() - 1}`;
    if (isSubscriber) {
      productDescription += ` | Desconto de assinante: ${subscriberDiscountPercent}% aplicado!`;
    }
    
    // Create checkout session with server-calculated price
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Declaração IR ${irTypeName}${isSubscriber ? ' (Desconto Assinante)' : ''}`,
              description: productDescription,
            },
            unit_amount: finalPriceCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/ir?payment=success&request=${requestId}`,
      cancel_url: `${origin}/ir?payment=cancelled&request=${requestId}`,
      metadata: {
        user_id: user.id,
        request_id: requestId,
        payment_type: 'ir_declaration',
        ir_type: irType,
        base_price_cents: basePriceCents.toString(),
        discount_applied_cents: discountAppliedCents.toString(),
        final_price_cents: finalPriceCents.toString(),
        is_subscriber: isSubscriber.toString(),
      },
    });

    logStep("Checkout session created", { 
      sessionId: session.id, 
      url: session.url,
      basePrice: basePriceCents,
      discountApplied: discountAppliedCents,
      finalPrice: finalPriceCents
    });

    // Update IR request with final price (server-calculated)
    await supabaseClient
      .from('ir_requests')
      .update({ 
        payment_status: 'pending',
        base_price_cents: basePriceCents,
        final_price_cents: finalPriceCents,
        discount_applied: isSubscriber,
        stripe_session_id: session.id,
      })
      .eq('id', requestId);

    return new Response(JSON.stringify({ 
      url: session.url,
      basePrice: basePriceCents,
      discountApplied: discountAppliedCents,
      finalPrice: finalPriceCents,
      isSubscriber,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
