import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Consultation {
  id: string;
  scheduled_at: string | null;
  status: string;
  user_id: string;
  contador_id: string;
}

export function useScheduleNotifications() {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();

  const checkUpcomingConsultations = useCallback(async () => {
    if (!user) return;

    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    // Query for consultations within the next 24 hours
    const { data: consultations } = await supabase
      .from('consultations')
      .select('id, scheduled_at, status, user_id, contador_id')
      .eq('status', 'scheduled')
      .gte('scheduled_at', now.toISOString())
      .lte('scheduled_at', twentyFourHoursFromNow.toISOString())
      .or(`user_id.eq.${user.id},contador_id.eq.${user.id}`);

    if (!consultations) return;

    consultations.forEach((consultation: Consultation) => {
      if (!consultation.scheduled_at) return;
      
      const scheduledTime = new Date(consultation.scheduled_at);
      const timeDiff = scheduledTime.getTime() - now.getTime();
      const hoursUntil = Math.round(timeDiff / (60 * 60 * 1000));
      const minutesUntil = Math.round(timeDiff / (60 * 1000));

      // Check for 24-hour warning (between 23.5h and 24.5h)
      const twentyThreeHalfHoursFromNow = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
      const twentyFourHalfHoursFromNow = new Date(now.getTime() + 24.5 * 60 * 60 * 1000);
      if (scheduledTime > twentyThreeHalfHoursFromNow && scheduledTime <= twentyFourHalfHoursFromNow) {
        const notificationKey = `consultation-reminder-${consultation.id}-24h`;
        const alreadyNotified = localStorage.getItem(notificationKey);
        
        if (!alreadyNotified) {
          toast({
            title: '📅 Consulta em 24 horas',
            description: `Você tem uma consulta agendada para amanhã às ${scheduledTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`,
            duration: 10000,
          });
          localStorage.setItem(notificationKey, 'true');
        }
      }

      // Check for 1-hour warning (between 55min and 65min)
      const fiftyFiveMinutesFromNow = new Date(now.getTime() + 55 * 60 * 1000);
      const sixtyFiveMinutesFromNow = new Date(now.getTime() + 65 * 60 * 1000);
      if (scheduledTime > fiftyFiveMinutesFromNow && scheduledTime <= sixtyFiveMinutesFromNow) {
        const notificationKey = `consultation-reminder-${consultation.id}-1h`;
        const alreadyNotified = localStorage.getItem(notificationKey);
        
        if (!alreadyNotified) {
          toast({
            title: '⏰ Consulta em 1 hora!',
            description: `Sua consulta começa às ${scheduledTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}. Prepare-se!`,
            duration: 15000,
          });
          localStorage.setItem(notificationKey, 'true');
        }
      }

      // Check for 30-minute warning
      if (scheduledTime <= thirtyMinutesFromNow && scheduledTime > now) {
        const notificationKey = `consultation-reminder-${consultation.id}-30`;
        const alreadyNotified = sessionStorage.getItem(notificationKey);
        
        if (!alreadyNotified) {
          toast({
            title: '⏰ Consulta em breve!',
            description: `Sua consulta começa em ${minutesUntil} minutos.`,
            duration: 10000,
          });
          sessionStorage.setItem(notificationKey, 'true');
        }
      }

      // Check for 5-minute warning
      if (scheduledTime <= fiveMinutesFromNow && scheduledTime > now) {
        const notificationKey = `consultation-reminder-${consultation.id}-5`;
        const alreadyNotified = sessionStorage.getItem(notificationKey);
        
        if (!alreadyNotified) {
          toast({
            title: '🔔 Consulta começando!',
            description: 'Sua consulta começa em menos de 5 minutos!',
            duration: 15000,
          });
          sessionStorage.setItem(notificationKey, 'true');
        }
      }
    });
  }, [user, hasRole, toast]);

  useEffect(() => {
    if (!user) return;

    // Check immediately on mount
    checkUpcomingConsultations();

    // Check every 5 minutes
    const interval = setInterval(checkUpcomingConsultations, 5 * 60 * 1000);

    // Listen for new scheduled consultations
    const channel = supabase
      .channel('schedule-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'consultations'
        },
        async (payload) => {
          const consultation = payload.new as Consultation;
          
          // Only notify if the consultation involves the current user
          if (consultation.user_id !== user.id && consultation.contador_id !== user.id) {
            return;
          }

          // Check if this is a new scheduling
          const oldScheduled = (payload.old as Consultation)?.scheduled_at;
          const newScheduled = consultation.scheduled_at;

          if (newScheduled && newScheduled !== oldScheduled) {
            const scheduledDate = new Date(newScheduled);
            const formattedDate = scheduledDate.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            });
            const formattedTime = scheduledDate.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            });

            toast({
              title: '📅 Consulta Agendada!',
              description: `${formattedDate} às ${formattedTime}`,
              duration: 8000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [user, checkUpcomingConsultations]);
}
