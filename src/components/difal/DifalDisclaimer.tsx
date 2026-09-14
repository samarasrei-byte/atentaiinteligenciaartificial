import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DIFAL_DISCLAIMER } from '@/lib/difal/types';

interface DifalDisclaimerProps {
  className?: string;
}

/** Aviso obrigatório exibido em todo resultado e relatório do módulo DIFAL. */
export function DifalDisclaimer({ className }: DifalDisclaimerProps) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground',
        className,
      )}
      role="note"
    >
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-primary" aria-hidden />
      <p>{DIFAL_DISCLAIMER}</p>
    </div>
  );
}
