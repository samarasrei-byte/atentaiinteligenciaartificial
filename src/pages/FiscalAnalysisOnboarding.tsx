import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MaskedInput } from '@/components/ui/masked-input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, ArrowRight, ArrowLeft, Loader2, Lock, Shield,
  User, Mail, Phone, Building2, FileText, CheckCircle2,
  Sparkles, Gift, BadgeCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  { id: 1, title: 'Seus Dados', icon: User },
  { id: 2, title: 'Empresa', icon: Building2 },
];

const TAX_REGIMES = [
  { value: 'simples_nacional', label: 'Simples Nacional' },
  { value: 'lucro_presumido', label: 'Lucro Presumido' },
  { value: 'lucro_real', label: 'Lucro Real' },
];

export default function FiscalAnalysisOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    cnpj: '',
    companyName: '',
    taxRegime: 'simples_nacional',
    annualRevenue: '',
  });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.fullName && formData.email && formData.phone;
    }
    if (currentStep === 2) {
      return formData.cnpj && formData.companyName && formData.taxRegime;
    }
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      let userId = user?.id;
      
      // If user is not logged in, create a quick account
      if (!user) {
        // Generate a temporary password if not provided
        const tempPassword = formData.password || `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email.trim().toLowerCase(),
          password: tempPassword,
          options: {
            data: {
              full_name: formData.fullName.trim(),
              phone: formData.phone.replace(/\D/g, ''),
              source: 'fiscal_analysis_onboarding',
            },
          },
        });

        if (authError) {
          // Check if user already exists
          if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
            toast.error('Este e-mail já está cadastrado. Faça login para continuar.', {
              action: {
                label: 'Fazer Login',
                onClick: () => navigate('/auth'),
              },
            });
            setIsSubmitting(false);
            return;
          }
          throw authError;
        }

        userId = authData.user?.id;

        // Update profile with phone
        if (userId) {
          await supabase.from('profiles').update({
            phone: formData.phone.replace(/\D/g, ''),
          }).eq('user_id', userId);
        }
      }

      if (!userId) {
        throw new Error('Erro ao criar conta');
      }

      // Parse annual revenue
      const annualRevenueCents = formData.annualRevenue 
        ? Math.round(parseFloat(formData.annualRevenue.replace(/[^\d,]/g, '').replace(',', '.')) * 100) 
        : 0;

      // Create fiscal analysis request
      const { data: request, error: requestError } = await supabase
        .from('fiscal_analysis_requests')
        .insert({
          user_id: userId,
          full_name: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.replace(/\D/g, ''),
          cpf: formData.cpf.replace(/\D/g, '') || null,
          cnpj: formData.cnpj.replace(/\D/g, ''),
          company_name: formData.companyName.trim(),
          tax_regime: formData.taxRegime,
          annual_revenue_cents: annualRevenueCents,
          status: 'pending',
          payment_status: 'success_fee', // Modelo success fee
        })
        .select()
        .single();

      if (requestError) throw requestError;

      toast.success('Solicitação enviada com sucesso!', {
        description: 'Você será direcionado para o seu painel.',
      });

      // Set session storage to open chat
      sessionStorage.setItem('openFiscalChat', request.id);
      sessionStorage.removeItem('pendingFiscalAnalysis');

      // Navigate to dashboard with fiscal chat open
      navigate('/empresa?tab=chat-fiscal');
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Erro ao enviar solicitação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-border bg-white/95 backdrop-blur-lg sticky top-0 z-50">
        <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-atentai.png" alt="AtentAI" className="h-8" />
          </Link>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Lock className="h-4 w-4" />
            <span>100% Seguro</span>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6 text-white/60 hover:text-white hover:bg-white/10"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        {/* Hero Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6"
        >
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-4 py-1.5">
            <Gift className="h-4 w-4 mr-2" />
            Análise Gratuita • Pague apenas no êxito
          </Badge>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Solicitar Análise Fiscal
          </h1>
          <p className="text-white/60">
            Preencha seus dados para iniciar sua análise
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-emerald-500 text-white' 
                      : isCompleted 
                        ? 'bg-emerald-500/30 text-emerald-400'
                        : 'bg-white/10 text-white/40'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${
                    isActive ? 'text-white' : 'text-white/40'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-white/10'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Form Card */}
        <Card className="bg-white border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Scale className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-900">
                  {currentStep === 1 ? 'Seus Dados' : 'Dados da Empresa'}
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 
                    ? 'Precisamos de algumas informações para contato'
                    : 'Informe os dados da empresa para análise'
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-5">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo *</Label>
                    <Input
                      id="fullName"
                      placeholder="Seu nome completo"
                      value={formData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="h-12"
                    />
                    <p className="text-xs text-slate-500">
                      Você receberá atualizações sobre sua análise
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">WhatsApp *</Label>
                    <MaskedInput
                      id="phone"
                      mask="phone"
                      value={formData.phone}
                      onChange={(value) => updateField('phone', value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF (opcional)</Label>
                    <MaskedInput
                      id="cpf"
                      mask="cpf"
                      value={formData.cpf}
                      onChange={(value) => updateField('cpf', value)}
                      className="h-12"
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nome da Empresa *</Label>
                    <Input
                      id="companyName"
                      placeholder="Razão social ou nome fantasia"
                      value={formData.companyName}
                      onChange={(e) => updateField('companyName', e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <MaskedInput
                      id="cnpj"
                      mask="cnpj"
                      value={formData.cnpj}
                      onChange={(value) => updateField('cnpj', value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxRegime">Regime Tributário *</Label>
                    <Select
                      value={formData.taxRegime}
                      onValueChange={(value) => updateField('taxRegime', value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione o regime" />
                      </SelectTrigger>
                      <SelectContent>
                        {TAX_REGIMES.map((regime) => (
                          <SelectItem key={regime.value} value={regime.value}>
                            {regime.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="annualRevenue">Faturamento Anual (opcional)</Label>
                    <Input
                      id="annualRevenue"
                      placeholder="R$ 0,00"
                      value={formData.annualRevenue}
                      onChange={(e) => updateField('annualRevenue', e.target.value)}
                      className="h-12"
                    />
                    <p className="text-xs text-slate-500">
                      Nos ajuda a personalizar a análise
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 h-12"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              )}
              
              <Button
                onClick={nextStep}
                disabled={!canProceed() || isSubmitting}
                className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : currentStep === steps.length ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Solicitar Análise
                  </>
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Lock className="h-3 w-3" />
                SSL 256-bit
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Shield className="h-3 w-3" />
                100% Seguro
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <BadgeCheck className="h-3 w-3" />
                LGPD
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
            <Gift className="h-5 w-5 text-emerald-400 mb-2" />
            <p className="text-sm font-medium text-white">Análise Gratuita</p>
            <p className="text-xs text-white/50">Sem custos iniciais</p>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
            <Sparkles className="h-5 w-5 text-emerald-400 mb-2" />
            <p className="text-sm font-medium text-white">Pague no Êxito</p>
            <p className="text-xs text-white/50">50% do valor recuperado</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 pb-28 mt-12">
        <div className="container max-w-4xl mx-auto px-4 text-center text-white/40 text-sm">
          <p>© {new Date().getFullYear()} AtentAI — Inteligência tributária para todos.</p>
        </div>
      </footer>
    </div>
  );
}
