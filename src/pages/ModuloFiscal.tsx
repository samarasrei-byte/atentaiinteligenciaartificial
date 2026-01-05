import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, Lock, FileCheck, TrendingUp, AlertTriangle, CheckCircle2, 
  FileText, Building2, Scale, Eye, Zap, Star, Award, ArrowRight, 
  Play, Quote, Clock, Users, BarChart3, Target, Sparkles, 
  ShieldCheck, FileSearch, Receipt, CircleDollarSign, BadgePercent,
  XCircle, ArrowDown, Flame, ChevronRight
} from "lucide-react";
import { FiscalAnalysisForm } from "@/components/fiscal/FiscalAnalysisForm";
import { motion, useInView } from "framer-motion";
import { Header } from "@/components/layout/Header";

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
    { value: "R$ 153M+", label: "Recuperados", icon: TrendingUp, color: "emerald" },
    { value: "2.847", label: "Empresas Atendidas", icon: Building2, color: "blue" },
    { value: "100%", label: "Conformidade Legal", icon: Shield, color: "violet" },
    { value: "0", label: "Malha Fina", icon: CheckCircle2, color: "green" },
  ];

  const beforeAfter = {
    before: [
      { icon: XCircle, text: "Paga impostos sem conferência", color: "destructive" },
      { icon: XCircle, text: "Risco de erros acumulados", color: "destructive" },
      { icon: XCircle, text: "Créditos fiscais ignorados", color: "destructive" },
      { icon: XCircle, text: "Sem visibilidade de oportunidades", color: "destructive" },
      { icon: XCircle, text: "Exposição a autuações fiscais", color: "destructive" },
    ],
    after: [
      { icon: CheckCircle2, text: "Cada guia analisada tecnicamente", color: "success" },
      { icon: CheckCircle2, text: "Erros identificados e corrigidos", color: "success" },
      { icon: CheckCircle2, text: "Créditos recuperados automaticamente", color: "success" },
      { icon: CheckCircle2, text: "Dashboard de oportunidades fiscais", color: "success" },
      { icon: CheckCircle2, text: "100% seguro e documentado", color: "success" },
    ],
  };

  const benefits = [
    { 
      icon: Lock, 
      title: "Sem alteração de faturamento", 
      description: "Não manipulamos dados. Análise 100% baseada em documentos oficiais.",
      gradient: "from-blue-500 to-cyan-500"
    },
    { 
      icon: Shield, 
      title: "Bloqueio automático em risco", 
      description: "Se detectado qualquer risco de malha fina, o serviço não é executado.",
      gradient: "from-red-500 to-orange-500"
    },
    { 
      icon: FileCheck, 
      title: "Relatório fiscal completo", 
      description: "Documentação 100% auditável e transparente para sua contabilidade.",
      gradient: "from-emerald-500 to-teal-500"
    },
    { 
      icon: CircleDollarSign, 
      title: "Pagamento apenas no êxito", 
      description: "Você só paga 50% do valor identificado. Sem resultado = sem custo.",
      gradient: "from-violet-500 to-purple-500"
    },
  ];

  const workflow = [
    { 
      step: "1", 
      title: "Envie sua Guia", 
      description: "Upload simples da DAS ou guia equivalente",
      icon: FileText,
      time: "2 min"
    },
    { 
      step: "2", 
      title: "Análise Técnica", 
      description: "Software proprietário + validação especializada",
      icon: FileSearch,
      time: "24-48h"
    },
    { 
      step: "3", 
      title: "Gate de Segurança", 
      description: "Verificação de riscos antes de qualquer ação",
      icon: ShieldCheck,
      time: "Automático"
    },
    { 
      step: "4", 
      title: "Resultado", 
      description: "Relatório completo com valor identificado",
      icon: BarChart3,
      time: "Imediato"
    },
  ];

  const regimes = [
    { 
      name: "Simples Nacional", 
      description: "Verificação de inconsistências e risco de malha fina",
      icon: Receipt,
      features: ["Análise de DAS", "Verificação de limites", "Inconsistências"],
      popular: true
    },
    { 
      name: "Lucro Presumido", 
      description: "Análise de créditos e oportunidades técnicas",
      icon: Scale,
      features: ["Créditos tributários", "PIS/COFINS", "Otimização"],
      popular: false
    },
    { 
      name: "Lucro Real", 
      description: "Auditoria completa e otimização fiscal avançada",
      icon: Target,
      features: ["Auditoria completa", "IRPJ/CSLL", "Planejamento"],
      popular: false
    },
  ];

  const testimonials = [
    {
      name: "Carlos Mendes",
      role: "CFO",
      company: "MetalTech Soluções",
      quote: "Recuperamos créditos tributários que não sabíamos que tínhamos. O processo foi 100% seguro e documentado.",
      savings: "R$ 847.000",
      avatar: "CM",
    },
    {
      name: "Ana Paula Ribeiro",
      role: "Diretora Financeira",
      company: "Grupo Varejista Nacional",
      quote: "Em 6 meses, identificaram oportunidades fiscais significativas. Pagamento só no êxito nos deu total segurança.",
      savings: "R$ 1.200.000",
      avatar: "AR",
    },
    {
      name: "Roberto Santana",
      role: "Contador Parceiro",
      company: "Santana Contabilidade",
      quote: "Já indiquei mais de 50 clientes. A transparência e rastreabilidade do processo é impecável.",
      savings: "R$ 2.100.000",
      avatar: "RS",
    },
  ];

  const faqs = [
    {
      question: "Como funciona o pagamento?",
      answer: "Você só paga 50% do valor identificado após a análise. Se não identificarmos oportunidades, não há custo algum."
    },
    {
      question: "E se houver risco de malha fina?",
      answer: "Se detectarmos qualquer risco fiscal, o serviço é automaticamente cancelado. Sua segurança é nossa prioridade absoluta."
    },
    {
      question: "Vocês alteram meu faturamento?",
      answer: "Nunca. Trabalhamos apenas com análise de documentos oficiais, sem qualquer manipulação de dados declaratórios."
    },
    {
      question: "Quanto tempo leva a análise?",
      answer: "A análise inicial é concluída em 24-48 horas. Você recebe o relatório completo com todas as oportunidades identificadas."
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header onNavigate={handleNavigate} />
      
      {/* Hero Section - Same background as main landing */}
      <section ref={heroRef} className="relative min-h-[95vh] flex items-center justify-center overflow-hidden pt-16">
        {/* Background - same as HeroSection */}
        <div className="absolute inset-0 hero-gradient" />
        
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-success/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
        </div>
        
        <div className="container max-w-7xl mx-auto px-4 py-16 lg:py-24 relative z-10">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate={isHeroInView ? "visible" : "hidden"}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Trust Badge */}
            <motion.div variants={itemVariants} className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/20 backdrop-blur-sm border border-success/40 text-white text-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
                </span>
                <span className="font-semibold">+2.847 empresas analisadas</span>
              </div>
            </motion.div>

            {/* Urgency Badge */}
            <motion.div variants={itemVariants} className="mb-6">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-destructive/40 to-orange-500/40 backdrop-blur-sm border border-destructive/50 text-white text-sm animate-pulse shadow-lg shadow-destructive/30">
                <Flame className="w-4 h-4" />
                <span className="font-bold">🔥 Análise 100% Gratuita • Vagas Limitadas</span>
              </div>
            </motion.div>

            {/* Badge */}
            <motion.div variants={itemVariants} className="mb-8">
              <Badge variant="outline" className="px-5 py-2.5 border-white/30 bg-white/10 backdrop-blur-sm text-white/90 text-sm">
                <Sparkles className="h-4 w-4 mr-2 text-accent" />
                Inteligência Fiscal Técnica • Módulo Avançado
              </Badge>
            </motion.div>
            
            {/* Headline */}
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight"
            >
              Descubra Quanto sua Empresa
              <span className="block text-accent mt-2">Pode Economizar</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Análise fiscal <span className="text-white font-semibold">100% segura</span> com 
              <span className="text-accent font-semibold"> pagamento apenas no êxito</span>. 
              Se houver risco, não executamos. Simples assim.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Button 
                size="lg" 
                variant="accent"
                onClick={scrollToForm}
                className="text-lg px-8 py-6 shadow-2xl shadow-accent/30 hover:shadow-accent/50 transition-all group"
              >
                <Zap className="h-5 w-5 mr-2" />
                Solicitar Análise Gratuita
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 py-6"
              >
                <Play className="h-5 w-5 mr-2" />
                Como Funciona
              </Button>
            </motion.div>

            {/* Stats Row */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                  className="text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
                >
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-accent/30 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-accent" />
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/70">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Scroll indicator */}
            <motion.div 
              variants={itemVariants}
              className="mt-12 flex flex-col items-center gap-2"
            >
              <span className="text-white/60 text-sm">Descubra mais</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowDown className="h-6 w-6 text-accent" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Before vs After Section */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="container max-w-7xl mx-auto px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Eye className="h-4 w-4 mr-2" />
              Comparativo Visual
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              A Diferença que Faz{" "}
              <span className="text-primary">Diferença</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Veja como sua empresa pode se transformar com nossa análise fiscal
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Before Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="h-full border-2 border-destructive/30 bg-gradient-to-br from-destructive/5 to-background overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-destructive/20 flex items-center justify-center">
                      <XCircle className="h-7 w-7 text-destructive" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">Antes</h3>
                      <p className="text-muted-foreground">Sem análise fiscal</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {beforeAfter.before.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
                      >
                        <item.icon className="h-5 w-5 text-destructive flex-shrink-0" />
                        <span className="text-foreground font-medium">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* After Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="h-full border-2 border-success/30 bg-gradient-to-br from-success/5 to-background overflow-hidden relative">
                <div className="absolute top-4 right-4">
                  <Badge className="bg-success/20 text-success border-success/30">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Recomendado
                  </Badge>
                </div>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-success/20 flex items-center justify-center">
                      <CheckCircle2 className="h-7 w-7 text-success" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">Depois</h3>
                      <p className="text-muted-foreground">Com Módulo Fiscal</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {beforeAfter.after.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20"
                      >
                        <item.icon className="h-5 w-5 text-success flex-shrink-0" />
                        <span className="text-foreground font-medium">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* CTA after comparison */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <Button 
              size="lg" 
              onClick={scrollToForm}
              className="text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all group"
            >
              Quero o "Depois" para minha empresa
              <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-28 bg-muted/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="container max-w-7xl mx-auto px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Por que somos diferentes
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Segurança Total,{" "}
              <span className="text-primary">Resultado Garantido</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nossa metodologia prioriza sua segurança acima de tudo
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card className="h-full border-border/50 hover:border-primary/40 transition-all duration-300 bg-card hover:shadow-xl hover:-translate-y-1 group">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                      <benefit.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-20 lg:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="container max-w-7xl mx-auto px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Play className="h-4 w-4 mr-2" />
              Processo Simplificado
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Como Funciona
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Da solicitação ao resultado em poucos passos
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflow.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative"
              >
                <Card className="h-full border-border/50 bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/30">
                      {item.step}
                    </div>
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {item.time}
                    </Badge>
                  </CardContent>
                </Card>
                {i < workflow.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-primary/50" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* CTA after workflow */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <Button 
              size="lg" 
              onClick={scrollToForm}
              className="text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all group"
            >
              <Zap className="h-5 w-5 mr-2" />
              Começar Agora - É Gratuito
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Regimes Section */}
      <section className="py-20 lg:py-28 bg-muted/30 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[150px]" />
        <div className="container max-w-7xl mx-auto px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Scale className="h-4 w-4 mr-2" />
              Cobertura Completa
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Atendemos{" "}
              <span className="text-primary">Todos os Regimes</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Análise especializada para cada tipo de empresa
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {regimes.map((regime, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <Card className={`h-full border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card ${regime.popular ? 'border-primary/50 shadow-lg shadow-primary/10' : 'border-border/50 hover:border-primary/30'}`}>
                  {regime.popular && (
                    <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-semibold">
                      Mais Solicitado
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                      <regime.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{regime.name}</h3>
                    <p className="text-muted-foreground mb-5">{regime.description}</p>
                    <div className="space-y-3">
                      {regime.features.map((feature, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 relative">
        <div className="container max-w-7xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              Resultados Reais
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              O que Nossos{" "}
              <span className="text-primary">Clientes Dizem</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <Card className="h-full border-border/50 bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <Quote className="h-8 w-8 text-primary/20 mb-4" />
                    <p className="text-muted-foreground mb-6 italic leading-relaxed">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                      </div>
                    </div>
                    <div className="mt-5 pt-5 border-t border-border/50 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Valor identificado:</span>
                      <span className="text-xl font-bold text-primary">{testimonial.savings}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Tire suas Dúvidas
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Perguntas Frequentes
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Card className="border-border/50 bg-card hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg text-foreground mb-3 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">{i + 1}</span>
                      </span>
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground pl-9 leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        {/* Background same as hero */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        
        <div className="container max-w-4xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <BadgePercent className="h-4 w-4 mr-2" />
              Análise 100% Gratuita
            </Badge>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              Pronto para Descobrir suas
              <span className="block text-accent mt-2">Oportunidades Fiscais?</span>
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Solicite agora sua análise gratuita e descubra quanto sua empresa pode economizar. 
              <span className="font-semibold text-white"> Sem compromisso, sem risco.</span>
            </p>
            <Button 
              size="lg" 
              variant="accent"
              onClick={scrollToForm}
              className="text-lg px-12 py-7 shadow-2xl shadow-accent/30 hover:shadow-accent/50 transition-all group"
            >
              <Zap className="h-6 w-6 mr-2" />
              Solicitar Minha Análise Gratuita
              <ArrowRight className="h-6 w-6 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-white/60 mt-8 flex items-center justify-center gap-2">
              <Shield className="h-4 w-4" />
              Pagamento apenas no êxito • Seus dados estão 100% seguros
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer spacing */}
      <div className="h-12 bg-background"></div>
    </div>
  );
}
