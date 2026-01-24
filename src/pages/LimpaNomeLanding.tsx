import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Shield, Lock, CheckCircle2, 
  Building2, Zap, Star, ArrowRight, ArrowLeft,
  Clock, Users, Heart, Handshake,
  MessageCircle, Sparkles,
  TrendingUp, Award, User, Scale,
  CreditCard
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Parceiro fixo
const PARTNER_INFO = {
  name: 'Guilherme Barros',
  role: 'Especialista em Limpa Nome',
  avatar: null,
};

export default function LimpaNomeLanding() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });
  const [selectedPlan, setSelectedPlan] = useState<'pf' | 'pj'>('pf');
  const [urgencyMinutes, setUrgencyMinutes] = useState(14);
  const [urgencySeconds, setUrgencySeconds] = useState(59);

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

  const handleNavigate = (section: string) => {
    if (section === "hero") {
      heroRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/?section=${section}`);
    }
  };

  const plans = {
    pf: { price: 680, label: 'Pessoa Física', icon: User, description: 'Para CPF' },
    pj: { price: 890, label: 'Empresa', icon: Building2, description: 'Para CNPJ' },
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
      <Header onNavigate={handleNavigate} />
      
      {/* Back Button - Fixed Position */}
      <div className="fixed top-20 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg border-slate-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
      
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
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs sm:text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400"></span>
                </span>
                <span>Atendimento humano especializado</span>
              </div>
            </motion.div>
            
            {/* Headline */}
            <motion.h1 
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 tracking-tight px-2"
            >
              Limpe seu nome com{" "}
              <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                acompanhamento humano
              </span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-base sm:text-lg lg:text-xl text-slate-300 mb-8 sm:mb-10 max-w-2xl mx-auto px-4"
            >
              Seu caso será analisado por um <span className="text-white font-medium">parceiro especializado</span>,
              com <span className="text-rose-400 font-medium">comunicação direta</span> e acompanhamento em tempo real.
            </motion.p>

            {/* Partner Preview */}
            <motion.div variants={itemVariants} className="flex justify-center mb-8">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Avatar className="h-14 w-14 border-2 border-rose-500/30">
                  <AvatarFallback className="bg-rose-500/20 text-rose-400 text-lg font-bold">
                    GM
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-semibold text-white">{PARTNER_INFO.name}</p>
                  <p className="text-sm text-slate-400">{PARTNER_INFO.role}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs text-slate-400 ml-1">5.0</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Plan Selector */}
            <motion.div variants={itemVariants} className="flex justify-center gap-4 mb-6">
              {(['pf', 'pj'] as const).map((plan) => {
                const PlanIcon = plans[plan].icon;
                const isSelected = selectedPlan === plan;
                return (
                  <button
                    key={plan}
                    onClick={() => setSelectedPlan(plan)}
                    className={`
                      flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all
                      ${isSelected 
                        ? 'border-rose-500 bg-rose-500/20 shadow-lg shadow-rose-500/20' 
                        : 'border-white/10 bg-white/5 hover:border-rose-500/50'
                      }
                    `}
                  >
                    <PlanIcon className={`h-5 w-5 ${isSelected ? 'text-rose-400' : 'text-slate-400'}`} />
                    <div className="text-left">
                      <p className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {plans[plan].label}
                      </p>
                      <p className="text-sm text-slate-400">
                        R$ {plans[plan].price.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    {isSelected && <CheckCircle2 className="h-5 w-5 text-rose-400" />}
                  </button>
                );
              })}
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

            {/* CTA */}
            <motion.div variants={itemVariants} className="flex justify-center mb-10 sm:mb-12 px-4">
              <Button 
                size="lg" 
                onClick={() => navigate(`/parceiro/onboarding?service=limpa-nome&plan=${selectedPlan}`)}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 rounded-xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all duration-300 group"
              >
                <Users className="h-5 w-5 mr-2" />
                Limpar meu nome agora
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            {/* Stats */}
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
                    onClick={() => navigate(`/parceiro/onboarding?service=limpa-nome&plan=${selectedPlan}`)}
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

      {/* Final CTA */}
      <section className="py-20 sm:py-28">
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
              onClick={() => navigate(`/parceiro/onboarding?service=limpa-nome&plan=${selectedPlan}`)}
              className="h-16 px-12 text-lg bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
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
