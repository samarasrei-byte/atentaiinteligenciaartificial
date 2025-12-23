import jsPDF from 'jspdf';

interface Consultation {
  id: string;
  status: string;
  scheduled_at: string | null;
  price_cents: number;
  platform_fee_cents: number;
  created_at: string;
  completed_at: string | null;
  rating: number | null;
  clientName?: string;
  clientEmail?: string;
}

interface ContadorProfile {
  crc_number: string;
  specialty: string;
  rating: number;
  total_consultations: number;
}

interface ReportData {
  contadorName: string;
  contadorEmail: string;
  profile: ContadorProfile;
  consultations: Consultation[];
  period: {
    month: string;
    year: string;
  };
}

const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Pendente',
    scheduled: 'Agendada',
    completed: 'Concluída',
    cancelled: 'Cancelada',
  };
  return labels[status] || status;
};

export const generateContadorMonthlyReport = (data: ReportData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Filter consultations for the selected period
  const periodConsultations = data.consultations.filter((c) => {
    const date = new Date(c.created_at);
    return (
      date.getMonth() === parseInt(data.period.month) - 1 &&
      date.getFullYear() === parseInt(data.period.year)
    );
  });

  const completedConsultations = periodConsultations.filter((c) => c.status === 'completed');
  const totalGross = completedConsultations.reduce((sum, c) => sum + c.price_cents, 0);
  const totalFees = completedConsultations.reduce((sum, c) => sum + c.platform_fee_cents, 0);
  const totalNet = totalGross - totalFees;
  const avgRating = completedConsultations.length > 0
    ? completedConsultations.reduce((sum, c) => sum + (c.rating || 0), 0) / completedConsultations.filter(c => c.rating).length
    : 0;

  let yPos = 20;

  // Header
  doc.setFillColor(20, 184, 166); // Teal
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('AtentAI', 20, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório Mensal do Contador', 20, 35);

  yPos = 55;

  // Period
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const monthName = monthNames[parseInt(data.period.month) - 1];
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${monthName} ${data.period.year}`, 20, yPos);
  
  yPos += 15;

  // Contador Info Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, yPos - 5, pageWidth - 30, 35, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CONTADOR', 20, yPos + 5);
  
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(data.contadorName, 20, yPos + 15);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`CRC: ${data.profile.crc_number}`, 20, yPos + 23);
  doc.text(`Email: ${data.contadorEmail}`, 100, yPos + 23);
  
  yPos += 45;

  // Summary Cards
  const cardWidth = (pageWidth - 50) / 4;
  const cards = [
    { label: 'Consultas', value: periodConsultations.length.toString(), color: [59, 130, 246] },
    { label: 'Concluídas', value: completedConsultations.length.toString(), color: [34, 197, 94] },
    { label: 'Ganhos Líquidos', value: formatCurrency(totalNet), color: [20, 184, 166] },
    { label: 'Avaliação Média', value: avgRating ? avgRating.toFixed(1) + ' ⭐' : 'N/A', color: [251, 191, 36] },
  ];

  cards.forEach((card, index) => {
    const x = 15 + (index * (cardWidth + 5));
    doc.setFillColor(card.color[0], card.color[1], card.color[2]);
    doc.roundedRect(x, yPos, cardWidth, 25, 2, 2, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(card.label, x + 5, yPos + 8);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(card.value, x + 5, yPos + 18);
  });

  yPos += 40;

  // Financial Summary
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(15, yPos - 5, pageWidth - 30, 30, 3, 3, 'F');
  
  doc.setTextColor(22, 163, 74);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMO FINANCEIRO', 20, yPos + 5);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(`Valor Bruto: ${formatCurrency(totalGross)}`, 20, yPos + 15);
  doc.text(`Taxa Plataforma (10%): -${formatCurrency(totalFees)}`, 80, yPos + 15);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.text(`Valor Líquido: ${formatCurrency(totalNet)}`, 160, yPos + 15);
  
  yPos += 40;

  // Consultations Table
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhamento das Consultas', 20, yPos);
  
  yPos += 10;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(15, yPos - 5, pageWidth - 30, 10, 'F');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Data', 20, yPos);
  doc.text('Status', 50, yPos);
  doc.text('Cliente', 85, yPos);
  doc.text('Valor', 130, yPos);
  doc.text('Taxa', 155, yPos);
  doc.text('Líquido', 175, yPos);

  yPos += 8;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  
  periodConsultations.forEach((consultation) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    const netValue = consultation.price_cents - consultation.platform_fee_cents;
    
    doc.setFontSize(8);
    doc.text(formatDate(consultation.created_at), 20, yPos);
    doc.text(getStatusLabel(consultation.status), 50, yPos);
    doc.text(consultation.clientName || 'Cliente', 85, yPos);
    doc.text(formatCurrency(consultation.price_cents), 130, yPos);
    doc.text(formatCurrency(consultation.platform_fee_cents), 155, yPos);
    
    if (consultation.status === 'completed') {
      doc.setTextColor(22, 163, 74);
    }
    doc.text(formatCurrency(netValue), 175, yPos);
    doc.setTextColor(51, 65, 85);

    yPos += 7;
  });

  if (periodConsultations.length === 0) {
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(10);
    doc.text('Nenhuma consulta registrada neste período.', 20, yPos);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFillColor(241, 245, 249);
  doc.rect(0, footerY - 5, pageWidth, 20, 'F');
  
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 20, footerY);
  doc.text('AtentAI - Plataforma de Consultoria Tributária', pageWidth - 80, footerY);

  // Download
  const fileName = `relatorio-${data.contadorName.replace(/\s+/g, '-').toLowerCase()}-${data.period.month}-${data.period.year}.pdf`;
  doc.save(fileName);
};
