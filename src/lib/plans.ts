/**
 * PLANS CONFIGURATION - Dual Plan System (Mercado Pago)
 * 
 * PLATFORM SUBSCRIPTION PLANS:
 * - Simulador: R$ 39,99/mês - Acesso ao simulador tributário
 * - Autônomo: R$ 65,00/mês - Para profissionais autônomos
 * - Premium: R$ 98,00/mês - Recursos completos
 * - Contador: R$ 198,99/mês - Para contadores
 * 
 * BI PLANS (Atentai - Used only in /bi-contabilidade):
 * - Atentai Clarity: R$ 1.497/mês
 * - Atentai Control: R$ 3.497/mês
 * - Atentai Performance: R$ 8.000+/mês
 * 
 * MARKETPLACE SERVICES (One-Time Payments):
 * - Limpa Nome PF: R$ 824,50 (PROMOÇÃO)
 * - Limpa Nome PJ: R$ 1.280,00 (PROMOÇÃO)
 * - Certidões: R$ 80,00
  * - IR Simples: R$ 89,00
  * - IR Completo: R$ 189,00
 * - Abertura de Empresa: R$ 780,00
 * - Análise Fiscal: GRÁTIS (Success Fee 50%)
 * - BI+ Contabilidade: SOB CONSULTA
 */

// ============================================================
// PLATFORM PLANS - Used across the entire platform
// ============================================================
export const PLANS = {
  simulator: {
    name: 'Simulador Tributário',
    price: 3999, // cents (R$ 39,99)
    description: 'Acesso completo ao simulador tributário',
    tagline: 'Essencial',
    features: [
      'Simulador tributário completo',
      'Comparação de regimes',
      'Exportação em PDF',
      '5 perguntas à IA por dia',
    ],
    tier: 1,
    color: 'from-blue-500 to-cyan-500',
  },
  autonomo: {
    name: 'Plano Autônomo',
    price: 6500, // cents (R$ 65,00)
    description: 'Para profissionais autônomos',
    tagline: 'Popular',
    features: [
      'Tudo do Simulador +',
      'Dashboard financeiro',
      'Metas financeiras',
      '10 perguntas à IA por dia',
      'Comparador PF vs PJ',
    ],
    tier: 2,
    color: 'from-green-500 to-emerald-500',
    popular: true,
  },
  premium: {
    name: 'AtentAI Premium',
    price: 9800, // cents (R$ 98,00)
    description: 'Recursos completos para empresas',
    tagline: 'Completo',
    features: [
      'Tudo do Autônomo +',
      'IA ilimitada',
      'Simulador de locação',
      'Exportação Excel',
      'Suporte prioritário',
    ],
    tier: 3,
    color: 'from-primary to-primary/70',
  },
  contador: {
    name: 'Contador Premium Plus',
    price: 19899, // cents (R$ 198,99)
    description: 'Para contadores e escritórios',
    tagline: 'Profissional',
    features: [
      'Tudo do Premium +',
      'Painel de clientes',
      'Consultorias mensais',
      'API de integração',
      'White label',
    ],
    tier: 4,
    color: 'from-accent to-orange-500',
    highlight: true,
  },
} as const;

/** @deprecated Use PLANS instead */
export const STRIPE_PLANS = PLANS;

export type PlanType = keyof typeof PLANS;

// ============================================================
// BI PLANS - Used ONLY in /bi-contabilidade module
// ============================================================
export const BI_PLANS = {
  clarity: {
    name: 'Atentai Clarity',
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
    price: 800000, // cents (R$ 8.000,00) - base price, actual is "sob consulta"
    description: 'Performance, crescimento e estratégia empresarial',
    tagline: 'Premium',
    customPricing: true,
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

export type BIPlanType = keyof typeof BI_PLANS;

// ============================================================
// AI LIMITS - Based on platform plans
// ============================================================
export const AI_LIMITS = {
  simulator: {
    dailyQuestions: 5,
    mode: 'basic',
  },
  autonomo: {
    dailyQuestions: 10,
    mode: 'educational',
  },
  premium: {
    dailyQuestions: 50,
    mode: 'analytical',
  },
  contador: {
    dailyQuestions: Infinity,
    mode: 'strategic',
  },
} as const;

// BI-specific AI limits
export const BI_AI_LIMITS = {
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

// Legacy constants for backwards compatibility
export const DAILY_QUESTION_LIMIT = 5;
export const PREMIUM_DAILY_LIMIT = 50;
export const CONTADOR_DAILY_LIMIT = Infinity;

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
    basePrice: 8900, // cents (R$89,00)
    discount: 0,
    discountedPrice: 8900,
    icon: 'FileText',
  },
  ir_completo: {
    name: 'Declaração IR Completo',
    description: 'Para autônomos e investidores',
    basePrice: 18900, // cents (R$189,00)
    discount: 0,
    discountedPrice: 18900,
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
    basePrice: 82450, // cents (R$824,50) PROMOÇÃO
    originalPrice: 123800, // cents (R$1.238,00) preço original
    discount: 0,
    discountedPrice: 82450,
    icon: 'User',
    installments: 4,
  },
  credit_repair_pj: {
    name: 'Limpa Nome Empresa (CNPJ)',
    description: 'Regularize seu CNPJ e limpe restrições',
    basePrice: 128000, // cents (R$1.280,00) PROMOÇÃO
    originalPrice: 156800, // cents (R$1.568,00) preço original
    discount: 0,
    discountedPrice: 128000,
    icon: 'Building2',
    installments: 4,
  },
} as const;

// Platform commission on marketplace services
export const PLATFORM_COMMISSION = 0.15; // 15%

export type ServiceType = keyof typeof SUBSCRIBER_DISCOUNTS;

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

/** @deprecated Stripe removed - these functions are no-ops */
export function getPlanByPriceId(_priceId: string): PlanType | null {
  return null;
}

/** @deprecated Stripe removed */
export function getPlanByProductId(_productId: string): PlanType | null {
  return null;
}

/** @deprecated Stripe removed */
export function getBIPlanByPriceId(_priceId: string): BIPlanType | null {
  return null;
}

/** @deprecated Stripe removed */
export function getBIPlanByProductId(_productId: string): BIPlanType | null {
  return null;
}

// Check if user's plan tier is sufficient for a feature
export function hasPlanTier(currentPlan: PlanType | null, requiredPlan: PlanType): boolean {
  if (!currentPlan) return false;
  return PLANS[currentPlan].tier >= PLANS[requiredPlan].tier;
}

// Check if user's BI plan tier is sufficient
export function hasBIPlanTier(currentPlan: BIPlanType | null, requiredPlan: BIPlanType): boolean {
  if (!currentPlan) return false;
  return BI_PLANS[currentPlan].tier >= BI_PLANS[requiredPlan].tier;
}
