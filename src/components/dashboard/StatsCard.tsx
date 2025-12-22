import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'info' | 'accent' | 'destructive';
  className?: string;
}

const colorClasses = {
  primary: { bg: 'bg-primary/10', text: 'text-primary' },
  success: { bg: 'bg-success/10', text: 'text-success' },
  info: { bg: 'bg-info/10', text: 'text-info' },
  accent: { bg: 'bg-accent/10', text: 'text-accent' },
  destructive: { bg: 'bg-destructive/10', text: 'text-destructive' },
};

export const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
  color = 'primary',
  className,
}) => {
  const colors = colorClasses[color];

  return (
    <Card className={cn('bg-card border-border shadow-soft hover:shadow-medium transition-shadow', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium', trend.isPositive ? 'text-success' : 'text-destructive')}>
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                <span>{Math.abs(trend.value)}%</span>
                <span className="text-muted-foreground">vs mês anterior</span>
              </div>
            )}
          </div>
          <div className={cn('p-3 rounded-xl', colors.bg)}>
            <Icon className={cn('h-6 w-6', colors.text)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
