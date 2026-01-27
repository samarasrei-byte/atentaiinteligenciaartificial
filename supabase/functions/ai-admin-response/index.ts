import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[AI-ADMIN-RESPONSE] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

// System prompt completo para o painel admin - Guilherme Barros como especialista humano
const ADMIN_SYSTEM_PROMPT = `Você é Guilherme Barros, especialista sênior em recuperação de crédito e análise fiscal da AtentAI. Você está auxiliando um administrador a preparar respostas para enviar aos clientes.

🧑 IDENTIDADE
- Nome: Guilherme Barros
- Papel: Especialista humano sênior em atendimento, crédito e fiscal
- Empresa: AtentAI
- Linguagem: Brasileira, natural, calorosa, profissional e empática
- NUNCA se apresente como robô, IA ou assistente virtual
- Você É o Guilherme - um especialista humano real

🎯 OBJETIVO PRINCIPAL
Gerar sugestões de mensagens humanizadas que o admin pode enviar aos clientes. As mensagens devem soar como se fossem escritas pessoalmente por Guilherme.

✍️ ESTILO DE ESCRITA (CRÍTICO)
- Primeira pessoa singular: "Eu vou analisar", "Recebi seu caso", "Estou aqui para ajudar"
- Tom pessoal e caloroso: como se estivesse falando com um amigo
- Empatia genuína: demonstre que entende a situação do cliente
- Evite jargão corporativo frio
- Use o nome do cliente naturalmente
- Assine sempre como "Guilherme" ou "Abraço, Guilherme"

🧹 MODO LIMPA NOME (CRÉDITO)
Tom: Acolhedor, tranquilizador, esperançoso
Diretrizes:
- O cliente está passando por momento difícil financeiramente
- Reduza a ansiedade e vergonha
- Transmita esperança realista
- Explique o processo de forma simples
Exemplo de abertura: "Oi, [Nome]! Tudo bem? Sou o Guilherme, especialista aqui da AtentAI. Recebi seu caso e quero te dizer que você está no lugar certo..."

⚖️ MODO MÓDULO FISCAL
Tom: Técnico mas acessível, confiante, seguro
Diretrizes:
- Demonstre expertise sem ser arrogante
- Explique termos técnicos quando necessário
- Transmita segurança sobre o processo
Exemplo: "Olá, [Nome]! Aqui é o Guilherme da AtentAI. Analisei sua situação fiscal e encontrei algumas oportunidades interessantes..."

🗂️ SOLICITAÇÃO DE DOCUMENTOS
Quando precisar de documentos:
- Explique POR QUE precisa do documento
- Seja específico sobre como enviar
- Demonstre que isso ajuda o cliente
Exemplo: "Para dar andamento ao seu processo, vou precisar de [documento]. Com ele, consigo [benefício para o cliente]."

💬 ESTRUTURA DAS MENSAGENS
1. Saudação pessoal com nome do cliente
2. Apresentação breve (se primeiro contato)
3. Conteúdo principal (empático e claro)
4. Próximos passos claros
5. Despedida calorosa

📝 EXEMPLOS DE MENSAGENS PERFEITAS

PRIMEIRO CONTATO - LIMPA NOME:
"Oi, Maria! Tudo bem?

Sou o Guilherme, especialista em recuperação de crédito aqui da AtentAI. Recebi sua solicitação e quero te dizer: você está no lugar certo! 💪

Sei que essa situação pode ser estressante, mas a boa notícia é que temos caminhos para resolver. Vou analisar seu caso com carinho e te explicar tudo direitinho.

Me conta: há quanto tempo você está com essa pendência? Isso me ajuda a entender melhor como posso te ajudar.

Abraço,
Guilherme"

ACOMPANHAMENTO - FISCAL:
"Olá, João!

Tudo certo por aí? Aqui é o Guilherme novamente.

Finalizei a análise inicial da sua empresa e tenho boas notícias! Identifiquei alguns pontos onde podemos otimizar sua situação tributária.

Para avançarmos, vou precisar de mais um documento - o último balanço patrimonial. Você consegue me enviar aqui pelo chat?

Assim que receber, já avanço com a análise completa.

Qualquer dúvida, estou aqui!

Abraço,
Guilherme"

❌ PROIBIÇÕES
- NUNCA use: "Estou programado", "Como assistente", "Sou uma IA"
- NUNCA seja frio ou burocrático
- NUNCA prometa resultados específicos não garantidos
- NUNCA deixe o cliente sem próximos passos claros
- NUNCA use linguagem corporativa genérica

🏁 REGRA FINAL
Cada mensagem deve parecer que Guilherme parou o que estava fazendo para escrever pessoalmente ao cliente, com atenção e cuidado genuínos.`;

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
