import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, Lock, FileCheck, TrendingUp, CheckCircle2, 
  FileText, Building2, Scale, Zap, Star, ArrowRight, 
  Play, Clock, BarChart3, Target, Sparkles, 
  ShieldCheck, FileSearch, Receipt, CircleDollarSign,
  XCircle, ArrowDown, ChevronRight, Quote
} from "lucide-react";
import { FiscalAnalysisForm } from "@/components/fiscal/FiscalAnalysisForm";
import { motion, useInView } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function ModuloFiscal() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });

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
      description: "Análise 100% baseada em documentos oficiais"
    },
    { 
      icon: Shield, 
      title: "Bloqueio automático em risco", 
      description: "Se detectado risco, não executamos"
    },
    { 
      icon: FileCheck, 
      title: "Relatório completo", 
      description: "Documentação 100% auditável"
    },
    { 
      icon: CircleDollarSign, 
      title: "Pague apenas no êxito", 
      description: "50% do valor identificado"
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

  if (showForm) {
    return (
      <div className="min-h-screen bg-background">
        <Header onNavigate={handleNavigate} />
        <div className="pt-20 pb-12 px-4">
          <div className="container max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => setShowForm(false)}
              className="mb-6"
            >
              ← Voltar
            </Button>
            <FiscalAnalysisForm onSuccess={() => navigate('/modulo-fiscal/sucesso')} />
          </div>
        </div>
        <Footer onNavigate={handleNavigate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header onNavigate={handleNavigate} />
      
      {/* Hero Section - Ultra Clean */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="container max-w-5xl mx-auto px-4 py-16 relative z-10">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate={isHeroInView ? "visible" : "hidden"}
            className="text-center"
          >
            {/* Trust Badge */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                <span>+2.847 empresas já analisadas</span>
              </div>
            </motion.div>
            
            {/* Headline */}
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight"
            >
              Descubra quanto sua empresa
              <span className="block text-accent mt-2">pode economizar</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-lg lg:text-xl text-white/70 mb-10 max-w-2xl mx-auto"
            >
              Análise fiscal <span className="text-white font-medium">100% segura</span> com 
              <span className="text-accent font-medium"> pagamento apenas no êxito</span>. 
              Sem resultado = sem custo.
            </motion.p>

            {/* CTA */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                variant="accent"
                onClick={scrollToForm}
                className="text-lg px-8 py-6 shadow-xl shadow-accent/20 group"
              >
                <Zap className="h-5 w-5 mr-2" />
                Solicitar Análise Gratuita
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-white/30 text-white hover:bg-white/10 py-6"
              >
                <Play className="h-5 w-5 mr-2" />
                Como Funciona
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto"
            >
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/60">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div 
              variants={itemVariants}
              className="mt-16 flex flex-col items-center gap-2"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowDown className="h-5 w-5 text-white/50" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Before vs After - Minimal */}
      <section className="py-20 lg:py-28">
        <div className="container max-w-5xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
              A diferença que faz <span className="text-primary">diferença</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-destructive/20 bg-destructive/5">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                      <XCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Antes</h3>
                  </div>
                  <ul className="space-y-4">
                    {beforeAfter.before.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-muted-foreground">
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
              viewport={{ once: true }}
            >
              <Card className="h-full border-success/20 bg-success/5 relative">
                <div className="absolute top-4 right-4">
                  <Badge className="bg-success/20 text-success border-success/30">
                    Recomendado
                  </Badge>
                </div>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Depois</h3>
                  </div>
                  <ul className="space-y-4">
                    {beforeAfter.after.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-foreground">
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

      {/* Benefits - Clean Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-5xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Shield className="w-3 h-3 mr-2" />
              Garantias
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Por que escolher nossa análise
            </h2>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 gap-6"
          >
            {benefits.map((benefit, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="h-full hover:border-primary/50 transition-all duration-300">
                  <CardContent className="p-6 flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-20">
        <div className="container max-w-5xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Clock className="w-3 h-3 mr-2" />
              Processo Simples
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Como funciona
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflow.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full text-center hover:border-primary/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary font-bold">
                      {step.step}
                    </div>
                    <step.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                    <Badge variant="secondary" className="text-xs">{step.time}</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Regimes */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-5xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Atendemos todos os regimes
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {regimes.map((regime, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`h-full hover:border-primary/50 transition-all duration-300 ${regime.popular ? 'border-primary/50 shadow-lg' : ''}`}>
                  {regime.popular && (
                    <div className="text-center pt-4">
                      <Badge className="bg-primary">Mais Solicitado</Badge>
                    </div>
                  )}
                  <CardContent className="p-6 text-center">
                    <regime.icon className="h-10 w-10 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">{regime.name}</h3>
                    <p className="text-sm text-muted-foreground">{regime.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Clean */}
      <section className="py-20">
        <div className="container max-w-5xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Star className="w-3 h-3 mr-2 fill-accent text-accent" />
              Depoimentos
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Resultados reais
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
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
                    <Quote className="h-8 w-8 text-primary/20 mb-4" />
                    <p className="text-foreground mb-6 italic">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <Badge className="bg-success/20 text-success border-success/30">
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
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[150px]" />
        </div>
        
        <div className="container max-w-3xl mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Pronto para descobrir suas oportunidades?
            </h2>
            <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
              Análise gratuita. Sem compromisso. Sem risco.
            </p>
            <Button 
              size="lg" 
              variant="accent"
              onClick={scrollToForm}
              className="text-lg px-10 py-7 shadow-xl shadow-accent/20 group"
            >
              <Zap className="h-5 w-5 mr-2" />
              Solicitar Análise Gratuita
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="text-sm text-white/50 mt-6">
              Pagamento apenas se identificarmos oportunidades
            </p>
          </motion.div>
        </div>
      </section>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
