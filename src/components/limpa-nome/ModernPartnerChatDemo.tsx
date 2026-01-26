import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Send, 
  MessageCircle,
  Check,
  CheckCheck,
  Paperclip,
  FileText,
  Image,
  Download,
  Shield,
  CreditCard,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle,
  User,
  Phone,
  Mail,
  Building,
  FileCheck,
  Zap
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mock data for demonstrating the chat with Limpa Nome simulation
const mockClients = [
  {
    id: '1',
    name: 'João Silva',
    avatar: null,
    status: 'negotiating',
    debt: 1500000, // cents
    lastMessage: 'Enviei os documentos solicitados',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
    unread: 2,
    cpf: '123.456.789-00',
    phone: '(11) 99999-1234',
    email: 'joao.silva@email.com',
    creditors: ['Serasa', 'SPC Brasil', 'Boa Vista'],
    progress: 65,
  },
  {
    id: '2',
    name: 'Maria Santos',
    avatar: null,
    status: 'in_progress',
    debt: 850000,
    lastMessage: 'Pode me explicar o próximo passo?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unread: 0,
    cpf: '987.654.321-00',
    phone: '(11) 98888-5678',
    email: 'maria.santos@email.com',
    creditors: ['Serasa', 'SPC Brasil'],
    progress: 35,
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    avatar: null,
    status: 'pending',
    debt: 2300000,
    lastMessage: 'Nova solicitação recebida',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
    unread: 1,
    cpf: '456.789.123-00',
    phone: '(21) 97777-9012',
    email: 'pedro.oliveira@email.com',
    creditors: ['Serasa', 'SPC Brasil', 'Boa Vista', 'Quod'],
    progress: 10,
  },
];

interface MockMessage {
  id: string;
  sender: 'client' | 'partner' | 'system';
  content: string;
  time: Date;
  read: boolean;
  type?: 'text' | 'document' | 'status' | 'document-request' | 'document-sent';
  documentName?: string;
  documentType?: string;
}

const generateMockMessages = (clientId: string): MockMessage[] => {
  if (clientId === '1') {
    return [
      { id: '1', sender: 'system', content: 'Processo Limpa Nome iniciado para João Silva', time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), read: true, type: 'status' },
      { id: '2', sender: 'partner', content: 'Olá João! Bem-vindo ao serviço Limpa Nome da AtentAI. Sou seu especialista dedicado. Para iniciarmos o processo, preciso que você envie os seguintes documentos:', time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), read: true, type: 'text' },
      { id: '3', sender: 'partner', content: 'Documentos necessários', time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), read: true, type: 'document-request', documentName: 'RG ou CNH, Comprovante de Residência, Extrato Serasa/SPC' },
      { id: '4', sender: 'client', content: 'Olá! Tudo bem. Vou providenciar os documentos. Posso enviar foto do RG?', time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), read: true, type: 'text' },
      { id: '5', sender: 'partner', content: 'Sim, pode enviar foto do RG, desde que esteja legível. CNH também é aceita como documento de identificação.', time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), read: true, type: 'text' },
      { id: '6', sender: 'client', content: 'Documento enviado', time: new Date(Date.now() - 1000 * 60 * 60 * 24), read: true, type: 'document-sent', documentName: 'RG_Joao_Silva.pdf', documentType: 'pdf' },
      { id: '7', sender: 'system', content: 'Documento RG recebido e validado ✓', time: new Date(Date.now() - 1000 * 60 * 60 * 24), read: true, type: 'status' },
      { id: '8', sender: 'client', content: 'Documento enviado', time: new Date(Date.now() - 1000 * 60 * 60 * 12), read: true, type: 'document-sent', documentName: 'Comprovante_Residencia.pdf', documentType: 'pdf' },
      { id: '9', sender: 'system', content: 'Documento Comprovante de Residência recebido ✓', time: new Date(Date.now() - 1000 * 60 * 60 * 12), read: true, type: 'status' },
      { id: '10', sender: 'partner', content: 'Perfeito! Recebi todos os documentos. Agora vou iniciar a análise junto aos órgãos de proteção ao crédito. O prazo é de 5-10 dias úteis. Você receberá atualizações por aqui.', time: new Date(Date.now() - 1000 * 60 * 60 * 10), read: true, type: 'text' },
      { id: '11', sender: 'system', content: 'Processo em negociação com credores: Serasa, SPC Brasil, Boa Vista', time: new Date(Date.now() - 1000 * 60 * 60 * 5), read: true, type: 'status' },
      { id: '12', sender: 'client', content: 'Enviei os documentos solicitados', time: new Date(Date.now() - 1000 * 60 * 5), read: false, type: 'text' },
      { id: '13', sender: 'client', content: 'Documento enviado', time: new Date(Date.now() - 1000 * 60 * 3), read: false, type: 'document-sent', documentName: 'Extrato_Serasa_Jan2026.pdf', documentType: 'pdf' },
    ];
  }
  if (clientId === '2') {
    return [
      { id: '1', sender: 'system', content: 'Processo Limpa Nome iniciado para Maria Santos', time: new Date(Date.now() - 1000 * 60 * 60 * 48), read: true, type: 'status' },
      { id: '2', sender: 'partner', content: 'Olá Maria! Sou seu especialista Limpa Nome. Vi que você tem pendências no Serasa e SPC. Vamos resolver isso juntos!', time: new Date(Date.now() - 1000 * 60 * 60 * 48), read: true, type: 'text' },
      { id: '3', sender: 'client', content: 'Oi! Que bom. Já tentei negociar mas não consegui. Vocês conseguem mesmo limpar?', time: new Date(Date.now() - 1000 * 60 * 60 * 47), read: true, type: 'text' },
      { id: '4', sender: 'partner', content: 'Sim! Nosso processo utiliza a antecipação do prazo prescricional através de ações coletivas. É 100% legal e remove permanentemente os registros dos birôs de crédito.', time: new Date(Date.now() - 1000 * 60 * 60 * 46), read: true, type: 'text' },
      { id: '5', sender: 'client', content: 'Pode me explicar o próximo passo?', time: new Date(Date.now() - 1000 * 60 * 60 * 2), read: true, type: 'text' },
    ];
  }
  return [
    { id: '1', sender: 'system', content: 'Nova solicitação de Limpa Nome recebida', time: new Date(Date.now() - 1000 * 60 * 30), read: false, type: 'status' },
    { id: '2', sender: 'client', content: 'Olá, gostaria de limpar meu nome. Tenho dívidas em vários lugares.', time: new Date(Date.now() - 1000 * 60 * 30), read: false, type: 'text' },
  ];
};

interface ModernPartnerChatDemoProps {
  onSelectRealChat?: (requestId: string, userId: string, userName: string) => void;
  showDemo?: boolean;
}

export function ModernPartnerChatDemo({ onSelectRealChat, showDemo = true }: ModernPartnerChatDemoProps) {
  const [selectedClient, setSelectedClient] = useState(mockClients[0]);
  const [messages, setMessages] = useState<MockMessage[]>(generateMockMessages(mockClients[0].id));
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSelectClient = (client: typeof mockClients[0]) => {
    setSelectedClient(client);
    setMessages(generateMockMessages(client.id));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: MockMessage = {
      id: Date.now().toString(),
      sender: 'partner',
      content: newMessage,
      time: new Date(),
      read: true,
      type: 'text',
    };
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  const getStatusConfig = (status: string) => {
    const config: Record<string, { class: string; label: string; icon: React.ElementType }> = {
      pending: { class: 'bg-amber-500/20 text-amber-300 border-amber-500/30', label: 'Novo', icon: AlertCircle },
      in_progress: { class: 'bg-blue-500/20 text-blue-300 border-blue-500/30', label: 'Em Análise', icon: Clock },
      negotiating: { class: 'bg-purple-500/20 text-purple-300 border-purple-500/30', label: 'Negociando', icon: MessageCircle },
      completed: { class: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', label: 'Concluído', icon: CheckCircle },
    };
    return config[status] || config.pending;
  };

  const renderMessage = (message: MockMessage) => {
    const isOwn = message.sender === 'partner';
    const isSystem = message.sender === 'system';

    if (isSystem) {
      return (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center my-4"
        >
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-slate-600/30 rounded-full px-4 py-2 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs text-slate-300">{message.content}</span>
          </div>
        </motion.div>
      );
    }

    if (message.type === 'document-request') {
      return (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-end my-3"
        >
          <div className="max-w-[85%]">
            <div className="bg-gradient-to-br from-emerald-600/90 to-emerald-700/90 rounded-2xl rounded-br-md p-4 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-white/10">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-white text-sm">Documentos Solicitados</span>
              </div>
              <div className="space-y-2">
                {message.documentName?.split(', ').map((doc, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                    <FileCheck className="h-4 w-4 text-emerald-200" />
                    <span className="text-sm text-white">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 justify-end mt-1">
              <span className="text-[10px] text-slate-500">
                {formatDistanceToNow(message.time, { addSuffix: true, locale: ptBR })}
              </span>
              <CheckCheck className="h-3 w-3 text-emerald-400" />
            </div>
          </div>
        </motion.div>
      );
    }

    if (message.type === 'document-sent') {
      return (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-start my-3"
        >
          <div className="flex items-end gap-2 max-w-[85%]">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white text-xs">
                {selectedClient.name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="bg-gradient-to-br from-slate-700/90 to-slate-800/90 rounded-2xl rounded-bl-md p-3 border border-slate-600/30">
                <div className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30">
                    <FileText className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-white font-medium block">{message.documentName}</span>
                    <span className="text-xs text-slate-400">PDF • Clique para baixar</span>
                  </div>
                  <Download className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] text-slate-500">
                  {formatDistanceToNow(message.time, { addSuffix: true, locale: ptBR })}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} my-2`}
      >
        <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
          {!isOwn && (
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white text-xs">
                {selectedClient.name[0]}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            <div
              className={`rounded-2xl px-4 py-2.5 ${
                isOwn
                  ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-br-md'
                  : 'bg-gradient-to-br from-slate-700/90 to-slate-800/90 text-white rounded-bl-md border border-slate-600/30'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
              <span className="text-[10px] text-slate-500">
                {formatDistanceToNow(message.time, { addSuffix: true, locale: ptBR })}
              </span>
              {isOwn && (
                message.read ? (
                  <CheckCheck className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Check className="h-3 w-3 text-slate-500" />
                )
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex rounded-2xl overflow-hidden border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Clients Sidebar */}
      <div className="w-[320px] border-r border-slate-700/50 flex flex-col bg-slate-900/50">
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20">
                <MessageCircle className="h-4 w-4 text-emerald-400" />
              </div>
              Conversas
            </h3>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              {mockClients.filter(c => c.unread > 0).length} novas
            </Badge>
          </div>
          <div className="relative">
            <Input 
              placeholder="Buscar cliente..." 
              className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 pl-9"
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          </div>
        </div>

        {/* Client List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {mockClients.map((client) => {
              const statusConfig = getStatusConfig(client.status);
              const StatusIcon = statusConfig.icon;
              return (
                <motion.button
                  key={client.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleSelectClient(client)}
                  className={`w-full p-3 rounded-xl flex items-start gap-3 transition-all ${
                    selectedClient.id === client.id 
                      ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30' 
                      : 'hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-slate-700">
                      <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white font-medium">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {client.unread > 0 && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">{client.unread}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white text-sm truncate">{client.name}</span>
                      <span className="text-[10px] text-slate-500">
                        {formatDistanceToNow(client.lastMessageTime, { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mb-2">{client.lastMessage}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusConfig.class}`}>
                        <StatusIcon className="h-2.5 w-2.5 mr-1" />
                        {statusConfig.label}
                      </Badge>
                      <span className="text-[10px] text-red-400 font-medium">{formatCurrency(client.debt)}</span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 border-2 border-emerald-500/30">
                <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-medium">
                  {selectedClient.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-white">{selectedClient.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    Dívida: <span className="text-red-400 font-medium">{formatCurrency(selectedClient.debt)}</span>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span>{selectedClient.creditors.join(', ')}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-slate-400 mb-1">Progresso do Processo</p>
                <div className="flex items-center gap-2">
                  <Progress value={selectedClient.progress} className="w-24 h-2" />
                  <span className="text-xs font-bold text-emerald-400">{selectedClient.progress}%</span>
                </div>
              </div>
              <Badge variant="outline" className={getStatusConfig(selectedClient.status).class}>
                {getStatusConfig(selectedClient.status).label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Client Info Bar */}
        <div className="px-4 py-3 border-b border-slate-700/30 bg-slate-800/30">
          <div className="flex items-center gap-6 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              <User className="h-3.5 w-3.5" />
              <span className="text-slate-300">{selectedClient.cpf}</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Phone className="h-3.5 w-3.5" />
              <span className="text-slate-300">{selectedClient.phone}</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Mail className="h-3.5 w-3.5" />
              <span className="text-slate-300">{selectedClient.email}</span>
            </span>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-1">
            <AnimatePresence>
              {messages.map(renderMessage)}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="px-4 py-2 border-t border-slate-700/30 bg-slate-800/20">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Ações rápidas:</span>
            {[
              { label: 'Solicitar Documentos', icon: FileText },
              { label: 'Atualizar Status', icon: Zap },
              { label: 'Enviar Relatório', icon: FileCheck },
            ].map((action, i) => (
              <Button 
                key={i}
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs text-slate-400 hover:text-white hover:bg-slate-700/50"
              >
                <action.icon className="h-3 w-3 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700/50 bg-slate-900/50">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-emerald-500/50"
            />
            <Button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-6"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
