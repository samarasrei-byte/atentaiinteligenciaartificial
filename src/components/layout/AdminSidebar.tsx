import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Activity,
  Users,
  Target,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  Headphones,
  UserCheck,
  PieChart,
  Wallet,
  Star,
  MessagesSquare,
  MessageCircle,
  User,
  Settings,
  Sparkles,
  Scale,
  Building2,
  FileText,
  Bell,
  CreditCard,
  Briefcase,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  tabId: string;
  isLive?: boolean;
}

interface SidebarGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  items: SidebarItem[];
  defaultOpen?: boolean;
}

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

// Estrutura hierárquica organizada por modelo mental do administrador
const sidebarGroups: SidebarGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    defaultOpen: true,
    items: [
      { icon: LayoutDashboard, label: 'Visão Geral', tabId: 'overview' },
      { icon: Activity, label: 'Tempo Real', tabId: 'realtime', isLive: true },
    ],
  },
  {
    id: 'bi-accounting',
    label: 'BI + Contabilidade',
    icon: Brain,
    items: [
      { icon: Brain, label: 'Módulo Completo', tabId: 'bi-accounting', isLive: true },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    items: [
      { icon: Sparkles, label: 'Métricas SaaS', tabId: 'saas-metrics' },
      { icon: DollarSign, label: 'Previsão de Receita', tabId: 'revenue-forecast' },
      { icon: TrendingUp, label: 'Churn & Retenção', tabId: 'churn' },
      { icon: Target, label: 'Análise de Cohort', tabId: 'cohort' },
    ],
  },
  {
    id: 'operacao',
    label: 'Operação',
    icon: Briefcase,
    items: [
      { icon: Users, label: 'Usuários', tabId: 'users' },
      { icon: Building2, label: 'Empresas', tabId: 'empresas' },
      { icon: User, label: 'Autônomos', tabId: 'autonomos' },
      { icon: UserCheck, label: 'Contadores', tabId: 'contadores' },
    ],
  },
  {
    id: 'crescimento',
    label: 'Parceiros & Crescimento',
    icon: TrendingUp,
    items: [
      { icon: Building2, label: 'Parceiros', tabId: 'partners' },
      { icon: Users, label: 'Afiliados', tabId: 'affiliates' },
      { icon: Star, label: 'Cupons de Afiliados', tabId: 'affiliate-coupons' },
    ],
  },
  {
    id: 'produtos',
    label: 'Produtos & Serviços',
    icon: Scale,
    items: [
      { icon: Shield, label: 'Limpa Nome', tabId: 'limpa-nome' },
      { icon: Scale, label: 'Módulo Fiscal', tabId: 'modulo-fiscal' },
      { icon: Calendar, label: 'Consultas', tabId: 'consultations' },
      { icon: Star, label: 'Cashback', tabId: 'cashback' },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: Wallet,
    items: [
      { icon: PieChart, label: 'Assinaturas', tabId: 'subscriptions' },
      { icon: Wallet, label: 'Saques', tabId: 'withdrawals' },
      { icon: CreditCard, label: 'Receitas & Pagamentos', tabId: 'metrics' },
    ],
  },
  {
    id: 'comunicacao',
    label: 'Comunicação',
    icon: MessagesSquare,
    items: [
      { icon: MessageCircle, label: 'Chat com Clientes', tabId: 'client-chat', isLive: true },
      { icon: MessagesSquare, label: 'Mensagens em Massa', tabId: 'mass-messages' },
      { icon: Bell, label: 'Notificações', tabId: 'churn-notifications' },
      { icon: Headphones, label: 'Suporte', tabId: 'support' },
    ],
  },
  {
    id: 'sistema',
    label: 'Sistema',
    icon: Settings,
    items: [
      { icon: Shield, label: 'Gestão de Roles', tabId: 'roles' },
      { icon: FileText, label: 'Logs de Auditoria', tabId: 'audit-logs' },
      { icon: Settings, label: 'Configurações', tabId: 'settings' },
    ],
  },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  onToggle,
  activeTab = 'overview',
  onTabChange,
}) => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  
  // Estado para grupos abertos
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sidebarGroups.forEach(group => {
      // Abre o grupo que contém o item ativo ou grupos marcados como defaultOpen
      const hasActiveItem = group.items.some(item => item.tabId === activeTab);
      initial[group.id] = hasActiveItem || group.defaultOpen || false;
    });
    return initial;
  });

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleItemClick = (tabId: string) => {
    if (tabId === 'roles') {
      navigate('/admin/roles');
      return;
    }
    if (onTabChange) {
      onTabChange(tabId);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const SidebarLink = ({ item }: { item: SidebarItem }) => {
    const Icon = item.icon;
    const active = activeTab === item.tabId;

    const content = (
      <button
        onClick={() => handleItemClick(item.tabId)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative text-sm',
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
            <span className="flex-1 text-left font-medium">{item.label}</span>
            {item.isLive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            )}
          </>
        )}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
        )}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="bg-popover text-popover-foreground border text-xs px-3 py-1.5">
            <div className="flex items-center gap-2">
              {item.label}
              {item.isLive && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  const SidebarGroupComponent = ({ group }: { group: SidebarGroup }) => {
    const Icon = group.icon;
    const isOpen = openGroups[group.id];
    const hasActiveItem = group.items.some(item => item.tabId === activeTab);

    if (collapsed) {
      // No modo colapsado, mostrar apenas os ícones dos items
      return (
        <div className="space-y-1">
          {group.items.map((item) => (
            <SidebarLink key={item.tabId} item={item} />
          ))}
        </div>
      );
    }

    return (
      <Collapsible open={isOpen} onOpenChange={() => toggleGroup(group.id)}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group',
              hasActiveItem
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left text-xs font-semibold uppercase tracking-wider">
              {group.label}
            </span>
            <ChevronDown className={cn(
              'h-4 w-4 transition-transform duration-200',
              isOpen && 'rotate-180'
            )} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-3 pt-1 space-y-0.5">
          {group.items.map((item) => (
            <SidebarLink key={item.tabId} item={item} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen transition-all duration-300 flex flex-col',
          'bg-card border-r border-border',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center w-full')}>
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <span className="text-base font-bold text-foreground">AtentAI</span>
                <span className="block text-[10px] text-primary font-medium -mt-0.5">Admin</span>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onToggle}
          className="absolute -right-3 top-7 h-6 w-6 rounded-full bg-card border text-muted-foreground hover:text-foreground hidden lg:flex shadow-sm"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto overscroll-contain">
          {sidebarGroups.map((group) => (
            <SidebarGroupComponent key={group.id} group={group} />
          ))}
        </nav>

        {/* User & Logout */}
        <div className="px-2 py-3 border-t border-border">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.full_name?.split(' ')[0] || 'Admin'}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={handleSignOut}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                  'text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
                  'touch-manipulation active:scale-[0.98]',
                  collapsed && 'justify-center'
                )}
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && <span className="text-sm">Sair</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="bg-popover text-popover-foreground border text-xs">
                Sair
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default AdminSidebar;
