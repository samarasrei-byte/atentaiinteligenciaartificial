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
  
  const companiesPercent = useCountUp(78, 2000, isInView);
  const successRate = useCountUp(94, 2200, isInView);

  const benefits = [
    { icon: Lock, text: "Não alteramos faturamento", desc: "Transparência total", color: "from-blue-500 to-indigo-600", bgColor: "bg-blue-500/20" },
    { icon: Shield, text: "Bloqueio em risco", desc: "Proteção automática", color: "from-purple-500 to-pink-600", bgColor: "bg-purple-500/20" },
    { icon: FileCheck, text: "Relatório completo", desc: "Documentação fiscal", color: "from-amber-500 to-orange-600", bgColor: "bg-amber-500/20" },
    { icon: TrendingUp, text: "Pagamento no êxito", desc: "Só paga se ganhar", color: "from-emerald-500 to-teal-600", bgColor: "bg-emerald-500/20" },
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

  return (
    <section 
      ref={sectionRef}
      className="py-16 sm:py-20 lg:py-32 relative overflow-hidden"
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
          className="text-center mb-12 sm:mb-16"
        >
          <Badge className="mb-4 sm:mb-6 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Exclusivo para Empresas
          </Badge>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
            Inteligência Fiscal para{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
              Empresas que Não Aceitam Riscos
            </span>
          </h2>
          
          <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto px-4">
            Análise fiscal avançada com software próprio de rastreabilidade,
            executada por empresa parceira homologada
          </p>
        </motion.div>

        {/* Stats Cards - Impactantes */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16"
        >
          {/* Card 1 - Sua Empresa Pode Estar Perdendo */}
          <motion.div variants={itemVariants} className="sm:col-span-2 lg:col-span-1">
            <Card className="bg-gradient-to-br from-rose-200 via-pink-100 to-rose-100 border-rose-300/50 backdrop-blur-sm overflow-hidden group hover:border-rose-400 hover:shadow-xl hover:shadow-rose-500/20 transition-all duration-300 h-full">
              <CardContent className="p-6 sm:p-8 text-center relative">
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-rose-300/30 rounded-full blur-3xl" />
                <div className="w-12 sm:w-14 h-12 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-xl bg-gradient-to-br from-rose-400/30 to-red-300/30 flex items-center justify-center">
                  <AlertTriangle className="h-6 sm:h-8 w-6 sm:w-8 text-red-500" />
                </div>
                <p className="text-red-600 font-bold text-lg sm:text-xl mb-2">Sua empresa pode estar perdendo</p>
                <p className="text-slate-700 text-sm sm:text-base font-medium">milhares em impostos pagos a mais</p>
                <p className="text-slate-500 text-xs sm:text-sm mt-2">Descubra agora com análise gratuita</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2 - Empresas */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-50 border-amber-300/50 backdrop-blur-sm overflow-hidden group hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-300 h-full">
              <CardContent className="p-6 sm:p-8 text-center relative">
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-amber-200/40 rounded-full blur-3xl" />
                <div className="w-12 sm:w-14 h-12 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-xl bg-gradient-to-br from-amber-400/40 to-yellow-300/40 flex items-center justify-center">
                  <Building2 className="h-6 sm:h-8 w-6 sm:w-8 text-amber-600" />
                </div>
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-800 mb-2">
                  {companiesPercent}%
                </div>
                <p className="text-amber-700 font-semibold text-sm sm:text-base lg:text-lg">Das empresas pagam a mais</p>
                <p className="text-slate-600 text-xs sm:text-sm mt-2">Sem saber que poderiam economizar</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 3 - Taxa de Sucesso */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-teal-100 via-emerald-50 to-green-50 border-emerald-300/50 backdrop-blur-sm overflow-hidden group hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 h-full">
              <CardContent className="p-6 sm:p-8 text-center relative">
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-emerald-200/40 rounded-full blur-3xl" />
                <div className="w-12 sm:w-14 h-12 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-xl bg-gradient-to-br from-emerald-400/40 to-green-300/40 flex items-center justify-center">
                  <CheckCircle2 className="h-6 sm:h-8 w-6 sm:w-8 text-emerald-600" />
                </div>
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-800 mb-2">
                  {successRate}%
                </div>
                <p className="text-emerald-700 font-semibold text-sm sm:text-base lg:text-lg">Taxa de êxito</p>
                <p className="text-slate-600 text-xs sm:text-sm mt-2">Em recuperação de valores</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left - Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Pain Points */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold text-red-400 mb-3 sm:mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 sm:h-5 w-4 sm:w-5" />
                Você está enfrentando isso?
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {painPoints.map((point, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3 text-slate-300 text-sm sm:text-base"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                    {point}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ scale: 1.03, y: -3 }}
                  className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 hover:border-white/40 transition-all duration-300 group cursor-pointer backdrop-blur-sm shadow-lg hover:shadow-xl"
                >
                  <div className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${benefit.color} w-fit mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <benefit.icon className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
                  </div>
                  <p className="font-bold text-white text-sm sm:text-base mb-1">{benefit.text}</p>
                  <p className="text-slate-300 text-xs sm:text-sm">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA Button com Timer de Urgência */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 }}
              className="space-y-3 sm:space-y-4"
            >
              {/* Timer de Urgência */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 w-full sm:w-fit">
                <div className="flex items-center gap-1 text-orange-400">
                  <Clock className="h-4 sm:h-5 w-4 sm:w-5 animate-pulse" />
                  <span className="font-bold text-base sm:text-lg">
                    {String(urgencyMinutes).padStart(2, '0')}:{String(urgencySeconds).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-orange-300 text-xs sm:text-sm font-medium">
                  para garantir análise prioritária
                </span>
              </div>

              <Button 
                size="lg" 
                onClick={() => navigate('/modulo-fiscal')}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 group"
              >
                <Zap className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
                Solicitar Análise Fiscal Gratuita
                <ArrowRight className="h-4 sm:h-5 w-4 sm:w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <p className="text-slate-400 text-xs sm:text-sm flex items-center gap-2">
                <CheckCircle2 className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-emerald-400 flex-shrink-0" />
                Análise em até 48h úteis • Sem compromisso
              </p>
            </motion.div>
          </motion.div>

          {/* Right - Premium Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Card Principal com Fundo Branco */}
            <Card className="border-0 bg-white overflow-hidden relative shadow-2xl">
              <CardContent className="p-5 sm:p-8 relative z-10">
                {/* Quote */}
                <blockquote className="text-lg sm:text-xl italic text-slate-700 border-l-4 border-emerald-500 pl-4 sm:pl-6 mb-6 sm:mb-8">
                  "Não prometemos milagres fiscais. Entregamos{" "}
                  <span className="text-emerald-600 font-bold">técnica, rastreabilidade e segurança</span>."
                </blockquote>

                {/* Success Fee Highlight */}
                <motion.div 
                  variants={pulseVariants}
                  animate="pulse"
                  className="relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-8 group hover:scale-[1.02] transition-all duration-500"
                >
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/50 to-transparent" />
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-28 sm:w-40 h-28 sm:h-40 bg-white/20 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-teal-300/30 rounded-full blur-2xl" />
                  <div className="absolute top-4 left-4 w-16 sm:w-20 h-16 sm:h-20 bg-green-300/20 rounded-full blur-xl" />
                  
                  {/* Content */}
                  <div className="relative z-10 text-center">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4 sm:mb-5 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/30"
                    >
                      <BadgePercent className="h-8 sm:h-10 w-8 sm:w-10 text-white drop-shadow-lg" />
                    </motion.div>
                    
                    <p className="text-white/90 mb-2 sm:mb-3 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
                      Modelo de Pagamento
                    </p>
                    
                    <div className="mb-2 sm:mb-3">
                      <span className="text-5xl sm:text-6xl md:text-7xl font-black text-white drop-shadow-lg">50%</span>
                    </div>
                    
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white/95 mb-2 sm:mb-3">
                      no Êxito
                    </p>
                    
                    <div className="inline-block px-4 sm:px-5 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                      <p className="text-white font-semibold text-xs sm:text-sm">
                        do valor identificado no processo
                      </p>
                    </div>
                    
                    {/* Zero Risk Badge */}
                    <div className="mt-4 sm:mt-5 flex justify-center">
                      <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-full shadow-lg">
                        <Shield className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-emerald-600" />
                        <span className="text-emerald-700 font-bold text-xs sm:text-sm">Risco Zero</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Guarantees */}
                <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 p-4 sm:p-6 bg-slate-50 rounded-xl sm:rounded-2xl">
                  <div className="space-y-3 sm:space-y-4">
                    <p className="text-red-600 font-bold text-sm sm:text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0" />
                      Não fazemos
                    </p>
                    {["Atalhos fiscais", "Alterar dados", "Executar com risco"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 sm:gap-3 text-slate-700 text-xs sm:text-sm font-medium">
                        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-red-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <p className="text-emerald-600 font-bold text-sm sm:text-base flex items-center gap-2">
                      <CheckCircle2 className="h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0" />
                      Fazemos
                    </p>
                    {["Análise técnica", "Total transparência", "Bloqueio em risco"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 sm:gap-3 text-slate-700 text-xs sm:text-sm font-medium">
                        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
