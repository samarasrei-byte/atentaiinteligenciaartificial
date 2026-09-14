/**
 * Motor de cálculo do DIFAL — puro, testável e sem alíquotas embutidas.
 *
 * Todas as alíquotas, vigências e responsabilidades vêm de `difal_tax_rules`
 * (banco de dados). Quando faltar regra ou dado obrigatório, o motor NÃO
 * inventa valores: devolve `needs_review = true` com o motivo.
 */

import type {
  CalculationResult,
  MemoriaPasso,
  SimulationInput,
  TaxRule,
} from './types';

const round = (n: number) => Math.round(n);

const pct = (v: number) => `${v.toFixed(2).replace('.', ',')}%`;

const brl = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

/** Seleciona a regra vigente e ativa para a operação. */
export function resolveRule(
  rules: TaxRule[],
  input: Pick<SimulationInput, 'uf_origem' | 'uf_destino' | 'data_operacao' | 'tipo_operacao'>,
): TaxRule | null {
  const data = input.data_operacao;
  const candidatas = rules.filter((r) => {
    if (r.status !== 'ativo') return false;
    if (r.uf_destino !== input.uf_destino) return false;
    if (r.uf_origem && r.uf_origem !== input.uf_origem) return false;
    if (r.tipo_operacao && input.tipo_operacao && r.tipo_operacao !== input.tipo_operacao) return false;
    if (r.vigencia_inicio > data) return false;
    if (r.vigencia_fim && r.vigencia_fim < data) return false;
    return true;
  });

  if (candidatas.length === 0) return null;

  // Preferir regra específica de origem e a vigência mais recente.
  return candidatas.sort((a, b) => {
    const espec = Number(Boolean(b.uf_origem)) - Number(Boolean(a.uf_origem));
    if (espec !== 0) return espec;
    return b.vigencia_inicio.localeCompare(a.vigencia_inicio);
  })[0];
}

function emptyResult(motivo: string, input: SimulationInput): CalculationResult {
  return {
    needs_review: true,
    review_reason: motivo,
    rule_id: null,
    valor_operacao_cents: 0,
    base_calculo_cents: 0,
    aliquota_interestadual: null,
    aliquota_interna: null,
    percentual_difal: null,
    icms_interestadual_cents: 0,
    difal_cents: 0,
    fcp_percentual: null,
    fcp_cents: 0,
    total_estimado_cents: 0,
    responsavel_recolhimento: null,
    regra_vigencia_inicio: null,
    regra_fonte: null,
    nivel_confianca: null,
    observacoes_fiscais: [motivo],
    memoria_calculo: [],
    parametros: { ...input, itens: input.itens?.length ?? 0 },
  };
}

export function validateInput(input: SimulationInput): string | null {
  if (!input.data_operacao) return 'Informe a data da operação.';
  if (!input.uf_origem) return 'Informe a UF de origem.';
  if (!input.uf_destino) return 'Informe a UF de destino.';
  if (input.uf_origem === input.uf_destino)
    return 'Operação interna (mesma UF de origem e destino): não há DIFAL interestadual a calcular.';
  if (!input.itens || input.itens.length === 0) return 'Adicione ao menos um item à operação.';
  const soma =
    input.valor_produtos_cents + input.frete_cents + input.seguro_cents + input.outras_despesas_cents;
  if (soma <= 0) return 'Informe os valores da operação.';
  if (input.descontos_cents > soma) return 'O desconto não pode ser maior que o valor da operação.';
  return null;
}

export function calcularDifal(input: SimulationInput, rules: TaxRule[]): CalculationResult {
  const erro = validateInput(input);
  if (erro) return emptyResult(erro, input);

  const rule = resolveRule(rules, input);
  if (!rule) {
    return emptyResult(
      `Não há regra fiscal ativa e vigente cadastrada para ${input.uf_origem} → ${input.uf_destino} em ${input.data_operacao}. ` +
        'A simulação precisa de configuração administrativa.',
      input,
    );
  }

  if (rule.aliquota_interna == null || rule.aliquota_interestadual == null) {
    return emptyResult('A regra encontrada está incompleta (alíquotas não cadastradas).', input);
  }

  const memoria: MemoriaPasso[] = [];
  const observacoes: string[] = [];

  // 1. Base de cálculo
  const valorOperacao =
    input.valor_produtos_cents +
    input.frete_cents +
    input.seguro_cents +
    input.outras_despesas_cents -
    input.descontos_cents;

  memoria.push({
    titulo: '1. Formação da base de cálculo',
    detalhe:
      'Produtos + frete + seguro + outras despesas acessórias − descontos, conforme os valores informados na operação.',
    formula: `${brl(input.valor_produtos_cents)} + ${brl(input.frete_cents)} + ${brl(
      input.seguro_cents,
    )} + ${brl(input.outras_despesas_cents)} − ${brl(input.descontos_cents)}`,
    resultado: brl(valorOperacao),
  });

  let base = valorOperacao;
  if (rule.base_calculo_metodo === 'dupla') {
    const fator = (1 - rule.aliquota_interestadual / 100) / (1 - rule.aliquota_interna / 100);
    base = round(valorOperacao * fator);
    memoria.push({
      titulo: '1b. Base dupla (por dentro)',
      detalhe:
        'A regra cadastrada usa base dupla: exclui o ICMS interestadual e inclui o ICMS interno do destino.',
      formula: `${brl(valorOperacao)} × (1 − ${pct(rule.aliquota_interestadual)}) ÷ (1 − ${pct(
        rule.aliquota_interna,
      )})`,
      resultado: brl(base),
    });
  }

  // 2 e 3. Alíquotas
  memoria.push({
    titulo: '2. Alíquota interestadual utilizada',
    detalhe: `Regra cadastrada para ${rule.uf_origem ?? 'qualquer origem'} → ${rule.uf_destino}, vigente desde ${rule.vigencia_inicio}.`,
    resultado: pct(rule.aliquota_interestadual),
  });
  memoria.push({
    titulo: '3. Alíquota interna do estado de destino',
    detalhe: `Alíquota interna cadastrada para ${rule.uf_destino}${rule.norma ? ` (${rule.norma})` : ''}.`,
    resultado: pct(rule.aliquota_interna),
  });

  // 4. DIFAL
  const percentualDifal = rule.aliquota_interna - rule.aliquota_interestadual;
  const icmsInterestadual = round(base * (rule.aliquota_interestadual / 100));
  let difal = percentualDifal > 0 ? round(base * (percentualDifal / 100)) : 0;

  if (percentualDifal <= 0) {
    observacoes.push(
      'A alíquota interna do destino não é superior à interestadual: não há diferencial a recolher nesta parametrização.',
    );
  }

  memoria.push({
    titulo: '4. Cálculo do DIFAL',
    detalhe: 'Diferença entre a alíquota interna do destino e a alíquota interestadual, aplicada sobre a base.',
    formula: `${brl(base)} × (${pct(rule.aliquota_interna)} − ${pct(rule.aliquota_interestadual)})`,
    resultado: brl(difal),
  });

  // 5. FCP — proporcional aos itens sujeitos ao fundo
  const totalItens = input.itens.reduce(
    (acc, i) => acc + i.quantidade * i.valor_unitario_cents - i.desconto_cents,
    0,
  );
  const itensFcp = input.itens.filter((i) => i.sujeito_fcp);
  const totalFcpItens = itensFcp.reduce(
    (acc, i) => acc + i.quantidade * i.valor_unitario_cents - i.desconto_cents,
    0,
  );

  const proporcaoFcp = totalItens > 0 ? totalFcpItens / totalItens : 0;
  const fcpPercentual = itensFcp.length
    ? itensFcp.reduce((acc, i) => acc + (i.fcp_percentual ?? rule.fcp_percentual ?? 0), 0) / itensFcp.length
    : rule.fcp_percentual ?? 0;

  const baseFcp = round(base * proporcaoFcp);
  const fcp = round(baseFcp * (fcpPercentual / 100));

  memoria.push({
    titulo: '5. Cálculo do FCP',
    detalhe: itensFcp.length
      ? `${itensFcp.length} de ${input.itens.length} item(ns) marcados como sujeitos ao FCP, correspondendo a ${(proporcaoFcp * 100).toFixed(2).replace('.', ',')}% da base.`
      : 'Nenhum item foi marcado como sujeito ao FCP nesta operação.',
    formula: itensFcp.length ? `${brl(baseFcp)} × ${pct(fcpPercentual)}` : '—',
    resultado: brl(fcp),
  });

  // 6. Parâmetros e tratamentos
  const tratamento = input.destinatario_contribuinte
    ? rule.trat_consumidor_final_contribuinte
    : rule.trat_consumidor_final_nao_contribuinte;

  if (tratamento) observacoes.push(tratamento);
  if (input.finalidade === 'revenda' && rule.trat_revenda) observacoes.push(rule.trat_revenda);
  if (input.canal_venda && rule.trat_marketplace) observacoes.push(rule.trat_marketplace);
  if (input.itens.some((i) => i.substituicao_tributaria)) {
    observacoes.push(
      'Há itens sujeitos à substituição tributária: o ICMS-ST pode substituir o DIFAL nesta operação. Confirme com o responsável fiscal.',
    );
  }
  if (rule.is_demo) {
    observacoes.push(
      'Regra marcada como DEMONSTRATIVA: ainda não foi revisada por um responsável fiscal.',
    );
  }
  if (input.finalidade === 'revenda' && input.destinatario_contribuinte) {
    observacoes.push(
      'Aquisição para revenda por contribuinte: em regra não há DIFAL de consumo final. Revise o enquadramento da operação.',
    );
  }

  memoria.push({
    titulo: '6. Regras e parâmetros considerados',
    detalhe: [
      `Finalidade: ${input.finalidade === 'consumo' ? 'consumidor final' : 'revenda'}`,
      `Destinatário: ${input.destinatario_contribuinte ? 'contribuinte de ICMS' : 'não contribuinte'}`,
      `Regime do vendedor: ${input.regime_vendedor ?? 'não informado'}`,
      `Regime do comprador: ${input.regime_comprador ?? 'não informado'}`,
      `Canal de venda: ${input.canal_venda ?? 'não informado'}`,
      `Responsável pelo recolhimento: ${input.responsavel_recolhimento ?? rule.responsavel_recolhimento}`,
      `Método de base: ${rule.base_calculo_metodo === 'dupla' ? 'base dupla' : 'base simples'}`,
      `Vigência da regra: desde ${rule.vigencia_inicio}${rule.vigencia_fim ? ` até ${rule.vigencia_fim}` : ''}`,
      `Fonte: ${rule.fonte_oficial ?? 'não informada'}`,
    ].join(' · '),
  });

  const total = difal + fcp;

  return {
    needs_review: false,
    rule_id: rule.id,
    valor_operacao_cents: valorOperacao,
    base_calculo_cents: base,
    aliquota_interestadual: rule.aliquota_interestadual,
    aliquota_interna: rule.aliquota_interna,
    percentual_difal: Math.max(percentualDifal, 0),
    icms_interestadual_cents: icmsInterestadual,
    difal_cents: difal,
    fcp_percentual: itensFcp.length ? fcpPercentual : 0,
    fcp_cents: fcp,
    total_estimado_cents: total,
    responsavel_recolhimento: input.responsavel_recolhimento ?? rule.responsavel_recolhimento,
    regra_vigencia_inicio: rule.vigencia_inicio,
    regra_fonte: rule.fonte_oficial ?? null,
    nivel_confianca: rule.nivel_confianca,
    observacoes_fiscais: observacoes,
    memoria_calculo: memoria,
    parametros: {
      uf_origem: input.uf_origem,
      uf_destino: input.uf_destino,
      data_operacao: input.data_operacao,
      tipo_operacao: input.tipo_operacao,
      finalidade: input.finalidade,
      destinatario_contribuinte: input.destinatario_contribuinte,
      regime_vendedor: input.regime_vendedor ?? null,
      regime_comprador: input.regime_comprador ?? null,
      canal_venda: input.canal_venda ?? null,
      base_calculo_metodo: rule.base_calculo_metodo,
      regra_id: rule.id,
      regra_norma: rule.norma ?? null,
      itens: input.itens.length,
    },
  };
}
