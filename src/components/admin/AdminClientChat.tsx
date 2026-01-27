import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Clock,
  Paperclip,
  Zap,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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
  service_type: 'limpa-nome' | 'fiscal';
  debt_amount_cents?: number;
  identified_value_cents?: number;
  cpf?: string;
  cnpj?: string;
}

const documentTypes = [
  { id: 'cnd_federal', label: 'CND Federal', icon: FileText },
  { id: 'cnd_estadual', label: 'CND Estadual', icon: FileText },
  { id: 'cnd_municipal', label: 'CND Municipal', icon: FileText },
  { id: 'contrato_social', label: 'Contrato Social', icon: File },
  { id: 'alteracao_contratual', label: 'Alteração Contratual', icon: File },
  { id: 'doc_fiscal', label: 'Documento Fiscal', icon: FileText },
  { id: 'comprovante_renda', label: 'Comprovante de Renda', icon: FileText },
  { id: 'rg_cpf', label: 'RG / CPF', icon: User },
  { id: 'extrato_bancario', label: 'Extrato Bancário', icon: FileText },
  { id: 'comprovante_residencia', label: 'Comprovante de Residência', icon: File },
  { id: 'outro', label: 'Outro Documento', icon: Paperclip },
];

// Service color schemes
const serviceThemes = {
  'limpa-nome': {
    primary: 'from-emerald-500 to-teal-600',
    accent: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    ring: 'ring-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    avatarBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    messageBg: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    glow: 'shadow-emerald-500/20',
  },
  'fiscal': {
    primary: 'from-violet-500 to-purple-600',
    accent: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    ring: 'ring-violet-500/30',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    avatarBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    messageBg: 'bg-gradient-to-r from-violet-600 to-purple-600',
    glow: 'shadow-violet-500/20',
  }
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
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showDocumentRequest, setShowDocumentRequest] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeServiceTab, setActiveServiceTab] = useState<'all' | 'limpa-nome' | 'fiscal'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const theme = selectedClient ? serviceThemes[selectedClient.service_type] : null;

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load all clients
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
          .order('created_at', { ascending: false }),
        supabase
          .from('fiscal_analysis_requests')
          .select('id, full_name, email, phone, status, created_at, user_id, identified_value_cents, cnpj, cpf')
          .order('created_at', { ascending: false })
      ]);

      const limpaNome: ClientRequest[] = (limpaNomeRes.data || []).map(r => ({
        ...r,
        service_type: 'limpa-nome' as const,
      }));

      const fiscal: ClientRequest[] = (fiscalRes.data || []).map(r => ({
        ...r,
        service_type: 'fiscal' as const,
      }));

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

  // Load messages when client is selected
  useEffect(() => {
    if (!selectedClient || !user) return;

    const loadMessages = async () => {
      if (selectedClient.service_type === 'limpa-nome') {
        const { data } = await supabase
          .from('credit_repair_chat_messages')
          .select('*')
          .eq('request_id', selectedClient.id)
          .order('created_at', { ascending: true });

        setMessages(data || []);
      } else {
        setMessages([]);
      }
    };

    loadMessages();

    if (selectedClient.service_type === 'limpa-nome') {
      const channel = supabase
        .channel(`admin-chat-${selectedClient.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'credit_repair_chat_messages',
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
    }
  }, [selectedClient, user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedClient || isSending) return;

    setIsSending(true);

    if (selectedClient.service_type === 'limpa-nome') {
      const { error } = await supabase
        .from('credit_repair_chat_messages')
        .insert({
          request_id: selectedClient.id,
          sender_id: user.id,
          receiver_id: selectedClient.user_id,
          content: newMessage.trim(),
        });

      if (error) {
        toast({ title: 'Erro ao enviar mensagem', variant: 'destructive' });
      } else {
        setNewMessage('');
      }
    } else {
      toast({ title: 'Mensagem enviada', description: 'Notificação enviada ao cliente.' });
      setNewMessage('');
    }

    setIsSending(false);
  };

  const generateAIResponse = async () => {
    if (!selectedClient) return;

    setIsGeneratingAI(true);

    try {
      const context = selectedClient.service_type === 'limpa-nome' 
        ? `Serviço: Limpa Nome (Recuperação de Crédito). Valor da dívida: R$ ${((selectedClient.debt_amount_cents || 0) / 100).toFixed(2)}. CPF: ${selectedClient.cpf || 'Não informado'}.`
        : `Serviço: Módulo Fiscal. CNPJ: ${selectedClient.cnpj || 'Não informado'}. Valor identificado: R$ ${((selectedClient.identified_value_cents || 0) / 100).toFixed(2)}.`;

      const conversationHistory = messages.length > 0 
        ? messages.slice(-10).map(m => `[${m.sender_id === user?.id ? 'Admin' : 'Cliente'}]: ${m.content}`).join('\n')
        : 'Primeiro contato - sem histórico anterior';

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-admin-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          clientName: selectedClient.full_name,
          serviceType: selectedClient.service_type,
          status: selectedClient.status,
          context,
          conversationHistory,
          action: messages.length === 0 
            ? 'Gerar mensagem de boas-vindas acolhedora para primeiro contato'
            : 'Gerar resposta de acompanhamento natural para continuar o atendimento',
        }),
      });

      if (response.ok) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let aiResponse = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  const content = data.choices?.[0]?.delta?.content;
                  if (content) aiResponse += content;
                } catch {}
              }
            }
          }
        }

        const cleanResponse = aiResponse.replace(/^🧠\s*Sugestão de resposta para envio:\s*/i, '').trim();
        setNewMessage(cleanResponse);
        toast({ 
          title: '🧠 Sugestão gerada pela AtentAI', 
          description: 'Revise e edite antes de enviar ao cliente.' 
        });
      } else {
        const errorData = await response.json();
        toast({ 
          title: 'Erro ao gerar sugestão', 
          description: errorData.error || 'Tente novamente.',
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast({ title: 'Erro ao gerar resposta', variant: 'destructive' });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleDocumentRequest = (docId: string, docLabel: string) => {
    setNewMessage(prev => {
      const docMessage = `📋 *Solicitação de Documento*\n\nOlá ${selectedClient?.full_name?.split(' ')[0]}! 👋\n\nPara dar continuidade ao seu processo, preciso que você envie o seguinte documento:\n\n📄 *${docLabel}*\n\nVocê pode enviar como foto ou PDF aqui mesmo no chat. Qualquer dúvida, estou à disposição! 😊`;
      return prev ? prev + '\n\n' + docMessage : docMessage;
    });
    setShowDocumentRequest(false);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground">Carregando atendimentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
            <MessageCircle className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Central de Atendimento</h2>
            <p className="text-sm text-muted-foreground">{clients.length} clientes ativos</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadClients} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Main Container - Fixed Height */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
        
        {/* Client List Panel */}
        <div className="w-80 shrink-0 flex flex-col border-r border-border/50 bg-muted/20">
          {/* Search & Filters */}
          <div className="p-4 shrink-0 space-y-3 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar cliente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background/50 border-border/50"
              />
            </div>
            
            {/* Service Tabs */}
            <div className="flex gap-1 p-1 rounded-lg bg-background/50">
              <button
                onClick={() => setActiveServiceTab('all')}
                className={cn(
                  "flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5",
                  activeServiceTab === 'all' 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Users className="h-3.5 w-3.5" />
                Todos
                <span className="ml-1 opacity-70">{clients.length}</span>
              </button>
              <button
                onClick={() => setActiveServiceTab('limpa-nome')}
                className={cn(
                  "flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5",
                  activeServiceTab === 'limpa-nome' 
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20" 
                    : "text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10"
                )}
              >
                <Shield className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">Limpa</span>
                <span className="opacity-70">{limpaNomeCount}</span>
              </button>
              <button
                onClick={() => setActiveServiceTab('fiscal')}
                className={cn(
                  "flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5",
                  activeServiceTab === 'fiscal' 
                    ? "bg-violet-500 text-white shadow-sm shadow-violet-500/20" 
                    : "text-muted-foreground hover:text-violet-400 hover:bg-violet-500/10"
                )}
              >
                <Scale className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">Fiscal</span>
                <span className="opacity-70">{fiscalCount}</span>
              </button>
            </div>
          </div>

          {/* Scrollable Client List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 space-y-1">
              {filteredClients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Nenhum cliente encontrado</p>
                </div>
              ) : (
                filteredClients.map((client) => {
                  const clientTheme = serviceThemes[client.service_type];
                  const isSelected = selectedClient?.id === client.id;
                  
                  return (
                    <motion.button
                      key={client.id}
                      onClick={() => setSelectedClient(client)}
                      className={cn(
                        "w-full p-3 rounded-xl text-left transition-all group",
                        isSelected
                          ? `${clientTheme.bg} ${clientTheme.border} border ring-2 ${clientTheme.ring}`
                          : "hover:bg-muted/50 border border-transparent"
                      )}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "relative w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm shrink-0",
                          clientTheme.avatarBg
                        )}>
                          {getInitials(client.full_name)}
                          <div className={cn(
                            "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card",
                            client.status === 'completed' ? 'bg-green-500' :
                            client.status === 'pending' ? 'bg-amber-500' : 'bg-blue-500'
                          )} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={cn(
                              "font-medium truncate text-sm",
                              isSelected ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
                            )}>
                              {client.full_name}
                            </span>
                            <ChevronRight className={cn(
                              "h-4 w-4 shrink-0 transition-transform",
                              isSelected ? clientTheme.accent : "text-muted-foreground opacity-0 group-hover:opacity-100",
                              isSelected && "translate-x-0.5"
                            )} />
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {client.service_type === 'limpa-nome' ? (
                              <Shield className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Scale className="h-3 w-3 text-violet-500" />
                            )}
                            <span className="text-xs text-muted-foreground truncate">
                              {client.service_type === 'limpa-nome' ? 'Limpa Nome' : 'Fiscal'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground/60" />
                            <span className="text-[10px] text-muted-foreground/60">
                              {formatDistanceToNow(new Date(client.created_at), { addSuffix: true, locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Chat Panel - Fixed Layout */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedClient && theme ? (
            <>
              {/* Fixed Chat Header */}
              <div className={cn(
                "shrink-0 p-4 border-b border-border/50",
                "bg-gradient-to-r",
                theme.primary,
                "bg-opacity-5"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold",
                      theme.avatarBg,
                      "shadow-lg",
                      theme.glow
                    )}>
                      {getInitials(selectedClient.full_name)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{selectedClient.full_name}</h3>
                      <div className="flex items-center gap-2 text-sm">
                        {selectedClient.service_type === 'limpa-nome' ? (
                          <Badge className={cn("gap-1 text-[10px]", theme.badge)}>
                            <Shield className="h-3 w-3" />
                            Limpa Nome
                          </Badge>
                        ) : (
                          <Badge className={cn("gap-1 text-[10px]", theme.badge)}>
                            <Scale className="h-3 w-3" />
                            Módulo Fiscal
                          </Badge>
                        )}
                        <span className="text-muted-foreground text-xs">{selectedClient.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {getStatusLabel(selectedClient.status)}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowDocumentRequest(!showDocumentRequest)}
                      className="gap-2"
                    >
                      <FileCheck className="h-4 w-4" />
                      <span className="hidden sm:inline">Solicitar Doc</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Document Request Panel */}
              <AnimatePresence>
                {showDocumentRequest && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="shrink-0 overflow-hidden border-b border-border/50 bg-muted/30"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm text-foreground">Selecione o tipo de documento:</h4>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowDocumentRequest(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {documentTypes.map((doc) => (
                          <Button
                            key={doc.id}
                            variant="outline"
                            size="sm"
                            className="justify-start gap-2 h-auto py-2"
                            onClick={() => handleDocumentRequest(doc.id, doc.label)}
                          >
                            <doc.icon className={cn("h-4 w-4", theme.accent)} />
                            <span className="text-xs">{doc.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scrollable Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-background/50 to-background/80">
                <div className="space-y-4 max-w-3xl mx-auto">
                  {messages.length === 0 ? (
                    <div className="text-center py-16">
                      <div className={cn(
                        "w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center",
                        theme.bg
                      )}>
                        <MessageCircle className={cn("h-10 w-10", theme.accent)} />
                      </div>
                      <h4 className="text-lg font-medium text-foreground mb-2">Inicie a conversa</h4>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        {selectedClient.service_type === 'limpa-nome' 
                          ? 'Envie uma mensagem de boas-vindas ou use a IA para gerar uma sugestão.' 
                          : 'Use o assistente de IA para gerar uma mensagem contextualizada.'}
                      </p>
                    </div>
                  ) : (
                    messages.map((message, idx) => {
                      const isMine = message.sender_id === user?.id;
                      const showAvatar = !isMine && (idx === 0 || messages[idx - 1].sender_id === user?.id);
                      
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className={cn("flex", isMine ? "justify-end" : "justify-start")}
                        >
                          <div className={cn("flex items-end gap-2 max-w-[75%]", isMine && "flex-row-reverse")}>
                            {!isMine && showAvatar && (
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0",
                                theme.avatarBg
                              )}>
                                {getInitials(selectedClient.full_name)}
                              </div>
                            )}
                            {!isMine && !showAvatar && <div className="w-8 shrink-0" />}
                            
                            <div
                              className={cn(
                                "rounded-2xl px-4 py-2.5 shadow-sm",
                                isMine
                                  ? `${theme.messageBg} text-white rounded-br-md`
                                  : "bg-muted text-foreground rounded-bl-md"
                              )}
                            >
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                              <div className={cn("flex items-center gap-1.5 mt-1.5", isMine && "justify-end")}>
                                <span className={cn("text-[10px]", isMine ? "text-white/60" : "text-muted-foreground")}>
                                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: ptBR })}
                                </span>
                                {isMine && (
                                  message.read_at ? (
                                    <CheckCheck className="h-3 w-3 text-white/60" />
                                  ) : (
                                    <Check className="h-3 w-3 text-white/60" />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Fixed Input Area */}
              <div className="shrink-0 p-4 border-t border-border/50 bg-card/80 backdrop-blur-sm">
                <form onSubmit={handleSend} className="space-y-3">
                  <div className="flex gap-2 items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateAIResponse}
                      disabled={isGeneratingAI}
                      className={cn(
                        "shrink-0 gap-2 h-10",
                        isGeneratingAI && "animate-pulse"
                      )}
                    >
                      {isGeneratingAI ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-amber-500" />
                      )}
                      <span className="hidden sm:inline">Gerar com IA</span>
                    </Button>
                    
                    <div className="flex-1 relative">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="h-10 pr-4 bg-background/50 border-border/50"
                        disabled={isSending}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim() || isSending}
                      className={cn(
                        "shrink-0 h-10 w-10 p-0 rounded-full",
                        "bg-gradient-to-r",
                        theme.primary,
                        "hover:opacity-90 shadow-lg",
                        theme.glow
                      )}
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <AnimatePresence>
                    {newMessage && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs text-muted-foreground flex items-center gap-1.5"
                      >
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        Revise a mensagem antes de enviar.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-muted/20 to-background">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-12 w-12 text-muted-foreground/40" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Selecione um cliente</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Escolha um cliente na lista para iniciar ou continuar o atendimento
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
