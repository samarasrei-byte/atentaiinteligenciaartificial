import { describe, expect, it } from 'vitest';
import { calcularDifal, resolveRule } from './engine';
import type { SimulationInput, TaxRule } from './types';

const baseRule: TaxRule = {
  id: 'rule-sp-rj',
  uf_origem: 'SP',
  uf_destino: 'RJ',
  tipo_operacao: 'venda',
  aliquota_interna: 20,
  aliquota_interestadual: 12,
  fcp_percentual: 2,
  base_calculo_metodo: 'simples',
  responsavel_recolhimento: 'remetente',
  vigencia_inicio: '2026-01-01',
  vigencia_fim: null,
  fonte_oficial: 'SEFAZ-RJ',
  norma: 'Lei 000/2026',
  nivel_confianca: 'demonstrativo',
  is_demo: true,
  status: 'ativo',
};

const item = (over: Partial<SimulationInput['itens'][number]> = {}) => ({
  descricao: 'Produto',
  quantidade: 1,
  valor_unitario_cents: 100000,
  desconto_cents: 0,
  substituicao_tributaria: false,
  sujeito_fcp: false,
  ...over,
});

const input = (over: Partial<SimulationInput> = {}): SimulationInput => ({
  data_operacao: '2026-03-10',
  uf_origem: 'SP',
  uf_destino: 'RJ',
  tipo_operacao: 'venda',
  finalidade: 'consumo',
  destinatario_contribuinte: false,
  valor_produtos_cents: 100000,
  frete_cents: 0,
  seguro_cents: 0,
  outras_despesas_cents: 0,
  descontos_cents: 0,
  itens: [item()],
  ...over,
});

describe('motor DIFAL', () => {
  it('calcula operação entre estados diferentes', () => {
    const r = calcularDifal(input(), [baseRule]);
    expect(r.needs_review).toBe(false);
    expect(r.base_calculo_cents).toBe(100000);
    expect(r.percentual_difal).toBe(8);
    expect(r.difal_cents).toBe(8000);
    expect(r.icms_interestadual_cents).toBe(12000);
  });

  it('sinaliza revisão quando não há regra cadastrada', () => {
    const r = calcularDifal(input({ uf_destino: 'BA' }), [baseRule]);
    expect(r.needs_review).toBe(true);
    expect(r.difal_cents).toBe(0);
    expect(r.review_reason).toContain('regra fiscal ativa');
  });

  it('calcula FCP apenas sobre itens sujeitos ao fundo', () => {
    const r = calcularDifal(
      input({ itens: [item({ sujeito_fcp: true, fcp_percentual: 2 })] }),
      [baseRule],
    );
    expect(r.fcp_cents).toBe(2000);
    expect(r.total_estimado_cents).toBe(10000);
  });

  it('aceita múltiplos itens e proporcionaliza o FCP', () => {
    const r = calcularDifal(
      input({
        valor_produtos_cents: 200000,
        itens: [item({ sujeito_fcp: true, fcp_percentual: 2 }), item()],
      }),
      [baseRule],
    );
    expect(r.base_calculo_cents).toBe(200000);
    expect(r.fcp_cents).toBe(2000); // metade da base × 2%
  });

  it('considera desconto, frete e seguro na base', () => {
    const r = calcularDifal(
      input({ frete_cents: 20000, seguro_cents: 5000, descontos_cents: 10000 }),
      [baseRule],
    );
    expect(r.base_calculo_cents).toBe(115000);
    expect(r.difal_cents).toBe(9200);
  });

  it('anota observação para destinatário contribuinte em revenda', () => {
    const r = calcularDifal(
      input({ finalidade: 'revenda', destinatario_contribuinte: true }),
      [baseRule],
    );
    expect(r.observacoes_fiscais.join(' ')).toContain('revenda');
  });

  it('respeita a vigência da regra', () => {
    const antiga: TaxRule = { ...baseRule, id: 'antiga', aliquota_interna: 18, vigencia_fim: '2026-02-28' };
    const nova: TaxRule = { ...baseRule, id: 'nova', vigencia_inicio: '2026-03-01' };
    expect(resolveRule([antiga, nova], input())?.id).toBe('nova');
    expect(
      resolveRule([antiga, nova], input({ data_operacao: '2026-01-15' }))?.id,
    ).toBe('antiga');
  });

  it('ignora regra arquivada', () => {
    const r = calcularDifal(input(), [{ ...baseRule, status: 'arquivado' }]);
    expect(r.needs_review).toBe(true);
  });

  it('recusa dados incompletos', () => {
    expect(calcularDifal(input({ itens: [] }), [baseRule]).needs_review).toBe(true);
    expect(calcularDifal(input({ uf_destino: 'SP' }), [baseRule]).needs_review).toBe(true);
    expect(
      calcularDifal(input({ valor_produtos_cents: 0 }), [baseRule]).needs_review,
    ).toBe(true);
  });

  it('aplica base dupla quando a regra exige', () => {
    const r = calcularDifal(input(), [{ ...baseRule, base_calculo_metodo: 'dupla' }]);
    expect(r.base_calculo_cents).toBe(110000); // 100000 × 0,88 / 0,80
  });
});
