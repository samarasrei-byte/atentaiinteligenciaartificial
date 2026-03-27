import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  MessageCircle,
  Loader2,
  Check,
  CheckCheck,
  FileText,
  X,
  Users,
  Sparkles,
  Shield,
  Scale,
  RefreshCw,
  FileCheck,
  File,
  User,
  Search,
  Paperclip,
  Bot,
  CreditCard,
  Download,
  Image,
  ArrowLeft,
  Receipt,
  Brain,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { PaymentLinkRenderer } from '@/components/chat/PaymentLinkRenderer';

interface ChatMessage {
  id: string;
  request_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
  attachment_url?: string | null;
  attachment_type?: string | null;
  attachment_name?: string | null;
}

interface ClientRequest {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  status: string;
  created_at: string;
  user_id: string;
  service_type: 'limpa-nome' | 'fiscal' | 'bi' | 'nf' | 'ir';
  debt_amount_cents?: number;
  identified_value_cents?: number;
  cpf?: string;
  cnpj?: string;
  notes?: string | null;
}

// Documentos específicos por serviço
const documentTypesLimpaNome = [
  { id: 'rg_cpf', label: 'RG / CPF', icon: User },
  { id: 'comprovante_residencia', label: 'Comprov. Residência', icon: File },
  { id: 'extrato_bancario', label: 'Extrato Bancário', icon: FileText },
  { id: 'comprovante_renda', label: 'Comprov. Renda', icon: FileText },
  { id: 'score_consulta', label: 'Consulta Score', icon: FileCheck },
  { id: 'outro', label: 'Outro', icon: Paperclip },
];

const documentTypesFiscal = [
  { id: 'cnd_federal', label: 'CND Federal', icon: FileText },
  { id: 'cnd_estadual', label: 'CND Estadual', icon: FileText },
  { id: 'cnd_municipal', label: 'CND Municipal', icon: FileText },
  { id: 'contrato_social', label: 'Contrato Social', icon: File },
  { id: 'balanco', label: 'Balanço', icon: FileText },
  { id: 'outro', label: 'Outro', icon: Paperclip },
];

const documentTypesNF = [
  { id: 'nf_servico', label: 'NF de Serviço', icon: Receipt },
  { id: 'contrato', label: 'Contrato', icon: File },
  { id: 'comprovante_iss', label: 'Comprov. ISS', icon: FileText },
  { id: 'alvara', label: 'Alvará', icon: FileCheck },
  { id: 'outro', label: 'Outro', icon: Paperclip },
];

const documentTypesIR = [
  { id: 'informe_rendimentos', label: 'Informe Rendimentos', icon: FileText },
  { id: 'recibo_medico', label: 'Recibos Médicos', icon: File },
  { id: 'comprovante_educacao', label: 'Comprov. Educação', icon: FileText },
  { id: 'extrato_investimentos', label: 'Extrato Investimentos', icon: FileText },
  { id: 'comprovante_imovel', label: 'Comprov. Imóvel', icon: File },
  { id: 'outro', label: 'Outro', icon: Paperclip },
];

type ServiceType = ClientRequest['service_type'];

// Cores por serviço
const serviceThemes: Record<ServiceType, {
  primary: string;
  primaryHover: string;
  light: string;
  accent: string;
  dot: string;
  border: string;
  label: string;
  icon: React.ElementType;
}> = {
  'limpa-nome': {
    primary: 'bg-emerald-600',
    primaryHover: 'hover:bg-emerald-700',
    light: 'bg-emerald-50',
    accent: 'text-emerald-600',
    dot: 'bg-emerald-500',
    border: 'border-emerald-200',
    label: 'Limpa Nome',
    icon: Shield,
  },
  'fiscal': {
    primary: 'bg-violet-600',
    primaryHover: 'hover:bg-violet-700',
    light: 'bg-violet-50',
    accent: 'text-violet-600',
    dot: 'bg-violet-500',
    border: 'border-violet-200',
    label: 'Fiscal',
    icon: Scale,
  },
  'bi': {
    primary: 'bg-violet-600',
    primaryHover: 'hover:bg-violet-700',
    light: 'bg-violet-50',
    accent: 'text-violet-600',
    dot: 'bg-violet-500',
    border: 'border-violet-200',
    label: 'BI',
    icon: Scale,
  },
  'nf': {
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    light: 'bg-blue-50',
    accent: 'text-blue-600',
    dot: 'bg-blue-500',
    border: 'border-blue-200',
    label: 'Emissão NF',
    icon: Receipt,
  },
  'ir': {
    primary: 'bg-amber-600',
    primaryHover: 'hover:bg-amber-700',
    light: 'bg-amber-50',
    accent: 'text-amber-600',
    dot: 'bg-amber-500',
    border: 'border-amber-200',
    label: 'Imposto de Renda',
    icon: Brain,
  },
};

export function AdminClientChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<ClientRequest | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [clients, setClients] = useState<ClientRequest[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  // isGeneratingAI removed - AI responses paused to save tokens
  const [showDocumentRequest, setShowDocumentRequest] = useState(false);
  const [showPaymentRequest, setShowPaymentRequest] = useState(false);
  const [showReceivedDocs, setShowReceivedDocs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeServiceTab, setActiveServiceTab] = useState<'all' | 'limpa-nome' | 'fiscal' | 'bi'>('all');
  const [showClientList, setShowClientList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const theme = selectedClient ? serviceThemes[selectedClient.service_type] : null;
  const documentTypes = selectedClient?.service_type === 'limpa-nome' ? documentTypesLimpaNome : documentTypesFiscal;

  // Get attachments from messages for quick access
  const receivedAttachments = messages.filter(m => m.attachment_url && m.sender_id !== user?.id);

  const scrollToBottom = () => {
    const container = messagesEndRef.current?.parentElement;
    if (container) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const [limpaNomeRes, fiscalRes] = await Promise.all([
        supabase
          .from('credit_repair_requests')
          .select('id, full_name, email, phone, status, created_at, user_id, debt_amount_cents, cpf')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('fiscal_analysis_requests')
          .select('id, full_name, email, phone, status, created_at, user_id, identified_value_cents, cnpj, cpf, notes')
          .order('created_at', { ascending: false })
          .limit(100)
      ]);

      const limpaNome: ClientRequest[] = (limpaNomeRes.data || []).map(r => ({
        ...r,
        service_type: 'limpa-nome' as const,
      }));

      const fiscal: ClientRequest[] = (fiscalRes.data || []).map((r: any) => {
        const notes: string = r?.notes || '';
        const isBI = typeof notes === 'string' && notes.toUpperCase().startsWith('[BI]');
        const service_type: ClientRequest['service_type'] = isBI ? 'bi' : 'fiscal';
        return {
          ...r,
          service_type,
        };
      });

      const combined = [...limpaNome, ...fiscal].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setClients(combined);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedClient || !user) return;

    const loadMessages = async () => {
      const table = selectedClient.service_type === 'limpa-nome'
        ? 'credit_repair_chat_messages'
        : 'fiscal_chat_messages';

      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('request_id', selectedClient.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading admin chat messages:', error);
        setMessages([]);
        return;
      }

      setMessages((data || []) as ChatMessage[]);
    };

    loadMessages();

    const table = selectedClient.service_type === 'limpa-nome'
      ? 'credit_repair_chat_messages'
      : 'fiscal_chat_messages';

    const channel = supabase
      .channel(`admin-chat-${table}-${selectedClient.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table,
          filter: `request_id=eq.${selectedClient.id}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedClient, user]);

  // Validate links before sending - alert if not Mercado Pago
  const validateMessageLinks = (message: string): boolean => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.match(urlRegex) || [];
    
    for (const url of urls) {
      // Check if it's a payment-related URL that's not from Mercado Pago
      if (url.includes('pay') || url.includes('checkout') || url.includes('pagamento')) {
        if (!url.includes('mercadopago.com.br') && !url.includes('mpago.la')) {
          toast({
            title: '⚠️ Link suspeito detectado!',
            description: 'Apenas links do Mercado Pago são permitidos para pagamentos. Use o botão "Pagar" para gerar links seguros.',
            variant: 'destructive',
          });
          return false;
        }
      }
    }
    return true;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedClient || isSending) return;

    // Validate links in message
    if (!validateMessageLinks(newMessage)) {
      return;
    }

    setIsSending(true);

    const table = selectedClient.service_type === 'limpa-nome'
      ? 'credit_repair_chat_messages'
      : 'fiscal_chat_messages';

    const { error } = await supabase
      .from(table)
      .insert({
        request_id: selectedClient.id,
        sender_id: user.id,
        receiver_id: selectedClient.user_id,
        content: newMessage.trim(),
      });

    if (error) {
      console.error('Error sending admin message:', error);
      toast({ title: 'Erro ao enviar mensagem', variant: 'destructive' });
    } else {
      setNewMessage('');
    }

    setIsSending(false);
  };

  // ========== MENSAGENS AUTOMÁTICAS HUMANIZADAS (sem IA) ==========
  const [showQuickMessages, setShowQuickMessages] = useState(false);

  const getFirstName = (fullName: string) => fullName?.split(' ')[0] || 'Cliente';

  const quickMessageTemplates = {
    'limpa-nome': {
      welcome: (name: string) => {
        const greetings = ['Oi', 'Olá', 'E aí'];
        const g = greetings[Math.floor(Math.random() * greetings.length)];
        return `${g}, ${name}! Tudo bem? 😊

Aqui é o Guilherme, responsável pelo seu processo de Limpa Nome.

Recebi sua solicitação e já estou organizando tudo por aqui. Pra dar início, vou precisar de alguns documentos seus:

📄 RG ou CNH (frente e verso)
📄 Comprovante de residência atualizado
📄 Uma consulta recente do seu score (pode ser do Serasa ou SPC)

Pode mandar foto ou PDF aqui mesmo no chat, fica à vontade!

Assim que receber, já começo a trabalhar no seu caso. Qualquer dúvida, é só chamar!

Guilherme`;
      },
      followUp: (name: string) => {
        const greetings = ['Oi', 'Olá', 'E aí'];
        const g = greetings[Math.floor(Math.random() * greetings.length)];
        return `${g}, ${name}! Passando pra dar uma atualização.

Estou acompanhando seu processo de perto e tá tudo caminhando bem. Preciso só confirmar se você já conseguiu enviar os documentos pendentes?

Se tiver qualquer dúvida sobre o que preciso, me chama aqui que te explico direitinho.

Guilherme`;
      },
      statusUpdate: (name: string) => {
        return `${name}, boas notícias! 🎉

Tive avanço no seu processo. Estou trabalhando nas pendências e em breve te mando o resultado.

Fica tranquilo(a) que tá tudo sendo acompanhado pessoalmente por mim.

Qualquer coisa, já sabe, é só chamar aqui!

Guilherme`;
      },
    },
    'fiscal': {
      welcome: (name: string) => {
        const greetings = ['Oi', 'Olá'];
        const g = greetings[Math.floor(Math.random() * greetings.length)];
        return `${g}, ${name}! Tudo certo? 😊

Aqui é o Guilherme, da equipe de Análise Fiscal.

Já recebi sua solicitação e vou começar a trabalhar no seu caso. Pra isso, preciso de alguns documentos:

📄 Última declaração de IR (se tiver)
📄 Certidão Negativa de Débitos (federal)
📄 Contrato Social da empresa

Pode enviar direto aqui no chat, aceito PDF, foto ou imagem.

Me avisa quando enviar que já começo a análise!

Guilherme`;
      },
      followUp: (name: string) => {
        return `Oi, ${name}! Passando pra checar como estamos.

Já recebeu os documentos que pedi? Se tiver dificuldade pra conseguir algum deles, me avisa que posso te orientar.

Estou por aqui!

Guilherme`;
      },
      statusUpdate: (name: string) => {
        return `${name}, atualizando você sobre a análise fiscal:

Estou revisando os documentos e em breve tenho o relatório completo. Vou te avisar assim que finalizar.

Qualquer dúvida, pode chamar!

Guilherme`;
      },
    },
    'bi': {
      welcome: (name: string) => {
        return `Oi, ${name}! Tudo bem?

Aqui é o Guilherme. Recebi sua solicitação de BI e Contabilidade e já estou analisando.

Vou entrar em contato em breve pra dar início à análise!

Guilherme Mesquita`;
      },
      followUp: (name: string) => {
        return `Oi, ${name}! Só passando pra ver se está tudo certo e se precisa de alguma coisa.

Me avisa se tiver dúvida!

Guilherme`;
      },
      statusUpdate: (name: string) => {
        return `${name}, seu processo está sendo acompanhado de perto. Em breve teremos novidades!

Guilherme`;
      },
    },
  };

  const handleQuickMessage = (type: 'welcome' | 'followUp' | 'statusUpdate') => {
    if (!selectedClient) return;
    const firstName = getFirstName(selectedClient.full_name);
    const templates = quickMessageTemplates[selectedClient.service_type];
    setNewMessage(templates[type](firstName));
    setShowQuickMessages(false);
  };

  const handleDocumentRequest = (docLabel: string) => {
    const firstName = selectedClient?.full_name?.split(' ')[0] || 'Cliente';
    const serviceLabel = selectedClient?.service_type === 'limpa-nome' ? 'recuperação de crédito' : 'análise fiscal';
    
    // Variações de saudação humanizadas
    const greetings = ['Oi', 'Olá', 'E aí', 'Opa'];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    // Variações de fechamento (sem "Abraço" repetitivo)
    const closings = [
      'Fico no aguardo!',
      'Qualquer dúvida, me chama!',
      'Estou por aqui se precisar.',
      'Me avisa quando enviar!',
    ];
    const closing = closings[Math.floor(Math.random() * closings.length)];
    
    setNewMessage(`${greeting}, ${firstName}! 👋

Aqui é o Guilherme, da equipe de ${serviceLabel}.

Pra gente avançar com seu processo, vou precisar de:

📄 **${docLabel}**

Pode mandar foto ou PDF aqui mesmo no chat.

${closing}

Guilherme`);
    setShowDocumentRequest(false);
  };

  const [isGeneratingPaymentLink, setIsGeneratingPaymentLink] = useState(false);
  const [customPaymentAmount, setCustomPaymentAmount] = useState('');

  const handlePaymentRequest = async () => {
    if (!selectedClient || !user) return;
    
    setIsGeneratingPaymentLink(true);
    
    try {
      const firstName = selectedClient.full_name?.split(' ')[0] || 'Cliente';
      const serviceLabel = selectedClient.service_type === 'limpa-nome' ? 'Limpa Nome' : 'Análise Fiscal';
      
      // Determine amount: use custom or default
      let amountCents: number;
      if (customPaymentAmount) {
        amountCents = Math.round(parseFloat(customPaymentAmount.replace(',', '.')) * 100);
      } else {
        amountCents = selectedClient.service_type === 'limpa-nome' ? 82450 : 0; // R$ 824,50 or custom (fiscal is success fee)
      }
      
      if (amountCents < 100) {
        toast({ title: 'Valor mínimo é R$ 1,00', variant: 'destructive' });
        setIsGeneratingPaymentLink(false);
        return;
      }

      const session = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('create-manual-payment-link', {
        headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
        body: {
          clientEmail: selectedClient.email,
          clientName: selectedClient.full_name,
          clientUserId: selectedClient.user_id,
          amountCents,
          serviceName: serviceLabel,
          serviceType: selectedClient.service_type,
          requestId: selectedClient.id,
        },
      });

      if (response.error) throw new Error(response.error.message);

      const paymentUrl = response.data.url;
      const price = (amountCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      
      // Variações humanizadas
      const greetings = ['Oi', 'Olá', 'E aí'];
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      
      setNewMessage(`${greeting}, ${firstName}!

Segue o link pro pagamento do seu **${serviceLabel}**:

💰 Valor: **${price}**
✅ Pagamento seguro (Mercado Pago)
📋 Parcela no cartão

🔗 ${paymentUrl}

Qualquer coisa sobre o pagamento, só me chamar aqui!

Guilherme`);
      setShowPaymentRequest(false);
      setCustomPaymentAmount('');
      toast({ title: 'Link de pagamento gerado!', description: 'Mensagem pronta para enviar.' });
    } catch (error) {
      console.error('Error generating payment link:', error);
      toast({ title: 'Erro ao gerar link', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsGeneratingPaymentLink(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeServiceTab === 'all' || client.service_type === activeServiceTab;
    return matchesSearch && matchesTab;
  });

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Aguardando',
      in_progress: 'Em Análise',
      analyzing: 'Analisando',
      completed: 'Concluído',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const limpaNomeCount = clients.filter(c => c.service_type === 'limpa-nome').length;
  const fiscalCount = clients.filter(c => c.service_type === 'fiscal').length;
  const biCount = clients.filter(c => c.service_type === 'bi').length;

  // Handle client selection - on mobile, hide list and show chat
  const handleSelectClient = (client: ClientRequest) => {
    setSelectedClient(client);
    // On mobile, hide the client list when a client is selected
    if (window.innerWidth < 768) {
      setShowClientList(false);
    }
  };

  // Handle back to list on mobile
  const handleBackToList = () => {
    setShowClientList(true);
    setSelectedClient(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-white rounded-xl border border-slate-200">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-slate-500 text-sm">Carregando atendimentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header Fixo */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-600">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Central de Atendimento</h2>
            <p className="text-xs text-slate-500">{clients.length} clientes • Guilherme</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadClients} className="gap-2 text-slate-600 border-slate-200">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Container Principal */}
      <div className="flex-1 flex min-h-0">
        
        {/* Lista de Clientes - Responsive */}
        <div className={cn(
          "flex flex-col border-r border-slate-200 bg-white",
          "w-full md:w-72 lg:w-80 md:shrink-0",
          // On mobile: show/hide based on state
          showClientList ? "flex" : "hidden md:flex"
        )}>
          {/* Busca e Filtros - Fixo */}
          <div className="p-3 space-y-2 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar cliente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
              />
            </div>
            
            <div className="flex gap-1 p-1 rounded-lg bg-slate-100">
              <button
                onClick={() => setActiveServiceTab('all')}
                className={cn(
                  "flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5",
                  activeServiceTab === 'all' 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Users className="h-3.5 w-3.5" />
                Todos
              </button>
              <button
                onClick={() => setActiveServiceTab('limpa-nome')}
                className={cn(
                  "flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5",
                  activeServiceTab === 'limpa-nome' 
                    ? "bg-emerald-600 text-white shadow-sm" 
                    : "text-slate-500 hover:text-emerald-600"
                )}
              >
                <Shield className="h-3.5 w-3.5" />
                {limpaNomeCount}
              </button>
              <button
                onClick={() => setActiveServiceTab('fiscal')}
                className={cn(
                  "flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5",
                  activeServiceTab === 'fiscal' 
                    ? "bg-violet-600 text-white shadow-sm" 
                    : "text-slate-500 hover:text-violet-600"
                )}
              >
                <Scale className="h-3.5 w-3.5" />
                {fiscalCount}
              </button>
            </div>
          </div>

          {/* Lista Scrollável */}
          <div className="flex-1 overflow-y-auto">
            {filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                <p className="text-sm text-slate-500">Nenhum cliente</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredClients.map((client) => {
                  const clientTheme = serviceThemes[client.service_type];
                  const isSelected = selectedClient?.id === client.id;
                  
                  return (
                    <button
                      key={client.id}
                      onClick={() => handleSelectClient(client)}
                      className={cn(
                        "w-full px-3 py-3 text-left transition-all",
                        isSelected ? clientTheme.light : "hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "relative w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm shrink-0 text-white",
                          clientTheme.primary
                        )}>
                          {getInitials(client.full_name)}
                          <div className={cn(
                            "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white",
                            client.status === 'completed' ? 'bg-green-500' :
                            client.status === 'pending' ? 'bg-amber-500' : 'bg-blue-500'
                          )} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium truncate text-sm text-slate-900">
                              {client.full_name}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {formatDistanceToNow(new Date(client.created_at), { addSuffix: false, locale: ptBR })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className={cn("w-1.5 h-1.5 rounded-full", clientTheme.dot)} />
                            <span className="text-xs text-slate-500">
                              {client.service_type === 'limpa-nome' ? 'Limpa Nome' : 'Fiscal'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Área do Chat - Responsive */}
        <div className={cn(
          "flex-1 flex flex-col min-w-0 bg-slate-50",
          !showClientList ? "flex" : "hidden md:flex"
        )}>
          {selectedClient && theme ? (
            <>
              {/* Header do Chat - Fixo */}
              <div className={cn("shrink-0 px-2 sm:px-4 py-2 sm:py-3 border-b", theme.primary)}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {/* Back button - mobile only */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBackToList}
                      className="md:hidden shrink-0 text-white hover:bg-white/10 h-8 w-8"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold bg-white/20 shrink-0 text-xs sm:text-sm">
                      {getInitials(selectedClient.full_name)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white text-sm sm:text-base truncate">{selectedClient.full_name}</h3>
                      <p className="text-[10px] sm:text-xs text-white/80 truncate">{selectedClient.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs bg-white/20 text-white border-0">
                      {getStatusLabel(selectedClient.status)}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => { setShowPaymentRequest(!showPaymentRequest); setShowDocumentRequest(false); }}
                      className="gap-2 text-white hover:bg-white/10"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span className="hidden sm:inline">Pagar</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => { setShowDocumentRequest(!showDocumentRequest); setShowPaymentRequest(false); setShowReceivedDocs(false); }}
                      className="gap-2 text-white hover:bg-white/10"
                    >
                      <FileCheck className="h-4 w-4" />
                      <span className="hidden sm:inline">Solicitar</span>
                    </Button>
                    {receivedAttachments.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => { setShowReceivedDocs(!showReceivedDocs); setShowPaymentRequest(false); setShowDocumentRequest(false); }}
                        className="gap-2 text-white hover:bg-white/10"
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Recebidos ({receivedAttachments.length})</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Painel de Pagamento - Fixo */}
              <AnimatePresence>
                {showPaymentRequest && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="shrink-0 overflow-hidden border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-green-50"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-600">
                            <CreditCard className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-slate-900">Gerar Link de Pagamento</h4>
                            <p className="text-xs text-slate-500">
                              {selectedClient.service_type === 'limpa-nome' ? 'Limpa Nome' : 'Análise Fiscal'} • Valor customizável
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowPaymentRequest(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2 mb-3">
                        <Input
                          type="text"
                          placeholder={selectedClient.service_type === 'limpa-nome' ? '824,50' : '297,00'}
                          value={customPaymentAmount}
                          onChange={(e) => setCustomPaymentAmount(e.target.value)}
                          className="flex-1"
                        />
                        <span className="flex items-center text-sm text-slate-500 px-2">R$</span>
                      </div>
                      <Button
                        onClick={handlePaymentRequest}
                        disabled={isGeneratingPaymentLink}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {isGeneratingPaymentLink ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Gerando link...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Gerar link de pagamento real
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-slate-400 mt-2 text-center">
                        Link gerado via Mercado Pago • Pagamento seguro
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Painel de Documentos - Fixo */}
              <AnimatePresence>
                {showDocumentRequest && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="shrink-0 overflow-hidden border-b border-slate-200 bg-white"
                  >
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm text-slate-900">Solicitar Documento</h4>
                          <p className="text-xs text-slate-500">
                            {selectedClient.service_type === 'limpa-nome' ? 'Limpa Nome' : 'Fiscal'}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowDocumentRequest(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {documentTypes.map((doc) => (
                          <Button
                            key={doc.id}
                            variant="outline"
                            size="sm"
                            className={cn("justify-start gap-1.5 h-auto py-2 text-slate-700 text-xs", theme.border)}
                            onClick={() => handleDocumentRequest(doc.label)}
                          >
                            <doc.icon className={cn("h-3.5 w-3.5", theme.accent)} />
                            <span className="truncate">{doc.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Painel de Documentos Recebidos - Download Rápido */}
              <AnimatePresence>
                {showReceivedDocs && receivedAttachments.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="shrink-0 overflow-hidden border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50"
                  >
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4 text-blue-600" />
                          <h4 className="font-medium text-sm text-slate-900">Documentos do Cliente ({receivedAttachments.length})</h4>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowReceivedDocs(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                        {receivedAttachments.map((msg) => (
                          <a
                            key={msg.id}
                            href={msg.attachment_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 transition-colors"
                          >
                            {msg.attachment_type?.startsWith('image/') ? (
                              <Image className="h-4 w-4 text-blue-600 shrink-0" />
                            ) : (
                              <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                            )}
                            <span className="text-xs text-slate-700 truncate flex-1">
                              {msg.attachment_name || 'Documento'}
                            </span>
                            <Download className="h-3 w-3 text-slate-400 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mensagens - Scroll Interno */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3 max-w-2xl mx-auto">
                  {messages.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-white shadow-sm border border-slate-100">
                        <MessageCircle className="h-8 w-8 text-slate-400" />
                      </div>
                      <h4 className="text-sm font-medium text-slate-700 mb-1">Inicie a conversa</h4>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        Use o botão de IA ou escreva diretamente para enviar uma mensagem.
                      </p>
                    </div>
                  ) : (
                    messages.map((message, idx) => {
                      const isMine = message.sender_id === user?.id;
                      
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className={cn("flex", isMine ? "justify-end" : "justify-start")}
                        >
                          <div
                            className={cn(
                              "rounded-xl px-4 py-2.5 max-w-[75%] shadow-sm",
                              isMine
                                ? `${theme.primary} text-white rounded-br-sm`
                                : "bg-white text-slate-800 border border-slate-100 rounded-bl-sm"
                            )}
                          >
                            {isMine && (
                              <p className="text-[10px] font-medium text-white/80 mb-1">Guilherme</p>
                            )}
                            <PaymentLinkRenderer content={message.content} variant="admin" />
                            
                            {/* Renderizar anexos do cliente */}
                            {message.attachment_url && (
                              <div className={cn(
                                "mt-2 p-2 rounded-lg flex items-center gap-2",
                                isMine ? "bg-white/10" : "bg-slate-50 border border-slate-100"
                              )}>
                                {message.attachment_type?.startsWith('image/') ? (
                                  <a 
                                    href={message.attachment_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block"
                                  >
                                    <img 
                                      src={message.attachment_url} 
                                      alt={message.attachment_name || 'Anexo'}
                                      className="max-w-[200px] max-h-[150px] rounded-lg object-cover"
                                    />
                                  </a>
                                ) : (
                                  <a 
                                    href={message.attachment_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={cn(
                                      "flex items-center gap-2 text-xs underline",
                                      isMine ? "text-white/90" : "text-slate-700"
                                    )}
                                  >
                                    <Paperclip className="h-3.5 w-3.5" />
                                    <span className="truncate max-w-[150px]">{message.attachment_name || 'Documento'}</span>
                                  </a>
                                )}
                              </div>
                            )}
                            
                            <div className={cn("flex items-center gap-1 mt-1.5", isMine && "justify-end")}>
                              <span className={cn("text-[10px]", isMine ? "text-white/70" : "text-slate-400")}>
                                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: ptBR })}
                              </span>
                              {isMine && (
                                message.read_at ? (
                                  <CheckCheck className="h-3 w-3 text-white/70" />
                                ) : (
                                  <Check className="h-3 w-3 text-white/70" />
                                )
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input - Fixo */}
              <div className="shrink-0 p-3 border-t border-slate-200 bg-white">
                <form onSubmit={handleSend} className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowQuickMessages(!showQuickMessages)}
                      className="shrink-0 gap-2 h-10 border-slate-200 text-slate-700"
                    >
                      <MessageCircle className={cn("h-4 w-4", theme.accent)} />
                      <span className="hidden sm:inline">Mensagem Rápida</span>
                    </Button>
                    
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 h-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                      disabled={isSending}
                    />
                    
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim() || isSending}
                      className={cn("shrink-0 h-10 w-10 p-0 rounded-full text-white", theme.primary, theme.primaryHover)}
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Quick Messages Panel */}
                  <AnimatePresence>
                    {showQuickMessages && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-2 flex-wrap pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickMessage('welcome')}
                            className="text-xs gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          >
                            👋 Boas-vindas + Docs
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickMessage('followUp')}
                            className="text-xs gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            📋 Acompanhamento
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickMessage('statusUpdate')}
                            className="text-xs gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50"
                          >
                            🎉 Atualização
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <AnimatePresence>
                    {newMessage && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs text-slate-500 flex items-center gap-1.5"
                      >
                        ✏️ Revise antes de enviar.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                  <MessageCircle className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-base font-medium text-slate-700 mb-1">Selecione um cliente</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                  Escolha na lista para iniciar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
