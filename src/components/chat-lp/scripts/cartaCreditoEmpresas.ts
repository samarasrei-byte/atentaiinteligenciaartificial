import type { ChatLPConfig, ScriptStep } from "../ConversationalChatLP";

const script: ScriptStep[] = [
  { id: "b1", type: "bot", text: "Olá! 👋 Sou o Rafael, especialista em Crédito Corporativo da AtentAI." },
  {
    id: "b2",
    type: "bot",
    text: "Vou desenhar em 2 minutos uma carta de crédito sob medida para sua empresa — sem juros, com poder de compra à vista. Posso te fazer 6 perguntas rápidas?",
    delay: 900,
  },
  {
    id: "q_objetivo",
    type: "chips",
    field: "objetivo",
    chips: [
      { label: "🏢 Comprar imóvel comercial", value: "imovel_comercial" },
      { label: "🚛 Renovar frota / veículos", value: "frota" },
      { label: "⚙️ Máquinas e equipamentos", value: "maquinario" },
      { label: "💰 Capital de giro planejado", value: "capital_giro" },
      { label: "🏗️ Construção / expansão", value: "construcao" },
    ],
  },
  {
    id: "b3",
    type: "bot",
    text: (a) =>
      a.objetivo === "capital_giro"
        ? "Ótimo. Capital de giro via carta contemplada substitui empréstimo caro por parcela leve, sem IOF extra."
        : a.objetivo === "frota"
          ? "Perfeito. Cartas para frota permitem negociar como cliente à vista — desconto médio de 8 a 15% na concessionária."
          : "Excelente escolha. Vamos calibrar o crédito ideal.",
  },
  {
    id: "q_credito",
    type: "input",
    field: "credito",
    kind: "currency",
    placeholder: "Ex.: R$ 500.000",
  },
  {
    id: "b4",
    type: "bot",
    text: (a) => `Anotado: crédito-alvo de ${a.credito}. Isso me ajuda a fechar as melhores cotas.`,
  },
  {
    id: "q_prazo",
    type: "chips",
    field: "prazo",
    chips: [
      { label: "Até 60 meses", value: "60" },
      { label: "60 a 120 meses", value: "120" },
      { label: "120 a 180 meses", value: "180" },
      { label: "Mais de 180 meses", value: "240" },
    ],
  },
  {
    id: "q_urgencia",
    type: "chips",
    field: "urgencia",
    chips: [
      { label: "🔥 Preciso em até 30 dias", value: "asap" },
      { label: "📆 Em até 3 meses", value: "3m" },
      { label: "🗓️ Em até 6 meses", value: "6m" },
      { label: "🔍 Estou pesquisando", value: "pesquisa" },
    ],
  },
  {
    id: "b5",
    type: "bot",
    text: (a) =>
      a.urgencia === "asap"
        ? "Perfeito — para 30 dias vamos priorizar carta JÁ CONTEMPLADA. Crédito liberado em até 7 dias após o ágio."
        : "Ótimo. Vamos separar tanto cotas comuns (mais econômicas) quanto contempladas.",
  },
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
  {
    id: "b6",
    type: "bot",
    text: "Perfeito. Agora só preciso de um contato para o especialista fechar sua proposta personalizada. 🔒 Zero spam.",
  },
  {
    id: "q_name",
    type: "input",
    field: "full_name",
    kind: "text",
    placeholder: "Seu nome completo",
    validate: (v) => (v.trim().split(/\s+/).length < 2 ? "Informe nome e sobrenome" : null),
  },
  {
    id: "q_cnpj",
    type: "input",
    field: "cnpj",
    kind: "cnpj",
    placeholder: "CNPJ da empresa",
  },
  {
    id: "q_phone",
    type: "input",
    field: "phone",
    kind: "phone",
    placeholder: "WhatsApp com DDD",
  },
  {
    id: "q_email",
    type: "input",
    field: "email",
    kind: "email",
    placeholder: "E-mail corporativo",
  },
  {
    id: "b7",
    type: "bot",
    text: (a) =>
      `Fechando: ${a.full_name?.split(" ")[0]}, vou preparar sua proposta de ${a.credito} para ${a.prazo}x. Só falta seu OK abaixo. 👇`,
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
    "Carta de crédito sem juros para sua empresa: imóvel comercial, frota, máquinas ou capital de giro. Simulação personalizada em 2 minutos via chat.",
  cartaType: "Carta de Crédito Empresarial",
  source: "chat_carta_credito_empresas",
  whatsapp: "5511985214895",
  brandGradient: "from-emerald-500 to-teal-500",
  script,
};
