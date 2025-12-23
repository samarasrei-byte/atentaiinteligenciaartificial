import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConsultationChat } from '@/components/chat/ConsultationChat';
import { ConsultationRating } from '@/components/chat/ConsultationRating';
import { exportConsultationToPdf } from '@/lib/exportConsultationPdf';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Loader2, 
  Calendar, 
  User, 
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConsultationDetails {
  id: string;
  user_id: string;
  contador_id: string;
  status: string;
  scheduled_at: string | null;
  price_cents: number;
  notes: string | null;
  created_at: string;
  rating: number | null;
  user_profile?: {
    full_name: string | null;
    email: string | null;
  };
  contador_profile?: {
    full_name: string | null;
    email: string | null;
  };
}

const ConsultationChatPage = () => {
  const { consultationId } = useParams<{ consultationId: string }>();
  const navigate = useNavigate();
  const { user, hasRole, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [consultation, setConsultation] = useState<ConsultationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [currentRating, setCurrentRating] = useState<number | null>(null);

  const handleExportPdf = async () => {
    if (!consultation || !user) return;
    
    setIsExporting(true);
    try {
      await exportConsultationToPdf(consultation.id, user.id);
      toast({
        title: 'PDF Gerado!',
        description: 'O relatório foi baixado com sucesso.',
      });
    } catch (err) {
      toast({
        title: 'Erro ao gerar PDF',
        description: 'Não foi possível gerar o relatório.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!consultationId || !user) return;

    const loadConsultation = async () => {
      setIsLoading(true);
      setError(null);

      // Fetch consultation details
      const { data: consultData, error: consultError } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', consultationId)
        .single();

      if (consultError) {
        setError('Consulta não encontrada');
        setIsLoading(false);
        return;
      }

      // Check if user is authorized
      if (consultData.user_id !== user.id && consultData.contador_id !== user.id && !hasRole('admin')) {
        setError('Você não tem permissão para acessar esta conversa');
        setIsLoading(false);
        return;
      }

      // Fetch user profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', consultData.user_id)
        .single();

      // Fetch contador profile
      const { data: contadorProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', consultData.contador_id)
        .single();

      setConsultation({
        ...consultData,
        user_profile: userProfile || undefined,
        contador_profile: contadorProfile || undefined
      });
      
      setIsLoading(false);
    };

    loadConsultation();
  }, [consultationId, user, hasRole]);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { class: string; icon: any; label: string }> = {
      pending: { class: 'bg-accent/10 text-accent border-accent/20', icon: Clock, label: 'Pendente' },
      scheduled: { class: 'bg-info/10 text-info border-info/20', icon: Calendar, label: 'Agendada' },
      completed: { class: 'bg-success/10 text-success border-success/20', icon: CheckCircle, label: 'Concluída' },
      cancelled: { class: 'bg-destructive/10 text-destructive border-destructive/20', icon: AlertCircle, label: 'Cancelada' },
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    return (
      <Badge variant="outline" className={c.class}>
        <Icon className="h-3 w-3 mr-1" />
        {c.label}
      </Badge>
    );
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">{error}</h1>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  if (!consultation) return null;

  const isContador = user?.id === consultation.contador_id;
  const otherUserId = isContador ? consultation.user_id : consultation.contador_id;
  const otherUserName = isContador 
    ? consultation.user_profile?.full_name || 'Cliente'
    : consultation.contador_profile?.full_name || 'Contador';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border px-4 lg:px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <img 
                src="/logo-atentai.png" 
                alt="AtentAI" 
                className="h-10 w-auto"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {consultation.status === 'completed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPdf}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Exportar PDF
              </Button>
            )}
            {getStatusBadge(consultation.status)}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Chat Area */}
          <div className="lg:col-span-2 h-full">
            <ConsultationChat
              consultationId={consultation.id}
              otherUserId={otherUserId}
              otherUserName={otherUserName}
              isContador={isContador}
            />
          </div>

          {/* Consultation Details */}
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Detalhes da Consulta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Status</span>
                  {getStatusBadge(consultation.status)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Valor</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(consultation.price_cents)}
                  </span>
                </div>

                {consultation.scheduled_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Agendada para</span>
                    <span className="text-foreground text-sm">
                      {new Date(consultation.scheduled_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Criada</span>
                  <span className="text-foreground text-sm">
                    {formatDistanceToNow(new Date(consultation.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>

                {consultation.notes && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-muted-foreground text-sm mb-2">Notas</p>
                    <p className="text-foreground text-sm">{consultation.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Participant Info */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-info" />
                  {isContador ? 'Cliente' : 'Contador'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isContador ? 'bg-primary/10' : 'bg-info/10'}`}>
                    <User className={`h-6 w-6 ${isContador ? 'text-primary' : 'text-info'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{otherUserName}</p>
                    <p className="text-sm text-muted-foreground">
                      {isContador 
                        ? consultation.user_profile?.email 
                        : consultation.contador_profile?.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rating Section - Only show for clients on completed consultations */}
            {!isContador && consultation.status === 'completed' && (
              <ConsultationRating
                consultationId={consultation.id}
                currentRating={consultation.rating}
                onRatingSubmitted={(rating) => {
                  setConsultation(prev => prev ? { ...prev, rating } : null);
                }}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConsultationChatPage;
