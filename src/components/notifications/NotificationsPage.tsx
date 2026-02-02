import React from 'react';
import { Bell, Check, CheckCheck, Trash2, Calendar, CreditCard, Info, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface NotificationsPageProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClear: () => void;
}

/**
 * Full-page notifications view (not a popover)
 * Used in the notifications tab of panels
 */
export function NotificationsPage({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClear,
}: NotificationsPageProps) {
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'consultation':
        return <Calendar className="h-5 w-5 text-primary" />;
      case 'payment':
        return <CreditCard className="h-5 w-5 text-success" />;
      case 'system':
        return <Users className="h-5 w-5 text-info" />;
      case 'chat':
        return <MessageSquare className="h-5 w-5 text-primary" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'consultation':
        return 'bg-primary/10 border-primary/20';
      case 'payment':
        return 'bg-success/10 border-success/20';
      case 'system':
        return 'bg-info/10 border-info/20';
      case 'chat':
        return 'bg-primary/10 border-primary/20';
      default:
        return 'bg-muted border-border';
    }
  };

  const getTypeLabel = (type: Notification['type']) => {
    switch (type) {
      case 'consultation':
        return 'Consulta';
      case 'payment':
        return 'Pagamento';
      case 'system':
        return 'Sistema';
      case 'chat':
        return 'Mensagem';
      case 'update':
        return 'Atualização';
      default:
        return 'Geral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Central de Notificações
                  {unreadCount > 0 && (
                    <Badge className="bg-primary">{unreadCount} novas</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Acompanhe todas as atualizações importantes
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onMarkAllAsRead}
                  className="gap-2"
                >
                  <CheckCheck className="h-4 w-4" />
                  Marcar todas como lidas
                </Button>
              )}
              {notifications.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onClear}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Limpar todas
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-2">
              Nenhuma notificação
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Você será notificado sobre novas consultas, atualizações de serviços e mensagens importantes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                'transition-all hover:shadow-md cursor-pointer',
                !notification.read && 'border-primary/30 bg-primary/5'
              )}
              onClick={() => onMarkAsRead(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className={cn(
                    'p-3 rounded-xl border flex-shrink-0 h-fit',
                    getTypeColor(notification.type)
                  )}>
                    {getIcon(notification.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(notification.type)}
                          </Badge>
                          {!notification.read && (
                            <Badge className="bg-primary text-xs">Nova</Badge>
                          )}
                        </div>
                        <h4 className={cn(
                          'text-base text-foreground',
                          !notification.read && 'font-semibold'
                        )}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkAsRead(notification.id);
                            }}
                            className="gap-1"
                          >
                            <Check className="h-4 w-4" />
                            <span className="hidden sm:inline">Marcar como lida</span>
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Timestamp */}
                    <p className="text-xs text-muted-foreground/70 mt-3">
                      {formatDistanceToNow(new Date(notification.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
