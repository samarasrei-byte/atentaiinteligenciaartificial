import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMPCheckout } from '@/contexts/MPCheckoutContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Check,
  Calculator,
  Loader2,
  TrendingUp,
  FileText,
  BarChart3,
  Download,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { STRIPE_PLANS, formatPrice } from '@/lib/stripe';

const PlanoSimulador = () => {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const { openCheckout } = useMPCheckout();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const plan = STRIPE_PLANS.simulator;
  const isCurrentPlan = subscription.plan === 'simulator';

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: 'Faça login primeiro',
        description: 'Você precisa estar logado para assinar',
      });
      navigate('/auth');
      return;
    }

    openCheckout({
      amountCents: plan.price,
      serviceName: plan.name,
      serviceType: 'simulator',
      description: 'Acesso completo ao simulador tributário',
      gradient: 'from-blue-500 to-cyan-500',
      metadata: { service_key: 'simulator' },
      allowedMethods: ['card'],
      isRecurring: true,
      onSuccess: () => {
        toast({ title: 'Assinatura ativada!' });
      },
    });
  };

  const benefits = [
    {
      icon: Calculator,
      title: 'Simulação Completa',
      description: 'Calcule o impacto exato da reforma tributária nos seus impostos',
    },
    {
      icon: TrendingUp,
      title: 'Comparativo Detalhado',
      description: 'Veja a diferença entre o regime atual e o novo sistema tributário',
    },
    {
      icon: BarChart3,
      title: 'Timeline 2026-2033',
      description: 'Acompanhe a transição ano a ano com projeções precisas',
    },
    {
      icon: FileText,
      title: 'Relatórios Profissionais',
      description: 'Gere documentos prontos para apresentar a stakeholders',
    },
    {
      icon: Download,
      title: 'Exportação PDF',
      description: 'Baixe seus relatórios em formato profissional',
    },
    {
      icon: Shield,
      title: 'Dados Seguros',
      description: 'Suas informações são criptografadas e protegidas',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/pricing')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Planos
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Calculator className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              {plan.name}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {plan.description}
            </p>

            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="text-5xl font-bold text-foreground">{formatPrice(plan.price)}</span>
              <span className="text-xl text-muted-foreground">/mês</span>
            </div>

            {isCurrentPlan ? (
              <Badge variant="outline" className="text-lg px-6 py-2 bg-green-500/10 text-green-500 border-green-500">
                <Check className="h-5 w-5 mr-2" />
                Plano Atual
              </Badge>
            ) : (
              <Button
                size="lg"
                onClick={handleSubscribe}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-lg px-8 py-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processando...
                  </>
                ) : (
                  'Assinar Agora'
                )}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            O que está incluído
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-foreground mb-8">
              Recursos incluídos
            </h2>
            
            <div className="space-y-4">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {!isCurrentPlan && (
              <div className="mt-12 text-center">
                <Button
                  size="lg"
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Processando...
                    </>
                  ) : (
                    'Começar Agora'
                  )}
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  Pagamento seguro via Stripe. Cancele a qualquer momento.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlanoSimulador;
