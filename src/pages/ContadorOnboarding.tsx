import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Calculator, FileText, DollarSign, User, CheckCircle, 
  Loader2, Award, Star, Clock,
} from 'lucide-react';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import OnboardingStepHeader from '@/components/onboarding/OnboardingStepHeader';

interface OnboardingData {
  crc_number: string;
  specialty: string;
  bio: string;
  hourly_rate: string;
  available: boolean;
}

const steps = [
  { id: 1, title: 'Profissional', icon: FileText },
  { id: 2, title: 'Biografia', icon: User },
  { id: 3, title: 'Valores', icon: DollarSign },
  { id: 4, title: 'Confirmar', icon: CheckCircle },
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
  const { user, loading: authLoading } = useAuth();
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

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.crc_number.trim() && selectedSpecialties.length > 0;
      case 2:
        return data.bio.trim().length >= 50;
      case 3:
        return parseFloat(data.hourly_rate) >= 50;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
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

      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert(
          { user_id: user.id, role: 'contador' },
          { onConflict: 'user_id,role', ignoreDuplicates: true }
        );

      if (roleError) {
        console.error('Error adding contador role:', roleError);
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <OnboardingLayout
      title="Bem-vindo ao AtentAI"
      subtitle="Configure seu perfil profissional para começar a atender"
      icon={Calculator}
      iconColor="from-teal-500 to-emerald-500"
      steps={steps}
      currentStep={currentStep}
      totalSteps={steps.length}
      onNext={handleNext}
      onBack={handleBack}
      canProceed={canProceed()}
      isSubmitting={isLoading}
      submitLabel="Criar Perfil"
    >
      {/* Step 1: Professional Data */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <OnboardingStepHeader
            icon={FileText}
            title="Dados Profissionais"
            description="Seu CRC e especialidades"
          />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Número do CRC *</Label>
              <Input
                value={data.crc_number}
                onChange={(e) => setData({ ...data, crc_number: e.target.value })}
                placeholder="12345/O-SP"
              />
              {errors.crc_number && (
                <p className="text-sm text-destructive">{errors.crc_number}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Formato: número/O-UF (ex: 12345/O-SP)
              </p>
            </div>

            <div className="space-y-3">
              <Label>Especialidades *</Label>
              <div className="flex flex-wrap gap-2">
                {specialties.map((specialty) => {
                  const isSelected = selectedSpecialties.includes(specialty);
                  return (
                    <Badge
                      key={specialty}
                      variant="outline"
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-primary/10 text-primary border-primary/50'
                          : 'bg-muted text-muted-foreground border-border hover:border-muted-foreground/50'
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
                <p className="text-sm text-destructive">{errors.specialty}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: About You */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <OnboardingStepHeader
            icon={User}
            title="Biografia Profissional"
            description="Conte sobre sua experiência"
          />

          <div className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={data.bio}
                onChange={(e) => setData({ ...data, bio: e.target.value })}
                placeholder="Descreva sua experiência profissional, formação e como você pode ajudar seus clientes..."
                className="min-h-[150px]"
              />
              <div className="flex justify-between">
                {errors.bio ? (
                  <p className="text-sm text-destructive">{errors.bio}</p>
                ) : (
                  <span />
                )}
                <p className="text-xs text-muted-foreground">{data.bio.length} caracteres</p>
              </div>
            </div>

            <Card className="bg-muted/50 border-border">
              <CardContent className="pt-4">
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  Dicas para uma boa biografia
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Mencione sua formação e experiência</li>
                  <li>• Destaque suas áreas de especialização</li>
                  <li>• Seja claro sobre como você pode ajudar</li>
                  <li>• Mantenha um tom profissional mas acessível</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Step 3: Pricing */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <OnboardingStepHeader
            icon={DollarSign}
            title="Valores e Disponibilidade"
            description="Configure seus preços"
          />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Valor por Consulta (R$) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={data.hourly_rate}
                  onChange={(e) => setData({ ...data, hourly_rate: e.target.value })}
                  min="50"
                  step="10"
                  className="pl-10"
                />
              </div>
              {errors.hourly_rate && (
                <p className="text-sm text-destructive">{errors.hourly_rate}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Taxa da plataforma: 10% sobre cada consulta
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Disponível para consultas</p>
                  <p className="text-sm text-muted-foreground">
                    Seu perfil aparecerá na lista de contadores
                  </p>
                </div>
              </div>
              <Switch
                checked={data.available}
                onCheckedChange={(checked) => setData({ ...data, available: checked })}
              />
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Seus ganhos estimados
                </h4>
                <p className="text-muted-foreground">
                  Com o valor de{' '}
                  <span className="font-bold text-foreground">
                    R$ {parseFloat(data.hourly_rate || '0').toFixed(2)}
                  </span>{' '}
                  por consulta, você receberá{' '}
                  <span className="font-bold text-primary">
                    R$ {(parseFloat(data.hourly_rate || '0') * 0.9).toFixed(2)}
                  </span>{' '}
                  líquido.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <OnboardingStepHeader
            icon={CheckCircle}
            title="Confirmação"
            description="Revise seus dados antes de finalizar"
          />

          <Card className="border-border">
            <CardContent className="pt-4 space-y-4">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">CRC</span>
                <span className="font-medium text-foreground">{data.crc_number}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Especialidades</span>
                <span className="font-medium text-foreground text-right max-w-[60%]">
                  {selectedSpecialties.join(', ')}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Valor por consulta</span>
                <span className="font-medium text-foreground">
                  R$ {parseFloat(data.hourly_rate).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Disponível</span>
                <Badge
                  className={
                    data.available
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }
                >
                  {data.available ? 'Sim' : 'Não'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50 border-border">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Biografia:</strong> {data.bio.substring(0, 150)}
                {data.bio.length > 150 && '...'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </OnboardingLayout>
  );
};

export default ContadorOnboarding;
