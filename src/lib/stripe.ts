/**
 * STRIPE CONFIGURATION - Atentai Commercial Model
 * 
 * OFFICIAL SUBSCRIPTION PLANS (Updated 2026-02-04):
 * - Atentai Clarity: R$ 1.497/mês - BI de entrada com clareza financeira
 * - Atentai Control: R$ 3.497/mês - BI com controle, previsão e alertas
 * - Atentai Performance: R$ 8.000+/mês - BI estratégico com integração ERP/CRM
 * 
 * MARKETPLACE SERVICES (One-Time Payments):
 * - Limpa Nome PF: R$ 780,00 (FIXED)
 * - Limpa Nome PJ: R$ 970,00 (FIXED)
 * - Certidões: R$ 80,00 (FIXED)
 * - IR Simples (CLT): R$ 200,00 (FIXED)
 * - IR Completo: R$ 420,00 (FIXED)
 * - Abertura de Empresa: R$ 780,00 (FIXED)
 * - Análise Fiscal: GRÁTIS (Success Fee 50%)
 * - BI+ Contabilidade: SOB CONSULTA
 */

// Stripe plan configuration - Atentai Commercial Model
export const STRIPE_PLANS = {
  clarity: {
    name: 'Atentai Clarity',
    priceId: 'price_1Sx9Le3MU3lG84GwAqYap5Vo',
    productId: 'prod_TuzKrFXULbKyM1',
    price: 149700, // cents (R$ 1.497,00)
    description: 'Clareza financeira e entendimento dos números',
    tagline: 'Entrada',
    features: [
      'BI padrão com DRE gerencial',
      'Resultado, margem e despesas',
      'IA explicativa e educativa',
      'Linguagem clara e acessível',
      'Supervisão humana obrigatória',
      'Relatórios mensais em PDF',
    ],
    tier: 1,
    color: 'from-blue-500 to-cyan-500',
  },
  control: {
    name: 'Atentai Control',
    priceId: 'price_1Sx9MB3MU3lG84GwUugVLZuM',
    productId: 'prod_TuzKy78iDO1HUZ',
    price: 349700, // cents (R$ 3.497,00)
    description: 'Controle, previsão e suporte à decisão',
    tagline: 'Principal',
    features: [
      'Tudo do Clarity +',
      'Real x Orçado e forecast',
      'Indicadores personalizados',
      'Alertas inteligentes',
      'Simulações de cenários',
      'IA analítica e orientada à ação',
      'Apoio a decisões táticas',
    ],
    tier: 2,
    color: 'from-primary to-primary/70',
    popular: true,
  },
  performance: {
    name: 'Atentai Performance',
    priceId: 'price_1Sx9N93MU3lG84Gw5CBdQAK5',
    productId: 'prod_TuzL0T7u9Oqeuj',
    price: 800000, // cents (R$ 8.000,00) - base price, actual is "sob consulta"
    description: 'Performance, crescimento e estratégia empresarial',
    tagline: 'Premium',
    customPricing: true, // Indicates "sob consulta"
    features: [
      'Tudo do Control +',
      'P&L por área, produto ou unidade',
      'IA como apoio estratégico sênior',
      'Recomendações financeiras e comerciais',
      'Integração ERP e CRM',
      'Planejamento financeiro completo',
      'Linguagem executiva e estratégica',
      'Validação humana em todas as recomendações',
    ],
    tier: 3,
    color: 'from-accent to-orange-500',
    highlight: true,
  },
} as const;

// Legacy plan mapping (for backwards compatibility during migration)
export const LEGACY_PLAN_MAPPING: Record<string, keyof typeof STRIPE_PLANS> = {
  'simulator': 'clarity',
  'autonomo': 'clarity',
  'premium': 'control',
  'contador': 'performance',
};

export type PlanType = keyof typeof STRIPE_PLANS;

// Legacy types for backwards compatibility
export type LegacyPlanType = 'simulator' | 'autonomo' | 'premium' | 'contador';

/**
 * Service pricing - FIXED prices (no subscriber discounts)
 * All services use these exact prices for Stripe checkout
 */
export const SUBSCRIBER_DISCOUNTS = {
  company_opening: {
    name: 'Abertura de Empresa',
    description: 'Abertura completa de CNPJ com suporte especializado',
    basePrice: 78000, // cents (R$780,00)
    discount: 0,
    discountedPrice: 78000,
    icon: 'Building2',
  },
  certificate: {
    name: 'Emissão de Certidão',
    description: 'Certidões negativas de débitos fiscais',
    basePrice: 8000, // cents (R$80,00) FIXED
    discount: 0,
    discountedPrice: 8000,
    icon: 'FileCheck',
  },
  ir_simples: {
    name: 'Declaração IR Simples',
    description: 'Para CLT sem investimentos',
    basePrice: 20000, // cents (R$200,00) FIXED
    discount: 0,
    discountedPrice: 20000,
    icon: 'FileText',
  },
  ir_completo: {
    name: 'Declaração IR Completo',
    description: 'Para autônomos e investidores',
    basePrice: 42000, // cents (R$420,00) FIXED
    discount: 0,
    discountedPrice: 42000,
    icon: 'FileSpreadsheet',
  },
  fiscal_analysis: {
    name: 'Análise Fiscal',
    description: 'Análise 100% gratuita com pagamento apenas no êxito (50%)',
    basePrice: 0,
    discount: 0.50,
    discountedPrice: 0,
    icon: 'BarChart',
    successFee: true,
  },
  credit_repair_pf: {
    name: 'Limpa Nome Pessoa Física',
    description: 'Regularize seu CPF e limpe restrições',
    basePrice: 78000, // cents (R$780,00) FIXED
    discount: 0,
    discountedPrice: 78000,
    icon: 'User',
    installments: 4,
  },
  credit_repair_pj: {
    name: 'Limpa Nome Empresa (CNPJ)',
    description: 'Regularize seu CNPJ e limpe restrições',
    basePrice: 97000, // cents (R$970,00) FIXED
    discount: 0,
    discountedPrice: 97000,
    icon: 'Building2',
    installments: 4,
  },
  bi_contabilidade: {
    name: 'BI+ Inteligência Fiscal™',
    description: 'Inteligência artificial com análise humana especializada',
    basePrice: 0,
    discount: 0,
    discountedPrice: 0,
    icon: 'Brain',
    customPricing: true,
  },
} as const;

// Platform commission on marketplace services
export const PLATFORM_COMMISSION = 0.15; // 15%

export type ServiceType = keyof typeof SUBSCRIBER_DISCOUNTS;

// AI access by tier
export const AI_LIMITS = {
  clarity: {
    dailyQuestions: 10,
    mode: 'educational', // Explicativa e educativa
  },
  control: {
    dailyQuestions: 50,
    mode: 'analytical', // Analítica e orientada à ação
  },
  performance: {
    dailyQuestions: Infinity,
    mode: 'strategic', // Executiva e estratégica
  },
} as const;

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

// Calculate price for a service based on subscription status
export function getServicePrice(service: ServiceType, isSubscriber: boolean): number {
  const serviceConfig = SUBSCRIBER_DISCOUNTS[service];
  return isSubscriber ? serviceConfig.discountedPrice : serviceConfig.basePrice;
}

// Calculate platform commission for a service
export function getPlatformCommission(amount: number): number {
  return Math.round(amount * PLATFORM_COMMISSION);
}

// Calculate contador earnings after platform commission
export function getContadorEarnings(amount: number): number {
  return amount - getPlatformCommission(amount);
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

// Check if user's plan tier is sufficient for a feature
export function hasPlanTier(currentPlan: PlanType | null, requiredPlan: PlanType): boolean {
  if (!currentPlan) return false;
  return STRIPE_PLANS[currentPlan].tier >= STRIPE_PLANS[requiredPlan].tier;
}
