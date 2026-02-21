import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  Tag, 
  Crown, 
  TrendingDown,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SUBSCRIBER_DISCOUNTS, ServiceType, formatPrice, PLATFORM_COMMISSION } from '@/lib/plans';

interface ServicePricePreviewProps {
  serviceType: ServiceType;
  customPrice?: number; // in cents, overrides default
  showPlatformInfo?: boolean;
}

export function ServicePricePreview({ 
  serviceType, 
  customPrice,
  showPlatformInfo = false 
}: ServicePricePreviewProps) {
  const { subscription } = useAuth();
  const isSubscriber = subscription.subscribed;
  
  const service = SUBSCRIBER_DISCOUNTS[serviceType];
  const basePrice = customPrice ?? service.basePrice;
  const discountPercent = service.discount * 100;
  const discountedPrice = isSubscriber 
    ? Math.round(basePrice * (1 - service.discount)) 
    : basePrice;
  const savings = basePrice - discountedPrice;
  
  // Platform commission (for contador info)
  const platformFee = Math.round(discountedPrice * PLATFORM_COMMISSION);
  const contadorEarnings = discountedPrice - platformFee;

  return (
    <Card className={`border-2 transition-all ${
      isSubscriber 
        ? 'border-success/50 bg-success/5' 
        : 'border-primary/20 bg-primary/5'
    }`}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isSubscriber ? (
              <Crown className="h-5 w-5 text-success" />
            ) : (
              <Tag className="h-5 w-5 text-primary" />
            )}
            <span className="font-semibold text-foreground">
              Resumo do Pagamento
            </span>
          </div>
          {isSubscriber && (
            <Badge className="bg-success/10 text-success border-success/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Assinante
            </Badge>
          )}
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-3">
          {/* Base Price */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{service.name}</span>
            <span className={isSubscriber ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}>
              {formatPrice(basePrice)}
            </span>
          </div>

          {/* Discount Line (only for subscribers) */}
          {isSubscriber && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-success">
                <TrendingDown className="h-4 w-4" />
                <span>Desconto de assinante ({discountPercent}%)</span>
              </div>
              <span className="text-success font-medium">
                -{formatPrice(savings)}
              </span>
            </div>
          )}

          <Separator />

          {/* Final Price */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">Total a Pagar</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-foreground">
                {formatPrice(discountedPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Savings Banner (only for subscribers) */}
        {isSubscriber && savings > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
            <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-success">
                Você está economizando {formatPrice(savings)}!
              </p>
              <p className="text-xs text-success/80">
                Benefício exclusivo do seu plano de assinatura
              </p>
            </div>
          </div>
        )}

        {/* Non-subscriber CTA */}
        {!isSubscriber && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">
                  Assinantes economizam {discountPercent}%!
                </p>
                <p className="text-xs text-primary/80">
                  Com uma assinatura, você pagaria apenas {formatPrice(Math.round(basePrice * (1 - service.discount)))}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Platform Info (for contador visibility) */}
        {showPlatformInfo && (
          <>
            <Separator />
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Comissão da plataforma ({PLATFORM_COMMISSION * 100}%)</span>
                <span>-{formatPrice(platformFee)}</span>
              </div>
              <div className="flex justify-between font-medium text-foreground">
                <span>Ganho líquido do contador</span>
                <span className="text-success">{formatPrice(contadorEarnings)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
