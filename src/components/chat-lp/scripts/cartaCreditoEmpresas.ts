import type { ChatLPConfig, ScriptStep } from "../ConversationalChatLP";

const script: ScriptStep[] = [
  { id: "b1", type: "bot", text: "Olá! 👋 Sou o Rafael, especialista em Crédito Corporativo da AtentAI." },
  {
    id: "b2",
    type: "bot",
    text: "Vou desenhar em 3 minutos uma carta de crédito sob medida para sua empresa — sem juros, com poder de compra à vista. Posso te fazer algumas perguntas rápidas?",
    delay: 900,
  },

  // OBJETIVO
  {
    id: "q_objetivo",
    type: "chips",
    field: "objetivo",
    chips: [
      { label: "🏢 Imóvel comercial", value: "imovel_comercial" },
      { label: "🚛 Frota / veículos", value: "frota" },
      { label: "⚙️ Máquinas / equipamentos", value: "maquinario" },
      { label: "💰 Capital de giro", value: "capital_giro" },
      { label: "🏗️ Construção / expansão", value: "construcao" },
      { label: "📦 Estoque / insumos", value: "estoque" },
    ],
  },
  {
    id: "b3",
    type: "bot",
    text: (a) =>
      a.objetivo === "capital_giro"
        ? "Ótimo. Capital de giro via carta substitui empréstimo caro por parcela leve, sem IOF extra."
        : a.objetivo === "frota"
          ? "Perfeito. Para frota você negocia como cliente à vista — desconto médio de 8 a 15%."
          : "Excelente escolha. Vamos calibrar o crédito ideal.",
  },

  // TIPO DE CARTA
  {
    id: "q_tipo_carta",
    type: "chips",
    field: "tipo_carta",
    chips: [
      { label: "⚡ Já contemplada (uso imediato)", value: "contemplada" },
      { label: "📆 Cota comum (economia máx.)", value: "comum" },
      { label: "🤔 Ainda não sei", value: "indefinido" },
    ],
  },

  // CRÉDITO
  { id: "q_credito", type: "input", field: "credito", kind: "currency", placeholder: "Ex.: R$ 500.000" },
  {
    id: "b4",
    type: "bot",
    text: (a) => `Anotado: crédito-alvo de ${a.credito}. Isso me ajuda a fechar as melhores cotas.`,
  },

  // PRAZO
  {
    id: "q_prazo",
    type: "chips",
    field: "prazo",
    chips: [
      { label: "Até 60 meses (5 anos)", value: "60" },
      { label: "Até 120 meses (10 anos)", value: "120" },
      { label: "Até 180 meses (15 anos)", value: "180" },
      { label: "Até 200 meses (16,5 anos)", value: "200" },
    ],
  },

  // URGÊNCIA
  {
    id: "q_urgencia",
    type: "chips",
    field: "urgencia",
    chips: [
      { label: "🔥 Até 30 dias", value: "asap" },
      { label: "📆 Até 3 meses", value: "3m" },
      { label: "🗓️ Até 6 meses", value: "6m" },
      { label: "🔍 Pesquisando", value: "pesquisa" },
    ],
  },
  {
    id: "b5",
    type: "bot",
    text: (a) =>
      a.urgencia === "asap"
        ? "Para 30 dias vamos priorizar carta JÁ CONTEMPLADA. Crédito liberado em até 7 dias após o ágio."
        : "Ótimo. Vou separar tanto cotas comuns (mais econômicas) quanto contempladas.",
  },

  // FATURAMENTO
  {
    id: "q_faturamento",
    type: "chips",
    field: "faturamento",
    chips: [
      { label: "Até R$ 360 mil/ano", value: "mei_simples" },
      { label: "R$ 360k a R$ 4,8 mi", value: "simples" },
      { label: "R$ 4,8 mi a R$ 78 mi", value: "presumido" },
      { label: "Acima de R$ 78 mi", value: "real" },
    ],
  },

  // TEMPO DE CNPJ
  {
    id: "q_tempo_cnpj",
    type: "chips",
    field: "tempo_cnpj",
    chips: [
      { label: "Menos de 1 ano", value: "<1a" },
      { label: "1 a 3 anos", value: "1-3a" },
      { label: "3 a 5 anos", value: "3-5a" },
      { label: "Mais de 5 anos", value: ">5a" },
    ],
  },

  // SCORE EMPRESARIAL (Serasa/Boa Vista)
  {
    id: "b_score",
    type: "bot",
    text: "Uma pergunta chave 📊 — qual o score da sua empresa (Serasa/Boa Vista)? Isso define as melhores administradoras que consigo ativar pra você.",
  },
  {
    id: "q_score",
    type: "chips",
    field: "score_empresa",
    chips: [
      { label: "🟢 Alto (700+)", value: "alto" },
      { label: "🟡 Médio (500-699)", value: "medio" },
      { label: "🟠 Baixo (300-499)", value: "baixo" },
      { label: "🔴 Muito baixo / com restrição", value: "restricao" },
      { label: "❓ Não sei consultar", value: "desconhecido" },
    ],
  },
  {
    id: "b_score_reply",
    type: "bot",
    text: (a) =>
      a.score_empresa === "alto"
        ? "Excelente! Score alto abre as melhores taxas e administradoras premium."
        : a.score_empresa === "restricao"
          ? "Sem drama — temos administradoras que aceitam com garantidor ou garantia real. Vamos encontrar o caminho."
          : a.score_empresa === "desconhecido"
            ? "Sem problema, nosso time consulta gratuitamente antes de propor a cota."
            : "Anotado. Vou cruzar com as administradoras que aceitam esse perfil.",
  },

  // SITUAÇÃO FISCAL
  {
    id: "q_situacao_fiscal",
    type: "chips",
    field: "situacao_fiscal",
    chips: [
      { label: "✅ CND em dia", value: "regular" },
      { label: "⚠️ Alguma pendência", value: "pendencia" },
      { label: "❓ Não sei", value: "desconhecido" },
    ],
  },

  // CONTATO
  {
    id: "b6",
    type: "bot",
    text: "Perfeito. Agora só preciso de um contato pro especialista fechar sua proposta personalizada. 🔒 Zero spam.",
  },
  {
    id: "q_name",
    type: "input",
    field: "full_name",
    kind: "text",
    placeholder: "Seu nome completo",
    validate: (v) => (v.trim().split(/\s+/).length < 2 ? "Informe nome e sobrenome" : null),
  },
  { id: "q_empresa", type: "input", field: "empresa", kind: "text", placeholder: "Nome da empresa (Razão Social)" },
  { id: "q_cnpj", type: "input", field: "cnpj", kind: "cnpj", placeholder: "CNPJ da empresa" },
  { id: "q_phone", type: "input", field: "phone", kind: "phone", placeholder: "WhatsApp com DDD" },
  { id: "q_email", type: "input", field: "email", kind: "email", placeholder: "E-mail corporativo" },

  {
    id: "b7",
    type: "bot",
    text: (a) =>
      `Fechando: ${a.full_name?.split(" ")[0]}, vou preparar sua proposta de ${a.credito} em até ${a.prazo} meses para ${a.empresa || "sua empresa"}. Só falta seu OK abaixo. 👇`,
  },
  { id: "submit", type: "submit", label: "Receber minha proposta agora" },
];

export const cartaCreditoEmpresasConfig: ChatLPConfig = {
  brand: "AtentAI Crédito",
  agentName: "Rafael",
  agentRole: "Especialista Corporativo",
  agentInitials: "RA",
  title: "Carta de Crédito para Empresas | AtentAI",
  metaDescription:
    "Carta de crédito sem juros para sua empresa: imóvel, frota, máquinas, capital de giro. Simulação personalizada em 3 minutos via chat.",
  cartaType: "Carta de Crédito Empresarial",
  source: "chat_carta_credito_empresas",
  whatsapp: "5511985214895",
  brandGradient: "from-emerald-500 to-teal-500",
  script,
};
