import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, HelpCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TourStep } from '@/hooks/useGuidedTour';

interface GuidedTourProps {
  isActive: boolean;
  currentStep: TourStep | null;
  currentStepIndex: number;
  totalSteps: number;
  progress: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
}

interface SpotlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TooltipPosition {
  top: number;
  left: number;
}

export function GuidedTour({
  isActive,
  currentStep,
  currentStepIndex,
  totalSteps,
  progress,
  isFirstStep,
  isLastStep,
  onNext,
  onPrev,
  onSkip,
  onClose,
}: GuidedTourProps) {
  const [spotlightPosition, setSpotlightPosition] = useState<SpotlightPosition | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !currentStep) {
      setSpotlightPosition(null);
      return;
    }

    const updatePosition = () => {
      const element = document.querySelector(currentStep.target);
      if (!element) {
        // If element not found, show tooltip in center
        setSpotlightPosition(null);
        setTooltipPosition({
          top: window.innerHeight / 2 - 100,
          left: window.innerWidth / 2 - 180,
        });
        return;
      }

      const rect = element.getBoundingClientRect();
      const padding = currentStep.spotlightPadding || 8;

      setSpotlightPosition({
        top: rect.top - padding + window.scrollY,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });

      // Calculate tooltip position
      const tooltipWidth = 360;
      const tooltipHeight = 200;
      const margin = 16;
      let top = 0;
      let left = 0;

      const position = currentStep.position || 'bottom';

      switch (position) {
        case 'top':
          top = rect.top + window.scrollY - tooltipHeight - margin;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'bottom':
          top = rect.bottom + window.scrollY + margin;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'left':
          top = rect.top + window.scrollY + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - margin;
          break;
        case 'right':
          top = rect.top + window.scrollY + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + margin;
          break;
      }

      // Keep tooltip in viewport
      left = Math.max(margin, Math.min(left, window.innerWidth - tooltipWidth - margin));
      top = Math.max(margin, Math.min(top, window.innerHeight + window.scrollY - tooltipHeight - margin));

      setTooltipPosition({ top, left });

      // Scroll element into view if needed
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    updatePosition();

    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(document.body);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isActive, currentStep]);

  if (!isActive || !currentStep) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay with spotlight cutout */}
      <div className="absolute inset-0 pointer-events-auto">
        <svg className="w-full h-full" style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {spotlightPosition && (
                <rect
                  x={spotlightPosition.left}
                  y={spotlightPosition.top}
                  width={spotlightPosition.width}
                  height={spotlightPosition.height}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
            onClick={onClose}
          />
        </svg>

        {/* Spotlight border glow */}
        {spotlightPosition && (
          <div
            className="absolute rounded-xl border-2 border-primary shadow-[0_0_30px_rgba(var(--primary),0.5)] pointer-events-none animate-pulse"
            style={{
              top: spotlightPosition.top,
              left: spotlightPosition.left,
              width: spotlightPosition.width,
              height: spotlightPosition.height,
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <Card
        ref={tooltipRef}
        className={cn(
          'absolute w-[360px] bg-card border-primary/20 shadow-2xl z-[10000] pointer-events-auto',
          'animate-in fade-in-0 slide-in-from-bottom-4 duration-300'
        )}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/20">
                <HelpCircle className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Passo {currentStepIndex + 1} de {totalSteps}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground text-lg leading-tight">
                  {currentStep.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {currentStep.content}
                </p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="px-4">
            <Progress value={progress} className="h-1.5" />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-4 pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Pular tour
            </Button>
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrev}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Voltar
                </Button>
              )}
              <Button
                size="sm"
                onClick={onNext}
                className="gap-1 bg-primary hover:bg-primary/90"
              >
                {isLastStep ? 'Concluir' : 'Próximo'}
                {!isLastStep && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>,
    document.body
  );
}
