import { useState } from 'react';
import { Gift, TrendingUp, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCashback } from '@/hooks/useCashback';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function CashbackCard() {
  const { subscription } = useAuth();
  const isSubscribed = subscription.subscribed;
  const { cashback, serviceUsage, loading, cashbackTiers, claimCashback } = useCashback();
  const [claiming, setClaiming] = useState(false);

  if (!isSubscribed) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Programa de Cashback</CardTitle>
          </div>
          <CardDescription>
            Assine um plano para ganhar cashback usando múltiplos serviços
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cashbackTiers.map((tier) => (
              <div key={tier.minServices} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {tier.minServices}+ serviços no mês
                </span>
                <Badge variant="outline" className="bg-primary/10">
                  {tier.percent}% cashback
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-2/3 mt-2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const totalServicesUsed = serviceUsage
    ? Object.values(serviceUsage).filter((v) => v > 0).length
    : 0;

  const currentTierIndex = cashbackTiers.findIndex(
    (tier) => totalServicesUsed < tier.minServices
  );
  const nextTier = currentTierIndex >= 0 ? cashbackTiers[currentTierIndex] : null;
  const progressToNextTier = nextTier
    ? (totalServicesUsed / nextTier.minServices) * 100
    : 100;

  const handleClaim = async () => {
    if (!cashback?.id) return;
    
    setClaiming(true);
    const success = await claimCashback(cashback.id);
    setClaiming(false);
    
    if (success) {
      toast.success('Cashback resgatado com sucesso!', {
        description: 'O valor será creditado na sua próxima fatura.',
      });
    } else {
      toast.error('Erro ao resgatar cashback');
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden relative">
      {cashback && cashback.cashback_amount_cents > 0 && !cashback.is_claimed && (
        <div className="absolute top-0 right-0">
          <Badge className="rounded-none rounded-bl-lg bg-success text-success-foreground">
            <Sparkles className="h-3 w-3 mr-1" />
            Cashback Disponível!
          </Badge>
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Programa de Cashback</CardTitle>
        </div>
        <CardDescription>
          Ganhe cashback usando múltiplos serviços no mesmo mês
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
          <div>
            <p className="text-sm text-muted-foreground">Serviços usados este mês</p>
            <p className="text-2xl font-bold">{totalServicesUsed}/5</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Seu cashback</p>
            <p className="text-2xl font-bold text-primary">
              {cashback?.cashback_percent || 0}%
            </p>
          </div>
        </div>

        {/* Service Usage Breakdown */}
        {serviceUsage && (
          <div className="grid grid-cols-5 gap-2">
            {[
              { key: 'consultations', label: 'Consultas', value: serviceUsage.consultations },
              { key: 'certificates', label: 'Certidões', value: serviceUsage.certificates },
              { key: 'ir_requests', label: 'IR', value: serviceUsage.ir_requests },
              { key: 'company_openings', label: 'Abertura', value: serviceUsage.company_openings },
              { key: 'credit_repairs', label: 'Limpa Nome', value: serviceUsage.credit_repairs },
            ].map((service) => (
              <div
                key={service.key}
                className={`text-center p-2 rounded-lg ${
                  service.value > 0
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {service.value > 0 ? (
                  <CheckCircle className="h-4 w-4 mx-auto mb-1" />
                ) : (
                  <Clock className="h-4 w-4 mx-auto mb-1 opacity-50" />
                )}
                <p className="text-xs truncate">{service.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Progress to Next Tier */}
        {nextTier && totalServicesUsed < 5 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Próximo nível: {nextTier.percent}% cashback
              </span>
              <span className="font-medium">
                +{nextTier.minServices - totalServicesUsed} serviço(s)
              </span>
            </div>
            <Progress value={progressToNextTier} className="h-2" />
          </div>
        )}

        {/* Cashback Amount */}
        {cashback && cashback.cashback_amount_cents > 0 && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor do Cashback</p>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(cashback.cashback_amount_cents)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {cashback.is_claimed ? (
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle className="h-3 w-3" />
                      Resgatado
                    </span>
                  ) : cashback.expires_at ? (
                    `Expira em ${new Date(cashback.expires_at).toLocaleDateString('pt-BR')}`
                  ) : null}
                </p>
              </div>
              {!cashback.is_claimed && (
                <Button 
                  onClick={handleClaim} 
                  disabled={claiming}
                  className="bg-primary hover:bg-primary/90"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {claiming ? 'Resgatando...' : 'Resgatar'}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Tiers Info */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Níveis de cashback:</p>
          <div className="flex flex-wrap gap-2">
            {cashbackTiers.map((tier) => (
              <Badge
                key={tier.minServices}
                variant={totalServicesUsed >= tier.minServices ? 'default' : 'outline'}
                className={totalServicesUsed >= tier.minServices ? 'bg-primary' : ''}
              >
                {tier.minServices}+ serviços = {tier.percent}%
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
