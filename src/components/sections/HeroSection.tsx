import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Bot, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { STRIPE_PLANS, formatPrice } from "@/lib/stripe";
import { motion } from "framer-motion";

interface HeroSectionProps {
  onNavigate: (section: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Animated Mesh Gradient - Simplified */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ 
            duration: 8, 
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
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2 
          }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[150px]" 
        />
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 container mx-auto px-4 py-16 sm:py-24"
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Single Trust Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span>Reforma Tributária 2026 • IBS + CBS • Nova Era Fiscal</span>
          </motion.div>

          {/* Headline - Clean and focused */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]"
          >
            Reforma Tributária
            <motion.span 
              className="block text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-400 to-accent mt-2"
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
              Começa em 2026
            </motion.span>
          </motion.h1>

          {/* Subtitle - Simplified */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Prepare sua empresa para o <span className="text-white font-semibold">IBS e CBS</span>. Simulador tributário, <span className="text-accent font-semibold">IA assistiva</span> e consultoria especializada para a transição.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                variant="accent" 
                size="lg" 
                onClick={() => navigate('/comecar')}
                className="w-full sm:w-auto group text-lg px-10 py-7 shadow-2xl shadow-accent/40 hover:shadow-accent/60 transition-all duration-300 font-bold"
              >
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => onNavigate('pricing')}
                className="w-full sm:w-auto border-white/30 text-white hover:bg-white/15 hover:border-white/50 py-7 px-8 font-semibold backdrop-blur-sm"
              >
                <Users className="w-5 h-5 mr-2" />
                Ver Planos
              </Button>
            </motion.div>
          </motion.div>

          {/* AI Feature - Single highlight */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 backdrop-blur-md"
          >
            <Bot className="w-6 h-6 text-accent" />
            <span className="text-sm font-semibold text-white flex items-center gap-1.5">
              Powered by Atentai <Sparkles className="w-4 h-4 text-accent" />
            </span>
          </motion.div>

          {/* Price hint */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 text-white/70 text-sm"
          >
            A partir de <span className="text-accent font-semibold">{formatPrice(STRIPE_PLANS.simulator.price)}/mês</span>
          </motion.p>
        </div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/50 to-transparent pointer-events-none" />
    </section>
  );
}
