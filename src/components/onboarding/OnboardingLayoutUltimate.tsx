import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, Loader2, Zap, Shield, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  title: string;
  icon: React.ElementType;
}

interface OnboardingLayoutUltimateProps {
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

/**
 * OnboardingLayoutUltimate - O layout de onboarding perfeito
 * 
 * Princípios UX aplicados:
 * 1. Viewport-fit: Usa 100dvh para preencher exatamente a tela visível
 * 2. Zero scroll: Conteúdo sempre cabe na viewport
 * 3. Mobile-first: Otimizado para touch e telas pequenas
 * 4. Hierarquia visual clara: Header → Content → Actions
 * 5. Feedback imediato: Animações suaves e transições
 * 6. Acessibilidade: Atalhos de teclado e contraste adequado
 */
const OnboardingLayoutUltimate: React.FC<OnboardingLayoutUltimateProps> = ({
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
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Background sutil */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      {/* Container principal com flex */}
      <div className="relative z-10 flex flex-col h-full max-w-lg mx-auto w-full px-4 py-safe">
        
        {/* === HEADER COMPACTO === */}
        <header className="flex-shrink-0 pt-4 pb-3 md:pt-6 md:pb-4">
          {/* Ícone + Título inline para economizar espaço */}
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              className={cn(
                "w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                iconColor
              )}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-foreground truncate">
                {title}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Progress steps - Compacto e horizontal */}
          <div className="flex items-center gap-1">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              
              return (
                <React.Fragment key={step.id}>
                  <motion.div
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-200",
                      isActive && "bg-primary/10 text-primary",
                      isCompleted && "text-primary",
                      !isActive && !isCompleted && "text-muted-foreground/50"
                    )}
                    initial={false}
                    animate={{ 
                      scale: isActive ? 1.02 : 1,
                      opacity: isActive || isCompleted ? 1 : 0.6 
                    }}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center text-xs font-medium transition-colors",
                      isCompleted && "bg-primary text-primary-foreground",
                      isActive && "bg-primary/20 text-primary",
                      !isActive && !isCompleted && "bg-muted/50"
                    )}>
                      {isCompleted ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <span>{step.id}</span>
                      )}
                    </div>
                    <span className={cn(
                      "text-[11px] md:text-xs font-medium hidden sm:block",
                      isActive && "text-primary"
                    )}>
                      {step.title}
                    </span>
                  </motion.div>
                  
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 bg-muted/30 rounded-full max-w-6 relative overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: isCompleted ? "100%" : "0%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </header>

        {/* === CONTENT AREA - Flex grow === */}
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-2 scrollbar-thin">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {/* Card container */}
              <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 md:p-5 shadow-xl h-full flex flex-col">
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                  {children}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* === FOOTER FIXO === */}
        <footer className="flex-shrink-0 pt-3 pb-4 md:pb-6 space-y-3">
          {/* Botões de navegação */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={currentStep === 1 || isSubmitting}
              className="flex-1 h-12 text-sm font-medium group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-0.5" />
              Voltar
            </Button>

            {!hideNextButton && (
              <Button
                onClick={onNext}
                disabled={!canProceed || isSubmitting}
                className={cn(
                  "flex-1 h-12 text-sm font-medium relative overflow-hidden group",
                  "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
                  canProceed && !isSubmitting && "shadow-lg shadow-primary/20"
                )}
              >
                {/* Shine effect */}
                {canProceed && !isSubmitting && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  />
                )}

                <span className="relative z-10 flex items-center">
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
                      <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </span>
              </Button>
            )}
          </div>

          {/* Trust badges - Ultra compacto */}
          <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground/60">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Dados protegidos
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3" />
              Sem compromisso
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Gratuito
            </span>
          </div>

          {/* Keyboard hint - só desktop */}
          {!isSubmitting && canProceed && (
            <p className="text-center text-[10px] text-muted-foreground/40 hidden md:block">
              Pressione <kbd className="px-1 py-0.5 bg-muted/30 rounded text-[9px] font-mono">Enter</kbd> para continuar
            </p>
          )}
        </footer>
      </div>
    </div>
  );
};

export default OnboardingLayoutUltimate;
