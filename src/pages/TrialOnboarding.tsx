import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, ArrowRight, Sparkles, Rocket, Shield, 
  CreditCard, Building2, Briefcase, Calculator, Check,
  Eye, EyeOff, Zap, Star, Lock, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import OnboardingParticles from '@/components/onboarding/OnboardingParticles';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { STRIPE_PLANS } from '@/lib/stripe';

type UserType = 'empresa' | 'autonomo' | 'contador';
type Step = 'value' | 'email' | 'card' | 'profile';

interface UserTypeOption {
  type: UserType;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
}

const userTypes: UserTypeOption[] = [
  {
    type: 'empresa',
    title: 'Empresa',
    description: 'MEI, ME, LTDA ou outra empresa',
    icon: Building2,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    type: 'autonomo',
    title: 'Autônomo',
    description: 'Profissional liberal ou freelancer',
    icon: Briefcase,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    type: 'contador',
    title: 'Contador',
    description: 'Ofereça serviços na plataforma',
    icon: Calculator,
    gradient: 'from-teal-500 to-emerald-500',
  },
];

const TrialOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('value');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedType, setSelectedType] = useState<UserType | null>(null);

  const steps: Step[] = ['value', 'email', 'card', 'profile'];
  const currentStepIndex = steps.indexOf(step);

  const handleStartTrial = () => {
    setStep('email');
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName) {
      toast.error('Preencha todos os campos');
      return;
    }
    
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setStep('card');
  };

  const handleCardSubmit = async () => {
    if (!selectedType) {
      toast.error('Selecione seu perfil');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get the price ID based on user type
      const priceId = selectedType === 'contador' 
        ? STRIPE_PLANS.contador.priceId 
        : selectedType === 'autonomo'
          ? STRIPE_PLANS.autonomo.priceId
          : STRIPE_PLANS.premium.priceId;

      const { data, error } = await supabase.functions.invoke('create-trial-checkout', {
        body: {
          priceId,
          email,
          fullName,
          userType: selectedType,
          password,
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não retornada');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Erro ao iniciar checkout');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      <OnboardingParticles />

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]"
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <motion.div 
        className="relative z-10 p-4 md:p-6 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={goBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        {/* Progress indicator */}
        {step !== 'value' && (
          <div className="flex items-center gap-2">
            {steps.slice(1).map((s, i) => (
              <div
                key={s}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  steps.indexOf(step) >= i + 1 
                    ? "bg-primary w-6" 
                    : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
        <AnimatePresence mode="wait">
          {/* Step 1: Value Proposition */}
          {step === 'value' && (
            <motion.div
              key="value"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl text-center"
            >
              {/* Badge */}
              <motion.div 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary text-sm font-semibold mb-8 border border-primary/30"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(var(--primary), 0.2)",
                    "0 0 40px rgba(var(--primary), 0.4)",
                    "0 0 20px rgba(var(--primary), 0.2)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-4 w-4" />
                3 dias grátis • Sem cobrança agora
                <Shield className="h-4 w-4" />
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Domine a{' '}
                <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Reforma Tributária
                </span>
              </h1>

              <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
                IA especializada, simuladores precisos e orientação contábil. 
                Tudo que você precisa para economizar no novo sistema tributário.
              </p>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                {[
                  { icon: Zap, text: 'IA Tributária 24/7', desc: 'Respostas instantâneas' },
                  { icon: Calculator, text: 'Simuladores', desc: 'Calcule economia' },
                  { icon: Shield, text: 'Segurança', desc: 'Dados protegidos' },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50"
                  >
                    <feature.icon className="h-8 w-8 text-primary" />
                    <span className="font-semibold">{feature.text}</span>
                    <span className="text-sm text-muted-foreground">{feature.desc}</span>
                  </motion.div>
                ))}
              </div>

              <Button
                size="lg"
                onClick={handleStartTrial}
                className="min-w-[280px] h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:scale-105 transition-all"
              >
                <Rocket className="h-5 w-5 mr-2" />
                Começar teste grátis
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>

              <p className="text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
                <Lock className="h-4 w-4" />
                Cancele a qualquer momento • Sem compromisso
              </p>
            </motion.div>
          )}

          {/* Step 2: Email & Password */}
          {step === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 mb-6 shadow-lg shadow-primary/30">
                  <Rocket className="h-8 w-8 text-primary-foreground" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Crie sua conta</h2>
                <p className="text-muted-foreground">
                  Em poucos segundos você terá acesso completo
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pr-12"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-lg font-semibold mt-6"
                >
                  Continuar
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-6">
                Ao continuar, você concorda com os{' '}
                <a href="/termos" className="text-primary hover:underline">Termos de Uso</a>
                {' '}e{' '}
                <a href="/privacidade" className="text-primary hover:underline">Política de Privacidade</a>
              </p>
            </motion.div>
          )}

          {/* Step 3: Profile Selection + Card */}
          {step === 'card' && (
            <motion.div
              key="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-3xl"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 mb-6 shadow-lg shadow-primary/30">
                  <CreditCard className="h-8 w-8 text-primary-foreground" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Escolha seu perfil</h2>
                <p className="text-muted-foreground">
                  Personalize sua experiência • Você não será cobrado agora
                </p>
              </div>

              {/* Trial info card */}
              <motion.div 
                className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-4 mb-8 flex items-center gap-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">3 dias de teste grátis</p>
                  <p className="text-sm text-muted-foreground">
                    Seu cartão só será cobrado após o período de teste. Cancele quando quiser.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Shield className="h-8 w-8 text-green-500" />
                </div>
              </motion.div>

              {/* User type selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {userTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.type;
                  
                  return (
                    <motion.button
                      key={type.type}
                      onClick={() => setSelectedType(type.type)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "relative p-6 rounded-2xl border-2 transition-all text-left",
                        "backdrop-blur-xl overflow-hidden",
                        isSelected
                          ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                          : "border-border/50 bg-card/50 hover:border-primary/50"
                      )}
                    >
                      {/* Selection indicator */}
                      <div className={cn(
                        "absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-all",
                        isSelected ? "bg-primary" : "border-2 border-muted-foreground/30"
                      )}>
                        {isSelected && <Check className="h-4 w-4 text-primary-foreground" />}
                      </div>

                      <div className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
                        `bg-gradient-to-br ${type.gradient}`
                      )}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>

                      <h3 className="text-lg font-bold mb-1">{type.title}</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </motion.button>
                  );
                })}
              </div>

              <Button
                size="lg"
                onClick={handleCardSubmit}
                disabled={!selectedType || isLoading}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Preparando...
                  </span>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Adicionar cartão e começar trial
                  </>
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center mt-4 flex items-center justify-center gap-2">
                <Lock className="h-4 w-4" />
                Pagamento seguro via Stripe • Cancele a qualquer momento
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="relative z-10 p-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} AtentAI. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default TrialOnboarding;
