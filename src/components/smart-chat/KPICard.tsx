import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KPIMetric } from './types';
import { serviceConfig } from './types';

interface KPICardProps {
  kpi: KPIMetric;
  compact?: boolean;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({ kpi, compact = false, onClick }) => {
  const config = serviceConfig[kpi.service];
  
  const formatValue = (value: number, unit: KPIMetric['unit']) => {
    switch (unit) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value / 100);
      case 'percent':
        return `${value.toFixed(1)}%`;
      case 'days':
        return `${value}d`;
      default:
        return value.toLocaleString('pt-BR');
    }
  };

  const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;
  
  const statusConfig = {
    excellent: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    good: { icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    critical: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' },
  };
  
  const status = statusConfig[kpi.status];
  const StatusIcon = status.icon;

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
          'hover:bg-muted/50 active:scale-[0.98]',
          config.bgColor
        )}
      >
        <StatusIcon className={cn('h-4 w-4', status.color)} />
        <div className="flex-1 text-left">
          <p className="text-xs text-muted-foreground">{kpi.label}</p>
          <p className="text-sm font-semibold text-foreground">{formatValue(kpi.value, kpi.unit)}</p>
        </div>
        {kpi.trendPercent && (
          <div className={cn(
            'flex items-center gap-0.5 text-xs font-medium',
            kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
          )}>
            <TrendIcon className="h-3 w-3" />
            {Math.abs(kpi.trendPercent)}%
          </div>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl border transition-all group',
        'hover:shadow-md hover:border-primary/20 active:scale-[0.98]',
        'bg-card border-border'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className={cn(
          'px-2 py-0.5 rounded-full text-xs font-medium',
          config.bgColor,
          config.color
        )}>
          {config.label}
        </span>
        <StatusIcon className={cn('h-4 w-4', status.color)} />
      </div>
      
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{kpi.label}</p>
        <p className="text-2xl font-bold text-foreground tracking-tight">
          {formatValue(kpi.value, kpi.unit)}
        </p>
      </div>

      {kpi.trendPercent !== undefined && (
        <div className="mt-3 flex items-center gap-2">
          <div className={cn(
            'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
            kpi.trend === 'up' 
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30' 
              : 'bg-red-50 text-red-700 dark:bg-red-950/30'
          )}>
            <TrendIcon className="h-3 w-3" />
            {Math.abs(kpi.trendPercent)}%
          </div>
          <span className="text-xs text-muted-foreground">vs. mês anterior</span>
        </div>
      )}

      {kpi.target && (
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Meta</span>
            <span className="font-medium text-foreground">{formatValue(kpi.target, kpi.unit)}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                'h-full rounded-full transition-all',
                kpi.value >= kpi.target ? 'bg-emerald-500' : 'bg-primary'
              )}
              style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </button>
  );
};
