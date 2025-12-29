import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Bell, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Building2,
  Receipt,
  Coins
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransitionAlert {
  year: number;
  phase: string;
  ibsRate: number;
  cbsRate: number;
  totalRate: number;
  oldSystemReduction: number;
  alerts: {
    type: 'info' | 'warning' | 'action' | 'success';
    title: string;
    description: string;
    icon: React.ReactNode;
  }[];
  splitPayment: boolean;
  cashbackActive: boolean;
}

const transitionAlerts: TransitionAlert[] = [
  {
    year: 2026,
    phase: 'Teste',
    ibsRate: 0.1,
    cbsRate: 0.9,
    totalRate: 1.0,
    oldSystemReduction: 0,
    splitPayment: true,
    cashbackActive: true,
    alerts: [
      {
        type: 'warning',
        title: 'Split Payment Obrigatório',
        description: 'Todas as empresas devem implementar o split payment para recolhimento automático de CBS e IBS nas transações.',
        icon: <Receipt className="h-4 w-4" />
      },
      {
        type: 'info',
        title: 'Fase de Testes',
        description: 'CBS (0,9%) e IBS (0,1%) em fase de teste. Sistema antigo continua integral.',
        icon: <Clock className="h-4 w-4" />
      },
      {
        type: 'action',
        title: 'Cashback para Baixa Renda',
        description: 'Início do programa de devolução de impostos para famílias no CadÚnico.',
        icon: <Coins className="h-4 w-4" />
      }
    ]
  },
  {
    year: 2027,
    phase: 'Início da Transição',
    ibsRate: 8.0,
    cbsRate: 8.8,
    totalRate: 16.8,
    oldSystemReduction: 0,
    splitPayment: true,
    cashbackActive: true,
    alerts: [
      {
        type: 'warning',
        title: 'Aumento Significativo',
        description: 'IBS sobe para 8% e CBS para 8,8%. Total de 16,8% no novo sistema.',
        icon: <TrendingUp className="h-4 w-4" />
      },
      {
        type: 'info',
        title: 'Sistema Duplo Ativo',
        description: 'Empresas devem calcular tributos nos dois sistemas simultaneamente.',
        icon: <Building2 className="h-4 w-4" />
      }
    ]
  },
  {
    year: 2028,
    phase: 'Transição Ativa',
    ibsRate: 10.0,
    cbsRate: 8.8,
    totalRate: 18.8,
    oldSystemReduction: 10,
    splitPayment: true,
    cashbackActive: true,
    alerts: [
      {
        type: 'action',
        title: 'Redução de 10% no Sistema Antigo',
        description: 'ICMS, ISS, PIS e COFINS reduzidos em 10%. Aproveite créditos remanescentes.',
        icon: <ArrowRight className="h-4 w-4" />
      },
      {
        type: 'warning',
        title: 'IBS Aumenta para 10%',
        description: 'IBS estadual/municipal sobe para 10%. CBS mantém 8,8%.',
        icon: <TrendingUp className="h-4 w-4" />
      }
    ]
  },
  {
    year: 2029,
    phase: 'Transição Ativa',
    ibsRate: 20.0,
    cbsRate: 8.8,
    totalRate: 28.8,
    oldSystemReduction: 20,
    splitPayment: true,
    cashbackActive: true,
    alerts: [
      {
        type: 'warning',
        title: 'IBS Dobra para 20%',
        description: 'Maior salto do IBS. Sistema antigo reduzido em 20%.',
        icon: <AlertTriangle className="h-4 w-4" />
      },
      {
        type: 'action',
        title: 'Revisar Precificação',
        description: 'Carga tributária total pode impactar preços. Revise sua estratégia.',
        icon: <Coins className="h-4 w-4" />
      }
    ]
  },
  {
    year: 2030,
    phase: 'Transição Intermediária',
    ibsRate: 40.0,
    cbsRate: 8.8,
    totalRate: 48.8,
    oldSystemReduction: 40,
    splitPayment: true,
    cashbackActive: true,
    alerts: [
      {
        type: 'warning',
        title: 'Ponto Médio da Transição',
        description: 'IBS em 40%, sistema antigo reduzido pela metade.',
        icon: <AlertTriangle className="h-4 w-4" />
      },
      {
        type: 'info',
        title: 'Créditos em Migração',
        description: 'Verifique saldo de créditos do sistema antigo para compensação.',
        icon: <Receipt className="h-4 w-4" />
      }
    ]
  },
  {
    year: 2031,
    phase: 'Transição Avançada',
    ibsRate: 60.0,
    cbsRate: 8.8,
    totalRate: 68.8,
    oldSystemReduction: 60,
    splitPayment: true,
    cashbackActive: true,
    alerts: [
      {
        type: 'action',
        title: 'Novo Sistema Predominante',
        description: 'IBS já representa 60%. Priorize adaptação total ao novo modelo.',
        icon: <Building2 className="h-4 w-4" />
      }
    ]
  },
  {
    year: 2032,
    phase: 'Pré-Definitivo',
    ibsRate: 80.0,
    cbsRate: 8.8,
    totalRate: 88.8,
    oldSystemReduction: 80,
    splitPayment: true,
    cashbackActive: true,
    alerts: [
      {
        type: 'warning',
        title: 'Último Ano de Transição',
        description: 'Sistema antigo em apenas 20%. Prepare-se para extinção total.',
        icon: <Clock className="h-4 w-4" />
      },
      {
        type: 'action',
        title: 'Extinguir Créditos Remanescentes',
        description: 'Utilize todos os créditos de ICMS, ISS, PIS e COFINS antes de 2033.',
        icon: <AlertTriangle className="h-4 w-4" />
      }
    ]
  },
  {
    year: 2033,
    phase: 'Regime Definitivo',
    ibsRate: 17.7,
    cbsRate: 8.8,
    totalRate: 26.5,
    oldSystemReduction: 100,
    splitPayment: true,
    cashbackActive: true,
    alerts: [
      {
        type: 'success',
        title: 'Transição Concluída',
        description: 'ICMS, ISS, PIS e COFINS extintos. Apenas IBS (17,7%) + CBS (8,8%).',
        icon: <CheckCircle2 className="h-4 w-4" />
      },
      {
        type: 'info',
        title: 'Alíquota Única de Referência',
        description: 'Total de 26,5% com sistema simplificado e não-cumulativo.',
        icon: <Coins className="h-4 w-4" />
      }
    ]
  }
];

interface TransitionYearAlertsProps {
  selectedYear?: number;
  compact?: boolean;
  className?: string;
}

export function TransitionYearAlerts({ selectedYear, compact = false, className }: TransitionYearAlertsProps) {
  const currentYear = new Date().getFullYear();
  const [activeYear, setActiveYear] = useState(selectedYear || Math.max(currentYear, 2026));

  useEffect(() => {
    if (selectedYear) {
      setActiveYear(selectedYear);
    }
  }, [selectedYear]);

  const currentAlert = transitionAlerts.find(a => a.year === activeYear);
  const isCurrentYear = activeYear === currentYear;
  const isFuture = activeYear > currentYear;
  const isPast = activeYear < currentYear;

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'action': return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'success': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      default: return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
    }
  };

  const getPhaseColor = (phase: string) => {
    if (phase === 'Regime Definitivo') return 'bg-emerald-500/20 text-emerald-400';
    if (phase === 'Teste') return 'bg-blue-500/20 text-blue-400';
    if (phase.includes('Pré')) return 'bg-amber-500/20 text-amber-400';
    return 'bg-primary/20 text-primary';
  };

  if (compact) {
    return (
      <Card className={cn("bg-card/50 backdrop-blur-sm border-border/50", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Bell className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Alertas {activeYear}</span>
            <Badge className={getPhaseColor(currentAlert?.phase || '')}>
              {currentAlert?.phase}
            </Badge>
          </div>
          <div className="space-y-2">
            {currentAlert?.alerts.slice(0, 2).map((alert, i) => (
              <div key={i} className={cn("p-2 rounded-lg border flex items-start gap-2", getAlertVariant(alert.type))}>
                {alert.icon}
                <span className="text-sm">{alert.title}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-card/50 backdrop-blur-sm border-border/50", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-primary" />
            Alertas da Transição Tributária
          </CardTitle>
          <Badge className={getPhaseColor(currentAlert?.phase || '')}>
            {currentAlert?.phase}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Year Selector */}
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {transitionAlerts.map((alert) => (
            <button
              key={alert.year}
              onClick={() => setActiveYear(alert.year)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap touch-manipulation",
                activeYear === alert.year
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {alert.year}
            </button>
          ))}
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {isCurrentYear && "Ano atual"}
            {isFuture && `Faltam ${activeYear - currentYear} ano(s)`}
            {isPast && "Período concluído"}
          </span>
        </div>

        {/* Tax Summary */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-muted/30">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">IBS</div>
            <div className="text-lg font-bold text-primary">{currentAlert?.ibsRate}%</div>
          </div>
          <div className="text-center border-x border-border/50">
            <div className="text-xs text-muted-foreground">CBS</div>
            <div className="text-lg font-bold text-primary">{currentAlert?.cbsRate}%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Sistema Antigo</div>
            <div className="text-lg font-bold text-amber-400">-{currentAlert?.oldSystemReduction}%</div>
          </div>
        </div>

        {/* Active Features */}
        <div className="flex gap-2">
          {currentAlert?.splitPayment && (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
              <Receipt className="h-3 w-3 mr-1" />
              Split Payment
            </Badge>
          )}
          {currentAlert?.cashbackActive && (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              <Coins className="h-3 w-3 mr-1" />
              Cashback Ativo
            </Badge>
          )}
        </div>

        {/* Alerts List */}
        <div className="space-y-2">
          {currentAlert?.alerts.map((alert, index) => (
            <Alert key={index} className={cn("border", getAlertVariant(alert.type))}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{alert.icon}</div>
                <div>
                  <AlertTitle className="text-sm font-semibold">{alert.title}</AlertTitle>
                  <AlertDescription className="text-xs text-muted-foreground mt-1">
                    {alert.description}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </div>

        {/* Legal Reference */}
        <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border/50">
          Fonte: LC 214/2025 • Art. 125 a 133 (Período de Transição)
        </p>
      </CardContent>
    </Card>
  );
}

export default TransitionYearAlerts;
