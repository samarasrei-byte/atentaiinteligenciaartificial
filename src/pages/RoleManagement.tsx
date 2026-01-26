import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import AppSidebar from '@/components/layout/AppSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Shield, Users, Search, Loader2, UserPlus, UserMinus, 
  Crown, Calculator, User, RefreshCw, CheckCircle, XCircle, Menu,
  Building2
} from 'lucide-react';

type AppRole = 'admin' | 'contador' | 'user' | 'autonomo' | 'affiliate';

interface UserWithRoles {
  user_id: string;
  email: string;
  full_name: string | null;
  roles: AppRole[];
  created_at: string;
}

const roleConfig: Record<AppRole, { label: string; color: string; icon: any; description: string }> = {
  admin: {
    label: 'Administrador',
    color: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: Crown,
    description: 'Acesso total ao sistema'
  },
  contador: {
    label: 'Contador',
    color: 'bg-info/10 text-info border-info/20',
    icon: Calculator,
    description: 'Consultorias e painel contador'
  },
  autonomo: {
    label: 'Autônomo',
    color: 'bg-primary/10 text-primary border-primary/20',
    icon: User,
    description: 'Simulador e gestão financeira'
  },
  affiliate: {
    label: 'Afiliado',
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    icon: Users,
    description: 'Programa de afiliados e cupons'
  },
  user: {
    label: 'Empresa',
    color: 'bg-muted text-muted-foreground border-muted',
    icon: Building2,
    description: 'Acesso empresa/usuário padrão'
  },
};

const RoleManagement = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, hasRole, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'add' | 'remove';
    userId: string;
    role: AppRole;
    userName: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
      fetchUsers();
    }
  }, [user, hasRole]);

  const fetchUsers = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const usersWithRoles: UserWithRoles[] = (profilesData || []).map((profile) => ({
        user_id: profile.user_id,
        email: profile.email || '',
        full_name: profile.full_name,
        created_at: profile.created_at,
        roles: (rolesData || [])
          .filter((r) => r.user_id === profile.user_id)
          .map((r) => r.role as AppRole),
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao carregar usuários' });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleAddRole = async () => {
    if (!pendingAction || pendingAction.type !== 'add') return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: pendingAction.userId, role: pendingAction.role }]);

      if (error) {
        if (error.code === '23505') {
          toast({ variant: 'destructive', title: 'Erro', description: 'Usuário já possui essa role' });
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Role adicionada!',
          description: `${roleConfig[pendingAction.role].label} adicionado para ${pendingAction.userName}`,
        });
        fetchUsers();
      }
    } catch (error) {
      console.error('Error adding role:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao adicionar role' });
    } finally {
      setIsProcessing(false);
      setPendingAction(null);
    }
  };

  const handleRemoveRole = async () => {
    if (!pendingAction || pendingAction.type !== 'remove') return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', pendingAction.userId)
        .eq('role', pendingAction.role);

      if (error) throw error;

      toast({
        title: 'Role removida!',
        description: `${roleConfig[pendingAction.role].label} removido de ${pendingAction.userName}`,
      });
      fetchUsers();
    } catch (error) {
      console.error('Error removing role:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao remover role' });
    } finally {
      setIsProcessing(false);
      setPendingAction(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUsers();
    toast({ title: 'Dados atualizados!' });
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'roles') return;
    navigate(`/admin?tab=${tab}`);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    admins: users.filter(u => u.roles.includes('admin')).length,
    contadores: users.filter(u => u.roles.includes('contador')).length,
    autonomos: users.filter(u => u.roles.includes('autonomo')).length,
    affiliates: users.filter(u => u.roles.includes('affiliate')).length,
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />}
      <div className="hidden lg:block">
        <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} variant="admin" activeTab="roles" onTabChange={handleTabChange} />
      </div>
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <AppSidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} variant="admin" activeTab="roles" onTabChange={handleTabChange} />
      </div>

      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56'}`}>
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div className="p-2 rounded-xl bg-destructive/10 hidden sm:flex">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h1 className="text-lg lg:text-2xl font-bold">Gestão de Roles</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">Gerencie permissões de acesso</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </header>

        <div className="p-4 lg:p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total Usuários</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <Crown className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.admins}</p>
                    <p className="text-xs text-muted-foreground">Admins</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-info/10">
                    <Calculator className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.contadores}</p>
                    <p className="text-xs text-muted-foreground">Contadores</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.autonomos}</p>
                    <p className="text-xs text-muted-foreground">Autônomos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Users className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.affiliates}</p>
                    <p className="text-xs text-muted-foreground">Afiliados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Role Legend */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {(Object.entries(roleConfig) as [AppRole, typeof roleConfig.admin][]).map(([role, config]) => {
              const Icon = config.icon;
              return (
                <Card key={role} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${config.color.split(' ')[0]}`}>
                        <Icon className={`h-5 w-5 ${config.color.split(' ')[1]}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{config.label}</h3>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Users List */}
          <Card className="bg-card border-border shadow-soft">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Usuários ({filteredUsers.length})
                  </CardTitle>
                  <CardDescription>
                    Clique nas roles para adicionar ou remover permissões
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence>
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum usuário encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredUsers.map((userItem, index) => (
                      <motion.div
                        key={userItem.user_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/30 rounded-xl border border-border hover:border-primary/30 transition-colors"
                      >
                        {/* User Info */}
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                            <span className="text-lg font-bold text-primary-foreground">
                              {userItem.full_name?.[0] || userItem.email[0]?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{userItem.full_name || 'Sem nome'}</p>
                            <p className="text-sm text-muted-foreground">{userItem.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Cadastrado em {new Date(userItem.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>

                        {/* Roles Management */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Current Roles */}
                          {userItem.roles.map((role) => {
                            const config = roleConfig[role];
                            const Icon = config.icon;
                            return (
                              <Badge
                                key={role}
                                variant="outline"
                                className={`${config.color} cursor-pointer hover:opacity-80 transition-opacity`}
                                onClick={() =>
                                  setPendingAction({
                                    type: 'remove',
                                    userId: userItem.user_id,
                                    role,
                                    userName: userItem.full_name || userItem.email,
                                  })
                                }
                              >
                                <Icon className="h-3 w-3 mr-1" />
                                {config.label}
                                <XCircle className="h-3 w-3 ml-1 opacity-60" />
                              </Badge>
                            );
                          })}

                          {/* Add Role Buttons */}
                          {(['admin', 'contador', 'autonomo', 'affiliate', 'user'] as AppRole[])
                            .filter((role) => !userItem.roles.includes(role))
                            .map((role) => {
                              const config = roleConfig[role];
                              const Icon = config.icon;
                              return (
                                <Button
                                  key={role}
                                  variant="outline"
                                  size="sm"
                                  className="border-dashed"
                                  onClick={() =>
                                    setPendingAction({
                                      type: 'add',
                                      userId: userItem.user_id,
                                      role,
                                      userName: userItem.full_name || userItem.email,
                                    })
                                  }
                                >
                                  <UserPlus className="h-3 w-3 mr-1" />
                                  {config.label}
                                </Button>
                              );
                            })}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!pendingAction} onOpenChange={() => setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {pendingAction?.type === 'add' ? (
                <>
                  <UserPlus className="h-5 w-5 text-primary" />
                  Adicionar Role
                </>
              ) : (
                <>
                  <UserMinus className="h-5 w-5 text-destructive" />
                  Remover Role
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === 'add' ? (
                <>
                  Deseja adicionar a role{' '}
                  <span className="font-semibold text-primary">
                    {pendingAction && roleConfig[pendingAction.role].label}
                  </span>{' '}
                  para{' '}
                  <span className="font-semibold">{pendingAction?.userName}</span>?
                </>
              ) : (
                <>
                  Deseja remover a role{' '}
                  <span className="font-semibold text-destructive">
                    {pendingAction && roleConfig[pendingAction.role].label}
                  </span>{' '}
                  de{' '}
                  <span className="font-semibold">{pendingAction?.userName}</span>?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={pendingAction?.type === 'add' ? handleAddRole : handleRemoveRole}
              disabled={isProcessing}
              className={pendingAction?.type === 'add' ? '' : 'bg-destructive hover:bg-destructive/90'}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : pendingAction?.type === 'add' ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoleManagement;
