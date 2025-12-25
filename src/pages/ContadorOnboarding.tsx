import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Calculator, FileText, DollarSign, User, CheckCircle, ArrowRight, 
  ArrowLeft, Loader2, Award, Briefcase, Star, Clock,
} from 'lucide-react';

interface OnboardingData {
  crc_number: string;
  specialty: string;
  bio: string;
  hourly_rate: string;
  available: boolean;
}

const steps = [
  { id: 1, title: 'Dados Profissionais', icon: FileText, description: 'Seu CRC e especialidades' },
  { id: 2, title: 'Sobre Você', icon: User, description: 'Biografia e apresentação' },
  { id: 3, title: 'Valores e Disponibilidade', icon: DollarSign, description: 'Preços e horários' },
  { id: 4, title: 'Confirmação', icon: CheckCircle, description: 'Revise seus dados' },
];

const specialties = [
  'Reforma Tributária',
  'Simples Nacional',
  'Lucro Presumido',
  'Lucro Real',
  'MEI',
  'Imposto de Renda',
  'Planejamento Tributário',
  'Contabilidade Gerencial',
  'Folha de Pagamento',
  'Obrigações Acessórias',
];

const ContadorOnboarding = () => {
  const navigate = useNavigate();
  const { user, hasRole, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [data, setData] = useState<OnboardingData>({
    crc_number: '',
    specialty: '',
    bio: '',
    hourly_rate: '150',
    available: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else {
        // Allow any authenticated user to complete contador onboarding
        // The role will be assigned after completing the onboarding
        checkExistingProfile();
      }
    }
  }, [user, authLoading, navigate]);

  const checkExistingProfile = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('contador_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profile && profile.crc_number) {
      // Already has a complete profile, redirect to contador panel
      navigate('/contador');
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!data.crc_number.trim()) {
        newErrors.crc_number = 'CRC é obrigatório';
      } else if (!/^\d{1,6}\/O?-[A-Z]{2}$/.test(data.crc_number.trim())) {
        newErrors.crc_number = 'Formato inválido (ex: 12345/O-SP)';
      }
      if (selectedSpecialties.length === 0) {
        newErrors.specialty = 'Selecione pelo menos uma especialidade';
      }
    }

    if (step === 2) {
      if (!data.bio.trim()) {
        newErrors.bio = 'Biografia é obrigatória';
      } else if (data.bio.length < 50) {
        newErrors.bio = 'Biografia deve ter pelo menos 50 caracteres';
      }
    }

    if (step === 3) {
      const rate = parseFloat(data.hourly_rate);
      if (isNaN(rate) || rate < 50) {
        newErrors.hourly_rate = 'Valor mínimo é R$ 50,00';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const profileData = {
        user_id: user.id,
        crc_number: data.crc_number.trim(),
        specialty: selectedSpecialties.join(', '),
        bio: data.bio.trim(),
        hourly_rate_cents: Math.round(parseFloat(data.hourly_rate) * 100),
        available: data.available,
        rating: 5.0,
        total_consultations: 0,
      };

      const { error } = await supabase
        .from('contador_profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) throw error;

      // Add contador role to user_roles if not exists
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert(
          { user_id: user.id, role: 'contador' },
          { onConflict: 'user_id,role', ignoreDuplicates: true }
        );

      if (roleError) {
        console.error('Error adding contador role:', roleError);
        // Continue anyway - the profile was created successfully
      }

      toast({
        title: 'Perfil criado com sucesso!',
        description: 'Bem-vindo ao painel do contador',
      });

      navigate('/contador');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao salvar perfil',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
              <Calculator className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo ao AtentAI</h1>
          <p className="text-slate-400">Configure seu perfil profissional para começar a atender</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center flex-1 ${
                    step.id < steps.length ? 'relative' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-gradient-to-br from-teal-500 to-cyan-500'
                        : isActive
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 ring-4 ring-blue-500/30'
                        : 'bg-slate-700'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-white" />
                    ) : (
                      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 hidden sm:block ${
                      isActive ? 'text-white font-medium' : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2 bg-slate-700" />
        </div>

        {/* Content Card */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {React.createElement(steps[currentStep - 1].icon, {
                className: 'h-5 w-5 text-blue-400',
              })}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Professional Data */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label className="text-slate-300">Número do CRC *</Label>
                  <Input
                    value={data.crc_number}
                    onChange={(e) => setData({ ...data, crc_number: e.target.value })}
                    placeholder="12345/O-SP"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                  {errors.crc_number && (
                    <p className="text-sm text-red-400">{errors.crc_number}</p>
                  )}
                  <p className="text-xs text-slate-500">
                    Formato: número/O-UF (ex: 12345/O-SP)
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-300">Especialidades *</Label>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((specialty) => {
                      const isSelected = selectedSpecialties.includes(specialty);
                      return (
                        <Badge
                          key={specialty}
                          variant="outline"
                          className={`cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                              : 'bg-slate-700/50 text-slate-400 border-slate-600 hover:border-slate-500'
                          }`}
                          onClick={() => toggleSpecialty(specialty)}
                        >
                          {isSelected && <CheckCircle className="h-3 w-3 mr-1" />}
                          {specialty}
                        </Badge>
                      );
                    })}
                  </div>
                  {errors.specialty && (
                    <p className="text-sm text-red-400">{errors.specialty}</p>
                  )}
                </div>
              </>
            )}

            {/* Step 2: About You */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label className="text-slate-300">Biografia Profissional *</Label>
                  <Textarea
                    value={data.bio}
                    onChange={(e) => setData({ ...data, bio: e.target.value })}
                    placeholder="Descreva sua experiência profissional, formação e como você pode ajudar seus clientes..."
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 min-h-[150px]"
                  />
                  <div className="flex justify-between">
                    {errors.bio ? (
                      <p className="text-sm text-red-400">{errors.bio}</p>
                    ) : (
                      <span />
                    )}
                    <p className="text-xs text-slate-500">{data.bio.length} caracteres</p>
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                  <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-400" />
                    Dicas para uma boa biografia
                  </h4>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• Mencione sua formação e experiência</li>
                    <li>• Destaque suas áreas de especialização</li>
                    <li>• Seja claro sobre como você pode ajudar</li>
                    <li>• Mantenha um tom profissional mas acessível</li>
                  </ul>
                </div>
              </>
            )}

            {/* Step 3: Pricing */}
            {currentStep === 3 && (
              <>
                <div className="space-y-2">
                  <Label className="text-slate-300">Valor por Consulta (R$) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="number"
                      value={data.hourly_rate}
                      onChange={(e) => setData({ ...data, hourly_rate: e.target.value })}
                      min="50"
                      step="10"
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  {errors.hourly_rate && (
                    <p className="text-sm text-red-400">{errors.hourly_rate}</p>
                  )}
                  <p className="text-xs text-slate-500">
                    Taxa da plataforma: 10% sobre cada consulta
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-teal-400" />
                    <div>
                      <p className="font-medium text-white">Disponível para consultas</p>
                      <p className="text-sm text-slate-400">
                        Seu perfil aparecerá na lista de contadores
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={data.available}
                    onCheckedChange={(checked) => setData({ ...data, available: checked })}
                  />
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Seus ganhos estimados
                  </h4>
                  <p className="text-slate-300">
                    Com o valor de{' '}
                    <span className="font-bold text-white">
                      R$ {parseFloat(data.hourly_rate || '0').toFixed(2)}
                    </span>{' '}
                    por consulta, você receberá{' '}
                    <span className="font-bold text-emerald-400">
                      R$ {(parseFloat(data.hourly_rate || '0') * 0.9).toFixed(2)}
                    </span>{' '}
                    líquido.
                  </p>
                </div>
              </>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">CRC</span>
                    <span className="text-white font-medium">{data.crc_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Especialidades</span>
                    <span className="text-white font-medium text-right max-w-[60%]">
                      {selectedSpecialties.join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Valor por consulta</span>
                    <span className="text-white font-medium">
                      R$ {parseFloat(data.hourly_rate).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Disponível</span>
                    <Badge
                      className={
                        data.available
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-500/20 text-slate-400'
                      }
                    >
                      {data.available ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                  <h4 className="text-sm font-medium text-white mb-2">Biografia</h4>
                  <p className="text-slate-400 text-sm">{data.bio}</p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-400 text-sm">
                    Ao confirmar, seu perfil será publicado e você poderá começar a receber
                    solicitações de consultoria.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t border-slate-700">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>

              {currentStep < steps.length ? (
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Confirmar e Publicar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContadorOnboarding;
