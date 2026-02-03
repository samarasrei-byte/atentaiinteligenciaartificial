import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Users, 
  MessageSquare, 
  FileText,
  Crown,
  Loader2,
  Building2,
  TrendingUp,
  MapPin,
  Edit,
  Home,
  Target,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Menu,
  User,
  Mail,
  Phone,
  Save,
  Headphones,
  Calculator,
  Clock,
  Scale,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { useScheduleNotifications } from '@/hooks/useScheduleNotifications';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { SupportTicketList } from '@/components/support/SupportTicketList';
import CompanyOnboarding from '@/components/onboarding/CompanyOnboarding';
import AppSidebar from '@/components/layout/AppSidebar';
import { CompanyEditCard } from '@/components/company/CompanyEditCard';
import { ConsultationQuotaCard } from '@/components/dashboard/ConsultationQuotaCard';
import { PlanUpgradeCard } from '@/components/dashboard/PlanUpgradeCard';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useGuidedTour } from '@/hooks/useGuidedTour';
import { GuidedTour } from '@/components/tour/GuidedTour';
import { TourTriggerButton } from '@/components/tour/TourTriggerButton';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import { dashboardTourSteps, featureHelp } from '@/components/tour/tourSteps';
import { DashboardSkeleton } from '@/components/ui/skeleton-loaders';
import { PastDueAlert } from '@/components/subscription/PastDueAlert';
import { useAutoOpenChat } from '@/components/chat/AutoOpenChatWrapper';

interface Company {
  id: string;
  company_name: string;
  trade_name: string | null;
  company_type: string;
  tax_regime: string;
  sector: string;
  monthly_revenue_cents: number;
  annual_revenue_cents: number;
  employee_count: number;
  state: string | null;
  city: string | null;
  cnpj: string | null;
  main_activity: string | null;
  onboarding_completed: boolean;
}

import { PowerAICalculator } from '@/components/ai/PowerAICalculator';
import { ProfessionalChat } from '@/components/chat/ProfessionalChat';
import { EmbeddedContadoresList } from '@/components/contadores/EmbeddedContadoresList';
import { EconomyCalculator } from '@/components/calculator/EconomyCalculator';
import { PFPJDecision } from '@/components/calculator/PFPJDecision';
import { SimulationHistory } from '@/components/history/SimulationHistory';
import { TaxAutopilot } from '@/components/autopilot/TaxAutopilot';
import { TaxGlossary } from '@/components/glossary/TaxGlossary';
import { SavingsMetricsDashboard } from '@/components/dashboard/SavingsMetricsDashboard';
import { SubscriptionHistoryCard } from '@/components/subscription/SubscriptionHistoryCard';
import { AutonomoSimulator } from '@/components/autonomos/AutonomoSimulator';
import { AutonomoSimulationHistory } from '@/components/history/AutonomoSimulationHistory';
import { FloatingAIAgent } from '@/components/ai/FloatingAIAgent';
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
import { FiscalAnalysisNotification } from '@/components/notifications/FiscalAnalysisNotification';
import { NotificationsPage } from '@/components/notifications/NotificationsPage';
import { EmbeddedFiscalChat } from '@/components/fiscal/EmbeddedFiscalChat';

const EmbeddedAIAgent = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Agente IA Tributário</h2>
        <p className="text-muted-foreground">Cálculos automáticos e análises com inteligência artificial avançada</p>
      </div>
      <div className="h-[650px]">
        <PowerAICalculator />
      </div>
    </div>
  );
};

// Professional Chat with Contador
const EmbeddedChatContador = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Chat com Contador</h2>
        <p className="text-muted-foreground">Converse com seu contador - envie mensagens, áudios e documentos</p>
      </div>
      <ProfessionalChat isContador={false} />
    </div>
  );
};

// Profile Edit Component
const EmbeddedProfile = ({ profile, user, onUpdate }: { profile: any; user: any; onUpdate: () => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  });
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });
      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Meu Perfil</h2>
        <p className="text-muted-foreground">Visualize e edite suas informações pessoais</p>
      </div>
      
      <Card className="bg-card border-border shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {formData.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <CardTitle>{formData.full_name || 'Usuário'}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </div>
            </div>
            <Button
              variant={isEditing ? 'default' : 'outline'}
              size="sm"
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Nome Completo
              </label>
              {isEditing ? (
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Seu nome completo"
                />
              ) : (
                <p className="text-foreground bg-muted/50 px-3 py-2 rounded-md">
                  {formData.full_name || 'Não informado'}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                E-mail
              </label>
              <p className="text-foreground bg-muted/50 px-3 py-2 rounded-md">
                {user?.email}
              </p>
              <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Telefone
              </label>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              ) : (
                <p className="text-foreground bg-muted/50 px-3 py-2 rounded-md">
                  {formData.phone || 'Não informado'}
                </p>
              )}
            </div>
          </div>
          
          {isEditing && (
            <div className="flex gap-2 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    full_name: profile?.full_name || '',
                    phone: profile?.phone || '',
                  });
                }}
              >
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const EmpresaPanel = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile, roles, signOut, loading, hasRole } = useAuth();
  const { toast } = useToast();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  
  useScheduleNotifications();
  
  // Auto-open chat if user has active request
  useAutoOpenChat();
  
  // Guided Tour
  const tour = useGuidedTour({
    steps: dashboardTourSteps,
    storageKey: 'dashboard_tour_completed',
    autoStart: true,
  });
  
  const [subscription, setSubscription] = useState<any>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
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

  // Mantém o estado do painel sincronizado com a URL (?tab=...)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) setActiveTab(tab);
    if (!tab && activeTab !== 'overview') setActiveTab('overview');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      fetchUserData();
      
      const consultationsChannel = supabase
        .channel('user-consultations')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'consultations', filter: `user_id=eq.${user.id}` },
          () => fetchUserData()
        )
        .subscribe();
        
      const subscriptionsChannel = supabase
        .channel('user-subscriptions')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'subscriptions', filter: `user_id=eq.${user.id}` },
          () => fetchUserData()
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(consultationsChannel);
        supabase.removeChannel(subscriptionsChannel);
      };
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Contadores e autônomos não precisam de empresa cadastrada
      const isContador = hasRole('contador');
      const isAutonomo = hasRole('autonomo');
      
      if (!isContador && !isAutonomo) {
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
      } else {
        // Contador ou autônomo não precisa de onboarding de empresa
        setShowOnboarding(false);
      }

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .single();
      
      setSubscription(subData);

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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setSearchParams({ tab });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSkeleton />
      </div>
    );
  }

  if (showOnboarding) {
    return <CompanyOnboarding onComplete={handleOnboardingComplete} />;
  }

  const getPlanBadge = () => {
    if (!subscription) return <Badge variant="outline" className="border-muted-foreground text-muted-foreground">Sem Plano</Badge>;
    
    const planConfig: Record<string, { color: string; name: string }> = {
      basic: { color: 'bg-muted', name: 'Básico' },
      ai: { color: 'bg-primary', name: 'IA' },
      contador: { color: 'bg-info', name: 'Contador' },
      premium: { color: 'bg-gradient-to-r from-accent to-amber-500', name: 'Premium' },
    };
    
    const config = planConfig[subscription.plan_type] || planConfig.basic;
    return <Badge className={config.color}>{config.name}</Badge>;
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const getCompanyTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      mei: 'MEI', me: 'ME', epp: 'EPP', ltda: 'LTDA', eireli: 'EIRELI',
      sa_fechada: 'S.A. Fechada', sa_aberta: 'S.A. Aberta', cooperativa: 'Cooperativa',
    };
    return types[type] || type;
  };

  const getTaxRegimeLabel = (regime: string) => {
    const regimes: Record<string, string> = {
      simples_nacional: 'Simples Nacional', lucro_presumido: 'Lucro Presumido',
      lucro_real: 'Lucro Real', lucro_arbitrado: 'Lucro Arbitrado',
    };
    return regimes[regime] || regime;
  };

  const getSectorLabel = (sector: string) => {
    const sectors: Record<string, string> = {
      comercio: 'Comércio', servicos: 'Serviços', industria: 'Indústria',
      agronegocio: 'Agronegócio', tecnologia: 'Tecnologia', saude: 'Saúde',
      educacao: 'Educação', construcao: 'Construção', transporte: 'Transporte',
      alimentacao: 'Alimentação', outro: 'Outro',
    };
    return sectors[sector] || sector;
  };

  const quickActions = [
    {
      icon: MessageSquare,
      title: 'Chat IA',
      description: 'Tire dúvidas sobre a Reforma',
      tabId: 'ai-chat',
      gradient: 'from-primary to-teal-400',
      iconBg: 'bg-primary/10',
    },
    {
      icon: TrendingUp,
      title: 'Economize',
      description: 'Calcule sua economia',
      tabId: 'economia',
      gradient: 'from-emerald-500 to-green-500',
      iconBg: 'bg-emerald-500/10',
      badge: 'Hot',
    },
    {
      icon: Home,
      title: 'Locação',
      description: 'Simule PF × PJ',
      tabId: 'locacao',
      gradient: 'from-rose-500 to-pink-500',
      iconBg: 'bg-rose-500/10',
    },
    {
      icon: Target,
      title: 'PF ou PJ?',
      description: 'Descubra a estrutura ideal',
      tabId: 'pf-pj-decision',
      gradient: 'from-violet-500 to-purple-500',
      iconBg: 'bg-violet-500/10',
    },
  ];

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'ai-chat':
        return <EmbeddedAIAgent />;
      case 'chat-contador':
        return <EmbeddedChatContador />;
      case 'chat-fiscal':
        return <EmbeddedFiscalChat variant="empresa" serviceType="fiscal" />;
      case 'chat-bi':
        return <EmbeddedFiscalChat variant="empresa" serviceType="bi" />;
      case 'profile':
        return <EmbeddedProfile profile={profile} user={user} onUpdate={fetchUserData} />;
      case 'glossary':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-foreground">Glossário Tributário</h2>
              <HelpTooltip 
                title={featureHelp.glossary.title}
                content={featureHelp.glossary.content}
              />
            </div>
            <p className="text-muted-foreground">Entenda todos os impostos da Reforma Tributária de forma simples</p>
            <div className="max-w-3xl">
              <TaxGlossary variant="full" />
            </div>
          </div>
        );
      case 'pf-pj-decision':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-foreground">Decisão Automática: PF ou PJ</h2>
              <HelpTooltip 
                title={featureHelp.pfPjDecision.title}
                content={featureHelp.pfPjDecision.content}
              />
            </div>
            <p className="text-muted-foreground">Descubra qual estrutura tributária resulta em menor carga para você</p>
            <div className="max-w-2xl">
              <PFPJDecision />
            </div>
          </div>
        );
      case 'autonomos':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                🤖 IA para Profissionais Autônomos
              </h2>
              <p className="text-muted-foreground">
                Descubra o melhor regime tributário para sua profissão em poucos cliques
              </p>
            </div>
            <AutonomoSimulator />
            <AutonomoSimulationHistory />
          </div>
        );
      case 'subscription':
      case 'assinatura':
        return <UnifiedSettingsPage />;
      case 'economia':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-foreground">Economize com a Reforma</h2>
              <HelpTooltip 
                title={featureHelp.economyCalculator.title}
                content={featureHelp.economyCalculator.content}
              />
            </div>
            <p className="text-muted-foreground">Veja automaticamente quanto você pode economizar em um único clique</p>
            <div className="max-w-2xl">
              <EconomyCalculator />
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-foreground">Histórico de Simulações</h2>
              <HelpTooltip 
                title={featureHelp.history.title}
                content={featureHelp.history.content}
              />
            </div>
            <p className="text-muted-foreground">Acompanhe a evolução das suas decisões tributárias</p>
            <SimulationHistory />
          </div>
        );
      case 'metrics':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-foreground">Métricas de Economia</h2>
              <HelpTooltip 
                title={featureHelp.metrics.title}
                content={featureHelp.metrics.content}
              />
            </div>
            <p className="text-muted-foreground">Acompanhe sua economia tributária ao longo do tempo</p>
            <SavingsMetricsDashboard />
          </div>
        );
      case 'autopilot':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-foreground">Piloto Automático Tributário</h2>
              <HelpTooltip 
                title={featureHelp.autopilot.title}
                content={featureHelp.autopilot.content}
              />
            </div>
            <p className="text-muted-foreground">Otimização contínua da sua estratégia tributária</p>
            <div className="max-w-3xl">
              <TaxAutopilot />
            </div>
          </div>
        );
      case 'support':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Suporte</h2>
              <p className="text-muted-foreground">Gerencie seus tickets de suporte</p>
            </div>
            <SupportTicketList />
          </div>
        );
      case 'notifications':
        return (
          <NotificationsPage
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onClear={clearNotifications}
          />
        );
      case 'ferramentas-gratuitas':
        return <EmbeddedFerramentasLC214 />;
      case 'ferramentas-lc214':
        return <EmbeddedFerramentasLC214 />;
      case 'reforma-radar':
        return <ReformaRadar variant="empresa" />;
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
        return <EmbeddedTimelineReforma variant="empresa" />;
      case 'settings':
      case 'configuracoes':
        return <UnifiedSettingsPage />;
      case 'servicos':
      case 'ver-todos-servicos':
        return <AllServicesHub />;
      default:
        return (
          <>
            {/* Fiscal Analysis Notification Banner */}
            <FiscalAnalysisNotification className="mb-6" />

            {/* Company Card with Edit Feature */}
            {company && (
              <CompanyEditCard company={company} onUpdate={fetchUserData} />
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-tour="stats">
              <Card className="bg-card border-border shadow-soft">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Simulações</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{stats.simulations}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-primary/10">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Simulações realizadas</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border shadow-soft">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Conversas IA</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{stats.aiChats}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-info/10">
                      <Sparkles className="h-6 w-6 text-info" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Mensagens enviadas</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border shadow-soft">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Consultorias</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{stats.consultations}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-success/10">
                      <Users className="h-6 w-6 text-success" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Sessões com contadores</p>
                </CardContent>
              </Card>
            </div>

            {/* Economy Calculator & Plan Upgrade */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-tour="economy-calculator">
              <div className="lg:col-span-2">
                <EconomyCalculator />
              </div>
              <div className="space-y-4">
                <PlanUpgradeCard />
                <ConsultationQuotaCard />
              </div>
            </div>

            {/* Quick Actions */}
            <div data-tour="quick-actions">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Ações Rápidas</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Card 
                      key={action.tabId}
                      className="bg-card border-border shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer group overflow-hidden"
                      onClick={() => handleTabChange(action.tabId)}
                    >
                      <CardContent className="p-5 relative">
                        <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity" 
                             style={{ backgroundImage: `linear-gradient(to bottom right, var(--primary), transparent)` }} />
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2.5 rounded-lg ${action.iconBg}`}>
                            <Icon className="h-5 w-5 text-foreground" />
                          </div>
                          {action.badge && (
                            <Badge className="bg-accent text-accent-foreground text-xs">
                              {action.badge}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                        <div className="mt-3 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Acessar
                          <ArrowUpRight className="h-4 w-4 ml-1" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Cashback Card */}
            <CashbackCard />

            {/* Cashback History */}
            <CashbackHistoryCard />

            {/* Services Hub */}
            <ServicesHubModern />
          </>
        );
    }
  };

  return (
    <div className="dashboard-layout overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <AppSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
          variant="empresa"
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
      
      {/* Mobile Sidebar - Improved with better touch handling */}
      <div className={cn(
        'lg:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-out',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <AppSidebar 
          collapsed={false} 
          onToggle={() => setMobileMenuOpen(false)} 
          variant="empresa"
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
      
      <main className={cn(
        'dashboard-main transition-all duration-300',
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      )}>
        {/* Top Bar */}
        <header className="dashboard-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3" data-tour="welcome">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg lg:text-2xl font-bold text-foreground">
                  Bem-vindo, {profile?.full_name?.split(' ')[0] || 'Usuário'}!
                </h1>
                <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">
                  Painel de controle da Reforma Tributária
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              <TourTriggerButton 
                onStartTour={tour.startTour}
                onResetTour={tour.resetTour}
                hasCompletedTour={tour.hasCompletedTour}
              />
              <div data-tour="notifications" className="flex items-center gap-1">
                <ServiceNotificationBell />
                <NotificationCenter
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onClear={clearNotifications}
                />
              </div>
              <div className="hidden sm:block">{getPlanBadge()}</div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/pricing')}
                className="hidden md:flex"
              >
                <Crown className="h-4 w-4 mr-2 text-accent" />
                Upgrade
              </Button>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <PastDueAlert />
          {renderContent()}
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
        onSkip={() => tour.endTour(true)}
        onClose={() => tour.endTour(false)}
      />
      
      {/* FloatingAIAgent removido - bloqueava o chat */}
    </div>
  );
};

export default EmpresaPanel;