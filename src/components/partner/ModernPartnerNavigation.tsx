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
}

export function ModernPartnerNavigation({
  activeTab,
  onTabChange,
  requestsCount = 0,
  fiscalCount = 0
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-2">
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
                    ? "bg-slate-100 text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={cn(
                      "absolute inset-0 rounded-xl",
                      item.color === 'emerald' && "bg-emerald-100 border border-emerald-200",
                      item.color === 'blue' && "bg-blue-100 border border-blue-200",
                      item.color === 'purple' && "bg-purple-100 border border-purple-200",
                      item.color === 'primary' && "bg-primary/10 border border-primary/20",
                      !item.color && "bg-slate-100"
                    )}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={cn(
                  "h-4 w-4 relative z-10",
                  isActive && item.color === 'emerald' && "text-emerald-600",
                  isActive && item.color === 'blue' && "text-blue-600",
                  isActive && item.color === 'purple' && "text-purple-600",
                  isActive && item.color === 'primary' && "text-primary",
                  isActive && !item.color && "text-slate-900",
                  !isActive && "text-slate-500"
                )} />
                <span className="relative z-10 hidden sm:inline">{item.label}</span>
                {badgeCount > 0 && (
                  <Badge 
                    className={cn(
                      "relative z-10 h-5 px-1.5 text-[10px] font-bold",
                      item.color === 'emerald' && "bg-emerald-600 text-white",
                      item.color === 'blue' && "bg-blue-600 text-white",
                      !item.color && "bg-slate-700 text-white"
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
