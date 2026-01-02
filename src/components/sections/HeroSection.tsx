import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Bot, Sparkles, Shield, CheckCircle2, Clock, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { STRIPE_PLANS, formatPrice } from "@/lib/stripe";

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

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-success/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust badge */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-success/20 backdrop-blur-sm border border-success/40 text-white text-xs sm:text-sm">
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
              </span>
              <span className="font-semibold">+2.500 profissionais confiam</span>
            </div>
          </div>

          {/* Urgency Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-destructive/40 to-orange-500/40 backdrop-blur-sm border border-destructive/50 text-white text-[11px] sm:text-sm mb-5 sm:mb-6 animate-pulse shadow-lg shadow-destructive/30">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="font-bold tracking-wide">🚨 COMEÇOU! Prepare-se para não ser prejudicado!</span>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-[10px] sm:text-sm mb-6 sm:mb-10 animate-fade-in">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent flex-shrink-0 animate-pulse" />
            <span>LC 214/2025 • Vigência 2026</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-white mb-4 sm:mb-8 animate-slide-up tracking-tight leading-tight px-2">
            Sua Empresa
            <span className="block text-accent mt-1 sm:mt-3">Pronta para a Reforma</span>
          </h1>

          {/* Subtitle with value proposition */}
          <p className="text-base sm:text-xl md:text-2xl text-white/80 mb-8 sm:mb-12 max-w-2xl mx-auto animate-slide-up leading-relaxed px-4" style={{ animationDelay: "0.1s" }}>
            <span className="text-white font-semibold">IA especializada</span> + <span className="text-accent font-semibold">Contadores humanos</span> para guiar você na reforma tributária.
          </p>

          {/* Benefits strip - hide on very small screens */}
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-10 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-white/90">
                <benefit.icon className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                <span className="text-xs sm:text-sm font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-slide-up px-4 mb-8 sm:mb-0" style={{ animationDelay: "0.2s" }}>
            <Button 
              variant="accent" 
              size="lg" 
              onClick={() => navigate('/comecar')}
              className="w-full sm:w-auto group text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-2xl shadow-accent/30 hover:shadow-accent/50 transition-all"
            >
              Começar Gratuitamente
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => onNavigate('pricing')}
              className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:border-white/50 py-5 sm:py-6"
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Ver Planos
            </Button>
          </div>

          {/* Social proof + AI highlight - simplified on mobile */}
          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-fade-in px-4" style={{ animationDelay: "0.3s" }}>
            {/* AI Feature box */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/40 backdrop-blur-sm w-full sm:w-auto">
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-accent/30 flex-shrink-0">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1">
                  AtentAI <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                </p>
                <p className="text-[10px] sm:text-xs text-white/70 truncate">IA + suporte humano</p>
              </div>
            </div>

            {/* Guarantee */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-white/20 w-full sm:w-auto justify-center">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
              <span className="text-xs sm:text-sm text-white/90 font-medium">7 dias de garantia</span>
            </div>
          </div>

          {/* Price hint */}
          <p className="mt-6 sm:mt-8 text-white/60 text-xs sm:text-sm animate-fade-in px-4" style={{ animationDelay: "0.4s" }}>
            A partir de <span className="text-accent font-bold">{formatPrice(STRIPE_PLANS.simulator.price)}/mês</span>
          </p>
        </div>
      </div>
    </section>
  );
}
