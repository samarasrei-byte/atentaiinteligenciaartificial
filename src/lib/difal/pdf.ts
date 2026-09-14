import jsPDF from 'jspdf';
import { brl, dateBR, dateTimeBR, perc } from './format';
import { DIFAL_DISCLAIMER, type CalculationResult, type SimulationInput } from './types';

interface ExportArgs {
  input: SimulationInput;
  result: CalculationResult;
  empresa?: { razao_social?: string | null; cnpj?: string | null } | null;
  usuario?: string | null;
  numero?: number | string | null;
}

/** Gera o relatório PDF da simulação, com memória de cálculo e aviso de estimativa. */
export function exportSimulationPdf({ input, result, empresa, usuario, numero }: ExportArgs) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 48;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  let y = margin;

  const line = (text: string, size = 10, bold = false, gap = 14) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    const chunks = doc.splitTextToSize(text, width);
    chunks.forEach((chunk: string) => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(chunk, margin, y);
      y += gap;
    });
  };

  line('AtentAI — DIFAL Marketplace', 16, true, 20);
  line('Relatório de simulação de DIFAL e FCP', 11, false, 20);

  line('Identificação', 12, true);
  line(`Simulação: ${numero ?? '—'}`);
  line(`Empresa: ${empresa?.razao_social ?? 'Não informada'}${empresa?.cnpj ? ` — CNPJ ${empresa.cnpj}` : ''}`);
  line(`Usuário: ${usuario ?? '—'}`);
  line(`Emitido em: ${dateTimeBR(new Date().toISOString())}`, 10, false, 20);

  line('Operação', 12, true);
  line(`Data: ${dateBR(input.data_operacao)} · ${input.uf_origem} → ${input.uf_destino}`);
  line(`Tipo: ${input.tipo_operacao} · Finalidade: ${input.finalidade === 'consumo' ? 'consumidor final' : 'revenda'}`);
  line(`Destinatário: ${input.destinatario_contribuinte ? 'contribuinte' : 'não contribuinte'} · Canal: ${input.canal_venda ?? '—'}`);
  line(`Regimes: vendedor ${input.regime_vendedor ?? '—'} · comprador ${input.regime_comprador ?? '—'}`, 10, false, 20);

  line('Produtos e NCM', 12, true);
  input.itens.forEach((i, idx) => {
    line(
      `${idx + 1}. ${i.descricao} · NCM ${i.ncm ?? '—'} · CEST ${i.cest ?? '—'} · CFOP ${i.cfop ?? '—'} · ` +
        `Qtd ${i.quantidade} × ${brl(i.valor_unitario_cents)} · ST: ${i.substituicao_tributaria ? 'sim' : 'não'} · FCP: ${i.sujeito_fcp ? 'sim' : 'não'}`,
    );
  });
  y += 6;

  line('Resultado estimado', 12, true);
  if (result.needs_review) {
    line(`REVISÃO NECESSÁRIA: ${result.review_reason ?? ''}`, 10, true, 20);
  } else {
    line(`Valor da operação: ${brl(result.valor_operacao_cents)}`);
    line(`Base de cálculo: ${brl(result.base_calculo_cents)}`);
    line(`Alíquota interestadual: ${perc(result.aliquota_interestadual)}`);
    line(`Alíquota interna do destino: ${perc(result.aliquota_interna)}`);
    line(`Percentual de DIFAL: ${perc(result.percentual_difal)}`);
    line(`ICMS interestadual: ${brl(result.icms_interestadual_cents)}`);
    line(`DIFAL: ${brl(result.difal_cents)}`);
    line(`FCP (${perc(result.fcp_percentual)}): ${brl(result.fcp_cents)}`, 10, true);
    line(`Total estimado: ${brl(result.total_estimado_cents)}`, 11, true);
    line(`Responsável pelo recolhimento: ${result.responsavel_recolhimento ?? '—'}`);
    line(`Regra vigente desde: ${dateBR(result.regra_vigencia_inicio)} · Fonte: ${result.regra_fonte ?? '—'}`);
    line(`Nível de confiança: ${result.nivel_confianca ?? '—'}`, 10, false, 20);

    line('Memória de cálculo', 12, true);
    result.memoria_calculo.forEach((p) => {
      line(p.titulo, 10, true, 13);
      line(p.detalhe, 9, false, 12);
      if (p.formula) line(p.formula, 9, false, 12);
      if (p.resultado) line(`= ${p.resultado}`, 9, true, 16);
    });

    if (result.observacoes_fiscais.length) {
      line('Observações fiscais', 12, true);
      result.observacoes_fiscais.forEach((o) => line(`• ${o}`, 9, false, 12));
      y += 8;
    }
  }

  line(DIFAL_DISCLAIMER, 9, true, 12);

  doc.save(`difal-simulacao-${numero ?? Date.now()}.pdf`);
}
