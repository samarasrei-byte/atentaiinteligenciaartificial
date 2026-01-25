import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, TrendingDown, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  basePriceCents: number;
  subscriberDiscountPercent: number;
  showSavingsBanner?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * UNIFIED PRICE DISPLAY COMPONENT
 * 
 * Use this component across the entire platform to display prices with subscriber discounts.
 * Ensures 100% consistency in how prices and discounts are presented.
 * 
 * Features:
 * - Shows original price (crossed out for subscribers)
 * - Shows discounted price for subscribers
 * - Badge for subscriber status
 * - Savings banner option
 * - CTA for non-subscribers
 */
export function UnifiedPriceDisplay({
  basePriceCents,
  subscriberDiscountPercent,
  showSavingsBanner = true,
  size = 'md',
  className,
  orientation = 'vertical',
}: PriceDisplayProps) {
  const { subscription } = useAuth();
  const isSubscriber = subscription.subscribed;
  
  const discountedPriceCents = Math.round(basePriceCents * (1 - subscriberDiscountPercent / 100));
  const savingsCents = basePriceCents - discountedPriceCents;
  
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const sizeClasses = {
    sm: {
      base: 'text-sm',
      final: 'text-lg font-bold',
      badge: 'text-xs',
    },
    md: {
      base: 'text-base',
      final: 'text-2xl font-bold',
      badge: 'text-xs',
    },
    lg: {
      base: 'text-lg',
      final: 'text-3xl font-bold',
      badge: 'text-sm',
    },
  };

  const styles = sizeClasses[size];

  return (
    <div className={cn('space-y-2', className)}>
      {/* Price Display */}
      <div className={cn(
        'flex items-baseline gap-2',
        orientation === 'vertical' ? 'flex-col items-start' : 'flex-row items-baseline'
      )}>
        {/* Original Price */}
        <span className={cn(
          styles.base,
          isSubscriber ? 'line-through text-muted-foreground' : 'font-semibold text-foreground'
        )}>
          {formatPrice(basePriceCents)}
        </span>
        
        {/* Discounted Price (only for subscribers) */}
        {isSubscriber && (
          <span className={cn(styles.final, 'text-success')}>
            {formatPrice(discountedPriceCents)}
          </span>
        )}
      </div>

      {/* Subscriber Badge */}
      {isSubscriber && (
        <Badge className="bg-success/10 text-success border-success/20 gap-1">
          <Crown className="h-3 w-3" />
          {subscriberDiscountPercent}% OFF Assinante
        </Badge>
      )}

      {/* Non-subscriber CTA */}
      {!isSubscriber && subscriberDiscountPercent > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          <span>
            Assinantes pagam apenas{' '}
            <span className="font-semibold text-primary">
              {formatPrice(discountedPriceCents)}
            </span>
            {' '}({subscriberDiscountPercent}% OFF)
          </span>
        </div>
      )}

      {/* Savings Banner */}
      {showSavingsBanner && isSubscriber && savingsCents > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10 border border-success/20 text-sm">
          <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
          <span className="text-success font-medium">
            Você economiza {formatPrice(savingsCents)}!
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * CHECKOUT PRICE BREAKDOWN COMPONENT
 * 
 * Use in checkout flows to show complete price breakdown with:
 * - Original price
 * - Subscriber discount (if applicable)
 * - Coupon discount (if applicable)
 * - Final total
 */
interface CheckoutPriceBreakdownProps {
  basePriceCents: number;
  subscriberDiscountPercent: number;
  serviceName: string;
  coupon?: {
    code: string;
    type: 'percent' | 'amount';
    value: number;
  } | null;
  className?: string;
}

export function CheckoutPriceBreakdown({
  basePriceCents,
  subscriberDiscountPercent,
  serviceName,
  coupon,
  className,
}: CheckoutPriceBreakdownProps) {
  const { subscription } = useAuth();
  const isSubscriber = subscription.subscribed;
  
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  // Calculate subscriber discount
  let priceAfterSubscription = basePriceCents;
  let subscriberDiscountCents = 0;
  
  if (isSubscriber && subscriberDiscountPercent > 0) {
    subscriberDiscountCents = Math.round(basePriceCents * (subscriberDiscountPercent / 100));
    priceAfterSubscription = basePriceCents - subscriberDiscountCents;
  }

  // Calculate coupon discount (applied AFTER subscriber discount)
  // Best practice: Apply only the greater discount
  let couponDiscountCents = 0;
  let finalPriceCents = priceAfterSubscription;
  let useCouponInstead = false;

  if (coupon) {
    if (coupon.type === 'percent') {
      couponDiscountCents = Math.round(basePriceCents * (coupon.value / 100));
    } else {
      couponDiscountCents = coupon.value;
    }

    // If coupon gives better discount than subscription, use coupon
    if (couponDiscountCents > subscriberDiscountCents) {
      useCouponInstead = true;
      finalPriceCents = basePriceCents - couponDiscountCents;
    }
  }

  const totalDiscount = useCouponInstead 
    ? couponDiscountCents 
    : subscriberDiscountCents + (coupon && !useCouponInstead ? Math.round(priceAfterSubscription * (coupon.type === 'percent' ? coupon.value / 100 : 0)) : 0);

  return (
    <div className={cn('space-y-3 p-4 rounded-lg bg-muted/50 border', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-foreground">Resumo do Pagamento</span>
        {isSubscriber && (
          <Badge className="bg-success/10 text-success border-success/20 gap-1">
            <Crown className="h-3 w-3" />
            Assinante
          </Badge>
        )}
      </div>

      {/* Price Lines */}
      <div className="space-y-2 text-sm">
        {/* Base Price */}
        <div className="flex justify-between">
          <span className="text-muted-foreground">{serviceName}</span>
          <span className={totalDiscount > 0 ? 'line-through text-muted-foreground' : 'text-foreground'}>
            {formatPrice(basePriceCents)}
          </span>
        </div>

        {/* Subscriber Discount */}
        {isSubscriber && subscriberDiscountCents > 0 && !useCouponInstead && (
          <div className="flex justify-between text-success">
            <div className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              <span>Desconto assinante ({subscriberDiscountPercent}%)</span>
            </div>
            <span>-{formatPrice(subscriberDiscountCents)}</span>
          </div>
        )}

        {/* Coupon Discount */}
        {coupon && (useCouponInstead || !isSubscriber) && (
          <div className="flex justify-between text-primary">
            <div className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              <span>
                Cupom {coupon.code} 
                ({coupon.type === 'percent' ? `${coupon.value}%` : formatPrice(coupon.value)})
              </span>
            </div>
            <span>-{formatPrice(couponDiscountCents)}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Total */}
      <div className="flex justify-between items-center">
        <span className="font-semibold text-foreground">Total</span>
        <span className="text-xl font-bold text-foreground">
          {formatPrice(finalPriceCents)}
        </span>
      </div>

      {/* Savings Message */}
      {totalDiscount > 0 && (
        <div className="flex items-center gap-2 p-2 rounded bg-success/10 text-sm">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <span className="text-success font-medium">
            Você está economizando {formatPrice(totalDiscount)}!
          </span>
        </div>
      )}

      {/* Best Discount Applied Message */}
      {coupon && isSubscriber && useCouponInstead && (
        <p className="text-xs text-muted-foreground text-center">
          💡 Aplicamos automaticamente o melhor desconto disponível para você.
        </p>
      )}
    </div>
  );
}
