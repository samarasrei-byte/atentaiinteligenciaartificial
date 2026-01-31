import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Brain,
  MessageSquare,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type AdminSection = 
  | 'dashboard' 
  | 'bi-contabilidade' 
  | 'comunicacao' 
  | 'marketplace' 
  | 'gestao' 
  | 'configuracoes';

interface SidebarItem {
  id: AdminSection;
  icon: React.ElementType;
  label: string;
  description: string;
}

interface AdminSidebarV2Props {
  collapsed: boolean;
  onToggle: () => void;
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

const sidebarItems: SidebarItem[] = [
  { 
    id: 'dashboard', 
    icon: LayoutDashboard, 
    label: 'Dashboard',
    description: 'Visão geral e KPIs'
  },
  { 
    id: 'bi-contabilidade', 
    icon: Brain, 
    label: 'BI & Contabilidade',
    description: 'Core do produto'
  },
  { 
    id: 'comunicacao', 
    icon: MessageSquare, 
    label: 'Comunicação',
    description: 'Chat, alertas e suporte'
  },
  { 
    id: 'marketplace', 
    icon: ShoppingBag, 
    label: 'Marketplace',
    description: 'Serviços e add-ons'
  },
  { 
    id: 'gestao', 
    icon: Users, 
    label: 'Gestão',
    description: 'Usuários e financeiro'
  },
  { 
    id: 'configuracoes', 
    icon: Settings, 
    label: 'Configurações',
    description: 'Sistema e conexões'
  },
];

const AdminSidebarV2: React.FC<AdminSidebarV2Props> = ({
  collapsed,
  onToggle,
  activeSection,
  onSectionChange,
}) => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const SidebarLink = ({ item }: { item: SidebarItem }) => {
    const Icon = item.icon;
    const active = activeSection === item.id;

    const content = (
      <button
        onClick={() => onSectionChange(item.id)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative',
          'touch-manipulation active:scale-[0.98]',
          active
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
        )}
      >
        <Icon className={cn(
          'h-5 w-5 shrink-0 transition-colors',
          active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
        )} />
        {!collapsed && (
          <div className="flex-1 text-left min-w-0">
            <span className="block text-sm font-semibold truncate">{item.label}</span>
            {!active && (
              <span className="block text-[10px] text-muted-foreground/70 truncate">
                {item.description}
              </span>
            )}
          </div>
        )}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="px-3 py-2">
            <div>
              <p className="font-medium text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
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
          'bg-card/95 backdrop-blur-xl border-r border-border/50',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        {/* Logo - Ultra Clean */}
        <div className={cn(
          'flex items-center gap-3 px-4 py-5 border-b border-border/50',
          collapsed && 'justify-center px-3'
        )}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="block text-base font-bold text-foreground tracking-tight">AtentAI</span>
              <span className="block text-[10px] text-primary font-semibold uppercase tracking-widest">Admin Panel</span>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="absolute -right-3 top-7 h-6 w-6 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hidden lg:flex shadow-sm"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>

        {/* Navigation - 6 itens principais */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {sidebarItems.map((item) => (
            <SidebarLink key={item.id} item={item} />
          ))}
        </nav>

        {/* User Section */}
        <div className="px-3 py-4 border-t border-border/50 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                <span className="text-sm font-bold text-primary">
                  {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {profile?.full_name?.split(' ')[0] || 'Admin'}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
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
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                  'text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
                  'touch-manipulation active:scale-[0.98]',
                  collapsed && 'justify-center'
                )}
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && <span className="text-sm font-medium">Sair</span>}
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

export default AdminSidebarV2;
