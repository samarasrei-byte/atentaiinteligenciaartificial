import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Users,
  Home,
  FileText,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  Headphones,
  UserCheck,
  Wallet,
  Star,
  Bot,
  MessagesSquare,
  User,
  Settings,
  Sparkles,
  History,
  Zap,
  BookOpen,
  Scale,
  Building2,
  ScrollText,
  Brain,
  ShoppingBag,
  Bell,
  Target,
  MessageCircle,
  Calculator,
  Clock,
  FileBarChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { InPanelUpgradeModal } from '@/components/subscription/InPanelUpgradeModal';
import { PlanType } from '@/lib/stripe';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  tabId: string;
  badge?: string;
  badgeColor?: string;
  isLive?: boolean;
  isService?: boolean; // Flag para serviços do marketplace
  serviceKey?: string; // Key para o modal de serviço
}

interface SidebarGroup {
  id: string;
  label: string;
  items: SidebarItem[];
}

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  variant?: 'user' | 'admin' | 'contador' | 'autonomo' | 'empresa' | 'partner';
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

// ============================================================
// ESTRUTURA OFICIAL DO MENU (Conforme especificação)
// ============================================================

// VISÃO GERAL
const visaoGeralGroup: SidebarGroup = {
  id: 'visao-geral',
  label: 'Visão Geral',
  items: [
    { icon: LayoutDashboard, label: 'Visão Geral', tabId: 'overview' },
    { icon: Bell, label: 'Notificações', tabId: 'notifications' },
  ],
};

// INTELIGÊNCIA & IA
const iaGroup: SidebarGroup = {
  id: 'inteligencia-ia',
  label: 'Inteligência & IA',
  items: [
    { icon: Bot, label: 'Agente IA', tabId: 'ai-chat' },
    { icon: Sparkles, label: 'Ferramentas Gratuitas', tabId: 'ferramentas-gratuitas' },
  ],
};

// REFORMA TRIBUTÁRIA (LC 214)
const reformaGroup: SidebarGroup = {
  id: 'reforma-tributaria',
  label: 'Reforma Tributária (LC 214)',
  items: [
    { icon: Calculator, label: 'Ferramentas LC 214', tabId: 'ferramentas-lc214' },
    { icon: FileBarChart, label: 'Simulador Transição', tabId: 'transicao' },
    { icon: Clock, label: 'Timeline Reforma', tabId: 'timeline' },
  ],
};

// SERVIÇOS
const servicosGroup: SidebarGroup = {
  id: 'servicos',
  label: 'Serviços',
  items: [
    { icon: ShoppingBag, label: 'Contratar Serviços', tabId: 'servicos' },
    { icon: Shield, label: 'Limpa Nome', tabId: 'servico-limpa-nome', isService: true, serviceKey: 'limpa-nome' },
    { icon: Scale, label: 'Análise Fiscal', tabId: 'servico-fiscal', isService: true, serviceKey: 'analise-fiscal' },
    { icon: Brain, label: 'BI Contabilidade', tabId: 'servico-bi', isService: true, serviceKey: 'bi-contabilidade' },
    { icon: TrendingUp, label: 'Ver Todos', tabId: 'ver-todos-servicos' },
  ],
};

// MINHA CONTA
const contaGroup: SidebarGroup = {
  id: 'conta',
  label: 'Minha Conta',
  items: [
    { icon: Wallet, label: 'Assinatura', tabId: 'subscription' },
    { icon: User, label: 'Perfil', tabId: 'profile' },
    { icon: Settings, label: 'Configurações', tabId: 'settings' },
    { icon: Headphones, label: 'Suporte', tabId: 'support' },
  ],
};

// SIMULAÇÃO - Para comparar regimes
const simulacaoGroup: SidebarGroup = {
  id: 'simulacao',
  label: 'Simulação',
  items: [
    { icon: Scale, label: 'Comparar Regimes', tabId: 'simulacao-completa', badge: 'Usar a sua' },
  ],
};

// EMPRESA - Estrutura padrão
const empresaGroups: SidebarGroup[] = [
  visaoGeralGroup,
  iaGroup,
  simulacaoGroup,
  reformaGroup,
  servicosGroup,
  contaGroup,
];

// AUTÔNOMO - Mesma estrutura base + itens específicos
const autonomoGroups: SidebarGroup[] = [
  visaoGeralGroup,
  {
    id: 'inteligencia-ia',
    label: 'Inteligência & IA',
    items: [
      { icon: Bot, label: 'Chat IA', tabId: 'ai-chat' },
      { icon: BarChart3, label: 'Financeiro', tabId: 'financeiro' },
      { icon: Target, label: 'Metas', tabId: 'metas' },
      { icon: Sparkles, label: 'Ferramentas Gratuitas', tabId: 'ferramentas-gratuitas' },
    ],
  },
  simulacaoGroup,
  reformaGroup,
  {
    id: 'servicos',
    label: 'Serviços',
    items: [
      { icon: ShoppingBag, label: 'Contratar Serviços', tabId: 'servicos' },
      { icon: Shield, label: 'Limpa Nome', tabId: 'servico-limpa-nome', isService: true, serviceKey: 'limpa-nome' },
      { icon: Scale, label: 'Análise Fiscal', tabId: 'servico-fiscal', isService: true, serviceKey: 'analise-fiscal' },
      { icon: Brain, label: 'BI Contabilidade', tabId: 'servico-bi', isService: true, serviceKey: 'bi-contabilidade' },
      { icon: Building2, label: 'Abrir Empresa', tabId: 'servico-abertura', isService: true, serviceKey: 'abertura-empresa' },
    ],
  },
  {
    id: 'conta',
    label: 'Minha Conta',
    items: [
      { icon: History, label: 'Histórico', tabId: 'history' },
      { icon: Wallet, label: 'Assinatura', tabId: 'subscription' },
      { icon: User, label: 'Meu Perfil', tabId: 'profile' },
      { icon: Settings, label: 'Configurações', tabId: 'settings' },
      { icon: Headphones, label: 'Suporte', tabId: 'support' },
    ],
  },
];

// CONTADOR - Mesma estrutura + itens específicos
const contadorGroups: SidebarGroup[] = [
  visaoGeralGroup,
  {
    id: 'inteligencia-ia',
    label: 'Inteligência & IA',
    items: [
      { icon: BarChart3, label: 'Métricas', tabId: 'stats' },
      { icon: MessageCircle, label: 'Chat Clientes', tabId: 'chat', isLive: true },
      { icon: Sparkles, label: 'Ferramentas Gratuitas', tabId: 'ferramentas-gratuitas' },
    ],
  },
  reformaGroup,
  {
    id: 'servicos',
    label: 'Serviços',
    items: [
      { icon: Brain, label: 'BI Contabilidade', tabId: 'servico-bi', isService: true, serviceKey: 'bi-contabilidade' },
      { icon: Shield, label: 'Limpa Nome', tabId: 'servico-limpa-nome', isService: true, serviceKey: 'limpa-nome' },
      { icon: Scale, label: 'Análise Fiscal', tabId: 'servico-fiscal', isService: true, serviceKey: 'analise-fiscal' },
      { icon: Building2, label: 'Abertura Empresa', tabId: 'company-opening' },
      { icon: ScrollText, label: 'Certidões', tabId: 'certificates' },
      { icon: FileText, label: 'Imposto de Renda', tabId: 'ir' },
    ],
  },
  {
    id: 'clientes',
    label: 'Clientes',
    items: [
      { icon: UserCheck, label: 'Meus Clientes', tabId: 'clients' },
      { icon: Calendar, label: 'Consultas', tabId: 'consultations' },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    items: [
      { icon: DollarSign, label: 'Ganhos', tabId: 'earnings' },
      { icon: Wallet, label: 'Saques', tabId: 'withdrawals' },
      { icon: Star, label: 'Avaliações', tabId: 'reviews' },
    ],
  },
  {
    id: 'conta',
    label: 'Minha Conta',
    items: [
      { icon: Wallet, label: 'Assinatura', tabId: 'subscription' },
      { icon: User, label: 'Meu Perfil', tabId: 'profile' },
    ],
  },
];

// PARTNER - Mesma estrutura + itens específicos
const partnerGroups: SidebarGroup[] = [
  visaoGeralGroup,
  iaGroup,
  reformaGroup,
  servicosGroup,
  {
    id: 'financeiro',
    label: 'Financeiro',
    items: [
      { icon: DollarSign, label: 'Comissões', tabId: 'commissions' },
      { icon: Wallet, label: 'Saques', tabId: 'withdrawals' },
    ],
  },
  {
    id: 'conta',
    label: 'Minha Conta',
    items: [
      { icon: Wallet, label: 'Assinatura', tabId: 'subscription' },
      { icon: User, label: 'Meu Perfil', tabId: 'profile' },
      { icon: Settings, label: 'Configurações', tabId: 'settings' },
    ],
  },
];

// USER padrão
const userGroups: SidebarGroup[] = empresaGroups;

const AppSidebar: React.FC<AppSidebarProps> = ({ 
  collapsed, 
  onToggle, 
  variant = 'user',
  activeTab = 'overview',
  onTabChange
}) => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  
  // Modal states
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedServiceKey, setSelectedServiceKey] = useState<string | null>(null);
  const [selectedPlanType, setSelectedPlanType] = useState<PlanType | null>(null);
  const [upgradeType, setUpgradeType] = useState<'subscription' | 'service'>('service');

  const groups = variant === 'contador' 
    ? contadorGroups 
    : variant === 'autonomo' 
      ? autonomoGroups 
      : variant === 'empresa'
        ? empresaGroups
        : variant === 'partner'
          ? partnerGroups
          : userGroups;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const openServiceModal = (serviceKey: string) => {
    setSelectedServiceKey(serviceKey);
    setSelectedPlanType(null);
    setUpgradeType('service');
    setUpgradeModalOpen(true);
  };

  const openSubscriptionModal = () => {
    // Default to premium plan
    setSelectedPlanType('premium');
    setSelectedServiceKey(null);
    setUpgradeType('subscription');
    setUpgradeModalOpen(true);
  };

  const handleItemClick = (item: SidebarItem) => {
    const { tabId, isService, serviceKey } = item;

    // Se for um serviço do marketplace, abre o modal
    if (isService && serviceKey) {
      openServiceModal(serviceKey);
      return;
    }

    // Assinatura abre o modal de planos
    if (tabId === 'subscription') {
      // Abre o tab de assinatura normalmente para mostrar status atual
      if (onTabChange) {
        onTabChange(tabId);
        window.scrollTo({ top: 0, behavior: "instant" });
      }
      return;
    }

    // Todas as rotas agora são internas - navegação via tab
    // Removido redirecionamento externo para manter usuário no painel

    // Navegação padrão via tab
    if (onTabChange) {
      onTabChange(tabId);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  const getVariantLabel = () => {
    switch (variant) {
      case 'contador': return 'Contador';
      case 'autonomo': return 'Autônomo';
      case 'empresa': return 'Empresa';
      case 'partner': return 'Parceiro';
      default: return 'Usuário';
    }
  };

  const SidebarLink = ({ item }: { item: SidebarItem }) => {
    const Icon = item.icon;
    const active = activeTab === item.tabId;

    const content = (
      <button
        onClick={() => handleItemClick(item)}
        className={cn(
          'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 group relative',
          'touch-manipulation active:scale-[0.98]',
          active
            ? 'bg-sidebar-accent text-sidebar-primary'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
        )}
      >
        <Icon className={cn(
          'h-4 w-4 shrink-0 transition-colors',
          active ? 'text-sidebar-primary' : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground'
        )} />
        {!collapsed && (
          <>
            <span className="font-medium text-sm flex-1 text-left truncate">{item.label}</span>
            {item.isLive && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
            )}
            {item.isService && (
              <Sparkles className="h-3 w-3 text-primary/60" />
            )}
          </>
        )}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-sidebar-primary rounded-r-full" />
        )}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs px-3 py-1.5">
            <div className="flex items-center gap-2">
              {item.label}
              {item.isLive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
              {item.isService && <Sparkles className="h-3 w-3 text-primary" />}
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen transition-all duration-300 flex flex-col',
          'bg-sidebar border-r border-sidebar-border safe-area-top overflow-hidden',
          collapsed ? 'w-14' : 'w-60'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-sidebar-border">
          <div className={cn('flex items-center gap-2', collapsed && 'justify-center w-full')}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sidebar-primary to-sidebar-primary/60 flex items-center justify-center shadow-sm">
              <Brain className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <span className="text-sm font-bold text-sidebar-foreground tracking-tight">AtentAI</span>
                <span className="block text-[9px] text-sidebar-primary font-medium -mt-0.5">{getVariantLabel()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="absolute -right-3 top-6 h-6 w-6 rounded-full bg-sidebar border border-sidebar-border text-sidebar-foreground/70 hover:text-sidebar-foreground hidden lg:flex shadow-sm"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-3 overflow-y-auto overscroll-contain">
          {groups.map((group) => (
            <div key={group.id}>
              {!collapsed && (
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <SidebarLink key={item.tabId} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="px-2 py-2 border-t border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 py-2 mb-1">
              <div className="h-7 w-7 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-sidebar-primary">
                  {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">
                  {profile?.full_name?.split(' ')[0] || 'Usuário'}
                </p>
              </div>
            </div>
          )}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={handleSignOut}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
                  'text-sidebar-foreground/60 hover:bg-destructive/20 hover:text-destructive',
                  'touch-manipulation active:scale-[0.98]',
                  collapsed && 'justify-center'
                )}
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && <span className="text-xs">Sair</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="text-xs">
                Sair
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>

      {/* Upgrade Modal */}
      <InPanelUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        upgradeType={upgradeType}
        serviceKey={selectedServiceKey || undefined}
        planType={selectedPlanType || undefined}
        onSuccess={() => setUpgradeModalOpen(false)}
      />
    </TooltipProvider>
  );
};

export default AppSidebar;