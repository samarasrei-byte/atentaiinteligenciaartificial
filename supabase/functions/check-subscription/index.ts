import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    
    let userId: string;
    let userEmail: string;
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      logStep("Auth getUser failed, trying JWT decode fallback", { error: userError.message });
      
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
        throw new Error(`Authentication error: ${userError.message}`);
      }
    } else {
      const user = userData.user;
      if (!user?.email) throw new Error("User not authenticated or email not available");
      userId = user.id;
      userEmail = user.email;
      logStep("User authenticated", { userId, email: userEmail });
    }

    // Check rate limit
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
        },
      });
    }

    // Check database for active subscriptions (Mercado Pago synced)
    const { data: dbSubscription } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    
    if (dbSubscription && new Date(dbSubscription.current_period_end) > new Date()) {
      logStep("Found active subscription", { 
        plan: dbSubscription.plan_type,
        endDate: dbSubscription.current_period_end 
      });
      return new Response(JSON.stringify({ 
        subscribed: true,
        plan: dbSubscription.plan_type,
        subscription_end: dbSubscription.current_period_end,
        is_past_due: false,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check for pending/past_due subscriptions
    const { data: pendingSub } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single();

    if (pendingSub && new Date(pendingSub.current_period_end) > new Date()) {
      logStep("Found past due subscription", { plan: pendingSub.plan_type });
      return new Response(JSON.stringify({
        subscribed: false,
        plan: pendingSub.plan_type,
        subscription_end: pendingSub.current_period_end,
        is_past_due: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    logStep("No active subscription found");
    return new Response(JSON.stringify({ 
      subscribed: false,
      plan: null,
      subscription_end: null,
      is_past_due: false,
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
