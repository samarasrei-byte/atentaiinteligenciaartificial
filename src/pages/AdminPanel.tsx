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
import AppSidebar from '@/components/layout/AppSidebar';
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
} from 'lucide-react';

interface UserWithRoles {
  id: string;
  email: string;
  created_at: string;
  profile?: {
    full_name: string | null;
  };
  roles: string[];
}

interface StatsData {
  totalUsers: number;
  totalContadores: number;
  totalSubscriptions: number;
  totalConsultations: number;
  totalRevenue: number;
  totalSimulations: number;
  totalMessages: number;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, hasRole, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalContadores: 0,
    totalSubscriptions: 0,
    totalConsultations: 0,
    totalRevenue: 0,
    totalSimulations: 0,
    totalMessages: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

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
      
      // Setup realtime subscriptions for admin data
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
      const [
        profilesRes,
        contadorRes,
        subscriptionsRes,
        consultationsRes,
        paymentsRes,
        simulationsRes,
        messagesRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('contador_profiles').select('id', { count: 'exact' }),
        supabase.from('subscriptions').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('consultations').select('id, price_cents', { count: 'exact' }).eq('status', 'completed'),
        supabase.from('payments').select('amount_cents').eq('status', 'completed'),
        supabase.from('tax_simulations').select('id', { count: 'exact' }),
        supabase.from('ai_chat_messages').select('id', { count: 'exact' }),
      ]);

      const totalRevenue = (paymentsRes.data || []).reduce((sum, p) => sum + p.amount_cents, 0);

      setStats({
        totalUsers: profilesRes.count || 0,
        totalContadores: contadorRes.count || 0,
        totalSubscriptions: subscriptionsRes.count || 0,
        totalConsultations: consultationsRes.count || 0,
        totalRevenue,
        totalSimulations: simulationsRes.count || 0,
        totalMessages: messagesRes.count || 0,
      });

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const usersWithRoles: UserWithRoles[] = (profilesData || []).map((profile) => {
        const userRoles = (rolesData || [])
          .filter((r) => r.user_id === profile.user_id)
          .map((r) => r.role);
        
        return {
          id: profile.user_id,
          email: profile.email || '',
          created_at: profile.created_at,
          profile: { full_name: profile.full_name },
          roles: userRoles,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
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

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statsCards = [
    { icon: Users, label: 'Usuários', value: stats.totalUsers, color: 'text-primary', bgColor: 'bg-primary/10' },
    { icon: Shield, label: 'Contadores', value: stats.totalContadores, color: 'text-info', bgColor: 'bg-info/10' },
    { icon: TrendingUp, label: 'Assinaturas', value: stats.totalSubscriptions, color: 'text-success', bgColor: 'bg-success/10' },
    { icon: Activity, label: 'Consultas', value: stats.totalConsultations, color: 'text-accent', bgColor: 'bg-accent/10' },
    { icon: Wallet, label: 'Receita', value: formatCurrency(stats.totalRevenue), color: 'text-success', bgColor: 'bg-success/10', isLarge: true },
    { icon: Calculator, label: 'Simulações', value: stats.totalSimulations, color: 'text-info', bgColor: 'bg-info/10' },
    { icon: MessageSquare, label: 'Mensagens IA', value: stats.totalMessages, color: 'text-primary', bgColor: 'bg-primary/10' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        variant="admin"
      />
      
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
                <p className="text-sm text-muted-foreground">Gerencie usuários e monitore métricas</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {statsCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="bg-card border-border shadow-soft">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className={`font-bold ${stat.isLarge ? 'text-lg' : 'text-xl'} text-foreground`}>
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/10">
                  <UserPlus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Adicionar Contador</h3>
                  <p className="text-sm opacity-80">Convide um novo contador</p>
                </div>
                <ArrowUpRight className="ml-auto h-5 w-5 opacity-60" />
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-info to-info/80 text-info-foreground cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/10">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Ver Relatórios</h3>
                  <p className="text-sm opacity-80">Análises detalhadas</p>
                </div>
                <ArrowUpRight className="ml-auto h-5 w-5 opacity-60" />
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-success to-success/80 text-success-foreground cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/10">
                  <Settings className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Configurações</h3>
                  <p className="text-sm opacity-80">Ajustes do sistema</p>
                </div>
                <ArrowUpRight className="ml-auto h-5 w-5 opacity-60" />
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card className="bg-card border-border shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-xl">Gerenciar Usuários</CardTitle>
                  <CardDescription>Visualize e gerencie roles dos usuários</CardDescription>
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
                        <p className="text-xs text-muted-foreground">
                          Cadastro: {new Date(u.created_at).toLocaleDateString('pt-BR')}
                        </p>
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
                          <SelectValue placeholder="Adicionar role" />
                        </SelectTrigger>
                        <SelectContent>
                          {!u.roles.includes('admin') && (
                            <SelectItem value="admin">Admin</SelectItem>
                          )}
                          {!u.roles.includes('contador') && (
                            <SelectItem value="contador">Contador</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card className="bg-card border-border shadow-soft">
            <CardHeader>
              <CardTitle className="text-xl">Configurações do Sistema</CardTitle>
              <CardDescription>Configurações gerais da plataforma Atente Aí</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-muted/30 border-border">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-foreground mb-2">Taxa da Plataforma</h3>
                    <p className="text-3xl font-bold text-primary">10%</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Porcentagem retida em cada consultoria
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-border">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-foreground mb-2">Preços Base</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plano Simulador:</span>
                        <span className="text-foreground font-medium">R$ 30/mês</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plano IA:</span>
                        <span className="text-foreground font-medium">R$ 50/mês</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plano Premium:</span>
                        <span className="text-foreground font-medium">R$ 99/mês</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Consultoria:</span>
                        <span className="text-foreground font-medium">R$ 150/sessão</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
