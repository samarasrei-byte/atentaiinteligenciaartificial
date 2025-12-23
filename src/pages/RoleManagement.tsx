import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
  Shield, Users, Search, Loader2, ArrowLeft, UserPlus, UserMinus, 
  Crown, Calculator, User, RefreshCw, CheckCircle, XCircle,
} from 'lucide-react';

type AppRole = 'admin' | 'contador' | 'user';

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
    color: 'bg-red-500/20 text-red-500 border-red-500/30',
    icon: Crown,
    description: 'Acesso total ao sistema, pode gerenciar usuários e configurações'
  },
  contador: {
    label: 'Contador',
    color: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    icon: Calculator,
    description: 'Pode realizar consultorias e acessar o painel do contador'
  },
  user: {
    label: 'Usuário',
    color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    icon: User,
    description: 'Acesso básico às funcionalidades do sistema'
  },
};

const RoleManagement = () => {
  const navigate = useNavigate();
  const { user, hasRole, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
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
      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine data
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

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 px-4 lg:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin')}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/10">
                <Shield className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-white">Gestão de Roles</h1>
                <p className="text-sm text-slate-400">Gerencie permissões de acesso dos usuários</p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-slate-600 text-slate-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Role Legend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.entries(roleConfig) as [AppRole, typeof roleConfig.admin][]).map(([role, config]) => {
            const Icon = config.icon;
            return (
              <Card key={role} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${config.color.split(' ')[0]}`}>
                      <Icon className={`h-5 w-5 ${config.color.split(' ')[1]}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{config.label}</h3>
                      <p className="text-sm text-slate-400">{config.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Users List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-teal-400" />
                  Usuários ({filteredUsers.length})
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Clique nas roles para adicionar ou remover permissões
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum usuário encontrado</p>
                </div>
              ) : (
                filteredUsers.map((userItem) => (
                  <div
                    key={userItem.user_id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50 hover:border-slate-500/50 transition-colors"
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {userItem.full_name?.[0] || userItem.email[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{userItem.full_name || 'Sem nome'}</p>
                        <p className="text-sm text-slate-400">{userItem.email}</p>
                        <p className="text-xs text-slate-500">
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
                      {(['admin', 'contador', 'user'] as AppRole[])
                        .filter((role) => !userItem.roles.includes(role))
                        .map((role) => {
                          const config = roleConfig[role];
                          const Icon = config.icon;
                          return (
                            <Button
                              key={role}
                              variant="outline"
                              size="sm"
                              className="border-dashed border-slate-500 text-slate-400 hover:text-white hover:border-slate-400"
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
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!pendingAction} onOpenChange={() => setPendingAction(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              {pendingAction?.type === 'add' ? (
                <>
                  <UserPlus className="h-5 w-5 text-teal-400" />
                  Adicionar Role
                </>
              ) : (
                <>
                  <UserMinus className="h-5 w-5 text-red-400" />
                  Remover Role
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {pendingAction?.type === 'add' ? (
                <>
                  Deseja adicionar a role{' '}
                  <span className="font-semibold text-teal-400">
                    {pendingAction && roleConfig[pendingAction.role].label}
                  </span>{' '}
                  para{' '}
                  <span className="font-semibold text-white">{pendingAction?.userName}</span>?
                </>
              ) : (
                <>
                  Deseja remover a role{' '}
                  <span className="font-semibold text-red-400">
                    {pendingAction && roleConfig[pendingAction.role].label}
                  </span>{' '}
                  de{' '}
                  <span className="font-semibold text-white">{pendingAction?.userName}</span>?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              disabled={isProcessing}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={pendingAction?.type === 'add' ? handleAddRole : handleRemoveRole}
              disabled={isProcessing}
              className={
                pendingAction?.type === 'add'
                  ? 'bg-teal-600 hover:bg-teal-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
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
