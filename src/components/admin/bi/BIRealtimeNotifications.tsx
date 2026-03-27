import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Volume2, 
  VolumeX,
  Trash2,
  Clock,
  Shield,
  Scale,
  FileText,
  Building2,
  Brain,
  User,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BINotification {
  id: string;
  type: 'credit_repair' | 'fiscal' | 'ir' | 'certificate' | 'company_opening';
  title: string;
  description: string;
  clientName: string;
  timestamp: Date;
  isRead: boolean;
  requestId: string;
}

const typeConfig = {
  credit_repair: { 
    label: 'Limpa Nome', 
    icon: Shield, 
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    iconColor: 'text-emerald-600'
  },
  fiscal: { 
    label: 'Análise Fiscal', 
    icon: Scale, 
    color: 'bg-violet-100 text-violet-700 border-violet-200',
    iconColor: 'text-violet-600'
  },
  ir: { 
    label: 'Declaração IR', 
    icon: FileText, 
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    iconColor: 'text-blue-600'
  },
  certificate: { 
    label: 'Certidão', 
    icon: FileText, 
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    iconColor: 'text-orange-600'
  },
  company_opening: { 
    label: 'Abertura Empresa', 
    icon: Building2, 
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    iconColor: 'text-pink-600'
  }
};

interface BIRealtimeNotificationsProps {
  onSelectRequest?: (type: string, id: string) => void;
}

export const BIRealtimeNotifications: React.FC<BIRealtimeNotificationsProps> = ({ onSelectRequest }) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<BINotification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playNotificationSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const addNotification = (notification: Omit<BINotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: BINotification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      isRead: false
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
    setUnreadCount(prev => prev + 1);
    playNotificationSound();
    
    const config = typeConfig[notification.type];
    toast({
      title: `🔔 ${notification.title}`,
      description: (
        <div className="flex items-center gap-2">
          <Badge className={`${config.color} text-xs`}>
            {config.label}
          </Badge>
          <span>{notification.clientName}</span>
        </div>
      ),
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification: BINotification) => {
    markAsRead(notification.id);
    if (onSelectRequest) {
      onSelectRequest(notification.type, notification.requestId);
    }
  };

  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleF4OKIGSxLaMNAw0c43Jrq5RIhVNo72XZQ8dQX6n1a2QNQYecJK4vHklCyhxk66xiSsXLHaXuLl4JQ0kdZa5wnQkDid3l7m+cSQOJneYub1wIw8ndpm6vnAjDyd3mLq/cCMPJ3eYur9wIw8nd5i6v3AjDyd3mLq/cCMPJ3eYur9wIw==");
    audioRef.current.volume = 0.6;

    // Subscribe to credit_repair_requests
    const creditRepairChannel = supabase
      .channel('bi-credit-repair')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'credit_repair_requests' },
        (payload) => {
          const request = payload.new as any;
          addNotification({
            type: 'credit_repair',
            title: 'Nova Solicitação Limpa Nome',
            description: `Dívida: R$ ${((request.debt_amount_cents || 0) / 100).toFixed(2)}`,
            clientName: request.full_name || 'Cliente',
            requestId: request.id
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Subscribe to fiscal_analysis_requests
    const fiscalChannel = supabase
      .channel('bi-fiscal')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'fiscal_analysis_requests' },
        (payload) => {
          const request = payload.new as any;
          addNotification({
            type: 'fiscal',
            title: 'Nova Análise Fiscal',
            description: `Empresa: ${request.company_name}`,
            clientName: request.full_name || 'Cliente',
            requestId: request.id
          });
        }
      )
      .subscribe();

    // Subscribe to ir_requests
    const irChannel = supabase
      .channel('bi-ir')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ir_requests' },
        (payload) => {
          const request = payload.new as any;
          addNotification({
            type: 'ir',
            title: 'Nova Declaração IR',
            description: `Ano-Base: ${request.fiscal_year}`,
            clientName: request.full_name || 'Cliente',
            requestId: request.id
          });
        }
      )
      .subscribe();

    // Subscribe to certificate_requests
    const certificateChannel = supabase
      .channel('bi-certificate')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'certificate_requests' },
        (payload) => {
          const request = payload.new as any;
          addNotification({
            type: 'certificate',
            title: 'Nova Solicitação de Certidão',
            description: `Tipo: ${request.certificate_type}`,
            clientName: 'Cliente',
            requestId: request.id
          });
        }
      )
      .subscribe();

    // Subscribe to company_opening_requests
    const companyChannel = supabase
      .channel('bi-company')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'company_opening_requests' },
        (payload) => {
          const request = payload.new as any;
          addNotification({
            type: 'company_opening',
            title: 'Nova Abertura de Empresa',
            description: `Profissão: ${request.profession || 'Não informada'}`,
            clientName: request.full_name || 'Cliente',
            requestId: request.id
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(creditRepairChannel);
      supabase.removeChannel(fiscalChannel);
      supabase.removeChannel(irChannel);
      supabase.removeChannel(certificateChannel);
      supabase.removeChannel(companyChannel);
    };
  }, [soundEnabled]);

  return (
    <Card className="h-full bg-white border-slate-200 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold animate-pulse">
                  {unreadCount}
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Notificações
              </CardTitle>
              <CardDescription className="text-xs">
                Novas solicitações em tempo real
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={isConnected ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}
            >
              <span className={`w-2 h-2 rounded-full mr-1.5 ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
              {isConnected ? "Conectado" : "Offline"}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="h-8 w-8"
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-slate-600" />
              ) : (
                <VolumeX className="h-4 w-4 text-slate-400" />
              )}
            </Button>
            {notifications.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-8 text-xs"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Marcar lidas
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearNotifications}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4 text-slate-400" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mb-4">
                <Brain className="h-8 w-8 text-indigo-500" />
              </div>
              <p className="text-slate-600 font-medium">Sistema Ativo</p>
              <p className="text-slate-400 text-sm mt-1">
                Aguardando novas solicitações...
              </p>
              <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
                <User className="h-3 w-3" />
                <span>Especialista receberá as notificações</span>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => {
                const config = typeConfig[notification.type];
                const TypeIcon = config.icon;

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer transition-all hover:bg-slate-50 ${
                      !notification.isRead ? 'bg-indigo-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        notification.isRead ? 'bg-slate-100' : 'bg-white border-2 border-indigo-200'
                      }`}>
                        <TypeIcon className={`h-5 w-5 ${config.iconColor}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${config.color} text-xs border`}>
                            {config.label}
                          </Badge>
                          {!notification.isRead && (
                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                          )}
                        </div>
                        <p className="font-medium text-slate-900 text-sm">
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {notification.clientName} • {notification.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          {format(notification.timestamp, "HH:mm", { locale: ptBR })}
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-300" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
