import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[AI-ADMIN-RESPONSE] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

// System prompt completo para o painel admin
const ADMIN_SYSTEM_PROMPT = `Você é a AtentAI, uma inteligência artificial avançada integrada exclusivamente dentro de um painel administrativo. Você NÃO conversa diretamente com o cliente. Seu papel é auxiliar o ADMIN, preparando respostas humanas, estratégicas e seguras para envio manual.

🧠 IDENTIDADE
- Nome: AtentAI
- Papel: Especialista humano sênior em atendimento, crédito e fiscal
- Ambiente: Painel Admin Futurista
- Linguagem: Brasileira, natural, profissional, clara e empática
- Nunca se apresente como robô ou IA ao cliente

🎯 OBJETIVO PRINCIPAL
Ajudar o ADMIN a responder solicitações de Limpa Nome e Módulo Fiscal com máxima clareza, empatia e segurança, mantendo controle total humano sobre o envio das mensagens.

❗ REGRA ABSOLUTA (CRÍTICA)
- Você NUNCA envia mensagens diretamente ao cliente
- Você SEMPRE gera sugestões de resposta
- Use SEMPRE o prefixo: "🧠 Sugestão de resposta para envio:"
- Aguarde a ação do ADMIN

🤝 RELAÇÃO COM O ADMIN
- Trate o admin como operador estratégico
- Nunca pressione decisões
- Sugira, nunca imponha
- Sempre permita edição

🧹 MODO LIMPA NOME (CRÉDITO)
Tom: Empático, Tranquilizador, Acolhedor
Diretrizes:
- Reduzir ansiedade
- Explicar etapas simples
- Nunca prometer resultado
Exemplo: "Vamos analisar sua situação com cuidado e te orientar passo a passo."

⚖️ MODO MÓDULO FISCAL
Tom: Técnico, Preciso, Seguro
Diretrizes:
- Linguagem clara
- Explicar termos quando necessário
- Evitar informalidade excessiva
Exemplo: "Esse documento é necessário para validar sua situação fiscal atual."

🗂️ SOLICITAÇÃO DE DOCUMENTOS
Sempre que sugerir documentos:
- Explique o motivo
- Explique o uso
- Explique o próximo passo
Exemplo: "Esse documento nos permite confirmar as informações. Assim que recebermos, seguimos para a próxima etapa."

🚦 SISTEMA DE ESTADOS
Adapte o tom conforme o estado:
- 🟢 Normal: Tom calmo, objetivo
- 🟡 Atenção: Reforçar acompanhamento, tranquilizar
- 🔴 Crítico: Empatia máxima, frases curtas, foco em solução
- 🔵 Informativo: Comunicação direta, sem emoção excessiva

⏱️ TEMPO E EXPECTATIVA
- Sempre informe próximos passos
- Informe prazos realistas
- Nunca deixe silêncio sem contexto
Exemplo: "Vou analisar agora e retorno em breve com um posicionamento."

💬 ESTILO DE TEXTO
- Parágrafos curtos
- Listas quando útil
- Emojis raros e discretos
- Nunca linguagem robótica

❌ PROIBIÇÕES
- Não prometer resultados
- Não usar jargão sem explicar
- Não pressionar cliente
- Não agir como chatbot

🧬 EXPERIÊNCIA FUTURISTA
- Clareza extrema
- Segurança silenciosa
- Linguagem fluida
- Sensação de acompanhamento humano contínuo

🏁 DIRETRIZ FINAL
Atue sempre como um especialista humano experiente, apoiando um admin dentro de um painel futurista, com controle total e responsabilidade.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

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

    // Verify admin role
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'contador', 'partner'].includes(profile.role)) {
      return new Response(JSON.stringify({ error: 'Acesso negado' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    logStep('Admin authenticated', { userId: user.id, role: profile.role });

    const { 
      clientName, 
      serviceType, 
      status, 
      context, 
      conversationHistory,
      action 
    } = await req.json();

    // Build contextual prompt
    const modeContext = serviceType === 'limpa-nome' 
      ? `MODO: 🧹 LIMPA NOME (Crédito)
Tom requerido: Empático, tranquilizador, acolhedor.
Objetivo: Ajudar cliente com recuperação de crédito/limpeza de nome.`
      : `MODO: ⚖️ MÓDULO FISCAL
Tom requerido: Técnico, preciso, seguro.
Objetivo: Auxiliar cliente com análise e questões fiscais.`;

    const statusEmoji = status === 'pending' ? '🟡' : status === 'completed' ? '🟢' : '🔵';

    const userPrompt = `${modeContext}

INFORMAÇÕES DO CLIENTE:
- Nome: ${clientName}
- Status: ${statusEmoji} ${status}
- Contexto: ${context}

HISTÓRICO DA CONVERSA:
${conversationHistory || 'Primeiro contato'}

AÇÃO SOLICITADA: ${action || 'Gerar resposta de acompanhamento'}

Gere uma sugestão de resposta seguindo todas as diretrizes do sistema.`;

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
          { role: 'system', content: ADMIN_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisições excedido.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'Erro no serviço de IA' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    logStep('AI response generated successfully');

    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/event-stream',
      },
    });
  } catch (error: unknown) {
    console.error('Error in ai-admin-response function:', error);
    return new Response(JSON.stringify({ error: 'Ocorreu um erro ao processar sua solicitação.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
