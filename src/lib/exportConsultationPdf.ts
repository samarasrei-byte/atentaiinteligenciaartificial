import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ConsultationData {
  id: string;
  status: string;
  price_cents: number;
  notes: string | null;
  scheduled_at: string | null;
  completed_at: string | null;
  created_at: string;
  user_name: string;
  user_email: string;
  contador_name: string;
  contador_email: string;
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pendente',
    scheduled: 'Agendada',
    completed: 'Concluída',
    cancelled: 'Cancelada',
  };
  return labels[status] || status;
};

export async function exportConsultationToPdf(
  consultationId: string,
  userId: string
): Promise<void> {
  // Fetch consultation data
  const { data: consultation, error: consultError } = await supabase
    .from('consultations')
    .select('*')
    .eq('id', consultationId)
    .single();

  if (consultError || !consultation) {
    throw new Error('Consulta não encontrada');
  }

  // Fetch user profile
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('user_id', consultation.user_id)
    .single();

  // Fetch contador profile
  const { data: contadorProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('user_id', consultation.contador_id)
    .single();

  // Fetch chat messages
  const { data: messages, error: messagesError } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('consultation_id', consultationId)
    .order('created_at', { ascending: true });

  if (messagesError) {
    console.error('Error fetching messages:', messagesError);
  }

  const consultData: ConsultationData = {
    id: consultation.id,
    status: consultation.status,
    price_cents: consultation.price_cents,
    notes: consultation.notes,
    scheduled_at: consultation.scheduled_at,
    completed_at: consultation.completed_at,
    created_at: consultation.created_at,
    user_name: userProfile?.full_name || 'Cliente',
    user_email: userProfile?.email || '',
    contador_name: contadorProfile?.full_name || 'Contador',
    contador_email: contadorProfile?.email || '',
  };

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;

  // Header
  pdf.setFillColor(20, 184, 166); // teal-500
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Relatório de Consulta', pageWidth / 2, 18, { align: 'center' });
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`ID: ${consultation.id.slice(0, 8)}...`, pageWidth / 2, 30, { align: 'center' });

  let y = 55;

  // Consultation Info Section
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Informações da Consulta', margin, y);
  
  y += 10;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);

  const infoData = [
    ['Status:', getStatusLabel(consultData.status)],
    ['Valor:', formatCurrency(consultData.price_cents)],
    ['Criada em:', formatDate(consultData.created_at)],
  ];

  if (consultData.scheduled_at) {
    infoData.push(['Agendada para:', formatDate(consultData.scheduled_at)]);
  }
  if (consultData.completed_at) {
    infoData.push(['Concluída em:', formatDate(consultData.completed_at)]);
  }

  infoData.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'normal');
    pdf.text(label, margin, y);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value, margin + 40, y);
    y += 7;
  });

  y += 5;

  // Participants Section
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Participantes', margin, y);
  
  y += 10;
  pdf.setFontSize(10);

  // User box
  pdf.setFillColor(241, 245, 249);
  pdf.roundedRect(margin, y, (pageWidth - margin * 2 - 10) / 2, 25, 3, 3, 'F');
  pdf.setTextColor(71, 85, 105);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Cliente:', margin + 5, y + 8);
  pdf.setTextColor(30, 41, 59);
  pdf.setFont('helvetica', 'bold');
  pdf.text(consultData.user_name, margin + 5, y + 16);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(consultData.user_email, margin + 5, y + 22);

  // Contador box
  const contadorX = margin + (pageWidth - margin * 2 - 10) / 2 + 10;
  pdf.setFontSize(10);
  pdf.setFillColor(20, 184, 166, 20);
  pdf.roundedRect(contadorX, y, (pageWidth - margin * 2 - 10) / 2, 25, 3, 3, 'F');
  pdf.setTextColor(71, 85, 105);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Contador:', contadorX + 5, y + 8);
  pdf.setTextColor(30, 41, 59);
  pdf.setFont('helvetica', 'bold');
  pdf.text(consultData.contador_name, contadorX + 5, y + 16);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(consultData.contador_email, contadorX + 5, y + 22);

  y += 35;

  // Notes Section
  if (consultData.notes) {
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Notas', margin, y);
    
    y += 8;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    const notesLines = pdf.splitTextToSize(consultData.notes, pageWidth - margin * 2);
    pdf.text(notesLines, margin, y);
    y += notesLines.length * 5 + 10;
  }

  // Chat History Section
  if (messages && messages.length > 0) {
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Histórico do Chat (${messages.length} mensagens)`, margin, y);
    
    y += 10;

    for (const msg of messages) {
      // Check if we need a new page
      if (y > pageHeight - 40) {
        pdf.addPage();
        y = 20;
      }

      const isFromContador = msg.sender_id === consultation.contador_id;
      const senderName = isFromContador ? consultData.contador_name : consultData.user_name;
      const senderLabel = isFromContador ? '🔵' : '🟢';

      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formatDate(msg.created_at), margin, y);
      
      pdf.setFontSize(9);
      pdf.setTextColor(30, 41, 59);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${senderLabel} ${senderName}`, margin + 40, y);
      
      y += 5;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      pdf.setFontSize(10);
      const messageLines = pdf.splitTextToSize(msg.content, pageWidth - margin * 2);
      pdf.text(messageLines, margin, y);
      y += messageLines.length * 5 + 5;
    }
  }

  // Footer
  const footerY = pageHeight - 15;
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  pdf.setTextColor(148, 163, 184);
  pdf.setFontSize(8);
  pdf.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, margin, footerY);
  pdf.text('AtentAI - Plataforma de Consultoria', pageWidth - margin, footerY, { align: 'right' });

  // Save
  const filename = `consulta-${consultationId.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
}
