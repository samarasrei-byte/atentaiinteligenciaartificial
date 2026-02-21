import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, ArrowRight, Sparkles, Rocket, Shield, 
  CreditCard, Building2, Briefcase, Calculator, Check,
  Eye, EyeOff, Zap, Star, Lock, Clock, User, Mail, KeyRound,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import CleanBackground from '@/components/onboarding/CleanBackground';
import GlowingProgress from '@/components/onboarding/GlowingProgress';
import FloatingCard from '@/components/onboarding/FloatingCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { STRIPE_PLANS } from '@/lib/stripe';

type UserType = 'empresa' | 'autonomo' | 'contador';
type Step = 'value' | 'email' | 'profile' | 'card';

interface UserTypeOption {
  type: UserType;
  title: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  gradient: string;
}

const userTypes: UserTypeOption[] = [
  {
    type: 'empresa',
    title: 'Empresa',
    description: 'MEI, ME, LTDA ou outra empresa',
    features: ['Simulador de impostos', 'Comparador de regimes', 'Consultoria especializada'],
    icon: Building2,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    type: 'autonomo',
    title: 'Autônomo',
    description: 'Profissional liberal ou freelancer',
    features: ['Análise PF vs PJ', 'Simulador MEI', 'Orientação tributária'],
    icon: Briefcase,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    type: 'contador',
    title: 'Contador',
    description: 'Ofereça serviços na plataforma',
    features: ['Captação de clientes', 'Agenda integrada', 'Sistema de saques'],
    icon: Calculator,
    gradient: 'from-teal-500 to-emerald-500',
  },
];

const steps = [
  { id: 1, title: 'Início', icon: Rocket },
  { id: 2, title: 'Conta', icon: User },
  { id: 3, title: 'Perfil', icon: Building2 },
  { id: 4, title: 'Pagamento', icon: CreditCard },
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

  const stepMapping: Record<Step, number> = {
    'value': 1,
    'email': 2,
    'profile': 3,
    'card': 4,
  };
  
  const currentStepNumber = stepMapping[step];

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
    
    setStep('profile');
  };

  const handleProfileSubmit = () => {
    if (!selectedType) {
      toast.error('Selecione seu perfil');
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
    const stepOrder: Step[] = ['value', 'email', 'profile', 'card'];
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex > 0) {
      setStep(stepOrder[currentIndex - 1]);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      <CleanBackground />

      {/* Header */}
      <motion.header 
        className="relative z-20 p-4 md:p-6 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground transition-all hover:scale-105 group"
          onClick={goBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </Button>

        {step !== 'value' && (
          <motion.div 
            className="flex-1 max-w-lg mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <GlowingProgress steps={steps} currentStep={currentStepNumber} />
          </motion.div>
        )}

        <div className="w-20" />
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
        <AnimatePresence mode="wait">
          {/* Step 1: Value Proposition */}
          {step === 'value' && (
            <motion.div
              key="value"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-3xl text-center"
            >
              {/* Animated Badge */}
              <motion.div 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 text-primary text-sm font-semibold mb-8 border border-primary/30 backdrop-blur-sm"
                animate={{
                  boxShadow: [
                    "0 0 20px hsl(var(--primary) / 0.2)",
                    "0 0 40px hsl(var(--primary) / 0.4)",
                    "0 0 20px hsl(var(--primary) / 0.2)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
                3 dias grátis • Sem cobrança agora
                <Shield className="h-4 w-4" />
              </motion.div>

              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Domine a{' '}
                <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Reforma Tributária
                </span>
              </motion.h1>

              <motion.p 
                className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                IA especializada, simuladores precisos e orientação contábil. 
                Tudo que você precisa para economizar no novo sistema tributário.
              </motion.p>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                {[
                  { icon: Zap, text: 'IA Tributária 24/7', desc: 'Respostas instantâneas', gradient: 'from-yellow-500 to-orange-500' },
                  { icon: Calculator, text: 'Simuladores', desc: 'Calcule economia', gradient: 'from-blue-500 to-cyan-500' },
                  { icon: Shield, text: 'Segurança', desc: 'Dados protegidos', gradient: 'from-green-500 to-emerald-500' },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.1, type: "spring" }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all cursor-default group"
                  >
                    <motion.div 
                      className={cn("w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg", feature.gradient)}
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <feature.icon className="h-7 w-7 text-white" />
                    </motion.div>
                    <span className="font-semibold text-foreground">{feature.text}</span>
                    <span className="text-sm text-muted-foreground">{feature.desc}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  size="lg"
                  onClick={handleStartTrial}
                  className="min-w-[300px] h-16 text-lg font-semibold bg-gradient-to-r from-primary via-primary to-purple-600 shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:scale-105 transition-all relative overflow-hidden group"
                >
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    animate={{ x: ["-200%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                  <Rocket className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Começar teste grátis
                  <motion.span
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.span>
                </Button>

                <motion.p 
                  className="text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <Lock className="h-4 w-4" />
                  Cancele a qualquer momento • Sem compromisso
                </motion.p>
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Email & Password */}
          {step === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md"
            >
              <motion.div 
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-primary to-purple-600 mb-6 shadow-2xl shadow-primary/40"
                  animate={{ 
                    rotateY: [0, 10, -10, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <User className="h-10 w-10 text-primary-foreground" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  Crie sua conta
                </h2>
                <p className="text-muted-foreground">
                  Em poucos segundos você terá acesso completo
                </p>
              </motion.div>

              <motion.form 
                onSubmit={handleEmailSubmit} 
                className="space-y-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Nome completo
                  </Label>
                  <div className="relative group">
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Seu nome"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-14 pl-4 text-base bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary transition-all"
                      required
                    />
                    <motion.div 
                      className="absolute inset-0 rounded-md pointer-events-none border-2 border-primary opacity-0 group-focus-within:opacity-100"
                      initial={false}
                      animate={{ scale: fullName ? 1 : 0.98 }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 pl-4 text-base bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-14 pl-4 pr-12 text-base bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary transition-all"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-lg font-semibold mt-6 bg-gradient-to-r from-primary to-primary/90 hover:shadow-xl hover:shadow-primary/30 transition-all group"
                >
                  Continuar
                  <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.form>

              <motion.p 
                className="text-xs text-muted-foreground text-center mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Ao continuar, você concorda com os{' '}
                <a href="/termos" className="text-primary hover:underline">Termos de Uso</a>
                {' '}e{' '}
                <a href="/privacidade" className="text-primary hover:underline">Política de Privacidade</a>
              </motion.p>
            </motion.div>
          )}

          {/* Step 3: Profile Selection */}
          {step === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-5xl"
            >
              <motion.div 
                className="text-center mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div 
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary text-sm font-semibold mb-6 border border-primary/30"
                  animate={{
                    boxShadow: [
                      "0 0 15px hsl(var(--primary) / 0.2)",
                      "0 0 30px hsl(var(--primary) / 0.3)",
                      "0 0 15px hsl(var(--primary) / 0.2)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="h-4 w-4" />
                  Personalize sua experiência
                </motion.div>

                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                  Qual é o seu{' '}
                  <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    perfil
                  </span>
                  ?
                </h2>
                <p className="text-muted-foreground text-lg">
                  Selecione a opção que melhor descreve você
                </p>
              </motion.div>

              {/* Profile Cards */}
              <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-10">
                {userTypes.map((type, index) => (
                  <FloatingCard
                    key={type.type}
                    type={type.type}
                    title={type.title}
                    description={type.description}
                    features={type.features}
                    icon={type.icon}
                    gradient={type.gradient}
                    selected={selectedType === type.type}
                    onClick={() => setSelectedType(type.type)}
                    delay={index * 0.15}
                  />
                ))}
              </div>

              {/* Continue Button */}
              <motion.div 
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  size="lg"
                  onClick={handleProfileSubmit}
                  disabled={!selectedType}
                  className={cn(
                    "min-w-[280px] h-14 text-lg font-semibold relative overflow-hidden transition-all",
                    "bg-gradient-to-r from-primary to-primary/90",
                    selectedType && "shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:scale-105"
                  )}
                >
                  {/* Shine */}
                  {selectedType && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center">
                    Continuar
                    <motion.span
                      className="ml-2"
                      animate={selectedType ? { x: [0, 5, 0] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.span>
                  </span>
                </Button>

                {!selectedType && (
                  <motion.p 
                    className="text-sm text-muted-foreground mt-3"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Selecione uma opção para continuar
                  </motion.p>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Step 4: Payment Confirmation */}
          {step === 'card' && (
            <motion.div
              key="card"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-lg"
            >
              <motion.div 
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-primary to-purple-600 mb-6 shadow-2xl shadow-primary/40"
                  animate={{ 
                    rotateY: [0, 10, -10, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <CreditCard className="h-10 w-10 text-primary-foreground" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-2">Quase lá!</h2>
                <p className="text-muted-foreground">
                  Configure seu método de pagamento
                </p>
              </motion.div>

              {/* Trial info card */}
              <motion.div 
                className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/20 rounded-2xl p-6 mb-8"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-start gap-4">
                  <motion.div 
                    className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg"
                    animate={{ 
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Clock className="h-7 w-7 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground mb-1">3 dias de teste grátis</h3>
                    <p className="text-sm text-muted-foreground">
                      Seu cartão só será cobrado após o período de teste. Cancele quando quiser, sem complicação.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Selected plan summary */}
              {selectedType && (
                <motion.div 
                  className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-4">
                    {(() => {
                      const selected = userTypes.find(t => t.type === selectedType);
                      if (!selected) return null;
                      const Icon = selected.icon;
                      return (
                        <>
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg", selected.gradient)}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">Plano {selected.title}</p>
                            <p className="text-sm text-muted-foreground">{selected.description}</p>
                          </div>
                          <div className="flex items-center gap-1 text-primary">
                            <Check className="h-5 w-5" />
                            <span className="text-sm font-medium">Selecionado</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </motion.div>
              )}

              {/* Trust indicators */}
              <motion.div 
                className="flex items-center justify-center gap-6 mb-8 text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2 text-sm">
                  <Lock className="h-4 w-4 text-green-500" />
                  <span>Pagamento seguro</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Dados criptografados</span>
                </div>
              </motion.div>

              <Button
                size="lg"
                onClick={handleCardSubmit}
                disabled={isLoading}
                className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-primary via-primary to-purple-600 shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:scale-[1.02] transition-all relative overflow-hidden"
              >
                {/* Shine */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  animate={{ x: ["-200%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
                
                {isLoading ? (
                  <span className="flex items-center relative z-10">
                    <motion.div 
                      className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Preparando checkout...
                  </span>
                ) : (
                  <span className="flex items-center relative z-10">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Ir para pagamento seguro
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </span>
                )}
              </Button>

              <motion.p 
                className="text-xs text-muted-foreground text-center mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Pagamento seguro via Mercado Pago
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Trust badges */}
      <motion.footer 
        className="relative z-10 p-4 flex items-center justify-center gap-6 text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5" />
          <span>256-bit SSL</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5" />
          <span>LGPD Compliant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span>4.9/5 avaliações</span>
        </div>
      </motion.footer>
    </div>
  );
};

export default TrialOnboarding;
