import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  User,
  Bell,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DocumentUpload from './DocumentUpload';

interface CompanyOpeningStatusProps {
  onStartNew?: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; description: string }> = {
  pending: {
    label: 'Aguardando Análise',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: <Clock className="h-4 w-4" />,
    description: 'Sua solicitação foi recebida e está aguardando análise.',
  },
  analyzing: {
    label: 'Em Análise',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: <User className="h-4 w-4" />,
    description: 'Um contador está analisando sua solicitação.',
  },
  documents_pending: {
    label: 'Documentos Pendentes',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    icon: <FileText className="h-4 w-4" />,
    description: 'Existem documentos pendentes para continuar.',
  },
  in_progress: {
    label: 'Em Andamento',
    color: 'bg-primary/20 text-primary border-primary/30',
    icon: <RefreshCw className="h-4 w-4 animate-spin" />,
    description: 'O processo de abertura está em andamento.',
  },
  completed: {
    label: 'Concluído',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: <CheckCircle2 className="h-4 w-4" />,
    description: 'Sua empresa foi aberta com sucesso!',
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: <XCircle className="h-4 w-4" />,
    description: 'Esta solicitação foi cancelada.',
  },
};

const CompanyOpeningStatus: React.FC<CompanyOpeningStatusProps> = ({ onStartNew }) => {
  const { user } = useAuth();

  // Fetch active requests
  const { data: requests, isLoading: requestsLoading, refetch: refetchRequests } = useQuery({
    queryKey: ['company-opening-requests', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_opening_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch notifications
  const { data: notifications, refetch: refetchNotifications } = useQuery({
    queryKey: ['company-opening-notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_opening_notifications')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('company-opening-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'company_opening_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          refetchNotifications();
          refetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetchNotifications, refetchRequests]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('company_opening_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);
    refetchNotifications();
  };

  if (requestsLoading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Building2 className="h-5 w-5 text-primary" />
            Abertura de Empresa
          </CardTitle>
          <CardDescription>
            Você ainda não possui solicitações de abertura de empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {onStartNew && (
            <Button onClick={onStartNew} className="w-full">
              Iniciar Processo de Abertura
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const activeRequest = requests.find(r => !['completed', 'cancelled'].includes(r.status));
  const latestRequest = activeRequest || requests[0];
  const statusConfig = STATUS_CONFIG[latestRequest.status] || STATUS_CONFIG.pending;

  return (
    <div className="space-y-4">
      {/* Notifications */}
      {notifications && notifications.length > 0 && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-400">
              <Bell className="h-4 w-4" />
              Notificações ({notifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className="flex items-start justify-between gap-3 p-3 bg-background/50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground">{notification.title}</p>
                  <p className="text-xs text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(notification.created_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => markAsRead(notification.id)}
                  className="text-xs"
                >
                  Marcar como lida
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Status Card */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Building2 className="h-5 w-5 text-primary" />
                Status da Abertura
              </CardTitle>
              <CardDescription>
                Acompanhe o progresso da sua solicitação
              </CardDescription>
            </div>
            <Badge className={statusConfig.color}>
              {statusConfig.icon}
              <span className="ml-1">{statusConfig.label}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-full ${statusConfig.color.split(' ')[0]}`}>
                {statusConfig.icon}
              </div>
              <div>
                <p className="font-medium text-foreground">{statusConfig.description}</p>
                <p className="text-xs text-muted-foreground">
                  Atualizado em {format(new Date(latestRequest.status_updated_at || latestRequest.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>

          {/* Document Upload for documents_pending status */}
          {latestRequest.status === 'documents_pending' && (
            <DocumentUpload requestId={latestRequest.id} />
          )}

          {/* Request Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Regime Recomendado</p>
              <p className="font-medium text-foreground capitalize">
                {latestRequest.recommended_regime?.replace('-', ' ') || 'Pendente'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Data da Solicitação</p>
              <p className="font-medium text-foreground">
                {format(new Date(latestRequest.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
            {latestRequest.city && (
              <div>
                <p className="text-muted-foreground">Localização</p>
                <p className="font-medium text-foreground">{latestRequest.city}/{latestRequest.state}</p>
              </div>
            )}
            {latestRequest.profession && (
              <div>
                <p className="text-muted-foreground">Profissão</p>
                <p className="font-medium text-foreground">{latestRequest.profession}</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground mb-3">Próximos Passos</p>
            <div className="space-y-3">
              {latestRequest.status === 'pending' && (
                <>
                  <TimelineStep completed icon={<CheckCircle2 />} text="Solicitação enviada" />
                  <TimelineStep current icon={<Clock />} text="Aguardando análise do contador" />
                  <TimelineStep icon={<FileText />} text="Verificação de documentos" />
                  <TimelineStep icon={<Building2 />} text="Abertura da empresa" />
                </>
              )}
              {latestRequest.status === 'analyzing' && (
                <>
                  <TimelineStep completed icon={<CheckCircle2 />} text="Solicitação enviada" />
                  <TimelineStep completed icon={<CheckCircle2 />} text="Contador designado" />
                  <TimelineStep current icon={<User />} text="Em análise" />
                  <TimelineStep icon={<Building2 />} text="Abertura da empresa" />
                </>
              )}
              {latestRequest.status === 'documents_pending' && (
                <>
                  <TimelineStep completed icon={<CheckCircle2 />} text="Análise concluída" />
                  <TimelineStep current icon={<AlertCircle />} text="Envie os documentos pendentes" />
                  <TimelineStep icon={<Building2 />} text="Abertura da empresa" />
                </>
              )}
              {latestRequest.status === 'in_progress' && (
                <>
                  <TimelineStep completed icon={<CheckCircle2 />} text="Documentos recebidos" />
                  <TimelineStep current icon={<RefreshCw />} text="Processo de abertura em andamento" />
                  <TimelineStep icon={<Building2 />} text="Empresa aberta" />
                </>
              )}
              {latestRequest.status === 'completed' && (
                <>
                  <TimelineStep completed icon={<CheckCircle2 />} text="Processo concluído" />
                  <TimelineStep completed icon={<Building2 />} text="Empresa aberta com sucesso!" />
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface TimelineStepProps {
  completed?: boolean;
  current?: boolean;
  icon: React.ReactNode;
  text: string;
}

const TimelineStep: React.FC<TimelineStepProps> = ({ completed, current, icon, text }) => (
  <div className={`flex items-center gap-3 ${completed ? 'text-emerald-400' : current ? 'text-primary' : 'text-muted-foreground'}`}>
    <div className={`p-1.5 rounded-full ${completed ? 'bg-emerald-500/20' : current ? 'bg-primary/20' : 'bg-muted/50'}`}>
      {React.cloneElement(icon as React.ReactElement, { className: 'h-3.5 w-3.5' })}
    </div>
    <span className="text-sm">{text}</span>
  </div>
);

export default CompanyOpeningStatus;
