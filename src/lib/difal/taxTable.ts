/**
 * Parâmetros usados exclusivamente no simulador rápido público.
 *
 * A simulação fiscal completa continua usando `difal_tax_rules`, com vigência,
 * fonte e regra por operação armazenadas no banco. Esta tabela permite que a
 * prévia selecione as 27 UFs sem aplicar uma alíquota de destino genérica.
 */

export interface StateTaxInfo {
  uf: string;
  nome: string;
  regiao: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';
  aliquotaInterna: number;
  fcpPadrao: number;
}

const estados = [
  ['AC', 'Acre', 'Norte', 17, 0],
  ['AL', 'Alagoas', 'Nordeste', 19, 0],
  ['AP', 'Amapá', 'Norte', 18, 0],
  ['AM', 'Amazonas', 'Norte', 20, 2],
  ['BA', 'Bahia', 'Nordeste', 20.5, 2],
  ['CE', 'Ceará', 'Nordeste', 20, 2],
  ['DF', 'Distrito Federal', 'Centro-Oeste', 20, 0],
  ['ES', 'Espírito Santo', 'Sudeste', 17, 0],
  ['GO', 'Goiás', 'Centro-Oeste', 19, 0],
  ['MA', 'Maranhão', 'Nordeste', 22, 0],
  ['MT', 'Mato Grosso', 'Centro-Oeste', 17, 0],
  ['MS', 'Mato Grosso do Sul', 'Centro-Oeste', 17, 0],
  ['MG', 'Minas Gerais', 'Sudeste', 18, 0],
  ['PA', 'Pará', 'Norte', 19, 0],
  ['PB', 'Paraíba', 'Nordeste', 20, 0],
  ['PR', 'Paraná', 'Sul', 19.5, 0],
  ['PE', 'Pernambuco', 'Nordeste', 20.5, 2],
  ['PI', 'Piauí', 'Nordeste', 21, 0],
  ['RJ', 'Rio de Janeiro', 'Sudeste', 20, 2],
  ['RN', 'Rio Grande do Norte', 'Nordeste', 20, 0],
  ['RS', 'Rio Grande do Sul', 'Sul', 17, 0],
  ['RO', 'Rondônia', 'Norte', 17.5, 0],
  ['RR', 'Roraima', 'Norte', 20, 0],
  ['SC', 'Santa Catarina', 'Sul', 17, 0],
  ['SP', 'São Paulo', 'Sudeste', 18, 0],
  ['SE', 'Sergipe', 'Nordeste', 19, 0],
  ['TO', 'Tocantins', 'Norte', 20, 0],
] as const;

export const BRAZIL_STATES_TAX_DATA: Record<string, StateTaxInfo> = Object.fromEntries(
  estados.map(([uf, nome, regiao, aliquotaInterna, fcpPadrao]) => [
    uf,
    { uf, nome, regiao, aliquotaInterna, fcpPadrao },
  ]),
);

/** Estados de origem que aplicam 7% para N, NE, CO e ES. */
export const SUL_SUDESTE_ORIGEM = ['SP', 'RJ', 'MG', 'PR', 'RS', 'SC'];

/**
 * Resolução do Senado Federal nº 22/1989: 7% de S/SE (exceto ES) para
 * N/NE/CO/ES e 12% nas demais operações interestaduais. Produtos importados
 * usam 4% pela Resolução nº 13/2012.
 */
export function getAliquotaInterestadual(ufOrigem: string, ufDestino: string, isImportado = false): number {
  if (!ufOrigem || !ufDestino || ufOrigem === ufDestino) return 0;
  if (isImportado) return 4;

  const origemSulSudeste = SUL_SUDESTE_ORIGEM.includes(ufOrigem);
  const destinoNorteNordesteCentroOesteOuES = !SUL_SUDESTE_ORIGEM.includes(ufDestino) || ufDestino === 'ES';

  return origemSulSudeste && destinoNorteNordesteCentroOesteOuES ? 7 : 12;
}

export interface QuickDifalResult {
  origem: string;
  destino: string;
  aliquotaInterestadual: number;
  aliquotaInternaDestino: number;
  diferencialApurado: number;
  fcpPercentual: number;
  difalValor: number;
  fcpValor: number;
  totalEstimado: number;
}

/** Cálculo de prévia, sem base dupla, NCM ou regras específicas de produto. */
export function calcularDifalRapido({
  origem,
  destino,
  valor,
  comFcp = true,
  isImportado = false,
}: {
  origem: string;
  destino: string;
  valor: number;
  destinatarioContribuinte?: boolean;
  comFcp?: boolean;
  isImportado?: boolean;
}): QuickDifalResult {
  const infoDestino = BRAZIL_STATES_TAX_DATA[destino];
  const mesmaUf = origem === destino;
  const aliquotaInterestadual = getAliquotaInterestadual(origem, destino, isImportado);
  const aliquotaInternaDestino = infoDestino?.aliquotaInterna ?? 0;
  const diferencialApurado = mesmaUf ? 0 : Math.max(0, aliquotaInternaDestino - aliquotaInterestadual);
  const fcpPercentual = !mesmaUf && comFcp ? (infoDestino?.fcpPadrao ?? 0) : 0;
  const base = Math.max(0, valor);
  const difalValor = base * (diferencialApurado / 100);
  const fcpValor = base * (fcpPercentual / 100);

  return {
    origem,
    destino,
    aliquotaInterestadual,
    aliquotaInternaDestino,
    diferencialApurado,
    fcpPercentual,
    difalValor,
    fcpValor,
    totalEstimado: difalValor + fcpValor,
  };
}
