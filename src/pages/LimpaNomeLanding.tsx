import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMPCheckout } from "@/contexts/MPCheckoutContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Shield, Lock, CheckCircle2, 
  Building2, Zap, Star, ArrowRight, ArrowLeft, XCircle,
  Clock, Users, Heart, Handshake, Phone,
  MessageCircle, Sparkles, Gift, ChevronDown,
  TrendingUp, Award, User, Scale, ThumbsUp,
  CreditCard, AlertTriangle, Ban, BadgeCheck
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import limpaNomeHeroImage from "@/assets/limpa-nome-hero.png";

// Parceiro fixo - Guilherme é responsável pelo Limpa Nome
const PARTNER_INFO = {
  name: 'Guilherme Barros',
  role: 'Especialista em Limpa Nome',
  avatar: null,
};

// Pain points for high conversion
const PAIN_POINTS = [
  "Cansado de ter crédito negado?",
  "Seu nome está sujo na praça?",
  "Cobradores ligando todo dia?",
  "Não consegue financiar nada?",
];

export default function LimpaNomeLanding() {
  const navigate = useNavigate();
  const { openCheckout } = useMPCheckout();
  const { user } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });
  const [selectedPlan, setSelectedPlan] = useState<'pf' | 'pj'>('pf');
  const [urgencyMinutes, setUrgencyMinutes] = useState(14);
  const [urgencySeconds, setUrgencySeconds] = useState(59);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // FAQ Data
  const faqs = [
    { question: "Isso é legal?", answer: "Sim! Usamos liminar coletiva e antecipação do prazo prescricional, ambos previstos no Código de Defesa do Consumidor." },
    { question: "Em quanto tempo meu nome fica limpo?", answer: "Em média 7 dias úteis após o início do processo jurídico. Casos mais complexos podem levar até 30 dias." },
    { question: "Funciona para qualquer dívida?", answer: "Funciona para dívidas prescritas ou com irregularidades. Fazemos uma análise prévia do seu caso." },
    { question: "Qual a garantia?", answer: "100% de satisfação ou seu dinheiro de volta. Se não conseguirmos limpar seu nome, devolvemos o valor integral." },
  ];

  // Open MP checkout modal with PIX + Card
  const openLimpaNomeCheckout = (plan: 'pf' | 'pj') => {
    // Guest users → redirect to guest checkout page
    if (!user) {
      navigate(`/checkout/limpa-nome-${plan}`);
      return;
    }

    const config = plan === 'pf' 
      ? { amountCents: 82450, serviceName: 'Limpa Nome Pessoa Física', serviceType: 'credit_repair_pf', gradient: 'from-blue-500 to-cyan-500' }
      : { amountCents: 128000, serviceName: 'Limpa Nome Empresa (CNPJ)', serviceType: 'credit_repair_pj', gradient: 'from-emerald-500 to-teal-500' };
    
    openCheckout({
      ...config,
      description: 'Regularização de restrições com análise humana especializada',
      allowedMethods: ['pix', 'card'],
      isRecurring: false,
      onSuccess: () => {
        navigate('/painel');
      },
    });
  };

  const handleDirectCheckout = () => openLimpaNomeCheckout(selectedPlan);

  useEffect(() => {
    const timer = setInterval(() => {
      setUrgencySeconds(prev => {
        if (prev === 0) {
          setUrgencyMinutes(m => m === 0 ? 14 : m - 1);
          return 59;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckoutPF = () => openLimpaNomeCheckout('pf');
  const handleCheckoutPJ = () => openLimpaNomeCheckout('pj');

  const handleNavigate = (section: string) => {
    if (section === "hero") {
      heroRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/?section=${section}`);
    }
  };

  const plans = {
    pf: { price: 824.50, originalPrice: 1238, label: 'Pessoa Física', icon: User, description: 'Para CPF' },
    pj: { price: 1280, originalPrice: 1568, label: 'Empresa', icon: Building2, description: 'Para CNPJ' },
  };

  const benefits = [
    { 
      icon: Shield, 
      title: "Liminar Coletiva", 
      description: "Exclusão definitiva dos bureaus de crédito",
    },
    { 
      icon: Lock, 
      title: "100% Legal e Seguro", 
      description: "Processo jurídico completo e documentado",
    },
    { 
      icon: CreditCard, 
      title: "Nome limpo em até 7 dias", 
      description: "Agilidade no processo de limpeza",
    },
    { 
      icon: Scale, 
      title: "Acompanhamento jurídico", 
      description: "Suporte especializado durante todo processo",
    },
  ];

  const stats = [
    { value: "50.000+", label: "Nomes limpos" },
    { value: "98%", label: "Sucesso" },
    { value: "7 dias", label: "Prazo médio" },
    { value: "5.0", label: "Avaliação" },
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Autônoma",
      quote: "Depois de anos negativada, finalmente consegui limpar meu nome. Processo rápido e transparente!",
      avatar: "MS",
    },
    {
      name: "João Santos",
      role: "Empresário",
      quote: "A empresa estava com restrições há 3 anos. Em uma semana resolveram tudo!",
      avatar: "JS",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header padrão com logo original */}
      <Header onNavigate={handleNavigate} />
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        <div className="container max-w-5xl mx-auto px-4 py-12 sm:py-16 relative z-10">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate={isHeroInView ? "visible" : "hidden"}
            className="text-center"
          >
            {/* Trust Badge */}
            <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-red-600/20 backdrop-blur-sm border-2 border-red-500/50 text-red-400 font-bold text-xs sm:text-sm shadow-lg shadow-red-500/20 animate-pulse">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <AlertTriangle className="h-4 w-4" />
                <span>NOME SUJO? RESOLVA HOJE MESMO!</span>
              </div>
            </motion.div>
            
            {/* Pain Points Carousel */}
            <motion.div variants={itemVariants} className="mb-6">
              <div className="flex flex-wrap justify-center gap-3 px-4">
                {PAIN_POINTS.map((pain, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                    <XCircle className="h-3.5 w-3.5" />
                    <span>{pain}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            
            {/* Hero Image */}
            <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
              <div className="relative mx-auto max-w-sm sm:max-w-md md:max-w-lg overflow-hidden rounded-2xl shadow-2xl shadow-rose-500/20 border border-white/10">
                <img 
                  src={limpaNomeHeroImage} 
                  alt="Limpe seu nome" 
                  className="w-full h-auto object-cover object-top"
                  style={{ clipPath: 'inset(0 0 8% 0)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
              </div>
            </motion.div>
            
            {/* Headline */}
            <motion.h1 
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 tracking-tight px-2"
            >
              <span className="text-white">CHEGA</span> de ficar com o{" "}
              <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                NOME SUJO!
              </span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-base sm:text-lg lg:text-xl text-slate-300 mb-4 max-w-2xl mx-auto px-4"
            >
              Limpe seu CPF ou CNPJ em <span className="text-green-400 font-bold">até 7 dias úteis</span> com
              <span className="text-white font-medium"> processo 100% jurídico</span> e
              <span className="text-rose-400 font-medium"> pagamento parcelado</span>.
            </motion.p>

            <motion.p variants={itemVariants} className="text-sm text-amber-400 font-semibold mb-8">
              ⚠️ Não deixe mais o nome sujo te impedir de conquistar seus sonhos!
            </motion.p>

            {/* Price Cards with CTAs */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8 px-4">
              {/* Card CPF */}
              <div className="relative flex flex-col p-6 rounded-2xl border-2 border-blue-500/50 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 text-left hover:border-blue-400 transition-all group">
                <div className="absolute -top-3 left-4">
                  <Badge className="bg-blue-500 text-white border-0 shadow-lg text-xs">
                    PESSOA FÍSICA
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-blue-500">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-white">Limpa Nome CPF</p>
                    <p className="text-sm text-blue-300">Para pessoa física</p>
                  </div>
                </div>
                <div className="mb-1">
                  <span className="text-sm text-blue-300/60 line-through">R$ 1.238,00</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-blue-300">R$</span>
                  <span className="text-5xl font-bold text-white">
                    824
                  </span>
                  <span className="text-sm text-blue-300">,50</span>
                </div>
                <p className="text-green-400 text-sm font-semibold mt-1">
                  ou 4x de R$ 206,13 sem juros
                </p>
                <div className="mt-4 pt-4 border-t border-blue-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span>Exclusão de todas as restrições</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span>Liminar coletiva jurídica</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span>Acompanhamento por 90 dias</span>
                  </div>
                </div>
                <Button 
                  onClick={handleCheckoutPF}
                  className="w-full mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-6 text-base shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all"
                >
                  <Shield className="h-5 w-5 mr-2" />
                  Limpar meu CPF agora
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Card CNPJ */}
              <div className="relative flex flex-col p-6 rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-left hover:border-emerald-400 transition-all group">
                <div className="absolute -top-3 left-4">
                  <Badge className="bg-emerald-500 text-white border-0 shadow-lg text-xs">
                    EMPRESA • MAIS PEDIDO
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-emerald-500">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-white">Limpa Nome CNPJ</p>
                    <p className="text-sm text-emerald-300">Para empresas</p>
                  </div>
                </div>
                <div className="mb-1">
                  <span className="text-sm text-emerald-300/60 line-through">R$ 1.568,00</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-emerald-300">R$</span>
                  <span className="text-5xl font-bold text-white">
                    1.280
                  </span>
                  <span className="text-sm text-emerald-300">,00</span>
                </div>
                <p className="text-green-400 text-sm font-semibold mt-1">
                  ou 4x de R$ 320,00 sem juros
                </p>
                <div className="mt-4 pt-4 border-t border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span>Regularização completa do CNPJ</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span>Volte a ter crédito empresarial</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span>Processo jurídico completo</span>
                  </div>
                </div>
                <Button 
                  onClick={handleCheckoutPJ}
                  className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-6 text-base shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all"
                >
                  <Building2 className="h-5 w-5 mr-2" />
                  Limpar meu CNPJ agora
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>

            {/* Urgency Timer */}
            <motion.div variants={itemVariants} className="flex justify-center mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30">
                <div className="flex items-center gap-2 text-orange-400">
                  <Clock className="h-5 sm:h-6 w-5 sm:w-6 animate-pulse" />
                  <span className="font-bold text-2xl sm:text-3xl font-mono">
                    {String(urgencyMinutes).padStart(2, '0')}:{String(urgencySeconds).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-orange-300 text-xs sm:text-sm font-medium">
                  para garantir atendimento prioritário
                </span>
              </div>
            </motion.div>

            {/* Guarantee & Stats */}
            <motion.div variants={itemVariants} className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium">
                <Shield className="h-4 w-4" />
                <span>100% de satisfação ou seu dinheiro de volta</span>
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto"
            >
              {stats.map((stat, i) => (
                <div key={i} className="text-center p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container max-w-5xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Shield className="w-3 h-3 mr-2" />
              Como funciona
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Processo seguro e transparente
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:border-rose-500/50 transition-all duration-300">
                  <CardContent className="p-6 flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <benefit.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Human Touch Section */}
      <section className="py-16 sm:py-20">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-rose-500/10 text-rose-500 border-rose-500/20">
                <Heart className="h-3 w-3 mr-1" />
                Atendimento Humano
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Um parceiro real cuidando do seu caso
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Nada de robôs ou respostas automáticas. Você terá um especialista 
                dedicado que vai entender sua situação e trabalhar para resolver.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="p-3 rounded-full bg-rose-500/20">
                    <MessageCircle className="h-6 w-6 text-rose-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Chat direto com seu especialista</p>
                    <p className="text-sm text-muted-foreground">Tire dúvidas em tempo real</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="p-3 rounded-full bg-amber-500/20">
                    <TrendingUp className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Acompanhe o progresso</p>
                    <p className="text-sm text-muted-foreground">Status atualizado a cada etapa</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="p-3 rounded-full bg-primary/20">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Especialistas certificados</p>
                    <p className="text-sm text-muted-foreground">Profissionais com experiência comprovada</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <Card className="w-full max-w-md border-2 border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-pink-500/5">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-20 w-20 border-4 border-rose-500/30">
                      <AvatarFallback className="bg-rose-500/20 text-rose-600 text-2xl font-bold">
                        GM
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-xl text-foreground">{PARTNER_INFO.name}</p>
                      <p className="text-sm text-muted-foreground">{PARTNER_INFO.role}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="text-sm text-muted-foreground ml-1">5.0</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-muted/50 border border-border mb-6">
                    <p className="text-muted-foreground italic">
                      "Olá! Sou especialista em Limpa Nome. Vou analisar pessoalmente 
                      seu caso e acompanhar todo o processo até a resolução. Conte comigo!"
                    </p>
                  </div>

                  <Button 
                    onClick={handleDirectCheckout}
                    className="w-full"
                  >
                    <Handshake className="h-5 w-5 mr-2" />
                    Conectar com Guilherme Barros
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container max-w-5xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Quem já limpou o nome com a gente
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-rose-500/10 text-rose-500">
                          {testimonial.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20">
        <div className="container max-w-3xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <MessageCircle className="w-3 h-3 mr-2" />
              Dúvidas frequentes
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Perguntas mais comuns
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full text-left p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{faq.question}</span>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                  </div>
                  {activeFaq === i && (
                    <p className="mt-3 text-muted-foreground">{faq.answer}</p>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
        <div className="container max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center p-8 sm:p-12 rounded-3xl border-2 border-green-500/30 bg-card"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <BadgeCheck className="h-10 w-10 text-green-500" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Garantia Total de Satisfação
            </h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Se não conseguirmos limpar seu nome, <span className="text-green-500 font-bold">devolvemos 100% do valor</span>. 
              Sem letras miúdas, sem complicação. É a nossa promessa.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600">
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm font-medium">Satisfação garantida</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600">
                <Gift className="h-4 w-4" />
                <span className="text-sm font-medium">Bônus: Aumento de Score</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 pb-28 sm:py-28 sm:pb-28">
        <div className="container max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className="h-12 w-12 text-rose-500 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Pronto para limpar seu nome?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Conecte-se agora com um especialista e resolva sua situação de vez.
            </p>
            <Button 
              size="lg"
              onClick={handleDirectCheckout}
              className="h-16 px-12 text-lg bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-70"
            >
              <Users className="h-5 w-5 mr-2" />
              Limpar meu nome agora
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
