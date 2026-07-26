import type { ChatLPConfig, ScriptStep } from "../ConversationalChatLP";
import rafaelAvatar from "@/assets/rafael-especialista-credito.jpg";


const script: ScriptStep[] = [
  { id: "b1", type: "bot", text: "Olá! 👋 Sou o Rafael, especialista sênior em Carta de Crédito Corporativa da AtentAI (mais de 12 anos estruturando cartas para PMEs e grandes empresas)." },
  {
    id: "b2",
    type: "bot",
    text: "Trabalho com as principais administradoras autorizadas pelo Banco Central (Bradesco, Itaú, Porto, Âncora, HS, Embracon, Servopa). Vou desenhar em 3 minutos uma carta sob medida — taxa administrativa a partir de ~0,15% a.m. (equivalente a ~1,8% a.a., muito abaixo dos ~2,5% a.m. do capital de giro bancário), sem IOF e sem juros compostos. Posso te fazer algumas perguntas rápidas?",
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
        ? "Ótimo. Capital de giro via carta troca juros altos de banco por uma taxa administrativa enxuta (aprox. 0,15%–0,25% a.m.), sem IOF."
        : a.objetivo === "frota"
          ? "Perfeito. Para frota você negocia como cliente à vista — clientes costumam obter desconto significativo da concessionária/montadora."
          : "Excelente escolha. Vamos calibrar o crédito ideal.",
  },

  // TIPO DE CARTA
  {
    id: "q_tipo_carta",
    type: "chips",
    field: "tipo_carta",
    chips: [
      { label: "⚡ Contemplada (liberação 7–15 dias, ágio ~18–28%)", value: "contemplada" },
      { label: "📆 Cota comum (economia máxima, entra no sorteio/lance)", value: "comum" },
      { label: "🤔 Ainda não sei — o especialista me orienta", value: "indefinido" },
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
      { label: "MEI (até R$ 81 mil/ano)", value: "mei" },
      { label: "Simples — até R$ 4,8 mi/ano", value: "simples" },
      { label: "Lucro Presumido — até R$ 78 mi", value: "presumido" },
      { label: "Lucro Real — acima de R$ 78 mi", value: "real" },
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
    text: "Perfeito. Agora preciso dos seus dados de contato para o especialista enviar sua proposta personalizada em até 24h úteis. 🔒 LGPD: usados só para essa proposta, zero spam.",
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
  {
    id: "b_whats",
    type: "bot",
    text: "📱 Agora seu WhatsApp — é por aqui que o especialista vai te chamar (mais rápido que e-mail).",
  },
  {
    id: "q_phone",
    type: "input",
    field: "phone",
    kind: "phone",
    placeholder: "WhatsApp com DDD (ex.: 11 98521-4895)",
    validate: (v) => (v.replace(/\D/g, "").length < 10 ? "WhatsApp inválido — informe DDD + número" : null),
  },
  {
    id: "q_email",
    type: "input",
    field: "email",
    kind: "email",
    placeholder: "E-mail corporativo (para envio da proposta em PDF)",
    validate: (v) => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "E-mail inválido" : null),
  },

  {
    id: "b7",
    type: "bot",
    text: (a) =>
      `Fechando: ${a.full_name?.split(" ")[0]}, vou preparar sua proposta de ${a.credito} em até ${a.prazo} meses para ${a.empresa || "sua empresa"}. Retorno pelo WhatsApp ${a.phone} em até 24h úteis. Só falta seu OK abaixo. 👇`,
  },
  { id: "submit", type: "submit", label: "Receber minha proposta agora" },
];

export const cartaCreditoEmpresasConfig: ChatLPConfig = {
  brand: "AtentAI Crédito",
  agentName: "Rafael",
  agentRole: "Especialista Corporativo",
  agentInitials: "RA",
  agentAvatarUrl: rafaelAvatar,
  title: "Carta de Crédito para Empresas | AtentAI",
  metaDescription:
    "Carta de crédito corporativa com taxa administrativa reduzida: imóvel, frota, máquinas, capital de giro. Simulação personalizada em 3 minutos via chat.",
  cartaType: "Carta de Crédito Empresarial",
  source: "chat_carta_credito_empresas",
  whatsapp: "5511985214895",
  brandGradient: "from-emerald-500 to-teal-500",
  script,
};
