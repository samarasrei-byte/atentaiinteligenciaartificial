import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CONSULTATION-PAYMENT] ${step}${detailsStr}`);
};

// Platform commission percentage (15%)
const PLATFORM_COMMISSION_PERCENT = 15;

// Subscriber discount for consultations (20%)
const SUBSCRIBER_DISCOUNT_PERCENT = 20;

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
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    logStep("Function started");
    
    const { contadorId, priceCents, contadorName } = await req.json();
    
    if (!contadorId || !priceCents) {
      throw new Error("Contador ID and price are required");
    }
    
    logStep("Request data", { contadorId, priceCents, contadorName });

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if user is a subscriber to apply discount
    const { isSubscriber, plan } = await checkSubscription(stripe, user.email);
    logStep("Subscription status", { isSubscriber, plan });

    // Calculate final price with discount if subscriber
    let finalPriceCents = priceCents;
    let discountApplied = 0;
    
    if (isSubscriber) {
      discountApplied = Math.round(priceCents * (SUBSCRIBER_DISCOUNT_PERCENT / 100));
      finalPriceCents = priceCents - discountApplied;
      logStep("Subscriber discount applied", { 
        originalPrice: priceCents, 
        discount: discountApplied, 
        finalPrice: finalPriceCents,
        discountPercent: SUBSCRIBER_DISCOUNT_PERCENT
      });
    }

    // Check if contador has a connected Stripe account
    const { data: contadorProfile, error: profileError } = await supabaseClient
      .from("contador_profiles")
      .select("stripe_account_id, stripe_account_status, stripe_onboarding_completed")
      .eq("user_id", contadorId)
      .single();

    const hasConnectedAccount = contadorProfile?.stripe_account_id && 
                                contadorProfile?.stripe_account_status === "active" &&
                                contadorProfile?.stripe_onboarding_completed;

    logStep("Contador Stripe status", { 
      hasConnectedAccount,
      stripeAccountId: contadorProfile?.stripe_account_id,
      status: contadorProfile?.stripe_account_status
    });

    // Calculate platform commission (15%)
    const platformCommissionCents = Math.round(finalPriceCents * (PLATFORM_COMMISSION_PERCENT / 100));
    const contadorReceivesCents = finalPriceCents - platformCommissionCents;
    
    logStep("Fee calculation", { 
      originalPrice: priceCents,
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
    } else {
      logStep("No existing customer, will create new");
    }

    const origin = req.headers.get("origin") || "https://lovable.dev";
    
    // Build product description
    let productDescription = `Sessão de consultoria especializada em Reforma Tributária.`;
    if (isSubscriber) {
      productDescription += ` Desconto de assinante: ${SUBSCRIBER_DISCOUNT_PERCENT}% aplicado!`;
    }
    productDescription += ` Comissão da plataforma: ${PLATFORM_COMMISSION_PERCENT}%`;
    
    // Build session options
    const sessionOptions: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Consulta com ${contadorName || 'Contador'}${isSubscriber ? ' (Desconto Assinante)' : ''}`,
              description: productDescription,
            },
            unit_amount: finalPriceCents,
          },
        quantity: 1,
      },
      ],
      mode: "payment",
      payment_method_types: ["card", "pix"],
      success_url: `${origin}/dashboard?payment=success&contador=${contadorId}`,
      cancel_url: `${origin}/dashboard?tab=contadores&payment=canceled`,
      metadata: {
        user_id: user.id,
        contador_id: contadorId,
        original_price_cents: priceCents.toString(),
        discount_applied_cents: discountApplied.toString(),
        final_price_cents: finalPriceCents.toString(),
        platform_commission_cents: platformCommissionCents.toString(),
        is_subscriber: isSubscriber.toString(),
      },
    };

    // If contador has connected Stripe account, use split payment
    if (hasConnectedAccount && contadorProfile?.stripe_account_id) {
      logStep("Using Stripe Connect split payment", { 
        connectedAccount: contadorProfile.stripe_account_id 
      });

      sessionOptions.payment_intent_data = {
        application_fee_amount: platformCommissionCents,
        transfer_data: {
          destination: contadorProfile.stripe_account_id,
        },
        metadata: {
          user_id: user.id,
          contador_id: contadorId,
          platform_commission_cents: platformCommissionCents.toString(),
          consultation_type: 'scheduled',
          payment_type: 'stripe_connect_split',
          is_subscriber: isSubscriber.toString(),
        },
      };
    } else {
      logStep("Using standard payment (contador without Stripe Connect)");
      
      sessionOptions.payment_intent_data = {
        metadata: {
          user_id: user.id,
          contador_id: contadorId,
          platform_commission_cents: platformCommissionCents.toString(),
          consultation_type: 'scheduled',
          payment_type: 'standard',
          is_subscriber: isSubscriber.toString(),
        },
      };
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionOptions);

    logStep("Checkout session created", { 
      sessionId: session.id, 
      url: session.url,
      platformCommission: platformCommissionCents,
      paymentType: hasConnectedAccount ? 'stripe_connect_split' : 'standard'
    });

    // Create pending consultation in database
    const { data: consultation, error: consultationError } = await supabaseClient
      .from('consultations')
      .insert({
        user_id: user.id,
        contador_id: contadorId,
        price_cents: finalPriceCents,
        platform_fee_cents: platformCommissionCents,
        status: 'pending',
        notes: `Pagamento via Stripe - Session: ${session.id} | Tipo: ${hasConnectedAccount ? 'Split automático' : 'Manual'}${isSubscriber ? ' | Desconto assinante aplicado' : ''}`,
      })
      .select()
      .single();

    if (consultationError) {
      logStep("Error creating consultation", { error: consultationError.message });
    } else {
      logStep("Consultation created", { consultationId: consultation.id });
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id,
      consultationId: consultation?.id,
      originalPrice: priceCents,
      discountApplied,
      finalPrice: finalPriceCents,
      platformCommission: platformCommissionCents,
      contadorReceives: contadorReceivesCents,
      isSubscriber,
      paymentType: hasConnectedAccount ? 'stripe_connect_split' : 'standard',
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
