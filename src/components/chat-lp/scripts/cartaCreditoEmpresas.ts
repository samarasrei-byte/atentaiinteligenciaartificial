import type { ChatLPConfig, ScriptStep } from "../ConversationalChatLP";
import rafaelAvatar from "@/assets/rafael-especialista-credito.jpg";

// ============================================================
// CARTA DE CRÉDITO BANCÁRIA CORPORATIVA (PJ)
// ⚠️ Produto de CRÉDITO BANCÁRIO — empréstimo com juros, IOF,
// garantias e liberação rápida via bancos e fintechs autorizadas
// pelo Banco Central. NÃO é consórcio (sem sorteio, sem lance,
// sem cota, sem contemplação). Consórcio tem página própria.
// ============================================================

const script: ScriptStep[] = [
  {
    id: "b1",
    type: "bot",
    text: "Olá! 👋 Sou o Rafael, especialista sênior em Crédito Bancário Corporativo da AtentAI (mais de 12 anos estruturando operações de crédito PJ).",
  },
  {
    id: "b2",
    type: "bot",
    text: "Importante já deixar claro: aqui é CRÉDITO BANCÁRIO PJ (empréstimo com juros, IOF e garantias, liberado por bancos e fintechs reguladas pelo BACEN — Itaú, Bradesco, Santander, Sicoob, BV, Sofisa, BTG, Omie Cash, entre outros). É diferente de consórcio (para consórcio, temos página separada).",
    delay: 900,
  },
  {
    id: "b3",
    type: "bot",
    text: "Consigo taxas a partir de CDI + 0,49% a.m. (aprox. 1,55% a.m. hoje) — bem abaixo do capital de giro de balcão. Posso te fazer algumas perguntas rápidas para desenhar sua proposta?",
    delay: 800,
  },

  // OBJETIVO
  {
    id: "q_objetivo",
    type: "chips",
    field: "objetivo",
    chips: [
      { label: "💰 Capital de giro", value: "capital_giro" },
      { label: "🏢 Aquisição de imóvel comercial", value: "imovel_comercial" },
      { label: "🚛 Compra de frota / veículos", value: "frota" },
      { label: "⚙️ Máquinas / equipamentos (Finame)", value: "maquinario" },
      { label: "🏗️ Obra / expansão", value: "construcao" },
      { label: "📦 Antecipação de recebíveis", value: "antecipacao" },
      { label: "🔄 Refinanciamento / troca de dívida", value: "refin" },
    ],
  },
  {
    id: "b_obj_reply",
    type: "bot",
    text: (a) =>
      a.objetivo === "capital_giro"
        ? "Capital de giro PJ com garantia de recebíveis: consigo CDI + 0,49% a 1,20% a.m. dependendo do rating. Sem carência ou com até 6 meses de carência."
        : a.objetivo === "imovel_comercial"
          ? "Crédito imobiliário PJ com o imóvel em garantia (alienação fiduciária): taxas de IPCA + 8,5% a 11% a.a., prazo até 20 anos, LTV até 60%."
          : a.objetivo === "frota"
            ? "CDC/Leasing PJ para frota: taxas de 1,30% a 1,75% a.m., prazo até 60 meses, com o próprio veículo em garantia (sem imobilizar caixa)."
            : a.objetivo === "maquinario"
              ? "Finame BNDES para máquinas nacionais: TLP + 2,5% a 4,5% a.a., prazo até 120 meses, carência de até 24 meses. Muito abaixo de qualquer outro crédito."
              : a.objetivo === "antecipacao"
                ? "Antecipação de recebíveis (duplicatas/cartão): taxas de 1,20% a 2,10% a.m., liberação em D+1. Sem endividamento no balanço."
                : a.objetivo === "refin"
                  ? "Refinanciamento (Home Equity PJ) com imóvel dado em garantia: IPCA + 9% a 12% a.a., prazo até 20 anos — ideal para trocar dívida cara por dívida barata."
                  : "Perfeito. Vou calibrar a linha ideal e a garantia mais leve para você.",
  },

  // VALOR
  { id: "q_credito", type: "input", field: "credito", kind: "currency", placeholder: "Ex.: R$ 500.000" },
  {
    id: "b_credito_reply",
    type: "bot",
    text: (a) => `Anotado: crédito-alvo de ${a.credito}. Vou casar com as linhas que atendem esse ticket.`,
  },

  // PRAZO
  {
    id: "q_prazo",
    type: "chips",
    field: "prazo",
    chips: [
      { label: "Até 12 meses (curto prazo)", value: "12" },
      { label: "Até 24 meses", value: "24" },
      { label: "Até 36 meses", value: "36" },
      { label: "Até 60 meses (Finame/CDC)", value: "60" },
      { label: "Até 120 meses (Finame longo)", value: "120" },
      { label: "Até 240 meses (imobiliário PJ)", value: "240" },
    ],
  },

  // GARANTIA
  {
    id: "b_garantia",
    type: "bot",
    text: "Uma pergunta que define a taxa 📊 — qual garantia você pode oferecer? Quanto melhor a garantia, mais barata fica.",
  },
  {
    id: "q_garantia",
    type: "chips",
    field: "garantia",
    chips: [
      { label: "🏠 Imóvel (alienação fiduciária)", value: "imovel" },
      { label: "🚗 Veículo/máquina (o próprio bem)", value: "bem_financiado" },
      { label: "📄 Recebíveis (duplicatas/cartão)", value: "recebiveis" },
      { label: "🤝 Aval dos sócios apenas", value: "aval" },
      { label: "❓ Não sei / quero recomendação", value: "indefinido" },
    ],
  },

  // URGÊNCIA
  {
    id: "q_urgencia",
    type: "chips",
    field: "urgencia",
    chips: [
      { label: "🔥 Preciso liberar em até 15 dias", value: "asap" },
      { label: "📆 Até 30 dias", value: "30d" },
      { label: "🗓️ Até 90 dias", value: "90d" },
      { label: "🔍 Apenas pesquisando", value: "pesquisa" },
    ],
  },
  {
    id: "b_urg_reply",
    type: "bot",
    text: (a) =>
      a.urgencia === "asap"
        ? "Para 15 dias vou priorizar linhas com aprovação rápida (antecipação de recebíveis, capital de giro com garantia de duplicatas). Liberação em D+1 a D+7."
        : "Ótimo. Com esse prazo consigo cotar também linhas mais baratas (Finame, imobiliário PJ) que exigem análise de crédito mais completa.",
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

  // SCORE
  {
    id: "b_score",
    type: "bot",
    text: "Qual o score da empresa no Serasa/Boa Vista/Quod PJ? Isso define quais bancos consigo ativar e a faixa de taxa.",
  },
  {
    id: "q_score",
    type: "chips",
    field: "score_empresa",
    chips: [
      { label: "🟢 Alto (700+) — melhores taxas", value: "alto" },
      { label: "🟡 Médio (500–699)", value: "medio" },
      { label: "🟠 Baixo (300–499)", value: "baixo" },
      { label: "🔴 Restrição / negativado", value: "restricao" },
      { label: "❓ Não sei — consulto grátis", value: "desconhecido" },
    ],
  },
  {
    id: "b_score_reply",
    type: "bot",
    text: (a) =>
      a.score_empresa === "alto"
        ? "Excelente. Com score alto acesso mesas de crédito de Itaú, Bradesco, BTG e Santander — as taxas mais baixas do mercado."
        : a.score_empresa === "restricao"
          ? "Sem drama — trabalho com fintechs (BV, Sofisa, Omie, Creditas) e linhas com garantia real que aprovam mesmo com restrição."
          : "Anotado. Vou cruzar com as instituições que melhor atendem esse rating.",
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
    id: "b_contato",
    type: "bot",
    text: "Perfeito. Agora preciso dos seus dados para o especialista enviar a proposta bancária personalizada em até 24h úteis. 🔒 LGPD: usados só para essa proposta, zero spam.",
  },
  {
    id: "q_name",
    type: "input",
    field: "full_name",
    kind: "text",
    placeholder: "Seu nome completo",
    validate: (v) => (v.trim().split(/\s+/).length < 2 ? "Informe nome e sobrenome" : null),
  },
  { id: "q_empresa", type: "input", field: "empresa", kind: "text", placeholder: "Razão Social da empresa" },
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
    id: "b_fechamento",
    type: "bot",
    text: (a) =>
      `Fechando: ${a.full_name?.split(" ")[0]}, vou preparar sua proposta de crédito bancário PJ de ${a.credito} em até ${a.prazo} meses para ${a.empresa || "sua empresa"}. Retorno pelo WhatsApp ${a.phone} em até 24h úteis. Só falta seu OK abaixo. 👇`,
  },
  { id: "submit", type: "submit", label: "Receber minha proposta bancária agora" },
];

export const cartaCreditoEmpresasConfig: ChatLPConfig = {
  brand: "AtentAI Crédito PJ",
  agentName: "Rafael",
  agentRole: "Especialista Crédito Bancário PJ",
  agentInitials: "RA",
  agentAvatarUrl: rafaelAvatar,
  title: "Crédito Bancário PJ | Capital de Giro, Finame e Home Equity | AtentAI",
  metaDescription:
    "Crédito bancário corporativo com juros a partir de CDI + 0,49% a.m.: capital de giro, Finame, home equity PJ e antecipação de recebíveis. Diferente de consórcio — aqui é empréstimo bancário com liberação em até 15 dias.",
  cartaType: "Crédito Bancário PJ",
  source: "chat_credito_bancario_pj",
  whatsapp: "5511985214895",
  brandGradient: "from-emerald-500 to-teal-500",
  script,
};
