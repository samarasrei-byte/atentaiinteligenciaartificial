import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditRepairAIChat } from '@/components/limpa-nome/CreditRepairAIChat';
import { motion, AnimatePresence } from 'framer-motion';
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
  DollarSign,
  Building2,
  FileSearch,
  Handshake,
  PartyPopper,
  Users,
  HeadphonesIcon
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

interface SpecialistInfo {
  full_name: string | null;
  specialty: string | null;
}

const LimpaNomeStatusPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [request, setRequest] = useState<CreditRepairRequest | null>(null);
  const [specialistInfo, setSpecialistInfo] = useState<SpecialistInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      fetchRequest();
      
      // Setup realtime subscription
      const channel = supabase
        .channel(`credit-repair-${id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'credit_repair_requests',
            filter: `id=eq.${id}`
          },
          (payload) => {
            setRequest(payload.new as CreditRepairRequest);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
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
        fetchSpecialistInfo(data.contador_id);
      }
    }
    setIsLoading(false);
  };

  const fetchSpecialistInfo = async (specialistId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', specialistId)
      .single();

    if (profile) {
      setSpecialistInfo({
        full_name: profile?.full_name || 'Especialista',
        specialty: 'Regularização de Crédito'
      });
    }
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  const getStatusConfig = (status: string) => {
    const config: Record<string, { class: string; icon: any; label: string; description: string; progress: number }> = {
      pending: { 
        class: 'bg-accent/10 text-accent border-accent/20', 
        icon: Clock, 
        label: 'Pendente',
        description: 'Aguardando atribuição de especialista humano',
        progress: 20
      },
      in_progress: { 
        class: 'bg-info/10 text-info border-info/20', 
        icon: FileSearch, 
        label: 'Em Análise',
        description: 'Especialista humano analisando suas pendências',
        progress: 40
      },
      negotiating: { 
        class: 'bg-primary/10 text-primary border-primary/20', 
        icon: Handshake, 
        label: 'Negociando',
        description: 'Em negociação direta com credores',
        progress: 70
      },
      completed: { 
        class: 'bg-success/10 text-success border-success/20', 
        icon: PartyPopper, 
        label: 'Concluído',
        description: 'Parabéns! Seu CPF/CNPJ foi regularizado!',
        progress: 100
      },
      cancelled: { 
        class: 'bg-destructive/10 text-destructive border-destructive/20', 
        icon: XCircle, 
        label: 'Cancelado',
        description: 'Solicitação cancelada',
        progress: 0
      },
    };
    return config[status] || config.pending;
  };

  const timelineSteps = [
    { 
      key: 'pending', 
      label: 'Solicitação Recebida', 
      icon: CheckCircle,
      description: 'Sua solicitação foi recebida com sucesso'
    },
    { 
      key: 'paid', 
      label: 'Pagamento Confirmado', 
      icon: DollarSign,
      description: 'Pagamento processado'
    },
    { 
      key: 'assigned', 
      label: 'Especialista Atribuído', 
      icon: Users,
      description: 'Um especialista humano foi designado'
    },
    { 
      key: 'analyzing', 
      label: 'Análise de Pendências', 
      icon: FileSearch,
      description: 'Verificando restrições nos bureaus'
    },
    { 
      key: 'negotiating', 
      label: 'Negociação com Credores', 
      icon: Handshake,
      description: 'Negociando melhores condições'
    },
    { 
      key: 'completed', 
      label: 'Nome Limpo!', 
      icon: PartyPopper,
      description: 'CPF/CNPJ regularizado'
    },
  ];

  const getStepStatus = (stepKey: string): 'done' | 'current' | 'pending' => {
    if (!request) return 'pending';
    
    const stepOrder = ['pending', 'paid', 'assigned', 'analyzing', 'negotiating', 'completed'];
    const currentStepIndex = (() => {
      if (request.status === 'completed') return 5;
      if (request.status === 'negotiating') return 4;
      if (request.status === 'in_progress') return 3;
      if (request.contador_id) return 2;
      if (request.payment_status === 'paid') return 1;
      return 0;
    })();
    
    const stepIndex = stepOrder.indexOf(stepKey);
    if (stepIndex < currentStepIndex) return 'done';
    if (stepIndex === currentStepIndex) return 'current';
    return 'pending';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando status...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header onNavigate={() => navigate('/')} />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Solicitação não encontrada</h1>
          <p className="text-muted-foreground mb-6">Verifique se o link está correto ou entre em contato conosco.</p>
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

        {/* Hero Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-success/5 via-background to-primary/5">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-success/10 flex items-center justify-center">
                    <Shield className="h-8 w-8 text-success" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Limpa Nome</h1>
                    <p className="text-muted-foreground">
                      Regularização de CPF/CNPJ • Atendimento 100% Humano
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={`${statusConfig.class} px-4 py-2 text-base`}>
                  <StatusIcon className="h-4 w-4 mr-2" />
                  {statusConfig.label}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="mt-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium">{statusConfig.progress}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${statusConfig.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-success to-primary rounded-full"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">{statusConfig.description}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Timeline and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Empresa Especializada Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Empresa Especializada</h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        Sua regularização está sendo conduzida por uma empresa especializada em recuperação de crédito, 
                        com atendimento 100% humano do início ao fim.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-background">
                          <Users className="h-3 w-3 mr-1" />
                          Atendimento Humano
                        </Badge>
                        <Badge variant="outline" className="bg-background">
                          <HeadphonesIcon className="h-3 w-3 mr-1" />
                          Suporte Dedicado
                        </Badge>
                        <Badge variant="outline" className="bg-background">
                          <Shield className="h-3 w-3 mr-1" />
                          +10 Anos de Experiência
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Timeline Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Acompanhe em Tempo Real
                  </CardTitle>
                  <CardDescription>
                    Cada etapa é conduzida por especialistas humanos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {timelineSteps.map((step, index) => {
                      const status = getStepStatus(step.key);
                      const StepIcon = step.icon;
                      
                      return (
                        <motion.div
                          key={step.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative flex gap-4 pb-8 last:pb-0"
                        >
                          {/* Connector line */}
                          {index < timelineSteps.length - 1 && (
                            <div 
                              className={`absolute left-5 top-10 w-0.5 h-full -ml-px ${
                                status === 'done' ? 'bg-success' : 'bg-border'
                              }`}
                            />
                          )}
                          
                          {/* Icon */}
                          <div className={`relative z-10 flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                            status === 'done' 
                              ? 'bg-success text-white' 
                              : status === 'current'
                                ? 'bg-primary text-white animate-pulse'
                                : 'bg-muted text-muted-foreground'
                          }`}>
                            <StepIcon className="h-5 w-5" />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 pt-1.5">
                            <h4 className={`font-medium ${
                              status === 'pending' ? 'text-muted-foreground' : ''
                            }`}>
                              {step.label}
                              {status === 'current' && (
                                <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                                  Em andamento
                                </Badge>
                              )}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {step.description}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes da Solicitação</CardTitle>
                  <CardDescription>
                    ID: #{request.id.slice(0, 8).toUpperCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <User className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Nome</p>
                          <p className="font-medium">{request.full_name}</p>
                        </div>
                      </div>
                      {request.email && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <Mail className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">E-mail</p>
                            <p className="font-medium">{request.email}</p>
                          </div>
                        </div>
                      )}
                      {request.phone && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <Phone className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Telefone</p>
                            <p className="font-medium">{request.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10">
                        <DollarSign className="h-5 w-5 text-destructive" />
                        <div>
                          <p className="text-xs text-muted-foreground">Dívida Total Informada</p>
                          <p className="font-medium text-destructive">{formatCurrency(request.debt_amount_cents)}</p>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-2">Bureaus de Crédito</p>
                        <div className="flex flex-wrap gap-1">
                          {request.bureaus_selected?.map(b => (
                            <Badge key={b} variant="outline" className="uppercase text-xs">{b}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Data da Solicitação</p>
                          <p className="font-medium">
                            {format(new Date(request.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Chat Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
          >
            <Card className="sticky top-4 border-success/20">
              <CardHeader className="bg-success/5">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-success" />
                  Chat com Especialista
                </CardTitle>
                <CardDescription>
                  Atendimento 100% humano • Empresa Especializada
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[500px]">
                  <CreditRepairAIChat
                    requestId={request.id}
                    otherUserId={request.contador_id || 'admin-limpa-nome'}
                    otherUserName={specialistInfo?.full_name || 'Especialista Limpa Nome'}
                    isAdmin={false}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer onNavigate={() => navigate('/')} />
    </div>
  );
};

export default LimpaNomeStatusPage;
