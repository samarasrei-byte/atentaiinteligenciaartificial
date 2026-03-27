import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define types locally to avoid circular dependencies
export type ServiceType = 'limpanome' | 'analise-fiscal';

interface ServiceStep {
  id: string;
  label: string;
}

const SERVICE_STEPS: Record<ServiceType, ServiceStep[]> = {
  'limpanome': [
    { id: 'received', label: 'Solicitação recebida' },
    { id: 'documents', label: 'Documentos analisados' },
    { id: 'pending', label: 'Pendência identificada' },
    { id: 'negotiation', label: 'Negociação em andamento' },
    { id: 'deal', label: 'Acordo fechado' },
    { id: 'completed', label: 'Limpa Nome concluído' },
  ],
  'analise-fiscal': [
    { id: 'received', label: 'Solicitação recebida' },
    { id: 'collecting', label: 'Coleta de documentos' },
    { id: 'analysis', label: 'Análise técnica' },
    { id: 'opportunities', label: 'Oportunidades encontradas' },
    { id: 'adjustments', label: 'Ajustes / regularização' },
    { id: 'completed', label: 'Análise concluída' },
  ],
  'bi-contabilidade': [
    { id: 'received', label: 'Solicitação recebida' },
    { id: 'collecting', label: 'Coleta de documentos' },
    { id: 'ai_processing', label: 'Processamento com IA' },
    { id: 'validation', label: 'Validação humana' },
    { id: 'insights', label: 'Insights prontos' },
    { id: 'completed', label: 'Relatório entregue' },
  ],
};

interface ServiceStatusData {
  currentStepIndex: number;
  stepHistory: Array<{
    stepIndex: number;
    changedAt: Date;
    note?: string;
  }>;
  lastUpdatedAt: Date;
  isLoading: boolean;
}

// Map service types to their database tables and status field mappings
const SERVICE_STATUS_MAP: Record<ServiceType, {
  table: string;
  statusField: string;
  statusToStep: Record<string, number>;
}> = {
  'limpanome': {
    table: 'credit_repair_requests',
    statusField: 'status',
    statusToStep: {
      'pending': 0,
      'documents_pending': 1,
      'in_analysis': 2,
      'negotiation': 3,
      'deal_closed': 4,
      'completed': 5,
    },
  },
  'analise-fiscal': {
    table: 'fiscal_analysis_requests',
    statusField: 'status',
    statusToStep: {
      'pending': 0,
      'collecting_docs': 1,
      'in_analysis': 2,
      'opportunities_found': 3,
      'adjustments': 4,
      'completed': 5,
    },
  },
  'bi-contabilidade': {
    table: 'fiscal_analysis_requests', // Reusing for now
    statusField: 'status',
    statusToStep: {
      'pending': 0,
      'collecting_docs': 1,
      'processing': 2,
      'validation': 3,
      'insights_ready': 4,
      'completed': 5,
    },
  },
};

export const useServiceStatus = (
  serviceType: ServiceType,
  requestId?: string,
  userId?: string
) => {
  const [data, setData] = useState<ServiceStatusData>({
    currentStepIndex: 0,
    stepHistory: [],
    lastUpdatedAt: new Date(),
    isLoading: true,
  });

  // Fetch initial status
  useEffect(() => {
    const fetchStatus = async () => {
      if (!requestId && !userId) {
        setData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const config = SERVICE_STATUS_MAP[serviceType];
      if (!config) {
        setData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        // Use specific typed queries for each service
        let result: { status: string; updated_at: string; created_at: string } | null = null;

        if (serviceType === 'limpanome') {
          const query = supabase
            .from('credit_repair_requests')
            .select('status, updated_at, created_at');
          
          const { data, error } = requestId 
            ? await query.eq('id', requestId).single()
            : await query.eq('user_id', userId!).order('created_at', { ascending: false }).limit(1).single();
          
          if (error) throw error;
          result = data;
        } else if (serviceType === 'analise-fiscal' || serviceType === 'bi-contabilidade') {
          const query = supabase
            .from('fiscal_analysis_requests')
            .select('status, updated_at, created_at');
          
          const { data, error } = requestId 
            ? await query.eq('id', requestId).single()
            : await query.eq('user_id', userId!).order('created_at', { ascending: false }).limit(1).single();
          
          if (error) throw error;
          result = data;
        }

        if (result) {
          const stepIndex = config.statusToStep[result.status] ?? 0;
          setData({
            currentStepIndex: stepIndex,
            stepHistory: [{
              stepIndex,
              changedAt: new Date(result.updated_at || result.created_at),
            }],
            lastUpdatedAt: new Date(result.updated_at || result.created_at),
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error fetching service status:', error);
        setData(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchStatus();
  }, [serviceType, requestId, userId]);

  // Set up realtime subscription
  useEffect(() => {
    if (!requestId) return;

    const config = SERVICE_STATUS_MAP[serviceType];
    if (!config) return;

    const channel = supabase
      .channel(`service-status-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: config.table,
          filter: `id=eq.${requestId}`,
        },
        (payload) => {
          const newStatus = (payload.new as any)[config.statusField];
          const stepIndex = config.statusToStep[newStatus] ?? 0;
          const updatedAt = new Date();

          setData(prev => ({
            ...prev,
            currentStepIndex: stepIndex,
            stepHistory: [
              ...prev.stepHistory,
              { stepIndex, changedAt: updatedAt }
            ],
            lastUpdatedAt: updatedAt,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [serviceType, requestId]);

  // Method to manually update status (for admin use)
  const updateStatus = useCallback(async (newStepIndex: number) => {
    if (!requestId) return false;

    const config = SERVICE_STATUS_MAP[serviceType];
    if (!config) return false;

    // Find the status string for this step index
    const statusEntry = Object.entries(config.statusToStep).find(
      ([_, idx]) => idx === newStepIndex
    );

    if (!statusEntry) return false;

    const [newStatus] = statusEntry;

    try {
      if (serviceType === 'limpanome') {
        const { error } = await supabase
          .from('credit_repair_requests')
          .update({ 
            status: newStatus, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', requestId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('fiscal_analysis_requests')
          .update({ 
            status: newStatus, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', requestId);
        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Error updating status:', error);
      return false;
    }
  }, [serviceType, requestId]);

  return {
    ...data,
    updateStatus,
    steps: SERVICE_STEPS[serviceType],
    totalSteps: SERVICE_STEPS[serviceType]?.length || 0,
  };
};

export default useServiceStatus;
