import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Bell, 
  Calendar, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Loader2,
  Settings,
  Trash2
} from 'lucide-react';
import { format, differenceInDays, addDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Prazos fiscais importantes
const TAX_DEADLINES = [
  {
    id: 'ir_pf',
    name: 'Declaração de IR Pessoa Física',
    description: 'Prazo final para entrega da declaração anual',
    month: 4, // Abril
    day: 30,
    daysBeforeAlert: [30, 15, 7, 3, 1],
    type: 'annual',
    icon: FileText,
    priority: 'high',
  },
  {
    id: 'das_mei',
    name: 'DAS MEI',
    description: 'Pagamento mensal do DAS do MEI',
    day: 20, // Todo dia 20 do mês seguinte
    daysBeforeAlert: [5, 3, 1],
    type: 'monthly',
    icon: Calendar,
    priority: 'medium',
  },
  {
    id: 'dasn_simei',
    name: 'DASN-SIMEI',
    description: 'Declaração Anual do MEI',
    month: 5, // Maio
    day: 31,
    daysBeforeAlert: [30, 15, 7, 1],
    type: 'annual',
    icon: FileText,
    priority: 'high',
  },
  {
    id: 'defis_simples',
    name: 'DEFIS Simples Nacional',
    description: 'Declaração de Informações Socioeconômicas e Fiscais',
    month: 3, // Março
    day: 31,
    daysBeforeAlert: [30, 15, 7, 1],
    type: 'annual',
    icon: FileText,
    priority: 'high',
  },
  {
    id: 'gfip_inss',
    name: 'GFIP/SEFIP',
    description: 'Guia de Recolhimento do FGTS e Informações à Previdência',
    day: 7, // Todo dia 7 do mês seguinte
    daysBeforeAlert: [3, 1],
    type: 'monthly',
    icon: Calendar,
    priority: 'medium',
  },
  {
    id: 'ecf',
    name: 'ECF - Escrituração Contábil Fiscal',
    description: 'Entrega obrigatória para empresas do Lucro Real/Presumido',
    month: 7, // Julho
    day: 31,
    daysBeforeAlert: [60, 30, 15, 7, 1],
    type: 'annual',
    icon: FileText,
    priority: 'high',
  },
];

interface Notification {
  id: string;
  deadlineId: string;
  title: string;
  message: string;
  dueDate: Date;
  daysRemaining: number;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
}

export function TaxDeadlineNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    irAlerts: true,
    meiAlerts: true,
    simplesAlerts: true,
    emailNotifications: false,
    pushNotifications: false,
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    generateNotifications();
  }, []);

  const generateNotifications = () => {
    setIsLoading(true);
    const today = new Date();
    const currentYear = today.getFullYear();
    const generatedNotifications: Notification[] = [];

    TAX_DEADLINES.forEach((deadline) => {
      let dueDate: Date;

      if (deadline.type === 'annual') {
        dueDate = new Date(currentYear, deadline.month! - 1, deadline.day);
        // Se já passou, usa o próximo ano
        if (dueDate < today) {
          dueDate = new Date(currentYear + 1, deadline.month! - 1, deadline.day);
        }
      } else {
        // Mensal - próximo mês
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, deadline.day);
        dueDate = nextMonth;
      }

      const daysRemaining = differenceInDays(dueDate, today);

      // Gera notificação se estiver dentro do período de alerta
      if (daysRemaining >= 0 && daysRemaining <= Math.max(...deadline.daysBeforeAlert)) {
        generatedNotifications.push({
          id: `${deadline.id}-${format(dueDate, 'yyyy-MM-dd')}`,
          deadlineId: deadline.id,
          title: deadline.name,
          message: deadline.description,
          dueDate,
          daysRemaining,
          priority: deadline.priority as 'low' | 'medium' | 'high',
          isRead: false,
        });
      }
    });

    // Ordena por dias restantes (mais urgentes primeiro)
    generatedNotifications.sort((a, b) => a.daysRemaining - b.daysRemaining);

    setNotifications(generatedNotifications);
    setIsLoading(false);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast.success('Notificação removida');
  };

  const getPriorityColor = (priority: string, daysRemaining: number) => {
    if (daysRemaining <= 3) return 'bg-destructive text-destructive-foreground';
    if (daysRemaining <= 7) return 'bg-amber-500 text-white';
    if (priority === 'high') return 'bg-primary text-primary-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const getPriorityIcon = (daysRemaining: number) => {
    if (daysRemaining <= 3) return <AlertTriangle className="h-4 w-4" />;
    if (daysRemaining <= 7) return <Clock className="h-4 w-4" />;
    return <Calendar className="h-4 w-4" />;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Alertas de Prazos Fiscais</CardTitle>
              <CardDescription>
                Notificações automáticas para obrigações tributárias
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} novos</Badge>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 rounded-lg bg-muted/50 border space-y-4">
            <h4 className="font-medium">Configurações de Alertas</h4>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="irAlerts">Alertas de IR</Label>
                <Switch
                  id="irAlerts"
                  checked={settings.irAlerts}
                  onCheckedChange={(checked) => setSettings({ ...settings, irAlerts: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="meiAlerts">Alertas MEI (DAS)</Label>
                <Switch
                  id="meiAlerts"
                  checked={settings.meiAlerts}
                  onCheckedChange={(checked) => setSettings({ ...settings, meiAlerts: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="simplesAlerts">Alertas Simples Nacional</Label>
                <Switch
                  id="simplesAlerts"
                  checked={settings.simplesAlerts}
                  onCheckedChange={(checked) => setSettings({ ...settings, simplesAlerts: checked })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
            <h4 className="font-medium text-foreground">Tudo em dia!</h4>
            <p className="text-sm text-muted-foreground">
              Não há prazos fiscais próximos para alertar.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all ${
                    notification.isRead ? 'bg-background' : 'bg-muted/30'
                  } ${notification.daysRemaining <= 3 ? 'border-destructive/50' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority, notification.daysRemaining)}`}>
                        {getPriorityIcon(notification.daysRemaining)}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant={notification.daysRemaining <= 3 ? 'destructive' : 'outline'}
                          >
                            {notification.daysRemaining === 0
                              ? 'Vence HOJE!'
                              : notification.daysRemaining === 1
                              ? 'Vence amanhã'
                              : `${notification.daysRemaining} dias restantes`}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(notification.dueDate, "dd 'de' MMMM", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissNotification(notification.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Quick Info */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Como funciona?</p>
              <p className="text-muted-foreground">
                Você receberá alertas automáticos sobre prazos fiscais importantes como 
                IR, DAS MEI, DEFIS e outras obrigações. Configure quais alertas deseja receber 
                nas configurações acima.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
