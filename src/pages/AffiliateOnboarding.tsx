import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  ArrowLeft, Star, BadgeCheck, Sparkles, HelpCircle, Quote, MessageCircle, Rocket, DollarSign
} from 'lucide-react';
import { MaskedInput } from '@/components/ui/masked-input';

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000, prefix = '', suffix = '' }: { 
  end: number; 
  duration?: number; 
  prefix?: string; 
  suffix?: string;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString('pt-BR')}{suffix}</span>;
};

// Custom Briefcase icon to avoid naming conflict
const BriefcaseIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

// Services with commission data
const SERVICES = [
  { 
    name: 'Limpa Nome PF', 
    price: 970, 
    commission: 20, 
    icon: Shield,
    color: 'from-cyan-500 to-blue-600',
    description: 'Alta demanda'
  },
  { 
    name: 'Limpa Nome CNPJ', 
    price: 1290, 
    commission: 20, 
    icon: BriefcaseIcon,
    color: 'from-emerald-500 to-teal-600',
    description: 'Para empresas'
  },
  { 
    name: 'Análise Fiscal', 
    price: 4500, 
    commission: 15, 
    icon: BarChart3,
    color: 'from-violet-500 to-purple-600',
    description: 'Success fee'
  },
  { 
    name: 'Abertura de Empresa', 
    price: 500, 
    commission: 15, 
    icon: TrendingUp,
    color: 'from-orange-500 to-amber-600',
    description: 'Novo negócio'
  },
];

// Testimonials
const TESTIMONIALS = [
  {
    name: 'Carolina M.',
    role: 'Contadora Digital',
    avatar: '👩‍💼',
    text: 'Em 3 meses já ganhei mais de R$ 8.000 só indicando clientes que eu já atendia. O sistema de afiliados é muito simples!',
    rating: 5,
    earnings: 'R$ 8.200'
  },
  {
    name: 'Rafael S.',
    role: 'Consultor Financeiro',
    avatar: '👨‍💼',
    text: 'A cada cliente que indico para o Limpa Nome, recebo minha comissão em poucos dias. Excelente programa!',
    rating: 5,
    earnings: 'R$ 4.500'
  },
  {
    name: 'Amanda L.',
    role: 'Influenciadora de Finanças',
    avatar: '💫',
    text: 'Minha audiência adora os serviços. Já indiquei mais de 50 pessoas e a conversão é muito boa!',
    rating: 5,
    earnings: 'R$ 12.000'
  },
];

// FAQ Items
const FAQ_ITEMS = [
  {
    question: 'Quanto tempo leva para receber minhas comissões?',
    answer: 'As comissões são creditadas em sua conta de afiliado assim que o cliente efetua o pagamento. Você pode solicitar o saque a qualquer momento após atingir o mínimo de R$ 50.'
  },
  {
    question: 'Preciso ter CNPJ para ser afiliado?',
    answer: 'Não! Você pode ser afiliado como pessoa física. Basta ter CPF válido e uma conta bancária para receber suas comissões via PIX.'
  },
  {
    question: 'Como acompanho minhas indicações e ganhos?',
    answer: 'Você terá acesso a um painel completo onde pode ver em tempo real todas as indicações, conversões, comissões pendentes e valores já sacados.'
  },
  {
    question: 'Existe um limite de quanto posso ganhar?',
    answer: 'Não há limite! Quanto mais você indicar, mais você ganha. Temos afiliados que ganham mais de R$ 10.000 por mês apenas com indicações.'
  },
  {
    question: 'Como funciona o cupom de desconto?',
    answer: 'Você pode criar cupons personalizados para oferecer descontos exclusivos aos seus indicados. Isso aumenta a conversão e você ainda ganha sua comissão integral!'
  },
];

export default function AffiliateOnboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background - Same as Homepage */}
      <div className="fixed inset-0 hero-gradient" />
      
      {/* Animated Mesh Gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-1/4 left-1/4 w-[700px] h-[700px] bg-primary/20 rounded-full blur-[180px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2 
          }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[150px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 4 
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/10 rounded-full blur-[200px]" 
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <motion.img 
                src="/logo-atentai.png" 
                alt="AtentAI" 
                className="h-10 w-auto drop-shadow-lg transition-all duration-300 group-hover:brightness-110 group-hover:scale-105"
                whileHover={{ scale: 1.05 }}
              />
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="text-white/70 hover:text-white hover:bg-white/10">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="hidden sm:flex border-accent/50 text-accent hover:bg-accent/10 hover:border-accent">
                <Link to="/auth">Já sou afiliado</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-16">
        {/* Hero Section - Premium Design */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              {/* Live Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                <span className="font-semibold">285 afiliados ativos agora</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]"
              >
                Ganhe{' '}
                <motion.span 
                  className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-400 to-accent"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  style={{ backgroundSize: "200% 200%" }}
                >
                  até R$ 900
                </motion.span>{' '}
                <span className="block">por indicação</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed"
              >
                Afiliados <span className="text-accent font-bold">já ganharam +R$ 150.000</span> indicando serviços financeiros de alta conversão.
                <span className="text-white font-semibold"> Comissões de até 20%.</span>
              </motion.p>

              {/* Live Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-10"
              >
                {[
                  { value: 285, suffix: '', label: 'Afiliados ao vivo', icon: Users },
                  { value: 95, suffix: '%', label: 'Taxa de pagamento', icon: CheckCircle2 },
                  { value: 48, suffix: 'h', label: 'Prazo de saque', icon: Clock },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md hover:border-accent/50 transition-all cursor-default"
                  >
                    <stat.icon className="w-5 h-5 text-accent mx-auto mb-2" />
                    <p className="text-2xl md:text-3xl font-bold text-white">
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-xs text-white/60">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Button - High Conversion */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="accent"
                    size="lg"
                    onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}
                    className="h-16 px-12 text-lg font-bold rounded-xl shadow-2xl shadow-accent/40 hover:shadow-accent/60 transition-all"
                  >
                    <Rocket className="mr-2 w-5 h-5" />
                    QUERO SER AFILIADO AGORA
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              </motion.div>

              {/* Trust Signals */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center justify-center gap-6 mt-8"
              >
                {[
                  { icon: Shield, text: 'Pagamento garantido' },
                  { icon: Zap, text: 'Cadastro em 30 segundos' },
                  { icon: Gift, text: 'Cupons personalizados' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/60 text-sm">
                    <item.icon className="w-4 h-4 text-accent" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Services with Animated Effects */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-accent/20 text-accent border-accent/30 px-4 py-2">
                <DollarSign className="w-4 h-4 mr-1" />
                Serviços de Alta Conversão
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Ganhe com cada indicação
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
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
                    whileHover={{ scale: 1.03, y: -10 }}
                  >
                    <Card className="h-full border-0 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all overflow-hidden group cursor-default relative">
                      {/* Gradient Top Border */}
                      <div className={`h-1.5 bg-gradient-to-r ${service.color}`} />
                      
                      {/* Hover Glow Effect */}
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-br ${service.color} blur-xl`} />
                      
                      <CardContent className="p-6 relative">
                        <div className="flex items-center gap-3 mb-4">
                          <motion.div 
                            className={`w-12 h-12 rounded-xl bg-gradient-to-r ${service.color} flex items-center justify-center shadow-lg`}
                            whileHover={{ rotate: 5, scale: 1.1 }}
                          >
                            <service.icon className="w-6 h-6 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="font-bold text-white text-lg">{service.name}</h3>
                            <span className="text-xs text-white/50">{service.description}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-white/50">Valor do serviço</span>
                            <span className="font-semibold text-white">R$ {service.price.toLocaleString('pt-BR')}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-white/50">Sua comissão</span>
                            <Badge className={`bg-gradient-to-r ${service.color} border-0 text-white font-bold`}>
                              {service.commission}%
                            </Badge>
                          </div>
                          <div className="pt-4 border-t border-white/10">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-white/50">Você ganha</span>
                              <motion.span 
                                className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-400"
                                whileHover={{ scale: 1.05 }}
                              >
                                R$ {earning.toLocaleString('pt-BR')}
                              </motion.span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Earnings Example */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 backdrop-blur-md">
                <Sparkles className="w-6 h-6 text-accent" />
                <span className="text-white font-semibold">
                  Exemplo: 10 indicações de Limpa Nome = <span className="text-accent text-xl font-black">R$ 1.940</span> na sua conta
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />
          
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-yellow-500/20 text-yellow-400 border-yellow-500/30 px-4 py-2">
                <Star className="w-4 h-4 mr-1 fill-yellow-400" />
                Depoimentos Reais
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Afiliados que já faturam
              </h2>
              <p className="text-lg text-white/60">
                Histórias de sucesso do nosso programa
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {TESTIMONIALS.map((testimonial, i) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card className="h-full border-0 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all relative overflow-hidden group">
                    {/* Earnings Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-accent/20 text-accent border-accent/30 font-bold">
                        {testimonial.earnings}
                      </Badge>
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center text-3xl border-2 border-white/20">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{testimonial.name}</h4>
                          <p className="text-sm text-white/50">{testimonial.role}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: testimonial.rating }).map((_, j) => (
                          <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      
                      <Quote className="w-8 h-8 text-accent/30 mb-2" />
                      <p className="text-white/80 leading-relaxed italic">
                        "{testimonial.text}"
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Registration Form */}
        <section id="register" className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-10"
              >
                <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 px-4 py-2">
                  <Rocket className="w-4 h-4 mr-1" />
                  Cadastro Rápido
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Comece a ganhar agora
                </h2>
                <p className="text-white/60">
                  Cadastro gratuito em 30 segundos
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 bg-white/5 backdrop-blur-xl shadow-2xl">
                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-white/80">Nome completo</Label>
                        <Input
                          id="fullName"
                          placeholder="Seu nome"
                          value={formData.fullName}
                          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-accent h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white/80">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-accent h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-white/80">WhatsApp</Label>
                        <MaskedInput
                          id="phone"
                          mask="phone"
                          placeholder="(00) 00000-0000"
                          value={formData.phone}
                          onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                          showValidation={false}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-accent h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-white/80">Senha</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mínimo 6 caracteres"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-accent h-12 pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 py-2">
                        <Checkbox
                          id="terms"
                          checked={formData.termsAccepted}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, termsAccepted: !!checked }))}
                          className="border-white/30 data-[state=checked]:bg-accent data-[state=checked]:border-accent mt-0.5"
                        />
                        <Label htmlFor="terms" className="text-sm text-white/60 cursor-pointer leading-relaxed">
                          Aceito os{' '}
                          <Link to="/termos-de-uso" className="text-accent hover:underline">
                            Termos de Uso
                          </Link>{' '}
                          e{' '}
                          <Link to="/politica-de-privacidade" className="text-accent hover:underline">
                            Política de Privacidade
                          </Link>
                        </Label>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <Button
                          type="submit"
                          variant="accent"
                          size="lg"
                          disabled={loading}
                          className="w-full h-14 text-lg font-bold shadow-xl shadow-accent/30"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Criando conta...
                            </>
                          ) : (
                            <>
                              <Rocket className="w-5 h-5 mr-2" />
                              CRIAR MINHA CONTA GRÁTIS
                            </>
                          )}
                        </Button>
                      </motion.div>

                      <p className="text-center text-sm text-white/40">
                        Já tem conta?{' '}
                        <Link to="/auth" className="text-accent hover:underline font-medium">
                          Fazer login
                        </Link>
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge className="mb-4 bg-violet-500/20 text-violet-400 border-violet-500/30 px-4 py-2">
                <HelpCircle className="w-4 h-4 mr-1" />
                Dúvidas Frequentes
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Perguntas frequentes
              </h2>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {FAQ_ITEMS.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <AccordionItem 
                      value={`item-${i}`} 
                      className="border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm px-6 overflow-hidden"
                    >
                      <AccordionTrigger className="text-white hover:text-accent py-5 text-left font-semibold">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-white/70 pb-5 leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-accent/10 to-transparent" />
          
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Pronto para começar a{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-400">
                  ganhar dinheiro
                </span>
                ?
              </h2>
              <p className="text-lg text-white/60 mb-10">
                Junte-se aos 285 afiliados que já estão lucrando com a AtentAI
              </p>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="accent"
                  size="lg"
                  onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}
                  className="h-16 px-12 text-lg font-bold rounded-xl shadow-2xl shadow-accent/40"
                >
                  <Rocket className="mr-2 w-6 h-6" />
                  QUERO SER AFILIADO AGORA
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <Link to="/" className="inline-block mb-4">
            <img src="/logo-atentai.png" alt="AtentAI" className="h-8 w-auto mx-auto opacity-70 hover:opacity-100 transition-opacity" />
          </Link>
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} AtentAI. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
