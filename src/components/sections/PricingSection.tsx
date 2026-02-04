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
  Target,
  TrendingUp,
  Star,
  Phone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { STRIPE_PLANS, formatPrice, PlanType } from '@/lib/stripe';

export function PricingSection() {
  const navigate = useNavigate();
  const { user, subscription, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (planKey: PlanType) => {
    // Performance is custom pricing - redirect to contact
    if (planKey === 'performance') {
      window.open('https://wa.me/5511999999999?text=Olá! Tenho interesse no plano Atentai Performance.', '_blank');
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

  const orderedPlans: PlanType[] = ['clarity', 'control', 'performance'];

  const getIcon = (key: PlanType) => {
    switch (key) {
      case 'clarity': return Target;
      case 'control': return TrendingUp;
      case 'performance': return Crown;
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
            BI Financeiro para Decisão Empresarial
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-xl mx-auto px-4">
            IA assistiva + supervisão humana obrigatória para clareza, controle e performance
          </p>
          
          {subscription.subscribed && subscription.plan && (
            <div className="mt-4 md:mt-6 inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm">
              <Crown className="h-4 w-4 md:h-5 md:w-5" />
              <span>Plano <strong>{STRIPE_PLANS[subscription.plan]?.name}</strong></span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {orderedPlans.map((key) => {
            const plan = STRIPE_PLANS[key];
            const isCurrentPlan = subscription.plan === key;
            const isPlanPopular = 'popular' in plan && plan.popular;
            const isHighlight = 'highlight' in plan && plan.highlight;
            const isCustomPricing = 'customPricing' in plan && plan.customPricing;
            const Icon = getIcon(key);
            
            return (
              <Card 
                key={key}
                className={`relative bg-card border transition-all hover:shadow-xl ${
                  isHighlight ? 'ring-2 ring-accent lg:scale-105 z-10' : 
                  isPlanPopular ? 'ring-2 ring-primary' : 'border-border'
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {isHighlight && !isCurrentPlan && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-[10px] md:text-xs">
                    <Star className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" />
                    Premium
                  </Badge>
                )}
                {isPlanPopular && !isCurrentPlan && !isHighlight && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] md:text-xs">
                    <Sparkles className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" />
                    Mais Popular
                  </Badge>
                )}
                {isCurrentPlan && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-500 text-[10px] md:text-xs">
                    <Check className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" />
                    Atual
                  </Badge>
                )}
                <CardHeader className="text-center pt-6 md:pt-8 px-4">
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 bg-gradient-to-br ${getGradient(key)}`}>
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
                    {isCustomPricing ? (
                      <>
                        <span className="text-2xl md:text-4xl font-bold text-foreground">Sob Consulta</span>
                        <p className="text-xs text-muted-foreground mt-1">A partir de R$ 8.000/mês</p>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl md:text-4xl font-bold text-foreground">{formatPrice(plan.price)}</span>
                        <span className="text-muted-foreground text-sm">/mês</span>
                      </>
                    )}
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
                      isCurrentPlan 
                        ? 'bg-green-600 cursor-not-allowed' 
                        : `bg-gradient-to-r ${getGradient(key)} hover:opacity-90`
                    }`}
                  >
                    {isLoading === key ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processando...
                      </>
                    ) : isCurrentPlan ? (
                      'Plano Atual'
                    ) : isCustomPricing ? (
                      <>
                        <Phone className="h-4 w-4 mr-2" />
                        Falar com Especialista
                      </>
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
          <p className="mt-2 text-xs">IA é sempre assistiva. Supervisão humana obrigatória em decisões críticas.</p>
        </div>
      </div>
    </section>
  );
}
