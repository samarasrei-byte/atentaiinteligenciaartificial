import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Building, DollarSign, Users, Clock, CheckCircle, XCircle, AlertCircle,
  TrendingUp, Loader2, Search, RefreshCw, Phone, Mail, User, FileText,
  MessageCircle, CreditCard, Send, Shield, Scale, Activity, Sparkles,
  Eye, Calendar, ChevronRight, ArrowLeft, Briefcase, Store
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Partner {
  id: string;
  company_name: string;
  trade_name: string | null;
  email: string;
  phone: string | null;
  commission_percent: number;
  is_active: boolean;
  total_requests: number;
  total_revenue_cents: number;
  contact_person: string;
}

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
  completed_at: string | null;
  partner_id: string | null;
  debt_description?: string | null;
  creditors?: string[];
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
  annual_revenue_cents?: number | null;
}

interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read_at: string | null;
}

// Partner Info - Guilherme Mesquita
const PARTNER_INFO = {
  name: 'Guilherme Mesquita',
  role: 'Especialista em Recuperação Financeira',
  avatar: null,
  company: 'Parceiro AtentAI',
  specialty: 'Limpa Nome & Análise Fiscal'
};

export default function PartnerGuilhermePage() {
  const { user, loading: authLoading, hasRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'all' | 'limpa-nome' | 'fiscal' | 'marketplace'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [requests, setRequests] = useState<CreditRepairRequest[]>([]);
  const [fiscalRequests, setFiscalRequests] = useState<FiscalRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<CreditRepairRequest | FiscalRequest | null>(null);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [requestType, setRequestType] = useState<'limpa-nome' | 'fiscal'>('limpa-nome');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      checkAccessAndFetchData();
    }
  }, [user, authLoading]);

  const checkAccessAndFetchData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Check if user is admin
      const adminCheck = hasRole('admin');
      setIsAdmin(adminCheck);

      // Check if user is a partner user
      const { data: partnerUser, error: partnerUserError } = await supabase
        .from('credit_repair_partner_users')
        .select('partner_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (partnerUser) {
        // User is a partner, fetch partner data
        const { data: partnerData } = await supabase
          .from('credit_repair_partners')
          .select('*')
          .eq('id', partnerUser.partner_id)
          .single();

        if (partnerData) {
          setPartner(partnerData);
          await fetchRequestsForPartner(partnerData.id);
        }
      } else if (adminCheck) {
        // Admin can see all requests - fetch partner Guilherme Mesquita
        const { data: guilhermePartner } = await supabase
          .from('credit_repair_partners')
          .select('*')
          .eq('contact_person', 'Guilherme Mesquita')
          .maybeSingle();

        if (guilhermePartner) {
          setPartner(guilhermePartner);
          await fetchRequestsForPartner(guilhermePartner.id);
        } else {
          // Create partner Guilherme if doesn't exist
          await createGuilhermePartner();
        }
      } else {
        toast({ title: 'Acesso negado', description: 'Você não tem permissão para acessar esta página.', variant: 'destructive' });
        navigate('/dashboard');
        return;
      }
    } catch (error) {
      console.error('Error checking access:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createGuilhermePartner = async () => {
    const { data, error } = await supabase
      .from('credit_repair_partners')
      .insert({
        company_name: 'Parceiro AtentAI',
        trade_name: 'Guilherme Mesquita Especialista',
        contact_person: 'Guilherme Mesquita',
        email: 'guilherme.mesquita@atentai.com',
        phone: '(11) 99999-0000',
        is_active: true,
        commission_percent: 15,
        status: 'active'
      })
      .select()
      .single();

    if (!error && data) {
      setPartner(data);
      toast({ title: 'Parceiro criado', description: 'Guilherme foi configurado como parceiro.' });
    }
  };

  const fetchRequestsForPartner = async (partnerId: string) => {
    // Fetch Limpa Nome requests
    const { data: limpaNomeData, error: limpaNomeError } = await supabase
      .from('credit_repair_requests')
      .select('*')
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false });

    if (!limpaNomeError) {
      setRequests(limpaNomeData || []);
    }

    // Fetch Fiscal requests
    const { data: fiscalData, error: fiscalError } = await supabase
      .from('fiscal_analysis_requests')
      .select('*')
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false });

    if (!fiscalError) {
      setFiscalRequests(fiscalData || []);
    }
  };

  // Realtime subscriptions
  useEffect(() => {
    if (!partner?.id) return;

    const channel = supabase
      .channel(`partner-${partner.id}-requests`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'credit_repair_requests', filter: `partner_id=eq.${partner.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRequests(prev => [payload.new as CreditRepairRequest, ...prev]);
            toast({ title: '🎉 Nova solicitação Limpa Nome!', description: `${(payload.new as any).full_name}` });
          } else if (payload.eventType === 'UPDATE') {
            setRequests(prev => prev.map(r => r.id === payload.new.id ? payload.new as CreditRepairRequest : r));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'fiscal_analysis_requests', filter: `partner_id=eq.${partner.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setFiscalRequests(prev => [payload.new as FiscalRequest, ...prev]);
            toast({ title: '📊 Nova análise fiscal!', description: `${(payload.new as any).company_name}` });
          } else if (payload.eventType === 'UPDATE') {
            setFiscalRequests(prev => prev.map(r => r.id === payload.new.id ? payload.new as FiscalRequest : r));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partner?.id]);

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { class: string; icon: any; label: string }> = {
      pending: { class: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock, label: 'Nova' },
      in_progress: { class: 'bg-blue-100 text-blue-700 border-blue-200', icon: Activity, label: 'Em Análise' },
      analyzing: { class: 'bg-cyan-100 text-cyan-700 border-cyan-200', icon: Eye, label: 'Analisando' },
      negotiating: { class: 'bg-purple-100 text-purple-700 border-purple-200', icon: MessageCircle, label: 'Em Contato' },
      completed: { class: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle, label: 'Finalizada' },
      cancelled: { class: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Cancelada' },
    };
    const cfg = config[status] || config.pending;
    const Icon = cfg.icon;
    return <Badge variant="outline" className={cfg.class}><Icon className="h-3 w-3 mr-1" />{cfg.label}</Badge>;
  };

  const getOriginBadge = (type: 'limpa-nome' | 'fiscal' | 'marketplace') => {
    const config: Record<string, { class: string; icon: any; label: string }> = {
      'limpa-nome': { class: 'bg-emerald-100 text-emerald-700', icon: Shield, label: 'Limpa Nome' },
      'fiscal': { class: 'bg-blue-100 text-blue-700', icon: Scale, label: 'Módulo Fiscal' },
      'marketplace': { class: 'bg-purple-100 text-purple-700', icon: Store, label: 'Marketplace' },
    };
    const cfg = config[type];
    const Icon = cfg.icon;
    return <Badge className={cfg.class}><Icon className="h-3 w-3 mr-1" />{cfg.label}</Badge>;
  };

  const updateRequestStatus = async (requestId: string, type: 'limpa-nome' | 'fiscal', newStatus: string) => {
    const table = type === 'limpa-nome' ? 'credit_repair_requests' : 'fiscal_analysis_requests';
    
    const { error } = await supabase
      .from(table)
      .update({ status: newStatus })
      .eq('id', requestId);

    if (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    } else {
      toast({ title: 'Status atualizado!' });
    }
  };

  const openChat = (request: CreditRepairRequest | FiscalRequest, type: 'limpa-nome' | 'fiscal') => {
    setSelectedRequest(request);
    setRequestType(type);
    setShowChatDialog(true);
    fetchChatMessages(request.id, type);
  };

  const fetchChatMessages = async (requestId: string, type: 'limpa-nome' | 'fiscal') => {
    const table = type === 'limpa-nome' ? 'credit_repair_chat_messages' : 'credit_repair_chat_messages';
    
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setChatMessages(data);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRequest || !user) return;

    const messageData = {
      request_id: selectedRequest.id,
      sender_id: user.id,
      receiver_id: selectedRequest.user_id,
      content: newMessage.trim(),
    };

    const { error } = await supabase
      .from('credit_repair_chat_messages')
      .insert(messageData);

    if (!error) {
      setNewMessage('');
      fetchChatMessages(selectedRequest.id, requestType);
    }
  };

  // Combined and filtered requests
  const allRequests = [
    ...requests.map(r => ({ ...r, type: 'limpa-nome' as const })),
    ...fiscalRequests.map(r => ({ ...r, type: 'fiscal' as const })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filteredRequests = allRequests.filter(r => {
    const matchesSearch = r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesTab = activeTab === 'all' || r.type === activeTab;
    return matchesSearch && matchesStatus && matchesTab;
  });

  // Stats
  const stats = {
    total: allRequests.length,
    pending: allRequests.filter(r => r.status === 'pending').length,
    inProgress: allRequests.filter(r => ['in_progress', 'analyzing', 'negotiating'].includes(r.status)).length,
    completed: allRequests.filter(r => r.status === 'completed').length,
    limpaNome: requests.length,
    fiscal: fiscalRequests.length,
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando painel do parceiro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">G</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Painel {PARTNER_INFO.name}</h1>
                  <p className="text-sm text-slate-500">{PARTNER_INFO.specialty}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <Eye className="h-3 w-3 mr-1" />
                  Modo Admin
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={() => checkAccessAndFetchData()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: FileText, color: 'primary' },
            { label: 'Novas', value: stats.pending, icon: Clock, color: 'amber' },
            { label: 'Em Andamento', value: stats.inProgress, icon: Activity, color: 'blue' },
            { label: 'Finalizadas', value: stats.completed, icon: CheckCircle, color: 'emerald' },
            { label: 'Limpa Nome', value: stats.limpaNome, icon: Shield, color: 'green' },
          ].map((stat) => (
            <Card key={stat.label} className="bg-white border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`h-5 w-5 text-${stat.color}-500`} />
                </div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Tabs */}
              <div className="flex gap-2">
                {[
                  { id: 'all', label: 'Todas', icon: FileText },
                  { id: 'limpa-nome', label: 'Limpa Nome', icon: Shield },
                  { id: 'fiscal', label: 'Módulo Fiscal', icon: Scale },
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={activeTab === tab.id ? 'bg-primary text-white' : ''}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.label}
                    {tab.id === 'limpa-nome' && <Badge className="ml-2 bg-white/20">{stats.limpaNome}</Badge>}
                    {tab.id === 'fiscal' && <Badge className="ml-2 bg-white/20">{stats.fiscal}</Badge>}
                  </Button>
                ))}
              </div>

              {/* Search & Filter */}
              <div className="flex gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Buscar solicitante..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-10 bg-slate-50" 
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] bg-slate-50">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Nova</SelectItem>
                    <SelectItem value="in_progress">Em Análise</SelectItem>
                    <SelectItem value="negotiating">Em Contato</SelectItem>
                    <SelectItem value="completed">Finalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredRequests.length === 0 ? (
              <Card className="bg-white border-slate-200">
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-700">Nenhuma solicitação encontrada</h3>
                  <p className="text-slate-500">As solicitações dos módulos Limpa Nome e Fiscal aparecerão aqui</p>
                </CardContent>
              </Card>
            ) : (
              filteredRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="bg-white border-slate-200 hover:border-primary/30 transition-all hover:shadow-md">
                    <CardContent className="p-5">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* User Info */}
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 border-2 border-slate-100">
                            <AvatarFallback className="bg-slate-100 text-slate-600">
                              {request.full_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-semibold text-slate-900">{request.full_name}</h3>
                              {getOriginBadge(request.type)}
                              {getStatusBadge(request.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                              {request.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {request.email}
                                </span>
                              )}
                              {request.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {request.phone}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(request.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </span>
                            </div>
                            
                            {/* Type-specific info */}
                            {request.type === 'limpa-nome' && 'debt_amount_cents' in request && (
                              <p className="text-sm text-slate-600 mt-2">
                                Dívida estimada: <span className="font-medium">{formatCurrency(request.debt_amount_cents)}</span>
                              </p>
                            )}
                            {request.type === 'fiscal' && 'company_name' in request && (
                              <p className="text-sm text-slate-600 mt-2">
                                Empresa: <span className="font-medium">{request.company_name}</span> • Regime: {request.tax_regime}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Select 
                            value={request.status} 
                            onValueChange={(value) => updateRequestStatus(request.id, request.type, value)}
                          >
                            <SelectTrigger className="w-[140px] text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Nova</SelectItem>
                              <SelectItem value="in_progress">Em Análise</SelectItem>
                              <SelectItem value="negotiating">Em Contato</SelectItem>
                              <SelectItem value="completed">Finalizada</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button 
                            size="sm" 
                            onClick={() => openChat(request, request.type)}
                            className="bg-primary text-white"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Chat Dialog */}
      <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedRequest?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{selectedRequest?.full_name}</p>
                <p className="text-xs text-slate-500 font-normal">
                  {requestType === 'limpa-nome' ? 'Limpa Nome' : 'Módulo Fiscal'}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col h-[400px]">
            <ScrollArea className="flex-1 p-4 border rounded-lg bg-slate-50">
              {chatMessages.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma mensagem ainda</p>
                  <p className="text-sm">Inicie a conversa com o cliente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        msg.sender_id === user?.id 
                          ? 'bg-primary text-white' 
                          : 'bg-white border border-slate-200'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender_id === user?.id ? 'text-white/70' : 'text-slate-400'
                        }`}>
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            <div className="flex gap-2 mt-4">
              <Textarea
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="resize-none"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button onClick={sendMessage} className="self-end">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
