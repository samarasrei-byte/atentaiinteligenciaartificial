import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  FileText,
  Check,
  Users,
  Info
} from 'lucide-react';
import OnboardingLayoutPremium from './OnboardingLayoutPremium';
import OnboardingStepHeader from './OnboardingStepHeader';
import OnboardingOptionCard from './OnboardingOptionCard';
import { Card, CardContent } from '@/components/ui/card';
import FiscalBenefitCard from './FiscalBenefitCard';
import RevenueBoard from './RevenueBoard';

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
  main_activity: string;
}

const COMPANY_TYPES = [
  { value: 'mei', label: 'MEI', description: 'Faturamento até R$ 81.000/ano' },
  { value: 'me', label: 'Microempresa (ME)', description: 'Faturamento até R$ 360.000/ano' },
  { value: 'epp', label: 'EPP', description: 'Faturamento até R$ 4.800.000/ano' },
  { value: 'ltda', label: 'LTDA', description: 'Sociedade Limitada' },
  { value: 'eireli', label: 'EIRELI', description: 'Empresa Individual' },
  { value: 'sa_fechada', label: 'S.A. Fechada', description: 'Capital fechado' },
  { value: 'sa_aberta', label: 'S.A. Aberta', description: 'Capital aberto' },
  { value: 'cooperativa', label: 'Cooperativa', description: 'Sociedade cooperativa' },
];

const TAX_REGIMES = [
  { value: 'simples_nacional', label: 'Simples Nacional', description: 'Regime simplificado para ME e EPP' },
  { value: 'lucro_presumido', label: 'Lucro Presumido', description: 'Base de cálculo presumida' },
  { value: 'lucro_real', label: 'Lucro Real', description: 'Tributos sobre lucro efetivo' },
  { value: 'lucro_arbitrado', label: 'Lucro Arbitrado', description: 'Quando não há escrituração' },
];

const SECTORS = [
  { value: 'comercio', label: 'Comércio' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'industria', label: 'Indústria' },
  { value: 'agronegocio', label: 'Agronegócio' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'saude', label: 'Saúde' },
  { value: 'educacao', label: 'Educação' },
  { value: 'construcao', label: 'Construção Civil' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'alimentacao', label: 'Alimentação' },
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
    main_activity: '',
  });

  // Threshold for fiscal benefit: R$ 600.000/month = 60.000.000 cents
  const FISCAL_BENEFIT_THRESHOLD = 60000000;

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
    }).format(cents / 100);
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
          main_activity: formData.main_activity || null,
          onboarding_completed: true,
        });

      if (error) throw error;

      toast({
        title: 'Empresa cadastrada!',
        description: 'Seus dados foram salvos com sucesso',
      });
      
      onComplete();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao salvar dados da empresa',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    // SEMPRE mostrar sugestão de Análise Fiscal após step 3 (dados financeiros)
    // para todos os leads, independente do faturamento
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
    // Navigate to fiscal module after completing onboarding
    sessionStorage.setItem('pendingFiscalAnalysis', 'true');
    toast({
      title: '🎉 Análise Fiscal Reservada!',
      description: 'Após o cadastro, você será direcionado para sua análise gratuita.',
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

  // If showing fiscal benefit, render only that card
  if (showFiscalBenefit) {
    return (
      <OnboardingLayoutPremium
        title="Benefício Exclusivo"
        subtitle="Identificamos uma oportunidade especial para sua empresa"
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
      </OnboardingLayoutPremium>
    );
  }

  return (
    <OnboardingLayoutPremium
      title="Configure sua Empresa"
      subtitle="Personalize sua experiência em poucos passos"
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
      {/* Step 1: Identificação */}
      {step === 1 && (
        <div className="space-y-6">
          <OnboardingStepHeader
            icon={Building2}
            title="Identificação da Empresa"
            description="Informe os dados básicos da sua empresa"
          />
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Razão Social *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => updateFormData('company_name', e.target.value)}
                placeholder="Nome oficial da empresa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trade_name">Nome Fantasia</Label>
              <Input
                id="trade_name"
                value={formData.trade_name}
                onChange={(e) => updateFormData('trade_name', e.target.value)}
                placeholder="Nome comercial (opcional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={handleCNPJChange}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div className="space-y-3">
              <Label>Tipo de Empresa *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMPANY_TYPES.map((type) => (
                  <OnboardingOptionCard
                    key={type.value}
                    label={type.label}
                    description={type.description}
                    selected={formData.company_type === type.value}
                    onClick={() => updateFormData('company_type', type.value)}
                    compact
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Regime Tributário */}
      {step === 2 && (
        <div className="space-y-6">
          <OnboardingStepHeader
            icon={FileText}
            title="Regime Tributário"
            description="Selecione o regime atual da sua empresa"
          />

          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Regime Tributário *</Label>
              <div className="space-y-2">
                {TAX_REGIMES.map((regime) => (
                  <OnboardingOptionCard
                    key={regime.value}
                    label={regime.label}
                    description={regime.description}
                    selected={formData.tax_regime === regime.value}
                    onClick={() => updateFormData('tax_regime', regime.value)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Setor de Atuação *</Label>
              <Select
                value={formData.sector}
                onValueChange={(value) => updateFormData('sector', value)}
              >
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label htmlFor="main_activity">Atividade Principal</Label>
              <Input
                id="main_activity"
                value={formData.main_activity}
                onChange={(e) => updateFormData('main_activity', e.target.value)}
                placeholder="Ex: Desenvolvimento de software, Comércio varejista..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Dados Financeiros - NOVO BOARD MODERNO */}
      {step === 3 && (
        <div className="space-y-6">
          <OnboardingStepHeader
            icon={DollarSign}
            title="Dados Financeiros"
            description="Este é o dado mais importante para personalizarmos sua experiência"
          />

          <RevenueBoard
            monthlyRevenue={formData.monthly_revenue_cents}
            employeeCount={formData.employee_count}
            onRevenueChange={(value) => updateFormData('monthly_revenue_cents', value)}
            onEmployeeChange={(value) => updateFormData('employee_count', value)}
            companyType={formData.company_type}
          />
        </div>
      )}

      {/* Step 4: Localização */}
      {step === 4 && (
        <div className="space-y-6">
          <OnboardingStepHeader
            icon={MapPin}
            title="Localização"
            description="Informe onde sua empresa está localizada"
          />

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estado *</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => updateFormData('state', value)}
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  placeholder="Sua cidade"
                />
              </div>
            </div>

            <Card className="bg-muted/50 border-border">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    A localização é importante para calcularmos os impostos estaduais e municipais corretamente.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </OnboardingLayoutPremium>
  );
};

export default CompanyOnboarding;
