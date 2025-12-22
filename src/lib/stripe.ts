// Stripe plan configuration
export const STRIPE_PLANS = {
  simulator: {
    name: 'Simulador de Impacto Tributário',
    priceId: 'price_1Sh0hO3MU3lG84Gw6TYhkT4W',
    productId: 'prod_TeJKjnfkaw0JfV',
    price: 5600, // cents (R$56,00)
    description: 'Simule o impacto da reforma tributária na sua empresa',
    features: [
      'Simulador completo',
      'Comparativo antes/depois',
      'Relatório detalhado',
      'Exportação PDF',
    ],
  },
  premium: {
    name: 'Atente Aí Premium',
    priceId: 'price_1Sh0hm3MU3lG84GwZQFVJ2sU',
    productId: 'prod_TeJKUfneeyp779',
    price: 5600, // cents (R$56,00)
    description: 'Assistente de IA especializado em legislação tributária',
    features: [
      'Perguntas ilimitadas',
      'Respostas detalhadas',
      'Base atualizada 2024',
      'Suporte prioritário',
    ],
    popular: true,
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
