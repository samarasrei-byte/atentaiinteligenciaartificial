import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MP_API = "https://api.mercadopago.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");

    const { paymentId } = await req.json();
    if (!paymentId) throw new Error("paymentId is required");

    const mpResponse = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
      headers: { "Authorization": `Bearer ${accessToken}` },
    });

    if (!mpResponse.ok) {
      throw new Error(`MP API error: ${mpResponse.status}`);
    }

    const mpData = await mpResponse.json();

    return new Response(JSON.stringify({
      id: mpData.id,
      status: mpData.status,
      status_detail: mpData.status_detail,
      payment_method_id: mpData.payment_method_id,
      date_approved: mpData.date_approved,
      transaction_amount: mpData.transaction_amount,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
