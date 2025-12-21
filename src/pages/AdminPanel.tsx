import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  ArrowLeft, 
  Settings,
  Users,
  DollarSign,
  Calculator,
  MessageSquare,
  Shield,
  Loader2,
  Search,
  UserPlus,
  TrendingUp
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
  const { user, hasRole, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserWithRoles[]>([]);
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
    }
  }, [user, hasRole]);

  const fetchAdminData = async () => {
    try {
      // Fetch stats
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

      // Fetch users with roles
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
      admin: 'bg-red-500',
      contador: 'bg-blue-500',
      user: 'bg-slate-500',
    };
    return <Badge className={roleConfig[role] || 'bg-slate-500'}>{role}</Badge>;
  };

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-400" />
            <span className="text-xl font-bold text-white">Painel Admin</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-teal-400" />
                <div>
                  <p className="text-xs text-slate-400">Usuários</p>
                  <p className="text-xl font-bold text-white">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-xs text-slate-400">Contadores</p>
                  <p className="text-xl font-bold text-white">{stats.totalContadores}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-xs text-slate-400">Assinaturas</p>
                  <p className="text-xl font-bold text-white">{stats.totalSubscriptions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-xs text-slate-400">Consultas</p>
                  <p className="text-xl font-bold text-white">{stats.totalConsultations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-amber-400" />
                <div>
                  <p className="text-xs text-slate-400">Receita</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-cyan-400" />
                <div>
                  <p className="text-xs text-slate-400">Simulações</p>
                  <p className="text-xl font-bold text-white">{stats.totalSimulations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-teal-400" />
                <div>
                  <p className="text-xs text-slate-400">Mensagens IA</p>
                  <p className="text-xl font-bold text-white">{stats.totalMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="users" className="data-[state=active]:bg-red-600">
              <Users className="h-4 w-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-red-600">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-white">Gerenciar Usuários</CardTitle>
                    <CardDescription className="text-slate-400">
                      Visualize e gerencie roles dos usuários
                    </CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Buscar usuários..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-white">
                          {u.profile?.full_name || 'Sem nome'}
                        </p>
                        <p className="text-sm text-slate-400">{u.email}</p>
                        <p className="text-xs text-slate-500">
                          Cadastro: {new Date(u.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {u.roles.map((role) => (
                            <div key={role} className="group relative">
                              {getRoleBadge(role)}
                              {role !== 'user' && (
                                <button
                                  onClick={() => handleRemoveRole(u.id, role as 'admin' | 'contador' | 'user')}
                                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <Select onValueChange={(role) => handleAddRole(u.id, role as 'admin' | 'contador' | 'user')}>
                          <SelectTrigger className="w-[130px] bg-slate-600 border-slate-500 text-white">
                            <SelectValue placeholder="Adicionar role" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
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
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">Configurações do Sistema</CardTitle>
                <CardDescription className="text-slate-400">
                  Configurações gerais da plataforma AITENTO
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-white mb-2">Taxa da Plataforma</h3>
                      <p className="text-3xl font-bold text-teal-400">10%</p>
                      <p className="text-sm text-slate-400 mt-2">
                        Porcentagem retida em cada consultoria
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-white mb-2">Preços Base</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Plano Simulador:</span>
                          <span className="text-white">R$ 30/mês</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Plano IA:</span>
                          <span className="text-white">R$ 50/mês</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Plano Premium:</span>
                          <span className="text-white">R$ 99/mês</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Consultoria:</span>
                          <span className="text-white">R$ 150/sessão</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-400 text-sm">
                    ⚠️ Para integrar pagamentos reais, é necessário configurar o Stripe.
                    Entre em contato para ativar o sistema de pagamentos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
