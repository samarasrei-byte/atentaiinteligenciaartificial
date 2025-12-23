import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

export interface AdminReportData {
  stats: {
    totalUsers: number;
    totalContadores: number;
    totalSubscriptions: number;
    totalConsultations: number;
    totalRevenue: number;
    totalSimulations: number;
    totalMessages: number;
    pendingConsultations: number;
    monthlyRevenue: number;
    newUsersThisMonth: number;
    aiQuestionsToday: number;
    aiQuestionsThisWeek: number;
    aiQuestionsThisMonth: number;
    simulationsToday: number;
    simulationsThisWeek: number;
    simulationsThisMonth: number;
    activeUsersToday: number;
    activeUsersThisWeek: number;
    consultationsScheduledThisWeek: number;
    consultationsCompletedThisWeek: number;
    simulatorPlanCount: number;
    premiumPlanCount: number;
    contadorPlanCount: number;
  };
  subscriptions: Array<{
    id: string;
    user_id: string;
    plan_type: string;
    status: string;
    price_cents: number;
    created_at: string;
  }>;
  consultations: Array<{
    id: string;
    user_id: string;
    contador_id: string;
    status: string;
    price_cents: number;
    platform_fee_cents: number;
    created_at: string;
  }>;
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

export function exportAdminReportToExcel(data: AdminReportData): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Resumo Geral
  const resumoData = [
    ['RELATÓRIO ADMINISTRATIVO - AtentAI'],
    [`Gerado em: ${new Date().toLocaleString('pt-BR')}`],
    [''],
    ['VISÃO GERAL'],
    [''],
    ['Métrica', 'Valor'],
    ['Total de Usuários', data.stats.totalUsers],
    ['Novos Usuários (este mês)', data.stats.newUsersThisMonth],
    ['Total de Contadores', data.stats.totalContadores],
    ['Assinaturas Ativas', data.stats.totalSubscriptions],
    ['Total de Consultas', data.stats.totalConsultations],
    ['Consultas Pendentes', data.stats.pendingConsultations],
    [''],
    ['RECEITA'],
    ['Receita Total', formatCurrency(data.stats.totalRevenue)],
    ['Receita do Mês', formatCurrency(data.stats.monthlyRevenue)],
    [''],
    ['USO DA PLATAFORMA'],
    ['Simulações Total', data.stats.totalSimulations],
    ['Simulações (hoje)', data.stats.simulationsToday],
    ['Simulações (semana)', data.stats.simulationsThisWeek],
    ['Simulações (mês)', data.stats.simulationsThisMonth],
    [''],
    ['Perguntas IA Total', data.stats.totalMessages],
    ['Perguntas IA (hoje)', data.stats.aiQuestionsToday],
    ['Perguntas IA (semana)', data.stats.aiQuestionsThisWeek],
    ['Perguntas IA (mês)', data.stats.aiQuestionsThisMonth],
    [''],
    ['Usuários Ativos (hoje)', data.stats.activeUsersToday],
    ['Usuários Ativos (semana)', data.stats.activeUsersThisWeek],
  ];

  const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
  wsResumo['!cols'] = [{ wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

  // Sheet 2: Distribuição de Planos
  const planosData = [
    ['DISTRIBUIÇÃO DE PLANOS'],
    [''],
    ['Plano', 'Quantidade', 'Receita Mensal'],
    ['Simulador', data.stats.simulatorPlanCount, formatCurrency(data.stats.simulatorPlanCount * 5600)],
    ['AtentAI Premium', data.stats.premiumPlanCount, formatCurrency(data.stats.premiumPlanCount * 9800)],
    ['Contador Premium Plus', data.stats.contadorPlanCount, formatCurrency(data.stats.contadorPlanCount * 19899)],
    [''],
    ['Total Assinaturas', data.stats.totalSubscriptions, formatCurrency(
      (data.stats.simulatorPlanCount * 5600) + 
      (data.stats.premiumPlanCount * 9800) + 
      (data.stats.contadorPlanCount * 19899)
    )],
  ];

  const wsPlanos = XLSX.utils.aoa_to_sheet(planosData);
  wsPlanos['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsPlanos, 'Planos');

  // Sheet 3: Assinaturas
  const subsHeader = ['ID', 'Usuário ID', 'Plano', 'Status', 'Valor', 'Data Criação'];
  const subsData = data.subscriptions.map(s => [
    s.id.slice(0, 8) + '...',
    s.user_id.slice(0, 8) + '...',
    s.plan_type,
    s.status,
    formatCurrency(s.price_cents),
    formatDate(s.created_at),
  ]);

  const wsSubs = XLSX.utils.aoa_to_sheet([
    ['ASSINATURAS'],
    [''],
    subsHeader,
    ...subsData,
  ]);
  wsSubs['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsSubs, 'Assinaturas');

  // Sheet 4: Consultas
  const consultHeader = ['ID', 'Cliente ID', 'Contador ID', 'Status', 'Valor', 'Taxa', 'Data'];
  const consultData = data.consultations.map(c => [
    c.id.slice(0, 8) + '...',
    c.user_id.slice(0, 8) + '...',
    c.contador_id.slice(0, 8) + '...',
    c.status,
    formatCurrency(c.price_cents),
    formatCurrency(c.platform_fee_cents),
    formatDate(c.created_at),
  ]);

  const wsConsult = XLSX.utils.aoa_to_sheet([
    ['CONSULTAS'],
    [''],
    consultHeader,
    ...consultData,
  ]);
  wsConsult['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsConsult, 'Consultas');

  // Sheet 5: Métricas de Consultas
  const consultMetrics = [
    ['MÉTRICAS DE CONSULTAS'],
    [''],
    ['Período', 'Métrica', 'Valor'],
    ['Esta semana', 'Agendadas', data.stats.consultationsScheduledThisWeek],
    ['Esta semana', 'Concluídas', data.stats.consultationsCompletedThisWeek],
    ['Esta semana', 'Taxa de Conclusão', 
      data.stats.consultationsScheduledThisWeek > 0 
        ? Math.round((data.stats.consultationsCompletedThisWeek / data.stats.consultationsScheduledThisWeek) * 100) + '%'
        : 'N/A'
    ],
  ];

  const wsMetrics = XLSX.utils.aoa_to_sheet(consultMetrics);
  wsMetrics['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsMetrics, 'Métricas Consultas');

  const filename = `relatorio-admin-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
}

export function exportAdminReportToPdf(data: AdminReportData): void {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();

  // Header
  pdf.setFillColor(139, 92, 246); // violet-500
  pdf.rect(0, 0, pageWidth, 35, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Relatório Administrativo', pageWidth / 2, 18, { align: 'center' });

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`AtentAI - ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 28, { align: 'center' });

  let y = 50;

  // Visão Geral
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Visão Geral', 20, y);

  y += 10;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);

  const generalStats = [
    ['Total de Usuários:', data.stats.totalUsers.toString()],
    ['Novos Usuários (mês):', data.stats.newUsersThisMonth.toString()],
    ['Contadores:', data.stats.totalContadores.toString()],
    ['Assinaturas Ativas:', data.stats.totalSubscriptions.toString()],
  ];

  generalStats.forEach(([label, value]) => {
    pdf.text(label, 20, y);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value, 80, y);
    pdf.setFont('helvetica', 'normal');
    y += 7;
  });

  y += 10;

  // Receita
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Receita', 20, y);

  y += 10;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);

  pdf.text('Receita Total:', 20, y);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(22, 163, 74);
  pdf.text(formatCurrency(data.stats.totalRevenue), 80, y);
  y += 7;

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  pdf.text('Receita do Mês:', 20, y);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(22, 163, 74);
  pdf.text(formatCurrency(data.stats.monthlyRevenue), 80, y);

  y += 15;

  // Distribuição de Planos
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Distribuição de Planos', 20, y);

  y += 10;
  pdf.setFontSize(10);

  // Planos boxes
  const boxWidth = (pageWidth - 50) / 3;

  // Simulador
  pdf.setFillColor(59, 130, 246);
  pdf.roundedRect(20, y, boxWidth, 25, 3, 3, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Simulador', 20 + boxWidth/2, y + 10, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.stats.simulatorPlanCount.toString() + ' assinaturas', 20 + boxWidth/2, y + 18, { align: 'center' });

  // Premium
  pdf.setFillColor(139, 92, 246);
  pdf.roundedRect(25 + boxWidth, y, boxWidth, 25, 3, 3, 'F');
  pdf.text('Premium', 25 + boxWidth + boxWidth/2, y + 10, { align: 'center' });
  pdf.text(data.stats.premiumPlanCount.toString() + ' assinaturas', 25 + boxWidth + boxWidth/2, y + 18, { align: 'center' });

  // Contador
  pdf.setFillColor(249, 115, 22);
  pdf.roundedRect(30 + 2*boxWidth, y, boxWidth, 25, 3, 3, 'F');
  pdf.text('Contador', 30 + 2*boxWidth + boxWidth/2, y + 10, { align: 'center' });
  pdf.text(data.stats.contadorPlanCount.toString() + ' assinaturas', 30 + 2*boxWidth + boxWidth/2, y + 18, { align: 'center' });

  y += 40;

  // Uso da Plataforma
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Uso da Plataforma', 20, y);

  y += 10;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);

  const usageStats = [
    ['Simulações (hoje):', data.stats.simulationsToday.toString()],
    ['Simulações (semana):', data.stats.simulationsThisWeek.toString()],
    ['Simulações (mês):', data.stats.simulationsThisMonth.toString()],
    ['Perguntas IA (hoje):', data.stats.aiQuestionsToday.toString()],
    ['Perguntas IA (semana):', data.stats.aiQuestionsThisWeek.toString()],
    ['Perguntas IA (mês):', data.stats.aiQuestionsThisMonth.toString()],
  ];

  usageStats.forEach(([label, value]) => {
    pdf.text(label, 20, y);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value, 80, y);
    pdf.setFont('helvetica', 'normal');
    y += 7;
  });

  y += 10;

  // Consultas
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Consultas', 20, y);

  y += 10;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);

  const consultStats = [
    ['Total Consultas:', data.stats.totalConsultations.toString()],
    ['Pendentes:', data.stats.pendingConsultations.toString()],
    ['Agendadas (semana):', data.stats.consultationsScheduledThisWeek.toString()],
    ['Concluídas (semana):', data.stats.consultationsCompletedThisWeek.toString()],
  ];

  consultStats.forEach(([label, value]) => {
    pdf.text(label, 20, y);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value, 80, y);
    pdf.setFont('helvetica', 'normal');
    y += 7;
  });

  // Footer
  const footerY = pdf.internal.pageSize.getHeight() - 15;
  pdf.setDrawColor(226, 232, 240);
  pdf.line(15, footerY - 5, pageWidth - 15, footerY - 5);
  pdf.setTextColor(148, 163, 184);
  pdf.setFontSize(8);
  pdf.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, footerY);
  pdf.text('AtentAI - Painel Administrativo', pageWidth - 20, footerY, { align: 'right' });

  const filename = `relatorio-admin-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
}
