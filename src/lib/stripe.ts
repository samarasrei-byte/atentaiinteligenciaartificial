/**
 * STRIPE CONFIGURATION - Pricing & Plans
 * 
 * OFFICIAL PRICE TABLE (Updated 2025-01-25):
 * - Consulta com Contador: R$ 150,00 (20% off for subscribers)
 * - Abertura de Empresa: R$ 780,00 (15% off for subscribers)
 * - Análise Fiscal: GRÁTIS (Success Fee 50%)
 * - Emissão de Certidões: R$ 80,00 (10% off for subscribers)
 * - IR Simples: R$ 200,00 (20% off for subscribers)
 * - IR Completo: R$ 420,00 (20% off for subscribers)
 * - Limpa Nome PF: R$ 780,00 (10% off for subscribers)
 * - Limpa Nome CNPJ: R$ 970,00 (10% off for subscribers)
 */

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
    name: 'Business Pro',
    priceId: 'price_1ShOGL3MU3lG84Gw1iPrqUkt',
    productId: 'prod_Tehfc8IkhNyBJ7',
    price: 19899, // cents (R$198,99)
    description: 'Plano completo para empresários que querem maximizar economia tributária',
    features: [
      'Tudo do AtentAI Premium',
      'Piloto Automático Tributário completo',
      'Simulador de Transição 2026-2033',
      '20% de desconto em consultas',
      '15% de desconto em abertura de empresa',
      '10% de desconto em certidões',
      'Análise tributária personalizada',
      'Relatórios PDF e Excel ilimitados',
      'Comparador de Regimes avançado',
      'Edição de dados da empresa',
    ],
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

// Subscriber discounts for marketplace services
export const SUBSCRIBER_DISCOUNTS = {
  consultation: {
    name: 'Consulta com Contador',
    description: 'Tire dúvidas tributárias com um contador especializado',
    basePrice: 15000, // cents (R$150,00)
    discount: 0.20, // 20% off for subscribers
    discountedPrice: 12000, // cents (R$120,00)
    icon: 'MessageSquare',
  },
  company_opening: {
    name: 'Abertura de Empresa',
    description: 'Abertura completa de CNPJ com suporte contábil',
    basePrice: 78000, // cents (R$780,00)
    discount: 0.15, // 15% off for subscribers
    discountedPrice: 66300, // cents (R$663,00)
    icon: 'Building2',
  },
  certificate: {
    name: 'Emissão de Certidão',
    description: 'Certidões negativas de débitos fiscais',
    basePrice: 8000, // cents (R$80,00)
    discount: 0.10, // 10% off for subscribers
    discountedPrice: 7200, // cents (R$72,00)
    icon: 'FileCheck',
  },
  ir_simples: {
    name: 'Declaração IR Simples',
    description: 'Para CLT com poucos rendimentos e sem investimentos',
    basePrice: 20000, // cents (R$200,00)
    discount: 0.20, // 20% off for subscribers
    discountedPrice: 16000, // cents (R$160,00)
    icon: 'FileText',
  },
  ir_completo: {
    name: 'Declaração IR Completo',
    description: 'Para autônomos, investidores ou múltiplas fontes de renda',
    basePrice: 42000, // cents (R$420,00)
    discount: 0.20, // 20% off for subscribers
    discountedPrice: 33600, // cents (R$336,00)
    icon: 'FileSpreadsheet',
  },
  fiscal_analysis: {
    name: 'Análise Fiscal',
    description: 'Análise 100% gratuita com pagamento apenas no êxito (50% do valor identificado)',
    basePrice: 0, // Free analysis - success fee only
    discount: 0.50, // 50% of identified value
    discountedPrice: 0, // Free analysis
    icon: 'BarChart',
    successFee: true, // Special flag for success fee model
  },
  business_consulting: {
    name: 'Consultoria Empresarial',
    description: 'Consultoria estratégica para planejamento tributário e otimização fiscal da sua empresa',
    basePrice: 45000, // cents (R$450,00)
    discount: 0.20, // 20% off for subscribers
    discountedPrice: 36000, // cents (R$360,00)
    icon: 'Briefcase',
  },
  credit_repair_pf: {
    name: 'Limpa Nome Pessoa Física',
    description: 'Regularize seu CPF e limpe restrições com consultoria especializada',
    basePrice: 78000, // cents (R$780,00)
    discount: 0.10, // 10% off for subscribers
    discountedPrice: 70200, // cents (R$702,00)
    icon: 'User',
    installments: 4, // 4x de R$195 sem juros
  },
  credit_repair_pj: {
    name: 'Limpa Nome Empresa (CNPJ)',
    description: 'Regularize seu CNPJ e limpe restrições com consultoria especializada',
    basePrice: 97000, // cents (R$970,00)
    discount: 0.10, // 10% off for subscribers
    discountedPrice: 87300, // cents (R$873,00)
    icon: 'Building2',
    installments: 4, // 4x de R$242,50 sem juros
  },
} as const;

// Platform commission on marketplace services
export const PLATFORM_COMMISSION = 0.15; // 15%

export type ServiceType = keyof typeof SUBSCRIBER_DISCOUNTS;

// Daily question limits by tier - NO FREE ACCESS
export const DAILY_QUESTION_LIMIT = 0; // Users without subscription cannot use AI
export const PREMIUM_DAILY_LIMIT = 50; // Premium users
export const CONTADOR_DAILY_LIMIT = Infinity; // Contador users (unlimited)

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
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
