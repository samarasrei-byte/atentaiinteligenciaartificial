import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isQAUser, getQAFlags, systemRoutes, getAllRoutes } from '@/lib/qaMode';
import { 
  Shield, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Home,
  Lock,
  CreditCard,
  Users,
  FileText,
  Settings,
  LogOut,
  RefreshCw,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const QADashboard = () => {
  const navigate = useNavigate();
  const { user, roles, subscription, signOut, refreshUserData, checkSubscription } = useAuth();
  const [routeStatus, setRouteStatus] = useState<Record<string, 'ok' | 'error' | 'unknown'>>({});
  const [testing, setTesting] = useState(false);

  // Security check - only QA user can access
  useEffect(() => {
    if (!user) {
      navigate('/test-login');
      return;
    }
    
    if (!isQAUser(user.email)) {
      toast.error('Acesso negado. Apenas usuários QA podem acessar esta página.');
      navigate('/');
      return;
    }
  }, [user, navigate]);

  const qaFlags = getQAFlags(user?.email);

  const handleRefreshData = async () => {
    setTesting(true);
    try {
      await refreshUserData();
      await checkSubscription();
      toast.success('Dados atualizados!');
    } catch (error) {
      toast.error('Erro ao atualizar dados');
    } finally {
      setTesting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const RouteCard = ({ route, category }: { route: any; category: string }) => {
    const status = routeStatus[route.path] || 'unknown';
    
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{route.name}</span>
            {route.role && (
              <Badge variant="outline" className="text-xs">
                {route.role}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{route.path}</p>
        </div>
        <div className="flex items-center gap-2">
          {status === 'ok' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
          {status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
          {status === 'unknown' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(route.path)}
            className="h-8 w-8 p-0"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (!user || !isQAUser(user.email)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold">QA Dashboard</h1>
              <p className="text-xs text-muted-foreground">Ambiente de Testes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleRefreshData}
              disabled={testing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" variant="destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* User Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Usuário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold truncate">{user.email}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {roles.map(role => (
                  <Badge key={role} variant="secondary" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* QA Flags */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings className="w-4 h-4" />
                QA Flags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {Object.entries(qaFlags).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{key}</span>
                  {value ? (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Subscription Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={subscription.subscribed ? 'default' : 'secondary'}>
                    {subscription.subscribed ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plano:</span>
                  <span>{subscription.plan || 'Nenhum'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Past Due:</span>
                  {subscription.isPastDue ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Rotas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Públicas:</span>
                  <span className="font-medium">{systemRoutes.public.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Protegidas:</span>
                  <span className="font-medium">{systemRoutes.protected.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Premium:</span>
                  <span className="font-medium">{systemRoutes.premium.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Por Role:</span>
                  <span className="font-medium">{systemRoutes.roleBased.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Routes Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Navegação de Rotas
            </CardTitle>
            <CardDescription>
              Clique em qualquer rota para navegar diretamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="public" className="w-full">
              <TabsList className="grid grid-cols-3 lg:grid-cols-6 mb-4">
                <TabsTrigger value="public" className="text-xs">
                  <Home className="w-3 h-3 mr-1" />
                  Públicas
                </TabsTrigger>
                <TabsTrigger value="protected" className="text-xs">
                  <Lock className="w-3 h-3 mr-1" />
                  Protegidas
                </TabsTrigger>
                <TabsTrigger value="plans" className="text-xs">
                  <CreditCard className="w-3 h-3 mr-1" />
                  Planos
                </TabsTrigger>
                <TabsTrigger value="premium" className="text-xs">
                  💎 Premium
                </TabsTrigger>
                <TabsTrigger value="roles" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  Por Role
                </TabsTrigger>
                <TabsTrigger value="onboarding" className="text-xs">
                  🎯 Onboarding
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[400px]">
                <TabsContent value="public" className="space-y-2 mt-0">
                  {systemRoutes.public.map(route => (
                    <RouteCard key={route.path} route={route} category="public" />
                  ))}
                </TabsContent>

                <TabsContent value="protected" className="space-y-2 mt-0">
                  {systemRoutes.protected.map(route => (
                    <RouteCard key={route.path} route={route} category="protected" />
                  ))}
                </TabsContent>

                <TabsContent value="plans" className="space-y-2 mt-0">
                  {systemRoutes.plans.map(route => (
                    <RouteCard key={route.path} route={route} category="plans" />
                  ))}
                </TabsContent>

                <TabsContent value="premium" className="space-y-2 mt-0">
                  {systemRoutes.premium.map(route => (
                    <RouteCard key={route.path} route={route} category="premium" />
                  ))}
                </TabsContent>

                <TabsContent value="roles" className="space-y-2 mt-0">
                  {systemRoutes.roleBased.map(route => (
                    <RouteCard key={route.path} route={route} category="roles" />
                  ))}
                </TabsContent>

                <TabsContent value="onboarding" className="space-y-2 mt-0">
                  {systemRoutes.onboarding.map(route => (
                    <RouteCard key={route.path} route={route} category="onboarding" />
                  ))}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/empresa')}>
                Painel Empresa
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/autonomo')}>
                Painel Autônomo
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/contador')}>
                Painel Contador
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/parceiro')}>
                Painel Parceiro
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                Painel Admin
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                Dashboard Router
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-semibold text-amber-700">Aviso de Segurança</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Esta página é exclusiva para testes e não é indexada</li>
                  <li>• O usuário QA não conta para métricas de negócio</li>
                  <li>• Pagamentos e webhooks estão desabilitados para este usuário</li>
                  <li>• Todas as ações são isoladas do ambiente de produção</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default QADashboard;
