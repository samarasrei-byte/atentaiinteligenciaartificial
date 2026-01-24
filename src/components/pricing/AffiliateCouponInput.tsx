import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Tag, 
  Check, 
  X, 
  Loader2, 
  Percent,
  DollarSign,
  User,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface AppliedAffiliateCoupon {
  id: string;
  code: string;
  affiliate_id: string;
  affiliate_name: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
}

interface AffiliateCouponInputProps {
  serviceType: string;
  onCouponApplied: (coupon: AppliedAffiliateCoupon) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: AppliedAffiliateCoupon | null;
}

export function AffiliateCouponInput({ 
  serviceType,
  onCouponApplied, 
  onCouponRemoved, 
  appliedCoupon 
}: AffiliateCouponInputProps) {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Digite um código de cupom');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      // Call the database function to validate coupon
      const { data, error: rpcError } = await supabase.rpc('validate_affiliate_coupon', {
        p_code: couponCode.trim().toUpperCase(),
        p_service_type: serviceType
      });

      if (rpcError) throw rpcError;

      const result = data as {
        valid: boolean;
        message?: string;
        coupon_id?: string;
        affiliate_id?: string;
        affiliate_name?: string;
        discount_type?: 'percent' | 'fixed';
        discount_value?: number;
        code?: string;
      };

      if (result.valid) {
        const appliedCoupon: AppliedAffiliateCoupon = {
          id: result.coupon_id!,
          code: result.code!,
          affiliate_id: result.affiliate_id!,
          affiliate_name: result.affiliate_name!,
          discount_type: result.discount_type!,
          discount_value: result.discount_value!
        };
        
        onCouponApplied(appliedCoupon);
        
        toast({
          title: 'Cupom aplicado!',
          description: `${result.discount_type === 'percent' 
            ? `${result.discount_value}% de desconto` 
            : `R$ ${result.discount_value?.toFixed(2)} de desconto`
          } via ${result.affiliate_name}`,
        });
        
        setCouponCode('');
      } else {
        setError(result.message || 'Cupom inválido');
      }
    } catch (err: any) {
      console.error('Coupon validation error:', err);
      setError('Erro ao validar cupom. Tente novamente.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    toast({
      title: 'Cupom removido',
      description: 'O desconto foi removido do seu pedido',
    });
  };

  const formatDiscount = (coupon: AppliedAffiliateCoupon) => {
    if (coupon.discount_type === 'percent') {
      return `${coupon.discount_value}%`;
    }
    return `R$ ${coupon.discount_value.toFixed(2)}`;
  };

  if (appliedCoupon) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Cupom de desconto</Label>
        <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-success/20">
              <Check className="h-4 w-4 text-success" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <code className="font-mono font-medium text-foreground">{appliedCoupon.code}</code>
                <Badge variant="secondary" className="text-xs">
                  {formatDiscount(appliedCoupon)} OFF
                </Badge>
              </div>
              <p className="text-xs text-success flex items-center gap-1">
                <User className="h-3 w-3" />
                via {appliedCoupon.affiliate_name}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveCoupon}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Tag className="h-4 w-4" />
        Cupom de desconto
      </Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="Digite seu cupom"
            className={`uppercase ${error ? 'border-destructive' : ''}`}
            disabled={isValidating}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                validateCoupon();
              }
            }}
          />
          {couponCode && !isValidating && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setCouponCode('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Button
          onClick={validateCoupon}
          disabled={isValidating || !couponCode.trim()}
          variant="outline"
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Aplicar'
          )}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Sparkles className="h-3 w-3" />
        Tem um cupom de influenciador? Digite acima!
      </p>
    </div>
  );
}

// Utility function to calculate discount
export function calculateAffiliateCouponDiscount(
  originalPriceCents: number,
  coupon: AppliedAffiliateCoupon | null
): { discountCents: number; finalPriceCents: number } {
  if (!coupon) {
    return { discountCents: 0, finalPriceCents: originalPriceCents };
  }

  let discountCents: number;
  
  if (coupon.discount_type === 'percent') {
    discountCents = Math.round(originalPriceCents * (coupon.discount_value / 100));
  } else {
    // Fixed discount is stored in reais, convert to cents
    discountCents = coupon.discount_value * 100;
  }

  // Ensure discount doesn't exceed original price
  discountCents = Math.min(discountCents, originalPriceCents);

  return {
    discountCents,
    finalPriceCents: originalPriceCents - discountCents
  };
}
