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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [hasChecked, setHasChecked] = useState(false);
  
  useEffect(() => {
    // Only check once per session and if user exists
    if (!user || hasChecked) return;
    
    // Don't auto-redirect if user came from specific param (already handling a request)
    if (searchParams.get('servico') || searchParams.get('request')) {
      setHasChecked(true);
      return;
    }
    
    const checkActiveRequests = async () => {
      try {
        // Check for active Limpa Nome request (Guilherme)
        // IMPORTANT: Only redirect if payment is PAID - payment comes first for Limpa Nome
        const { data: creditRepair } = await supabase
          .from('credit_repair_requests')
          .select('id, status, payment_status')
          .eq('user_id', user.id)
          .eq('payment_status', 'paid') // Only paid requests should auto-open chat
          .in('status', ['pending', 'in_progress', 'documents_pending', 'under_review', 'in_analysis', 'negotiation'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (creditRepair) {
          toast({
            title: 'Solicitação em andamento',
            description: 'Você tem uma solicitação Limpa Nome. Abrindo chat...',
          });
          setHasChecked(true);
          navigate(`/chat/guilherme?servico=limpanome&request=${creditRepair.id}`);
          return;
        }

        // Check for active Fiscal Analysis request (Guilherme)
        const { data: fiscalAnalysis } = await supabase
          .from('fiscal_analysis_requests')
          .select('id, status')
          .eq('user_id', user.id)
          .in('status', ['pending', 'in_progress', 'documents_pending', 'under_review', 'collecting_docs', 'in_analysis', 'opportunities_found', 'adjustments'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fiscalAnalysis) {
          toast({
            title: 'Análise Fiscal em andamento',
            description: 'Você tem uma análise fiscal ativa. Abrindo chat...',
          });
          setHasChecked(true);
          navigate(`/chat/guilherme?servico=analise-fiscal&request=${fiscalAnalysis.id}`);
          return;
        }

        // Check for active company opening request (Guilherme)
        const { data: companyOpening } = await supabase
          .from('company_opening_requests')
          .select('id, status')
          .eq('user_id', user.id)
          .in('status', ['pending', 'in_progress', 'documents_pending', 'under_review', 'analyzing'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (companyOpening) {
          toast({
            title: 'Abertura de Empresa em andamento',
            description: 'Você tem uma abertura de empresa em análise. Abrindo chat...',
          });
          setHasChecked(true);
          navigate(`/chat/guilherme?servico=abertura-empresa&request=${companyOpening.id}`);
          return;
        }

        // Check for active IR request (César - BI related)
        const { data: irRequest } = await supabase
          .from('ir_requests')
          .select('id, status')
          .eq('user_id', user.id)
          .in('status', ['pending', 'in_progress', 'documents_pending', 'under_review'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (irRequest) {
          toast({
            title: 'Declaração IR em andamento',
            description: 'Você tem uma solicitação de IR ativa. Abrindo chat...',
          });
          setHasChecked(true);
          navigate(`/chat/cesar?servico=bi-contabilidade&request=${irRequest.id}`);
          return;
        }

        // No active requests - mark as checked
        setHasChecked(true);
      } catch (error) {
        console.error('Error checking active requests:', error);
        setHasChecked(true);
      }
    };

    // Small delay to ensure user data is loaded
    const timer = setTimeout(checkActiveRequests, 500);
    return () => clearTimeout(timer);
  }, [user, hasChecked, navigate, toast, searchParams]);

  return { hasChecked };
}
