import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  title: string;
  icon: React.ElementType;
}

interface OnboardingLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor?: string;
  steps: Step[];
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  title,
  subtitle,
  icon: Icon,
  iconColor = 'from-primary to-primary/80',
  steps,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  canProceed,
  isSubmitting = false,
  submitLabel = 'Concluir',
}) => {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={cn(
            "mx-auto mb-6 w-20 h-20 rounded-3xl bg-gradient-to-br flex items-center justify-center shadow-xl",
            iconColor
          )}>
            <Icon className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{title}</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">{subtitle}</p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-3">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                        isCompleted && "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
                        isActive && "bg-primary text-primary-foreground shadow-xl shadow-primary/40 scale-110",
                        !isCompleted && !isActive && "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5 md:h-6 md:w-6" />
                      ) : (
                        <StepIcon className="h-5 w-5 md:h-6 md:w-6" />
                      )}
                    </div>
                    <span className={cn(
                      "text-xs mt-2 hidden md:block font-medium transition-colors",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "w-8 md:w-12 h-1 rounded-full transition-colors duration-300 -mt-6 md:-mt-8",
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    )} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4 md:hidden">
            Etapa {currentStep} de {totalSteps}
          </p>
        </div>

        {/* Content Card */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-6 md:p-8">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              {children}
            </div>

            {/* Navigation */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-border/50">
              <Button
                variant="outline"
                onClick={onBack}
                disabled={currentStep === 1 || isSubmitting}
                className="flex-1 h-12 text-base"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button
                onClick={onNext}
                disabled={!canProceed || isSubmitting}
                className="flex-1 h-12 text-base bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : isLastStep ? (
                  <>
                    {submitLabel}
                    <Check className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingLayout;
