import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditRepairChat } from '@/components/limpa-nome/CreditRepairChat';
import {
  ArrowLeft,
  Shield,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  User,
  Phone,
  Mail,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CreditRepairRequest {
  id: string;
  full_name: string;
  cpf: string | null;
  email: string | null;
  phone: string | null;
  debt_amount_cents: number;
  debt_description: string | null;
  bureaus_selected: string[] | null;
  status: string;
  payment_status: string;
  final_price_cents: number;
  contador_id: string | null;
  created_at: string;
  completed_at: string | null;
}

interface ContadorInfo {
  full_name: string | null;
  specialty: string | null;
}

const LimpaNomeStatusPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [request, setRequest] = useState<CreditRepairRequest | null>(null);
  const [contadorInfo, setContadorInfo] = useState<ContadorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (user && id) {
      fetchRequest();
    }
  }, [user, id]);

  const fetchRequest = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('credit_repair_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching request:', error);
    } else {
      setRequest(data);
      if (data?.contador_id) {
        fetchContadorInfo(data.contador_id);
      }
    }
    setIsLoading(false);
  };

  const fetchContadorInfo = async (contadorId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', contadorId)
      .single();

    const { data: contador } = await supabase
      .from('contador_profiles')
      .select('specialty')
      .eq('user_id', contadorId)
      .single();

    if (profile || contador) {
      setContadorInfo({
        full_name: profile?.full_name || 'Especialista',
        specialty: contador?.specialty || null
      });
    }
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  const getStatusConfig = (status: string) => {
    const config: Record<string, { class: string; icon: any; label: string; description: string }> = {
      pending: { 
        class: 'bg-accent/10 text-accent border-accent/20', 
        icon: Clock, 
        label: 'Pendente',
        description: 'Aguardando atribuição de especialista'
      },
      in_progress: { 
        class: 'bg-info/10 text-info border-info/20', 
        icon: AlertCircle, 
        label: 'Em Andamento',
        description: 'Especialista analisando suas pendências'
      },
      negotiating: { 
        class: 'bg-primary/10 text-primary border-primary/20', 
        icon: MessageCircle, 
        label: 'Negociando',
        description: 'Em negociação com credores'
      },
      completed: { 
        class: 'bg-success/10 text-success border-success/20', 
        icon: CheckCircle, 
        label: 'Concluído',
        description: 'Seu nome foi regularizado!'
      },
      cancelled: { 
        class: 'bg-destructive/10 text-destructive border-destructive/20', 
        icon: XCircle, 
        label: 'Cancelado',
        description: 'Solicitação cancelada'
      },
    };
    return config[status] || config.pending;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header onNavigate={() => navigate('/')} />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Solicitação não encontrada</h1>
          <Button onClick={() => navigate('/limpa-nome')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Limpa Nome
          </Button>
        </main>
        <Footer onNavigate={() => navigate('/')} />
      </div>
    );
  }

  const statusConfig = getStatusConfig(request.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onNavigate={() => navigate('/')} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/limpa-nome')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Status and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-success" />
                      Limpa Nome
                    </CardTitle>
                    <CardDescription>
                      Solicitação #{request.id.slice(0, 8)}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={statusConfig.class}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-muted/30 border">
                  <p className="text-sm text-muted-foreground mb-2">Status atual</p>
                  <p className="font-medium">{statusConfig.description}</p>
                </div>

                {/* Timeline */}
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold">Progresso</h3>
                  <div className="relative pl-6 space-y-4">
                    <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border" />
                    
                    {[
                      { status: 'pending', label: 'Solicitação Recebida', done: true },
                      { status: 'paid', label: 'Pagamento Confirmado', done: request.payment_status === 'paid' },
                      { status: 'in_progress', label: 'Especialista Atribuído', done: !!request.contador_id },
                      { status: 'negotiating', label: 'Em Negociação', done: request.status === 'negotiating' || request.status === 'completed' },
                      { status: 'completed', label: 'Nome Limpo!', done: request.status === 'completed' },
                    ].map((step, index) => (
                      <div key={index} className="relative flex items-center gap-3">
                        <div className={`absolute -left-4 h-4 w-4 rounded-full ${step.done ? 'bg-success' : 'bg-muted border-2 border-border'}`}>
                          {step.done && <CheckCircle className="h-4 w-4 text-white" />}
                        </div>
                        <span className={step.done ? 'font-medium' : 'text-muted-foreground'}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Solicitação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Nome</p>
                        <p className="font-medium">{request.full_name}</p>
                      </div>
                    </div>
                    {request.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">E-mail</p>
                          <p className="font-medium">{request.email}</p>
                        </div>
                      </div>
                    )}
                    {request.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Telefone</p>
                          <p className="font-medium">{request.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="text-sm text-muted-foreground">Dívida Total</p>
                        <p className="font-medium text-destructive">{formatCurrency(request.debt_amount_cents)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Bureaus</p>
                      <div className="flex flex-wrap gap-1">
                        {request.bureaus_selected?.map(b => (
                          <Badge key={b} variant="outline" className="uppercase text-xs">{b}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data da Solicitação</p>
                      <p className="font-medium">
                        {format(new Date(request.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            {request.contador_id && contadorInfo ? (
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Chat com Especialista
                  </CardTitle>
                  <CardDescription>
                    {contadorInfo.full_name}
                    {contadorInfo.specialty && ` • ${contadorInfo.specialty}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[500px]">
                    <CreditRepairChat
                      requestId={request.id}
                      otherUserId={request.contador_id}
                      otherUserName={contadorInfo.full_name || 'Especialista'}
                      isAdmin={false}
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">Chat em Breve</h3>
                  <p className="text-sm text-muted-foreground">
                    Um especialista será atribuído à sua solicitação em breve. 
                    O chat ficará disponível assim que isso acontecer.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer onNavigate={() => navigate('/')} />
    </div>
  );
};

export default LimpaNomeStatusPage;
