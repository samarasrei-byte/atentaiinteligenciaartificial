import React, { useEffect, useState } from 'react';
import { useGuidedTour } from '@/hooks/useGuidedTour';
import { GuidedTour } from './GuidedTour';
import { pwaTourSteps, pwaTourStorageKey } from './pwaTourSteps';
import { usePWA } from '@/hooks/usePWA';

export function PWATour() {
  const { isInstalled } = usePWA();
  const [shouldShowTour, setShouldShowTour] = useState(false);

  const {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    progress,
    isFirstStep,
    isLastStep,
    startTour,
    endTour,
    nextStep,
    prevStep,
    hasCompletedTour,
  } = useGuidedTour({
    steps: pwaTourSteps,
    storageKey: pwaTourStorageKey,
    autoStart: false, // We control this manually
  });

  useEffect(() => {
    // Only show PWA tour if:
    // 1. App is installed as PWA
    // 2. User hasn't completed the PWA tour yet
    // 3. Not already showing the tour
    if (isInstalled && !hasCompletedTour && !isActive) {
      // Wait a moment for the UI to settle
      const timer = setTimeout(() => {
        setShouldShowTour(true);
        startTour();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isInstalled, hasCompletedTour, isActive, startTour]);

  // Don't render if not installed as PWA
  if (!isInstalled && !shouldShowTour) return null;

  return (
    <GuidedTour
      isActive={isActive}
      currentStep={currentStep}
      currentStepIndex={currentStepIndex}
      totalSteps={totalSteps}
      progress={progress}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      onNext={nextStep}
      onPrev={prevStep}
      onSkip={() => endTour(true)}
      onClose={() => endTour(true)}
    />
  );
}

// Component to manually trigger the PWA tour
export function usePWATour() {
  const {
    startTour,
    resetTour,
    hasCompletedTour,
  } = useGuidedTour({
    steps: pwaTourSteps,
    storageKey: pwaTourStorageKey,
    autoStart: false,
  });

  return {
    startPWATour: startTour,
    resetPWATour: resetTour,
    hasCompletedPWATour: hasCompletedTour,
  };
}
