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
    const body = await req.json();
    
    // In a real scenario, we'd identify the requestId from metadata or the sender's info
    const { requestId, sender, message, channel } = body;

    if (!requestId) {
      throw new Error('requestId is required for processing callback');
    }

    // 1. Log the inbound message
    const { error: logError } = await supabaseClient
      .from('credit_repair_ai_logs')
      .insert({
        request_id: requestId,
        channel: channel || 'webhook',
        direction: 'inbound',
        message: `[RESPOSTA RECEBIDA via ${channel}] ${message}`,
        metadata: {
          raw_body: body,
          received_at: new Date().toISOString()
        }
      });

    // 2. Use AI to analyze the response
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    const analysisPrompt = `Você é um Analista Jurídico de IA. 
Analise a seguinte resposta de um credor: "${message}".
Classifique se:
1. O credor ACEITOU a retirada do apontamento.
2. O credor NEGOU.
3. O credor solicitou mais DOCUMENTOS.
4. O credor fez uma CONTRA-PROPOSTA.

Responda em JSON: { "classification": "accepted|denied|more_info|counter_offer", "summary": "...", "next_step_for_user": "..." }`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp',
        messages: [{ role: 'user', content: analysisPrompt }],
        response_format: { type: 'json_object' }
      }),
    });

    const aiData = await aiResponse.json();
    const result = JSON.parse(aiData.choices[0].message.content);

    // 3. Update Request Status based on AI analysis
    let newAiStatus = 'waiting_reply';
    if (result.classification === 'accepted') newAiStatus = 'negotiated';
    if (result.classification === 'more_info') newAiStatus = 'waiting_user_input';

    await supabaseClient
      .from('credit_repair_requests')
      .update({ ai_agent_status: newAiStatus })
      .eq('id', requestId);

    // 4. Log AI Analysis
    await supabaseClient
      .from('credit_repair_ai_logs')
      .insert({
        request_id: requestId,
        channel: 'system',
        direction: 'internal',
        message: `Análise da IA: ${result.summary}\nPróximo passo para o usuário: ${result.next_step_for_user}`,
        metadata: result
      });

    return new Response(JSON.stringify({ success: true, analysis: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in ai-limpa-nome-callback:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});