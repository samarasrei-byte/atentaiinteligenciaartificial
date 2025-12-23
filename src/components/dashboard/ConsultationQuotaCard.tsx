import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import { useMonthlyConsultations } from '@/hooks/useMonthlyConsultations';
import { Skeleton } from '@/components/ui/skeleton';

export function ConsultationQuotaCard() {
  const { used, limit, remaining, periodStart, periodEnd, isLoading, error } = useMonthlyConsultations();

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-24 mt-4" />
        </CardContent>
      </Card>
    );
  }

  if (limit === 0) {
    return null; // Don't show for plans without consultation quota
  }

  if (error) {
    return (
      <Card className="bg-destructive/5 border-destructive/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const usagePercent = Math.round((used / limit) * 100);
  const isLow = remaining === 1;
  const isEmpty = remaining === 0;

  const formatDateRange = () => {
    const startStr = periodStart.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    const endStr = periodEnd.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    return `${startStr} - ${endStr}`;
  };

  return (
    <Card className={`border ${isEmpty ? 'bg-destructive/5 border-destructive/20' : isLow ? 'bg-accent/5 border-accent/20' : 'bg-success/5 border-success/20'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Consultas com Contador
          </CardTitle>
          {isEmpty ? (
            <Badge variant="destructive">Esgotado</Badge>
          ) : isLow ? (
            <Badge className="bg-accent">Última consulta</Badge>
          ) : (
            <Badge className="bg-success">Disponível</Badge>
          )}
        </div>
        <CardDescription className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDateRange()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Consultas utilizadas</span>
            <span className="font-medium text-foreground">{used} de {limit}</span>
          </div>
          <Progress 
            value={usagePercent} 
            className={`h-3 ${isEmpty ? '[&>div]:bg-destructive' : isLow ? '[&>div]:bg-accent' : '[&>div]:bg-success'}`}
          />
        </div>

        <div className={`p-4 rounded-lg ${isEmpty ? 'bg-destructive/10' : 'bg-muted/30'}`}>
          <div className="flex items-center gap-2">
            {isEmpty ? (
              <>
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium text-foreground">Limite atingido</p>
                  <p className="text-sm text-muted-foreground">
                    Suas consultas mensais foram utilizadas. Renovação em {periodEnd.toLocaleDateString('pt-BR')}.
                  </p>
                </div>
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="font-medium text-foreground">
                    {remaining} {remaining === 1 ? 'consulta restante' : 'consultas restantes'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Agende uma consulta com contador especializado
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
