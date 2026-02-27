import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Scale, Brain, Users, ShieldCheck,
  Bot, Target, Gavel, FileText, Settings, Menu, X,
  ChevronLeft, Megaphone, ShoppingBag, Kanban, Plug,
  GraduationCap, FileSpreadsheet, Search, Bell, Sun, Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import seracLogo from '@/assets/logo_serac.png';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const navGroups = [
  {
    label: 'Estratégico',
    items: [
      { label: 'Dashboard Executivo', icon: LayoutDashboard, path: '/serac', badge: 0 },
      { label: 'CRM Pipeline', icon: Kanban, path: '/serac/crm', badge: 3 },
      { label: 'Central de Campanhas', icon: Megaphone, path: '/serac/campanhas', badge: 0 },
      { label: 'Marketplace', icon: ShoppingBag, path: '/serac/marketplace', badge: 0 },
      { label: 'Prospecção (3 Canais)', icon: Target, path: '/serac/prospeccao', badge: 5 },
    ],
  },
  {
    label: 'Inteligência',
    items: [
      { label: 'Agentes de IA', icon: Bot, path: '/serac/agentes-ia', badge: 0 },
      { label: 'Reforma 2026', icon: Scale, path: '/serac/reforma-tributaria', badge: 0 },
      { label: 'Inteligência Fiscal', icon: Brain, path: '/serac/inteligencia-fiscal', badge: 0 },
      { label: 'Folha & Cartório', icon: FileSpreadsheet, path: '/serac/folha-cartorio', badge: 2 },
    ],
  },
  {
    label: 'Operacional',
    items: [
      { label: 'Clientes 360°', icon: Users, path: '/serac/clientes', badge: 0 },
      { label: 'Compliance & Risco', icon: ShieldCheck, path: '/serac/compliance', badge: 1 },
      { label: 'Jurídico Integrado', icon: Gavel, path: '/serac/juridico', badge: 0 },
      { label: 'API Hub', icon: Plug, path: '/serac/api-hub', badge: 0 },
      { label: 'Mentorias', icon: GraduationCap, path: '/serac/mentorias', badge: 0 },
      { label: 'Relatórios', icon: FileText, path: '/serac/relatorios', badge: 0 },
      { label: 'Configurações', icon: Settings, path: '/serac/configuracoes', badge: 0 },
    ],
  },
];

const breadcrumbMap: Record<string, string> = {
  '/serac': 'Dashboard Executivo',
  '/serac/crm': 'CRM Pipeline',
  '/serac/campanhas': 'Central de Campanhas',
  '/serac/marketplace': 'Marketplace',
  '/serac/prospeccao': 'Prospecção',
  '/serac/agentes-ia': 'Agentes de IA',
  '/serac/reforma-tributaria': 'Reforma 2026',
  '/serac/inteligencia-fiscal': 'Inteligência Fiscal',
  '/serac/folha-cartorio': 'Folha & Cartório',
  '/serac/clientes': 'Clientes 360°',
  '/serac/compliance': 'Compliance & Risco',
  '/serac/juridico': 'Jurídico Integrado',
  '/serac/api-hub': 'API Hub',
  '/serac/mentorias': 'Mentorias',
  '/serac/relatorios': 'Relatórios',
  '/serac/configuracoes': 'Configurações',
};

export default function SeracLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const currentPage = breadcrumbMap[location.pathname] || 'Dashboard';
  const totalNotifs = navGroups.reduce((acc, g) => acc + g.items.reduce((a, i) => a + i.badge, 0), 0);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 h-screen bg-card border-r border-border z-50 flex flex-col transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed ? (
            <img src={seracLogo} alt="SERAC" className="h-8 object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center mx-auto">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex p-1 rounded hover:bg-muted text-muted-foreground">
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </button>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1 text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav grouped */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-1">
              {!collapsed && (
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground px-3 pt-3 pb-1.5">{group.label}</p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = item.path === '/serac'
                    ? location.pathname === '/serac'
                    : location.pathname.startsWith(item.path);
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all relative",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground/70 hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                      {!collapsed && item.badge > 0 && (
                        <span className={cn(
                          "w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center",
                          isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-destructive text-destructive-foreground"
                        )}>
                          {item.badge}
                        </span>
                      )}
                      {collapsed && item.badge > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2 justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <p className="text-[10px] text-muted-foreground">Powered by AtentAI</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-muted text-foreground/70">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden lg:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">SERAC</span>
              <span className="text-border">/</span>
              <span className="font-semibold text-foreground">{currentPage}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            {searchOpen ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  autoFocus
                  placeholder="Buscar módulo, lead, serviço..."
                  className="pl-9 w-64 h-9 text-sm"
                  onBlur={() => setSearchOpen(false)}
                />
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
                <Search className="h-4 w-4" />
              </button>
            )}

            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground relative">
              <Bell className="h-4 w-4" />
              {totalNotifs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                  {totalNotifs}
                </span>
              )}
            </button>

            <div className="w-px h-8 bg-border mx-1" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">Admin SERAC</p>
                <p className="text-[10px] text-muted-foreground">Administrador</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-primary-foreground font-bold text-sm">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
