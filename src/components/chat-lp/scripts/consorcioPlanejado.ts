import type { ChatLPConfig, ScriptStep } from "../ConversationalChatLP";

// ============================================================
// CONSÓRCIO PLANEJADO (Lei 11.795/2008)
// ⚠️ Produto de AUTOFINANCIAMENTO em grupo — SEM juros de crédito.
// Custo = taxa de administração + fundo de reserva + seguro.
// Contemplação por sorteio ou lance. Administradoras autorizadas
// pelo BACEN. NÃO é empréstimo bancário (para crédito PJ com
// liberação imediata e juros, temos página separada).
// ============================================================

const script: ScriptStep[] = [
  { id: "b1", type: "bot", text: "Oi! 👋 Sou a Marina, consultora sênior de Consórcio da AtentAI (mais de 10 anos estruturando planos de contemplação)." },
  {
    id: "b2",
    type: "bot",
    text: "Antes de começar, deixo claro: aqui é CONSÓRCIO (Lei 11.795/2008, administradoras autorizadas pelo BACEN — Porto, Itaú, Bradesco, HS, Embracon, Âncora, etc.). Você NÃO paga juros de empréstimo — paga taxa de administração + fundo de reserva + seguro. A liberação do crédito é por sorteio ou lance (contemplação). É diferente de empréstimo bancário — para isso temos página própria.",
    delay: 900,
  },
  {
    id: "b2b",
    type: "bot",
    text: "Taxa de administração diluída fica a partir de ~0,12% a.m. — muito abaixo dos juros de financiamento (1,3% a 2,5% a.m.). Bora montar seu plano? 🎯",
    delay: 800,
  },

  // OBJETIVO
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
      { label: "✈️ Viagem / estudos", value: "servicos_leves" },
    ],
  },
  {
    id: "b3",
    type: "bot",
    text: (a) =>
      a.objetivo === "imovel"
        ? "Casa própria é o nº1 dos brasileiros. Consórcio paga até 40% menos que financiamento — e ainda usa FGTS no lance."
        : a.objetivo === "automovel"
          ? "Ótimo! Carro no consórcio te dá poder de compra à vista — clientes costumam obter desconto significativo da concessionária."
          : "Excelente. Vamos calibrar seu plano.",
  },

  // TIPO DE COTA (comum vs contemplada) — REQUISITADO
  {
    id: "b_tipo",
    type: "bot",
    text: "Uma escolha estratégica agora 👇 — você quer entrar numa cota nova ou já ir direto pra uma CARTA CONTEMPLADA (uso imediato do crédito)?",
  },
  {
    id: "q_tipo_cota",
    type: "chips",
    field: "tipo_cota",
    chips: [
      { label: "⚡ Carta contemplada (usar já)", value: "contemplada" },
      { label: "📆 Cota nova / comum (economia)", value: "comum" },
      { label: "🎯 Quero as duas opções", value: "ambas" },
      { label: "🤔 Me ajuda a escolher", value: "indefinido" },
    ],
  },
  {
    id: "b_tipo_reply",
    type: "bot",
    text: (a) =>
      a.tipo_cota === "contemplada"
        ? "Perfeito. Cartas contempladas liberam o crédito em até 7 dias após o ágio — vou selecionar as disponíveis no seu perfil."
        : a.tipo_cota === "comum"
          ? "Excelente pra economia! Cota nova custa até 40% menos que financiamento bancário."
          : "Show — vou preparar as duas opções pra você comparar lado a lado.",
  },

  // CRÉDITO
  { id: "q_credito", type: "input", field: "credito", kind: "currency", placeholder: "Ex.: R$ 250.000" },
  {
    id: "b4",
    type: "bot",
    text: (a) => `Perfeito, ${a.credito}. Agora escolhe o prazo que cabe na sua parcela.`,
  },

  // PRAZO
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

  // LANCE
  {
    id: "q_lance",
    type: "chips",
    field: "lance",
    chips: [
      { label: "Não tenho lance", value: "0" },
      { label: "10% do crédito", value: "10" },
      { label: "25% do crédito", value: "25" },
      { label: "50%+ (contemplar rápido)", value: "50" },
    ],
  },
  {
    id: "b5",
    type: "bot",
    text: (a) =>
      a.lance === "50"
        ? "Com lance forte suas chances de contemplação nos primeiros 6 meses saltam pra ~85%."
        : a.lance === "0"
          ? "Sem problema — dá pra planejar contemplação por sorteio + lance embutido depois."
          : "Ótima estratégia. Vou posicionar seu lance no grupo certo.",
  },

  // URGÊNCIA
  {
    id: "q_urgencia",
    type: "chips",
    field: "urgencia",
    chips: [
      { label: "🔥 Usar em até 3 meses", value: "asap" },
      { label: "📆 Até 12 meses", value: "12m" },
      { label: "🗓️ 12 a 24 meses", value: "24m" },
      { label: "🧭 Longo prazo", value: "long" },
    ],
  },
  {
    id: "b6",
    type: "bot",
    text: (a) =>
      a.urgencia === "asap" || a.tipo_cota === "contemplada"
        ? "Perfeito. O caminho é carta JÁ CONTEMPLADA. Vou te mostrar as disponíveis no seu perfil."
        : "Show. Vou montar tanto cota comum (mais econômica) quanto opção contemplada.",
  },

  // PERFIL
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

  // SCORE (Serasa) — REQUISITADO
  {
    id: "b_score",
    type: "bot",
    text: (a) =>
      a.perfil === "pj"
        ? "📊 Qual o score da empresa (Serasa/Boa Vista)? Isso define quais administradoras consigo ativar."
        : "📊 Qual seu score de crédito (Serasa)? Isso define quais administradoras consigo ativar pra você.",
  },
  {
    id: "q_score",
    type: "chips",
    field: "score",
    chips: [
      { label: "🟢 Alto (700+)", value: "alto" },
      { label: "🟡 Médio (500-699)", value: "medio" },
      { label: "🟠 Baixo (300-499)", value: "baixo" },
      { label: "🔴 Muito baixo / restrição", value: "restricao" },
      { label: "❓ Não sei", value: "desconhecido" },
    ],
  },
  {
    id: "b_score_reply",
    type: "bot",
    text: (a) =>
      a.score === "alto"
        ? "Excelente! Score alto abre as melhores administradoras e taxas premium."
        : a.score === "restricao"
          ? "Sem drama — temos administradoras que aceitam com garantidor ou garantia real."
          : a.score === "desconhecido"
            ? "Tranquilo, nosso time consulta gratuitamente antes de propor a cota."
            : "Anotado. Vou cruzar com as administradoras que aceitam esse perfil.",
  },

  // RENDA / FATURAMENTO
  {
    id: "q_renda",
    type: "chips",
    field: "renda",
    chips: [
      { label: "Até R$ 3 mil", value: "ate3k" },
      { label: "R$ 3k a R$ 8 mil", value: "3-8k" },
      { label: "R$ 8k a R$ 20 mil", value: "8-20k" },
      { label: "Acima de R$ 20 mil", value: "20k+" },
    ],
  },

  // CONTATO
  {
    id: "b7",
    type: "bot",
    text: "Perfeito! Agora só preciso do seu contato pra enviar a proposta. 🔒 Sem spam, prometido.",
  },
  {
    id: "q_name",
    type: "input",
    field: "full_name",
    kind: "text",
    placeholder: "Seu nome completo",
    validate: (v) => (v.trim().split(/\s+/).length < 2 ? "Informe nome e sobrenome" : null),
  },
  { id: "q_phone", type: "input", field: "phone", kind: "phone", placeholder: "WhatsApp com DDD" },
  { id: "q_email", type: "input", field: "email", kind: "email", placeholder: "Seu melhor e-mail" },

  {
    id: "b8",
    type: "bot",
    text: (a) =>
      `Show, ${a.full_name?.split(" ")[0]}! Vou preparar sua proposta de ${a.credito} em ${a.prazo}x${
        a.tipo_cota === "contemplada" ? " (carta contemplada)" : ""
      }. Confirma o envio abaixo. 👇`,
  },
  { id: "submit", type: "submit", label: "Receber minha proposta agora" },
];

export const consorcioPlanejadoConfig: ChatLPConfig = {
  brand: "AtentAI Consórcio",
  agentName: "Marina",
  agentRole: "Consultora de Consórcio",
  agentInitials: "MA",
  title: "Consórcio Planejado + Cartas Contempladas | AtentAI",
  metaDescription:
    "Consórcio com taxa administrativa reduzida ou carta já contemplada. Estratégia de contemplação personalizada em 3 minutos via chat conversacional.",
  cartaType: "Consórcio Planejado",
  source: "chat_consorcio_planejado",
  whatsapp: "5511985214895",
  brandGradient: "from-violet-500 to-fuchsia-500",
  script,
};
