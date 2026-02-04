import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Crown,
  Calculator,
  Users,
  Clock
} from 'lucide-react';

export function PricingSection() {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-16">
          <Badge variant="outline" className="mb-3 md:mb-4 border-primary/30 text-primary text-xs">
            Planos
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-foreground mb-3 md:mb-4 px-2">
            Aguarde — Em Breve
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-xl mx-auto px-4">
            Estamos preparando os melhores planos com contadores especializados para você
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 border-2 border-dashed border-primary/30 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1)_0%,transparent_70%)]" />
            <CardContent className="relative z-10 py-16 px-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Contadores Disponíveis em Breve
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Nossa rede de contadores parceiros está sendo preparada para oferecer 
                atendimento personalizado e planos sob medida para sua necessidade.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
                  <Calculator className="h-4 w-4 mr-2" />
                  Simulador Tributário
                </Badge>
                <Badge className="bg-accent/10 text-accent border-accent/20 px-4 py-2">
                  <Brain className="h-4 w-4 mr-2" />
                  IA Assistiva
                </Badge>
                <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
                  <Crown className="h-4 w-4 mr-2" />
                  Atendimento Premium
                </Badge>
              </div>
              
              {/* Timing indicator */}
              <div className="inline-flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Enquanto isso, explore nosso <strong className="text-foreground">Módulo Fiscal</strong> e <strong className="text-foreground">BI+ Inteligência</strong></span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
