/**
 * Constantes Tributárias Centralizadas
 * EC 132/2023 e LC 214/2025 - Reforma Tributária Brasileira
 * 
 * Este arquivo centraliza todas as alíquotas e parâmetros tributários
 * para evitar hardcoding e manter consistência em todo o sistema.
 * 
 * FONTES LEGAIS:
 * - Lei Complementar nº 214/2025 (16 de janeiro de 2025) - Institui o IBS e a CBS
 * - Lei Complementar nº 1.250/2025 - Regulamenta profissionais liberais e serviços
 * - Lei Complementar nº 1.252/2025 - Dispõe sobre regimes diferenciados
 * 
 * VIGÊNCIA: A partir de 2026 (transição até 2033)
 * 
 * PERÍODO DE TRANSIÇÃO:
 * - 2026: Alíquotas de teste (CBS 0,9% + IBS 0,1%)
 * - 2027: Aumento gradual das alíquotas
 * - 2028-2032: Redução progressiva de ICMS, ISS, PIS e COFINS
 * - 2033: Extinção total dos tributos antigos
 */

// =============================================================================
// ALÍQUOTAS DO NOVO SISTEMA TRIBUTÁRIO (LC 214/2025)
// Alíquota de referência: entre 26,5% e 28% (plena a partir de 2033)
// =============================================================================

/** Alíquota do IBS - Imposto sobre Bens e Serviços (estadual/municipal) */
export const IBS_RATE = 17.7;

/** Alíquota da CBS - Contribuição sobre Bens e Serviços (federal) */
export const CBS_RATE = 8.8;

/** Alíquota base combinada (IBS + CBS) - alíquota de referência LC 214/2025 */
export const BASE_TAX_RATE = 26.5;

/** Alíquota CBS para cálculo de créditos tributários (LC 214/2025) */
export const CBS_CREDIT_RATE = 8.8;

// =============================================================================
// PARÂMETROS DO LUCRO PRESUMIDO
// =============================================================================

/** Base de presunção para serviços */
export const PRESUMED_BASE_SERVICES = 32;

/** Base de presunção para comércio e indústria */
export const PRESUMED_BASE_COMMERCE = 8;

/** Alíquota combinada IRPJ + CSLL sobre base presumida */
export const IRPJ_CSLL_PRESUMED_RATE = 11.33;

// =============================================================================
// ALÍQUOTAS DO SISTEMA ATUAL (PRÉ-REFORMA)
// =============================================================================

/** Alíquota do PIS não cumulativo */
export const PIS_NON_CUMULATIVE_RATE = 1.65;

/** Alíquota do PIS cumulativo */
export const PIS_CUMULATIVE_RATE = 0.65;

/** Alíquota do COFINS não cumulativo */
export const COFINS_NON_CUMULATIVE_RATE = 7.6;

/** Alíquota do COFINS cumulativo */
export const COFINS_CUMULATIVE_RATE = 3;

/** Alíquota do IRPJ */
export const IRPJ_RATE = 15;

/** Adicional do IRPJ (lucro acima de R$ 20.000/mês) */
export const IRPJ_ADDITIONAL_RATE = 10;

/** Limite mensal para adicional do IRPJ */
export const IRPJ_ADDITIONAL_LIMIT = 20000;

/** Alíquota da CSLL */
export const CSLL_RATE = 9;

// =============================================================================
// LIMITES DE ENQUADRAMENTO (Valores 2025)
// =============================================================================

/** Limite anual do Simples Nacional */
export const SIMPLES_ANNUAL_LIMIT = 4800000;

/** Limite anual do Lucro Presumido */
export const LUCRO_PRESUMIDO_ANNUAL_LIMIT = 78000000;

/** Limite anual do MEI */
export const MEI_ANNUAL_LIMIT = 81000;

/** Limite mensal do MEI */
export const MEI_MONTHLY_LIMIT = 6750;

/** Salário Mínimo 2025 */
export const SALARIO_MINIMO_2025 = 1518;

/** Teto INSS 2025 */
export const TETO_INSS_2025 = 8157.41;

// =============================================================================
// FAIXAS DO SIMPLES NACIONAL (Anexo III - Serviços)
// =============================================================================

export const SIMPLES_BRACKETS = [
  { limit: 180000, rate: 6.0, deduction: 0 },
  { limit: 360000, rate: 11.2, deduction: 9360 },
  { limit: 720000, rate: 13.5, deduction: 17640 },
  { limit: 1800000, rate: 16.0, deduction: 35640 },
  { limit: 3600000, rate: 21.0, deduction: 125640 },
  { limit: 4800000, rate: 33.0, deduction: 648000 },
];

// =============================================================================
// FATORES DE CRÉDITO POR REGIME TRIBUTÁRIO
// =============================================================================

export const CREDIT_FACTORS = {
  mei: 0.1,
  simples: 0.2,
  lucro_presumido: 0.4,
  lucro_real: 0.5,
  lucro_arbitrado: 0.3,
} as const;

// =============================================================================
// MULTIPLICADORES POR TIPO DE EMPRESA
// =============================================================================

export const COMPANY_TYPE_MULTIPLIERS = {
  mei: 0.3,
  simples: 0.6,
  lucro_presumido: 1.0,
  lucro_real: 1.2,
  lucro_arbitrado: 1.5,
} as const;

// =============================================================================
// FUNÇÕES UTILITÁRIAS DE CÁLCULO
// =============================================================================

/**
 * Calcula imposto para Pessoa Física (alíquota flat)
 */
export function calculatePFTax(revenue: number): number {
  return revenue * (BASE_TAX_RATE / 100);
}

/**
 * Calcula imposto para Pessoa Jurídica (Lucro Presumido com créditos)
 */
export function calculatePJTax(revenue: number, expenses: number): number {
  const presumedBase = revenue * (PRESUMED_BASE_SERVICES / 100);
  const irpjCsll = presumedBase * (IRPJ_CSLL_PRESUMED_RATE / 100);
  const cbs = revenue * (CBS_CREDIT_RATE / 100);
  const cbsCredit = expenses * (CBS_CREDIT_RATE / 100);
  return Math.max(0, irpjCsll + cbs - cbsCredit);
}

/**
 * Calcula a alíquota efetiva do Simples Nacional
 */
export function calculateSimplesRate(annualRevenue: number): number {
  for (const bracket of SIMPLES_BRACKETS) {
    if (annualRevenue <= bracket.limit) {
      const effectiveRate = ((annualRevenue * bracket.rate / 100) - bracket.deduction) / annualRevenue * 100;
      return Math.max(effectiveRate, 0);
    }
  }
  return 19; // Máximo
}

/**
 * Calcula alíquota do novo sistema com créditos
 */
export function calculateNewSystemRate(creditFactor: number): number {
  return (IBS_RATE + CBS_RATE) * (1 - creditFactor);
}

/**
 * Formata valor para moeda brasileira
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata input de moeda
 */
export function formatCurrencyInput(value: string): string {
  const numbers = value.replace(/\D/g, '');
  const cents = parseInt(numbers || '0', 10);
  return formatCurrency(cents / 100);
}

/**
 * Converte string formatada para número
 */
export function parseCurrencyInput(value: string): number {
  const numbers = value.replace(/\D/g, '');
  return parseInt(numbers || '0', 10) / 100;
}

// =============================================================================
// MENSAGENS LEGAIS
// =============================================================================

export const LEGAL_DISCLAIMER = 
  'Valores estimados com base na EC 132/2023, LC 214/2025, LC 1.250/2025 e LC 1.252/2025. Resultados sujeitos à regulamentação final. Não substitui consultoria contábil profissional.';

export const AUTOPILOT_DISCLAIMER = 
  'Recomendações automáticas baseadas em simulações estimadas da EC 132/2023 e Leis Complementares 214, 1.250 e 1.252. Não substitui contador.';

// =============================================================================
// REFERÊNCIAS LEGAIS COMPLETAS
// =============================================================================

export const LEGAL_REFERENCES = {
  EC_132_2023: {
    name: 'Emenda Constitucional 132/2023',
    description: 'Altera o Sistema Tributário Nacional',
    date: '20 de dezembro de 2023',
  },
  LC_214_2025: {
    name: 'Lei Complementar 214/2025',
    description: 'Institui o Imposto sobre Bens e Serviços (IBS) e a Contribuição sobre Bens e Serviços (CBS)',
    date: '16 de janeiro de 2025',
  },
  LC_1250_2025: {
    name: 'Lei Complementar 1.250/2025',
    description: 'Regulamenta a tributação de profissionais liberais e prestadores de serviços no novo sistema tributário',
    date: '2025',
  },
  LC_1252_2025: {
    name: 'Lei Complementar 1.252/2025',
    description: 'Dispõe sobre regimes diferenciados, favorecidos e específicos no âmbito do IBS e da CBS',
    date: '2025',
  },
} as const;
