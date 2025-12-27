import jsPDF from 'jspdf';
import { formatCurrency } from './taxData';

interface RegimeSavingsData {
  regime: string;
  regimeName: string;
  monthlyRevenue: number;
  annualRevenue: number;
  currentTaxRate: number;
  yearlyData: {
    year: number;
    phase: string;
    currentTax: number;
    newTax: number;
    annualSavings: number;
    accumulatedSavings: number;
  }[];
  totalSavings: number;
}

export async function exportTransitionProjectionToPdf(
  data: RegimeSavingsData[]
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Header
  pdf.setFillColor(20, 184, 166); // teal-500
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Projeção de Economia Tributária', pageWidth / 2, 18, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Transição 2026-2033 | LC 214/2025', pageWidth / 2, 28, { align: 'center' });
  
  pdf.setFontSize(9);
  pdf.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 36, { align: 'center' });

  let y = 50;

  // Company Info Section
  const firstRegime = data[0];
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Dados da Simulação', 15, y);
  
  y += 8;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Faturamento Mensal: ${formatCurrency(firstRegime.monthlyRevenue)}`, 15, y);
  pdf.text(`Faturamento Anual: ${formatCurrency(firstRegime.annualRevenue)}`, 105, y);
  
  y += 15;

  // Comparison Summary Section
  pdf.setFillColor(241, 245, 249);
  pdf.roundedRect(15, y, pageWidth - 30, 35, 3, 3, 'F');
  
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Resumo Comparativo por Regime', 20, y + 10);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  
  const colWidth = (pageWidth - 40) / data.length;
  data.forEach((regime, idx) => {
    const x = 20 + (idx * colWidth);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(20, 184, 166);
    pdf.text(regime.regimeName, x, y + 18);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(22, 163, 74); // green-600
    pdf.text(`Economia: ${formatCurrency(regime.totalSavings)}`, x, y + 25);
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Alíquota atual: ${regime.currentTaxRate}%`, x, y + 31);
  });
  
  y += 45;

  // Best option highlight
  const bestRegime = data.reduce((best, r) => r.totalSavings > best.totalSavings ? r : best, data[0]);
  pdf.setFillColor(22, 163, 74, 20); // green with opacity
  pdf.roundedRect(15, y, pageWidth - 30, 20, 3, 3, 'F');
  
  pdf.setTextColor(22, 163, 74);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`🏆 Melhor Opção: ${bestRegime.regimeName}`, 20, y + 8);
  pdf.setFontSize(14);
  pdf.text(`Economia Total: ${formatCurrency(bestRegime.totalSavings)}`, 20, y + 16);
  
  y += 30;

  // Detailed table for each regime
  data.forEach((regime, regimeIdx) => {
    if (y > pageHeight - 80) {
      pdf.addPage();
      y = 20;
    }

    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${regime.regimeName} (${regime.currentTaxRate}% atual)`, 15, y);
    
    y += 8;

    // Table header
    pdf.setFillColor(226, 232, 240);
    pdf.rect(15, y, pageWidth - 30, 8, 'F');
    
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);
    pdf.setFont('helvetica', 'bold');
    
    const cols = [15, 35, 60, 95, 130, 160];
    pdf.text('Ano', cols[0] + 2, y + 5);
    pdf.text('Fase', cols[1] + 2, y + 5);
    pdf.text('Imp. Atual', cols[2] + 2, y + 5);
    pdf.text('Imp. Novo', cols[3] + 2, y + 5);
    pdf.text('Economia/Ano', cols[4] + 2, y + 5);
    pdf.text('Acumulado', cols[5] + 2, y + 5);
    
    y += 8;

    // Table rows
    pdf.setFont('helvetica', 'normal');
    regime.yearlyData.forEach((yearData, idx) => {
      const rowColor = idx % 2 === 0 ? 255 : 250;
      pdf.setFillColor(rowColor, rowColor, rowColor);
      pdf.rect(15, y, pageWidth - 30, 6, 'F');
      
      pdf.setTextColor(30, 41, 59);
      pdf.text(String(yearData.year), cols[0] + 2, y + 4);
      pdf.text(yearData.phase, cols[1] + 2, y + 4);
      pdf.text(formatCurrency(yearData.currentTax), cols[2] + 2, y + 4);
      pdf.text(formatCurrency(yearData.newTax), cols[3] + 2, y + 4);
      
      pdf.setTextColor(22, 163, 74);
      pdf.text(formatCurrency(yearData.annualSavings), cols[4] + 2, y + 4);
      
      pdf.setTextColor(20, 184, 166);
      pdf.text(formatCurrency(yearData.accumulatedSavings), cols[5] + 2, y + 4);
      
      y += 6;
    });

    // Total row
    pdf.setFillColor(20, 184, 166, 30);
    pdf.rect(15, y, pageWidth - 30, 8, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text('TOTAL 2026-2033', cols[0] + 2, y + 5);
    pdf.setTextColor(22, 163, 74);
    pdf.setFontSize(10);
    pdf.text(formatCurrency(regime.totalSavings), cols[5] + 2, y + 5);
    
    y += 20;
  });

  // Footer disclaimer
  if (y > pageHeight - 30) {
    pdf.addPage();
    y = 20;
  }

  pdf.setTextColor(148, 163, 184);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  const disclaimer = 'Valores estimados com base na EC 132/2023 e LC 214/2025. A economia real depende do regime tributário, setor de atuação e aproveitamento de créditos. Não substitui consultoria contábil profissional.';
  const lines = pdf.splitTextToSize(disclaimer, pageWidth - 30);
  pdf.text(lines, 15, pageHeight - 20);

  // Page footer
  pdf.setDrawColor(226, 232, 240);
  pdf.line(15, pageHeight - 10, pageWidth - 15, pageHeight - 10);
  pdf.text('AtentAI - Plataforma de Simulação Tributária', pageWidth / 2, pageHeight - 5, { align: 'center' });

  // Save
  const filename = `projecao-economia-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
}
