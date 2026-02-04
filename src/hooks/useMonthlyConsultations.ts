import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { STRIPE_PLANS } from '@/lib/stripe';

interface MonthlyConsultationUsage {
  used: number;
  limit: number;
  remaining: number;
  periodStart: Date;
  periodEnd: Date;
  isLoading: boolean;
  error: string | null;
}

export function useMonthlyConsultations() {
  const { user, subscription } = useAuth();
  const [usage, setUsage] = useState<MonthlyConsultationUsage>({
    used: 0,
    limit: 0,
    remaining: 0,
    periodStart: new Date(),
    periodEnd: new Date(),
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!user || !subscription.subscribed) {
      setUsage(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchUsage = async () => {
      try {
        // Get the monthly limit based on plan (performance tier has consultations)
        const plan = subscription.plan;
        const monthlyLimit = plan === 'performance' 
          ? (STRIPE_PLANS.performance as any).monthlyConsultations || 3
          : 0;

        if (monthlyLimit === 0) {
          setUsage({
            used: 0,
            limit: 0,
            remaining: 0,
            periodStart: new Date(),
            periodEnd: new Date(),
            isLoading: false,
            error: null,
          });
          return;
        }

        // Calculate current billing period (month)
        const now = new Date();
        const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Count completed consultations this month
        const { count, error } = await supabase
          .from('consultations')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('completed_at', periodStart.toISOString())
          .lte('completed_at', periodEnd.toISOString());

        if (error) throw error;

        const used = count || 0;
        const remaining = Math.max(0, monthlyLimit - used);

        setUsage({
          used,
          limit: monthlyLimit,
          remaining,
          periodStart,
          periodEnd,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        console.error('Error fetching consultation usage:', error);
        setUsage(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Erro ao carregar uso de consultas',
        }));
      }
    };

    fetchUsage();

    // Listen for changes in consultations
    const channel = supabase
      .channel('consultation-usage')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consultations',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchUsage()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, subscription.subscribed, subscription.plan]);

  return usage;
}
