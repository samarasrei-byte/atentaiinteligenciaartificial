import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-TRIAL-SUCCESS] ${step}${detailsStr}`);
};

const PRODUCT_PLANS: Record<string, string> = {
  'prod_TeyH8gtLUj9Llu': 'simulator',
  'prod_TedPv32txqdcXM': 'premium',
  'prod_Tehfc8IkhNyBJ7': 'contador',
  'prod_Tevvj1l2m0hSOP': 'autonomo',
};

const USER_TYPE_ROLES: Record<string, string> = {
  'empresa': 'user',
  'autonomo': 'autonomo',
  'contador': 'contador',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");
    
    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Session ID is required");
    logStep("Session ID received", { sessionId });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });
    
    logStep("Checkout session retrieved", { 
      status: session.status,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_details?.email,
    });

    if (session.status !== 'complete') {
      throw new Error("Checkout session is not complete");
    }

    const email = session.metadata?.email || session.customer_details?.email;
    const fullName = session.metadata?.full_name || session.customer_details?.name || 'Usuário';
    const userType = session.metadata?.user_type || 'empresa';
    const passwordBase64 = session.metadata?.password_hash;
    
    if (!email) throw new Error("Email not found in session");
    if (!passwordBase64) throw new Error("Password not found in session");
    
    const password = atob(passwordBase64);
    
    logStep("Creating user account", { email, userType });

    // Check if user already exists
    const { data: existingUsers } = await supabaseClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);
    
    let userId: string;
    
    if (existingUser) {
      userId = existingUser.id;
      logStep("User already exists", { userId });
    } else {
      // Create user account
      const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          user_type: userType,
        },
      });

      if (authError) throw new Error(`Failed to create user: ${authError.message}`);
      userId = authData.user.id;
      logStep("User created", { userId });

      // Create profile
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .insert({
          user_id: userId,
          email,
          full_name: fullName,
        });

      if (profileError) {
        logStep("Profile creation error (non-fatal)", { error: profileError.message });
      }

      // Assign role based on user type
      const role = USER_TYPE_ROLES[userType] || 'user';
      const { error: roleError } = await supabaseClient
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
        });

      if (roleError) {
        logStep("Role assignment error (non-fatal)", { error: roleError.message });
      }
    }

    // Get subscription details
    const subscription = session.subscription as Stripe.Subscription;
    const productId = subscription?.items?.data[0]?.price?.product as string;
    const plan = PRODUCT_PLANS[productId] || 'premium';
    
    // Calculate trial end date
    const trialEnd = subscription?.trial_end 
      ? new Date(subscription.trial_end * 1000).toISOString()
      : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

    // Create or update subscription record
    const { error: subError } = await supabaseClient
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan_type: plan,
        status: 'active',
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription?.id,
        current_period_start: new Date().toISOString(),
        current_period_end: trialEnd,
        price_cents: 0, // Trial period
      }, {
        onConflict: 'user_id',
      });

    if (subError) {
      logStep("Subscription record error", { error: subError.message });
    }

    logStep("Trial setup complete", { 
      userId, 
      plan, 
      trialEnd,
      subscriptionId: subscription?.id,
    });

    return new Response(JSON.stringify({ 
      success: true,
      userId,
      email,
      plan,
      trialEnd,
      userType,
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
