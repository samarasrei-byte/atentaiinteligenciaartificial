import { SimulationResult, sectors, companyTypes, brazilianStates, formatCurrency } from './taxData';

// Safe CSV generation utility - avoids xlsx vulnerabilities
function generateCSV(data: string[][]): string {
  return data.map(row => 
    row.map(cell => {
      const cellStr = String(cell ?? '');
      // Escape cells containing commas, quotes, or newlines
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
  ).join('\n');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob(['\ufeff' + content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportSimulationToExcel(result: SimulationResult): void {
  const sectorLabel = sectors.find(s => s.value === result.input.sector)?.label || result.input.sector;
  const companyLabel = companyTypes.find(c => c.value === result.input.companyType)?.label || result.input.companyType;
  const stateLabel = result.input.state 
    ? brazilianStates.find(s => s.value === result.input.state)?.label || result.input.state
    : 'Padrão do setor';

  const data = [
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
    ['RESULTADO', 'Sistema Atual', 'Reforma 2026', 'Diferença'],
    ['Total de Impostos', formatCurrency(result.beforeTaxes.total), formatCurrency(result.afterTaxes.total), formatCurrency(result.difference)],
    ['Variação (%)', '', '', `${result.percentChange.toFixed(2)}%`],
    [''],
    ['SISTEMA TRIBUTÁRIO ATUAL'],
    ['Imposto', 'Valor (R$)', 'Alíquota Efetiva (%)'],
    ['ICMS', formatCurrency(result.beforeTaxes.icms), result.beforeTaxes.icms > 0 ? ((result.beforeTaxes.icms / result.input.revenue) * 100).toFixed(2) + '%' : '0%'],
    ['ISS', formatCurrency(result.beforeTaxes.iss), result.beforeTaxes.iss > 0 ? ((result.beforeTaxes.iss / result.input.revenue) * 100).toFixed(2) + '%' : '0%'],
    ['PIS', formatCurrency(result.beforeTaxes.pis), ((result.beforeTaxes.pis / result.input.revenue) * 100).toFixed(2) + '%'],
    ['COFINS', formatCurrency(result.beforeTaxes.cofins), ((result.beforeTaxes.cofins / result.input.revenue) * 100).toFixed(2) + '%'],
    ['IPI', formatCurrency(result.beforeTaxes.ipi), result.beforeTaxes.ipi > 0 ? ((result.beforeTaxes.ipi / result.input.revenue) * 100).toFixed(2) + '%' : '0%'],
    ['TOTAL', formatCurrency(result.beforeTaxes.total), ((result.beforeTaxes.total / result.input.revenue) * 100).toFixed(2) + '%'],
    [''],
    ['NOVO SISTEMA TRIBUTÁRIO (2026+)'],
    ['Imposto', 'Valor (R$)', 'Alíquota Efetiva (%)'],
    ['IBS (Estadual/Municipal)', formatCurrency(result.afterTaxes.ibs), ((result.afterTaxes.ibs / result.input.revenue) * 100).toFixed(2) + '%'],
    ['CBS (Federal)', formatCurrency(result.afterTaxes.cbs), ((result.afterTaxes.cbs / result.input.revenue) * 100).toFixed(2) + '%'],
    ['Imposto Seletivo', formatCurrency(result.afterTaxes.is), result.afterTaxes.is > 0 ? ((result.afterTaxes.is / result.input.revenue) * 100).toFixed(2) + '%' : '0%'],
    ['TOTAL', formatCurrency(result.afterTaxes.total), ((result.afterTaxes.total / result.input.revenue) * 100).toFixed(2) + '%'],
    [''],
    ['ANÁLISE COMPARATIVA'],
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
  
  const csv = generateCSV(data);
  const filename = `simulacao-tributaria-${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csv, filename, 'text/csv');
}

export function exportTransitionToExcel(
  result: SimulationResult,
  transitionData: Array<{ year: number; oldSystem: number; newSystem: number; total: number }>
): void {
  const data = [
    ['TRANSIÇÃO TRIBUTÁRIA 2026-2033'],
    [''],
    ['Ano', 'Sistema Atual (R$)', 'Novo Sistema (R$)', 'Total (R$)', 'Fase'],
    ...transitionData.map(d => [
      String(d.year),
      formatCurrency(d.oldSystem),
      formatCurrency(d.newSystem),
      formatCurrency(d.total),
      d.year <= 2027 ? 'Teste' : d.year >= 2033 ? 'Definitivo' : 'Transição'
    ]),
  ];

  const csv = generateCSV(data);
  const filename = `transicao-tributaria-${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csv, filename, 'text/csv');
}
