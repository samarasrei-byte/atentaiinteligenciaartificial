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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Building, DollarSign, Users, Clock, CheckCircle, XCircle, AlertCircle,
  TrendingUp, Loader2, Search, RefreshCw, Phone, Mail, User, FileText,
  Percent, BarChart3, PieChart as PieChartIcon, Wallet, MessageCircle,
  CreditCard, Bell, BellRing, ArrowUpRight, ArrowDownRight, Send,
  Scale, Activity, Settings, Sparkles, Shield, Eye, Calendar, ChevronRight
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreditRepairChat } from '@/components/limpa-nome/CreditRepairChat';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PartnerWithdrawalSystem } from '@/components/partner/PartnerWithdrawalSystem';
import { PartnerStripeConnectSetup } from '@/components/partner/PartnerStripeConnectSetup';

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

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  time: string;
  read: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  time: string;
  isOwn: boolean;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

const chartConfig = {
  requests: { label: "Solicitações", color: "hsl(var(--primary))" },
  revenue: { label: "Receita", color: "hsl(var(--chart-2))" },
  commission: { label: "Comissão", color: "hsl(var(--success))" },
};

// Dados fictícios para demonstração
const mockNotifications: Notification[] = [
  { id: '1', title: 'Nova solicitação Limpa Nome', message: 'João Silva solicitou o serviço', type: 'success', time: '2 min', read: false },
  { id: '2', title: 'Pagamento confirmado', message: 'Maria Santos - R$ 297,00', type: 'success', time: '15 min', read: false },
  { id: '3', title: 'Análise fiscal concluída', message: 'Empresa ABC Ltda finalizada', type: 'info', time: '1h', read: true },
  { id: '4', title: 'Nova mensagem do cliente', message: 'Pedro Oliveira enviou uma mensagem', type: 'info', time: '2h', read: true },
  { id: '5', title: 'Comissão disponível', message: 'R$ 1.250,00 disponível para saque', type: 'warning', time: '3h', read: true },
];

const mockChatClients = [
  { id: '1', name: 'João Silva', lastMessage: 'Obrigado pela ajuda!', time: '10:30', unread: 2, avatar: null, status: 'online' },
  { id: '2', name: 'Maria Santos', lastMessage: 'Quando ficará pronto?', time: '09:15', unread: 0, avatar: null, status: 'offline' },
  { id: '3', name: 'Pedro Oliveira', lastMessage: 'Enviei os documentos', time: 'Ontem', unread: 1, avatar: null, status: 'online' },
  { id: '4', name: 'Ana Costa', lastMessage: 'Perfeito, muito obrigada!', time: 'Ontem', unread: 0, avatar: null, status: 'offline' },
];

const mockMessages: ChatMessage[] = [
  { id: '1', sender: 'João Silva', content: 'Olá, gostaria de saber o status do meu processo', time: '10:15', isOwn: false },
  { id: '2', sender: 'Você', content: 'Olá João! Seu processo está em andamento, estamos negociando com os credores.', time: '10:20', isOwn: true },
  { id: '3', sender: 'João Silva', content: 'Que ótimo! Quanto tempo mais vai demorar?', time: '10:25', isOwn: false },
  { id: '4', sender: 'Você', content: 'Estimamos mais 5 dias úteis para conclusão. Manteremos você informado.', time: '10:28', isOwn: true },
  { id: '5', sender: 'João Silva', content: 'Obrigado pela ajuda!', time: '10:30', isOwn: false },
];

const mockMetricsData = {
  conversionRate: 78,
  avgResponseTime: '2h 15min',
  satisfactionScore: 4.8,
  totalClients: 156,
  activeClients: 23,
  monthlyGrowth: 15.4,
};

const mockMonthlyPerformance = [
  { month: 'Jul', requests: 12, revenue: 3500, commission: 700 },
  { month: 'Ago', requests: 18, revenue: 5200, commission: 1040 },
  { month: 'Set', requests: 22, revenue: 6800, commission: 1360 },
  { month: 'Out', requests: 28, revenue: 8400, commission: 1680 },
  { month: 'Nov', requests: 35, revenue: 10500, commission: 2100 },
  { month: 'Dez', requests: 42, revenue: 12600, commission: 2520 },
];

export default function PartnerPanel() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [serviceTab, setServiceTab] = useState<'limpa-nome' | 'fiscal'>('limpa-nome');
  const [isLoading, setIsLoading] = useState(true);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [requests, setRequests] = useState<CreditRepairRequest[]>([]);
  const [fiscalRequests, setFiscalRequests] = useState<FiscalRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<CreditRepairRequest | null>(null);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [selectedChatClient, setSelectedChatClient] = useState(mockChatClients[0]);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);

  // Realtime notifications for new requests
  const [newRequestsCount, setNewRequestsCount] = useState(2);
  const [showNewRequestBadge, setShowNewRequestBadge] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetchPartnerData();
    }
  }, [user, authLoading]);

  // Setup realtime subscription for new requests (Limpa Nome + Fiscal)
  useEffect(() => {
    if (!partner?.id) return;

    const channel = supabase
      .channel(`partner-requests-${partner.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'credit_repair_requests',
          filter: `partner_id=eq.${partner.id}`
        },
        (payload) => {
          setNewRequestsCount(prev => prev + 1);
          setShowNewRequestBadge(true);
          toast({
            title: '🎉 Nova solicitação Limpa Nome!',
            description: `${(payload.new as any).full_name} solicitou o serviço Limpa Nome`,
          });
          fetchPartnerData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'credit_repair_requests',
          filter: `partner_id=eq.${partner.id}`
        },
        () => {
          fetchPartnerData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fiscal_analysis_requests',
          filter: `partner_id=eq.${partner.id}`
        },
        (payload) => {
          setNewRequestsCount(prev => prev + 1);
          setShowNewRequestBadge(true);
          toast({
            title: '📊 Nova análise fiscal!',
            description: `${(payload.new as any).company_name} - ${(payload.new as any).full_name}`,
          });
          fetchPartnerData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'fiscal_analysis_requests',
          filter: `partner_id=eq.${partner.id}`
        },
        () => {
          fetchPartnerData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partner?.id]);

  const fetchPartnerData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
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

      const { data: requestsData, error: requestsError } = await supabase
        .from('credit_repair_requests')
        .select('*')
        .eq('partner_id', partnerUser.partner_id)
        .order('created_at', { ascending: false });

      if (!requestsError) {
        setRequests(requestsData || []);
      }

      const { data: fiscalData, error: fiscalError } = await supabase
        .from('fiscal_analysis_requests')
        .select('*')
        .eq('partner_id', partnerUser.partner_id)
        .order('created_at', { ascending: false });

      if (!fiscalError) {
        setFiscalRequests(fiscalData || []);
      }
    } catch (error) {
      console.error('Error fetching partner data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearNewRequests = () => {
    setNewRequestsCount(0);
    setShowNewRequestBadge(false);
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

  const getPaymentBadge = (status: string) => {
    if (status === 'paid') return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Pago</Badge>;
    return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">Aguardando</Badge>;
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredFiscalRequests = fiscalRequests.filter(r => {
    const matchesSearch = r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const fiscalRevenue = fiscalRequests
    .filter(r => r.payment_status === 'paid')
    .reduce((sum, r) => sum + (r.service_fee_cents || 0), 0);

  const stats = {
    total: requests.length + fiscalRequests.length,
    pending: requests.filter(r => r.status === 'pending').length + fiscalRequests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in_progress' || r.status === 'negotiating').length + fiscalRequests.filter(r => r.status === 'in_progress' || r.status === 'analyzing').length,
    completed: requests.filter(r => r.status === 'completed').length + fiscalRequests.filter(r => r.status === 'completed').length,
    paidRequests: requests.filter(r => r.payment_status === 'paid'),
    totalRevenue: requests.filter(r => r.payment_status === 'paid').reduce((sum, r) => sum + r.final_price_cents, 0) + fiscalRevenue,
    limpaNomeCount: requests.length,
    fiscalCount: fiscalRequests.length,
  };

  // Use mock data for demonstration when no real data
  const displayStats = stats.total === 0 ? {
    total: 42,
    pending: 8,
    inProgress: 12,
    completed: 22,
    totalRevenue: 1260000, // R$ 12.600
    limpaNomeCount: 28,
    fiscalCount: 14,
  } : stats;

  const commissionAmount = partner ? (displayStats.totalRevenue * partner.commission_percent / 100) : 252000;

  const monthlyData = displayStats.total === 0 ? mockMonthlyPerformance : Array.from({ length: 6 }, (_, i) => {
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

  const statusData = [
    { name: 'Pendente', value: displayStats.pending, color: 'hsl(var(--chart-4))' },
    { name: 'Em Andamento', value: displayStats.inProgress, color: 'hsl(var(--chart-2))' },
    { name: 'Concluído', value: displayStats.completed, color: 'hsl(var(--primary))' },
  ].filter(d => d.value > 0);

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const sendMessage = () => {
    if (!chatMessage.trim()) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'Você',
      content: chatMessage,
      time: format(new Date(), 'HH:mm'),
      isOwn: true,
    };
    setMessages(prev => [...prev, newMessage]);
    setChatMessage('');
  };

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

  if (!partner) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8 text-center max-w-md">
          <Building className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">Você não está vinculado a uma empresa parceira.</p>
          <Button onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</Button>
        </Card>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'limpa-nome':
        return renderLimpaNome();
      case 'modulo-fiscal':
        return renderModuloFiscal();
      case 'notifications':
        return renderNotifications();
      case 'chat':
        return renderChat();
      case 'metrics':
        return renderMetrics();
      case 'commissions':
        return renderCommissions();
      case 'withdrawals':
        return renderWithdrawals();
      case 'profile':
        return renderProfile();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: 'Solicitações', value: displayStats.total, color: 'primary', change: '+12%' },
          { icon: Clock, label: 'Pendentes', value: displayStats.pending, color: 'amber', change: '-5%' },
          { icon: TrendingUp, label: 'Em Andamento', value: displayStats.inProgress, color: 'blue', change: '+8%' },
          { icon: CheckCircle, label: 'Concluídos', value: displayStats.completed, color: 'emerald', change: '+23%' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-${stat.color}-500/10`}>
                    <stat.icon className={`h-5 w-5 text-${stat.color}-400`} />
                  </div>
                  <span className={`text-xs font-medium flex items-center gap-1 ${stat.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stat.change.startsWith('+') ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.change}
                  </span>
                </div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Receita Total</p>
                  <p className="text-3xl font-bold text-foreground">{formatCurrency(displayStats.totalRevenue)}</p>
                  <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" /> +18.5% vs mês anterior
                  </p>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="bg-gradient-to-br from-emerald-500/10 via-card to-card border-emerald-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Sua Comissão ({partner.commission_percent}%)</p>
                  <p className="text-3xl font-bold text-emerald-400">{formatCurrency(commissionAmount)}</p>
                  <p className="text-xs text-muted-foreground mt-2">Disponível para saque</p>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Evolução Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px]">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142.1 76.2% 36.3%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(142.1 76.2% 36.3%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" name="Receita" />
                <Area type="monotone" dataKey="commission" stroke="hsl(142.1 76.2% 36.3%)" fillOpacity={1} fill="url(#colorCommission)" name="Comissão" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-primary" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <div className="h-[280px]">
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
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                Nenhuma solicitação encontrada
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Shield, label: 'Limpa Nome', tab: 'limpa-nome', color: 'emerald' },
              { icon: Scale, label: 'Módulo Fiscal', tab: 'modulo-fiscal', color: 'blue' },
              { icon: MessageCircle, label: 'Chat', tab: 'chat', color: 'purple' },
              { icon: Wallet, label: 'Saques', tab: 'withdrawals', color: 'amber' },
            ].map((action) => (
              <Button
                key={action.tab}
                variant="outline"
                onClick={() => setActiveTab(action.tab)}
                className={`h-auto py-4 flex flex-col items-center gap-2 border-border/50 hover:border-${action.color}-500/50 hover:bg-${action.color}-500/5`}
              >
                <action.icon className={`h-6 w-6 text-${action.color}-400`} />
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLimpaNome = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            Limpa Nome
          </h2>
          <p className="text-sm text-muted-foreground">{filteredRequests.length || 28} solicitações</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64 bg-background/50" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-background/50">
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

      <div className="space-y-3">
        {(filteredRequests.length > 0 ? filteredRequests : [
          { id: '1', full_name: 'João Silva', email: 'joao@email.com', phone: '(11) 99999-1234', debt_amount_cents: 1500000, status: 'negotiating', payment_status: 'paid', final_price_cents: 29700, created_at: new Date().toISOString(), user_id: '1' },
          { id: '2', full_name: 'Maria Santos', email: 'maria@email.com', phone: '(11) 98888-5678', debt_amount_cents: 850000, status: 'in_progress', payment_status: 'paid', final_price_cents: 29700, created_at: subDays(new Date(), 2).toISOString(), user_id: '2' },
          { id: '3', full_name: 'Pedro Oliveira', email: 'pedro@email.com', phone: '(21) 97777-9012', debt_amount_cents: 2300000, status: 'pending', payment_status: 'pending', final_price_cents: 29700, created_at: subDays(new Date(), 5).toISOString(), user_id: '3' },
        ] as CreditRepairRequest[]).map((request, index) => (
          <motion.div key={request.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
            <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-emerald-500/30 transition-all">
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border-2 border-emerald-500/20">
                      <AvatarFallback className="bg-emerald-500/10 text-emerald-400">{request.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-foreground">{request.full_name}</h3>
                        {getStatusBadge(request.status)}
                        {getPaymentBadge(request.payment_status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        {request.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{request.email}</span>}
                        {request.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{request.phone}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <p className="text-lg font-bold text-red-400">{formatCurrency(request.debt_amount_cents)}</p>
                        <p className="text-xs text-muted-foreground">Dívida</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground">{formatCurrency(request.final_price_cents)}</p>
                        <p className="text-xs text-muted-foreground">Serviço</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-emerald-400">{formatCurrency(request.final_price_cents * partner.commission_percent / 100)}</p>
                        <p className="text-xs text-muted-foreground">Comissão</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedRequest(request); setShowChatDialog(true); }} className="border-border/50 hover:border-primary/50">
                      <MessageCircle className="h-4 w-4 mr-1" /> Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderModuloFiscal = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Scale className="h-5 w-5 text-blue-400" />
            Módulo Fiscal
          </h2>
          <p className="text-sm text-muted-foreground">{filteredFiscalRequests.length || 14} análises</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar empresa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64 bg-background/50" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {(filteredFiscalRequests.length > 0 ? filteredFiscalRequests : [
          { id: '1', company_name: 'ABC Tecnologia Ltda', full_name: 'Carlos Mendes', email: 'carlos@abc.com', cnpj: '12.345.678/0001-90', tax_regime: 'simples_nacional', status: 'analyzing', payment_status: 'paid', service_fee_cents: 49700, identified_value_cents: 1250000, created_at: new Date().toISOString() },
          { id: '2', company_name: 'XYZ Comércio ME', full_name: 'Ana Paula', email: 'ana@xyz.com', cnpj: '98.765.432/0001-10', tax_regime: 'lucro_presumido', status: 'completed', payment_status: 'paid', service_fee_cents: 49700, identified_value_cents: 2180000, created_at: subDays(new Date(), 3).toISOString() },
          { id: '3', company_name: 'Tech Solutions Ltda', full_name: 'Roberto Lima', email: 'roberto@tech.com', cnpj: '11.222.333/0001-44', tax_regime: 'simples_nacional', status: 'pending', payment_status: 'pending', service_fee_cents: 49700, identified_value_cents: 0, created_at: subDays(new Date(), 1).toISOString() },
        ] as FiscalRequest[]).map((request, index) => (
          <motion.div key={request.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
            <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-blue-500/30 transition-all">
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Building className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-foreground">{request.company_name}</h3>
                        {getStatusBadge(request.status)}
                        {getPaymentBadge(request.payment_status || 'pending')}
                      </div>
                      <p className="text-sm text-muted-foreground">{request.full_name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap mt-1">
                        <span className="font-mono text-xs">{request.cnpj}</span>
                        <Badge variant="outline" className="text-xs">{request.tax_regime.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="grid grid-cols-2 gap-6 text-center">
                      <div>
                        <p className="text-lg font-bold text-blue-400">{formatCurrency(request.identified_value_cents || 0)}</p>
                        <p className="text-xs text-muted-foreground">Valor Identificado</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-emerald-400">{formatCurrency((request.service_fee_cents || 0) * partner.commission_percent / 100)}</p>
                        <p className="text-xs text-muted-foreground">Comissão</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-400" />
            Notificações
          </h2>
          <p className="text-sm text-muted-foreground">{notifications.filter(n => !n.read).length} não lidas</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}>
          Marcar todas como lidas
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((notification, index) => (
          <motion.div key={notification.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}>
            <Card 
              className={`bg-card/50 backdrop-blur border-border/50 cursor-pointer transition-all hover:border-primary/30 ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}
              onClick={() => markNotificationAsRead(notification.id)}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  notification.type === 'success' ? 'bg-emerald-500/10' : 
                  notification.type === 'warning' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                }`}>
                  {notification.type === 'success' ? <CheckCircle className="h-5 w-5 text-emerald-400" /> :
                   notification.type === 'warning' ? <AlertCircle className="h-5 w-5 text-amber-400" /> :
                   <Bell className="h-5 w-5 text-blue-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-foreground">{notification.title}</h3>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
                {!notification.read && <div className="h-2 w-2 rounded-full bg-primary" />}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="h-[calc(100vh-12rem)]">
      <Card className="bg-card/50 backdrop-blur border-border/50 h-full">
        <div className="flex h-full">
          {/* Clients List */}
          <div className="w-80 border-r border-border/50">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold text-foreground mb-3">Conversas</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar conversa..." className="pl-10 bg-background/50" />
              </div>
            </div>
            <ScrollArea className="h-[calc(100%-5rem)]">
              <div className="p-2 space-y-1">
                {mockChatClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => setSelectedChatClient(client)}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors ${
                      selectedChatClient?.id === client.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">{client.name[0]}</AvatarFallback>
                      </Avatar>
                      {client.status === 'online' && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground text-sm truncate">{client.name}</span>
                        <span className="text-xs text-muted-foreground">{client.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{client.lastMessage}</p>
                    </div>
                    {client.unread > 0 && (
                      <Badge className="bg-primary text-primary-foreground text-xs">{client.unread}</Badge>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-border/50 flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">{selectedChatClient?.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-foreground">{selectedChatClient?.name}</h3>
                <p className="text-xs text-emerald-400">{selectedChatClient?.status === 'online' ? 'Online' : 'Offline'}</p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      msg.isOwn 
                        ? 'bg-primary text-primary-foreground rounded-br-sm' 
                        : 'bg-muted text-foreground rounded-bl-sm'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border/50">
              <div className="flex items-center gap-3">
                <Input 
                  placeholder="Digite sua mensagem..." 
                  value={chatMessage} 
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  className="bg-background/50"
                />
                <Button onClick={sendMessage} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderMetrics = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Métricas de Performance
        </h2>
        <p className="text-sm text-muted-foreground">Acompanhe seu desempenho</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Taxa de Conversão', value: `${mockMetricsData.conversionRate}%`, icon: TrendingUp, color: 'emerald', change: '+5%' },
          { label: 'Tempo Médio de Resposta', value: mockMetricsData.avgResponseTime, icon: Clock, color: 'blue', change: '-12%' },
          { label: 'Satisfação do Cliente', value: `${mockMetricsData.satisfactionScore}/5`, icon: Sparkles, color: 'amber', change: '+0.2' },
          { label: 'Total de Clientes', value: mockMetricsData.totalClients.toString(), icon: Users, color: 'purple', change: '+18' },
          { label: 'Clientes Ativos', value: mockMetricsData.activeClients.toString(), icon: Activity, color: 'cyan', change: '+3' },
          { label: 'Crescimento Mensal', value: `${mockMetricsData.monthlyGrowth}%`, icon: ArrowUpRight, color: 'emerald', change: '' },
        ].map((metric, i) => (
          <motion.div key={metric.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-${metric.color}-500/10`}>
                    <metric.icon className={`h-5 w-5 text-${metric.color}-400`} />
                  </div>
                  {metric.change && (
                    <span className={`text-xs font-medium ${metric.change.startsWith('+') || metric.change.startsWith('-') ? (metric.change.startsWith('+') ? 'text-emerald-400' : 'text-blue-400') : 'text-muted-foreground'}`}>
                      {metric.change}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Performance Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={mockMonthlyPerformance}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="requests" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Solicitações" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderCommissions = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-400" />
          Comissões
        </h2>
        <p className="text-sm text-muted-foreground">Acompanhe seus ganhos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 via-card to-card border-emerald-500/20">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Comissão Disponível</p>
            <p className="text-3xl font-bold text-emerald-400">{formatCurrency(commissionAmount)}</p>
            <p className="text-xs text-muted-foreground mt-2">Pronto para saque</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Comissão Pendente</p>
            <p className="text-3xl font-bold text-amber-400">{formatCurrency(85000)}</p>
            <p className="text-xs text-muted-foreground mt-2">Aguardando pagamento</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Recebido</p>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(1890000)}</p>
            <p className="text-xs text-muted-foreground mt-2">Desde o início</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Histórico de Comissões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { client: 'João Silva', service: 'Limpa Nome', value: 5940, date: '08/01/2026', status: 'paid' },
              { client: 'Maria Santos', service: 'Limpa Nome', value: 5940, date: '07/01/2026', status: 'paid' },
              { client: 'ABC Tecnologia', service: 'Módulo Fiscal', value: 9940, date: '05/01/2026', status: 'paid' },
              { client: 'Pedro Oliveira', service: 'Limpa Nome', value: 5940, date: '03/01/2026', status: 'pending' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div>
                  <p className="font-medium text-foreground">{item.client}</p>
                  <p className="text-sm text-muted-foreground">{item.service}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-400">{formatCurrency(item.value)}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderWithdrawals = () => (
    <div className="space-y-6">
      <PartnerStripeConnectSetup />
      <PartnerWithdrawalSystem partnerId={partner.id} availableBalance={commissionAmount} onWithdrawalCreated={fetchPartnerData} />
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Meu Perfil
        </h2>
        <p className="text-sm text-muted-foreground">Gerencie suas informações</p>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-4 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">{partner.company_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold text-foreground">{partner.trade_name || partner.company_name}</h3>
              <p className="text-muted-foreground">{partner.email}</p>
              <Badge className="mt-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Parceiro Ativo</Badge>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome da Empresa</Label>
              <Input value={partner.company_name} readOnly className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label>Nome Fantasia</Label>
              <Input value={partner.trade_name || '-'} readOnly className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={partner.email} readOnly className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={partner.phone || '-'} readOnly className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label>Comissão</Label>
              <Input value={`${partner.commission_percent}%`} readOnly className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Input value={partner.is_active ? 'Ativo' : 'Inativo'} readOnly className="bg-muted/50" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Configurações
        </h2>
        <p className="text-sm text-muted-foreground">Personalize sua experiência</p>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Notificações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Novas solicitações', description: 'Receba alertas quando novos clientes solicitarem serviços', enabled: true },
            { label: 'Pagamentos confirmados', description: 'Notificações quando pagamentos forem confirmados', enabled: true },
            { label: 'Mensagens de clientes', description: 'Alertas para novas mensagens no chat', enabled: true },
            { label: 'Resumo semanal', description: 'Receba um resumo semanal por e-mail', enabled: false },
          ].map((setting, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
              <div>
                <p className="font-medium text-foreground">{setting.label}</p>
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              </div>
              <Button variant={setting.enabled ? 'default' : 'outline'} size="sm">
                {setting.enabled ? 'Ativado' : 'Desativado'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="dashboard-layout overflow-hidden">
      {/* Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <AppSidebar 
          collapsed={collapsed} 
          onToggle={() => setCollapsed(!collapsed)} 
          variant="partner"
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Main Content */}
      <main className={`dashboard-main transition-all duration-300 overflow-x-hidden ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className="dashboard-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{partner.trade_name || partner.company_name}</h1>
                <p className="text-xs text-muted-foreground">Painel do Parceiro</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {showNewRequestBadge && newRequestsCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClearNewRequests}
                  className="relative border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
                >
                  <BellRing className="h-4 w-4 mr-2" />
                  {newRequestsCount} nova{newRequestsCount > 1 ? 's' : ''}
                </Button>
              )}
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <CheckCircle className="h-3 w-3 mr-1" />Ativo
              </Badge>
              <Button variant="ghost" size="icon" onClick={fetchPartnerData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Chat Dialog */}
      <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
        <DialogContent className="max-w-4xl h-[80vh] p-0 bg-background border-border">
          <DialogHeader className="p-4 border-b border-border">
            <DialogTitle>Chat - {selectedRequest?.full_name}</DialogTitle>
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
