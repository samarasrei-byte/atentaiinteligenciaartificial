import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  exportAdminReportToExcel, 
  exportAdminReportToPdf, 
  AdminReportData 
} from '@/lib/exportAdminReports';
import { STRIPE_PLANS } from '@/lib/stripe';
import {
  FileDown, 
  FileSpreadsheet, 
  FileText, 
  Loader2, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  ArrowLeft,
  RefreshCw,
  BarChart3,
  Users,
  CreditCard,
  MessageSquare,
  Calculator,
  DollarSign,
} from 'lucide-react';

const AdminReports = () => {
  const navigate = useNavigate();
  const { user, hasRole, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState<'pdf' | 'excel' | null>(null);
  const [reportPeriod, setReportPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [reportData, setReportData] = useState<AdminReportData | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!hasRole('admin')) {
        toast({
          variant: 'destructive',
          title: 'Acesso negado',
          description: 'Apenas administradores podem acessar esta página',
        });
        navigate('/dashboard');
      }
    }
  }, [user, authLoading, hasRole, navigate, toast]);

  useEffect(() => {
    if (user && hasRole('admin')) {
      fetchReportData();
    }
  }, [user, hasRole, reportPeriod]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      let startDate = new Date();
      
      switch (reportPeriod) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const [
        profilesRes,
        contadorRes,
        subscriptionsRes,
        consultationsRes,
        paymentsRes,
        simulationsRes,
        messagesRes,
        pendingConsultRes,
        monthlyPaymentsRes,
        newUsersRes,
        allSubscriptions,
        allConsultations,
        aiTodayRes,
        aiWeekRes,
        aiMonthRes,
        simTodayRes,
        simWeekRes,
        simMonthRes,
        activeUsersTodayRes,
        activeUsersWeekRes,
        consultScheduledWeekRes,
        consultCompletedWeekRes,
        simulatorPlansRes,
        premiumPlansRes,
        contadorPlansRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('contador_profiles').select('id', { count: 'exact' }),
        supabase.from('subscriptions').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('consultations').select('id, price_cents', { count: 'exact' }).eq('status', 'completed'),
        supabase.from('payments').select('amount_cents').eq('status', 'completed'),
        supabase.from('tax_simulations').select('id', { count: 'exact' }),
        supabase.from('ai_chat_messages').select('id', { count: 'exact' }),
        supabase.from('consultations').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('payments').select('amount_cents').eq('status', 'completed').gte('created_at', startOfMonth.toISOString()),
        supabase.from('profiles').select('id', { count: 'exact' }).gte('created_at', startOfMonth.toISOString()),
        supabase.from('subscriptions').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('consultations').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('ai_chat_messages').select('id', { count: 'exact' }).eq('role', 'user').gte('created_at', startOfDay.toISOString()),
        supabase.from('ai_chat_messages').select('id', { count: 'exact' }).eq('role', 'user').gte('created_at', startOfWeek.toISOString()),
        supabase.from('ai_chat_messages').select('id', { count: 'exact' }).eq('role', 'user').gte('created_at', startOfMonth.toISOString()),
        supabase.from('tax_simulations').select('id', { count: 'exact' }).gte('created_at', startOfDay.toISOString()),
        supabase.from('tax_simulations').select('id', { count: 'exact' }).gte('created_at', startOfWeek.toISOString()),
        supabase.from('tax_simulations').select('id', { count: 'exact' }).gte('created_at', startOfMonth.toISOString()),
        supabase.from('daily_question_usage').select('user_id', { count: 'exact' }).gte('updated_at', startOfDay.toISOString()),
        supabase.from('daily_question_usage').select('user_id', { count: 'exact' }).gte('updated_at', startOfWeek.toISOString()),
        supabase.from('consultations').select('id', { count: 'exact' }).eq('status', 'scheduled').gte('created_at', startOfWeek.toISOString()),
        supabase.from('consultations').select('id', { count: 'exact' }).eq('status', 'completed').gte('completed_at', startOfWeek.toISOString()),
        supabase.from('subscriptions').select('id', { count: 'exact' }).eq('status', 'active').eq('plan_type', 'simulator'),
        supabase.from('subscriptions').select('id', { count: 'exact' }).eq('status', 'active').eq('plan_type', 'premium'),
        supabase.from('subscriptions').select('id', { count: 'exact' }).eq('status', 'active').eq('plan_type', 'contador'),
      ]);

      const totalRevenue = (paymentsRes.data || []).reduce((sum, p) => sum + p.amount_cents, 0);
      const monthlyRevenue = (monthlyPaymentsRes.data || []).reduce((sum, p) => sum + p.amount_cents, 0);

      setReportData({
        stats: {
          totalUsers: profilesRes.count || 0,
          totalContadores: contadorRes.count || 0,
          totalSubscriptions: subscriptionsRes.count || 0,
          totalConsultations: consultationsRes.count || 0,
          totalRevenue,
          totalSimulations: simulationsRes.count || 0,
          totalMessages: messagesRes.count || 0,
          pendingConsultations: pendingConsultRes.count || 0,
          monthlyRevenue,
          newUsersThisMonth: newUsersRes.count || 0,
          aiQuestionsToday: aiTodayRes.count || 0,
          aiQuestionsThisWeek: aiWeekRes.count || 0,
          aiQuestionsThisMonth: aiMonthRes.count || 0,
          simulationsToday: simTodayRes.count || 0,
          simulationsThisWeek: simWeekRes.count || 0,
          simulationsThisMonth: simMonthRes.count || 0,
          activeUsersToday: activeUsersTodayRes.count || 0,
          activeUsersThisWeek: activeUsersWeekRes.count || 0,
          consultationsScheduledThisWeek: consultScheduledWeekRes.count || 0,
          consultationsCompletedThisWeek: consultCompletedWeekRes.count || 0,
          simulatorPlanCount: simulatorPlansRes.count || 0,
          premiumPlanCount: premiumPlansRes.count || 0,
          contadorPlanCount: contadorPlansRes.count || 0,
        },
        subscriptions: allSubscriptions.data || [],
        consultations: allConsultations.data || [],
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados do relatório',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!reportData) return;
    setIsExporting('pdf');
    try {
      exportAdminReportToPdf(reportData);
      toast({
        title: 'PDF exportado!',
        description: 'O relatório foi baixado com sucesso',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao exportar',
        description: 'Não foi possível gerar o PDF',
      });
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportExcel = async () => {
    if (!reportData) return;
    setIsExporting('excel');
    try {
      exportAdminReportToExcel(reportData);
      toast({
        title: 'Excel exportado!',
        description: 'O relatório foi baixado com sucesso',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao exportar',
        description: 'Não foi possível gerar o Excel',
      });
    } finally {
      setIsExporting(null);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Relatórios Avançados</h1>
              <p className="text-sm text-muted-foreground">Exporte métricas detalhadas da plataforma</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={reportPeriod} onValueChange={(v) => setReportPeriod(v as any)}>
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última Semana</SelectItem>
                <SelectItem value="month">Último Mês</SelectItem>
                <SelectItem value="year">Último Ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchReportData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Export Actions */}
        <Card className="bg-gradient-to-r from-primary/10 to-info/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5 text-primary" />
              Exportar Relatório
            </CardTitle>
            <CardDescription>
              Baixe os dados completos em PDF ou Excel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                onClick={handleExportPdf}
                disabled={isExporting === 'pdf' || !reportData}
                className="flex-1 bg-destructive hover:bg-destructive/90"
              >
                {isExporting === 'pdf' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Exportar PDF
              </Button>
              <Button 
                onClick={handleExportExcel}
                disabled={isExporting === 'excel' || !reportData}
                className="flex-1 bg-success hover:bg-success/90"
              >
                {isExporting === 'excel' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                )}
                Exportar Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Stats */}
        {reportData && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 max-w-xl">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="revenue">Receita</TabsTrigger>
              <TabsTrigger value="usage">Uso</TabsTrigger>
              <TabsTrigger value="plans">Planos</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Usuários</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{reportData.stats.totalUsers}</p>
                    <p className="text-xs text-success mt-1">+{reportData.stats.newUsersThisMonth} este mês</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-sm">Assinaturas</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{reportData.stats.totalSubscriptions}</p>
                    <p className="text-xs text-muted-foreground mt-1">Ativas</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Calculator className="h-4 w-4" />
                      <span className="text-sm">Simulações</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{reportData.stats.totalSimulations}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total realizadas</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm">Perguntas IA</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{reportData.stats.totalMessages}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total mensagens</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-success mb-2">
                      <DollarSign className="h-5 w-5" />
                      <span className="font-medium">Receita Total</span>
                    </div>
                    <p className="text-4xl font-bold text-foreground">{formatCurrency(reportData.stats.totalRevenue)}</p>
                    <p className="text-sm text-muted-foreground mt-2">Todos os pagamentos processados</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-info mb-2">
                      <TrendingUp className="h-5 w-5" />
                      <span className="font-medium">Receita do Mês</span>
                    </div>
                    <p className="text-4xl font-bold text-foreground">{formatCurrency(reportData.stats.monthlyRevenue)}</p>
                    <p className="text-sm text-muted-foreground mt-2">Mês atual</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="usage" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Simulações Hoje</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">{reportData.stats.simulationsToday}</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Simulações Semana</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">{reportData.stats.simulationsThisWeek}</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Simulações Mês</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">{reportData.stats.simulationsThisMonth}</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Perguntas IA Hoje</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">{reportData.stats.aiQuestionsToday}</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Perguntas IA Semana</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">{reportData.stats.aiQuestionsThisWeek}</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Perguntas IA Mês</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">{reportData.stats.aiQuestionsThisMonth}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="plans" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                  <CardContent className="pt-6 text-center">
                    <Badge className="bg-blue-500 mb-4">Simulador</Badge>
                    <p className="text-4xl font-bold text-foreground">{reportData.stats.simulatorPlanCount}</p>
                    <p className="text-sm text-muted-foreground mt-2">Assinaturas ativas</p>
                    <p className="text-success font-medium mt-1">
                      {formatCurrency(reportData.stats.simulatorPlanCount * STRIPE_PLANS.simulator.price)}/mês
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="pt-6 text-center">
                    <Badge className="bg-primary mb-4">Premium</Badge>
                    <p className="text-4xl font-bold text-foreground">{reportData.stats.premiumPlanCount}</p>
                    <p className="text-sm text-muted-foreground mt-2">Assinaturas ativas</p>
                    <p className="text-success font-medium mt-1">
                      {formatCurrency(reportData.stats.premiumPlanCount * STRIPE_PLANS.premium.price)}/mês
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-accent/10 to-orange-500/10 border-accent/20">
                  <CardContent className="pt-6 text-center">
                    <Badge className="bg-accent mb-4">Contador</Badge>
                    <p className="text-4xl font-bold text-foreground">{reportData.stats.contadorPlanCount}</p>
                    <p className="text-sm text-muted-foreground mt-2">Assinaturas ativas</p>
                    <p className="text-success font-medium mt-1">
                      {formatCurrency(reportData.stats.contadorPlanCount * STRIPE_PLANS.contador.price)}/mês
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default AdminReports;
