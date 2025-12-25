import React from 'react';
import { cn } from '@/lib/utils';

interface OnboardingStepHeaderProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  iconColor?: string;
}

const OnboardingStepHeader: React.FC<OnboardingStepHeaderProps> = ({
  icon: Icon,
  title,
  description,
  iconColor = 'text-primary',
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className={cn("p-2 rounded-xl bg-primary/10", iconColor.includes('text-') ? '' : iconColor)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      {description && (
        <p className="text-muted-foreground text-sm ml-12">{description}</p>
      )}
    </div>
  );
};

export default OnboardingStepHeader;
