import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { MaskedInput } from '@/components/ui/masked-input';
import {
  Eye, EyeOff, Loader2, Users, TrendingUp, Wallet, Shield, ArrowRight,
  ArrowLeft, CheckCircle2, Gift, Sparkles, Link as LinkIcon, MessageCircle,
  Copy, Check, ChevronRight, PartyPopper, Rocket, Star, Zap, DollarSign,
  BarChart3, Clock, Award, Play, Crown, Flame, Target, BadgeCheck, Trophy,
  CircleDollarSign, Banknote, Smartphone, Globe, ChevronDown
} from 'lucide-react';

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const SERVICES_INFO = [
  {
    icon: '🧠',
    name: 'Inteligência Fiscal',
    description: 'Análise com IA para recuperação de créditos tributários',
    commission: 'Até R$ 13.000 por caso',
    basePrice: 'Taxa de êxito: 50% do valor recuperado',
    highlight: true
  },
  {
    icon: '🛡️',
    name: 'Limpa Nome Premium',
    description: 'Regularização rápida com equipe jurídica especializada',
    commission: 'R$ 194 por venda',
    basePrice: 'Preço: R$ 970,00'
  },
  {
    icon: '📈',
    name: 'Consultoria Empresarial',
    description: 'Planejamento tributário personalizado',
    commission: 'R$ 90 por venda',
    basePrice: 'Preço: R$ 450,00'
  },
  {
    icon: '📄',
    name: 'Declaração de IR',
    description: 'IR Simples ou Completo',
    commission: 'R$ 30 a R$ 70',
    basePrice: 'Preço: R$ 150 a R$ 350'
  },
  {
    icon: '🏢',
    name: 'Abertura de Empresa',
    description: 'Abertura completa de CNPJ',
    commission: 'R$ 100 por venda',
    basePrice: 'Preço: R$ 500,00'
  }
];

type OnboardingStep = 'register' | 'welcome' | 'commission' | 'services' | 'link' | 'whatsapp';

const STEPS_ORDER: OnboardingStep[] = ['register', 'welcome', 'commission', 'services', 'link', 'whatsapp'];

// Ultra-futuristic animated counter
const AnimatedCounter = ({ target, duration = 2000, prefix = '', suffix = '' }: { target: number; duration?: number; prefix?: string; suffix?: string }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [target, duration]);
  
  return <span>{prefix}{count.toLocaleString('pt-BR')}{suffix}</span>;
};

// Cyberpunk grid background
const CyberGrid = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
    <div className="absolute inset-0" style={{
      backgroundImage: `
        linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
      `,
      backgroundSize: '50px 50px'
    }} />
    <motion.div
      animate={{ y: [0, 50] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(16, 185, 129, 0.05) 50%, transparent 100%)',
        height: '200%'
      }}
    />
  </div>
);

// Floating orbs with glow
const FloatingOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: `${Math.random() * 300 + 100}px`,
          height: `${Math.random() * 300 + 100}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          background: `radial-gradient(circle, ${
            ['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)', 'rgba(139, 92, 246, 0.1)'][i % 3]
          } 0%, transparent 70%)`,
          filter: 'blur(40px)'
        }}
        animate={{
          x: [0, Math.random() * 100 - 50],
          y: [0, Math.random() * 100 - 50],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut'
        }}
      />
    ))}
  </div>
);

// Progress stepper
const ProgressStepper = ({ currentStep, steps }: { currentStep: OnboardingStep; steps: OnboardingStep[] }) => {
  const currentIndex = steps.indexOf(currentStep);
  
  if (currentStep === 'register') return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {steps.slice(1).map((step, i) => {
            const stepIndex = i + 1;
            const isCompleted = currentIndex > stepIndex;
            const isCurrent = currentIndex === stepIndex;
            
            return (
              <div key={step} className="flex items-center flex-1">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500
                    ${isCompleted 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' 
                      : isCurrent 
                        ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/40 ring-4 ring-emerald-500/20' 
                        : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    stepIndex
                  )}
                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-emerald-500/30"
                    />
                  )}
                </motion.div>
                {i < steps.slice(1).length - 1 && (
                  <div className="flex-1 h-1 mx-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: isCompleted ? '100%' : isCurrent ? '50%' : '0%' }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Glassmorphism card
const GlassCard = ({ children, className = '', glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`
      relative bg-background/70 backdrop-blur-2xl rounded-3xl border border-border/50 shadow-2xl overflow-hidden
      ${glow ? 'shadow-emerald-500/10' : ''}
      ${className}
    `}
  >
    {glow && (
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-emerald-500/20 via-transparent to-cyan-500/20 pointer-events-none" />
    )}
    <div className="relative">{children}</div>
  </motion.div>
);

export default function AffiliateOnboardingFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('register');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState('');
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    email: '',
    phone: '',
    state: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (!formData.termsAccepted) {
      toast.error('Você precisa aceitar os termos');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/afiliado/painel`,
          data: { full_name: formData.fullName }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        const { data: affiliateData, error: affiliateError } = await supabase
          .from('affiliates')
          .insert({
            user_id: authData.user.id,
            full_name: formData.fullName,
            cpf: formData.cpf.replace(/\D/g, ''),
            email: formData.email,
            phone: formData.phone.replace(/\D/g, ''),
            state: formData.state,
            whatsapp_number: formData.phone.replace(/\D/g, ''),
            terms_accepted_at: new Date().toISOString()
          })
          .select('affiliate_code')
          .single();

        if (affiliateError) throw affiliateError;

        setAffiliateCode(affiliateData.affiliate_code);

        await supabase.from('user_roles').insert({
          user_id: authData.user.id,
          role: 'affiliate' as any
        });

        toast.success('Conta criada com sucesso!');
        setCurrentStep('welcome');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Erro ao realizar cadastro');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    const link = `${window.location.origin}/p/${affiliateCode}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const goToPanel = () => {
    navigate('/afiliado/painel');
  };

  // ULTRA FUTURISTIC Registration Page
  if (currentStep === 'register') {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <CyberGrid />
        <FloatingOrbs />
        
        <div className="relative z-10 min-h-screen">
          <div className="grid lg:grid-cols-2 min-h-screen">
            {/* Left Side - Hero */}
            <div className="relative hidden lg:flex flex-col justify-center p-12 xl:p-16">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-xl"
              >
                {/* Logo */}
                <motion.img
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  src="/logo-atentai.png"
                  alt="AtentAI"
                  className="h-10 mb-8"
                />

                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 backdrop-blur-sm mb-6"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </motion.div>
                  <span className="text-emerald-400 font-bold text-sm">Programa de Afiliados Premium</span>
                </motion.div>

                {/* Main Headline */}
                <h1 className="text-5xl xl:text-6xl font-black leading-[1.1] mb-6">
                  <span className="text-foreground">Ganhe de </span>
                  <span className="relative inline-block">
                    <motion.span
                      animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                      transition={{ duration: 5, repeat: Infinity }}
                      className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-[length:200%_auto]"
                    >
                      R$ 500
                    </motion.span>
                  </span>
                  <span className="text-foreground"> a </span>
                  <span className="relative inline-block">
                    <motion.span
                      animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                      transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                      className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-[length:200%_auto]"
                    >
                      R$ 13.000
                    </motion.span>
                  </span>
                  <br />
                  <span className="text-foreground">por venda!</span>
                </h1>

                <p className="text-xl text-muted-foreground mb-8">
                  Indique nossos serviços premium e receba{' '}
                  <span className="text-emerald-400 font-bold">20% de comissão</span> em cada venda fechada.
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { icon: Crown, value: '20%', label: 'Comissão', color: 'from-yellow-500 to-orange-500' },
                    { icon: Trophy, value: 'R$ 89M+', label: 'Recuperados', color: 'from-emerald-500 to-teal-500' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="group relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-xl" 
                        style={{ background: `linear-gradient(to right, ${stat.color.split(' ')[0].replace('from-', 'var(--tw-gradient-from)')}, ${stat.color.split(' ')[1]?.replace('to-', 'var(--tw-gradient-to)') || ''})` }} 
                      />
                      <div className="relative bg-muted/50 backdrop-blur-sm rounded-2xl p-5 border border-border/50 hover:border-emerald-500/30 transition-all">
                        <stat.icon className={`w-6 h-6 mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent', color: stat.color.includes('yellow') ? '#eab308' : '#10b981' }} />
                        <div className="text-3xl font-black text-foreground">{stat.value}</div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {[
                    { icon: Zap, text: 'Cadastro gratuito em 2 minutos' },
                    { icon: Banknote, text: 'Saques via PIX em até 24h' },
                    { icon: Target, text: 'Dashboard com métricas em tempo real' },
                    { icon: BadgeCheck, text: 'Suporte exclusivo para afiliados' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-muted-foreground">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-6 lg:p-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md"
              >
                {/* Mobile Logo */}
                <div className="lg:hidden text-center mb-8">
                  <img src="/logo-atentai.png" alt="AtentAI" className="h-8 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold mb-2">Programa de Afiliados</h1>
                  <p className="text-muted-foreground">Ganhe até R$ 13.000 por venda</p>
                </div>

                <GlassCard glow className="p-8">
                  <div className="text-center mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="relative inline-block"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                        <Rocket className="w-8 h-8 text-white" />
                      </div>
                    </motion.div>
                    <h2 className="text-2xl font-bold mt-4 mb-1">Crie sua conta</h2>
                    <p className="text-sm text-muted-foreground">E comece a ganhar ainda hoje</p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium">Nome Completo</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Seu nome completo"
                        required
                        className="h-12 bg-muted/50 border-border/50 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">CPF</Label>
                        <MaskedInput
                          mask="cpf"
                          value={formData.cpf}
                          onChange={(value) => setFormData({ ...formData, cpf: value })}
                          showValidation={false}
                          className="h-12 bg-muted/50 border-border/50 focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">WhatsApp</Label>
                        <MaskedInput
                          mask="phone"
                          value={formData.phone}
                          onChange={(value) => setFormData({ ...formData, phone: value })}
                          showValidation={false}
                          className="h-12 bg-muted/50 border-border/50 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="seu@email.com"
                        required
                        className="h-12 bg-muted/50 border-border/50 focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Estado</Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) => setFormData({ ...formData, state: value })}
                      >
                        <SelectTrigger className="h-12 bg-muted/50 border-border/50 focus:border-emerald-500">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {BRAZILIAN_STATES.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Senha</Label>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            className="h-12 bg-muted/50 border-border/50 focus:border-emerald-500 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Confirmar</Label>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="••••••••"
                          required
                          minLength={6}
                          className="h-12 bg-muted/50 border-border/50 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pt-2">
                      <Checkbox
                        id="terms"
                        checked={formData.termsAccepted}
                        onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: checked as boolean })}
                        className="mt-0.5"
                      />
                      <Label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                        Li e aceito os{' '}
                        <Link to="/termos" className="text-emerald-500 hover:underline">Termos</Link>
                        {' '}e a{' '}
                        <Link to="/privacidade" className="text-emerald-500 hover:underline">Política de Privacidade</Link>
                      </Label>
                    </div>

                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 text-base font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/25 transition-all duration-300"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Criando...
                          </>
                        ) : (
                          <>
                            <Rocket className="w-5 h-5 mr-2" />
                            Criar Conta Grátis
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </motion.div>

                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      <span><strong className="text-foreground">+127</strong> cadastros hoje</span>
                    </div>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Já tem uma conta?{' '}
                      <Link to="/auth" className="text-emerald-500 hover:underline font-medium">Entrar</Link>
                    </p>
                  </div>
                </GlassCard>

                <div className="mt-6 flex items-center justify-center gap-6 text-muted-foreground">
                  <div className="flex items-center gap-2 text-xs">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span>Dados protegidos</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span>2 min</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Remaining steps layout wrapper
  const StepWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <CyberGrid />
      <FloatingOrbs />
      <ProgressStepper currentStep={currentStep} steps={STEPS_ORDER} />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 pt-24">
        {children}
      </div>
    </div>
  );

  // Welcome step
  if (currentStep === 'welcome') {
    return (
      <StepWrapper>
        <GlassCard glow className="w-full max-w-lg text-center">
          <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 relative overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="relative w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border-2 border-white/30"
            >
              <PartyPopper className="w-12 h-12 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-black text-white mb-2"
            >
              Bem-vindo ao Time!
            </motion.h1>
            <p className="text-white/90 text-xl font-medium">{formData.fullName}</p>
          </div>
          
          <div className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-semibold text-sm">
                <Trophy className="w-4 h-4" />
                Você é um Afiliado Premium!
              </div>
            </motion.div>
            
            <p className="text-lg text-muted-foreground mb-8">
              Sua conta foi criada! Vamos te mostrar como{' '}
              <span className="text-foreground font-semibold">ganhar de R$ 500 a R$ 13.000 por venda</span>.
            </p>

            <Button
              onClick={() => setCurrentStep('commission')}
              size="lg"
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/25"
            >
              Ver Como Funciona
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </GlassCard>
      </StepWrapper>
    );
  }

  // Commission step
  if (currentStep === 'commission') {
    return (
      <StepWrapper>
        <GlassCard glow className="w-full max-w-lg">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                <CircleDollarSign className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Sistema de Comissões</h2>
              <p className="text-muted-foreground">Transparência total nos seus ganhos</p>
            </div>

            <div className="space-y-4">
              {/* Commission Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
              >
                <motion.div
                  animate={{ x: [0, 100, 0] }}
                  transition={{ duration: 10, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
                />
                <div className="relative flex items-center justify-between">
                  <div>
                    <span className="text-white/80 font-medium text-sm">Sua comissão padrão</span>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: 'spring' }}
                      className="text-5xl font-black text-white"
                    >
                      20%
                    </motion.div>
                  </div>
                  <Crown className="w-16 h-16 text-white/30" />
                </div>
              </motion.div>

              {/* Examples */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <span className="text-sm text-muted-foreground">Limpa Nome</span>
                  <div className="text-2xl font-bold text-emerald-500">R$ 194</div>
                  <p className="text-xs text-muted-foreground">20% de R$ 970</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <span className="text-sm text-muted-foreground">Consultoria</span>
                  <div className="text-2xl font-bold text-emerald-500">R$ 90</div>
                  <p className="text-xs text-muted-foreground">20% de R$ 450</p>
                </div>
              </div>

              {/* Highlight */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-yellow-500 shrink-0" />
                  <div>
                    <p className="font-bold text-yellow-600 dark:text-yellow-400">Inteligência Fiscal</p>
                    <p className="text-sm text-muted-foreground">
                      Ganhe <strong>até R$ 13.000</strong> por caso!
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-start gap-3">
                  <Banknote className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400">Saques via PIX</p>
                    <p className="text-sm text-muted-foreground">Processados em até 24h úteis</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button variant="outline" onClick={() => setCurrentStep('welcome')} className="flex-1 h-12">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button onClick={() => setCurrentStep('services')} className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500">
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </GlassCard>
      </StepWrapper>
    );
  }

  // Services step
  if (currentStep === 'services') {
    return (
      <StepWrapper>
        <GlassCard glow className="w-full max-w-2xl">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Serviços Premium</h2>
              <p className="text-muted-foreground">Produtos de alta conversão</p>
            </div>

            <div className="space-y-3">
              {SERVICES_INFO.map((service, i) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-start gap-4 p-4 rounded-xl transition-all border ${
                    service.highlight 
                      ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/40' 
                      : 'bg-muted/30 border-border/50 hover:bg-muted/50'
                  }`}
                >
                  <span className="text-3xl">{service.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold">{service.name}</h3>
                      {service.highlight && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-yellow-500 text-yellow-900 rounded-full">
                          TOP
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{service.basePrice}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-sm font-bold ${service.highlight ? 'text-yellow-500' : 'text-emerald-500'}`}>
                      {service.commission}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-4 mt-8">
              <Button variant="outline" onClick={() => setCurrentStep('commission')} className="flex-1 h-12">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button onClick={() => setCurrentStep('link')} className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500">
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </GlassCard>
      </StepWrapper>
    );
  }

  // Link step
  if (currentStep === 'link') {
    const affiliateLink = `${window.location.origin}/p/${affiliateCode}`;
    
    return (
      <StepWrapper>
        <GlassCard glow className="w-full max-w-lg">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                <LinkIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Seu Link Exclusivo</h2>
              <p className="text-muted-foreground">Compartilhe e ganhe em cada venda</p>
            </div>

            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-muted/50 border-2 border-dashed border-border">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Seu link de afiliado:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono break-all bg-background p-3 rounded-lg border border-border/50">
                    {affiliateLink}
                  </code>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant={copied ? 'default' : 'outline'}
                      size="sm"
                      onClick={copyLink}
                      className={copied ? 'bg-emerald-500' : ''}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </motion.div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-sm">
                  <strong className="text-emerald-500">💡 Dica:</strong>{' '}
                  <span className="text-muted-foreground">
                    Clientes que acessarem este link serão vinculados a você automaticamente!
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button variant="outline" onClick={() => setCurrentStep('services')} className="flex-1 h-12">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button onClick={() => setCurrentStep('whatsapp')} className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500">
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </GlassCard>
      </StepWrapper>
    );
  }

  // WhatsApp/Final step
  if (currentStep === 'whatsapp') {
    const affiliateLink = `${window.location.origin}/p/${affiliateCode}`;
    
    const whatsappMessage = `🚀 *Olá! Tenho uma oportunidade incrível para você.*

Descobri uma plataforma que está ajudando empresários a recuperar dinheiro e limpar restrições no CNPJ/CPF.

✅ *+R$ 89 milhões* já recuperados
✅ Análise *100% gratuita*
✅ Atendimento premium

*Serviços disponíveis:*
🧠 Inteligência Fiscal - Recupere créditos tributários
🛡️ Limpa Nome Premium - R$ 970 ou 4x R$ 243
📄 Declaração IR - A partir de R$ 150
🏢 Abertura de Empresa - R$ 500

👉 *Faça sua análise gratuita:*
${affiliateLink}

_Estou à disposição para tirar dúvidas!_`;

    const copyWhatsAppMessage = () => {
      navigator.clipboard.writeText(whatsappMessage);
      toast.success('Mensagem copiada!');
    };

    const openWhatsApp = () => {
      const encoded = encodeURIComponent(whatsappMessage);
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    };

    return (
      <StepWrapper>
        <GlassCard glow className="w-full max-w-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-6 relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"
            />
            <div className="flex items-center gap-4 relative">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Mensagem Pronta!</h1>
                <p className="text-white/80 text-sm">Copie e envie pelo WhatsApp</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* WhatsApp Preview */}
            <div className="bg-[#e5ddd5] dark:bg-[#0b141a] rounded-xl p-4 mb-6 max-h-64 overflow-y-auto">
              <div className="bg-[#dcf8c6] dark:bg-[#005c4b] rounded-lg p-4 max-w-[90%] ml-auto shadow-sm">
                <pre className="whitespace-pre-wrap text-sm text-[#111b21] dark:text-white font-sans leading-relaxed">
                  {whatsappMessage}
                </pre>
                <p className="text-right text-xs text-[#667781] dark:text-[#8696a0] mt-2">Agora ✓✓</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button variant="outline" onClick={copyWhatsAppMessage} className="h-12">
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </Button>
              <Button onClick={openWhatsApp} className="h-12 bg-green-500 hover:bg-green-600">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </div>

            <div className="border-t border-border/50 pt-6">
              <h3 className="font-bold mb-4 text-center text-lg">Seu painel está pronto! 🎉</h3>
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                  { icon: Users, label: 'Leads', color: 'text-blue-500' },
                  { icon: DollarSign, label: 'Vendas', color: 'text-emerald-500' },
                  { icon: BarChart3, label: 'Comissões', color: 'text-purple-500' },
                  { icon: Wallet, label: 'Saques', color: 'text-orange-500' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="p-3 rounded-xl bg-muted/50 border border-border/50 text-center"
                  >
                    <item.icon className={`w-6 h-6 mx-auto mb-1 ${item.color}`} />
                    <p className="text-xs font-semibold">{item.label}</p>
                  </motion.div>
                ))}
              </div>

              <Button
                onClick={goToPanel}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/25"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Acessar Meu Painel
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </GlassCard>
      </StepWrapper>
    );
  }

  return null;
}
