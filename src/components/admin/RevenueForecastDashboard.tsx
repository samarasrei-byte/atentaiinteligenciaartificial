import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  DollarSign,
  Target,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PiggyBank
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  Legend
} from 'recharts';

interface RevenueData {
  month: string;
  actual: number;
  projected: number;
  subscriptions: number;
}

interface ForecastData {
  currentMRR: number;
  projectedMRR: number;
  mrrGrowth: number;
  churnImpact: number;
  annualRecurringRevenue: number;
  projectedARR: number;
  averageRevenuePerUser: number;
  lifetimeValue: number;
  historicalData: RevenueData[];
  forecastData: RevenueData[];
  scenariosBest: number;
  scenariosWorst: number;
  scenariosExpected: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const RevenueForecastDashboard: React.FC = () => {
  const [data, setData] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [forecastMonths, setForecastMonths] = useState('6');

  const fetchForecastData = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      // Fetch all subscriptions
      const { data: allSubs } = await supabase
        .from('subscriptions')
        .select('*');
      
      const activeSubs = allSubs?.filter(s => s.status === 'active') || [];
      const cancelledSubs = allSubs?.filter(s => s.status === 'cancelled') || [];
      
      // Calculate MRR
      const currentMRR = activeSubs.reduce((sum, s) => sum + (s.price_cents / 100), 0);
      
      // Calculate churn rate
      const totalSubs = activeSubs.length + cancelledSubs.length;
      const churnRate = totalSubs > 0 ? cancelledSubs.length / totalSubs : 0;
      const retentionRate = 1 - churnRate;
      
      // Fetch payments for historical data
      const historicalData: RevenueData[] = [];
      const monthlyPayments: { [key: string]: number } = {};
      const monthlySubCounts: { [key: string]: number } = {};
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        
        const { data: payments } = await supabase
          .from('payments')
          .select('amount_cents')
          .eq('status', 'completed')
          .gte('created_at', monthStart.toISOString())
          .lt('created_at', monthEnd.toISOString());
        
        const monthRevenue = (payments || []).reduce((sum, p) => sum + (p.amount_cents / 100), 0);
        
        // Count active subscriptions in that month
        const activeInMonth = allSubs?.filter(s => {
          const created = new Date(s.created_at);
          if (s.status === 'cancelled' && s.updated_at) {
            const cancelled = new Date(s.updated_at);
            return created < monthEnd && cancelled >= monthStart;
          }
          return created < monthEnd;
        }).length || 0;
        
        historicalData.push({
          month: monthNames[date.getMonth()],
          actual: monthRevenue,
          projected: monthRevenue,
          subscriptions: activeInMonth
        });
        
        monthlyPayments[monthKey] = monthRevenue;
        monthlySubCounts[monthKey] = activeInMonth;
      }
      
      // Calculate growth trend (last 3 months average)
      const recentRevenues = historicalData.slice(-3).map(d => d.actual);
      const avgRecentRevenue = recentRevenues.reduce((a, b) => a + b, 0) / 3;
      const olderRevenues = historicalData.slice(-6, -3).map(d => d.actual);
      const avgOlderRevenue = olderRevenues.reduce((a, b) => a + b, 0) / 3 || avgRecentRevenue;
      
      const growthRate = avgOlderRevenue > 0 
        ? (avgRecentRevenue - avgOlderRevenue) / avgOlderRevenue 
        : 0.05; // Default 5% growth if no data
      
      // Generate forecast
      const forecastData: RevenueData[] = [];
      let projectedMRR = currentMRR;
      const numForecastMonths = parseInt(forecastMonths);
      
      for (let i = 1; i <= numForecastMonths; i++) {
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + i);
        
        // Apply growth and churn to projection
        const monthlyGrowth = 1 + (growthRate / 12);
        const monthlyRetention = Math.pow(retentionRate, 1/12);
        
        projectedMRR = projectedMRR * monthlyGrowth * monthlyRetention;
        
        forecastData.push({
          month: monthNames[futureDate.getMonth()],
          actual: 0,
          projected: projectedMRR,
          subscriptions: Math.round(activeSubs.length * Math.pow(monthlyRetention, i))
        });
      }
      
      // Calculate scenarios
      const pessimisticMultiplier = 0.7;
      const optimisticMultiplier = 1.3;
      
      const projectedMRRFinal = forecastData[forecastData.length - 1]?.projected || currentMRR;
      
      // Calculate ARPU and LTV
      const arpu = activeSubs.length > 0 ? currentMRR / activeSubs.length : 0;
      const avgMonthsRetained = retentionRate > 0 ? 1 / (1 - retentionRate) : 12;
      const ltv = arpu * avgMonthsRetained;
      
      setData({
        currentMRR,
        projectedMRR: projectedMRRFinal,
        mrrGrowth: growthRate * 100,
        churnImpact: churnRate * currentMRR,
        annualRecurringRevenue: currentMRR * 12,
        projectedARR: projectedMRRFinal * 12,
        averageRevenuePerUser: arpu,
        lifetimeValue: ltv,
        historicalData,
        forecastData,
        scenariosBest: projectedMRRFinal * optimisticMultiplier,
        scenariosWorst: projectedMRRFinal * pessimisticMultiplier,
        scenariosExpected: projectedMRRFinal
      });
    } catch (error) {
      console.error('Error fetching forecast data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForecastData();
  }, [forecastMonths]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const combinedData = [
    ...data.historicalData.map(d => ({ ...d, type: 'historical' })),
    ...data.forecastData.map(d => ({ ...d, type: 'forecast' }))
  ];

  const growthIsPositive = data.mrrGrowth > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Previsão de Receita
          </h2>
          <p className="text-muted-foreground">Projeção baseada em dados históricos e tendências de churn</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={forecastMonths} onValueChange={setForecastMonths}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 meses</SelectItem>
              <SelectItem value="6">6 meses</SelectItem>
              <SelectItem value="12">12 meses</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchForecastData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">MRR Atual</p>
                <p className="text-2xl font-bold">{formatCurrency(data.currentMRR)}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/20">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className={`flex items-center gap-1 mt-2 text-sm ${growthIsPositive ? 'text-success' : 'text-destructive'}`}>
              {growthIsPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {Math.abs(data.mrrGrowth).toFixed(1)}% tendência
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">MRR Projetado</p>
                <p className="text-2xl font-bold">{formatCurrency(data.projectedMRR)}</p>
              </div>
              <div className="p-3 rounded-xl bg-success/20">
                <Target className="h-5 w-5 text-success" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Em {forecastMonths} meses
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ARR Atual</p>
                <p className="text-2xl font-bold">{formatCurrency(data.annualRecurringRevenue)}</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/20">
                <Wallet className="h-5 w-5 text-accent" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Receita Anual Recorrente
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Impacto Churn</p>
                <p className="text-2xl font-bold text-warning">-{formatCurrency(data.churnImpact)}</p>
              </div>
              <div className="p-3 rounded-xl bg-warning/20">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Perda estimada/mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/20">
                <PiggyBank className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ARPU</p>
                <p className="text-lg font-bold">{formatCurrency(data.averageRevenuePerUser)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">LTV</p>
                <p className="text-lg font-bold">{formatCurrency(data.lifetimeValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ARR Projetado</p>
                <p className="text-lg font-bold">{formatCurrency(data.projectedARR)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Período</p>
                <p className="text-lg font-bold">{forecastMonths} meses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Receita Histórica e Projeção
          </CardTitle>
          <CardDescription>
            Dados históricos (últimos 12 meses) e projeção futura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={combinedData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis 
                  className="text-xs" 
                  tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    formatCurrency(value), 
                    name === 'actual' ? 'Real' : 'Projetado'
                  ]}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorActual)" 
                  name="Real"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="projected" 
                  stroke="hsl(var(--success))" 
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                  name="Projetado"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Cenários de Projeção
          </CardTitle>
          <CardDescription>
            Análise de cenários para o MRR em {forecastMonths} meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingDown className="h-8 w-8 text-destructive mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">Pessimista</p>
                  <p className="text-2xl font-bold text-destructive">
                    {formatCurrency(data.scenariosWorst)}
                  </p>
                  <Badge variant="outline" className="mt-2 bg-destructive/10 text-destructive">
                    -30% do esperado
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Target className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">Esperado</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(data.scenariosExpected)}
                  </p>
                  <Badge variant="outline" className="mt-2 bg-primary/10 text-primary">
                    Base
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-success/5 border-success/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-success mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">Otimista</p>
                  <p className="text-2xl font-bold text-success">
                    {formatCurrency(data.scenariosBest)}
                  </p>
                  <Badge variant="outline" className="mt-2 bg-success/10 text-success">
                    +30% do esperado
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Recomendações para Aumentar Receita
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                Reduzir Churn
              </h4>
              <p className="text-sm text-muted-foreground">
                Impacto mensal do churn: <strong className="text-destructive">{formatCurrency(data.churnImpact)}</strong>. 
                Reduza em 20% e economize <strong className="text-success">{formatCurrency(data.churnImpact * 0.2)}/mês</strong>.
              </p>
            </div>
            
            <div className="p-4 bg-muted/30 rounded-lg border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                Aumentar ARPU
              </h4>
              <p className="text-sm text-muted-foreground">
                ARPU atual: <strong>{formatCurrency(data.averageRevenuePerUser)}</strong>. 
                Aumente em 15% através de upselling e ganhe <strong className="text-success">{formatCurrency(data.averageRevenuePerUser * 0.15)}/usuário</strong>.
              </p>
            </div>
            
            <div className="p-4 bg-muted/30 rounded-lg border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Aumentar Conversão
              </h4>
              <p className="text-sm text-muted-foreground">
                Implemente onboarding melhorado e automações para converter mais trial em pagantes.
              </p>
            </div>
            
            <div className="p-4 bg-muted/30 rounded-lg border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-accent" />
                Expansão de Receita
              </h4>
              <p className="text-sm text-muted-foreground">
                LTV atual: <strong>{formatCurrency(data.lifetimeValue)}</strong>. 
                Adicione serviços complementares para aumentar o valor por cliente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueForecastDashboard;
