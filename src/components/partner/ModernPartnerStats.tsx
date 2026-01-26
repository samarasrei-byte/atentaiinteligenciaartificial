import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Clock, 
  TrendingUp, 
  CheckCircle,
  DollarSign,
  Wallet,
  ArrowUpRight,
  Shield,
  Scale
} from 'lucide-react';

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  totalRevenue: number;
  limpaNomeCount: number;
  fiscalCount: number;
}

interface ModernPartnerStatsProps {
  stats: Stats;
  commissionPercent: number;
  formatCurrency: (cents: number) => string;
  isDark?: boolean;
}

export function ModernPartnerStats({
  stats,
  commissionPercent,
  formatCurrency,
  isDark = false
}: ModernPartnerStatsProps) {
  const commissionAmount = stats.totalRevenue * commissionPercent / 100;

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            icon: FileText, 
            label: 'Total Solicitações', 
            value: stats.total, 
            bgColorLight: 'bg-blue-50',
            bgColorDark: 'bg-blue-500/10',
            iconBgLight: 'bg-blue-100',
            iconBgDark: 'bg-blue-500/20',
            iconColor: 'text-blue-600',
            textColorLight: 'text-blue-600',
            textColorDark: 'text-blue-400'
          },
          { 
            icon: Clock, 
            label: 'Pendentes', 
            value: stats.pending, 
            bgColorLight: 'bg-amber-50',
            bgColorDark: 'bg-amber-500/10',
            iconBgLight: 'bg-amber-100',
            iconBgDark: 'bg-amber-500/20',
            iconColor: 'text-amber-600',
            textColorLight: 'text-amber-600',
            textColorDark: 'text-amber-400'
          },
          { 
            icon: TrendingUp, 
            label: 'Em Andamento', 
            value: stats.inProgress, 
            bgColorLight: 'bg-cyan-50',
            bgColorDark: 'bg-cyan-500/10',
            iconBgLight: 'bg-cyan-100',
            iconBgDark: 'bg-cyan-500/20',
            iconColor: 'text-cyan-600',
            textColorLight: 'text-cyan-600',
            textColorDark: 'text-cyan-400'
          },
          { 
            icon: CheckCircle, 
            label: 'Concluídos', 
            value: stats.completed, 
            bgColorLight: 'bg-emerald-50',
            bgColorDark: 'bg-emerald-500/10',
            iconBgLight: 'bg-emerald-100',
            iconBgDark: 'bg-emerald-500/20',
            iconColor: 'text-emerald-600',
            textColorLight: 'text-emerald-600',
            textColorDark: 'text-emerald-400'
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={cn(
              "border-0 shadow-lg hover:shadow-xl transition-shadow",
              isDark ? stat.bgColorDark : stat.bgColorLight
            )}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("p-2.5 rounded-xl", isDark ? stat.iconBgDark : stat.iconBgLight)}>
                    <stat.icon className={cn("h-5 w-5", isDark ? stat.textColorDark : stat.iconColor)} />
                  </div>
                </div>
                <p className={cn("text-3xl font-bold", isDark ? stat.textColorDark : stat.textColorLight)}>
                  {stat.value}
                </p>
                <p className={cn("text-sm mt-1 font-medium", isDark ? 'text-slate-300' : 'text-slate-600')}>
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className={cn(
            "shadow-lg",
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          )}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn("text-sm mb-1 font-medium", isDark ? 'text-slate-400' : 'text-slate-600')}>
                    Receita Total
                  </p>
                  <p className={cn("text-3xl font-bold", isDark ? 'text-white' : 'text-slate-900')}>
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                  <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1 font-medium">
                    <ArrowUpRight className="h-4 w-4" /> +18.5% vs mês anterior
                  </p>
                </div>
                <div className={cn(
                  "h-16 w-16 rounded-2xl flex items-center justify-center",
                  isDark ? 'bg-slate-700' : 'bg-slate-100'
                )}>
                  <DollarSign className={cn("h-8 w-8", isDark ? 'text-slate-300' : 'text-slate-700')} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className={cn(
            "shadow-lg",
            isDark 
              ? 'bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border-emerald-700/50' 
              : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
          )}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn("text-sm mb-1 font-medium", isDark ? 'text-emerald-300' : 'text-emerald-700')}>
                    Sua Comissão ({commissionPercent}%)
                  </p>
                  <p className={cn("text-3xl font-bold", isDark ? 'text-emerald-400' : 'text-emerald-700')}>
                    {formatCurrency(commissionAmount)}
                  </p>
                  <p className={cn("text-sm mt-2 font-medium", isDark ? 'text-emerald-400' : 'text-emerald-600')}>
                    Disponível para saque
                  </p>
                </div>
                <div className={cn(
                  "h-16 w-16 rounded-2xl flex items-center justify-center",
                  isDark ? 'bg-emerald-800/50' : 'bg-emerald-200'
                )}>
                  <Wallet className={cn("h-8 w-8", isDark ? 'text-emerald-400' : 'text-emerald-700')} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Service Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className={cn(
            "shadow-lg",
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          )}>
            <CardHeader className="pb-2">
              <CardTitle className={cn(
                "text-base flex items-center gap-2",
                isDark ? 'text-white' : 'text-slate-900'
              )}>
                <Shield className="h-5 w-5 text-emerald-600" />
                Limpa Nome
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-emerald-600">{stats.limpaNomeCount}</p>
              <p className={cn("text-sm mt-1", isDark ? 'text-slate-400' : 'text-slate-600')}>
                Solicitações ativas
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className={cn(
            "shadow-lg",
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          )}>
            <CardHeader className="pb-2">
              <CardTitle className={cn(
                "text-base flex items-center gap-2",
                isDark ? 'text-white' : 'text-slate-900'
              )}>
                <Scale className="h-5 w-5 text-blue-600" />
                Módulo Fiscal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-600">{stats.fiscalCount}</p>
              <p className={cn("text-sm mt-1", isDark ? 'text-slate-400' : 'text-slate-600')}>
                Análises em andamento
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
