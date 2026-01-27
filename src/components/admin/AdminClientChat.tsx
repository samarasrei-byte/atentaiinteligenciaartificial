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
  ChevronRight,
  Bot
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

// Service color schemes - WhatsApp-style clean and minimal
const serviceThemes = {
  'limpa-nome': {
    primary: 'bg-emerald-500',
    accent: 'text-emerald-600',
    accentLight: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    avatarBg: 'bg-emerald-500',
    messageBg: 'bg-emerald-500',
    dot: 'bg-emerald-500',
  },
  'fiscal': {
    primary: 'bg-violet-500',
    accent: 'text-violet-600',
    accentLight: 'text-violet-500',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-700 border-violet-200',
    avatarBg: 'bg-violet-500',
    messageBg: 'bg-violet-500',
    dot: 'bg-violet-500',
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
        ? messages.slice(-10).map(m => `[${m.sender_id === user?.id ? 'Guilherme' : 'Cliente'}]: ${m.content}`).join('\n')
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
            ? 'Gerar mensagem de boas-vindas pessoal e acolhedora como Guilherme, especialista humano'
            : 'Gerar resposta de acompanhamento natural e humanizada como Guilherme',
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
          title: '🧠 Sugestão gerada', 
          description: 'Revise e personalize antes de enviar.' 
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
    const firstName = selectedClient?.full_name?.split(' ')[0] || 'Cliente';
    setNewMessage(prev => {
      const docMessage = `Olá, ${firstName}! 👋

Para dar continuidade ao seu processo, vou precisar que você me envie o seguinte documento:

📄 ${docLabel}

Pode enviar como foto ou PDF aqui mesmo no chat. Qualquer dúvida, estou à disposição!

Abraço,
Guilherme`;
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
      <div className="flex items-center justify-center h-[600px] bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-3 border-gray-200 border-t-emerald-500 animate-spin" />
          </div>
          <p className="text-gray-500 text-sm">Carregando atendimentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-180px)] min-h-[600px] flex flex-col">
      {/* Header - Clean WhatsApp style */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-emerald-500">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Central de Atendimento</h2>
            <p className="text-sm text-gray-500">{clients.length} clientes ativos</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadClients} className="gap-2 text-gray-600 border-gray-200 hover:bg-gray-50">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Main Container - WhatsApp-style clean white */}
      <div className="flex-1 flex gap-0 min-h-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        
        {/* Client List Panel - White background */}
        <div className="w-80 shrink-0 flex flex-col bg-white border-r border-gray-200">
          {/* Search & Filters */}
          <div className="p-3 shrink-0 space-y-3 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Buscar cliente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>
            
            {/* Service Tabs - Clean pills */}
            <div className="flex gap-1 p-1 rounded-lg bg-gray-100">
              <button
                onClick={() => setActiveServiceTab('all')}
                className={cn(
                  "flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1",
                  activeServiceTab === 'all' 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Users className="h-3.5 w-3.5" />
                Todos
                <span className="text-gray-400">{clients.length}</span>
              </button>
              <button
                onClick={() => setActiveServiceTab('limpa-nome')}
                className={cn(
                  "flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1",
                  activeServiceTab === 'limpa-nome' 
                    ? "bg-emerald-500 text-white shadow-sm" 
                    : "text-gray-500 hover:text-emerald-600"
                )}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>{limpaNomeCount}</span>
              </button>
              <button
                onClick={() => setActiveServiceTab('fiscal')}
                className={cn(
                  "flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1",
                  activeServiceTab === 'fiscal' 
                    ? "bg-violet-500 text-white shadow-sm" 
                    : "text-gray-500 hover:text-violet-600"
                )}
              >
                <Scale className="h-3.5 w-3.5" />
                <span>{fiscalCount}</span>
              </button>
            </div>
          </div>

          {/* Scrollable Client List */}
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-gray-100">
              {filteredClients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-500">Nenhum cliente encontrado</p>
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
                        "w-full px-3 py-3 text-left transition-all",
                        isSelected
                          ? "bg-emerald-50"
                          : "hover:bg-gray-50"
                      )}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "relative w-11 h-11 rounded-full flex items-center justify-center font-medium text-sm shrink-0 text-white",
                          clientTheme.avatarBg
                        )}>
                          {getInitials(client.full_name)}
                          <div className={cn(
                            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                            client.status === 'completed' ? 'bg-green-500' :
                            client.status === 'pending' ? 'bg-amber-500' : 'bg-blue-500'
                          )} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium truncate text-sm text-gray-900">
                              {client.full_name}
                            </span>
                            <span className="text-[11px] text-gray-400 shrink-0">
                              {formatDistanceToNow(new Date(client.created_at), { addSuffix: false, locale: ptBR })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {client.service_type === 'limpa-nome' ? (
                              <>
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-xs text-gray-500">Limpa Nome</span>
                              </>
                            ) : (
                              <>
                                <div className="w-2 h-2 rounded-full bg-violet-500" />
                                <span className="text-xs text-gray-500">Fiscal</span>
                              </>
                            )}
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

        {/* Chat Panel - WhatsApp style */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-100">
          {selectedClient && theme ? (
            <>
              {/* Fixed Chat Header - Clean style */}
              <div className={cn(
                "shrink-0 px-4 py-3 border-b",
                selectedClient.service_type === 'limpa-nome' 
                  ? "bg-emerald-500 border-emerald-600" 
                  : "bg-violet-500 border-violet-600"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold bg-white/20">
                      {getInitials(selectedClient.full_name)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{selectedClient.full_name}</h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/80 text-xs">{selectedClient.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs bg-white/20 text-white border-0">
                      {getStatusLabel(selectedClient.status)}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowDocumentRequest(!showDocumentRequest)}
                      className="gap-2 text-white hover:bg-white/10"
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
                    className="shrink-0 overflow-hidden border-b border-gray-200 bg-white"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm text-gray-700">Selecione o tipo de documento:</h4>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-600" onClick={() => setShowDocumentRequest(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {documentTypes.map((doc) => (
                          <Button
                            key={doc.id}
                            variant="outline"
                            size="sm"
                            className="justify-start gap-2 h-auto py-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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

              {/* Scrollable Messages Area - WhatsApp wallpaper style */}
              <div className="flex-1 overflow-y-auto p-4" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
                <div className="space-y-3 max-w-3xl mx-auto">
                  {messages.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-white shadow-sm">
                        <MessageCircle className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-base font-medium text-gray-700 mb-1">Inicie a conversa</h4>
                      <p className="text-sm text-gray-500 max-w-xs mx-auto">
                        Use a IA para gerar uma mensagem humanizada como Guilherme.
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
                              "rounded-lg px-3 py-2 max-w-[75%] shadow-sm",
                              isMine
                                ? `${theme.messageBg} text-white rounded-br-sm`
                                : "bg-white text-gray-800 rounded-bl-sm"
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                            <div className={cn("flex items-center gap-1 mt-1", isMine && "justify-end")}>
                              <span className={cn("text-[10px]", isMine ? "text-white/70" : "text-gray-400")}>
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

              {/* Fixed Input Area - WhatsApp style */}
              <div className="shrink-0 p-3 border-t border-gray-200 bg-gray-50">
                <form onSubmit={handleSend} className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateAIResponse}
                      disabled={isGeneratingAI}
                      className={cn(
                        "shrink-0 gap-2 h-10 border-gray-200 text-gray-600 hover:bg-white hover:text-emerald-600 hover:border-emerald-200",
                        isGeneratingAI && "animate-pulse"
                      )}
                    >
                      {isGeneratingAI ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Bot className="h-4 w-4 text-emerald-500" />
                      )}
                      <span className="hidden sm:inline">Gerar como Guilherme</span>
                    </Button>
                    
                    <div className="flex-1 relative">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem como Guilherme..."
                        className="h-10 pr-4 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                        disabled={isSending}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim() || isSending}
                      className={cn(
                        "shrink-0 h-10 w-10 p-0 rounded-full",
                        theme.messageBg,
                        "hover:opacity-90 text-white"
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
                        className="text-xs text-gray-500 flex items-center gap-1.5"
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
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <MessageCircle className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-1">Selecione um cliente</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                  Escolha um cliente na lista para iniciar o atendimento
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
