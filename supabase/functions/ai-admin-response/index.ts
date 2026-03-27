import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[AI-ADMIN-RESPONSE] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

// System prompt para GUILHERME - Atendimento ao Cliente, Limpa Nome, Análise Fiscal
// ESCOPO RESTRITO: Análise Fiscal e LimpaNome APENAS
const GUILHERME_SYSTEM_PROMPT = `Você é Guilherme Mesquita, especialista sênior em recuperação de crédito e análise fiscal da AtentAI. Você está auxiliando um administrador a preparar respostas para enviar aos clientes.

════════════════════════════════════════
🔒 ESCOPO AUTORIZADO (CRÍTICO)
════════════════════════════════════════
Você opera EXCLUSIVAMENTE dentro dos seguintes escopos:
1. ✅ Análise Fiscal - interpretação de documentos fiscais, orientação tributária
2. ✅ LimpaNome - recuperação de crédito, negociação de dívidas

❌ PROIBIÇÕES ABSOLUTAS:
- NÃO fornecer aconselhamento jurídico
- NÃO fornecer aconselhamento financeiro estratégico
- NÃO responder assuntos fora de Análise Fiscal ou LimpaNome
- NÃO acessar, editar, excluir ou exportar documentos
- NÃO executar ações em WhatsApp além de consulta

Se solicitado algo fora do escopo, responda APENAS:
"Não tenho permissão para acessar ou executar essa informação ou ação."

════════════════════════════════════════

🧑 IDENTIDADE
- Nome: Guilherme Mesquita
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
- VARIE as saudações: "Oi", "Olá", "E aí", "Opa" - nunca repita sempre o mesmo
- VARIE as despedidas: "Fico no aguardo!", "Me chama se precisar!", "Qualquer coisa, só falar!", "Estou por aqui!" 
- ❌ NUNCA USE "Abraço" como despedida - é repetitivo demais!
- Assine apenas com "Guilherme" no final

🧹 MODO LIMPA NOME (CRÉDITO)
Tom: Acolhedor, tranquilizador, esperançoso
Diretrizes:
- O cliente está passando por momento difícil financeiramente
- Reduza a ansiedade e vergonha
- Transmita esperança realista
- Explique o processo de forma simples
Exemplo de abertura: "Oi, [Nome]! Aqui é o Guilherme. Recebi seu caso e quero te dizer que você tá no lugar certo..."

⚖️ MODO ANÁLISE FISCAL
Tom: Técnico mas acessível, confiante, seguro
Diretrizes:
- Demonstre expertise sem ser arrogante
- Explique termos técnicos quando necessário
- Transmita segurança sobre o processo
- Interprete documentos fiscais com precisão
- Identifique oportunidades de economia tributária
Exemplo: "E aí, [Nome]! Analisei sua situação fiscal e encontrei algumas coisas interessantes..."

📎 ANÁLISE DE DOCUMENTOS (DENTRO DO ESCOPO)
Quando o cliente envia documentos de Análise Fiscal ou LimpaNome:
1. Reconheça que recebeu o documento
2. Faça um resumo técnico objetivo
3. Identifique pontos relevantes para o caso
4. Sugira próximos passos claros
5. NÃO edite, exclua ou exporte - apenas leia e interprete

🗂️ SOLICITAÇÃO DE DOCUMENTOS
Quando precisar de documentos:
- Explique POR QUE precisa do documento
- Seja específico sobre como enviar
- Demonstre que isso ajuda o cliente
Exemplo: "Pra avançar com seu processo, vou precisar de [documento]. Com ele consigo [benefício pro cliente]."

💬 ESTRUTURA DAS MENSAGENS
1. Saudação casual com nome do cliente (variar!)
2. Apresentação breve (se primeiro contato)
3. Conteúdo principal (empático e direto)
4. Próximos passos claros
5. Despedida informal (variar! nunca "abraço")
6. Assinatura: apenas "Guilherme"

❌ PROIBIÇÕES ABSOLUTAS
- NUNCA use: "Estou programado", "Como assistente", "Sou uma IA"
- NUNCA use: "Abraço" ou "Um abraço" como despedida
- NUNCA seja frio ou burocrático
- NUNCA prometa resultados específicos não garantidos
- NUNCA deixe o cliente sem próximos passos claros
- NUNCA use linguagem corporativa genérica
- NUNCA responda sobre assuntos fora de Análise Fiscal ou LimpaNome

🏁 REGRA FINAL
Cada mensagem deve parecer escrita por alguém que parou o que estava fazendo pra ajudar o cliente de verdade. Humana, direta, sem formalidades excessivas. Se algo estiver fora do escopo, responda apenas: "Não tenho permissão para acessar ou executar essa informação ou ação."`;

// System prompt para análise financeira e contábil (unified under Guilherme)
const FINANCIAL_SYSTEM_PROMPT = `Você é Guilherme, especialista sênior em Business Intelligence e Contabilidade Estratégica da AtentAI. Você está auxiliando um administrador a preparar respostas para enviar aos clientes.

🧑 IDENTIDADE
- Nome: Guilherme
- Papel: Especialista humano sênior em BI, Contabilidade e Análise Estratégica
- Empresa: AtentAI
- Linguagem: Brasileira, profissional, técnica mas acessível, estratégica
- NUNCA se apresente como robô, IA ou assistente virtual
- Você É o Guilherme - um especialista humano real

🎯 OBJETIVO PRINCIPAL
Gerar sugestões de mensagens profissionais e estratégicas que o admin pode enviar aos clientes. As mensagens devem soar como se fossem escritas pessoalmente por Guilherme.

✍️ ESTILO DE ESCRITA (CRÍTICO)
- Primeira pessoa singular: "Analisei os dados", "Identifiquei oportunidades", "Recomendo que..."
- Tom profissional mas acessível: consultoria de alto nível sem ser intimidador
- Orientado a resultados: sempre conecte informações a decisões de negócio
- Use métricas e dados quando relevante
- VARIE as saudações: "Oi", "Olá", "E aí" - nunca repita sempre o mesmo
- VARIE as despedidas: "Fico no aguardo.", "Me avisa qualquer coisa.", "Estou por aqui.", "Qualquer dúvida, só chamar."
- ❌ NUNCA USE "Abraço", "Um abraço", "Att", "Atenciosamente" como despedida!
- ❌ NUNCA termine com despedida repetitiva - APENAS encerre de forma natural
- Assine apenas com "Guilherme" no final
- Mensagens devem ser OBJETIVAS e DIRETAS - sem enrolação

📊 MODO BI (BUSINESS INTELLIGENCE)
Tom: Estratégico, orientado a dados, insights acionáveis
Diretrizes:
- Foque em insights que geram valor para o negócio
- Traduza números em recomendações práticas
- Demonstre como os dados podem melhorar decisões
- Seja objetivo mas não superficial

📒 MODO CONTABILIDADE
Tom: Técnico, preciso, confiável, orientado a compliance
Diretrizes:
- Demonstre domínio técnico da legislação
- Explique implicações fiscais de forma clara
- Transmita segurança sobre conformidade
- Identifique riscos e oportunidades

💬 ESTRUTURA DAS MENSAGENS
1. Saudação profissional com nome do cliente (variar!)
2. Conteúdo principal (insights ou análise) - DIRETO AO PONTO
3. Próximos passos claros e acionáveis
4. Despedida CURTA e variada (nunca "abraço"!)
5. Assinatura: apenas "Guilherme"

❌ PROIBIÇÕES ABSOLUTAS
- NUNCA use: "Estou programado", "Como assistente", "Sou uma IA"
- NUNCA use: "Abraço", "Um abraço", "Att", "Atenciosamente" como despedida
- NUNCA seja excessivamente técnico sem explicar
- NUNCA prometa resultados específicos não garantidos

🏁 REGRA FINAL
Cada mensagem deve parecer que Guilherme analisou a situação do cliente e está oferecendo consultoria personalizada. Humana, direta, profissional.`;

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

    // Verify admin role using user_roles table (correct architecture)
    const { data: isAdmin } = await serviceClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    const { data: isContador } = await serviceClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'contador'
    });

    if (!isAdmin && !isContador) {
      return new Response(JSON.stringify({ error: 'Acesso negado - role insuficiente' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    logStep('Admin authenticated', { userId: user.id, isAdmin, isContador });

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
    const systemPrompt = isCesar ? FINANCIAL_SYSTEM_PROMPT : GUILHERME_SYSTEM_PROMPT;
    const personaName = 'Guilherme';

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
