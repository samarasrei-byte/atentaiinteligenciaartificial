import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bell, 
  MessageSquare, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpCircle,
  Trash2,
  Check,
  BellOff
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'message' | 'status_change' | 'document_request' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  metadata?: any;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  message: { icon: MessageSquare, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  status_change: { icon: ArrowUpCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  document_request: { icon: FileText, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  system: { icon: Bell, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
};

export const UserNotifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      setupRealtime();
    }
  }, [user]);

  const setupRealtime = () => {
    const channel = supabase
      .channel('user-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'company_opening_notifications',
        filter: `user_id=eq.${user?.id}`
      }, (payload) => {
        const newNotif = payload.new as any;
        setNotifications(prev => [{
          id: newNotif.id,
          type: mapNotificationType(newNotif.notification_type),
          title: newNotif.title,
          message: newNotif.message,
          read: newNotif.is_read,
          created_at: newNotif.created_at,
          metadata: newNotif.metadata
        }, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const mapNotificationType = (type: string): 'message' | 'status_change' | 'document_request' | 'system' => {
    if (type.includes('message')) return 'message';
    if (type.includes('status')) return 'status_change';
    if (type.includes('document')) return 'document_request';
    return 'system';
  };

  const fetchNotifications = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      // Fetch notifications from company_opening_notifications
      const { data: companyNotifs } = await supabase
        .from('company_opening_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      // Also check for unread messages as notifications
      const { data: unreadMessages } = await supabase
        .from('credit_repair_chat_messages')
        .select('id, content, created_at')
        .eq('receiver_id', user.id)
        .is('read_at', null)
        .order('created_at', { ascending: false })
        .limit(10);

      const allNotifications: Notification[] = [
        ...(companyNotifs || []).map(n => ({
          id: n.id,
          type: mapNotificationType(n.notification_type),
          title: n.title,
          message: n.message,
          read: n.is_read,
          created_at: n.created_at,
          metadata: n.metadata
        })),
        ...(unreadMessages || []).map(m => ({
          id: `msg-${m.id}`,
          type: 'message' as const,
          title: 'Nova mensagem de Guilherme',
          message: m.content.substring(0, 100) + (m.content.length > 100 ? '...' : ''),
          read: false,
          created_at: m.created_at
        }))
      ];

      // Sort by date
      allNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    // Update local state
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

    // Update in database if it's a company notification
    if (!id.startsWith('msg-')) {
      await supabase
        .from('company_opening_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id);
    } else {
      // Mark message as read
      const msgId = id.replace('msg-', '');
      await supabase
        .from('credit_repair_chat_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', msgId);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    await supabase
      .from('company_opening_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user?.id);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-600" />
              Notificações
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white text-xs">{unreadCount} novas</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Atualizações sobre suas solicitações
            </CardDescription>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
              <Check className="h-4 w-4" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <BellOff className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Nenhuma notificação</p>
            <p className="text-sm text-slate-400 mt-1">
              Você será notificado sobre atualizações nas suas solicitações
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notification => {
              const config = typeConfig[notification.type];
              const Icon = config?.icon || Bell;

              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                    notification.read 
                      ? 'bg-slate-50 border-slate-200' 
                      : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className={`p-2.5 rounded-lg ${config?.bgColor} shrink-0`}>
                    <Icon className={`h-5 w-5 ${config?.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${notification.read ? 'text-slate-700' : 'text-slate-900'}`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      )}
                    </div>
                    <p className={`text-sm mt-1 line-clamp-2 ${notification.read ? 'text-slate-500' : 'text-slate-600'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
