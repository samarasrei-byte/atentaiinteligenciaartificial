import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  MessageCircle,
  Loader2,
  Check,
  CheckCheck,
  Paperclip,
  FileText,
  X,
  Bot,
  User,
  Sparkles,
  Zap,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  is_ai?: boolean;
}

interface CreditRepairAIChatProps {
  requestId: string;
  otherUserId: string;
  otherUserName: string;
  isAdmin?: boolean;
}

const AI_SYSTEM_ID = 'ai-assistant-limpa-nome';

// Pre-defined AI responses for common questions
const AI_RESPONSES: Record<string, string> = {
  'como funciona': `🤖 **Como funciona o Limpa Nome?**

1️⃣ **Análise do CPF** - Verificamos todas as pendências em SPC, Serasa, SCPC e Boa Vista

2️⃣ **Negociação** - Nossos especialistas entram em contato com os credores

3️⃣ **Regularização** - Acompanhamos até seu nome ficar limpo

4️⃣ **Certificado** - Você recebe comprovante de quitação

💡 Um especialista humano entrará em contato em breve para detalhes personalizados!`,

  'quanto tempo': `🤖 **Prazo para Limpar o Nome**

⏱️ O processo geralmente leva de **15 a 45 dias**, dependendo:

- Quantidade de dívidas
- Bureaus envolvidos
- Complexidade das negociações

📞 Um especialista analisará seu caso específico e dará um prazo mais preciso!`,

  'documentos': `🤖 **Documentos Necessários**

📄 Para iniciar o processo, precisamos de:

✅ RG ou CNH (frente e verso)
✅ CPF
✅ Comprovante de residência atual
✅ Comprovante de renda (se houver)

💡 Você pode enviar os documentos por este chat mesmo! Um especialista verificará.`,

  'serasa': `🤖 **Consulta Serasa**

O Serasa é um dos bureaus que trabalhamos. Nosso serviço inclui:

✅ Consulta ao Serasa
✅ Consulta ao SPC
✅ Consulta ao SCPC
✅ Consulta ao Boa Vista

🔒 Todos os bureaus são verificados e tratados em conjunto!`,

  'spc': `🤖 **Consulta SPC**

Sim, incluímos o SPC no nosso serviço completo! 

Verificamos e negociamos dívidas em:
- SPC Brasil
- Serasa Experian
- SCPC
- Boa Vista SCPC

💼 Um especialista entrará em contato para iniciar seu caso!`,

  'default': `🤖 Obrigado pela sua mensagem! 

Sou a assistente virtual do Limpa Nome. Posso ajudar com:

📋 **Como funciona** o processo
⏱️ **Prazos** estimados
📄 **Documentos** necessários
💳 **Bureaus** que consultamos

Um **especialista humano** também receberá sua mensagem e responderá em breve com informações personalizadas para o seu caso!

💬 Enquanto isso, posso ajudar com alguma dúvida rápida?`,
};

function getAIResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('como funciona') || lowerMessage.includes('como é') || lowerMessage.includes('processo')) {
    return AI_RESPONSES['como funciona'];
  }
  if (lowerMessage.includes('tempo') || lowerMessage.includes('prazo') || lowerMessage.includes('demora') || lowerMessage.includes('dias')) {
    return AI_RESPONSES['quanto tempo'];
  }
  if (lowerMessage.includes('documento') || lowerMessage.includes('precisa') || lowerMessage.includes('enviar')) {
    return AI_RESPONSES['documentos'];
  }
  if (lowerMessage.includes('serasa')) {
    return AI_RESPONSES['serasa'];
  }
  if (lowerMessage.includes('spc')) {
    return AI_RESPONSES['spc'];
  }
  
  return AI_RESPONSES['default'];
}

export function CreditRepairAIChat({ 
  requestId, 
  otherUserId, 
  otherUserName,
  isAdmin = false 
}: CreditRepairAIChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isAITyping, setIsAITyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!requestId || !user) return;

    const loadMessages = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('credit_repair_chat_messages')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
      } else {
        // Mark AI messages
        const messagesWithAI = (data || []).map(msg => ({
          ...msg,
          is_ai: msg.sender_id === AI_SYSTEM_ID
        }));
        setMessages(messagesWithAI);
      }
      setIsLoading(false);
    };

    loadMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`credit-repair-ai-chat-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'credit_repair_chat_messages',
          filter: `request_id=eq.${requestId}`
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages(prev => [...prev, { ...newMsg, is_ai: newMsg.sender_id === AI_SYSTEM_ID }]);
          
          if (newMsg.receiver_id === user.id && !newMsg.read_at) {
            markAsRead(newMsg.id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'credit_repair_chat_messages',
          filter: `request_id=eq.${requestId}`
        },
        (payload) => {
          const updatedMsg = payload.new as ChatMessage;
          setMessages(prev => 
            prev.map(msg => msg.id === updatedMsg.id ? { ...updatedMsg, is_ai: updatedMsg.sender_id === AI_SYSTEM_ID } : msg)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAITyping]);

  useEffect(() => {
    if (!user || messages.length === 0) return;

    const unreadMessages = messages.filter(
      msg => msg.receiver_id === user.id && !msg.read_at
    );

    unreadMessages.forEach(msg => markAsRead(msg.id));
  }, [messages, user]);

  const markAsRead = async (messageId: string) => {
    await supabase
      .from('credit_repair_chat_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo é 10MB.',
        variant: 'destructive',
      });
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
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `credit-repair/${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-attachments')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data, error: signedUrlError } = await supabase.storage
      .from('chat-attachments')
      .createSignedUrl(fileName, 3600); // 1 hour expiry for security

    if (signedUrlError || !data?.signedUrl) {
      console.error('Signed URL error:', signedUrlError);
      return null;
    }

    return {
      url: data.signedUrl,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      name: file.name,
    };
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !user || isSending) return;

    setIsSending(true);
    const messageContent = newMessage.trim();
    
    let attachment = null;
    
    if (selectedFile) {
      setIsUploading(true);
      attachment = await uploadFile(selectedFile);
      setIsUploading(false);
      
      if (!attachment) {
        toast({
          title: 'Erro ao enviar arquivo',
          description: 'Tente novamente.',
          variant: 'destructive',
        });
        setIsSending(false);
        return;
      }
    }

    // Send user message
    const { error } = await supabase
      .from('credit_repair_chat_messages')
      .insert({
        request_id: requestId,
        sender_id: user.id,
        receiver_id: otherUserId,
        content: messageContent || (attachment ? `📎 ${attachment.name}` : ''),
        attachment_url: attachment?.url,
        attachment_type: attachment?.type,
        attachment_name: attachment?.name,
      });

    if (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erro ao enviar mensagem',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
      setIsSending(false);
      return;
    }

    setNewMessage('');
    clearSelectedFile();
    setIsSending(false);

    // If not admin, trigger AI response
    if (!isAdmin && messageContent) {
      setIsAITyping(true);
      
      // Simulate AI thinking time
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      
      const aiResponse = getAIResponse(messageContent);
      
      // Insert AI response (this will be visible to both user and admin)
      await supabase
        .from('credit_repair_chat_messages')
        .insert({
          request_id: requestId,
          sender_id: AI_SYSTEM_ID,
          receiver_id: user.id,
          content: aiResponse,
        });
      
      setIsAITyping(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderAttachment = (message: ChatMessage) => {
    if (!message.attachment_url) return null;

    if (message.attachment_type === 'image') {
      return (
        <a 
          href={message.attachment_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block mt-2"
        >
          <img 
            src={message.attachment_url} 
            alt={message.attachment_name || 'Imagem'}
            className="max-w-[200px] max-h-[200px] rounded-lg object-cover border border-border"
          />
        </a>
      );
    }

    return (
      <a 
        href={message.attachment_url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 mt-2 p-2 rounded bg-background/50 hover:bg-background/80 transition-colors"
      >
        <FileText className="h-4 w-4" />
        <span className="text-xs underline">{message.attachment_name}</span>
      </a>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border border-border overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-gradient-to-r from-rose-500/10 to-pink-500/10">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-gradient-to-br from-rose-500 to-pink-600 text-white">
            {isAdmin ? getInitials(otherUserName) : '🛡️'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">
            {isAdmin ? otherUserName : 'Limpa Nome'}
          </h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Bot className="h-3 w-3" />
            {isAdmin ? 'Cliente' : 'IA + Especialista Humano'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            IA Ativa
          </Badge>
          <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
            <MessageCircle className="h-3 w-3 mr-1" />
            Online
          </Badge>
        </div>
      </div>

      {/* AI Info Banner */}
      {!isAdmin && (
        <div className="px-4 py-2 bg-primary/5 border-b border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="h-3 w-3 text-accent" />
            <span>Respostas instantâneas da IA + acompanhamento de especialista humano</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-rose-500" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Bem-vindo ao Limpa Nome!</h4>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Envie uma mensagem para começar. Nossa IA responderá instantaneamente e um especialista acompanhará seu caso.
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isMine = message.sender_id === user?.id;
              const isAI = message.sender_id === AI_SYSTEM_ID;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-2 max-w-[85%] ${isMine ? 'flex-row-reverse' : ''}`}>
                    {!isMine && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={isAI 
                          ? 'bg-gradient-to-br from-primary to-violet-500 text-white' 
                          : 'bg-gradient-to-br from-rose-500 to-pink-600 text-white'
                        }>
                          {isAI ? <Bot className="h-4 w-4" /> : getInitials(otherUserName)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isMine
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : isAI
                            ? 'bg-gradient-to-br from-primary/10 to-violet-500/10 text-foreground rounded-bl-sm border border-primary/20'
                            : 'bg-muted text-foreground rounded-bl-sm'
                      }`}
                    >
                      {isAI && (
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles className="h-3 w-3 text-primary" />
                          <span className="text-xs font-medium text-primary">Assistente IA</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {renderAttachment(message)}
                      <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                        <span className={`text-xs ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {formatDistanceToNow(new Date(message.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
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
                </div>
              );
            })
          )}
          
          {/* AI Typing Indicator */}
          {isAITyping && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-violet-500 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl px-4 py-3 bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/20 rounded-bl-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-muted-foreground">IA digitando...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* File Preview */}
      {selectedFile && (
        <div className="px-4 py-2 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2 p-2 bg-background rounded-lg">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="h-12 w-12 rounded object-cover" />
            ) : (
              <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearSelectedFile}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-border bg-muted/30">
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending || isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1"
            disabled={isSending}
          />
          <Button 
            type="submit" 
            disabled={(!newMessage.trim() && !selectedFile) || isSending}
            className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
