import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, History, GitCompare, Scale, Package,
  Bell, FileText, Settings, Menu, X, ArrowLeft, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DifalDisclaimer } from '@/components/difal/DifalDisclaimer';
import { Input } from '@/components/ui/input';

const navItems = [
  { to: '/difal', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/difal/nova-simulacao', label: 'Nova simulação', icon: PlusCircle },
  { to: '/difal/historico', label: 'Histórico', icon: History },
  { to: '/difal/comparar', label: 'Comparar estados', icon: GitCompare },
  { to: '/difal/regras', label: 'Regras por estado', icon: Scale },
  { to: '/difal/produtos', label: 'Produtos e NCM', icon: Package },
  { to: '/difal/alertas', label: 'Alertas', icon: Bell },
  { to: '/difal/relatorios', label: 'Relatórios', icon: FileText },
];

export default function DifalLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredNavItems = navItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar Minimalista */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen w-[264px] bg-card border-r border-border z-50 flex flex-col transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Scale className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold tracking-tight text-sm">DIFAL</p>
              <p className="text-[10px] text-muted-foreground">Módulo fiscal</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 text-muted-foreground hover:text-foreground"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar menu..."
              className="h-8 pl-8 text-sm bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/30 transition-all shadow-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredNavItems.length > 0 ? (
            filteredNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group',
                    isActive
                      ? 'bg-primary/5 text-primary'
                      : 'text-foreground/60 hover:bg-muted hover:text-foreground',
                  )
                }
              >
                <item.icon className={cn(
                  "h-[16px] w-[16px] shrink-0 transition-colors",
                  "group-hover:text-foreground",
                )} />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))
          ) : (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              Nenhuma tela encontrada.
            </div>
          )}
        </nav>

        <div className="p-3 border-t border-border mt-auto space-y-1">
          <NavLink
            to="/difal/configuracoes"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group',
                isActive
                  ? 'bg-primary/5 text-primary'
                  : 'text-foreground/60 hover:bg-muted hover:text-foreground',
              )
            }
          >
            <Settings className="h-[16px] w-[16px] shrink-0 transition-colors group-hover:text-foreground" />
            <span className="truncate">Configurações</span>
          </NavLink>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground h-10 mt-2"
            onClick={() => navigate('/empresa')}
          >
            <ArrowLeft className="h-4 w-4 mr-3" />
            Sair do módulo
          </Button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA]/50 dark:bg-background">
        <header className="h-16 bg-card/50 backdrop-blur-sm border-b border-border/50 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-muted text-foreground/70"
              aria-label="Abrir menu de navegação"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center text-sm text-muted-foreground">
              Módulo Fiscal <span className="mx-2 text-border">/</span> <span className="text-foreground font-medium">DIFAL</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
              <NavLink to="/difal/nova-simulacao"><PlusCircle className="mr-2 h-4 w-4" /> Simular NFe</NavLink>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-[1400px] mx-auto w-full">
          <Outlet />
          <div className="pt-8">
            <DifalDisclaimer />
          </div>
        </main>
      </div>
    </div>
  );
}