import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CONNECT-ONBOARD] ${step}${detailsStr}`);
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

    // Get contador profile
    const { data: contadorProfile, error: profileError } = await supabaseClient
      .from("contador_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError || !contadorProfile) {
      throw new Error("Contador profile not found");
    }
    logStep("Contador profile found", { profileId: contadorProfile.id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    let accountId = contadorProfile.stripe_account_id;

    // Create Stripe Connect account if not exists
    if (!accountId) {
      logStep("Creating new Stripe Connect account");
      
      // Get user profile for name
      const { data: userProfile } = await supabaseClient
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      const account = await stripe.accounts.create({
        type: "express",
        country: "BR",
        email: user.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: "individual",
        business_profile: {
          mcc: "8931", // Accounting/auditing services
          name: userProfile?.full_name || "Contador",
        },
        metadata: {
          user_id: user.id,
          contador_profile_id: contadorProfile.id,
        },
      });

      accountId = account.id;
      logStep("Stripe Connect account created", { accountId });

      // Update contador profile with Stripe account ID
      await supabaseClient
        .from("contador_profiles")
        .update({
          stripe_account_id: accountId,
          stripe_account_status: "pending",
        })
        .eq("id", contadorProfile.id);
    }

    // Create account link for onboarding
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/contador?tab=earnings&refresh=true`,
      return_url: `${origin}/contador?tab=earnings&onboarding=complete`,
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
