import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Loader2,
  FileText,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaxSimulation {
  id: string;
  created_at: string;
  revenue_cents: number;
  tax_type: string;
  total_tax_cents: number;
  icms_cents: number | null;
  iss_cents: number | null;
  pis_cents: number | null;
  cofins_cents: number | null;
  ibs_cents: number | null;
  cbs_cents: number | null;
  is_cents: number | null;
}

export const SimulationHistory = () => {
  const { user } = useAuth();
  const [simulations, setSimulations] = useState<TaxSimulation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const fetchSimulations = async (showRefreshing = false) => {
    if (!user) return;
    
    if (showRefreshing) setIsRefreshing(true);
    
    try {
      const { data, error } = await supabase
        .from('tax_simulations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSimulations(data || []);
    } catch (error) {
      console.error('Error fetching simulations:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSimulations();
  }, [user]);

  const getTaxTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      comparison: 'Comparação de Impostos',
      pf_pj: 'Decisão PF/PJ',
      economy: 'Cálculo de Economia',
      locacao: 'Simulação de Locação',
    };
    return types[type] || type;
  };

  const getTaxTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      comparison: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
      pf_pj: 'bg-violet-500/20 text-violet-600 border-violet-500/30',
      economy: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
      locacao: 'bg-rose-500/20 text-rose-600 border-rose-500/30',
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  };

  const calculateTaxRate = (simulation: TaxSimulation): string => {
    if (simulation.revenue_cents === 0) return '0';
    return ((simulation.total_tax_cents / simulation.revenue_cents) * 100).toFixed(2);
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <History className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Histórico de Simulações</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Acompanhe a evolução das suas decisões tributárias
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSimulations(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {simulations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhuma simulação ainda
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Faça sua primeira simulação para começar a acompanhar seu histórico tributário.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="divide-y divide-border">
              {simulations.map((simulation) => (
                <div
                  key={simulation.id}
                  className="p-4 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getTaxTypeBadgeColor(simulation.tax_type)}>
                          {getTaxTypeLabel(simulation.tax_type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(simulation.created_at), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Faturamento</p>
                          <p className="text-sm font-semibold text-foreground">
                            {formatCurrency(simulation.revenue_cents)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Imposto Total</p>
                          <p className="text-sm font-semibold text-foreground">
                            {formatCurrency(simulation.total_tax_cents)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Alíquota Efetiva</p>
                          <div className="flex items-center gap-1">
                            {parseFloat(calculateTaxRate(simulation)) > 20 ? (
                              <TrendingUp className="h-3 w-3 text-red-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-green-500" />
                            )}
                            <p className={`text-sm font-semibold ${
                              parseFloat(calculateTaxRate(simulation)) > 20 
                                ? 'text-red-500' 
                                : 'text-green-500'
                            }`}>
                              {calculateTaxRate(simulation)}%
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Tax Breakdown (collapsed) */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {simulation.icms_cents && simulation.icms_cents > 0 && (
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            ICMS: {formatCurrency(simulation.icms_cents)}
                          </span>
                        )}
                        {simulation.iss_cents && simulation.iss_cents > 0 && (
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            ISS: {formatCurrency(simulation.iss_cents)}
                          </span>
                        )}
                        {simulation.pis_cents && simulation.pis_cents > 0 && (
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            PIS: {formatCurrency(simulation.pis_cents)}
                          </span>
                        )}
                        {simulation.cofins_cents && simulation.cofins_cents > 0 && (
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            COFINS: {formatCurrency(simulation.cofins_cents)}
                          </span>
                        )}
                        {simulation.ibs_cents && simulation.ibs_cents > 0 && (
                          <span className="text-xs bg-cyan-500/10 text-cyan-600 px-2 py-1 rounded">
                            IBS: {formatCurrency(simulation.ibs_cents)}
                          </span>
                        )}
                        {simulation.cbs_cents && simulation.cbs_cents > 0 && (
                          <span className="text-xs bg-cyan-500/10 text-cyan-600 px-2 py-1 rounded">
                            CBS: {formatCurrency(simulation.cbs_cents)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
