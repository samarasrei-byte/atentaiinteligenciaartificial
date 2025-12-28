import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  User, 
  Percent, 
  Building2, 
  FileText, 
  MessageSquare,
  CheckCheck,
  Sparkles,
} from 'lucide-react';
import { useServiceNotifications, ServiceNotification } from '@/hooks/useServiceNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getNotificationIcon = (type: string, serviceType: string | null) => {
  if (type === 'new_contador') return User;
  if (type === 'promotion') return Percent;
  if (serviceType === 'company_opening') return Building2;
  if (serviceType === 'certificate') return FileText;
  if (serviceType === 'consultation') return MessageSquare;
  return Sparkles;
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'new_contador': return 'text-emerald-500 bg-emerald-500/10';
    case 'promotion': return 'text-accent bg-accent/10';
    case 'service_update': return 'text-blue-500 bg-blue-500/10';
    default: return 'text-primary bg-primary/10';
  }
};

interface NotificationItemProps {
  notification: ServiceNotification;
  onRead: (id: string) => void;
  onNavigate: (notification: ServiceNotification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRead, onNavigate }) => {
  const Icon = getNotificationIcon(notification.notification_type, notification.service_type);
  const colorClass = getNotificationColor(notification.notification_type);

  const handleClick = () => {
    if (!notification.is_read) {
      onRead(notification.id);
    }
    onNavigate(notification);
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3 border-b border-border last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors ${
        !notification.is_read ? 'bg-primary/5' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-sm font-medium text-foreground ${!notification.is_read ? 'font-semibold' : ''}`}>
              {notification.title}
            </p>
            {!notification.is_read && (
              <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export const ServiceNotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useServiceNotifications();
  const [open, setOpen] = useState(false);

  const handleNavigate = (notification: ServiceNotification) => {
    setOpen(false);
    
    // Navigate based on notification type
    if (notification.notification_type === 'new_contador') {
      navigate('/contadores');
    } else if (notification.service_type === 'company_opening') {
      navigate('/abertura-empresa');
    } else if (notification.service_type === 'certificate') {
      navigate('/certificates');
    } else if (notification.service_type === 'consultation') {
      navigate('/contadores');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent text-accent-foreground"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Novidades & Promoções</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-7 px-2"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Marcar lidas
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
                onNavigate={handleNavigate}
              />
            ))
          ) : (
            <div className="p-6 text-center">
              <Sparkles className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhuma notificação ainda
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Você será avisado sobre novos contadores e promoções
              </p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
