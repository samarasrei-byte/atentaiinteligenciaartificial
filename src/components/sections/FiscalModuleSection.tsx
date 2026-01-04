import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, FileCheck, TrendingUp, Zap, AlertTriangle, CheckCircle2, ArrowRight, Sparkles, BadgePercent, Clock, Building2 } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

// Hook para contador animado
const useCountUp = (end: number, duration: number = 2000, startCounting: boolean = false) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!startCounting) return;
    
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, startCounting]);
  
  return count;
};

export function FiscalModuleSection() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  
  const savedAmount = useCountUp(47000, 2500, isInView);
  const companiesPercent = useCountUp(78, 2000, isInView);
  const successRate = useCountUp(94, 2200, isInView);

  const benefits = [
    { icon: Lock, text: "Não alteramos faturamento", desc: "Transparência total" },
    { icon: Shield, text: "Bloqueio em risco", desc: "Proteção automática" },
    { icon: FileCheck, text: "Relatório completo", desc: "Documentação fiscal" },
    { icon: TrendingUp, text: "Pagamento no êxito", desc: "Só paga se ganhar" },
  ];

  const painPoints = [
    "Pagando impostos a mais sem saber",
    "Medo de erros na declaração",
    "Sem tempo para analisar benefícios",
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section 
      ref={sectionRef}
      className="py-20 lg:py-32 relative overflow-hidden"
    >
      {/* Background premium com gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      <div className="container max-w-7xl mx-auto px-4 relative z-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-6 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-4 py-2 text-sm">
            <Sparkles className="h-4 w-4 mr-2" />
            Exclusivo para Empresas
          </Badge>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Inteligência Fiscal para{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
              Empresas que Não Aceitam Risco
            </span>
          </h2>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Análise fiscal avançada com software próprio de rastreabilidade,
            executada por empresa parceira homologada
          </p>
        </motion.div>

        {/* Stats Cards - Impactantes */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {/* Card 1 - Valor Perdido */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-red-500/20 to-red-900/20 border-red-500/30 backdrop-blur-sm overflow-hidden group hover:border-red-400/50 transition-all duration-300">
              <CardContent className="p-8 text-center relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
                <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-4" />
                <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                  R$ {savedAmount.toLocaleString('pt-BR')}
                </div>
                <p className="text-red-300 font-medium">Perdidos por ano/empresa</p>
                <p className="text-slate-400 text-sm mt-2">Média de impostos pagos a mais</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2 - Empresas */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-amber-500/20 to-amber-900/20 border-amber-500/30 backdrop-blur-sm overflow-hidden group hover:border-amber-400/50 transition-all duration-300">
              <CardContent className="p-8 text-center relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
                <Building2 className="h-10 w-10 text-amber-400 mx-auto mb-4" />
                <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                  {companiesPercent}%
                </div>
                <p className="text-amber-300 font-medium">Das empresas pagam a mais</p>
                <p className="text-slate-400 text-sm mt-2">Sem saber que poderiam economizar</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 3 - Taxa de Sucesso */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border-emerald-500/30 backdrop-blur-sm overflow-hidden group hover:border-emerald-400/50 transition-all duration-300">
              <CardContent className="p-8 text-center relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-4" />
                <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                  {successRate}%
                </div>
                <p className="text-emerald-300 font-medium">Taxa de êxito</p>
                <p className="text-slate-400 text-sm mt-2">Em recuperação de valores</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Pain Points */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Você está enfrentando isso?
              </h3>
              <div className="space-y-3">
                {painPoints.map((point, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3 text-slate-300"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    {point}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 group"
                >
                  <div className="p-2 rounded-lg bg-emerald-500/20 w-fit mb-3 group-hover:bg-emerald-500/30 transition-colors">
                    <benefit.icon className="h-5 w-5 text-emerald-400" />
                  </div>
                  <p className="font-semibold text-white text-sm">{benefit.text}</p>
                  <p className="text-slate-400 text-xs mt-1">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 }}
            >
              <Button 
                size="lg" 
                onClick={() => navigate('/modulo-fiscal')}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 group"
              >
                <Zap className="h-5 w-5 mr-2" />
                Solicitar Análise Fiscal Gratuita
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <p className="text-slate-400 text-sm mt-4 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Análise em até 48h úteis
              </p>
            </motion.div>
          </motion.div>

          {/* Right - Premium Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border-2 border-emerald-500/30 bg-gradient-to-br from-slate-900/80 to-emerald-900/20 backdrop-blur-sm overflow-hidden relative">
              {/* Glow effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
              
              <CardContent className="p-8 relative z-10">
                {/* Quote */}
                <blockquote className="text-xl italic text-slate-300 border-l-4 border-emerald-500 pl-6 mb-8">
                  "Não prometemos milagres fiscais. Entregamos{" "}
                  <span className="text-emerald-400 font-semibold">técnica, rastreabilidade e segurança</span>."
                </blockquote>

                {/* Success Fee Highlight */}
                <div className="p-6 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-2xl border border-emerald-500/30 text-center mb-8">
                  <BadgePercent className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                  <p className="text-slate-300 mb-2">Modelo de Pagamento</p>
                  <p className="text-4xl font-bold text-white mb-1">
                    50% <span className="text-emerald-400">no Êxito</span>
                  </p>
                  <p className="text-slate-400 text-sm">do valor identificado no processo</p>
                </div>

                {/* Guarantees */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-3">
                    <p className="text-red-400 font-semibold text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Não fazemos
                    </p>
                    {["Atalhos fiscais", "Alterar dados", "Executar com risco"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-400 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <p className="text-emerald-400 font-semibold text-sm flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Garantimos
                    </p>
                    {["Técnica avançada", "Rastreabilidade", "Governança total"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Regimes */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-300 bg-emerald-500/10">
                    Simples Nacional
                  </Badge>
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-300 bg-emerald-500/10">
                    Lucro Presumido
                  </Badge>
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-300 bg-emerald-500/10">
                    Lucro Real
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}