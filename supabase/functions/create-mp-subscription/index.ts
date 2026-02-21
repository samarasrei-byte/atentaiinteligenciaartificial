import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, details?: Record<string, unknown>) => {
  console.log(`[CREATE-MP-SUB] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

const MP_API = "https://api.mercadopago.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Function started");

    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");

    if (!accessToken.startsWith("APP_USR-") && !accessToken.startsWith("TEST-")) {
      throw new Error("Token do Mercado Pago com formato inválido.");
    }

    const {
      planType,
      planName,
      amountCents,
      cardTokenId,
      payerEmail,
      payerName,
      payerIdentification,
    } = await req.json();

    if (!planType || !amountCents || !cardTokenId || !payerEmail) {
      throw new Error("planType, amountCents, cardTokenId e payerEmail são obrigatórios");
    }

    // Auth required for subscriptions
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Autenticação necessária para assinaturas");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const jwtToken = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabaseClient.auth.getUser(jwtToken);
    
    if (authError || !authData.user) {
      throw new Error("Usuário não autenticado");
    }

    const userId = authData.user.id;
    const userEmail = payerEmail || authData.user.email;

    log("User authenticated", { userId, email: userEmail });

    // Convert cents to BRL amount
    const transactionAmount = Number((amountCents / 100).toFixed(2));

    // Create Mercado Pago preapproval (subscription)
    const preapprovalBody = {
      reason: planName || `Assinatura AtentAI - ${planType}`,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: transactionAmount,
        currency_id: "BRL",
      },
      payer_email: userEmail,
      card_token_id: cardTokenId,
      back_url: "https://www.atentai.com.br/payment-success?type=subscription",
      status: "authorized", // Start immediately
    };

    log("Creating preapproval", {
      planType,
      amount: transactionAmount,
      email: userEmail,
    });

    const mpResponse = await fetch(`${MP_API}/preapproval`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(preapprovalBody),
    });

    const contentType = mpResponse.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const text = await mpResponse.text();
      log("MP returned non-JSON", { status: mpResponse.status, body: text.substring(0, 500) });
      throw new Error(`Mercado Pago retornou resposta inválida (status ${mpResponse.status})`);
    }

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      log("MP API Error", { status: mpResponse.status, error: JSON.stringify(mpData) });
      const errorMessage = mpData.message || mpData.error || `Erro no Mercado Pago (${mpResponse.status})`;
      throw new Error(errorMessage);
    }

    log("Preapproval created", {
      id: mpData.id,
      status: mpData.status,
      nextPaymentDate: mpData.next_payment_date,
    });

    // Save subscription in database
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const periodStart = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await supabaseAdmin.from('subscriptions').upsert({
      user_id: userId,
      plan_type: planType,
      price_cents: amountCents,
      status: mpData.status === 'authorized' ? 'active' : 'pending',
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString(),
      mp_subscription_id: mpData.id,
    }, { onConflict: 'user_id' });

    log("Subscription saved to database", { userId, planType, mpSubId: mpData.id });

    return new Response(JSON.stringify({
      success: true,
      subscriptionId: mpData.id,
      status: mpData.status,
      planType,
      nextPaymentDate: mpData.next_payment_date,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
