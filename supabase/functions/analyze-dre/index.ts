import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is admin or contador
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: roles } = await serviceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const hasAccess = roles?.some(r => ["admin", "contador", "equipe_guilherme", "equipe_cesar"].includes(r.role));
    if (!hasAccess) {
      return new Response(JSON.stringify({ error: "Acesso negado. Apenas admin/contador." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { analysisId, documentText, clientName, periodLabel } = await req.json();

    if (!analysisId || !documentText) {
      return new Response(JSON.stringify({ error: "analysisId e documentText são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Você é César, especialista sênior em BI e Contabilidade da AtentAI. Analise o DRE (Demonstração do Resultado do Exercício) fornecido e retorne uma análise completa.

IMPORTANTE: Responda usando as ferramentas fornecidas para estruturar sua resposta.

Contexto da Reforma Tributária 2026:
- IBS: 17,7% (substituindo ICMS + ISS)
- CBS: 8,8% (substituindo PIS + COFINS)
- Considere o impacto dessas mudanças nas margens e recomendações.

${clientName ? `Cliente: ${clientName}` : ''}
${periodLabel ? `Período: ${periodLabel}` : ''}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analise este DRE:\n\n${documentText}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "dre_analysis",
              description: "Retorna análise estruturada do DRE com resumo executivo, KPIs e recomendações.",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "Resumo executivo da análise do DRE em 3-5 parágrafos, incluindo destaques positivos e pontos de atenção."
                  },
                  kpis: {
                    type: "object",
                    description: "KPIs financeiros extraídos do DRE",
                    properties: {
                      receita_bruta_cents: { type: "number", description: "Receita bruta em centavos" },
                      receita_liquida_cents: { type: "number", description: "Receita líquida em centavos" },
                      custo_mercadorias_cents: { type: "number", description: "CMV/CPV em centavos" },
                      lucro_bruto_cents: { type: "number", description: "Lucro bruto em centavos" },
                      despesas_operacionais_cents: { type: "number", description: "Despesas operacionais em centavos" },
                      lucro_operacional_cents: { type: "number", description: "Lucro operacional / EBIT em centavos" },
                      lucro_liquido_cents: { type: "number", description: "Lucro líquido em centavos" },
                      margem_bruta_percent: { type: "number", description: "Margem bruta %" },
                      margem_liquida_percent: { type: "number", description: "Margem líquida %" },
                      margem_ebitda_percent: { type: "number", description: "Margem EBITDA %" },
                      ebitda_cents: { type: "number", description: "EBITDA em centavos" }
                    }
                  },
                  recommendations: {
                    type: "string",
                    description: "Recomendações estratégicas detalhadas (5-8 pontos) considerando o impacto da Reforma Tributária 2026."
                  },
                  risk_alerts: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de alertas de risco identificados no DRE"
                  }
                },
                required: ["summary", "kpis", "recommendations"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "dre_analysis" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Erro ao processar análise com IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];

    let analysis;
    if (toolCall?.function?.arguments) {
      analysis = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: use content directly
      const content = aiResult.choices?.[0]?.message?.content || "Análise não disponível";
      analysis = {
        summary: content,
        kpis: {},
        recommendations: "Não foi possível extrair recomendações estruturadas.",
      };
    }

    // Update the dre_analyses record
    const { error: updateError } = await serviceClient
      .from("dre_analyses")
      .update({
        ai_summary: analysis.summary,
        ai_kpis: analysis.kpis,
        ai_recommendations: analysis.recommendations,
        ai_full_analysis: JSON.stringify(analysis),
        status: "analyzed",
        analyzed_at: new Date().toISOString(),
        raw_text: documentText.substring(0, 50000), // limit stored text
      })
      .eq("id", analysisId);

    if (updateError) {
      console.error("Error updating analysis:", updateError);
      return new Response(JSON.stringify({ error: "Erro ao salvar análise" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-dre error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
