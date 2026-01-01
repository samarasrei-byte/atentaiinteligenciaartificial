import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Security headers for all responses
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-IR-PAYMENT] ${step}${detailsStr}`);
};

// Rate limiting configuration
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute for payment endpoints
const RATE_LIMIT_WINDOW_SECONDS = 60;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset_at: string;
  retry_after?: number;
}

async function checkRateLimit(
  supabaseClient: any,
  identifier: string,
  endpoint: string
): Promise<RateLimitResult> {
  try {
    const { data, error } = await supabaseClient.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_endpoint: endpoint,
      p_max_requests: RATE_LIMIT_MAX_REQUESTS,
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS
    });

    if (error) {
      logStep("Rate limit check error", { error: error.message });
      return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS, reset_at: new Date().toISOString() };
    }

    return data as RateLimitResult;
  } catch (error) {
    logStep("Rate limit exception", { error: String(error) });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS, reset_at: new Date().toISOString() };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { ...corsHeaders, ...securityHeaders } });
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
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError) throw new Error(`Authentication error: ${authError.message}`);
    
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Rate limiting check
    const rateLimitResult = await checkRateLimit(supabaseClient, user.id, 'create-ir-payment');
    logStep("Rate limit check", { 
      allowed: rateLimitResult.allowed, 
      remaining: rateLimitResult.remaining 
    });

    if (!rateLimitResult.allowed) {
      logStep("Rate limit exceeded", { userId: user.id });
      return new Response(
        JSON.stringify({ 
          error: "Muitas tentativas. Por favor, aguarde antes de tentar novamente.",
          retry_after: rateLimitResult.retry_after 
        }),
        {
          headers: { 
            ...corsHeaders, 
            ...securityHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(rateLimitResult.retry_after || 60)
          },
          status: 429,
        }
      );
    }

    const { requestId, irType, priceCents } = await req.json();
    logStep("Request data", { requestId, irType, priceCents });

    if (!requestId || !priceCents) {
      throw new Error("Missing required fields: requestId, priceCents");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Declaração IR ${irType === 'simples' ? 'Simples' : 'Completo'}`,
              description: `Declaração de Imposto de Renda - Modalidade ${irType === 'simples' ? 'Simples' : 'Completa'}`,
            },
            unit_amount: priceCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?type=ir&request_id=${requestId}`,
      cancel_url: `${req.headers.get("origin")}/ir`,
      metadata: {
        user_id: user.id,
        request_id: requestId,
        ir_type: irType,
        service_type: "ir",
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    // Update request with session ID
    await supabaseClient
      .from("ir_requests")
      .update({ stripe_session_id: session.id })
      .eq("id", requestId);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
