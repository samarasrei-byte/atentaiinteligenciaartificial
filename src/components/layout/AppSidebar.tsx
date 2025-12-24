import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Users,
  Home,
  Target,
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
  PieChart,
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
}

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  variant?: 'user' | 'admin' | 'contador' | 'autonomo';
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const userItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', tabId: 'overview' },
  { icon: Zap, label: 'Piloto Automático', tabId: 'autopilot', badge: 'NEW', badgeColor: 'text-amber-400' },
  { icon: TrendingUp, label: 'Economize', tabId: 'economia', badge: '●', badgeColor: 'text-emerald-400' },
  { icon: BarChart3, label: 'Métricas', tabId: 'metrics', badge: 'PRO', badgeColor: 'text-primary' },
  { icon: Target, label: 'PF ou PJ?', tabId: 'pf-pj-decision' },
  { icon: Bot, label: 'Agente IA', tabId: 'ai-chat', badge: 'PRO', badgeColor: 'text-amber-400' },
  { icon: MessagesSquare, label: 'Falar com Contador', tabId: 'chat-contador' },
  { icon: Wallet, label: 'Assinatura', tabId: 'subscription' },
  { icon: BookOpen, label: 'Glossário', tabId: 'glossary' },
  { icon: History, label: 'Histórico', tabId: 'history' },
  { icon: User, label: 'Perfil', tabId: 'profile' },
  { icon: Headphones, label: 'Suporte', tabId: 'support' },
];

const adminItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Visão Geral', tabId: 'overview' },
  { icon: Users, label: 'Usuários', tabId: 'users' },
  { icon: Shield, label: 'Gestão de Roles', tabId: 'roles' },
  { icon: Wallet, label: 'Saques', tabId: 'withdrawals', badge: 'NEW', badgeColor: 'text-amber-400' },
  { icon: BarChart3, label: 'Métricas', tabId: 'metrics' },
  { icon: DollarSign, label: 'Receitas', tabId: 'revenue' },
  { icon: PieChart, label: 'Assinaturas', tabId: 'subscriptions' },
  { icon: Calendar, label: 'Consultas', tabId: 'consultations' },
  { icon: Headphones, label: 'Suporte', tabId: 'support' },
  { icon: Settings, label: 'Config', tabId: 'settings' },
];

const contadorItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Visão Geral', tabId: 'overview' },
  { icon: Building2, label: 'Abertura Empresa', tabId: 'company-opening', badge: 'NEW', badgeColor: 'text-emerald-400' },
  { icon: MessagesSquare, label: 'Chat', tabId: 'chat' },
  { icon: Scale, label: 'Atualizações', tabId: 'updates', badge: 'NEW', badgeColor: 'text-amber-400' },
  { icon: BarChart3, label: 'Stats', tabId: 'stats' },
  { icon: Calendar, label: 'Consultas', tabId: 'consultations' },
  { icon: UserCheck, label: 'Clientes', tabId: 'clients' },
  { icon: Wallet, label: 'Saques', tabId: 'withdrawals' },
  { icon: DollarSign, label: 'Ganhos', tabId: 'earnings' },
  { icon: Star, label: 'Avaliações', tabId: 'reviews' },
  { icon: FileText, label: 'Perfil', tabId: 'profile' },
];

const autonomoItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Início', tabId: 'dashboard' },
  { icon: Building2, label: 'Abrir Empresa', tabId: 'abertura-empresa', badge: 'NEW', badgeColor: 'text-emerald-400' },
  { icon: BarChart3, label: 'Dashboard Financeiro', tabId: 'financeiro' },
  { icon: Target, label: 'Metas Financeiras', tabId: 'metas' },
  { icon: Bot, label: 'Simulador IA', tabId: 'simulator', badge: 'PRO', badgeColor: 'text-amber-400' },
  { icon: History, label: 'Histórico', tabId: 'history' },
  { icon: MessagesSquare, label: 'Chat IA', tabId: 'ai-chat', badge: 'IA', badgeColor: 'text-primary' },
  { icon: Headphones, label: 'Chat Contador', tabId: 'chat-contador' },
  { icon: Users, label: 'Contadores', tabId: 'contadores' },
  { icon: BookOpen, label: 'Glossário', tabId: 'glossary' },
  { icon: Wallet, label: 'Assinatura', tabId: 'subscription' },
  { icon: Headphones, label: 'Suporte', tabId: 'support' },
  { icon: User, label: 'Meu Perfil', tabId: 'profile' },
];

const AppSidebar: React.FC<AppSidebarProps> = ({ 
  collapsed, 
  onToggle, 
  variant = 'user',
  activeTab = 'overview',
  onTabChange
}) => {
  const navigate = useNavigate();
  const { user, profile, signOut, hasRole } = useAuth();

  const items = variant === 'admin' 
    ? adminItems 
    : variant === 'contador' 
      ? contadorItems 
      : variant === 'autonomo' 
        ? autonomoItems 
        : userItems;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleItemClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
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
          active
            ? 'bg-white/10 text-white'
            : 'text-white/60 hover:bg-white/5 hover:text-white'
        )}
      >
        <Icon className={cn(
          'h-5 w-5 shrink-0 transition-colors',
          active ? 'text-primary' : 'text-white/60 group-hover:text-white'
        )} />
        {!collapsed && (
          <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
        )}
        {!collapsed && item.badge && (
          <span className={cn('text-[10px] font-bold', item.badgeColor || 'text-primary')}>
            {item.badge}
          </span>
        )}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
        )}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700 text-xs px-3 py-1.5">
            {item.label}
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
          'bg-slate-900',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-white/5">
          <div className={cn('flex items-center gap-2', collapsed && 'justify-center w-full')}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-white">AtentAI</span>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="absolute -right-3 top-7 h-6 w-6 rounded-full bg-slate-800 border border-white/10 text-white/60 hover:text-white hover:bg-slate-700"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <SidebarLink key={item.tabId} item={item} />
          ))}
        </nav>

        {/* Role Switchers */}
        {(hasRole('admin') || hasRole('contador')) && variant === 'user' && (
          <div className="px-2 py-2 border-t border-white/5 space-y-1">
            {hasRole('admin') && (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => navigate('/admin')}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all',
                      'text-white/60 hover:bg-red-500/10 hover:text-red-400',
                      collapsed && 'justify-center'
                    )}
                  >
                    <Shield className="h-5 w-5" />
                    {!collapsed && <span className="text-sm">Admin</span>}
                  </button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700 text-xs">
                    Admin
                  </TooltipContent>
                )}
              </Tooltip>
            )}
            {hasRole('contador') && (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => navigate('/contador')}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all',
                      'text-white/60 hover:bg-blue-500/10 hover:text-blue-400',
                      collapsed && 'justify-center'
                    )}
                  >
                    <FileText className="h-5 w-5" />
                    {!collapsed && <span className="text-sm">Contador</span>}
                  </button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700 text-xs">
                    Contador
                  </TooltipContent>
                )}
              </Tooltip>
            )}
          </div>
        )}

        {/* Back to Dashboard for Admin/Contador/Autonomo */}
        {(variant === 'admin' || variant === 'contador' || variant === 'autonomo') && (
          <div className="px-2 py-2 border-t border-white/5">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate('/dashboard')}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all',
                    'text-white/60 hover:bg-primary/10 hover:text-primary',
                    collapsed && 'justify-center'
                  )}
                >
                  <Home className="h-5 w-5" />
                  {!collapsed && <span className="text-sm">Dashboard</span>}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700 text-xs">
                  Dashboard
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        )}

        {/* User & Logout */}
        <div className="px-2 py-3 border-t border-white/5">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
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
                  'w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all',
                  'text-white/40 hover:bg-red-500/10 hover:text-red-400',
                  collapsed && 'justify-center'
                )}
              >
                <LogOut className="h-5 w-5" />
                {!collapsed && <span className="text-sm">Sair</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700 text-xs">
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
