import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface OnboardingOptionCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  compact?: boolean;
}

const OnboardingOptionCard: React.FC<OnboardingOptionCardProps> = ({
  label,
  description,
  selected,
  onClick,
  compact = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border-2 transition-all duration-200",
        compact ? "p-3" : "p-4",
        selected
          ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
          : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/50"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors mt-0.5",
          selected ? "border-primary bg-primary" : "border-muted-foreground/40"
        )}>
          {selected && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium transition-colors",
            compact ? "text-sm" : "text-base",
            selected ? "text-foreground" : "text-foreground/80"
          )}>
            {label}
          </p>
          {description && (
            <p className={cn(
              "text-muted-foreground mt-1",
              compact ? "text-xs" : "text-sm"
            )}>
              {description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};

export default OnboardingOptionCard;
