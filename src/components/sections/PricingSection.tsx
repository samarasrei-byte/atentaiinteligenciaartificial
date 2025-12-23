import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { STRIPE_PLANS, formatPrice, PlanType } from '@/lib/stripe';

export function PricingSection() {
  const navigate = useNavigate();
  const { user, subscription, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (planKey: PlanType) => {
    if (!user) {
      toast({
        title: 'Faça login primeiro',
        description: 'Você precisa estar logado para assinar um plano',
      });
      navigate('/auth');
      return;
    }

    setIsLoading(planKey);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: STRIPE_PLANS[planKey].priceId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao iniciar checkout',
        description: error.message || 'Tente novamente mais tarde',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const planEntries = Object.entries(STRIPE_PLANS) as [PlanType, typeof STRIPE_PLANS[PlanType]][];
  const orderedPlans: PlanType[] = ['simulator', 'premium', 'contador'];

  const getIcon = (key: PlanType) => {
    switch (key) {
      case 'simulator': return Calculator;
      case 'premium': return Brain;
      case 'contador': return Users;
      default: return Brain;
    }
  };

  const getGradient = (key: PlanType) => {
    switch (key) {
      case 'simulator': return 'from-blue-500 to-cyan-500';
      case 'premium': return 'from-primary to-primary/70';
      case 'contador': return 'from-accent to-orange-500';
      default: return 'from-primary to-primary/70';
    }
  };

  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            Planos
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Escolha seu plano
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Acesse ferramentas exclusivas para dominar a Reforma Tributária
          </p>
          
          {subscription.subscribed && subscription.plan && (
            <div className="mt-6 inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
              <Crown className="h-5 w-5" />
              <span>Você está no plano <strong>{STRIPE_PLANS[subscription.plan]?.name}</strong></span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {orderedPlans.map((key) => {
            const plan = STRIPE_PLANS[key];
            const isCurrentPlan = subscription.plan === key;
            const isPlanPopular = 'popular' in plan && plan.popular;
            const isHighlight = 'highlight' in plan && plan.highlight;
            const hasInstallments = 'installments' in plan && plan.installments;
            const Icon = getIcon(key);
            
            return (
              <Card 
                key={key}
                className={`relative bg-card border transition-all hover:shadow-xl hover:scale-[1.02] ${
                  isHighlight ? 'ring-2 ring-accent scale-105 z-10' : 
                  isPlanPopular ? 'ring-2 ring-primary' : 'border-border'
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {isHighlight && !isCurrentPlan && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
                    <Star className="h-3 w-3 mr-1" />
                    Mais Completo
                  </Badge>
                )}
                {isPlanPopular && !isCurrentPlan && !isHighlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Mais Popular
                  </Badge>
                )}
                {isCurrentPlan && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500">
                    <Check className="h-3 w-3 mr-1" />
                    Seu Plano
                  </Badge>
                )}
                <CardHeader className="text-center pt-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br ${getGradient(key)}`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-foreground">{plan.name}</CardTitle>
                  {'description' in plan && (
                    <CardDescription className="text-muted-foreground mt-2">
                      {plan.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-foreground">{formatPrice(plan.price)}</span>
                    <span className="text-muted-foreground">/mês</span>
                    {hasInstallments && (
                      <p className="text-sm text-accent mt-1 font-medium">
                        ou {plan.installments}x de {formatPrice(plan.price / plan.installments)}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-foreground">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(key)}
                    disabled={isLoading === key || isCurrentPlan}
                    className={`w-full ${
                      isCurrentPlan 
                        ? 'bg-green-600 cursor-not-allowed' 
                        : isHighlight
                          ? 'bg-gradient-to-r from-accent to-orange-500 hover:from-accent/90 hover:to-orange-600'
                          : key === 'simulator' 
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600' 
                            : 'bg-primary hover:bg-primary/90'
                    }`}
                  >
                    {isLoading === key ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processando...
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
          <p>Pagamento seguro via Stripe. Cancele a qualquer momento.</p>
          <p className="mt-2 text-accent font-medium">Plano Contador Premium Plus parcelável em até 10x sem juros!</p>
        </div>
      </div>
    </section>
  );
}
