import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  CheckCircle, 
  MessageCircle, 
  Sparkles,
  ArrowRight,
  Star,
  TrendingDown
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAuth } from "@/contexts/AuthContext";

const bureaus = [
  { name: 'SPC', color: 'bg-blue-500' },
  { name: 'Serasa', color: 'bg-red-500' },
  { name: 'SCPC', color: 'bg-green-500' },
  { name: 'Boa Vista', color: 'bg-purple-500' },
];

const features = [
  { icon: MessageCircle, text: 'Chat direto com especialista' },
  { icon: Shield, text: 'Análise completa de pendências' },
  { icon: CheckCircle, text: 'Resultado em até 30 dias' },
];

export function LimpaNomeSection() {
  const navigate = useNavigate();
  const { subscription } = useAuth();
  const isSubscribed = subscription.subscribed;
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

  const basePrice = 999;
  const discountedPrice = isSubscribed ? 849 : 999;

  return (
    <section 
      ref={ref} 
      className="py-20 md:py-32 relative overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5" />
      
      {/* Animated Orbs */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}>
            <Badge className="mb-6 bg-accent text-accent-foreground px-4 py-2 glow-accent">
              <Sparkles className="h-4 w-4 mr-2" />
              NOVO SERVIÇO PREMIUM
            </Badge>

            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Limpa Nome</span>
              <span className="block mt-2">Completo</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8">
              Regularize seu CPF em todos os bureaus de crédito do Brasil.
              Atendimento personalizado via chat com contador especializado em renegociação de dívidas.
            </p>

            {/* Bureaus Tags */}
            <div className="flex flex-wrap gap-3 mb-8">
              {bureaus.map((bureau, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="px-4 py-2 text-sm font-medium border-2"
                >
                  <div className={`w-2 h-2 rounded-full ${bureau.color} mr-2`} />
                  {bureau.name}
                </Badge>
              ))}
            </div>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">{feature.text}</span>
                </div>
              ))}
            </div>

            <Button 
              size="lg"
              onClick={() => navigate('/limpa-nome')}
              className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 glow-primary group"
            >
              <Shield className="h-5 w-5 mr-2" />
              Limpar Meu Nome
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Right Card */}
          <div className={`transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
            <Card className="relative overflow-hidden border-2 border-primary/20 shadow-strong">
              {/* Decorative Top */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-primary-glow to-accent" />
              
              <CardContent className="p-8">
                {/* Rating */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    4.9/5 • +500 clientes atendidos
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Investimento único</p>
                  <div className="flex items-baseline gap-3">
                    {isSubscribed && (
                      <span className="text-2xl text-muted-foreground line-through">
                        R$ {basePrice}
                      </span>
                    )}
                    <span className="text-5xl font-bold gradient-text">
                      R$ {discountedPrice}
                    </span>
                  </div>
                  {isSubscribed && (
                    <Badge className="mt-2 bg-success/10 text-success border-success/30">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      15% de desconto para assinantes
                    </Badge>
                  )}
                </div>

                {/* What's Included */}
                <div className="space-y-3 mb-8">
                  <p className="font-semibold">O que está incluso:</p>
                  {[
                    'Análise completa em 4 bureaus',
                    'Chat ilimitado com especialista',
                    'Negociação com credores',
                    'Carta de quitação digital',
                    'Acompanhamento por 90 dias',
                    'Garantia de satisfação'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button 
                  className="w-full h-12 text-lg font-semibold"
                  variant="outline"
                  onClick={() => navigate('/limpa-nome')}
                >
                  Começar Agora
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                {/* Trust Badge */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 text-success" />
                    Pagamento seguro • Garantia de resultado
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}