import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, Crown, Calendar, CheckCircle, AlertCircle, 
  ExternalLink, Loader2, Settings,
} from 'lucide-react';

interface SubscriptionCardProps {
  showManageButton?: boolean;
  compact?: boolean;
  onTabChange?: (tab: string) => void;
}

const planLabels: Record<string, { name: string; color: string; icon: any }> = {
  simulator: { name: 'Simulador', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: CreditCard },
  premium: { name: 'Premium', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Crown },
  contador: { name: 'Contador Pro', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: Crown },
};

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  showManageButton = true,
  compact = false,
  onTabChange,
}) => {
  const { subscription, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleManageSubscription = async () => {
    if (!user) return;

    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const planConfig = subscription.plan ? planLabels[subscription.plan] : null;
  const Icon = planConfig?.icon || CreditCard;
  const daysRemaining = subscription.subscriptionEnd
    ? Math.ceil((new Date(subscription.subscriptionEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
        <div className={`p-2 rounded-lg ${planConfig?.color.split(' ')[0] || 'bg-muted'}`}>
          <Icon className={`h-4 w-4 ${planConfig?.color.split(' ')[1] || 'text-muted-foreground'}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">
              {subscription.subscribed ? planConfig?.name || 'Assinatura Ativa' : 'Sem Assinatura'}
            </span>
            {subscription.subscribed && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ativo
              </Badge>
            )}
          </div>
          {subscription.subscriptionEnd && (
            <p className="text-xs text-muted-foreground">
              Renova em {new Date(subscription.subscriptionEnd).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
        {showManageButton && subscription.subscribed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManageSubscription}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="bg-card border-border shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${planConfig?.color.split(' ')[0] || 'bg-muted'}`}>
              <Icon className={`h-6 w-6 ${planConfig?.color.split(' ')[1] || 'text-muted-foreground'}`} />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {subscription.subscribed ? planConfig?.name || 'Assinatura' : 'Sem Assinatura Ativa'}
                {subscription.subscribed && (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ativo
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {subscription.subscribed
                  ? 'Sua assinatura está ativa'
                  : 'Assine um plano para desbloquear recursos'}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription.subscribed ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Próxima Cobrança</span>
                </div>
                <p className="font-semibold text-foreground">
                  {subscription.subscriptionEnd
                    ? new Date(subscription.subscriptionEnd).toLocaleDateString('pt-BR')
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

            {showManageButton && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleManageSubscription}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Gerenciar Assinatura
              </Button>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              Desbloqueie recursos premium assinando um de nossos planos
            </p>
            <Button
              className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
              onClick={() => onTabChange?.('upgrade')}
            >
              Ver Planos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
