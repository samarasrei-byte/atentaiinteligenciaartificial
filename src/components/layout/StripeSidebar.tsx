import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  MessageCircle,
  LayoutDashboard,
  FileText,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Users,
  CreditCard,
  Bell,
  User,
  Brain,
  Shield,
  Scale,
  BarChart3,
  Wallet,
  Zap,
  MessageSquare,
  Star,
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
import { useAutoWelcomeMessages } from '@/hooks/useAutoWelcomeMessages';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  tabId: string;
  isLive?: boolean;
  badge?: string | number;
  chatBadge?: 'guilherme' | 'cesar';
}

interface SidebarGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  items: SidebarItem[];
  defaultOpen?: boolean;
  isPerson?: boolean;
  personGradient?: string;
}

interface StripeSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  variant?: 'admin' | 'contador' | 'autonomo' | 'empresa' | 'afiliado';
}

/**
 * SIDEBAR FINAL - ADMIN
 * 
 * Estrutura definitiva com 9 grupos principais:
 * 1. Dashboard
 * 2. Chat – Guilherme (Atendimento / Limpa Nome / Análise Fiscal)
 * 3. Chat – César (BI & Contabilidade)
 * 4. Documentos
 * 5. Serviços
 * 6. Marketplace
 * 7. Usuários
 * 8. Financeiro
 * 9. Configurações
 */
const adminGroups: SidebarGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    defaultOpen: true,
    items: [
      { icon: LayoutDashboard, label: 'Visão Geral', tabId: 'overview' },
      { icon: Bell, label: 'Alertas', tabId: 'alerts' },
    ],
  },
  {
    id: 'guilherme',
    label: 'Guilherme',
    icon: User,
    defaultOpen: true,
    isPerson: true,
    personGradient: 'from-emerald-500 to-teal-600',
    items: [
      { icon: MessageCircle, label: 'Chat', tabId: 'guilherme-chat', isLive: true, chatBadge: 'guilherme' },
      { icon: Shield, label: 'Limpa Nome', tabId: 'limpa-nome' },
      { icon: Scale, label: 'Análise Fiscal', tabId: 'modulo-fiscal' },
    ],
  },
  {
    id: 'cesar',
    label: 'César',
    icon: Brain,
    defaultOpen: true,
    isPerson: true,
    personGradient: 'from-violet-500 to-indigo-600',
    items: [
      { icon: MessageCircle, label: 'Chat', tabId: 'cesar-chat', isLive: true, chatBadge: 'cesar' },
      { icon: BarChart3, label: 'BI Completo', tabId: 'bi-accounting', isLive: true },
    ],
  },
  // REMOVIDO: Central de Documentos - documentos agora ficam dentro de cada serviço
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
    ],
  },
  {
    id: 'usuarios',
    label: 'Usuários',
    icon: Users,
    items: [
      { icon: Users, label: 'Todos os Usuários', tabId: 'users' },
      { icon: Shield, label: 'Roles', tabId: 'roles' },
      { icon: Users, label: 'Contadores', tabId: 'contadores' },
      { icon: Users, label: 'Afiliados', tabId: 'affiliates' },
      { icon: Users, label: 'Parceiros', tabId: 'partners' },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: Wallet,
    items: [
      { icon: Wallet, label: 'Módulo Completo', tabId: 'financial-module' },
      { icon: Wallet, label: 'Receitas', tabId: 'revenue' },
      { icon: CreditCard, label: 'Assinaturas', tabId: 'subscriptions' },
      { icon: Wallet, label: 'Saques', tabId: 'withdrawals' },
    ],
  },
  {
    id: 'integracoes',
    label: 'Integrações',
    icon: Zap,
    items: [
      { icon: Zap, label: 'Central', tabId: 'integrations' },
      { icon: MessageSquare, label: 'WhatsApp API', tabId: 'whatsapp-config' },
      { icon: CreditCard, label: 'Asaas API', tabId: 'asaas-config' },
      { icon: Settings, label: 'API Keys', tabId: 'api-keys' },
    ],
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: Settings,
    items: [
      { icon: User, label: 'Perfil', tabId: 'profile' },
      { icon: Shield, label: 'Segurança', tabId: 'security' },
      { icon: FileText, label: 'Auditoria', tabId: 'audit-page' },
    ],
  },
];

// Estrutura para Autônomo (mesmo design, itens diferentes)
const autonomoGroups: SidebarGroup[] = [
  {
    id: 'atendimento',
    label: 'Atendimento',
    icon: MessageSquare,
    defaultOpen: true,
    isPerson: true,
    personGradient: 'from-emerald-500 to-teal-600',
    items: [
      { icon: MessageCircle, label: 'Chat Guilherme', tabId: 'chat-guilherme', isLive: true, chatBadge: 'guilherme' },
      { icon: MessageCircle, label: 'Chat César', tabId: 'chat-cesar', isLive: true, chatBadge: 'cesar' },
    ],
  },
  {
    id: 'central',
    label: 'Central',
    icon: LayoutDashboard,
    defaultOpen: true,
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', tabId: 'dashboard' },
      { icon: MessageSquare, label: 'Chat IA', tabId: 'ai-chat' },
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

// Estrutura para Contador (mesmo design)
const contadorGroups: SidebarGroup[] = [
  {
    id: 'central',
    label: 'Central',
    icon: LayoutDashboard,
    defaultOpen: true,
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', tabId: 'overview' },
      { icon: MessageCircle, label: 'Chat Clientes', tabId: 'chat', isLive: true },
    ],
  },
  {
    id: 'servicos',
    label: 'Serviços',
    icon: ShoppingBag,
    defaultOpen: true,
    items: [
      { icon: Shield, label: 'Limpa Nome', tabId: 'limpa-nome' },
      { icon: Scale, label: 'Análise Fiscal', tabId: 'modulo-fiscal' },
      { icon: FileText, label: 'IR', tabId: 'ir' },
      { icon: FileText, label: 'Certidões', tabId: 'certidoes' },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: Wallet,
    items: [
      { icon: Wallet, label: 'Ganhos', tabId: 'earnings' },
      { icon: Wallet, label: 'Saques', tabId: 'saques' },
    ],
  },
  {
    id: 'conta',
    label: 'Conta',
    icon: Settings,
    items: [
      { icon: User, label: 'Perfil', tabId: 'profile' },
      { icon: Settings, label: 'Stripe Connect', tabId: 'stripe-connect' },
    ],
  },
];

// Estrutura para Empresa (mesmo design)
const empresaGroups: SidebarGroup[] = [
  {
    id: 'atendimento',
    label: 'Atendimento',
    icon: MessageSquare,
    defaultOpen: true,
    isPerson: true,
    personGradient: 'from-emerald-500 to-teal-600',
    items: [
      { icon: MessageCircle, label: 'Chat Guilherme', tabId: 'chat-guilherme', isLive: true, chatBadge: 'guilherme' },
      { icon: MessageCircle, label: 'Chat César', tabId: 'chat-cesar', isLive: true, chatBadge: 'cesar' },
    ],
  },
  {
    id: 'central',
    label: 'Central',
    icon: LayoutDashboard,
    defaultOpen: true,
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', tabId: 'overview' },
      { icon: MessageCircle, label: 'Chat IA', tabId: 'ai-chat' },
    ],
  },
  {
    id: 'servicos',
    label: 'Serviços',
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
    ],
  },
  {
    id: 'conta',
    label: 'Conta',
    icon: Settings,
    items: [
      { icon: FileText, label: 'Documentos', tabId: 'documentos' },
      { icon: CreditCard, label: 'Pagamentos', tabId: 'pagamentos' },
      { icon: User, label: 'Perfil', tabId: 'profile' },
    ],
  },
];

// Estrutura para Afiliado (mesmo design)
const afiliadoGroups: SidebarGroup[] = [
  {
    id: 'central',
    label: 'Central',
    icon: LayoutDashboard,
    defaultOpen: true,
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', tabId: 'overview' },
    ],
  },
  {
    id: 'leads',
    label: 'Leads',
    icon: Users,
    defaultOpen: true,
    items: [
      { icon: Users, label: 'Meus Leads', tabId: 'leads' },
      { icon: Star, label: 'Cupons', tabId: 'cupons' },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: Wallet,
    items: [
      { icon: Wallet, label: 'Comissões', tabId: 'comissoes' },
      { icon: Wallet, label: 'Saques', tabId: 'saques' },
    ],
  },
  {
    id: 'conta',
    label: 'Conta',
    icon: Settings,
    items: [
      { icon: User, label: 'Perfil', tabId: 'profile' },
    ],
  },
];

export const StripeSidebar: React.FC<StripeSidebarProps> = ({
  collapsed,
  onToggle,
  activeTab = 'overview',
  onTabChange,
  variant = 'admin',
}) => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { unreadGuilherme, unreadCesar, markAsRead, hasBIAccess } = useAutoWelcomeMessages();
  
  const getGroups = () => {
    switch (variant) {
      case 'admin': return adminGroups;
      case 'contador': return contadorGroups;
      case 'autonomo': return autonomoGroups;
      case 'empresa': return empresaGroups;
      case 'afiliado': return afiliadoGroups;
      default: return adminGroups;
    }
  };
  
  const groups = getGroups();

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

  const handleItemClick = (tabId: string, chatBadge?: 'guilherme' | 'cesar') => {
    // Mark chat as read when clicked
    if (chatBadge) {
      markAsRead(chatBadge);
    }
    
    if (onTabChange) {
      onTabChange(tabId);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  // Get unread count for a chat badge type
  const getUnreadCount = (chatBadge?: 'guilherme' | 'cesar') => {
    if (!chatBadge) return 0;
    return chatBadge === 'guilherme' ? unreadGuilherme : unreadCesar;
  };

  const SidebarLink = ({ item }: { item: SidebarItem }) => {
    const Icon = item.icon;
    const active = activeTab === item.tabId;
    const unreadCount = getUnreadCount(item.chatBadge);

    const content = (
      <button
        onClick={() => handleItemClick(item.tabId, item.chatBadge)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
          'touch-manipulation active:scale-[0.98]',
          active
            ? 'bg-gradient-to-r from-violet-500/20 to-indigo-500/10 text-white border border-violet-500/30'
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
        )}
      >
        <div className="relative">
          <Icon className={cn(
            'h-4 w-4 shrink-0 transition-colors',
            active ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'
          )} />
          {/* Unread badge on icon */}
          {unreadCount > 0 && collapsed && (
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-slate-950" />
          )}
        </div>
        {!collapsed && (
          <>
            <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
            {/* Unread count badge */}
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold min-w-[1.25rem] h-5 px-1.5 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
            {item.isLive && !unreadCount && (
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
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
            {item.isLive && !unreadCount && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
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
              group.isPerson && 'bg-slate-900/50 border border-slate-800/50',
              hasActiveItem
                ? 'text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
            )}
          >
            {group.isPerson ? (
              <div className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br',
                group.personGradient
              )}>
                {group.label[0]}
              </div>
            ) : (
              <Icon className="h-4 w-4 shrink-0 text-slate-500" />
            )}
            <span className={cn(
              'flex-1 text-left tracking-wide',
              group.isPerson ? 'text-sm font-semibold text-white' : 'text-xs font-semibold uppercase text-slate-500'
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
          group.isPerson ? 'pl-3 ml-4 border-l border-slate-800/50' : 'pl-2'
        )}>
          {group.items.map((item) => (
            <SidebarLink key={item.tabId} item={item} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const getVariantLabel = () => {
    switch (variant) {
      case 'admin': return 'Painel Administrativo';
      case 'contador': return 'Painel Contador';
      case 'autonomo': return 'Painel Autônomo';
      case 'empresa': return 'Painel Empresa';
      case 'afiliado': return 'Painel Afiliado';
      default: return 'Painel';
    }
  };

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen transition-all duration-300 flex flex-col',
          'bg-slate-950 border-r border-slate-800/50',
          collapsed ? 'w-16' : 'w-72'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/50">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center w-full')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <span className="text-lg font-bold text-white tracking-tight">AtentAI</span>
                <span className="block text-[11px] text-violet-400 font-medium -mt-0.5 tracking-wide">
                  {getVariantLabel()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="absolute -right-3 top-8 h-6 w-6 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 hidden lg:flex shadow-lg"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
          {groups.map((group) => (
            <SidebarGroupComponent key={group.id} group={group} />
          ))}
        </nav>

        {/* User */}
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
    </>
  );
};

export default StripeSidebar;
