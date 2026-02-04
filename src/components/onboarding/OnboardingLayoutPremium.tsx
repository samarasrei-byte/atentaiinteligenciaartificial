import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, Zap, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import CleanBackground from './CleanBackground';

interface Step {
  id: number;
  title: string;
  icon: React.ElementType;
}

interface OnboardingLayoutPremiumProps {
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

const OnboardingLayoutPremium: React.FC<OnboardingLayoutPremiumProps> = ({
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
  hideNextButton = false,
}) => {
  const isLastStep = currentStep === totalSteps;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Clean background */}
      <CleanBackground />

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 md:p-6 lg:p-8 safe-area-bottom">
        <div className="w-full max-w-xl mx-auto">
          {/* Header with Logo */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Animated icon */}
            <motion.div
              className={cn(
                "mx-auto mb-4 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center",
                "shadow-xl relative overflow-hidden",
                iconColor
              )}
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Icon className="h-8 w-8 md:h-10 md:w-10 text-primary-foreground relative z-10" />
              
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent"
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 1,
                }}
              />
            </motion.div>

            <motion.h1
              className="text-2xl md:text-3xl font-bold text-foreground mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {title}
            </motion.h1>
            <motion.p
              className="text-muted-foreground text-sm md:text-base max-w-sm mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {subtitle}
            </motion.p>
          </motion.div>

          {/* Progress bar - Modern minimal */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, scaleX: 0.8 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = currentStep > step.id;
                const isActive = currentStep === step.id;
                
                return (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                      <motion.div
                        className={cn(
                          "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                          "border-2",
                          isCompleted && "bg-primary border-primary text-primary-foreground",
                          isActive && "bg-primary/10 border-primary text-primary scale-110",
                          !isCompleted && !isActive && "bg-muted/50 border-muted-foreground/20 text-muted-foreground"
                        )}
                        animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <StepIcon className="h-5 w-5" />
                        )}
                      </motion.div>
                      <span className={cn(
                        "text-[10px] md:text-xs mt-1.5 font-medium transition-colors text-center",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex-1 mx-2 h-0.5 rounded-full bg-muted/50 relative overflow-hidden">
                        <motion.div
                          className="absolute left-0 top-0 h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ 
                            width: currentStep > step.id ? "100%" : "0%" 
                          }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </motion.div>

          {/* Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-border/50 bg-card/90 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.02]" />

              <CardContent className="p-5 md:p-6 relative z-10">
                {/* Animated content wrapper */}
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
                <motion.div
                  className="flex gap-3 mt-6 pt-5 border-t border-border/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={currentStep === 1 || isSubmitting}
                    className="flex-1 h-11 md:h-12 text-sm md:text-base group"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    Voltar
                  </Button>

                  {!hideNextButton && (
                    <Button
                      onClick={onNext}
                      disabled={!canProceed || isSubmitting}
                      className={cn(
                        "flex-1 h-11 md:h-12 text-sm md:text-base relative overflow-hidden group",
                        "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
                        canProceed && !isSubmitting && "shadow-lg shadow-primary/25"
                      )}
                    >
                      {/* Button shine effect */}
                      {canProceed && !isSubmitting && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                          initial={{ x: "-100%" }}
                          animate={{ x: "200%" }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatDelay: 2,
                          }}
                        />
                      )}

                      <span className="relative z-10 flex items-center justify-center">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : isLastStep ? (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            {submitLabel}
                          </>
                        ) : (
                          <>
                            Próximo
                            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </span>
                    </Button>
                  )}
                </motion.div>

                {/* Keyboard shortcut hint */}
                {!isSubmitting && canProceed && (
                  <motion.p
                    className="text-center text-[10px] md:text-xs text-muted-foreground/60 mt-3 flex items-center justify-center gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <kbd className="px-1.5 py-0.5 bg-muted/50 rounded text-[10px] font-mono">Enter</kbd>
                    <span>para continuar</span>
                  </motion.p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="mt-5 flex items-center justify-center gap-4 md:gap-6 text-[10px] md:text-xs text-muted-foreground/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-primary/60" />
              Dados protegidos
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3 text-emerald-500/60" />
              Sem compromisso
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500/60" />
              100% Gratuito
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayoutPremium;
