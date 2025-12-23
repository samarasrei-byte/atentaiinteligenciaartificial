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
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CouponInputProps {
  onCouponApplied: (couponId: string, discount: { type: 'percent' | 'amount'; value: number; name: string }) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: { id: string; name: string; discount: number; type: 'percent' | 'amount' } | null;
}

export function CouponInput({ onCouponApplied, onCouponRemoved, appliedCoupon }: CouponInputProps) {
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
      const { data, error: fnError } = await supabase.functions.invoke('validate-coupon', {
        body: { couponCode: couponCode.trim().toUpperCase() },
      });

      if (fnError) throw fnError;

      if (data.valid) {
        onCouponApplied(data.couponId, {
          type: data.percentOff ? 'percent' : 'amount',
          value: data.percentOff || data.amountOff,
          name: data.name,
        });
        toast({
          title: 'Cupom aplicado!',
          description: `${data.name} - ${data.percentOff ? `${data.percentOff}% de desconto` : `R$ ${(data.amountOff / 100).toFixed(2)} de desconto`}`,
        });
        setCouponCode('');
      } else {
        setError(data.message || 'Cupom inválido');
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
              <p className="font-medium text-foreground text-sm">{appliedCoupon.name}</p>
              <p className="text-xs text-success">
                {appliedCoupon.type === 'percent' 
                  ? `${appliedCoupon.discount}% de desconto`
                  : `R$ ${(appliedCoupon.discount / 100).toFixed(2)} de desconto`
                }
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
        Use o código LANCAMENTO20 para 20% de desconto!
      </p>
    </div>
  );
}
