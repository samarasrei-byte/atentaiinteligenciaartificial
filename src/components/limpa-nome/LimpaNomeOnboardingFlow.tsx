import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { MaskedInput } from '@/components/ui/masked-input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  ArrowRight, 
  ArrowLeft,
  Shield,
  CheckCircle,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LimpaNomeOnboardingFlowProps {
  requestId: string;
  prefillEmail?: string;
  prefillName?: string;
  onComplete: (userId: string) => void;
}

interface OnboardingData {
  fullName: string;
  cpf: string;
  birthDate: string;
  email: string;
  phone: string;
  password: string;
}

const steps = [
  { id: 1, title: 'Seus dados', icon: User },
  { id: 2, title: 'Criar acesso', icon: Lock },
];

export function LimpaNomeOnboardingFlow({ 
  requestId, 
  prefillEmail, 
  prefillName,
  onComplete 
}: LimpaNomeOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    fullName: prefillName || '',
    cpf: '',
    birthDate: '',
    email: prefillEmail || '',
    phone: '',
    password: '',
  });

  const progress = (currentStep / steps.length) * 100;

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceedStep1 = () => {
    return formData.fullName.length >= 3 && 
           formData.cpf.length >= 11 && 
           formData.birthDate && 
           formData.email.includes('@') && 
           formData.phone.length >= 10;
  };

  const canProceedStep2 = () => {
    return formData.password.length >= 8;
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCreateAccount = async () => {
    if (!canProceedStep2()) return;
    
    setIsLoading(true);

    try {
      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/chat/guilherme?servico=limpanome&request=${requestId}`,
          data: {
            full_name: formData.fullName,
            created_from: 'limpa_nome_onboarding',
          },
        },
      });

      if (authError) {
        // Check for weak password
        if (authError.message.includes('weak') || authError.message.includes('password')) {
          toast.error('Senha muito fraca. Use letras, números e símbolos.');
          setIsLoading(false);
          return;
        }
        
        // User already exists - try to login
        if (authError.message.includes('already registered')) {
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (loginError) {
            toast.error('Email já cadastrado. Tente fazer login ou use outra senha.');
            setIsLoading(false);
            return;
          }

          if (loginData.user) {
            await updateRequestAndProfile(loginData.user.id);
            onComplete(loginData.user.id);
            return;
          }
        }
        
        throw authError;
      }

      if (authData.user) {
        await updateRequestAndProfile(authData.user.id);
        
        // Auto-login if session exists
        if (authData.session) {
          onComplete(authData.user.id);
        } else {
          // Email confirmation needed
          toast.success('Conta criada! Verifique seu email para confirmar.');
          onComplete(authData.user.id);
        }
      }
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast.error(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequestAndProfile = async (userId: string) => {
    // Update credit repair request with user data
    await supabase
      .from('credit_repair_requests')
      .update({
        user_id: userId,
        full_name: formData.fullName,
        cpf: formData.cpf.replace(/\D/g, ''),
        email: formData.email,
        phone: formData.phone.replace(/\D/g, ''),
        status: 'pending', // Aguardando documentos
      })
      .eq('id', requestId);

    // Create/update profile
    await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone.replace(/\D/g, ''),
      });

    // Add user role
    await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'user',
      }, { onConflict: 'user_id,role' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Vamos começar seu atendimento
          </h1>
          <p className="text-slate-400 text-sm">
            Precisamos de algumas informações para iniciar o processo de Limpa Nome.
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
          {/* Progress */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Etapa {currentStep} de {steps.length}</span>
              <span className="text-sm font-medium text-emerald-400">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-slate-800" />
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-4 py-4">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isDone = step.id < currentStep;
              
              return (
                <div 
                  key={step.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all",
                    isActive && "bg-emerald-500/20 text-emerald-400",
                    isDone && "bg-slate-700/50 text-slate-300",
                    !isActive && !isDone && "text-slate-500"
                  )}
                >
                  {isDone ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              );
            })}
          </div>

          <div className="px-6 pb-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Personal Data */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label className="text-slate-300">Nome completo *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <Input
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="Seu nome completo"
                        className="pl-10 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">CPF *</Label>
                    <MaskedInput
                      mask="cpf"
                      value={formData.cpf}
                      onChange={(value) => handleInputChange('cpf', value)}
                      className="h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 rounded-xl"
                      showValidation={false}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Data de nascimento *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <Input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                        className="pl-10 h-12 bg-slate-800/50 border-slate-700 text-white rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">E-mail *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="seu@email.com"
                        className="pl-10 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Celular (WhatsApp) *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 z-10" />
                      <MaskedInput
                        mask="phone"
                        value={formData.phone}
                        onChange={(value) => handleInputChange('phone', value)}
                        className="h-12 pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 rounded-xl"
                        showValidation={false}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={nextStep}
                    disabled={!canProceedStep1()}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-base border-0 shadow-lg shadow-emerald-500/25 disabled:opacity-50 mt-6"
                  >
                    Continuar
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Create Access */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
                      <Lock className="h-6 w-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Crie seu acesso</h3>
                    <p className="text-slate-400 text-sm">
                      Use esse acesso para acompanhar seu atendimento e falar com nossa equipe.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <Input
                        type="email"
                        value={formData.email}
                        disabled
                        className="pl-10 h-12 bg-slate-800/30 border-slate-700 text-slate-400 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Criar senha *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className="pl-10 pr-10 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Use letras maiúsculas, minúsculas, números e símbolos
                    </p>
                  </div>

                  {/* Garantia */}
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 mt-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-emerald-400 shrink-0" />
                      <p className="text-sm text-emerald-200">
                        Após criar sua conta, você será direcionado ao chat com seu especialista.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1 h-14 rounded-2xl border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Voltar
                    </Button>
                    
                    <Button
                      onClick={handleCreateAccount}
                      disabled={!canProceedStep2() || isLoading}
                      className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold border-0 shadow-lg shadow-emerald-500/25 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        <>
                          Acessar painel
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          🔒 Seus dados estão protegidos e serão usados apenas para o serviço contratado.
        </p>
      </motion.div>
    </div>
  );
}
