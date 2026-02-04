import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-MANUAL-PAYMENT-LINK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Verify user is admin (Guilherme or César)
    const { data: userRoles } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdmin = userRoles?.some(r => r.role === 'admin' || r.role === 'contador');
    if (!isAdmin) {
      throw new Error("Unauthorized: Only admins can create payment links");
    }
    logStep("Admin verified");

    const body = await req.json();
    const { 
      clientEmail, 
      clientName, 
      clientUserId,
      amountCents, 
      serviceName, 
      serviceType,
      requestId
    } = body;

    if (!clientEmail || !amountCents || !serviceName) {
      throw new Error("Missing required fields: clientEmail, amountCents, serviceName");
    }

    logStep("Creating payment link", { clientEmail, amountCents, serviceName });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: clientEmail, limit: 1 });
    let customerId: string | undefined;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: clientEmail,
        name: clientName,
        metadata: { user_id: clientUserId || '' },
      });
      customerId = customer.id;
      logStep("Created new customer", { customerId });
    }

    // Create a Checkout Session with payment link
    const origin = req.headers.get("origin") || "https://atentaiinteligenciaartificial.lovable.app";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: serviceName,
              description: `Serviço ${serviceType || 'AtentAI'}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/dashboard?payment=success`,
      cancel_url: `${origin}/dashboard?payment=cancelled`,
      metadata: {
        service_type: serviceType || 'manual',
        request_id: requestId || '',
        client_user_id: clientUserId || '',
        created_by: user.id,
      },
      payment_intent_data: {
        metadata: {
          service_type: serviceType || 'manual',
          request_id: requestId || '',
          client_user_id: clientUserId || '',
        },
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

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
