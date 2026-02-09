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
  Crown,
  ArrowRight,
  MessageSquare,
  AlertTriangle
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
    
    // For Performance plan with custom pricing, redirect to César chat
    if ('customPricing' in plan && plan.customPricing) {
      navigate('/chat/cesar?servico=bi-performance&plano=performance');
      return;
    }

    setIsLoading(planKey);
    
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
      setIsLoading(null);
    }
  };

  // Plan configuration type
  interface PlanConfig {
    icon: typeof BarChart3;
    gradient: string;
    borderColor: string;
    tagLabel: string;
    tagColor: string;
    title: string;
    subtitle: string;
    price: string;
    period: string;
    features: string[];
    cta: string;
    popular?: boolean;
    highlight?: boolean;
    customPricing?: boolean;
  }

  // Plan configurations with exact content from requirements
  const planConfigs: Record<BIPlanType, PlanConfig> = {
    clarity: {
      icon: BarChart3,
      gradient: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-200 dark:border-blue-800',
      tagLabel: 'Entrada',
      tagColor: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
      title: 'Atentai Clarity',
      subtitle: 'Clareza financeira e entendimento dos números',
      price: 'R$ 1.497',
      period: '/mês',
      features: [
        'BI padrão com DRE gerencial',
        'Resultado, margem e despesas',
        'IA explicativa e educativa',
        'Linguagem clara e acessível',
        'Supervisão humana obrigatória',
        'Relatórios mensais em PDF',
      ],
      cta: 'Assinar Agora',
    },
    control: {
      icon: TrendingUp,
      gradient: 'from-primary to-primary/70',
      borderColor: 'ring-2 ring-primary',
      tagLabel: 'Principal',
      tagColor: 'bg-primary/10 text-primary',
      title: 'Atentai Control',
      subtitle: 'Controle, previsão e suporte à decisão',
      price: 'R$ 3.497',
      period: '/mês',
      popular: true,
      features: [
        'Tudo do Clarity +',
        'Real x Orçado e forecast',
        'Indicadores personalizados',
        'Alertas inteligentes',
        'Simulações de cenários',
        'IA analítica e orientada à ação',
        'Apoio a decisões táticas',
      ],
      cta: 'Assinar Agora',
    },
    performance: {
      icon: Crown,
      gradient: 'from-accent to-orange-500',
      borderColor: 'ring-2 ring-accent',
      tagLabel: 'Premium',
      tagColor: 'bg-accent/10 text-accent',
      title: 'Atentai Performance',
      subtitle: 'Performance, crescimento e estratégia empresarial',
      price: 'A partir de R$ 8.000',
      period: '/mês',
      customPricing: true,
      highlight: true,
      features: [
        'Tudo do Control +',
        'P&L por área, produto ou unidade',
        'IA como apoio estratégico sênior',
        'Recomendações financeiras e comerciais',
        'Integração ERP e CRM',
        'Planejamento financeiro completo',
        'Linguagem executiva e estratégica',
        'Validação humana em todas as recomendações',
      ],
      cta: 'Solicitar Contato',
    },
  };

  const orderedPlans: BIPlanType[] = ['clarity', 'control', 'performance'];

  return (
    <section id="bi-pricing" className="py-16 md:py-24 bg-gradient-to-br from-indigo-50/50 via-violet-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:via-violet-950/20 dark:to-purple-950/20 relative overflow-hidden">
      {/* Reform Alert Banner */}
      <div className="container mx-auto px-4 mb-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <span className="text-xl md:text-2xl font-bold text-foreground">
                A Reforma Tributária já começou. Você está preparado?
              </span>
            </div>
            <p className="text-muted-foreground">
              IBS e CBS entram em vigor em 2026. Garanta inteligência fiscal para sua empresa agora.
            </p>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 md:mb-16">
          <Badge className="mb-3 md:mb-4 bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-400/20">
            <Brain className="h-3 w-3 mr-1" />
            Planos Atentai — BI + Contabilidade™
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-foreground mb-3 md:mb-4 px-2">
            Escolha seu nível de inteligência
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Dashboards financeiros, IA analítica e supervisão humana — tudo em um só lugar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto px-2">
          {orderedPlans.map((key) => {
            const config = planConfigs[key];
            const Icon = config.icon;
            
            return (
              <Card 
                key={key}
                className={`relative bg-card border-2 transition-all hover:shadow-2xl ${
                  config.highlight ? 'ring-2 ring-accent md:scale-[1.02] lg:scale-105 z-10' : 
                  config.popular ? 'ring-2 ring-primary' : 'border-border hover:border-primary/50'
                }`}
              >
                {config.highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent to-orange-500 text-white text-xs px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
                {config.popular && !config.highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary/70 text-white text-xs px-4 py-1">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Mais Popular
                  </Badge>
                )}
                
                {/* Gradient Top Bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${config.gradient}`} />
                
                <CardHeader className="text-center pt-8 px-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br ${config.gradient} shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-foreground">{config.title}</CardTitle>
                  <Badge variant="outline" className={`mt-2 text-xs ${config.tagColor}`}>
                    {config.tagLabel}
                  </Badge>
                  <CardDescription className="text-muted-foreground mt-2 text-sm">
                    {config.subtitle}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6 px-6 pb-8">
                  <div className="text-center py-4 border-y border-border/50">
                    {config.customPricing ? (
                      <div>
                        <p className="text-2xl md:text-3xl font-bold text-foreground">{config.price}</p>
                        <span className="text-muted-foreground text-sm">{config.period}</span>
                        <p className="text-xs text-accent mt-1">Sob consulta</p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-3xl md:text-4xl font-bold text-foreground">{config.price}</span>
                        <span className="text-muted-foreground text-sm">{config.period}</span>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {config.features.map((feature, index) => (
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
                    className={`w-full bg-gradient-to-r ${config.gradient} hover:opacity-90 text-white font-semibold`}
                  >
                    {isLoading === key ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processando...
                      </>
                    ) : config.customPricing ? (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {config.cta}
                      </>
                    ) : (
                      <>
                        {config.cta}
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
          <p className="text-xs text-accent mt-4 font-medium">
            Após a contratação, você será direcionado ao César para onboarding e ativação.
          </p>
        </div>
      </div>
    </section>
  );
}
