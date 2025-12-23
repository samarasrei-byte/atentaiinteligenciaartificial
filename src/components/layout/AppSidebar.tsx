import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Calculator,
  Users,
  MessageSquare,
  Settings,
  Home,
  Scale,
  FileText,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  TrendingUp,
  Calendar,
  DollarSign,
  ClipboardList,
  BarChart3,
  Headphones,
  UserCheck,
  PieChart,
  Wallet,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
}

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  variant?: 'user' | 'admin' | 'contador';
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const userItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', tabId: 'overview' },
  { icon: MessageSquare, label: 'Chat IA', tabId: 'ai-chat' },
  { icon: Calculator, label: 'Simulador', tabId: 'simulator' },
  { icon: Home, label: 'Locação', tabId: 'locacao', badge: 'Novo' },
  { icon: Scale, label: 'Comparador', tabId: 'comparator', badge: 'Novo' },
  { icon: Users, label: 'Contadores', tabId: 'contadores' },
  { icon: ClipboardList, label: 'Histórico', tabId: 'history' },
  { icon: Headphones, label: 'Suporte', tabId: 'support' },
];

const adminItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Visão Geral', tabId: 'overview' },
  { icon: Users, label: 'Usuários', tabId: 'users' },
  { icon: BarChart3, label: 'Métricas', tabId: 'metrics' },
  { icon: DollarSign, label: 'Receitas', tabId: 'revenue' },
  { icon: PieChart, label: 'Assinaturas', tabId: 'subscriptions' },
  { icon: Calendar, label: 'Consultas', tabId: 'consultations' },
  { icon: Headphones, label: 'Suporte', tabId: 'support' },
  { icon: Settings, label: 'Configurações', tabId: 'settings' },
];

const contadorItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Visão Geral', tabId: 'overview' },
  { icon: BarChart3, label: 'Estatísticas', tabId: 'stats' },
  { icon: Calendar, label: 'Consultas', tabId: 'consultations' },
  { icon: UserCheck, label: 'Clientes', tabId: 'clients' },
  { icon: Wallet, label: 'Ganhos', tabId: 'earnings' },
  { icon: Star, label: 'Avaliações', tabId: 'reviews' },
  { icon: FileText, label: 'Meu Perfil', tabId: 'profile' },
];

const AppSidebar: React.FC<AppSidebarProps> = ({ 
  collapsed, 
  onToggle, 
  variant = 'user',
  activeTab = 'overview',
  onTabChange
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut, hasRole } = useAuth();

  const items = variant === 'admin' ? adminItems : variant === 'contador' ? contadorItems : userItems;

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
          'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 group relative',
          active
            ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-md shadow-primary/20'
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
        )}
      >
        <div className={cn(
          'p-1 rounded-md transition-all',
          active ? 'bg-white/20' : 'bg-transparent'
        )}>
          <Icon className={cn('h-4 w-4 shrink-0', collapsed && 'mx-auto')} />
        </div>
        {!collapsed && (
          <>
            <span className="font-medium text-xs tracking-wide">{item.label}</span>
            {item.badge && (
              <Badge className="ml-auto bg-accent/80 text-accent-foreground text-[9px] px-1.5 py-0">
                {item.badge}
              </Badge>
            )}
          </>
        )}
        {active && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-l-full" />
        )}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2 bg-slate-900 text-white border-slate-700 shadow-xl">
            {item.label}
            {item.badge && (
              <Badge className="bg-accent text-accent-foreground text-xs">
                {item.badge}
              </Badge>
            )}
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
          'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800',
          'border-r border-slate-700/50',
          collapsed ? 'w-20' : 'w-72'
        )}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
                <img 
                  src="/logo-atentai.png" 
                  alt="AtentAI" 
                  className="h-10 w-10 object-contain relative z-10" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  AtentAI
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  {variant === 'admin' ? 'Administração' : variant === 'contador' ? 'Contador' : 'Plataforma'}
                </span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto relative">
              <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full" />
              <img 
                src="/logo-atentai.png" 
                alt="AtentAI" 
                className="h-10 w-10 object-contain relative z-10" 
              />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              'text-slate-400 hover:text-white hover:bg-white/10 shrink-0 rounded-lg',
              collapsed && 'absolute -right-3 top-6 bg-slate-800 border border-slate-700 shadow-lg h-6 w-6'
            )}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-hidden">
          {!collapsed && (
            <p className="px-3 py-1.5 text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
              Menu
            </p>
          )}
          {items.map((item) => (
            <SidebarLink key={item.tabId} item={item} />
          ))}
        </nav>

        {/* Role Switchers */}
        {(hasRole('admin') || hasRole('contador')) && variant === 'user' && (
          <div className="p-3 border-t border-slate-700/50 space-y-1">
            {!collapsed && (
              <p className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Outros Painéis
              </p>
            )}
            {hasRole('admin') && (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => navigate('/admin')}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                      'text-slate-300 hover:bg-red-500/10 hover:text-red-400 group',
                      collapsed && 'justify-center'
                    )}
                  >
                    <div className="p-1.5 rounded-lg bg-red-500/10 group-hover:bg-red-500/20">
                      <Shield className="h-4 w-4 shrink-0" />
                    </div>
                    {!collapsed && <span className="font-medium text-sm">Painel Admin</span>}
                  </button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="bg-slate-900 text-white border-slate-700">
                    Painel Admin
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
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                      'text-slate-300 hover:bg-blue-500/10 hover:text-blue-400 group',
                      collapsed && 'justify-center'
                    )}
                  >
                    <div className="p-1.5 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20">
                      <FileText className="h-4 w-4 shrink-0" />
                    </div>
                    {!collapsed && <span className="font-medium text-sm">Painel Contador</span>}
                  </button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="bg-slate-900 text-white border-slate-700">
                    Painel Contador
                  </TooltipContent>
                )}
              </Tooltip>
            )}
          </div>
        )}

        {/* Back to User Dashboard for Admin/Contador */}
        {(variant === 'admin' || variant === 'contador') && (
          <div className="p-3 border-t border-slate-700/50">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate('/dashboard')}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                    'text-slate-300 hover:bg-primary/10 hover:text-primary group',
                    collapsed && 'justify-center'
                  )}
                >
                  <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20">
                    <Home className="h-4 w-4 shrink-0" />
                  </div>
                  {!collapsed && <span className="font-medium text-sm">Painel Usuário</span>}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="bg-slate-900 text-white border-slate-700">
                  Painel Usuário
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        )}

        {/* User Info & Logout */}
        <div className="p-3 border-t border-slate-700/50">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-slate-800/50">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-white">
                  {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {profile?.full_name || 'Usuário'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          )}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={handleSignOut}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                  'text-slate-400 hover:bg-red-500/10 hover:text-red-400 group',
                  collapsed && 'justify-center'
                )}
              >
                <div className="p-1.5 rounded-lg group-hover:bg-red-500/10">
                  <LogOut className="h-4 w-4 shrink-0" />
                </div>
                {!collapsed && <span className="font-medium text-sm">Sair da Conta</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="bg-slate-900 text-white border-slate-700">
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