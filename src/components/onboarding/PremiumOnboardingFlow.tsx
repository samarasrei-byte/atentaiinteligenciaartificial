import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MaskedInput } from '@/components/ui/masked-input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  User, Building2, FileText, CheckCircle, 
  ArrowRight, ArrowLeft, Loader2, Shield,
  Brain, Scale, Sparkles, MessageCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export type OnboardingServiceType = 'bi-contabilidade' | 'analise-fiscal' | 'abertura-empresa' | 'ir';

interface ServiceConfig {
  id: OnboardingServiceType;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
  responsible: 'cesar' | 'guilherme';
  chatUrl: string;
  steps: StepConfig[];
}

interface StepConfig {
  id: string;
  title: string;
  icon: React.ElementType;
}

const SERVICE_CONFIGS: Record<OnboardingServiceType, ServiceConfig> = {
  'bi-contabilidade': {
    id: 'bi-contabilidade',
    title: 'BI+ Contabilidade',
    subtitle: 'Inteligência financeira completa',
    icon: Brain,
    gradient: 'from-purple-500 to-pink-600',
    responsible: 'cesar',
    chatUrl: '/chat/cesar?servico=bi-contabilidade',
    steps: [
      { id: 'personal', title: 'Identificação', icon: User },
      { id: 'business', title: 'Empresa', icon: Building2 },
      { id: 'context', title: 'Contexto', icon: FileText },
      { id: 'confirm', title: 'Confirmação', icon: CheckCircle },
    ],
  },
  'analise-fiscal': {
    id: 'analise-fiscal',
    title: 'Análise Fiscal',
    subtitle: 'Recuperação de créditos tributários',
    icon: Scale,
    gradient: 'from-blue-500 to-indigo-600',
    responsible: 'guilherme',
    chatUrl: '/chat/guilherme?servico=analise-fiscal',
    steps: [
      { id: 'personal', title: 'Identificação', icon: User },
      { id: 'business', title: 'Empresa', icon: Building2 },
      { id: 'context', title: 'Contexto', icon: FileText },
      { id: 'confirm', title: 'Confirmação', icon: CheckCircle },
    ],
  },
  'abertura-empresa': {
    id: 'abertura-empresa',
    title: 'Abertura de Empresa',
    subtitle: 'CNPJ completo com suporte contábil',
    icon: Building2,
    gradient: 'from-amber-500 to-orange-600',
    responsible: 'guilherme',
    chatUrl: '/chat/guilherme?servico=abertura-empresa',
    steps: [
      { id: 'personal', title: 'Identificação', icon: User },
      { id: 'business', title: 'Atividade', icon: Building2 },
      { id: 'context', title: 'Detalhes', icon: FileText },
      { id: 'confirm', title: 'Confirmação', icon: CheckCircle },
    ],
  },
  'ir': {
    id: 'ir',
    title: 'Declaração IR',
    subtitle: 'Imposto de Renda com especialistas',
    icon: FileText,
    gradient: 'from-rose-500 to-red-600',
    responsible: 'guilherme',
    chatUrl: '/chat/guilherme?servico=ir',
    steps: [
      { id: 'personal', title: 'Identificação', icon: User },
      { id: 'income', title: 'Rendimentos', icon: FileText },
      { id: 'confirm', title: 'Confirmação', icon: CheckCircle },
    ],
  },
};

interface PremiumOnboardingFlowProps {
  serviceType: OnboardingServiceType;
  onComplete?: (requestId: string) => void;
  className?: string;
}

export const PremiumOnboardingFlow: React.FC<PremiumOnboardingFlowProps> = ({
  serviceType,
  onComplete,
  className = '',
}) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  
  const config = SERVICE_CONFIGS[serviceType];
  const totalSteps = config.steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Form data
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    cpf: '',
    companyName: '',
    cnpj: '',
    taxRegime: '',
    annualRevenue: '',
    painPoints: '',
    urgency: 'normal',
    notes: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    const step = config.steps[currentStep];
    
    if (step.id === 'personal') {
      return formData.fullName && formData.email && formData.phone;
    }
    if (step.id === 'business') {
      return formData.companyName || formData.cnpj;
    }
    if (step.id === 'confirm') {
      return lgpdAccepted;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!lgpdAccepted) {
      toast.error('Aceite os termos para continuar');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create request in database
      const requestData = {
        user_id: user?.id || null,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        cpf: formData.cpf || null,
        company_name: formData.companyName || formData.fullName,
        cnpj: formData.cnpj || null,
        tax_regime: formData.taxRegime || 'a_definir',
        annual_revenue_cents: parseInt(formData.annualRevenue.replace(/\D/g, '')) * 100 || 0,
        status: 'pending',
        notes: JSON.stringify({
          painPoints: formData.painPoints,
          urgency: formData.urgency,
          notes: formData.notes,
          source: `onboarding-${serviceType}`,
          lgpdAcceptedAt: new Date().toISOString(),
        }),
      };

      const { data: request, error } = await supabase
        .from('fiscal_analysis_requests')
        .insert(requestData)
        .select()
        .single();

      if (error) throw error;

      // Create notification for responsible
      await supabase.from('service_notifications').insert({
        user_id: user?.id || null,
        title: `🆕 Nova Solicitação: ${config.title}`,
        message: `${formData.fullName} enviou uma solicitação de ${config.title}`,
        notification_type: 'service_created',
        service_type: serviceType,
        metadata: {
          requestId: request.id,
          responsible: config.responsible,
          clientName: formData.fullName,
          clientEmail: formData.email,
        },
      });

      toast.success('Solicitação enviada com sucesso!');
      
      onComplete?.(request.id);
      
      // Redirect to chat
      navigate(`${config.chatUrl}&request=${request.id}`);
    } catch (error: any) {
      console.error('Onboarding submit error:', error);
      toast.error('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const Icon = config.icon;
  const StepIcon = config.steps[currentStep].icon;

  return (
    <div className={`min-h-screen bg-gradient-to-b from-slate-50 to-white ${className}`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${config.gradient} py-8 px-4`}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Icon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{config.title}</h1>
              <p className="text-white/80">{config.subtitle}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-white/80 text-sm">
              <span>Etapa {currentStep + 1} de {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/20" />
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-between mt-6">
            {config.steps.map((step, index) => {
              const StepIconItem = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div key={step.id} className="flex flex-col items-center gap-2">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted 
                      ? 'bg-white text-emerald-600' 
                      : isActive 
                        ? 'bg-white/20 text-white ring-2 ring-white' 
                        : 'bg-white/10 text-white/50'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <StepIconItem className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`text-xs ${isActive ? 'text-white' : 'text-white/60'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-lg">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient}`}>
                    <StepIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">{config.steps[currentStep].title}</h2>
                    <p className="text-sm text-muted-foreground">
                      Preencha as informações abaixo
                    </p>
                  </div>
                </div>

                {/* Step Content */}
                {config.steps[currentStep].id === 'personal' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor="fullName">Nome Completo *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">WhatsApp *</Label>
                      <MaskedInput
                        id="phone"
                        mask="phone"
                        value={formData.phone}
                        onChange={(value) => updateField('phone', value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <MaskedInput
                        id="cpf"
                        mask="cpf"
                        value={formData.cpf}
                        onChange={(value) => updateField('cpf', value)}
                      />
                    </div>
                  </div>
                )}

                {config.steps[currentStep].id === 'business' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor="companyName">Nome da Empresa</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => updateField('companyName', e.target.value)}
                        placeholder="Razão Social ou Nome Fantasia"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <MaskedInput
                        id="cnpj"
                        mask="cnpj"
                        value={formData.cnpj}
                        onChange={(value) => updateField('cnpj', value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxRegime">Regime Tributário</Label>
                      <select
                        id="taxRegime"
                        value={formData.taxRegime}
                        onChange={(e) => updateField('taxRegime', e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      >
                        <option value="">Selecione...</option>
                        <option value="mei">MEI</option>
                        <option value="simples">Simples Nacional</option>
                        <option value="lucro_presumido">Lucro Presumido</option>
                        <option value="lucro_real">Lucro Real</option>
                        <option value="nao_sei">Não sei</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor="annualRevenue">Faturamento Anual Aproximado</Label>
                      <Input
                        id="annualRevenue"
                        value={formData.annualRevenue}
                        onChange={(e) => updateField('annualRevenue', e.target.value)}
                        placeholder="Ex: R$ 500.000"
                      />
                    </div>
                  </div>
                )}

                {config.steps[currentStep].id === 'context' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="painPoints">Principais Dores / Necessidades</Label>
                      <Textarea
                        id="painPoints"
                        value={formData.painPoints}
                        onChange={(e) => updateField('painPoints', e.target.value)}
                        placeholder="Descreva suas principais dificuldades ou o que espera do serviço..."
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Urgência</Label>
                      <div className="flex gap-2">
                        {[
                          { value: 'baixa', label: 'Baixa' },
                          { value: 'normal', label: 'Normal' },
                          { value: 'alta', label: 'Alta' },
                          { value: 'urgente', label: 'Urgente' },
                        ].map((option) => (
                          <Button
                            key={option.value}
                            type="button"
                            variant={formData.urgency === option.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateField('urgency', option.value)}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Observações Adicionais</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => updateField('notes', e.target.value)}
                        placeholder="Informações extras que possam ajudar..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {(config.steps[currentStep].id === 'income') && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="painPoints">Fontes de Renda</Label>
                      <Textarea
                        id="painPoints"
                        value={formData.painPoints}
                        onChange={(e) => updateField('painPoints', e.target.value)}
                        placeholder="Descreva suas fontes de renda (CLT, autônomo, investimentos, aluguéis...)"
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Observações sobre a Declaração</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => updateField('notes', e.target.value)}
                        placeholder="Possui investimentos? Imóveis? Dependentes?"
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {config.steps[currentStep].id === 'confirm' && (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                      <h3 className="font-semibold">Resumo da Solicitação</h3>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nome:</span>
                          <span className="font-medium">{formData.fullName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">E-mail:</span>
                          <span className="font-medium">{formData.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">WhatsApp:</span>
                          <span className="font-medium">{formData.phone}</span>
                        </div>
                        {formData.companyName && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Empresa:</span>
                            <span className="font-medium">{formData.companyName}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Serviço:</span>
                          <Badge className={`bg-gradient-to-r ${config.gradient}`}>
                            {config.title}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Human Guarantee */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-6 w-6 text-emerald-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-emerald-800">
                            ATENDIMENTO HUMANO GARANTIDO
                          </p>
                          <p className="text-sm text-emerald-700 mt-1">
                            Um especialista real vai analisar sua solicitação e entrar em contato.
                            Nada é automático.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* LGPD */}
                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                      <Checkbox 
                        id="lgpd" 
                        checked={lgpdAccepted}
                        onCheckedChange={(checked) => setLgpdAccepted(checked === true)}
                      />
                      <label htmlFor="lgpd" className="text-sm text-muted-foreground cursor-pointer">
                        Concordo com o tratamento dos meus dados conforme a{' '}
                        <a href="/politica-privacidade" className="text-primary underline" target="_blank">
                          Política de Privacidade (LGPD)
                        </a>
                      </label>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </Button>

                  {currentStep < totalSteps - 1 ? (
                    <Button
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className={`gap-2 bg-gradient-to-r ${config.gradient}`}
                    >
                      Próximo
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !lgpdAccepted}
                      className={`gap-2 bg-gradient-to-r ${config.gradient}`}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <MessageCircle className="h-4 w-4" />
                          Enviar e Abrir Chat
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PremiumOnboardingFlow;
