import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-LIMPA-NOME-CHECKOUT] ${step}${detailsStr}`);
};

// =====================================================
// CENTRALIZED PRICING - Single Source of Truth
// OFFICIAL PRICES:
// - Limpa Nome PF: R$ 780,00
// - Limpa Nome CNPJ: R$ 970,00
// =====================================================
const CREDIT_REPAIR_PRICES = {
  pf: { baseCents: 78000, name: 'Pessoa Física (CPF)' },
  pj: { baseCents: 97000, name: 'Empresa (CNPJ)' },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const { serviceType, email, fullName, couponCode } = await req.json();
    
    if (!serviceType || !['pf', 'pj'].includes(serviceType)) {
      throw new Error("Invalid service type. Must be 'pf' or 'pj'");
    }
    
    logStep("Request received", { serviceType, email, fullName });

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get base price
    const priceConfig = CREDIT_REPAIR_PRICES[serviceType as keyof typeof CREDIT_REPAIR_PRICES];
    let finalPriceCents = priceConfig.baseCents;
    let discountAppliedCents = 0;
    let couponId: string | null = null;

    // Validate coupon if provided
    if (couponCode) {
      const { data: couponResult } = await serviceClient.rpc('validate_affiliate_coupon', {
        p_code: couponCode,
        p_service_type: 'credit_repair',
      });

      if (couponResult?.valid) {
        couponId = couponResult.coupon_id;
        if (couponResult.discount_type === 'percent') {
          discountAppliedCents = Math.round(finalPriceCents * (couponResult.discount_value / 100));
        } else {
          discountAppliedCents = couponResult.discount_value * 100; // Convert to cents
        }
        finalPriceCents = Math.max(0, finalPriceCents - discountAppliedCents);
        logStep("Coupon applied", { couponCode, discount: discountAppliedCents });
      }
    }

    // Check for authenticated user
    let userId: string | null = null;
    let userEmail = email;
    
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      const { data: userData } = await supabaseClient.auth.getUser(token);
      if (userData.user) {
        userId = userData.user.id;
        userEmail = userData.user.email || email;
        logStep("Authenticated user", { userId });
      }
    }

    // Create credit repair request (with or without user_id)
    // If guest, user_id will be updated after account creation
    const { data: request, error: requestError } = await serviceClient
      .from('credit_repair_requests')
      .insert({
        user_id: userId || '00000000-0000-0000-0000-000000000000', // Placeholder for guests
        full_name: fullName || 'Cliente',
        email: userEmail,
        status: 'pending',
        payment_status: 'pending',
        debt_amount_cents: 0,
        service_price_cents: priceConfig.baseCents,
        final_price_cents: finalPriceCents,
        discount_applied: discountAppliedCents > 0,
      })
      .select()
      .single();

    if (requestError) {
      logStep("Error creating request", { error: requestError.message });
      throw new Error("Failed to create service request");
    }

    logStep("Request created", { requestId: request.id });

    // Check if Stripe customer exists
    let customerId;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Existing customer found", { customerId });
      }
    }

    const origin = req.headers.get("origin") || "https://lovable.dev";
    
    // Create checkout session with PIX + Card support
    // NOTE: PIX disabled - needs to be activated in Stripe Dashboard first
    // Once enabled in https://dashboard.stripe.com/account/payments/settings
    // add 'pix' back to payment_method_types: ['card', 'pix']
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail || undefined,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Limpa Nome ${priceConfig.name}`,
              description: 'Regularização de restrições via liminar coletiva com acompanhamento especializado',
            },
            unit_amount: finalPriceCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/limpa-nome/sucesso?session_id={CHECKOUT_SESSION_ID}&request_id=${request.id}`,
      cancel_url: `${origin}/limpa-nome?cancelled=true`,
      metadata: {
        request_id: request.id,
        user_id: userId || 'guest',
        payment_type: 'credit_repair',
        service_type: serviceType,
        coupon_id: couponId || '',
        base_price_cents: priceConfig.baseCents.toString(),
        discount_applied_cents: discountAppliedCents.toString(),
        final_price_cents: finalPriceCents.toString(),
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    // Update request with Stripe session ID
    await serviceClient
      .from('credit_repair_requests')
      .update({ stripe_session_id: session.id })
      .eq('id', request.id);

    return new Response(JSON.stringify({ 
      url: session.url,
      requestId: request.id,
      basePrice: priceConfig.baseCents,
      discount: discountAppliedCents,
      finalPrice: finalPriceCents,
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
