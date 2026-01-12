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
  BarChart3, Clock, Award, Play
} from 'lucide-react';

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Comissões alinhadas com os preços reais do sistema
const SERVICES_INFO = [
  {
    icon: '🧠',
    name: 'Inteligência Fiscal',
    description: 'Análise com IA para recuperação de créditos tributários',
    commission: 'Até R$ 500 por caso',
    basePrice: 'Taxa de êxito: 50% do valor recuperado'
  },
  {
    icon: '🛡️',
    name: 'Limpa Nome Premium',
    description: 'Regularização rápida com equipe jurídica especializada',
    commission: 'R$ 15 por venda',
    basePrice: 'Preço: R$ 97,00'
  },
  {
    icon: '📈',
    name: 'Consultoria Empresarial',
    description: 'Planejamento tributário personalizado',
    commission: 'R$ 68 por venda',
    basePrice: 'Preço: R$ 450,00'
  },
  {
    icon: '📄',
    name: 'Declaração de IR',
    description: 'IR Simples ou Completo',
    commission: 'R$ 23 a R$ 53',
    basePrice: 'Preço: R$ 150 a R$ 350'
  },
  {
    icon: '🏢',
    name: 'Abertura de Empresa',
    description: 'Abertura completa de CNPJ',
    commission: 'R$ 75 por venda',
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

  // High-conversion registration page
  if (currentStep === 'register') {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section with Split Layout */}
        <div className="grid lg:grid-cols-2 min-h-screen">
          {/* Left Side - Value Proposition */}
          <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 lg:p-16 flex flex-col justify-center overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>
            
            <div className="relative z-10 max-w-xl">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <img src="/logo-atentai.png" alt="AtentAI" className="h-10 brightness-0 invert" />
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6"
              >
                Ganhe até{' '}
                <span className="relative">
                  <span className="relative z-10">R$ 500</span>
                  <span className="absolute bottom-1 left-0 right-0 h-3 bg-white/30 -z-10" />
                </span>
                {' '}por indicação
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-white/90 mb-8"
              >
                Indique serviços premium de alta demanda e receba comissões automáticas de até 15% por cada venda.
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 gap-4 mb-8"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">
                    <AnimatedCounter target={89} suffix="M+" prefix="R$ " />
                  </div>
                  <p className="text-white/70 text-sm">Recuperados para empresas</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">
                    Até 15%
                  </div>
                  <p className="text-white/70 text-sm">Comissão por venda</p>
                </div>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                {[
                  { icon: Zap, text: 'Cadastro gratuito em 2 minutos' },
                  { icon: DollarSign, text: 'Saques via PIX em até 24h' },
                  { icon: BarChart3, text: 'Painel completo de vendas' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-white/90">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </motion.div>

              {/* Testimonial */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-10 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white/90 italic mb-4">
                  "Já gerei mais de R$ 20 mil em comissões nos primeiros 3 meses. O sistema é muito fácil de usar."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <div>
                    <p className="text-white font-medium">Marcos Silva</p>
                    <p className="text-white/60 text-sm">Afiliado desde 2024</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="flex items-center justify-center p-8 lg:p-16 bg-background">
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
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30"
                >
                  <Rocket className="w-8 h-8 text-primary-foreground" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Crie sua conta grátis</h2>
                <p className="text-muted-foreground">E comece a ganhar ainda hoje</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Seu nome completo"
                    required
                    className="h-12"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <MaskedInput
                      mask="cpf"
                      value={formData.cpf}
                      onChange={(value) => setFormData({ ...formData, cpf: value })}
                      showValidation={false}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <MaskedInput
                      mask="phone"
                      value={formData.phone}
                      onChange={(value) => setFormData({ ...formData, phone: value })}
                      showValidation={false}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => setFormData({ ...formData, state: value })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Selecione" />
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
                    <Label>Senha</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="h-12 pr-10"
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
                    <Label>Confirmar</Label>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: checked as boolean })}
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    Li e aceito os{' '}
                    <Link to="/termos" className="text-primary hover:underline">Termos do Programa</Link>
                    {' '}e a{' '}
                    <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  size="xl"
                  className="w-full mt-6 h-14 text-lg font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      Começar a Ganhar Agora
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Já tem uma conta?{' '}
                  <Link to="/auth" className="text-primary hover:underline font-medium">
                    Fazer login
                  </Link>
                </p>
              </div>

              {/* Security badges */}
              <div className="mt-8 flex items-center justify-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2 text-xs">
                  <Shield className="w-4 h-4" />
                  <span>Dados protegidos</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-4 h-4" />
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center"
        >
          <Card className="border-0 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4"
              >
                <PartyPopper className="w-12 h-12 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo ao Programa!</h1>
              <p className="text-white/80 text-lg">{formData.fullName}</p>
            </div>
            
            <CardContent className="p-8">
              <p className="text-lg text-muted-foreground mb-8">
                Sua conta foi criada com sucesso! Vamos te mostrar como começar a ganhar.
              </p>

              <Button
                onClick={() => setCurrentStep('commission')}
                size="xl"
                className="w-full"
              >
                Continuar
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Commission step
  if (currentStep === 'commission') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-lg"
        >
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Como Funciona a Comissão</h2>
                <p className="text-muted-foreground">Transparência total nos seus ganhos</p>
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium">Sua comissão</span>
                    <span className="text-4xl font-bold text-green-600">Até 15%</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Por cada venda realizada através do seu link exclusivo
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-muted">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium">Exemplo: Limpa Nome</span>
                    <span className="text-2xl font-bold text-foreground">R$ 15</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Serviço: R$ 97,00 → Sua comissão: R$ 14,55
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-muted">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium">Exemplo: Consultoria</span>
                    <span className="text-2xl font-bold text-foreground">R$ 68</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Serviço: R$ 450,00 → Sua comissão: R$ 67,50
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Gift className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Saques via PIX</p>
                      <p className="text-sm text-muted-foreground">
                        Solicite saques a qualquer momento, processados em até 24h
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
                  className="flex-1 h-12"
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Serviços que Você Pode Vender</h2>
                <p className="text-muted-foreground">Produtos de alta conversão e alto ticket</p>
              </div>

              <div className="space-y-3">
                {SERVICES_INFO.map((service, i) => (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="text-3xl">{service.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{service.basePrice}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-bold text-primary">{service.commission}</span>
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
                  className="flex-1 h-12"
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-lg"
        >
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
                  <LinkIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Seu Link Exclusivo</h2>
                <p className="text-muted-foreground">Compartilhe e ganhe com cada venda</p>
              </div>

              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-muted">
                  <p className="text-sm text-muted-foreground mb-2">Seu link de afiliado:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono break-all">{affiliateLink}</code>
                    <Button
                      variant={copied ? 'default' : 'outline'}
                      size="sm"
                      onClick={copyLink}
                      className="shrink-0"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-sm">
                    <strong>Dica:</strong> Todo cliente que acessar este link será automaticamente vinculado a você. Compartilhe no WhatsApp, redes sociais e onde mais quiser!
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
                  className="flex-1 h-12"
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
    
    const whatsappMessage = `🚀 *Olá! Preciso compartilhar algo importante com você.*

Descobri uma plataforma que está ajudando empresários a recuperar dinheiro e limpar restrições no CNPJ.

✅ *+R$ 89 milhões* já recuperados
✅ Análise *100% gratuita*
✅ Atendimento premium

*Serviços disponíveis:*
📊 Inteligência Fiscal - Recupere créditos
🛡️ Limpa Nome - A partir de R$ 97
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-0 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-6">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center"
                >
                  <MessageCircle className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Mensagem Pronta!</h1>
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
                <h3 className="font-semibold mb-4 text-center">Seu painel está pronto! 🎉</h3>
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    { icon: Users, label: 'Leads' },
                    { icon: DollarSign, label: 'Vendas' },
                    { icon: BarChart3, label: 'Comissões' },
                    { icon: Wallet, label: 'Saques' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="p-3 rounded-xl bg-muted text-center"
                    >
                      <item.icon className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <p className="text-xs font-medium">{item.label}</p>
                    </motion.div>
                  ))}
                </div>

                <Button
                  onClick={goToPanel}
                  size="xl"
                  className="w-full"
                >
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
