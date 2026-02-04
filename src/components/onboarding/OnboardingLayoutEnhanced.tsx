import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import CleanBackground from './CleanBackground';
import OnboardingProgress3D from './OnboardingProgress3D';

interface Step {
  id: number;
  title: string;
  icon: React.ElementType;
}

interface OnboardingLayoutEnhancedProps {
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

const OnboardingLayoutEnhanced: React.FC<OnboardingLayoutEnhancedProps> = ({
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Clean background */}
      <CleanBackground />

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 md:p-6 lg:p-8 safe-area-bottom">
        <div className="w-full max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Floating icon */}
            <motion.div
              className={cn(
                "mx-auto mb-6 w-24 h-24 rounded-3xl bg-gradient-to-br flex items-center justify-center",
                "shadow-2xl relative overflow-hidden",
                iconColor
              )}
              animate={{
                y: [0, -8, 0],
                rotateY: [0, 5, 0, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              <Icon className="h-12 w-12 text-primary-foreground relative z-10" />
              
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent"
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Orbiting sparkle */}
              <motion.div
                className="absolute"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  width: "130%",
                  height: "130%",
                  left: "-15%",
                  top: "-15%",
                }}
              >
                <Sparkles className="absolute top-0 left-1/2 h-5 w-5 text-yellow-300 -translate-x-1/2 -translate-y-1/2" />
              </motion.div>
            </motion.div>

            <motion.h1
              className="text-3xl md:text-4xl font-bold text-foreground mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {title}
            </motion.h1>
            <motion.p
              className="text-muted-foreground text-lg max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {subtitle}
            </motion.p>
          </motion.div>

          {/* 3D Progress Steps */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <OnboardingProgress3D steps={steps} currentStep={currentStep} />
          </motion.div>

          {/* Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              {/* Card glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5"
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <CardContent className="p-6 md:p-8 relative z-10">
                {/* Animated content wrapper */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4 }}
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <motion.div
                  className="flex gap-4 mt-8 pt-6 border-t border-border/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={currentStep === 1 || isSubmitting}
                    className="flex-1 h-12 text-base group relative overflow-hidden"
                  >
                    <motion.span
                      className="flex items-center"
                      whileHover={{ x: -5 }}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                      Voltar
                    </motion.span>
                  </Button>

                  <Button
                    onClick={onNext}
                    disabled={!canProceed || isSubmitting}
                    className={cn(
                      "flex-1 h-12 text-base relative overflow-hidden group",
                      "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
                      canProceed && !isSubmitting && "shadow-lg shadow-primary/30"
                    )}
                  >
                    {/* Button shine */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      initial={{ x: "-100%" }}
                      animate={canProceed ? { x: "200%" } : {}}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                    />

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
                          <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          >
                            <Check className="h-4 w-4 ml-2" />
                          </motion.span>
                        </>
                      ) : (
                        <>
                          Próximo
                          <motion.span
                            className="ml-2"
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </motion.span>
                        </>
                      )}
                    </span>
                  </Button>
                </motion.div>

                {/* Quick tip */}
                {!isSubmitting && (
                  <motion.p
                    className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Sparkles className="h-3 w-3" />
                    Pressione Enter para continuar
                  </motion.p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3 text-green-500" />
              Dados seguros
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3 text-green-500" />
              Sem compromisso
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3 text-green-500" />
              Suporte 24h
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayoutEnhanced;
