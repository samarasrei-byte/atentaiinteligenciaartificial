import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Clock,
  CheckCheck,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Scale,
  X,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PaymentLinkRenderer } from '@/components/chat/PaymentLinkRenderer';

interface FiscalChatMessage {
  id: string;
  request_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
  read_at?: string;
  created_at: string;
}

interface FiscalRequest {
  id: string;
  user_id: string | null;
  company_name: string;
  cnpj: string;
  status: string;
  identified_value_cents?: number;
  payment_status?: string;
  created_at: string;
}

interface FiscalChatPanelProps {
  requestId?: string;
  className?: string;
  serviceType?: 'fiscal' | 'bi'; // Determina qual especialista mostrar
  specialistId?: string; // UUID real do especialista (receiver_id)
}

// Especialistas por tipo de serviço
const SPECIALISTS = {
  fiscal: {
    // UUID real do especialista (receiver_id)
    id: '596de7f7-4352-4058-8855-18f9489a0311',
    name: 'Guilherme Mesquita',
    role: 'Especialista Fiscal',
    avatar: '/guilherme-avatar.png',
    initials: 'GM',
  },
  bi: {
    // UUID real do especialista (receiver_id)
    id: '6307fc12-d37c-43f5-ab78-c62cf29dffd9',
    name: 'Guilherme Mesquita',
    role: 'Especialista Fiscal',
    avatar: '/guilherme-avatar.png',
    initials: 'GM',
  },
};

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export const FiscalChatPanel: React.FC<FiscalChatPanelProps> = ({
  requestId,
  className = '',
  serviceType = 'fiscal',
  specialistId,
}) => {
  const SPECIALIST = SPECIALISTS[serviceType];
  const { user } = useAuth();
  const [messages, setMessages] = useState<FiscalChatMessage[]>([]);
  const [request, setRequest] = useState<FiscalRequest | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (requestId && user) {
      fetchRequest();
      fetchMessages();
      const cleanup = subscribeToMessages();
      return cleanup;
    }
  }, [requestId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fetchRequest = async () => {
    if (!requestId) return;

    const { data, error } = await supabase
      .from('fiscal_analysis_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!error && data) {
      setRequest(data);
    }
  };

  const fetchMessages = async () => {
    if (!requestId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('fiscal_chat_messages')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      toast.error('Erro ao carregar mensagens');
    } else {
      setMessages(data || []);
      markMessagesAsRead(data || []);
    }

    setLoading(false);
  };

  const markMessagesAsRead = async (msgs: FiscalChatMessage[]) => {
    if (!user) return;

    const unreadIds = msgs
      .filter(m => m.receiver_id === user.id && !m.read_at)
      .map(m => m.id);

    if (unreadIds.length > 0) {
      await supabase
        .from('fiscal_chat_messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadIds);
    }
  };

  const subscribeToMessages = () => {
    if (!requestId) return;

    const channel = supabase
      .channel(`fiscal-chat-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fiscal_chat_messages',
          filter: `request_id=eq.${requestId}`,
        },
        (payload) => {
          const newMsg = payload.new as FiscalChatMessage;
          setMessages(prev => [...prev, newMsg]);
          
          // Mark as read if receiver
          if (newMsg.receiver_id === user?.id) {
            supabase
              .from('fiscal_chat_messages')
              .update({ read_at: new Date().toISOString() })
              .eq('id', newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande (máx. 10MB)');
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File): Promise<{ url: string; type: string; name: string } | null> => {
    if (!user || !requestId) return null;

    const fileExt = file.name.split('.').pop();
    const safeExt = fileExt ? `.${fileExt}` : '';
    const fileName = `fiscal/${serviceType}/${requestId}/${user.id}/${Date.now()}${safeExt}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-attachments')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      if (uploadError.message?.includes('security') || uploadError.message?.includes('policy')) {
        toast.error('Sem permissão para upload. Faça login novamente.');
      } else if (uploadError.message?.includes('too large') || uploadError.message?.includes('size')) {
        toast.error('Arquivo muito grande. Máximo 10MB.');
      } else {
        toast.error('Erro ao enviar arquivo. Tente novamente.');
      }
      return null;
    }

    // Use 7 days (604800s) instead of 1h to prevent broken attachments
    const { data, error: signedUrlError } = await supabase.storage
      .from('chat-attachments')
      .createSignedUrl(fileName, 604800);

    if (signedUrlError || !data?.signedUrl) {
      console.error('Signed URL error:', signedUrlError);
      toast.error('Arquivo enviado mas erro ao gerar link. Tente novamente.');
      return null;
    }

    return {
      url: data.signedUrl,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      name: file.name,
    };
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !user || !requestId || !request) return;

    setSending(true);

    const content = newMessage.trim();
    setNewMessage('');

    let attachment: { url: string; type: string; name: string } | null = null;
    if (selectedFile) {
      setUploading(true);
      attachment = await uploadFile(selectedFile);
      setUploading(false);

      if (!attachment) {
        toast.error('Erro ao enviar arquivo');
        setNewMessage(content);
        setSending(false);
        return;
      }
    }

    // Receiver: se o usuário é o dono da solicitação, manda pro especialista; senão manda pro dono.
    // Hotfix: nunca permitir IDs inválidos (ex.: "specialist") — sempre UUID.
    const resolvedSpecialistId = specialistId ?? SPECIALIST.id;
    const receiverId = user.id === request.user_id ? resolvedSpecialistId : request.user_id;

    if (!isUuid(receiverId)) {
      console.error('Invalid receiver_id for fiscal chat message', {
        requestId,
        serviceType,
        userId: user.id,
        requestUserId: request.user_id,
        specialistId,
        resolvedSpecialistId,
        receiverId,
      });
      toast.error('Erro interno: destinatário inválido. Atualize a página e tente novamente.');
      setNewMessage(content);
      setSending(false);
      return;
    }

    const { error } = await supabase
      .from('fiscal_chat_messages')
      .insert({
        request_id: requestId,
        sender_id: user.id,
        receiver_id: receiverId,
        content: content || (attachment ? `📎 ${attachment.name}` : ''),
        attachment_url: attachment?.url,
        attachment_type: attachment?.type,
        attachment_name: attachment?.name,
      });

    if (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
      setNewMessage(content);
    } else {
      clearSelectedFile();
    }

    setSending(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Aguardando Análise', variant: 'secondary' },
      analyzing: { label: 'Em Análise', variant: 'default' },
      completed: { label: 'Concluído', variant: 'outline' },
      payment_pending: { label: 'Aguardando Pagamento', variant: 'destructive' },
    };
    const config = statusConfig[status] || { label: status, variant: 'secondary' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (!requestId) {
    return (
      <Card className={`flex flex-col items-center justify-center min-h-[400px] ${className}`}>
        <Scale className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma análise selecionada</h3>
        <p className="text-muted-foreground text-sm text-center max-w-xs">
          Selecione uma análise fiscal para visualizar o chat com o especialista
        </p>
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col h-full min-h-[400px] max-h-[calc(100vh-200px)] ${className}`}>
      {/* Header */}
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={SPECIALIST.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {SPECIALIST.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {SPECIALIST.name}
                <Sparkles className="h-4 w-4 text-primary" />
              </CardTitle>
              <p className="text-xs text-muted-foreground">{SPECIALIST.role}</p>
            </div>
          </div>
          {request && getStatusBadge(request.status)}
        </div>
        
        {/* Request Info */}
        {request && (
          <div className="mt-3 p-2 rounded-lg bg-background/80 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium">{request.company_name}</span>
              <span className="text-muted-foreground">CNPJ: {request.cnpj}</span>
            </div>
            {request.identified_value_cents && (
              <div className="mt-1 text-primary font-semibold">
                Valor Identificado: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(request.identified_value_cents / 100)}
              </div>
            )}
          </div>
        )}
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <Skeleton className="h-16 w-3/4 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <Scale className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Início da conversa</h4>
              <p className="text-sm text-muted-foreground max-w-xs">
                Nosso especialista irá analisar sua solicitação e entrará em contato em breve.
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => {
                const isOwn = msg.sender_id === user?.id;
                const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.sender_id !== msg.sender_id);

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isOwn && showAvatar && (
                      <Avatar className="h-8 w-8 mr-2 mt-1">
                        <AvatarImage src={SPECIALIST.avatar} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {SPECIALIST.initials}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {!isOwn && !showAvatar && <div className="w-10" />}
                    
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      }`}
                    >
                      <PaymentLinkRenderer content={msg.content} variant="user" />
                      
                      {msg.attachment_url && (
                        <a
                          href={msg.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`mt-2 flex items-center gap-2 text-xs ${
                            isOwn ? 'text-primary-foreground/80' : 'text-primary'
                          } hover:underline`}
                        >
                          <FileText className="h-3 w-3" />
                          {msg.attachment_name || 'Anexo'}
                        </a>
                      )}
                      
                      <div className={`flex items-center gap-1 mt-1 text-xs ${
                        isOwn ? 'text-primary-foreground/60 justify-end' : 'text-muted-foreground'
                      }`}>
                        <span>
                          {format(new Date(msg.created_at), 'HH:mm', { locale: ptBR })}
                        </span>
                        {isOwn && msg.read_at && (
                          <CheckCheck className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={scrollRef} />
        </ScrollArea>
      </CardContent>

      {/* Input */}
      <div className="p-3 border-t bg-muted/30">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || uploading}
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Paperclip className="h-5 w-5" />
            )}
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1"
            disabled={sending}
          />
          
          <Button
            type="submit"
            size="icon"
            disabled={(!newMessage.trim() && !selectedFile) || sending}
            className="shrink-0"
          >
            {sending ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>

        {selectedFile && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border bg-background/60 p-2">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Pré-visualização do anexo"
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{selectedFile.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearSelectedFile}
              className="shrink-0"
              disabled={sending || uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FiscalChatPanel;
