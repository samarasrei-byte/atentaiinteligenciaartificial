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
          { icon: FileText, label: 'Total Solicitações', value: stats.total, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
          { icon: Clock, label: 'Pendentes', value: stats.pending, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
          { icon: TrendingUp, label: 'Em Andamento', value: stats.inProgress, iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600' },
          { icon: CheckCircle, label: 'Concluídos', value: stats.completed, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="bg-white border-slate-200 hover:border-slate-300 transition-all duration-300 shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-600 mt-1">{stat.label}</p>
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
          <Card className="bg-white border-slate-200 shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-50" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    Receita Total Gerada
                  </p>
                  <p className="text-4xl font-bold text-slate-900 mb-2">{formatCurrency(stats.totalRevenue)}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-emerald-600 flex items-center gap-1">
                      <ArrowUpRight className="h-4 w-4" />
                      +18.5% este mês
                    </span>
                  </div>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <DollarSign className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              
              {/* Service Breakdown */}
              <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <Shield className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-slate-900 font-semibold">{stats.limpaNomeCount}</p>
                    <p className="text-sm text-slate-600">Limpa Nome</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Scale className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-slate-900 font-semibold">{stats.fiscalCount}</p>
                    <p className="text-sm text-slate-600">Módulo Fiscal</p>
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
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 border-emerald-600 h-full overflow-hidden relative shadow-lg">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
            <CardContent className="p-6 relative h-full flex flex-col justify-between">
              <div>
                <p className="text-sm text-white/90 mb-2 flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Sua Comissão ({commissionPercent}%)
                </p>
                <p className="text-3xl font-bold text-white mb-1">
                  {formatCurrency(commissionAmount)}
                </p>
                <p className="text-sm text-white/80">Disponível para saque</p>
              </div>
              <div className="mt-4 p-3 rounded-xl bg-white/20 border border-white/30">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-white" />
                  <span className="text-sm text-white">
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
