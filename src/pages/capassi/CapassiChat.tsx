import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCapassi } from '@/contexts/CapassiContext';
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
  RefreshCw,
  FileCheck,
  User,
  Search,
  Paperclip,
  TrendingUp,
  BarChart3,
  Download,
  Image,
  ArrowLeft
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// WhatsApp Business Icon
const WhatsAppBusinessIcon = ({ className = "h-5 w-5", connected = true }: { className?: string; connected?: boolean }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12.001 2C6.478 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.932-1.29A9.953 9.953 0 0012.001 22c5.523 0 10-4.477 10-10s-4.477-10-10-10z" fill={connected ? "#25D366" : "#9CA3AF"} />
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="white" />
    <circle cx="18" cy="6" r="4" fill={connected ? "#128C7E" : "#6B7280"} stroke="white" strokeWidth="1" />
    <text x="18" y="7.5" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold">B</text>
  </svg>
);

interface ChatMessage {
  id: string;
  client_id: string;
  sender_id: string;
  sender_type: string;
  content: string;
  read_at: string | null;
  created_at: string;
  attachment_url?: string | null;
  attachment_type?: string | null;
  attachment_name?: string | null;
}

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  segment: string | null;
  created_at: string;
  company_id: string;
  organization_id: string;
}

const documentTypes = [
  { id: 'balanco', label: 'Balanço Patrimonial', icon: FileText },
  { id: 'dre', label: 'DRE', icon: FileText },
  { id: 'fluxo_caixa', label: 'Fluxo de Caixa', icon: TrendingUp },
  { id: 'relatorio_vendas', label: 'Relatório de Vendas', icon: BarChart3 },
  { id: 'planilha', label: 'Planilha Contábil', icon: FileCheck },
  { id: 'outro', label: 'Outro Documento', icon: Paperclip },
];

const theme = {
  primary: 'bg-violet-600',
  primaryHover: 'hover:bg-violet-700',
  light: 'bg-violet-50',
  accent: 'text-violet-600',
  dot: 'bg-violet-500',
  border: 'border-violet-200',
};

export default function CapassiChat() {
  const { user } = useAuth();
  const { currentOrg, currentCompany } = useCapassi();
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showDocumentRequest, setShowDocumentRequest] = useState(false);
  const [showReceivedDocs, setShowReceivedDocs] = useState(false);
  const [showQuickMessages, setShowQuickMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showClientList, setShowClientList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const receivedAttachments = messages.filter(m => m.attachment_url && m.sender_type === 'client');

  const scrollToBottom = () => {
    const container = messagesEndRef.current?.parentElement;
    if (container) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => { if (currentOrg) loadClients(); }, [currentOrg, currentCompany]);

  const loadClients = async () => {
    if (!currentOrg) return;
    setIsLoading(true);
    try {
      let query = supabase
        .from('capassi_clients' as any)
        .select('*')
        .eq('organization_id', currentOrg.id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (currentCompany) query = query.eq('company_id', currentCompany.id);
      const { data } = await query;
      setClients((data || []) as unknown as Client[]);
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
      const { data, error } = await supabase
        .from('capassi_chat_messages' as any)
        .select('*')
        .eq('client_id', selectedClient.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading chat messages:', error);
        setMessages([]);
        return;
      }
      setMessages((data || []) as unknown as ChatMessage[]);
    };

    loadMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`capassi-chat-${selectedClient.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'capassi_chat_messages',
          filter: `client_id=eq.${selectedClient.id}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedClient, user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedClient || !currentOrg || !currentCompany || isSending) return;

    setIsSending(true);

    const { error } = await supabase
      .from('capassi_chat_messages' as any)
      .insert({
        organization_id: currentOrg.id,
        company_id: currentCompany.id,
        client_id: selectedClient.id,
        sender_id: user.id,
        sender_type: 'admin',
        content: newMessage.trim(),
      });

    if (error) {
      console.error('Error sending message:', error);
      toast({ title: 'Erro ao enviar mensagem', variant: 'destructive' });
    } else {
      setNewMessage('');
    }

    setIsSending(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedClient || !currentOrg || !currentCompany) return;

    if (file.size > 50 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'Máximo 50MB', variant: 'destructive' });
      return;
    }

    setIsSending(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `capassi-chat/${currentOrg.id}/${selectedClient.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: signedData, error: signedError } = await supabase.storage
        .from('chat-attachments')
        .createSignedUrl(fileName, 604800);

      if (signedError) throw signedError;

      await supabase.from('capassi_chat_messages' as any).insert({
        organization_id: currentOrg.id,
        company_id: currentCompany.id,
        client_id: selectedClient.id,
        sender_id: user.id,
        sender_type: 'admin',
        content: `📎 Documento enviado: ${file.name}`,
        attachment_url: signedData.signedUrl,
        attachment_name: file.name,
        attachment_type: file.type,
      });

      toast({ title: 'Documento enviado!' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Erro no upload', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  // Quick messages
  const getFirstName = (name: string) => name?.split(' ')[0] || 'Cliente';

  const quickMessageTemplates = {
    welcome: (name: string) => {
      const g = ['Oi', 'Olá'][Math.floor(Math.random() * 2)];
      return `${g}, ${name}! Tudo bem? 😊\n\nAqui é o César, responsável pelo seu BI+ Contabilidade.\n\nPra começar a montar seu painel financeiro, vou precisar de alguns documentos:\n\n📄 Balanço Patrimonial mais recente\n📄 DRE (Demonstração de Resultado)\n📄 Fluxo de Caixa dos últimos 3 meses\n\nPode mandar Excel, PDF ou imagem aqui mesmo no chat.\n\nCésar`;
    },
    followUp: (name: string) => `Oi, ${name}! Passando pra checar se conseguiu separar os documentos contábeis.\n\nSe tiver dificuldade com algum deles, me avisa que posso te orientar.\n\nEstou por aqui!\n\nCésar`,
    statusUpdate: (name: string) => `${name}, atualizando sobre sua análise:\n\nEstou revisando os documentos e montando os primeiros indicadores. Em breve compartilho os insights iniciais.\n\nQualquer dúvida, pode chamar!\n\nCésar`,
    requestDRE: (name: string) => `Oi, ${name}!\n\nPra avançar com a análise, preciso do seu DRE atualizado.\n\nSe tiver em Excel fica ainda melhor. Pode mandar aqui mesmo!\n\nCésar`,
  };

  const handleQuickMessage = (type: keyof typeof quickMessageTemplates) => {
    if (!selectedClient) return;
    setNewMessage(quickMessageTemplates[type](getFirstName(selectedClient.name)));
    setShowQuickMessages(false);
  };

  const handleDocumentRequest = (docLabel: string) => {
    const firstName = getFirstName(selectedClient?.name || 'Cliente');
    const g = ['Oi', 'Olá'][Math.floor(Math.random() * 2)];
    const closings = ['Fico no aguardo.', 'Me avisa quando enviar!', 'Qualquer dúvida sobre formato, só perguntar.'];
    const closing = closings[Math.floor(Math.random() * closings.length)];
    setNewMessage(`${g}, ${firstName}!\n\nPra continuar a análise, vou precisar de:\n\n📄 ${docLabel}\n\nPode mandar Excel, PDF ou imagem aqui mesmo.\n\n${closing}\n\nCésar`);
    setShowDocumentRequest(false);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'prospect': return 'Prospecto';
      default: return status;
    }
  };

  if (!currentOrg) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <Users className="h-10 w-10 mx-auto mb-3 text-white/20" />
          <p className="text-white/40 text-sm">Selecione uma organização para acessar o chat</p>
        </div>
      </div>
    );
  }

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
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Chat</h2>
          <p className="text-sm text-white/40">Atendimento via WhatsApp Business • César</p>
        </div>
        <div className="flex items-center gap-2">
          <WhatsAppBusinessIcon className="h-6 w-6" connected={true} />
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 mr-1.5 inline-block" />
            Conectado
          </Badge>
        </div>
      </div>

      {/* Chat Container */}
      <div className="h-[calc(100vh-260px)] flex bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Client List */}
        <div className={cn(
          "flex flex-col border-r border-slate-200 bg-white",
          "w-full md:w-72 lg:w-80 md:shrink-0",
          showClientList ? "flex" : "hidden md:flex"
        )}>
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
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-violet-600" />
                <span className="text-xs text-slate-600 font-medium">Clientes ({clients.length})</span>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={loadClients}>
                <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                <p className="text-sm text-slate-500">Nenhum cliente encontrado</p>
                <p className="text-xs text-slate-400 mt-1">Cadastre clientes na aba Clientes</p>
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
                          {getInitials(client.name)}
                          <div className={cn(
                            "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white",
                            client.status === 'active' ? 'bg-green-500' : client.status === 'prospect' ? 'bg-amber-500' : 'bg-slate-400'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium truncate text-sm text-slate-900">{client.name}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {formatDistanceToNow(new Date(client.created_at), { addSuffix: false, locale: ptBR })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-violet-50 text-violet-700 border-violet-200">
                              {getStatusLabel(client.status)}
                            </Badge>
                            {client.segment && (
                              <span className="text-[10px] text-slate-500 truncate">{client.segment}</span>
                            )}
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

        {/* Chat Area */}
        <div className={cn(
          "flex-1 flex flex-col min-w-0 bg-white",
          !showClientList ? "flex" : "hidden md:flex"
        )}>
          {selectedClient ? (
            <>
              {/* Client Header */}
              <div className={cn("px-2 sm:px-4 py-2 sm:py-3 border-b border-slate-200 shrink-0", theme.primary)}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setShowClientList(true); setSelectedClient(null); }}
                      className="md:hidden shrink-0 text-white hover:bg-white/10 h-8 w-8"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-medium text-xs sm:text-sm text-white bg-white/20 shrink-0">
                      {getInitials(selectedClient.name)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white text-sm sm:text-base truncate">{selectedClient.name}</h3>
                      <p className="text-[10px] sm:text-xs text-white/80 truncate">
                        {selectedClient.email || selectedClient.phone || 'Sem contato'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <WhatsAppBusinessIcon className="h-5 w-5" connected={true} />
                    <Badge className="text-xs bg-white/20 text-white border-0 hidden sm:inline-flex">
                      WhatsApp Business
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setShowDocumentRequest(!showDocumentRequest); setShowReceivedDocs(false); }}
                      className="gap-1.5 text-white hover:bg-white/10 text-xs"
                    >
                      <FileCheck className="h-4 w-4" />
                      <span className="hidden sm:inline">Solicitar</span>
                    </Button>
                    {receivedAttachments.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setShowReceivedDocs(!showReceivedDocs); setShowDocumentRequest(false); }}
                        className="gap-1.5 text-white hover:bg-white/10 text-xs"
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Recebidos ({receivedAttachments.length})</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Received Docs Panel */}
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

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className={cn("p-4 rounded-full mb-4", theme.light)}>
                      <MessageCircle className={cn("h-8 w-8", theme.accent)} />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">Inicie a conversa</h3>
                    <p className="text-sm text-slate-500 max-w-sm">
                      Use as mensagens rápidas ou escreva diretamente para {selectedClient.name.split(' ')[0]}.
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => {
                      const isAdmin = msg.sender_type === 'admin';
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn("flex", isAdmin ? "justify-end" : "justify-start")}
                        >
                          <div className={cn(
                            "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
                            isAdmin
                              ? "bg-violet-600 text-white rounded-br-md"
                              : "bg-white text-slate-900 border border-slate-200 rounded-bl-md"
                          )}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                            {msg.attachment_url && (
                              <div className={cn(
                                "mt-2 p-2 rounded-lg flex items-center gap-2",
                                isAdmin ? "bg-white/10" : "bg-slate-50 border border-slate-100"
                              )}>
                                {msg.attachment_type?.startsWith('image/') ? (
                                  <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="block">
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
                              <span className={cn("text-[10px]", isAdmin ? "text-violet-200" : "text-slate-400")}>
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

              {/* Document Request Panel */}
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
                        {documentTypes.map((doc) => {
                          const Icon = doc.icon;
                          return (
                            <button
                              key={doc.id}
                              onClick={() => handleDocumentRequest(doc.label)}
                              className="flex flex-col items-center gap-1 p-2 rounded-lg border border-slate-200 bg-white hover:bg-violet-50 hover:border-violet-300 text-slate-700 transition-all"
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

              {/* Input Area */}
              <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white shrink-0">
                <div className="flex items-end gap-2">
                  <div className="flex gap-1 shrink-0">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                      />
                      <div className="h-9 w-9 rounded-md flex items-center justify-center text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-colors">
                        <Paperclip className="h-4 w-4" />
                      </div>
                    </label>
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
                        <Button type="button" variant="outline" size="sm" onClick={() => handleQuickMessage('welcome')} className="text-xs gap-1.5 border-violet-200 text-violet-700 hover:bg-violet-50">
                          👋 Boas-vindas + Docs
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleQuickMessage('followUp')} className="text-xs gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50">
                          📋 Acompanhamento
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleQuickMessage('statusUpdate')} className="text-xs gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50">
                          🎉 Atualização
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleQuickMessage('requestDRE')} className="text-xs gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
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
                <p className="text-sm text-slate-500">Escolha um cliente para iniciar a conversa</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
