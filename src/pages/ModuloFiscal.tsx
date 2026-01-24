import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, Lock, FileCheck, TrendingUp, CheckCircle2, 
  FileText, Building2, Scale, Zap, Star, ArrowRight, 
  Play, Clock, BarChart3, Target, Sparkles, 
  ShieldCheck, FileSearch, Receipt, CircleDollarSign,
  XCircle, ArrowDown, ChevronRight, Quote, BadgePercent
} from "lucide-react";
import { FiscalAnalysisFormModern } from "@/components/fiscal/FiscalAnalysisFormModern";
import { motion, useInView } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function ModuloFiscal() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });
  const [urgencyMinutes, setUrgencyMinutes] = useState(14);
  const [urgencySeconds, setUrgencySeconds] = useState(59);

  // Timer de urgência
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

  const scrollToForm = () => setShowForm(true);

  const stats = [
    { value: "R$ 153M+", label: "Recuperados" },
    { value: "2.847", label: "Empresas" },
    { value: "100%", label: "Segurança" },
    { value: "0", label: "Malha Fina" },
  ];

  const beforeAfter = {
    before: [
      "Paga impostos sem conferência",
      "Risco de erros acumulados",
      "Créditos fiscais ignorados",
      "Exposição a autuações",
    ],
    after: [
      "Cada guia analisada tecnicamente",
      "Erros identificados e corrigidos",
      "Créditos recuperados automaticamente",
      "100% seguro e documentado",
    ],
  };

  const benefits = [
    { 
      icon: Lock, 
      title: "Sem alteração de faturamento", 
      description: "Análise 100% baseada em documentos oficiais",
      color: "from-blue-500 to-indigo-600"
    },
    { 
      icon: Shield, 
      title: "Bloqueio automático em risco", 
      description: "Se detectado risco, não executamos",
      color: "from-purple-500 to-pink-600"
    },
    { 
      icon: FileCheck, 
      title: "Relatório completo", 
      description: "Documentação 100% auditável",
      color: "from-amber-500 to-orange-600"
    },
    { 
      icon: CircleDollarSign, 
      title: "Pague apenas no êxito", 
      description: "50% do valor identificado",
      color: "from-emerald-500 to-teal-600"
    },
  ];

  const workflow = [
    { step: "1", title: "Envie sua Guia", description: "Upload simples", icon: FileText, time: "2 min" },
    { step: "2", title: "Análise Técnica", description: "Software + validação", icon: FileSearch, time: "24-48h" },
    { step: "3", title: "Gate de Segurança", description: "Verificação de riscos", icon: ShieldCheck, time: "Auto" },
    { step: "4", title: "Resultado", description: "Relatório completo", icon: BarChart3, time: "Imediato" },
  ];

  const regimes = [
    { name: "Simples Nacional", description: "Verificação de inconsistências", icon: Receipt, popular: true },
    { name: "Lucro Presumido", description: "Análise de créditos tributários", icon: Scale, popular: false },
    { name: "Lucro Real", description: "Auditoria fiscal avançada", icon: Target, popular: false },
  ];

  const testimonials = [
    {
      name: "Carlos Mendes",
      role: "CFO, MetalTech",
      quote: "Recuperamos créditos que não sabíamos que tínhamos. Processo 100% seguro.",
      savings: "R$ 847.000",
      avatar: "CM",
    },
    {
      name: "Ana Paula Ribeiro",
      role: "Diretora Financeira",
      quote: "Em 6 meses, identificaram oportunidades fiscais significativas.",
      savings: "R$ 1.2M",
      avatar: "AR",
    },
    {
      name: "Roberto Santana",
      role: "Contador Parceiro",
      quote: "Já indiquei mais de 50 clientes. Transparência impecável.",
      savings: "R$ 2.1M",
      avatar: "RS",
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

  const pulseVariants = {
    pulse: {
      scale: [1, 1.02, 1],
      boxShadow: [
        "0 0 0 0 rgba(16, 185, 129, 0.4)",
        "0 0 0 20px rgba(16, 185, 129, 0)",
        "0 0 0 0 rgba(16, 185, 129, 0)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header onNavigate={handleNavigate} />
        <div className="pt-24 pb-16 px-4">
          <FiscalAnalysisFormModern 
            onSuccess={() => navigate('/modulo-fiscal/sucesso')} 
            onBack={() => setShowForm(false)}
          />
        </div>
        <Footer onNavigate={handleNavigate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header onNavigate={handleNavigate} />
      
      {/* Hero Section - Ultra Modern */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
        {/* Background - Matching FiscalModuleSection */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        {/* Grid pattern overlay */}
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
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span>+2.847 empresas já analisadas</span>
              </div>
            </motion.div>
            
            {/* Headline */}
            <motion.h1 
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 tracking-tight px-2"
            >
              Descubra quanto sua empresa
              <span className="block bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent mt-2">pode economizar</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-base sm:text-lg lg:text-xl text-slate-300 mb-8 sm:mb-10 max-w-2xl mx-auto px-4"
            >
              Análise fiscal <span className="text-white font-medium">100% segura</span> com 
              <span className="text-emerald-400 font-medium"> pagamento apenas no êxito</span>. 
              Sem resultado = sem custo.
            </motion.p>

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
                  para garantir análise prioritária
                </span>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 sm:mb-12 px-4">
              <Button 
                size="lg" 
                onClick={scrollToForm}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 group"
              >
                <Zap className="h-5 w-5 mr-2" />
                Solicitar Análise Gratuita
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-white/30 text-white hover:bg-white/10 py-5 sm:py-6 text-base sm:text-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Como Funciona
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

            {/* Scroll Indicator */}
            <motion.div 
              variants={itemVariants}
              className="mt-12 sm:mt-16 flex flex-col items-center gap-2"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowDown className="h-5 w-5 text-slate-500" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Before vs After - Modern */}
      <section className="py-16 sm:py-20 lg:py-28 bg-background">
        <div className="container max-w-5xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground mb-4">
              A diferença que faz <span className="text-primary">diferença</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
            {/* Before */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
            >
              <Card className="h-full border-destructive/20 bg-destructive/5">
                <CardContent className="p-5 sm:p-8">
                  <div className="flex items-center gap-3 mb-6 sm:mb-8">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                      <XCircle className="h-5 sm:h-6 w-5 sm:w-6 text-destructive" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">Antes</h3>
                  </div>
                  <ul className="space-y-3 sm:space-y-4">
                    {beforeAfter.before.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-muted-foreground text-sm sm:text-base">
                        <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* After */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
            >
              <Card className="h-full border-success/20 bg-success/5 relative">
                <div className="absolute top-4 right-4">
                  <Badge className="bg-success/20 text-success border-success/30 text-xs">
                    Recomendado
                  </Badge>
                </div>
                <CardContent className="p-5 sm:p-8">
                  <div className="flex items-center gap-3 mb-6 sm:mb-8">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-success/20 flex items-center justify-center">
                      <CheckCircle2 className="h-5 sm:h-6 w-5 sm:w-6 text-success" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">Depois</h3>
                  </div>
                  <ul className="space-y-3 sm:space-y-4">
                    {beforeAfter.after.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-foreground text-sm sm:text-base">
                        <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits - Modern Grid */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container max-w-5xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            className="text-center mb-12 sm:mb-16"
          >
            <Badge variant="outline" className="mb-4 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
              <Shield className="w-3 h-3 mr-2" />
              Garantias
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Por que escolher nossa análise
            </h2>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid sm:grid-cols-2 gap-4 sm:gap-6"
          >
            {benefits.map((benefit, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="h-full hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-5 sm:p-6 flex gap-3 sm:gap-4">
                    <div className={`h-10 sm:h-12 w-10 sm:w-12 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <benefit.icon className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">{benefit.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-16 sm:py-20">
        <div className="container max-w-5xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            className="text-center mb-12 sm:mb-16"
          >
            <Badge variant="outline" className="mb-4 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
              <Clock className="w-3 h-3 mr-2" />
              Processo Simples
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Como funciona
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {workflow.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full text-center hover:border-primary/50 transition-all duration-300">
                  <CardContent className="p-4 sm:p-6">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4 text-primary font-bold text-sm sm:text-base">
                      {step.step}
                    </div>
                    <step.icon className="h-6 sm:h-8 w-6 sm:w-8 text-primary mx-auto mb-3 sm:mb-4" />
                    <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">{step.description}</p>
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">{step.time}</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Regimes */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container max-w-5xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Atendemos todos os regimes
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {regimes.map((regime, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`h-full hover:border-primary/50 transition-all duration-300 ${regime.popular ? 'border-primary/50 shadow-lg' : ''}`}>
                  {regime.popular && (
                    <div className="text-center pt-4">
                      <Badge className="bg-primary text-xs">Mais Solicitado</Badge>
                    </div>
                  )}
                  <CardContent className="p-5 sm:p-6 text-center">
                    <regime.icon className="h-8 sm:h-10 w-8 sm:w-10 text-primary mx-auto mb-3 sm:mb-4" />
                    <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">{regime.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{regime.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Modern with matching colors */}
      <section className="py-16 sm:py-20 relative overflow-hidden">
        {/* Background - Matching FiscalModuleSection */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        <div className="container max-w-5xl mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            className="text-center mb-12 sm:mb-16"
          >
            <Badge className="mb-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
              <Star className="w-3 h-3 mr-2 fill-emerald-400 text-emerald-400" />
              Depoimentos
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              Resultados <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">reais</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full bg-white/5 backdrop-blur-sm border-white/10 hover:border-emerald-500/30 transition-all duration-300">
                  <CardContent className="p-5 sm:p-6">
                    <Quote className="h-6 sm:h-8 w-6 sm:w-8 text-emerald-500/30 mb-3 sm:mb-4" />
                    <p className="text-white/90 mb-4 sm:mb-6 italic text-sm sm:text-base">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                      <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs sm:text-sm font-bold text-emerald-400">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-xs sm:text-sm">{testimonial.name}</p>
                        <p className="text-[10px] sm:text-xs text-slate-400">{testimonial.role}</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {testimonial.savings} recuperados
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent" />
        
        <div className="container max-w-3xl mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
          >
            {/* Timer */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30">
                <div className="flex items-center gap-2 text-orange-400">
                  <Clock className="h-5 sm:h-6 w-5 sm:w-6 animate-pulse" />
                  <span className="font-bold text-2xl sm:text-3xl font-mono">
                    {String(urgencyMinutes).padStart(2, '0')}:{String(urgencySeconds).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-orange-300 text-xs sm:text-sm font-medium">
                  para garantir análise prioritária
                </span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-2">
              Pronto para descobrir suas oportunidades?
            </h2>
            <p className="text-base sm:text-lg text-slate-300 mb-8 sm:mb-10 max-w-xl mx-auto px-4">
              Análise gratuita. Sem compromisso. Sem risco.
            </p>
            <Button 
              size="lg" 
              onClick={scrollToForm}
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 group"
            >
              <Zap className="h-5 w-5 mr-2" />
              Solicitar Análise Gratuita
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="text-xs sm:text-sm text-slate-400 mt-4 sm:mt-6">
              Pagamento apenas se identificarmos oportunidades
            </p>
          </motion.div>
        </div>
      </section>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
