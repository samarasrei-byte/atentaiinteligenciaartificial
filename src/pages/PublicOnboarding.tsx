import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  FileText,
  ArrowRight,
  ArrowLeft,
  Brain
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

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

  const handleComplete = () => {
    // Store onboarding data in sessionStorage
    sessionStorage.setItem('pendingOnboardingData', JSON.stringify(formData));
    // Navigate to auth page
    navigate('/auth?from=onboarding');
  };

  const nextStep = () => {
    if (step < totalSteps) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-800/80 border-slate-700 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-10 w-10 text-teal-400" />
            <span className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
              AtentAI
            </span>
          </div>
          <div className="mx-auto mb-4 p-3 rounded-full bg-teal-500/20 w-fit">
            <Building2 className="h-8 w-8 text-teal-400" />
          </div>
          <CardTitle className="text-2xl text-white">Configure sua Empresa</CardTitle>
          <CardDescription className="text-slate-400">
            Precisamos de algumas informações para personalizar sua experiência
          </CardDescription>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-slate-400 mt-2">Etapa {step} de {totalSteps}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Identificação */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-teal-400 mb-4">
                <Building2 className="h-5 w-5" />
                <span className="font-semibold">Identificação da Empresa</span>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name" className="text-slate-300">Razão Social *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => updateFormData('company_name', e.target.value)}
                    placeholder="Nome oficial da empresa"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trade_name" className="text-slate-300">Nome Fantasia</Label>
                  <Input
                    id="trade_name"
                    value={formData.trade_name}
                    onChange={(e) => updateFormData('trade_name', e.target.value)}
                    placeholder="Nome comercial (opcional)"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj" className="text-slate-300">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={handleCNPJChange}
                    placeholder="00.000.000/0000-00"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Tipo de Empresa *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {COMPANY_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => updateFormData('company_type', type.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          formData.company_type === type.value
                            ? 'border-teal-500 bg-teal-500/20 text-white'
                            : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <p className="font-medium text-sm">{type.label}</p>
                        <p className="text-xs text-slate-400 mt-1">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Regime Tributário */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-cyan-400 mb-4">
                <FileText className="h-5 w-5" />
                <span className="font-semibold">Regime Tributário e Setor</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Regime Tributário *</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {TAX_REGIMES.map((regime) => (
                      <button
                        key={regime.value}
                        type="button"
                        onClick={() => updateFormData('tax_regime', regime.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          formData.tax_regime === regime.value
                            ? 'border-cyan-500 bg-cyan-500/20 text-white'
                            : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <p className="font-medium">{regime.label}</p>
                        <p className="text-sm text-slate-400">{regime.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Setor de Atuação *</Label>
                  <Select
                    value={formData.sector}
                    onValueChange={(value) => updateFormData('sector', value)}
                  >
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Selecione o setor" className="text-slate-400" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 z-50">
                      {SECTORS.map((sector) => (
                        <SelectItem 
                          key={sector.value} 
                          value={sector.value}
                          className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white"
                        >
                          {sector.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="main_activity" className="text-slate-300">Atividade Principal</Label>
                  <Input
                    id="main_activity"
                    value={formData.main_activity}
                    onChange={(e) => updateFormData('main_activity', e.target.value)}
                    placeholder="Ex: Desenvolvimento de software, Comércio varejista..."
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Dados Financeiros */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-green-400 mb-4">
                <DollarSign className="h-5 w-5" />
                <span className="font-semibold">Dados Financeiros</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="revenue" className="text-slate-300">Faturamento Mensal Médio *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-medium">R$</span>
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
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pl-10"
                    />
                  </div>
                  <p className="text-sm text-slate-400">
                    Faturamento anual estimado: {formatCurrency(formData.monthly_revenue_cents * 12)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employees" className="text-slate-300">Número de Funcionários</Label>
                  <Input
                    id="employees"
                    type="number"
                    min="0"
                    value={formData.employee_count || ''}
                    onChange={(e) => updateFormData('employee_count', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Localização */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-amber-400 mb-4">
                <MapPin className="h-5 w-5" />
                <span className="font-semibold">Localização</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Estado *</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => updateFormData('state', value)}
                  >
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Selecione o estado" className="text-slate-400" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 max-h-[200px] z-50">
                      {STATES.map((state) => (
                        <SelectItem 
                          key={state} 
                          value={state}
                          className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white"
                        >
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-slate-300">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    placeholder="Nome da cidade"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={step === 1}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            >
              {step === totalSteps ? 'Criar Conta' : 'Próximo'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicOnboarding;
