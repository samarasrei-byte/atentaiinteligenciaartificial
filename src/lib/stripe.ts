// Stripe plan configuration
export const STRIPE_PLANS = {
  simulator: {
    name: 'Simulador Tributário',
    priceId: 'price_1Sh0hO3MU3lG84Gw6TYhkT4W',
    productId: 'prod_TeJKjnfkaw0JfV',
    price: 5600, // cents (R$56,00)
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
    description: 'Assistente de IA especializado em legislação tributária',
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
      '5 consultas/mês com contador especializado',
      'Agendamento prioritário',
      'Análise tributária personalizada',
      'Piloto Automático com alertas',
      'Suporte prioritário 24h',
      'Acesso ao glossário completo',
      'Edição de dados da empresa',
    ],
    monthlyConsultations: 5,
    installments: 10, // 10x de R$19,89
    highlight: true,
  },
} as const;

export type PlanType = keyof typeof STRIPE_PLANS;

// Daily question limit for non-premium users
export const DAILY_QUESTION_LIMIT = 5;

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
