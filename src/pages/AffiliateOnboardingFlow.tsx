import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { MaskedInput } from '@/components/ui/masked-input';
import {
  Eye, EyeOff, Loader2, Users, TrendingUp, Wallet, Shield, ArrowRight,
  ArrowLeft, CheckCircle2, Gift, Sparkles, Link as LinkIcon, MessageCircle,
  Copy, Check, ChevronRight, PartyPopper, Rocket, Star, Zap, DollarSign,
  BarChart3, Clock, Award, Play, Crown, Flame, Target, BadgeCheck, Trophy,
  TrendingDown, CircleDollarSign, Banknote
} from 'lucide-react';

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Comissões alinhadas com os preços reais do sistema - ATUALIZADOS PARA 20%
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

// Animated counter component
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

// Floating particles background
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-white/20 rounded-full"
        initial={{
          x: Math.random() * 100 + '%',
          y: '100%',
          opacity: 0
        }}
        animate={{
          y: '-100%',
          opacity: [0, 1, 1, 0]
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          delay: Math.random() * 5,
          ease: 'linear'
        }}
      />
    ))}
  </div>
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

  // ULTRA PREMIUM High-conversion registration page
  if (currentStep === 'register') {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section with Split Layout */}
        <div className="grid lg:grid-cols-2 min-h-screen">
          {/* Left Side - ULTRA PREMIUM Value Proposition */}
          <div className="relative overflow-hidden">
            {/* Multi-layer gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            {/* Animated mesh pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%),
                                  radial-gradient(circle at 75% 75%, rgba(255,255,255,0.15) 0%, transparent 50%)`
              }} />
            </div>
            
            {/* Floating particles */}
            <FloatingParticles />
            
            {/* Glowing orbs */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-20 right-20 w-64 h-64 bg-yellow-400/30 rounded-full blur-[100px]"
            />
            <motion.div
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute bottom-20 left-20 w-80 h-80 bg-emerald-300/20 rounded-full blur-[120px]"
            />
            
            <div className="relative z-10 p-8 lg:p-12 xl:p-16 flex flex-col justify-center min-h-screen">
              <div className="max-w-xl">
                {/* Logo */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <img src="/logo-atentai.png" alt="AtentAI" className="h-10 brightness-0 invert" />
                </motion.div>

                {/* URGENCY BADGE */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/40 backdrop-blur-sm mb-6"
                >
                  <Flame className="w-4 h-4 text-yellow-400 animate-pulse" />
                  <span className="text-yellow-300 font-bold text-sm uppercase tracking-wide">
                    🔥 Vagas Limitadas • Cadastro Gratuito
                  </span>
                </motion.div>

                {/* Main Headline - ULTRA IMPACTFUL */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-4"
                >
                  Ganhe de{' '}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400">
                      R$ 500
                    </span>
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -inset-1 bg-yellow-400/20 blur-lg rounded-lg -z-10"
                    />
                  </span>
                  {' '}a{' '}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-400 to-teal-400">
                      R$ 13.000
                    </span>
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      className="absolute -inset-1 bg-emerald-400/20 blur-lg rounded-lg -z-10"
                    />
                  </span>
                  <br />
                  <span className="text-white/90">por venda!</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed"
                >
                  Indique nossos serviços premium e ganhe{' '}
                  <span className="font-bold text-yellow-300 underline decoration-yellow-400/50 underline-offset-4">
                    até 20% de comissão
                  </span>
                  {' '}em cada venda fechada.
                </motion.p>

                {/* MEGA Stats Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="grid grid-cols-2 gap-4 mb-8"
                >
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:border-yellow-400/40 transition-all">
                      <Crown className="w-6 h-6 text-yellow-400 mb-2" />
                      <div className="text-3xl md:text-4xl font-black text-white">
                        20%
                      </div>
                      <p className="text-white/70 text-sm font-medium">Comissão por venda</p>
                    </div>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:border-emerald-400/40 transition-all">
                      <Trophy className="w-6 h-6 text-emerald-400 mb-2" />
                      <div className="text-3xl md:text-4xl font-black text-white">
                        <AnimatedCounter target={89} suffix="M+" prefix="R$" />
                      </div>
                      <p className="text-white/70 text-sm font-medium">Recuperados</p>
                    </div>
                  </div>
                </motion.div>

                {/* PREMIUM Trust Badges */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3 mb-8"
                >
                  {[
                    { icon: Zap, text: 'Cadastro 100% gratuito em 2 minutos', color: 'text-yellow-400' },
                    { icon: Banknote, text: 'Saques via PIX em até 24h', color: 'text-green-400' },
                    { icon: Target, text: 'Painel completo com métricas em tempo real', color: 'text-cyan-400' },
                    { icon: BadgeCheck, text: 'Suporte exclusivo para afiliados', color: 'text-purple-400' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.05 }}
                      className="flex items-center gap-3 text-white/90"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20`}>
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <span className="font-medium">{item.text}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* SOCIAL PROOF Testimonial */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl blur-xl" />
                  <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-white/95 text-lg italic mb-4 leading-relaxed">
                      "Em apenas 3 meses como afiliado, já gerei mais de{' '}
                      <span className="font-bold text-emerald-300">R$ 47.000</span>
                      {' '}em comissões. O sistema é incrível!"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        R
                      </div>
                      <div>
                        <p className="text-white font-bold">Ricardo Mendes</p>
                        <p className="text-white/60 text-sm flex items-center gap-1">
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                          Top Afiliado 2024
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Right Side - PREMIUM Registration Form */}
          <div className="flex items-center justify-center p-6 lg:p-12 bg-background">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full max-w-md"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="relative inline-block"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/40">
                    <Rocket className="w-10 h-10 text-white" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -inset-2 bg-emerald-500/20 rounded-3xl blur-xl -z-10"
                  />
                </motion.div>
                <h2 className="text-3xl font-black mt-6 mb-2">Crie sua conta grátis</h2>
                <p className="text-muted-foreground text-lg">E comece a ganhar ainda hoje</p>
                
                {/* Trust micro-badges */}
                <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Sem taxas
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Sem mensalidade
                  </span>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="font-semibold">Nome Completo</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Seu nome completo"
                    required
                    className="h-13 text-base border-2 focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-semibold">CPF</Label>
                    <MaskedInput
                      mask="cpf"
                      value={formData.cpf}
                      onChange={(value) => setFormData({ ...formData, cpf: value })}
                      showValidation={false}
                      className="h-13 text-base border-2 focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">WhatsApp</Label>
                    <MaskedInput
                      mask="phone"
                      value={formData.phone}
                      onChange={(value) => setFormData({ ...formData, phone: value })}
                      showValidation={false}
                      className="h-13 text-base border-2 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                    required
                    className="h-13 text-base border-2 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Estado</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => setFormData({ ...formData, state: value })}
                  >
                    <SelectTrigger className="h-13 text-base border-2 focus:border-emerald-500">
                      <SelectValue placeholder="Selecione seu estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAZILIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-semibold">Senha</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="h-13 text-base border-2 focus:border-emerald-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Confirmar</Label>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="h-13 text-base border-2 focus:border-emerald-500"
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
                  <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    Li e aceito os{' '}
                    <Link to="/termos" className="text-emerald-600 hover:underline font-medium">Termos do Programa</Link>
                    {' '}e a{' '}
                    <Link to="/privacidade" className="text-emerald-600 hover:underline font-medium">Política de Privacidade</Link>
                  </Label>
                </div>

                {/* MEGA CTA Button */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="pt-2"
                >
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Criando sua conta...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5 mr-2" />
                        Começar a Ganhar Agora
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Urgency message */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2"
                >
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span><strong className="text-foreground">+127 pessoas</strong> se cadastraram hoje</span>
                </motion.div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Já tem uma conta?{' '}
                  <Link to="/auth" className="text-emerald-600 hover:underline font-semibold">
                    Fazer login
                  </Link>
                </p>
              </div>

              {/* Security badges */}
              <div className="mt-8 flex items-center justify-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2 text-xs">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Dados protegidos</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span>Cadastro em 2 min</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Welcome step
  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-background dark:to-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center"
        >
          <Card className="border-0 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-400 rounded-full blur-3xl" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="relative w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border-2 border-white/30"
              >
                <PartyPopper className="w-14 h-14 text-white" />
              </motion.div>
              <h1 className="text-3xl font-black text-white mb-2 relative">Bem-vindo ao Time!</h1>
              <p className="text-white/90 text-xl font-medium relative">{formData.fullName}</p>
            </div>
            
            <CardContent className="p-8">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                  <Trophy className="w-4 h-4" />
                  Você agora é um Afiliado Premium!
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground mb-8">
                Sua conta foi criada com sucesso! Vamos te mostrar como{' '}
                <span className="text-foreground font-semibold">ganhar de R$ 500 a R$ 13.000 por venda</span>.
              </p>

              <Button
                onClick={() => setCurrentStep('commission')}
                size="lg"
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                Ver Como Funciona
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Commission step - UPDATED with 20%
  if (currentStep === 'commission') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-background dark:to-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-lg"
        >
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                  <CircleDollarSign className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-black mb-2">Sistema de Comissões</h2>
                <p className="text-muted-foreground">Transparência total nos seus ganhos</p>
              </div>

              <div className="space-y-4">
                {/* MEGA Commission Card */}
                <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl" />
                  </div>
                  <div className="relative flex items-center justify-between">
                    <div>
                      <span className="text-white/80 font-medium">Sua comissão padrão</span>
                      <div className="text-5xl font-black text-white mt-1">20%</div>
                    </div>
                    <Crown className="w-16 h-16 text-white/30" />
                  </div>
                  <p className="text-white/80 text-sm mt-3">
                    Por cada venda realizada através do seu link exclusivo
                  </p>
                </div>

                {/* Examples */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-muted">
                    <span className="text-sm font-medium text-muted-foreground">Limpa Nome</span>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">R$ 194</div>
                    <p className="text-xs text-muted-foreground mt-1">20% de R$ 970</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted">
                    <span className="text-sm font-medium text-muted-foreground">Consultoria</span>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">R$ 90</div>
                    <p className="text-xs text-muted-foreground mt-1">20% de R$ 450</p>
                  </div>
                </div>

                {/* Special case */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-500/10 dark:to-orange-500/10 border border-yellow-200 dark:border-yellow-500/30">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/20">
                      <Sparkles className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-bold text-yellow-700 dark:text-yellow-400">Inteligência Fiscal</p>
                      <p className="text-sm text-yellow-600/80 dark:text-yellow-400/80">
                        Ganhe <strong>até R$ 13.000</strong> por caso recuperado!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
                  <div className="flex items-start gap-3">
                    <Banknote className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400">Saques via PIX</p>
                      <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">
                        Solicite a qualquer momento, processados em até 24h úteis
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('welcome')}
                  className="flex-1 h-12"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={() => setCurrentStep('services')}
                  className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-500"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Services step
  if (currentStep === 'services') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-background dark:to-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-black mb-2">Serviços que Você Pode Vender</h2>
                <p className="text-muted-foreground">Produtos premium com alta conversão</p>
              </div>

              <div className="space-y-3">
                {SERVICES_INFO.map((service, i) => (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                      service.highlight 
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-500/10 dark:to-orange-500/10 border-2 border-yellow-300 dark:border-yellow-500/40' 
                        : 'bg-muted/50 hover:bg-muted border border-transparent'
                    }`}
                  >
                    <span className="text-3xl">{service.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{service.name}</h3>
                        {service.highlight && (
                          <span className="px-2 py-0.5 text-xs font-bold bg-yellow-400 text-yellow-900 rounded-full">
                            TOP GANHOS
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{service.basePrice}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-sm font-bold ${service.highlight ? 'text-yellow-600 dark:text-yellow-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {service.commission}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('commission')}
                  className="flex-1 h-12"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={() => setCurrentStep('link')}
                  className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-500"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Link step
  if (currentStep === 'link') {
    const affiliateLink = `${window.location.origin}/p/${affiliateCode}`;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-background dark:to-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-lg"
        >
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                  <LinkIcon className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-black mb-2">Seu Link Exclusivo</h2>
                <p className="text-muted-foreground">Compartilhe e ganhe com cada venda</p>
              </div>

              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-muted border-2 border-dashed border-muted-foreground/30">
                  <p className="text-sm text-muted-foreground mb-2 font-medium">Seu link de afiliado:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono break-all bg-background p-2 rounded-lg">{affiliateLink}</code>
                    <Button
                      variant={copied ? 'default' : 'outline'}
                      size="sm"
                      onClick={copyLink}
                      className={`shrink-0 ${copied ? 'bg-emerald-500' : ''}`}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
                  <p className="text-sm">
                    <strong className="text-emerald-700 dark:text-emerald-400">💡 Dica Pro:</strong>{' '}
                    <span className="text-emerald-600/80 dark:text-emerald-400/80">
                      Todo cliente que acessar este link será automaticamente vinculado a você. Compartilhe no WhatsApp, Instagram, TikTok e onde mais quiser!
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('services')}
                  className="flex-1 h-12"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={() => setCurrentStep('whatsapp')}
                  className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-500"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // WhatsApp/Final step with message simulation
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

*Documentos para análise fiscal:*
• SPED Fiscal e Contribuições
• Notas fiscais (entrada/saída)
• DCTF e guias de impostos
• Folha de pagamento

👉 *Faça sua análise gratuita:*
${affiliateLink}

_Estou à disposição para tirar dúvidas!_`;

    const copyWhatsAppMessage = () => {
      navigator.clipboard.writeText(whatsappMessage);
      toast.success('Mensagem copiada! Cole no WhatsApp.');
    };

    const openWhatsApp = () => {
      const encoded = encodeURIComponent(whatsappMessage);
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-background dark:to-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-0 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl" />
              </div>
              <div className="flex items-center gap-4 relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30"
                >
                  <MessageCircle className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-black text-white">Mensagem Pronta!</h1>
                  <p className="text-white/80">Copie e envie pelo WhatsApp</p>
                </div>
              </div>
            </div>
            
            <CardContent className="p-6">
              {/* WhatsApp Message Preview */}
              <div className="bg-[#e5ddd5] dark:bg-[#0b141a] rounded-xl p-4 mb-6">
                <div className="bg-[#dcf8c6] dark:bg-[#005c4b] rounded-lg p-4 max-w-[90%] ml-auto shadow-sm">
                  <pre className="whitespace-pre-wrap text-sm text-[#111b21] dark:text-white font-sans leading-relaxed">
                    {whatsappMessage}
                  </pre>
                  <p className="text-right text-xs text-[#667781] dark:text-[#8696a0] mt-2">
                    Agora ✓✓
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <Button
                  variant="outline"
                  onClick={copyWhatsAppMessage}
                  className="h-12"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Mensagem
                </Button>
                <Button
                  onClick={openWhatsApp}
                  className="h-12 bg-green-500 hover:bg-green-600"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Abrir WhatsApp
                </Button>
              </div>

              <div className="border-t pt-6">
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
                      className="p-3 rounded-xl bg-muted text-center"
                    >
                      <item.icon className={`w-6 h-6 mx-auto mb-1 ${item.color}`} />
                      <p className="text-xs font-semibold">{item.label}</p>
                    </motion.div>
                  ))}
                </div>

                <Button
                  onClick={goToPanel}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/30"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Acessar Meu Painel
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return null;
}
