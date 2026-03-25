import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence } from 'framer-motion';
import { 
  Send, Paperclip, FileText, MessageCircle,
  ArrowLeft, Loader2
} from 'lucide-react';

import { 
  PremiumChatLayout, 
  ChatContainer, 
  ChatHeader, 
  ChatMessagesArea, 
  ChatInputArea 
} from '@/components/chat/PremiumChatLayout';
import { PremiumMessageBubble } from '@/components/chat/PremiumMessageBubble';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'specialist' | 'system';
  timestamp: Date;
  attachmentUrl?: string;
  attachmentName?: string;
}

export default function ChatJose() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const serviceParam = searchParams.get('servico') || 'ir';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setUserProfile(profile);
      
      const { data: existingMessages } = await supabase
        .from('specialist_chat_messages')
        .select('*')
        .eq('specialist_channel', 'jose')
        .order('created_at', { ascending: true })
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
      
      if (existingMessages && existingMessages.length > 0) {
        const dbMessages: Message[] = existingMessages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          sender: (msg.sender_type === 'user' ? 'user' : msg.sender_type === 'system' ? 'system' : 'specialist') as Message['sender'],
          timestamp: new Date(msg.created_at),
          attachmentUrl: msg.attachment_url || undefined,
          attachmentName: msg.attachment_name || undefined,
        }));
        setMessages(dbMessages);
      } else {
        const name = profile?.full_name?.split(' ')[0] || 'Cliente';
        setMessages([
          {
            id: 'welcome-1',
            content: `Olá, ${name}! 👋\n\nSou o José, especialista em Imposto de Renda. Recebi sua solicitação e estou pronto para cuidar da sua declaração.\n\nEnvie seus documentos pelo botão 📎 abaixo para começarmos!`,
            sender: 'specialist',
            timestamp: new Date(),
          },
        ]);
      }
    };
    
    loadData();
  }, [user]);
  
  // Realtime
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('specialist-chat-jose')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'specialist_chat_messages',
          filter: `specialist_channel=eq.jose`,
        },
        (payload) => {
          const msg = payload.new as any;
          if (msg.sender_id !== user.id) {
            setMessages(prev => [...prev, {
              id: msg.id,
              content: msg.content,
              sender: msg.sender_type === 'user' ? 'user' : msg.sender_type === 'system' ? 'system' : 'specialist',
              timestamp: new Date(msg.created_at),
              attachmentUrl: msg.attachment_url || undefined,
              attachmentName: msg.attachment_name || undefined,
            }]);
          }
        }
      )
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, [user]);
  
  useEffect(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    }
  }, [messages]);
  
  const persistMessage = async (content: string, senderType: 'user' | 'specialist' | 'system', attachmentUrl?: string, attachmentName?: string, attachmentType?: string) => {
    if (!user) return;
    try {
      await supabase.from('specialist_chat_messages').insert({
        specialist_channel: 'jose',
        service_type: serviceParam,
        sender_id: user.id,
        sender_type: senderType,
        content,
        attachment_url: attachmentUrl || null,
        attachment_name: attachmentName || null,
        attachment_type: attachmentType || null,
      });
    } catch (err) {
      console.error('Error persisting message:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    
    setIsSending(true);
    const msgContent = newMessage.trim();
    
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      content: msgContent,
      sender: 'user',
      timestamp: new Date(),
    }]);
    setNewMessage('');
    
    await persistMessage(msgContent, 'user');
    
    setTimeout(() => {
      const responses = [
        'Recebi! Vou verificar e te retorno em breve.',
        'Entendido! Estou analisando os dados.',
        'Perfeito! Já inclui isso na sua declaração.',
      ];
      setMessages(prev => [...prev, {
        id: `specialist-${Date.now()}`,
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: 'specialist',
        timestamp: new Date(),
      }]);
      setIsSending(false);
    }, 1500);
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'Máximo 50MB', variant: 'destructive' });
      return;
    }
    
    setIsSending(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `chat-jose/${user?.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: signedData, error: signedError } = await supabase.storage
        .from('chat-attachments')
        .createSignedUrl(fileName, 604800);
      
      if (signedError) throw signedError;
      
      const attachmentUrl = signedData.signedUrl;
      
      setMessages(prev => [...prev, {
        id: `user-${Date.now()}`,
        content: `📎 Documento enviado: ${file.name}`,
        sender: 'user',
        timestamp: new Date(),
        attachmentUrl,
        attachmentName: file.name,
      }]);
      
      await persistMessage(`📎 Documento enviado: ${file.name}`, 'user', attachmentUrl, file.name, file.type);
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `specialist-${Date.now()}`,
          content: `✅ Recebi o documento "${file.name}". Vou incluir na análise da sua declaração. Fique tranquilo(a)!`,
          sender: 'specialist',
          timestamp: new Date(),
        }]);
        setIsSending(false);
      }, 1000);
      
      toast({ title: 'Documento enviado!', description: 'O especialista foi notificado.' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Erro no upload', variant: 'destructive' });
      setIsSending(false);
    }
  };
  
  const SpecialistAvatar = () => (
    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
      <span className="text-white text-sm font-bold">J</span>
    </div>
  );
  
  return (
    <div className="min-h-[100dvh] bg-slate-50/80 flex flex-col">
      <Header onNavigate={() => navigate('/')} />
      
      <main className="flex-1 pt-20 pb-6">
        <PremiumChatLayout>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4 w-fit -ml-2"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Painel
          </Button>
          
          <ChatContainer className="h-[calc(100dvh-180px)] min-h-[400px]">
            <ChatHeader
              avatar={
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">J</span>
                </div>
              }
              title="Chat – José"
              subtitle="Imposto de Renda"
              badges={
                <Badge className="bg-emerald-500 text-white gap-1.5 text-xs">
                  <FileText className="h-3.5 w-3.5" />
                  Declaração IR
                </Badge>
              }
              className="bg-gradient-to-r from-emerald-600 to-teal-600"
            />
            
            <ChatMessagesArea>
              <AnimatePresence>
                {messages.map((message) => (
                  <PremiumMessageBubble
                    key={message.id}
                    content={message.content}
                    sender={message.sender}
                    timestamp={message.timestamp}
                    avatar={message.sender === 'specialist' ? <SpecialistAvatar /> : undefined}
                    senderName={message.sender === 'specialist' ? 'José' : undefined}
                    attachmentUrl={message.attachmentUrl}
                    attachmentName={message.attachmentName}
                    isNew={Date.now() - message.timestamp.getTime() < 3000}
                  />
                ))}
              </AnimatePresence>
              <div ref={scrollRef} />
            </ChatMessagesArea>
            
            <ChatInputArea>
              <div className="flex items-end gap-3">
                <label className="cursor-pointer shrink-0">
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileUpload}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  />
                  <div className="h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                    <Paperclip className="h-5 w-5 text-slate-600" />
                  </div>
                </label>
                
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 min-h-[42px] max-h-32 resize-none rounded-xl border-slate-200 focus:border-emerald-300 focus:ring-emerald-200"
                  rows={1}
                />
                
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim() || isSending}
                  className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shrink-0"
                >
                  {isSending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-slate-500 mt-2.5 text-center">
                📋 Chat conectado • Especialista em Imposto de Renda
              </p>
            </ChatInputArea>
          </ChatContainer>
        </PremiumChatLayout>
      </main>
    </div>
  );
}
