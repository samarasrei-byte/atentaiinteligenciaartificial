import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  Bell,
  FileText,
  TrendingUp,
  MessageSquare,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Search,
  Settings,
  Clock,
  Activity,
  Zap,
  ChevronDown,
  PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { title: 'Dashboard', path: '/capassi', icon: LayoutDashboard, description: 'Visão geral' },
  { title: 'Transações', path: '/capassi/transactions', icon: ArrowLeftRight, description: 'Receitas e custos' },
  { title: 'Clientes', path: '/capassi/clients', icon: Users, description: 'Base de clientes' },
  { title: 'DRE', path: '/capassi/dre', icon: FileText, description: 'Demonstrativo' },
  { title: 'Fluxo de Caixa', path: '/capassi/cashflow', icon: TrendingUp, description: 'Projeções' },
  { title: 'Métricas SaaS', path: '/capassi/metrics', icon: PieChart, description: 'MRR, Churn, LTV' },
  { title: 'Chat', path: '/capassi/chat', icon: MessageSquare, description: 'Mensagens' },
  { title: 'Alertas', path: '/capassi/alerts', icon: Bell, description: 'Notificações' },
  { title: 'Auditoria', path: '/capassi/audit', icon: Shield, description: 'Logs de atividade' },
];

export function CapassiLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [clock, setClock] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => {
    if (path === '/capassi') return location.pathname === '/capassi';
    return location.pathname.startsWith(path);
  };

  const currentPage = navItems.find(i => isActive(i.path));

  return (
    <div className="min-h-screen flex w-full" style={{ backgroundColor: '#0B0F1A' }}>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 border-r",
          "md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          sidebarOpen ? "w-72" : "w-[72px]"
        )}
        style={{ backgroundColor: '#060911', borderColor: '#1a1f2e' }}
      >
        {/* Logo Area */}
        <div className="h-[72px] flex items-center px-5 gap-3" style={{ borderBottom: '1px solid #1a1f2e' }}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#55FFAA] to-[#00CC77] flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5 text-black" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <span className="text-lg font-bold text-white tracking-wider block">CAPASSI</span>
              <span className="text-[10px] text-white/30 font-medium tracking-widest">FINANCE SUITE</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto text-white/40 hover:text-white hover:bg-white/5 hidden md:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-white/10">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-[#55FFAA]/10 text-[#55FFAA] shadow-[0_0_20px_rgba(85,255,170,0.05)]"
                    : "text-white/40 hover:text-white/80 hover:bg-white/[0.03]"
                )}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#55FFAA] rounded-r-full" />
                )}
                <item.icon className={cn("h-5 w-5 shrink-0", active ? "text-[#55FFAA]" : "text-white/30 group-hover:text-white/60")} />
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <span className="block truncate">{item.title}</span>
                    {!active && <span className="block text-[10px] text-white/20 truncate">{item.description}</span>}
                  </div>
                )}
                {sidebarOpen && active && (
                  <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 space-y-2" style={{ borderTop: '1px solid #1a1f2e' }}>
          {sidebarOpen && (
            <div className="px-3 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-violet-300">C</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white/80 truncate">César</p>
                  <p className="text-[10px] text-white/30 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <Badge className="bg-[#55FFAA]/10 text-[#55FFAA] border-[#55FFAA]/20 text-[10px] px-1.5 py-0">
                  Super Admin
                </Badge>
                <Badge className="bg-violet-500/10 text-violet-300 border-violet-500/20 text-[10px] px-1.5 py-0">
                  Pro
                </Badge>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size={sidebarOpen ? "default" : "icon"}
            className="w-full text-red-400/60 hover:text-red-300 hover:bg-red-500/5 text-xs"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && <span className="ml-2">Encerrar Sessão</span>}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen ? "md:ml-72" : "md:ml-[72px]"
        )}
      >
        {/* Top bar */}
        <header
          className="h-[72px] flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 backdrop-blur-xl"
          style={{ backgroundColor: 'rgba(6,9,17,0.85)', borderBottom: '1px solid #1a1f2e' }}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white/60 hover:text-white hover:bg-white/5"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-semibold text-white">
                  {currentPage?.title || 'Capassi'}
                </h1>
              </div>
              <p className="text-[11px] text-white/30 hidden md:block">{currentPage?.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Clock */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
              <Clock className="h-3.5 w-3.5 text-white/30" />
              <span className="text-xs font-mono text-white/50">{clock}</span>
            </div>

            {/* Status indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#55FFAA]/5 border border-[#55FFAA]/10">
              <div className="w-1.5 h-1.5 rounded-full bg-[#55FFAA] animate-pulse" />
              <span className="text-[11px] text-[#55FFAA]/70 font-medium">Online</span>
            </div>

            {/* Activity */}
            <Button variant="ghost" size="icon" className="text-white/30 hover:text-white hover:bg-white/5 relative">
              <Activity className="h-4 w-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#55FFAA] rounded-full" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
