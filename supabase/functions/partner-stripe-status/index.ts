import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PARTNER-STRIPE-STATUS] ${step}${detailsStr}`);
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
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id });

    // Get partner user record
    const { data: partnerUser, error: partnerUserError } = await supabaseClient
      .from("credit_repair_partner_users")
      .select("partner_id")
      .eq("user_id", user.id)
      .single();

    if (partnerUserError || !partnerUser) {
      throw new Error("Partner user record not found");
    }

    // Get partner profile
    const { data: partner, error: partnerError } = await supabaseClient
      .from("credit_repair_partners")
      .select("*")
      .eq("id", partnerUser.partner_id)
      .single();

    if (partnerError || !partner) {
      throw new Error("Partner profile not found");
    }
    logStep("Partner found", { partnerId: partner.id });

    if (!partner.stripe_account_id) {
      logStep("No Stripe account connected");
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
    
    logStep("Fetching Stripe account", { accountId: partner.stripe_account_id });
    const account = await stripe.accounts.retrieve(partner.stripe_account_id);

    // Determine status
    let status = "pending";
    if (account.details_submitted && account.payouts_enabled) {
      status = "active";
    } else if (account.requirements?.disabled_reason) {
      status = "restricted";
    }

    // Get balance
    let balance = { available: 0, pending: 0 };
    try {
      const stripeBalance = await stripe.balance.retrieve({
        stripeAccount: partner.stripe_account_id,
      });
      
      const brlAvailable = stripeBalance.available.find((b: { currency: string; amount: number }) => b.currency === "brl");
      const brlPending = stripeBalance.pending.find((b: { currency: string; amount: number }) => b.currency === "brl");
      
      balance = {
        available: brlAvailable?.amount || 0,
        pending: brlPending?.amount || 0,
      };
    } catch (balanceError) {
      logStep("Could not fetch balance", { error: balanceError });
    }

    // Update partner status in database
    if (status !== partner.status) {
      await supabaseClient
        .from("credit_repair_partners")
        .update({ status: status === "active" ? "active" : "pending_stripe" })
        .eq("id", partner.id);
    }

    const response = {
      connected: true,
      status,
      payouts_enabled: account.payouts_enabled || false,
      charges_enabled: account.charges_enabled || false,
      details_submitted: account.details_submitted,
      balance,
      requirements: {
        currently_due: account.requirements?.currently_due || [],
        eventually_due: account.requirements?.eventually_due || [],
        disabled_reason: account.requirements?.disabled_reason,
      },
    };

    logStep("Status retrieved", response);

    return new Response(JSON.stringify(response), {
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
