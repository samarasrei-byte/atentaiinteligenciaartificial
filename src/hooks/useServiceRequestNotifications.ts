import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

type ServiceRequestType = 'credit_repair' | 'fiscal_analysis' | 'ir' | 'certificate' | 'company_opening';

interface NotificationConfig {
  table: string;
  responsible: 'guilherme' | 'cesar';
  serviceName: string;
}

const SERVICE_CONFIGS: Record<ServiceRequestType, NotificationConfig> = {
  credit_repair: {
    table: 'credit_repair_requests',
    responsible: 'guilherme',
    serviceName: 'Limpa Nome',
  },
  fiscal_analysis: {
    table: 'fiscal_analysis_requests',
    responsible: 'guilherme',
    serviceName: 'Análise Fiscal',
  },
  ir: {
    table: 'ir_requests',
    responsible: 'guilherme',
    serviceName: 'Declaração IR',
  },
  certificate: {
    table: 'certificate_requests',
    responsible: 'guilherme',
    serviceName: 'Certidão',
  },
  company_opening: {
    table: 'company_opening_requests',
    responsible: 'guilherme',
    serviceName: 'Abertura de Empresa',
  },
};

// BI+ requests are routed to César via fiscal_analysis_requests with notes.source='bi-contabilidade'

interface UseServiceRequestNotificationsOptions {
  enableSound?: boolean;
  responsibleFilter?: 'guilherme' | 'cesar' | 'all';
}

/**
 * Hook for real-time notifications on new service requests
 * 
 * REGRA:
 * - Limpa Nome, Análise Fiscal, IR, Certidão, Abertura → Guilherme
 * - BI+ Contabilidade → César
 */
export function useServiceRequestNotifications(options: UseServiceRequestNotificationsOptions = {}) {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const { enableSound = true, responsibleFilter = 'all' } = options;

  const isAdmin = hasRole('admin');

  const playNotificationSound = useCallback(() => {
    if (enableSound) {
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch (e) {
        // Ignore audio errors
      }
    }
  }, [enableSound]);

  const showNotification = useCallback((
    serviceName: string,
    clientName: string,
    responsible: 'guilherme' | 'cesar'
  ) => {
    const responsibleName = responsible === 'guilherme' ? 'Guilherme' : 'César';
    
    toast({
      title: `🆕 Nova Solicitação: ${serviceName}`,
      description: `${clientName} enviou uma solicitação. Responsável: ${responsibleName}`,
    });

    playNotificationSound();

    // Browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification(`Nova Solicitação: ${serviceName}`, {
        body: `${clientName} aguardando atendimento`,
        icon: '/logo.png',
      });
    }
  }, [toast, playNotificationSound]);

  useEffect(() => {
    if (!isAdmin) return;

    const channels: ReturnType<typeof supabase.channel>[] = [];

    // Subscribe to each service table
    Object.entries(SERVICE_CONFIGS).forEach(([key, config]) => {
      if (responsibleFilter !== 'all' && config.responsible !== responsibleFilter) {
        return;
      }

      const channel = supabase
        .channel(`service-requests-${key}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: config.table,
          },
          (payload) => {
            const request = payload.new as any;
            const clientName = request.full_name || 'Novo Cliente';
            
            // Check if it's a BI request (special case)
            if (config.table === 'fiscal_analysis_requests') {
              try {
                const notes = JSON.parse(request.notes || '{}');
                if (notes.source === 'bi-contabilidade') {
                  if (responsibleFilter === 'all' || responsibleFilter === 'cesar') {
                    showNotification('BI+ Contabilidade', clientName, 'cesar');
                  }
                  return;
                }
              } catch (e) {
                // Not a BI request, continue
              }
            }
            
            showNotification(config.serviceName, clientName, config.responsible);
          }
        )
        .subscribe();

      channels.push(channel);
    });

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel));
    };
  }, [isAdmin, responsibleFilter, showNotification]);

  // Request browser notification permission
  useEffect(() => {
    if (isAdmin && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [isAdmin]);
}

export default useServiceRequestNotifications;
