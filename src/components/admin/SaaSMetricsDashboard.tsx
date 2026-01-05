import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  Users, Building, DollarSign, TrendingUp, TrendingDown, AlertTriangle,
  Clock, CheckCircle, Activity, Target, Zap, 
  BarChart3, RefreshCw, Loader2, UserPlus, FileText, CreditCard, MessageSquare, Star
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardMetrics {
  totalUsers: number;
  activeSubscriptions: number;
  totalPartners: number;
  totalRevenue: number;
  mrr: number;
  arr: number;
  ltv: number;
  cac: number;
  churnRate: number;
  conversionRate: number;
  newUsersThisMonth: number;
  pendingRequests: number;
  activeConsultations: number;
  averageTicket: number;
  growthRate: number;
  nps: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  icon: any;
  color: string;
}

export function SaaSMetricsDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    fetchMetrics();
    fetchRecentActivities();
    
    const channel = supabase
      .channel('admin-saas-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => fetchMetrics())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchMetrics())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'credit_repair_requests' }, () => fetchMetrics())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchMetrics = async () => {
    try {
      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);
      const startOfLastMonth = startOfMonth(subMonths(now, 1));
      const endOfLastMonth = endOfMonth(subMonths(now, 1));

      const [
        { count: totalUsers },
        { data: subscriptions },
        { count: activeSubscriptions },
        { count: totalPartners },
        { data: creditRequests },
        { data: fiscalRequests },
        { data: consultations },
        { count: newUsersThisMonth },
        { data: lastMonthUsers }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*'),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('credit_repair_partners').select('*', { count: 'exact', head: true }),
        supabase.from('credit_repair_requests').select('*'),
        supabase.from('fiscal_analysis_requests').select('*'),
        supabase.from('consultations').select('*'),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
          .gte('created_at', startOfCurrentMonth.toISOString())
          .lte('created_at', endOfCurrentMonth.toISOString()),
        supabase.from('profiles').select('*')
          .gte('created_at', startOfLastMonth.toISOString())
          .lte('created_at', endOfLastMonth.toISOString())
      ]);

      const creditRevenueTotal = (creditRequests || [])
        .filter(r => r.payment_status === 'paid')
        .reduce((sum, r) => sum + r.final_price_cents, 0);

      const fiscalRevenueTotal = (fiscalRequests || [])
        .filter(r => r.payment_status === 'paid')
        .reduce((sum, r) => sum + (r.service_fee_cents || 0), 0);

      const subscriptionRevenueTotal = (subscriptions || [])
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + s.price_cents, 0);

      const totalRevenue = creditRevenueTotal + fiscalRevenueTotal + subscriptionRevenueTotal;
      const mrr = subscriptionRevenueTotal;
      const arr = mrr * 12;

      const cancelledSubs = (subscriptions || []).filter(s => s.status === 'cancelled').length;
      const allSubs = (subscriptions || []).length;
      const churnRate = allSubs > 0 ? (cancelledSubs / allSubs) * 100 : 0;

      const totalRequests = (creditRequests?.length || 0) + (fiscalRequests?.length || 0);
      const paidRequests = (creditRequests?.filter(r => r.payment_status === 'paid').length || 0) +
        (fiscalRequests?.filter(r => r.payment_status === 'paid').length || 0);
      const conversionRate = totalRequests > 0 ? (paidRequests / totalRequests) * 100 : 0;

      const averageTicket = paidRequests > 0 ? totalRevenue / paidRequests : 0;
      const ltv = averageTicket * 3;
      const cac = 5000;

      const lastMonthCount = lastMonthUsers?.length || 0;
      const growthRate = lastMonthCount > 0 ? ((newUsersThisMonth || 0) - lastMonthCount) / lastMonthCount * 100 : 0;

      const pendingCreditRequests = (creditRequests || []).filter(r => r.status === 'pending').length;
      const pendingFiscalRequests = (fiscalRequests || []).filter(r => r.status === 'pending').length;

      const activeConsults = (consultations || []).filter(c => 
        c.status === 'pending' || c.status === 'scheduled'
      ).length;

      setMetrics({
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalPartners: totalPartners || 0,
        totalRevenue,
        mrr,
        arr,
        ltv,
        cac,
        churnRate,
        conversionRate,
        newUsersThisMonth: newUsersThisMonth || 0,
        pendingRequests: pendingCreditRequests + pendingFiscalRequests,
        activeConsultations: activeConsults,
        averageTicket,
        growthRate,
        nps: 72
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const [
        { data: newUsers },
        { data: newRequests },
        { data: newSubs }
      ] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('credit_repair_requests').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('subscriptions').select('*').order('created_at', { ascending: false }).limit(5)
      ]);

      const activities: RecentActivity[] = [];

      (newUsers || []).forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          type: 'new_user',
          description: `Novo usuário: ${user.full_name || user.email || 'Anônimo'}`,
          timestamp: user.created_at,
          icon: UserPlus,
          color: 'text-primary'
        });
      });

      (newRequests || []).forEach(req => {
        activities.push({
          id: `req-${req.id}`,
          type: 'new_request',
          description: `Nova solicitação: ${req.full_name}`,
          timestamp: req.created_at,
          icon: FileText,
          color: 'text-info'
        });
      });

      (newSubs || []).forEach(sub => {
        activities.push({
          id: `sub-${sub.id}`,
          type: 'subscription',
          description: `Assinatura ${sub.status === 'active' ? 'ativada' : sub.status}: ${sub.plan_type}`,
          timestamp: sub.created_at,
          icon: CreditCard,
          color: sub.status === 'active' ? 'text-success' : 'text-muted-foreground'
        });
      });

      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivities(activities.slice(0, 10));
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Executivo SaaS</h2>
          <p className="text-muted-foreground">Métricas completas do seu negócio</p>
        </div>
        <Button variant="outline" onClick={() => { setIsLoading(true); fetchMetrics(); }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">MRR</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics.mrr)}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Receita Recorrente Mensal</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ARR</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics.arr)}</p>
                </div>
                <div className="p-3 rounded-xl bg-success/10">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Receita Anual Recorrente</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                  <p className="text-2xl font-bold">{metrics.activeSubscriptions}</p>
                </div>
                <div className="p-3 rounded-xl bg-info/10">
                  <Users className="h-6 w-6 text-info" />
                </div>
              </div>
              <Badge className="bg-success/10 text-success text-xs mt-2">
                +{metrics.newUsersThisMonth} este mês
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className={`bg-gradient-to-br ${metrics.churnRate > 5 ? 'from-destructive/10 to-destructive/5 border-destructive/20' : 'from-accent/10 to-accent/5 border-accent/20'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Churn Rate</p>
                  <p className="text-2xl font-bold">{formatPercent(metrics.churnRate)}</p>
                </div>
                <div className={`p-3 rounded-xl ${metrics.churnRate > 5 ? 'bg-destructive/10' : 'bg-accent/10'}`}>
                  {metrics.churnRate > 5 ? (
                    <TrendingDown className="h-6 w-6 text-destructive" />
                  ) : (
                    <Activity className="h-6 w-6 text-accent" />
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {metrics.churnRate > 5 ? 'Atenção necessária' : 'Dentro do esperado'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-xl font-bold">{formatPercent(metrics.conversionRate)}</p>
            <p className="text-xs text-muted-foreground">Conversão</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-6 w-6 mx-auto mb-2 text-success" />
            <p className="text-xl font-bold">{formatCurrency(metrics.averageTicket)}</p>
            <p className="text-xs text-muted-foreground">Ticket Médio</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 mx-auto mb-2 text-accent" />
            <p className="text-xl font-bold">{formatCurrency(metrics.ltv)}</p>
            <p className="text-xs text-muted-foreground">LTV</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 mx-auto mb-2 text-info" />
            <p className="text-xl font-bold">{formatCurrency(metrics.cac)}</p>
            <p className="text-xs text-muted-foreground">CAC</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <Building className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-xl font-bold">{metrics.totalPartners}</p>
            <p className="text-xs text-muted-foreground">Parceiros</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-6 w-6 mx-auto mb-2 text-success" />
            <p className="text-xl font-bold">{metrics.nps}</p>
            <p className="text-xs text-muted-foreground">NPS Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Business Health */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Saúde do Negócio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>LTV/CAC Ratio</span>
                <span className={metrics.ltv / metrics.cac >= 3 ? 'text-success font-bold' : 'text-accent font-bold'}>
                  {(metrics.ltv / metrics.cac).toFixed(1)}x
                </span>
              </div>
              <Progress value={Math.min((metrics.ltv / metrics.cac / 5) * 100, 100)} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {metrics.ltv / metrics.cac >= 3 ? '✓ Saudável (>3x)' : '⚠️ Precisa melhorar'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Taxa de Retenção</span>
                <span className="font-bold">{formatPercent(100 - metrics.churnRate)}</span>
              </div>
              <Progress value={100 - metrics.churnRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {metrics.churnRate < 5 ? '✓ Excelente' : '⚠️ Atenção ao churn'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Crescimento Mensal</span>
                <span className={`font-bold ${metrics.growthRate >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {metrics.growthRate >= 0 ? '+' : ''}{formatPercent(metrics.growthRate)}
                </span>
              </div>
              <Progress value={Math.min(Math.abs(metrics.growthRate) * 5, 100)} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {metrics.growthRate >= 10 ? '🚀 Crescimento acelerado' : 
                 metrics.growthRate >= 0 ? '📈 Em crescimento' : '📉 Em declínio'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Actions & Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-accent" />
              Ações Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.pendingRequests > 0 && (
              <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent/20">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-medium">{metrics.pendingRequests} solicitações pendentes</p>
                    <p className="text-xs text-muted-foreground">Requerem análise</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-accent">Urgente</Badge>
              </div>
            )}

            {metrics.activeConsultations > 0 && (
              <div className="flex items-center justify-between p-3 bg-info/10 rounded-lg border border-info/20">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-info" />
                  <div>
                    <p className="font-medium">{metrics.activeConsultations} consultas ativas</p>
                    <p className="text-xs text-muted-foreground">Em andamento</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-info">Ativo</Badge>
              </div>
            )}

            {metrics.pendingRequests === 0 && metrics.activeConsultations === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-success" />
                <p>Tudo em dia! Nenhuma ação pendente.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-2 hover:bg-muted/30 rounded-lg transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-muted/50">
                      <Icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(activity.timestamp), "dd/MM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
