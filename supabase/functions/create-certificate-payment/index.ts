import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CERTIFICATE-PAYMENT] ${step}${detailsStr}`);
};

// Base price for certificate in cents (R$80,00)
const CERTIFICATE_BASE_PRICE_CENTS = 8000;

// Platform commission percentage (15%)
const PLATFORM_COMMISSION_PERCENT = 15;

// Subscriber discount for certificates (10%)
const SUBSCRIBER_DISCOUNT_PERCENT = 10;

// Check if user has active subscription
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { certificate_type, contador_id, metadata } = await req.json();
    logStep("Request data", { certificate_type, contador_id, metadata });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });

    // Check if user is a subscriber to apply discount
    const { isSubscriber, plan } = await checkSubscription(stripe, user.email);
    logStep("Subscription status", { isSubscriber, plan });

    // Calculate final price with discount if subscriber
    const originalPriceCents = CERTIFICATE_BASE_PRICE_CENTS;
    let finalPriceCents = originalPriceCents;
    let discountApplied = 0;
    
    if (isSubscriber) {
      discountApplied = Math.round(originalPriceCents * (SUBSCRIBER_DISCOUNT_PERCENT / 100));
      finalPriceCents = originalPriceCents - discountApplied;
      logStep("Subscriber discount applied", { 
        originalPrice: originalPriceCents, 
        discount: discountApplied, 
        finalPrice: finalPriceCents,
        discountPercent: SUBSCRIBER_DISCOUNT_PERCENT
      });
    }

    // Calculate platform commission
    const platformCommissionCents = Math.round(finalPriceCents * (PLATFORM_COMMISSION_PERCENT / 100));
    const contadorReceivesCents = finalPriceCents - platformCommissionCents;

    logStep("Fee calculation", { 
      originalPrice: originalPriceCents,
      discountApplied,
      finalPrice: finalPriceCents, 
      platformCommission: platformCommissionCents,
      contadorReceives: contadorReceivesCents
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    const origin = req.headers.get("origin") || "https://lovable.dev";

    // Certificate type names
    const certificateNames: Record<string, string> = {
      certidao_negativa: "Certidão Negativa de Débitos",
      certidao_positiva: "Certidão Positiva com Efeitos de Negativa",
      certidao_regularidade: "Certidão de Regularidade Fiscal",
    };

    const certificateName = certificateNames[certificate_type] || "Certidão";

    // Build product description
    let productDescription = `Emissão de ${certificateName}`;
    if (isSubscriber) {
      productDescription += ` | Desconto de assinante: ${SUBSCRIBER_DISCOUNT_PERCENT}% aplicado!`;
    }

    // Create checkout session for certificate with dynamic pricing
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `${certificateName}${isSubscriber ? ' (Desconto Assinante)' : ''}`,
              description: productDescription,
            },
            unit_amount: finalPriceCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/payment-success?type=certificate&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard`,
      metadata: {
        user_id: user.id,
        certificate_type: certificate_type || "certidao_negativa",
        contador_id: contador_id || "",
        original_price_cents: originalPriceCents.toString(),
        discount_applied_cents: discountApplied.toString(),
        final_price_cents: finalPriceCents.toString(),
        platform_commission_cents: platformCommissionCents.toString(),
        is_subscriber: isSubscriber.toString(),
        ...metadata,
      },
    });

    logStep("Checkout session created", { 
      sessionId: session.id, 
      url: session.url,
      originalPrice: originalPriceCents,
      discountApplied,
      finalPrice: finalPriceCents
    });

    return new Response(
      JSON.stringify({ 
        url: session.url, 
        session_id: session.id,
        originalPrice: originalPriceCents,
        discountApplied,
        finalPrice: finalPriceCents,
        platformCommission: platformCommissionCents,
        contadorReceives: contadorReceivesCents,
        isSubscriber,
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
