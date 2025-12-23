import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeroSectionProps {
  onNavigate: (section: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Subtle gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Featured Plan Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/30 text-accent text-sm mb-6 animate-fade-in cursor-pointer hover:bg-accent/30 transition-colors"
            onClick={() => onNavigate('pricing')}
          >
            <Crown className="w-4 h-4" />
            <span className="font-semibold">Plano Contador Premium</span>
            <span className="text-accent/80">R$170/mês em até 10x</span>
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/90 text-sm mb-10 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            Lei Complementar 2024
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-slide-up tracking-tight">
            Reforma Tributária
            <span className="block text-accent mt-2">Simplificada</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-white/70 mb-12 max-w-xl mx-auto animate-slide-up leading-relaxed" style={{ animationDelay: "0.1s" }}>
            Simule impactos e tire dúvidas com IA sobre o novo sistema tributário brasileiro.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button 
              variant="accent" 
              size="xl" 
              onClick={() => navigate('/pricing')}
              className="w-full sm:w-auto group text-lg px-8"
            >
              Começar Agora
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="xl" 
              onClick={() => onNavigate('pricing')}
              className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10"
            >
              <Users className="w-5 h-5 mr-2" />
              Ver Plano Contador
            </Button>
          </div>

          {/* Price hint */}
          <p className="mt-6 text-white/50 text-sm animate-fade-in" style={{ animationDelay: "0.3s" }}>
            A partir de R$56/mês • AtentAI Premium R$98/mês • <span className="text-accent font-semibold">Contador Premium R$170/mês</span>
          </p>
        </div>
      </div>
    </section>
  );
}
