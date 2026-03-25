import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  Calculator,
  Shield,
  Building2,
  FileText,
  Users,
  Clock,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LayoutDashboard,
  Zap,
  Menu,
  X,
  Home,
  Sparkles,
  TrendingUp,
  HelpCircle,
  Phone
} from 'lucide-react';

interface NavItem {
  title: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  badgeColor?: string;
}

const mainNavItems: NavItem[] = [
  { title: 'Início', icon: Home, href: '/' },
  { title: 'Serviços', icon: Briefcase, href: '/servicos' },
  { title: 'Simulador', icon: Calculator, href: '/simulador', badge: 'Grátis', badgeColor: 'bg-emerald-500' },
  { title: 'Transição Tributária', icon: TrendingUp, href: '/transicao' },
  { title: 'Timeline Reforma', icon: Clock, href: '/timeline-reforma' },
  { title: 'Ferramentas LC 214', icon: FileText, href: '/ferramentas-lc214' },
];

const servicesNavItems: NavItem[] = [
  { title: 'Módulo Fiscal', icon: Shield, href: '/modulo-fiscal', badge: 'Premium', badgeColor: 'bg-primary' },
  { title: 'Limpa Nome', icon: Sparkles, href: '/limpa-nome' },
  { title: 'Contadores', icon: Users, href: '/contadores-publico' },
];

const supportNavItems: NavItem[] = [
  { title: 'FAQ', icon: HelpCircle, href: '/faq' },
  { title: 'Ver Planos', icon: Zap, href: '/planos-perfil' },
  { title: 'Seja Afiliado', icon: TrendingUp, href: '/afiliado/cadastro' },
];

export function PublicSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isActive = (href: string) => location.pathname === href;

  const NavLink = ({ item }: { item: NavItem }) => (
    <Link
      to={item.href}
      onClick={() => setIsMobileOpen(false)}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
        isActive(item.href)
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      <item.icon className={cn(
        "w-5 h-5 flex-shrink-0 transition-colors",
        isActive(item.href) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
      )} />
      {!isCollapsed && (
        <span className="flex-1 text-sm">{item.title}</span>
      )}
      {!isCollapsed && item.badge && (
        <span className={cn(
          "px-2 py-0.5 text-[10px] font-medium rounded-full text-white",
          item.badgeColor || "bg-muted"
        )}>
          {item.badge}
        </span>
      )}
    </Link>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 p-4 border-b border-border/50",
        isCollapsed && "justify-center"
      )}>
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/logo-atentai.png" 
            alt="AtentAI" 
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          {!isCollapsed && (
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2 block">
              Navegação
            </span>
          )}
          {mainNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>

        {/* Services */}
        <div className="space-y-1">
          {!isCollapsed && (
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2 block">
              Serviços
            </span>
          )}
          {servicesNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>

        {/* Support */}
        <div className="space-y-1">
          {!isCollapsed && (
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2 block">
              Suporte
            </span>
          )}
          {supportNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border/50 space-y-2">
        {user ? (
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full justify-start gap-2"
            size={isCollapsed ? "icon" : "default"}
          >
            <LayoutDashboard className="w-4 h-4" />
            {!isCollapsed && <span>Meu Painel</span>}
          </Button>
        ) : (
          <Button
            onClick={() => navigate('/auth')}
            className="w-full justify-start gap-2"
            size={isCollapsed ? "icon" : "default"}
          >
            <LogIn className="w-4 h-4" />
            {!isCollapsed && <span>Entrar / Cadastrar</span>}
          </Button>
        )}
        
        {/* Collapse toggle - desktop only */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full justify-center hidden md:flex"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden bg-background/80 backdrop-blur-sm shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 bottom-0 w-[280px] bg-card border-r border-border z-50 md:hidden shadow-xl transition-transform duration-300 ease-out",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 z-10"
        >
          <X className="w-5 h-5" />
        </Button>
        <SidebarContent />
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col bg-card border-r border-border transition-all duration-300 sticky top-0 h-screen",
        isCollapsed ? "w-[68px]" : "w-[240px]"
      )}>
        <SidebarContent />
      </aside>
    </>
  );
}
