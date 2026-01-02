import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import AppSidebar from '@/components/layout/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, PieChart, Pie, Cell, BarChart, Bar, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  Building, DollarSign, Users, Clock, CheckCircle, XCircle, AlertCircle,
  TrendingUp, Loader2, Search, RefreshCw, Phone, Mail, User, FileText,
  Percent, BarChart3, PieChart as PieChartIcon, Wallet, MessageCircle
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreditRepairChat } from '@/components/limpa-nome/CreditRepairChat';
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
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

const chartConfig = {
  requests: { label: "Solicitações", color: "hsl(var(--primary))" },
  revenue: { label: "Receita", color: "hsl(var(--chart-2))" },
  commission: { label: "Comissão", color: "hsl(var(--success))" },
};

export default function PartnerPanel() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [requests, setRequests] = useState<CreditRepairRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<CreditRepairRequest | null>(null);
  const [showChatDialog, setShowChatDialog] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      fetchPartnerData();
    }
  }, [user, authLoading]);

  const fetchPartnerData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Find partner linked to this user
      const { data: partnerUser, error: partnerUserError } = await supabase
        .from('credit_repair_partner_users')
        .select('partner_id')
        .eq('user_id', user.id)
        .single();

      if (partnerUserError || !partnerUser) {
        toast({ title: 'Acesso negado', description: 'Você não está vinculado a uma empresa parceira.', variant: 'destructive' });
        navigate('/dashboard');
        return;
      }

      // Fetch partner details
      const { data: partnerData, error: partnerError } = await supabase
        .from('credit_repair_partners')
        .select('*')
        .eq('id', partnerUser.partner_id)
        .single();

      if (partnerError || !partnerData) {
        toast({ title: 'Erro ao carregar dados', variant: 'destructive' });
        return;
      }

      setPartner(partnerData);

      // Fetch requests for this partner
      const { data: requestsData, error: requestsError } = await supabase
        .from('credit_repair_requests')
        .select('*')
        .eq('partner_id', partnerUser.partner_id)
        .order('created_at', { ascending: false });

      if (!requestsError) {
        setRequests(requestsData || []);
      }
    } catch (error) {
      console.error('Error fetching partner data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { class: string; icon: any; label: string }> = {
      pending: { class: 'bg-accent/10 text-accent', icon: Clock, label: 'Pendente' },
      in_progress: { class: 'bg-info/10 text-info', icon: AlertCircle, label: 'Em Andamento' },
      negotiating: { class: 'bg-primary/10 text-primary', icon: MessageCircle, label: 'Negociando' },
      completed: { class: 'bg-success/10 text-success', icon: CheckCircle, label: 'Concluído' },
      cancelled: { class: 'bg-destructive/10 text-destructive', icon: XCircle, label: 'Cancelado' },
    };
    const cfg = config[status] || config.pending;
    const Icon = cfg.icon;
    return <Badge variant="outline" className={cfg.class}><Icon className="h-3 w-3 mr-1" />{cfg.label}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    if (status === 'paid') return <Badge className="bg-success text-success-foreground">Pago</Badge>;
    return <Badge variant="outline" className="text-accent">Aguardando</Badge>;
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in_progress' || r.status === 'negotiating').length,
    completed: requests.filter(r => r.status === 'completed').length,
    paidRequests: requests.filter(r => r.payment_status === 'paid'),
    totalRevenue: requests.filter(r => r.payment_status === 'paid').reduce((sum, r) => sum + r.final_price_cents, 0),
  };

  const commissionAmount = partner ? (stats.totalRevenue * partner.commission_percent / 100) : 0;

  // Monthly data for charts
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    
    const monthRequests = requests.filter(r => {
      const createdAt = new Date(r.created_at);
      return createdAt >= start && createdAt <= end;
    });

    const monthRevenue = monthRequests
      .filter(r => r.payment_status === 'paid')
      .reduce((sum, r) => sum + r.final_price_cents, 0);

    const commission = partner ? monthRevenue * partner.commission_percent / 100 : 0;

    return {
      month: format(date, 'MMM', { locale: ptBR }),
      requests: monthRequests.length,
      revenue: monthRevenue / 100,
      commission: commission / 100,
    };
  });

  // Status distribution for pie chart
  const statusData = [
    { name: 'Pendente', value: stats.pending, color: 'hsl(var(--chart-4))' },
    { name: 'Em Andamento', value: stats.inProgress, color: 'hsl(var(--chart-2))' },
    { name: 'Concluído', value: stats.completed, color: 'hsl(var(--primary))' },
  ].filter(d => d.value > 0);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-6 text-center">
          <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Você não está vinculado a uma empresa parceira.</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">Voltar ao Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <AppSidebar 
          collapsed={collapsed} 
          onToggle={() => setCollapsed(!collapsed)} 
          variant="user"
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Building className="h-6 w-6 text-success" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{partner.trade_name || partner.company_name}</h1>
                <p className="text-sm text-white/60">Painel de Parceiro Limpa Nome</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {partner.is_active ? (
                <Badge className="bg-success/10 text-success border-success/20">
                  <CheckCircle className="h-3 w-3 mr-1" />Ativo
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">Inativo</Badge>
              )}
              <Button variant="outline" size="icon" onClick={fetchPartnerData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
              <Card className="bg-slate-900/50 border-white/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.total}</p>
                      <p className="text-xs text-white/60">Solicitações</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Card className="bg-slate-900/50 border-white/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <Clock className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.pending}</p>
                      <p className="text-xs text-white/60">Pendentes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-slate-900/50 border-white/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-info/10">
                      <AlertCircle className="h-5 w-5 text-info" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
                      <p className="text-xs text-white/60">Em Andamento</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="bg-slate-900/50 border-white/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.completed}</p>
                      <p className="text-xs text-white/60">Concluídos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-slate-900/50 border-white/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <DollarSign className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
                      <p className="text-xs text-white/60">Receita Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card className="bg-gradient-to-br from-success/20 to-success/5 border-success/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/20">
                      <Wallet className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-success">{formatCurrency(commissionAmount)}</p>
                      <p className="text-xs text-white/60">Sua Comissão ({partner.commission_percent}%)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue & Commission */}
            <Card className="bg-slate-900/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Evolução Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      name="Receita"
                    />
                    <Area
                      type="monotone"
                      dataKey="commission"
                      stroke="hsl(var(--success))"
                      fillOpacity={1}
                      fill="url(#colorCommission)"
                      name="Comissão"
                    />
                    <Legend />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card className="bg-slate-900/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  Distribuição por Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statusData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-white/40">
                    Nenhuma solicitação encontrada
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Requests List */}
          <Card className="bg-slate-900/50 border-white/5">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-success" />
                    Suas Solicitações
                  </CardTitle>
                  <CardDescription className="text-white/60">{filteredRequests.length} solicitações</CardDescription>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-800 border-white/10 text-white"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px] bg-slate-800 border-white/10 text-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="negotiating">Negociando</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12 text-white/40">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma solicitação encontrada</p>
                  </div>
                ) : (
                  filteredRequests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="p-4 bg-slate-800/50 rounded-xl border border-white/5 hover:border-primary/30 transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                            <User className="h-6 w-6 text-success" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-white">{request.full_name}</h3>
                              {getStatusBadge(request.status)}
                              {getPaymentBadge(request.payment_status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-white/60 flex-wrap">
                              {request.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />{request.email}
                                </span>
                              )}
                              {request.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />{request.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-lg font-bold text-destructive">{formatCurrency(request.debt_amount_cents)}</p>
                              <p className="text-xs text-white/40">Dívida</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-success">{formatCurrency(request.final_price_cents)}</p>
                              <p className="text-xs text-white/40">Serviço</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-primary">
                                {formatCurrency(request.final_price_cents * partner.commission_percent / 100)}
                              </p>
                              <p className="text-xs text-white/40">Comissão</p>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowChatDialog(true);
                            }}
                            className="border-white/10 text-white hover:bg-white/5"
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-sm text-white/40">
                        <span>Criado em {format(new Date(request.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                        {request.completed_at && (
                          <span>Concluído em {format(new Date(request.completed_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Chat Dialog */}
      <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
        <DialogContent className="max-w-4xl h-[80vh] p-0 bg-slate-900 border-white/10">
          <DialogHeader className="p-4 border-b border-white/10">
            <DialogTitle className="text-white">
              Chat - {selectedRequest?.full_name}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && user && (
            <div className="flex-1 overflow-hidden">
              <CreditRepairChat
                requestId={selectedRequest.id}
                otherUserId={selectedRequest.user_id}
                otherUserName={selectedRequest.full_name}
                isAdmin={false}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
