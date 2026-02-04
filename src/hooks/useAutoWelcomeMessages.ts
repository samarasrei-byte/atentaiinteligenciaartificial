import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WelcomeChat {
  id: string;
  chat_type: 'guilherme' | 'cesar';
  message_content: string;
  is_read: boolean;
  created_at: string;
}

interface UseAutoWelcomeMessagesReturn {
  welcomeChats: WelcomeChat[];
  unreadGuilherme: number;
  unreadCesar: number;
  totalUnread: number;
  hasBIAccess: boolean;
  markAsRead: (chatType: 'guilherme' | 'cesar') => Promise<void>;
  isLoading: boolean;
}

/**
 * Hook that manages automatic welcome messages from Guilherme and César
 * 
 * REGRA GLOBAL DE COMUNICAÇÃO:
 * - Todo usuário SEMPRE recebe mensagem do Guilherme
 * - Se o usuário tiver BI/Contabilidade ativo, também recebe do César
 * - Isso acontece automaticamente no login
 */
export function useAutoWelcomeMessages(): UseAutoWelcomeMessagesReturn {
  const { user, profile, subscription } = useAuth();
  const { toast } = useToast();
  const [welcomeChats, setWelcomeChats] = useState<WelcomeChat[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Determine if user has BI access (control/performance plan or specific services)
  const hasBIAccess = subscription?.plan === 'premium' || subscription?.plan === 'contador' || subscription?.subscribed;

  // Welcome messages content
  const getGuilhermeMessage = (userName: string) => 
    `Oi, ${userName}! 👋\n\nSou o Guilherme e vou te acompanhar em tudo que for análise fiscal, limpa nome e outros serviços.\n\nJá estou por aqui se precisar de algo 😊`;

  const getCesarMessage = (userName: string) =>
    `Olá, ${userName}!\n\nAqui é o César. Vou cuidar da parte de BI e contabilidade, trazendo análises e organizando suas informações.\n\nSempre que precisar, é só falar por aqui. 📊`;

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
    chatType: 'guilherme' | 'cesar',
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

      // Create César message ONLY if user has BI access and not exists today
      if (hasBIAccess && !todayTypes.includes('cesar')) {
        await createWelcomeMessage('cesar', getCesarMessage(userName));
        
        // Show notification
        toast({
          title: '📊 Nova mensagem de César',
          description: 'César está pronto para ajudar com BI e Contabilidade!',
        });
      }

      // Refresh the list
      await fetchWelcomeChats();
    } catch (error) {
      console.error('Error initializing welcome messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, profile, hasBIAccess, createWelcomeMessage, fetchWelcomeChats, toast]);

  // Mark messages as read for a chat type
  const markAsRead = useCallback(async (chatType: 'guilherme' | 'cesar') => {
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

  const unreadCesar = welcomeChats.filter(
    c => c.chat_type === 'cesar' && !c.is_read
  ).length;

  const totalUnread = unreadGuilherme + unreadCesar;

  return {
    welcomeChats,
    unreadGuilherme,
    unreadCesar,
    totalUnread,
    hasBIAccess,
    markAsRead,
    isLoading,
  };
}
