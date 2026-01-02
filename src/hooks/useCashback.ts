import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CashbackData {
  id: string;
  month_year: string;
  services_used: number;
  cashback_percent: number;
  cashback_amount_cents: number;
  total_spent_cents: number;
  is_claimed: boolean;
  claimed_at: string | null;
  expires_at: string | null;
}

interface ServiceUsage {
  consultations: number;
  certificates: number;
  ir_requests: number;
  company_openings: number;
  credit_repairs: number;
}

// Cashback tiers based on number of services used
const CASHBACK_TIERS = [
  { minServices: 2, percent: 5 },
  { minServices: 3, percent: 10 },
  { minServices: 4, percent: 15 },
  { minServices: 5, percent: 20 },
];

export function useCashback() {
  const { user, subscription } = useAuth();
  const isSubscribed = subscription.subscribed;
  const [cashback, setCashback] = useState<CashbackData | null>(null);
  const [serviceUsage, setServiceUsage] = useState<ServiceUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCurrentMonthYear = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const getCashbackPercent = (servicesUsed: number): number => {
    for (let i = CASHBACK_TIERS.length - 1; i >= 0; i--) {
      if (servicesUsed >= CASHBACK_TIERS[i].minServices) {
        return CASHBACK_TIERS[i].percent;
      }
    }
    return 0;
  };

  const fetchServiceUsage = useCallback(async () => {
    if (!user?.id) return null;

    const currentMonth = getCurrentMonthYear();
    const startOfMonth = `${currentMonth}-01`;
    const endOfMonth = new Date(
      parseInt(currentMonth.split('-')[0]),
      parseInt(currentMonth.split('-')[1]),
      0
    ).toISOString();

    try {
      // Fetch all service usage for the current month
      const [consultations, certificates, irRequests, companyOpenings, creditRepairs] =
        await Promise.all([
          supabase
            .from('consultations')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .gte('completed_at', startOfMonth)
            .lte('completed_at', endOfMonth),
          supabase
            .from('certificate_requests')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .gte('processed_at', startOfMonth)
            .lte('processed_at', endOfMonth),
          supabase
            .from('ir_requests')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .gte('completed_at', startOfMonth)
            .lte('completed_at', endOfMonth),
          supabase
            .from('company_opening_requests')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .gte('status_updated_at', startOfMonth)
            .lte('status_updated_at', endOfMonth),
          supabase
            .from('credit_repair_requests')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .gte('completed_at', startOfMonth)
            .lte('completed_at', endOfMonth),
        ]);

      const usage: ServiceUsage = {
        consultations: consultations.data?.length || 0,
        certificates: certificates.data?.length || 0,
        ir_requests: irRequests.data?.length || 0,
        company_openings: companyOpenings.data?.length || 0,
        credit_repairs: creditRepairs.data?.length || 0,
      };

      setServiceUsage(usage);
      return usage;
    } catch (err) {
      console.error('Error fetching service usage:', err);
      return null;
    }
  }, [user?.id]);

  const calculateTotalSpent = useCallback(async () => {
    if (!user?.id) return 0;

    const currentMonth = getCurrentMonthYear();
    const startOfMonth = `${currentMonth}-01`;
    const endOfMonth = new Date(
      parseInt(currentMonth.split('-')[0]),
      parseInt(currentMonth.split('-')[1]),
      0
    ).toISOString();

    try {
      const { data: payments } = await supabase
        .from('payments')
        .select('amount_cents')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth);

      return payments?.reduce((sum, p) => sum + p.amount_cents, 0) || 0;
    } catch {
      return 0;
    }
  }, [user?.id]);

  const fetchCashback = useCallback(async () => {
    if (!user?.id || !isSubscribed) {
      setLoading(false);
      return;
    }

    try {
      const currentMonth = getCurrentMonthYear();
      
      // Try to get existing cashback record
      const { data: existing } = await supabase
        .from('user_cashback')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)
        .single();

      if (existing) {
        setCashback(existing as CashbackData);
      }

      // Calculate current service usage
      const usage = await fetchServiceUsage();
      if (!usage) return;

      // Count unique service types used
      const servicesUsed = [
        usage.consultations > 0 ? 1 : 0,
        usage.certificates > 0 ? 1 : 0,
        usage.ir_requests > 0 ? 1 : 0,
        usage.company_openings > 0 ? 1 : 0,
        usage.credit_repairs > 0 ? 1 : 0,
      ].reduce((a, b) => a + b, 0);

      const cashbackPercent = getCashbackPercent(servicesUsed);
      const totalSpent = await calculateTotalSpent();
      const cashbackAmount = Math.floor((totalSpent * cashbackPercent) / 100);

      // Update or create cashback record
      if (existing) {
        const { data: updated } = await supabase
          .from('user_cashback')
          .update({
            services_used: servicesUsed,
            cashback_percent: cashbackPercent,
            cashback_amount_cents: cashbackAmount,
            total_spent_cents: totalSpent,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updated) {
          setCashback(updated as CashbackData);
        }
      } else if (servicesUsed >= 2) {
        // Create new cashback record if eligible
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 2); // Expires 2 months from now

        const { data: created } = await supabase
          .from('user_cashback')
          .insert({
            user_id: user.id,
            month_year: currentMonth,
            services_used: servicesUsed,
            cashback_percent: cashbackPercent,
            cashback_amount_cents: cashbackAmount,
            total_spent_cents: totalSpent,
            expires_at: expiresAt.toISOString(),
          })
          .select()
          .single();

        if (created) {
          setCashback(created as CashbackData);
        }
      }
    } catch (err) {
      console.error('Error fetching cashback:', err);
      setError('Erro ao carregar cashback');
    } finally {
      setLoading(false);
    }
  }, [user?.id, isSubscribed, fetchServiceUsage, calculateTotalSpent]);

  const claimCashback = async (cashbackId: string) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('user_cashback')
        .update({
          is_claimed: true,
          claimed_at: new Date().toISOString(),
        })
        .eq('id', cashbackId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchCashback();
      return true;
    } catch (err) {
      console.error('Error claiming cashback:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchCashback();
  }, [fetchCashback]);

  return {
    cashback,
    serviceUsage,
    loading,
    error,
    refreshCashback: fetchCashback,
    claimCashback,
    cashbackTiers: CASHBACK_TIERS,
  };
}
