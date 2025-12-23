import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  BarChart3,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Sparkles
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';

interface SimulationData {
  id: string;
  created_at: string;
  revenue_cents: number;
  total_tax_cents: number;
  tax_type: string;
  pis_cents: number | null;
  cofins_cents: number | null;
  icms_cents: number | null;
  iss_cents: number | null;
  ibs_cents: number | null;
  cbs_cents: number | null;
}

interface MonthlyMetric {
  month: string;
  monthLabel: string;
  savingsTotal: number;
  simulationsCount: number;
  avgSavingsPerSimulation: number;
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
};

const formatCompactCurrency = (cents: number) => {
  const value = cents / 100;
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1)}K`;
  }
  return formatCurrency(cents);
};

export function SavingsMetricsDashboard() {
  const { user } = useAuth();
  const [simulations, setSimulations] = useState<SimulationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyMetric[]>([]);

  useEffect(() => {
    if (user) {
      fetchSimulations();
    }
  }, [user]);

  const fetchSimulations = async () => {
    try {
      const { data, error } = await supabase
        .from('tax_simulations')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setSimulations(data || []);
      processMonthlyData(data || []);
    } catch (error) {
      console.error('Error fetching simulations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processMonthlyData = (data: SimulationData[]) => {
    const monthlyMap = new Map<string, { savings: number; count: number }>();

    data.forEach((sim) => {
      const date = new Date(sim.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // Calculate savings (difference between current taxes and new IVA)
      const currentTaxes = (sim.pis_cents || 0) + (sim.cofins_cents || 0) + (sim.icms_cents || 0) + (sim.iss_cents || 0);
      const newTaxes = (sim.ibs_cents || 0) + (sim.cbs_cents || 0);
      const savings = Math.max(0, currentTaxes - newTaxes);

      const existing = monthlyMap.get(monthKey) || { savings: 0, count: 0 };
      monthlyMap.set(monthKey, {
        savings: existing.savings + savings,
        count: existing.count + 1,
      });
    });

    const months = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Last 6 months
      .map(([month, data]) => ({
        month,
        monthLabel: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short' }),
        savingsTotal: data.savings,
        simulationsCount: data.count,
        avgSavingsPerSimulation: data.count > 0 ? Math.round(data.savings / data.count) : 0,
      }));

    setMonthlyData(months);
  };

  // Calculate summary metrics
  const totalSavings = simulations.reduce((acc, sim) => {
    const currentTaxes = (sim.pis_cents || 0) + (sim.cofins_cents || 0) + (sim.icms_cents || 0) + (sim.iss_cents || 0);
    const newTaxes = (sim.ibs_cents || 0) + (sim.cbs_cents || 0);
    return acc + Math.max(0, currentTaxes - newTaxes);
  }, 0);

  const avgSavingsPercentage = simulations.length > 0
    ? simulations.reduce((acc, sim) => {
        const currentTaxes = (sim.pis_cents || 0) + (sim.cofins_cents || 0) + (sim.icms_cents || 0) + (sim.iss_cents || 0);
        const newTaxes = (sim.ibs_cents || 0) + (sim.cbs_cents || 0);
        if (currentTaxes === 0) return acc;
        return acc + ((currentTaxes - newTaxes) / currentTaxes) * 100;
      }, 0) / simulations.length
    : 0;

  const lastMonthSavings = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].savingsTotal : 0;
  const previousMonthSavings = monthlyData.length > 1 ? monthlyData[monthlyData.length - 2].savingsTotal : 0;
  const monthOverMonthChange = previousMonthSavings > 0 
    ? ((lastMonthSavings - previousMonthSavings) / previousMonthSavings) * 100 
    : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground capitalize">{label}</p>
          <p className="text-sm text-success font-medium">
            Economia: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-5">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (simulations.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhuma simulação ainda
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Faça sua primeira simulação tributária para começar a acompanhar suas métricas de economia.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-success/10 to-emerald-500/5 border-success/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Economia Total</p>
                <p className="text-2xl font-bold text-success mt-1">
                  {formatCompactCurrency(totalSavings)}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-success/10">
                <PiggyBank className="h-5 w-5 text-success" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Baseado em {simulations.length} simulações
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Economia Média</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {avgSavingsPercentage.toFixed(1)}%
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Redução média de impostos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Este Mês</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {formatCompactCurrency(lastMonthSavings)}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-info/10">
                <Calendar className="h-5 w-5 text-info" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {monthOverMonthChange >= 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">+{monthOverMonthChange.toFixed(0)}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-destructive" />
                  <span className="text-xs text-destructive">{monthOverMonthChange.toFixed(0)}%</span>
                </>
              )}
              <span className="text-xs text-muted-foreground">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Simulações</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {simulations.length}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-accent/10">
                <BarChart3 className="h-5 w-5 text-accent" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total de análises realizadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {monthlyData.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Evolução da Economia
                </CardTitle>
                <CardDescription>
                  Economia tributária identificada nos últimos 6 meses
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-success border-success/30">
                <TrendingUp className="h-3 w-3 mr-1" />
                {avgSavingsPercentage > 0 ? '+' : ''}{avgSavingsPercentage.toFixed(1)}% média
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="monthLabel" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => formatCompactCurrency(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="savingsTotal"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    fill="url(#savingsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Breakdown */}
      {monthlyData.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Detalhamento Mensal</CardTitle>
            <CardDescription>Economia e simulações por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="monthLabel" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    formatter={(value: number) => [value, 'Simulações']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar 
                    dataKey="simulationsCount" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
