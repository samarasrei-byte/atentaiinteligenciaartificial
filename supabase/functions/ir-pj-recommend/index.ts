import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Limites legais 2024/2025
const MEI_LIMIT_CENTS = 8_100_000; // R$ 81.000
const SIMPLES_LIMIT_CENTS = 480_000_000; // R$ 4.800.000
const PRESUMIDO_LIMIT_CENTS = 7_800_000_000; // R$ 78.000.000

type Regime = "mei" | "simples_nacional" | "lucro_presumido" | "lucro_real";
type Risk = "baixo" | "medio" | "alto";

interface Input {
  current_company_type: Regime;
  base_year: number;
  annual_revenue_cents: number;
  cnae_code?: string;
  cnae_description?: string;
  has_payroll: boolean;
  payroll_monthly_cents?: number;
  estimated_bank_movement_cents?: number;
}

function ruleBasedEngine(input: Input) {
  const {
    annual_revenue_cents: rev,
    has_payroll,
    payroll_monthly_cents = 0,
    estimated_bank_movement_cents = 0,
    current_company_type,
  } = input;

  const risks: string[] = [];
  const alternatives: { regime: Regime; reason: string }[] = [];
  let recommended: Regime = "simples_nacional";
  let reason = "";
  let risk: Risk = "baixo";

  // Cruzamento extrato vs faturamento
  if (estimated_bank_movement_cents > rev * 1.3 && rev > 0) {
    risks.push(
      "Movimentação bancária estimada é mais de 30% superior ao faturamento declarado — risco alto de malha fina por omissão de receita."
    );
    risk = "alto";
  }

  // Lógica principal
  if (rev <= MEI_LIMIT_CENTS && !has_payroll) {
    recommended = "mei";
    reason =
      "Faturamento dentro do limite MEI (R$ 81.000/ano) e sem folha de pagamento. DASN-SIMEI é a opção mais simples e econômica.";
    alternatives.push({
      regime: "simples_nacional",
      reason: "Caso planeje contratar funcionários ou ultrapassar o limite, migre para Simples Nacional.",
    });
  } else if (rev <= MEI_LIMIT_CENTS && has_payroll && payroll_monthly_cents > 0) {
    recommended = "simples_nacional";
    reason =
      "Embora o faturamento esteja dentro do limite MEI, a presença de folha de pagamento (acima de 1 funcionário com salário regular) requer enquadramento no Simples Nacional.";
    risks.push("MEI permite apenas 1 funcionário com salário mínimo ou piso da categoria.");
  } else if (rev <= SIMPLES_LIMIT_CENTS) {
    // Cálculo do Fator R (Folha / Faturamento >= 28%)
    const annual_payroll = (payroll_monthly_cents * 12);
    const fatorR = rev > 0 ? annual_payroll / rev : 0;
    
    recommended = "simples_nacional";
    reason = `Faturamento de R$ ${(rev / 100).toLocaleString("pt-BR")} dentro do teto do Simples Nacional (R$ 4,8M).`;

    if (fatorR >= 0.28) {
      reason += " Beneficiado pelo Fator R (>= 28%): sua empresa pode tributar pelo Anexo III (alíquota menor) em vez do Anexo V.";
    } else if (has_payroll) {
      risks.push(`Fator R atual é de ${(fatorR * 100).toFixed(1)}%. Se atingir 28%, sua tributação no Simples Nacional pode cair drasticamente (Anexo V -> Anexo III).`);
    }

    // Análise margem para sugerir Presumido em serviços
    const margem_estimada = rev > 0 ? 1 - (estimated_bank_movement_cents / rev) : 0;
    if (margem_estimada > 0.6 && rev > 2_000_000_00) { // Sugerir acima de 2M faturamento
      alternatives.push({
        regime: "lucro_presumido",
        reason: "Sua margem operacional é alta. No Lucro Presumido, o imposto incide sobre uma margem fixa (ex: 32% para serviços), o que pode ser mais barato que as faixas superiores do Simples.",
      });
    }
  } else if (rev <= PRESUMIDO_LIMIT_CENTS) {
    recommended = "lucro_presumido";
    reason = "Faturamento ultrapassou o limite do Simples Nacional (R$ 4,8M). Lucro Presumido é o caminho para empresas com faturamento até R$ 78M que não possuem custos operacionais altíssimos.";
    risks.push("Atenção: No Lucro Presumido, PIS/COFINS são cumulativos (3,65% sem créditos).");
  } else {
    recommended = "lucro_real";
    reason = "Faturamento acima de R$ 78M anuais ou atividade financeira — enquadramento no Lucro Real é obrigatório.";
    risk = "alto";
  }

  // Detecção de migração necessária
  if (current_company_type === "mei" && rev > MEI_LIMIT_CENTS) {
    risks.push(
      `Você está enquadrado como MEI mas faturou R$ ${(rev / 100).toLocaleString("pt-BR")} — acima do limite de R$ 81.000. Desenquadramento obrigatório.`
    );
    risk = "alto";
  }

  if (current_company_type === "simples_nacional" && rev > SIMPLES_LIMIT_CENTS) {
    risks.push("Faturamento ultrapassou o teto do Simples Nacional. Migração obrigatória.");
    risk = "alto";
  }

  // Score final
  if (risks.length === 0) risk = "baixo";
  else if (risks.length === 1 && risk !== "alto") risk = "medio";

  return { recommended, reason, alternatives, risks, risk };
}

async function aiQualitativeAnalysis(input: Input, ruleResult: ReturnType<typeof ruleBasedEngine>) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return null;

  try {
    const prompt = `Você é um Cientista de Dados e Contador Sênior nível World-Class especialista em malha fina da Receita Federal do Brasil.
Analise os dados desta empresa com rigor técnico e gere um parecer de auditoria.

DADOS DA EMPRESA:
- Regime Atual: ${input.current_company_type}
- Ano-base: ${input.base_year}
- Faturamento Bruto: R$ ${(input.annual_revenue_cents / 100).toLocaleString("pt-BR")}
- CNAE: ${input.cnae_code || "N/A"} - ${input.cnae_description || ""}
- Folha Salarial Anual: R$ ${(((input.payroll_monthly_cents || 0) * 12) / 100).toLocaleString("pt-BR")}
- Movimentação Bancária: R$ ${((input.estimated_bank_movement_cents || 0) / 100).toLocaleString("pt-BR")}

RESULTADO DO MOTOR DE REGRAS:
- Sugestão: ${ruleResult.recommended}
- Risco Detectado: ${ruleResult.risk}
- Alertas: ${ruleResult.risks.join("; ") || "Nenhum alerta crítico imediato"}

TASK:
1. Valide se a sugestão do motor está correta sob a ótica de elisão fiscal (pagar menos imposto legalmente).
2. Identifique inconsistências de "Data Science": a movimentação bancária condiz com o faturamento? Há risco de cruzamento de dados via DIMOF/e-Financeira?
3. Explique o "Fator R" se for Simples Nacional.
4. Dê o veredito final: "Seguro para prosseguir" ou "Requer revisão humana urgente".

Responda em tom profissional, direto e autoritário. Divida em: [ANÁLISE DE RISCO], [OTIMIZAÇÃO TRIBUTÁRIA] e [PRÓXIMOS PASSOS].`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é um contador especialista brasileiro. Seja claro e objetivo." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!resp.ok) return null;
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (e) {
    console.error("AI analysis failed:", e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const input: Input = await req.json();

    // Validações básicas
    if (!input.current_company_type || !input.base_year || input.annual_revenue_cents == null) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios faltando" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ruleResult = ruleBasedEngine(input);
    const aiText = await aiQualitativeAnalysis(input, ruleResult);

    const result = {
      recommended_regime: ruleResult.recommended,
      recommendation_reason: ruleResult.reason,
      alternatives: ruleResult.alternatives,
      risks: ruleResult.risks,
      malha_fina_score: ruleResult.risk,
      ai_analysis: { qualitative: aiText, generated_at: new Date().toISOString() },
    };

    // Persistir
    const { data: saved, error: saveErr } = await supabase
      .from("ir_pj_simulations")
      .insert({
        user_id: user.id,
        ...input,
        ...result,
        status: "completed",
      })
      .select()
      .single();

    if (saveErr) {
      console.error("Save error:", saveErr);
      return new Response(JSON.stringify({ error: "Erro ao salvar simulação", details: saveErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, simulation: saved }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Unexpected error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
