import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ActiveRequest {
  id: string;
  type: 'limpanome' | 'fiscal' | 'abertura-empresa' | 'bi-contabilidade';
  status: string;
}

/**
 * This hook checks if user has an active service request and redirects to appropriate chat
 * Rule: If case_active → openChat()
 */
export function useAutoOpenChat() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [hasChecked, setHasChecked] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  
  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;
    
    // Only check once per session and if user exists
    if (!user || hasChecked || isChecking) return;
    
    // Don't auto-redirect if user came from specific param (already handling a request)
    if (searchParams.get('servico') || searchParams.get('request')) {
      setHasChecked(true);
      return;
    }
    
    const checkActiveRequests = async () => {
      setIsChecking(true);
      
      try {
        console.log('[AutoOpenChat] Checking for active requests for user:', user.id);
        
        // Check for active Limpa Nome request (Guilherme)
        // IMPORTANT: Only redirect if payment is PAID - payment comes first for Limpa Nome
        const { data: creditRepair, error: creditError } = await supabase
          .from('credit_repair_requests')
          .select('id, status, payment_status')
          .eq('user_id', user.id)
          .eq('payment_status', 'paid') // Only paid requests should auto-open chat
          .in('status', ['pending', 'in_progress', 'documents_pending', 'under_review', 'in_analysis', 'negotiation'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (creditError) {
          console.error('[AutoOpenChat] Error checking credit repair:', creditError);
        }

        if (creditRepair) {
          console.log('[AutoOpenChat] Found active Limpa Nome request:', creditRepair.id);
          toast({
            title: 'Solicitação Limpa Nome em andamento',
            description: 'Acesse seu chat pelo menu "Minhas Solicitações".',
          });
          setHasChecked(true);
          setIsChecking(false);
          // Don't navigate away from the panel - user stays on their dashboard
          return;
        }

        // Check for active Fiscal Analysis request (Guilherme)
        const { data: fiscalAnalysis, error: fiscalError } = await supabase
          .from('fiscal_analysis_requests')
          .select('id, status')
          .eq('user_id', user.id)
          .in('status', ['pending', 'in_progress', 'documents_pending', 'under_review', 'collecting_docs', 'in_analysis', 'opportunities_found', 'adjustments'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fiscalError) {
          console.error('[AutoOpenChat] Error checking fiscal analysis:', fiscalError);
        }

        if (fiscalAnalysis) {
          console.log('[AutoOpenChat] Found active Fiscal Analysis request:', fiscalAnalysis.id);
          toast({
            title: 'Análise Fiscal em andamento',
            description: 'Acesse seu chat pelo menu "Minhas Solicitações".',
          });
          setHasChecked(true);
          setIsChecking(false);
          // Don't navigate away from the panel
          return;
        }

        // Check for active company opening request (Guilherme)
        const { data: companyOpening, error: companyError } = await supabase
          .from('company_opening_requests')
          .select('id, status')
          .eq('user_id', user.id)
          .in('status', ['pending', 'in_progress', 'documents_pending', 'under_review', 'analyzing'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (companyError) {
          console.error('[AutoOpenChat] Error checking company opening:', companyError);
        }

        if (companyOpening) {
          console.log('[AutoOpenChat] Found active Company Opening request:', companyOpening.id);
          toast({
            title: 'Abertura de Empresa em andamento',
            description: 'Acesse seu chat pelo menu "Minhas Solicitações".',
          });
          setHasChecked(true);
          setIsChecking(false);
          // Don't navigate away from the panel
          return;
        }

        // Check for active IR request (César - BI related)
        const { data: irRequest, error: irError } = await supabase
          .from('ir_requests')
          .select('id, status')
          .eq('user_id', user.id)
          .in('status', ['pending', 'in_progress', 'documents_pending', 'under_review'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (irError) {
          console.error('[AutoOpenChat] Error checking IR requests:', irError);
        }

        if (irRequest) {
          console.log('[AutoOpenChat] Found active IR request:', irRequest.id);
          toast({
            title: 'Declaração IR em andamento',
            description: 'Acesse seu chat pelo menu "Minhas Solicitações".',
          });
          setHasChecked(true);
          setIsChecking(false);
          // Don't navigate away from the panel
          return;
        }

        // No active requests - mark as checked
        console.log('[AutoOpenChat] No active requests found');
        setHasChecked(true);
      } catch (error) {
        console.error('[AutoOpenChat] Error checking active requests:', error);
        setHasChecked(true);
      } finally {
        setIsChecking(false);
      }
    };

    // Small delay to ensure React state is stable
    const timer = setTimeout(checkActiveRequests, 300);
    return () => clearTimeout(timer);
  }, [user, loading, hasChecked, isChecking, navigate, toast, searchParams]);

  return { hasChecked, isChecking };
}
