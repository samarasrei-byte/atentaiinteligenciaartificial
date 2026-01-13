import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import {
  Users, TrendingUp, Wallet, Link as LinkIcon, Copy, Check,
  Calendar, Phone, Mail, Building, ChevronRight, RefreshCw,
  Shield, Brain, FileSearch, Calculator, AlertTriangle,
  Loader2, LogOut, User, Settings, Bell, MessageSquare, DollarSign,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, XCircle, Eye,
  Home, BarChart3, FileText, CreditCard, Sparkles, Target, 
  Menu, X, Play, ChevronDown, Banknote, Crown, Zap, Gift,
  PieChart as PieChartIcon, Activity
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces
interface Affiliate {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string | null;
  state: string | null;
  company_name: string | null;
  affiliate_code: string;
  whatsapp_number: string | null;
  pix_key: string | null;
  pix_key_type: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company_name: string | null;
  status: string;
  potential_value_cents: number | null;
  created_at: string;
  service_id: string | null;
}

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  benefits: string[] | null;
  commission_percent: number;
  icon: string | null;
  is_active: boolean;
}

interface Commission {
  id: string;
  total_value_cents: number;
  affiliate_value_cents: number;
  platform_fee_cents: number;
  status: string;
  created_at: string;
}

interface Withdrawal {
  id: string;
  amount_cents: number;
  platform_fee_cents: number;
  net_amount_cents: number;
  status: string;
  created_at: string;
}

type PanelSection = 'overview' | 'leads' | 'services' | 'financial' | 'withdrawals' | 'profile';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

const chartConfig = {
  leads: { label: "Leads", color: "hsl(var(--primary))" },
  conversions: { label: "Conversões", color: "hsl(var(--chart-2))" },
  commissions: { label: "Comissões", color: "hsl(var(--success))" },
};

// Navigation items
const NAV_ITEMS = [
  { id: 'overview', label: 'Visão Geral', icon: Home },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'services', label: 'Serviços', icon: Sparkles },
  { id: 'financial', label: 'Financeiro', icon: Wallet },
  { id: 'withdrawals', label: 'Saques', icon: Banknote },
  { id: 'profile', label: 'Perfil', icon: User },
];

export default function AffiliatePanel() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activatedServices, setActivatedServices] = useState<string[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<PanelSection>(searchParams.get('tab') as PanelSection || 'overview');
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
      setupRealtimeSubscription();
    }
  }, [user, authLoading]);

  const setupRealtimeSubscription = () => {
    if (!affiliate?.id) return;

    const channel = supabase
      .channel(`affiliate-${affiliate.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'affiliate_leads',
        filter: `affiliate_id=eq.${affiliate.id}`
      }, (payload) => {
        toast.success('🎉 Novo lead capturado!', {
          description: (payload.new as any).full_name
        });
        fetchData();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'affiliate_commissions',
        filter: `affiliate_id=eq.${affiliate.id}`
      }, () => {
        toast.success('💰 Nova comissão recebida!');
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  useEffect(() => {
    if (affiliate?.id) {
      setupRealtimeSubscription();
    }
  }, [affiliate?.id]);

  const fetchData = async () => {
    try {
      const { data: affiliateData, error: affiliateError } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (affiliateError) throw affiliateError;
      setAffiliate(affiliateData);

      const { data: leadsData } = await supabase
        .from('affiliate_leads')
        .select('*')
        .eq('affiliate_id', affiliateData.id)
        .order('created_at', { ascending: false });
      setLeads(leadsData || []);

      const { data: servicesData } = await supabase
        .from('affiliate_services')
        .select('*')
        .eq('is_active', true);
      setServices(servicesData || []);

      const { data: activationsData } = await supabase
        .from('affiliate_service_activations')
        .select('service_id')
        .eq('affiliate_id', affiliateData.id)
        .eq('is_enabled', true);
      setActivatedServices(activationsData?.map(a => a.service_id) || []);

      const { data: commissionsData } = await supabase
        .from('affiliate_commissions')
        .select('*')
        .eq('affiliate_id', affiliateData.id)
        .order('created_at', { ascending: false });
      setCommissions(commissionsData || []);

      const { data: withdrawalsData } = await supabase
        .from('affiliate_withdrawals')
        .select('*')
        .eq('affiliate_id', affiliateData.id)
        .order('created_at', { ascending: false });
      setWithdrawals(withdrawalsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (section: PanelSection) => {
    setActiveSection(section);
    setSearchParams({ tab: section });
    setSidebarOpen(false);
  };

  const copyLink = async () => {
    if (!affiliate) return;
    const link = `${window.location.origin}/p/${affiliate.affiliate_code}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleService = async (serviceId: string, enabled: boolean) => {
    if (!affiliate) return;

    try {
      if (enabled) {
        await supabase.from('affiliate_service_activations').insert({
          affiliate_id: affiliate.id,
          service_id: serviceId,
          is_enabled: true
        });
        setActivatedServices([...activatedServices, serviceId]);
      } else {
        await supabase.from('affiliate_service_activations')
          .delete()
          .eq('affiliate_id', affiliate.id)
          .eq('service_id', serviceId);
        setActivatedServices(activatedServices.filter(id => id !== serviceId));
      }
      toast.success(enabled ? 'Serviço ativado!' : 'Serviço desativado');
    } catch (error) {
      toast.error('Erro ao atualizar serviço');
    }
  };

  const requestWithdrawal = async () => {
    if (!affiliate || !withdrawalAmount) return;
    
    const amountCents = Math.round(parseFloat(withdrawalAmount.replace(',', '.')) * 100);
    
    if (amountCents > availableBalance) {
      toast.error('Saldo insuficiente');
      return;
    }

    if (!affiliate.pix_key || !affiliate.pix_key_type) {
      toast.error('Configure sua chave PIX no perfil');
      return;
    }

    setWithdrawalLoading(true);

    try {
      const platformFee = Math.round(amountCents * 0.10);
      const netAmount = amountCents - platformFee;

      await supabase.from('affiliate_withdrawals').insert({
        affiliate_id: affiliate.id,
        amount_cents: amountCents,
        platform_fee_cents: platformFee,
        net_amount_cents: netAmount,
        pix_key: affiliate.pix_key,
        pix_key_type: affiliate.pix_key_type
      });

      toast.success('Solicitação de saque enviada!');
      setWithdrawalDialogOpen(false);
      setWithdrawalAmount('');
      fetchData();
    } catch (error) {
      toast.error('Erro ao solicitar saque');
    } finally {
      setWithdrawalLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  // Calculate metrics
  const totalLeads = leads.length;
  const monthlyLeads = leads.filter(l => {
    const date = new Date(l.created_at);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;
  const conversions = leads.filter(l => l.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? Math.round((conversions / totalLeads) * 100) : 0;
  const pendingCommissions = commissions.filter(c => c.status === 'pending').reduce((acc, c) => acc + c.affiliate_value_cents, 0);
  const availableBalance = commissions.filter(c => c.status === 'available').reduce((acc, c) => acc + c.affiliate_value_cents, 0);
  const paidCommissions = commissions.filter(c => c.status === 'paid').reduce((acc, c) => acc + c.affiliate_value_cents, 0);
  const totalEarnings = commissions.reduce((acc, c) => acc + c.affiliate_value_cents, 0);

  // Monthly data for charts
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    
    const monthLeads = leads.filter(l => {
      const createdAt = new Date(l.created_at);
      return createdAt >= start && createdAt <= end;
    });

    const monthConversions = monthLeads.filter(l => l.status === 'converted').length;
    const monthCommissions = commissions.filter(c => {
      const createdAt = new Date(c.created_at);
      return createdAt >= start && createdAt <= end;
    }).reduce((acc, c) => acc + c.affiliate_value_cents, 0);

    return {
      month: format(date, 'MMM', { locale: ptBR }),
      leads: monthLeads.length,
      conversions: monthConversions,
      commissions: monthCommissions / 100,
    };
  });

  const statusData = [
    { name: 'Novos', value: leads.filter(l => l.status === 'new').length, color: 'hsl(var(--primary))' },
    { name: 'Em análise', value: leads.filter(l => l.status === 'analyzing').length, color: 'hsl(var(--chart-2))' },
    { name: 'Convertidos', value: conversions, color: 'hsl(var(--chart-3))' },
    { name: 'Perdidos', value: leads.filter(l => l.status === 'lost').length, color: 'hsl(var(--chart-4))' },
  ].filter(d => d.value > 0);

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { class: string; icon: any; label: string }> = {
      new: { class: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Sparkles, label: 'Novo' },
      analyzing: { class: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock, label: 'Analisando' },
      converted: { class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2, label: 'Convertido' },
      lost: { class: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle, label: 'Perdido' },
      pending: { class: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock, label: 'Pendente' },
      available: { class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2, label: 'Disponível' },
      paid: { class: 'bg-primary/10 text-primary border-primary/20', icon: Check, label: 'Pago' },
      approved: { class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2, label: 'Aprovado' },
      rejected: { class: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle, label: 'Rejeitado' },
    };
    const cfg = configs[status] || configs.pending;
    const Icon = cfg.icon;
    return <Badge variant="outline" className={cfg.class}><Icon className="h-3 w-3 mr-1" />{cfg.label}</Badge>;
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Carregando painel...</p>
        </div>
      </div>
    );
  }

  // No affiliate profile
  if (!affiliate) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="h-16 w-16 mx-auto text-amber-500 mb-6" />
          <h2 className="text-xl font-semibold mb-2">Perfil não encontrado</h2>
          <p className="text-muted-foreground mb-6">Você ainda não possui um perfil de afiliado.</p>
          <Button onClick={() => navigate('/afiliado/cadastro')} className="w-full">
            Criar Perfil de Afiliado
          </Button>
        </Card>
      </div>
    );
  }

  // Render Overview
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Leads Totais', value: totalLeads, color: 'primary', change: '+12%' },
          { icon: Calendar, label: 'Leads do Mês', value: monthlyLeads, color: 'blue', change: '+8%' },
          { icon: Target, label: 'Conversões', value: conversions, color: 'emerald', change: `${conversionRate}%` },
          { icon: Clock, label: 'Comissões Pendentes', value: formatCurrency(pendingCommissions), color: 'amber' },
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
                  {stat.change && (
                    <span className="text-xs font-medium flex items-center gap-1 text-emerald-400">
                      <ArrowUpRight className="h-3 w-3" />
                      {stat.change}
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-emerald-500/10 via-card to-card border-emerald-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Disponível para Saque</p>
                  <p className="text-3xl font-bold text-emerald-400">{formatCurrency(availableBalance)}</p>
                  <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="mt-3 bg-emerald-600 hover:bg-emerald-700">
                        Solicitar Saque
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Solicitar Saque</DialogTitle>
                        <DialogDescription>
                          Uma taxa de 10% será retida pela plataforma
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="p-4 rounded-lg bg-muted">
                          <div className="text-sm text-muted-foreground">Saldo disponível</div>
                          <div className="text-2xl font-bold">{formatCurrency(availableBalance)}</div>
                        </div>
                        <div className="space-y-2">
                          <Label>Valor do saque</Label>
                          <Input
                            type="text"
                            placeholder="0,00"
                            value={withdrawalAmount}
                            onChange={(e) => setWithdrawalAmount(e.target.value)}
                          />
                        </div>
                        {withdrawalAmount && (
                          <div className="p-4 rounded-lg border space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Valor solicitado</span>
                              <span>{formatCurrency(parseFloat(withdrawalAmount.replace(',', '.')) * 100 || 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Taxa (10%)</span>
                              <span className="text-destructive">-{formatCurrency(parseFloat(withdrawalAmount.replace(',', '.')) * 10 || 0)}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-semibold">
                              <span>Você receberá</span>
                              <span className="text-emerald-500">{formatCurrency(parseFloat(withdrawalAmount.replace(',', '.')) * 90 || 0)}</span>
                            </div>
                          </div>
                        )}
                        <Button 
                          onClick={requestWithdrawal} 
                          disabled={withdrawalLoading || !withdrawalAmount}
                          className="w-full"
                        >
                          {withdrawalLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Confirmar Saque
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <Wallet className="h-7 w-7 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pendente de Liberação</p>
                  <p className="text-3xl font-bold text-amber-400">{formatCurrency(pendingCommissions)}</p>
                  <p className="text-xs text-muted-foreground mt-2">Aguardando confirmação</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                  <Clock className="h-7 w-7 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Recebido</p>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(paidCommissions)}</p>
                  <p className="text-xs text-muted-foreground mt-2">Desde o início</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <DollarSign className="h-7 w-7 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Affiliate Link Card */}
      <Card className="bg-gradient-to-r from-primary/5 via-card to-card border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Seu Link de Afiliado</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Compartilhe e ganhe comissões em cada venda
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono bg-muted/50 p-3 rounded-lg border border-border/50 truncate">
                  {`${window.location.origin}/p/${affiliate.affiliate_code}`}
                </code>
                <Button
                  variant={copied ? 'default' : 'outline'}
                  size="sm"
                  onClick={copyLink}
                  className={copied ? 'bg-emerald-500' : ''}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <Crown className="w-5 h-5 text-emerald-500" />
                <span className="font-bold text-emerald-500 text-lg">20%</span>
                <span className="text-muted-foreground text-sm">comissão</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="leads" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorLeads)" name="Leads" />
                <Area type="monotone" dataKey="conversions" stroke="hsl(var(--chart-2))" fillOpacity={0.3} fill="hsl(var(--chart-2))" name="Conversões" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-primary" />
              Distribuição de Leads
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
                Capture seu primeiro lead!
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Leads Recentes
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => handleSectionChange('leads')}>
              Ver todos <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {leads.length > 0 ? (
            <div className="space-y-3">
              {leads.slice(0, 5).map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border border-border/50">
                      <AvatarFallback className="bg-primary/10 text-primary">{lead.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{lead.full_name}</p>
                      <p className="text-sm text-muted-foreground">{lead.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(lead.status)}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(lead.created_at), 'dd/MM', { locale: ptBR })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum lead capturado ainda</p>
              <p className="text-sm mt-1">Compartilhe seu link para começar!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Render Leads
  const renderLeads = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Meus Leads
          </h2>
          <p className="text-sm text-muted-foreground">{leads.length} leads capturados</p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48 bg-background/50"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-background/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="new">Novos</SelectItem>
              <SelectItem value="analyzing">Analisando</SelectItem>
              <SelectItem value="converted">Convertidos</SelectItem>
              <SelectItem value="lost">Perdidos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredLeads.length > 0 ? (
          filteredLeads.map((lead, index) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all">
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary">{lead.full_name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-foreground">{lead.full_name}</h3>
                          {getStatusBadge(lead.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</span>
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</span>
                        </div>
                        {lead.company_name && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Building className="h-3 w-3" />{lead.company_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {lead.potential_value_cents && (
                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-400">{formatCurrency(lead.potential_value_cents)}</p>
                          <p className="text-xs text-muted-foreground">Valor potencial</p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(lead.created_at), "dd 'de' MMM", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-semibold text-foreground mb-2">Nenhum lead encontrado</h3>
              <p className="text-muted-foreground">Compartilhe seu link para começar a capturar leads!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  // Render Services
  const renderServices = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Serviços Disponíveis
        </h2>
        <p className="text-sm text-muted-foreground">Ative os serviços que deseja promover</p>
      </div>

      <div className="grid gap-4">
        {services.map((service, index) => {
          const isActivated = activatedServices.includes(service.id);
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`bg-card/50 backdrop-blur border-border/50 ${isActivated ? 'border-emerald-500/30' : ''} transition-all`}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-foreground">{service.name}</h3>
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                            {service.commission_percent}% comissão
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                        {service.benefits && service.benefits.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {service.benefits.slice(0, 3).map((benefit, i) => (
                              <span key={i} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                {benefit}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {isActivated && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = `${window.location.origin}/p/${affiliate.affiliate_code}/${service.slug}`;
                            navigator.clipboard.writeText(link);
                            toast.success('Link copiado!');
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar Link
                        </Button>
                      )}
                      <Switch
                        checked={isActivated}
                        onCheckedChange={(checked) => toggleService(service.id, checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  // Render Financial
  const renderFinancial = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          Financeiro
        </h2>
        <p className="text-sm text-muted-foreground">Acompanhe suas comissões e ganhos</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total de Vendas', value: formatCurrency(totalEarnings), icon: TrendingUp, color: 'primary' },
          { label: 'Disponível', value: formatCurrency(availableBalance), icon: Wallet, color: 'emerald' },
          { label: 'Pendente', value: formatCurrency(pendingCommissions), icon: Clock, color: 'amber' },
          { label: 'Já Pago', value: formatCurrency(paidCommissions), icon: CheckCircle2, color: 'blue' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-5">
                <div className={`p-2 rounded-lg bg-${item.color}-500/10 w-fit mb-3`}>
                  <item.icon className={`h-4 w-4 text-${item.color}-400`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Commission History */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Histórico de Comissões</CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length > 0 ? (
            <div className="space-y-3">
              {commissions.map((commission, index) => (
                <motion.div
                  key={commission.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{formatCurrency(commission.affiliate_value_cents)}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(commission.created_at), "dd 'de' MMMM", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(commission.status)}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma comissão ainda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Render Withdrawals
  const renderWithdrawals = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            Saques
          </h2>
          <p className="text-sm text-muted-foreground">Histórico de solicitações de saque</p>
        </div>
        <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Solicitar Saque
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Solicitar Saque</DialogTitle>
              <DialogDescription>
                Uma taxa de 10% será retida pela plataforma
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-sm text-muted-foreground">Saldo disponível</div>
                <div className="text-2xl font-bold">{formatCurrency(availableBalance)}</div>
              </div>
              <div className="space-y-2">
                <Label>Valor do saque</Label>
                <Input
                  type="text"
                  placeholder="0,00"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                />
              </div>
              <Button 
                onClick={requestWithdrawal} 
                disabled={withdrawalLoading || !withdrawalAmount}
                className="w-full"
              >
                {withdrawalLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirmar Saque
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="p-0">
          {withdrawals.length > 0 ? (
            <div className="divide-y divide-border/50">
              {withdrawals.map((withdrawal, index) => (
                <motion.div
                  key={withdrawal.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Banknote className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{formatCurrency(withdrawal.amount_cents)}</p>
                      <p className="text-xs text-muted-foreground">
                        Líquido: {formatCurrency(withdrawal.net_amount_cents)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(withdrawal.status)}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(withdrawal.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Banknote className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum saque realizado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Render Profile
  const renderProfile = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Meu Perfil
        </h2>
        <p className="text-sm text-muted-foreground">Gerencie suas informações pessoais e de pagamento</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarImage src={affiliate.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">{affiliate.full_name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-foreground">{affiliate.full_name}</h3>
                <p className="text-sm text-muted-foreground">{affiliate.email}</p>
                <Badge variant="outline" className="mt-2">
                  Código: {affiliate.affiliate_code}
                </Badge>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{affiliate.phone || 'Não informado'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{affiliate.company_name || 'Não informado'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span>{affiliate.city && affiliate.state ? `${affiliate.city}, ${affiliate.state}` : 'Não informado'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Dados de Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <span className="font-medium">Chave PIX</span>
              </div>
              {affiliate.pix_key ? (
                <div>
                  <p className="text-sm text-muted-foreground">Tipo: {affiliate.pix_key_type}</p>
                  <p className="font-mono text-sm mt-1">{affiliate.pix_key}</p>
                </div>
              ) : (
                <p className="text-sm text-amber-500">Configure sua chave PIX para receber pagamentos</p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span className="font-medium text-emerald-500">Conta Ativa</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Membro desde {format(new Date(affiliate.created_at), "MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'leads': return renderLeads();
      case 'services': return renderServices();
      case 'financial': return renderFinancial();
      case 'withdrawals': return renderWithdrawals();
      case 'profile': return renderProfile();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-72 
        bg-card/95 backdrop-blur-xl border-r border-border/50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-bold text-foreground">Afiliado</h1>
                  <p className="text-xs text-muted-foreground">Painel Premium</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 p-4">
            <nav className="space-y-2">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSectionChange(item.id as PanelSection)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all
                      ${isActive 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      }
                    `}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                    <span className="font-medium">{item.label}</span>
                    {item.id === 'leads' && leads.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">{leads.length}</Badge>
                    )}
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User Footer */}
          <div className="p-4 border-t border-border/50">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <Avatar className="h-10 w-10 border border-border/50">
                <AvatarImage src={affiliate.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">{affiliate.full_name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{affiliate.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{affiliate.email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {NAV_ITEMS.find(item => item.id === activeSection)?.label}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={fetchData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
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
    </div>
  );
}
