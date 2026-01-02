import { useState, useEffect } from 'react';
import { Gift, Check, X, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { getAvailableCashback, calculateCashbackDiscount, formatCurrency, type AvailableCashback, type CashbackDiscount } from '@/lib/cashbackUtils';

interface CashbackDiscountPreviewProps {
  priceCents: number;
  onDiscountChange?: (discount: CashbackDiscount | null) => void;
}

export function CashbackDiscountPreview({ 
  priceCents, 
  onDiscountChange 
}: CashbackDiscountPreviewProps) {
  const { user, subscription } = useAuth();
  const [availableCashback, setAvailableCashback] = useState<AvailableCashback[]>([]);
  const [applyCashback, setApplyCashback] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCashback = async () => {
      if (!user?.id || !subscription.subscribed) {
        setLoading(false);
        return;
      }

      try {
        const cashback = await getAvailableCashback(user.id);
        setAvailableCashback(cashback);
      } catch (err) {
        console.error('Error fetching cashback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCashback();
  }, [user?.id, subscription.subscribed]);

  useEffect(() => {
    if (applyCashback && availableCashback.length > 0) {
      const discount = calculateCashbackDiscount(priceCents, availableCashback);
      onDiscountChange?.(discount);
    } else {
      onDiscountChange?.(null);
    }
  }, [applyCashback, availableCashback, priceCents, onDiscountChange]);

  if (loading) {
    return (
      <div className="animate-pulse h-12 bg-muted rounded-lg"></div>
    );
  }

  if (!subscription.subscribed || availableCashback.length === 0) {
    return null;
  }

  const totalAvailable = availableCashback.reduce((sum, c) => sum + c.amount_cents, 0);
  const discount = calculateCashbackDiscount(priceCents, availableCashback);

  return (
    <div className="p-4 rounded-lg border border-success/30 bg-success/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-success/10">
            <Gift className="h-5 w-5 text-success" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">Usar Cashback Disponível</p>
              <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                {formatCurrency(totalAvailable)}
              </Badge>
            </div>
            {applyCashback && discount && (
              <p className="text-xs text-muted-foreground mt-1">
                Desconto de {formatCurrency(discount.discountCents)} será aplicado
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="apply-cashback"
            checked={applyCashback}
            onCheckedChange={setApplyCashback}
          />
          <Label htmlFor="apply-cashback" className="sr-only">
            Aplicar cashback
          </Label>
        </div>
      </div>

      {applyCashback && discount && (
        <div className="mt-3 pt-3 border-t border-success/20 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground line-through">
              {formatCurrency(discount.originalPriceCents)}
            </span>
            <span className="text-success font-medium flex items-center gap-1">
              <Check className="h-4 w-4" />
              -{formatCurrency(discount.discountCents)}
            </span>
          </div>
          <span className="font-bold text-lg">
            {formatCurrency(discount.finalPriceCents)}
          </span>
        </div>
      )}
    </div>
  );
}
