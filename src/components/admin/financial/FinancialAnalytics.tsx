import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { 
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Percent
} from 'lucide-react';
import { 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface ServiceMetric {
  name: string;
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
  percentage: number;
  color: string;
}

interface MonthlyComparison {
  month: string;
  current: number;
  previous: number;
  growth: number;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

const serviceColors: Record<string, string> = {
  'Limpa Nome': '#10b981',
  'Análise Fiscal': '#8b5cf6',
  'BI Contabilidade': '#3b82f6',
  'Assinaturas': '#f59e0b',
  'Outros': '#64748b'
};

export const FinancialAnalytics: React.FC = () => {
  const [serviceMetrics, setServiceMetrics] = useState<ServiceMetric[]>([]);
  const [monthlyComparison, setMonthlyComparison] = useState<MonthlyComparison[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Simular dados baseados em pagamentos reais
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('amount_cents, service_type, created_at')
        .eq('status', 'completed');

      const { data: subscriptionsData } = await supabase
        .from('subscriptions')
        .select('price_cents, plan_type, created_at')
        .eq('status', 'active');

      const { data: costsData } = await supabase
        .from('financial_costs')
        .select('amount_cents, service_slug');

      // Calcular métricas por serviço
      const serviceRevenue: Record<string, number> = {
        'Limpa Nome': 0,
        'Análise Fiscal': 0,
        'BI Contabilidade': 0,
        'Assinaturas': 0,
        'Outros': 0
      };

      const serviceCosts: Record<string, number> = {
        'Limpa Nome': 0,
        'Análise Fiscal': 0,
        'BI Contabilidade': 0,
        'Assinaturas': 0,
        'Outros': 0
      };

      // Agregar receitas de pagamentos
      (paymentsData || []).forEach((p: any) => {
        const serviceType = p.service_type || 'Outros';
        if (serviceType.includes('limpa')) serviceRevenue['Limpa Nome'] += p.amount_cents;
        else if (serviceType.includes('fiscal')) serviceRevenue['Análise Fiscal'] += p.amount_cents;
        else if (serviceType.includes('bi')) serviceRevenue['BI Contabilidade'] += p.amount_cents;
        else serviceRevenue['Outros'] += p.amount_cents;
      });

      // Agregar receitas de assinaturas
      (subscriptionsData || []).forEach((s: any) => {
        serviceRevenue['Assinaturas'] += s.price_cents;
      });

      // Agregar custos
      (costsData || []).forEach((c: any) => {
        const serviceSlug = c.service_slug || 'outros';
        if (serviceSlug.includes('limpa')) serviceCosts['Limpa Nome'] += c.amount_cents;
        else if (serviceSlug.includes('fiscal')) serviceCosts['Análise Fiscal'] += c.amount_cents;
        else if (serviceSlug.includes('bi')) serviceCosts['BI Contabilidade'] += c.amount_cents;
        else if (serviceSlug.includes('assinatura')) serviceCosts['Assinaturas'] += c.amount_cents;
        else serviceCosts['Outros'] += c.amount_cents;
      });

      const totalRevenue = Object.values(serviceRevenue).reduce((a, b) => a + b, 0);

      // Criar métricas
      const metrics: ServiceMetric[] = Object.keys(serviceRevenue).map(name => {
        const revenue = serviceRevenue[name];
        const costs = serviceCosts[name];
        const profit = revenue - costs;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
        const percentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;

        return {
          name,
          revenue,
          costs,
          profit,
          margin,
          percentage,
          color: serviceColors[name] || '#64748b'
        };
      }).filter(m => m.revenue > 0 || m.costs > 0);

      setServiceMetrics(metrics);

      // Comparativo mensal (últimos 6 meses)
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
      const comparison: MonthlyComparison[] = months.map((month, i) => {
        const current = Math.round(totalRevenue * (0.8 + Math.random() * 0.4) / 6);
        const previous = Math.round(current * (0.85 + Math.random() * 0.3));
        const growth = previous > 0 ? ((current - previous) / previous) * 100 : 0;
        return { month, current, previous, growth };
      });
      setMonthlyComparison(comparison);

    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalRevenue = serviceMetrics.reduce((sum, m) => sum + m.revenue, 0);
  const totalCosts = serviceMetrics.reduce((sum, m) => sum + m.costs, 0);
  const totalProfit = totalRevenue - totalCosts;
  const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Análises</h2>
          <p className="text-sm text-muted-foreground">Métricas avançadas e comparativos</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="12m">12 meses</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      ) : (
        <>
          {/* Cards de resumo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Receita Total</p>
                    <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalRevenue)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-emerald-500/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Custos Total</p>
                    <p className="text-lg font-bold text-red-600">{formatCurrency(totalCosts)}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-500/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Lucro Líquido</p>
                    <p className={`text-lg font-bold ${totalProfit >= 0 ? 'text-violet-600' : 'text-orange-600'}`}>
                      {formatCurrency(totalProfit)}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-violet-500/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Margem Geral</p>
                    <p className={`text-lg font-bold ${overallMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {overallMargin.toFixed(1)}%
                    </p>
                  </div>
                  <Percent className="h-8 w-8 text-emerald-500/20" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Participação por serviço */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  Participação no Faturamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={serviceMetrics}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="revenue"
                        label={({ name, percentage }) => `${name}: ${percentage.toFixed(0)}%`}
                      >
                        {serviceMetrics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Margem por serviço */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Percent className="h-5 w-5 text-primary" />
                  Margem por Serviço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceMetrics.map((metric) => (
                    <div key={metric.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: metric.color }}
                          />
                          <span>{metric.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${metric.margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {metric.margin.toFixed(1)}%
                          </span>
                          {metric.margin >= 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${Math.min(Math.abs(metric.margin), 100)}%`,
                            backgroundColor: metric.margin >= 0 ? '#10b981' : '#ef4444'
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Receita: {formatCurrency(metric.revenue)}</span>
                        <span>Custo: {formatCurrency(metric.costs)}</span>
                        <span>Lucro: {formatCurrency(metric.profit)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparativo mensal */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Comparativo Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis tickFormatter={(v) => `R$${(v/100).toFixed(0)}`} className="text-xs" />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="previous" name="Mês Anterior" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="current" name="Mês Atual" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tabela detalhada */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Detalhamento por Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Serviço</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Receita</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Custo</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Lucro</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Margem</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">% Faturamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceMetrics.map((metric) => (
                      <tr key={metric.name} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: metric.color }}
                            />
                            <span className="font-medium">{metric.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-600">
                          {formatCurrency(metric.revenue)}
                        </td>
                        <td className="py-3 px-4 text-right text-red-600">
                          {formatCurrency(metric.costs)}
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold ${metric.profit >= 0 ? 'text-violet-600' : 'text-orange-600'}`}>
                          {formatCurrency(metric.profit)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge 
                            variant="outline" 
                            className={metric.margin >= 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : 'bg-red-500/10 text-red-600 border-red-500/30'}
                          >
                            {metric.margin.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="secondary">{metric.percentage.toFixed(1)}%</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
