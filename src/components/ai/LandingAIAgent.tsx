import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bot, 
  X, 
  Sparkles, 
  ArrowRight,
  Crown,
  MessageCircle,
  Users,
  CheckCircle2,
  Zap,
  Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { icon: MessageCircle, text: 'Perguntas ilimitadas com IA' },
  { icon: Users, text: 'Atendimento humano incluído' },
  { icon: Zap, text: 'Respostas em segundos, 24h' },
];

const BENEFITS = [
  "Simulador de impacto tributário completo",
  "Calculadora de economia real",
  "Suporte por chat com contador",
  "Alertas de prazos fiscais",
];

export const LandingAIAgent: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showPulse, setShowPulse] = useState(true);

  // Auto-open after 5 seconds if user hasn't interacted
  useEffect(() => {
    if (hasInteracted) return;
    
    const timer = setTimeout(() => {
      if (!hasInteracted && !isOpen) {
        setIsOpen(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [hasInteracted, isOpen]);

  // Stop pulsing after interaction
  useEffect(() => {
    if (hasInteracted) {
      setShowPulse(false);
    }
  }, [hasInteracted]);

  const handleCTA = () => {
    navigate('/pricing');
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre o AtentAI.', '_blank');
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 animate-in slide-in-from-bottom-4 duration-500">
        {/* Attention-grabbing button */}
        <div className="relative">
          {/* Pulsing ring */}
          {showPulse && (
            <>
              <span className="absolute inset-0 rounded-full animate-ping bg-accent/50" />
              <span className="absolute -inset-2 rounded-full bg-gradient-to-r from-accent to-primary opacity-40 blur-md animate-pulse" />
            </>
          )}
          
          <Button
            onClick={() => { setIsOpen(true); setHasInteracted(true); }}
            className={cn(
              "relative h-16 w-16 sm:h-18 sm:w-18 rounded-full shadow-2xl",
              "bg-gradient-to-br from-accent via-accent to-orange-500",
              "hover:scale-110 transition-all duration-300",
              "group overflow-hidden"
            )}
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Bot className="h-7 w-7 sm:h-8 sm:w-8 text-white relative z-10" />
          </Button>
          
          {/* Tooltip bubble */}
          <div className="absolute bottom-full right-0 mb-3 animate-in slide-in-from-bottom-2 duration-500">
            <div className="bg-card border border-border shadow-2xl rounded-2xl px-4 py-3 max-w-[220px] relative">
              <div className="absolute bottom-0 right-6 w-3 h-3 bg-card border-r border-b border-border transform rotate-45 translate-y-1.5" />
              <p className="text-sm font-bold text-foreground flex items-center gap-2">
                Fale com a gente! <Sparkles className="w-4 h-4 text-accent" />
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                IA + Contadores Humanos
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <Card className={cn(
        "shadow-2xl border-2 transition-all duration-300 overflow-hidden",
        "w-[calc(100vw-2rem)] sm:w-[380px] md:w-[420px]",
        "max-w-[calc(100vw-2rem)]",
        "border-t-4 border-t-accent"
      )}>
        {/* Header */}
        <CardHeader className="py-4 px-5 bg-gradient-to-r from-accent via-accent to-orange-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  AtentAI
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold">ONLINE</span>
                </CardTitle>
                <p className="text-xs text-white/90">IA + Especialistas Humanos</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {/* Human emphasis */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 mb-5 border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-xs font-bold border-2 border-background">C</div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center text-white text-xs font-bold border-2 border-background">A</div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-success to-success/70 flex items-center justify-center text-white text-xs font-bold border-2 border-background">M</div>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Equipe disponível agora</p>
                <p className="text-xs text-muted-foreground">Contadores CRC ativos</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-semibold">Não somos só robôs!</span> Nossa equipe de contadores certificados responde quando a IA não consegue.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2.5 mb-5">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="p-1.5 rounded-lg bg-accent/15">
                  <feature.icon className="h-4 w-4 text-accent" />
                </div>
                <span className="text-foreground font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Benefits checklist */}
          <div className="bg-muted/50 rounded-lg p-3 mb-5">
            <p className="text-xs font-semibold text-muted-foreground mb-2">INCLUSO NO PLANO:</p>
            <div className="grid grid-cols-1 gap-1.5">
              {BENEFITS.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2.5">
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-accent to-orange-500 hover:opacity-90 text-white group shadow-lg font-bold"
              onClick={handleCTA}
            >
              <Crown className="h-5 w-5 mr-2" />
              Ver Planos e Assinar
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full border-success/50 text-success hover:bg-success/10 hover:border-success font-semibold"
              onClick={handleWhatsApp}
            >
              <Phone className="h-4 w-4 mr-2" />
              Falar com Humano no WhatsApp
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground text-center mt-4">
            A partir de <span className="font-bold text-foreground">R$ 39/mês</span> • Cancele quando quiser • 7 dias de garantia
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
