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

// Platform fee percentage (10%)
const PLATFORM_FEE_PERCENT = 10;

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

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Calculate platform fee (10%)
    const platformFeeCents = Math.round(priceCents * (PLATFORM_FEE_PERCENT / 100));
    
    logStep("Fee calculation", { 
      totalPrice: priceCents, 
      platformFee: platformFeeCents,
      contadorReceives: priceCents - platformFeeCents 
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
    
    // Build session options
    const sessionOptions: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Consulta com ${contadorName || 'Contador'}`,
              description: `Sessão de consultoria especializada em Reforma Tributária. Taxa de serviço: ${PLATFORM_FEE_PERCENT}%`,
            },
            unit_amount: priceCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/dashboard?payment=success&contador=${contadorId}`,
      cancel_url: `${origin}/dashboard?tab=contadores&payment=canceled`,
      metadata: {
        user_id: user.id,
        contador_id: contadorId,
        price_cents: priceCents.toString(),
        platform_fee_cents: platformFeeCents.toString(),
      },
    };

    // If contador has connected Stripe account, use split payment
    if (hasConnectedAccount && contadorProfile?.stripe_account_id) {
      logStep("Using Stripe Connect split payment", { 
        connectedAccount: contadorProfile.stripe_account_id 
      });

      sessionOptions.payment_intent_data = {
        application_fee_amount: platformFeeCents,
        transfer_data: {
          destination: contadorProfile.stripe_account_id,
        },
        metadata: {
          user_id: user.id,
          contador_id: contadorId,
          platform_fee_cents: platformFeeCents.toString(),
          consultation_type: 'scheduled',
          payment_type: 'stripe_connect_split',
        },
      };
    } else {
      logStep("Using standard payment (contador without Stripe Connect)");
      
      sessionOptions.payment_intent_data = {
        metadata: {
          user_id: user.id,
          contador_id: contadorId,
          platform_fee_cents: platformFeeCents.toString(),
          consultation_type: 'scheduled',
          payment_type: 'standard',
        },
      };
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionOptions);

    logStep("Checkout session created", { 
      sessionId: session.id, 
      url: session.url,
      platformFee: platformFeeCents,
      paymentType: hasConnectedAccount ? 'stripe_connect_split' : 'standard'
    });

    // Create pending consultation in database
    const { data: consultation, error: consultationError } = await supabaseClient
      .from('consultations')
      .insert({
        user_id: user.id,
        contador_id: contadorId,
        price_cents: priceCents,
        platform_fee_cents: platformFeeCents,
        status: 'pending',
        notes: `Pagamento via Stripe - Session: ${session.id} | Tipo: ${hasConnectedAccount ? 'Split automático' : 'Manual'}`,
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
      platformFee: platformFeeCents,
      contadorReceives: priceCents - platformFeeCents,
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
