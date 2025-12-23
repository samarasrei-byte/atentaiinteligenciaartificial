import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calculator,
  PiggyBank,
  Receipt,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SimulationData {
  id: string;
  created_at: string;
  monthly_revenue_cents: number;
  pf_tax_cents: number;
  mei_tax_cents: number | null;
  me_simples_tax_cents: number | null;
  lucro_presumido_tax_cents: number | null;
  annual_savings_cents: number;
  recommendation: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export function AutonomoFinancialDashboard() {
  const { user } = useAuth();

  const { data: simulations, isLoading } = useQuery({
    queryKey: ['autonomo-simulations-chart', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('autonomos_simulations')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true })
        .limit(12);

      if (error) throw error;
      return data as SimulationData[];
    },
    enabled: !!user,
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const formatCurrencyShort = (cents: number) => {
    const value = cents / 100;
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}k`;
    }
    return formatCurrency(cents);
  };

  // Process data for charts
  const chartData = simulations?.map((sim, index) => {
    const date = new Date(sim.created_at);
    return {
      name: `${date.getDate()}/${date.getMonth() + 1}`,
      receita: sim.monthly_revenue_cents / 100,
      impostos_pf: sim.pf_tax_cents / 100,
      impostos_mei: (sim.mei_tax_cents || 0) / 100,
      impostos_me: (sim.me_simples_tax_cents || 0) / 100,
      economia: sim.annual_savings_cents / 100,
    };
  }) || [];

  // Calculate totals
  const totalRevenue = simulations?.reduce((acc, sim) => acc + sim.monthly_revenue_cents, 0) || 0;
  const totalTaxes = simulations?.reduce((acc, sim) => acc + sim.pf_tax_cents, 0) || 0;
  const totalSavings = simulations?.reduce((acc, sim) => acc + sim.annual_savings_cents, 0) || 0;
  const avgMonthlyRevenue = simulations?.length ? totalRevenue / simulations.length : 0;

  // Tax distribution for pie chart
  const taxDistribution = simulations?.length ? [
    { name: 'INSS', value: totalTaxes * 0.35 },
    { name: 'IR', value: totalTaxes * 0.45 },
    { name: 'ISS', value: totalTaxes * 0.20 },
  ] : [];

  // Calculate trend
  const recentSims = simulations?.slice(-3) || [];
  const olderSims = simulations?.slice(-6, -3) || [];
  const recentAvg = recentSims.reduce((acc, s) => acc + s.monthly_revenue_cents, 0) / (recentSims.length || 1);
  const olderAvg = olderSims.reduce((acc, s) => acc + s.monthly_revenue_cents, 0) / (olderSims.length || 1);
  const trend = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!simulations?.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma simulação ainda</h3>
          <p className="text-muted-foreground">
            Faça sua primeira simulação para ver suas métricas financeiras aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Média Mensal</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {formatCurrency(avgMonthlyRevenue)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {trend >= 0 ? (
                    <>
                      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs text-emerald-500">+{trend.toFixed(1)}%</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-4 w-4 text-destructive" />
                      <span className="text-xs text-destructive">{trend.toFixed(1)}%</span>
                    </>
                  )}
                  <span className="text-xs text-muted-foreground">vs período anterior</span>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-primary/20">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/10 to-transparent border-destructive/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Impostos (PF)</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {formatCurrency(totalTaxes)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {simulations?.length} simulações
                </p>
              </div>
              <div className="p-2 rounded-lg bg-destructive/20">
                <Receipt className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Economia Potencial Anual</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {formatCurrency(totalSavings)}
                </p>
                <Badge className="mt-2 bg-emerald-500/20 text-emerald-700 border-0">
                  Otimizando estrutura
                </Badge>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <PiggyBank className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Carga Tributária Média</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {avgMonthlyRevenue > 0 
                    ? ((totalTaxes / totalRevenue) * 100).toFixed(1) 
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  do faturamento total
                </p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Calculator className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Evolution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-primary" />
              Evolução de Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value * 100)}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="receita" 
                    name="Receita"
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tax Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calculator className="h-5 w-5 text-primary" />
              Comparativo de Impostos por Regime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value * 100)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="impostos_pf" name="PF" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="impostos_mei" name="MEI" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="impostos_me" name="ME Simples" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Savings Evolution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PiggyBank className="h-5 w-5 text-emerald-500" />
              Economia Acumulada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value * 100)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="economia" 
                    name="Economia Anual"
                    stroke="hsl(142, 76%, 36%)" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(142, 76%, 36%)' }}
                    fill="url(#savingsGradient)"
                  />
                  <defs>
                    <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tax Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-5 w-5 text-primary" />
              Distribuição de Impostos (PF)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taxDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {taxDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
