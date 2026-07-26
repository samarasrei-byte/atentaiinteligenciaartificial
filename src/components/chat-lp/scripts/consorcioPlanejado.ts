import type { ChatLPConfig, ScriptStep } from "../ConversationalChatLP";

const script: ScriptStep[] = [
  { id: "b1", type: "bot", text: "Oi! 👋 Sou a Marina, consultora de Consórcio Planejado da AtentAI." },
  {
    id: "b2",
    type: "bot",
    text: "Em 2 minutos eu monto seu plano ideal: parcela leve, sem juros, com estratégia de contemplação. Bora começar? 🎯",
    delay: 900,
  },
  {
    id: "q_objetivo",
    type: "chips",
    field: "objetivo",
    chips: [
      { label: "🏠 Casa própria", value: "imovel" },
      { label: "🚗 Carro / moto", value: "automovel" },
      { label: "🚜 Máquinas / caminhão", value: "pesados" },
      { label: "🛠️ Reforma / serviços", value: "servicos" },
      { label: "🌱 Rural / agro", value: "rural" },
    ],
  },
  {
    id: "b3",
    type: "bot",
    text: (a) =>
      a.objetivo === "imovel"
        ? "Casa própria é o nº1 dos brasileiros. Com consórcio você paga até 40% menos que o financiamento — e ainda usa FGTS no lance."
        : a.objetivo === "automovel"
          ? "Ótimo! Consórcio de carro te dá poder de compra à vista — desconto médio de 8 a 15% na concessionária."
          : "Excelente. Vamos calibrar seu plano.",
  },
  {
    id: "q_credito",
    type: "input",
    field: "credito",
    kind: "currency",
    placeholder: "Ex.: R$ 250.000",
  },
  {
    id: "b4",
    type: "bot",
    text: (a) => `Perfeito, ${a.credito}. Agora escolhe o prazo que cabe na sua parcela.`,
  },
  {
    id: "q_prazo",
    type: "chips",
    field: "prazo",
    chips: [
      { label: "60 meses", value: "60" },
      { label: "100 meses", value: "100" },
      { label: "180 meses", value: "180" },
      { label: "240 meses", value: "240" },
    ],
  },
  {
    id: "q_lance",
    type: "chips",
    field: "lance",
    chips: [
      { label: "Não tenho lance", value: "0" },
      { label: "10% do crédito", value: "10" },
      { label: "25% do crédito", value: "25" },
      { label: "50%+ (quero contemplar rápido)", value: "50" },
    ],
  },
  {
    id: "b5",
    type: "bot",
    text: (a) =>
      a.lance === "50"
        ? "Com lance forte suas chances de contemplação nos primeiros 6 meses saltam para ~85%."
        : a.lance === "0"
          ? "Sem problema — dá pra planejar contemplação por sorteio + lance embutido depois."
          : "Ótima estratégia. Vamos posicionar seu lance no grupo certo.",
  },
  {
    id: "q_urgencia",
    type: "chips",
    field: "urgencia",
    chips: [
      { label: "🔥 Quero usar em até 3 meses", value: "asap" },
      { label: "📆 Até 12 meses", value: "12m" },
      { label: "🗓️ 12 a 24 meses", value: "24m" },
      { label: "🧭 Planejamento longo prazo", value: "long" },
    ],
  },
  {
    id: "b6",
    type: "bot",
    text: (a) =>
      a.urgencia === "asap"
        ? "Para 3 meses o caminho é carta JÁ CONTEMPLADA. Vou te mostrar as disponíveis."
        : "Perfeito. Vou montar tanto cota comum (mais econômica) quanto opção contemplada.",
  },
  {
    id: "q_perfil",
    type: "chips",
    field: "perfil",
    chips: [
      { label: "Pessoa Física", value: "pf" },
      { label: "MEI", value: "mei" },
      { label: "Pessoa Jurídica", value: "pj" },
    ],
  },
  {
    id: "b7",
    type: "bot",
    text: "Perfeito! Agora só preciso do seu contato para enviar a proposta. 🔒 Sem spam, prometido.",
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
    placeholder: "Seu melhor e-mail",
  },
  {
    id: "b8",
    type: "bot",
    text: (a) =>
      `Show, ${a.full_name?.split(" ")[0]}! Vou preparar sua proposta de ${a.credito} em ${a.prazo}x. Confirma o envio abaixo. 👇`,
  },
  { id: "submit", type: "submit", label: "Receber minha proposta agora" },
];

export const consorcioPlanejadoConfig: ChatLPConfig = {
  brand: "AtentAI Consórcio",
  agentName: "Marina",
  agentRole: "Consultora de Consórcio",
  agentInitials: "MA",
  title: "Consórcio Planejado | AtentAI",
  metaDescription:
    "Consórcio sem juros com estratégia de contemplação. Simule casa, carro, máquinas ou reforma em 2 minutos via chat conversacional.",
  cartaType: "Consórcio Planejado",
  source: "chat_consorcio_planejado",
  whatsapp: "5511985214895",
  brandGradient: "from-violet-500 to-fuchsia-500",
  script,
};
