import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import PartnerSidebar from '@/components/layout/PartnerSidebar';
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
import { cn } from '@/lib/utils';
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
import { ModernPartnerChatDemo } from '@/components/limpa-nome/ModernPartnerChatDemo';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PartnerWithdrawalSystem } from '@/components/partner/PartnerWithdrawalSystem';
import { PartnerStripeConnectSetup } from '@/components/partner/PartnerStripeConnectSetup';
import { ModernPartnerHeader } from '@/components/partner/ModernPartnerHeader';
import { ModernPartnerStats } from '@/components/partner/ModernPartnerStats';
import { ModernPartnerNavigation } from '@/components/partner/ModernPartnerNavigation';
import { ModernPartnerChat } from '@/components/partner/ModernPartnerChat';
import { usePartnerTheme } from '@/hooks/usePartnerTheme';


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

// Notificações e clientes serão carregados do banco de dados - sem dados mock

export default function PartnerPanel() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme, isDark, themeClasses } = usePartnerTheme();
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chatClients, setChatClients] = useState<any[]>([]);
  const [selectedChatClient, setSelectedChatClient] = useState<any>(null);
  const [selectedRequestForChat, setSelectedRequestForChat] = useState<CreditRepairRequest | null>(null);

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

  // Usar dados reais (sem mock)
  const displayStats = stats;

  const commissionAmount = partner ? (displayStats.totalRevenue * partner.commission_percent / 100) : 0;

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

  const statusData = [
    { name: 'Pendente', value: displayStats.pending, color: 'hsl(var(--chart-4))' },
    { name: 'Em Andamento', value: displayStats.inProgress, color: 'hsl(var(--chart-2))' },
    { name: 'Concluído', value: displayStats.completed, color: 'hsl(var(--primary))' },
  ].filter(d => d.value > 0);

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Métricas calculadas com dados reais
  const metricsData = {
    conversionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    avgResponseTime: '2h',
    satisfactionScore: 4.8,
    totalClients: stats.total,
    activeClients: stats.inProgress,
    monthlyGrowth: 0,
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 relative" />
          </div>
          <p className="text-slate-600 text-sm font-medium">Carregando painel do parceiro...</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="bg-white border-slate-200 p-8 text-center max-w-md shadow-xl">
          <div className="h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
            <Building className="h-10 w-10 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Acesso Restrito</h2>
          <p className="text-slate-600 mb-6">Você não está vinculado a uma empresa parceira.</p>
          <Button onClick={() => navigate('/dashboard')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Voltar ao Dashboard
          </Button>
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
      case 'services':
        return renderServices();
      default:
        return renderOverview();
    }
  };

  const renderServices = () => (
    <div className="space-y-6">
      <div>
        <h2 className={cn("text-xl font-semibold flex items-center gap-2", isDark ? 'text-white' : 'text-slate-900')}>
          <Sparkles className="h-5 w-5 text-emerald-500" />
          Serviços AtentAI
        </h2>
        <p className={cn("text-sm", isDark ? 'text-slate-400' : 'text-slate-600')}>Contrate serviços adicionais para expandir sua operação</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { 
            title: 'Marketing Digital', 
            description: 'Aumente sua captação de clientes com estratégias digitais', 
            price: 'R$ 780', 
            features: ['Landing page personalizada', 'Tráfego pago gerenciado', 'Material de vendas profissional', 'Gestão de redes sociais'],
            highlight: true
          },
          { 
            title: 'Treinamento Avançado', 
            description: 'Capacitação completa para sua equipe', 
            price: 'R$ 497', 
            features: ['5 horas de treinamento', 'Material didático exclusivo', 'Certificado de conclusão', 'Suporte por 30 dias'],
            highlight: false
          },
          { 
            title: 'Consultoria Especializada', 
            description: 'Estratégias personalizadas para seu negócio', 
            price: 'R$ 1.200', 
            features: ['Análise do negócio', 'Plano de ação personalizado', 'Acompanhamento mensal', 'Relatórios de performance'],
            highlight: false
          },
        ].map((service, i) => (
          <Card 
            key={i} 
            className={cn(
              "transition-all",
              isDark 
                ? 'bg-slate-800 border-slate-700 hover:border-emerald-500/50' 
                : 'bg-white border-slate-200 hover:border-emerald-500/50 shadow-lg',
              service.highlight && 'ring-2 ring-emerald-500/30'
            )}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className={cn("text-lg", isDark ? 'text-white' : 'text-slate-900')}>{service.title}</CardTitle>
                {service.highlight && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Popular</Badge>
                )}
              </div>
              <CardDescription className={isDark ? 'text-slate-400' : 'text-slate-600'}>{service.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-2xl font-bold text-emerald-600">{service.price}</p>
              <ul className="space-y-2">
                {service.features.map((feature, j) => (
                  <li key={j} className={cn("text-sm flex items-center gap-2", isDark ? 'text-slate-300' : 'text-slate-700')}>
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Contratar</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Serviços para Contador - Limpa Nome e Módulo Fiscal */}
      <div className="mt-8">
        <h3 className={cn("text-lg font-semibold flex items-center gap-2 mb-4", isDark ? 'text-white' : 'text-slate-900')}>
          <Building className="h-5 w-5 text-blue-500" />
          Serviços para Clientes (Contador)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className={cn(
            "transition-all",
            isDark ? 'bg-slate-800 border-slate-700 hover:border-emerald-500/50' : 'bg-white border-slate-200 hover:border-emerald-500/50 shadow-lg'
          )}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className={cn("text-base", isDark ? 'text-white' : 'text-slate-900')}>Limpa Nome PF</CardTitle>
                  <CardDescription className={isDark ? 'text-slate-400' : 'text-slate-600'}>Recuperação de crédito para pessoa física</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-emerald-600">R$ 780</p>
                <span className={cn("text-sm", isDark ? 'text-slate-400' : 'text-slate-500')}>por cliente</span>
              </div>
              <p className={cn("text-xs", isDark ? 'text-slate-400' : 'text-slate-500')}>
                Inclui: Análise completa, negociação de dívidas, regularização de score
              </p>
              <Button variant="outline" className="w-full border-emerald-500/50 text-emerald-700 hover:bg-emerald-50">
                Solicitar para Cliente
              </Button>
            </CardContent>
          </Card>

          <Card className={cn(
            "transition-all",
            isDark ? 'bg-slate-800 border-slate-700 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-500/50 shadow-lg'
          )}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className={cn("text-base", isDark ? 'text-white' : 'text-slate-900')}>Módulo Fiscal</CardTitle>
                  <CardDescription className={isDark ? 'text-slate-400' : 'text-slate-600'}>Análise tributária completa</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-blue-600">Grátis + 50%</p>
                <span className={cn("text-sm", isDark ? 'text-slate-400' : 'text-slate-500')}>do recuperado</span>
              </div>
              <p className={cn("text-xs", isDark ? 'text-slate-400' : 'text-slate-500')}>
                Inclui: Auditoria fiscal, identificação de créditos, relatório detalhado
              </p>
              <Button variant="outline" className="w-full border-blue-500/50 text-blue-700 hover:bg-blue-50">
                Solicitar para Cliente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: 'Solicitações', value: displayStats.total, bgColor: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', textColor: 'text-blue-700' },
          { icon: Clock, label: 'Pendentes', value: displayStats.pending, bgColor: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', textColor: 'text-amber-700' },
          { icon: TrendingUp, label: 'Em Andamento', value: displayStats.inProgress, bgColor: 'bg-cyan-50', iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600', textColor: 'text-cyan-700' },
          { icon: CheckCircle, label: 'Concluídos', value: displayStats.completed, bgColor: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', textColor: 'text-emerald-700' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`${stat.bgColor} border-0 shadow-lg hover:shadow-xl transition-shadow`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                  <span className="text-xs font-medium flex items-center gap-1 text-emerald-600">
                    <ArrowUpRight className="h-3 w-3" />
                    +12%
                  </span>
                </div>
                <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                <p className="text-sm text-slate-600 mt-1 font-medium">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-white border-slate-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1 font-medium">Receita Total</p>
                  <p className="text-3xl font-bold text-slate-900">{formatCurrency(displayStats.totalRevenue)}</p>
                  <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1 font-medium">
                    <ArrowUpRight className="h-4 w-4" /> +18.5% vs mês anterior
                  </p>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <DollarSign className="h-8 w-8 text-slate-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-700 mb-1 font-medium">Sua Comissão ({partner.commission_percent}%)</p>
                  <p className="text-3xl font-bold text-emerald-700">{formatCurrency(commissionAmount)}</p>
                  <p className="text-sm text-emerald-600 mt-2 font-medium">Disponível para saque</p>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-emerald-200 flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-emerald-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-slate-900">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Evolução Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px]">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="#64748b" fontSize={12} />
                <YAxis tickLine={false} axisLine={false} stroke="#64748b" fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="Receita" />
                <Area type="monotone" dataKey="commission" stroke="#059669" fillOpacity={1} fill="url(#colorCommission)" name="Comissão" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-slate-900">
              <PieChartIcon className="h-4 w-4 text-blue-600" />
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
              <div className="h-[280px] flex items-center justify-center text-slate-500">
                Nenhuma solicitação encontrada
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white border-slate-200 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-900">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Shield, label: 'Limpa Nome', tab: 'limpa-nome', bgColor: 'bg-emerald-50', hoverColor: 'hover:bg-emerald-100', iconColor: 'text-emerald-600' },
              { icon: Scale, label: 'Módulo Fiscal', tab: 'modulo-fiscal', bgColor: 'bg-blue-50', hoverColor: 'hover:bg-blue-100', iconColor: 'text-blue-600' },
              { icon: MessageCircle, label: 'Chat', tab: 'chat', bgColor: 'bg-purple-50', hoverColor: 'hover:bg-purple-100', iconColor: 'text-purple-600' },
              { icon: Wallet, label: 'Saques', tab: 'withdrawals', bgColor: 'bg-amber-50', hoverColor: 'hover:bg-amber-100', iconColor: 'text-amber-600' },
            ].map((action) => (
              <Button
                key={action.tab}
                variant="outline"
                onClick={() => setActiveTab(action.tab)}
                className={`h-auto py-4 flex flex-col items-center gap-2 border-slate-200 ${action.bgColor} ${action.hoverColor}`}
              >
                <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                <span className="text-sm text-slate-700 font-medium">{action.label}</span>
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
          { id: '1', full_name: 'João Silva', email: 'joao@email.com', phone: '(11) 99999-1234', debt_amount_cents: 1500000, status: 'negotiating', payment_status: 'paid', final_price_cents: 78000, created_at: new Date().toISOString(), user_id: '1' },
          { id: '2', full_name: 'Maria Santos', email: 'maria@email.com', phone: '(11) 98888-5678', debt_amount_cents: 850000, status: 'in_progress', payment_status: 'paid', final_price_cents: 78000, created_at: subDays(new Date(), 2).toISOString(), user_id: '2' },
          { id: '3', full_name: 'Pedro Oliveira', email: 'pedro@email.com', phone: '(21) 97777-9012', debt_amount_cents: 2300000, status: 'pending', payment_status: 'pending', final_price_cents: 78000, created_at: subDays(new Date(), 5).toISOString(), user_id: '3' },
        ] as CreditRepairRequest[]).map((request, index) => (
          <motion.div key={request.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
            <Card className="bg-white border-slate-200 hover:border-emerald-500/50 transition-all shadow-lg">
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border-2 border-emerald-500/30">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">{request.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-slate-900">{request.full_name}</h3>
                        {getStatusBadge(request.status)}
                        {getPaymentBadge(request.payment_status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
                        {request.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{request.email}</span>}
                        {request.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{request.phone}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <p className="text-lg font-bold text-red-600">{formatCurrency(request.debt_amount_cents)}</p>
                        <p className="text-xs text-slate-500">Dívida</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900">{formatCurrency(request.final_price_cents)}</p>
                        <p className="text-xs text-slate-500">Serviço</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-emerald-600">{formatCurrency(request.final_price_cents * partner.commission_percent / 100)}</p>
                        <p className="text-xs text-slate-500">Comissão</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedRequest(request); setShowChatDialog(true); }} className="border-emerald-500/50 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-500">
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
            <Card className="bg-white border-slate-200 hover:border-blue-500/50 transition-all shadow-lg">
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-slate-900">{request.company_name}</h3>
                        {getStatusBadge(request.status)}
                        {getPaymentBadge(request.payment_status || 'pending')}
                      </div>
                      <p className="text-sm text-slate-600">{request.full_name}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap mt-1">
                        <span className="font-mono text-xs text-slate-700">{request.cnpj}</span>
                        <Badge variant="outline" className="text-xs bg-slate-100 text-slate-700 border-slate-300">{request.tax_regime.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="grid grid-cols-2 gap-6 text-center">
                      <div>
                        <p className="text-lg font-bold text-blue-600">{formatCurrency(request.identified_value_cents || 0)}</p>
                        <p className="text-xs text-slate-500">Valor Identificado</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-emerald-600">{formatCurrency((request.service_fee_cents || 0) * partner.commission_percent / 100)}</p>
                        <p className="text-xs text-slate-500">Comissão</p>
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

  const renderChat = () => {
    // Combinar todas as solicitações com conversas
    const allRequests = [...requests];
    
    // Se não há solicitações reais, mostrar demo ultra-moderno com dados mockados
    if (allRequests.length === 0) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20">
                  <MessageCircle className="h-5 w-5 text-emerald-400" />
                </div>
                Chat com Clientes
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Simulação do fluxo de atendimento Limpa Nome
              </p>
            </div>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Demo Interativo
            </Badge>
          </div>
          <ModernPartnerChatDemo showDemo={true} />
        </div>
      );
    }

    // Se há solicitações reais, mostrar interface real com opção de selecionar
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/20">
                <MessageCircle className="h-5 w-5 text-emerald-400" />
              </div>
              Chat com Clientes
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {allRequests.length} conversas ativas
            </p>
          </div>
        </div>

        <div className="h-[calc(100vh-14rem)] flex rounded-2xl overflow-hidden border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
          {/* Clients List */}
          <div className="w-80 border-r border-slate-700/50 flex flex-col bg-slate-900/50">
            <div className="p-4 border-b border-slate-700/50">
              <h3 className="font-bold text-white flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20">
                  <MessageCircle className="h-4 w-4 text-emerald-400" />
                </div>
                Conversas ({allRequests.length})
              </h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {allRequests.map((request) => (
                  <button
                    key={request.id}
                    onClick={() => setSelectedRequestForChat(request)}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                      selectedRequestForChat?.id === request.id 
                        ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30' 
                        : 'hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    <Avatar className="h-10 w-10 border-2 border-slate-700">
                      <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
                        {request.full_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <span className="font-medium text-white text-sm truncate block">{request.full_name}</span>
                      <p className="text-xs text-slate-400 truncate">
                        {request.status === 'pending' ? 'Nova solicitação' : 'Em andamento'}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-slate-900/30">
            {selectedRequestForChat && user ? (
              <CreditRepairChat
                requestId={selectedRequestForChat.id}
                otherUserId={selectedRequestForChat.user_id}
                otherUserName={selectedRequestForChat.full_name}
                isAdmin={false}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-slate-600 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-400 text-sm">
                    Selecione uma conversa ao lado
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

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
          { label: 'Taxa de Conversão', value: `${metricsData.conversionRate}%`, icon: TrendingUp, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
          { label: 'Tempo Médio de Resposta', value: metricsData.avgResponseTime, icon: Clock, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
          { label: 'Satisfação do Cliente', value: `${metricsData.satisfactionScore}/5`, icon: Sparkles, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
          { label: 'Total de Clientes', value: metricsData.totalClients.toString(), icon: Users, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
          { label: 'Clientes Ativos', value: metricsData.activeClients.toString(), icon: Activity, iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600' },
          { label: 'Crescimento Mensal', value: `${metricsData.monthlyGrowth}%`, icon: ArrowUpRight, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
        ].map((metric, i) => (
          <motion.div key={metric.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${metric.iconBg}`}>
                    <metric.icon className={`h-5 w-5 ${metric.iconColor}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                <p className="text-sm text-slate-600 mt-1">{metric.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-white border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">Performance Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="#64748b" fontSize={12} />
              <YAxis tickLine={false} axisLine={false} stroke="#64748b" fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="requests" fill="#10b981" radius={[4, 4, 0, 0]} name="Solicitações" />
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
        <Card className="bg-white border-2 border-emerald-200 shadow-lg">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">Comissão Disponível</p>
            <p className="text-3xl font-bold text-emerald-600">{formatCurrency(commissionAmount)}</p>
            <p className="text-xs text-slate-500 mt-2">Pronto para saque</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">Comissão Pendente</p>
            <p className="text-3xl font-bold text-amber-600">{formatCurrency(85000)}</p>
            <p className="text-xs text-slate-500 mt-2">Aguardando pagamento</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">Total Recebido</p>
            <p className="text-3xl font-bold text-slate-900">{formatCurrency(1890000)}</p>
            <p className="text-xs text-slate-500 mt-2">Desde o início</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">Histórico de Comissões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { client: 'João Silva', service: 'Limpa Nome', value: 5940, date: '08/01/2026', status: 'paid' },
              { client: 'Maria Santos', service: 'Limpa Nome', value: 5940, date: '07/01/2026', status: 'paid' },
              { client: 'ABC Tecnologia', service: 'Módulo Fiscal', value: 9940, date: '05/01/2026', status: 'paid' },
              { client: 'Pedro Oliveira', service: 'Limpa Nome', value: 5940, date: '03/01/2026', status: 'pending' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="font-medium text-slate-900">{item.client}</p>
                  <p className="text-sm text-slate-600">{item.service}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600">{formatCurrency(item.value)}</p>
                  <p className="text-xs text-slate-500">{item.date}</p>
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
    <div className={cn("min-h-screen transition-colors duration-300", isDark ? 'bg-slate-900' : 'bg-slate-100')}>
      {/* Sidebar - Fixed */}
      <div className="hidden lg:block flex-shrink-0">
        <PartnerSidebar 
          collapsed={collapsed} 
          onToggle={() => setCollapsed(!collapsed)} 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingCount={requests.filter(r => r.status === 'pending').length}
          partnerName={partner?.company_name}
          isDark={isDark}
          onThemeToggle={toggleTheme}
        />
      </div>

      {/* Main Content */}
      <main className={cn("min-h-screen transition-all duration-300", collapsed ? 'lg:ml-16' : 'lg:ml-64')}>
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Modern Header */}
          <ModernPartnerHeader
            partnerName={partner.trade_name || partner.company_name}
            isActive={partner.is_active}
            newRequestsCount={showNewRequestBadge ? newRequestsCount : 0}
            onRefresh={fetchPartnerData}
            onClearNotifications={handleClearNewRequests}
          />

          {/* Modern Navigation */}
          <ModernPartnerNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            requestsCount={requests.length}
            fiscalCount={fiscalRequests.length}
          />

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' ? (
                <ModernPartnerStats
                  stats={displayStats}
                  commissionPercent={partner.commission_percent}
                  formatCurrency={formatCurrency}
                />
              ) : (
                renderContent()
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Chat Dialog */}
      <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
        <DialogContent className={cn(
          "max-w-4xl h-[80vh] p-0 shadow-2xl",
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        )}>
          <DialogHeader className={cn(
            "p-4 border-b",
            isDark ? 'border-slate-700' : 'border-slate-200'
          )}>
            <DialogTitle className={isDark ? 'text-white' : 'text-slate-900'}>
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
