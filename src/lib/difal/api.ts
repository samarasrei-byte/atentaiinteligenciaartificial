import { supabase } from '@/integrations/supabase/client';
import type { CalculationResult, SimulationInput, TaxRule } from './types';

/** Regras ativas para um destino (ou todas, quando destino não informado). */
export async function fetchRules(ufDestino?: string): Promise<TaxRule[]> {
  let query = supabase.from('difal_tax_rules').select('*').eq('status', 'ativo');
  if (ufDestino) query = query.eq('uf_destino', ufDestino);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as TaxRule[];
}

export async function fetchAllRules(): Promise<TaxRule[]> {
  const { data, error } = await supabase
    .from('difal_tax_rules')
    .select('*')
    .order('uf_destino', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as TaxRule[];
}

export interface SaveSimulationArgs {
  input: SimulationInput;
  result?: CalculationResult | null;
  companyId?: string | null;
  status: 'rascunho' | 'calculada' | 'revisao';
  userEmail?: string | null;
}

export async function saveSimulation({
  input,
  result,
  companyId,
  status,
  userEmail,
}: SaveSimulationArgs): Promise<string> {
  const valorTotal =
    input.valor_produtos_cents +
    input.frete_cents +
    input.seguro_cents +
    input.outras_despesas_cents -
    input.descontos_cents;

  const { data: sim, error } = await supabase
    .from('difal_simulations')
    .insert({
      company_id: companyId ?? null,
      created_by_email: userEmail ?? null,
      data_operacao: input.data_operacao,
      uf_origem: input.uf_origem,
      uf_destino: input.uf_destino,
      tipo_operacao: input.tipo_operacao,
      finalidade: input.finalidade,
      destinatario_contribuinte: input.destinatario_contribuinte,
      regime_vendedor: input.regime_vendedor ?? null,
      regime_comprador: input.regime_comprador ?? null,
      canal_venda: input.canal_venda ?? null,
      responsavel_recolhimento: input.responsavel_recolhimento ?? null,
      valor_produtos_cents: input.valor_produtos_cents,
      frete_cents: input.frete_cents,
      seguro_cents: input.seguro_cents,
      outras_despesas_cents: input.outras_despesas_cents,
      descontos_cents: input.descontos_cents,
      valor_total_cents: valorTotal,
      comissao_tipo: input.comissao_tipo ?? null,
      comissao_valor: input.comissao_valor ?? null,
      status,
    })
    .select('id')
    .single();

  if (error) throw error;
  const simulationId = sim.id as string;

  if (input.itens.length) {
    const { error: itemsError } = await supabase.from('difal_simulation_items').insert(
      input.itens.map((i) => ({
        simulation_id: simulationId,
        descricao: i.descricao,
        codigo_interno: i.codigo_interno ?? null,
        ncm: i.ncm ?? null,
        cest: i.cest ?? null,
        cfop: i.cfop ?? null,
        quantidade: i.quantidade,
        valor_unitario_cents: i.valor_unitario_cents,
        desconto_cents: i.desconto_cents,
        substituicao_tributaria: i.substituicao_tributaria,
        sujeito_fcp: i.sujeito_fcp,
        fcp_percentual: i.fcp_percentual ?? null,
      })),
    );
    if (itemsError) throw itemsError;
  }

  if (result) {
    const { error: resError } = await supabase.from('difal_calculation_results').insert({
      simulation_id: simulationId,
      rule_id: result.rule_id ?? null,
      valor_operacao_cents: result.valor_operacao_cents,
      base_calculo_cents: result.base_calculo_cents,
      aliquota_interestadual: result.aliquota_interestadual,
      aliquota_interna: result.aliquota_interna,
      percentual_difal: result.percentual_difal,
      icms_interestadual_cents: result.icms_interestadual_cents,
      difal_cents: result.difal_cents,
      fcp_percentual: result.fcp_percentual,
      fcp_cents: result.fcp_cents,
      total_estimado_cents: result.total_estimado_cents,
      responsavel_recolhimento: result.responsavel_recolhimento,
      regra_vigencia_inicio: result.regra_vigencia_inicio,
      regra_fonte: result.regra_fonte,
      nivel_confianca: result.nivel_confianca,
      needs_review: result.needs_review,
      review_reason: result.review_reason ?? null,
      memoria_calculo: result.memoria_calculo as unknown as never,
      parametros: result.parametros as unknown as never,
    });
    if (resError) throw resError;
  }

  return simulationId;
}
