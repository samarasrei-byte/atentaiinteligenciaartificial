import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Calculator, 
  Users, 
  CreditCard, 
  LogOut, 
  MessageSquare, 
  FileText,
  Settings,
  Crown,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, roles, signOut, loading, hasRole } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<any>(null);
  const [stats, setStats] = useState({
    simulations: 0,
    aiChats: 0,
    consultations: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .single();
      
      setSubscription(subData);

      // Fetch stats
      const [simRes, chatRes, consultRes] = await Promise.all([
        supabase.from('tax_simulations').select('id', { count: 'exact' }).eq('user_id', user!.id),
        supabase.from('ai_chat_messages').select('id', { count: 'exact' }).eq('user_id', user!.id).eq('role', 'user'),
        supabase.from('consultations').select('id', { count: 'exact' }).eq('user_id', user!.id),
      ]);

      setStats({
        simulations: simRes.count || 0,
        aiChats: chatRes.count || 0,
        consultations: consultRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Até logo!',
      description: 'Você saiu da sua conta',
    });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  const getPlanBadge = () => {
    if (!subscription) return <Badge variant="outline" className="border-slate-500 text-slate-400">Sem Plano</Badge>;
    
    const planColors: Record<string, string> = {
      basic: 'bg-slate-600',
      ai: 'bg-teal-600',
      contador: 'bg-blue-600',
      premium: 'bg-gradient-to-r from-amber-500 to-orange-500',
    };
    
    const planNames: Record<string, string> = {
      basic: 'Básico',
      ai: 'IA',
      contador: 'Contador',
      premium: 'Premium',
    };
    
    return (
      <Badge className={`${planColors[subscription.plan_type] || planColors.basic}`}>
        {planNames[subscription.plan_type] || 'Básico'}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-teal-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
              AITENTO
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {hasRole('admin') && (
              <Button
                variant="ghost"
                onClick={() => navigate('/admin')}
                className="text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            )}
            {hasRole('contador') && (
              <Button
                variant="ghost"
                onClick={() => navigate('/contador')}
                className="text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Painel Contador
              </Button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-slate-300">{profile?.full_name || user?.email}</span>
              {getPlanBadge()}
            </div>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Olá, {profile?.full_name?.split(' ')[0] || 'Usuário'}! 👋
          </h1>
          <p className="text-slate-400">
            Bem-vindo ao seu painel de controle da Reforma Tributária
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-slate-300">Simulações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-400">{stats.simulations}</div>
              <p className="text-sm text-slate-400">Simulações realizadas</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-slate-300">Conversas IA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-400">{stats.aiChats}</div>
              <p className="text-sm text-slate-400">Mensagens enviadas</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-slate-300">Consultorias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{stats.consultations}</div>
              <p className="text-sm text-slate-400">Sessões com contadores</p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* AI Chat */}
          <Card className="bg-slate-800/50 border-slate-700 hover:border-teal-500 transition-colors cursor-pointer group"
                onClick={() => navigate('/ai-chat')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <MessageSquare className="h-10 w-10 text-teal-400 group-hover:scale-110 transition-transform" />
                {!subscription?.plan_type?.includes('ai') && !subscription?.plan_type?.includes('premium') && (
                  <Badge className="bg-amber-500">Premium</Badge>
                )}
              </div>
              <CardTitle className="text-xl text-white">Chat com IA</CardTitle>
              <CardDescription className="text-slate-400">
                Tire suas dúvidas sobre a Reforma Tributária com nossa IA especializada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-400">R$ 50/mês</div>
            </CardContent>
          </Card>

          {/* Tax Simulator */}
          <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500 transition-colors cursor-pointer group"
                onClick={() => navigate('/simulator')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Calculator className="h-10 w-10 text-cyan-400 group-hover:scale-110 transition-transform" />
                {!subscription && (
                  <Badge className="bg-amber-500">Premium</Badge>
                )}
              </div>
              <CardTitle className="text-xl text-white">Simulador de Impostos</CardTitle>
              <CardDescription className="text-slate-400">
                Compare seus impostos antes e depois da reforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">R$ 30/mês</div>
            </CardContent>
          </Card>

          {/* Contador */}
          <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition-colors cursor-pointer group"
                onClick={() => navigate('/contadores')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Users className="h-10 w-10 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-xl text-white">Consultar Contador</CardTitle>
              <CardDescription className="text-slate-400">
                Agende uma sessão com um contador especializado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">R$ 150/sessão</div>
              <p className="text-sm text-slate-400">10% vai para a plataforma</p>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card className="bg-slate-800/50 border-slate-700 hover:border-amber-500 transition-colors cursor-pointer group"
                onClick={() => navigate('/pricing')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Crown className="h-10 w-10 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-xl text-white">Assinatura</CardTitle>
              <CardDescription className="text-slate-400">
                Gerencie sua assinatura e desbloqueie recursos premium
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="text-sm text-slate-300">
                  Plano ativo: <span className="text-amber-400 font-semibold">{subscription.plan_type}</span>
                </div>
              ) : (
                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                  Assinar Agora
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Payments */}
          <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500 transition-colors cursor-pointer group"
                onClick={() => navigate('/payments')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CreditCard className="h-10 w-10 text-green-400 group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-xl text-white">Pagamentos</CardTitle>
              <CardDescription className="text-slate-400">
                Histórico de pagamentos e faturas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Veja seu histórico completo de transações
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
