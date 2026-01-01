import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageCircle,
  Loader2,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CreditRepairRequest {
  id: string;
  full_name: string;
  debt_amount_cents: number;
  bureaus_selected: string[] | null;
  status: string;
  payment_status: string;
  final_price_cents: number;
  contador_id: string | null;
  created_at: string;
}

const MinhasSolicitacoesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<CreditRepairRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('credit_repair_requests')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requests:', error);
    } else {
      setRequests(data || []);
    }
    setIsLoading(false);
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { class: string; icon: any; label: string }> = {
      pending: { class: 'bg-accent/10 text-accent', icon: Clock, label: 'Pendente' },
      in_progress: { class: 'bg-info/10 text-info', icon: AlertCircle, label: 'Em Andamento' },
      negotiating: { class: 'bg-primary/10 text-primary', icon: MessageCircle, label: 'Negociando' },
      completed: { class: 'bg-success/10 text-success', icon: CheckCircle, label: 'Concluído' },
      cancelled: { class: 'bg-destructive/10 text-destructive', icon: XCircle, label: 'Cancelado' },
    };
    const cfg = config[status] || config.pending;
    const Icon = cfg.icon;
    return <Badge variant="outline" className={cfg.class}><Icon className="h-3 w-3 mr-1" />{cfg.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onNavigate={() => navigate('/')} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-success" />
              Minhas Solicitações Limpa Nome
            </h1>
          </div>
          <Button onClick={() => navigate('/limpa-nome')}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Solicitação
          </Button>
        </div>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">Nenhuma solicitação</h2>
              <p className="text-muted-foreground mb-6">
                Você ainda não tem solicitações de Limpa Nome.
              </p>
              <Button onClick={() => navigate('/limpa-nome')}>
                <Plus className="h-4 w-4 mr-2" />
                Iniciar Limpa Nome
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card 
                key={request.id} 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate(`/limpa-nome/status/${request.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                        <Shield className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <p className="font-semibold">{request.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(request.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Dívida</p>
                        <p className="font-semibold text-destructive">{formatCurrency(request.debt_amount_cents)}</p>
                      </div>
                      {getStatusBadge(request.status)}
                      {request.contador_id && (
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Chat
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {request.bureaus_selected?.map(b => (
                      <Badge key={b} variant="secondary" className="uppercase text-xs">{b}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer onNavigate={() => navigate('/')} />
    </div>
  );
};

export default MinhasSolicitacoesPage;
