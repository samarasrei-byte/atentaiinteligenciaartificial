import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { 
  User, 
  MapPin, 
  DollarSign, 
  Briefcase,
  Check,
  Info
} from 'lucide-react';
import OnboardingLayout from './OnboardingLayout';
import OnboardingStepHeader from './OnboardingStepHeader';
import OnboardingOptionCard from './OnboardingOptionCard';

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
  { value: 'saude', label: 'Saúde', examples: 'Médico, Dentista, Fisioterapeuta' },
  { value: 'tecnologia', label: 'Tecnologia', examples: 'Desenvolvedor, Designer, Analista' },
  { value: 'juridico', label: 'Jurídico', examples: 'Advogado, Consultor Jurídico' },
  { value: 'contabilidade', label: 'Contabilidade', examples: 'Contador, Auditor' },
  { value: 'engenharia', label: 'Engenharia', examples: 'Engenheiro Civil, Elétrico' },
  { value: 'educacao', label: 'Educação', examples: 'Professor, Instrutor, Tutor' },
  { value: 'consultoria', label: 'Consultoria', examples: 'Consultor de Negócios' },
  { value: 'arte_criativo', label: 'Arte e Criativo', examples: 'Fotógrafo, Músico' },
  { value: 'comercio', label: 'Comércio e Vendas', examples: 'Representante, Corretor' },
  { value: 'outros', label: 'Outros', examples: 'Outras profissões' },
];

const TAX_REGIMES = [
  { value: 'pessoa_fisica', label: 'Pessoa Física (PF)', description: 'Tributação pelo Carnê-Leão/IRPF' },
  { value: 'mei', label: 'MEI', description: 'Microempreendedor Individual (até R$ 81.000/ano)' },
  { value: 'simples_nacional', label: 'Simples Nacional (ME)', description: 'Microempresa no Simples Nacional' },
  { value: 'lucro_presumido', label: 'Lucro Presumido', description: 'Empresa no regime de Lucro Presumido' },
  { value: 'nao_sei', label: 'Não sei', description: 'Não tenho certeza do meu regime atual' },
];

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const steps = [
  { id: 1, title: 'Profissão', icon: Briefcase },
  { id: 2, title: 'Regime', icon: DollarSign },
  { id: 3, title: 'Financeiro', icon: DollarSign },
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

      toast({
        title: 'Perfil configurado!',
        description: 'Seus dados foram salvos com sucesso',
      });
      
      onComplete();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao salvar dados do perfil',
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
    <OnboardingLayout
      title="Configure seu Perfil"
      subtitle="Personalize sua experiência como autônomo"
      icon={User}
      iconColor="from-purple-500 to-pink-500"
      steps={steps}
      currentStep={step}
      totalSteps={totalSteps}
      onNext={nextStep}
      onBack={prevStep}
      canProceed={!!canProceed()}
      isSubmitting={isSubmitting}
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
            <div className="space-y-2">
              <Label htmlFor="profession">Profissão *</Label>
              <Input
                id="profession"
                value={formData.profession}
                onChange={(e) => updateFormData('profession', e.target.value)}
                placeholder="Ex: Desenvolvedor de Software, Médico, Designer..."
              />
            </div>

            <div className="space-y-3">
              <Label>Categoria Profissional *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PROFESSION_CATEGORIES.map((cat) => (
                  <OnboardingOptionCard
                    key={cat.value}
                    label={cat.label}
                    description={cat.examples}
                    selected={formData.profession_category === cat.value}
                    onClick={() => updateFormData('profession_category', cat.value)}
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
            icon={DollarSign}
            title="Regime Tributário"
            description="Como você atua hoje?"
          />

          <div className="space-y-3">
            {TAX_REGIMES.map((regime) => (
              <OnboardingOptionCard
                key={regime.value}
                label={regime.label}
                description={regime.description}
                selected={formData.current_regime === regime.value}
                onClick={() => updateFormData('current_regime', regime.value)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Dados Financeiros */}
      {step === 3 && (
        <div className="space-y-6">
          <OnboardingStepHeader
            icon={DollarSign}
            title="Dados Financeiros"
            description="Informe seu faturamento médio mensal"
          />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="revenue">Faturamento Mensal Médio *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
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
                  className="pl-10"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Faturamento anual estimado: {formatCurrency(formData.monthly_revenue_average_cents * 12)}
              </p>
            </div>

            {formData.monthly_revenue_average_cents > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Análise Prévia</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formData.monthly_revenue_average_cents * 12 <= 8100000 
                          ? 'Seu faturamento é compatível com o MEI! Vamos simular se é a melhor opção para você.'
                          : formData.monthly_revenue_average_cents * 12 <= 36000000
                            ? 'Seu faturamento é compatível com ME (Simples Nacional). Vamos comparar as opções.'
                            : 'Seu faturamento indica que uma estrutura empresarial pode ser mais vantajosa.'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Sobre você (opcional)</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => updateFormData('bio', e.target.value)}
                placeholder="Conte um pouco sobre sua atuação profissional..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>
      )}
    </OnboardingLayout>
  );
};

export default AutonomoOnboarding;
