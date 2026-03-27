/**
 * CENTRALIZED PRICING - Single Source of Truth
 * All service prices across the platform MUST use these constants.
 * DO NOT hardcode prices anywhere else in the codebase.
 * 
 * Prices are in cents (BRL) for Stripe compatibility.
 * 
 * OFFICIAL PRICE TABLE (Updated 2026-02-11):
 * - Limpa Nome PF: De R$ 1.238,00 por R$ 824,50 (PROMOÇÃO)
 * - Limpa Nome PJ: De R$ 1.568,00 por R$ 1.280,00 (PROMOÇÃO)
 * - Certidões: R$ 80,00
 * - IR Simples (CLT): R$ 89,00
 * - IR Completo: R$ 189,00
 * - Abertura de Empresa: R$ 780,00
 * - Análise Fiscal: GRÁTIS (Success Fee 50%)
 * 
 * REMOVED: Consultoria Empresarial, Consulta com Contador
 */

export const SERVICE_PRICES = {
  // Limpa Nome Services - FIXED
  LIMPA_NOME_PF: {
    cents: 82450,
    formatted: 'R$ 824,50',
    originalCents: 123800, // R$ 1.238,00 (preço original)
    originalFormatted: 'R$ 1.238,00',
    installments: 4,
    installmentValue: 'R$ 206,13',
    serviceKey: 'credit_repair_pf',
    subscriberDiscount: 0,
  },
  LIMPA_NOME_CNPJ: {
    cents: 128000,
    formatted: 'R$ 1.280,00',
    originalCents: 156800, // R$ 1.568,00 (preço original)
    originalFormatted: 'R$ 1.568,00',
    installments: 4,
    installmentValue: 'R$ 320,00',
    serviceKey: 'credit_repair_pj',
    subscriberDiscount: 0,
  },

  // IR (Imposto de Renda) Services
  IR_SIMPLES: {
    cents: 8900,
    formatted: 'R$ 89,00',
    serviceKey: 'ir_simples',
    subscriberDiscount: 0,
  },
  IR_COMPLETO: {
    cents: 18900,
    formatted: 'R$ 189,00',
    serviceKey: 'ir_completo',
    subscriberDiscount: 0,
  },

  // Company Opening
  ABERTURA_EMPRESA: {
    cents: 78000,
    formatted: 'R$ 780,00',
    serviceKey: 'abertura_empresa',
    subscriberDiscount: 0,
  },

  // Certificates - FIXED R$ 80,00
  CERTIDAO: {
    cents: 8000,
    formatted: 'R$ 80,00',
    serviceKey: 'certificate',
    subscriberDiscount: 0,
  },

  // Módulo Fiscal (Success Fee - Payment on Success)
  MODULO_FISCAL: {
    type: 'success_fee',
    percentFee: 50,
    minValue: 0,
    description: 'Análise 100% gratuita. Pagamento apenas no êxito (50% do valor recuperado)',
    serviceKey: 'modulo_fiscal',
  },

  // Contador Premium Plus - Subscription
  CONTADOR_PREMIUM: {
    cents: 19899,
    formatted: 'R$ 198,99',
    interval: 'month',
    serviceKey: 'contador_premium',
    subscriberDiscount: 0,
  },

  // Atentai Clarity - BI financeiro
  ATENTAI_CLARITY: {
    cents: 149700,
    formatted: 'R$ 1.497,00',
    serviceKey: 'clarity',
    subscriberDiscount: 0,
  },

  // Atentai Control - Controle financeiro avançado
  ATENTAI_CONTROL: {
    cents: 349700,
    formatted: 'R$ 3.497,00',
    serviceKey: 'control',
    subscriberDiscount: 0,
  },

} as const;

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  SIMULADOR: {
    cents: 3999,
    formatted: 'R$ 39,99',
    interval: 'month',
    serviceKey: 'simulator',
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
    serviceKey: 'premium',
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
    serviceKey: 'contador',
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
    serviceKey: 'autonomo',
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
  LIMPA_NOME_PF: 16490, // 20% of 82450
  LIMPA_NOME_CNPJ: 25600, // 20% of 128000
  IR_SIMPLES: 1780, // 20% of 8900
  IR_COMPLETO: 3780, // 20% of 18900
  ABERTURA_EMPRESA: 15600, // 20% of 78000
} as const;

// Platform Commission (15% on marketplace services)
export const PLATFORM_COMMISSION_PERCENT = 15;

// Helper functions
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
