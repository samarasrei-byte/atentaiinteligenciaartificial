// Stripe plan configuration
export const STRIPE_PLANS = {
  simulator: {
    name: 'Simulador Tributário',
    priceId: 'price_1SheKg3MU3lG84GwQwYaxFfN',
    productId: 'prod_TeyH8gtLUj9Llu',
    price: 3900, // cents (R$39,00)
    description: 'Simule o impacto da reforma tributária na sua empresa',
    features: [
      'Simulador de impacto tributário',
      'Comparativo antes/depois',
      'Relatório detalhado em PDF',
      'Timeline da transição 2026-2033',
    ],
  },
  premium: {
    name: 'AtentAI Premium',
    priceId: 'price_1ShK943MU3lG84Gwd4u3Z0Za',
    productId: 'prod_TedPv32txqdcXM',
    price: 9800, // cents (R$98,00)
    description: 'Todas as respostas que você precisa sobre a Reforma Tributária',
    features: [
      'Agente de IA ilimitado',
      'Simulador tributário completo',
      'Comparador de regimes fiscais',
      'Calculadora PF vs PJ',
      'Glossário tributário completo',
      'Relatórios PDF e Excel',
      'Piloto Automático Tributário',
    ],
    popular: true,
  },
  contador: {
    name: 'Contador Premium Plus',
    priceId: 'price_1ShOGL3MU3lG84Gw1iPrqUkt',
    productId: 'prod_Tehfc8IkhNyBJ7',
    price: 19899, // cents (R$198,99)
    description: 'Acesso completo com contador especializado e todas as ferramentas',
    features: [
      'Tudo do AtentAI Premium',
      'Chat ilimitado com contador',
      '2 consultas/mês com contador especializado',
      'Agendamento prioritário',
      'Análise tributária personalizada',
      'Piloto Automático com alertas',
      'Suporte prioritário 24h',
      'Acesso ao glossário completo',
      'Edição de dados da empresa',
    ],
    monthlyConsultations: 2,
    highlight: true,
  },
  autonomo: {
    name: 'Autônomo Master',
    priceId: 'price_1Shc3X3MU3lG84Gw1OR6C7yf',
    productId: 'prod_Tevvj1l2m0hSOP',
    price: 6500, // cents (R$65,00)
    description: 'Painel completo para profissionais autônomos',
    features: [
      'Simulador PF vs PJ completo',
      'Agente de IA especializado',
      'Comparador MEI/ME/LP',
      'Calculadora de INSS/IR',
      'Histórico de simulações',
      'Conexão com contadores',
      'Relatórios PDF profissionais',
      'Suporte dedicado',
    ],
  },
} as const;

export type PlanType = keyof typeof STRIPE_PLANS;

// Daily question limits by tier
export const DAILY_QUESTION_LIMIT = 10; // Free/basic users
export const PREMIUM_DAILY_LIMIT = 50; // Premium users
export const CONTADOR_DAILY_LIMIT = Infinity; // Contador users (unlimited)

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export function getPlanByPriceId(priceId: string): PlanType | null {
  for (const [key, plan] of Object.entries(STRIPE_PLANS)) {
    if (plan.priceId === priceId) {
      return key as PlanType;
    }
  }
  return null;
}

export function getPlanByProductId(productId: string): PlanType | null {
  for (const [key, plan] of Object.entries(STRIPE_PLANS)) {
    if (plan.productId === productId) {
      return key as PlanType;
    }
  }
  return null;
}
