// Dados tributários para simulação da reforma

export const sectors = [
  { value: "comercio", label: "Comércio", icms: 18, iss: 0, pis: 0.65, cofins: 3, ipi: 0 },
  { value: "servicos", label: "Serviços", icms: 0, iss: 5, pis: 0.65, cofins: 3, ipi: 0 },
  { value: "industria", label: "Indústria", icms: 18, iss: 0, pis: 0.65, cofins: 3, ipi: 10 },
  { value: "tecnologia", label: "Tecnologia", icms: 0, iss: 5, pis: 0.65, cofins: 3, ipi: 0 },
  { value: "alimentacao", label: "Alimentação", icms: 12, iss: 0, pis: 0.65, cofins: 3, ipi: 0 },
  { value: "saude", label: "Saúde", icms: 0, iss: 3, pis: 0.65, cofins: 3, ipi: 0 },
  { value: "agronegocio", label: "Agronegócio", icms: 7, iss: 0, pis: 0.65, cofins: 3, ipi: 0 },
  { value: "construcao", label: "Construção Civil", icms: 18, iss: 5, pis: 0.65, cofins: 3, ipi: 5 },
  { value: "transporte", label: "Transporte", icms: 12, iss: 0, pis: 0.65, cofins: 3, ipi: 0 },
  { value: "educacao", label: "Educação", icms: 0, iss: 2, pis: 0.65, cofins: 3, ipi: 0 },
];

export const companyTypes = [
  { value: "mei", label: "MEI", multiplier: 0.3, creditFactor: 0.1 },
  { value: "simples", label: "Simples Nacional", multiplier: 0.6, creditFactor: 0.2 },
  { value: "lucro_presumido", label: "Lucro Presumido", multiplier: 1, creditFactor: 0.4 },
  { value: "lucro_real", label: "Lucro Real", multiplier: 1.2, creditFactor: 0.5 },
  { value: "lucro_arbitrado", label: "Lucro Arbitrado", multiplier: 1.5, creditFactor: 0.3 },
];

// Alíquotas de ICMS por estado (valores de referência)
export const stateICMSRates: Record<string, number> = {
  AC: 17,
  AL: 19,
  AM: 20,
  AP: 18,
  BA: 20.5,
  CE: 20,
  DF: 20,
  ES: 17,
  GO: 19,
  MA: 22,
  MG: 18,
  MS: 17,
  MT: 17,
  PA: 19,
  PB: 20,
  PE: 20.5,
  PI: 21,
  PR: 19.5,
  RJ: 22,
  RN: 20,
  RO: 17.5,
  RR: 20,
  RS: 17,
  SC: 17,
  SE: 19,
  SP: 18,
  TO: 20,
};

export const brazilianStates = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AM", label: "Amazonas" },
  { value: "AP", label: "Amapá" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MG", label: "Minas Gerais" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MT", label: "Mato Grosso" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "PR", label: "Paraná" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SE", label: "Sergipe" },
  { value: "SP", label: "São Paulo" },
  { value: "TO", label: "Tocantins" },
];

// Alíquotas do Imposto Seletivo por setor (LC 214/2025)
// Valores estimados de referência
export const selectiveTaxRates: Record<string, number> = {
  comercio: 0, // Comércio geral não é tributado pelo IS
  servicos: 0,
  industria: 3, // Depende do produto
  tecnologia: 0,
  alimentacao: 0, // Cesta básica isenta
  saude: 0, // Medicamentos isentos
  agronegocio: 0, // Incentivo ao agro
  construcao: 0,
  transporte: 0, // Combustíveis terão regime especial
  educacao: 0, // Educação isenta
};

export interface SimulationInput {
  revenue: number;
  sector: string;
  companyType: string;
  state?: string;
}

export interface TaxBreakdown {
  icms: number;
  iss: number;
  pis: number;
  cofins: number;
  ipi: number;
  total: number;
}

export interface NewTaxBreakdown {
  ibs: number;
  cbs: number;
  is: number;
  total: number;
}

export interface SimulationResult {
  beforeTaxes: TaxBreakdown;
  afterTaxes: NewTaxBreakdown;
  difference: number;
  percentChange: number;
  input: SimulationInput;
  timestamp: Date;
}

export function calculateTaxes(input: SimulationInput): SimulationResult {
  const { revenue, sector, companyType, state } = input;
  
  const sectorData = sectors.find(s => s.value === sector) || sectors[0];
  const companyData = companyTypes.find(c => c.value === companyType) || companyTypes[0];
  const multiplier = companyData.multiplier;
  const creditFactor = companyData.creditFactor;

  // Determina alíquota de ICMS (usa estado se fornecido, senão usa do setor)
  const icmsRate = state && sectorData.icms > 0 
    ? stateICMSRates[state] || sectorData.icms 
    : sectorData.icms;

  // Cálculo impostos atuais
  const icms = revenue * (icmsRate / 100) * multiplier;
  const iss = revenue * (sectorData.iss / 100) * multiplier;
  const pis = revenue * (sectorData.pis / 100) * multiplier;
  const cofins = revenue * (sectorData.cofins / 100) * multiplier;
  const ipi = revenue * (sectorData.ipi / 100) * multiplier;
  const totalBefore = icms + iss + pis + cofins + ipi;

  // Cálculo com reforma (LC 214/2025)
  // Alíquota de referência combinada: aproximadamente 26,5% a 28%
  // IBS (estadual/municipal): 17,7% | CBS (federal): 8,8%
  // Total padrão: 26,5%
  const ibsRate = 17.7;
  const cbsRate = 8.8;
  const isRate = selectiveTaxRates[sector] || 0;

  // Aplicando não-cumulatividade plena (créditos conforme regime tributário)
  // A reforma prevê creditamento amplo
  const ibs = revenue * (ibsRate / 100) * multiplier * (1 - creditFactor);
  const cbs = revenue * (cbsRate / 100) * multiplier * (1 - creditFactor);
  const is = revenue * (isRate / 100) * multiplier;
  const totalAfter = ibs + cbs + is;

  const difference = totalAfter - totalBefore;
  const percentChange = totalBefore > 0 ? (difference / totalBefore) * 100 : 0;

  return {
    beforeTaxes: { icms, iss, pis, cofins, ipi, total: totalBefore },
    afterTaxes: { ibs, cbs, is, total: totalAfter },
    difference,
    percentChange,
    input,
    timestamp: new Date(),
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function parseCurrencyInput(value: string): number {
  return parseFloat(value.replace(/\D/g, "")) / 100 || 0;
}

export function formatCurrencyInput(value: string): string {
  const numericValue = value.replace(/\D/g, "");
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parseFloat(numericValue) / 100 || 0);
}
