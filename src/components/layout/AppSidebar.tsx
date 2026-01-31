import React from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  tabId: string;
  badge?: string;
  badgeColor?: string;
  isLive?: boolean;
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

// EMPRESA - BI centrado
const empresaGroups: SidebarGroup[] = [
  {
    id: 'bi',
    label: 'BI Contabilidade',
    items: [
      { icon: Brain, label: 'Meu BI', tabId: 'bi', isLive: true },
      { icon: LayoutDashboard, label: 'Dashboard', tabId: 'overview' },
      { icon: TrendingUp, label: 'Economize', tabId: 'economia' },
    ],
  },
  {
    id: 'comunicacao',
    label: 'Comunicação',
    items: [
      { icon: MessageCircle, label: 'Chat Especialista', tabId: 'chat-contador', isLive: true },
      { icon: Bot, label: 'Agente IA', tabId: 'ai-chat' },
      { icon: Bell, label: 'Notificações', tabId: 'notifications' },
    ],
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    items: [
      { icon: ShoppingBag, label: 'Serviços', tabId: 'servicos' },
      { icon: Star, label: 'Upgrade', tabId: 'upgrade' },
    ],
  },
  {
    id: 'conta',
    label: 'Conta',
    items: [
      { icon: Wallet, label: 'Assinatura', tabId: 'subscription' },
      { icon: User, label: 'Perfil', tabId: 'profile' },
      { icon: Headphones, label: 'Suporte', tabId: 'support' },
    ],
  },
];

// AUTÔNOMO - BI centrado
const autonomoGroups: SidebarGroup[] = [
  {
    id: 'bi',
    label: 'BI Contabilidade',
    items: [
      { icon: Brain, label: 'Meu BI', tabId: 'bi', isLive: true },
      { icon: LayoutDashboard, label: 'Dashboard', tabId: 'dashboard' },
      { icon: BarChart3, label: 'Financeiro', tabId: 'financeiro' },
      { icon: Target, label: 'Metas', tabId: 'metas' },
    ],
  },
  {
    id: 'comunicacao',
    label: 'Comunicação',
    items: [
      { icon: MessageCircle, label: 'Chat Especialista', tabId: 'chat-contador', isLive: true },
      { icon: Bot, label: 'Chat IA', tabId: 'ai-chat' },
      { icon: Bell, label: 'Alertas', tabId: 'notifications' },
    ],
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    items: [
      { icon: ShoppingBag, label: 'Serviços', tabId: 'servicos' },
      { icon: Building2, label: 'Abrir Empresa', tabId: 'abertura-empresa' },
    ],
  },
  {
    id: 'conta',
    label: 'Conta',
    items: [
      { icon: History, label: 'Histórico', tabId: 'history' },
      { icon: Wallet, label: 'Assinatura', tabId: 'subscription' },
      { icon: User, label: 'Meu Perfil', tabId: 'profile' },
      { icon: Headphones, label: 'Suporte', tabId: 'support' },
    ],
  },
];

// CONTADOR - SEM Limpa Nome e Fiscal no sidebar (vão pro Marketplace)
const contadorGroups: SidebarGroup[] = [
  {
    id: 'bi',
    label: 'BI Contabilidade',
    items: [
      { icon: Brain, label: 'Meu BI', tabId: 'bi', isLive: true },
      { icon: LayoutDashboard, label: 'Visão Geral', tabId: 'overview' },
      { icon: BarChart3, label: 'Métricas', tabId: 'stats' },
    ],
  },
  {
    id: 'comunicacao',
    label: 'Comunicação',
    items: [
      { icon: MessageCircle, label: 'Chat Clientes', tabId: 'chat', isLive: true },
      { icon: Bell, label: 'Notificações', tabId: 'notifications' },
    ],
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    items: [
      { icon: Shield, label: 'Limpa Nome', tabId: 'limpa-nome' },
      { icon: Scale, label: 'Análise Fiscal', tabId: 'analise-fiscal' },
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
    label: 'Conta',
    items: [
      { icon: User, label: 'Meu Perfil', tabId: 'profile' },
    ],
  },
];

// PARTNER
const partnerGroups: SidebarGroup[] = [
  {
    id: 'bi',
    label: 'BI Contabilidade',
    items: [
      { icon: Brain, label: 'Meu BI', tabId: 'bi', isLive: true },
      { icon: LayoutDashboard, label: 'Visão Geral', tabId: 'overview' },
      { icon: BarChart3, label: 'Métricas', tabId: 'metrics' },
    ],
  },
  {
    id: 'comunicacao',
    label: 'Comunicação',
    items: [
      { icon: MessageCircle, label: 'Chat Clientes', tabId: 'chat', isLive: true },
      { icon: Bell, label: 'Notificações', tabId: 'notifications' },
    ],
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    items: [
      { icon: Shield, label: 'Limpa Nome', tabId: 'limpa-nome' },
      { icon: Scale, label: 'Módulo Fiscal', tabId: 'modulo-fiscal' },
    ],
  },
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
    label: 'Conta',
    items: [
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

  const handleItemClick = (tabId: string) => {
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
        onClick={() => handleItemClick(item.tabId)}
        className={cn(
          'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 group relative',
          'touch-manipulation active:scale-[0.98]',
          active
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
        )}
      >
        <Icon className={cn(
          'h-4 w-4 shrink-0 transition-colors',
          active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
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
          </>
        )}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-r-full" />
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
          'bg-card border-r border-border safe-area-top overflow-hidden',
          collapsed ? 'w-14' : 'w-60'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-border">
          <div className={cn('flex items-center gap-2', collapsed && 'justify-center w-full')}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-sm">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <span className="text-sm font-bold text-foreground tracking-tight">AtentAI</span>
                <span className="block text-[9px] text-primary font-medium -mt-0.5">{getVariantLabel()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="absolute -right-3 top-6 h-6 w-6 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hidden lg:flex shadow-sm"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-3 overflow-y-auto overscroll-contain">
          {groups.map((group) => (
            <div key={group.id}>
              {!collapsed && (
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
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
        <div className="px-2 py-2 border-t border-border">
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 py-2 mb-1">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">
                  {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
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
                  'text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
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
    </TooltipProvider>
  );
};

export default AppSidebar;