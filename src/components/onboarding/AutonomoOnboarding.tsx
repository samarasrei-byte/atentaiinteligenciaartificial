import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  MapPin, 
  DollarSign, 
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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
  { value: 'saude', label: 'Saúde', examples: 'Médico, Dentista, Fisioterapeuta, Nutricionista' },
  { value: 'tecnologia', label: 'Tecnologia', examples: 'Desenvolvedor, Designer, Analista de Sistemas' },
  { value: 'juridico', label: 'Jurídico', examples: 'Advogado, Consultor Jurídico' },
  { value: 'contabilidade', label: 'Contabilidade', examples: 'Contador, Auditor' },
  { value: 'engenharia', label: 'Engenharia', examples: 'Engenheiro Civil, Engenheiro Elétrico' },
  { value: 'educacao', label: 'Educação', examples: 'Professor, Instrutor, Tutor' },
  { value: 'consultoria', label: 'Consultoria', examples: 'Consultor de Negócios, Marketing' },
  { value: 'arte_criativo', label: 'Arte e Criativo', examples: 'Fotógrafo, Designer, Músico' },
  { value: 'comercio', label: 'Comércio e Vendas', examples: 'Representante Comercial, Corretor' },
  { value: 'outros', label: 'Outros', examples: 'Outras profissões autônomas' },
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
  const progress = (step / totalSteps) * 100;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/30 to-teal-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-800/80 border-slate-700 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-emerald-500/20 w-fit">
            <User className="h-8 w-8 text-emerald-400" />
          </div>
          <CardTitle className="text-2xl text-white">Configure seu Perfil Autônomo</CardTitle>
          <CardDescription className="text-slate-400">
            Precisamos de algumas informações para personalizar sua experiência e otimizar suas simulações
          </CardDescription>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-slate-400 mt-2">Etapa {step} de {totalSteps}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Profissão */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-emerald-400 mb-4">
                <Briefcase className="h-5 w-5" />
                <span className="font-semibold">Sua Profissão</span>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profession" className="text-slate-300">Profissão *</Label>
                  <Input
                    id="profession"
                    value={formData.profession}
                    onChange={(e) => updateFormData('profession', e.target.value)}
                    placeholder="Ex: Desenvolvedor de Software, Médico, Designer..."
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Categoria Profissional *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {PROFESSION_CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => updateFormData('profession_category', cat.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          formData.profession_category === cat.value
                            ? 'border-emerald-500 bg-emerald-500/20 text-white'
                            : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <p className="font-medium text-sm">{cat.label}</p>
                        <p className="text-xs text-slate-400 mt-1">{cat.examples}</p>
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
                <DollarSign className="h-5 w-5" />
                <span className="font-semibold">Regime Tributário Atual</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Como você atua hoje? *</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {TAX_REGIMES.map((regime) => (
                      <button
                        key={regime.value}
                        type="button"
                        onClick={() => updateFormData('current_regime', regime.value)}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          formData.current_regime === regime.value
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
                      value={formData.monthly_revenue_average_cents > 0 ? new Intl.NumberFormat('pt-BR').format(formData.monthly_revenue_average_cents / 100) : ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        updateFormData('monthly_revenue_average_cents', parseInt(value) * 100 || 0);
                      }}
                      placeholder="0"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pl-10"
                    />
                  </div>
                  <p className="text-sm text-slate-400">
                    Faturamento anual estimado: {formatCurrency(formData.monthly_revenue_average_cents * 12)}
                  </p>
                </div>

                {formData.monthly_revenue_average_cents > 0 && (
                  <Card className="bg-slate-700/30 border-slate-600">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-emerald-500/20">
                          <Check className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Análise Prévia</p>
                          <p className="text-sm text-slate-400 mt-1">
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
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-amber-400 mb-4">
                <MapPin className="h-5 w-5" />
                <span className="font-semibold">Localização e Contato</span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Estado *</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) => updateFormData('state', value)}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {STATES.map((state) => (
                          <SelectItem 
                            key={state} 
                            value={state}
                            className="text-white hover:bg-slate-700 focus:bg-slate-700"
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
                      placeholder="Sua cidade"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="text-slate-300">CPF</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={handleCPFChange}
                      placeholder="000.000.000-00"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-300">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="(00) 00000-0000"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-slate-300">Sobre você (opcional)</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => updateFormData('bio', e.target.value)}
                    placeholder="Conte um pouco sobre sua atuação profissional..."
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={prevStep}
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
            <Button
              onClick={nextStep}
              disabled={!canProceed() || isSubmitting}
              className={`flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 ${step === 1 ? 'w-full' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : step === totalSteps ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Concluir Configuração
                </>
              ) : (
                <>
                  Continuar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Skip option */}
          {step === 1 && (
            <p className="text-center text-sm text-slate-500">
              Você pode pular e configurar depois no seu perfil
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutonomoOnboarding;
