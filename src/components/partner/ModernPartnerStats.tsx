import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
}

export function ModernPartnerStats({
  stats,
  commissionPercent,
  formatCurrency
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
            bgColor: 'bg-blue-50',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            textColor: 'text-blue-600'
          },
          { 
            icon: Clock, 
            label: 'Pendentes', 
            value: stats.pending, 
            bgColor: 'bg-amber-50',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            textColor: 'text-amber-600'
          },
          { 
            icon: TrendingUp, 
            label: 'Em Andamento', 
            value: stats.inProgress, 
            bgColor: 'bg-cyan-50',
            iconBg: 'bg-cyan-100',
            iconColor: 'text-cyan-600',
            textColor: 'text-cyan-600'
          },
          { 
            icon: CheckCircle, 
            label: 'Concluídos', 
            value: stats.completed, 
            bgColor: 'bg-emerald-50',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            textColor: 'text-emerald-600'
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`${stat.bgColor} border-0 shadow-lg hover:shadow-xl transition-shadow`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                <p className="text-sm text-slate-600 mt-1 font-medium">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-white border-slate-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1 font-medium">Receita Total</p>
                  <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1 font-medium">
                    <ArrowUpRight className="h-4 w-4" /> +18.5% vs mês anterior
                  </p>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <DollarSign className="h-8 w-8 text-slate-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-700 mb-1 font-medium">Sua Comissão ({commissionPercent}%)</p>
                  <p className="text-3xl font-bold text-emerald-700">{formatCurrency(commissionAmount)}</p>
                  <p className="text-sm text-emerald-600 mt-2 font-medium">Disponível para saque</p>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-emerald-200 flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-emerald-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Service Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-white border-slate-200 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                <Shield className="h-5 w-5 text-emerald-600" />
                Limpa Nome
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-emerald-600">{stats.limpaNomeCount}</p>
              <p className="text-sm text-slate-600 mt-1">Solicitações ativas</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="bg-white border-slate-200 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                <Scale className="h-5 w-5 text-blue-600" />
                Módulo Fiscal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-600">{stats.fiscalCount}</p>
              <p className="text-sm text-slate-600 mt-1">Análises em andamento</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
