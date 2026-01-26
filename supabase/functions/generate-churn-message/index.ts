import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[CHURN-MESSAGE] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Request started');

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

    logStep('User authenticated', { userId: user.id });

    // Check if user is admin
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { data: isAdmin } = await serviceClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Acesso negado' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { userName, userEmail, daysInactive, riskLevel, messageType } = await req.json();

    logStep('Generating message', { userName, daysInactive, riskLevel, messageType });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const prompts: Record<string, string> = {
      retention: `Crie uma mensagem de retenção personalizada para um usuário que não acessa a plataforma AtentAI há ${daysInactive} dias.
Nome do usuário: ${userName || 'Cliente'}
Nível de risco: ${riskLevel}

A mensagem deve:
- Ser empática e acolhedora
- Destacar os benefícios da plataforma (simulador tributário, IA especializada, contadores parceiros)
- Mencionar a Reforma Tributária 2026 como oportunidade
- Ter no máximo 150 palavras
- NÃO usar formatação markdown
- Ser em português brasileiro

Responda APENAS com a mensagem, sem explicações adicionais.`,

      offer: `Crie uma mensagem com oferta especial para reconquistar um usuário que cancelou ou está inativo há ${daysInactive} dias na plataforma AtentAI.
Nome do usuário: ${userName || 'Cliente'}
Nível de risco: ${riskLevel}

A mensagem deve:
- Oferecer um desconto exclusivo (20% ou 30% dependendo do risco)
- Criar urgência (oferta por tempo limitado)
- Destacar o valor da plataforma
- Ter no máximo 120 palavras
- NÃO usar formatação markdown
- Ser em português brasileiro

Responda APENAS com a mensagem, sem explicações adicionais.`,

      feedback: `Crie uma mensagem solicitando feedback de um usuário que cancelou ou está inativo há ${daysInactive} dias na plataforma AtentAI.
Nome do usuário: ${userName || 'Cliente'}

A mensagem deve:
- Perguntar genuinamente o motivo do afastamento
- Mostrar que a opinião é valiosa
- Oferecer suporte se houver problemas
- Ser breve e respeitosa (máximo 100 palavras)
- NÃO usar formatação markdown
- Ser em português brasileiro

Responda APENAS com a mensagem, sem explicações adicionais.`,

      lastChance: `Crie uma mensagem de "última chance" para um usuário em risco crítico de churn (${daysInactive} dias inativo) na plataforma AtentAI.
Nome do usuário: ${userName || 'Cliente'}

A mensagem deve:
- Ser urgente mas respeitosa
- Mencionar que a conta precisa de atenção
- Oferecer ajuda direta (consultoria gratuita, suporte prioritário)
- Ter no máximo 100 palavras
- NÃO usar formatação markdown
- Ser em português brasileiro

Responda APENAS com a mensagem, sem explicações adicionais.`
    };

    const selectedPrompt = prompts[messageType] || prompts.retention;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um especialista em retenção de clientes e copywriting para SaaS. Crie mensagens persuasivas e empáticas.' 
          },
          { role: 'user', content: selectedPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'Erro ao gerar mensagem' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const generatedMessage = data.choices?.[0]?.message?.content || '';

    logStep('Message generated', { length: generatedMessage.length });

    // Generate subject line
    const subjectResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { 
            role: 'user', 
            content: `Crie um assunto de email curto (máximo 50 caracteres) para esta mensagem de retenção. Seja direto e atrativo. NÃO use emojis excessivos. Tipo: ${messageType}. Responda APENAS com o assunto.` 
          },
        ],
        temperature: 0.7,
        max_tokens: 60,
      }),
    });

    let subject = 'Sentimos sua falta no AtentAI';
    if (subjectResponse.ok) {
      const subjectData = await subjectResponse.json();
      subject = subjectData.choices?.[0]?.message?.content?.trim() || subject;
    }

    return new Response(JSON.stringify({ 
      message: generatedMessage.trim(),
      subject: subject,
      messageType,
      generatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in generate-churn-message:', error);
    return new Response(JSON.stringify({ error: 'Erro ao processar solicitação' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
