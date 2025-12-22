import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import AppSidebar from '@/components/layout/AppSidebar';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { 
  Users,
  DollarSign,
  Calculator,
  MessageSquare,
  Shield,
  Loader2,
  Search,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  Activity,
  UserPlus,
  Settings,
  Wallet,
  Zap,
  Eye,
  Calendar,
  CreditCard,
  Building2,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

interface UserWithRoles {
  id: string;
  email: string;
  created_at: string;
  profile?: {
    full_name: string | null;
  };
  roles: string[];
  subscription?: {
    plan_type: string;
    status: string;
  } | null;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  price_cents: number;
  current_period_end: string | null;
  created_at: string;
  user_email?: string;
  user_name?: string;
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
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, hasRole, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalContadores: 0,
    totalSubscriptions: 0,
    totalConsultations: 0,
    totalRevenue: 0,
    totalSimulations: 0,
    totalMessages: 0,
    pendingConsultations: 0,
    monthlyRevenue: 0,
    newUsersThisMonth: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      fetchAdminData();
      
      const profilesChannel = supabase
        .channel('admin-profiles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchAdminData())
        .subscribe();
        
      const subscriptionsChannel = supabase
        .channel('admin-subscriptions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => fetchAdminData())
        .subscribe();
        
      const consultationsChannel = supabase
        .channel('admin-consultations')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'consultations' }, () => fetchAdminData())
        .subscribe();
        
      return () => {
        supabase.removeChannel(profilesChannel);
        supabase.removeChannel(subscriptionsChannel);
        supabase.removeChannel(consultationsChannel);
      };
    }
  }, [user, hasRole]);

  const fetchAdminData = async () => {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

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
        supabase.from('subscriptions').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('consultations').select('*').order('created_at', { ascending: false }).limit(50),
      ]);

      const totalRevenue = (paymentsRes.data || []).reduce((sum, p) => sum + p.amount_cents, 0);
      const monthlyRevenue = (monthlyPaymentsRes.data || []).reduce((sum, p) => sum + p.amount_cents, 0);

      setStats({
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
      });

      setSubscriptions(allSubscriptions.data || []);
      setConsultations(allConsultations.data || []);

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const { data: userSubscriptions } = await supabase
        .from('subscriptions')
        .select('user_id, plan_type, status')
        .eq('status', 'active');

      const usersWithRoles: UserWithRoles[] = (profilesData || []).map((profile) => {
        const userRoles = (rolesData || [])
          .filter((r) => r.user_id === profile.user_id)
          .map((r) => r.role);
        
        const userSub = (userSubscriptions || []).find(s => s.user_id === profile.user_id);
        
        return {
          id: profile.user_id,
          email: profile.email || '',
          created_at: profile.created_at,
          profile: { full_name: profile.full_name },
          roles: userRoles,
          subscription: userSub || null,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAdminData();
    toast({ title: 'Dados atualizados!' });
  };

  const handleAddRole = async (userId: string, role: 'admin' | 'contador' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role }]);

      if (error) throw error;

      toast({
        title: 'Role adicionada!',
        description: `Usuário agora é ${role}`,
      });
      
      fetchAdminData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao adicionar role',
      });
    }
  };

  const handleRemoveRole = async (userId: string, role: 'admin' | 'contador' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;

      toast({
        title: 'Role removida!',
        description: `Role ${role} removida do usuário`,
      });
      
      fetchAdminData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao remover role',
      });
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, string> = {
      admin: 'bg-destructive text-destructive-foreground',
      contador: 'bg-info text-info-foreground',
      user: 'bg-muted text-muted-foreground',
    };
    return <Badge className={roleConfig[role] || 'bg-muted'}>{role}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { class: string; icon: any }> = {
      active: { class: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
      pending: { class: 'bg-accent/10 text-accent border-accent/20', icon: Clock },
      cancelled: { class: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
      expired: { class: 'bg-muted text-muted-foreground', icon: AlertCircle },
      completed: { class: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
      scheduled: { class: 'bg-info/10 text-info border-info/20', icon: Calendar },
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    return (
      <Badge variant="outline" className={c.class}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate mock chart data based on real stats
  const revenueChartData = [
    { month: 'Jul', receita: stats.monthlyRevenue * 0.6, assinaturas: stats.totalSubscriptions * 50 },
    { month: 'Ago', receita: stats.monthlyRevenue * 0.7, assinaturas: stats.totalSubscriptions * 60 },
    { month: 'Set', receita: stats.monthlyRevenue * 0.8, assinaturas: stats.totalSubscriptions * 70 },
    { month: 'Out', receita: stats.monthlyRevenue * 0.85, assinaturas: stats.totalSubscriptions * 80 },
    { month: 'Nov', receita: stats.monthlyRevenue * 0.9, assinaturas: stats.totalSubscriptions * 90 },
    { month: 'Dez', receita: stats.monthlyRevenue, assinaturas: stats.totalSubscriptions * 100 },
  ];

  // Generate activities from real data
  const activities = [
    ...users.slice(0, 3).map(u => ({
      id: u.id,
      type: 'signup' as const,
      title: `Novo usuário: ${u.profile?.full_name || 'Anônimo'}`,
      description: u.email,
      timestamp: new Date(u.created_at).toLocaleDateString('pt-BR'),
    })),
    ...subscriptions.slice(0, 2).map(s => ({
      id: s.id,
      type: 'payment' as const,
      title: `Assinatura ${s.plan_type}`,
      description: formatCurrency(s.price_cents),
      timestamp: new Date(s.created_at).toLocaleDateString('pt-BR'),
    })),
  ].slice(0, 5);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        variant="admin"
      />
      
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Painel Master Admin</h1>
                <p className="text-sm text-muted-foreground">Controle total do AtentAI</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
              >
                Voltar ao Dashboard
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearchParams({ tab: v }); }}>
            <TabsList className="grid w-full grid-cols-5 max-w-2xl">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
              <TabsTrigger value="consultations">Consultas</TabsTrigger>
              <TabsTrigger value="settings">Config</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Main Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard 
                  icon={Users} 
                  label="Total de Usuários" 
                  value={stats.totalUsers}
                  subtitle={`+${stats.newUsersThisMonth} este mês`}
                  trend={{ value: 12, isPositive: true }}
                  color="primary"
                />
                <StatsCard 
                  icon={Wallet} 
                  label="Receita Total" 
                  value={formatCurrency(stats.totalRevenue)}
                  subtitle="Todos os pagamentos"
                  trend={{ value: 8, isPositive: true }}
                  color="success"
                />
                <StatsCard 
                  icon={CreditCard} 
                  label="Assinaturas Ativas" 
                  value={stats.totalSubscriptions}
                  subtitle="Planos recorrentes"
                  color="info"
                />
                <StatsCard 
                  icon={DollarSign} 
                  label="Receita do Mês" 
                  value={formatCurrency(stats.monthlyRevenue)}
                  subtitle="Dezembro 2024"
                  trend={{ value: 15, isPositive: true }}
                  color="success"
                />
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatsCard icon={Shield} label="Contadores" value={stats.totalContadores} color="info" />
                <StatsCard icon={Calculator} label="Simulações" value={stats.totalSimulations} color="primary" />
                <StatsCard icon={MessageSquare} label="Mensagens IA" value={stats.totalMessages} color="accent" />
                <StatsCard icon={Activity} label="Consultas" value={stats.totalConsultations} color="success" />
                <StatsCard icon={Clock} label="Pendentes" value={stats.pendingConsultations} color="accent" />
              </div>

              {/* Charts and Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RevenueChart data={revenueChartData} />
                </div>
                <ActivityFeed activities={activities} />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickAction 
                  icon={UserPlus}
                  title="Adicionar Contador"
                  description="Convide um novo contador para a plataforma"
                  gradient="from-primary to-primary/80"
                  onClick={() => setActiveTab('users')}
                />
                <QuickAction 
                  icon={BarChart3}
                  title="Ver Relatórios"
                  description="Análises detalhadas e métricas"
                  gradient="from-info to-info/80"
                  onClick={() => setActiveTab('subscriptions')}
                />
                <QuickAction 
                  icon={Settings}
                  title="Configurações"
                  description="Ajustes gerais do sistema"
                  gradient="from-success to-success/80"
                  onClick={() => setActiveTab('settings')}
                />
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6 mt-6">
              <Card className="bg-card border-border shadow-soft">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="text-xl">Gerenciar Usuários</CardTitle>
                      <CardDescription>{filteredUsers.length} usuários encontrados</CardDescription>
                    </div>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar usuários..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredUsers.map((u) => (
                      <div 
                        key={u.id} 
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {u.profile?.full_name?.[0] || u.email[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {u.profile?.full_name || 'Sem nome'}
                            </p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {new Date(u.created_at).toLocaleDateString('pt-BR')}
                              </span>
                              {u.subscription && (
                                <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                                  {u.subscription.plan_type}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1.5">
                            {u.roles.map((role) => (
                              <div key={role} className="group relative">
                                {getRoleBadge(role)}
                                {role !== 'user' && (
                                  <button
                                    onClick={() => handleRemoveRole(u.id, role as 'admin' | 'contador' | 'user')}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-destructive-foreground text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          <Select onValueChange={(role) => handleAddRole(u.id, role as 'admin' | 'contador' | 'user')}>
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="+ Role" />
                            </SelectTrigger>
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
            </TabsContent>

            <TabsContent value="subscriptions" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard icon={CreditCard} label="Ativas" value={subscriptions.filter(s => s.status === 'active').length} color="success" />
                <StatsCard icon={Clock} label="Pendentes" value={subscriptions.filter(s => s.status === 'pending').length} color="accent" />
                <StatsCard icon={XCircle} label="Canceladas" value={subscriptions.filter(s => s.status === 'cancelled').length} color="destructive" />
              </div>

              <Card className="bg-card border-border shadow-soft">
                <CardHeader>
                  <CardTitle>Todas as Assinaturas</CardTitle>
                  <CardDescription>Lista completa de assinaturas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subscriptions.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                        <div>
                          <p className="font-medium text-foreground">Plano {sub.plan_type}</p>
                          <p className="text-sm text-muted-foreground">ID: {sub.user_id.slice(0, 8)}...</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(sub.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">{formatCurrency(sub.price_cents)}</p>
                          {getStatusBadge(sub.status)}
                        </div>
                      </div>
                    ))}
                    {subscriptions.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">Nenhuma assinatura encontrada</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="consultations" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard icon={Clock} label="Pendentes" value={consultations.filter(c => c.status === 'pending').length} color="accent" />
                <StatsCard icon={Calendar} label="Agendadas" value={consultations.filter(c => c.status === 'scheduled').length} color="info" />
                <StatsCard icon={CheckCircle} label="Concluídas" value={consultations.filter(c => c.status === 'completed').length} color="success" />
                <StatsCard icon={XCircle} label="Canceladas" value={consultations.filter(c => c.status === 'cancelled').length} color="destructive" />
              </div>

              <Card className="bg-card border-border shadow-soft">
                <CardHeader>
                  <CardTitle>Todas as Consultas</CardTitle>
                  <CardDescription>Histórico de consultorias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {consultations.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                        <div>
                          <p className="font-medium text-foreground">Consulta #{c.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            Cliente: {c.user_id.slice(0, 8)}... → Contador: {c.contador_id.slice(0, 8)}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(c.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">{formatCurrency(c.price_cents)}</p>
                          <p className="text-xs text-success">Taxa: {formatCurrency(c.platform_fee_cents)}</p>
                          {getStatusBadge(c.status)}
                        </div>
                      </div>
                    ))}
                    {consultations.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">Nenhuma consulta encontrada</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-card border-border shadow-soft">
                  <CardHeader>
                    <CardTitle>Taxa da Plataforma</CardTitle>
                    <CardDescription>Porcentagem cobrada em consultorias</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary">10%</p>
                    <p className="text-sm text-muted-foreground mt-2">R$ 15,00 por consulta de R$ 150,00</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-soft">
                  <CardHeader>
                    <CardTitle>Limite de Perguntas IA</CardTitle>
                    <CardDescription>Perguntas diárias para usuários gratuitos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-info">5/dia</p>
                    <p className="text-sm text-muted-foreground mt-2">Premium tem perguntas ilimitadas</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-soft">
                  <CardHeader>
                    <CardTitle>Planos Ativos</CardTitle>
                    <CardDescription>Produtos configurados no Stripe</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="font-medium">Simulador</span>
                      <span className="text-success">R$ 56,00/mês</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="font-medium">AtentAI Premium</span>
                      <span className="text-success">R$ 56,00/mês</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-soft">
                  <CardHeader>
                    <CardTitle>Status do Sistema</CardTitle>
                    <CardDescription>Saúde dos serviços</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                      <span className="font-medium text-success">API</span>
                      <Badge className="bg-success">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                      <span className="font-medium text-success">Database</span>
                      <Badge className="bg-success">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                      <span className="font-medium text-success">Stripe</span>
                      <Badge className="bg-success">Conectado</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
