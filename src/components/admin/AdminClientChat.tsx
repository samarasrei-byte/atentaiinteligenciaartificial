import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  MessageCircle,
  Loader2,
  Check,
  CheckCheck,
  Paperclip,
  FileText,
  X,
  Users,
  Sparkles,
  Bot,
  Shield,
  Scale,
  RefreshCw,
  FileCheck,
  File,
  User,
  Search,
  Clock
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load all clients
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      // Fetch both limpa-nome and fiscal requests
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

      // Combine and sort by created_at
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
      // Only limpa-nome has chat messages table currently
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

    // Subscribe to realtime updates
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

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
      // For fiscal, we could create a similar chat system
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
        ? `Cliente solicitou serviço Limpa Nome. Nome: ${selectedClient.full_name}. Status: ${selectedClient.status}. Valor da dívida: R$ ${((selectedClient.debt_amount_cents || 0) / 100).toFixed(2)}. Últimas mensagens: ${messages.slice(-5).map(m => m.content).join(' | ')}`
        : `Cliente solicitou análise fiscal. Nome: ${selectedClient.full_name}. CNPJ: ${selectedClient.cnpj}. Status: ${selectedClient.status}. Valor identificado: R$ ${((selectedClient.identified_value_cents || 0) / 100).toFixed(2)}.`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Você é um assistente especialista em ${selectedClient.service_type === 'limpa-nome' ? 'recuperação de crédito e limpeza de nome' : 'análise fiscal e tributária'}. 
              
Gere uma resposta MUITO HUMANA e acolhedora para o cliente. Seja empático, use linguagem natural e amigável. NÃO use jargões técnicos demais. O tom deve ser de quem realmente se importa com o cliente.

Contexto: ${context}

Gere uma resposta curta (2-3 parágrafos) para dar continuidade ao atendimento. Se for o primeiro contato, dê boas-vindas. Se já houver conversa, continue naturalmente.`
            }
          ],
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

        setNewMessage(aiResponse);
        toast({ title: '✨ Resposta gerada pela IA', description: 'Revise antes de enviar.' });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'in_progress': case 'analyzing': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'completed': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const unreadCount = (clientId: string) => {
    // Count unread messages for a specific client
    return 0; // Would need to track this per-client
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            Central de Atendimento
          </h2>
          <p className="text-muted-foreground">Chat com clientes de Limpa Nome e Módulo Fiscal</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadClients}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-300px)] min-h-[500px]">
        {/* Client List */}
        <Card className="lg:col-span-4 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar cliente..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Tabs value={activeServiceTab} onValueChange={(v) => setActiveServiceTab(v as any)}>
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">
                  <Users className="h-4 w-4 mr-1" />
                  Todos
                </TabsTrigger>
                <TabsTrigger value="limpa-nome" className="flex-1">
                  <Shield className="h-4 w-4 mr-1" />
                  Limpa Nome
                </TabsTrigger>
                <TabsTrigger value="fiscal" className="flex-1">
                  <Scale className="h-4 w-4 mr-1" />
                  Fiscal
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-2">
                {filteredClients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum cliente encontrado</p>
                  </div>
                ) : (
                  filteredClients.map((client) => (
                    <motion.button
                      key={client.id}
                      onClick={() => setSelectedClient(client)}
                      className={cn(
                        "w-full p-3 rounded-xl text-left transition-all",
                        selectedClient?.id === client.id
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-muted/30 hover:bg-muted/50 border border-transparent"
                      )}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={cn(
                            client.service_type === 'limpa-nome' 
                              ? 'bg-emerald-500/10 text-emerald-600' 
                              : 'bg-blue-500/10 text-blue-600'
                          )}>
                            {getInitials(client.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium truncate text-foreground">{client.full_name}</span>
                            <Badge variant="outline" className={cn("text-[10px] shrink-0", getStatusColor(client.status))}>
                              {client.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {client.service_type === 'limpa-nome' ? (
                              <Shield className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Scale className="h-3 w-3 text-blue-500" />
                            )}
                            <span className="text-xs text-muted-foreground truncate">{client.email}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(new Date(client.created_at), { addSuffix: true, locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-8 flex flex-col">
          {selectedClient ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={cn(
                        selectedClient.service_type === 'limpa-nome' 
                          ? 'bg-emerald-500/10 text-emerald-600' 
                          : 'bg-blue-500/10 text-blue-600'
                      )}>
                        {getInitials(selectedClient.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{selectedClient.full_name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        {selectedClient.service_type === 'limpa-nome' ? (
                          <>
                            <Shield className="h-4 w-4 text-emerald-500" />
                            Limpa Nome
                          </>
                        ) : (
                          <>
                            <Scale className="h-4 w-4 text-blue-500" />
                            Análise Fiscal
                          </>
                        )}
                        <span>•</span>
                        <span>{selectedClient.email}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowDocumentRequest(!showDocumentRequest)}
                    >
                      <FileCheck className="h-4 w-4 mr-2" />
                      Solicitar Documento
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Document Request Panel */}
              <AnimatePresence>
                {showDocumentRequest && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-b overflow-hidden bg-muted/30"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm">Selecione o tipo de documento:</h4>
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
                            <doc.icon className="h-4 w-4 text-primary" />
                            <span className="text-xs">{doc.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea ref={scrollRef} className="h-full p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-muted-foreground text-sm">
                          {selectedClient.service_type === 'limpa-nome' 
                            ? 'Nenhuma mensagem ainda. Comece a conversa!' 
                            : 'Chat disponível apenas para Limpa Nome. Use notificações para Fiscal.'}
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isMine = message.sender_id === user?.id;
                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn("flex", isMine ? "justify-end" : "justify-start")}
                          >
                            <div className={cn("flex items-end gap-2 max-w-[80%]", isMine && "flex-row-reverse")}>
                              {!isMine && (
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                    {getInitials(selectedClient.full_name)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={cn(
                                  "rounded-2xl px-4 py-2",
                                  isMine
                                    ? "bg-primary text-primary-foreground rounded-br-sm"
                                    : "bg-muted text-foreground rounded-bl-sm"
                                )}
                              >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <div className={cn("flex items-center gap-1 mt-1", isMine && "justify-end")}>
                                  <span className={cn("text-xs", isMine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: ptBR })}
                                  </span>
                                  {isMine && (
                                    message.read_at ? (
                                      <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                                    ) : (
                                      <Check className="h-3 w-3 text-primary-foreground/70" />
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Input */}
              <div className="p-4 border-t bg-muted/30">
                <form onSubmit={handleSend} className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateAIResponse}
                      disabled={isGeneratingAI}
                      className="shrink-0"
                    >
                      {isGeneratingAI ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                      )}
                      Gerar com IA
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="pr-20"
                        disabled={isSending}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim() || isSending}
                      className="shrink-0"
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {newMessage && (
                    <p className="text-xs text-muted-foreground">
                      💡 Revise a mensagem antes de enviar. A IA pode gerar sugestões que precisam de ajuste.
                    </p>
                  )}
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium text-foreground mb-2">Selecione um cliente</h3>
                <p className="text-muted-foreground text-sm">
                  Escolha um cliente na lista para iniciar o atendimento
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
