import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-MANUAL-PAYMENT-LINK] ${step}${detailsStr}`);
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

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Verify user is admin
    const { data: userRoles } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdmin = userRoles?.some(r => r.role === 'admin' || r.role === 'contador');
    if (!isAdmin) {
      throw new Error("Unauthorized: Only admins can create payment links");
    }
    logStep("Admin verified");

    const body = await req.json();
    const { 
      clientEmail, 
      clientName, 
      clientUserId,
      amountCents, 
      serviceName, 
      serviceType,
      requestId
    } = body;

    if (!clientEmail || !amountCents || !serviceName) {
      throw new Error("Missing required fields: clientEmail, amountCents, serviceName");
    }

    logStep("Creating MP payment preference", { clientEmail, amountCents, serviceName });

    // Create Mercado Pago payment preference (generates a checkout link)
    const preferenceBody = {
      items: [
        {
          title: serviceName,
          description: `Serviço ${serviceType || 'AtentAI'}`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: amountCents / 100, // MP uses reais
        },
      ],
      payer: {
        email: clientEmail,
        name: clientName || '',
      },
      metadata: {
        service_type: serviceType || 'manual',
        request_id: requestId || '',
        client_user_id: clientUserId || '',
        created_by: user.id,
      },
      back_urls: {
        success: `${req.headers.get("origin") || "https://atentaiinteligenciaartificial.lovable.app"}/dashboard?payment=success`,
        failure: `${req.headers.get("origin") || "https://atentaiinteligenciaartificial.lovable.app"}/dashboard?payment=failed`,
        pending: `${req.headers.get("origin") || "https://atentaiinteligenciaartificial.lovable.app"}/dashboard?payment=pending`,
      },
      auto_return: "approved",
    };

    const mpResponse = await fetch(`${MP_API}/checkout/preferences`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferenceBody),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      logStep("MP API Error", { status: mpResponse.status, error: mpData });
      throw new Error(mpData.message || `Mercado Pago error: ${mpResponse.status}`);
    }

    logStep("MP preference created", { id: mpData.id, url: mpData.init_point });

    return new Response(JSON.stringify({ 
      url: mpData.init_point,
      preferenceId: mpData.id,
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
