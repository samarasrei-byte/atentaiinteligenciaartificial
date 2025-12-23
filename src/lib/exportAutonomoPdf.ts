import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SimulationData {
  id: string;
  profession: string;
  profession_category: string;
  monthly_revenue_cents: number;
  monthly_expenses_cents: number;
  state: string;
  city: string | null;
  recommendation: string;
  pf_tax_cents: number;
  mei_tax_cents: number | null;
  me_simples_tax_cents: number | null;
  lucro_presumido_tax_cents: number | null;
  annual_savings_cents: number;
  notes: string | null;
  created_at: string;
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
};

export const exportAutonomoPdf = (simulation: SimulationData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(41, 128, 185);
  doc.text('Atent AI', pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text('Análise Tributária para Autônomo', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Linha divisória
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.5);
  doc.line(20, y, pageWidth - 20, y);
  y += 15;

  // Dados do profissional
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO PROFISSIONAL', 20, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const addInfoLine = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, y);
    y += 6;
  };

  addInfoLine('Profissão', simulation.profession);
  addInfoLine('Categoria', simulation.profession_category);
  addInfoLine('Estado', simulation.state);
  if (simulation.city) {
    addInfoLine('Cidade', simulation.city);
  }
  addInfoLine('Data da Análise', format(new Date(simulation.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }));
  
  y += 10;

  // Dados financeiros
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS FINANCEIROS', 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  addInfoLine('Faturamento Mensal', formatCurrency(simulation.monthly_revenue_cents));
  addInfoLine('Faturamento Anual', formatCurrency(simulation.monthly_revenue_cents * 12));
  if (simulation.monthly_expenses_cents > 0) {
    addInfoLine('Despesas Mensais', formatCurrency(simulation.monthly_expenses_cents));
  }

  y += 10;

  // Comparação de tributos
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPARAÇÃO DE REGIMES TRIBUTÁRIOS', 20, y);
  y += 10;

  // Tabela de comparação
  doc.setFontSize(10);
  
  // Cabeçalho da tabela
  doc.setFillColor(41, 128, 185);
  doc.setTextColor(255);
  doc.rect(20, y - 4, pageWidth - 40, 8, 'F');
  doc.text('Regime', 25, y);
  doc.text('Imposto Mensal', 80, y);
  doc.text('Imposto Anual', 130, y);
  y += 10;

  doc.setTextColor(0);

  const regimes = [
    { name: 'Pessoa Física (PF)', tax: simulation.pf_tax_cents },
    { name: 'MEI', tax: simulation.mei_tax_cents },
    { name: 'ME - Simples Nacional', tax: simulation.me_simples_tax_cents },
    { name: 'ME - Lucro Presumido', tax: simulation.lucro_presumido_tax_cents },
  ];

  regimes.forEach((regime, index) => {
    if (regime.tax !== null) {
      const bgColor = index % 2 === 0 ? 245 : 255;
      doc.setFillColor(bgColor, bgColor, bgColor);
      doc.rect(20, y - 4, pageWidth - 40, 7, 'F');
      
      doc.text(regime.name, 25, y);
      doc.text(formatCurrency(regime.tax), 80, y);
      doc.text(formatCurrency(regime.tax * 12), 130, y);
      y += 7;
    }
  });

  y += 10;

  // Recomendação
  doc.setFillColor(46, 204, 113);
  doc.rect(20, y - 4, pageWidth - 40, 10, 'F');
  doc.setTextColor(255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('RECOMENDAÇÃO DA IA', 25, y + 2);
  y += 14;

  doc.setTextColor(0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Quebra o texto da recomendação em linhas
  const recommendationLines = doc.splitTextToSize(simulation.recommendation, pageWidth - 45);
  doc.text(recommendationLines, 20, y);
  y += recommendationLines.length * 5 + 5;

  // Economia
  if (simulation.annual_savings_cents > 0) {
    y += 5;
    doc.setFillColor(46, 204, 113);
    doc.setTextColor(255);
    doc.roundedRect(20, y - 4, pageWidth - 40, 15, 3, 3, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`ECONOMIA ANUAL ESTIMADA: ${formatCurrency(simulation.annual_savings_cents)}`, pageWidth / 2, y + 5, { align: 'center' });
    y += 20;
  }

  // Notas
  if (simulation.notes) {
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Observações:', 20, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(simulation.notes, pageWidth - 45);
    doc.text(notesLines, 20, y);
    y += notesLines.length * 5;
  }

  // Rodapé
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Este documento é apenas uma simulação e não substitui a orientação de um profissional contábil.', pageWidth / 2, pageHeight - 20, { align: 'center' });
  doc.text('Os valores são estimativas baseadas nas informações fornecidas e na legislação vigente.', pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.text(`Gerado por Atent AI em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Salva o PDF
  const fileName = `analise-autonomo-${simulation.profession.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(simulation.created_at), 'dd-MM-yyyy')}.pdf`;
  doc.save(fileName);
};

// Export para uso direto no simulador (com dados calculados, não do banco)
export const exportAutonomoAnalysisPdf = (data: {
  profession: string;
  category: string;
  monthlyRevenue: number;
  monthlyExpenses: number;
  state: string;
  pfTax: number;
  meiTax: number | null;
  meSimplesTax: number | null;
  lucroPresumidoTax: number | null;
  annualSavings: number;
  recommendation: string;
  aiAnalysis?: string;
}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(41, 128, 185);
  doc.text('Atent AI', pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text('Análise Tributária Personalizada', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Linha divisória
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.5);
  doc.line(20, y, pageWidth - 20, y);
  y += 15;

  // Dados do profissional
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO PROFISSIONAL', 20, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const addInfoLine = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, y);
    y += 6;
  };

  addInfoLine('Profissão', data.profession);
  addInfoLine('Categoria', data.category);
  addInfoLine('Estado', data.state);
  addInfoLine('Data da Análise', format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }));
  
  y += 10;

  // Dados financeiros
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS FINANCEIROS', 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  addInfoLine('Faturamento Mensal', formatCurrency(data.monthlyRevenue * 100));
  addInfoLine('Faturamento Anual', formatCurrency(data.monthlyRevenue * 12 * 100));
  if (data.monthlyExpenses > 0) {
    addInfoLine('Despesas Mensais', formatCurrency(data.monthlyExpenses * 100));
  }

  y += 10;

  // Comparação de tributos
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPARAÇÃO DE REGIMES TRIBUTÁRIOS', 20, y);
  y += 10;

  doc.setFontSize(10);
  
  // Cabeçalho da tabela
  doc.setFillColor(41, 128, 185);
  doc.setTextColor(255);
  doc.rect(20, y - 4, pageWidth - 40, 8, 'F');
  doc.text('Regime', 25, y);
  doc.text('Imposto Mensal', 80, y);
  doc.text('Imposto Anual', 130, y);
  y += 10;

  doc.setTextColor(0);

  const regimes = [
    { name: 'Pessoa Física (PF)', tax: data.pfTax },
    { name: 'MEI', tax: data.meiTax },
    { name: 'ME - Simples Nacional', tax: data.meSimplesTax },
    { name: 'ME - Lucro Presumido', tax: data.lucroPresumidoTax },
  ];

  regimes.forEach((regime, index) => {
    if (regime.tax !== null) {
      const bgColor = index % 2 === 0 ? 245 : 255;
      doc.setFillColor(bgColor, bgColor, bgColor);
      doc.rect(20, y - 4, pageWidth - 40, 7, 'F');
      
      doc.text(regime.name, 25, y);
      doc.text(formatCurrency(regime.tax * 100), 80, y);
      doc.text(formatCurrency(regime.tax * 12 * 100), 130, y);
      y += 7;
    }
  });

  y += 10;

  // Recomendação
  doc.setFillColor(46, 204, 113);
  doc.rect(20, y - 4, pageWidth - 40, 10, 'F');
  doc.setTextColor(255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('RECOMENDAÇÃO', 25, y + 2);
  y += 14;

  doc.setTextColor(0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const recommendationLines = doc.splitTextToSize(data.recommendation, pageWidth - 45);
  doc.text(recommendationLines, 20, y);
  y += recommendationLines.length * 5 + 5;

  // Análise da IA
  if (data.aiAnalysis) {
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('ANÁLISE DETALHADA DA IA', 20, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const aiLines = doc.splitTextToSize(data.aiAnalysis, pageWidth - 45);
    
    // Verifica se precisa de nova página
    if (y + aiLines.length * 4 > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      y = 20;
    }
    
    doc.text(aiLines, 20, y);
    y += aiLines.length * 4 + 5;
  }

  // Economia
  if (data.annualSavings > 0) {
    y += 5;
    
    // Verifica se precisa de nova página
    if (y > doc.internal.pageSize.getHeight() - 50) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFillColor(46, 204, 113);
    doc.setTextColor(255);
    doc.roundedRect(20, y - 4, pageWidth - 40, 15, 3, 3, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`ECONOMIA ANUAL ESTIMADA: ${formatCurrency(data.annualSavings * 100)}`, pageWidth / 2, y + 5, { align: 'center' });
  }

  // Rodapé
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Este documento é apenas uma simulação e não substitui a orientação de um profissional contábil.', pageWidth / 2, pageHeight - 20, { align: 'center' });
  doc.text('Os valores são estimativas baseadas nas informações fornecidas e na legislação vigente.', pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.text(`Gerado por Atent AI em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Salva o PDF
  const fileName = `analise-${data.profession.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'dd-MM-yyyy')}.pdf`;
  doc.save(fileName);
};
