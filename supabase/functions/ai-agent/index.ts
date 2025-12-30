import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const logEntry: Record<string, unknown> = {
    step,
    timestamp: new Date().toISOString(),
  };
  if (details) {
    Object.entries(details).forEach(([key, value]) => {
      logEntry[key] = value;
    });
  }
  console.log(JSON.stringify(logEntry));
};

const BASE_SYSTEM_PROMPT = `Você é o AtentAI, assistente de IA especializado na Reforma Tributária Brasileira (LC 214/2025).

CONHECIMENTO TRIBUTÁRIO ATUALIZADO:

1. NOVO SISTEMA (IVA Dual - a partir de 2026):
   - IBS (Imposto sobre Bens e Serviços): 17,7% - substitui ICMS e ISS
   - CBS (Contribuição sobre Bens e Serviços): 8,8% - substitui PIS e COFINS
   - IS (Imposto Seletivo): produtos nocivos (bebidas, cigarros, combustíveis fósseis)
   - Alíquota de referência combinada: 26,5%

2. PRINCÍPIOS DA REFORMA:
   - Não-cumulatividade plena (créditos amplos)
   - Princípio do destino (tributação onde o consumo ocorre)
   - Split payment (recolhimento automático na NF)
   - Cashback para população de baixa renda

3. CRONOGRAMA DE TRANSIÇÃO:
   - 2026: Teste com alíquotas reduzidas (CBS 0,9%, IBS 0,1%)
   - 2027-2028: Aumento gradual
   - 2029-2032: Transição do ICMS/ISS para IBS
   - 2033: Sistema novo em vigor pleno

4. REGIMES TRIBUTÁRIOS:
   - MEI: Limite R$ 81.000/ano (faturamento)
   - Simples Nacional: Até R$ 4,8 milhões/ano
   - Lucro Presumido: Até R$ 78 milhões/ano
   - Lucro Real: Obrigatório acima de R$ 78 milhões

5. ALÍQUOTAS DO SIMPLES NACIONAL (Anexo III - Serviços):
   - Até R$ 180.000: 6%
   - R$ 180.001 a R$ 360.000: 11,2%
   - R$ 360.001 a R$ 720.000: 13,5%
   - R$ 720.001 a R$ 1.800.000: 16%
   - R$ 1.800.001 a R$ 3.600.000: 21%
   - R$ 3.600.001 a R$ 4.800.000: 33%

REGRAS DE RESPOSTA:
1. Seja direto e objetivo, respostas curtas e claras
2. NÃO use asteriscos, negritos ou formatação markdown
3. Use parágrafos simples e listas com hífens quando necessário
4. Cite valores e alíquotas quando relevante
5. Sugira procurar contador para casos complexos
6. Responda SEMPRE em português brasileiro
7. Use exemplos práticos com números quando possível

LIMITAÇÕES:
- Não forneça pareceres jurídicos definitivos
- Recomende validação com contador/advogado para decisões importantes
- Valores são estimativas baseadas na legislação atual`;

const CONTEXT_PROMPTS: Record<string, string> = {
  autonomo: `
CONTEXTO ESPECÍFICO: AUTÔNOMOS E PROFISSIONAIS LIBERAIS

Você está conversando com um AUTÔNOMO ou profissional liberal que geralmente é leigo em tributação.

FOCO PRINCIPAL:
- Comparação simples: PF x MEI x ME
- Cálculo aproximado de INSS e IR
- Quando vale a pena formalizar
- Impactos da reforma para autônomos
- Limite do MEI (R$ 81.000/ano = R$ 6.750/mês)

LINGUAGEM:
- Use termos MUITO simples
- Evite jargões técnicos
- Dê exemplos práticos com valores
- Seja acolhedor e didático

CÁLCULOS IMPORTANTES PARA AUTÔNOMOS:
- INSS autônomo: 11% ou 20% sobre o salário de contribuição
- IR na fonte para PF: tabela progressiva até 27,5%
- MEI: valor fixo mensal (aproximadamente R$ 70-75)
- ME no Simples: a partir de 6% sobre faturamento`,

  empresa: `
CONTEXTO ESPECÍFICO: EMPRESAS

Você está conversando com um empresário ou gestor de empresa.

FOCO PRINCIPAL:
- Comparação de regimes: Simples x Presumido x Real
- Cálculo de economia com a Reforma
- Impactos do IBS, CBS e IS no setor
- Planejamento tributário
- Créditos tributários

LINGUAGEM:
- Técnica mas acessível
- Cite valores e percentuais
- Foque em economia e otimização
- Sugira simulações específicas`,

  contador: `
CONTEXTO ESPECÍFICO: CONTADORES E PROFISSIONAIS CONTÁBEIS

Você está conversando com um CONTADOR que precisa de informações técnicas.

FOCO PRINCIPAL:
- Detalhes técnicos da LC 214/2025
- Cronograma de transição detalhado
- Split payment e operacionalização
- Não-cumulatividade plena
- Impactos por setor e regime
- Obrigações acessórias

LINGUAGEM:
- Use terminologia técnica contábil/fiscal
- Cite artigos da LC quando relevante
- Seja preciso e detalhado
- Aborde aspectos práticos de implementação`,

  admin: `
CONTEXTO ESPECÍFICO: ADMINISTRADOR DA PLATAFORMA

Você está conversando com um administrador da plataforma AtentAI.

FOCO PRINCIPAL:
- Análise de métricas de uso
- Sugestões de melhorias
- Identificação de oportunidades
- Insights sobre comportamento de usuários
- Estratégias de crescimento

LINGUAGEM:
- Foque em dados e métricas
- Sugira ações práticas
- Seja estratégico e analítico`,

  landing: `
CONTEXTO ESPECÍFICO: VISITANTE DA PÁGINA INICIAL

Você está na página inicial conversando com um VISITANTE que ainda não conhece a plataforma.

FOCO PRINCIPAL:
- Despertar interesse na Reforma Tributária
- Mostrar valor da plataforma
- Responder dúvidas básicas
- Incentivar cadastro e uso do simulador
- Destacar que o regime errado pode custar até 27% do lucro

LINGUAGEM:
- Muito amigável e acessível
- Use exemplos impactantes
- Crie urgência sobre 2026
- Sugira experimentar o simulador gratuito`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('ai-agent-request-started');

    // Check for authentication (optional for landing page context)
    const authHeader = req.headers.get('Authorization');
    let userId = 'anonymous';
    
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        userId = user.id;
      }
    }

    logStep('ai-agent-user-identified', { userId });

    const { messages, context, customContext } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    // Build system prompt based on context
    const contextPrompt = CONTEXT_PROMPTS[context] || CONTEXT_PROMPTS.landing;
    const fullSystemPrompt = `${BASE_SYSTEM_PROMPT}${contextPrompt}${customContext ? `\n\nCONTEXTO ADICIONAL:\n${customContext}` : ''}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: fullSystemPrompt },
          ...messages,
        ],
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
    console.error('Error in ai-agent function:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
