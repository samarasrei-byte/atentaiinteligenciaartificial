import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface HelpTooltipProps {
  content: string;
  title?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  iconClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function HelpTooltip({
  content,
  title,
  side = 'top',
  className,
  iconClassName,
  size = 'sm',
}: HelpTooltipProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex items-center justify-center rounded-full',
              'text-muted-foreground hover:text-primary transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
              'cursor-help',
              className
            )}
          >
            <HelpCircle className={cn(sizeClasses[size], iconClassName)} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="max-w-[280px] p-3 bg-popover border border-border shadow-lg"
        >
          {title && (
            <p className="font-semibold text-foreground mb-1 text-sm">{title}</p>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
