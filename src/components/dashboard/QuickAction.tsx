import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
  badge?: string;
  gradient?: string;
  iconBg?: string;
}

export const QuickAction: React.FC<QuickActionProps> = ({
  icon: Icon,
  title,
  description,
  onClick,
  badge,
  gradient,
  iconBg = 'bg-primary/10',
}) => {
  return (
    <Card 
      className={cn(
        'bg-card border-border shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer group overflow-hidden',
        gradient && `bg-gradient-to-br ${gradient} text-white border-0`
      )}
      onClick={onClick}
    >
      <CardContent className="p-5 relative">
        <div className="flex items-start justify-between mb-3">
          <div className={cn('p-2.5 rounded-lg', gradient ? 'bg-white/10' : iconBg)}>
            <Icon className={cn('h-5 w-5', gradient ? 'text-white' : 'text-foreground')} />
          </div>
          {badge && (
            <Badge className={cn(gradient ? 'bg-white/20 text-white' : 'bg-accent text-accent-foreground', 'text-xs')}>
              {badge}
            </Badge>
          )}
        </div>
        <h3 className={cn('font-semibold mb-1 group-hover:text-primary transition-colors', gradient && 'text-white group-hover:text-white')}>
          {title}
        </h3>
        <p className={cn('text-sm', gradient ? 'text-white/80' : 'text-muted-foreground')}>
          {description}
        </p>
        <ArrowUpRight className={cn('absolute bottom-4 right-4 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity', gradient ? 'text-white/60' : 'text-muted-foreground')} />
      </CardContent>
    </Card>
  );
};

export default QuickAction;
