import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle, 
  CreditCard, 
  Landmark, 
  ShoppingCart,
  HelpCircle,
  Phone,
  User,
  Shield,
  Handshake,
  Heart,
  Building2,
  FileText,
  Scale,
  Sparkles,
  MessageCircle,
  Clock,
  Star
} from "lucide-react";
import { MaskedInput } from "@/components/ui/masked-input";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Tipos de serviço
type ServiceType = 'limpa-nome' | 'fiscal';

// Tipos de dívida para Limpa Nome
const debtTypes = [
  { id: 'bank', label: 'Dívida bancária', icon: Landmark, description: 'Cheque especial, conta corrente' },
  { id: 'credit_card', label: 'Cartão de crédito', icon: CreditCard, description: 'Fatura em atraso' },
  { id: 'loan', label: 'Empréstimo', icon: ShoppingCart, description: 'Pessoal ou consignado' },
  { id: 'other', label: 'Outras pendências', icon: HelpCircle, description: 'Lojas, serviços, etc.' },
];

// Regimes tributários para Fiscal
const taxRegimes = [
  { id: 'simples', label: 'Simples Nacional', icon: Building2, description: 'Micro e pequenas empresas' },
  { id: 'presumido', label: 'Lucro Presumido', icon: Scale, description: 'Médias empresas' },
  { id: 'real', label: 'Lucro Real', icon: FileText, description: 'Grandes empresas' },
];

const steps = [
  { id: 1, title: 'Boas-vindas' },
  { id: 2, title: 'Seus dados' },
  { id: 3, title: 'Detalhes' },
  { id: 4, title: 'Confirmação' },
];

// Parceiro fixo para simulação
const PARTNER_INFO = {
  name: 'Guilherme Barros',
  role: 'Especialista em Recuperação',
  specialty: 'Limpa Nome e Análise Fiscal',
  avatar: null,
  message: 'Olá! Sou o Guilherme Barros, parceiro certificado da AtentAI. Vou analisar pessoalmente seu caso e acompanhar todo o processo. Conte comigo!'
};

export default function PartnerOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // Parâmetros da URL
  const serviceType = (searchParams.get('service') || 'limpa-nome') as ServiceType;
  const planParam = searchParams.get('plan');
  const selectedPlan = (planParam === 'pj' ? 'pj' : 'pf') as 'pf' | 'pj';
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    cnpj: '',
    email: '',
    whatsapp: '',
    companyName: '',
    // Limpa Nome específico
    debtTypes: [] as string[],
    // Fiscal específico
    taxRegime: '',
    annualRevenue: '',
  });

  const progress = (currentStep / steps.length) * 100;
  const isLimpaNome = serviceType === 'limpa-nome';
  const isFiscal = serviceType === 'fiscal';

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDebtType = (debtId: string) => {
    setFormData(prev => ({
      ...prev,
      debtTypes: prev.debtTypes.includes(debtId)
        ? prev.debtTypes.filter(d => d !== debtId)
        : [...prev.debtTypes, debtId]
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    
    try {
      // GUILHERME BARROS - Parceiro único centralizado para todos os serviços
      const GUILHERME_PARTNER_ID = 'df40dfff-62bd-4b66-88bd-c811cd90d78d';
      
      const partnerId = GUILHERME_PARTNER_ID;
      const userId = user?.id || null;

      if (isLimpaNome) {
        // Criar solicitação Limpa Nome
        const { data: request, error } = await supabase
          .from('credit_repair_requests')
          .insert({
            user_id: userId,
            partner_id: partnerId,
            full_name: formData.name,
            cpf: formData.cpf.replace(/\D/g, ''),
            phone: formData.whatsapp.replace(/\D/g, ''),
            email: formData.email || null,
            debt_amount_cents: 0,
            debt_description: formData.debtTypes.join(', '),
            status: 'pending',
            payment_status: 'pending',
            service_price_cents: selectedPlan === 'pj' ? 97000 : 78000,
            final_price_cents: selectedPlan === 'pj' ? 97000 : 78000,
          })
          .select()
          .single();

        if (error) throw error;

        // Criar mensagem automática do parceiro
        if (request && partnerId && userId) {
          // Buscar user_id do parceiro
          const { data: partnerUser } = await supabase
            .from('credit_repair_partner_users')
            .select('user_id')
            .eq('partner_id', partnerId)
            .eq('is_primary', true)
            .single();

          if (partnerUser) {
            await supabase.from('credit_repair_chat_messages').insert({
              request_id: request.id,
              sender_id: partnerUser.user_id,
              receiver_id: userId,
              content: PARTNER_INFO.message,
            });
          }
        }

        toast({
          title: '🎉 Solicitação criada!',
          description: 'Um parceiro foi conectado ao seu caso.',
        });

        navigate('/minhas-solicitacoes');
      } else {
        // Criar solicitação Fiscal
        const { data: request, error } = await supabase
          .from('fiscal_analysis_requests')
          .insert({
            user_id: userId,
            partner_id: partnerId,
            full_name: formData.name,
            email: formData.email,
            phone: formData.whatsapp.replace(/\D/g, ''),
            cpf: formData.cpf?.replace(/\D/g, '') || null,
            cnpj: formData.cnpj.replace(/\D/g, ''),
            company_name: formData.companyName,
            tax_regime: formData.taxRegime,
            annual_revenue_cents: parseInt(formData.annualRevenue.replace(/\D/g, '') || '0') * 100,
            status: 'pending',
            payment_status: 'pending',
          })
          .select()
          .single();

        if (error) throw error;

        toast({
          title: '📊 Análise solicitada!',
          description: 'Um especialista irá analisar seu caso.',
        });

        navigate('/minhas-solicitacoes');
      }
    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: 'Erro ao criar solicitação',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getServiceConfig = () => {
    if (isLimpaNome) {
      return {
        title: 'Limpa Nome',
        color: 'from-rose-500 to-pink-600',
        bgColor: 'from-rose-500/20 to-pink-500/20',
        icon: Shield,
        iconColor: 'text-rose-500',
      };
    }
    return {
      title: 'Módulo Fiscal',
      color: 'from-emerald-500 to-green-600',
      bgColor: 'from-emerald-500/20 to-green-500/20',
      icon: Scale,
      iconColor: 'text-emerald-500',
    };
  };

  const config = getServiceConfig();
  const ServiceIcon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <img src="/logo-atentai.png" alt="AtentAI" className="h-8" />
            <Badge variant="outline" className="text-xs">
              <ServiceIcon className={`h-3 w-3 mr-1 ${config.iconColor}`} />
              {config.title}
            </Badge>
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <Users className="h-3 w-3 mr-1" />
            Conexão com Parceiro
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl">
          {/* Transition Message */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <p className="text-muted-foreground">
                Estamos te conectando a um parceiro especializado
              </p>
              <p className="text-sm text-muted-foreground">
                Isso leva menos de 2 minutos.
              </p>
            </motion.div>
          )}

          {/* Progress Card */}
          <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden">
            {/* Progress Header */}
            <div className={`bg-gradient-to-r ${config.bgColor} p-6 border-b border-border`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ServiceIcon className={`h-5 w-5 ${config.iconColor}`} />
                  <span className="font-medium text-foreground">
                    {config.title} {isLimpaNome && (selectedPlan === 'pj' ? '(CNPJ)' : '(CPF)')}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Passo {currentStep} de {steps.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              
              {/* Step Indicators */}
              <div className="flex justify-between mt-6">
                {steps.map((step) => (
                  <div 
                    key={step.id}
                    className={`flex flex-col items-center ${
                      step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      step.id < currentStep 
                        ? 'bg-primary text-primary-foreground' 
                        : step.id === currentStep 
                          ? 'bg-primary/20 text-primary border-2 border-primary'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {step.id < currentStep ? <CheckCircle className="h-5 w-5" /> : step.id}
                    </div>
                    <span className="text-xs mt-2 font-medium hidden sm:block">{step.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {/* Step 1 - Welcome */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="text-center">
                      <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${config.bgColor} flex items-center justify-center`}>
                        <Handshake className={`h-12 w-12 ${config.iconColor}`} />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                        {isLimpaNome ? 'Vamos limpar seu nome juntos' : 'Vamos otimizar seus impostos'}
                      </h2>
                      <p className="text-lg text-muted-foreground max-w-md mx-auto">
                        Um <strong className="text-foreground">parceiro humano especializado</strong> irá 
                        analisar seu caso <strong className="text-foreground">pessoalmente</strong>.
                      </p>
                    </div>

                    {/* Partner Preview */}
                    <div className="max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-14 w-14 border-2 border-primary/30">
                          <AvatarFallback className="bg-primary/20 text-primary text-lg font-bold">
                            GM
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{PARTNER_INFO.name}</p>
                          <p className="text-sm text-muted-foreground">{PARTNER_INFO.role}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">5.0</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground italic">
                        "{PARTNER_INFO.message}"
                      </p>
                    </div>

                    <div className="grid gap-4 max-w-md mx-auto">
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
                        <div className="p-3 rounded-full bg-primary/20">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Análise humana personalizada</p>
                          <p className="text-sm text-muted-foreground">Nenhuma decisão automática</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
                        <div className="p-3 rounded-full bg-green-500/20">
                          <MessageCircle className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Chat direto com seu parceiro</p>
                          <p className="text-sm text-muted-foreground">Comunicação em tempo real</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
                        <div className="p-3 rounded-full bg-amber-500/20">
                          <Clock className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Acompanhamento em tempo real</p>
                          <p className="text-sm text-muted-foreground">Status sempre atualizado</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center pt-4">
                      <Button 
                        onClick={nextStep}
                        size="lg"
                        className={`h-14 px-12 text-lg bg-gradient-to-r ${config.color} hover:opacity-90`}
                      >
                        Iniciar conexão
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2 - Basic Data */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                        <User className="h-10 w-10 text-blue-500" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        Seus dados básicos
                      </h2>
                      <p className="text-muted-foreground">
                        Precisamos de algumas informações para conectar você ao parceiro certo.
                      </p>
                    </div>

                    <div className="max-w-md mx-auto space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome completo</Label>
                        <Input
                          id="name"
                          placeholder="Seu nome completo"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="h-12"
                        />
                      </div>

                      {isLimpaNome && (
                        <div className="space-y-2">
                          <Label htmlFor="cpf">{selectedPlan === 'pj' ? 'CNPJ' : 'CPF'}</Label>
                          <MaskedInput
                            id="cpf"
                            mask={selectedPlan === 'pj' ? 'cnpj' : 'cpf'}
                            value={formData.cpf}
                            onChange={(value) => handleInputChange('cpf', value)}
                            className="h-12"
                            showValidation={true}
                          />
                        </div>
                      )}

                      {isFiscal && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="companyName">Nome da Empresa</Label>
                            <Input
                              id="companyName"
                              placeholder="Razão social"
                              value={formData.companyName}
                              onChange={(e) => handleInputChange('companyName', e.target.value)}
                              className="h-12"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cnpj">CNPJ</Label>
                            <MaskedInput
                              id="cnpj"
                              mask="cnpj"
                              value={formData.cnpj}
                              onChange={(value) => handleInputChange('cnpj', value)}
                              className="h-12"
                              showValidation={true}
                            />
                          </div>
                        </>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                          <MaskedInput
                            id="whatsapp"
                            mask="phone"
                            value={formData.whatsapp}
                            onChange={(value) => handleInputChange('whatsapp', value)}
                            className="h-12 pl-12"
                            showValidation={true}
                          />
                        </div>
                      </div>

                      <p className="text-xs text-center text-muted-foreground pt-2">
                        🔒 Dados protegidos e usados apenas para seu atendimento.
                      </p>
                    </div>

                    <div className="flex gap-4 justify-center pt-4">
                      <Button 
                        onClick={prevStep}
                        variant="outline"
                        size="lg"
                        className="h-12 px-6"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                      </Button>
                      <Button 
                        onClick={nextStep}
                        disabled={!formData.name || !formData.whatsapp || (isFiscal && (!formData.cnpj || !formData.companyName))}
                        size="lg"
                        className={`h-12 px-8 bg-gradient-to-r ${config.color} hover:opacity-90`}
                      >
                        Continuar
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3 - Details */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="text-center">
                      <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${config.bgColor} flex items-center justify-center`}>
                        <ServiceIcon className={`h-10 w-10 ${config.iconColor}`} />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        {isLimpaNome ? 'Situação do seu nome' : 'Detalhes da empresa'}
                      </h2>
                      <p className="text-muted-foreground">
                        {isLimpaNome 
                          ? 'Selecione os tipos de pendência para análise personalizada.'
                          : 'Informe o regime tributário da sua empresa.'
                        }
                      </p>
                    </div>

                    {isLimpaNome ? (
                      <div className="grid gap-4 max-w-lg mx-auto">
                        {debtTypes.map((debt) => {
                          const Icon = debt.icon;
                          const isSelected = formData.debtTypes.includes(debt.id);
                          return (
                            <button
                              key={debt.id}
                              onClick={() => toggleDebtType(debt.id)}
                              className={`
                                w-full p-5 rounded-xl border-2 text-left transition-all
                                ${isSelected 
                                  ? 'border-primary bg-primary/10 shadow-lg' 
                                  : 'border-border hover:border-primary/50 bg-card hover:shadow-md'
                                }
                              `}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${isSelected ? 'bg-primary/20' : 'bg-muted'}`}>
                                  <Icon className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-foreground">{debt.label}</p>
                                  <p className="text-sm text-muted-foreground">{debt.description}</p>
                                </div>
                                {isSelected && (
                                  <CheckCircle className="h-6 w-6 text-primary" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="max-w-lg mx-auto space-y-6">
                        <div className="grid gap-4">
                          {taxRegimes.map((regime) => {
                            const Icon = regime.icon;
                            const isSelected = formData.taxRegime === regime.id;
                            return (
                              <button
                                key={regime.id}
                                onClick={() => handleInputChange('taxRegime', regime.id)}
                                className={`
                                  w-full p-5 rounded-xl border-2 text-left transition-all
                                  ${isSelected 
                                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg' 
                                    : 'border-border hover:border-emerald-500/50 bg-card hover:shadow-md'
                                  }
                                `}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`p-3 rounded-xl ${isSelected ? 'bg-emerald-500/20' : 'bg-muted'}`}>
                                    <Icon className={`h-6 w-6 ${isSelected ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-foreground">{regime.label}</p>
                                    <p className="text-sm text-muted-foreground">{regime.description}</p>
                                  </div>
                                  {isSelected && (
                                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="annualRevenue">Faturamento Anual Aproximado</Label>
                          <Input
                            id="annualRevenue"
                            placeholder="R$ 0,00"
                            value={formData.annualRevenue}
                            onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                            className="h-12"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 justify-center pt-4">
                      <Button 
                        onClick={prevStep}
                        variant="outline"
                        size="lg"
                        className="h-12 px-6"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                      </Button>
                      <Button 
                        onClick={nextStep}
                        disabled={isLimpaNome ? formData.debtTypes.length === 0 : !formData.taxRegime}
                        size="lg"
                        className={`h-12 px-8 bg-gradient-to-r ${config.color} hover:opacity-90`}
                      >
                        Continuar
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4 - Confirmation */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                        <Sparkles className="h-12 w-12 text-green-500" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                        Tudo pronto!
                      </h2>
                      <p className="text-lg text-muted-foreground max-w-md mx-auto">
                        Seu parceiro está pronto para iniciar a análise do seu caso.
                      </p>
                    </div>

                    {/* Partner Card */}
                    <div className="max-w-md mx-auto">
                      <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4 mb-6">
                            <Avatar className="h-16 w-16 border-2 border-green-500/30">
                              <AvatarFallback className="bg-green-500/20 text-green-600 text-xl font-bold">
                                GM
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-lg text-foreground">{PARTNER_INFO.name}</p>
                              <p className="text-sm text-muted-foreground">{PARTNER_INFO.specialty}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-sm">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span className="text-foreground">Análise personalizada do seu caso</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span className="text-foreground">Chat direto para dúvidas</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span className="text-foreground">Acompanhamento em tempo real</span>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-muted/50 border border-border">
                            <p className="text-sm text-muted-foreground italic">
                              "{PARTNER_INFO.message}"
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Summary */}
                    <div className="max-w-md mx-auto p-4 rounded-xl bg-muted/30 border border-border">
                      <p className="text-sm font-medium text-foreground mb-2">Resumo da sua solicitação:</p>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><strong>Serviço:</strong> {config.title}</p>
                        <p><strong>Nome:</strong> {formData.name}</p>
                        {isLimpaNome && (
                          <p><strong>Pendências:</strong> {formData.debtTypes.map(d => debtTypes.find(dt => dt.id === d)?.label).join(', ')}</p>
                        )}
                        {isFiscal && (
                          <>
                            <p><strong>Empresa:</strong> {formData.companyName}</p>
                            <p><strong>Regime:</strong> {taxRegimes.find(r => r.id === formData.taxRegime)?.label}</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4 justify-center pt-4">
                      <Button 
                        onClick={prevStep}
                        variant="outline"
                        size="lg"
                        className="h-12 px-6"
                        disabled={isSubmitting}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                      </Button>
                      <Button 
                        onClick={handleFinish}
                        disabled={isSubmitting}
                        size="lg"
                        className={`h-14 px-10 text-lg bg-gradient-to-r ${config.color} hover:opacity-90`}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Conectando...
                          </>
                        ) : (
                          <>
                            Conectar ao parceiro
                            <ArrowRight className="h-5 w-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
