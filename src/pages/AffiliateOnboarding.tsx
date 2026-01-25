import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { 
  Eye, EyeOff, Loader2, Users, TrendingUp, Wallet, Shield, 
  ArrowRight, CheckCircle2, Zap, Gift, BarChart3, Clock,
  ArrowLeft, Star, BadgeCheck, Sparkles, HelpCircle, Quote, 
  MessageCircle, Rocket, DollarSign, Crown, Target, Coins,
  Globe, Award, Play, Building2, Briefcase, User, ChevronRight
} from 'lucide-react';
import { MaskedInput } from '@/components/ui/masked-input';

// ==================== ANIMATED COUNTER ====================
const AnimatedCounter = ({ 
  end, 
  duration = 2500, 
  prefix = '', 
  suffix = '',
  decimals = 0 
}: { 
  end: number; 
  duration?: number; 
  prefix?: string; 
  suffix?: string;
  decimals?: number;
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      setCount(easeOut * end);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, isVisible]);

  const formatNumber = (num: number) => {
    if (decimals > 0) {
      return num.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
    return Math.floor(num).toLocaleString('pt-BR');
  };

  return <span ref={ref}>{prefix}{formatNumber(count)}{suffix}</span>;
};

// ==================== GLASSMORPHISM BUTTON ====================
const GlassButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'default',
  className = '',
  loading = false,
  disabled = false,
  type = 'button'
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'default' | 'lg' | 'xl';
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-cyan-400/50 text-cyan-100 hover:from-cyan-500/30 hover:to-blue-600/30 hover:border-cyan-300/70 hover:shadow-cyan-500/25',
    secondary: 'bg-white/5 border-white/20 text-white/90 hover:bg-white/10 hover:border-white/40',
    accent: 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-emerald-400/60 text-emerald-100 hover:from-emerald-500/40 hover:to-teal-500/40 hover:border-emerald-300/80 hover:shadow-emerald-500/30'
  };

  const sizes = {
    default: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
    xl: 'px-12 py-5 text-lg'
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative overflow-hidden rounded-2xl font-bold
        backdrop-blur-xl border transition-all duration-300
        shadow-lg hover:shadow-2xl
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
      </span>
    </motion.button>
  );
};

// ==================== GLASS CARD ====================
const GlassCard = ({ 
  children, 
  className = '',
  hover = true,
  glow = false
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}) => (
  <motion.div
    whileHover={hover ? { y: -5, scale: 1.01 } : {}}
    className={`
      relative rounded-3xl p-6
      bg-gradient-to-br from-white/[0.08] to-white/[0.02]
      backdrop-blur-xl border border-white/10
      ${hover ? 'transition-all duration-300 hover:border-white/20 hover:shadow-2xl' : ''}
      ${glow ? 'shadow-lg shadow-cyan-500/10' : ''}
      ${className}
    `}
  >
    {children}
  </motion.div>
);

// ==================== SERVICES DATA ====================
const SERVICES = [
  { 
    name: 'Limpa Nome PF', 
    price: 970, 
    commission: 20, 
    icon: Shield,
    gradient: 'from-cyan-500 to-blue-600',
    bgGlow: 'cyan',
    description: 'Pessoa Física'
  },
  { 
    name: 'Limpa Nome CNPJ', 
    price: 1290, 
    commission: 20, 
    icon: Building2,
    gradient: 'from-emerald-500 to-teal-600',
    bgGlow: 'emerald',
    description: 'Empresas'
  },
  { 
    name: 'Análise Fiscal', 
    price: 4500, 
    commission: 15, 
    icon: BarChart3,
    gradient: 'from-violet-500 to-purple-600',
    bgGlow: 'violet',
    description: 'Recuperação'
  },
  { 
    name: 'Abertura Empresa', 
    price: 500, 
    commission: 15, 
    icon: Briefcase,
    gradient: 'from-amber-500 to-orange-600',
    bgGlow: 'amber',
    description: 'Novo CNPJ'
  },
];

// ==================== TARGET AUDIENCE ====================
const TARGET_AUDIENCE = [
  { title: 'Contadores', description: 'Aumente sua receita indicando clientes', icon: BarChart3 },
  { title: 'Consultores', description: 'Monetize sua rede de contatos', icon: Target },
  { title: 'Influenciadores', description: 'Ganhe indicando para sua audiência', icon: Users },
  { title: 'Profissionais PJ', description: 'Renda extra sem sair de casa', icon: Briefcase },
  { title: 'Agências', description: 'Novo canal de faturamento', icon: Building2 },
];

// ==================== TESTIMONIALS ====================
const TESTIMONIALS = [
  {
    name: 'Carolina M.',
    role: 'Contadora Digital',
    avatar: '👩‍💼',
    text: 'Em 3 meses já ganhei mais de R$ 8.000 só indicando clientes. O sistema é muito simples!',
    earnings: 'R$ 8.200',
    rating: 5
  },
  {
    name: 'Rafael S.',
    role: 'Consultor Financeiro',
    avatar: '👨‍💼',
    text: 'A cada cliente que indico para o Limpa Nome, recebo minha comissão em poucos dias.',
    earnings: 'R$ 4.500',
    rating: 5
  },
  {
    name: 'Amanda L.',
    role: 'Influenciadora',
    avatar: '💫',
    text: 'Minha audiência adora os serviços. Já indiquei mais de 50 pessoas!',
    earnings: 'R$ 12.000',
    rating: 5
  },
];

// ==================== FAQ ====================
const FAQ_ITEMS = [
  {
    question: 'Quanto tempo leva para receber minhas comissões?',
    answer: 'As comissões são creditadas assim que o cliente efetua o pagamento. Você pode solicitar saque a qualquer momento após atingir R$ 50.'
  },
  {
    question: 'Preciso ter CNPJ para ser afiliado?',
    answer: 'Não! Você pode ser afiliado como pessoa física. Basta ter CPF válido e uma conta bancária para receber via PIX.'
  },
  {
    question: 'Como acompanho minhas indicações?',
    answer: 'Você terá acesso a um painel completo onde pode ver em tempo real todas as indicações, conversões e comissões.'
  },
  {
    question: 'Existe um limite de quanto posso ganhar?',
    answer: 'Não há limite! Quanto mais você indicar, mais você ganha. Temos afiliados que ganham mais de R$ 10.000 por mês.'
  },
  {
    question: 'Como funciona o cupom de desconto?',
    answer: 'Você pode criar cupons personalizados para oferecer descontos exclusivos aos seus indicados.'
  },
];

// ==================== MAIN COMPONENT ====================
export default function AffiliateOnboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.3]);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    termsAccepted: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!formData.termsAccepted) {
      toast.error('Você precisa aceitar os termos de uso');
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
          data: {
            full_name: formData.fullName
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: affiliateError } = await supabase
          .from('affiliates')
          .insert({
            user_id: authData.user.id,
            full_name: formData.fullName,
            cpf: '00000000000',
            email: formData.email,
            phone: formData.phone.replace(/\D/g, ''),
            terms_accepted_at: new Date().toISOString()
          });

        if (affiliateError) throw affiliateError;

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (signInError) {
          toast.success('Cadastro realizado! Verifique seu email para confirmar.');
          navigate('/auth');
        } else {
          toast.success('Bem-vindo ao programa de afiliados!');
          navigate('/afiliado/painel');
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      if (error.message?.includes('already registered')) {
        toast.error('Este email já está cadastrado. Faça login.');
      } else {
        toast.error(error.message || 'Erro ao realizar cadastro');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden">
      {/* ==================== BACKGROUND EFFECTS ==================== */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Deep gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#030712] to-slate-950" />
        
        {/* Animated orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-cyan-500/20 rounded-full blur-[200px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
            x: [0, -50, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-violet-500/15 rounded-full blur-[180px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.08, 0.15, 0.08],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-emerald-500/10 rounded-full blur-[250px]" 
        />

        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }}
        />

        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC40Ii8+PC9zdmc+')]" />
      </div>

      {/* ==================== HEADER ==================== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <motion.img 
                src="/logo-atentai.png" 
                alt="AtentAI" 
                className="h-10 w-auto drop-shadow-2xl transition-all duration-300 group-hover:brightness-125"
                whileHover={{ scale: 1.05 }}
              />
            </Link>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                asChild 
                className="text-white/60 hover:text-white hover:bg-white/5"
              >
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <GlassButton 
                variant="secondary" 
                size="default"
                onClick={() => navigate('/auth')}
                className="hidden sm:flex"
              >
                Já sou afiliado
              </GlassButton>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-16">
        {/* ==================== HERO SECTION ==================== */}
        <section className="relative py-24 lg:py-36 overflow-hidden">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center max-w-5xl mx-auto"
            >
              {/* Live badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm mb-8"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
                <span className="font-semibold">285 afiliados ativos agora</span>
              </motion.div>
              
              {/* Main headline */}
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 tracking-tight leading-[1.05]"
              >
                Ganhe dinheiro indicando{' '}
                <span className="block mt-2">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400">
                    serviços financeiros
                  </span>
                </span>
                <span className="block text-white/90 mt-2">que já faturaram milhões</span>
              </motion.h1>
              
              {/* Subtitle */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl sm:text-2xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed"
              >
                Seja afiliado da Atentai e participe de um ecossistema que já gerou mais de{' '}
                <span className="text-emerald-400 font-bold">R$ 2.800.000,00</span>{' '}
                em comissões para parceiros.
              </motion.p>

              {/* Commission counter - HERO */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-12"
              >
                <GlassCard className="inline-flex flex-col items-center p-8 md:p-12" glow>
                  <span className="text-white/50 text-sm uppercase tracking-widest mb-3">
                    Total em comissões pagas
                  </span>
                  <span className="text-5xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                    R$ <AnimatedCounter end={2800000} prefix="" suffix="" duration={3000} />
                  </span>
                  <span className="text-white/40 text-sm mt-3">
                    E continua crescendo todos os dias
                  </span>
                </GlassCard>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-10"
              >
                <GlassButton
                  variant="accent"
                  size="xl"
                  onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group"
                >
                  <Rocket className="w-5 h-5" />
                  TORNAR-ME AFILIADO AGORA
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </GlassButton>
              </motion.div>

              {/* Trust badges */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap items-center justify-center gap-8"
              >
                {[
                  { icon: Shield, text: 'Pagamento garantido' },
                  { icon: Zap, text: 'Cadastro em 30 segundos' },
                  { icon: Gift, text: 'Cupons personalizados' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/40 text-sm">
                    <item.icon className="w-4 h-4 text-cyan-400" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ==================== SOCIAL PROOF STATS ==================== */}
        <section className="py-20 relative border-t border-white/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/30 px-4 py-2">
                <TrendingUp className="w-4 h-4 mr-1" />
                Prova Social
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Números que <span className="text-cyan-400">comprovam</span> resultados
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { value: 2800000, prefix: 'R$ ', suffix: '', label: 'Comissões pagas', icon: Coins, color: 'emerald' },
                { value: 285, prefix: '', suffix: '+', label: 'Parceiros ativos', icon: Users, color: 'cyan' },
                { value: 95, prefix: '', suffix: '%', label: 'Taxa de conversão', icon: Target, color: 'violet' },
                { value: 48, prefix: '', suffix: 'h', label: 'Prazo de saque', icon: Clock, color: 'amber' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <GlassCard className="text-center py-8" glow={i === 0}>
                    <stat.icon className={`w-8 h-8 mx-auto mb-4 text-${stat.color}-400`} />
                    <p className={`text-3xl md:text-4xl font-black text-${stat.color}-400`}>
                      <AnimatedCounter 
                        end={stat.value} 
                        prefix={stat.prefix} 
                        suffix={stat.suffix}
                        duration={2500}
                      />
                    </p>
                    <p className="text-white/50 text-sm mt-2">{stat.label}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== HOW IT WORKS ==================== */}
        <section className="py-20 relative border-t border-white/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-violet-500/10 text-violet-400 border-violet-500/30 px-4 py-2">
                <Play className="w-4 h-4 mr-1" />
                Como Funciona
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                4 passos para <span className="text-violet-400">começar a ganhar</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { step: '01', title: 'Cadastre-se', desc: 'Crie sua conta em 30 segundos', icon: User },
                { step: '02', title: 'Compartilhe', desc: 'Envie seu link exclusivo', icon: Globe },
                { step: '03', title: 'Cliente compra', desc: 'O cliente contrata o serviço', icon: CheckCircle2 },
                { step: '04', title: 'Receba comissão', desc: 'Ganhe até 20% por venda', icon: Wallet },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  <GlassCard className="text-center py-8 h-full">
                    {/* Step number */}
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-7xl font-black text-white/[0.03]">
                      {item.step}
                    </span>
                    
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center">
                      <item.icon className="w-7 h-7 text-violet-400" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-white/50 text-sm">{item.desc}</p>
                  </GlassCard>

                  {/* Arrow connector */}
                  {i < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                      <ChevronRight className="w-6 h-6 text-white/20" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== EARNINGS SECTION ==================== */}
        <section className="py-20 relative border-t border-white/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-4 py-2">
                <DollarSign className="w-4 h-4 mr-1" />
                Quanto Você Pode Ganhar
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Comissões de <span className="text-emerald-400">alta conversão</span>
              </h2>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">
                Serviços com demanda crescente e comissões generosas
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {SERVICES.map((service, i) => {
                const earning = (service.price * service.commission) / 100;
                return (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <GlassCard className="relative overflow-hidden h-full" glow={i === 0}>
                      {/* Glow background */}
                      <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${service.gradient} opacity-10 blur-3xl`} />
                      
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                        <service.icon className="w-7 h-7 text-white" />
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-bold text-white mb-1">{service.name}</h3>
                      <p className="text-white/40 text-xs mb-4">{service.description}</p>

                      {/* Price info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/50">Valor do serviço</span>
                          <span className="text-white font-medium">R$ {service.price}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/50">Sua comissão</span>
                          <span className={`font-bold text-${service.bgGlow}-400`}>{service.commission}%</span>
                        </div>
                      </div>

                      {/* Earning highlight */}
                      <div className={`rounded-xl bg-gradient-to-r ${service.gradient} p-0.5`}>
                        <div className="bg-slate-900 rounded-[10px] p-3 text-center">
                          <span className="text-white/50 text-xs block">Você ganha</span>
                          <span className="text-2xl font-black text-white">
                            R$ {earning.toLocaleString('pt-BR')}
                          </span>
                          <span className="text-white/50 text-xs block">por venda</span>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================== TARGET AUDIENCE ==================== */}
        <section className="py-20 relative border-t border-white/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-amber-500/10 text-amber-400 border-amber-500/30 px-4 py-2">
                <Users className="w-4 h-4 mr-1" />
                Para Quem É
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                O programa é para <span className="text-amber-400">você</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
              {TARGET_AUDIENCE.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GlassCard className="text-center py-6">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-amber-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-white/40 text-xs">{item.description}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== TESTIMONIALS ==================== */}
        <section className="py-20 relative border-t border-white/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/30 px-4 py-2">
                <Quote className="w-4 h-4 mr-1" />
                Depoimentos
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                O que nossos <span className="text-cyan-400">afiliados</span> dizem
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {TESTIMONIALS.map((testimonial, i) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <GlassCard className="h-full">
                    {/* Earnings badge */}
                    <div className="absolute -top-3 -right-3">
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold">
                        +{testimonial.earnings}
                      </Badge>
                    </div>

                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-white/70 text-sm mb-6 italic">"{testimonial.text}"</p>

                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{testimonial.avatar}</span>
                      <div>
                        <p className="text-white font-semibold">{testimonial.name}</p>
                        <p className="text-white/40 text-xs">{testimonial.role}</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== REGISTRATION FORM ==================== */}
        <section id="register" className="py-20 relative border-t border-white/5">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-10"
              >
                <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-4 py-2">
                  <Zap className="w-4 h-4 mr-1" />
                  Cadastro em 30 segundos
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Comece a <span className="text-emerald-400">ganhar agora</span>
                </h2>
                <p className="text-white/50">
                  Preencha os campos abaixo e acesse seu painel imediatamente
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <GlassCard className="p-8" glow>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">Nome completo</Label>
                      <Input
                        type="text"
                        placeholder="Seu nome"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus:border-emerald-500/50"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">E-mail</Label>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus:border-emerald-500/50"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">WhatsApp</Label>
                      <MaskedInput
                        mask="phone"
                        placeholder="(00) 00000-0000"
                        value={formData.phone}
                        onChange={(value) => setFormData({ ...formData, phone: value })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus:border-emerald-500/50"
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">Senha</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Mínimo 6 caracteres"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl pr-12 focus:border-emerald-500/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Terms */}
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms"
                        checked={formData.termsAccepted}
                        onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: checked as boolean })}
                        className="mt-1 border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                      <Label htmlFor="terms" className="text-sm text-white/50 cursor-pointer">
                        Aceito os{' '}
                        <Link to="/termos-de-uso" className="text-emerald-400 hover:underline">
                          termos de uso
                        </Link>
                        {' '}e a{' '}
                        <Link to="/politica-privacidade" className="text-emerald-400 hover:underline">
                          política de privacidade
                        </Link>
                      </Label>
                    </div>

                    {/* Submit */}
                    <GlassButton
                      type="submit"
                      variant="accent"
                      size="lg"
                      loading={loading}
                      disabled={loading}
                      className="w-full"
                    >
                      <Rocket className="w-5 h-5" />
                      CRIAR MINHA CONTA AGORA
                      <ArrowRight className="w-5 h-5" />
                    </GlassButton>
                  </form>

                  {/* Already have account */}
                  <p className="text-center text-white/40 text-sm mt-6">
                    Já tem conta?{' '}
                    <Link to="/auth" className="text-emerald-400 hover:underline font-medium">
                      Fazer login
                    </Link>
                  </p>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ==================== FAQ ==================== */}
        <section className="py-20 relative border-t border-white/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge className="mb-4 bg-white/5 text-white/60 border-white/10 px-4 py-2">
                <HelpCircle className="w-4 h-4 mr-1" />
                FAQ
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Perguntas frequentes
              </h2>
            </motion.div>

            <div className="max-w-2xl mx-auto">
              <Accordion type="single" collapsible className="space-y-3">
                {FAQ_ITEMS.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <AccordionItem 
                      value={`item-${i}`} 
                      className="border border-white/10 rounded-2xl bg-white/[0.02] backdrop-blur-sm px-6 overflow-hidden"
                    >
                      <AccordionTrigger className="text-white hover:text-emerald-400 hover:no-underline py-5 text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-white/60 pb-5">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* ==================== FINAL CTA ==================== */}
        <section className="py-24 relative border-t border-white/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              <Crown className="w-16 h-16 mx-auto mb-6 text-amber-400" />
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Pronto para começar a <span className="text-emerald-400">ganhar?</span>
              </h2>
              <p className="text-xl text-white/50 mb-10">
                Junte-se a centenas de afiliados que já estão lucrando com a Atentai
              </p>
              
              <GlassButton
                variant="accent"
                size="xl"
                onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}
                className="group"
              >
                <Rocket className="w-5 h-5" />
                QUERO SER AFILIADO AGORA
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </GlassButton>
            </motion.div>
          </div>
        </section>

        {/* ==================== FOOTER ==================== */}
        <footer className="py-12 border-t border-white/5">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <img src="/logo-atentai.png" alt="AtentAI" className="h-8" />
              <p className="text-white/30 text-sm">
                © 2025 AtentAI. Todos os direitos reservados.
              </p>
              <div className="flex gap-6">
                <Link to="/termos-de-uso" className="text-white/30 text-sm hover:text-white/60">
                  Termos
                </Link>
                <Link to="/politica-privacidade" className="text-white/30 text-sm hover:text-white/60">
                  Privacidade
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
