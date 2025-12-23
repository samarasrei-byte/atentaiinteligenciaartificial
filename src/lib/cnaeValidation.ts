/**
 * Validação e Mapeamento de CNAE (Classificação Nacional de Atividades Econômicas)
 * 
 * Este módulo fornece validação de códigos CNAE e mapeamento para setores tributários,
 * melhorando a precisão dos cálculos setoriais.
 */

// =============================================================================
// TIPOS E INTERFACES
// =============================================================================

export interface CNAEInfo {
  code: string;
  description: string;
  sector: string;
  isSelectiveTax: boolean;
  selectiveTaxRate?: number;
  notes?: string;
}

export interface CNAEValidationResult {
  isValid: boolean;
  formatted: string | null;
  sector: string | null;
  description: string | null;
  error?: string;
}

// =============================================================================
// MAPEAMENTO DE DIVISÕES CNAE POR SETOR
// Baseado nas divisões da CNAE 2.3
// =============================================================================

const CNAE_SECTOR_MAPPING: Record<string, { sector: string; description: string }> = {
  // AGRONEGÓCIO (01-03)
  '01': { sector: 'agronegocio', description: 'Agricultura, pecuária e serviços relacionados' },
  '02': { sector: 'agronegocio', description: 'Produção florestal' },
  '03': { sector: 'agronegocio', description: 'Pesca e aquicultura' },
  
  // INDÚSTRIA EXTRATIVA (05-09)
  '05': { sector: 'industria', description: 'Extração de carvão mineral' },
  '06': { sector: 'industria', description: 'Extração de petróleo e gás natural' },
  '07': { sector: 'industria', description: 'Extração de minerais metálicos' },
  '08': { sector: 'industria', description: 'Extração de minerais não-metálicos' },
  '09': { sector: 'industria', description: 'Atividades de apoio à extração' },
  
  // INDÚSTRIA DE TRANSFORMAÇÃO (10-33)
  '10': { sector: 'alimentacao', description: 'Fabricação de produtos alimentícios' },
  '11': { sector: 'alimentacao', description: 'Fabricação de bebidas' },
  '12': { sector: 'industria', description: 'Fabricação de produtos do fumo' },
  '13': { sector: 'industria', description: 'Fabricação de produtos têxteis' },
  '14': { sector: 'industria', description: 'Confecção de artigos do vestuário' },
  '15': { sector: 'industria', description: 'Fabricação de couro e calçados' },
  '16': { sector: 'industria', description: 'Fabricação de produtos de madeira' },
  '17': { sector: 'industria', description: 'Fabricação de celulose e papel' },
  '18': { sector: 'industria', description: 'Impressão e reprodução de gravações' },
  '19': { sector: 'industria', description: 'Fabricação de coque e derivados' },
  '20': { sector: 'industria', description: 'Fabricação de produtos químicos' },
  '21': { sector: 'saude', description: 'Fabricação de produtos farmacêuticos' },
  '22': { sector: 'industria', description: 'Fabricação de produtos de borracha' },
  '23': { sector: 'construcao', description: 'Fabricação de produtos minerais' },
  '24': { sector: 'industria', description: 'Metalurgia' },
  '25': { sector: 'industria', description: 'Fabricação de produtos de metal' },
  '26': { sector: 'tecnologia', description: 'Fabricação de equipamentos eletrônicos' },
  '27': { sector: 'industria', description: 'Fabricação de máquinas elétricas' },
  '28': { sector: 'industria', description: 'Fabricação de máquinas e equipamentos' },
  '29': { sector: 'industria', description: 'Fabricação de veículos automotores' },
  '30': { sector: 'industria', description: 'Fabricação de equipamentos de transporte' },
  '31': { sector: 'industria', description: 'Fabricação de móveis' },
  '32': { sector: 'industria', description: 'Fabricação de produtos diversos' },
  '33': { sector: 'industria', description: 'Manutenção e instalação de máquinas' },
  
  // ELETRICIDADE E GÁS (35)
  '35': { sector: 'servicos', description: 'Eletricidade, gás e outras utilidades' },
  
  // ÁGUA E SANEAMENTO (36-39)
  '36': { sector: 'servicos', description: 'Captação e tratamento de água' },
  '37': { sector: 'servicos', description: 'Esgoto e atividades relacionadas' },
  '38': { sector: 'servicos', description: 'Coleta e tratamento de resíduos' },
  '39': { sector: 'servicos', description: 'Descontaminação e atividades afins' },
  
  // CONSTRUÇÃO (41-43)
  '41': { sector: 'construcao', description: 'Construção de edifícios' },
  '42': { sector: 'construcao', description: 'Obras de infraestrutura' },
  '43': { sector: 'construcao', description: 'Serviços especializados para construção' },
  
  // COMÉRCIO (45-47)
  '45': { sector: 'comercio', description: 'Comércio de veículos' },
  '46': { sector: 'comercio', description: 'Comércio por atacado' },
  '47': { sector: 'comercio', description: 'Comércio varejista' },
  
  // TRANSPORTE (49-53)
  '49': { sector: 'transporte', description: 'Transporte terrestre' },
  '50': { sector: 'transporte', description: 'Transporte aquaviário' },
  '51': { sector: 'transporte', description: 'Transporte aéreo' },
  '52': { sector: 'transporte', description: 'Armazenamento e atividades auxiliares' },
  '53': { sector: 'transporte', description: 'Correio e outras entregas' },
  
  // ALOJAMENTO E ALIMENTAÇÃO (55-56)
  '55': { sector: 'alimentacao', description: 'Alojamento' },
  '56': { sector: 'alimentacao', description: 'Alimentação' },
  
  // INFORMAÇÃO E COMUNICAÇÃO (58-63)
  '58': { sector: 'tecnologia', description: 'Edição e edição integrada à impressão' },
  '59': { sector: 'tecnologia', description: 'Atividades cinematográficas e de TV' },
  '60': { sector: 'tecnologia', description: 'Atividades de rádio e televisão' },
  '61': { sector: 'tecnologia', description: 'Telecomunicações' },
  '62': { sector: 'tecnologia', description: 'Tecnologia da informação' },
  '63': { sector: 'tecnologia', description: 'Atividades de serviços de informação' },
  
  // ATIVIDADES FINANCEIRAS (64-66)
  '64': { sector: 'servicos', description: 'Atividades de serviços financeiros' },
  '65': { sector: 'servicos', description: 'Seguros e previdência complementar' },
  '66': { sector: 'servicos', description: 'Atividades auxiliares financeiras' },
  
  // ATIVIDADES IMOBILIÁRIAS (68)
  '68': { sector: 'servicos', description: 'Atividades imobiliárias' },
  
  // ATIVIDADES PROFISSIONAIS, CIENTÍFICAS E TÉCNICAS (69-75)
  '69': { sector: 'servicos', description: 'Atividades jurídicas e contabilidade' },
  '70': { sector: 'servicos', description: 'Atividades de sedes de empresas' },
  '71': { sector: 'servicos', description: 'Serviços de arquitetura e engenharia' },
  '72': { sector: 'tecnologia', description: 'Pesquisa e desenvolvimento científico' },
  '73': { sector: 'servicos', description: 'Publicidade e pesquisa de mercado' },
  '74': { sector: 'servicos', description: 'Outras atividades profissionais' },
  '75': { sector: 'servicos', description: 'Atividades veterinárias' },
  
  // ATIVIDADES ADMINISTRATIVAS (77-82)
  '77': { sector: 'servicos', description: 'Aluguéis não-imobiliários' },
  '78': { sector: 'servicos', description: 'Seleção e agenciamento de mão de obra' },
  '79': { sector: 'servicos', description: 'Agências de viagens e operadores' },
  '80': { sector: 'servicos', description: 'Atividades de vigilância e segurança' },
  '81': { sector: 'servicos', description: 'Serviços para edifícios' },
  '82': { sector: 'servicos', description: 'Serviços de escritório e apoio' },
  
  // ADMINISTRAÇÃO PÚBLICA (84)
  '84': { sector: 'servicos', description: 'Administração pública e seguridade' },
  
  // EDUCAÇÃO (85)
  '85': { sector: 'educacao', description: 'Educação' },
  
  // SAÚDE E SERVIÇOS SOCIAIS (86-88)
  '86': { sector: 'saude', description: 'Atividades de atenção à saúde humana' },
  '87': { sector: 'saude', description: 'Atividades de atenção residencial' },
  '88': { sector: 'saude', description: 'Serviços de assistência social' },
  
  // ARTES, CULTURA, ESPORTE E RECREAÇÃO (90-93)
  '90': { sector: 'servicos', description: 'Atividades artísticas e de espetáculos' },
  '91': { sector: 'servicos', description: 'Bibliotecas, museus e afins' },
  '92': { sector: 'servicos', description: 'Atividades de exploração de jogos' },
  '93': { sector: 'servicos', description: 'Atividades esportivas e recreação' },
  
  // OUTRAS ATIVIDADES DE SERVIÇOS (94-96)
  '94': { sector: 'servicos', description: 'Atividades de organizações associativas' },
  '95': { sector: 'servicos', description: 'Reparação de equipamentos' },
  '96': { sector: 'servicos', description: 'Outras atividades de serviços pessoais' },
  
  // SERVIÇOS DOMÉSTICOS (97)
  '97': { sector: 'servicos', description: 'Serviços domésticos' },
  
  // ORGANISMOS INTERNACIONAIS (99)
  '99': { sector: 'servicos', description: 'Organismos internacionais' },
};

// =============================================================================
// CNAEs COM IMPOSTO SELETIVO (IS) - LC 214/2025
// =============================================================================

const SELECTIVE_TAX_CNAES: Record<string, number> = {
  // Bebidas alcoólicas
  '1111': 20,
  '1112': 20,
  '1113': 20,
  
  // Produtos do fumo
  '1210': 35,
  '1220': 35,
  
  // Veículos automotores a combustão
  '2910': 5,
  '2920': 5,
  '2930': 5,
  '2940': 5,
  '2950': 5,
  
  // Combustíveis e derivados de petróleo
  '1921': 10,
  '1922': 10,
  
  // Bebidas açucaradas
  '1121': 8,
  '1122': 8,
};

// =============================================================================
// FUNÇÕES DE VALIDAÇÃO E CONSULTA
// =============================================================================

/**
 * Valida formato e estrutura do código CNAE
 * Formatos aceitos: 1234-5/67 ou 1234567
 */
export function validateCNAE(cnae: string): CNAEValidationResult {
  // Remove caracteres especiais para validação
  const cleanCnae = cnae.replace(/[\.\-\/\s]/g, '');
  
  // Verifica se tem 7 dígitos
  if (!/^\d{7}$/.test(cleanCnae)) {
    return {
      isValid: false,
      formatted: null,
      sector: null,
      description: null,
      error: 'CNAE deve conter 7 dígitos numéricos',
    };
  }
  
  // Extrai a divisão (primeiros 2 dígitos)
  const division = cleanCnae.substring(0, 2);
  const sectorInfo = CNAE_SECTOR_MAPPING[division];
  
  if (!sectorInfo) {
    return {
      isValid: false,
      formatted: formatCNAE(cleanCnae),
      sector: null,
      description: null,
      error: `Divisão CNAE ${division} não reconhecida`,
    };
  }
  
  return {
    isValid: true,
    formatted: formatCNAE(cleanCnae),
    sector: sectorInfo.sector,
    description: sectorInfo.description,
  };
}

/**
 * Formata código CNAE para exibição padrão (1234-5/67)
 */
export function formatCNAE(cnae: string): string {
  const clean = cnae.replace(/\D/g, '');
  if (clean.length !== 7) return cnae;
  
  return `${clean.substring(0, 4)}-${clean.substring(4, 5)}/${clean.substring(5, 7)}`;
}

/**
 * Obtém informações detalhadas do CNAE
 */
export function getCNAEInfo(cnae: string): CNAEInfo | null {
  const validation = validateCNAE(cnae);
  if (!validation.isValid || !validation.sector) return null;
  
  const cleanCnae = cnae.replace(/\D/g, '');
  const group = cleanCnae.substring(0, 4);
  const selectiveTaxRate = SELECTIVE_TAX_CNAES[group];
  
  return {
    code: validation.formatted || cleanCnae,
    description: validation.description || '',
    sector: validation.sector,
    isSelectiveTax: !!selectiveTaxRate,
    selectiveTaxRate,
  };
}

/**
 * Obtém o setor tributário a partir do código CNAE
 */
export function getSectorFromCNAE(cnae: string): string | null {
  const validation = validateCNAE(cnae);
  return validation.sector;
}

/**
 * Verifica se o CNAE está sujeito ao Imposto Seletivo
 */
export function isSelectiveTaxCNAE(cnae: string): { isSelective: boolean; rate: number } {
  const cleanCnae = cnae.replace(/\D/g, '');
  const group = cleanCnae.substring(0, 4);
  const rate = SELECTIVE_TAX_CNAES[group];
  
  return {
    isSelective: !!rate,
    rate: rate || 0,
  };
}

/**
 * Lista todos os setores disponíveis com descrição
 */
export function getAvailableSectors(): { value: string; label: string }[] {
  return [
    { value: 'comercio', label: 'Comércio' },
    { value: 'servicos', label: 'Serviços' },
    { value: 'industria', label: 'Indústria' },
    { value: 'tecnologia', label: 'Tecnologia' },
    { value: 'alimentacao', label: 'Alimentação' },
    { value: 'saude', label: 'Saúde' },
    { value: 'agronegocio', label: 'Agronegócio' },
    { value: 'construcao', label: 'Construção Civil' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'educacao', label: 'Educação' },
  ];
}

/**
 * Obtém a divisão CNAE a partir do setor
 */
export function getCNAEDivisionsForSector(sector: string): string[] {
  return Object.entries(CNAE_SECTOR_MAPPING)
    .filter(([_, info]) => info.sector === sector)
    .map(([division, _]) => division);
}
