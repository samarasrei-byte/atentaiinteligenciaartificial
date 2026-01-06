import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface Step {
  id: number;
  title: string;
  icon: React.ElementType;
}

interface OnboardingLayoutModernProps {
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
  showBackLink?: boolean;
  backLinkUrl?: string;
}

const OnboardingLayoutModern: React.FC<OnboardingLayoutModernProps> = ({
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
  showBackLink = true,
  backLinkUrl = '/',
}) => {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-atentai.png" alt="AtentAI" className="h-8 w-8" />
            <span className="font-bold text-lg text-foreground">AtentAI</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/simulador" className="hover:text-foreground transition-colors">Simulador</Link>
            <Link to="/modulo-fiscal" className="hover:text-foreground transition-colors">Módulo Fiscal</Link>
            <Link to="/ai-chat" className="hover:text-foreground transition-colors">Consultar IA</Link>
            <Link to="/servicos" className="hover:text-foreground transition-colors">Serviços</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
              <Link to="/instalar-app">Instalar App</Link>
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
              <Link to="/pricing">Ver Planos</Link>
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
              <Link to="/auth">Entrar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Back Link */}
      {showBackLink && (
        <div className="container mx-auto px-4 py-4">
          <Link 
            to={backLinkUrl} 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border border-border/50 shadow-lg bg-card">
              <CardContent className="p-6 md:p-10">
                {/* Header with Icon */}
                <div className="text-center mb-8">
                  <motion.div
                    className={cn(
                      "mx-auto mb-6 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center",
                      iconColor
                    )}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    <Icon className="h-8 w-8 md:h-10 md:w-10" />
                  </motion.div>
                  
                  <motion.h1
                    className="text-2xl md:text-3xl font-bold text-foreground mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {title}
                  </motion.h1>
                  
                  <motion.p
                    className="text-muted-foreground text-sm md:text-base max-w-md mx-auto"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {subtitle}
                  </motion.p>
                </div>

                {/* Step Indicator (Horizontal Pills) */}
                <motion.div 
                  className="flex items-center justify-center gap-2 mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                      <div
                        className={cn(
                          "flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full text-sm font-medium transition-all duration-300",
                          currentStep > step.id && "bg-primary text-primary-foreground",
                          currentStep === step.id && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                          currentStep < step.id && "bg-muted text-muted-foreground"
                        )}
                      >
                        {currentStep > step.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          step.id
                        )}
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={cn(
                            "w-8 md:w-12 h-0.5 rounded-full transition-colors duration-300",
                            currentStep > step.id ? "bg-primary" : "bg-muted"
                          )}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </motion.div>

                {/* Content */}
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

                {/* Navigation Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-border"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={currentStep === 1 || isSubmitting}
                    className="flex-1 h-11 md:h-12 text-sm md:text-base order-2 sm:order-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                  
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
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default OnboardingLayoutModern;
