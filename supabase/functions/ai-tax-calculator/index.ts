import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TAX_CALCULATOR_PROMPT = `Você é o AtentAI Tax Calculator, um sistema de IA especializado em cálculos tributários brasileiros com foco na Reforma Tributária 2026.

CAPACIDADES DE CÁLCULO:
1. Simular impostos atuais (PIS 1.65%, COFINS 7.6%, ICMS 7-25%, ISS 2-5%)
2. Simular impostos pós-reforma (IBS 17.7%, CBS 8.8%, IS variável)
3. Comparar regimes tributários (Simples, Lucro Presumido, Lucro Real)
4. Calcular impacto da reforma por setor
5. Estimar economia/aumento de carga tributária
6. Simular locação PF x PJ
7. Calcular Split Payment e cashback

ALÍQUOTAS E REGRAS (EC 132/2023):
- CBS (Federal): 8.8% sobre valor adicionado
- IBS (Estadual/Municipal): 17.7% sobre valor adicionado
- Alíquota cheia: 26.5% (referência, não cumulativa)
- Cesta Básica Nacional: Alíquota ZERO
- Medicamentos essenciais: Alíquota ZERO
- Educação: Redução de 60%
- Saúde: Redução de 60%
- Transporte público: Redução de 60%
- Agronegócio: Redução de 60%
- Imóveis novos: Redução de 40%
- Serviços: Alíquota cheia (maioria)
- Profissionais liberais (até 4.8M/ano): Redução de 30%

IMPOSTO SELETIVO (IS):
- Cigarros: 150-300% sobre preço
- Bebidas alcoólicas: 20-35%
- Bebidas açucaradas: 10-20%
- Veículos: 0-25% (por emissão)
- Combustíveis fósseis: Variável

CRONOGRAMA TRANSIÇÃO:
- 2026: CBS 0.9%, IBS 0.1% (teste)
- 2027: CBS 0.9%, IBS 0.1% (convive com atuais)
- 2028: CBS pleno, IBS 8%, PIS/COFINS zerados
- 2029-2032: Redução gradual ICMS/ISS
- 2033: Sistema novo pleno

SIMPLES NACIONAL NA REFORMA:
- Mantido com regras especiais
- Pode optar por regime regular (crédito pleno)
- Sublimite MEI: R$ 81.000/ano
- Limites ME/EPP mantidos

FORMATO DE RESPOSTA:
Quando solicitado um cálculo, responda SEMPRE neste formato JSON:
{
  "tipo_calculo": "string",
  "dados_entrada": {},
  "resultados": {
    "sistema_atual": {},
    "sistema_reforma": {},
    "diferenca": {},
    "economia_percentual": number
  },
  "analise": "string com análise detalhada",
  "recomendacoes": ["array de recomendações"],
  "observacoes_legais": "disclaimers importantes"
}

Para perguntas normais, responda em texto normal, objetivo e profissional.

REGRAS:
1. Sempre calcule com precisão baseado nos dados fornecidos
2. Mostre a metodologia de cálculo
3. Inclua disclaimers sobre estimativas
4. Recomende contador para decisões finais
5. Responda em português brasileiro`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Usuário não autenticado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { messages, calculation_type, data } = await req.json();

    // Build context-aware prompt based on calculation type
    let contextPrompt = '';
    if (calculation_type && data) {
      switch (calculation_type) {
        case 'full_simulation':
          contextPrompt = `
O usuário solicita uma SIMULAÇÃO COMPLETA com os seguintes dados:
- Faturamento Mensal: R$ ${data.revenue?.toLocaleString('pt-BR') || 'não informado'}
- Setor: ${data.sector || 'não informado'}
- Regime Atual: ${data.tax_regime || 'não informado'}
- Tipo Empresa: ${data.company_type || 'não informado'}
- Estado: ${data.state || 'não informado'}

CALCULE:
1. Impostos atuais detalhados (PIS, COFINS, ICMS/ISS)
2. Impostos pós-reforma (IBS, CBS)
3. Diferença absoluta e percentual
4. Impacto anual projetado
5. Recomendações estratégicas`;
          break;
          
        case 'regime_comparison':
          contextPrompt = `
Compare os TRÊS REGIMES TRIBUTÁRIOS para esta empresa:
- Faturamento Anual: R$ ${(data.revenue * 12)?.toLocaleString('pt-BR') || 'não informado'}
- Setor: ${data.sector || 'não informado'}
- Funcionários: ${data.employees || 'não informado'}
- Folha de Pagamento: R$ ${data.payroll?.toLocaleString('pt-BR') || 'não informado'}

CALCULE para cada regime (Simples Nacional, Lucro Presumido, Lucro Real):
1. Carga tributária total
2. Impostos individuais
3. Obrigações acessórias
4. Vantagens e desvantagens
5. Recomendação final`;
          break;
          
        case 'rental_simulation':
          contextPrompt = `
Simule a TRIBUTAÇÃO DE LOCAÇÃO DE IMÓVEIS:
- Valor do Aluguel: R$ ${data.rent?.toLocaleString('pt-BR') || 'não informado'}
- Tipo: ${data.rental_type || 'residencial'}
- Proprietário: ${data.owner_type || 'PF'}

CALCULE:
1. Tributação atual (IR PF ou regime PJ)
2. Tributação pós-reforma (IBS + CBS se aplicável)
3. Comparação PF x PJ
4. Sugestão de repasse ao inquilino
5. Melhor estratégia tributária`;
          break;
          
        case 'sector_impact':
          contextPrompt = `
Analise o IMPACTO SETORIAL da Reforma para:
- Setor: ${data.sector || 'não informado'}
- Porte: ${data.company_size || 'não informado'}
- Faturamento: R$ ${data.revenue?.toLocaleString('pt-BR') || 'não informado'}

ANALISE:
1. Alíquotas específicas do setor
2. Reduções aplicáveis
3. Impacto estimado (%)
4. Cronograma de transição para o setor
5. Estratégias de adaptação`;
          break;
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const fullMessages = [
      { role: 'system', content: TAX_CALCULATOR_PROMPT },
      ...(contextPrompt ? [{ role: 'user', content: contextPrompt }] : []),
      ...messages,
    ];

    console.log('AI Tax Calculator request:', { calculation_type, messagesCount: messages.length });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: fullMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos de IA esgotados.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'Erro no serviço de IA' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error: unknown) {
    console.error('Error in ai-tax-calculator function:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
