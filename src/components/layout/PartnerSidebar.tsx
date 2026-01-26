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
  Moon,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  isDark?: boolean;
  onThemeToggle?: () => void;
}

const PartnerSidebar: React.FC<PartnerSidebarProps> = ({
  collapsed,
  onToggle,
  activeTab = 'overview',
  onTabChange,
  pendingCount = 0,
  partnerName,
  isDark = false,
  onThemeToggle,
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
            ? isDark 
              ? 'bg-emerald-500/20 text-emerald-400 font-medium' 
              : 'bg-emerald-100 text-emerald-700 font-medium'
            : isDark 
              ? 'text-slate-400 hover:bg-slate-800 hover:text-white' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        )}
      >
        <Icon className={cn(
          'h-5 w-5 shrink-0 transition-colors',
          active 
            ? isDark ? 'text-emerald-400' : 'text-emerald-600' 
            : isDark ? 'text-slate-500 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-700'
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
          <div className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full",
            isDark ? 'bg-emerald-400' : 'bg-emerald-600'
          )} />
        )}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent 
            side="right" 
            className={cn(
              "text-xs px-3 py-1.5 shadow-lg",
              isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-200'
            )}
          >
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
          isDark 
            ? 'bg-slate-900 border-r border-slate-800' 
            : 'bg-white border-r border-slate-200 shadow-lg',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center justify-between px-4 py-4 border-b flex-shrink-0",
          isDark ? 'border-slate-800' : 'border-slate-200'
        )}>
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center w-full')}>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md flex-shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <span className={cn("text-base font-bold", isDark ? 'text-white' : 'text-slate-900')}>AtentAI</span>
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
          className={cn(
            "absolute -right-3 top-7 h-6 w-6 rounded-full hidden lg:flex shadow-md",
            isDark 
              ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' 
              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
          )}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>

        {/* Partner Info (when not collapsed) */}
        {!collapsed && partnerName && (
          <div className={cn(
            "px-4 py-3 border-b flex-shrink-0",
            isDark ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
          )}>
            <p className={cn("text-xs font-medium", isDark ? 'text-slate-400' : 'text-slate-500')}>Empresa</p>
            <p className={cn("text-sm font-semibold truncate", isDark ? 'text-white' : 'text-slate-900')}>{partnerName}</p>
          </div>
        )}

        {/* Navigation - ScrollArea for proper scroll containment */}
        <ScrollArea className="flex-1 min-h-0">
          <nav className="px-2 py-4 space-y-1">
            {items.map((item) => (
              <SidebarLink key={item.tabId} item={item} />
            ))}
          </nav>
        </ScrollArea>

        {/* Theme Toggle & User & Logout - Fixed at bottom */}
        <div className={cn(
          "px-2 py-3 border-t flex-shrink-0",
          isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
        )}>
          {/* Theme Toggle */}
          {onThemeToggle && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={onThemeToggle}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all mb-2',
                    'touch-manipulation active:scale-[0.98]',
                    isDark 
                      ? 'text-slate-400 hover:bg-slate-800 hover:text-white' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    collapsed && 'justify-center'
                  )}
                >
                  {isDark ? (
                    <Sun className="h-5 w-5 text-amber-400" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                  {!collapsed && (
                    <span className="text-sm">{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
                  )}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className={cn(
                  "text-xs px-3 py-1.5 shadow-lg",
                  isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-200'
                )}>
                  {isDark ? 'Modo Claro' : 'Modo Escuro'}
                </TooltipContent>
              )}
            </Tooltip>
          )}
          
          {!collapsed && (
            <div className={cn(
              "flex items-center gap-3 px-4 py-2 mb-2",
              isDark ? 'text-white' : 'text-slate-900'
            )}>
              <div className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center",
                isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
              )}>
                <span className={cn("text-sm font-bold", isDark ? 'text-emerald-400' : 'text-emerald-700')}>
                  {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'P'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium truncate", isDark ? 'text-white' : 'text-slate-900')}>
                  {profile?.full_name?.split(' ')[0] || 'Parceiro'}
                </p>
                <p className={cn("text-xs truncate", isDark ? 'text-slate-400' : 'text-slate-500')}>{user?.email}</p>
              </div>
            </div>
          )}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={handleSignOut}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                  'hover:bg-red-50 hover:text-red-600',
                  'touch-manipulation active:scale-[0.98]',
                  isDark ? 'text-slate-400' : 'text-slate-600',
                  collapsed && 'justify-center'
                )}
              >
                <LogOut className="h-5 w-5" />
                {!collapsed && <span className="text-sm font-medium">Sair</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className={cn(
                "text-xs shadow-lg",
                isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-200'
              )}>
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
