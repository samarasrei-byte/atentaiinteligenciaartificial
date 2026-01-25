/**
 * CENTRALIZED PRICING - Single Source of Truth
 * All service prices across the platform MUST use these constants.
 * DO NOT hardcode prices anywhere else in the codebase.
 * 
 * Prices are in cents (BRL) for Stripe compatibility.
 * 
 * OFFICIAL PRICE TABLE (Updated 2025-01-25):
 * - Consulta com Contador: R$ 150,00
 * - Abertura de Empresa: R$ 780,00
 * - Análise Fiscal: GRÁTIS (Success Fee 50%)
 * - Emissão de Certidões: R$ 80,00
 * - IR Simples: R$ 200,00
 * - IR Completo: R$ 420,00
 * - Limpa Nome PF: R$ 780,00
 * - Limpa Nome CNPJ: R$ 970,00
 */

export const SERVICE_PRICES = {
  // Limpa Nome Services
  LIMPA_NOME_PF: {
    cents: 78000,
    formatted: 'R$ 780,00',
    installments: 4,
    installmentValue: 'R$ 195,00',
    stripeKey: 'credit_repair_pf',
    subscriberDiscount: 10,
  },
  LIMPA_NOME_CNPJ: {
    cents: 97000,
    formatted: 'R$ 970,00',
    installments: 4,
    installmentValue: 'R$ 242,50',
    stripeKey: 'credit_repair_pj',
    subscriberDiscount: 10,
  },

  // IR (Imposto de Renda) Services
  IR_SIMPLES: {
    cents: 20000,
    formatted: 'R$ 200,00',
    formattedWithDiscount: 'R$ 160,00',
    stripeKey: 'ir_simples',
    subscriberDiscount: 20,
  },
  IR_COMPLETO: {
    cents: 42000,
    formatted: 'R$ 420,00',
    formattedWithDiscount: 'R$ 336,00',
    stripeKey: 'ir_completo',
    subscriberDiscount: 20,
  },

  // Company Opening
  ABERTURA_EMPRESA: {
    cents: 78000,
    formatted: 'R$ 780,00',
    formattedWithDiscount: 'R$ 663,00',
    stripeKey: 'abertura_empresa',
    subscriberDiscount: 15,
  },

  // Certificates
  CERTIDAO: {
    cents: 8000,
    formatted: 'R$ 80,00',
    formattedWithDiscount: 'R$ 72,00',
    stripeKey: 'certificate',
    subscriberDiscount: 10,
  },

  // Módulo Fiscal (Success Fee - Payment on Success)
  MODULO_FISCAL: {
    type: 'success_fee',
    percentFee: 50,
    minValue: 0,
    description: 'Análise 100% gratuita. Pagamento apenas no êxito (50% do valor recuperado)',
    stripeKey: 'modulo_fiscal',
  },

  // Consultation
  CONSULTA_CONTADOR: {
    cents: 15000,
    formatted: 'R$ 150,00',
    formattedWithDiscount: 'R$ 120,00',
    platformFee: 1500,
    stripeKey: 'consultation',
    subscriberDiscount: 20,
  },

  // Business Consulting
  CONSULTORIA_EMPRESARIAL: {
    cents: 45000,
    formatted: 'R$ 450,00',
    formattedWithDiscount: 'R$ 360,00',
    stripeKey: 'business_consulting',
    subscriberDiscount: 20,
  },
} as const;

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  SIMULADOR: {
    cents: 3900,
    formatted: 'R$ 39,00',
    interval: 'month',
    stripeKey: 'simulator',
    features: [
      'Simulador de impacto tributário',
      'Comparativo antes/depois',
      'Relatório detalhado em PDF',
      'Timeline da transição 2026-2033',
    ],
  },
  PREMIUM: {
    cents: 9800,
    formatted: 'R$ 98,00',
    interval: 'month',
    stripeKey: 'premium',
    features: [
      'Agente de IA ilimitado',
      'Simulador tributário completo',
      'Comparador de regimes fiscais',
      'Calculadora PF vs PJ',
      'Glossário tributário completo',
      'Relatórios PDF e Excel',
      'Piloto Automático Tributário',
    ],
  },
  BUSINESS_PRO: {
    cents: 19899,
    formatted: 'R$ 198,99',
    interval: 'month',
    stripeKey: 'contador',
    features: [
      'Tudo do AtentAI Premium',
      'Piloto Automático Tributário completo',
      'Simulador de Transição 2026-2033',
      '20% de desconto em consultas',
      '15% de desconto em abertura de empresa',
      '10% de desconto em certidões',
      'Análise tributária personalizada',
      'Relatórios PDF e Excel ilimitados',
    ],
  },
  AUTONOMO: {
    cents: 6500,
    formatted: 'R$ 65,00',
    interval: 'month',
    stripeKey: 'autonomo',
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

// Affiliate Commissions (20% default)
export const AFFILIATE_COMMISSIONS = {
  DEFAULT_PERCENT: 20,
  LIMPA_NOME_PF: 15600, // 20% of 78000
  LIMPA_NOME_CNPJ: 19400, // 20% of 97000
  IR_SIMPLES: 4000, // 20% of 20000
  IR_COMPLETO: 8400, // 20% of 42000
  ABERTURA_EMPRESA: 15600, // 20% of 78000
} as const;

// Platform Commission (15% on marketplace services)
export const PLATFORM_COMMISSION_PERCENT = 15;

// Helper functions
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export function getSubscriberPrice(baseCents: number, discountPercent: number): number {
  return Math.round(baseCents * (1 - discountPercent / 100));
}

export function getSubscriberPriceFormatted(baseCents: number, discountPercent: number): string {
  return formatCurrency(getSubscriberPrice(baseCents, discountPercent));
}

export function calculatePartnerCommission(totalCents: number): {
  platformFee: number;
  partnerReceives: number;
} {
  const platformFee = Math.round(totalCents * (PLATFORM_COMMISSION_PERCENT / 100));
  return {
    platformFee,
    partnerReceives: totalCents - platformFee,
  };
}
