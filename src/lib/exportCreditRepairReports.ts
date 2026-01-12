import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface CreditRepairReportData {
  requests: Array<{
    id: string;
    full_name: string;
    status: string;
    payment_status: string;
    final_price_cents: number;
    debt_amount_cents: number;
    created_at: string;
    completed_at: string | null;
  }>;
  dateRange: {
    start: Date;
    end: Date;
  };
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    totalRevenue: number;
    paidCount: number;
    avgTicket: number;
    conversionRate: number;
  };
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
};

const formatDate = (dateStr: string) => {
  return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
};

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

const paymentLabels: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  failed: 'Falhou',
};

// Safe CSV generation utility - avoids xlsx vulnerabilities
function generateCSV(data: (string | number)[][]): string {
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

export function exportCreditRepairToExcel(data: CreditRepairReportData): void {
  const dateRangeStr = `${format(data.dateRange.start, 'dd/MM/yyyy', { locale: ptBR })} - ${format(data.dateRange.end, 'dd/MM/yyyy', { locale: ptBR })}`;

  const resumoData: (string | number)[][] = [
    ['RELATÓRIO LIMPA NOME - AtentAI'],
    [`Período: ${dateRangeStr}`],
    [`Gerado em: ${new Date().toLocaleString('pt-BR')}`],
    [''],
    ['RESUMO GERAL'],
    [''],
    ['Métrica', 'Valor'],
    ['Total de Solicitações', data.stats.total],
    ['Pendentes', data.stats.pending],
    ['Em Andamento', data.stats.inProgress],
    ['Concluídos', data.stats.completed],
    [''],
    ['FINANCEIRO'],
    ['Receita Total', formatCurrency(data.stats.totalRevenue)],
    ['Pagamentos Recebidos', data.stats.paidCount],
    ['Ticket Médio', formatCurrency(data.stats.avgTicket)],
    ['Taxa de Conclusão', `${data.stats.conversionRate.toFixed(1)}%`],
    [''],
    ['SOLICITAÇÕES LIMPA NOME'],
    ['Cliente', 'Status', 'Pagamento', 'Valor', 'Dívida', 'Data Criação', 'Data Conclusão'],
    ...data.requests.map(r => [
      r.full_name,
      statusLabels[r.status] || r.status,
      paymentLabels[r.payment_status] || r.payment_status,
      formatCurrency(r.final_price_cents),
      formatCurrency(r.debt_amount_cents),
      formatDate(r.created_at),
      r.completed_at ? formatDate(r.completed_at) : '-',
    ]),
  ];

  const csv = generateCSV(resumoData);
  const filename = `limpa-nome-relatorio-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  downloadFile(csv, filename, 'text/csv');
}

export function exportCreditRepairToPdf(data: CreditRepairReportData): void {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const dateRangeStr = `${format(data.dateRange.start, 'dd/MM/yyyy', { locale: ptBR })} - ${format(data.dateRange.end, 'dd/MM/yyyy', { locale: ptBR })}`;

  // Header
  pdf.setFillColor(16, 185, 129); // emerald-500
  pdf.rect(0, 0, pageWidth, 40, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Relatório Limpa Nome', pageWidth / 2, 18, { align: 'center' });

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Período: ${dateRangeStr}`, pageWidth / 2, 28, { align: 'center' });
  pdf.text(`AtentAI - ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 35, { align: 'center' });

  let y = 55;

  // Resumo Cards
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Resumo Geral', 20, y);

  y += 12;

  // Cards de métricas
  const cardWidth = (pageWidth - 50) / 4;
  const cards = [
    { label: 'Total', value: data.stats.total.toString(), color: [59, 130, 246] },
    { label: 'Pendentes', value: data.stats.pending.toString(), color: [251, 191, 36] },
    { label: 'Andamento', value: data.stats.inProgress.toString(), color: [99, 102, 241] },
    { label: 'Concluídos', value: data.stats.completed.toString(), color: [16, 185, 129] },
  ];

  cards.forEach((card, i) => {
    const x = 15 + i * (cardWidth + 5);
    pdf.setFillColor(card.color[0], card.color[1], card.color[2]);
    pdf.roundedRect(x, y, cardWidth, 30, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(card.label, x + cardWidth / 2, y + 12, { align: 'center' });
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(card.value, x + cardWidth / 2, y + 24, { align: 'center' });
  });

  y += 45;

  // Financeiro
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Financeiro', 20, y);

  y += 10;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);

  const financeStats = [
    ['Receita Total:', formatCurrency(data.stats.totalRevenue)],
    ['Pagamentos Recebidos:', data.stats.paidCount.toString()],
    ['Ticket Médio:', formatCurrency(data.stats.avgTicket)],
    ['Taxa de Conclusão:', `${data.stats.conversionRate.toFixed(1)}%`],
  ];

  financeStats.forEach(([label, value]) => {
    pdf.text(label, 20, y);
    pdf.setFont('helvetica', 'bold');
    if (label.includes('Receita')) {
      pdf.setTextColor(16, 185, 129);
    }
    pdf.text(value, 80, y);
    pdf.setTextColor(71, 85, 105);
    pdf.setFont('helvetica', 'normal');
    y += 8;
  });

  y += 12;

  // Tabela de Solicitações (últimas 10)
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Últimas Solicitações', 20, y);

  y += 10;

  // Header da tabela
  pdf.setFillColor(243, 244, 246);
  pdf.rect(15, y, pageWidth - 30, 8, 'F');
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(71, 85, 105);
  
  const colWidths = [45, 25, 25, 30, 30];
  let colX = 17;
  ['Cliente', 'Status', 'Pagamento', 'Valor', 'Data'].forEach((header, i) => {
    pdf.text(header, colX, y + 5.5);
    colX += colWidths[i];
  });

  y += 10;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);

  const displayRequests = data.requests.slice(0, 10);
  displayRequests.forEach((request) => {
    if (y > 270) return; // Pula se passar da página
    
    colX = 17;
    const name = request.full_name.length > 20 ? request.full_name.slice(0, 20) + '...' : request.full_name;
    pdf.text(name, colX, y);
    colX += colWidths[0];
    pdf.text(statusLabels[request.status] || request.status, colX, y);
    colX += colWidths[1];
    pdf.text(paymentLabels[request.payment_status] || request.payment_status, colX, y);
    colX += colWidths[2];
    pdf.text(formatCurrency(request.final_price_cents), colX, y);
    colX += colWidths[3];
    pdf.text(formatDate(request.created_at), colX, y);
    y += 7;
  });

  // Footer
  const footerY = pdf.internal.pageSize.getHeight() - 15;
  pdf.setDrawColor(226, 232, 240);
  pdf.line(15, footerY - 5, pageWidth - 15, footerY - 5);
  pdf.setTextColor(148, 163, 184);
  pdf.setFontSize(8);
  pdf.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, footerY);
  pdf.text('AtentAI - Limpa Nome', pageWidth - 20, footerY, { align: 'right' });

  const filename = `limpa-nome-relatorio-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  pdf.save(filename);
}
