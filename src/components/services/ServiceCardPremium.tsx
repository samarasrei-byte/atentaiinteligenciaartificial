import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MaskedInput } from '@/components/ui/masked-input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
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
  discountPercent: number;
  installments?: number;
  badge?: 'popular' | 'free' | 'new';
  cta: string;
  color: 'primary' | 'accent' | 'emerald' | 'blue' | 'purple';
  icon: React.ElementType;
  serviceType: string;
  checkoutRoute?: string;
  isFree?: boolean;
  successFee?: boolean;
  category?: string;
  isCustomPricing?: boolean; // For services with no fixed price (sold via chat)
}

interface ServiceCardPremiumProps {
  service: ServiceCardConfig;
  isSubscriber: boolean;
}

export function ServiceCardPremium({ service, isSubscriber }: ServiceCardPremiumProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
  });

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

  const handleCTAClick = () => {
    // CHECKOUT FIRST: All services with fixed prices go directly to checkout
    const checkoutRoutes: Record<string, string> = {
      'credit_repair_pf': '/checkout/limpa-nome-pf',
      'credit_repair_pj': '/checkout/limpa-nome-pj',
      'ir_simples': '/checkout/ir-simples',
      'ir_completo': '/checkout/ir-completo',
      'company_opening': '/checkout/abertura-empresa',
      'certificate': '/checkout/certidao',
      'consultation': '/checkout/consulta-contador',
    };

    // If service has a checkout route, go directly to checkout
    const checkoutRoute = checkoutRoutes[service.serviceType];
    if (checkoutRoute) {
      navigate(checkoutRoute);
      return;
    }

    // Services with custom pricing (BI, Fiscal) go to chat
    if (service.isCustomPricing && service.checkoutRoute) {
      navigate(service.checkoutRoute);
      return;
    }

    // Fallback: show inline checkout modal
    setShowCheckout(true);
  };

  const handleCheckoutSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Email inválido');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-guest-service-payment', {
        body: {
          serviceType: service.serviceType,
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone,
        },
      });

      if (error) throw error;

      if (data?.url) {
        toast.success('Redirecionando para pagamento seguro...');
        window.open(data.url, '_blank');
        setShowCheckout(false);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Erro ao processar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
                    {isSubscriber && service.discountPercent > 0 && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatPrice(service.basePrice)}
                      </span>
                    )}
                    <span className="text-2xl font-bold text-slate-900">
                      {formatPrice(discountedPrice)}
                    </span>
                    {isSubscriber && service.discountPercent > 0 && (
                      <Badge className="bg-accent/10 text-accent border-0 text-[10px]">
                        -{service.discountPercent}%
                      </Badge>
                    )}
                  </div>
                  {service.installments && (
                    <p className="text-xs font-medium text-accent mt-1">
                      ou {service.installments}x de {formatPrice(installmentValue)} sem juros
                    </p>
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
              onClick={handleCTAClick}
              className={`w-full rounded-xl h-12 font-semibold text-white transition-all shadow-lg hover:shadow-xl mt-auto ${colors.button}`}
            >
              {service.cta}
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Inline Checkout Modal */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Finalizar Pedido
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Service Summary */}
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-10 w-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                  <IconComponent className={`h-5 w-5 ${colors.icon}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{service.name}</h4>
                  <p className="text-xs text-slate-500">{service.targetAudience}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="text-sm text-slate-600">Total</span>
                <span className="text-xl font-bold text-slate-900">
                  {formatPrice(discountedPrice)}
                </span>
              </div>
            </div>

            {/* Quick Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="checkout-name">Nome Completo *</Label>
                <Input
                  id="checkout-name"
                  placeholder="Seu nome completo"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkout-email">E-mail *</Label>
                <Input
                  id="checkout-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkout-phone">WhatsApp *</Label>
                <MaskedInput
                  id="checkout-phone"
                  mask="phone"
                  value={formData.phone}
                  onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                />
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Pagamento seguro
              </div>
              <div className="flex items-center gap-1">
                <BadgeCheck className="h-3 w-3" />
                Profissionais verificados
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleCheckoutSubmit}
              disabled={isSubmitting}
              className={`w-full h-12 rounded-xl font-semibold ${colors.button} text-white`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Pagar {formatPrice(discountedPrice)}
                </>
              )}
            </Button>

            <p className="text-[10px] text-center text-slate-400">
              Ao clicar, você será redirecionado para o checkout seguro do Stripe
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
