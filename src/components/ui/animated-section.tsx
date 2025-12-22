import React from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-left' | 'fade-right' | 'scale' | 'fade';
  delay?: number;
  threshold?: number;
}

export function AnimatedSection({
  children,
  className,
  animation = 'fade-up',
  delay = 0,
  threshold = 0.1,
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold });

  const animations = {
    'fade-up': {
      hidden: 'opacity-0 translate-y-12',
      visible: 'opacity-100 translate-y-0',
    },
    'fade-left': {
      hidden: 'opacity-0 -translate-x-12',
      visible: 'opacity-100 translate-x-0',
    },
    'fade-right': {
      hidden: 'opacity-0 translate-x-12',
      visible: 'opacity-100 translate-x-0',
    },
    'scale': {
      hidden: 'opacity-0 scale-95',
      visible: 'opacity-100 scale-100',
    },
    'fade': {
      hidden: 'opacity-0',
      visible: 'opacity-100',
    },
  };

  const { hidden, visible } = animations[animation];

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        isVisible ? visible : hidden,
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
