import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Gift, HelpCircle } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

interface FreeToolBadgeProps {
  className?: string;
  variant?: 'default' | 'compact' | 'inline';
}

/**
 * Standardized badge for free tools with microcopy explanation.
 * Use this on all free public tools to explain why they're free.
 */
export const FreeToolBadge: React.FC<FreeToolBadgeProps> = ({ 
  className = '',
  variant = 'default'
}) => {
  if (variant === 'compact') {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Badge 
            className={`bg-emerald-500/20 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/30 cursor-help ${className}`}
          >
            <Gift className="h-3 w-3 mr-1" />
            Grátis
            <HelpCircle className="h-3 w-3 ml-1 opacity-70" />
          </Badge>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 text-sm">
          <div className="space-y-2">
            <p className="font-semibold text-foreground">Por que é gratuito?</p>
            <p className="text-muted-foreground">
              Ferramenta educacional para apoiar a transição tributária — sem custo, sem cartão, sem compromisso.
            </p>
            <p className="text-xs text-muted-foreground/80">
              Serviços resolutivos (como análise fiscal e limpa nome) têm custo conforme seleção.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-emerald-600 ${className}`}>
        <Gift className="h-4 w-4" />
        <span className="font-medium">Grátis</span>
        <span className="text-muted-foreground text-sm">— ferramenta educacional</span>
      </span>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Badge 
        className="w-fit bg-emerald-500/20 text-emerald-600 border-emerald-500/30 px-3 py-1.5"
      >
        <Gift className="h-3.5 w-3.5 mr-1.5" />
        Ferramenta Gratuita
      </Badge>
      <p className="text-sm text-muted-foreground max-w-md">
        Grátis para uso educativo e orientativo. Serviços resolutivos têm custo conforme seleção.
      </p>
    </div>
  );
};
