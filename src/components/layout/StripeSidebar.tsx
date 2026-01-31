import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  BarChart3,
  Shield,
  Scale,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Users,
  Building2,
  CreditCard,
  Bell,
  FileText,
  TrendingUp,
  Wallet,
  Target,
  PieChart,
  Star,
  Brain,
  Activity,
  User,
  UserCheck,
  MessagesSquare,
  MessageCircle,
  LayoutDashboard,
  DollarSign,
  Zap,
  AlertTriangle,
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
  badge?: string | number;
}

interface SidebarGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  items: SidebarItem[];
  defaultOpen?: boolean;
}

interface StripeSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  variant?: 'admin' | 'contador' | 'autonomo' | 'empresa';
}

// Estrutura para Admin - Sidebar DEFINITIVA
// REGRA: Chat é o CORE. Documentos fluem do chat. Serviços são contexto.
const adminGroups: SidebarGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    defaultOpen: true,
    items: [
      { icon: LayoutDashboard, label: 'Visão Geral', tabId: 'overview' },
      { icon: Activity, label: 'Tempo Real', tabId: 'realtime', isLive: true },
      { icon: Bell, label: 'Alertas', tabId: 'alerts' },
    ],
  },
  {
    id: 'guilherme',
    label: 'Guilherme',
    icon: User,
    defaultOpen: true,
    items: [
      { icon: MessageCircle, label: 'Chat – Guilherme', tabId: 'guilherme-chat', isLive: true },
      { icon: FileText, label: 'Documentos', tabId: 'guilherme-docs' },
      { icon: Shield, label: 'Limpa Nome', tabId: 'limpa-nome' },
      { icon: Scale, label: 'Análise Fiscal', tabId: 'modulo-fiscal' },
      { icon: Bell, label: 'Alertas Serviços', tabId: 'guilherme-alerts' },
    ],
  },
  {
    id: 'cesar',
    label: 'César',
    icon: Brain,
    defaultOpen: true,
    items: [
      { icon: MessageCircle, label: 'Chat – César', tabId: 'cesar-chat', isLive: true },
      { icon: FileText, label: 'Documentos', tabId: 'cesar-docs' },
      { icon: BarChart3, label: 'BI Completo', tabId: 'bi-accounting', isLive: true },
    ],
  },
  {
    id: 'metricas',
    label: 'Métricas & Análises',
    icon: TrendingUp,
    items: [
      { icon: TrendingUp, label: 'Métricas SaaS', tabId: 'saas-metrics' },
      { icon: DollarSign, label: 'Previsão Receita', tabId: 'revenue-forecast' },
      { icon: Target, label: 'Churn & Retenção', tabId: 'churn' },
      { icon: PieChart, label: 'Análise Cohort', tabId: 'cohort' },
      { icon: AlertTriangle, label: 'Alertas Performance', tabId: 'performance-alerts' },
    ],
  },
  {
    id: 'documentos',
    label: 'Documentos',
    icon: FileText,
    items: [
      { icon: FileText, label: 'Central de Documentos', tabId: 'documents-central' },
      { icon: Shield, label: 'Docs Limpa Nome', tabId: 'docs-limpa-nome' },
      { icon: Scale, label: 'Docs Fiscal', tabId: 'docs-fiscal' },
      { icon: BarChart3, label: 'Docs Contábeis', tabId: 'docs-bi' },
    ],
  },
  {
    id: 'servicos',
    label: 'Serviços',
    icon: ShoppingBag,
    items: [
      { icon: Shield, label: 'Limpa Nome', tabId: 'limpa-nome' },
      { icon: Scale, label: 'Análise Fiscal', tabId: 'modulo-fiscal' },
      { icon: BarChart3, label: 'BI Contabilidade', tabId: 'bi-accounting' },
    ],
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: ShoppingBag,
    items: [
      { icon: Star, label: 'Ativar Serviços', tabId: 'marketplace-activate' },
      { icon: TrendingUp, label: 'Upgrade', tabId: 'marketplace-upgrade' },
    ],
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: Settings,
    items: [
      { icon: Zap, label: 'Integrações', tabId: 'integrations' },
      { icon: MessageSquare, label: 'WhatsApp API', tabId: 'whatsapp-config' },
      { icon: CreditCard, label: 'Asaas API', tabId: 'asaas-config' },
      { icon: Settings, label: 'API Keys', tabId: 'api-keys' },
      { icon: User, label: 'Perfil', tabId: 'profile' },
      { icon: Shield, label: 'Segurança', tabId: 'security' },
      { icon: FileText, label: 'Auditoria', tabId: 'audit-page' },
      { icon: Shield, label: 'Roles', tabId: 'roles' },
      { icon: Users, label: 'Usuários', tabId: 'users' },
      { icon: Building2, label: 'Parceiros', tabId: 'partners' },
      { icon: Users, label: 'Afiliados', tabId: 'affiliates' },
      { icon: UserCheck, label: 'Contadores', tabId: 'contadores' },
      { icon: Wallet, label: 'Financeiro', tabId: 'financial' },
    ],
  },
];

// Estrutura simplificada para Autônomo
const autonomoGroups: SidebarGroup[] = [
  {
    id: 'central',
    label: 'Central',
    icon: MessageSquare,
    defaultOpen: true,
    items: [
      { icon: MessageSquare, label: 'Chat IA', tabId: 'smart-chat', isLive: true },
      { icon: LayoutDashboard, label: 'Dashboard', tabId: 'dashboard' },
    ],
  },
  {
    id: 'servicos',
    label: 'Meus Serviços',
    icon: ShoppingBag,
    defaultOpen: true,
    items: [
      { icon: Shield, label: 'Limpa Nome', tabId: 'limpa-nome' },
      { icon: Scale, label: 'Análise Fiscal', tabId: 'analise-fiscal' },
      { icon: BarChart3, label: 'BI', tabId: 'bi' },
    ],
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: ShoppingBag,
    items: [
      { icon: ShoppingBag, label: 'Serviços', tabId: 'servicos' },
      { icon: Star, label: 'Upgrade', tabId: 'upgrade' },
    ],
  },
  {
    id: 'conta',
    label: 'Conta',
    icon: Settings,
    items: [
      { icon: FileText, label: 'Documentos', tabId: 'documentos' },
      { icon: CreditCard, label: 'Pagamentos', tabId: 'pagamentos' },
      { icon: Settings, label: 'Configurações', tabId: 'config' },
    ],
  },
];

export const StripeSidebar: React.FC<StripeSidebarProps> = ({
  collapsed,
  onToggle,
  activeTab = 'smart-chat',
  onTabChange,
  variant = 'admin',
}) => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  
  const groups = variant === 'admin' ? adminGroups : autonomoGroups;

  // Estado para grupos abertos
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    groups.forEach(group => {
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
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
          'touch-manipulation active:scale-[0.98]',
          active
            ? 'bg-gradient-to-r from-violet-500/20 to-indigo-500/10 text-white border border-violet-500/30'
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
        )}
      >
        <Icon className={cn(
          'h-4 w-4 shrink-0 transition-colors',
          active ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'
        )} />
        {!collapsed && (
          <>
            <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
            {item.isLive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            )}
            {item.badge && (
              <span className="bg-violet-500/20 text-violet-300 text-xs font-medium px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-violet-400 to-indigo-500 rounded-r-full" />
        )}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs px-3 py-2 flex items-center gap-2 bg-slate-800 border-slate-700 text-white">
            {item.label}
            {item.isLive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  // Verifica se é um grupo de pessoa (Guilherme/César)
  const isPersonGroup = (groupId: string) => groupId === 'guilherme' || groupId === 'cesar';

  const SidebarGroupComponent = ({ group }: { group: SidebarGroup }) => {
    const Icon = group.icon;
    const isOpen = openGroups[group.id];
    const hasActiveItem = group.items.some(item => item.tabId === activeTab);
    const isPerson = isPersonGroup(group.id);

    if (collapsed) {
      return (
        <div className="space-y-1 py-1">
          {group.items.slice(0, 2).map((item) => (
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
              'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group',
              isPerson && 'bg-slate-900/50 border border-slate-800/50',
              hasActiveItem
                ? 'text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
            )}
          >
            {isPerson ? (
              <div className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm',
                group.id === 'guilherme' 
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
                  : 'bg-gradient-to-br from-violet-500 to-indigo-600'
              )}>
                {group.label[0]}
              </div>
            ) : (
              <Icon className="h-4 w-4 shrink-0 text-slate-500" />
            )}
            <span className={cn(
              'flex-1 text-left tracking-wide',
              isPerson ? 'text-sm font-semibold text-white' : 'text-xs font-semibold uppercase text-slate-500'
            )}>
              {group.label}
            </span>
            <ChevronDown className={cn(
              'h-4 w-4 text-slate-500 transition-transform duration-200',
              isOpen && 'rotate-180'
            )} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className={cn(
          'pt-1 space-y-1',
          isPerson ? 'pl-3 ml-4 border-l border-slate-800/50' : 'pl-2'
        )}>
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
          'bg-slate-950 border-r border-slate-800/50',
          collapsed ? 'w-16' : 'w-72'
        )}
      >
        {/* Logo - Premium Dark */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/50">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center w-full')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <span className="text-lg font-bold text-white tracking-tight">AtentAI</span>
                <span className="block text-[11px] text-violet-400 font-medium -mt-0.5 tracking-wide">
                  {variant === 'admin' ? 'Painel Administrativo' : variant === 'autonomo' ? 'Autônomo' : variant}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button - Premium */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="absolute -right-3 top-8 h-6 w-6 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 hidden lg:flex shadow-lg"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>

        {/* Navigation - Premium Dark */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
          {groups.map((group) => (
            <SidebarGroupComponent key={group.id} group={group} />
          ))}
        </nav>

        {/* User Section - Premium */}
        <div className="px-3 py-4 border-t border-slate-800/50">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-slate-900/50">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-white">
                  {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {profile?.full_name?.split(' ')[0] || 'Usuário'}
                </p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={handleSignOut}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                  'text-slate-400 hover:bg-red-500/10 hover:text-red-400',
                  'touch-manipulation active:scale-[0.98]',
                  collapsed && 'justify-center'
                )}
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && <span className="text-sm font-medium">Sair</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="text-xs bg-slate-800 border-slate-700 text-white">
                Sair
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default StripeSidebar;
