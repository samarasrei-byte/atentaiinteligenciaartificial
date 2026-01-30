import React from 'react';
import { X, AlertTriangle, AlertCircle, Info, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { KPIAlert } from './types';
import { serviceConfig, alertLevelConfig } from './types';

interface KPIAlertPopupProps {
  alert: KPIAlert | null;
  onDismiss: () => void;
  onAction?: () => void;
}

export const KPIAlertPopup: React.FC<KPIAlertPopupProps> = ({ alert, onDismiss, onAction }) => {
  if (!alert) return null;

  const service = serviceConfig[alert.service];
  const level = alertLevelConfig[alert.level];
  
  const LevelIcon = alert.level === 'critical' ? AlertCircle : alert.level === 'warning' ? AlertTriangle : Info;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]',
          'rounded-2xl border shadow-2xl overflow-hidden',
          'bg-card',
          level.borderColor
        )}
      >
        {/* Header */}
        <div className={cn('px-4 py-3 flex items-center gap-3', level.bgColor)}>
          <div className={cn('p-1.5 rounded-lg', level.bgColor)}>
            <LevelIcon className={cn('h-4 w-4', level.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', service.bgColor, service.color)}>
                {service.label}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-foreground mt-0.5 truncate">
              {alert.title}
            </h4>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-4 space-y-3">
          <p className="text-sm text-foreground leading-relaxed">
            {alert.description}
          </p>
          
          {/* Impact */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-0.5">Impacto</p>
              <p className="text-sm text-foreground">{alert.impact}</p>
            </div>
          </div>

          {/* AI Suggestion */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-primary mb-0.5">Sugestão da IA</p>
              <p className="text-sm text-foreground">{alert.suggestion}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-3 border-t border-border flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="flex-1"
          >
            Ignorar
          </Button>
          {alert.actionLabel && (
            <Button
              size="sm"
              onClick={() => {
                onAction?.();
                alert.actionHandler?.();
              }}
              className="flex-1 gap-1"
            >
              {alert.actionLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
