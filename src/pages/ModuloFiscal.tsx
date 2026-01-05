import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, Lock, FileCheck, TrendingUp, AlertTriangle, CheckCircle2, 
  FileText, Building2, Scale, Eye, Zap, Star, Award, ArrowRight, 
  Play, Quote, Clock, Users, BarChart3, Target, Sparkles, 
  ShieldCheck, FileSearch, Receipt, CircleDollarSign, BadgePercent
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

  const stats = [
    { value: "R$ 153M+", label: "Recuperados", icon: TrendingUp, color: "emerald" },
    { value: "2.847", label: "Empresas", icon: Building2, color: "blue" },
    { value: "100%", label: "Conformidade", icon: Shield, color: "violet" },
    { value: "0", label: "Malha Fina", icon: CheckCircle2, color: "green" },
  ];

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
      features: ["Análise de DAS", "Verificação de limites", "Inconsistências"]
    },
    { 
      name: "Lucro Presumido", 
      description: "Análise de créditos e oportunidades técnicas",
      icon: Scale,
      features: ["Créditos tributários", "PIS/COFINS", "Otimização"]
    },
    { 
      name: "Lucro Real", 
      description: "Auditoria completa e otimização fiscal avançada",
      icon: Target,
      features: ["Auditoria completa", "IRPJ/CSLL", "Planejamento"]
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
    <div className="min-h-screen bg-background">
      <Header onNavigate={handleNavigate} />
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="absolute top-40 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] opacity-60" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] opacity-40" />
        
        <div className="container max-w-7xl mx-auto px-4 py-16 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <Badge variant="outline" className="px-4 py-2 border-primary/40 bg-primary/5 text-sm">
                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                Inteligência Fiscal Técnica
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                Análise Fiscal{" "}
                <span className="text-primary">Sem Risco</span>{" "}
                para sua Empresa
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Identificamos oportunidades fiscais com <strong className="text-foreground">segurança total</strong>. 
                Se houver qualquer risco, não executamos. Simples assim.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => setShowForm(true)}
                  className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all group bg-primary hover:bg-primary/90"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Solicitar Análise Gratuita
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {["CM", "AR", "RS", "JP"].map((initials, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold border-2 border-background text-primary">
                        {initials}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">+2.847 empresas</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">4.9/5</span>
                </div>
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
                <CardContent className="p-6 lg:p-8">
                  <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="text-center p-4 rounded-xl bg-muted/50 border border-border/30"
                      >
                        <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
                          <stat.icon className="h-5 w-5 text-primary" />
                        </div>
                        <p className="text-2xl lg:text-3xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-5 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl text-center border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">Modelo de Pagamento</p>
                    <p className="text-4xl font-bold text-primary">50%</p>
                    <p className="text-sm text-muted-foreground">apenas no êxito</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-7xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Por que somos diferentes
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Segurança Total, Resultado Garantido
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nossa metodologia prioriza sua segurança acima de tudo
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-border/50 hover:border-primary/30 transition-colors bg-card">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-4`}>
                      <benefit.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="container max-w-7xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">
              <Play className="h-4 w-4 mr-2" />
              Como Funciona
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Processo Simples e Transparente
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Da solicitação ao resultado em poucos passos
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflow.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <Card className="h-full border-border/50 bg-card hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                      {item.step}
                    </div>
                    <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {item.time}
                    </Badge>
                  </CardContent>
                </Card>
                {i < workflow.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Regimes Section */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-7xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">
              <Scale className="h-4 w-4 mr-2" />
              Regimes Tributários
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Atendemos Todos os Regimes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Análise especializada para cada tipo de empresa
            </p>
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
                <Card className="h-full border-border/50 hover:border-primary/30 transition-all hover:shadow-lg bg-card">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <regime.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{regime.name}</h3>
                    <p className="text-muted-foreground mb-4">{regime.description}</p>
                    <div className="space-y-2">
                      {regime.features.map((feature, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
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
      <section className="py-20">
        <div className="container max-w-7xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">
              <Users className="h-4 w-4 mr-2" />
              Depoimentos
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              O que Nossos Clientes Dizem
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
                <Card className="h-full border-border/50 bg-card">
                  <CardContent className="p-6">
                    <Quote className="h-8 w-8 text-primary/30 mb-4" />
                    <p className="text-muted-foreground mb-6 italic">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <p className="text-sm text-muted-foreground">Valor identificado:</p>
                      <p className="text-xl font-bold text-primary">{testimonial.savings}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Dúvidas Frequentes
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
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
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-border/50 bg-card">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/10 overflow-hidden">
              <CardContent className="p-8 lg:p-12 text-center">
                <Badge className="mb-6 bg-primary/10 text-primary border-primary/30">
                  <BadgePercent className="h-4 w-4 mr-2" />
                  Análise 100% Gratuita
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Pronto para Descobrir suas Oportunidades?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Solicite agora sua análise gratuita e descubra quanto sua empresa pode economizar. 
                  Sem compromisso, sem risco.
                </p>
                <Button 
                  size="lg" 
                  onClick={() => setShowForm(true)}
                  className="text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all group"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Solicitar Análise Gratuita
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" />
                  Pagamento apenas no êxito • Seus dados estão seguros
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer spacing */}
      <div className="h-12"></div>
    </div>
  );
}
