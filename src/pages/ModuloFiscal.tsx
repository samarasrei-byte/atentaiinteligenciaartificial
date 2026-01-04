import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Lock, FileCheck, TrendingUp, AlertTriangle, CheckCircle2, FileText, Building2, Scale, Eye, Ban, Zap, Star, Users, Award, BadgeCheck, ArrowRight, Play, Quote } from "lucide-react";
import { FiscalAnalysisForm } from "@/components/fiscal/FiscalAnalysisForm";
import { motion, useInView } from "framer-motion";

// Hook para animar números
const useCountUp = (end: number, duration: number = 2000, start: number = 0, inView: boolean = true) => {
  const [count, setCount] = useState(start);
  
  useEffect(() => {
    if (!inView) return;
    
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(start + (end - start) * easeOutQuart));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, start, inView]);

  return count;
};

// Componente de contador animado
const AnimatedCounter = ({ value, prefix = "", suffix = "", className = "" }: { 
  value: number; 
  prefix?: string; 
  suffix?: string; 
  className?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useCountUp(value, 2500, 0, isInView);
  
  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString('pt-BR')}{suffix}
    </span>
  );
};

export default function ModuloFiscal() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const stats = [
    { value: "R$ 153M+", label: "Recuperados para clientes", icon: TrendingUp },
    { value: "2.847", label: "Empresas atendidas", icon: Building2 },
    { value: "100%", label: "Conformidade legal", icon: Shield },
    { value: "0", label: "Casos em malha fina", icon: CheckCircle2 },
  ];

  const testimonials = [
    {
      name: "Carlos Mendes",
      role: "CFO, Indústria Metalúrgica",
      company: "MetalTech Soluções",
      quote: "Recuperamos R$ 847.000 em créditos tributários que não sabíamos que tínhamos. O processo foi 100% seguro e documentado.",
      savings: "R$ 847.000",
      avatar: "CM",
    },
    {
      name: "Ana Paula Ribeiro",
      role: "Diretora Financeira",
      company: "Grupo Varejista Nacional",
      quote: "Em 6 meses, identificaram mais de R$ 1.2 milhão em oportunidades fiscais. Pagamento só no êxito nos deu total segurança.",
      savings: "R$ 1.200.000",
      avatar: "AR",
    },
    {
      name: "Roberto Santana",
      role: "Contador Parceiro",
      company: "Santana Contabilidade",
      quote: "Já indiquei mais de 50 clientes. A transparência e rastreabilidade do processo é impecável. Zero risco para meus clientes.",
      savings: "R$ 2.100.000",
      avatar: "RS",
    },
  ];

  const benefits = [
    { icon: Lock, title: "Não alteramos faturamento", description: "Sem manipulação de dados declaratórios" },
    { icon: Shield, title: "Bloqueio automático em risco", description: "Se detectado risco de malha fina, não executamos" },
    { icon: FileCheck, title: "Relatório fiscal completo", description: "Documentação 100% auditável" },
    { icon: TrendingUp, title: "Pagamento no êxito", description: "Você só paga se houver resultado positivo" },
  ];

  const regimes = [
    { name: "Simples Nacional", description: "Verificação de inconsistências e risco de malha fina" },
    { name: "Lucro Presumido", description: "Análise de créditos e oportunidades técnicas" },
    { name: "Lucro Real", description: "Auditoria completa e otimização fiscal" },
  ];

  const workflow = [
    { step: "1", title: "Envio da Guia", description: "O contador/empresa envia a guia (DAS ou equivalente) para análise" },
    { step: "2", title: "Análise Técnica", description: "Rastreamento fiscal completo com software próprio + validação humana" },
    { step: "3", title: "Gate de Segurança", description: "Se houver risco fiscal → execução automaticamente cancelada" },
    { step: "4", title: "Execução com Êxito", description: "Quando viável, nova guia pode ser gerada para pagamento na Receita" },
    { step: "5", title: "Documentação", description: "Relatório completo + evidências fiscais entregues ao cliente" },
  ];

  const successCases = [
    { sector: "Indústria", savings: "R$ 1.2M", period: "18 meses" },
    { sector: "Comércio", savings: "R$ 680K", period: "12 meses" },
    { sector: "Serviços", savings: "R$ 450K", period: "24 meses" },
    { sector: "Tecnologia", savings: "R$ 890K", period: "15 meses" },
  ];

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => setShowForm(false)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <FiscalAnalysisForm onSuccess={() => navigate('/modulo-fiscal/sucesso')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Hero Section - High Impact */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container max-w-7xl mx-auto px-4 py-16 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="mb-6 text-sm px-4 py-2 border-primary/30 bg-primary/5">
                <Award className="h-4 w-4 mr-2 text-primary" />
                Módulo Fiscal Avançado
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Empresas já economizaram{" "}
                <span className="text-primary">mais de R$ 153 milhões</span>{" "}
                com nossa inteligência fiscal
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8">
                Análise técnica avançada com <strong className="text-foreground">pagamento somente no êxito</strong>. 
                Sem risco. Sem promessas vazias. Apenas resultados documentados.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg" 
                  onClick={() => setShowForm(true)}
                  className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all group"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Solicitar Análise Gratuita
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-6"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Ver Como Funciona
                </Button>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {["CM", "AR", "RS", "JP"].map((initials, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold border-2 border-background">
                      {initials}
                    </div>
                  ))}
                </div>
                <span>+2.847 empresas atendidas</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-1">4.9/5</span>
                </div>
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-primary/20 bg-gradient-to-br from-card to-muted/50 shadow-2xl">
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 gap-6">
                    {stats.map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="text-center p-4 rounded-xl bg-background/50"
                      >
                        <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-3xl font-bold text-primary">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-8 p-4 bg-primary/10 rounded-xl text-center">
                    <p className="text-sm text-muted-foreground mb-1">Modelo de Pagamento</p>
                    <p className="text-3xl font-bold text-primary">50% no Êxito</p>
                    <p className="text-sm text-muted-foreground">do valor identificado</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PAIN SECTION - A Dor das Empresas - Design Premium com Alto Contraste */}
      <section className="relative py-24 overflow-hidden bg-slate-950">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-red-950/20 to-transparent" />
          <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-emerald-950/20 to-transparent" />
        </div>
        
        <div className="container max-w-7xl mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 bg-red-500/20 text-red-400 border-red-500/50 px-5 py-2.5 text-sm">
              <AlertTriangle className="h-4 w-4 mr-2 animate-pulse" />
              A Realidade que Ninguém Conta
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Enquanto você lê isso, empresas estão{" "}
              <span className="text-red-400">perdendo dinheiro</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Milhares de empresas brasileiras pagam impostos a mais todos os meses sem saber. 
              A falta de análise fiscal técnica custa <strong className="text-red-400">bilhões por ano</strong> ao empresariado.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto mb-16">
            {/* Lado da DOR - Design Premium Alto Contraste */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="relative border border-red-500/30 bg-slate-900/90 h-full shadow-2xl shadow-red-500/20 overflow-hidden backdrop-blur-sm">
                {/* Top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-600" />
                
                <CardHeader className="pb-4 pt-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center border border-red-500/40">
                      <Ban className="h-7 w-7 text-red-400" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-white">Sem Análise Fiscal</CardTitle>
                      <CardDescription className="text-slate-400">
                        O custo da falta de auditoria
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-5">
                  {/* Número Principal Animado */}
                  <div className="p-6 bg-slate-800/80 rounded-2xl border border-red-500/20 text-center">
                    <p className="text-sm text-slate-400 mb-2 uppercase tracking-wider font-medium">Perda média anual por empresa</p>
                    <p className="text-5xl md:text-6xl font-black text-red-400">
                      R$ <AnimatedCounter value={47000} className="tabular-nums" />
                    </p>
                    <p className="text-sm text-slate-500 mt-2">em impostos pagos indevidamente</p>
                  </div>
                  
                  {/* Lista de Problemas */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-white text-lg">
                          <AnimatedCounter value={78} suffix="%" /> das empresas
                        </span>
                        <p className="text-slate-400 text-sm">pagam impostos a mais</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                      <span className="text-slate-300">Créditos tributários expiram sem serem usados</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                      <span className="text-slate-300">Risco de malha fina por inconsistências</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                      <span className="text-slate-300">Lucro reduzido por carga tributária errada</span>
                    </div>
                  </div>

                  {/* Estatística Impactante */}
                  <div className="p-5 bg-gradient-to-r from-red-500/15 to-red-600/10 rounded-2xl border border-red-500/30">
                    <p className="text-center">
                      <span className="text-sm text-slate-400 block mb-2">Nos últimos 5 anos:</span>
                      <span className="text-slate-300 font-medium">empresas brasileiras perderam mais de</span>
                      <span className="block text-4xl font-black text-red-400 my-2">
                        R$ <AnimatedCounter value={89} /> bilhões
                      </span>
                      <span className="text-slate-500 text-sm">em impostos pagos indevidamente</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Lado da SOLUÇÃO - Design Premium Alto Contraste */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="relative border border-emerald-500/30 bg-slate-900/90 h-full shadow-2xl shadow-emerald-500/20 overflow-hidden backdrop-blur-sm">
                {/* Top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600" />
                
                <CardHeader className="pb-4 pt-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
                      <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-white">Com AtentAI</CardTitle>
                      <CardDescription className="text-slate-400">
                        Resultados reais das 2.847 empresas atendidas
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-5">
                  {/* Número Principal Animado */}
                  <div className="p-6 bg-slate-800/80 rounded-2xl border border-emerald-500/20 text-center">
                    <p className="text-sm text-slate-400 mb-2 uppercase tracking-wider font-medium">Total recuperado para clientes</p>
                    <p className="text-5xl md:text-6xl font-black text-emerald-400">
                      R$ <AnimatedCounter value={153} />M+
                    </p>
                    <p className="text-sm text-slate-500 mt-2">média de R$ 53.700 por empresa</p>
                  </div>
                  
                  {/* Lista de Benefícios */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-white text-lg">100% de conformidade legal</span>
                        <p className="text-slate-400 text-sm">garantida em todos os processos</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-300">Zero casos em malha fina</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-300">Pagamento apenas no êxito (50%)</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-300">Relatório 100% auditável</span>
                    </div>
                  </div>

                  {/* Estatística de Sucesso */}
                  <div className="p-5 bg-gradient-to-r from-emerald-500/15 to-emerald-600/10 rounded-2xl border border-emerald-500/30">
                    <p className="text-center">
                      <span className="text-sm text-slate-400 block mb-2">Resultado:</span>
                      <span className="text-slate-300 font-medium">Em média, cada empresa recuperou</span>
                      <span className="block text-4xl font-black text-emerald-400 my-2">
                        <AnimatedCounter value={14} />x mais
                      </span>
                      <span className="text-slate-500 text-sm">do que pagou pelo serviço</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* CTA da Dor - Mais Impactante */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
              <p className="text-2xl font-bold mb-2">
                <span className="text-red-400">Você está perdendo dinheiro agora.</span>
              </p>
              <p className="text-lg text-slate-400 mb-6">
                Descubra quanto sua empresa pode recuperar com uma análise gratuita.
              </p>
              <Button 
                size="lg" 
                onClick={() => setShowForm(true)}
                className="text-lg px-10 py-7 shadow-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white group"
              >
                <Zap className="h-6 w-6 mr-2" />
                Descobrir Minha Economia Agora
                <ArrowRight className="h-6 w-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Banner */}
      <section className="bg-primary/5 border-y border-primary/10 py-6">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-center">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-6 w-6 text-primary" />
              <span className="font-semibold">100% Conformidade Legal</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-semibold">Zero Malha Fina</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <span className="font-semibold">2.847+ Empresas</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="font-semibold">R$ 153M+ Recuperados</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4">
            <Star className="h-4 w-4 mr-2 text-yellow-500" />
            Depoimentos Reais
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Empresas que <span className="text-primary">Transformaram</span> sua Realidade Fiscal
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Resultados comprovados de empresas que confiaram em nossa metodologia técnica
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full border-primary/10 hover:border-primary/30 transition-colors hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />
                  
                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.quote}"
                  </p>
                  
                  <div className="p-3 bg-primary/10 rounded-lg mb-6">
                    <p className="text-sm text-muted-foreground">Economia identificada:</p>
                    <p className="text-2xl font-bold text-primary">{testimonial.savings}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-primary">{testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Success Cases Grid */}
      <section className="bg-muted/30 py-20">
        <div className="container max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Casos de Sucesso por Setor
            </h2>
            <p className="text-lg text-muted-foreground">
              Resultados reais de empresas de diferentes segmentos
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {successCases.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="text-center hover:shadow-lg transition-shadow border-primary/10">
                  <CardContent className="p-6">
                    <Badge variant="secondary" className="mb-4">{item.sector}</Badge>
                    <p className="text-3xl font-bold text-primary mb-1">{item.savings}</p>
                    <p className="text-sm text-muted-foreground">em {item.period}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button 
              size="lg" 
              onClick={() => setShowForm(true)}
              className="text-lg px-8 py-6 shadow-lg"
            >
              <Zap className="h-5 w-5 mr-2" />
              Quero Descobrir Minha Economia
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="container max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Por que Empresas Confiam no Atentai
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Inteligência fiscal técnica com total segurança e transparência
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full text-center hover:shadow-lg transition-shadow border-primary/10">
                <CardContent className="p-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="bg-muted/30 py-20">
        <div className="container max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Processo 100% Transparente
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Cada etapa é documentada e auditável
            </p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {workflow.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full text-center hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-2">
                      <span className="text-lg font-bold text-primary-foreground">{item.step}</span>
                    </div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">{item.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Regimes Section */}
      <section className="container max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Regimes Atendidos</h2>
          <p className="text-lg text-muted-foreground">
            Análise especializada para cada regime tributário
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {regimes.map((regime, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow border-primary/10">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{regime.name}</CardTitle>
                  <CardDescription className="text-base">{regime.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Security Guarantee */}
      <section className="bg-muted/30 py-20">
        <div className="container max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-6">
                      Garantia de Segurança Fiscal
                    </h2>
                    
                    <div className="space-y-4">
                      {[
                        { icon: Ban, text: "Não prometemos atalhos fiscais", negative: true },
                        { icon: Ban, text: "Não alteramos dados declaratórios", negative: true },
                        { icon: Ban, text: "Não executamos com risco", negative: true },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg">
                          <item.icon className="h-5 w-5 text-destructive shrink-0" />
                          <span className="text-sm">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-6 text-primary">
                      O que fazemos:
                    </h3>
                    
                    <div className="space-y-4">
                      {[
                        "Atuamos com técnica comprovada",
                        "Rastreabilidade total do processo",
                        "Governança e compliance",
                        "Documentação 100% auditável",
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-8 md:p-12">
            <Quote className="h-12 w-12 text-primary/30 mx-auto mb-6" />
            <blockquote className="text-xl md:text-2xl italic text-muted-foreground mb-8 max-w-3xl mx-auto">
              "Não prometemos milagres fiscais. Entregamos técnica, rastreabilidade e segurança. 
              Se houver risco, não executamos. Se houver êxito, tudo é documentado e validado direto na Receita."
            </blockquote>
            
            <div className="flex flex-col items-center gap-4">
              <Button 
                size="lg" 
                onClick={() => setShowForm(true)}
                className="text-lg px-10 py-7 shadow-xl hover:shadow-2xl transition-all group"
              >
                <Zap className="h-6 w-6 mr-2" />
                Solicitar Análise Fiscal Gratuita
                <ArrowRight className="h-6 w-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Serviço técnico sob análise prévia • Disponibilidade sujeita ao enquadramento
              </p>
              
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-muted-foreground">4.9/5 baseado em 847 empresas</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
