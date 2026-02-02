import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  MapPin, 
  DollarSign, 
  Briefcase,
  Check,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Zap
} from 'lucide-react';
import OnboardingLayoutPremium from './OnboardingLayoutPremium';
import OnboardingStepHeader from './OnboardingStepHeader';
import OnboardingCard3D from './OnboardingCard3D';
import OnboardingInput from './OnboardingInput';

interface AutonomoData {
  profession: string;
  profession_category: string;
  current_regime: string;
  monthly_revenue_average_cents: number;
  state: string;
  city: string;
  cpf: string;
  phone: string;
  bio: string;
}

const PROFESSION_CATEGORIES = [
  { value: 'saude', label: 'Saúde', examples: 'Médico, Dentista, Fisioterapeuta', icon: '🏥' },
  { value: 'tecnologia', label: 'Tecnologia', examples: 'Desenvolvedor, Designer, Analista', icon: '💻' },
  { value: 'juridico', label: 'Jurídico', examples: 'Advogado, Consultor Jurídico', icon: '⚖️' },
  { value: 'contabilidade', label: 'Contabilidade', examples: 'Contador, Auditor', icon: '📊' },
  { value: 'engenharia', label: 'Engenharia', examples: 'Engenheiro Civil, Elétrico', icon: '🏗️' },
  { value: 'educacao', label: 'Educação', examples: 'Professor, Instrutor, Tutor', icon: '📚' },
  { value: 'consultoria', label: 'Consultoria', examples: 'Consultor de Negócios', icon: '💼' },
  { value: 'arte_criativo', label: 'Arte e Criativo', examples: 'Fotógrafo, Músico', icon: '🎨' },
  { value: 'comercio', label: 'Comércio e Vendas', examples: 'Representante, Corretor', icon: '🛒' },
  { value: 'outros', label: 'Outros', examples: 'Outras profissões', icon: '✨' },
];

const TAX_REGIMES = [
  { value: 'pessoa_fisica', label: 'Pessoa Física (PF)', description: 'Tributação pelo Carnê-Leão/IRPF', icon: User },
  { value: 'mei', label: 'MEI', description: 'Microempreendedor Individual (até R$ 81.000/ano)', icon: Zap },
  { value: 'simples_nacional', label: 'Simples Nacional (ME)', description: 'Microempresa no Simples Nacional', icon: TrendingUp },
  { value: 'lucro_presumido', label: 'Lucro Presumido', description: 'Empresa no regime de Lucro Presumido', icon: DollarSign },
  { value: 'nao_sei', label: 'Não sei', description: 'Não tenho certeza do meu regime atual', icon: AlertCircle },
];

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const steps = [
  { id: 1, title: 'Profissão', icon: Briefcase },
  { id: 2, title: 'Regime', icon: DollarSign },
  { id: 3, title: 'Financeiro', icon: TrendingUp },
  { id: 4, title: 'Contato', icon: MapPin },
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
    state: '',
    city: '',
    cpf: '',
    phone: '',
    bio: '',
  });

  const totalSteps = 4;

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

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(
      /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
      '$1.$2.$3-$4'
    );
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 11);
    updateFormData('cpf', formatCPF(value));
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }
    return numbers.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 11);
    updateFormData('phone', formatPhone(value));
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
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
      case 4:
        return formData.state;
      default:
        return true;
    }
  };

  const getRevenueAnalysis = () => {
    const annual = formData.monthly_revenue_average_cents * 12;
    if (annual <= 8100000) {
      return {
        icon: Zap,
        color: 'text-green-500 bg-green-500/10',
        title: 'MEI Compatível! 🎉',
        message: 'Seu faturamento é compatível com o MEI! Vamos simular se é a melhor opção para você.',
      };
    } else if (annual <= 36000000) {
      return {
        icon: TrendingUp,
        color: 'text-blue-500 bg-blue-500/10',
        title: 'ME - Simples Nacional',
        message: 'Seu faturamento é compatível com ME (Simples Nacional). Vamos comparar as opções.',
      };
    } else {
      return {
        icon: DollarSign,
        color: 'text-purple-500 bg-purple-500/10',
        title: 'Estrutura Empresarial',
        message: 'Seu faturamento indica que uma estrutura empresarial pode ser mais vantajosa.',
      };
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
          state: formData.state,
          city: formData.city || null,
          cpf: formData.cpf || null,
          phone: formData.phone || null,
          bio: formData.bio || null,
        }, { onConflict: 'user_id' });

      if (error) throw error;

      // Add autonomo role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert(
          { user_id: user.id, role: 'autonomo' },
          { onConflict: 'user_id,role', ignoreDuplicates: true }
        );

      if (roleError) {
        console.error('Error adding autonomo role:', roleError);
      }

      toast({
        title: '🎉 Perfil configurado!',
        description: 'Seus dados foram salvos com sucesso. Bem-vindo!',
      });
      
      // Reload page to refresh auth context with new role
      window.location.href = '/autonomo';
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao salvar dados do perfil',
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
    <OnboardingLayoutPremium
      title="Configure seu Perfil"
      subtitle="Personalize sua experiência como autônomo"
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
      {/* Step 1: Profissão */}
      {step === 1 && (
        <div className="space-y-6">
          <OnboardingStepHeader
            icon={Briefcase}
            title="Sua Profissão"
            description="Informe sua área de atuação"
          />
          
          <div className="space-y-4">
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Label htmlFor="profession" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Profissão *
              </Label>
              <Input
                id="profession"
                value={formData.profession}
                onChange={(e) => updateFormData('profession', e.target.value)}
                placeholder="Ex: Desenvolvedor de Software, Médico, Designer..."
                className="h-12 text-base"
                autoFocus
              />
            </motion.div>

            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Label className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Categoria Profissional *
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {PROFESSION_CATEGORIES.map((cat, idx) => (
                  <OnboardingCard3D
                    key={cat.value}
                    label={`${cat.icon} ${cat.label}`}
                    description={cat.examples}
                    selected={formData.profession_category === cat.value}
                    onClick={() => updateFormData('profession_category', cat.value)}
                    compact
                    delay={idx * 0.05}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Step 2: Regime Tributário */}
      {step === 2 && (
        <div className="space-y-6">
          <OnboardingStepHeader
            icon={DollarSign}
            title="Regime Tributário"
            description="Como você atua hoje?"
          />

          <div className="space-y-3">
            {TAX_REGIMES.map((regime, idx) => (
              <OnboardingCard3D
                key={regime.value}
                label={regime.label}
                description={regime.description}
                selected={formData.current_regime === regime.value}
                onClick={() => updateFormData('current_regime', regime.value)}
                icon={regime.icon}
                delay={idx * 0.1}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Dados Financeiros */}
      {step === 3 && (
        <div className="space-y-6">
          <OnboardingStepHeader
            icon={TrendingUp}
            title="Dados Financeiros"
            description="Informe seu faturamento médio mensal"
          />

          <div className="space-y-4">
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Label htmlFor="revenue" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Faturamento Mensal Médio *
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-lg">R$</span>
                <Input
                  id="revenue"
                  type="text"
                  inputMode="numeric"
                  value={formData.monthly_revenue_average_cents > 0 ? new Intl.NumberFormat('pt-BR').format(formData.monthly_revenue_average_cents / 100) : ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    updateFormData('monthly_revenue_average_cents', parseInt(value) * 100 || 0);
                  }}
                  placeholder="0"
                  className="pl-14 h-14 text-2xl font-bold"
                  autoFocus
                />
              </div>
              <motion.p 
                className="text-sm text-muted-foreground flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <TrendingUp className="h-4 w-4" />
                Faturamento anual estimado: <span className="font-semibold text-foreground">{formatCurrency(formData.monthly_revenue_average_cents * 12)}</span>
              </motion.p>
            </motion.div>

            <AnimatePresence>
              {formData.monthly_revenue_average_cents > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {(() => {
                    const analysis = getRevenueAnalysis();
                    const AnalysisIcon = analysis.icon;
                    return (
                      <Card className="overflow-hidden border-2 border-primary/20">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <motion.div 
                              className={`p-3 rounded-xl ${analysis.color}`}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 0.5 }}
                            >
                              <AnalysisIcon className="h-6 w-6" />
                            </motion.div>
                            <div className="flex-1">
                              <p className="font-bold text-foreground">{analysis.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {analysis.message}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Step 4: Localização e Contato */}
      {step === 4 && (
        <div className="space-y-6">
          <OnboardingStepHeader
            icon={MapPin}
            title="Localização e Contato"
            description="Informe seus dados de contato"
          />

          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Estado *
                </Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => updateFormData('state', value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  placeholder="Sua cidade"
                  className="h-12"
                />
              </motion.div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  placeholder="000.000.000-00"
                  className="h-12"
                />
              </motion.div>

              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  className="h-12"
                />
              </motion.div>
            </div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Label htmlFor="bio">Sobre você (opcional)</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => updateFormData('bio', e.target.value)}
                placeholder="Conte um pouco sobre sua atuação profissional..."
                className="min-h-[100px] resize-none"
              />
            </motion.div>
          </motion.div>
        </div>
      )}
    </OnboardingLayoutPremium>
  );
};

export default AutonomoOnboarding;
