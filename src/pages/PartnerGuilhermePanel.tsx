import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Building, DollarSign, Users, Clock, CheckCircle, XCircle, AlertCircle,
  TrendingUp, Loader2, Search, Phone, Mail, User, FileText,
  Wallet, MessageCircle, Send, Scale, Shield, Eye, Calendar,
  Sparkles, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight,
  LayoutDashboard, Settings, LogOut, Menu, X, Paperclip, Download
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// GUILHERME BARROS - PAINEL EXCLUSIVO
const GUILHERME_PARTNER_ID = 'df40dfff-62bd-4b66-88bd-c811cd90d78d';
const GUILHERME_USER_ID = '596de7f7-4352-4058-8855-18f9489a0311';

interface CreditRepairRequest {
  id: string;
  user_id: string;
  full_name: string;
  cpf: string | null;
  email: string | null;
  phone: string | null;
  debt_amount_cents: number;
  status: string;
  payment_status: string;
  final_price_cents: number;
  created_at: string;
  partner_id: string | null;
}

interface FiscalRequest {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  company_name: string;
  cnpj: string;
  tax_regime: string;
  status: string;
  payment_status: string | null;
  service_fee_cents: number | null;
  identified_value_cents: number | null;
  created_at: string;
  partner_id: string | null;
}

interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read_at: string | null;
  attachment_url?: string | null;
  attachment_name?: string | null;
}

export default function PartnerGuilhermePanel() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<CreditRepairRequest[]>([]);
  const [fiscalRequests, setFiscalRequests] = useState<FiscalRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Chat state
  const [selectedRequest, setSelectedRequest] = useState<CreditRepairRequest | FiscalRequest | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Verify access
  useEffect(() => {
    if (!authLoading && user) {
      if (user.id !== GUILHERME_USER_ID) {
        toast({ 
          title: 'Acesso restrito', 
          description: 'Este painel é exclusivo do parceiro Guilherme Barros.',
          variant: 'destructive' 
        });
        navigate('/');
        return;
      }
      fetchData();
    } else if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading]);

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('guilherme-requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'credit_repair_requests',
        filter: `partner_id=eq.${GUILHERME_PARTNER_ID}`
      }, () => fetchData())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'fiscal_analysis_requests',
        filter: `partner_id=eq.${GUILHERME_PARTNER_ID}`
      }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Chat realtime
  useEffect(() => {
    if (!selectedRequest) return;

    const channel = supabase
      .channel(`chat-${selectedRequest.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'credit_repair_chat_messages',
        filter: `request_id=eq.${selectedRequest.id}`
      }, (payload) => {
        setChatMessages(prev => [...prev, payload.new as ChatMessage]);
        setTimeout(() => chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' }), 100);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedRequest?.id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [creditRes, fiscalRes] = await Promise.all([
        supabase
          .from('credit_repair_requests')
          .select('*')
          .eq('partner_id', GUILHERME_PARTNER_ID)
          .order('created_at', { ascending: false }),
        supabase
          .from('fiscal_analysis_requests')
          .select('*')
          .eq('partner_id', GUILHERME_PARTNER_ID)
          .order('created_at', { ascending: false })
      ]);

      if (creditRes.data) setRequests(creditRes.data);
      if (fiscalRes.data) setFiscalRequests(fiscalRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChatMessages = async (requestId: string) => {
    const { data } = await supabase
      .from('credit_repair_chat_messages')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });

    if (data) {
      setChatMessages(data);
      setTimeout(() => chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' }), 100);
    }
  };

  const handleSelectRequest = (request: CreditRepairRequest | FiscalRequest) => {
    setSelectedRequest(request);
    fetchChatMessages(request.id);
    setActiveTab('chat');
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRequest || !user) return;

    setIsSendingMessage(true);
    try {
      const { error } = await supabase.from('credit_repair_chat_messages').insert({
        request_id: selectedRequest.id,
        sender_id: user.id,
        receiver_id: selectedRequest.user_id || '',
        content: newMessage.trim()
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      toast({ title: 'Erro ao enviar mensagem', variant: 'destructive' });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string, table: 'credit_repair_requests' | 'fiscal_analysis_requests') => {
    const { error } = await supabase.from(table).update({ status }).eq('id', requestId);
    if (error) {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
    } else {
      toast({ title: 'Status atualizado!' });
      fetchData();
    }
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { class: string; icon: any; label: string }> = {
      pending: { class: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock, label: 'Pendente' },
      in_progress: { class: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: AlertCircle, label: 'Em Andamento' },
      negotiating: { class: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: MessageCircle, label: 'Negociando' },
      analyzing: { class: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', icon: Eye, label: 'Analisando' },
      completed: { class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle, label: 'Concluído' },
      cancelled: { class: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle, label: 'Cancelado' },
    };
    const cfg = config[status] || config.pending;
    const Icon = cfg.icon;
    return <Badge variant="outline" className={cfg.class}><Icon className="h-3 w-3 mr-1" />{cfg.label}</Badge>;
  };

  const stats = {
    total: requests.length + fiscalRequests.length,
    pending: requests.filter(r => r.status === 'pending').length + fiscalRequests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => ['in_progress', 'negotiating', 'analyzing'].includes(r.status)).length + fiscalRequests.filter(r => ['in_progress', 'analyzing'].includes(r.status)).length,
    completed: requests.filter(r => r.status === 'completed').length + fiscalRequests.filter(r => r.status === 'completed').length,
    totalRevenue: requests.filter(r => r.payment_status === 'paid').reduce((sum, r) => sum + r.final_price_cents, 0) +
      fiscalRequests.filter(r => r.payment_status === 'paid').reduce((sum, r) => sum + (r.service_fee_cents || 0), 0),
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || r.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredFiscalRequests = fiscalRequests.filter(r => {
    const matchesSearch = r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || r.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', tabId: 'overview' },
    { icon: Shield, label: 'Limpa Nome', tabId: 'limpa-nome', badge: requests.filter(r => r.status === 'pending').length },
    { icon: Scale, label: 'Módulo Fiscal', tabId: 'modulo-fiscal', badge: fiscalRequests.filter(r => r.status === 'pending').length },
    { icon: MessageCircle, label: 'Chat', tabId: 'chat' },
    { icon: DollarSign, label: 'Financeiro', tabId: 'financeiro' },
  ];

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Carregando painel...</p>
        </div>
      </div>
    );
  }

  const renderSidebar = () => (
    <TooltipProvider>
      <aside className={cn(
        'fixed left-0 top-0 z-40 h-screen transition-all duration-300 flex flex-col',
        'bg-card border-r border-border',
        collapsed ? 'w-16' : 'w-64',
        'hidden lg:flex'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center w-full')}>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <span className="text-base font-bold text-foreground">AtentAI</span>
                <span className="block text-[10px] text-emerald-500 font-medium -mt-0.5">Guilherme Barros</span>
              </div>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-7 h-6 w-6 rounded-full bg-card border shadow-sm"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tabId;
            return (
              <Tooltip key={item.tabId} delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveTab(item.tabId)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative',
                      isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                        {item.badge && item.badge > 0 && (
                          <span className="h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />}
                  </button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">{item.label}</TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-2 py-3 border-t border-border">
          <button
            onClick={() => signOut()}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
              collapsed && 'justify-center'
            )}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="text-sm">Sair</span>}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: 'Solicitações', value: stats.total, color: 'primary' },
          { icon: Clock, label: 'Pendentes', value: stats.pending, color: 'amber' },
          { icon: TrendingUp, label: 'Em Andamento', value: stats.inProgress, color: 'blue' },
          { icon: CheckCircle, label: 'Concluídos', value: stats.completed, color: 'emerald' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-5">
                <div className={`p-2.5 rounded-xl bg-${stat.color}-500/10 w-fit mb-3`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color}-400`} />
                </div>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue */}
      <Card className="bg-gradient-to-br from-emerald-500/10 via-card to-card border-emerald-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Receita Total (100% Plataforma)</p>
              <p className="text-3xl font-bold text-emerald-400">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-2">Pagamentos processados via Stripe</p>
            </div>
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Requests */}
      <Card className="bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-base">Últimas Solicitações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...requests.slice(0, 3), ...fiscalRequests.slice(0, 2)].slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer" onClick={() => handleSelectRequest(r)}>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">{r.full_name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{r.full_name}</p>
                    <p className="text-xs text-muted-foreground">{'company_name' in r ? r.company_name : 'Limpa Nome'}</p>
                  </div>
                </div>
                {getStatusBadge(r.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRequestList = (items: (CreditRepairRequest | FiscalRequest)[], type: 'limpa-nome' | 'fiscal') => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            {type === 'limpa-nome' ? <Shield className="h-5 w-5 text-emerald-400" /> : <Scale className="h-5 w-5 text-blue-400" />}
            {type === 'limpa-nome' ? 'Limpa Nome' : 'Módulo Fiscal'}
          </h2>
          <p className="text-sm text-muted-foreground">{items.length} solicitações</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((request, index) => (
          <motion.div key={request.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
            <Card className="bg-card/50 hover:border-primary/30 transition-all cursor-pointer" onClick={() => handleSelectRequest(request)}>
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary">{request.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold">{request.full_name}</h3>
                        {getStatusBadge(request.status)}
                        <Badge variant={request.payment_status === 'paid' ? 'default' : 'outline'} className={request.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : ''}>
                          {request.payment_status === 'paid' ? 'Pago' : 'Aguardando'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        {request.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{request.email}</span>}
                        {request.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{request.phone}</span>}
                      </div>
                      {'company_name' in request && (
                        <p className="text-xs text-muted-foreground mt-1">{request.company_name} • {request.cnpj}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency('final_price_cents' in request ? request.final_price_cents : (request.service_fee_cents || 0))}
                      </p>
                      <p className="text-xs text-muted-foreground">{format(new Date(request.created_at), 'dd/MM/yyyy', { locale: ptBR })}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-1" /> Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma solicitação encontrada</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="h-[calc(100vh-12rem)] flex gap-4">
      {/* Client List */}
      <Card className="w-80 flex-shrink-0 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Conversas
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {[...requests, ...fiscalRequests].map((r) => (
              <button
                key={r.id}
                onClick={() => handleSelectRequest(r)}
                className={cn(
                  'w-full p-3 rounded-lg text-left transition-colors',
                  selectedRequest?.id === r.id ? 'bg-primary/10' : 'hover:bg-muted/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">{r.full_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{r.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{'company_name' in r ? r.company_name : 'Limpa Nome'}</p>
                  </div>
                  {getStatusBadge(r.status)}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {selectedRequest ? (
          <>
            {/* Chat Header */}
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">{selectedRequest.full_name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{selectedRequest.full_name}</CardTitle>
                    <CardDescription>{'company_name' in selectedRequest ? selectedRequest.company_name : 'Limpa Nome'}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedRequest.status)}
                  <Select value={selectedRequest.status} onValueChange={(v) => updateRequestStatus(selectedRequest.id, v, 'company_name' in selectedRequest ? 'fiscal_analysis_requests' : 'credit_repair_requests')}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="analyzing">Analisando</SelectItem>
                      <SelectItem value="negotiating">Negociando</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={chatScrollRef}>
              <div className="space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma mensagem ainda</p>
                    <p className="text-sm">Envie uma mensagem para iniciar a conversa</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    const isOwn = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
                        <div className={cn(
                          'max-w-[70%] rounded-2xl px-4 py-2',
                          isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        )}>
                          <p className="text-sm">{msg.content}</p>
                          {msg.attachment_url && (
                            <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 mt-2 text-xs underline">
                              <Paperclip className="h-3 w-3" />
                              {msg.attachment_name || 'Anexo'}
                            </a>
                          )}
                          <p className={cn('text-[10px] mt-1', isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                            {format(new Date(msg.created_at), 'HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={isSendingMessage || !newMessage.trim()}>
                  {isSendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Selecione uma conversa</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  const renderFinanceiro = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Wallet className="h-5 w-5 text-emerald-400" />
        Financeiro
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-card">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Receita Total</p>
            <p className="text-3xl font-bold text-emerald-400 mt-2">{formatCurrency(stats.totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Pagamentos Recebidos</p>
            <p className="text-3xl font-bold mt-2">{requests.filter(r => r.payment_status === 'paid').length + fiscalRequests.filter(r => r.payment_status === 'paid').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Pagamentos Pendentes</p>
            <p className="text-3xl font-bold text-amber-400 mt-2">{requests.filter(r => r.payment_status === 'pending').length + fiscalRequests.filter(r => r.payment_status === 'pending').length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimos Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...requests.filter(r => r.payment_status === 'paid'), ...fiscalRequests.filter(r => r.payment_status === 'paid')]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 10)
              .map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{r.full_name}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(r.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                  </div>
                  <p className="font-bold text-emerald-400">
                    {formatCurrency('final_price_cents' in r ? r.final_price_cents : (r.service_fee_cents || 0))}
                  </p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'limpa-nome': return renderRequestList(filteredRequests, 'limpa-nome');
      case 'modulo-fiscal': return renderRequestList(filteredFiscalRequests, 'fiscal');
      case 'chat': return renderChat();
      case 'financeiro': return renderFinanceiro();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderSidebar()}

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold">Guilherme Barros</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background pt-16">
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.tabId}
                  onClick={() => { setActiveTab(item.tabId); setMobileMenuOpen(false); }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                    activeTab === item.tabId ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge className="ml-auto">{item.badge}</Badge>
                  )}
                </button>
              );
            })}
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sair</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className={cn(
        'transition-all duration-300 pt-4 lg:pt-8 pb-8 px-4 lg:px-8',
        collapsed ? 'lg:ml-16' : 'lg:ml-64',
        'mt-14 lg:mt-0'
      )}>
        {renderContent()}
      </main>
    </div>
  );
}
