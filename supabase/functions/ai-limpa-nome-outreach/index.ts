import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  try {
    const { requestId, action } = await req.json();

    if (!requestId) {
      throw new Error('requestId is required');
    }

    // 1. Fetch Request Details
    const { data: request, error: fetchError } = await supabaseClient
      .from('credit_repair_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      throw new Error('Request not found');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    // 2. AI Logic: Draft outreach message
    const systemPrompt = `Você é um Agente de IA Jurídico especializado em regularização de crédito e limpeza de nome.
Sua missão é atuar como mediador entre o usuário (${request.full_name}) e os credores ou órgãos de proteção ao crédito (Serasa, SPC, etc).

Regras:
1. Use uma linguagem extremamente formal e profissional (Juridiquês adequado, mas claro).
2. Baseie sua abordagem na Lei Geral de Proteção de Dados (LGPD) e no Código de Defesa do Consumidor (CDC).
3. O objetivo é solicitar a baixa imediata de apontamentos prescritos ou indevidos.
4. Você deve gerar o conteúdo da mensagem que será enviada via E-mail ou WhatsApp.`;

    const userPrompt = `Gere uma mensagem de contato para o credor: ${request.creditors?.[0] || 'Credor desconhecido'}.
O usuário ${request.full_name} (CPF: ${request.cpf}) solicita a revisão dos apontamentos.
Dívida descrita: ${request.debt_description || 'Não especificada'}.
Ação atual: ${action || 'Primeiro contato para conciliação'}.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    const aiData = await aiResponse.json();
    const messageContent = aiData.choices[0].message.content;

    // 3. Log Activity
    const { error: logError } = await supabaseClient
      .from('credit_repair_ai_logs')
      .insert({
        request_id: requestId,
        channel: 'internal',
        direction: 'outbound',
        message: `Agente IA iniciou contato para ${request.creditors?.[0] || 'Bureau'}. Mensagem gerada:\n\n${messageContent}`,
        metadata: {
          action: 'outreach_started',
          ai_model: 'gemini-2.0-flash-exp'
        }
      });

    // 4. Update Status
    await supabaseClient
      .from('credit_repair_requests')
      .update({ 
        ai_agent_status: 'contacting',
        ai_agent_enabled: true
      })
      .eq('id', requestId);

    return new Response(JSON.stringify({ 
      success: true, 
      message: messageContent 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in ai-limpa-nome-outreach:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});