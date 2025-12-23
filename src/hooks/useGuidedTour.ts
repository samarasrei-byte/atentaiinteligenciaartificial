import { useState, useEffect, useCallback } from 'react';

export interface TourStep {
  id: string;
  target: string; // CSS selector
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  spotlightPadding?: number;
}

interface UseGuidedTourOptions {
  steps: TourStep[];
  storageKey?: string;
  autoStart?: boolean;
}

export function useGuidedTour({
  steps,
  storageKey = 'tour_completed',
  autoStart = true,
}: UseGuidedTourOptions) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(storageKey);
    if (completed === 'true') {
      setHasCompletedTour(true);
    } else if (autoStart && !completed) {
      // Delay to allow DOM to render
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [storageKey, autoStart]);

  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const endTour = useCallback((markComplete = true) => {
    setIsActive(false);
    setCurrentStepIndex(0);
    if (markComplete) {
      localStorage.setItem(storageKey, 'true');
      setHasCompletedTour(true);
    }
  }, [storageKey]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      endTour(true);
    }
  }, [currentStepIndex, steps.length, endTour]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
    }
  }, [steps.length]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(storageKey);
    setHasCompletedTour(false);
    setCurrentStepIndex(0);
  }, [storageKey]);

  const currentStep = steps[currentStepIndex] || null;
  const progress = steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  return {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps: steps.length,
    progress,
    isFirstStep,
    isLastStep,
    hasCompletedTour,
    startTour,
    endTour,
    nextStep,
    prevStep,
    goToStep,
    resetTour,
  };
}
