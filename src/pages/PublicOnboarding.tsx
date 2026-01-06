import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  FileText,
} from 'lucide-react';
import OnboardingLayoutModern from '@/components/onboarding/OnboardingLayoutModern';

interface OnboardingData {
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
  { value: 'mei', label: 'MEI - Microempreendedor Individual', description: 'Faturamento até R$ 81.000/ano' },
  { value: 'me', label: 'ME - Microempresa', description: 'Faturamento até R$ 360.000/ano' },
  { value: 'epp', label: 'EPP - Empresa de Pequeno Porte', description: 'Faturamento até R$ 4.800.000/ano' },
  { value: 'ltda', label: 'LTDA - Sociedade Limitada', description: 'Empresa com sócios de responsabilidade limitada' },
  { value: 'eireli', label: 'EIRELI - Empresa Individual', description: 'Empresa individual de responsabilidade limitada' },
  { value: 'sa_fechada', label: 'S.A. Fechada', description: 'Sociedade anônima de capital fechado' },
  { value: 'sa_aberta', label: 'S.A. Aberta', description: 'Sociedade anônima de capital aberto (bolsa)' },
  { value: 'cooperativa', label: 'Cooperativa', description: 'Sociedade cooperativa' },
];

const TAX_REGIMES = [
  { value: 'simples_nacional', label: 'Simples Nacional', description: 'Regime simplificado para ME e EPP' },
  { value: 'lucro_presumido', label: 'Lucro Presumido', description: 'Base de cálculo presumida pelo fisco' },
  { value: 'lucro_real', label: 'Lucro Real', description: 'Tributos sobre o lucro efetivo' },
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
  { id: 1, title: 'Identificação', icon: Building2 },
  { id: 2, title: 'Regime', icon: FileText },
  { id: 3, title: 'Financeiro', icon: DollarSign },
  { id: 4, title: 'Localização', icon: MapPin },
];

const PublicOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
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

  const updateFormData = (field: keyof OnboardingData, value: string | number) => {
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

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return Boolean(formData.company_name && formData.company_type);
      case 2:
        return Boolean(formData.tax_regime && formData.sector);
      case 3:
        return formData.monthly_revenue_cents > 0;
      case 4:
        return Boolean(formData.state);
      default:
        return true;
    }
  };

  const handleComplete = () => {
    sessionStorage.setItem('pendingOnboardingData', JSON.stringify(formData));
    navigate('/auth?from=onboarding');
  };

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary mb-4">
              <Building2 className="h-5 w-5" />
              <span className="font-semibold">Identificação da Empresa</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Razão Social *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => updateFormData('company_name', e.target.value)}
                  placeholder="Nome oficial da empresa"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trade_name">Nome Fantasia</Label>
                <Input
                  id="trade_name"
                  value={formData.trade_name}
                  onChange={(e) => updateFormData('trade_name', e.target.value)}
                  placeholder="Nome comercial (opcional)"
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={handleCNPJChange}
                placeholder="00.000.000/0000-00"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Empresa *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMPANY_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateFormData('company_type', type.value)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      formData.company_type === type.value
                        ? 'border-primary bg-primary/5 text-foreground ring-2 ring-primary/20'
                        : 'border-border bg-card text-foreground hover:border-primary/50'
                    }`}
                  >
                    <p className="font-medium text-sm">{type.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary mb-4">
              <FileText className="h-5 w-5" />
              <span className="font-semibold">Regime Tributário e Setor</span>
            </div>

            <div className="space-y-2">
              <Label>Regime Tributário *</Label>
              <div className="grid grid-cols-1 gap-2">
                {TAX_REGIMES.map((regime) => (
                  <button
                    key={regime.value}
                    type="button"
                    onClick={() => updateFormData('tax_regime', regime.value)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      formData.tax_regime === regime.value
                        ? 'border-primary bg-primary/5 text-foreground ring-2 ring-primary/20'
                        : 'border-border bg-card text-foreground hover:border-primary/50'
                    }`}
                  >
                    <p className="font-medium">{regime.label}</p>
                    <p className="text-sm text-muted-foreground">{regime.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Setor de Atuação *</Label>
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

              <div className="space-y-2">
                <Label htmlFor="main_activity">Atividade Principal</Label>
                <Input
                  id="main_activity"
                  value={formData.main_activity}
                  onChange={(e) => updateFormData('main_activity', e.target.value)}
                  placeholder="Ex: Desenvolvimento de software"
                  className="h-11"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary mb-4">
              <DollarSign className="h-5 w-5" />
              <span className="font-semibold">Dados Financeiros</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="revenue">Faturamento Mensal Médio *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
                <Input
                  id="revenue"
                  type="text"
                  inputMode="numeric"
                  value={formData.monthly_revenue_cents > 0 ? new Intl.NumberFormat('pt-BR').format(formData.monthly_revenue_cents / 100) : ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    updateFormData('monthly_revenue_cents', parseInt(value) * 100 || 0);
                  }}
                  placeholder="0"
                  className="h-11 pl-10"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Faturamento anual estimado: {formatCurrency(formData.monthly_revenue_cents * 12)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employees">Número de Funcionários</Label>
              <Input
                id="employees"
                type="number"
                min="0"
                value={formData.employee_count || ''}
                onChange={(e) => updateFormData('employee_count', parseInt(e.target.value) || 0)}
                placeholder="0"
                className="h-11"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary mb-4">
              <MapPin className="h-5 w-5" />
              <span className="font-semibold">Localização</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estado *</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => updateFormData('state', value)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
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
                  placeholder="Nome da cidade"
                  className="h-11"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <OnboardingLayoutModern
      title="Configure sua Empresa"
      subtitle="Precisamos de algumas informações para personalizar sua experiência e análises tributárias."
      icon={Building2}
      iconColor="bg-primary/10 text-primary"
      steps={steps}
      currentStep={step}
      totalSteps={4}
      onNext={nextStep}
      onBack={prevStep}
      canProceed={canProceed()}
      submitLabel="Criar Conta"
      backLinkUrl="/"
    >
      {renderStepContent()}
    </OnboardingLayoutModern>
  );
};

export default PublicOnboarding;
