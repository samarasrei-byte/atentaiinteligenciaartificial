import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMPCheckout } from '@/contexts/MPCheckoutContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Percent,
  Crown,
  Zap,
  Building2,
  User,
  Star,
  Award,
} from 'lucide-react';

interface LimpaNomePromoCardProps {
  variant?: 'full' | 'compact' | 'banner';
  showAIFeature?: boolean;
}

type PlanType = 'pf' | 'pj';

const plans = {
  pf: {
    id: 'pf',
    name: 'Pessoa Física',
    description: 'CPF',
    basePrice: 78000, // R$ 780,00 em centavos
    icon: User,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  pj: {
    id: 'pj',
    name: 'Empresa (CNPJ)',
    description: 'CNPJ',
    basePrice: 97000, // R$ 970,00 em centavos
    icon: Building2,
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    popular: true,
  }
};

export const LimpaNomePromoCard: React.FC<LimpaNomePromoCardProps> = ({ 
  variant = 'full',
  showAIFeature = true
}) => {
  const navigate = useNavigate();
  const { subscription, user } = useAuth();
  const { openCheckout } = useMPCheckout();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('pf');
  
  const isSubscribed = subscription?.subscribed || false;
  const discountPercent = 10;
  
  const currentPlan = plans[selectedPlan];
  const basePrice = currentPlan.basePrice;
  const discountedPrice = isSubscribed ? Math.round(basePrice * (1 - discountPercent / 100)) : basePrice;

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  };

  const features = [
    'Liminar coletiva para exclusão permanente',
    'Antecipação do prazo prescricional',
    'Acompanhamento por 90 dias',
    '🎁 Bônus: Regularização de Score!',
  ];

  const handleOpenCheckout = (planId: PlanType = selectedPlan) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const plan = plans[planId];
    const price = isSubscribed ? Math.round(plan.basePrice * 0.9) : plan.basePrice;
    openCheckout({
      amountCents: price,
      serviceName: `Limpa Nome ${planId === 'pf' ? 'CPF' : 'CNPJ'}`,
      serviceType: `limpa-nome-${planId}`,
      description: `Regularização ${planId === 'pf' ? 'CPF' : 'CNPJ'}`,
      gradient: 'from-rose-500 to-pink-600',
      metadata: { service_key: `limpa-nome-${planId}` },
      onSuccess: () => navigate('/painel'),
    });
  };

  if (variant === 'banner') {
    return (
      <Card className="bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10 border-rose-500/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground">Limpa Nome Jurídico</h3>
                  <Badge className="bg-rose-500/20 text-rose-600 border-rose-500/30 text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    100% Jurídico
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  PF a partir de {formatPrice(plans.pf.basePrice)} • CNPJ a partir de {formatPrice(plans.pj.basePrice)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-sm text-muted-foreground">A partir de</span>
                <span className="text-xl font-bold text-foreground ml-2">{formatPrice(plans.pf.basePrice)}</span>
              </div>
              <Button 
                onClick={() => handleOpenCheckout('pf')}
                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
              >
                Limpar Nome
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className="bg-card border-border hover:border-rose-500/30 transition-all group cursor-pointer" onClick={() => handleOpenCheckout('pf')}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Limpa Nome Jurídico</h3>
                <Badge className="bg-rose-500/20 text-rose-600 border-rose-500/30 text-xs">CPF & CNPJ</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                PF {formatPrice(plans.pf.basePrice)} • CNPJ {formatPrice(plans.pj.basePrice)}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-rose-500 transition-colors" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <Card className="bg-card border-rose-500/30 hover:border-rose-500/50 transition-all overflow-hidden relative">
      <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      {/* Popular Badge */}
      <div className="absolute top-4 right-4">
        <Badge className="bg-rose-500 text-white border-0 text-xs">
          <Award className="h-3 w-3 mr-1" />
          JURÍDICO
        </Badge>
      </div>
      
      <CardHeader className="pb-3 relative">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              Limpa Nome
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Serviço 100% Jurídico • Liminar Coletiva
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative">
        {/* Plan Selection */}
        <div className="grid grid-cols-2 gap-2">
          {Object.values(plans).map((plan) => {
            const PlanIcon = plan.icon;
            const planPrice = isSubscribed ? Math.round(plan.basePrice * 0.9) : plan.basePrice;
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id as PlanType)}
                className={`
                  relative p-3 rounded-xl border-2 transition-all text-left
                  ${plan.bgColor} ${plan.borderColor}
                  ${selectedPlan === plan.id ? 'ring-2 ring-rose-500' : ''}
                `}
              >
                {'popular' in plan && plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-rose-500 text-white border-0 text-[10px] px-2">
                    Mais Solicitado
                  </Badge>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <PlanIcon className={`h-4 w-4 ${plan.iconColor}`} />
                  <span className="font-semibold text-foreground text-sm">{plan.name}</span>
                </div>
                <div className="text-lg font-bold text-foreground">
                  {formatPrice(planPrice)}
                </div>
                <p className="text-xs text-muted-foreground">
                  4x de {formatPrice(planPrice / 4)}
                </p>
              </button>
            );
          })}
        </div>

        {/* Jurídico Feature Highlight */}
        {showAIFeature && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/20">
            <div className="p-2 rounded-lg bg-rose-500/20">
              <ShieldCheck className="h-5 w-5 text-rose-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Serviço 100% Jurídico</p>
              <p className="text-xs text-muted-foreground">
                Liminar coletiva • Resultado em 30 dias
              </p>
            </div>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">4.9/5 • 500+ atendidos</span>
        </div>

        {/* Features */}
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="space-y-2 pt-2 border-t border-border">
          {isSubscribed ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-green-600">{formatPrice(discountedPrice)}</span>
              <span className="text-sm text-muted-foreground line-through">{formatPrice(basePrice)}</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{formatPrice(basePrice)}</span>
            </div>
          )}
          <p className="text-sm font-semibold text-rose-500">
            ou 4x de {formatPrice(Math.round(discountedPrice / 4))} sem juros
          </p>
          {isSubscribed ? (
            <div className="flex items-center gap-1.5">
              <Percent className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs text-green-600 font-medium">
                {discountPercent}% de desconto aplicado
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs text-amber-600 font-medium">
                Assine e ganhe {discountPercent}% OFF
              </span>
            </div>
          )}
        </div>

        <Button 
          onClick={() => handleOpenCheckout()}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
        >
          <ShieldCheck className="h-4 w-4 mr-2" />
          Limpar Meu Nome
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          🔒 Garantia de resultado ou dinheiro de volta
        </p>
      </CardContent>
    </Card>
  );
};
