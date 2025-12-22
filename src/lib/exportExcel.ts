import * as XLSX from 'xlsx';
import { SimulationResult, sectors, companyTypes, brazilianStates, formatCurrency } from './taxData';

export function exportSimulationToExcel(result: SimulationResult): void {
  const sectorLabel = sectors.find(s => s.value === result.input.sector)?.label || result.input.sector;
  const companyLabel = companyTypes.find(c => c.value === result.input.companyType)?.label || result.input.companyType;
  const stateLabel = result.input.state 
    ? brazilianStates.find(s => s.value === result.input.state)?.label || result.input.state
    : 'Padrão do setor';

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Sheet 1: Resumo
  const resumoData = [
    ['SIMULAÇÃO DE IMPACTO TRIBUTÁRIO'],
    ['Reforma Tributária 2026'],
    [''],
    ['DADOS DA EMPRESA'],
    ['Faturamento Mensal', formatCurrency(result.input.revenue)],
    ['Setor', sectorLabel],
    ['Regime Tributário', companyLabel],
    ['Estado', stateLabel],
    ['Data da Simulação', new Date().toLocaleDateString('pt-BR')],
    [''],
    ['RESULTADO'],
    ['', 'Sistema Atual', 'Reforma 2026', 'Diferença'],
    ['Total de Impostos', formatCurrency(result.beforeTaxes.total), formatCurrency(result.afterTaxes.total), formatCurrency(result.difference)],
    ['Variação (%)', '', '', `${result.percentChange.toFixed(2)}%`],
  ];
  
  const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
  
  // Set column widths
  wsResumo['!cols'] = [
    { wch: 25 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
  ];
  
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

  // Sheet 2: Detalhamento Sistema Atual
  const atualData = [
    ['SISTEMA TRIBUTÁRIO ATUAL'],
    [''],
    ['Imposto', 'Valor (R$)', 'Alíquota Efetiva (%)'],
    ['ICMS', formatCurrency(result.beforeTaxes.icms), result.beforeTaxes.icms > 0 ? ((result.beforeTaxes.icms / result.input.revenue) * 100).toFixed(2) + '%' : '0%'],
    ['ISS', formatCurrency(result.beforeTaxes.iss), result.beforeTaxes.iss > 0 ? ((result.beforeTaxes.iss / result.input.revenue) * 100).toFixed(2) + '%' : '0%'],
    ['PIS', formatCurrency(result.beforeTaxes.pis), ((result.beforeTaxes.pis / result.input.revenue) * 100).toFixed(2) + '%'],
    ['COFINS', formatCurrency(result.beforeTaxes.cofins), ((result.beforeTaxes.cofins / result.input.revenue) * 100).toFixed(2) + '%'],
    ['IPI', formatCurrency(result.beforeTaxes.ipi), result.beforeTaxes.ipi > 0 ? ((result.beforeTaxes.ipi / result.input.revenue) * 100).toFixed(2) + '%' : '0%'],
    [''],
    ['TOTAL', formatCurrency(result.beforeTaxes.total), ((result.beforeTaxes.total / result.input.revenue) * 100).toFixed(2) + '%'],
  ];
  
  const wsAtual = XLSX.utils.aoa_to_sheet(atualData);
  wsAtual['!cols'] = [{ wch: 20 }, { wch: 18 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsAtual, 'Sistema Atual');

  // Sheet 3: Detalhamento Novo Sistema
  const novoData = [
    ['NOVO SISTEMA TRIBUTÁRIO (2026+)'],
    [''],
    ['Imposto', 'Valor (R$)', 'Alíquota Efetiva (%)'],
    ['IBS (Estadual/Municipal)', formatCurrency(result.afterTaxes.ibs), ((result.afterTaxes.ibs / result.input.revenue) * 100).toFixed(2) + '%'],
    ['CBS (Federal)', formatCurrency(result.afterTaxes.cbs), ((result.afterTaxes.cbs / result.input.revenue) * 100).toFixed(2) + '%'],
    ['Imposto Seletivo', formatCurrency(result.afterTaxes.is), result.afterTaxes.is > 0 ? ((result.afterTaxes.is / result.input.revenue) * 100).toFixed(2) + '%' : '0%'],
    [''],
    ['TOTAL', formatCurrency(result.afterTaxes.total), ((result.afterTaxes.total / result.input.revenue) * 100).toFixed(2) + '%'],
    [''],
    ['OBSERVAÇÕES'],
    ['• IBS substituirá ICMS e ISS'],
    ['• CBS substituirá PIS e COFINS'],
    ['• Imposto Seletivo incide sobre produtos específicos'],
    ['• Créditos calculados com base no regime tributário'],
  ];
  
  const wsNovo = XLSX.utils.aoa_to_sheet(novoData);
  wsNovo['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsNovo, 'Reforma 2026');

  // Sheet 4: Análise Comparativa
  const comparativoData = [
    ['ANÁLISE COMPARATIVA'],
    [''],
    ['Indicador', 'Sistema Atual', 'Reforma 2026'],
    ['Carga Tributária Total', formatCurrency(result.beforeTaxes.total), formatCurrency(result.afterTaxes.total)],
    ['Carga Tributária (%)', ((result.beforeTaxes.total / result.input.revenue) * 100).toFixed(2) + '%', ((result.afterTaxes.total / result.input.revenue) * 100).toFixed(2) + '%'],
    ['Receita Líquida', formatCurrency(result.input.revenue - result.beforeTaxes.total), formatCurrency(result.input.revenue - result.afterTaxes.total)],
    [''],
    ['IMPACTO'],
    ['Variação Absoluta', formatCurrency(Math.abs(result.difference)), result.difference > 0 ? 'Aumento' : 'Redução'],
    ['Variação Percentual', `${Math.abs(result.percentChange).toFixed(2)}%`, result.difference > 0 ? 'Aumento' : 'Redução'],
    [''],
    ['Projeção Anual'],
    ['Diferença Mensal', formatCurrency(result.difference)],
    ['Diferença Anual', formatCurrency(result.difference * 12)],
  ];
  
  const wsComparativo = XLSX.utils.aoa_to_sheet(comparativoData);
  wsComparativo['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsComparativo, 'Análise Comparativa');

  // Sheet 5: Dados para Gráficos
  const graficosData = [
    ['DADOS PARA GRÁFICOS'],
    [''],
    ['Sistema Atual - Composição'],
    ['Imposto', 'Valor'],
    ['ICMS', result.beforeTaxes.icms],
    ['ISS', result.beforeTaxes.iss],
    ['PIS', result.beforeTaxes.pis],
    ['COFINS', result.beforeTaxes.cofins],
    ['IPI', result.beforeTaxes.ipi],
    [''],
    ['Reforma 2026 - Composição'],
    ['Imposto', 'Valor'],
    ['IBS', result.afterTaxes.ibs],
    ['CBS', result.afterTaxes.cbs],
    ['Imposto Seletivo', result.afterTaxes.is],
    [''],
    ['Comparativo Total'],
    ['Sistema', 'Valor'],
    ['Sistema Atual', result.beforeTaxes.total],
    ['Reforma 2026', result.afterTaxes.total],
  ];
  
  const wsGraficos = XLSX.utils.aoa_to_sheet(graficosData);
  wsGraficos['!cols'] = [{ wch: 20 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsGraficos, 'Dados Gráficos');

  // Generate filename and save
  const filename = `simulacao-tributaria-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
}

export function exportTransitionToExcel(
  result: SimulationResult,
  transitionData: Array<{ year: number; oldSystem: number; newSystem: number; total: number }>
): void {
  const wb = XLSX.utils.book_new();

  const transitionSheet = [
    ['TRANSIÇÃO TRIBUTÁRIA 2026-2033'],
    [''],
    ['Ano', 'Sistema Atual (R$)', 'Novo Sistema (R$)', 'Total (R$)', 'Fase'],
    ...transitionData.map(d => [
      d.year,
      formatCurrency(d.oldSystem),
      formatCurrency(d.newSystem),
      formatCurrency(d.total),
      d.year <= 2027 ? 'Teste' : d.year >= 2033 ? 'Definitivo' : 'Transição'
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(transitionSheet);
  ws['!cols'] = [{ wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Transição');

  const filename = `transicao-tributaria-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
}
