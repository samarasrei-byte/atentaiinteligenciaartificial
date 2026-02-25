import { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Dashboard', path: '/capassi', icon: LayoutDashboard },
  { title: 'Transações', path: '/capassi/transactions', icon: ArrowLeftRight },
  { title: 'Clientes', path: '/capassi/clients', icon: Users },
  { title: 'Alertas', path: '/capassi/alerts', icon: Bell },
  { title: 'DRE', path: '/capassi/dre', icon: FileText },
  { title: 'Fluxo de Caixa', path: '/capassi/cashflow', icon: TrendingUp },
  { title: 'Chat', path: '/capassi/chat', icon: MessageSquare },
  { title: 'Auditoria', path: '/capassi/audit', icon: Shield },
];

export function CapassiLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => {
    if (path === '/capassi') return location.pathname === '/capassi';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex w-full" style={{ backgroundColor: '#0B0F1A' }}>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 border-r",
          sidebarOpen ? "w-64" : "w-16"
        )}
        style={{ backgroundColor: '#0B0F1A', borderColor: '#372938' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4" style={{ borderBottom: '1px solid #372938' }}>
          {sidebarOpen && (
            <span className="text-xl font-bold text-[#55FFAA] tracking-wider">CAPASSI</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white hover:bg-white/5"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive(item.path)
                  ? "bg-[#55FFAA]/10 text-[#55FFAA]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{item.title}</span>}
              {sidebarOpen && isActive(item.path) && (
                <ChevronRight className="h-4 w-4 ml-auto" />
              )}
            </Link>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4" style={{ borderTop: '1px solid #372938' }}>
          {sidebarOpen && (
            <div className="mb-3">
              <p className="text-xs text-white/40">Logado como</p>
              <p className="text-sm text-white/80 truncate">{user?.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size={sidebarOpen ? "default" : "icon"}
            className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-16"
        )}
      >
        {/* Top bar */}
        <header
          className="h-16 flex items-center justify-between px-6 sticky top-0 z-40"
          style={{ backgroundColor: '#0B0F1A', borderBottom: '1px solid #372938' }}
        >
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white/60 hover:text-white"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-white">
              {navItems.find(i => isActive(i.path))?.title || 'Capassi'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-[#55FFAA]/10 text-[#55FFAA] font-medium">
              Super Admin
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
