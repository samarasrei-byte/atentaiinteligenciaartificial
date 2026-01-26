import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  Clock, 
  TrendingUp, 
  CheckCircle,
  DollarSign,
  Wallet,
  ArrowUpRight,
  Users,
  Shield,
  Scale
} from 'lucide-react';

interface StatsData {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  totalRevenue: number;
  limpaNomeCount: number;
  fiscalCount: number;
}

interface ModernPartnerStatsProps {
  stats: StatsData;
  commissionPercent: number;
  formatCurrency: (cents: number) => string;
}

export function ModernPartnerStats({ 
  stats, 
  commissionPercent, 
  formatCurrency 
}: ModernPartnerStatsProps) {
  const commissionAmount = stats.totalRevenue * commissionPercent / 100;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: 'Total Solicitações', value: stats.total, color: 'primary', gradient: 'from-blue-500/20 to-blue-600/10' },
          { icon: Clock, label: 'Pendentes', value: stats.pending, color: 'amber', gradient: 'from-amber-500/20 to-amber-600/10' },
          { icon: TrendingUp, label: 'Em Andamento', value: stats.inProgress, color: 'cyan', gradient: 'from-cyan-500/20 to-cyan-600/10' },
          { icon: CheckCircle, label: 'Concluídos', value: stats.completed, color: 'emerald', gradient: 'from-emerald-500/20 to-emerald-600/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`bg-gradient-to-br ${stat.gradient} border-slate-700/50 hover:border-${stat.color}-500/50 transition-all duration-300 overflow-hidden relative group`}>
              <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
              <CardContent className="p-5 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-${stat.color}-500/20 border border-${stat.color}-500/30`}>
                    <stat.icon className={`h-5 w-5 text-${stat.color}-400`} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="md:col-span-2"
        >
          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Receita Total Gerada
                  </p>
                  <p className="text-4xl font-bold text-white mb-2">{formatCurrency(stats.totalRevenue)}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <ArrowUpRight className="h-4 w-4" />
                      +18.5% este mês
                    </span>
                  </div>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center">
                  <DollarSign className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
              
              {/* Service Breakdown */}
              <div className="mt-6 pt-4 border-t border-slate-700/50 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Shield className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{stats.limpaNomeCount}</p>
                    <p className="text-xs text-slate-500">Limpa Nome</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Scale className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{stats.fiscalCount}</p>
                    <p className="text-xs text-slate-500">Módulo Fiscal</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.25 }}
        >
          <Card className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 border-emerald-500/30 h-full overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
            <CardContent className="p-6 relative h-full flex flex-col justify-between">
              <div>
                <p className="text-sm text-emerald-300/80 mb-2 flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Sua Comissão ({commissionPercent}%)
                </p>
                <p className="text-3xl font-bold text-emerald-400 mb-1">
                  {formatCurrency(commissionAmount)}
                </p>
                <p className="text-xs text-emerald-300/60">Disponível para saque</p>
              </div>
              <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span className="text-xs text-slate-400">
                    {stats.completed} clientes atendidos
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
