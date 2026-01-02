import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PARTNER-STRIPE-ONBOARD] ${step}${detailsStr}`);
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
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get partner user record
    const { data: partnerUser, error: partnerUserError } = await supabaseClient
      .from("credit_repair_partner_users")
      .select("partner_id, is_primary")
      .eq("user_id", user.id)
      .single();

    if (partnerUserError || !partnerUser) {
      throw new Error("Partner user record not found");
    }

    if (!partnerUser.is_primary) {
      throw new Error("Only primary users can manage Stripe Connect");
    }
    logStep("Partner user found", { partnerId: partnerUser.partner_id });

    // Get partner profile
    const { data: partner, error: partnerError } = await supabaseClient
      .from("credit_repair_partners")
      .select("*")
      .eq("id", partnerUser.partner_id)
      .single();

    if (partnerError || !partner) {
      throw new Error("Partner profile not found");
    }
    logStep("Partner profile found", { partnerId: partner.id, companyName: partner.company_name });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    let accountId = partner.stripe_account_id;

    // Create Stripe Connect account if not exists
    if (!accountId) {
      logStep("Creating new Stripe Connect account");

      const account = await stripe.accounts.create({
        type: "express",
        country: "BR",
        email: partner.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: partner.cnpj ? "company" : "individual",
        business_profile: {
          mcc: "7322", // Credit reporting agencies
          name: partner.trade_name || partner.company_name,
        },
        metadata: {
          partner_id: partner.id,
          user_id: user.id,
        },
      });

      accountId = account.id;
      logStep("Stripe Connect account created", { accountId });

      // Update partner with Stripe account ID
      await supabaseClient
        .from("credit_repair_partners")
        .update({
          stripe_account_id: accountId,
          status: "pending_stripe",
        })
        .eq("id", partner.id);
    }

    // Create account link for onboarding
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/parceiro?tab=financeiro&refresh=true`,
      return_url: `${origin}/parceiro?tab=financeiro&onboarding=complete`,
      type: "account_onboarding",
    });

    logStep("Account link created", { url: accountLink.url });

    return new Response(JSON.stringify({ url: accountLink.url }), {
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
