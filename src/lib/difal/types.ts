/**
 * DIFAL Marketplace — tipos do módulo.
 * Todos os valores monetários trafegam em CENTAVOS (bigint/number inteiro).
 */

export type UF =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO' | 'MA'
  | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI' | 'RJ' | 'RN'
  | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export const UFS: UF[] = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB',
  'PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

export type RegimeTributario =
  | 'mei' | 'simples_nacional' | 'lucro_presumido' | 'lucro_real' | 'nao_contribuinte';

export type Finalidade = 'consumo' | 'revenda';

export type ResponsavelRecolhimento =
  | 'remetente' | 'destinatario' | 'marketplace' | 'nao_aplicavel';

export type StatusRegra = 'rascunho' | 'ativo' | 'arquivado';

export type NivelConfianca = 'demonstrativo' | 'revisado' | 'oficial';

/** Regra fiscal tal como armazenada no banco. Nunca hardcoded na interface. */
export interface TaxRule {
  id: string;
  uf_origem: string | null;
  uf_destino: string;
  tipo_operacao: string;
  aliquota_interna: number;
  aliquota_interestadual: number;
  fcp_percentual: number;
  base_calculo_metodo: 'simples' | 'dupla';
  trat_consumidor_final_contribuinte?: string | null;
  trat_consumidor_final_nao_contribuinte?: string | null;
  trat_revenda?: string | null;
  trat_marketplace?: string | null;
  responsavel_recolhimento: ResponsavelRecolhimento;
  codigo_receita?: string | null;
  vigencia_inicio: string;
  vigencia_fim?: string | null;
  fonte_oficial?: string | null;
  norma?: string | null;
  observacoes?: string | null;
  nivel_confianca: NivelConfianca;
  is_demo: boolean;
  status: StatusRegra;
}

export interface SimulationItemInput {
  descricao: string;
  codigo_interno?: string;
  ncm?: string;
  cest?: string;
  cfop?: string;
  quantidade: number;
  valor_unitario_cents: number;
  desconto_cents: number;
  substituicao_tributaria: boolean;
  sujeito_fcp: boolean;
  fcp_percentual?: number | null;
}

export interface SimulationInput {
  data_operacao: string; // yyyy-mm-dd
  uf_origem: string;
  uf_destino: string;
  tipo_operacao: string;
  finalidade: Finalidade;
  destinatario_contribuinte: boolean;
  regime_vendedor?: RegimeTributario | string;
  regime_comprador?: RegimeTributario | string;
  canal_venda?: string;
  responsavel_recolhimento?: ResponsavelRecolhimento | null;
  valor_produtos_cents: number;
  frete_cents: number;
  seguro_cents: number;
  outras_despesas_cents: number;
  descontos_cents: number;
  comissao_tipo?: 'percentual' | 'fixo' | null;
  comissao_valor?: number | null;
  itens: SimulationItemInput[];
}

export interface MemoriaPasso {
  titulo: string;
  detalhe: string;
  formula?: string;
  resultado?: string;
}

export interface CalculationResult {
  needs_review: boolean;
  review_reason?: string;
  rule_id?: string | null;
  valor_operacao_cents: number;
  base_calculo_cents: number;
  aliquota_interestadual: number | null;
  aliquota_interna: number | null;
  percentual_difal: number | null;
  icms_interestadual_cents: number;
  difal_cents: number;
  fcp_percentual: number | null;
  fcp_cents: number;
  total_estimado_cents: number;
  responsavel_recolhimento: ResponsavelRecolhimento | null;
  regra_vigencia_inicio: string | null;
  regra_fonte: string | null;
  nivel_confianca: NivelConfianca | null;
  observacoes_fiscais: string[];
  memoria_calculo: MemoriaPasso[];
  parametros: Record<string, unknown>;
}

export const DIFAL_DISCLAIMER =
  'Este resultado é uma estimativa baseada nos parâmetros e regras cadastrados no sistema. ' +
  'Ele não substitui a validação de um contador, advogado tributarista ou responsável fiscal.';
