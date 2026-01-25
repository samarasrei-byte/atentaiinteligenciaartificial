/**
 * CENTRALIZED PRICING - Single Source of Truth
 * All service prices across the platform MUST use these constants.
 * DO NOT hardcode prices anywhere else in the codebase.
 * 
 * Prices are in cents (BRL) for Stripe compatibility.
 */

export const SERVICE_PRICES = {
  // Limpa Nome Services
  LIMPA_NOME_PF: {
    cents: 68000,
    formatted: 'R$ 680,00',
    installments: 4,
    installmentValue: 'R$ 170,00',
    stripeKey: 'credit_repair_pf',
    subscriberDiscount: 10,
  },
  LIMPA_NOME_CNPJ: {
    cents: 89000,
    formatted: 'R$ 890,00',
    installments: 4,
    installmentValue: 'R$ 222,50',
    stripeKey: 'credit_repair_pj',
    subscriberDiscount: 10,
  },

  // IR (Imposto de Renda) Services
  IR_SIMPLES: {
    cents: 15000,
    formatted: 'R$ 150,00',
    stripeKey: 'ir_simples',
    subscriberDiscount: 10,
  },
  IR_COMPLETO: {
    cents: 35000,
    formatted: 'R$ 350,00',
    stripeKey: 'ir_completo',
    subscriberDiscount: 10,
  },

  // Company Opening
  ABERTURA_EMPRESA: {
    cents: 50000,
    formatted: 'R$ 500,00',
    stripeKey: 'abertura_empresa',
    subscriberDiscount: 10,
  },

  // Certificates
  CERTIDAO: {
    cents: 8000,
    formatted: 'R$ 80,00',
    stripeKey: 'certificate',
    subscriberDiscount: 0,
  },

  // Módulo Fiscal (Success Fee - Payment on Success)
  MODULO_FISCAL: {
    type: 'success_fee',
    percentFee: 20,
    minValue: 50000, // R$ 500 minimum
    description: 'Pagamento no êxito - 20% do valor recuperado',
    stripeKey: 'modulo_fiscal',
  },

  // Consultation
  CONSULTA_CONTADOR: {
    cents: 15000,
    formatted: 'R$ 150,00',
    platformFee: 1500, // 10% platform fee
    stripeKey: 'consultation',
  },
} as const;

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  SIMULADOR: {
    cents: 1900,
    formatted: 'R$ 19,00',
    interval: 'month',
    stripeKey: 'simulador_monthly',
    features: [
      'Simulador de Impostos completo',
      'Comparador de Regimes',
      'Relatórios em PDF',
    ],
  },
  PREMIUM: {
    cents: 4900,
    formatted: 'R$ 49,00',
    interval: 'month',
    stripeKey: 'premium_monthly',
    features: [
      'Tudo do plano Simulador',
      'Agente IA ilimitado',
      'Simulador de Locação',
      'Acesso a contadores',
      '10% desconto em serviços',
    ],
  },
  ENTERPRISE: {
    cents: 14900,
    formatted: 'R$ 149,00',
    interval: 'month',
    stripeKey: 'enterprise_monthly',
    features: [
      'Tudo do plano Premium',
      'Multi-empresas',
      'Suporte prioritário',
      'Relatórios avançados',
      'API access',
    ],
  },
  AUTONOMO: {
    cents: 6500,
    formatted: 'R$ 65,00',
    interval: 'month',
    stripeKey: 'autonomo_monthly',
    features: [
      'Simulador PF vs PJ',
      'Projeção de economia',
      'Agente IA para autônomos',
      'Orientação de abertura',
    ],
  },
} as const;

// Affiliate Commissions
export const AFFILIATE_COMMISSIONS = {
  DEFAULT_PERCENT: 20,
  LIMPA_NOME_PF: 13600, // 20% of 68000
  LIMPA_NOME_CNPJ: 17800, // 20% of 89000
  IR_SIMPLES: 3000, // 20% of 15000
  IR_COMPLETO: 7000, // 20% of 35000
  ABERTURA_EMPRESA: 10000, // 20% of 50000
} as const;

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
