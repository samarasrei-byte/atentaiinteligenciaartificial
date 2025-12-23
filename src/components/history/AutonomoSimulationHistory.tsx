import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  History, 
  Trash2, 
  Download, 
  TrendingUp, 
  User, 
  Crown, 
  Building2,
  Calendar,
  MapPin
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { exportAutonomoPdf } from '@/lib/exportAutonomoPdf';

interface SimulationRecord {
  id: string;
  profession: string;
  profession_category: string;
  monthly_revenue_cents: number;
  monthly_expenses_cents: number;
  state: string;
  city: string | null;
  recommendation: string;
  pf_tax_cents: number;
  mei_tax_cents: number | null;
  me_simples_tax_cents: number | null;
  lucro_presumido_tax_cents: number | null;
  annual_savings_cents: number;
  notes: string | null;
  created_at: string;
}

export const AutonomoSimulationHistory: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: simulations, isLoading } = useQuery({
    queryKey: ['autonomos-simulations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('autonomos_simulations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as SimulationRecord[];
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('autonomos_simulations')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autonomos-simulations'] });
      toast({ title: 'Simulação excluída com sucesso' });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Erro ao excluir simulação' });
    },
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const getRecommendationBadge = (recommendation: string) => {
    const lower = recommendation.toLowerCase();
    if (lower.includes('mei')) {
      return { label: 'MEI', icon: Crown, variant: 'default' as const };
    } else if (lower.includes('simples')) {
      return { label: 'ME Simples', icon: Building2, variant: 'secondary' as const };
    } else if (lower.includes('presumido')) {
      return { label: 'Lucro Presumido', icon: Building2, variant: 'outline' as const };
    }
    return { label: 'PF', icon: User, variant: 'outline' as const };
  };

  const handleExportPdf = (simulation: SimulationRecord) => {
    exportAutonomoPdf(simulation);
    toast({ title: 'PDF gerado com sucesso!' });
  };

  if (!user) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8 text-center text-muted-foreground">
          Faça login para ver seu histórico de simulações
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Histórico de Simulações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Histórico de Simulações
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!simulations || simulations.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma simulação realizada ainda</p>
            <p className="text-sm">Faça sua primeira simulação para ver aqui</p>
          </div>
        ) : (
          <div className="space-y-4">
            {simulations.map((sim) => {
              const badge = getRecommendationBadge(sim.recommendation);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={sim.id}
                  className="p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-foreground">
                          {sim.profession}
                        </h4>
                        <Badge variant={badge.variant} className="text-xs">
                          <BadgeIcon className="h-3 w-3 mr-1" />
                          {badge.label}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(sim.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {sim.state}
                        </span>
                        <span>
                          Faturamento: {formatCurrency(sim.monthly_revenue_cents)}/mês
                        </span>
                      </div>

                      {sim.annual_savings_cents > 0 && (
                        <div className="flex items-center gap-1 text-emerald-600">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Economia: {formatCurrency(sim.annual_savings_cents)}/ano
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportPdf(sim)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(sim.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
