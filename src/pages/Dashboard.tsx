import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { useScheduleNotifications } from '@/hooks/useScheduleNotifications';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { SupportTicketList } from '@/components/support/SupportTicketList';
import CompanyOnboarding from '@/components/onboarding/CompanyOnboarding';
import AppSidebar from '@/components/layout/AppSidebar';
import { ConsultationQuotaCard } from '@/components/dashboard/ConsultationQuotaCard';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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

import { PowerAICalculator } from '@/components/ai/PowerAICalculator';
import { ProfessionalChat } from '@/components/chat/ProfessionalChat';
import { EmbeddedLocacaoSimulator } from '@/components/simulator/EmbeddedLocacaoSimulator';
import { EmbeddedContadoresList } from '@/components/contadores/EmbeddedContadoresList';
import { EconomyCalculator } from '@/components/calculator/EconomyCalculator';
import { PFPJDecision } from '@/components/calculator/PFPJDecision';

// Enhanced AI Agent with Power Calculator
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, roles, signOut, loading, hasRole } = useAuth();
  const { toast } = useToast();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  
  useScheduleNotifications();
  
  const [subscription, setSubscription] = useState<any>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
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
  };

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
      case 'profile':
        return <EmbeddedProfile profile={profile} user={user} onUpdate={fetchUserData} />;
      case 'locacao':
        return <EmbeddedLocacaoSimulator />;
      case 'pf-pj-decision':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Decisão Automática: PF ou PJ</h2>
              <p className="text-muted-foreground">Descubra qual estrutura tributária resulta em menor carga para você</p>
            </div>
            <div className="max-w-2xl">
              <PFPJDecision />
            </div>
          </div>
        );
      case 'contadores':
        return <EmbeddedContadoresList />;
      case 'economia':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Economize com a Reforma</h2>
              <p className="text-muted-foreground">Veja automaticamente quanto você pode economizar em um único clique</p>
            </div>
            <div className="max-w-2xl">
              <EconomyCalculator />
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
      default:
        return (
          <>
            {/* Company Card */}
            {company && (
              <Card className="bg-card border-border shadow-soft overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                <CardHeader className="relative pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Building2 className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{company.company_name}</CardTitle>
                        {company.trade_name && (
                          <CardDescription>{company.trade_name}</CardDescription>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowOnboarding(true)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-primary/50 text-primary">
                        {getCompanyTypeLabel(company.company_type)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4 text-info" />
                      <span className="text-sm">{getTaxRegimeLabel(company.tax_regime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span className="text-sm">{formatCurrency(company.monthly_revenue_cents)}/mês</span>
                    </div>
                    {company.state && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 text-accent" />
                        <span className="text-sm">{company.city ? `${company.city}/${company.state}` : company.state}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Setor: <span className="text-foreground">{getSectorLabel(company.sector)}</span>
                      {company.employee_count > 0 && (
                        <> • {company.employee_count} funcionário{company.employee_count > 1 ? 's' : ''}</>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* Economy Calculator - Destaque */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EconomyCalculator />
              <ConsultationQuotaCard />
            </div>

            {/* Quick Actions */}
            <div>
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
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <AppSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
          variant="user"
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
      
      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <AppSidebar 
          collapsed={false} 
          onToggle={() => setMobileMenuOpen(false)} 
          variant="user"
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
      
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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
              <NotificationCenter
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onClear={clearNotifications}
              />
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

        <div className="p-4 lg:p-6 space-y-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;