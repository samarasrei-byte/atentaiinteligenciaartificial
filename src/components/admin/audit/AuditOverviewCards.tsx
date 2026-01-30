import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Scale, 
  LayoutDashboard, 
  FileText, 
  Building2,
  DollarSign,
  TrendingUp
} from 'lucide-react';

interface ServiceStats {
  limpaNome: { total: number; pending: number; completed: number; revenue: number };
  analiseFiscal: { total: number; pending: number; completed: number; revenue: number };
  bi: { total: number; pending: number; completed: number; revenue: number };
  ir: { total: number; pending: number; completed: number; revenue: number };
  certificates: { total: number; pending: number; completed: number; revenue: number };
  companyOpening: { total: number; pending: number; completed: number; revenue: number };
}

interface AuditOverviewCardsProps {
  stats: ServiceStats;
  totalPayments: number;
  totalRevenue: number;
}

const serviceConfig = {
  limpaNome: { 
    label: '[LIMPA_NOME]', 
    title: 'Limpa Nome', 
    icon: Shield, 
    color: 'emerald',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200'
  },
  analiseFiscal: { 
    label: '[ANALISE_FISCAL]', 
    title: 'Análise Fiscal', 
    icon: Scale, 
    color: 'violet',
    bgColor: 'bg-violet-100',
    textColor: 'text-violet-700',
    borderColor: 'border-violet-200'
  },
  bi: { 
    label: '[BI]', 
    title: 'BI Contabilidade', 
    icon: LayoutDashboard, 
    color: 'indigo',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200'
  },
  ir: { 
    label: '[IR]', 
    title: 'Declaração IR', 
    icon: FileText, 
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  certificates: { 
    label: '[CERTIDAO]', 
    title: 'Certidões', 
    icon: FileText, 
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200'
  },
  companyOpening: { 
    label: '[ABERTURA]', 
    title: 'Abertura Empresa', 
    icon: Building2, 
    color: 'pink',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-700',
    borderColor: 'border-pink-200'
  },
};

const formatCurrency = (cents: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

export const AuditOverviewCards: React.FC<AuditOverviewCardsProps> = ({ 
  stats, 
  totalPayments, 
  totalRevenue 
}) => {
  const totalServices = Object.values(stats).reduce((sum, s) => sum + s.total, 0);
  const totalCompleted = Object.values(stats).reduce((sum, s) => sum + s.completed, 0);

  return (
    <div className="space-y-6">
      {/* Main KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80 mb-1">Total de Serviços</p>
                <p className="text-3xl font-bold text-white">{totalServices}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/20">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-white/70 mt-2">
              {totalCompleted} concluídos ({totalServices > 0 ? Math.round((totalCompleted / totalServices) * 100) : 0}%)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80 mb-1">Receita Total</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/20">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-white/70 mt-2">
              {totalPayments} pagamentos processados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500 to-violet-600 border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80 mb-1">Taxa de Conclusão</p>
                <p className="text-3xl font-bold text-white">
                  {totalServices > 0 ? Math.round((totalCompleted / totalServices) * 100) : 0}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/20">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-white/70 mt-2">
              Eficiência operacional
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80 mb-1">Ticket Médio</p>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(totalServices > 0 ? totalRevenue / totalServices : 0)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/20">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-white/70 mt-2">
              Por serviço executado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(stats).map(([key, data]) => {
          const config = serviceConfig[key as keyof typeof serviceConfig];
          if (!config) return null;
          const Icon = config.icon;

          return (
            <Card key={key} className={`bg-white border ${config.borderColor}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Badge className={`${config.bgColor} ${config.textColor} border-0 text-xs font-mono`}>
                    {config.label}
                  </Badge>
                  <div className={`p-2 rounded-lg ${config.bgColor}`}>
                    <Icon className={`h-4 w-4 ${config.textColor}`} />
                  </div>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{config.title}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total:</span>
                    <span className="font-medium text-slate-900">{data.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pendentes:</span>
                    <span className="font-medium text-amber-600">{data.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Concluídos:</span>
                    <span className="font-medium text-emerald-600">{data.completed}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100">
                    <span className="text-slate-500">Receita:</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(data.revenue)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
