import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Paperclip, BarChart3, FileText, MessageCircle,
  ArrowLeft, Loader2, Brain
} from 'lucide-react';

// Premium components
import { 
  PremiumChatLayout, 
  ChatContainer, 
  ChatHeader, 
  ChatMessagesArea, 
  ChatInputArea 
} from '@/components/chat/PremiumChatLayout';
import { PremiumMessageBubble } from '@/components/chat/PremiumMessageBubble';
import { ServiceStatusHeader, ServiceType as StatusServiceType } from '@/components/chat/ServiceStatusHeader';
import { StatusUpdateMessage } from '@/components/chat/StatusUpdateMessage';
import { useServiceStatus } from '@/hooks/useServiceStatus';

// WhatsApp Business Icon SVG component
const WhatsAppBusinessIcon = ({ className = "h-5 w-5", connected = true }: { className?: string; connected?: boolean }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path 
      d="M12.001 2C6.478 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.932-1.29A9.953 9.953 0 0012.001 22c5.523 0 10-4.477 10-10s-4.477-10-10-10z" 
      fill={connected ? "#25D366" : "#9CA3AF"}
    />
    <path 
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" 
      fill="white"
    />
    <circle cx="18" cy="6" r="4" fill={connected ? "#128C7E" : "#6B7280"} stroke="white" strokeWidth="1" />
    <text x="18" y="7.5" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold">B</text>
  </svg>
);

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'specialist' | 'system';
  timestamp: Date;
  attachmentUrl?: string;
  attachmentName?: string;
  isStatusUpdate?: boolean;
  statusData?: {
    type: 'status_change' | 'document_received' | 'document_analyzed';
    stepIndex: number;
    previousStepIndex?: number;
    documentName?: string;
  };
}

interface ServiceContext {
  type: 'bi-contabilidade' | 'contabilidade' | 'relatorios' | 'geral';
  requestId?: string;
  label: string;
  color: string;
  icon: any;
}

const serviceContexts: Record<string, ServiceContext> = {
  'bi-contabilidade': {
    type: 'bi-contabilidade',
    label: 'BI+ Contabilidade',
    color: 'bg-indigo-500',
    icon: Brain,
  },
  'contabilidade': {
    type: 'contabilidade',
    label: 'Contabilidade',
    color: 'bg-violet-500',
    icon: FileText,
  },
  'relatorios': {
    type: 'relatorios',
    label: 'Relatórios BI',
    color: 'bg-purple-500',
    icon: BarChart3,
  },
  'geral': {
    type: 'geral',
    label: 'Atendimento BI',
    color: 'bg-slate-500',
    icon: MessageCircle,
  },
};

export default function ChatCesar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const serviceParam = searchParams.get('servico') || 'geral';
  const requestId = searchParams.get('request') || undefined;
  const context = serviceContexts[serviceParam] || serviceContexts['geral'];
  
  // Get status service type (for BI tracking)
  const statusServiceType: StatusServiceType | null = 
    serviceParam === 'bi-contabilidade' ? 'bi-contabilidade' : null;
  
  // Service status tracking hook
  const { 
    currentStepIndex, 
    lastUpdatedAt, 
  } = useServiceStatus(
    statusServiceType || 'bi-contabilidade',
    requestId,
    user?.id
  );
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isWhatsAppConnected] = useState(true);
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
      
      const welcomeMessages = getWelcomeMessages(context.type, profile?.full_name);
      setMessages(welcomeMessages);
    };
    
    loadData();
  }, [user, context.type]);
  
  useEffect(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    }
  }, [messages]);
  
  const getWelcomeMessages = (serviceType: string, userName?: string): Message[] => {
    const name = userName?.split(' ')[0] || 'Cliente';
    
    const baseMessages: Message[] = [
      {
        id: 'welcome-1',
        content: `Olá, ${name}! 👋\n\nSou César, especialista em BI e Contabilidade. Recebi sua solicitação de ${serviceContexts[serviceType]?.label || 'serviço contábil'} e estou pronto para te ajudar.`,
        sender: 'specialist',
        timestamp: new Date(),
      },
    ];
    
    if (serviceType === 'bi-contabilidade') {
      baseMessages.push({
        id: 'welcome-2',
        content: `📊 **Próximos passos para BI+ Contabilidade:**\n\n1. Análise dos documentos enviados\n2. Processamento com IA\n3. Validação humana dos insights\n4. Entrega do relatório completo\n\n📎 **Documentos recomendados:**\n• Balanço Patrimonial\n• DRE (Demonstração de Resultados)\n• Fluxo de Caixa\n• Extratos bancários\n\nEnvie pelo botão 📎 abaixo!`,
        sender: 'specialist',
        timestamp: new Date(Date.now() + 1000),
      });
    }
    
    return baseMessages;
  };
  
  // Persist message to database
  const persistMessage = async (content: string, senderType: 'user' | 'specialist' | 'system', attachmentUrl?: string, attachmentName?: string, attachmentType?: string) => {
    if (!user) return;
    try {
      await supabase.from('specialist_chat_messages').insert({
        specialist_channel: 'cesar',
        service_type: context.type,
        request_id: requestId || null,
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
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: msgContent,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    // Persist to database
    await persistMessage(msgContent, 'user');
    
    setTimeout(() => {
      const responses = [
        'Recebi! Vou verificar essa informação e te retorno em breve.',
        'Entendido! Estou analisando os dados.',
        'Perfeito! Já inclui isso na análise.',
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, {
        id: `specialist-${Date.now()}`,
        content: response,
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
      const fileName = `chat-cesar/${user?.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Use signed URL (bucket is private) - 7 days validity
      const { data: signedData, error: signedError } = await supabase.storage
        .from('chat-attachments')
        .createSignedUrl(fileName, 604800);
      
      if (signedError) throw signedError;
      
      const attachmentUrl = signedData.signedUrl;
      
      const attachmentMessage: Message = {
        id: `user-${Date.now()}`,
        content: `📎 Documento enviado: ${file.name}`,
        sender: 'user',
        timestamp: new Date(),
        attachmentUrl,
        attachmentName: file.name,
      };
      
      setMessages(prev => [...prev, attachmentMessage]);
      
      // Persist attachment to database
      await persistMessage(`📎 Documento enviado: ${file.name}`, 'user', attachmentUrl, file.name, file.type);
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `specialist-${Date.now()}`,
          content: `✅ Recebi o documento "${file.name}". Vou incluir na análise de ${context.label}. Fique tranquilo(a), você será notificado quando tivermos novidades!`,
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
  
  const ServiceIcon = context.icon;
  
  // Specialist avatar component
  const SpecialistAvatar = () => (
    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
      <span className="text-white text-sm font-bold">C</span>
    </div>
  );
  
  return (
    <div className="min-h-[100dvh] bg-slate-50/80 flex flex-col">
      <Header onNavigate={() => navigate('/')} />
      
      <main className="flex-1 pt-20 pb-6">
        <PremiumChatLayout>
          {/* Back button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4 w-fit -ml-2"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Painel
          </Button>
          
          {/* Chat Container */}
          <ChatContainer className="h-[calc(100dvh-180px)] min-h-[400px]">
            {/* Header - Violet/Indigo gradient for César */}
            <ChatHeader
              avatar={
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">C</span>
                </div>
              }
              title="Chat – César"
              subtitle="BI & Contabilidade"
              badges={
                <>
                  <Badge className={`${context.color} text-white gap-1.5 text-xs`}>
                    <ServiceIcon className="h-3.5 w-3.5" />
                    {context.label}
                  </Badge>
                  
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10">
                    <WhatsAppBusinessIcon connected={isWhatsAppConnected} className="h-4 w-4" />
                    <span className="text-xs text-white/80">Chat</span>
                    <span className={`h-2 w-2 rounded-full ${isWhatsAppConnected ? 'bg-green-400' : 'bg-gray-400'}`} />
                  </div>
                </>
              }
              className="bg-gradient-to-r from-violet-600 to-indigo-600"
            />
            
            {/* Status Card - Fixed at top */}
            {statusServiceType && (
              <ServiceStatusHeader
                serviceType={statusServiceType}
                currentStepIndex={currentStepIndex}
                lastUpdatedAt={lastUpdatedAt}
              />
            )}
            
            {/* Messages Area */}
            <ChatMessagesArea>
              <AnimatePresence>
                {messages.map((message) => {
                  // Render status update messages differently
                  if (message.isStatusUpdate && message.statusData && statusServiceType) {
                    return (
                      <StatusUpdateMessage
                        key={message.id}
                        type={message.statusData.type}
                        serviceType={statusServiceType}
                        stepIndex={message.statusData.stepIndex}
                        previousStepIndex={message.statusData.previousStepIndex}
                        documentName={message.statusData.documentName}
                        timestamp={message.timestamp}
                        isNew={Date.now() - message.timestamp.getTime() < 5000}
                      />
                    );
                  }
                  
                  return (
                    <PremiumMessageBubble
                      key={message.id}
                      content={message.content}
                      sender={message.sender}
                      timestamp={message.timestamp}
                      avatar={message.sender === 'specialist' ? <SpecialistAvatar /> : undefined}
                      senderName={message.sender === 'specialist' ? 'César' : undefined}
                      attachmentUrl={message.attachmentUrl}
                      attachmentName={message.attachmentName}
                      isNew={Date.now() - message.timestamp.getTime() < 3000}
                    />
                  );
                })}
              </AnimatePresence>
              <div ref={scrollRef} />
            </ChatMessagesArea>
            
            {/* Input Area */}
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
                  className="flex-1 min-h-[42px] max-h-32 resize-none rounded-xl border-slate-200 focus:border-violet-300 focus:ring-violet-200"
                  rows={1}
                />
                
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim() || isSending}
                  className="h-10 w-10 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shrink-0"
                >
                  {isSending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-slate-500 mt-2.5 text-center">
                📊 Chat conectado • Especialista em BI & Contabilidade
              </p>
            </ChatInputArea>
          </ChatContainer>
        </PremiumChatLayout>
      </main>
    </div>
  );
}
