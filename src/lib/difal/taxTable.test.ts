import { describe, expect, it } from 'vitest';
import {
  BRAZIL_STATES_TAX_DATA,
  calcularDifalRapido,
  getAliquotaInterestadual,
} from './taxTable';

describe('tabela do simulador rápido DIFAL', () => {
  it('possui parâmetros para as 27 unidades federativas', () => {
    expect(Object.keys(BRAZIL_STATES_TAX_DATA)).toHaveLength(27);
  });

  it('aplica 7% de São Paulo para Bahia', () => {
    expect(getAliquotaInterestadual('SP', 'BA')).toBe(7);
  });

  it('aplica 12% nas demais operações interestaduais', () => {
    expect(getAliquotaInterestadual('BA', 'SP')).toBe(12);
    expect(getAliquotaInterestadual('SP', 'RJ')).toBe(12);
  });

  it('aplica 4% a produtos importados', () => {
    expect(getAliquotaInterestadual('SP', 'BA', true)).toBe(4);
  });

  it('reproduz a prévia SP para BA de R$ 1.000,00', () => {
    const resultado = calcularDifalRapido({ origem: 'SP', destino: 'BA', valor: 1000 });

    expect(resultado.aliquotaInterestadual).toBe(7);
    expect(resultado.aliquotaInternaDestino).toBe(20.5);
    expect(resultado.diferencialApurado).toBe(13.5);
    expect(resultado.fcpPercentual).toBe(2);
    expect(resultado.totalEstimado).toBe(155);
  });

  it('zera DIFAL para operação dentro da mesma UF', () => {
    const resultado = calcularDifalRapido({ origem: 'SP', destino: 'SP', valor: 1000 });

    expect(resultado.totalEstimado).toBe(0);
    expect(resultado.diferencialApurado).toBe(0);
  });
});
