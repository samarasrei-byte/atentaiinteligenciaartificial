import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Activity,
  Users,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  TrendingUp,
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
  Brain,
  ShoppingBag,
  Target,
  Calendar,
  Zap,
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
  badge?: string;
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

// NOVA HIERARQUIA ZANINE: BI → Comunicação → Marketplace → Sistema
const sidebarGroups: SidebarGroup[] = [
  // 1️⃣ EMISSÃO DE NF - Produto principal, âncora do sistema
  {
    id: 'emissao-nf',
    label: 'Emissão de NF',
    icon: FileText,
    defaultOpen: true,
    items: [
      { icon: FileText, label: 'Módulo Completo', tabId: 'bi-accounting', isLive: true },
      { icon: LayoutDashboard, label: 'Dashboard', tabId: 'overview' },
      { icon: Activity, label: 'Tempo Real', tabId: 'realtime', isLive: true },
      { icon: BarChart3, label: 'Métricas SaaS', tabId: 'saas-metrics' },
      { icon: DollarSign, label: 'Previsão Receita', tabId: 'revenue-forecast' },
      { icon: TrendingUp, label: 'Churn & Retenção', tabId: 'churn' },
      { icon: Target, label: 'Análise Cohort', tabId: 'cohort' },
    ],
  },
  // 2️⃣ COMUNICAÇÃO - Central de atendimento (Guilherme) + Chat BI (César) + Notificações + Alertas
  {
    id: 'comunicacao',
    label: 'Comunicação',
    icon: MessagesSquare,
    defaultOpen: true,
    items: [
      { icon: MessageCircle, label: 'Central de Atendimento', tabId: 'client-chat', isLive: true, badge: 'Guilherme' },
      { icon: FileText, label: 'Chat Emissão de NF', tabId: 'smart-chat', isLive: true },
      { icon: Bell, label: 'Notificações', tabId: 'churn-notifications' },
      { icon: Sparkles, label: 'Alertas de KPI', tabId: 'kpi-alerts', isLive: true },
      { icon: MessagesSquare, label: 'Mensagens em Massa', tabId: 'mass-messages' },
      { icon: Headphones, label: 'Suporte', tabId: 'support' },
    ],
  },
  // 3️⃣ MARKETPLACE - Limpa Nome, Análise Fiscal, outros serviços
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: ShoppingBag,
    items: [
      { icon: Shield, label: 'Limpa Nome', tabId: 'limpa-nome' },
      { icon: Scale, label: 'Análise Fiscal', tabId: 'modulo-fiscal' },
      { icon: Calendar, label: 'Consultas', tabId: 'consultations' },
      { icon: Star, label: 'Cashback', tabId: 'cashback' },
    ],
  },
  // 4️⃣ USUÁRIOS & PARCEIROS
  {
    id: 'usuarios',
    label: 'Usuários & Parceiros',
    icon: Users,
    items: [
      { icon: Users, label: 'Todos os Usuários', tabId: 'users' },
      { icon: UserCheck, label: 'Contadores', tabId: 'contadores' },
      { icon: Building2, label: 'Parceiros', tabId: 'partners' },
      { icon: Users, label: 'Afiliados', tabId: 'affiliates' },
      { icon: Star, label: 'Cupons Afiliados', tabId: 'affiliate-coupons' },
    ],
  },
  // 5️⃣ FINANCEIRO
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: Wallet,
    items: [
      { icon: DollarSign, label: 'Divisão Sócios', tabId: 'partner-split' },
      { icon: PieChart, label: 'Assinaturas', tabId: 'subscriptions' },
      { icon: Wallet, label: 'Saques', tabId: 'withdrawals' },
      { icon: CreditCard, label: 'Pagamentos', tabId: 'metrics' },
    ],
  },
  // 6️⃣ SISTEMA & ADMIN
  {
    id: 'sistema',
    label: 'Configurações',
    icon: Settings,
    items: [
      { icon: Settings, label: 'Gestão de Serviços', tabId: 'service-management' },
      { icon: LayoutDashboard, label: 'Gestão de Painéis', tabId: 'panel-management' },
      { icon: Zap, label: 'Integrações', tabId: 'integrations' },
      { icon: Shield, label: 'Gestão de Roles', tabId: 'roles' },
      { icon: FileText, label: 'Auditoria', tabId: 'audit-page' },
      { icon: FileText, label: 'Logs', tabId: 'audit-logs' },
    ],
  },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  onToggle,
  activeTab = 'bi-accounting',
  onTabChange,
}) => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sidebarGroups.forEach(group => {
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
          'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 group relative text-sm',
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
            <span className="flex-1 text-left font-medium truncate">{item.label}</span>
            {item.isLive && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
            )}
            {item.badge && (
              <span className="text-[9px] font-medium text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                {item.badge}
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

  const SidebarGroupComponent = ({ group }: { group: SidebarGroup }) => {
    const Icon = group.icon;
    const isOpen = openGroups[group.id];
    const hasActiveItem = group.items.some(item => item.tabId === activeTab);

    if (collapsed) {
      return (
        <div className="space-y-0.5">
          {group.items.slice(0, 3).map((item) => (
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
              'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 group',
              hasActiveItem
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
            )}
          >
            <Icon className={cn(
              'h-4 w-4 shrink-0',
              hasActiveItem ? 'text-primary' : 'opacity-70'
            )} />
            <span className="flex-1 text-left text-xs font-semibold uppercase tracking-wider">
              {group.label}
            </span>
            <ChevronDown className={cn(
              'h-3.5 w-3.5 opacity-50 transition-transform duration-200',
              isOpen && 'rotate-180'
            )} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-2 pt-0.5 space-y-0.5">
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
                <span className="block text-[9px] text-primary font-medium -mt-0.5">Admin</span>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button - Minimal */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="absolute -right-3 top-6 h-6 w-6 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hidden lg:flex shadow-sm"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>

        {/* Navigation - Ultra Clean */}
        <nav className="flex-1 px-2 py-3 space-y-1.5 overflow-y-auto overscroll-contain scrollbar-thin">
          {sidebarGroups.map((group) => (
            <SidebarGroupComponent key={group.id} group={group} />
          ))}
        </nav>

        {/* User Section - Minimal */}
        <div className="px-2 py-2 border-t border-border">
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 py-2 mb-1">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">
                  {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {profile?.full_name?.split(' ')[0] || 'Admin'}
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

export default AdminSidebar;