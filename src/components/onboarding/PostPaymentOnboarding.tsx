import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  User, 
  Building2, 
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface PostPaymentOnboardingProps {
  serviceType: string;
  requestId: string;
  onComplete: () => void;
}

type UserType = 'autonomo' | 'empresa' | 'pf';

interface OnboardingData {
  userType: UserType | '';
  // Autônomo fields
  profession: string;
  professionCategory: string;
  monthlyRevenue: number;
  currentRegime: string;
  // Empresa fields
  companyName: string;
  companyType: string;
  taxRegime: string;
  sector: string;
  // Common fields
  state: string;
  city: string;
}

const PROFESSION_CATEGORIES = [
  { value: 'saude', label: 'Saúde', examples: 'Médico, Dentista, Psicólogo, Fisioterapeuta' },
  { value: 'advocacia', label: 'Advocacia', examples: 'Advogado, Consultor Jurídico' },
  { value: 'contabilidade', label: 'Contabilidade', examples: 'Contador, Auditor' },
  { value: 'tecnologia', label: 'Tecnologia', examples: 'Desenvolvedor, Designer, Consultor de TI' },
  { value: 'engenharia', label: 'Engenharia', examples: 'Engenheiro Civil, Elétrico, Mecânico' },
  { value: 'educacao', label: 'Educação', examples: 'Professor, Instrutor, Tutor' },
  { value: 'marketing', label: 'Marketing/Comunicação', examples: 'Publicitário, Social Media, Redator' },
  { value: 'arte', label: 'Arte/Entretenimento', examples: 'Músico, Fotógrafo, Produtor' },
  { value: 'consultoria', label: 'Consultoria', examples: 'Consultor de Negócios, Financeiro' },
  { value: 'outros', label: 'Outros', examples: 'Outras profissões' },
];

const COMPANY_TYPES = [
  { value: 'mei', label: 'MEI', description: 'Até R$ 81.000/ano' },
  { value: 'me', label: 'ME - Microempresa', description: 'Até R$ 360.000/ano' },
  { value: 'epp', label: 'EPP', description: 'Até R$ 4.800.000/ano' },
  { value: 'ltda', label: 'LTDA', description: 'Sociedade Limitada' },
];

const TAX_REGIMES = [
  { value: 'simples_nacional', label: 'Simples Nacional' },
  { value: 'lucro_presumido', label: 'Lucro Presumido' },
  { value: 'lucro_real', label: 'Lucro Real' },
];

const SECTORS = [
  { value: 'comercio', label: 'Comércio' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'industria', label: 'Indústria' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'saude', label: 'Saúde' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'outro', label: 'Outro' },
];

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const PostPaymentOnboarding: React.FC<PostPaymentOnboardingProps> = ({
  serviceType,
  requestId,
  onComplete
}) => {
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    userType: '',
    profession: '',
    professionCategory: '',
    monthlyRevenue: 0,
    currentRegime: 'pf',
    companyName: '',
    companyType: '',
    taxRegime: '',
    sector: '',
    state: '',
    city: '',
  });

  const totalSteps = formData.userType === 'pf' ? 2 : 3;
  const progress = (step / totalSteps) * 100;

  const updateFormData = <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUserTypeSelect = (type: UserType) => {
    updateFormData('userType', type);
    setStep(2);
  };

  const canProceed = () => {
    if (step === 1) return !!formData.userType;
    
    if (formData.userType === 'autonomo') {
      if (step === 2) return formData.profession && formData.professionCategory;
      if (step === 3) return formData.monthlyRevenue > 0;
    }
    
    if (formData.userType === 'empresa') {
      if (step === 2) return formData.companyName && formData.companyType;
      if (step === 3) return formData.taxRegime && formData.sector;
    }
    
    if (formData.userType === 'pf') {
      if (step === 2) return formData.state;
    }
    
    return true;
  };

  const handleComplete = async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    setIsLoading(true);

    try {
      if (formData.userType === 'autonomo') {
        // Create/update autonomo profile
        const { error: profileError } = await supabase
          .from('autonomo_profiles')
          .upsert({
            user_id: user.id,
            profession: formData.profession,
            profession_category: formData.professionCategory,
            monthly_revenue_average_cents: formData.monthlyRevenue * 100,
            current_regime: formData.currentRegime,
            state: formData.state,
            city: formData.city,
          });

        if (profileError) throw profileError;

        // Add autonomo role
        await supabase
          .from('user_roles')
          .upsert({
            user_id: user.id,
            role: 'autonomo',
          }, { onConflict: 'user_id,role' });

      } else if (formData.userType === 'empresa') {
        // Create company
        const { error: companyError } = await supabase
          .from('companies')
          .insert({
            user_id: user.id,
            company_name: formData.companyName,
            company_type: formData.companyType as any,
            tax_regime: formData.taxRegime as any,
            sector: formData.sector as any,
            state: formData.state,
            city: formData.city,
            onboarding_completed: true,
          });

        if (companyError) throw companyError;
      }

      // Update profile with location
      await supabase
        .from('profiles')
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      // Update user metadata to remove needs_onboarding flag
      await supabase.auth.updateUser({
        data: { needs_onboarding: false, user_type: formData.userType }
      });

      await refreshUserData?.();
      
      toast.success('Perfil configurado com sucesso!');
      onComplete();
      
    } catch (error: any) {
      console.error('Error saving onboarding:', error);
      toast.error('Erro ao salvar dados: ' + error.message);
    } finally {
      setIsLoading(false);
    }
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Complete seu Cadastro</CardTitle>
        <CardDescription>
          Precisamos de algumas informações para personalizar seu atendimento
        </CardDescription>
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">Etapa {step} de {totalSteps}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: User Type Selection */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <p className="text-center text-muted-foreground mb-6">
              Como você se identifica?
            </p>
            
            <div className="grid gap-4">
              <button
                onClick={() => handleUserTypeSelect('autonomo')}
                className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
              >
                <div className="p-3 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                  <User className="h-6 w-6 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Profissional Autônomo</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Médico, advogado, desenvolvedor, contador, consultor, freelancer...
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>

              <button
                onClick={() => handleUserTypeSelect('empresa')}
                className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
              >
                <div className="p-3 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                  <Building2 className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Tenho uma Empresa</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    MEI, ME, EPP, LTDA, EIRELI ou outra forma jurídica
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>

              <button
                onClick={() => handleUserTypeSelect('pf')}
                className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
              >
                <div className="p-3 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                  <Briefcase className="h-6 w-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Pessoa Física (CLT/Aposentado)</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Trabalhador com carteira assinada, aposentado ou pensionista
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            </div>
          </div>
        )}

        {/* Autônomo Step 2: Profession */}
        {step === 2 && formData.userType === 'autonomo' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-emerald-500 mb-4">
              <User className="h-5 w-5" />
              <span className="font-semibold">Sua Profissão</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Categoria Profissional *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PROFESSION_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => updateFormData('professionCategory', cat.value)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        formData.professionCategory === cat.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <p className="font-medium text-sm">{cat.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{cat.examples}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profession">Profissão Específica *</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => updateFormData('profession', e.target.value)}
                  placeholder="Ex: Médico Cardiologista, Advogado Trabalhista..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Autônomo Step 3: Revenue */}
        {step === 3 && formData.userType === 'autonomo' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-emerald-500 mb-4">
              <User className="h-5 w-5" />
              <span className="font-semibold">Faturamento e Localização</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="revenue">Faturamento Mensal Médio *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
                  <Input
                    id="revenue"
                    type="number"
                    value={formData.monthlyRevenue || ''}
                    onChange={(e) => updateFormData('monthlyRevenue', parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Regime Tributário Atual</Label>
                <RadioGroup
                  value={formData.currentRegime}
                  onValueChange={(value) => updateFormData('currentRegime', value)}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="pf" id="pf" />
                    <Label htmlFor="pf" className="cursor-pointer">Pessoa Física</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="mei" id="mei" />
                    <Label htmlFor="mei" className="cursor-pointer">MEI</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="me_simples" id="me_simples" />
                    <Label htmlFor="me_simples" className="cursor-pointer">ME - Simples</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="lucro_presumido" id="lucro" />
                    <Label htmlFor="lucro" className="cursor-pointer">Lucro Presumido</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estado *</Label>
                  <select
                    value={formData.state}
                    onChange={(e) => updateFormData('state', e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Selecione</option>
                    {STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
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
            </div>
          </div>
        )}

        {/* Empresa Step 2: Company Info */}
        {step === 2 && formData.userType === 'empresa' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-blue-500 mb-4">
              <Building2 className="h-5 w-5" />
              <span className="font-semibold">Dados da Empresa</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Razão Social *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => updateFormData('companyName', e.target.value)}
                  placeholder="Nome oficial da empresa"
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Empresa *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {COMPANY_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => updateFormData('companyType', type.value)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        formData.companyType === type.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <p className="font-medium">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empresa Step 3: Tax Regime */}
        {step === 3 && formData.userType === 'empresa' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-blue-500 mb-4">
              <Building2 className="h-5 w-5" />
              <span className="font-semibold">Regime e Setor</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Regime Tributário *</Label>
                <RadioGroup
                  value={formData.taxRegime}
                  onValueChange={(value) => updateFormData('taxRegime', value)}
                  className="space-y-2"
                >
                  {TAX_REGIMES.map((regime) => (
                    <div key={regime.value} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value={regime.value} id={regime.value} />
                      <Label htmlFor={regime.value} className="cursor-pointer flex-1">{regime.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Setor de Atuação *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SECTORS.map((sector) => (
                    <button
                      key={sector.value}
                      type="button"
                      onClick={() => updateFormData('sector', sector.value)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        formData.sector === sector.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      {sector.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <select
                    value={formData.state}
                    onChange={(e) => updateFormData('state', e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Selecione</option>
                    {STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cityEmpresa">Cidade</Label>
                  <Input
                    id="cityEmpresa"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    placeholder="Sua cidade"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PF Step 2: Location only */}
        {step === 2 && formData.userType === 'pf' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-amber-500 mb-4">
              <Briefcase className="h-5 w-5" />
              <span className="font-semibold">Sua Localização</span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estado *</Label>
                  <select
                    value={formData.state}
                    onChange={(e) => updateFormData('state', e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Selecione</option>
                    {STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cityPF">Cidade</Label>
                  <Input
                    id="cityPF"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    placeholder="Sua cidade"
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Pronto para continuar!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Com essas informações já conseguimos personalizar seu atendimento.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {step > 1 && (
          <div className="flex justify-between pt-4">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button
              onClick={nextStep}
              disabled={!canProceed() || isLoading}
            >
              {isLoading ? (
                'Salvando...'
              ) : step === totalSteps ? (
                <>
                  Concluir
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostPaymentOnboarding;
