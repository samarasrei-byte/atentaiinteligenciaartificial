import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Rate limiting function
async function checkRateLimit(
  supabaseClient: any,
  identifier: string,
  endpoint: string,
  maxRequests: number = 60,
  windowSeconds: number = 60
): Promise<{ allowed: boolean; remaining: number; retryAfter?: number }> {
  try {
    const { data, error } = await supabaseClient.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_endpoint: endpoint,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      logStep('Rate limit check error', { error: error.message });
      return { allowed: true, remaining: maxRequests };
    }

    const result = data as { allowed: boolean; remaining: number; retry_after?: number };
    return {
      allowed: result.allowed,
      remaining: result.remaining,
      retryAfter: result.retry_after,
    };
  } catch (error) {
    logStep('Rate limit exception', { error: String(error) });
    return { allowed: true, remaining: maxRequests };
  }
}

// Product ID to plan name mapping
const PRODUCT_PLANS: Record<string, string> = {
  "prod_TeJKjnfkaw0JfV": "simulator",
  "prod_TedPv32txqdcXM": "premium",
  "prod_Tecf36TAM9IMat": "contador",
  "prod_Tehfc8IkhNyBJ7": "contador", // Contador Premium Plus product
  "prod_Tevvj1l2m0hSOP": "autonomo", // Autônomo Master product
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

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    
    // Try to get user from token, with fallback to JWT payload extraction
    let userId: string;
    let userEmail: string;
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      logStep("Auth getUser failed, trying JWT decode fallback", { error: userError.message });
      
      // Try to decode JWT payload manually as fallback (base64url)
      try {
        const parts = token.split('.');
        if (parts.length !== 3) throw new Error("Invalid token format");

        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

        const payload = JSON.parse(atob(padded));
        userId = payload.sub;
        userEmail = payload.email;

        if (!userId || !userEmail) {
          throw new Error("Could not extract user info from token");
        }

        logStep("Extracted user from JWT payload", { userId, email: userEmail });
      } catch (decodeError) {
        logStep("JWT decode fallback failed", {
          message: decodeError instanceof Error ? decodeError.message : String(decodeError),
        });
        throw new Error(`Authentication error: ${userError.message}`);
      }
    } else {
      const user = userData.user;
      if (!user?.email) throw new Error("User not authenticated or email not available");
      userId = user.id;
      userEmail = user.email;
      logStep("User authenticated via getUser", { userId, email: userEmail });
    }

    // Check rate limit (120 requests per minute - this endpoint is called frequently)
    const rateLimit = await checkRateLimit(supabaseClient, userId, 'check-subscription', 120, 60);
    
    if (!rateLimit.allowed) {
      logStep('Rate limit exceeded', { userId, retryAfter: rateLimit.retryAfter });
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: rateLimit.retryAfter
      }), {
        status: 429,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          'Retry-After': String(rateLimit.retryAfter || 60),
          'X-RateLimit-Remaining': '0'
        },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found, checking database subscription");
      
      // Fallback: check database for manual subscriptions
      const { data: dbSubscription } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
      
      if (dbSubscription && new Date(dbSubscription.current_period_end) > new Date()) {
        logStep("Found active database subscription", { 
          plan: dbSubscription.plan_type,
          endDate: dbSubscription.current_period_end 
        });
        return new Response(JSON.stringify({ 
          subscribed: true,
          plan: dbSubscription.plan_type,
          subscription_end: dbSubscription.current_period_end 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      logStep("No active subscription found");
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: null,
        subscription_end: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let plan = null;
    let subscriptionEnd = null;
    let priceId = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      const productId = subscription.items.data[0].price.product as string;
      priceId = subscription.items.data[0].price.id;
      plan = PRODUCT_PLANS[productId] || "unknown";
      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        plan,
        productId,
        endDate: subscriptionEnd 
      });

      // Update subscription in database
      await supabaseClient
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan_type: plan,
          status: 'active',
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: subscriptionEnd,
          price_cents: subscription.items.data[0].price.unit_amount || 0,
        }, { onConflict: 'user_id' });
      
      logStep("Database updated");
    } else {
      logStep("No active subscription found");
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan,
      price_id: priceId,
      subscription_end: subscriptionEnd
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
