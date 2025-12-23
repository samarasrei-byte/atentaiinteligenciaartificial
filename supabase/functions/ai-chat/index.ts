import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Você é o AtentAI, assistente de legislação tributária brasileira focado na Reforma Tributária 2026.

CONHECIMENTO PRINCIPAL:
- IBS (substitui ICMS/ISS): alíquota 17,7%, princípio do destino
- CBS (substitui PIS/COFINS): alíquota 8,8%
- IS (Imposto Seletivo): cigarros, bebidas, combustíveis fósseis
- Transição: 2026-2033 (gradual)
- Regimes: MEI, Simples Nacional, Lucro Presumido, Lucro Real

REGRAS DE RESPOSTA:
1. Seja direto e objetivo, respostas curtas
2. NÃO use asteriscos, negritos ou formatação markdown
3. Use parágrafos simples e listas com hífens quando necessário
4. Cite valores e alíquotas quando relevante
5. Sugira contador para casos complexos
6. Responda em português brasileiro

LIMITAÇÕES:
- Não forneça pareceres jurídicos definitivos
- Recomende validação com contador/advogado`;

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
