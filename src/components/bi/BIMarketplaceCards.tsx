import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMPCheckout } from '@/contexts/MPCheckoutContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Check,
  Sparkles,
  Star,
  BarChart3,
  TrendingUp,
  Crown,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BI_PLANS, BIPlanType } from '@/lib/plans';

interface BIMarketplaceCardsProps {
  variant?: 'grid' | 'horizontal';
  showTitle?: boolean;
}

export function BIMarketplaceCards({ variant = 'grid', showTitle = true }: BIMarketplaceCardsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { openCheckout } = useMPCheckout();

  const handlePurchase = (planKey: BIPlanType) => {
    const plan = BI_PLANS[planKey];
    
    // Performance → always chat with specialist
    if (planKey === 'performance') {
      navigate(`/chat/especialista?servico=bi-${planKey}&plano=${planKey}`);
      return;
    }

    // Clarity & Control → open checkout modal
    const gradientMap: Record<string, string> = {
      clarity: 'from-blue-500 to-cyan-500',
      control: 'from-primary to-primary/70',
    };

    openCheckout({
      amountCents: plan.price,
      serviceName: plan.name,
      serviceType: planKey,
      description: plan.description,
      gradient: gradientMap[planKey] || 'from-primary to-primary/70',
      allowedMethods: ['card'],
      isRecurring: true,
      requireGuestInfo: !user,
      onSuccess: () => {
        // Will be handled by process-approved-payment
      },
    });
  };

  // Plan config type
  interface PlanConfig {
    icon: typeof BarChart3;
    gradient: string;
    title: string;
    subtitle: string;
    description: string;
    price: string;
    period: string;
    features: string[];
    cta: string;
    popular?: boolean;
    highlight?: boolean;
    customPricing?: boolean;
  }

  // Complete plan configurations
  const planConfigs: Record<BIPlanType, PlanConfig> = {
    clarity: {
      icon: BarChart3,
      gradient: 'from-blue-500 to-cyan-500',
      title: 'Atentai Clarity',
      subtitle: 'Entrada',
      description: 'Clareza financeira e entendimento dos números',
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
      cta: 'Comprar Agora',
    },
    control: {
      icon: TrendingUp,
      gradient: 'from-primary to-primary/70',
      title: 'Atentai Control',
      subtitle: 'Principal',
      description: 'Controle, previsão e suporte à decisão',
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
      cta: 'Comprar Agora',
    },
    performance: {
      icon: Crown,
      gradient: 'from-accent to-orange-500',
      title: 'Atentai Performance',
      subtitle: 'Premium',
      description: 'Performance, crescimento e estratégia empresarial',
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
    <div className="space-y-6">
      {showTitle && (
        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground mb-2">Planos BI + Contabilidade™</h3>
          <p className="text-muted-foreground">Escolha o nível ideal para sua empresa</p>
        </div>
      )}

      <div className={`grid ${variant === 'horizontal' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-3'} gap-6`}>
        {orderedPlans.map((key) => {
          const config = planConfigs[key];
          const Icon = config.icon;
          
          return (
            <Card 
              key={key}
              className={`relative bg-card border transition-all hover:shadow-xl ${
                config.highlight ? 'ring-2 ring-accent' : 
                config.popular ? 'ring-2 ring-primary' : 'border-border hover:border-primary/50'
              }`}
            >
              {config.popular && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary/70 text-white text-xs px-3 py-0.5">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Mais Popular
                </Badge>
              )}
              {config.highlight && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent to-orange-500 text-white text-xs px-3 py-0.5">
                  <Star className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
              
              <div className={`h-1 w-full bg-gradient-to-r ${config.gradient}`} />
              
              <CardHeader className="text-center pt-6 pb-2">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-gradient-to-br ${config.gradient} shadow-md`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{config.title}</CardTitle>
                <Badge variant="outline" className="mt-1 text-xs">
                  {config.subtitle}
                </Badge>
                <CardDescription className="mt-2 text-sm">
                  {config.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4 px-5 pb-6">
                <div className="text-center py-3 border-y border-border/50">
                  <span className="text-2xl font-bold text-foreground">{config.price}</span>
                  <span className="text-muted-foreground text-sm">{config.period}</span>
                  {config.customPricing && (
                    <p className="text-xs text-accent mt-1">Sob consulta</p>
                  )}
                </div>

                <ul className="space-y-2">
                  {config.features.slice(0, 5).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {config.features.length > 5 && (
                    <li className="text-xs text-muted-foreground pl-6">
                      +{config.features.length - 5} funcionalidades
                    </li>
                  )}
                </ul>

                <Button
                  onClick={() => handlePurchase(key)}
                  className={`w-full bg-gradient-to-r ${config.gradient} hover:opacity-90 text-white font-medium`}
                >
                  {config.customPricing ? (
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

      <p className="text-center text-xs text-muted-foreground">
        Após a compra, você será automaticamente direcionado ao especialista para onboarding e ativação.
      </p>
    </div>
  );
}
