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

    // Validate token format
    if (!accessToken.startsWith("APP_USR-") && !accessToken.startsWith("TEST-")) {
      logStep("WARNING: Token format unexpected", { length: accessToken.length, prefix: accessToken.substring(0, 10) + "..." });
      throw new Error("Token do Mercado Pago com formato inválido. Configure um token válido (APP_USR-... ou TEST-...).");
    }

    logStep("Access token valid", { length: accessToken.length, format: accessToken.startsWith("APP_USR-") ? "production" : "test" });

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

    const transactionAmount = Number((amount / 100).toFixed(2));

    // Build payment body for Mercado Pago
    const paymentBody: Record<string, unknown> = {
      transaction_amount: transactionAmount,
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
      transaction_amount: transactionAmount,
      method: paymentMethodId,
      serviceType,
      email: userEmail,
    });

    const mpResponse = await fetch(`${MP_API}/v1/payments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(paymentBody),
    });

    // Defensive: check content-type before parsing
    const contentType = mpResponse.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const textResponse = await mpResponse.text();
      logStep("MP returned non-JSON", { status: mpResponse.status, body: textResponse.substring(0, 500) });
      throw new Error(`Mercado Pago retornou resposta inválida (status ${mpResponse.status}). Tente novamente.`);
    }

    let mpData: any;
    try {
      mpData = await mpResponse.json();
    } catch (parseError) {
      logStep("Failed to parse MP response as JSON", { error: String(parseError) });
      throw new Error("Resposta do Mercado Pago não pôde ser processada. Tente novamente.");
    }

    if (!mpResponse.ok) {
      logStep("MP API Error", { status: mpResponse.status, error: JSON.stringify(mpData) });
      
      // Extract detailed error message
      const errorMessage = mpData.message 
        || mpData.error 
        || (mpData.cause && Array.isArray(mpData.cause) && mpData.cause[0]?.description)
        || `Erro no Mercado Pago (${mpResponse.status})`;
      
      throw new Error(errorMessage);
    }

    logStep("Payment created successfully", { 
      id: mpData.id,
      status: mpData.status,
      statusDetail: mpData.status_detail,
      paymentMethodId: mpData.payment_method_id,
      hasPointOfInteraction: !!mpData.point_of_interaction,
    });

    // Build response based on payment method
    const response: Record<string, unknown> = {
      id: mpData.id,
      status: mpData.status,
      status_detail: mpData.status_detail,
      payment_method_id: mpData.payment_method_id,
    };

    // PIX: include QR code data - check multiple possible field locations
    if (mpData.point_of_interaction?.transaction_data) {
      const txData = mpData.point_of_interaction.transaction_data;
      response.pix_qr_code = txData.qr_code;
      response.pix_qr_code_base64 = txData.qr_code_base64;
      response.pix_copy_paste = txData.qr_code;
      response.ticket_url = txData.ticket_url;
      
      logStep("PIX data extracted", {
        hasQrCode: !!txData.qr_code,
        hasQrCodeBase64: !!txData.qr_code_base64,
        hasTicketUrl: !!txData.ticket_url,
      });
    } else {
      logStep("No point_of_interaction in response", {
        keys: Object.keys(mpData),
      });
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
