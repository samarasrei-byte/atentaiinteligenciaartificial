import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  FileText,
  Users,
  Info,
  TrendingUp,
  Zap,
  Building,
  Factory
} from 'lucide-react';
import OnboardingLayoutUltimate from './OnboardingLayoutUltimate';
import FiscalBenefitCard from './FiscalBenefitCard';
import { cn } from '@/lib/utils';

interface CompanyData {
  company_name: string;
  trade_name: string;
  cnpj: string;
  company_type: string;
  tax_regime: string;
  sector: string;
  monthly_revenue_cents: number;
  employee_count: number;
  state: string;
  city: string;
}

const COMPANY_TYPES = [
  { value: 'mei', label: 'MEI', icon: Zap },
  { value: 'me', label: 'ME', icon: Building },
  { value: 'epp', label: 'EPP', icon: Building2 },
  { value: 'ltda', label: 'LTDA', icon: Users },
  { value: 'eireli', label: 'EIRELI', icon: Factory },
  { value: 'sa_fechada', label: 'S.A.', icon: TrendingUp },
];

const TAX_REGIMES = [
  { value: 'simples_nacional', label: 'Simples Nacional' },
  { value: 'lucro_presumido', label: 'Lucro Presumido' },
  { value: 'lucro_real', label: 'Lucro Real' },
  { value: 'lucro_arbitrado', label: 'Lucro Arbitrado' },
];

const SECTORS = [
  { value: 'comercio', label: 'Comércio' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'industria', label: 'Indústria' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'saude', label: 'Saúde' },
  { value: 'educacao', label: 'Educação' },
  { value: 'construcao', label: 'Construção' },
  { value: 'outro', label: 'Outro' },
];

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const steps = [
  { id: 1, title: 'Empresa', icon: Building2 },
  { id: 2, title: 'Tributação', icon: FileText },
  { id: 3, title: 'Financeiro', icon: DollarSign },
  { id: 4, title: 'Local', icon: MapPin },
];

interface CompanyOnboardingProps {
  onComplete: () => void;
}

const CompanyOnboarding: React.FC<CompanyOnboardingProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFiscalBenefit, setShowFiscalBenefit] = useState(false);
  const [fiscalBenefitHandled, setFiscalBenefitHandled] = useState(false);
  const [formData, setFormData] = useState<CompanyData>({
    company_name: '',
    trade_name: '',
    cnpj: '',
    company_type: '',
    tax_regime: '',
    sector: '',
    monthly_revenue_cents: 0,
    employee_count: 0,
    state: '',
    city: '',
  });

  const totalSteps = 4;

  const updateFormData = (field: keyof CompanyData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 14);
    updateFormData('cnpj', formatCNPJ(value));
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const getCompanySize = () => {
    const annual = formData.monthly_revenue_cents * 12;
    if (annual <= 8100000) return { label: 'MEI', color: 'text-green-500' };
    if (annual <= 36000000) return { label: 'Microempresa', color: 'text-blue-500' };
    if (annual <= 480000000) return { label: 'EPP', color: 'text-purple-500' };
    return { label: 'Grande Porte', color: 'text-amber-500' };
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.company_name && formData.company_type;
      case 2:
        return formData.tax_regime && formData.sector;
      case 3:
        return formData.monthly_revenue_cents > 0;
      case 4:
        return formData.state;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('companies')
        .insert({
          user_id: user.id,
          company_name: formData.company_name,
          trade_name: formData.trade_name || null,
          cnpj: formData.cnpj || null,
          company_type: formData.company_type as any,
          tax_regime: formData.tax_regime as any,
          sector: formData.sector as any,
          monthly_revenue_cents: formData.monthly_revenue_cents,
          annual_revenue_cents: formData.monthly_revenue_cents * 12,
          employee_count: formData.employee_count,
          state: formData.state,
          city: formData.city || null,
          onboarding_completed: true,
        });

      if (error) throw error;

      toast({
        title: '🎉 Empresa cadastrada!',
        description: 'Bem-vindo ao seu painel!',
      });
      
      onComplete();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao salvar dados',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    // Mostrar benefício fiscal após step 3
    if (step === 3 && formData.monthly_revenue_cents > 0 && !fiscalBenefitHandled) {
      setShowFiscalBenefit(true);
      return;
    }
    
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleFiscalBenefitAccept = () => {
    setFiscalBenefitHandled(true);
    setShowFiscalBenefit(false);
    sessionStorage.setItem('pendingFiscalAnalysis', 'true');
    toast({
      title: '🎉 Análise Fiscal Reservada!',
      description: 'Você será direcionado após o cadastro.',
    });
    setStep(step + 1);
  };

  const handleFiscalBenefitSkip = () => {
    setFiscalBenefitHandled(true);
    setShowFiscalBenefit(false);
    setStep(step + 1);
  };

  const prevStep = () => {
    if (showFiscalBenefit) {
      setShowFiscalBenefit(false);
      return;
    }
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Fiscal benefit modal
  if (showFiscalBenefit) {
    return (
      <OnboardingLayoutUltimate
        title="Benefício Exclusivo"
        subtitle="Identificamos uma oportunidade"
        icon={Building2}
        iconColor="from-emerald-500 to-primary"
        steps={steps}
        currentStep={step}
        totalSteps={totalSteps}
        onNext={handleFiscalBenefitSkip}
        onBack={prevStep}
        canProceed={true}
        isSubmitting={false}
        hideNextButton={true}
      >
        <FiscalBenefitCard
          onAccept={handleFiscalBenefitAccept}
          onSkip={handleFiscalBenefitSkip}
        />
      </OnboardingLayoutUltimate>
    );
  }

  return (
    <OnboardingLayoutUltimate
      title="Configure sua Empresa"
      subtitle="Personalize em 4 passos rápidos"
      icon={Building2}
      iconColor="from-primary to-blue-500"
      steps={steps}
      currentStep={step}
      totalSteps={totalSteps}
      onNext={nextStep}
      onBack={prevStep}
      canProceed={!!canProceed()}
      isSubmitting={isSubmitting}
      submitLabel="Finalizar"
    >
      {/* Step 1: Identificação - Compacto */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name" className="text-sm font-medium">
              Razão Social *
            </Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => updateFormData('company_name', e.target.value)}
              placeholder="Nome oficial da empresa"
              className="h-11"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Nome Fantasia</Label>
              <Input
                value={formData.trade_name}
                onChange={(e) => updateFormData('trade_name', e.target.value)}
                placeholder="Opcional"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">CNPJ</Label>
              <Input
                value={formData.cnpj}
                onChange={handleCNPJChange}
                placeholder="00.000.000/0000-00"
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Tipo de Empresa *</Label>
            <div className="grid grid-cols-3 gap-2">
              {COMPANY_TYPES.map((type) => {
                const TypeIcon = type.icon;
                return (
                  <motion.button
                    key={type.value}
                    type="button"
                    onClick={() => updateFormData('company_type', type.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 transition-all",
                      formData.company_type === type.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border/50 hover:border-primary/30 text-muted-foreground"
                    )}
                    whileTap={{ scale: 0.97 }}
                  >
                    <TypeIcon className="h-4 w-4" />
                    <span className="text-xs font-medium">{type.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Regime Tributário - Compacto */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Regime Tributário *</Label>
            <div className="grid grid-cols-2 gap-2">
              {TAX_REGIMES.map((regime) => (
                <motion.button
                  key={regime.value}
                  type="button"
                  onClick={() => updateFormData('tax_regime', regime.value)}
                  className={cn(
                    "p-3 rounded-lg border-2 text-left transition-all",
                    formData.tax_regime === regime.value
                      ? "border-primary bg-primary/10"
                      : "border-border/50 hover:border-primary/30"
                  )}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className={cn(
                    "text-xs font-medium",
                    formData.tax_regime === regime.value ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {regime.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Setor de Atuação *</Label>
            <Select
              value={formData.sector}
              onValueChange={(value) => updateFormData('sector', value)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((sector) => (
                  <SelectItem key={sector.value} value={sector.value}>
                    {sector.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Step 3: Financeiro - Compacto com análise */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="revenue" className="text-sm font-medium">
              Faturamento Mensal *
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                R$
              </span>
              <Input
                id="revenue"
                type="text"
                inputMode="decimal"
                value={formData.monthly_revenue_cents > 0 
                  ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(formData.monthly_revenue_cents / 100) 
                  : ''}
                onChange={(e) => {
                  let rawValue = e.target.value.replace(/[^\d.,]/g, '');
                  const cleanValue = rawValue.replace(/\./g, '').replace(',', '.');
                  const numericValue = parseFloat(cleanValue) || 0;
                  updateFormData('monthly_revenue_cents', Math.round(numericValue * 100));
                }}
                placeholder="0,00"
                className="pl-12 h-14 text-xl font-bold"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Número de Funcionários</Label>
            <Select
              value={formData.employee_count.toString()}
              onValueChange={(value) => updateFormData('employee_count', parseInt(value))}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Nenhum</SelectItem>
                <SelectItem value="1">1-5</SelectItem>
                <SelectItem value="6">6-10</SelectItem>
                <SelectItem value="11">11-50</SelectItem>
                <SelectItem value="51">51-100</SelectItem>
                <SelectItem value="100">100+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AnimatePresence>
            {formData.monthly_revenue_cents > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Anual</p>
                        <p className="text-lg font-bold">
                          {formatCurrency(formData.monthly_revenue_cents * 12)}
                        </p>
                      </div>
                      <div className={cn("text-sm font-semibold", getCompanySize().color)}>
                        {getCompanySize().label}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Step 4: Localização - Ultra compacto */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Estado *</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => updateFormData('state', value)}
              >
                <SelectTrigger className="h-11">
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
            </div>

            <div className="col-span-2 space-y-2">
              <Label className="text-sm font-medium">Cidade</Label>
              <Input
                value={formData.city}
                onChange={(e) => updateFormData('city', e.target.value)}
                placeholder="Sua cidade"
                className="h-11"
              />
            </div>
          </div>

          <Card className="bg-muted/30 border-border/50">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  A localização é usada para calcular impostos estaduais e municipais.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </OnboardingLayoutUltimate>
  );
};

export default CompanyOnboarding;
