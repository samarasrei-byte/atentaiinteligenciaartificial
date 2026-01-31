import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ActiveRequest {
  id: string;
  type: 'limpanome' | 'fiscal' | 'abertura-empresa' | 'bi-contabilidade';
  status: string;
  createdAt: string;
  paymentStatus: string;
}

export function useActiveServiceRequest() {
  const { user } = useAuth();
  const [activeRequest, setActiveRequest] = useState<ActiveRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkActiveRequests = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Check for active credit repair (Limpa Nome) request
        const { data: creditRepair } = await supabase
          .from('credit_repair_requests')
          .select('id, status, created_at, payment_status')
          .eq('user_id', user.id)
          .neq('status', 'completed')
          .neq('status', 'cancelled')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (creditRepair) {
          setActiveRequest({
            id: creditRepair.id,
            type: 'limpanome',
            status: creditRepair.status,
            createdAt: creditRepair.created_at,
            paymentStatus: creditRepair.payment_status,
          });
          setLoading(false);
          return;
        }

        // Check for active fiscal analysis request
        const { data: fiscal } = await supabase
          .from('fiscal_analysis_requests')
          .select('id, status, created_at, payment_status')
          .eq('user_id', user.id)
          .neq('status', 'completed')
          .neq('status', 'cancelled')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fiscal) {
          setActiveRequest({
            id: fiscal.id,
            type: 'fiscal',
            status: fiscal.status,
            createdAt: fiscal.created_at,
            paymentStatus: fiscal.payment_status,
          });
          setLoading(false);
          return;
        }

        // Check for active company opening request
        const { data: company } = await supabase
          .from('company_opening_requests')
          .select('id, status, created_at, payment_status')
          .eq('user_id', user.id)
          .neq('status', 'completed')
          .neq('status', 'cancelled')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (company) {
          setActiveRequest({
            id: company.id,
            type: 'abertura-empresa',
            status: company.status,
            createdAt: company.created_at,
            paymentStatus: company.payment_status || 'pending',
          });
          setLoading(false);
          return;
        }

        setActiveRequest(null);
      } catch (error) {
        console.error('Error checking active requests:', error);
        setActiveRequest(null);
      } finally {
        setLoading(false);
      }
    };

    checkActiveRequests();
  }, [user]);

  return { activeRequest, loading };
}
