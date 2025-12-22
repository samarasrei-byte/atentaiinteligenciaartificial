import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { SimulationResult, sectors, companyTypes, brazilianStates, formatCurrency } from './taxData';

export async function exportSimulationToPdf(
  result: SimulationResult,
  elementId?: string
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  const sectorLabel = sectors.find(s => s.value === result.input.sector)?.label || result.input.sector;
  const companyLabel = companyTypes.find(c => c.value === result.input.companyType)?.label || result.input.companyType;
  const stateLabel = result.input.state 
    ? brazilianStates.find(s => s.value === result.input.state)?.label || result.input.state
    : null;

  // Header
  pdf.setFillColor(20, 184, 166); // teal-500
  pdf.rect(0, 0, pageWidth, 35, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Simulação de Impacto Tributário', pageWidth / 2, 18, { align: 'center' });
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Reforma Tributária 2026', pageWidth / 2, 28, { align: 'center' });

  let y = 50;

  // Company Info Section
  pdf.setTextColor(30, 41, 59); // slate-800
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Dados da Empresa', 20, y);
  
  y += 10;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105); // slate-600

  const infoData = [
    ['Faturamento Mensal:', formatCurrency(result.input.revenue)],
    ['Setor:', sectorLabel],
    ['Regime Tributário:', companyLabel],
  ];
  
  if (stateLabel) {
    infoData.push(['Estado:', stateLabel]);
  }

  infoData.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'normal');
    pdf.text(label, 20, y);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value, 80, y);
    y += 7;
  });

  y += 10;

  // Current System Section
  pdf.setFillColor(241, 245, 249); // slate-100
  pdf.roundedRect(15, y, (pageWidth - 35) / 2, 70, 3, 3, 'F');
  
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Sistema Atual', 20, y + 12);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  
  let currentY = y + 22;
  const taxes = [
    ['ICMS:', result.beforeTaxes.icms],
    ['ISS:', result.beforeTaxes.iss],
    ['PIS:', result.beforeTaxes.pis],
    ['COFINS:', result.beforeTaxes.cofins],
    ['IPI:', result.beforeTaxes.ipi],
  ];
  
  taxes.forEach(([name, value]) => {
    if (typeof value === 'number' && value > 0) {
      pdf.text(String(name), 20, currentY);
      pdf.text(formatCurrency(value), 70, currentY, { align: 'right' });
      currentY += 6;
    }
  });
  
  currentY += 4;
  pdf.setDrawColor(203, 213, 225);
  pdf.line(20, currentY - 2, 85, currentY - 2);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(234, 88, 12); // orange-600
  pdf.text('Total:', 20, currentY + 4);
  pdf.text(formatCurrency(result.beforeTaxes.total), 70, currentY + 4, { align: 'right' });

  // New System Section
  const newX = 15 + (pageWidth - 35) / 2 + 5;
  pdf.setFillColor(20, 184, 166, 20); // teal with opacity
  pdf.roundedRect(newX, y, (pageWidth - 35) / 2, 70, 3, 3, 'F');
  
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Reforma 2026', newX + 5, y + 12);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  
  currentY = y + 22;
  const newTaxes = [
    ['IBS (Estadual/Municipal):', result.afterTaxes.ibs],
    ['CBS (Federal):', result.afterTaxes.cbs],
    ['IS (Seletivo):', result.afterTaxes.is],
  ];
  
  newTaxes.forEach(([name, value]) => {
    if (typeof value === 'number') {
      pdf.text(String(name), newX + 5, currentY);
      pdf.text(formatCurrency(value), newX + 75, currentY, { align: 'right' });
      currentY += 6;
    }
  });
  
  currentY += 4;
  pdf.setDrawColor(203, 213, 225);
  pdf.line(newX + 5, currentY - 2, newX + 75, currentY - 2);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(20, 184, 166); // teal-500
  pdf.text('Total:', newX + 5, currentY + 4);
  pdf.text(formatCurrency(result.afterTaxes.total), newX + 75, currentY + 4, { align: 'right' });

  y += 85;

  // Difference Section
  const isPositive = result.difference > 0;
  pdf.setFillColor(isPositive ? 254 : 240, isPositive ? 226 : 253, isPositive ? 226 : 244);
  pdf.roundedRect(15, y, pageWidth - 30, 30, 3, 3, 'F');
  
  pdf.setTextColor(isPositive ? 185 : 22, isPositive ? 28 : 163, isPositive ? 28 : 74);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Diferença Estimada', 20, y + 12);
  
  pdf.setFontSize(18);
  const diffText = `${isPositive ? '+' : ''}${formatCurrency(result.difference)} (${isPositive ? '+' : ''}${result.percentChange.toFixed(1)}%)`;
  pdf.text(diffText, pageWidth - 20, y + 20, { align: 'right' });

  y += 45;

  // Disclaimer
  pdf.setTextColor(148, 163, 184); // slate-400
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  const disclaimer = 'Simulação baseada em estimativas e alíquotas de referência. Valores reais podem variar de acordo com regimes especiais, créditos tributários e regulamentações específicas. Consulte um contador para análise detalhada.';
  const lines = pdf.splitTextToSize(disclaimer, pageWidth - 40);
  pdf.text(lines, 20, y);

  // Footer
  const footerY = pdf.internal.pageSize.getHeight() - 15;
  pdf.setDrawColor(226, 232, 240);
  pdf.line(15, footerY - 5, pageWidth - 15, footerY - 5);
  pdf.setTextColor(148, 163, 184);
  pdf.setFontSize(8);
  pdf.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, footerY);
  pdf.text('Plataforma IBS Fiscal', pageWidth - 20, footerY, { align: 'right' });

  // Save
  const filename = `simulacao-tributaria-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
}
