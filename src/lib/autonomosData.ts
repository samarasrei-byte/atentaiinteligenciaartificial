/**
 * Dados e constantes para profissionais autônomos
 * Categorias, alíquotas e cálculos tributários
 */

// =============================================================================
// CATEGORIAS DE PROFISSIONAIS AUTÔNOMOS
// =============================================================================

export interface ProfessionalCategory {
  id: string;
  name: string;
  icon: string;
  professions: string[];
}

export const PROFESSIONAL_CATEGORIES: ProfessionalCategory[] = [
  {
    id: 'construcao',
    name: 'Construção / Manutenção',
    icon: '🏗️',
    professions: [
      'Pedreiro', 'Pintor', 'Eletricista', 'Encanador', 'Azulejista',
      'Gesseiro', 'Marceneiro', 'Carpinteiro', 'Serralheiro', 'Vidraceiro',
      'Montador de móveis'
    ],
  },
  {
    id: 'domesticos',
    name: 'Serviços Domésticos',
    icon: '🧹',
    professions: [
      'Diarista', 'Faxineira', 'Passadeira', 'Cozinheira', 'Babá',
      'Cuidador(a) de idosos'
    ],
  },
  {
    id: 'transporte',
    name: 'Transporte / Entrega',
    icon: '🚗',
    professions: [
      'Motorista de aplicativo', 'Motoboy', 'Entregador', 'Freteiro',
      'Caminhoneiro autônomo'
    ],
  },
  {
    id: 'beleza',
    name: 'Beleza / Estética',
    icon: '💇‍♀️',
    professions: [
      'Cabeleireiro(a)', 'Barbeiro', 'Manicure / Pedicure', 'Esteticista',
      'Designer de sobrancelhas', 'Maquiador(a)', 'Massoterapeuta'
    ],
  },
  {
    id: 'tecnologia',
    name: 'Tecnologia / Digital',
    icon: '🧑‍💻',
    professions: [
      'Desenvolvedor(a)', 'Programador(a)', 'Designer gráfico', 'Social media',
      'Gestor de tráfego', 'Editor de vídeo', 'Copywriter', 'Produtor de conteúdo',
      'Freelancer digital'
    ],
  },
  {
    id: 'criativos',
    name: 'Criativos / Eventos',
    icon: '📸',
    professions: [
      'Fotógrafo(a)', 'Videomaker', 'DJ', 'Músico', 'Iluminador',
      'Produtor de eventos'
    ],
  },
  {
    id: 'educacao',
    name: 'Educação / Aulas',
    icon: '📚',
    professions: [
      'Professor particular', 'Tutor', 'Instrutor de cursos online',
      'Professor de idiomas', 'Coach', 'Mentor'
    ],
  },
  {
    id: 'saude',
    name: 'Saúde / Bem-estar',
    icon: '🩺',
    professions: [
      'Psicólogo(a)', 'Fisioterapeuta', 'Nutricionista', 'Personal trainer',
      'Terapeuta holístico', 'Fonoaudiólogo(a)'
    ],
  },
  {
    id: 'consultoria',
    name: 'Consultoria / Profissionais Liberais',
    icon: '🧠',
    professions: [
      'Contador(a)', 'Advogado(a)', 'Consultor(a) empresarial',
      'Consultor(a) financeiro', 'Consultor(a) de marketing', 'Auditor(a)'
    ],
  },
  {
    id: 'outros',
    name: 'Outros Serviços',
    icon: '🧺',
    professions: [
      'Costureira', 'Bordadeira', 'Artesão(ã)', 'Sapateiro', 'Chaveiro',
      'Relojoeiro', 'Técnico de informática', 'Técnico de ar-condicionado'
    ],
  },
];

// =============================================================================
// CONSTANTES TRIBUTÁRIAS
// =============================================================================

// MEI - Microempreendedor Individual
export const MEI_MONTHLY_LIMIT = 81000 / 12; // R$ 6.750/mês
export const MEI_ANNUAL_LIMIT = 81000; // R$ 81.000/ano
export const MEI_MONTHLY_TAX = 75.90; // DAS MEI médio 2025 (INSS + ICMS/ISS)
export const MEI_MONTHLY_TAX_SERVICES = 75.90; // DAS MEI serviços 2025
export const MEI_MONTHLY_TAX_COMMERCE = 76.90; // DAS MEI comércio/indústria 2025
export const MEI_MONTHLY_TAX_BOTH = 77.90; // DAS MEI ambos 2025

// Simples Nacional (ME)
export const SIMPLES_ANNUAL_LIMIT = 4800000;
export const SIMPLES_BRACKETS = [
  { limit: 180000, rate: 6.0, deduction: 0 },
  { limit: 360000, rate: 11.2, deduction: 9360 },
  { limit: 720000, rate: 13.5, deduction: 17640 },
  { limit: 1800000, rate: 16.0, deduction: 35640 },
  { limit: 3600000, rate: 21.0, deduction: 125640 },
  { limit: 4800000, rate: 33.0, deduction: 648000 },
];

// Pessoa Física - IRPF (Carnê-Leão)
export const IRPF_BRACKETS = [
  { limit: 2259.20, rate: 0, deduction: 0 },
  { limit: 2826.65, rate: 7.5, deduction: 169.44 },
  { limit: 3751.05, rate: 15, deduction: 381.44 },
  { limit: 4664.68, rate: 22.5, deduction: 662.77 },
  { limit: Infinity, rate: 27.5, deduction: 896.00 },
];

// INSS Autônomo (sobre 1 salário mínimo)
export const INSS_AUTONOMO_RATE = 20; // 20% sobre rendimento
export const INSS_AUTONOMO_MIN = 1518 * 0.11; // 11% sobre salário mínimo (contribuinte individual baixa renda)
export const INSS_AUTONOMO_TETO = 8157.41; // Teto INSS 2025
export const SALARIO_MINIMO = 1518; // 2025

// ISS (Serviços) - varia por município
export const ISS_MIN_RATE = 2;
export const ISS_MAX_RATE = 5;
export const ISS_DEFAULT_RATE = 5;

// Lucro Presumido
export const LP_PRESUMED_BASE_SERVICES = 32; // 32% para serviços
export const LP_PRESUMED_BASE_COMMERCE = 8; // 8% para comércio
export const LP_IRPJ_RATE = 15;
export const LP_CSLL_RATE = 9;
export const LP_PIS_RATE = 0.65;
export const LP_COFINS_RATE = 3;

// =============================================================================
// FUNÇÕES DE CÁLCULO
// =============================================================================

export interface AutonomoInput {
  monthlyRevenue: number;
  monthlyExpenses: number;
  profession: string;
  category: string;
  state: string;
}

export interface RegimeResult {
  regime: 'PF' | 'MEI' | 'ME_SIMPLES' | 'ME_PRESUMIDO';
  label: string;
  monthlyTax: number;
  annualTax: number;
  netMonthly: number;
  netAnnual: number;
  effectiveRate: number;
  isEligible: boolean;
  ineligibilityReason?: string;
}

export interface ComparisonResult {
  pf: RegimeResult;
  mei: RegimeResult;
  meSimples: RegimeResult;
  mePresumido: RegimeResult;
  bestOption: RegimeResult;
  annualSavings: number;
  recommendation: string;
  alerts: string[];
}

/**
 * Calcula IRPF mensal (Carnê-Leão)
 */
export function calculateIRPF(monthlyRevenue: number): number {
  for (const bracket of IRPF_BRACKETS) {
    if (monthlyRevenue <= bracket.limit) {
      return Math.max(0, (monthlyRevenue * bracket.rate / 100) - bracket.deduction);
    }
  }
  const lastBracket = IRPF_BRACKETS[IRPF_BRACKETS.length - 1];
  return (monthlyRevenue * lastBracket.rate / 100) - lastBracket.deduction;
}

/**
 * Calcula INSS autônomo mensal
 */
export function calculateINSSAutonomo(monthlyRevenue: number): number {
  const contribution = monthlyRevenue * (INSS_AUTONOMO_RATE / 100);
  return Math.min(contribution, INSS_AUTONOMO_TETO * 0.20);
}

/**
 * Calcula imposto como Pessoa Física
 */
export function calculatePFTax(input: AutonomoInput): RegimeResult {
  const { monthlyRevenue, monthlyExpenses } = input;
  const annualRevenue = monthlyRevenue * 12;
  
  // Base de cálculo = receita - despesas dedutíveis (limitadas)
  const deductibleExpenses = Math.min(monthlyExpenses, monthlyRevenue * 0.3);
  const taxableBase = monthlyRevenue - deductibleExpenses;
  
  const irpf = calculateIRPF(taxableBase);
  const inss = calculateINSSAutonomo(monthlyRevenue);
  const iss = monthlyRevenue * (ISS_DEFAULT_RATE / 100);
  
  const monthlyTax = irpf + inss + iss;
  const annualTax = monthlyTax * 12;
  
  return {
    regime: 'PF',
    label: 'Pessoa Física (Autônomo)',
    monthlyTax,
    annualTax,
    netMonthly: monthlyRevenue - monthlyTax,
    netAnnual: annualRevenue - annualTax,
    effectiveRate: (monthlyTax / monthlyRevenue) * 100,
    isEligible: true,
  };
}

/**
 * Calcula imposto como MEI
 */
export function calculateMEITax(input: AutonomoInput): RegimeResult {
  const { monthlyRevenue, category } = input;
  const annualRevenue = monthlyRevenue * 12;
  
  // Verifica elegibilidade
  if (annualRevenue > MEI_ANNUAL_LIMIT) {
    return {
      regime: 'MEI',
      label: 'MEI',
      monthlyTax: 0,
      annualTax: 0,
      netMonthly: 0,
      netAnnual: 0,
      effectiveRate: 0,
      isEligible: false,
      ineligibilityReason: `Faturamento anual (${formatCurrency(annualRevenue)}) excede limite MEI de ${formatCurrency(MEI_ANNUAL_LIMIT)}`,
    };
  }
  
  // Determina taxa MEI baseado na categoria
  let monthlyTax = MEI_MONTHLY_TAX_SERVICES;
  if (category === 'comercio' || category === 'transporte') {
    monthlyTax = MEI_MONTHLY_TAX_COMMERCE;
  }
  
  const annualTax = monthlyTax * 12;
  
  return {
    regime: 'MEI',
    label: 'MEI (Microempreendedor Individual)',
    monthlyTax,
    annualTax,
    netMonthly: monthlyRevenue - monthlyTax,
    netAnnual: annualRevenue - annualTax,
    effectiveRate: (monthlyTax / monthlyRevenue) * 100,
    isEligible: true,
  };
}

/**
 * Calcula alíquota efetiva do Simples Nacional
 */
function calculateSimplesRate(annualRevenue: number): { rate: number; monthlyTax: number } {
  for (const bracket of SIMPLES_BRACKETS) {
    if (annualRevenue <= bracket.limit) {
      const effectiveRate = ((annualRevenue * bracket.rate / 100) - bracket.deduction) / annualRevenue * 100;
      const monthlyTax = (annualRevenue * Math.max(effectiveRate, 0) / 100) / 12;
      return { rate: Math.max(effectiveRate, 0), monthlyTax };
    }
  }
  return { rate: 19, monthlyTax: annualRevenue * 0.19 / 12 };
}

/**
 * Calcula imposto como ME Simples Nacional
 */
export function calculateMESimplesTax(input: AutonomoInput): RegimeResult {
  const { monthlyRevenue } = input;
  const annualRevenue = monthlyRevenue * 12;
  
  if (annualRevenue > SIMPLES_ANNUAL_LIMIT) {
    return {
      regime: 'ME_SIMPLES',
      label: 'ME (Simples Nacional)',
      monthlyTax: 0,
      annualTax: 0,
      netMonthly: 0,
      netAnnual: 0,
      effectiveRate: 0,
      isEligible: false,
      ineligibilityReason: `Faturamento excede limite do Simples Nacional`,
    };
  }
  
  const { rate, monthlyTax } = calculateSimplesRate(annualRevenue);
  const annualTax = monthlyTax * 12;
  
  // Custo adicional: contador (~R$ 300-600/mês) e abertura (~R$ 1.000)
  const contadorMensal = 400;
  const totalMonthlyTax = monthlyTax + contadorMensal;
  
  return {
    regime: 'ME_SIMPLES',
    label: 'ME (Simples Nacional)',
    monthlyTax: totalMonthlyTax,
    annualTax: totalMonthlyTax * 12,
    netMonthly: monthlyRevenue - totalMonthlyTax,
    netAnnual: annualRevenue - (totalMonthlyTax * 12),
    effectiveRate: (totalMonthlyTax / monthlyRevenue) * 100,
    isEligible: true,
  };
}

/**
 * Calcula imposto como ME Lucro Presumido
 */
export function calculateMEPresumidoTax(input: AutonomoInput): RegimeResult {
  const { monthlyRevenue } = input;
  const annualRevenue = monthlyRevenue * 12;
  
  // Base presumida para serviços: 32%
  const presumedBase = monthlyRevenue * (LP_PRESUMED_BASE_SERVICES / 100);
  
  // IRPJ: 15% sobre base presumida
  const irpj = presumedBase * (LP_IRPJ_RATE / 100);
  
  // CSLL: 9% sobre base presumida
  const csll = presumedBase * (LP_CSLL_RATE / 100);
  
  // PIS: 0,65% sobre faturamento
  const pis = monthlyRevenue * (LP_PIS_RATE / 100);
  
  // COFINS: 3% sobre faturamento
  const cofins = monthlyRevenue * (LP_COFINS_RATE / 100);
  
  // ISS: 5% sobre faturamento
  const iss = monthlyRevenue * (ISS_DEFAULT_RATE / 100);
  
  const monthlyTax = irpj + csll + pis + cofins + iss;
  
  // Custo adicional: contador (~R$ 600-1.200/mês)
  const contadorMensal = 700;
  const totalMonthlyTax = monthlyTax + contadorMensal;
  
  return {
    regime: 'ME_PRESUMIDO',
    label: 'ME (Lucro Presumido)',
    monthlyTax: totalMonthlyTax,
    annualTax: totalMonthlyTax * 12,
    netMonthly: monthlyRevenue - totalMonthlyTax,
    netAnnual: annualRevenue - (totalMonthlyTax * 12),
    effectiveRate: (totalMonthlyTax / monthlyRevenue) * 100,
    isEligible: true,
  };
}

/**
 * Compara todos os regimes e retorna o melhor
 */
export function compareRegimes(input: AutonomoInput): ComparisonResult {
  const pf = calculatePFTax(input);
  const mei = calculateMEITax(input);
  const meSimples = calculateMESimplesTax(input);
  const mePresumido = calculateMEPresumidoTax(input);
  
  // Encontra o melhor regime elegível
  const eligibleOptions = [pf, mei, meSimples, mePresumido].filter(r => r.isEligible);
  const bestOption = eligibleOptions.reduce((best, current) => 
    current.annualTax < best.annualTax ? current : best
  );
  
  // Calcula economia em relação ao PF
  const annualSavings = pf.annualTax - bestOption.annualTax;
  
  // Gera alertas
  const alerts: string[] = [];
  const annualRevenue = input.monthlyRevenue * 12;
  
  if (mei.isEligible && annualRevenue > MEI_ANNUAL_LIMIT * 0.8) {
    alerts.push('⚠️ Você está próximo do limite do MEI. Considere migrar para ME.');
  }
  
  if (annualRevenue > 150000 && mei.isEligible) {
    alerts.push('💡 Com esse faturamento, MEI pode limitar seu crescimento.');
  }
  
  // Com a reforma tributária (2026-2033)
  if (annualRevenue > 100000) {
    alerts.push('📅 Em 2026, a Reforma Tributária pode alterar esses valores. Fique atento!');
  }
  
  // Gera recomendação em linguagem simples
  let recommendation = '';
  if (bestOption.regime === 'MEI') {
    recommendation = `Você deveria ser MEI agora! É o mais vantajoso para seu faturamento. Paga apenas R$ ${formatCurrency(bestOption.monthlyTax)} por mês de imposto fixo.`;
  } else if (bestOption.regime === 'ME_SIMPLES') {
    recommendation = `O Simples Nacional é sua melhor opção. Você paga menos impostos e tem mais flexibilidade para crescer.`;
  } else if (bestOption.regime === 'ME_PRESUMIDO') {
    recommendation = `O Lucro Presumido é mais vantajoso para você. Ideal para quem tem poucas despesas dedutíveis.`;
  } else {
    recommendation = `Por enquanto, continuar como autônomo (PF) faz sentido. Mas fique de olho nas outras opções conforme seu faturamento crescer.`;
  }
  
  return {
    pf,
    mei,
    meSimples,
    mePresumido,
    bestOption,
    annualSavings,
    recommendation,
    alerts,
  };
}

/**
 * Formata valor em moeda brasileira
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Gera prompt para IA analisar situação do autônomo
 */
export function generateAIPrompt(input: AutonomoInput, comparison: ComparisonResult): string {
  return `
Analise a situação tributária deste profissional autônomo em linguagem simples e direta:

DADOS DO PROFISSIONAL:
- Profissão: ${input.profession}
- Categoria: ${input.category}
- Faturamento mensal: ${formatCurrency(input.monthlyRevenue)}
- Faturamento anual estimado: ${formatCurrency(input.monthlyRevenue * 12)}
- Despesas mensais: ${formatCurrency(input.monthlyExpenses)}
- Estado: ${input.state}

COMPARAÇÃO DE REGIMES:

1. PESSOA FÍSICA (Autônomo):
   - Imposto mensal: ${formatCurrency(comparison.pf.monthlyTax)}
   - Alíquota efetiva: ${comparison.pf.effectiveRate.toFixed(1)}%
   - Líquido mensal: ${formatCurrency(comparison.pf.netMonthly)}

2. MEI:
   ${comparison.mei.isEligible 
     ? `- Imposto mensal: ${formatCurrency(comparison.mei.monthlyTax)}
   - Alíquota efetiva: ${comparison.mei.effectiveRate.toFixed(1)}%
   - Líquido mensal: ${formatCurrency(comparison.mei.netMonthly)}`
     : `- NÃO ELEGÍVEL: ${comparison.mei.ineligibilityReason}`
   }

3. ME SIMPLES NACIONAL:
   - Imposto mensal (+ contador): ${formatCurrency(comparison.meSimples.monthlyTax)}
   - Alíquota efetiva: ${comparison.meSimples.effectiveRate.toFixed(1)}%
   - Líquido mensal: ${formatCurrency(comparison.meSimples.netMonthly)}

4. ME LUCRO PRESUMIDO:
   - Imposto mensal (+ contador): ${formatCurrency(comparison.mePresumido.monthlyTax)}
   - Alíquota efetiva: ${comparison.mePresumido.effectiveRate.toFixed(1)}%
   - Líquido mensal: ${formatCurrency(comparison.mePresumido.netMonthly)}

MELHOR OPÇÃO IDENTIFICADA: ${comparison.bestOption.label}
ECONOMIA ANUAL POTENCIAL: ${formatCurrency(comparison.annualSavings)}

INSTRUÇÕES:
1. Responda em português brasileiro, linguagem simples, sem juridiquês
2. Seja direto e objetivo
3. Explique por que essa opção é melhor
4. Dê 2-3 dicas práticas para economizar
5. Mencione brevemente o impacto da Reforma Tributária 2026-2033
6. Termine com uma frase motivacional

Responda de forma amigável, como se estivesse conversando com um amigo.
`;
}
