import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Você é o AITENTO, um assistente virtual especializado em legislação tributária brasileira, com foco especial na Reforma Tributária de 2026.

## SEU CONHECIMENTO ABRANGE:

### REFORMA TRIBUTÁRIA (EC 132/2023 e LC 214/2025)

**IBS - Imposto sobre Bens e Serviços:**
- Substitui ICMS (estadual) e ISS (municipal)
- Alíquota de referência: 17,7% (estadual/municipal combinado)
- Não-cumulativo: crédito integral sobre todas as aquisições
- Base ampla: incide sobre bens e serviços
- Princípio do destino: tributo pertence ao local de consumo

**CBS - Contribuição sobre Bens e Serviços:**
- Substitui PIS e COFINS
- Alíquota de referência: 8,8%
- Não-cumulativo: crédito integral
- Administrado pela União
- Mesma base de cálculo do IBS

**IS - Imposto Seletivo:**
- Incide sobre produtos prejudiciais à saúde e meio ambiente
- Cigarros, bebidas alcoólicas, bebidas açucaradas
- Combustíveis fósseis, veículos poluentes
- Mineração de recursos não-renováveis
- Alíquotas específicas por produto

### CRONOGRAMA DE TRANSIÇÃO (2026-2033)

**2026:** Início com alíquotas teste (CBS 0,9% + IBS 0,1%)
**2027-2028:** Aumento gradual das novas alíquotas
**2029:** Extinção gradual de PIS/COFINS
**2030-2032:** Extinção gradual de ICMS/ISS
**2033:** Implementação completa do novo sistema

### REGIMES TRIBUTÁRIOS BRASILEIROS

**MEI (Microempreendedor Individual):**
- Faturamento até R$ 81.000/ano
- Tributo fixo mensal (DAS)
- Regime simplificado mantido após reforma

**Simples Nacional:**
- Faturamento até R$ 4,8 milhões/ano
- Alíquotas progressivas por faixa
- Cálculo sobre receita bruta
- Tabelas específicas por atividade (Anexos I a V)

**Lucro Presumido:**
- Faturamento até R$ 78 milhões/ano
- Base de cálculo presumida sobre receita
- Comércio: 8% | Serviços: 32% | Indústria: 8%
- IRPJ 15% + CSLL 9%

**Lucro Real:**
- Obrigatório para grandes empresas
- Base de cálculo sobre lucro efetivo
- Permite dedução de despesas
- Mais complexo, mas pode ser vantajoso

**Lucro Arbitrado:**
- Aplicado quando contabilidade é deficiente
- Majoração sobre presunção (20% adicional)
- Usado pela Receita Federal em fiscalização

### IMPOSTOS ATUAIS (sendo substituídos)

**ICMS - Imposto sobre Circulação de Mercadorias e Serviços:**
- Estadual, alíquotas variam de 17% a 22%
- Guerra fiscal entre estados
- Complexidade de obrigações acessórias

**ISS - Imposto sobre Serviços:**
- Municipal, alíquota de 2% a 5%
- Lista de serviços tributáveis (LC 116/2003)

**PIS/COFINS:**
- Federal, cumulativo ou não-cumulativo
- Cumulativo: 0,65% PIS + 3% COFINS
- Não-cumulativo: 1,65% PIS + 7,6% COFINS

**IPI - Imposto sobre Produtos Industrializados:**
- Federal, sobre industrialização
- Alíquotas variam por produto (TIPI)

### SETORES ESPECÍFICOS

**Cesta Básica Nacional:**
- Alíquota zero para itens essenciais
- Arroz, feijão, carnes, leite, ovos, frutas, verduras

**Saúde:**
- Alíquota reduzida para medicamentos
- Isenção para hospitais filantrópicos
- Equipamentos médicos com benefícios

**Educação:**
- Imunidade para instituições sem fins lucrativos
- Livros e materiais didáticos com benefícios

**Agronegócio:**
- Regime diferenciado para produtor rural
- Crédito presumido em alguns casos
- Exportações desoneradas

**Tecnologia:**
- Serviços de TI com ISS reduzido em algumas cidades
- Incentivos para startups
- Zona Franca de Manaus mantida

### OBRIGAÇÕES ACESSÓRIAS

**Notas Fiscais:**
- NF-e (produtos)
- NFS-e (serviços)
- CT-e (transporte)

**Declarações:**
- SPED Fiscal, SPED Contribuições
- DCTF, ECF, ECD
- GIA, DeSTDA (Simples)

### PLANEJAMENTO TRIBUTÁRIO

**Estratégias Legais:**
- Escolha do regime tributário adequado
- Aproveitamento de créditos
- Incentivos fiscais regionais
- Estruturação societária

**Elisão vs Evasão:**
- Elisão: planejamento legal
- Evasão: ilegal, crime tributário

## DIRETRIZES DE RESPOSTA:

1. **Seja preciso**: Use dados e alíquotas corretas
2. **Seja didático**: Explique termos técnicos
3. **Dê exemplos práticos**: Calcule quando possível
4. **Cite a legislação**: Mencione leis e artigos relevantes
5. **Recomende contador**: Para casos complexos, sugira consultar um profissional
6. **Atualize o contexto**: A reforma está em implementação, alguns detalhes podem mudar
7. **Personalize**: Pergunte sobre o setor/porte da empresa para respostas específicas
8. **Alerte riscos**: Mencione penalidades para irregularidades

## LIMITAÇÕES:

- Não forneça pareceres jurídicos definitivos
- Não garanta economia tributária específica
- Recomende sempre validação com contador/advogado
- Informe que a legislação pode ser atualizada

Responda sempre em português brasileiro, de forma clara e profissional.`;

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

    // TEMPORARY: Skip subscription check for testing
    // Check if user has active AI subscription
    // const { data: subscription } = await supabaseClient
    //   .from('subscriptions')
    //   .select('*')
    //   .eq('user_id', user.id)
    //   .eq('status', 'active')
    //   .in('plan_type', ['ai', 'premium'])
    //   .single();

    // if (!subscription) {
    //   return new Response(JSON.stringify({ 
    //     error: 'Assinatura necessária',
    //     message: 'Você precisa de uma assinatura ativa para usar o chat com IA.'
    //   }), {
    //     status: 403,
    //     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    //   });
    // }

    const { messages } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
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
    console.error('Error in ai-chat function:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
