import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  type: 'consultation' | 'system' | 'payment' | 'update' | 'chat';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: any;
}

export function useNotifications() {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      read: false,
      created_at: new Date().toISOString(),
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
    });
  }, [toast]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Subscribe to consultations for contador role
    const isContador = hasRole('contador');
    const isAdmin = hasRole('admin');

    const consultationsChannel = supabase
      .channel('notifications-consultations')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'consultations',
          ...(isContador ? { filter: `contador_id=eq.${user.id}` } : { filter: `user_id=eq.${user.id}` })
        },
        (payload) => {
          const newConsultation = payload.new as any;
          addNotification({
            type: 'consultation',
            title: isContador ? '📋 Nova Consulta Recebida!' : '📋 Consulta Criada!',
            message: isContador 
              ? `Uma nova consulta foi agendada. Valor: R$ ${(newConsultation.price_cents / 100).toFixed(2)}`
              : 'Sua consulta foi criada com sucesso!',
            data: newConsultation,
          });
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'consultations',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedConsultation = payload.new as any;
          const statusMessages: Record<string, string> = {
            scheduled: '📅 Sua consulta foi agendada!',
            completed: '✅ Sua consulta foi concluída!',
            cancelled: '❌ Sua consulta foi cancelada.',
          };
          
          if (statusMessages[updatedConsultation.status]) {
            addNotification({
              type: 'consultation',
              title: 'Atualização de Consulta',
              message: statusMessages[updatedConsultation.status],
              data: updatedConsultation,
            });
          }
        }
      )
      .subscribe();

    // Subscribe to subscription changes
    const subscriptionsChannel = supabase
      .channel('notifications-subscriptions')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const subscription = payload.new as any;
          if (payload.eventType === 'INSERT' || 
              (payload.eventType === 'UPDATE' && subscription.status === 'active')) {
            addNotification({
              type: 'payment',
              title: '🎉 Assinatura Ativada!',
              message: `Seu plano ${subscription.plan_type} foi ativado com sucesso!`,
              data: subscription,
            });
          }
        }
      )
      .subscribe();

    // Subscribe to chat messages for notifications
    const chatChannel = supabase
      .channel('notifications-chat')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `receiver_id=eq.${user.id}`
        },
        async (payload) => {
          const newMessage = payload.new as any;
          
          // Fetch sender name
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', newMessage.sender_id)
            .single();

          const senderName = senderProfile?.full_name || 'Alguém';
          
          addNotification({
            type: 'chat',
            title: '💬 Nova Mensagem!',
            message: `${senderName}: ${newMessage.content.slice(0, 50)}${newMessage.content.length > 50 ? '...' : ''}`,
            data: { 
              consultation_id: newMessage.consultation_id,
              message_id: newMessage.id 
            },
          });
        }
      )
      .subscribe();

    // Admin notifications for new users
    let profilesChannel: ReturnType<typeof supabase.channel> | null = null;
    if (isAdmin) {
      profilesChannel = supabase
        .channel('notifications-profiles')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'profiles' },
          (payload) => {
            const newProfile = payload.new as any;
            addNotification({
              type: 'system',
              title: '👤 Novo Usuário!',
              message: `${newProfile.full_name || 'Novo usuário'} se cadastrou na plataforma.`,
              data: newProfile,
            });
          }
        )
        .subscribe();
    }

    return () => {
      supabase.removeChannel(consultationsChannel);
      supabase.removeChannel(subscriptionsChannel);
      supabase.removeChannel(chatChannel);
      if (profilesChannel) {
        supabase.removeChannel(profilesChannel);
      }
    };
  }, [user, hasRole, addNotification]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}
