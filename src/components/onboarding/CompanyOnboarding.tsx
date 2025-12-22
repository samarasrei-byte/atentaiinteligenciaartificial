import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Users, 
  FileText,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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

interface CompanyOnboardingProps {
  onComplete: () => void;
}

const CompanyOnboarding: React.FC<CompanyOnboardingProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

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

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    updateFormData('monthly_revenue_cents', parseInt(value) || 0);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-800/80 border-slate-700 backdrop-blur-sm">
        <CardHeader className="text-center">
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
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white [&>span]:text-slate-400 [&>span[data-placeholder]]:text-slate-400">
                      <SelectValue placeholder="Selecione o setor" />
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
                    <span className="absolute left-3 top-3 text-slate-400">R$</span>
                    <Input
                      id="revenue"
                      value={formData.monthly_revenue_cents > 0 ? (formData.monthly_revenue_cents / 100).toFixed(0) : ''}
                      onChange={handleRevenueChange}
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

                {/* Quick info based on company type and revenue */}
                {formData.company_type && formData.monthly_revenue_cents > 0 && (
                  <Card className="bg-slate-700/30 border-slate-600">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-teal-500/20">
                          <Check className="h-4 w-4 text-teal-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Análise Prévia</p>
                          <p className="text-sm text-slate-400 mt-1">
                            Com base nos dados informados, sua empresa pode se beneficiar significativamente 
                            do simulador de reforma tributária. Vamos calcular os impactos do IBS e CBS no seu negócio.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
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
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white [&>span]:text-slate-400 [&>span[data-placeholder]]:text-slate-400">
                      <SelectValue placeholder="Selecione o estado" />
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

                {/* Summary */}
                <Card className="bg-slate-700/30 border-slate-600 mt-6">
                  <CardContent className="pt-4">
                    <p className="font-medium text-white mb-3">Resumo da Empresa</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Razão Social:</span>
                        <span className="text-white">{formData.company_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tipo:</span>
                        <span className="text-white">
                          {COMPANY_TYPES.find(t => t.value === formData.company_type)?.label.split(' - ')[0]}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Regime:</span>
                        <span className="text-white">
                          {TAX_REGIMES.find(r => r.value === formData.tax_regime)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Faturamento Mensal:</span>
                        <span className="text-teal-400">{formatCurrency(formData.monthly_revenue_cents)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Localização:</span>
                        <span className="text-white">{formData.city ? `${formData.city}/${formData.state}` : formData.state}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={step === 1}
              className="text-slate-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            <Button
              onClick={nextStep}
              disabled={!canProceed() || isSubmitting}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : step === totalSteps ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Concluir
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyOnboarding;
