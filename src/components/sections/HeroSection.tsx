import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Bot, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PLANS, formatPrice } from "@/lib/plans";

interface HeroSectionProps {
  onNavigate: (section: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Static Mesh Gradient — no infinite animations for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[700px] h-[700px] bg-primary/20 rounded-full blur-[180px] opacity-20" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[150px] opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 sm:py-24 animate-fade-in">
        <div className="max-w-4xl mx-auto text-center">
          {/* Single Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span>Reforma Tributária 2026 • IBS + CBS • Nova Era Fiscal</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]">
            Reforma Tributária
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-400 to-accent mt-2">
              Começa em 2026
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-white/80 mb-6 max-w-2xl mx-auto leading-relaxed">
            <span className="text-white font-bold">Você está preparado para a Reforma Tributária?</span>
          </p>
          
          {/* AI Value Proposition */}
          <p className="text-base sm:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Vamos te ajudar com <span className="text-accent font-semibold">inteligência artificial</span> a se preparar de forma fácil e acessível. <span className="text-white font-medium">IBS + CBS</span> sem complicação.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button 
              variant="accent" 
              size="lg" 
              onClick={() => navigate('/comecar')}
              className="w-full sm:w-auto group text-lg px-10 py-7 shadow-2xl shadow-accent/40 hover:shadow-accent/60 transition-all duration-300 font-bold"
            >
              Começar Agora
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => onNavigate('pricing')}
              className="w-full sm:w-auto border-white/30 text-white hover:bg-white/15 hover:border-white/50 py-7 px-8 font-semibold backdrop-blur-sm"
            >
              <Users className="w-5 h-5 mr-2" />
              Ver Planos
            </Button>
          </div>

          {/* AI Feature */}
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 backdrop-blur-md">
            <Bot className="w-6 h-6 text-accent" />
            <span className="text-sm font-semibold text-white flex items-center gap-1.5">
              Powered by Atentai <Sparkles className="w-4 h-4 text-accent" />
            </span>
          </div>

          {/* Price hint */}
          <p className="mt-8 text-white/70 text-sm">
            A partir de <span className="text-accent font-semibold">{formatPrice(PLANS.simulator.price)}/mês</span>
          </p>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/50 to-transparent pointer-events-none" />
    </section>
  );
}
