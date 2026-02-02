import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-FISCAL-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const { analysisId, identifiedValueCents, serviceFeePercent = 50 } = await req.json();
    
    if (!analysisId || !identifiedValueCents) {
      throw new Error("analysisId and identifiedValueCents are required");
    }
    logStep("Request body parsed", { analysisId, identifiedValueCents, serviceFeePercent });

    // Buscar a análise fiscal
    const { data: analysis, error: analysisError } = await supabaseClient
      .from("fiscal_analysis_requests")
      .select("*")
      .eq("id", analysisId)
      .single();

    if (analysisError || !analysis) {
      throw new Error(`Analysis not found: ${analysisError?.message}`);
    }
    logStep("Analysis found", { id: analysis.id, email: analysis.email });

    // Calcular taxa de serviço (50% do valor identificado)
    const serviceFeeValueCents = Math.round(identifiedValueCents * (serviceFeePercent / 100));
    logStep("Service fee calculated", { serviceFeeValueCents, identifiedValueCents, serviceFeePercent });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Verificar se cliente já existe no Stripe
    const customers = await stripe.customers.list({ email: analysis.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    // Criar sessão de checkout com PIX + Card
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : analysis.email,
      payment_method_types: ['card', 'pix'],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: "Análise Fiscal Avançada - Taxa de Êxito",
              description: `Taxa de ${serviceFeePercent}% sobre R$ ${(identifiedValueCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} identificados`,
              metadata: {
                analysis_id: analysisId,
                identified_value_cents: identifiedValueCents.toString(),
              },
            },
            unit_amount: serviceFeeValueCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/modulo-fiscal/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/modulo-fiscal?cancelled=true`,
      metadata: {
        analysis_id: analysisId,
        service_type: "fiscal_analysis",
        identified_value_cents: identifiedValueCents.toString(),
        service_fee_cents: serviceFeeValueCents.toString(),
      },
    });
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Atualizar análise com dados do Stripe
    const { error: updateError } = await supabaseClient
      .from("fiscal_analysis_requests")
      .update({
        identified_value_cents: identifiedValueCents,
        service_fee_cents: serviceFeeValueCents,
        stripe_session_id: session.id,
        payment_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", analysisId);

    if (updateError) {
      logStep("Warning: Failed to update analysis", { error: updateError.message });
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id,
      serviceFeeValueCents,
      identifiedValueCents,
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
