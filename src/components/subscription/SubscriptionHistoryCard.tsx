import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  Crown,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Loader2,
  Settings,
  History,
  DollarSign,
  XCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Payment {
  id: string;
  amount_cents: number;
  payment_type: string;
  status: string;
  created_at: string;
  stripe_payment_intent_id: string | null;
}

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  price_cents: number;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
}

const planLabels: Record<string, { name: string; color: string; icon: any }> = {
  basic: { name: 'Básico', color: 'bg-muted text-muted-foreground', icon: CreditCard },
  simulator: { name: 'Simulador', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: CreditCard },
  ai: { name: 'IA', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Crown },
  contador: { name: 'Contador Pro', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: Crown },
  premium: { name: 'Premium', color: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30', icon: Crown },
};

export const SubscriptionHistoryCard: React.FC = () => {
  const { user, subscription: authSubscription } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptionHistory, setSubscriptionHistory] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isManaging, setIsManaging] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [paymentsRes, subscriptionsRes] = await Promise.all([
        supabase
          .from('payments')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      setPayments(paymentsRes.data || []);
      setSubscriptionHistory(subscriptionsRes.data || []);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    setIsManaging(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao abrir portal de assinatura',
      });
    } finally {
      setIsManaging(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { class: string; icon: any; label: string }> = {
      active: { class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30', icon: CheckCircle, label: 'Ativo' },
      completed: { class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30', icon: CheckCircle, label: 'Concluído' },
      pending: { class: 'bg-amber-500/10 text-amber-500 border-amber-500/30', icon: Clock, label: 'Pendente' },
      cancelled: { class: 'bg-destructive/10 text-destructive border-destructive/30', icon: XCircle, label: 'Cancelado' },
      expired: { class: 'bg-muted text-muted-foreground', icon: AlertCircle, label: 'Expirado' },
      failed: { class: 'bg-destructive/10 text-destructive border-destructive/30', icon: XCircle, label: 'Falhou' },
    };
    const cfg = config[status] || config.pending;
    const Icon = cfg.icon;
    return (
      <Badge variant="outline" className={cfg.class}>
        <Icon className="h-3 w-3 mr-1" />
        {cfg.label}
      </Badge>
    );
  };

  const planConfig = authSubscription.plan ? planLabels[authSubscription.plan] : null;
  const Icon = planConfig?.icon || CreditCard;
  const daysRemaining = authSubscription.subscriptionEnd
    ? Math.ceil((new Date(authSubscription.subscriptionEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  if (isLoading) {
    return (
      <Card className="bg-card border-border shadow-soft">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Card */}
      <Card className="bg-card border-border shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${planConfig?.color.split(' ')[0] || 'bg-muted'}`}>
                <Icon className={`h-6 w-6 ${planConfig?.color.split(' ')[1] || 'text-muted-foreground'}`} />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {authSubscription.subscribed ? planConfig?.name || 'Assinatura' : 'Sem Assinatura Ativa'}
                  {authSubscription.subscribed && (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {authSubscription.subscribed
                    ? 'Sua assinatura está ativa'
                    : 'Assine um plano para desbloquear recursos'}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {authSubscription.subscribed ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Próxima Cobrança</span>
                  </div>
                  <p className="font-semibold text-foreground">
                    {authSubscription.subscriptionEnd
                      ? new Date(authSubscription.subscriptionEnd).toLocaleDateString('pt-BR')
                      : '-'}
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Status</span>
                  </div>
                  <p className="font-semibold text-emerald-500">
                    {daysRemaining !== null && daysRemaining > 0
                      ? `${daysRemaining} dias restantes`
                      : 'Ativo'}
                  </p>
                </div>
              </div>

              {daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <p className="text-sm text-amber-500">
                      Sua assinatura renova em {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}
                    </p>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={handleManageSubscription}
                disabled={isManaging}
              >
                {isManaging ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Gerenciar Cartão e Assinatura
              </Button>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                Desbloqueie recursos premium assinando um de nossos planos
              </p>
              <Button
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                onClick={() => (window.location.href = '/pricing')}
              >
                Ver Planos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="bg-card border-border shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Histórico de Pagamentos
          </CardTitle>
          <CardDescription>
            Últimos pagamentos realizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum pagamento registrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground capitalize">
                        {payment.payment_type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">
                      {formatCurrency(payment.amount_cents)}
                    </p>
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription History */}
      {subscriptionHistory.length > 1 && (
        <Card className="bg-card border-border shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Histórico de Assinaturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subscriptionHistory.slice(1).map((sub) => {
                const subPlanConfig = planLabels[sub.plan_type] || planLabels.basic;
                return (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border opacity-70"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${subPlanConfig.color.split(' ')[0]}`}>
                        <subPlanConfig.icon className={`h-4 w-4 ${subPlanConfig.color.split(' ')[1]}`} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{subPlanConfig.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(sub.created_at).toLocaleDateString('pt-BR')} - {' '}
                          {sub.current_period_end
                            ? new Date(sub.current_period_end).toLocaleDateString('pt-BR')
                            : 'Sem data'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        {formatCurrency(sub.price_cents)}/mês
                      </p>
                      {getStatusBadge(sub.status)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
