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
  Loader2, Award, Star, Clock, AlertCircle, Check, X,
} from 'lucide-react';
import OnboardingLayoutPremium from '@/components/onboarding/OnboardingLayoutPremium';
import OnboardingStepHeader from '@/components/onboarding/OnboardingStepHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OnboardingData {
  crc_number: string;
  specialty: string;
  bio: string;
  hourly_rate: string;
  certificate_rate: string;
  available: boolean;
}

// Limites de caracteres
const BIO_MIN_LENGTH = 50;
const BIO_MAX_LENGTH = 500;

// Preço fixo por certidão emitida
const CERTIFICATE_PRICE = 100;

// Regex para detectar texto spam/inválido (3+ caracteres repetidos consecutivos)
const SPAM_PATTERN = /(.)\1{3,}/;

// Valida se a biografia tem conteúdo real (não é spam)
function validateBioContent(bio: string): { isValid: boolean; error?: string } {
  const trimmedBio = bio.trim();
  
  // Verifica caracteres repetidos excessivos
  if (SPAM_PATTERN.test(trimmedBio)) {
    return { isValid: false, error: 'Biografia contém caracteres repetidos em excesso. Escreva um texto real.' };
  }
  
  // Verifica se tem pelo menos 3 palavras distintas
  const words = trimmedBio.split(/\s+/).filter(w => w.length > 2);
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  if (uniqueWords.size < 5) {
    return { isValid: false, error: 'Biografia deve conter pelo menos 5 palavras distintas.' };
  }
  
  // Verifica proporção de letras vs caracteres especiais
  const letters = (trimmedBio.match(/[a-záàâãéèêíïóôõöúçñ]/gi) || []).length;
  const total = trimmedBio.replace(/\s/g, '').length;
  if (total > 0 && letters / total < 0.6) {
    return { isValid: false, error: 'Biografia deve conter principalmente texto legível.' };
  }
  
  return { isValid: true };
}

// Formata CRC enquanto digita
function formatCRCInput(value: string): string {
  // Remove espaços extras
  let cleaned = value.trim().toUpperCase();
  
  // Se tem mais de 2 caracteres e começa com letra (UF), adiciona hífen automaticamente
  if (/^[A-Z]{2}\d/.test(cleaned) && !cleaned.includes('-') && !cleaned.includes('/')) {
    cleaned = cleaned.slice(0, 2) + '-' + cleaned.slice(2);
  }
  
  // Se termina com UF sem separador, adiciona
  const endsWithUF = cleaned.match(/(\d)([A-Z]{2})$/);
  if (endsWithUF && !cleaned.includes('-') && !cleaned.includes('/')) {
    cleaned = cleaned.slice(0, -2) + '-' + cleaned.slice(-2);
  }
  
  return cleaned;
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

// Lista de UFs válidas
const VALID_UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

interface CRCValidation {
  isValid: boolean;
  formatted: string | null;
  uf: string | null;
  number: string | null;
  error?: string;
}

// Função para validar CRC com múltiplos formatos
// Formatos aceitos:
// 1. 12345/O-SP (formato padrão com categoria)
// 2. 123456/O-SP (6 dígitos)
// 3. 12345-SP (sem categoria)
// 4. SP-12345 (UF primeiro)
// 5. 1SP272142 (categoria + UF + número junto)
// 6. SP272142 (UF + número junto)
// 7. CRC/SP-12345 (com prefixo CRC)
// 8. CRC-SP-12345 (variação)
function validateCRC(crc: string): CRCValidation {
  const cleanCrc = crc.trim().toUpperCase().replace(/\s+/g, '');
  
  if (!cleanCrc) {
    return { isValid: false, formatted: null, uf: null, number: null, error: 'CRC é obrigatório' };
  }
  
  let number: string | null = null;
  let uf: string | null = null;
  
  // Remove prefixo CRC se existir
  const withoutPrefix = cleanCrc.replace(/^CRC[\/-]?/i, '');
  
  // Formato 1: 12345/O-SP ou 123456/O-SP (com ou sem O)
  const match1 = withoutPrefix.match(/^(\d{3,6})\/?O?-([A-Z]{2})$/);
  if (match1) {
    number = match1[1];
    uf = match1[2];
  }
  
  // Formato 2: 12345-SP (número-UF)
  if (!number) {
    const match2 = withoutPrefix.match(/^(\d{3,6})-([A-Z]{2})$/);
    if (match2) {
      number = match2[1];
      uf = match2[2];
    }
  }
  
  // Formato 3: SP-12345 (UF-número)
  if (!number) {
    const match3 = withoutPrefix.match(/^([A-Z]{2})-(\d{3,6})$/);
    if (match3) {
      uf = match3[1];
      number = match3[2];
    }
  }
  
  // Formato 4: 1SP272142 (categoria + UF + número) - NOVO
  if (!number) {
    const match4 = withoutPrefix.match(/^(\d)?([A-Z]{2})(\d{4,6})$/);
    if (match4) {
      uf = match4[2];
      number = match4[3];
    }
  }
  
  // Formato 5: SP272142 (UF + número junto) - NOVO
  if (!number) {
    const match5 = withoutPrefix.match(/^([A-Z]{2})(\d{4,6})$/);
    if (match5) {
      uf = match5[1];
      number = match5[2];
    }
  }
  
  // Formato 6: Apenas números (assume SP se não especificado)
  if (!number) {
    const match6 = withoutPrefix.match(/^(\d{5,8})$/);
    if (match6) {
      number = match6[1];
      // Não validamos sem UF, usuário deve fornecer
      return { 
        isValid: false, 
        formatted: null, 
        uf: null, 
        number, 
        error: 'Informe a UF. Ex: 12345/O-SP ou 1SP272142' 
      };
    }
  }
  
  if (!number || !uf) {
    return { 
      isValid: false, 
      formatted: null, 
      uf: null, 
      number: null, 
      error: 'Formato inválido. Exemplos: 12345/O-SP, SP-12345, 1SP272142' 
    };
  }
  
  if (!VALID_UFS.includes(uf)) {
    return { 
      isValid: false, 
      formatted: null, 
      uf, 
      number, 
      error: `UF inválida: ${uf}. Use uma UF válida.` 
    };
  }
  
  // Valida tamanho do número (3 a 8 dígitos para cobrir todos os formatos)
  if (number.length < 3 || number.length > 8) {
    return { 
      isValid: false, 
      formatted: null, 
      uf, 
      number, 
      error: 'Número do CRC deve ter entre 3 e 8 dígitos' 
    };
  }
  
  // Formato padrão de saída
  const formatted = `${number}/O-${uf}`;
  
  return { isValid: true, formatted, uf, number };
}

const ContadorOnboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingCRC, setIsValidatingCRC] = useState(false);
  const [crcValidation, setCrcValidation] = useState<CRCValidation | null>(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [data, setData] = useState<OnboardingData>({
    crc_number: '',
    specialty: '',
    bio: '',
    hourly_rate: '150',
    certificate_rate: String(CERTIFICATE_PRICE),
    available: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>();

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

  // Validação do CRC em tempo real com formatação automática
  const handleCRCChange = async (value: string) => {
    const formattedValue = formatCRCInput(value);
    setData({ ...data, crc_number: formattedValue });
    
    if (formattedValue.trim().length >= 5) {
      setIsValidatingCRC(true);
      // Simula delay de validação (em produção, isso poderia consultar API do CFC)
      await new Promise(resolve => setTimeout(resolve, 300));
      const validation = validateCRC(formattedValue);
      setCrcValidation(validation);
      setIsValidatingCRC(false);
    } else {
      setCrcValidation(null);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      const crcVal = validateCRC(data.crc_number);
      if (!crcVal.isValid) {
        newErrors.crc_number = crcVal.error || 'CRC inválido';
      }
      if (selectedSpecialties.length === 0) {
        newErrors.specialty = 'Selecione pelo menos uma especialidade';
      }
    }

    if (step === 2) {
      if (!data.bio.trim()) {
        newErrors.bio = 'Biografia é obrigatória';
      } else if (data.bio.length < BIO_MIN_LENGTH) {
        newErrors.bio = `Biografia deve ter pelo menos ${BIO_MIN_LENGTH} caracteres`;
      } else if (data.bio.length > BIO_MAX_LENGTH) {
        newErrors.bio = `Biografia deve ter no máximo ${BIO_MAX_LENGTH} caracteres`;
      } else {
        const bioValidation = validateBioContent(data.bio);
        if (!bioValidation.isValid) {
          newErrors.bio = bioValidation.error || 'Biografia inválida';
        }
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
        const crcVal = validateCRC(data.crc_number);
        return crcVal.isValid && selectedSpecialties.length > 0;
      case 2:
        return data.bio.trim().length >= BIO_MIN_LENGTH && data.bio.length <= BIO_MAX_LENGTH && validateBioContent(data.bio).isValid;
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
      const crcVal = validateCRC(data.crc_number);
      
      const profileData = {
        user_id: user.id,
        crc_number: crcVal.formatted || data.crc_number.trim(),
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

      // Refresh user data to update roles in context

      toast({
        title: 'Perfil criado com sucesso!',
        description: 'Bem-vindo ao painel do contador',
      });

      // Small delay to ensure database changes are committed, then navigate
      setTimeout(() => {
        window.location.href = '/contador';
      }, 500);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao salvar perfil',
      });
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
    <OnboardingLayoutPremium
      title="Bem-vindo ao AtentAI"
      subtitle="Configure seu perfil profissional para começar a atender"
      icon={Calculator}
      iconColor="from-primary to-emerald-500"
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
              <div className="relative">
                <Input
                  value={data.crc_number}
                  onChange={(e) => handleCRCChange(e.target.value)}
                  placeholder="12345/O-SP"
                  className={`pr-10 ${crcValidation?.isValid === true ? 'border-green-500' : crcValidation?.isValid === false ? 'border-destructive' : ''}`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isValidatingCRC && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {!isValidatingCRC && crcValidation?.isValid === true && <Check className="h-4 w-4 text-green-500" />}
                  {!isValidatingCRC && crcValidation?.isValid === false && <X className="h-4 w-4 text-destructive" />}
                </div>
              </div>
              {crcValidation?.isValid === false && (
                <p className="text-sm text-destructive">{crcValidation.error}</p>
              )}
              {crcValidation?.isValid === true && (
                <p className="text-sm text-green-600">
                  CRC válido: {crcValidation.formatted} ({crcValidation.uf})
                </p>
              )}
              {errors?.crc_number && !crcValidation && (
                <p className="text-sm text-destructive">{errors.crc_number}</p>
              )}
              <div className="bg-muted/50 rounded-lg p-3 border border-border">
                <p className="text-xs font-medium text-foreground mb-2">Formatos aceitos:</p>
                <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  <span>• 12345/O-SP</span>
                  <span>• SP-12345</span>
                  <span>• 1SP272142</span>
                  <span>• SP272142</span>
                  <span>• CRC/SP-12345</span>
                  <span>• 12345-SP</span>
                </div>
              </div>
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
              {errors?.specialty && (
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
              <div className="flex justify-between items-center">
                <Label>Sua Biografia *</Label>
                <span className={`text-xs ${data.bio.length > BIO_MAX_LENGTH ? 'text-destructive' : data.bio.length >= BIO_MIN_LENGTH ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {data.bio.length}/{BIO_MAX_LENGTH}
                </span>
              </div>
              <Textarea
                value={data.bio}
                onChange={(e) => {
                  if (e.target.value.length <= BIO_MAX_LENGTH + 50) { // Allow slight overage for UX
                    setData({ ...data, bio: e.target.value });
                  }
                }}
                placeholder="Descreva sua experiência profissional, formação e como você pode ajudar seus clientes..."
                className={`min-h-[150px] ${data.bio.length > BIO_MAX_LENGTH || (data.bio.length >= BIO_MIN_LENGTH && !validateBioContent(data.bio).isValid) ? 'border-destructive' : ''}`}
                maxLength={BIO_MAX_LENGTH + 50}
              />
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  {data.bio.length < BIO_MIN_LENGTH ? (
                    <p className="text-xs text-muted-foreground">Mínimo {BIO_MIN_LENGTH} caracteres (faltam {BIO_MIN_LENGTH - data.bio.length})</p>
                  ) : data.bio.length > BIO_MAX_LENGTH ? (
                    <p className="text-xs text-destructive">Excedeu o limite em {data.bio.length - BIO_MAX_LENGTH} caracteres</p>
                  ) : !validateBioContent(data.bio).isValid ? (
                    <p className="text-xs text-destructive flex items-center gap-1"><X className="h-3 w-3" /> {validateBioContent(data.bio).error}</p>
                  ) : (
                    <p className="text-xs text-green-600 flex items-center gap-1"><Check className="h-3 w-3" /> Biografia válida</p>
                  )}
                </div>
                {errors?.bio && (
                  <p className="text-sm text-destructive">{errors.bio}</p>
                )}
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
              {errors?.hourly_rate && (
                <p className="text-sm text-destructive">{errors.hourly_rate}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Taxa da plataforma: 10% sobre cada consulta
              </p>
            </div>

            {/* Valor por Certidão */}
            <Alert className="bg-emerald-500/10 border-emerald-500/30">
              <FileText className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-foreground">
                <strong>Emissão de Certidões:</strong> Você receberá{' '}
                <span className="font-bold text-emerald-600">R$ {CERTIFICATE_PRICE.toFixed(2)}</span>{' '}
                por cada certidão emitida através da plataforma.
              </AlertDescription>
            </Alert>

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
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Consulta:</strong>{' '}
                    R$ {parseFloat(data.hourly_rate || '0').toFixed(2)} →{' '}
                    <span className="font-bold text-primary">
                      R$ {(parseFloat(data.hourly_rate || '0') * 0.9).toFixed(2)}
                    </span>{' '}
                    líquido (taxa 10%)
                  </p>
                  <p>
                    <strong className="text-foreground">Certidão:</strong>{' '}
                    R$ {CERTIFICATE_PRICE.toFixed(2)} →{' '}
                    <span className="font-bold text-emerald-600">
                      R$ {(CERTIFICATE_PRICE * 0.9).toFixed(2)}
                    </span>{' '}
                    líquido (taxa 10%)
                  </p>
                </div>
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
                <span className="font-medium text-foreground flex items-center gap-2">
                  {crcValidation?.formatted || data.crc_number}
                  {crcValidation?.isValid && <Check className="h-4 w-4 text-green-500" />}
                </span>
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
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Valor por certidão</span>
                <span className="font-medium text-emerald-600">
                  R$ {CERTIFICATE_PRICE.toFixed(2)}
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
              <p className="text-sm font-medium text-foreground mb-1">Biografia:</p>
              <p className="text-sm text-muted-foreground">
                {data.bio.substring(0, 200)}
                {data.bio.length > 200 && '...'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {data.bio.length} caracteres
              </p>
            </CardContent>
          </Card>

          <Alert className="bg-blue-500/10 border-blue-500/30">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-foreground text-sm">
              Ao confirmar, você concorda com os termos de uso da plataforma e está ciente que seu CRC será verificado para garantir a conformidade com o Conselho Federal de Contabilidade.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </OnboardingLayoutPremium>
  );
};

export default ContadorOnboarding;
