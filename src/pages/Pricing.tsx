import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  ArrowLeft, 
  Check,
  Crown,
  Loader2,
  Sparkles,
  Settings,
  Calculator,
  Users,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { STRIPE_PLANS, formatPrice, PlanType } from '@/lib/stripe';
import { CouponInput } from '@/components/pricing/CouponInput';
import { isContadorEnabled } from '@/lib/featureFlags';

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, subscription, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isManaging, setIsManaging] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string;
    name: string;
    discount: number;
    type: 'percent' | 'amount';
  } | null>(null);

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
        body: { 
          priceId: STRIPE_PLANS[planKey].priceId,
          couponId: appliedCoupon?.id || null,
        },
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

  const handleCouponApplied = (couponId: string, discount: { type: 'percent' | 'amount'; value: number; name: string }) => {
    setAppliedCoupon({
      id: couponId,
      name: discount.name,
      discount: discount.value,
      type: discount.type,
    });
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
  };

  const calculateDiscountedPrice = (originalPrice: number): number => {
    if (!appliedCoupon) return originalPrice;
    if (appliedCoupon.type === 'percent') {
      return Math.round(originalPrice * (1 - appliedCoupon.discount / 100));
    }
    return Math.max(0, originalPrice - appliedCoupon.discount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const orderedPlans: PlanType[] = isContadorEnabled() 
    ? ['simulator', 'autonomo', 'premium', 'contador']
    : ['simulator', 'autonomo', 'premium'];

  const getIcon = (key: PlanType) => {
    switch (key) {
      case 'simulator': return Calculator;
      case 'autonomo': return Users;
      case 'premium': return Brain;
      case 'contador': return Star;
      default: return Brain;
    }
  };

  const getGradient = (key: PlanType) => {
    switch (key) {
      case 'simulator': return 'from-blue-500 to-cyan-500';
      case 'autonomo': return 'from-green-500 to-emerald-500';
      case 'premium': return 'from-primary to-primary/70';
      case 'contador': return 'from-accent to-orange-500';
      default: return 'from-primary to-primary/70';
    }
  };

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
            <img 
              src="/logo-atentai.png" 
              alt="AtentAI" 
              className="h-10 w-auto"
            />
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
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Desbloqueie agora o potencial do AtentAI
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Lei Complementar 214/2025 • Vigência 2026 — Todas as ferramentas para dominar a Reforma Tributária
          </p>
          
          {subscription.subscribed && subscription.plan && (
            <div className="mt-6 inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
              <Crown className="h-5 w-5" />
              <span>Você está no plano <strong>{STRIPE_PLANS[subscription.plan]?.name}</strong></span>
            </div>
          )}
          
          <div className="mt-6">
            <Button
              variant="link"
              onClick={() => navigate('/plano/comparar')}
              className="text-primary hover:text-primary/80"
            >
              Comparar todos os planos em detalhes →
            </Button>
          </div>
        </div>

        {/* Coupon Input */}
        {!subscription.subscribed && (
          <div className="max-w-md mx-auto mb-12">
            <CouponInput 
              onCouponApplied={handleCouponApplied}
              onCouponRemoved={handleCouponRemoved}
              appliedCoupon={appliedCoupon}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {orderedPlans.map((key) => {
            const plan = STRIPE_PLANS[key];
            const isCurrentPlan = subscription.plan === key;
            const isPlanPopular = 'popular' in plan && plan.popular;
            const isHighlight = 'highlight' in plan && plan.highlight;
            const Icon = getIcon(key);
            const originalPrice = plan.price;
            const discountedPrice = calculateDiscountedPrice(originalPrice);
            const hasDiscount = appliedCoupon && discountedPrice < originalPrice;
            
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
                    {hasDiscount ? (
                      <>
                        <span className="text-lg text-muted-foreground line-through">
                          {formatPrice(originalPrice)}
                        </span>
                        <span className="text-4xl font-bold text-success ml-2">
                          {formatPrice(discountedPrice)}
                        </span>
                        <span className="text-muted-foreground">/mês</span>
                        <Badge className="ml-2 bg-success/10 text-success border-success/20">
                          -{appliedCoupon?.discount}%
                        </Badge>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-foreground">{formatPrice(plan.price)}</span>
                        <span className="text-muted-foreground">/mês</span>
                      </>
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
          <p className="mt-2 text-accent font-medium">Plano Business Pro parcelável em até 10x sem juros!</p>
        </div>

        {/* Seção para Contadores - Only show if feature is enabled */}
        {isContadorEnabled() && (
          <>
            <Separator className="my-16" />
            
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-full mb-6">
                <Users className="h-5 w-5" />
                <span className="font-medium">Área do Profissional Contábil</span>
              </div>
              
              <h2 className="text-3xl font-bold text-foreground mb-4">
                É Contador? Cadastre-se e ganhe com cada serviço!
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Ofereça consultas, abertura de empresas e emissão de certidões. 
                Você fica com <span className="text-emerald-600 font-semibold">85% de cada serviço</span> realizado.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="bg-card/50 border-border">
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                      <Calculator className="h-6 w-6 text-emerald-500" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">Consultas</h3>
                    <p className="text-sm text-muted-foreground">Defina seu valor por consulta</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border">
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">Abertura de Empresas</h3>
                    <p className="text-sm text-muted-foreground">Precifique conforme complexidade</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border">
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                      <Star className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">Certidões</h3>
                    <p className="text-sm text-muted-foreground">Emita certidões com agilidade</p>
                  </CardContent>
                </Card>
              </div>
              
              <Button 
                size="lg"
                onClick={() => navigate('/contador/onboarding')}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                <Crown className="h-5 w-5 mr-2" />
                Cadastrar como Contador
              </Button>
              
              <p className="text-xs text-muted-foreground mt-4">
                Cadastro gratuito. Você só paga 15% de comissão quando realiza um serviço.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Pricing;
