import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Scale, Brain, Users, ShieldCheck,
  Bot, Target, Gavel, FileText, Settings, Menu, X,
  ChevronLeft, Megaphone, ShoppingBag, Kanban, Plug,
  GraduationCap, FileSpreadsheet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import seracLogo from '@/assets/logo_serac.png';

const navItems = [
  { label: 'Dashboard Executivo', icon: LayoutDashboard, path: '/serac' },
  { label: 'CRM Pipeline', icon: Kanban, path: '/serac/crm' },
  { label: 'Central de Campanhas', icon: Megaphone, path: '/serac/campanhas' },
  { label: 'Marketplace', icon: ShoppingBag, path: '/serac/marketplace' },
  { label: 'Prospecção (3 Canais)', icon: Target, path: '/serac/prospeccao' },
  { label: 'Agentes de IA', icon: Bot, path: '/serac/agentes-ia' },
  { label: 'Reforma Tributária 2026', icon: Scale, path: '/serac/reforma-tributaria' },
  { label: 'Inteligência Fiscal', icon: Brain, path: '/serac/inteligencia-fiscal' },
  { label: 'Folha & Cartório', icon: FileSpreadsheet, path: '/serac/folha-cartorio' },
  { label: 'Clientes 360°', icon: Users, path: '/serac/clientes' },
  { label: 'Compliance & Risco', icon: ShieldCheck, path: '/serac/compliance' },
  { label: 'Jurídico Integrado', icon: Gavel, path: '/serac/juridico' },
  { label: 'API Hub', icon: Plug, path: '/serac/api-hub' },
  { label: 'Mentorias', icon: GraduationCap, path: '/serac/mentorias' },
  { label: 'Relatórios', icon: FileText, path: '/serac/relatorios' },
  { label: 'Configurações', icon: Settings, path: '/serac/configuracoes' },
];

export default function SeracLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-[#E5E7EB] z-50 flex flex-col transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#E5E7EB]">
          {!collapsed ? (
            <img src={seracLogo} alt="SERAC" className="h-8 object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1B6BC0] to-[#87CEEB] flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">S</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex p-1 rounded hover:bg-[#F3F4F6] text-[#6B7280]">
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </button>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1 text-[#6B7280]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.path === '/serac'
              ? location.pathname === '/serac'
              : location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#1B6BC0] text-white shadow-sm"
                    : "text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#1B3A5C]"
                )}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-[#E5E7EB]">
            <p className="text-[10px] text-[#9CA3AF] text-center">Powered by AtentAI</p>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-[#F3F4F6] text-[#4B5563]">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-[#1B3A5C]">Admin SERAC</p>
              <p className="text-[10px] text-[#9CA3AF]">Administrador</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1B6BC0] to-[#87CEEB] flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
