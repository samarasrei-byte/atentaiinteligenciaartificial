import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const { couponCode } = await req.json();
    if (!couponCode) {
      return new Response(JSON.stringify({ valid: false, message: "Código de cupom é obrigatório" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Validating coupon", { couponCode });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    try {
      // Try to retrieve the coupon by ID
      const coupon = await stripe.coupons.retrieve(couponCode);
      
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
          code: couponCode,
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
