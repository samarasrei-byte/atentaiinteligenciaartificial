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
  ArrowLeft, Star, BadgeCheck, Sparkles, HelpCircle, Quote, MessageCircle
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
    price: 680, 
    commission: 20, 
    icon: Shield,
    color: 'from-cyan-500 to-blue-600'
  },
  { 
    name: 'Limpa Nome CNPJ', 
    price: 890, 
    commission: 20, 
    icon: BriefcaseIcon,
    color: 'from-emerald-500 to-teal-600'
  },
  { 
    name: 'Análise Fiscal', 
    price: 4500, 
    commission: 15, 
    icon: BarChart3,
    color: 'from-violet-500 to-purple-600'
  },
  { 
    name: 'Abertura de Empresa', 
    price: 500, 
    commission: 15, 
    icon: TrendingUp,
    color: 'from-orange-500 to-amber-600'
  },
];

// Target audience
const AUDIENCES = [
  { 
    title: 'Contadores', 
    description: 'Indique clientes e amplie sua receita',
    icon: BadgeCheck 
  },
  { 
    title: 'Consultores', 
    description: 'Agregue serviços à sua carteira',
    icon: Users 
  },
  { 
    title: 'Influenciadores', 
    description: 'Monetize sua audiência com serviços reais',
    icon: Star 
  },
  { 
    title: 'Autônomos', 
    description: 'Ganhe indicando empresas do seu dia a dia',
    icon: Sparkles 
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

// Trust signals
const TRUST_SIGNALS = [
  { icon: Shield, text: 'Pagamentos garantidos' },
  { icon: Zap, text: 'Sistema automatizado' },
  { icon: CheckCircle2, text: 'Plataforma segura' },
  { icon: BarChart3, text: 'Painel completo' },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo-atentai.png" alt="AtentAI" className="h-8 w-auto" />
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="text-white/70 hover:text-white hover:bg-white/10">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="hidden sm:flex border-white/20 text-white hover:bg-white/10">
                <Link to="/auth">Já sou afiliado</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section - Dark Theme */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px]" />
          </div>
          
          <div className="container relative mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <Badge className="mb-6 bg-gradient-to-r from-primary/20 to-violet-500/20 text-primary border-primary/30 px-6 py-2 text-sm">
                <Gift className="w-4 h-4 mr-2" />
                Programa de Afiliados Premium
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
                Ganhe{' '}
                <span className="bg-gradient-to-r from-primary via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  até 20%
                </span>{' '}
                de comissão
              </h1>
              
              <p className="text-lg md:text-xl text-white/60 mb-8 max-w-2xl mx-auto">
                Indique serviços financeiros de alta conversão e receba suas comissões automaticamente. 
                Sem limite de ganhos.
              </p>

              {/* Live Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-10">
                {[
                  { value: 500, suffix: '+', label: 'Afiliados ativos' },
                  { value: 95, suffix: '%', label: 'Taxa de pagamento' },
                  { value: 48, suffix: 'h', label: 'Prazo de saque' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                  >
                    <p className="text-2xl md:text-3xl font-bold text-white">
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-xs text-white/50">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  size="lg"
                  onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}
                  className="h-14 px-10 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all border-0"
                >
                  Começar a ganhar agora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Earnings Potential - Dark Cards */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                💰 Potencial de ganhos
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Quanto você pode ganhar
              </h2>
              <p className="text-lg text-white/60">
                Comissões reais em serviços de alta demanda
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {SERVICES.map((service, i) => {
                const earning = (service.price * service.commission) / 100;
                return (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="h-full border-0 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all overflow-hidden group">
                      <div className={`h-1 bg-gradient-to-r ${service.color}`} />
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${service.color} flex items-center justify-center`}>
                            <service.icon className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-semibold text-white">{service.name}</h3>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-white/50">Valor do serviço</span>
                            <span className="font-medium text-white">R$ {service.price.toLocaleString('pt-BR')}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-white/50">Comissão</span>
                            <Badge className={`bg-gradient-to-r ${service.color} border-0 text-white`}>
                              {service.commission}%
                            </Badge>
                          </div>
                          <div className="pt-3 border-t border-white/10">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-white/50">Você ganha</span>
                              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                R$ {earning.toLocaleString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials - Dark Theme */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
          
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
                <Star className="w-3 h-3 mr-1 fill-amber-400" />
                Depoimentos reais
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                O que nossos afiliados dizem
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {TESTIMONIALS.map((testimonial, i) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full border-0 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      
                      <Quote className="w-8 h-8 text-primary/30 mb-3" />
                      
                      <p className="text-white/80 mb-6 leading-relaxed">
                        "{testimonial.text}"
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{testimonial.avatar}</span>
                          <div>
                            <p className="font-semibold text-white">{testimonial.name}</p>
                            <p className="text-xs text-white/50">{testimonial.role}</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          {testimonial.earnings}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Who is this for */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Para quem é o programa
              </h2>
              <p className="text-lg text-white/60">
                Ideal para profissionais com rede de contatos empresariais
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {AUDIENCES.map((audience, i) => (
                <motion.div
                  key={audience.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full border-0 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center mx-auto mb-4">
                        <audience.icon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{audience.title}</h3>
                      <p className="text-sm text-white/60">{audience.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent" />
          
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-violet-500/20 text-violet-400 border-violet-500/30">
                <HelpCircle className="w-3 h-3 mr-1" />
                Perguntas frequentes
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Dúvidas sobre o programa
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
                    <AccordionItem value={`item-${i}`} className="border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm px-6 overflow-hidden">
                      <AccordionTrigger className="text-left text-white hover:no-underline py-5">
                        <span className="text-base font-medium">{item.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-white/70 pb-5">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Trust signals */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-8">
              {TRUST_SIGNALS.map((signal, i) => (
                <motion.div
                  key={signal.text}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <signal.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-white">{signal.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Registration Form - Dark Theme */}
        <section id="register" className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-md mx-auto"
            >
              <Card className="border-0 shadow-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Criar conta de afiliado
                    </h2>
                    <p className="text-white/60">
                      Comece a ganhar em minutos
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-white/80">Nome completo</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Seu nome completo"
                        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white/80">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="seu@email.com"
                        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white/80">WhatsApp</Label>
                      <MaskedInput
                        id="phone"
                        mask="phone"
                        value={formData.phone}
                        onChange={(value) => setFormData({ ...formData, phone: value })}
                        showValidation={false}
                        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white/80">Senha</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Mínimo 6 caracteres"
                          className="h-12 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pt-2">
                      <Checkbox
                        id="terms"
                        checked={formData.termsAccepted}
                        onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: checked as boolean })}
                        className="border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label htmlFor="terms" className="text-sm text-white/60 leading-relaxed cursor-pointer">
                        Li e aceito os{' '}
                        <Link to="/termos" className="text-primary hover:underline">Termos de Uso</Link>
                        {' '}e a{' '}
                        <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 text-base font-semibold rounded-xl mt-4 bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 border-0"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        <>
                          Criar minha conta de afiliado
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>

                  <p className="text-center text-sm text-white/50 mt-6">
                    Já tem conta?{' '}
                    <Link to="/auth" className="text-primary hover:underline font-medium">
                      Fazer login
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo-atentai.png" alt="AtentAI" className="h-6 w-auto" />
              <span className="text-sm text-white/50">© 2024 Atentai</span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-white/50">
              <Link to="/termos" className="hover:text-white transition-colors">Termos</Link>
              <Link to="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
