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
  Loader2,
  Building2,
  TrendingUp,
  MapPin,
  Edit
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CompanyOnboarding from '@/components/onboarding/CompanyOnboarding';

interface Company {
  id: string;
  company_name: string;
  trade_name: string | null;
  company_type: string;
  tax_regime: string;
  sector: string;
  monthly_revenue_cents: number;
  employee_count: number;
  state: string | null;
  city: string | null;
  onboarding_completed: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, roles, signOut, loading, hasRole } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<any>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
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
      // Fetch company
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      
      if (companyData) {
        setCompany(companyData);
        setShowOnboarding(!companyData.onboarding_completed);
      } else {
        setShowOnboarding(true);
      }

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
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    fetchUserData();
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Até logo!',
      description: 'Você saiu da sua conta',
    });
    navigate('/');
  };

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  // Show onboarding if no company data
  if (showOnboarding) {
    return <CompanyOnboarding onComplete={handleOnboardingComplete} />;
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

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const getCompanyTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      mei: 'MEI',
      me: 'ME',
      epp: 'EPP',
      ltda: 'LTDA',
      eireli: 'EIRELI',
      sa_fechada: 'S.A. Fechada',
      sa_aberta: 'S.A. Aberta',
      cooperativa: 'Cooperativa',
    };
    return types[type] || type;
  };

  const getTaxRegimeLabel = (regime: string) => {
    const regimes: Record<string, string> = {
      simples_nacional: 'Simples Nacional',
      lucro_presumido: 'Lucro Presumido',
      lucro_real: 'Lucro Real',
      lucro_arbitrado: 'Lucro Arbitrado',
    };
    return regimes[regime] || regime;
  };

  const getSectorLabel = (sector: string) => {
    const sectors: Record<string, string> = {
      comercio: 'Comércio',
      servicos: 'Serviços',
      industria: 'Indústria',
      agronegocio: 'Agronegócio',
      tecnologia: 'Tecnologia',
      saude: 'Saúde',
      educacao: 'Educação',
      construcao: 'Construção',
      transporte: 'Transporte',
      alimentacao: 'Alimentação',
      outro: 'Outro',
    };
    return sectors[sector] || sector;
  };

  // TEMPORARY: Allow access to all features for testing
  const hasAccess = true; // Remove this and use subscription checks in production

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
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
              <span className="text-slate-300 hidden md:inline">{profile?.full_name || user?.email}</span>
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
        {/* Welcome & Company Info */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Olá, {profile?.full_name?.split(' ')[0] || 'Usuário'}! 👋
          </h1>
          <p className="text-slate-400">
            Bem-vindo ao seu painel de controle da Reforma Tributária
          </p>
        </div>

        {/* Company Card */}
        {company && (
          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-700/50 border-slate-600 mb-8">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-teal-500/20">
                    <Building2 className="h-6 w-6 text-teal-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">{company.company_name}</CardTitle>
                    {company.trade_name && (
                      <CardDescription className="text-slate-400">{company.trade_name}</CardDescription>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOnboarding(true)}
                  className="text-slate-400 hover:text-white"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-teal-500/50 text-teal-400">
                    {getCompanyTypeLabel(company.company_type)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm">{getTaxRegimeLabel(company.tax_regime)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-sm">{formatCurrency(company.monthly_revenue_cents)}/mês</span>
                </div>
                {company.state && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="h-4 w-4 text-amber-400" />
                    <span className="text-sm">{company.city ? `${company.city}/${company.state}` : company.state}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-600/50">
                <p className="text-sm text-slate-400">
                  Setor: <span className="text-slate-300">{getSectorLabel(company.sector)}</span>
                  {company.employee_count > 0 && (
                    <> • {company.employee_count} funcionário{company.employee_count > 1 ? 's' : ''}</>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

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
        <h2 className="text-xl font-semibold text-white mb-4">Recursos Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* AI Chat */}
          <Card className="bg-slate-800/50 border-slate-700 hover:border-teal-500 transition-colors cursor-pointer group"
                onClick={() => navigate('/ai-chat')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <MessageSquare className="h-10 w-10 text-teal-400 group-hover:scale-110 transition-transform" />
                {hasAccess && (
                  <Badge className="bg-green-500">Liberado</Badge>
                )}
              </div>
              <CardTitle className="text-xl text-white">Chat com IA</CardTitle>
              <CardDescription className="text-slate-400">
                Tire suas dúvidas sobre a Reforma Tributária com nossa IA especializada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                Iniciar Conversa
              </Button>
            </CardContent>
          </Card>

          {/* Tax Simulator */}
          <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500 transition-colors cursor-pointer group"
                onClick={() => navigate('/simulator')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Calculator className="h-10 w-10 text-cyan-400 group-hover:scale-110 transition-transform" />
                {hasAccess && (
                  <Badge className="bg-green-500">Liberado</Badge>
                )}
              </div>
              <CardTitle className="text-xl text-white">Simulador de Impostos</CardTitle>
              <CardDescription className="text-slate-400">
                Compare seus impostos antes e depois da reforma tributária
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                Simular Agora
              </Button>
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
                  Ver Planos
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Company Settings */}
          <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500 transition-colors cursor-pointer group"
                onClick={() => setShowOnboarding(true)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Building2 className="h-10 w-10 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-xl text-white">Dados da Empresa</CardTitle>
              <CardDescription className="text-slate-400">
                Atualize as informações da sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                Editar Dados
              </Button>
            </CardContent>
          </Card>

          {/* Payments */}
          <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500 transition-colors cursor-pointer group">
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
