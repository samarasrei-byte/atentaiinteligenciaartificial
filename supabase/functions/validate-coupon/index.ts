import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VALIDATE-COUPON] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logStep("No auth header provided");
      return new Response(JSON.stringify({ error: "Autenticação necessária" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      logStep("Invalid token", { error: claimsError?.message });
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    logStep("User authenticated", { userId });

    // Rate limiting - 10 attempts per minute per user
    const { data: rateLimitResult, error: rateLimitError } = await serviceClient.rpc('check_rate_limit', {
      p_identifier: userId,
      p_endpoint: 'validate-coupon',
      p_max_requests: 10,
      p_window_seconds: 60
    });

    if (rateLimitError) {
      logStep("Rate limit check failed", { error: rateLimitError.message });
    } else if (rateLimitResult && !rateLimitResult.allowed) {
      logStep("Rate limit exceeded", { userId });
      return new Response(JSON.stringify({ 
        error: "Muitas tentativas. Aguarde um momento.",
        retryAfter: rateLimitResult.retry_after
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const { couponCode } = await req.json();
    
    // Input validation
    if (!couponCode || typeof couponCode !== 'string') {
      return new Response(JSON.stringify({ valid: false, message: "Código de cupom é obrigatório" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate coupon code length and format
    const trimmedCode = couponCode.trim();
    if (trimmedCode.length === 0 || trimmedCode.length > 50) {
      return new Response(JSON.stringify({ valid: false, message: "Formato de cupom inválido" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Validating coupon", { couponCode: trimmedCode, userId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    try {
      // Try to retrieve the coupon by ID
      const coupon = await stripe.coupons.retrieve(trimmedCode);
      
      if (!coupon.valid) {
        logStep("Coupon is not valid/active");
        return new Response(JSON.stringify({ 
          valid: false, 
          message: "Este cupom não está mais ativo" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      logStep("Coupon found and valid", { 
        id: coupon.id, 
        name: coupon.name,
        percentOff: coupon.percent_off,
        amountOff: coupon.amount_off
      });

      return new Response(JSON.stringify({
        valid: true,
        couponId: coupon.id,
        name: coupon.name || coupon.id,
        percentOff: coupon.percent_off,
        amountOff: coupon.amount_off,
        currency: coupon.currency,
        duration: coupon.duration,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (stripeError: any) {
      logStep("Coupon not found", { error: stripeError.message });
      
      // Try to find by promotion code
      try {
        const promoCodes = await stripe.promotionCodes.list({
          code: trimmedCode,
          active: true,
          limit: 1,
        });

        if (promoCodes.data.length > 0) {
          const promoCode = promoCodes.data[0];
          const coupon = promoCode.coupon;

          if (!coupon.valid) {
            return new Response(JSON.stringify({ 
              valid: false, 
              message: "Este cupom não está mais ativo" 
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            });
          }

          logStep("Promotion code found", { 
            promoCodeId: promoCode.id,
            couponId: coupon.id 
          });

          return new Response(JSON.stringify({
            valid: true,
            couponId: coupon.id,
            promoCodeId: promoCode.id,
            name: coupon.name || promoCode.code,
            percentOff: coupon.percent_off,
            amountOff: coupon.amount_off,
            currency: coupon.currency,
            duration: coupon.duration,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      } catch (promoError) {
        logStep("Promotion code search failed", { error: promoError });
      }

      return new Response(JSON.stringify({ 
        valid: false, 
        message: "Cupom não encontrado ou inválido" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ 
      valid: false, 
      message: "Erro ao validar cupom" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
