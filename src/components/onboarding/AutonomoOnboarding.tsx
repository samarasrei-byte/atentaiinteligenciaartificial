import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  DollarSign, 
  Briefcase,
  TrendingUp,
  AlertCircle,
  Zap
} from 'lucide-react';
import OnboardingLayoutUltimate from './OnboardingLayoutUltimate';
import { cn } from '@/lib/utils';

interface AutonomoData {
  profession: string;
  profession_category: string;
  current_regime: string;
  monthly_revenue_average_cents: number;
}

const PROFESSION_CATEGORIES = [
  { value: 'saude', label: 'Saúde', icon: '🏥' },
  { value: 'tecnologia', label: 'Tecnologia', icon: '💻' },
  { value: 'juridico', label: 'Jurídico', icon: '⚖️' },
  { value: 'contabilidade', label: 'Contabilidade', icon: '📊' },
  { value: 'engenharia', label: 'Engenharia', icon: '🏗️' },
  { value: 'educacao', label: 'Educação', icon: '📚' },
  { value: 'consultoria', label: 'Consultoria', icon: '💼' },
  { value: 'arte_criativo', label: 'Arte/Criativo', icon: '🎨' },
  { value: 'comercio', label: 'Comércio', icon: '🛒' },
  { value: 'outros', label: 'Outros', icon: '✨' },
];

const TAX_REGIMES = [
  { value: 'pessoa_fisica', label: 'Pessoa Física', icon: User, color: 'border-blue-500/30 bg-blue-500/5' },
  { value: 'mei', label: 'MEI', icon: Zap, color: 'border-green-500/30 bg-green-500/5' },
  { value: 'simples_nacional', label: 'Simples Nacional', icon: TrendingUp, color: 'border-purple-500/30 bg-purple-500/5' },
  { value: 'lucro_presumido', label: 'Lucro Presumido', icon: DollarSign, color: 'border-amber-500/30 bg-amber-500/5' },
  { value: 'nao_sei', label: 'Não sei', icon: AlertCircle, color: 'border-muted-foreground/20 bg-muted/50' },
];

const steps = [
  { id: 1, title: 'Profissão', icon: Briefcase },
  { id: 2, title: 'Regime', icon: DollarSign },
  { id: 3, title: 'Faturamento', icon: TrendingUp },
];

interface AutonomoOnboardingProps {
  onComplete: () => void;
}

const AutonomoOnboarding: React.FC<AutonomoOnboardingProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AutonomoData>({
    profession: '',
    profession_category: '',
    current_regime: '',
    monthly_revenue_average_cents: 0,
  });

  const totalSteps = 3;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && canProceed() && !isSubmitting) {
        e.preventDefault();
        nextStep();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, formData, isSubmitting]);

  const updateFormData = (field: keyof AutonomoData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.profession && formData.profession_category;
      case 2:
        return formData.current_regime;
      case 3:
        return formData.monthly_revenue_average_cents > 0;
      default:
        return true;
    }
  };

  const getRevenueAnalysis = () => {
    const annual = formData.monthly_revenue_average_cents * 12;
    if (annual <= 8100000) {
      return { color: 'text-green-500', title: 'Compatível com MEI 🎉' };
    } else if (annual <= 36000000) {
      return { color: 'text-blue-500', title: 'ME - Simples Nacional' };
    } else {
      return { color: 'text-purple-500', title: 'Estrutura Empresarial' };
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('autonomo_profiles')
        .upsert({
          user_id: user.id,
          profession: formData.profession,
          profession_category: formData.profession_category,
          current_regime: formData.current_regime,
          monthly_revenue_average_cents: formData.monthly_revenue_average_cents,
        }, { onConflict: 'user_id' });

      if (error) throw error;

      // Add autonomo role
      await supabase
        .from('user_roles')
        .upsert(
          { user_id: user.id, role: 'autonomo' },
          { onConflict: 'user_id,role', ignoreDuplicates: true }
        );

      toast({
        title: '🎉 Perfil configurado!',
        description: 'Bem-vindo ao seu painel!',
      });
      
      window.location.href = '/autonomo';
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao salvar dados',
      });
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <OnboardingLayoutUltimate
      title="Configure seu Perfil"
      subtitle="Personalize em 3 passos rápidos"
      icon={User}
      iconColor="from-primary to-primary/80"
      steps={steps}
      currentStep={step}
      totalSteps={totalSteps}
      onNext={nextStep}
      onBack={prevStep}
      canProceed={!!canProceed()}
      isSubmitting={isSubmitting}
      submitLabel="Começar"
    >
      {/* Step 1: Profissão - Grid compacto */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profession" className="text-sm font-medium">
              Qual sua profissão? *
            </Label>
            <Input
              id="profession"
              value={formData.profession}
              onChange={(e) => updateFormData('profession', e.target.value)}
              placeholder="Ex: Desenvolvedor, Médico, Designer..."
              className="h-11"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Categoria *</Label>
            <div className="grid grid-cols-2 gap-2">
              {PROFESSION_CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.value}
                  type="button"
                  onClick={() => updateFormData('profession_category', cat.value)}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-lg border-2 transition-all text-left",
                    formData.profession_category === cat.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border/50 hover:border-primary/30 text-muted-foreground hover:text-foreground"
                  )}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="text-xs font-medium truncate">{cat.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Regime Tributário - Cards verticais compactos */}
      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Como você atua atualmente?
          </p>
          
          <div className="space-y-2">
            {TAX_REGIMES.map((regime) => {
              const RegimeIcon = regime.icon;
              const isSelected = formData.current_regime === regime.value;
              
              return (
                <motion.button
                  key={regime.value}
                  type="button"
                  onClick={() => updateFormData('current_regime', regime.value)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : `border-border/50 hover:border-primary/30 ${regime.color}`
                  )}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted/50"
                  )}>
                    <RegimeIcon className="h-4 w-4" />
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {regime.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Faturamento - Input grande com análise */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="revenue" className="text-sm font-medium">
              Faturamento mensal médio *
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                R$
              </span>
              <Input
                id="revenue"
                type="text"
                inputMode="decimal"
                value={formData.monthly_revenue_average_cents > 0 
                  ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(formData.monthly_revenue_average_cents / 100) 
                  : ''}
                onChange={(e) => {
                  let rawValue = e.target.value;
                  rawValue = rawValue.replace(/[^\d.,]/g, '');
                  const cleanValue = rawValue.replace(/\./g, '').replace(',', '.');
                  const numericValue = parseFloat(cleanValue) || 0;
                  updateFormData('monthly_revenue_average_cents', Math.round(numericValue * 100));
                }}
                placeholder="0,00"
                className="pl-12 h-14 text-xl font-bold"
                autoFocus
              />
            </div>
          </div>

          {/* Análise em tempo real */}
          <AnimatePresence>
            {formData.monthly_revenue_average_cents > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Anual estimado</p>
                        <p className="text-lg font-bold text-foreground">
                          {formatCurrency(formData.monthly_revenue_average_cents * 12)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-sm font-semibold", getRevenueAnalysis().color)}>
                          {getRevenueAnalysis().title}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </OnboardingLayoutUltimate>
  );
};

export default AutonomoOnboarding;
