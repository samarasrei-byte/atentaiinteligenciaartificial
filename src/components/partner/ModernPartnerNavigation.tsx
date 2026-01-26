import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard,
  Shield,
  Scale,
  MessageCircle,
  BarChart3,
  DollarSign,
  Wallet,
  User,
  Settings,
  Sparkles
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  color?: string;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'limpa-nome', label: 'Limpa Nome', icon: Shield, color: 'emerald' },
  { id: 'modulo-fiscal', label: 'Módulo Fiscal', icon: Scale, color: 'blue' },
  { id: 'chat', label: 'Chat Clientes', icon: MessageCircle, color: 'purple' },
  { id: 'metrics', label: 'Métricas', icon: BarChart3 },
  { id: 'commissions', label: 'Comissões', icon: DollarSign },
  { id: 'withdrawals', label: 'Saques', icon: Wallet },
  { id: 'profile', label: 'Meu Perfil', icon: User },
  { id: 'services', label: 'Serviços AtentAI', icon: Sparkles, color: 'primary' },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

interface ModernPartnerNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  requestsCount?: number;
  fiscalCount?: number;
  isDark?: boolean;
}

export function ModernPartnerNavigation({
  activeTab,
  onTabChange,
  requestsCount = 0,
  fiscalCount = 0,
  isDark = false
}: ModernPartnerNavigationProps) {
  const getBadgeCount = (id: string) => {
    if (id === 'limpa-nome') return requestsCount;
    if (id === 'modulo-fiscal') return fiscalCount;
    return 0;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-8"
    >
      <div className={cn(
        "rounded-2xl border shadow-lg p-2",
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      )}>
        <div className="flex flex-wrap gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const badgeCount = getBadgeCount(item.id);
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  isActive
                    ? isDark ? "bg-slate-700 text-white shadow-sm" : "bg-slate-100 text-slate-900 shadow-sm"
                    : isDark ? "text-slate-400 hover:text-white hover:bg-slate-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={cn(
                      "absolute inset-0 rounded-xl",
                      item.color === 'emerald' && (isDark ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-emerald-100 border border-emerald-200"),
                      item.color === 'blue' && (isDark ? "bg-blue-500/20 border border-blue-500/30" : "bg-blue-100 border border-blue-200"),
                      item.color === 'purple' && (isDark ? "bg-purple-500/20 border border-purple-500/30" : "bg-purple-100 border border-purple-200"),
                      item.color === 'primary' && (isDark ? "bg-primary/20 border border-primary/30" : "bg-primary/10 border border-primary/20"),
                      !item.color && (isDark ? "bg-slate-700" : "bg-slate-100")
                    )}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={cn(
                  "h-4 w-4 relative z-10",
                  isActive && item.color === 'emerald' && (isDark ? "text-emerald-400" : "text-emerald-600"),
                  isActive && item.color === 'blue' && (isDark ? "text-blue-400" : "text-blue-600"),
                  isActive && item.color === 'purple' && (isDark ? "text-purple-400" : "text-purple-600"),
                  isActive && item.color === 'primary' && "text-primary",
                  isActive && !item.color && (isDark ? "text-white" : "text-slate-900"),
                  !isActive && (isDark ? "text-slate-500" : "text-slate-500")
                )} />
                <span className="relative z-10 hidden sm:inline">{item.label}</span>
                {badgeCount > 0 && (
                  <Badge 
                    className={cn(
                      "relative z-10 h-5 px-1.5 text-[10px] font-bold",
                      item.color === 'emerald' && "bg-emerald-600 text-white",
                      item.color === 'blue' && "bg-blue-600 text-white",
                      !item.color && (isDark ? "bg-slate-600 text-white" : "bg-slate-700 text-white")
                    )}
                  >
                    {badgeCount}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
