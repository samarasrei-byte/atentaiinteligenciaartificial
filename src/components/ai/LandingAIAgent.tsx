import React, { useState } from 'react';
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
  Zap
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

  const handleCTA = () => {
    navigate('/pricing');
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            "h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-xl",
            "bg-gradient-to-br from-accent via-accent to-orange-500",
            "hover:scale-110 transition-all duration-300",
            "group"
          )}
        >
          <Bot className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <Card className={cn(
        "shadow-2xl border-2 overflow-hidden",
        "w-[calc(100vw-2rem)] sm:w-[360px]",
        "max-w-[calc(100vw-2rem)]",
        "border-t-4 border-t-accent"
      )}>
        {/* Header */}
        <CardHeader className="py-3 px-4 bg-gradient-to-r from-accent via-accent to-orange-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-white/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-white flex items-center gap-1">
                  AtentAI
                  <Sparkles className="h-3 w-3" />
                </CardTitle>
                <p className="text-[10px] text-white/90">IA + Especialistas</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {/* Human emphasis */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-3 mb-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex -space-x-1.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-[10px] font-bold border-2 border-background">C</div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center text-white text-[10px] font-bold border-2 border-background">A</div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-success to-success/70 flex items-center justify-center text-white text-[10px] font-bold border-2 border-background">M</div>
              </div>
              <p className="text-xs font-semibold text-foreground">Equipe online</p>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground font-medium">IA + Contadores certificados</span> prontos para ajudar.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-4">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <feature.icon className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                <span className="text-foreground">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="bg-muted/50 rounded-lg p-2.5 mb-4">
            <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">INCLUSO:</p>
            <div className="grid grid-cols-1 gap-1">
              {BENEFITS.map((benefit, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] text-foreground">
                  <CheckCircle2 className="h-3 w-3 text-success flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            size="default" 
            className="w-full bg-gradient-to-r from-accent to-orange-500 hover:opacity-90 text-white group shadow-lg text-sm"
            onClick={handleCTA}
          >
            <Crown className="h-4 w-4 mr-1.5" />
            Ver Planos e Assinar
            <ArrowRight className="h-4 w-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
          </Button>

          <p className="text-[10px] text-muted-foreground text-center mt-3">
            A partir de <span className="font-bold text-foreground">R$ 39,99/mês</span> • 7 dias de garantia
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
