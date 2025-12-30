import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bot, 
  X, 
  Sparkles, 
  ArrowRight,
  Crown,
  Lock,
  Calculator,
  MessageCircle,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { icon: MessageCircle, text: 'Perguntas ilimitadas sobre impostos' },
  { icon: Calculator, text: 'Simulador de impacto tributário' },
  { icon: TrendingUp, text: 'Cálculo de economia real' },
];

export const LandingAIAgent: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Auto-open after 8 seconds if user hasn't interacted
  useEffect(() => {
    if (hasInteracted) return;
    
    const timer = setTimeout(() => {
      if (!hasInteracted && !isOpen) {
        setIsOpen(true);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [hasInteracted, isOpen]);

  const handleCTA = () => {
    navigate('/pricing');
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 animate-in slide-in-from-bottom-4 duration-500">
        {/* Attention-grabbing button */}
        <div className="relative">
          {/* Pulsing ring */}
          <span className="absolute inset-0 rounded-full animate-ping bg-accent/40" />
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-accent to-primary opacity-30 blur animate-pulse" />
          
          <Button
            onClick={() => { setIsOpen(true); setHasInteracted(true); }}
            className={cn(
              "relative h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl",
              "bg-gradient-to-br from-accent via-accent to-orange-500",
              "hover:scale-110 transition-all duration-300",
              "group overflow-hidden"
            )}
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Bot className="h-6 w-6 sm:h-7 sm:w-7 text-white relative z-10 animate-bounce" />
          </Button>
          
          {/* Tooltip bubble */}
          <div className="absolute bottom-full right-0 mb-3 animate-in slide-in-from-bottom-2 duration-500">
            <div className="bg-card border border-border shadow-xl rounded-2xl px-4 py-3 max-w-[200px] relative">
              <div className="absolute bottom-0 right-6 w-3 h-3 bg-card border-r border-b border-border transform rotate-45 translate-y-1.5" />
              <p className="text-sm font-medium text-foreground">
                Fale com nossa IA!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Assine para desbloquear
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
        "w-[calc(100vw-2rem)] sm:w-96 md:w-[420px]",
        "max-w-[calc(100vw-2rem)]",
        "border-t-4 border-t-accent"
      )}>
        {/* Header */}
        <CardHeader className="py-3 px-4 bg-gradient-to-r from-accent to-orange-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  AtentAI
                  <Sparkles className="h-4 w-4" />
                </CardTitle>
                <p className="text-xs text-white/80">Especialista em Reforma Tributária</p>
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

        <CardContent className="p-6">
          {/* Lock Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Desbloqueie a IA Especializada
            </h3>
            <p className="text-sm text-muted-foreground">
              Tire todas as suas dúvidas sobre a Reforma Tributária com nossa IA treinada na LC 214/2025.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="p-1.5 rounded-lg bg-accent/10">
                  <feature.icon className="h-4 w-4 text-accent" />
                </div>
                <span className="text-foreground">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Button 
            size="lg" 
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground group shadow-lg"
            onClick={handleCTA}
          >
            <Crown className="h-5 w-5 mr-2" />
            Ver Planos e Assinar
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="text-[11px] text-muted-foreground text-center mt-4">
            A partir de R$ 39/mês • Cancele quando quiser
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
