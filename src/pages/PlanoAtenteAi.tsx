import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Check,
  Brain,
  Loader2,
  MessageCircle,
  Zap,
  Clock,
  BookOpen,
  Headphones,
  Infinity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { STRIPE_PLANS, formatPrice, AI_LIMITS } from '@/lib/stripe';

const PlanoAtenteAi = () => {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const plan = STRIPE_PLANS.premium;
  const isCurrentPlan = subscription.plan === 'premium';

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: 'Faça login primeiro',
        description: 'Você precisa estar logado para assinar',
      });
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    
    try {
      navigate('/pricing');
      return;
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao iniciar checkout',
        description: error.message || 'Tente novamente mais tarde',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    {
      icon: Infinity,
      title: 'Perguntas Ilimitadas',
      description: 'Sem limite diário de perguntas. Usuários gratuitos têm apenas 5 perguntas/dia.',
    },
    {
      icon: Brain,
      title: 'IA Especializada',
      description: 'Treinada com toda a legislação tributária brasileira e reforma de 2026',
    },
    {
      icon: Zap,
      title: 'Respostas Instantâneas',
      description: 'Obtenha respostas detalhadas em segundos, 24 horas por dia',
    },
    {
      icon: BookOpen,
      title: 'Base Atualizada',
      description: 'Informações sempre atualizadas com as últimas mudanças na legislação',
    },
    {
      icon: MessageCircle,
      title: 'Contexto Completo',
      description: 'A IA mantém o histórico da conversa para respostas mais precisas',
    },
    {
      icon: Headphones,
      title: 'Suporte Prioritário',
      description: 'Atendimento prioritário para assinantes premium',
    },
  ];

  const comparisons = [
    { feature: 'Perguntas por dia', free: `${AI_LIMITS.autonomo.dailyQuestions} perguntas`, premium: `${AI_LIMITS.premium.dailyQuestions}+` },
    { feature: 'Histórico de conversas', free: 'Limitado', premium: 'Completo' },
    { feature: 'Respostas detalhadas', free: 'Básicas', premium: 'Avançadas' },
    { feature: 'Suporte', free: 'Comunidade', premium: 'Prioritário' },
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
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              Mais Popular
            </Badge>
            
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Brain className="h-10 w-10 text-white" />
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
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processando...
                  </>
                ) : (
                  'Assinar AtentAI'
                )}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Gratuito vs Premium
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <Card className="bg-card border-border overflow-hidden">
              <div className="grid grid-cols-3 bg-muted/50 p-4 font-semibold">
                <div className="text-muted-foreground">Recurso</div>
                <div className="text-center text-muted-foreground">Gratuito</div>
                <div className="text-center text-primary">AtentAI</div>
              </div>
              {comparisons.map((item, index) => (
                <div key={index} className="grid grid-cols-3 p-4 border-t border-border">
                  <div className="text-foreground">{item.feature}</div>
                  <div className="text-center text-muted-foreground">{item.free}</div>
                  <div className="text-center text-primary font-medium">{item.premium}</div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Por que assinar o AtentAI?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
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

      {/* CTA */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Pronto para dominar a Reforma Tributária?
            </h2>
            <p className="text-muted-foreground mb-8">
              Tenha acesso ilimitado ao AtentAI e tire todas as suas dúvidas sobre legislação tributária.
            </p>
            
            {!isCurrentPlan && (
              <>
                <Button
                  size="lg"
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90"
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
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlanoAtenteAi;
