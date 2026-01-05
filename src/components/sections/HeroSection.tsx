import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Bot, Sparkles, Shield, CheckCircle2, Clock, Award, Zap, TrendingUp, FileCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { STRIPE_PLANS, formatPrice } from "@/lib/stripe";
import { motion } from "framer-motion";

interface HeroSectionProps {
  onNavigate: (section: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const navigate = useNavigate();

  const benefits = [
    { icon: Shield, text: "100% Atualizado LC 214/2025" },
    { icon: Bot, text: "IA + Contadores Humanos" },
    { icon: Award, text: "Especialistas Certificados" },
  ];

  const floatingCards = [
    { icon: TrendingUp, label: "Economia", value: "até 40%", delay: 0 },
    { icon: FileCheck, label: "Conformidade", value: "100%", delay: 0.2 },
    { icon: Zap, label: "Análise", value: "< 24h", delay: 0.4 },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Animated Mesh Gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-1/4 left-1/4 w-[700px] h-[700px] bg-primary/20 rounded-full blur-[180px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1 
          }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[150px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2 
          }}
          className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-success/10 rounded-full blur-[120px]" 
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            initial={{ 
              x: `${Math.random() * 100}%`, 
              y: "110%",
              opacity: 0 
            }}
            animate={{ 
              y: "-10%",
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Floating Cards - Desktop only */}
      <div className="hidden lg:block absolute inset-0 overflow-hidden pointer-events-none">
        {floatingCards.map((card, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-10, 10, -10],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: card.delay,
            }}
            className={`absolute ${
              i === 0 ? "top-1/4 left-[8%]" : 
              i === 1 ? "top-1/3 right-[8%]" : 
              "bottom-1/4 left-[12%]"
            }`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + card.delay, duration: 0.5 }}
              className="glass-card rounded-2xl p-4 flex items-center gap-3 shadow-2xl"
            >
              <div className="p-3 rounded-xl bg-accent/20">
                <card.icon className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-white/70 text-xs">{card.label}</p>
                <p className="text-white font-bold text-lg">{card.value}</p>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, staggerChildren: 0.12 }}
        className="relative z-10 container mx-auto px-4 py-16 sm:py-24"
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Trust badge */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-success/20 backdrop-blur-md border border-success/40 text-white text-xs sm:text-sm shadow-lg shadow-success/20">
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
              </span>
              <span className="font-semibold">+2.500 profissionais confiam</span>
            </div>
          </motion.div>

          {/* Urgency Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 sm:px-8 py-2.5 sm:py-3.5 rounded-full bg-gradient-to-r from-destructive/50 to-orange-500/50 backdrop-blur-md border border-destructive/60 text-white text-xs sm:text-sm mb-6 shadow-xl shadow-destructive/30"
          >
            <Clock className="w-4 h-4 flex-shrink-0 animate-pulse" />
            <span className="font-bold tracking-wide">🚨 COMEÇOU! Prepare-se para não ser prejudicado!</span>
          </motion.div>

          {/* LC Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs sm:text-sm mb-8 sm:mb-10"
          >
            <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 animate-pulse" />
            <span className="font-medium">LC 214/2025 • Vigência 2026</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 sm:mb-8 tracking-tight leading-[1.1] px-2"
          >
            Sua Empresa
            <motion.span 
              className="block text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-400 to-accent mt-2 sm:mt-4"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              style={{ backgroundSize: "200% 200%" }}
            >
              Pronta para a Reforma
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg sm:text-xl md:text-2xl text-white/80 mb-10 sm:mb-14 max-w-3xl mx-auto leading-relaxed px-4"
          >
            <span className="text-white font-semibold">IA especializada</span> + <span className="text-accent font-semibold">Contadores humanos</span> para guiar você na reforma tributária com segurança e economia.
          </motion.p>

          {/* Benefits strip */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="hidden sm:flex flex-wrap items-center justify-center gap-6 sm:gap-8 mb-12"
          >
            {benefits.map((benefit, i) => (
              <motion.div 
                key={i} 
                className="flex items-center gap-2.5 text-white/90 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <benefit.icon className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium">{benefit.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 px-4 mb-10"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                variant="accent" 
                size="lg" 
                onClick={() => navigate('/comecar')}
                className="w-full sm:w-auto group text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 shadow-2xl shadow-accent/40 hover:shadow-accent/60 transition-all duration-300 font-bold"
              >
                Começar Gratuitamente
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform" />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => onNavigate('pricing')}
                className="w-full sm:w-auto border-white/30 text-white hover:bg-white/15 hover:border-white/50 py-6 sm:py-7 px-8 font-semibold backdrop-blur-sm"
              >
                <Users className="w-5 h-5 mr-2" />
                Ver Planos
              </Button>
            </motion.div>
          </motion.div>

          {/* Feature boxes */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4"
          >
            {/* AI Feature box */}
            <motion.div 
              className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/40 backdrop-blur-md w-full sm:w-auto shadow-xl"
              whileHover={{ scale: 1.02, borderColor: "rgba(255,193,7,0.6)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-3 rounded-xl bg-accent/30">
                <Bot className="w-7 h-7 text-accent" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                  AtentAI <Sparkles className="w-4 h-4 text-accent" />
                </p>
                <p className="text-xs text-white/70">IA + suporte humano 24/7</p>
              </div>
            </motion.div>

            {/* Guarantee */}
            <motion.div 
              className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/10 border border-white/20 w-full sm:w-auto justify-center backdrop-blur-md shadow-xl"
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.15)" }}
              transition={{ duration: 0.2 }}
            >
              <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
              <span className="text-sm text-white/90 font-semibold">7 dias de garantia total</span>
            </motion.div>
          </motion.div>

          {/* Price hint */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-8 sm:mt-10 text-white/60 text-sm sm:text-base px-4"
          >
            A partir de <span className="text-accent font-bold text-lg">{formatPrice(STRIPE_PLANS.simulator.price)}/mês</span>
          </motion.p>
        </div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/50 to-transparent pointer-events-none" />
    </section>
  );
}