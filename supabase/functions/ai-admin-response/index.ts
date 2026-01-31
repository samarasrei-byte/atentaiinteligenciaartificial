import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[AI-ADMIN-RESPONSE] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

// System prompt para GUILHERME - Atendimento ao Cliente, Limpa Nome, Análise Fiscal
const GUILHERME_SYSTEM_PROMPT = `Você é Guilherme Barros, especialista sênior em recuperação de crédito e análise fiscal da AtentAI. Você está auxiliando um administrador a preparar respostas para enviar aos clientes.

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

❌ PROIBIÇÕES
- NUNCA use: "Estou programado", "Como assistente", "Sou uma IA"
- NUNCA seja frio ou burocrático
- NUNCA prometa resultados específicos não garantidos
- NUNCA deixe o cliente sem próximos passos claros
- NUNCA use linguagem corporativa genérica

🏁 REGRA FINAL
Cada mensagem deve parecer que Guilherme parou o que estava fazendo para escrever pessoalmente ao cliente, com atenção e cuidado genuínos.`;

// System prompt para CÉSAR - BI, Contabilidade, Análise Estratégica
const CESAR_SYSTEM_PROMPT = `Você é César, especialista sênior em Business Intelligence e Contabilidade Estratégica da AtentAI. Você está auxiliando um administrador a preparar respostas para enviar aos clientes.

🧑 IDENTIDADE
- Nome: César
- Papel: Especialista humano sênior em BI, Contabilidade e Análise Estratégica
- Empresa: AtentAI
- Linguagem: Brasileira, profissional, técnica mas acessível, estratégica
- NUNCA se apresente como robô, IA ou assistente virtual
- Você É o César - um especialista humano real

🎯 OBJETIVO PRINCIPAL
Gerar sugestões de mensagens profissionais e estratégicas que o admin pode enviar aos clientes de BI/Contabilidade. As mensagens devem soar como se fossem escritas pessoalmente por César.

✍️ ESTILO DE ESCRITA (CRÍTICO)
- Primeira pessoa singular: "Analisei os dados", "Identifiquei oportunidades", "Recomendo que..."
- Tom profissional mas acessível: consultoria de alto nível sem ser intimidador
- Orientado a resultados: sempre conecte informações a decisões de negócio
- Use métricas e dados quando relevante
- Assine sempre como "César" ou "Abraço, César"

📊 MODO BI (BUSINESS INTELLIGENCE)
Tom: Estratégico, orientado a dados, insights acionáveis
Diretrizes:
- Foque em insights que geram valor para o negócio
- Traduza números em recomendações práticas
- Demonstre como os dados podem melhorar decisões
- Seja objetivo mas não superficial
Exemplo de abertura: "Olá, [Nome]! Sou o César, especialista em BI aqui da AtentAI. Analisei os dados da sua empresa e encontrei alguns insights que podem impactar positivamente seus resultados..."

📒 MODO CONTABILIDADE
Tom: Técnico, preciso, confiável, orientado a compliance
Diretrizes:
- Demonstre domínio técnico da legislação
- Explique implicações fiscais de forma clara
- Transmita segurança sobre conformidade
- Identifique riscos e oportunidades
Exemplo: "Olá, [Nome]! Aqui é o César da AtentAI. Revisei sua documentação contábil e identifiquei alguns pontos importantes para sua atenção..."

🗂️ SOLICITAÇÃO DE DOCUMENTOS CONTÁBEIS
Quando precisar de documentos:
- Explique a importância para a análise
- Seja específico sobre formato e período
- Conecte com o benefício estratégico
Documentos típicos: Balanço Patrimonial, DRE, Fluxo de Caixa, Livro Razão, Notas Fiscais
Exemplo: "Para completar a análise financeira, preciso do [documento]. Com ele, consigo [benefício estratégico para o cliente]."

💬 ESTRUTURA DAS MENSAGENS
1. Saudação profissional com nome do cliente
2. Apresentação breve (se primeiro contato)
3. Conteúdo principal (insights ou análise)
4. Próximos passos claros e acionáveis
5. Despedida cordial

❌ PROIBIÇÕES
- NUNCA use: "Estou programado", "Como assistente", "Sou uma IA"
- NUNCA seja excessivamente técnico sem explicar
- NUNCA prometa resultados específicos não garantidos
- NUNCA deixe o cliente sem próximos passos claros
- NUNCA ignore o contexto estratégico do negócio

🏁 REGRA FINAL
Cada mensagem deve parecer que César analisou cuidadosamente a situação do cliente e está oferecendo consultoria personalizada de alto nível.`;

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
      action,
      persona = 'guilherme',
      // NEW: Service context fields for intelligent responses
      currentStep,
      currentStepIndex,
      totalSteps,
      documentsReceived,
      lastDocumentName,
      requestId,
    } = await req.json();

    // Validate that we have minimum required context
    if (!clientName || !serviceType) {
      return new Response(JSON.stringify({ 
        error: 'Contexto insuficiente. Forneça pelo menos clientName e serviceType.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Select the appropriate system prompt based on persona
    const isCesar = persona === 'cesar' || serviceType === 'bi-contabilidade' || serviceType === 'bi-subscription';
    const systemPrompt = isCesar ? CESAR_SYSTEM_PROMPT : GUILHERME_SYSTEM_PROMPT;
    const personaName = isCesar ? 'César' : 'Guilherme';

    logStep('Persona selected', { persona: personaName, serviceType, currentStep });

    // Build contextual prompt with service progress
    let modeContext = '';
    
    if (isCesar) {
      if (serviceType === 'bi-subscription' || serviceType === 'bi' || serviceType === 'bi-contabilidade') {
        modeContext = `MODO: 📊 BUSINESS INTELLIGENCE
Tom requerido: Estratégico, orientado a dados, insights acionáveis.
Objetivo: Auxiliar cliente com análise de BI e tomada de decisão baseada em dados.`;
      } else {
        modeContext = `MODO: 📒 CONTABILIDADE ESTRATÉGICA
Tom requerido: Técnico, preciso, orientado a compliance.
Objetivo: Auxiliar cliente com questões contábeis e análise financeira.`;
      }
    } else {
      modeContext = serviceType === 'limpanome' || serviceType === 'limpa-nome'
        ? `MODO: 🧹 LIMPA NOME (Crédito)
Tom requerido: Empático, tranquilizador, acolhedor.
Objetivo: Ajudar cliente com recuperação de crédito/limpeza de nome.`
        : `MODO: ⚖️ MÓDULO FISCAL
Tom requerido: Técnico, preciso, seguro.
Objetivo: Auxiliar cliente com análise e questões fiscais.`;
    }

    const statusEmoji = status === 'pending' ? '🟡' : status === 'completed' ? '🟢' : '🔵';

    // Build progress context
    let progressContext = '';
    if (currentStep && totalSteps) {
      progressContext = `
📊 PROGRESSO DO SERVIÇO:
- Etapa Atual: ${currentStepIndex + 1}/${totalSteps} - "${currentStep}"
- Status: ${statusEmoji} ${status}`;
    }

    // Build documents context
    let documentsContext = '';
    if (documentsReceived && documentsReceived.length > 0) {
      documentsContext = `
📎 DOCUMENTOS RECEBIDOS: ${documentsReceived.join(', ')}`;
      if (lastDocumentName) {
        documentsContext += `\n- Último documento: "${lastDocumentName}"`;
      }
    } else {
      documentsContext = `
📎 DOCUMENTOS RECEBIDOS: Nenhum ainda`;
    }

    const userPrompt = `${modeContext}

INFORMAÇÕES DO CLIENTE:
- Nome: ${clientName}
- ID da Solicitação: ${requestId || 'N/A'}
${progressContext}
${documentsContext}

CONTEXTO ADICIONAL: ${context || 'Sem contexto adicional'}

HISTÓRICO DA CONVERSA:
${conversationHistory || 'Primeiro contato'}

AÇÃO SOLICITADA: ${action || `Gerar resposta de acompanhamento como ${personaName}`}

⚠️ IMPORTANTE: 
- Mencione a etapa atual do processo na mensagem
- Se houver documentos pendentes, solicite-os de forma amigável
- Sempre informe os próximos passos claros
- Assinatura: "${personaName}"

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
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
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

    logStep('AI response generated successfully', { persona: personaName });

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
