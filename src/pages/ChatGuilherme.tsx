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
  Send, Paperclip, Shield, Scale, MessageCircle,
  ArrowLeft, FileText, Loader2
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
import { PaymentBannerSticky } from '@/components/chat/PaymentBannerSticky';
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
  type: 'limpanome' | 'analise-fiscal' | 'abertura-empresa' | 'geral';
  requestId?: string;
  label: string;
  color: string;
  icon: any;
}

const serviceContexts: Record<string, ServiceContext> = {
  'limpanome': {
    type: 'limpanome',
    label: 'Limpa Nome',
    color: 'bg-emerald-500',
    icon: Shield,
  },
  'analise-fiscal': {
    type: 'analise-fiscal',
    label: 'Análise Fiscal',
    color: 'bg-violet-500',
    icon: Scale,
  },
  'abertura-empresa': {
    type: 'abertura-empresa',
    label: 'Abertura de Empresa',
    color: 'bg-blue-500',
    icon: FileText,
  },
  'geral': {
    type: 'geral',
    label: 'Atendimento Geral',
    color: 'bg-slate-500',
    icon: MessageCircle,
  },
};

export default function ChatGuilherme() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const serviceParam = searchParams.get('servico') || 'geral';
  const requestId = searchParams.get('request') || undefined;
  const context = serviceContexts[serviceParam] || serviceContexts['geral'];
  
  // Get status service type (only for trackable services)
  const statusServiceType: StatusServiceType | null = 
    serviceParam === 'limpanome' ? 'limpanome' : 
    serviceParam === 'analise-fiscal' ? 'analise-fiscal' : null;
  
  // Service status tracking hook
  const { 
    currentStepIndex, 
    lastUpdatedAt, 
    isLoading: statusLoading,
  } = useServiceStatus(
    statusServiceType || 'limpanome',
    requestId,
    user?.id
  );
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isWhatsAppConnected] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isPaid, setIsPaid] = useState(false);
  
  // Service pricing map (only limpanome has direct checkout)
  const servicePricing = {
    'limpanome': 78000, // R$ 780
    'analise-fiscal': 0, // Pago no êxito - sem checkout direto
    'abertura-empresa': 0, // Via chat
    'geral': 0,
  };
  
  // Load user profile, check payment status, and initial messages
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      // Load user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setUserProfile(profile);
      
      // Check payment status if we have a request ID
      let isPaidRequest = false;
      if (requestId && context.type === 'limpanome') {
        const { data: request } = await supabase
          .from('credit_repair_requests')
          .select('payment_status')
          .eq('id', requestId)
          .single();
        
        isPaidRequest = request?.payment_status === 'paid';
        setIsPaid(isPaidRequest);
      }
      
      // Load welcome message based on context (with payment status for Limpa Nome)
      const welcomeMessages = getWelcomeMessages(context.type, profile?.full_name, isPaidRequest);
      setMessages(welcomeMessages);
    };
    
    loadData();
  }, [user, context.type, requestId]);
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const getWelcomeMessages = (serviceType: string, userName?: string, isPaidService?: boolean): Message[] => {
    const name = userName?.split(' ')[0] || 'Cliente';
    
    const baseMessages: Message[] = [];
    
    // Special welcome for paid Limpa Nome
    if (serviceType === 'limpanome' && isPaidService) {
      baseMessages.push({
        id: 'welcome-paid-1',
        content: `Olá! 👋\nSeu pagamento foi confirmado com sucesso.\n\nPara iniciarmos o processo de Limpa Nome, envie aqui no chat os documentos abaixo:\n\n📄 Documento com foto (RG ou CNH)\n📄 CPF\n📄 Comprovante de residência\n\nAssim que recebermos os documentos, nossa equipe dará andamento imediato no seu atendimento. 😊`,
        sender: 'specialist',
        timestamp: new Date(),
      });
      return baseMessages;
    }
    
    // Standard welcome
    baseMessages.push({
      id: 'welcome-1',
      content: `Olá, ${name}! 👋\n\nSou Guilherme, seu especialista em ${serviceContexts[serviceType]?.label || 'serviços'}. Recebi sua solicitação e estou aqui para te ajudar.`,
      sender: 'specialist',
      timestamp: new Date(),
    });
    
    if (serviceType === 'limpanome') {
      baseMessages.push({
        id: 'welcome-2',
        content: `📋 **Próximos passos para o Limpa Nome:**\n\n1. Análise do seu perfil de crédito\n2. Identificação das pendências\n3. Estratégia personalizada de recuperação\n\n📎 **Documentos necessários:**\n• RG ou CNH (frente e verso)\n• Comprovante de residência\n• Consulta de CPF (Serasa/SPC)\n\nPode enviar os documentos pelo botão 📎 abaixo!`,
        sender: 'specialist',
        timestamp: new Date(Date.now() + 1000),
      });
    } else if (serviceType === 'analise-fiscal') {
      baseMessages.push({
        id: 'welcome-2',
        content: `📋 **Próximos passos para Análise Fiscal:**\n\n1. Coleta de documentos fiscais\n2. Análise técnica com IA\n3. Gate de segurança\n4. Relatório completo\n\n📎 **Documentos para enviar:**\n• Últimas guias de impostos (DAS, DARF)\n• Balanço/DRE se disponível\n• Notas fiscais recentes\n\nEnvie pelo botão 📎 abaixo!`,
        sender: 'specialist',
        timestamp: new Date(Date.now() + 1000),
      });
    }
    
    return baseMessages;
  };
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    
    setIsSending(true);
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: newMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    // Simulate specialist response (in production, this would be real-time from admin)
    setTimeout(() => {
      const responses = [
        'Recebi sua mensagem! Vou analisar e te respondo em breve.',
        'Entendi! Estou verificando as informações.',
        'Perfeito! Já estou trabalhando nisso.',
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
    
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'Máximo 10MB', variant: 'destructive' });
      return;
    }
    
    setIsSending(true);
    
    try {
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `chat-guilherme/${user?.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(fileName);
      
      // Add message with attachment
      const attachmentMessage: Message = {
        id: `user-${Date.now()}`,
        content: `📎 Documento enviado: ${file.name}`,
        sender: 'user',
        timestamp: new Date(),
        attachmentUrl: urlData.publicUrl,
        attachmentName: file.name,
      };
      
      setMessages(prev => [...prev, attachmentMessage]);
      
      // Specialist confirmation
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `specialist-${Date.now()}`,
          content: `✅ Recebi o documento "${file.name}". Vou analisar e incluir no seu processo de ${context.label}.`,
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
    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
      <span className="text-white text-sm font-bold">G</span>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col">
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
          
          {/* Payment Banner - Separated from chat, sticky */}
          {context.type === 'limpanome' && servicePricing['limpanome'] > 0 && !isPaid && requestId && (
            <div className="mb-4">
              <PaymentBannerSticky
                serviceType="limpanome"
                servicePriceCents={servicePricing['limpanome']}
                requestId={requestId}
                isPaid={isPaid}
              />
            </div>
          )}
          
          {/* Chat Container with proper height */}
          <ChatContainer className="h-[calc(100vh-180px)] min-h-[500px]">
            {/* Header */}
            <ChatHeader
              avatar={
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">G</span>
                </div>
              }
              title="Chat – Guilherme"
              subtitle="Especialista em Atendimento"
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
            />
            
            {/* Status Card - Fixed at top of messages */}
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
                      senderName={message.sender === 'specialist' ? 'Guilherme' : undefined}
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
                💬 Chat conectado • Atendimento humano garantido
              </p>
            </ChatInputArea>
          </ChatContainer>
        </PremiumChatLayout>
      </main>
    </div>
  );
}
