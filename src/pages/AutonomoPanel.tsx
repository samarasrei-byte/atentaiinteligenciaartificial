import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
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
import { ProfessionalChat } from '@/components/chat/ProfessionalChat';
import { GuidedTour } from '@/components/tour/GuidedTour';
import { useGuidedTour } from '@/hooks/useGuidedTour';
import { autonomoTourSteps } from '@/components/tour/autonomoTourSteps';
import { MEILimitAlert } from '@/components/autonomos/MEILimitAlert';
import { AutonomoFinancialDashboard } from '@/components/autonomos/AutonomoFinancialDashboard';
import { EmbeddedConsultationChat } from '@/components/chat/EmbeddedConsultationChat';
import { AutonomoGoals } from '@/components/autonomos/AutonomoGoals';

// Sidebar component for Autonomo
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';

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
  | 'glossary' 
  | 'subscription' 
  | 'support' 
  | 'profile';

const AutonomoSidebar: React.FC<{
  activeSection: PanelSection;
  onSectionChange: (section: PanelSection) => void;
  profile: AutonomoProfile | null;
  onLogout: () => void;
}> = ({ activeSection, onSectionChange, profile, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'financeiro', label: 'Dashboard Financeiro', icon: BarChart3 },
    { id: 'metas', label: 'Metas Financeiras', icon: Target },
    { id: 'simulator', label: 'Simulador IA', icon: Bot },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'ai-chat', label: 'Chat IA Tributário', icon: MessageSquare },
    { id: 'chat-contador', label: 'Chat com Contador', icon: Headphones },
    { id: 'contadores', label: 'Contadores', icon: Users },
    { id: 'glossary', label: 'Glossário', icon: HelpCircle },
    { id: 'subscription', label: 'Assinatura', icon: Crown },
    { id: 'support', label: 'Suporte', icon: Headphones },
    { id: 'profile', label: 'Meu Perfil', icon: Settings },
  ];

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex flex-col items-center gap-3">
          <img 
            src="/logo-atentai.png" 
            alt="AtentAI" 
            className="h-10 w-auto"
          />
          <div className="text-center">
            <h2 className="font-bold text-white truncate">
              Autônomo
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              Painel Master
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup data-tour="sidebar-menu">
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id as PanelSection)}
                    className={activeSection === item.id ? 'bg-primary/10 text-primary' : ''}
                    data-tour={item.id === 'profile' ? 'profile-menu' : undefined}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <Button variant="ghost" className="w-full justify-start text-destructive" onClick={onLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

const AutonomoPanel: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const notificationsHook = useNotifications();
  const [activeSection, setActiveSection] = useState<PanelSection>('dashboard');
  
  // Guided tour
  const tour = useGuidedTour({
    steps: autonomoTourSteps,
    storageKey: 'autonomo_tour_completed',
    autoStart: false,
  });

  // Fetch autonomo profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
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
        onSimulate={() => setActiveSection('simulator')}
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
          onClick={() => setActiveSection('simulator')}
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
          onClick={() => setActiveSection('ai-chat')}
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
          onClick={() => setActiveSection('contadores')}
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

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
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
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Minha Assinatura</h2>
              <p className="text-muted-foreground">
                Gerencie seu plano Autônomo Master
              </p>
            </div>
            <SubscriptionHistoryCard />
          </div>
        );
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
      default:
        return renderDashboard();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AutonomoSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          profile={profile}
          onLogout={handleLogout}
        />
        <SidebarInset className="flex-1">
          <header className="flex h-14 items-center gap-4 border-b border-border px-6">
            <SidebarTrigger />
            <div className="flex-1" />
            {tour.hasCompletedTour && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={tour.startTour}
                className="gap-2 text-muted-foreground"
              >
                <Play className="h-4 w-4" />
                Ver Tour
              </Button>
            )}
            <NotificationCenter 
              notifications={notificationsHook.notifications}
              unreadCount={notificationsHook.unreadCount}
              onMarkAsRead={notificationsHook.markAsRead}
              onMarkAllAsRead={notificationsHook.markAllAsRead}
              onClear={notificationsHook.clearNotifications}
            />
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {isLoadingProfile ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              renderContent()
            )}
          </main>
        </SidebarInset>
      </div>
      
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
    </SidebarProvider>
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
