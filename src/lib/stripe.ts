// Stripe plan configuration
export const STRIPE_PLANS = {
  basic: {
    name: 'Simulador de Impacto Tributário',
    priceId: 'price_1SXl0w3MU3lG84Gw58sMoVfh',
    productId: 'prod_TUkVf10Uq0C1Dv',
    price: 4500, // cents (R$45,00)
    features: [
      'Simulador de Impostos',
      'Chat com IA (5 msgs/dia)',
      'Exportação PDF',
      'Suporte por email',
    ],
  },
  premium: {
    name: 'Acesso Premium',
    priceId: 'price_premium_ai_tributar',
    productId: 'prod_premium_ai_tributar',
    price: 5000, // cents (R$50,00)
    description: 'Desbloqueie todo o potencial da IA Tributar',
    features: [
      'Perguntas ilimitadas',
      'Respostas detalhadas',
      'Base atualizada 2024',
      'Suporte prioritário',
    ],
    popular: true,
  },
  pro: {
    name: 'Pro',
    priceId: 'price_1SXl1H3MU3lG84GwhmJxxv5y',
    productId: 'prod_TUkWyKp9XI3k5A',
    price: 9990, // cents (R$99,90)
    features: [
      'Tudo do Premium',
      'Chat com IA ilimitado',
      'Simulador de Locação',
      'Comparador de Regimes',
      'Timeline 2026-2033',
      'Exportação Excel',
      'Suporte prioritário',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    priceId: 'price_1SXl2N3MU3lG84GwjgjSJvfl',
    productId: 'prod_TUkXlLYZICjl2e',
    price: 19990, // cents
    features: [
      'Tudo do Pro',
      'Consultoria com Contador',
      'Relatórios personalizados',
      'API de integração',
      'Múltiplas empresas',
      'Suporte dedicado',
      'Treinamento incluído',
    ],
  },
} as const;

export type PlanType = keyof typeof STRIPE_PLANS;

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
