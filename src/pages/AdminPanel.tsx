import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import AppSidebar from '@/components/layout/AppSidebar';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { UsageMetrics } from '@/components/dashboard/UsageMetrics';
import { PlanDistributionChart } from '@/components/dashboard/PlanDistributionChart';
import { AdminSupportPanel } from '@/components/support/AdminSupportPanel';
import { AdminWithdrawalPanel } from '@/components/support/AdminWithdrawalPanel';
import { RealtimeNotifications } from '@/components/admin/RealtimeNotifications';
import { ContadoresManagement } from '@/components/admin/ContadoresManagement';
import { CreditRepairManagement } from '@/components/admin/CreditRepairManagement';
import CashbackMetricsDashboard from '@/components/admin/CashbackMetricsDashboard';
import { FiscalAnalysisManagement } from '@/components/admin/FiscalAnalysisManagement';
import { FloatingAIAgent } from '@/components/ai/FloatingAIAgent';
import { ChurnAnalytics } from '@/components/admin/ChurnAnalytics';
import { CohortAnalysis } from '@/components/admin/CohortAnalysis';
import { MassMessaging } from '@/components/admin/MassMessaging';
import { AdminRealtimeDashboard } from '@/components/admin/AdminRealtimeDashboard';
import { SaaSMetricsDashboard } from '@/components/admin/SaaSMetricsDashboard';
import { RevenueForecastDashboard } from '@/components/admin/RevenueForecastDashboard';
import { ChurnNotificationSystem } from '@/components/admin/ChurnNotificationSystem';
import { PartnerManagement } from '@/components/admin/PartnerManagement';
import { AffiliateManagement } from '@/components/admin/AffiliateManagement';
import { AffiliateCouponManagement } from '@/components/admin/AffiliateCouponManagement';
import AuditLogViewer from '@/components/admin/AuditLogViewer';
import { 
  Users, DollarSign, Calculator, MessageSquare, Shield, Loader2, Search,
  TrendingUp, BarChart3, Activity, UserPlus, Settings, Wallet, Calendar,
  CreditCard, Clock, CheckCircle, AlertCircle, XCircle, RefreshCw, Menu, Headphones,
  Building2, User, Scale,
} from 'lucide-react';

interface UserWithRoles {
  id: string;
  email: string;
  created_at: string;
  profile?: { full_name: string | null };
  roles: string[];
  subscription?: { plan_type: string; status: string } | null;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  price_cents: number;
  current_period_end: string | null;
  created_at: string;
}

interface Consultation {
  id: string;
  user_id: string;
  contador_id: string;
  status: string;
  price_cents: number;
  platform_fee_cents: number;
  created_at: string;
  completed_at: string | null;
}

interface StatsData {
  totalUsers: number;
  totalContadores: number;
  totalSubscriptions: number;
  totalConsultations: number;
  totalRevenue: number;
  totalSimulations: number;
  totalMessages: number;
  pendingConsultations: number;
  monthlyRevenue: number;
  newUsersThisMonth: number;
  aiQuestionsToday: number;
  aiQuestionsThisWeek: number;
  aiQuestionsThisMonth: number;
  simulationsToday: number;
  simulationsThisWeek: number;
  simulationsThisMonth: number;
  activeUsersToday: number;
  activeUsersThisWeek: number;
  consultationsScheduledThisWeek: number;
  consultationsCompletedThisWeek: number;
  simulatorPlanCount: number;
  premiumPlanCount: number;
  contadorPlanCount: number;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, hasRole, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [revenueChartData, setRevenueChartData] = useState<{ month: string; receita: number; assinaturas: number }[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0, totalContadores: 0, totalSubscriptions: 0, totalConsultations: 0,
    totalRevenue: 0, totalSimulations: 0, totalMessages: 0, pendingConsultations: 0,
    monthlyRevenue: 0, newUsersThisMonth: 0, aiQuestionsToday: 0, aiQuestionsThisWeek: 0,
    aiQuestionsThisMonth: 0, simulationsToday: 0, simulationsThisWeek: 0, simulationsThisMonth: 0,
    activeUsersToday: 0, activeUsersThisWeek: 0, consultationsScheduledThisWeek: 0,
    consultationsCompletedThisWeek: 0, simulatorPlanCount: 0, premiumPlanCount: 0, contadorPlanCount: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) navigate('/auth');
      else if (!hasRole('admin')) {
        toast({ variant: 'destructive', title: 'Acesso negado', description: 'Apenas administradores' });
        navigate('/dashboard');
      }
    }
  }, [user, authLoading, hasRole, navigate, toast]);

  useEffect(() => {
    if (user && hasRole('admin')) {
      fetchAdminData();
      const ch = supabase.channel('admin-data')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchAdminData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => fetchAdminData())
        .subscribe();
      return () => { supabase.removeChannel(ch); };
    }
  }, [user, hasRole]);

  const fetchAdminData = async () => {
    try {
      const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
      const startOfWeek = new Date(); startOfWeek.setDate(startOfWeek.getDate() - 7); startOfWeek.setHours(0, 0, 0, 0);
      const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);

      const [profilesRes, contadorRes, subscriptionsRes, consultationsRes, paymentsRes, simulationsRes, messagesRes, pendingRes, monthlyRes, newUsersRes, allSubs, allConsult] = await Promise.all([
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
        supabase.from('subscriptions').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('consultations').select('*').order('created_at', { ascending: false }).limit(50),
      ]);

      const totalRevenue = (paymentsRes.data || []).reduce((sum, p) => sum + p.amount_cents, 0);
      const monthlyRevenue = (monthlyRes.data || []).reduce((sum, p) => sum + p.amount_cents, 0);

      setStats({
        totalUsers: profilesRes.count || 0, totalContadores: contadorRes.count || 0,
        totalSubscriptions: subscriptionsRes.count || 0, totalConsultations: consultationsRes.count || 0,
        totalRevenue, totalSimulations: simulationsRes.count || 0, totalMessages: messagesRes.count || 0,
        pendingConsultations: pendingRes.count || 0, monthlyRevenue, newUsersThisMonth: newUsersRes.count || 0,
        aiQuestionsToday: 0, aiQuestionsThisWeek: 0, aiQuestionsThisMonth: 0, simulationsToday: 0,
        simulationsThisWeek: 0, simulationsThisMonth: 0, activeUsersToday: 0, activeUsersThisWeek: 0,
        consultationsScheduledThisWeek: 0, consultationsCompletedThisWeek: 0,
        simulatorPlanCount: 0, premiumPlanCount: 0, contadorPlanCount: 0,
      });
      setSubscriptions(allSubs.data || []);
      setConsultations(allConsult.data || []);

      // Fetch real monthly revenue data for chart
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const revenueData: { month: string; receita: number; assinaturas: number }[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString();
        
        const [paymentsMonth, subsMonth] = await Promise.all([
          supabase.from('payments').select('amount_cents').eq('status', 'completed')
            .gte('created_at', monthStart).lt('created_at', monthEnd),
          supabase.from('subscriptions').select('id', { count: 'exact', head: true })
            .gte('created_at', monthStart).lt('created_at', monthEnd),
        ]);
        
        const monthRevenue = (paymentsMonth.data || []).reduce((sum, p) => sum + p.amount_cents, 0);
        
        revenueData.push({
          month: monthNames[date.getMonth()],
          receita: monthRevenue,
          assinaturas: subsMonth.count || 0,
        });
      }
      setRevenueChartData(revenueData);

      const { data: profilesData } = await supabase.from('profiles').select('user_id, full_name, email, created_at').order('created_at', { ascending: false }).limit(100);
      const { data: rolesData } = await supabase.from('user_roles').select('user_id, role');
      const { data: userSubs } = await supabase.from('subscriptions').select('user_id, plan_type, status').eq('status', 'active');

      const usersWithRoles: UserWithRoles[] = (profilesData || []).map((p) => ({
        id: p.user_id, email: p.email || '', created_at: p.created_at,
        profile: { full_name: p.full_name },
        roles: (rolesData || []).filter((r) => r.user_id === p.user_id).map((r) => r.role),
        subscription: (userSubs || []).find(s => s.user_id === p.user_id) || null,
      }));
      setUsers(usersWithRoles);
    } catch (error) { console.error('Error:', error); }
    finally { setIsLoading(false); setIsRefreshing(false); }
  };

  const handleRefresh = async () => { setIsRefreshing(true); await fetchAdminData(); toast({ title: 'Dados atualizados!' }); };
  const handleTabChange = (tab: string) => { 
    if (tab === 'roles') {
      navigate('/admin/roles');
      return;
    }
    // Painéis externos agora são tabs embutidas no admin (não mais navegação externa)
    setActiveTab(tab); 
    setSearchParams({ tab }); 
    setMobileMenuOpen(false); 
  };
  const formatCurrency = (cents: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  const getRoleBadge = (role: string) => {
    const c: Record<string, string> = { admin: 'bg-destructive', contador: 'bg-info', user: 'bg-muted' };
    return <Badge className={c[role] || 'bg-muted'}>{role}</Badge>;
  };
  const getStatusBadge = (status: string) => {
    const c: Record<string, { class: string; icon: any }> = {
      active: { class: 'bg-success/10 text-success', icon: CheckCircle },
      pending: { class: 'bg-accent/10 text-accent', icon: Clock },
      cancelled: { class: 'bg-destructive/10 text-destructive', icon: XCircle },
      completed: { class: 'bg-success/10 text-success', icon: CheckCircle },
    };
    const cfg = c[status] || c.pending;
    const Icon = cfg.icon;
    return <Badge variant="outline" className={cfg.class}><Icon className="h-3 w-3 mr-1" />{status}</Badge>;
  };

  const handleAddRole = async (userId: string, role: 'admin' | 'contador' | 'user') => {
    const { error } = await supabase.from('user_roles').insert([{ user_id: userId, role }]);
    if (!error) { toast({ title: 'Role adicionada!' }); fetchAdminData(); }
  };

  const filteredUsers = users.filter((u) => u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()));

  if (authLoading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="dashboard-layout">
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />}
      <div className="hidden lg:block">
        <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} variant="admin" activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <AppSidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} variant="admin" activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
      
      <main className={`dashboard-main transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <header className="dashboard-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}><Menu className="h-5 w-5" /></Button>
              <div className="p-2 rounded-xl bg-destructive/10 hidden sm:flex"><Shield className="h-6 w-6 text-destructive" /></div>
              <div>
                <h1 className="text-lg lg:text-2xl font-bold">Painel Admin</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">Controle total do AtentAI</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationCenter notifications={notifications} unreadCount={unreadCount} onMarkAsRead={markAsRead} onMarkAllAsRead={markAllAsRead} onClear={clearNotifications} />
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="hidden sm:flex">
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />Atualizar
              </Button>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard icon={Users} label="Usuários" value={stats.totalUsers} subtitle={`+${stats.newUsersThisMonth} este mês`} color="primary" />
                <StatsCard icon={Wallet} label="Receita Total" value={formatCurrency(stats.totalRevenue)} color="success" />
                <StatsCard icon={CreditCard} label="Assinaturas" value={stats.totalSubscriptions} color="info" />
                <StatsCard icon={DollarSign} label="Receita Mês" value={formatCurrency(stats.monthlyRevenue)} color="success" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatsCard icon={Shield} label="Contadores" value={stats.totalContadores} color="info" />
                <StatsCard icon={Calculator} label="Simulações" value={stats.totalSimulations} color="primary" />
                <StatsCard icon={MessageSquare} label="Mensagens IA" value={stats.totalMessages} color="accent" />
                <StatsCard icon={Activity} label="Consultas" value={stats.totalConsultations} color="success" />
                <StatsCard icon={Clock} label="Pendentes" value={stats.pendingConsultations} color="accent" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2"><RevenueChart data={revenueChartData} /></div>
                <div className="space-y-6">
                  <ActivityFeed activities={users.slice(0, 5).map(u => ({ id: u.id, type: 'signup' as const, title: u.profile?.full_name || 'Novo usuário', description: u.email, timestamp: new Date(u.created_at).toLocaleDateString('pt-BR') }))} />
                </div>
              </div>
              <div className="mt-6">
                <RealtimeNotifications />
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <Card className="bg-card border-border shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle>Gerenciar Usuários</CardTitle>
                    <CardDescription>{filteredUsers.length} usuários</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{u.profile?.full_name?.[0] || u.email[0]?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium">{u.profile?.full_name || 'Sem nome'}</p>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">{u.roles.map((role) => <span key={role}>{getRoleBadge(role)}</span>)}</div>
                        <Select onValueChange={(role) => handleAddRole(u.id, role as any)}>
                          <SelectTrigger className="w-[120px]"><SelectValue placeholder="+ Role" /></SelectTrigger>
                          <SelectContent>
                            {!u.roles.includes('admin') && <SelectItem value="admin">Admin</SelectItem>}
                            {!u.roles.includes('contador') && <SelectItem value="contador">Contador</SelectItem>}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'metrics' && <UsageMetrics data={{ aiQuestionsToday: stats.aiQuestionsToday, aiQuestionsThisWeek: stats.aiQuestionsThisWeek, aiQuestionsThisMonth: stats.aiQuestionsThisMonth, simulationsToday: stats.simulationsToday, simulationsThisWeek: stats.simulationsThisWeek, simulationsThisMonth: stats.simulationsThisMonth, activeUsersToday: stats.activeUsersToday, activeUsersThisWeek: stats.activeUsersThisWeek, consultationsScheduledThisWeek: 0, consultationsCompletedThisWeek: 0, averageResponseTime: 2.5, peakHour: '14:00' }} />}
          
          {activeTab === 'contadores' && (
            <ContadoresManagement />
          )}
          
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard icon={Wallet} label="Receita Total" value={formatCurrency(stats.totalRevenue)} color="success" />
                <StatsCard icon={DollarSign} label="Este Mês" value={formatCurrency(stats.monthlyRevenue)} color="success" />
                <StatsCard icon={CreditCard} label="Assinaturas" value={stats.totalSubscriptions} color="info" />
                <StatsCard icon={TrendingUp} label="Crescimento" value="+15%" color="success" />
              </div>
              <RevenueChart data={revenueChartData} />
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <Card className="bg-card border-border shadow-soft">
              <CardHeader><CardTitle>Assinaturas</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                      <div>
                        <p className="font-medium">Plano {sub.plan_type}</p>
                        <p className="text-sm text-muted-foreground">{new Date(sub.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(sub.price_cents)}</p>
                        {getStatusBadge(sub.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'consultations' && (
            <Card className="bg-card border-border shadow-soft">
              <CardHeader><CardTitle>Consultas</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {consultations.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                      <div>
                        <p className="font-medium">Consulta #{c.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">{new Date(c.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(c.price_cents)}</p>
                        {getStatusBadge(c.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'withdrawals' && <AdminWithdrawalPanel />}
          {activeTab === 'support' && <AdminSupportPanel />}
          {activeTab === 'limpa-nome' && <CreditRepairManagement />}
          {activeTab === 'cashback' && <CashbackMetricsDashboard />}
          {activeTab === 'modulo-fiscal' && <FiscalAnalysisManagement />}
          {activeTab === 'realtime' && <AdminRealtimeDashboard />}
          {activeTab === 'revenue-forecast' && <RevenueForecastDashboard />}
          {activeTab === 'churn' && <ChurnAnalytics />}
          {activeTab === 'churn-notifications' && <ChurnNotificationSystem />}
          {activeTab === 'cohort' && <CohortAnalysis />}
          {activeTab === 'mass-messages' && <MassMessaging />}
          {activeTab === 'saas-metrics' && <SaaSMetricsDashboard />}
          {activeTab === 'partners' && <PartnerManagement />}
          {activeTab === 'settings' && (
            <Card className="bg-card border-border shadow-soft">
              <CardHeader><CardTitle>Configurações</CardTitle><CardDescription>Ajustes do sistema</CardDescription></CardHeader>
              <CardContent><p className="text-muted-foreground">Configurações do sistema em desenvolvimento.</p></CardContent>
            </Card>
          )}

          {activeTab === 'panel-empresa' && (
            <Card className="bg-card border-border shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-purple-500" />
                    Visualizando Painel Empresa
                  </CardTitle>
                  <CardDescription>Modo de visualização admin - sem edição</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('overview')}>
                  Voltar ao Admin
                </Button>
              </CardHeader>
              <CardContent>
                <div className="p-6 bg-muted/30 rounded-lg border-2 border-dashed border-purple-500/30 text-center">
                  <p className="text-muted-foreground mb-4">Preview do painel de empresas está disponível.</p>
                  <Button onClick={() => window.open('/empresa', '_blank')}>
                    Abrir em nova aba
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'panel-autonomo' && (
            <Card className="bg-card border-border shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-emerald-500" />
                    Visualizando Painel Autônomo
                  </CardTitle>
                  <CardDescription>Modo de visualização admin - sem edição</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('overview')}>
                  Voltar ao Admin
                </Button>
              </CardHeader>
              <CardContent>
                <div className="p-6 bg-muted/30 rounded-lg border-2 border-dashed border-emerald-500/30 text-center">
                  <p className="text-muted-foreground mb-4">Preview do painel de autônomos está disponível.</p>
                  <Button onClick={() => window.open('/autonomo', '_blank')}>
                    Abrir em nova aba
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'affiliates' && <AffiliateManagement />}
          {activeTab === 'affiliate-coupons' && <AffiliateCouponManagement />}
          {activeTab === 'audit-logs' && <AuditLogViewer />}

          {activeTab === 'panel-contador' && (
            <Card className="bg-card border-border shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-blue-500" />
                    Visualizando Painel Contador
                  </CardTitle>
                  <CardDescription>Modo de visualização admin - sem edição</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('overview')}>
                  Voltar ao Admin
                </Button>
              </CardHeader>
              <CardContent>
                <div className="p-6 bg-muted/30 rounded-lg border-2 border-dashed border-blue-500/30 text-center">
                  <p className="text-muted-foreground mb-4">Preview do painel de contadores está disponível.</p>
                  <Button onClick={() => window.open('/contador', '_blank')}>
                    Abrir em nova aba
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      {/* Floating AI Agent - Analytics for Admin */}
      <FloatingAIAgent context="admin" />
    </div>
  );
};

export default AdminPanel;
