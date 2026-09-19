import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, History, GitCompare, Scale, Package,
  Bell, FileText, Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DifalDisclaimer } from '@/components/difal/DifalDisclaimer';
import AppSidebar from '@/components/layout/AppSidebar';
import StripeSidebar from '@/components/layout/StripeSidebar';
import { SmartPanelSearch } from '@/components/dashboard/SmartPanelSearch';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { to: '/difal', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/difal/nova-simulacao', label: 'Nova simulação', icon: PlusCircle },
  { to: '/difal/historico', label: 'Histórico', icon: History },
  { to: '/difal/comparar', label: 'Comparar estados', icon: GitCompare },
  { to: '/difal/regras', label: 'Regras por estado', icon: Scale },
  { to: '/difal/produtos', label: 'Produtos e NCM', icon: Package },
  { to: '/difal/alertas', label: 'Alertas', icon: Bell },
  { to: '/difal/relatorios', label: 'Relatórios', icon: FileText },
  { to: '/difal/configuracoes', label: 'Configurações', icon: Scale },
];

export default function DifalLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  const returnToPanel = (tab: string) => {
    const route = isAdmin ? '/admin' : hasRole('autonomo') ? '/autonomo' : '/empresa';
    navigate(`${route}?tab=${tab}`);
    setMobileOpen(false);
  };

  const sidebar = isAdmin ? (
    <StripeSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} activeTab="difal-marketplace" onTabChange={returnToPanel} variant="admin" />
  ) : (
    <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} activeTab="difal-marketplace" onTabChange={returnToPanel} variant={hasRole('autonomo') ? 'autonomo' : 'empresa'} />
  );

  const mobileSidebar = isAdmin ? (
    <StripeSidebar collapsed={false} onToggle={() => setMobileOpen(false)} activeTab="difal-marketplace" onTabChange={returnToPanel} variant="admin" />
  ) : (
    <AppSidebar collapsed={false} onToggle={() => setMobileOpen(false)} activeTab="difal-marketplace" onTabChange={returnToPanel} variant={hasRole('autonomo') ? 'autonomo' : 'empresa'} />
  );

  const searchEntries = navItems.map((item) => ({
    id: item.to,
    title: item.label,
    description: `Acessar ${item.label} no módulo DIFAL`,
    keywords: ['difal', 'fiscal', item.label],
    onOpen: () => navigate(item.to),
  }));

  return (
    <div className="dashboard-layout min-h-screen bg-background">
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden />}
      <div className="hidden lg:block">{sidebar}</div>
      <div className={cn('fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:hidden', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>{mobileSidebar}</div>

      <main className={cn('dashboard-main w-full transition-all duration-300', sidebarCollapsed ? 'lg:ml-16' : isAdmin ? 'lg:ml-72' : 'lg:ml-64')}>
        <header className="dashboard-header">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Button variant="ghost" size="icon" className="shrink-0 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Menu className="h-5 w-5" /></Button>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"><Scale className="h-4 w-4 text-primary" /></div>
              <div className="min-w-0"><h1 className="truncate text-lg font-bold lg:text-xl">DIFAL Marketplace</h1><p className="hidden text-xs text-muted-foreground sm:block">Módulo fiscal dentro do painel AtentAI</p></div>
            </div>
            <Button asChild size="sm" className="hidden sm:flex"><NavLink to="/difal/nova-simulacao"><PlusCircle className="mr-2 h-4 w-4" />Nova simulação</NavLink></Button>
          </div>
        </header>

        <div className="border-b bg-card/60 px-4 lg:px-6">
          <nav className="flex gap-1 overflow-x-auto py-2" aria-label="Navegação do módulo DIFAL">
            {navItems.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn('flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors', isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}><item.icon className="h-3.5 w-3.5" />{item.label}</NavLink>)}
          </nav>
        </div>

        <div className="dashboard-content mx-auto w-full max-w-[1400px] space-y-6">
          <SmartPanelSearch entries={searchEntries} />
          <Outlet />
          <div className="pt-4"><DifalDisclaimer /></div>
        </div>
      </main>
    </div>
  );
}
