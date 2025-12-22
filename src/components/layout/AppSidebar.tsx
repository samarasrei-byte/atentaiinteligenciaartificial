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
  href: string;
  badge?: string;
}

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  variant?: 'user' | 'admin' | 'contador';
}

const userItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: MessageSquare, label: 'Chat IA', href: '/ai-chat' },
  { icon: Calculator, label: 'Simulador', href: '/simulator' },
  { icon: Home, label: 'Locação', href: '/locacao', badge: 'Novo' },
  { icon: Scale, label: 'Comparador', href: '/regime-comparator', badge: 'Novo' },
  { icon: Users, label: 'Contadores', href: '/contadores' },
];

const adminItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Visão Geral', href: '/admin' },
  { icon: Users, label: 'Usuários', href: '/admin?tab=users' },
  { icon: TrendingUp, label: 'Métricas', href: '/admin?tab=metrics' },
  { icon: DollarSign, label: 'Receitas', href: '/admin?tab=revenue' },
  { icon: Settings, label: 'Configurações', href: '/admin?tab=settings' },
];

const contadorItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Visão Geral', href: '/contador' },
  { icon: Calendar, label: 'Consultas', href: '/contador?tab=consultations' },
  { icon: Users, label: 'Clientes', href: '/contador?tab=clients' },
  { icon: DollarSign, label: 'Ganhos', href: '/contador?tab=earnings' },
  { icon: FileText, label: 'Perfil', href: '/contador?tab=profile' },
];

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed, onToggle, variant = 'user' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut, hasRole } = useAuth();

  const items = variant === 'admin' ? adminItems : variant === 'contador' ? contadorItems : userItems;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (href: string) => {
    if (href.includes('?')) {
      return location.pathname + location.search === href;
    }
    return location.pathname === href;
  };

  const SidebarLink = ({ item }: { item: SidebarItem }) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    const content = (
      <button
        onClick={() => navigate(item.href)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
          active
            ? 'bg-primary text-white shadow-md'
            : 'text-white/80 hover:bg-white/10 hover:text-white'
        )}
      >
        <Icon className={cn('h-5 w-5 shrink-0', collapsed && 'mx-auto')} />
        {!collapsed && (
          <>
            <span className="font-medium text-sm">{item.label}</span>
            {item.badge && (
              <Badge className="ml-auto bg-accent text-accent-foreground text-xs">
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2 bg-slate-800 text-white border-slate-700">
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
          'fixed left-0 top-0 z-40 h-screen bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="AtentAI" className="h-8 w-8" />
              <span className="text-lg font-bold text-white">
                AtentAI
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              'text-white hover:bg-white/10 shrink-0',
              collapsed && 'mx-auto'
            )}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <SidebarLink key={item.href} item={item} />
          ))}
        </nav>

        {/* Role Switchers */}
        {(hasRole('admin') || hasRole('contador')) && variant === 'user' && (
          <div className="p-3 border-t border-slate-700 space-y-1">
            {hasRole('admin') && (
              <button
                onClick={() => navigate('/admin')}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-white/80 hover:bg-red-500/20 hover:text-red-400',
                  collapsed && 'justify-center'
                )}
              >
                <Shield className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="font-medium text-sm">Painel Admin</span>}
              </button>
            )}
            {hasRole('contador') && (
              <button
                onClick={() => navigate('/contador')}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-white/80 hover:bg-blue-500/20 hover:text-blue-400',
                  collapsed && 'justify-center'
                )}
              >
                <FileText className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="font-medium text-sm">Painel Contador</span>}
              </button>
            )}
          </div>
        )}

        {/* User Info & Logout */}
        <div className="p-3 border-t border-slate-700">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-primary/30 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {profile?.full_name || 'Usuário'}
                </p>
                <p className="text-xs text-white/60 truncate">
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
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-white/80 hover:bg-red-500/20 hover:text-red-400',
                  collapsed && 'justify-center'
                )}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="font-medium text-sm">Sair</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">Sair</TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default AppSidebar;
