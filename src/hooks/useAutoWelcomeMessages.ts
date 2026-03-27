import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WelcomeChat {
  id: string;
  chat_type: 'guilherme';
  message_content: string;
  is_read: boolean;
  created_at: string;
}

interface UseAutoWelcomeMessagesReturn {
  welcomeChats: WelcomeChat[];
  unreadGuilherme: number;
  totalUnread: number;
  markAsRead: (chatType: 'guilherme') => Promise<void>;
  isLoading: boolean;
}

/**
 * Hook that manages automatic welcome messages from Guilherme
 * 
 * REGRA GLOBAL DE COMUNICAÇÃO:
 * - Todo usuário SEMPRE recebe mensagem do Guilherme
 * - Se o usuário tiver BI/Contabilidade ativo, também recebe do especialista BI
 * - Isso acontece automaticamente no login
 */
export function useAutoWelcomeMessages(): UseAutoWelcomeMessagesReturn {
  const { user, profile, subscription } = useAuth();
  const { toast } = useToast();
  const [welcomeChats, setWelcomeChats] = useState<WelcomeChat[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Welcome messages content
  const getGuilhermeMessage = (userName: string) => 
    `Oi, ${userName}! 👋\n\nSou o Guilherme e vou te acompanhar em tudo que for análise fiscal, limpa nome, IR e outros serviços.\n\nJá estou por aqui se precisar de algo 😊`;

  // Fetch existing welcome chats
  const fetchWelcomeChats = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_welcome_chats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to handle the database response
      setWelcomeChats((data || []) as WelcomeChat[]);
    } catch (error) {
      console.error('Error fetching welcome chats:', error);
    }
  }, [user?.id]);

  // Create welcome message for a chat type
  const createWelcomeMessage = useCallback(async (
    chatType: 'guilherme',
    messageContent: string
  ) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_welcome_chats')
        .upsert({
          user_id: user.id,
          chat_type: chatType,
          message_content: messageContent,
          message_date: new Date().toISOString().split('T')[0],
          is_read: false,
        }, {
          onConflict: 'user_id,chat_type,message_date',
          ignoreDuplicates: true,
        });

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }
    } catch (error) {
      console.error(`Error creating ${chatType} welcome message:`, error);
    }
  }, [user?.id]);

  // Initialize welcome messages on login
  const initializeWelcomeMessages = useCallback(async () => {
    if (!user?.id || !profile) return;
    
    setIsLoading(true);
    const userName = profile.full_name?.split(' ')[0] || 'Cliente';

    try {
      // Check if today's messages already exist
      const today = new Date().toISOString().split('T')[0];
      const { data: existingToday } = await supabase
        .from('user_welcome_chats')
        .select('chat_type')
        .eq('user_id', user.id)
        .eq('message_date', today);

      const todayTypes = (existingToday || []).map(c => c.chat_type);

      // ALWAYS create Guilherme message if not exists today
      if (!todayTypes.includes('guilherme')) {
        await createWelcomeMessage('guilherme', getGuilhermeMessage(userName));
        
        // Show notification
        toast({
          title: '💬 Nova mensagem de Guilherme',
          description: 'Guilherme enviou uma mensagem de boas-vindas!',
        });
      }

      // Refresh the list
      await fetchWelcomeChats();
    } catch (error) {
      console.error('Error initializing welcome messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, profile, createWelcomeMessage, fetchWelcomeChats, toast]);

  // Mark messages as read for a chat type
  const markAsRead = useCallback(async (chatType: 'guilherme') => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_welcome_chats')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .eq('chat_type', chatType)
        .eq('is_read', false);

      if (error) throw error;

      // Update local state
      setWelcomeChats(prev => 
        prev.map(chat => 
          chat.chat_type === chatType ? { ...chat, is_read: true } : chat
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [user?.id]);

  // Initialize on user login
  useEffect(() => {
    if (user?.id && profile) {
      initializeWelcomeMessages();
    }
  }, [user?.id, profile?.id]); // Only run when user or profile changes

  // Set up realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('user-welcome-chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_welcome_chats',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchWelcomeChats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchWelcomeChats]);

  // Calculate unread counts
  const unreadGuilherme = welcomeChats.filter(
    c => c.chat_type === 'guilherme' && !c.is_read
  ).length;

  const totalUnread = unreadGuilherme;

  return {
    welcomeChats,
    unreadGuilherme,
    totalUnread,
    markAsRead,
    isLoading,
  };
}
