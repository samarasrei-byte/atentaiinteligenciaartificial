import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMPCheckout } from '@/contexts/MPCheckoutContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Check,
  Crown,
  Loader2,
  Sparkles,
  Calculator,
  Users,
  Star,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { STRIPE_PLANS, formatPrice, PlanType } from '@/lib/stripe';

export function PricingSection() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const { openCheckout } = useMPCheckout();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (planKey: PlanType) => {
    // Contador is coming soon - don't allow subscription
    if (planKey === 'contador') {
      toast({
        title: 'Em breve!',
        description: 'O plano Contador estará disponível em breve. Fique atento!',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Faça login primeiro',
        description: 'Você precisa estar logado para assinar um plano',
      });
      navigate('/auth');
      return;
    }

    setIsLoading(planKey);
    
    openCheckout({
      amountCents: STRIPE_PLANS[planKey].price,
      serviceName: STRIPE_PLANS[planKey].name,
      serviceType: planKey,
      description: STRIPE_PLANS[planKey].description,
      gradient: planKey === 'simulator' ? 'from-blue-500 to-cyan-500' : 
                planKey === 'autonomo' ? 'from-green-500 to-emerald-500' :
                planKey === 'premium' ? 'from-primary to-primary/70' : 'from-accent to-orange-500',
      allowedMethods: ['card'],
      isRecurring: true,
      onSuccess: () => {
        setIsLoading(null);
        toast({ title: 'Pagamento realizado!', description: 'Sua assinatura foi ativada.' });
      },
    });
    setIsLoading(null);
  };

  // All plans including contador
  const orderedPlans: PlanType[] = ['simulator', 'autonomo', 'premium', 'contador'];

  const getIcon = (key: PlanType) => {
    switch (key) {
      case 'simulator': return Calculator;
      case 'autonomo': return Users;
      case 'premium': return Crown;
      case 'contador': return Brain;
      default: return Brain;
    }
  };

  const getGradient = (key: PlanType) => {
    const plan = STRIPE_PLANS[key];
    return plan.color || 'from-primary to-primary/70';
  };

  return (
    <section id="pricing" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-16">
          <Badge variant="outline" className="mb-3 md:mb-4 border-primary/30 text-primary text-xs">
            Planos
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-foreground mb-3 md:mb-4 px-2">
            Escolha o plano ideal para você
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-xl mx-auto px-4">
            Simulador tributário, IA assistiva e ferramentas para gestão fiscal
          </p>
          
          {subscription.subscribed && subscription.plan && (
            <div className="mt-4 md:mt-6 inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm">
              <Crown className="h-4 w-4 md:h-5 md:w-5" />
              <span>Plano <strong>{STRIPE_PLANS[subscription.plan as PlanType]?.name}</strong></span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
          {orderedPlans.map((key) => {
            const plan = STRIPE_PLANS[key];
            const isCurrentPlan = subscription.plan === key;
            const isPlanPopular = 'popular' in plan && plan.popular;
            const isHighlight = 'highlight' in plan && plan.highlight;
            const isContador = key === 'contador';
            const Icon = getIcon(key);
            
            return (
              <Card 
                key={key}
                className={`relative bg-card border transition-all hover:shadow-xl ${
                  isContador ? 'opacity-80 border-dashed border-2 border-accent/50' :
                  isHighlight ? 'ring-2 ring-accent lg:scale-105 z-10' : 
                  isPlanPopular ? 'ring-2 ring-primary' : 'border-border'
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {/* Coming Soon badge for Contador */}
                {isContador && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent/80 text-accent-foreground text-[10px] md:text-xs">
                    <Clock className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" />
                    Em Breve
                  </Badge>
                )}
                {isHighlight && !isCurrentPlan && !isContador && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-[10px] md:text-xs">
                    <Star className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" />
                    Profissional
                  </Badge>
                )}
                {isPlanPopular && !isCurrentPlan && !isHighlight && !isContador && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] md:text-xs">
                    <Sparkles className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" />
                    Mais Popular
                  </Badge>
                )}
                {isCurrentPlan && !isContador && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] md:text-xs">
                    <Check className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" />
                    Atual
                  </Badge>
                )}
                <CardHeader className="text-center pt-6 md:pt-8 px-4">
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 bg-gradient-to-br ${getGradient(key)} ${isContador ? 'opacity-60' : ''}`}>
                    <Icon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg md:text-2xl text-foreground">{plan.name}</CardTitle>
                  {'tagline' in plan && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {plan.tagline}
                    </Badge>
                  )}
                  {'description' in plan && (
                    <CardDescription className="text-muted-foreground mt-1 md:mt-2 text-xs md:text-sm">
                      {plan.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6 px-4 pb-6">
                  <div className="text-center">
                    <span className="text-2xl md:text-4xl font-bold text-foreground">{formatPrice(plan.price)}</span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </div>

                  <ul className="space-y-2 md:space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-foreground">
                        <Check className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-xs md:text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(key)}
                    disabled={isLoading === key || isCurrentPlan}
                    className={`w-full ${
                      isContador 
                        ? 'bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed'
                        : isCurrentPlan 
                          ? 'bg-emerald-600 cursor-not-allowed' 
                          : `bg-gradient-to-r ${getGradient(key)} hover:opacity-90`
                    }`}
                  >
                    {isLoading === key ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processando...
                      </>
                    ) : isContador ? (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Em Breve
                      </>
                    ) : isCurrentPlan ? (
                      'Plano Atual'
                    ) : subscription.subscribed ? (
                      'Trocar Plano'
                    ) : (
                      'Assinar Agora'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center text-muted-foreground text-sm">
          <p>Pagamento seguro via Mercado Pago. Cancele a qualquer momento.</p>
        </div>
      </div>
    </section>
  );
}
