import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CONNECT-STATUS] ${step}${detailsStr}`);
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

    // Get contador profile
    const { data: contadorProfile, error: profileError } = await supabaseClient
      .from("contador_profiles")
      .select("stripe_account_id, stripe_account_status, stripe_onboarding_completed")
      .eq("user_id", user.id)
      .single();

    if (profileError || !contadorProfile) {
      return new Response(JSON.stringify({
        connected: false,
        status: "not_connected",
        payouts_enabled: false,
        charges_enabled: false,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (!contadorProfile.stripe_account_id) {
      return new Response(JSON.stringify({
        connected: false,
        status: "not_connected",
        payouts_enabled: false,
        charges_enabled: false,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(contadorProfile.stripe_account_id);
    logStep("Account retrieved", { 
      accountId: account.id, 
      payouts_enabled: account.payouts_enabled,
      charges_enabled: account.charges_enabled,
      details_submitted: account.details_submitted
    });

    // Determine status
    let status = "pending";
    if (account.payouts_enabled && account.charges_enabled) {
      status = "active";
    } else if (account.requirements?.disabled_reason) {
      status = "restricted";
    }

    // Update profile if status changed
    if (status !== contadorProfile.stripe_account_status || 
        account.details_submitted !== contadorProfile.stripe_onboarding_completed) {
      await supabaseClient
        .from("contador_profiles")
        .update({
          stripe_account_status: status,
          stripe_onboarding_completed: account.details_submitted,
        })
        .eq("user_id", user.id);
    }

    // Get balance
    let balance = null;
    try {
      const stripeBalance = await stripe.balance.retrieve({
        stripeAccount: contadorProfile.stripe_account_id,
      });
      balance = {
        available: stripeBalance.available.reduce((sum: number, b: { amount: number }) => sum + b.amount, 0),
        pending: stripeBalance.pending.reduce((sum: number, b: { amount: number }) => sum + b.amount, 0),
      };
      logStep("Balance retrieved", balance);
    } catch (balanceError) {
      logStep("Could not retrieve balance", { error: balanceError });
    }

    return new Response(JSON.stringify({
      connected: true,
      status,
      payouts_enabled: account.payouts_enabled,
      charges_enabled: account.charges_enabled,
      details_submitted: account.details_submitted,
      balance,
      requirements: account.requirements,
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
