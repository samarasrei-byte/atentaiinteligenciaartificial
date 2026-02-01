import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  title: string;
  icon: React.ElementType;
}

export interface OnboardingLayoutProps {
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
  hideNextButton?: boolean;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  title,
  subtitle,
  icon: Icon,
  iconColor = 'bg-primary/10 text-primary',
  steps,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  canProceed,
  isSubmitting = false,
  submitLabel = 'Concluir',
  hideNextButton = false,
}) => {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          className="text-center mb-6 md:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className={cn(
              "mx-auto mb-6 w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl",
              "transition-all duration-500 hover:scale-105",
              iconColor
            )}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Icon className="h-8 w-8 md:h-10 md:w-10" />
          </motion.div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 md:mb-3">{title}</h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-md mx-auto px-4">{subtitle}</p>
        </motion.div>

        {/* Stepper */}
        <motion.div
          className="mb-6 md:mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
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
                        "w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300",
                        isCompleted && "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
                        isActive && "bg-primary text-primary-foreground shadow-xl shadow-primary/40 scale-110",
                        !isCompleted && !isActive && "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                      ) : (
                        <StepIcon className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
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
                      "w-6 md:w-8 lg:w-12 h-1 rounded-full transition-colors duration-300 -mt-0 md:-mt-6 lg:-mt-8",
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    )} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <p className="text-center text-xs md:text-sm text-muted-foreground mt-3 md:mt-4 md:hidden">
            Etapa {currentStep} de {totalSteps}
          </p>
        </motion.div>

        {/* Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-4 md:p-6 lg:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6 md:mt-8 pt-4 md:pt-6 border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={onBack}
                  disabled={currentStep === 1 || isSubmitting}
                  className={cn(
                    "h-11 md:h-12 text-sm md:text-base order-2 sm:order-1",
                    hideNextButton ? "flex-1" : "flex-1"
                  )}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                {!hideNextButton && (
                  <Button
                    onClick={onNext}
                    disabled={!canProceed || isSubmitting}
                    className="flex-1 h-11 md:h-12 text-sm md:text-base bg-primary hover:bg-primary/90 order-1 sm:order-2"
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
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
