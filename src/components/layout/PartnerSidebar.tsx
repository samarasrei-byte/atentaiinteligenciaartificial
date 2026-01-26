import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Shield,
  Scale,
  MessagesSquare,
  DollarSign,
  Wallet,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  TrendingUp,
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
  badge?: number;
  isLive?: boolean;
}

interface PartnerSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  pendingCount?: number;
  partnerName?: string;
}

const PartnerSidebar: React.FC<PartnerSidebarProps> = ({
  collapsed,
  onToggle,
  activeTab = 'overview',
  onTabChange,
  pendingCount = 0,
  partnerName,
}) => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const items: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', tabId: 'overview' },
    { icon: Shield, label: 'Limpa Nome', tabId: 'limpa-nome', badge: pendingCount > 0 ? pendingCount : undefined, isLive: true },
    { icon: Scale, label: 'Módulo Fiscal', tabId: 'modulo-fiscal', isLive: true },
    { icon: MessagesSquare, label: 'Chat com Clientes', tabId: 'chat' },
    { icon: ShoppingBag, label: 'Serviços AtentAI', tabId: 'services' },
    { icon: TrendingUp, label: 'Métricas', tabId: 'metrics' },
    { icon: DollarSign, label: 'Comissões', tabId: 'commissions' },
    { icon: Wallet, label: 'Saques', tabId: 'withdrawals' },
    { icon: User, label: 'Meu Perfil', tabId: 'profile' },
    { icon: Settings, label: 'Configurações', tabId: 'settings' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleItemClick = (tabId: string) => {
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
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative',
          'touch-manipulation active:scale-[0.98]',
          active
            ? 'bg-emerald-100 text-emerald-700 font-medium'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        )}
      >
        <Icon className={cn(
          'h-5 w-5 shrink-0 transition-colors',
          active ? 'text-emerald-600' : 'text-slate-500 group-hover:text-slate-700'
        )} />
        {!collapsed && (
          <>
            <span className="text-sm flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className="h-5 min-w-5 px-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                {item.badge}
              </span>
            )}
            {item.isLive && !item.badge && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            )}
          </>
        )}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-600 rounded-r-full" />
        )}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="bg-white text-slate-900 border border-slate-200 text-xs px-3 py-1.5 shadow-lg">
            <div className="flex items-center gap-2">
              {item.label}
              {item.badge && (
                <span className="h-4 min-w-4 px-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
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
          'bg-white border-r border-slate-200 shadow-lg',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center w-full')}>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <span className="text-base font-bold text-slate-900">AtentAI</span>
                <span className="block text-[10px] text-emerald-600 font-semibold -mt-0.5">Parceiro</span>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onToggle}
          className="absolute -right-3 top-7 h-6 w-6 rounded-full bg-white border-slate-200 text-slate-600 hover:text-slate-900 hidden lg:flex shadow-md"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>

        {/* Partner Info (when not collapsed) */}
        {!collapsed && partnerName && (
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
            <p className="text-xs text-slate-500 font-medium">Empresa</p>
            <p className="text-sm font-semibold text-slate-900 truncate">{partnerName}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overscroll-contain">
          {items.map((item) => (
            <SidebarLink key={item.tabId} item={item} />
          ))}
        </nav>

        {/* User & Logout */}
        <div className="px-2 py-3 border-t border-slate-200 bg-slate-50">
          {!collapsed && (
            <div className="flex items-center gap-3 px-4 py-2 mb-2">
              <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-sm font-bold text-emerald-700">
                  {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'P'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {profile?.full_name?.split(' ')[0] || 'Parceiro'}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={handleSignOut}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                  'text-slate-600 hover:bg-red-50 hover:text-red-600',
                  'touch-manipulation active:scale-[0.98]',
                  collapsed && 'justify-center'
                )}
              >
                <LogOut className="h-5 w-5" />
                {!collapsed && <span className="text-sm font-medium">Sair</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="bg-white text-slate-900 border border-slate-200 text-xs shadow-lg">
                Sair
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default PartnerSidebar;
