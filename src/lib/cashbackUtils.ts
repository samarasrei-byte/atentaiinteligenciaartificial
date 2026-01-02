import { supabase } from '@/integrations/supabase/client';

export interface AvailableCashback {
  id: string;
  amount_cents: number;
  month_year: string;
  expires_at: string | null;
}

export interface CashbackDiscount {
  cashbackId: string;
  discountCents: number;
  originalPriceCents: number;
  finalPriceCents: number;
}

/**
 * Get available (unclaimed) cashback for a user
 */
export async function getAvailableCashback(userId: string): Promise<AvailableCashback[]> {
  const { data, error } = await supabase
    .from('user_cashback')
    .select('id, cashback_amount_cents, month_year, expires_at')
    .eq('user_id', userId)
    .eq('is_claimed', true) // Only claimed cashback can be used as discount
    .gt('cashback_amount_cents', 0)
    .order('claimed_at', { ascending: true });

  if (error) {
    console.error('Error fetching available cashback:', error);
    return [];
  }

  // Filter out expired cashback and map to expected format
  const now = new Date();
  return (data || [])
    .filter(item => !item.expires_at || new Date(item.expires_at) > now)
    .map(item => ({
      id: item.id,
      amount_cents: item.cashback_amount_cents,
      month_year: item.month_year,
      expires_at: item.expires_at,
    }));
}

/**
 * Calculate the cashback discount to apply to a purchase
 */
export function calculateCashbackDiscount(
  priceCents: number,
  availableCashback: AvailableCashback[]
): CashbackDiscount | null {
  if (availableCashback.length === 0) {
    return null;
  }

  // Use the oldest cashback first (FIFO)
  const cashback = availableCashback[0];
  
  // Apply up to the full price or available cashback, whichever is less
  const discountCents = Math.min(cashback.amount_cents, priceCents);
  const finalPriceCents = priceCents - discountCents;

  return {
    cashbackId: cashback.id,
    discountCents,
    originalPriceCents: priceCents,
    finalPriceCents,
  };
}

/**
 * Mark cashback as used (reduce the amount)
 */
export async function applyCashbackDiscount(
  userId: string,
  cashbackId: string,
  amountUsedCents: number
): Promise<boolean> {
  try {
    // Get current cashback amount
    const { data: current, error: fetchError } = await supabase
      .from('user_cashback')
      .select('cashback_amount_cents')
      .eq('id', cashbackId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !current) {
      console.error('Error fetching cashback:', fetchError);
      return false;
    }

    const newAmount = current.cashback_amount_cents - amountUsedCents;

    // Update the cashback amount
    const { error: updateError } = await supabase
      .from('user_cashback')
      .update({ 
        cashback_amount_cents: Math.max(0, newAmount),
      })
      .eq('id', cashbackId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error applying cashback discount:', updateError);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in applyCashbackDiscount:', err);
    return false;
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}
