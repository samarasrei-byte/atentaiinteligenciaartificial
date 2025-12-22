import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  ArrowLeft, 
  Check,
  Crown,
  Loader2,
  Sparkles,
  Settings,
  Calculator
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { STRIPE_PLANS, formatPrice, PlanType } from '@/lib/stripe';

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, subscription, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isManaging, setIsManaging] = useState(false);

  useEffect(() => {
    const checkoutResult = searchParams.get('checkout');
    if (checkoutResult === 'success') {
      toast({
        title: 'Assinatura realizada!',
        description: 'Sua assinatura foi ativada com sucesso.',
      });
      checkSubscription();
    } else if (checkoutResult === 'canceled') {
      toast({
        variant: 'destructive',
        title: 'Checkout cancelado',
        description: 'O processo de checkout foi cancelado.',
      });
    }
  }, [searchParams]);

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

  const handleManageSubscription = async () => {
    if (!user) return;

    setIsManaging(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Portal error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao abrir portal',
        description: error.message || 'Tente novamente mais tarde',
      });
    } finally {
      setIsManaging(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const planEntries = Object.entries(STRIPE_PLANS) as [PlanType, typeof STRIPE_PLANS[PlanType]][];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(user ? '/dashboard' : '/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          
          {subscription.subscribed && (
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={isManaging}
            >
              {isManaging ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Settings className="h-4 w-4 mr-2" />
              )}
              Gerenciar Assinatura
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Escolha seu plano
          </h1>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {planEntries.map(([key, plan]) => {
            const isCurrentPlan = subscription.plan === key;
            const isPlanPopular = 'popular' in plan && plan.popular;
            const Icon = key === 'simulator' ? Calculator : Brain;
            
            return (
              <Card 
                key={key}
                className={`relative bg-card border transition-all hover:shadow-lg ${
                  isPlanPopular ? 'ring-2 ring-primary scale-105' : 'border-border'
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {isPlanPopular && !isCurrentPlan && (
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
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                    key === 'simulator' 
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                      : 'bg-gradient-to-br from-primary to-primary/70'
                  }`}>
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
                        : key === 'simulator' 
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
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
        </div>
      </main>
    </div>
  );
};

export default Pricing;
