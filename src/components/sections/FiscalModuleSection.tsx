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
          {/* Card 1 - Valor Perdido - Design Vibrante */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-rose-200 via-pink-100 to-rose-100 border-rose-300/50 backdrop-blur-sm overflow-hidden group hover:border-rose-400 hover:shadow-xl hover:shadow-rose-500/20 transition-all duration-300">
              <CardContent className="p-8 text-center relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-300/30 rounded-full blur-3xl" />
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-rose-400/30 to-red-300/30 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <div className="text-5xl md:text-6xl font-bold text-slate-800 mb-2">
                  R$ {savedAmount.toLocaleString('pt-BR')}
                </div>
                <p className="text-red-600 font-semibold text-lg">Perdidos por ano/empresa</p>
                <p className="text-slate-600 text-sm mt-2">Média de impostos pagos a mais</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2 - Empresas - Design Vibrante */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-50 border-amber-300/50 backdrop-blur-sm overflow-hidden group hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-300">
              <CardContent className="p-8 text-center relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/40 rounded-full blur-3xl" />
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-400/40 to-yellow-300/40 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-amber-600" />
                </div>
                <div className="text-5xl md:text-6xl font-bold text-slate-800 mb-2">
                  {companiesPercent}%
                </div>
                <p className="text-amber-700 font-semibold text-lg">Das empresas pagam a mais</p>
                <p className="text-slate-600 text-sm mt-2">Sem saber que poderiam economizar</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 3 - Taxa de Sucesso - Design Vibrante */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-teal-100 via-emerald-50 to-green-50 border-emerald-300/50 backdrop-blur-sm overflow-hidden group hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300">
              <CardContent className="p-8 text-center relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/40 rounded-full blur-3xl" />
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-emerald-400/40 to-green-300/40 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="text-5xl md:text-6xl font-bold text-slate-800 mb-2">
                  {successRate}%
                </div>
                <p className="text-emerald-700 font-semibold text-lg">Taxa de êxito</p>
                <p className="text-slate-600 text-sm mt-2">Em recuperação de valores</p>
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
            <Card className="border-2 border-emerald-400/50 bg-gradient-to-br from-slate-800/90 via-emerald-900/30 to-slate-900/90 backdrop-blur-sm overflow-hidden relative shadow-2xl shadow-emerald-500/10">
              {/* Glow effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-400/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/30 rounded-full blur-3xl" />
              
              <CardContent className="p-8 relative z-10">
                {/* Quote */}
                <blockquote className="text-xl italic text-slate-300 border-l-4 border-emerald-500 pl-6 mb-8">
                  "Não prometemos milagres fiscais. Entregamos{" "}
                  <span className="text-emerald-400 font-semibold">técnica, rastreabilidade e segurança</span>."
                </blockquote>

                {/* Success Fee Highlight - Design Premium Vibrante */}
                <div className="relative p-8 rounded-3xl overflow-hidden mb-8 group hover:scale-[1.02] transition-all duration-500">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/50 to-transparent" />
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-300/30 rounded-full blur-2xl" />
                  <div className="absolute top-4 left-4 w-20 h-20 bg-green-300/20 rounded-full blur-xl" />
                  
                  {/* Content */}
                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/30 group-hover:scale-110 transition-transform duration-300">
                      <BadgePercent className="h-10 w-10 text-white drop-shadow-lg" />
                    </div>
                    
                    <p className="text-white/90 mb-3 font-bold uppercase tracking-widest text-xs">
                      Modelo de Pagamento
                    </p>
                    
                    <div className="mb-3">
                      <span className="text-6xl md:text-7xl font-black text-white drop-shadow-lg">50%</span>
                    </div>
                    
                    <p className="text-2xl md:text-3xl font-bold text-white/95 mb-3">
                      no Êxito
                    </p>
                    
                    <div className="inline-block px-5 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                      <p className="text-white font-semibold text-sm">
                        do valor identificado no processo
                      </p>
                    </div>
                    
                    {/* Zero Risk Badge */}
                    <div className="mt-5 flex justify-center">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg">
                        <Shield className="h-4 w-4 text-emerald-600" />
                        <span className="text-emerald-700 font-bold text-sm">Risco Zero</span>
                      </div>
                    </div>
                  </div>
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