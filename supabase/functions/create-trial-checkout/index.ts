import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-TRIAL-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const { priceId, email, fullName, userType, password } = await req.json();
    
    if (!priceId) throw new Error("Price ID is required");
    if (!email) throw new Error("Email is required");
    if (!password) throw new Error("Password is required");
    
    logStep("Request received", { priceId, email, userType });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer already exists
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId: string | undefined;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email,
        name: fullName,
        metadata: {
          user_type: userType || 'empresa',
          source: 'trial_onboarding',
        },
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    const origin = req.headers.get("origin") || "https://lovable.dev";
    
    // Create checkout session with 3-day trial
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 3,
        metadata: {
          user_type: userType || 'empresa',
          full_name: fullName,
        },
      },
      success_url: `${origin}/trial-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/comecar?checkout=canceled`,
      metadata: {
        email,
        full_name: fullName,
        user_type: userType || 'empresa',
        password_hash: btoa(password), // Will be used to create account
        source: 'trial_onboarding',
      },
      payment_method_collection: 'always',
      custom_text: {
        submit: {
          message: 'Você não será cobrado agora. Seu trial gratuito de 3 dias começa após confirmar.',
        },
        terms_of_service_acceptance: {
          message: 'Ao continuar, você concorda com os Termos de Uso e Política de Privacidade.',
        },
      },
      consent_collection: {
        terms_of_service: 'required',
      },
    });
    
    logStep("Trial checkout session created", { 
      sessionId: session.id, 
      trialDays: 3,
      url: session.url 
    });

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id,
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
