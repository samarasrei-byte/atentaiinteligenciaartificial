import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ConsultationChat } from '@/components/chat/ConsultationChat';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Loader2,
  Users,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Star
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Consultation {
  id: string;
  user_id: string;
  contador_id: string;
  status: string;
  scheduled_at: string | null;
  price_cents: number;
  notes: string | null;
  created_at: string;
  rating: number | null;
  user_name?: string;
  contador_name?: string;
}

interface EmbeddedConsultationChatProps {
  isContador?: boolean;
}

export function EmbeddedConsultationChat({ isContador = false }: EmbeddedConsultationChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConsultations();
      
      // Real-time subscription
      const channel = supabase
        .channel('consultations-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'consultations',
            filter: isContador ? `contador_id=eq.${user.id}` : `user_id=eq.${user.id}`,
          },
          () => fetchConsultations()
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, isContador]);

  const fetchConsultations = async () => {
    if (!user) return;
    
    try {
      const column = isContador ? 'contador_id' : 'user_id';
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq(column, user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profile names
      const consultationsWithNames = await Promise.all(
        (data || []).map(async (c) => {
          const otherId = isContador ? c.user_id : c.contador_id;
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', otherId)
            .single();
          
          return {
            ...c,
            [isContador ? 'user_name' : 'contador_name']: profile?.full_name || 'Usuário',
          };
        })
      );

      setConsultations(consultationsWithNames);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const config: Record<string, { class: string; icon: any; label: string }> = {
      pending: { class: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock, label: 'Pendente' },
      scheduled: { class: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Calendar, label: 'Agendada' },
      completed: { class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle, label: 'Concluída' },
      cancelled: { class: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle, label: 'Cancelada' },
    };
    return config[status] || config.pending;
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show chat view when a consultation is selected
  if (selectedConsultation) {
    const otherUserId = isContador ? selectedConsultation.user_id : selectedConsultation.contador_id;
    const otherUserName = isContador 
      ? selectedConsultation.user_name || 'Cliente'
      : selectedConsultation.contador_name || 'Contador';

    return (
      <div className="h-[600px] flex flex-col">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedConsultation(null)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex-1">
            <p className="font-medium">{otherUserName}</p>
            <p className="text-xs text-muted-foreground">
              {getStatusConfig(selectedConsultation.status).label}
            </p>
          </div>
          <Badge variant="outline" className={getStatusConfig(selectedConsultation.status).class}>
            {getStatusConfig(selectedConsultation.status).label}
          </Badge>
        </div>
        <div className="flex-1 pt-4">
          <ConsultationChat
            consultationId={selectedConsultation.id}
            otherUserId={otherUserId}
            otherUserName={otherUserName}
            isContador={isContador}
          />
        </div>
      </div>
    );
  }

  // Show consultations list
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold">Minhas Conversas</h3>
            <p className="text-xs text-muted-foreground">
              {consultations.length} consulta{consultations.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {consultations.length === 0 ? (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h4 className="font-medium mb-2">Nenhuma consulta ainda</h4>
            <p className="text-sm text-muted-foreground">
              {isContador 
                ? 'Aguarde solicitações de clientes'
                : 'Solicite uma consulta com um contador especializado'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-3 pr-4">
            {consultations.map((consultation) => {
              const statusConfig = getStatusConfig(consultation.status);
              const StatusIcon = statusConfig.icon;
              const otherName = isContador 
                ? consultation.user_name 
                : consultation.contador_name;

              return (
                <Card
                  key={consultation.id}
                  className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group"
                  onClick={() => setSelectedConsultation(consultation)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-border group-hover:border-primary/50 transition-colors">
                        <AvatarFallback className={isContador ? 'bg-primary/10 text-primary' : 'bg-info/10 text-info'}>
                          {getInitials(otherName || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{otherName || 'Usuário'}</p>
                          <Badge variant="outline" className={`shrink-0 ${statusConfig.class}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {consultation.notes || 'Consulta tributária'}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(consultation.created_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </span>
                          {consultation.rating && (
                            <span className="flex items-center gap-1 text-xs text-amber-500">
                              <Star className="h-3 w-3 fill-amber-500" />
                              {consultation.rating}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {formatCurrency(consultation.price_cents)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Abrir Chat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
