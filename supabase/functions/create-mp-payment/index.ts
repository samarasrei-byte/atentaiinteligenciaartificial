import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-MP-PAYMENT] ${step}${detailsStr}`);
};

const MP_API = "https://api.mercadopago.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");

    const {
      amount,
      description,
      serviceType,
      serviceName,
      paymentMethodId,
      token,
      installments,
      issuer_id,
      payer,
      metadata,
    } = await req.json();

    if (!amount || amount < 100) {
      throw new Error("Amount must be at least R$1,00 (100 centavos)");
    }

    // Auth - optional for guest checkout
    let userId: string | null = null;
    let userEmail = payer?.email || null;

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      const jwtToken = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(jwtToken);
      if (data.user) {
        userId = data.user.id;
        userEmail = userEmail || data.user.email;
        logStep("User authenticated", { userId, email: userEmail });
      }
    }

    if (!userEmail) throw new Error("Email do pagador é obrigatório");

    // Build payment body for Mercado Pago
    const paymentBody: Record<string, unknown> = {
      transaction_amount: amount / 100, // MP uses reais, not centavos
      description: description || serviceName || "Serviço AtentAI",
      payment_method_id: paymentMethodId || "pix",
      payer: {
        email: userEmail,
        first_name: payer?.first_name || "",
        last_name: payer?.last_name || "",
        identification: payer?.identification || undefined,
      },
      metadata: {
        user_id: userId || "guest",
        service_type: serviceType || "unknown",
        service_name: serviceName || "Unknown",
        ...(metadata || {}),
      },
    };

    // Card payment - needs token and installments
    if (token) {
      paymentBody.token = token;
      paymentBody.installments = installments || 1;
      if (issuer_id) paymentBody.issuer_id = issuer_id;
    }

    logStep("Creating payment", { 
      amount: paymentBody.transaction_amount,
      method: paymentMethodId,
      serviceType 
    });

    const mpResponse = await fetch(`${MP_API}/v1/payments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(paymentBody),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      logStep("MP API Error", { status: mpResponse.status, error: mpData });
      throw new Error(mpData.message || `Mercado Pago error: ${mpResponse.status}`);
    }

    logStep("Payment created", { 
      id: mpData.id,
      status: mpData.status,
      statusDetail: mpData.status_detail,
    });

    // Build response based on payment method
    const response: Record<string, unknown> = {
      id: mpData.id,
      status: mpData.status,
      status_detail: mpData.status_detail,
      payment_method_id: mpData.payment_method_id,
    };

    // PIX: include QR code data
    if (mpData.point_of_interaction?.transaction_data) {
      const txData = mpData.point_of_interaction.transaction_data;
      response.pix_qr_code = txData.qr_code;
      response.pix_qr_code_base64 = txData.qr_code_base64;
      response.pix_copy_paste = txData.qr_code;
      response.ticket_url = txData.ticket_url;
    }

    return new Response(JSON.stringify(response), {
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
