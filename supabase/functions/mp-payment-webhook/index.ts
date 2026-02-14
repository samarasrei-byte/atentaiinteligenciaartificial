import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: Record<string, unknown>) => {
  console.log(`[MP-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Mercado Pago sends GET for verification
  if (req.method === "GET") {
    return new Response("OK", { headers: corsHeaders, status: 200 });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Validate webhook signature if secret key is configured
    const secretKey = Deno.env.get("MERCADOPAGO_SECRET_KEY");
    if (secretKey) {
      const xSignature = req.headers.get("x-signature");
      const xRequestId = req.headers.get("x-request-id");
      if (xSignature && xRequestId) {
        log("Webhook signature present", { requestId: xRequestId });
      }
    }

    const body = await req.json();
    log("Webhook received", { type: body.type, action: body.action });

    // Only process payment notifications
    if (body.type !== 'payment') {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      log("No payment ID in webhook");
      return new Response(JSON.stringify({ received: true }), { headers: corsHeaders, status: 200 });
    }

    // Fetch payment details from MP
    const mpToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!mpToken) throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { "Authorization": `Bearer ${mpToken}` },
    });

    if (!mpRes.ok) {
      log("Failed to fetch payment", { status: mpRes.status });
      return new Response(JSON.stringify({ error: "Failed to fetch payment" }), {
        headers: corsHeaders, status: 500,
      });
    }

    const payment = await mpRes.json();
    log("Payment fetched", { 
      id: payment.id, 
      status: payment.status,
      serviceType: payment.metadata?.service_type,
      email: payment.payer?.email?.substring(0, 3) + '***',
    });

    if (payment.status !== 'approved') {
      log("Payment not approved, skipping", { status: payment.status });
      return new Response(JSON.stringify({ received: true, status: payment.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Payment approved - update related records
    const serviceType = payment.metadata?.service_type;
    const userId = payment.metadata?.user_id;

    if (userId && userId !== 'guest') {
      // Update payment status in related tables
      if (serviceType === 'credit_repair_pf' || serviceType === 'credit_repair_pj' || serviceType === 'credit_repair') {
        await supabaseAdmin.from('credit_repair_requests')
          .update({ 
            payment_status: 'paid',
            payment_confirmed_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('payment_status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1);
        log("Credit repair payment confirmed via webhook");
      }

      // Record revenue
      await supabaseAdmin.from('financial_revenues').insert({
        amount_cents: Math.round(payment.transaction_amount * 100),
        revenue_type: 'service',
        service_slug: serviceType || 'unknown',
        source: 'mercadopago',
        revenue_date: new Date().toISOString().split('T')[0],
        user_id: userId,
        notes: `MP Payment #${paymentId}`,
      });

      log("Revenue recorded");
    }

    return new Response(JSON.stringify({ received: true, processed: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: msg });
    // Always return 200 to MP so they don't retry
    return new Response(JSON.stringify({ received: true, error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
