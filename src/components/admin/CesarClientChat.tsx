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
  BarChart3,
  RefreshCw,
  FileCheck,
  File,
  User,
  Search,
  Paperclip,
  Bot,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Download,
  Image,
  ArrowLeft
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
  service_type: 'bi';
  cnpj?: string;
  notes?: string | null;
  identified_value_cents?: number;
}

// Documentos específicos para BI/Contabilidade
const documentTypesBI = [
  { id: 'balanco', label: 'Balanço Patrimonial', icon: FileText },
  { id: 'dre', label: 'DRE', icon: FileText },
  { id: 'fluxo_caixa', label: 'Fluxo de Caixa', icon: TrendingUp },
  { id: 'relatorio_vendas', label: 'Relatório de Vendas', icon: BarChart3 },
  { id: 'planilha', label: 'Planilha Contábil', icon: FileCheck },
  { id: 'outro', label: 'Outro Documento', icon: Paperclip },
];

// Tema visual: Violet/Indigo para César (BI)
const theme = {
  primary: 'bg-violet-600',
  primaryHover: 'hover:bg-violet-700',
  light: 'bg-violet-50',
  accent: 'text-violet-600',
  dot: 'bg-violet-500',
  border: 'border-violet-200',
};

export function CesarClientChat() {
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
  const [isGeneratingPaymentLink, setIsGeneratingPaymentLink] = useState(false);
  const [customPaymentAmount, setCustomPaymentAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showClientList, setShowClientList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      // Load BI requests from fiscal_analysis_requests (notes starts with [BI])
      const { data: biRequests } = await supabase
        .from('fiscal_analysis_requests')
        .select('id, full_name, email, phone, status, created_at, user_id, cnpj, notes, identified_value_cents')
        .order('created_at', { ascending: false })
        .limit(100);

      // Filter only BI requests (notes starts with [BI])
      const biOnly = (biRequests || []).filter(r => 
        typeof r.notes === 'string' && r.notes.toUpperCase().startsWith('[BI]')
      );

      const clientList: ClientRequest[] = biOnly.map(r => ({
        id: r.id,
        user_id: r.user_id || '',
        full_name: r.full_name,
        email: r.email,
        phone: r.phone,
        status: r.status,
        created_at: r.created_at,
        service_type: 'bi' as const,
        cnpj: r.cnpj,
        notes: r.notes,
        identified_value_cents: r.identified_value_cents,
      }));

      setClients(clientList);
    } catch (error) {
      console.error('Error loading BI clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load messages when client is selected
  useEffect(() => {
    if (!selectedClient || !user) return;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('fiscal_chat_messages')
        .select('*')
        .eq('request_id', selectedClient.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading BI chat messages:', error);
        setMessages([]);
        return;
      }

      setMessages((data || []) as ChatMessage[]);
    };

    loadMessages();

    // Real-time subscription
    const channel = supabase
      .channel(`cesar-chat-${selectedClient.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fiscal_chat_messages',
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

    // Send real message to fiscal_chat_messages
    const { error } = await supabase
      .from('fiscal_chat_messages')
      .insert({
        request_id: selectedClient.id,
        sender_id: user.id,
        receiver_id: selectedClient.user_id,
        content: newMessage.trim(),
      });

    if (error) {
      console.error('Error sending message:', error);
      toast({ title: 'Erro ao enviar mensagem', variant: 'destructive' });
    } else {
      setNewMessage('');
      toast({ 
        title: 'Mensagem enviada', 
        description: `Notificação enviada para ${selectedClient.full_name}.` 
      });
    }

    setIsSending(false);
  };

  // ========== MENSAGENS AUTOMÁTICAS HUMANIZADAS (sem IA - tokens pausados) ==========
  const [showQuickMessages, setShowQuickMessages] = useState(false);

  const getFirstName = (fullName: string) => fullName?.split(' ')[0] || 'Cliente';

  const quickMessageTemplatesBI = {
    welcome: (name: string) => {
      const greetings = ['Oi', 'Olá'];
      const g = greetings[Math.floor(Math.random() * greetings.length)];
      return `${g}, ${name}! Tudo bem? 😊

Aqui é o César, responsável pelo seu BI+ Contabilidade.

Que bom ter você com a gente! Pra começar a montar seu painel financeiro, vou precisar de alguns documentos:

📄 Balanço Patrimonial mais recente
📄 DRE (Demonstração de Resultado)
📄 Fluxo de Caixa dos últimos 3 meses

Pode mandar Excel, PDF ou imagem aqui mesmo no chat.

Assim que receber, já começo o diagnóstico financeiro da sua empresa!

César`;
    },
    followUp: (name: string) => {
      return `Oi, ${name}! Passando pra checar se conseguiu separar os documentos contábeis.

Se tiver dificuldade com algum deles, me avisa que posso te orientar sobre onde conseguir.

Estou por aqui!

César`;
    },
    statusUpdate: (name: string) => {
      return `${name}, atualizando sobre sua análise:

Estou revisando os documentos e montando os primeiros indicadores do seu painel. Em breve compartilho os insights iniciais.

Qualquer dúvida, pode chamar!

César`;
    },
    requestDRE: (name: string) => {
      return `Oi, ${name}!

Pra avançar com a análise, preciso do seu DRE (Demonstração de Resultado do Exercício) atualizado.

Se tiver em Excel fica ainda melhor pra gente trabalhar os dados. Pode mandar aqui mesmo!

César`;
    },
  };

  const handleQuickMessage = (type: 'welcome' | 'followUp' | 'statusUpdate' | 'requestDRE') => {
    if (!selectedClient) return;
    const firstName = getFirstName(selectedClient.full_name);
    setNewMessage(quickMessageTemplatesBI[type](firstName));
    setShowQuickMessages(false);
  };

  const handleDocumentRequest = (docLabel: string) => {
    const firstName = selectedClient?.full_name?.split(' ')[0] || 'Cliente';
    
    // Variações de saudação humanizadas
    const greetings = ['Oi', 'Olá', 'E aí'];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    // Variações de fechamento (sem "Abraço" repetitivo)
    const closings = [
      'Fico no aguardo.',
      'Me avisa quando enviar!',
      'Qualquer dúvida sobre formato, só perguntar.',
    ];
    const closing = closings[Math.floor(Math.random() * closings.length)];
    
    setNewMessage(`${greeting}, ${firstName}!

Aqui é o César, da equipe de BI e Contabilidade.

Pra continuar a análise, vou precisar de:

📄 **${docLabel}**

Pode mandar Excel, PDF ou imagem aqui mesmo.

${closing}

César`);
    setShowDocumentRequest(false);
  };

  const handlePaymentRequest = async () => {
    if (!selectedClient || !user) return;
    
    setIsGeneratingPaymentLink(true);
    
    try {
      const firstName = selectedClient.full_name?.split(' ')[0] || 'Cliente';
      const serviceLabel = 'BI+ Inteligência Fiscal';
      
      // Determine amount: use custom or default
      let amountCents: number;
      if (customPaymentAmount) {
        amountCents = Math.round(parseFloat(customPaymentAmount.replace(',', '.')) * 100);
      } else {
        amountCents = 99700; // R$ 997 default for BI
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
          serviceType: 'bi-contabilidade',
          requestId: selectedClient.id,
        },
      });

      if (response.error) throw new Error(response.error.message);

      const paymentUrl = response.data.url;
      const price = (amountCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      
      // Variações humanizadas
      const greetings = ['Oi', 'Olá'];
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      
      setNewMessage(`${greeting}, ${firstName}!

Segue o link pro pagamento do **${serviceLabel}**:

💰 Valor: **${price}**
✅ Pagamento seguro (Mercado Pago)
📋 Parcela no cartão

🔗 ${paymentUrl}

Qualquer coisa, só chamar!

César`);
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

  const filteredClients = clients.filter(client => 
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-white rounded-xl border border-slate-200">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          <p className="text-slate-500 text-sm">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header Fixo */}
      <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-600">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Central de Atendimento NF</h2>
            <p className="text-xs text-slate-500">{clients.length} clientes</p>
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
          showClientList ? "flex" : "hidden md:flex"
        )}>
          {/* Busca */}
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
            
            <div className="flex items-center gap-2 px-1">
              <BarChart3 className="h-4 w-4 text-violet-600" />
              <span className="text-xs text-slate-600 font-medium">Clientes Emissão NF</span>
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
                  const isSelected = selectedClient?.id === client.id;
                  
                  return (
                    <button
                      key={client.id}
                      onClick={() => {
                        setSelectedClient(client);
                        if (window.innerWidth < 768) setShowClientList(false);
                      }}
                      className={cn(
                        "w-full px-3 py-3 text-left transition-all",
                        isSelected ? theme.light : "hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "relative w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm shrink-0 text-white",
                          theme.primary
                        )}>
                          {getInitials(client.full_name)}
                          <div className={cn(
                            "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white",
                            client.status === 'active' ? 'bg-green-500' : 'bg-amber-500'
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
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-violet-50 text-violet-700 border-violet-200">
                              BI+
                            </Badge>
                            <span className="text-[10px] text-slate-500">
                              {client.status === 'completed' ? 'Concluído' : client.status === 'pending' ? 'Pendente' : 'Em análise'}
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
          "flex-1 flex flex-col min-w-0 bg-white",
          !showClientList ? "flex" : "hidden md:flex"
        )}>
        {selectedClient ? (
          <>
            {/* Header do Cliente */}
            <div className={cn("px-2 sm:px-4 py-2 sm:py-3 border-b border-slate-200 shrink-0", theme.primary)}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Back button - mobile only */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setShowClientList(true); setSelectedClient(null); }}
                    className="md:hidden shrink-0 text-white hover:bg-white/10 h-8 w-8"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-medium text-xs sm:text-sm text-white bg-white/20 shrink-0">
                    {getInitials(selectedClient.full_name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white text-sm sm:text-base truncate">{selectedClient.full_name}</h3>
                    <p className="text-[10px] sm:text-xs text-white/80 truncate">{selectedClient.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="text-xs bg-white/20 text-white border-0">
                    BI+ Contabilidade
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

            {/* Painel de Pagamento */}
            <AnimatePresence>
              {showPaymentRequest && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="shrink-0 overflow-hidden border-b border-slate-200 bg-gradient-to-r from-violet-50 to-purple-50"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-violet-600">
                          <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-slate-900">Gerar Link de Pagamento</h4>
                          <p className="text-xs text-slate-500">BI+ Inteligência Fiscal • Valor customizável</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowPaymentRequest(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <Input
                        type="text"
                        placeholder="997,00"
                        value={customPaymentAmount}
                        onChange={(e) => setCustomPaymentAmount(e.target.value)}
                        className="flex-1"
                      />
                      <span className="flex items-center text-sm text-slate-500 px-2">R$</span>
                    </div>
                    <Button
                      onClick={handlePaymentRequest}
                      disabled={isGeneratingPaymentLink}
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white"
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

            {/* Painel de Documentos Recebidos - Download Rápido */}
            <AnimatePresence>
              {showReceivedDocs && receivedAttachments.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="shrink-0 overflow-hidden border-b border-slate-200 bg-gradient-to-r from-violet-50 to-slate-50"
                >
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-violet-600" />
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
                          className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white hover:bg-violet-50 hover:border-violet-200 transition-colors"
                        >
                          {msg.attachment_type?.startsWith('image/') ? (
                            <Image className="h-4 w-4 text-violet-600 shrink-0" />
                          ) : (
                            <FileText className="h-4 w-4 text-violet-600 shrink-0" />
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

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className={cn("p-4 rounded-full mb-4", theme.light)}>
                    <MessageCircle className={cn("h-8 w-8", theme.accent)} />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">
                    Inicie a conversa
                  </h3>
                  <p className="text-sm text-slate-500 max-w-sm">
                    Use o botão de IA ou escreva diretamente para {selectedClient.full_name.split(' ')[0]}.
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isAdmin = msg.sender_id === user?.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex",
                          isAdmin ? "justify-end" : "justify-start"
                        )}
                      >
                        <div className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
                          isAdmin 
                            ? "bg-violet-600 text-white rounded-br-md" 
                            : "bg-white text-slate-900 border border-slate-200 rounded-bl-md"
                        )}>
                          <PaymentLinkRenderer content={msg.content} variant="admin" />
                          
                          {/* Renderizar anexos */}
                          {msg.attachment_url && (
                            <div className={cn(
                              "mt-2 p-2 rounded-lg flex items-center gap-2",
                              isAdmin ? "bg-white/10" : "bg-slate-50 border border-slate-100"
                            )}>
                              {msg.attachment_type?.startsWith('image/') ? (
                                <a 
                                  href={msg.attachment_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <img 
                                    src={msg.attachment_url} 
                                    alt={msg.attachment_name || 'Anexo'}
                                    className="max-w-[200px] max-h-[150px] rounded-lg object-cover"
                                  />
                                </a>
                              ) : (
                                <a 
                                  href={msg.attachment_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className={cn(
                                    "flex items-center gap-2 text-xs underline",
                                    isAdmin ? "text-white/90" : "text-slate-700"
                                  )}
                                >
                                  <Paperclip className="h-3.5 w-3.5" />
                                  <span className="truncate max-w-[150px]">{msg.attachment_name || 'Documento'}</span>
                                </a>
                              )}
                            </div>
                          )}
                          
                          <div className={cn(
                            "flex items-center gap-1.5 mt-1.5",
                            isAdmin ? "justify-end" : "justify-start"
                          )}>
                            <span className={cn(
                              "text-[10px]",
                              isAdmin ? "text-violet-200" : "text-slate-400"
                            )}>
                              {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isAdmin && (
                              msg.read_at 
                                ? <CheckCheck className="h-3.5 w-3.5 text-violet-200" />
                                : <Check className="h-3.5 w-3.5 text-violet-300" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Solicitar Documento */}
            <AnimatePresence>
              {showDocumentRequest && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-slate-200 bg-slate-50 overflow-hidden shrink-0"
                >
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-700">Solicitar Documento Contábil</span>
                      <button onClick={() => setShowDocumentRequest(false)} className="p-1 hover:bg-slate-200 rounded">
                        <X className="h-4 w-4 text-slate-500" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {documentTypesBI.map((doc) => {
                        const Icon = doc.icon;
                        return (
                          <button
                            key={doc.id}
                            onClick={() => handleDocumentRequest(doc.label)}
                            className={cn(
                              "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all",
                              "border-slate-200 bg-white hover:bg-violet-50 hover:border-violet-300 text-slate-700"
                            )}
                          >
                            <Icon className="h-4 w-4 text-violet-600" />
                            <span className="text-[10px] text-center leading-tight">{doc.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input de Mensagem */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white shrink-0">
              <div className="flex items-end gap-2">
                <div className="flex gap-1 shrink-0">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-slate-500 hover:text-violet-600 hover:bg-violet-50"
                    onClick={() => setShowDocumentRequest(!showDocumentRequest)}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-slate-500 hover:text-violet-600 hover:bg-violet-50"
                    onClick={() => setShowQuickMessages(!showQuickMessages)}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
                
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 h-9 bg-slate-50 border-slate-200 focus:bg-white text-slate-900 placeholder:text-slate-400"
                  disabled={isSending}
                />
                
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() || isSending}
                  className={cn("h-9 px-4 gap-2", theme.primary, theme.primaryHover)}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span className="hidden sm:inline">Enviar</span>
                    </>
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
                        className="text-xs gap-1.5 border-violet-200 text-violet-700 hover:bg-violet-50"
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
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickMessage('requestDRE')}
                        className="text-xs gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      >
                        📄 Solicitar DRE
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {newMessage && (
                <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                  ✏️ Revise antes de enviar.
                </p>
              )}
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50/50">
            <div className="text-center">
              <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4", theme.light)}>
                <MessageCircle className={cn("h-8 w-8", theme.accent)} />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Selecione um cliente</h3>
              <p className="text-sm text-slate-500">Escolha um cliente BI para iniciar a conversa</p>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default CesarClientChat;
