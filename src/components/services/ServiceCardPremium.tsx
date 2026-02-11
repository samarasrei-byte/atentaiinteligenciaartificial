import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMPCheckout } from '@/contexts/MPCheckoutContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Check, ArrowRight, Loader2, Shield, Users, Flame, Sparkles, 
  CreditCard, Lock, Star, Clock, BadgeCheck
} from 'lucide-react';

export interface ServiceCardConfig {
  key: string;
  name: string;
  description: string;
  targetAudience: string;
  features: string[];
  guarantees: string[];
  basePrice: number;
  originalPrice?: number;
  discountPercent: number;
  installments?: number;
  badge?: 'popular' | 'free' | 'new' | 'premium' | 'coming_soon';
  cta: string;
  color: 'primary' | 'accent' | 'emerald' | 'blue' | 'purple';
  icon: React.ElementType;
  serviceType: string;
  checkoutRoute?: string;
  isFree?: boolean;
  successFee?: boolean;
  category?: string;
  isCustomPricing?: boolean;
  isSubscription?: boolean;
  isDisabled?: boolean;
}

interface ServiceCardPremiumProps {
  service: ServiceCardConfig;
  isSubscriber: boolean;
}

export function ServiceCardPremium({ service, isSubscriber }: ServiceCardPremiumProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openCheckout } = useMPCheckout();

  const IconComponent = service.icon;
  
  const discountedPrice = isSubscriber 
    ? Math.round(service.basePrice * (1 - service.discountPercent / 100))
    : service.basePrice;
  
  const installmentValue = service.installments 
    ? Math.round(discountedPrice / service.installments) 
    : 0;

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const colorClasses = {
    primary: {
      bg: 'bg-primary/10',
      icon: 'text-primary',
      button: 'bg-primary hover:bg-primary/90',
      border: 'border-primary/30',
      ring: 'ring-primary/20',
    },
    accent: {
      bg: 'bg-accent/10',
      icon: 'text-accent',
      button: 'bg-accent hover:bg-accent/90',
      border: 'border-accent/50',
      ring: 'ring-accent/20',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      icon: 'text-emerald-600',
      button: 'bg-emerald-500 hover:bg-emerald-600',
      border: 'border-emerald-500/50',
      ring: 'ring-emerald-500/20',
    },
    blue: {
      bg: 'bg-blue-500/10',
      icon: 'text-blue-600',
      button: 'bg-blue-500 hover:bg-blue-600',
      border: 'border-blue-500/30',
      ring: 'ring-blue-500/20',
    },
    purple: {
      bg: 'bg-purple-500/10',
      icon: 'text-purple-600',
      button: 'bg-purple-500 hover:bg-purple-600',
      border: 'border-purple-500/30',
      ring: 'ring-purple-500/20',
    },
  };

  const colors = colorClasses[service.color];

  // Color to gradient mapping for the checkout modal
  const colorToGradient: Record<string, string> = {
    primary: 'from-primary to-primary/70',
    accent: 'from-accent to-orange-500',
    emerald: 'from-emerald-500 to-green-600',
    blue: 'from-blue-500 to-indigo-600',
    purple: 'from-purple-500 to-pink-600',
  };

  const handleCTAClick = () => {
    // Services that route to chat/onboarding (no direct payment)
    const CHAT_ROUTES: Record<string, string> = {
      'fiscal_analysis': '/modulo-fiscal/onboarding',
      'bi_contabilidade': '/bi-contabilidade/onboarding',
    };

    // Check if service routes to chat/onboarding
    const chatRoute = CHAT_ROUTES[service.serviceType];
    if (chatRoute) {
      navigate(chatRoute);
      return;
    }

    // Custom pricing services → route to custom checkout route (chat)
    if (service.isCustomPricing && service.checkoutRoute) {
      navigate(service.checkoutRoute);
      return;
    }

    // Free services with custom routes
    if (service.isFree && service.checkoutRoute) {
      navigate(service.checkoutRoute);
      return;
    }

    // All paid services → open Mercado Pago transparent checkout
    if (service.basePrice > 0) {
      if (!user) {
        toast.error('Faça login para continuar.');
        navigate('/auth');
        return;
      }

      openCheckout({
        amountCents: discountedPrice,
        serviceName: service.name,
        serviceType: service.serviceType,
        description: service.description,
        gradient: colorToGradient[service.color] || 'from-primary to-primary/70',
        metadata: {
          service_key: service.key,
        },
        ...(service.isSubscription ? { allowedMethods: ['card'] as ('pix' | 'card')[], isRecurring: true } : {}),
        onSuccess: () => {
          toast.success('Pagamento realizado com sucesso!');
        },
      });
      return;
    }

    // Fallback for any remaining case
    if (service.checkoutRoute) {
      navigate(service.checkoutRoute);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full"
    >
      <Card className={`h-full flex flex-col bg-white border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group relative overflow-hidden rounded-3xl ${
        service.badge === 'popular' 
          ? `${colors.border} ring-1 ${colors.ring}` 
          : service.badge === 'free'
            ? 'border-emerald-500/50 ring-1 ring-emerald-500/20'
            : 'border-slate-200 hover:border-slate-300'
      }`}>
        
        {/* Badge */}
        {service.badge && (
          <div className="absolute top-4 right-4 z-10">
            {service.badge === 'popular' && (
              <Badge className="bg-accent text-white border-0 text-[11px] font-semibold px-3 py-1 shadow-lg">
                <Flame className="w-3 h-3 mr-1" />
                MAIS VENDIDO
              </Badge>
            )}
            {service.badge === 'free' && (
              <Badge className="bg-emerald-500 text-white border-0 text-[11px] font-semibold px-3 py-1 shadow-lg">
                <Sparkles className="w-3 h-3 mr-1" />
                GRÁTIS
              </Badge>
            )}
            {service.badge === 'new' && (
              <Badge className="bg-blue-500 text-white border-0 text-[11px] font-semibold px-3 py-1 shadow-lg">
                <Star className="w-3 h-3 mr-1" />
                NOVO
              </Badge>
            )}
            {service.badge === 'premium' && (
              <Badge className="bg-gradient-to-r from-accent to-orange-500 text-white border-0 text-[11px] font-semibold px-3 py-1 shadow-lg">
                <Star className="w-3 h-3 mr-1" />
                PREMIUM
              </Badge>
            )}
            {service.badge === 'coming_soon' && (
              <Badge className="bg-slate-500 text-white border-0 text-[11px] font-semibold px-3 py-1 shadow-lg">
                <Clock className="w-3 h-3 mr-1" />
                EM BREVE
              </Badge>
            )}
          </div>
        )}

        <CardContent className="p-6 flex flex-col flex-1">
          {/* Icon */}
          <div className={`h-14 w-14 rounded-2xl ${colors.bg} flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}>
            <IconComponent className={`h-7 w-7 ${colors.icon}`} />
          </div>

          {/* Target Audience */}
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            {service.targetAudience}
          </p>

          {/* Name */}
          <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
            {service.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-600 mb-4">
            {service.description}
          </p>

          {/* Features List */}
          <div className="space-y-2.5 mb-5 flex-grow">
            {service.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Check className={`h-4 w-4 ${colors.icon} flex-shrink-0 mt-0.5`} />
                <span className="text-sm text-slate-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Pricing Section */}
          <div className="py-4 border-t border-slate-100 mb-4">
            {service.isCustomPricing ? (
              <div>
                <span className="text-xl font-bold text-purple-600">Sob Consulta</span>
                <p className="text-xs text-slate-500 mt-1">
                  Fale com o César para uma proposta personalizada
                </p>
              </div>
            ) : service.isFree ? (
              <div>
                <span className="text-2xl font-bold text-emerald-600">Gratuito</span>
                {service.successFee && (
                  <p className="text-xs text-slate-500 mt-1">
                    Pagamento apenas no êxito (50%)
                  </p>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  {service.originalPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      {formatPrice(service.originalPrice)}
                    </span>
                  )}
                  {isSubscriber && service.discountPercent > 0 && !service.originalPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      {formatPrice(service.basePrice)}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-slate-900">
                    {formatPrice(discountedPrice)}
                  </span>
                  {(service.originalPrice || (isSubscriber && service.discountPercent > 0)) && (
                    <Badge className="bg-accent/10 text-accent border-0 text-[10px]">
                      {service.originalPrice ? 'PROMOÇÃO' : `-${service.discountPercent}%`}
                    </Badge>
                  )}
                </div>
                {service.installments && (
                  <p className="text-xs font-medium text-accent mt-1">
                    ou {service.installments}x de {formatPrice(installmentValue)} sem juros
                  </p>
                )}
                {service.isSubscription && (
                  <p className="text-xs text-slate-500 mt-1">/mês</p>
                )}
              </div>
            )}
          </div>

          {/* Guarantees */}
          <div className="flex flex-wrap gap-2 mb-5">
            {service.guarantees.map((guarantee, i) => (
              <span key={i} className="text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                {guarantee}
              </span>
            ))}
          </div>

          {/* CTA Button */}
          <Button 
            onClick={service.isDisabled ? undefined : handleCTAClick}
            disabled={service.isDisabled}
            className={`w-full rounded-xl h-12 font-semibold text-white transition-all shadow-lg hover:shadow-xl mt-auto ${
              service.isDisabled 
                ? 'bg-slate-400 cursor-not-allowed' 
                : colors.button
            }`}
          >
            {service.cta}
            {!service.isDisabled && (
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
