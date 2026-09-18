import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, History, GitCompare, Scale, Package,
  Bell, FileText, Settings, Menu, X, ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DifalDisclaimer } from '@/components/difal/DifalDisclaimer';

const navItems = [
  { to: '/difal', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/difal/nova-simulacao', label: 'Nova simulação', icon: PlusCircle },
  { to: '/difal/historico', label: 'Histórico', icon: History },
  { to: '/difal/comparar', label: 'Comparar estados', icon: GitCompare },
  { to: '/difal/regras', label: 'Regras por estado', icon: Scale },
  { to: '/difal/produtos', label: 'Produtos e NCM', icon: Package },
  { to: '/difal/alertas', label: 'Alertas legislativos', icon: Bell },
  { to: '/difal/relatorios', label: 'Relatórios', icon: FileText },
  { to: '/difal/configuracoes', label: 'Configurações', icon: Settings },
];

export default function DifalLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

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

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen w-[264px] bg-card border-r border-border z-50 flex flex-col transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <div>
            <p className="font-semibold tracking-tight">DIFAL Marketplace</p>
            <p className="text-[10px] text-muted-foreground">Módulo fiscal · AtentAI</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 text-muted-foreground hover:text-foreground"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground',
                )
              }
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => navigate('/empresa')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao painel
          </Button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-border flex items-center gap-3 px-4 lg:px-8 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted text-foreground/70"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="text-sm">
            <span className="text-muted-foreground">AtentAI</span>
            <span className="text-border mx-2">/</span>
            <span className="font-semibold">DIFAL Marketplace</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 space-y-6">
          <Outlet />
          <DifalDisclaimer />
        </main>
      </div>
    </div>
  );
}
