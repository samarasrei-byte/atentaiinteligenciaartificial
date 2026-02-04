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
  Loader2,
  Sparkles,
  Star,
  BarChart3,
  TrendingUp,
  Zap,
  Crown,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BI_PLANS, formatPrice, BIPlanType } from '@/lib/stripe';

export function BIPricingSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (planKey: BIPlanType) => {
    if (!user) {
      toast({
        title: 'Faça login primeiro',
        description: 'Você precisa estar logado para assinar um plano',
      });
      navigate('/auth');
      return;
    }

    const plan = BI_PLANS[planKey];
    
    // For Performance plan with custom pricing, redirect to contact
    if ('customPricing' in plan && plan.customPricing) {
      window.open('https://wa.me/5511999999999?text=Olá! Tenho interesse no plano Atentai Performance.', '_blank');
      return;
    }

    setIsLoading(planKey);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: plan.priceId },
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

  const orderedPlans: BIPlanType[] = ['clarity', 'control', 'performance'];

  const getIcon = (key: BIPlanType) => {
    switch (key) {
      case 'clarity': return BarChart3;
      case 'control': return TrendingUp;
      case 'performance': return Crown;
      default: return Brain;
    }
  };

  const getGradient = (key: BIPlanType) => {
    const plan = BI_PLANS[key];
    return plan.color || 'from-primary to-primary/70';
  };

  return (
    <section id="bi-pricing" className="py-16 md:py-24 bg-gradient-to-br from-indigo-50/50 via-violet-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:via-violet-950/20 dark:to-purple-950/20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 md:mb-16">
          <Badge className="mb-3 md:mb-4 bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-400/20">
            <Zap className="h-3 w-3 mr-1" />
            Planos BI+ Inteligência
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-foreground mb-3 md:mb-4 px-2">
            Escolha seu nível de inteligência
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Dashboards financeiros, IA analítica e supervisão humana — tudo em um só lugar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {orderedPlans.map((key) => {
            const plan = BI_PLANS[key];
            const isPlanPopular = 'popular' in plan && plan.popular;
            const isHighlight = 'highlight' in plan && plan.highlight;
            const hasCustomPricing = 'customPricing' in plan && plan.customPricing;
            const Icon = getIcon(key);
            
            return (
              <Card 
                key={key}
                className={`relative bg-card border-2 transition-all hover:shadow-2xl ${
                  isHighlight ? 'ring-2 ring-accent md:scale-105 z-10' : 
                  isPlanPopular ? 'ring-2 ring-primary' : 'border-border hover:border-primary/50'
                }`}
              >
                {isHighlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent to-orange-500 text-white text-xs px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
                {isPlanPopular && !isHighlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary/70 text-white text-xs px-4 py-1">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Mais Popular
                  </Badge>
                )}
                
                {/* Gradient Top Bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${getGradient(key)}`} />
                
                <CardHeader className="text-center pt-8 px-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br ${getGradient(key)} shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-foreground">{plan.name}</CardTitle>
                  {'tagline' in plan && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {plan.tagline}
                    </Badge>
                  )}
                  {'description' in plan && (
                    <CardDescription className="text-muted-foreground mt-2 text-sm">
                      {plan.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-6 px-6 pb-8">
                  <div className="text-center py-4 border-y border-border/50">
                    {hasCustomPricing ? (
                      <div>
                        <span className="text-lg text-muted-foreground">A partir de</span>
                        <p className="text-3xl md:text-4xl font-bold text-foreground">{formatPrice(plan.price)}</p>
                        <span className="text-muted-foreground text-sm">/mês</span>
                        <p className="text-xs text-accent mt-1">Sob consulta</p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-3xl md:text-4xl font-bold text-foreground">{formatPrice(plan.price)}</span>
                        <span className="text-muted-foreground text-sm">/mês</span>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3 text-foreground">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(key)}
                    disabled={isLoading === key}
                    size="lg"
                    className={`w-full bg-gradient-to-r ${getGradient(key)} hover:opacity-90 text-white font-semibold`}
                  >
                    {isLoading === key ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processando...
                      </>
                    ) : hasCustomPricing ? (
                      <>
                        Falar com Especialista
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Assinar Agora
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            Pagamento seguro via Stripe. Cancele a qualquer momento.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Todos os planos incluem suporte prioritário e validação humana obrigatória.
          </p>
        </div>
      </div>
    </section>
  );
}
