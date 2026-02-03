import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bot,
  Calculator,
  TrendingUp,
  User,
  Crown,
  FileText,
  History,
  MessageSquare,
  Users,
  Settings,
  Home,
  BarChart3,
  HelpCircle,
  Bell,
  Headphones,
  Save,
  Loader2,
  Sparkles,
  Target,
  Wallet,
  Building2,
  Menu,
  LogOut,
  ChevronRight,
  Play,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { brazilianStates } from '@/lib/taxData';
import { PROFESSIONAL_CATEGORIES } from '@/lib/autonomosData';

// Components
import { AutonomoSimulator } from '@/components/autonomos/AutonomoSimulator';
import { AutonomoSimulationHistory } from '@/components/history/AutonomoSimulationHistory';
import { AutonomoAICalculator } from '@/components/ai/AutonomoAICalculator';
import { EmbeddedContadoresList } from '@/components/contadores/EmbeddedContadoresList';
import { SupportTicketList } from '@/components/support/SupportTicketList';
import { TaxGlossary } from '@/components/glossary/TaxGlossary';
import { SubscriptionHistoryCard } from '@/components/subscription/SubscriptionHistoryCard';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { NotificationsPage } from '@/components/notifications/NotificationsPage';
import { ProfessionalChat } from '@/components/chat/ProfessionalChat';
import { GuidedTour } from '@/components/tour/GuidedTour';
import { useGuidedTour } from '@/hooks/useGuidedTour';
import { autonomoTourSteps } from '@/components/tour/autonomoTourSteps';
import { MEILimitAlert } from '@/components/autonomos/MEILimitAlert';
import { AutonomoFinancialDashboard } from '@/components/autonomos/AutonomoFinancialDashboard';
import { EmbeddedConsultationChat } from '@/components/chat/EmbeddedConsultationChat';
import { AutonomoGoals } from '@/components/autonomos/AutonomoGoals';
import AppSidebar from '@/components/layout/AppSidebar';
import AutonomoMEFlow from '@/components/abertura/AutonomoMEFlow';
import CompanyOpeningStatus from '@/components/abertura/CompanyOpeningStatus';
import { FloatingAIAgent } from '@/components/ai/FloatingAIAgent';
import { PastDueAlert } from '@/components/subscription/PastDueAlert';
import { ServicesHubModern } from '@/components/dashboard/ServicesHubModern';
import { ServiceNotificationBell } from '@/components/notifications/ServiceNotificationBell';
import { LimpaNomePromoCard } from '@/components/limpa-nome/LimpaNomePromoCard';
import { CashbackCard } from '@/components/calculator/CashbackCard';
import { CashbackHistoryCard } from '@/components/calculator/CashbackHistoryCard';
import { ComingSoonSection } from '@/components/layout/ComingSoonSection';
import TaxTransitionSimulator from '@/components/simulator/TaxTransitionSimulator';
import { EmbeddedTimelineReforma } from '@/components/reforma/EmbeddedTimelineReforma';
import { EmbeddedFerramentasLC214 } from '@/components/reforma/EmbeddedFerramentasLC214';
import ReformaRadar from '@/components/reforma/ReformaRadar';
import { SubscriptionManagement } from '@/components/subscription/SubscriptionManagement';
import { AllServicesHub } from '@/components/services/AllServicesHub';
import { UnifiedSettingsPage } from '@/components/user-panel/UnifiedSettingsPage';
import { EmbeddedRegimeComparator } from '@/components/simulator/EmbeddedRegimeComparator';
import { EmbeddedFiscalChat } from '@/components/fiscal/EmbeddedFiscalChat';

interface AutonomoProfile {
  id: string;
  user_id: string;
  profession: string | null;
  profession_category: string | null;
  bio: string | null;
  monthly_revenue_average_cents: number;
  current_regime: string;
  state: string | null;
  city: string | null;
  phone: string | null;
  cpf: string | null;
}

type PanelSection = 
  | 'dashboard' 
  | 'simulator' 
  | 'history' 
  | 'ai-chat' 
  | 'contadores'
  | 'chat-contador'
  | 'financeiro'
  | 'metas'
  | 'abertura-empresa'
  | 'glossary' 
  | 'subscription' 
  | 'support' 
  | 'profile';
const AutonomoPanel: React.FC = () => {
  const { user, signOut, profile: authProfile, loading: authLoading, hasRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const notificationsHook = useNotifications();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Guided tour
  const tour = useGuidedTour({
    steps: autonomoTourSteps,
    storageKey: 'autonomo_tour_completed',
    autoStart: false,
  });

  // Fetch autonomo profile
  const { data: profile, isLoading: isLoadingProfile, isError } = useQuery({
    queryKey: ['autonomo-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('autonomo_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      return data as AutonomoProfile | null;
    },
    enabled: !!user,
  });

  // Redirect to auth if not logged in, or to onboarding if no profile
  useEffect(() => {
    if (authLoading || isLoadingProfile) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // If profile query finished and there's no profile, redirect to onboarding
    if (!isLoadingProfile && !profile && !isError) {
      navigate('/autonomo-onboarding');
    }
  }, [user, authLoading, profile, isLoadingProfile, isError, navigate]);

  // Fetch simulations count
  const { data: simulationsCount } = useQuery({
    queryKey: ['autonomos-simulations-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('autonomos_simulations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  // Fetch total savings
  const { data: totalSavings } = useQuery({
    queryKey: ['autonomos-savings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('autonomos_simulations')
        .select('annual_savings_cents')
        .eq('user_id', user?.id);

      if (error) throw error;
      const total = data?.reduce((acc, sim) => acc + (sim.annual_savings_cents || 0), 0) || 0;
      return total;
    },
    enabled: !!user,
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setMobileMenuOpen(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ['autonomo-profile'] });
    queryClient.invalidateQueries({ queryKey: ['autonomos-simulations-count'] });
    queryClient.invalidateQueries({ queryKey: ['autonomos-savings'] });
    setIsRefreshing(false);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  // Dashboard content
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between" data-tour="autonomo-header">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Olá, {profile?.profession || 'Autônomo'}! 👋
          </h2>
          <p className="text-muted-foreground">
            Bem-vindo ao seu painel master de gestão tributária
          </p>
        </div>
        {!tour.hasCompletedTour && (
          <Button 
            variant="outline" 
            onClick={tour.startTour}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Iniciar Tour Guiado
          </Button>
        )}
      </div>

      {/* MEI Limit Alert */}
      <MEILimitAlert 
        monthlyRevenue={profile?.monthly_revenue_average_cents || 0}
        onSimulate={() => handleTabChange('simulator')}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="stats-cards">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Simulações</p>
                <p className="text-2xl font-bold text-foreground">{simulationsCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Economia Potencial</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(totalSavings || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/20">
                <Crown className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Regime Atual</p>
                <p className="text-xl font-bold text-foreground">
                  {profile?.current_regime?.toUpperCase() || 'PF'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-info/10 to-transparent border-info/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-info/20">
                <Sparkles className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plano</p>
                <p className="text-xl font-bold text-foreground">Master</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => handleTabChange('simulator')}
          data-tour="quick-simulator"
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Bot className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Simular Impostos</h3>
                <p className="text-sm text-muted-foreground">
                  Descubra o melhor regime para você
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => handleTabChange('ai-chat')}
          data-tour="quick-ai-chat"
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Chat com IA</h3>
                <p className="text-sm text-muted-foreground">
                  Tire dúvidas tributárias
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => handleTabChange('contadores')}
          data-tour="quick-contadores"
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Falar com Contador</h3>
                <p className="text-sm text-muted-foreground">
                  Consulte um especialista
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Limpa Nome Card - Novidade */}
      <LimpaNomePromoCard variant="full" showAIFeature={true} />

      {/* Company Opening Status Card */}
      <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600" />
            Abertura de Empresa
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-600 text-xs">
              Reforma Tributária
            </Badge>
          </CardTitle>
          <CardDescription>
            Formalize seu negócio com orientação especializada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-emerald-500/20">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Descubra o melhor caminho</p>
                  <p className="text-sm text-muted-foreground">MEI, ME ou continuar autônomo?</p>
                </div>
              </div>
              <Button 
                onClick={() => handleTabChange('abertura-empresa')}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Iniciar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              ✨ O sistema analisa seu perfil e indica a melhor opção com base na Reforma Tributária
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Company Opening Status */}
      <CompanyOpeningStatus onStartNew={() => handleTabChange('abertura-empresa')} />

      {/* Cashback Card */}
      <CashbackCard />

      {/* Cashback History */}
      <CashbackHistoryCard />

      {/* Services Hub */}
      <ServicesHubModern />

      {/* Recent Activity */}
      <Card data-tour="history-section">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Últimas Simulações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AutonomoSimulationHistory />
        </CardContent>
      </Card>
    </div>
  );

  // Profile section
  const renderProfile = () => (
    <AutonomoProfileEditor profile={profile} userId={user?.id || ''} />
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'simulator':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                🤖 Simulador IA
              </h2>
              <p className="text-muted-foreground">
                Descubra o melhor regime tributário para sua profissão
              </p>
            </div>
            <AutonomoSimulator />
          </div>
        );
      case 'history':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Histórico de Simulações</h2>
              <p className="text-muted-foreground">
                Todas as suas simulações e análises anteriores
              </p>
            </div>
            <AutonomoSimulationHistory />
          </div>
        );
      case 'ai-chat':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Chat IA para Autônomos</h2>
              <p className="text-muted-foreground">
                Calcule INSS, compare PF vs MEI vs ME e tire dúvidas tributárias
              </p>
            </div>
            <div className="h-[600px]">
              <AutonomoAICalculator />
            </div>
          </div>
        );
      case 'contadores':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Contadores Disponíveis</h2>
              <p className="text-muted-foreground">
                Conecte-se com contadores especializados em autônomos
              </p>
            </div>
            <EmbeddedContadoresList />
          </div>
        );
      case 'chat-contador':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Chat com Contador</h2>
              <p className="text-muted-foreground">
                Converse diretamente com seu contador sobre suas consultas
              </p>
            </div>
            <EmbeddedConsultationChat isContador={false} />
          </div>
        );
      case 'financeiro':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Dashboard Financeiro</h2>
              <p className="text-muted-foreground">
                Acompanhe sua evolução de receita, impostos e economia
              </p>
            </div>
            <AutonomoFinancialDashboard />
          </div>
        );
      case 'metas':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Metas Financeiras</h2>
              <p className="text-muted-foreground">
                Defina e acompanhe suas metas de faturamento, economia e redução de impostos
              </p>
            </div>
            <AutonomoGoals />
          </div>
        );
      case 'abertura-empresa':
        return (
          <ComingSoonSection 
            title="Abertura de Empresa"
            description="Formalize seu negócio com orientação sobre a Reforma Tributária"
            features={[
              'Escolha do melhor regime tributário',
              'Análise de impacto da reforma',
              'Suporte completo de especialistas',
            ]}
          />
        );
      case 'chat-fiscal':
        return <EmbeddedFiscalChat variant="autonomo" />;
      case 'glossary':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Glossário Tributário</h2>
              <p className="text-muted-foreground">
                Entenda os termos fiscais de forma simples
              </p>
            </div>
            <TaxGlossary />
          </div>
        );
      case 'subscription':
        return <SubscriptionManagement />;
      case 'support':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Suporte</h2>
              <p className="text-muted-foreground">
                Precisa de ajuda? Estamos aqui para você
              </p>
            </div>
            <SupportTicketList />
          </div>
        );
      case 'profile':
        return renderProfile();
      case 'notifications':
        return (
          <NotificationsPage
            notifications={notificationsHook.notifications}
            unreadCount={notificationsHook.unreadCount}
            onMarkAsRead={notificationsHook.markAsRead}
            onMarkAllAsRead={notificationsHook.markAllAsRead}
            onClear={notificationsHook.clearNotifications}
          />
        );
      case 'ferramentas-gratuitas':
        return <EmbeddedFerramentasLC214 />;
      case 'ferramentas-lc214':
        return <EmbeddedFerramentasLC214 />;
      case 'reforma-radar':
        return <ReformaRadar variant="autonomo" />;
      case 'transicao':
        return (
          <div className="space-y-6">
            <TaxTransitionSimulator embedded />
          </div>
        );
      case 'simulacao-completa':
      case 'comparar-regimes':
        return <EmbeddedRegimeComparator />;
      case 'timeline':
        return <EmbeddedTimelineReforma variant="autonomo" />;
      case 'settings':
      case 'configuracoes':
      case 'subscription':
      case 'assinatura':
        return <UnifiedSettingsPage />;
      case 'servicos':
      case 'ver-todos-servicos':
        return <AllServicesHub />;
      case 'overview':
      default:
        return renderDashboard();
    }
  };

  if (authLoading || isLoadingProfile || !user) {
    return (
      <div className="min-h-screen bg-background flex w-full">
        {/* Sidebar placeholder */}
        <div className="hidden lg:block w-56 border-r bg-card/50">
          <div className="p-4 space-y-4">
            <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 w-full rounded-lg bg-muted/60 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 p-8">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-teal-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-teal-500 animate-spin" />
              <Target className="absolute inset-0 m-auto h-8 w-8 text-teal-500/60" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Carregando Painel</h2>
              <p className="text-muted-foreground text-sm">Verificando perfil e permissões do autônomo...</p>
            </div>
            <div className="flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i}
                  className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout overflow-x-hidden">
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />}
      <div className="hidden lg:block">
        <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} variant="autonomo" activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
      <div className={cn(
        'lg:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-out',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <AppSidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} variant="autonomo" activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
      
      <main className={cn(
        'dashboard-main transition-all duration-300',
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      )}>
        <header className="dashboard-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}><Menu className="h-5 w-5" /></Button>
              <div className="p-2 rounded-xl bg-teal-500/10 hidden sm:flex"><Target className="h-6 w-6 text-teal-500" /></div>
              <div>
                <h1 className="text-lg lg:text-2xl font-bold">Painel Autônomo</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">{profile?.profession || 'Autônomo Master'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ServiceNotificationBell />
              <NotificationCenter 
                notifications={notificationsHook.notifications}
                unreadCount={notificationsHook.unreadCount}
                onMarkAsRead={notificationsHook.markAsRead}
                onMarkAllAsRead={notificationsHook.markAllAsRead}
                onClear={notificationsHook.clearNotifications}
              />
              {tour.hasCompletedTour && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={tour.startTour}
                  className="gap-2 hidden sm:flex"
                >
                  <Play className="h-4 w-4" />
                  Ver Tour
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="hidden sm:flex">
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <PastDueAlert />
          {isLoadingProfile ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </main>
      
      {/* Guided Tour */}
      <GuidedTour
        isActive={tour.isActive}
        currentStep={tour.currentStep}
        currentStepIndex={tour.currentStepIndex}
        totalSteps={tour.totalSteps}
        progress={tour.progress}
        isFirstStep={tour.isFirstStep}
        isLastStep={tour.isLastStep}
        onNext={tour.nextStep}
        onPrev={tour.prevStep}
        onSkip={() => tour.endTour(false)}
        onClose={() => tour.endTour(true)}
      />
      
      {/* Floating AI Agent */}
      <FloatingAIAgent context="autonomo" />
    </div>
  );
};

// Profile Editor Component
const AutonomoProfileEditor: React.FC<{
  profile: AutonomoProfile | null;
  userId: string;
}> = ({ profile, userId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    profession: profile?.profession || '',
    profession_category: profile?.profession_category || '',
    bio: profile?.bio || '',
    monthly_revenue_average_cents: profile?.monthly_revenue_average_cents || 0,
    current_regime: profile?.current_regime || 'pf',
    state: profile?.state || '',
    city: profile?.city || '',
    phone: profile?.phone || '',
    cpf: profile?.cpf || '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        profession: profile.profession || '',
        profession_category: profile.profession_category || '',
        bio: profile.bio || '',
        monthly_revenue_average_cents: profile.monthly_revenue_average_cents || 0,
        current_regime: profile.current_regime || 'pf',
        state: profile.state || '',
        city: profile.city || '',
        phone: profile.phone || '',
        cpf: profile.cpf || '',
      });
    }
  }, [profile]);

  const formatCurrencyInput = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    const cents = parseInt(numbers || '0', 10);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const upsertData = {
        user_id: userId,
        ...formData,
      };

      const { error } = await supabase
        .from('autonomo_profiles')
        .upsert(upsertData, { onConflict: 'user_id' });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['autonomo-profile'] });
      toast({ title: 'Perfil salvo com sucesso!' });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({ variant: 'destructive', title: 'Erro ao salvar perfil' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Meu Perfil</h2>
        <p className="text-muted-foreground">
          Configure suas informações de autônomo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Profissionais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formData.profession_category}
                onValueChange={(v) => setFormData({ ...formData, profession_category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {PROFESSIONAL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Profissão</Label>
              <Input
                value={formData.profession}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                placeholder="Ex: Desenvolvedor, Eletricista, etc."
              />
            </div>

            <div className="space-y-2">
              <Label>Faturamento Médio Mensal</Label>
              <Input
                value={formatCurrencyInput(String(formData.monthly_revenue_average_cents))}
                onChange={(e) => {
                  const numbers = e.target.value.replace(/\D/g, '');
                  setFormData({
                    ...formData,
                    monthly_revenue_average_cents: parseInt(numbers || '0', 10),
                  });
                }}
                placeholder="R$ 0,00"
              />
            </div>

            <div className="space-y-2">
              <Label>Regime Tributário Atual</Label>
              <Select
                value={formData.current_regime}
                onValueChange={(v) => setFormData({ ...formData, current_regime: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pf">Pessoa Física (PF)</SelectItem>
                  <SelectItem value="mei">MEI</SelectItem>
                  <SelectItem value="me_simples">ME - Simples Nacional</SelectItem>
                  <SelectItem value="me_presumido">ME - Lucro Presumido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={formData.state}
                onValueChange={(v) => setFormData({ ...formData, state: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {brazilianStates.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Sua cidade"
              />
            </div>

            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label>CPF</Label>
              <Input
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bio / Descrição</Label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Conte um pouco sobre você e seu trabalho..."
              rows={4}
            />
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Perfil
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutonomoPanel;
