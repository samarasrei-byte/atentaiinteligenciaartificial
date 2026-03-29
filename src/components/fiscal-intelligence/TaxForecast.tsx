import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

interface TaxForecastProps {
  companyType?: string;
  taxRegime?: string;
  monthlyRevenue?: number;
  annualRevenue?: number;
  sector?: string;
  employeeCount?: number;
}

export const TaxForecast: React.FC<TaxForecastProps> = ({
  companyType = 'me',
  taxRegime = 'simples_nacional',
  monthlyRevenue = 0,
  annualRevenue = 0,
  sector = 'servicos',
  employeeCount = 0,
}) => {
  const [scenario, setScenario] = useState<'conservative' | 'moderate' | 'optimistic'>('moderate');

  const baseRevenue = monthlyRevenue > 0 ? monthlyRevenue : (annualRevenue > 0 ? annualRevenue / 12 : 5000000); // em centavos

  // Alíquotas efetivas por regime
  const getEffectiveRate = (regime: string, revenue: number): number => {
    if (regime === 'mei' || companyType === 'mei') return 0.05; // ~5% fixo MEI
    if (regime === 'simples_nacional') {
      const annual = revenue * 12;
      if (annual <= 18000000) return 0.06;
      if (annual <= 36000000) return 0.112;
      if (annual <= 72000000) return 0.135;
      if (annual <= 180000000) return 0.16;
      if (annual <= 360000000) return 0.21;
      return 0.33;
    }
    if (regime === 'lucro_presumido') return 0.1633; // ~16.33% médio
    if (regime === 'lucro_real') return 0.34; // ~34% IRPJ+CSLL
    return 0.15;
  };

  // Fatores de crescimento por cenário
  const growthFactors = {
    conservative: { revenue: 1.02, cost: 1.04, label: 'Conservador' },
    moderate: { revenue: 1.05, cost: 1.03, label: 'Moderado' },
    optimistic: { revenue: 1.08, cost: 1.02, label: 'Otimista' },
  };

  // Sazonalidade por setor
  const seasonality: Record<string, number[]> = {
    comercio: [0.85, 0.80, 0.90, 0.95, 1.05, 1.00, 0.95, 0.90, 0.95, 1.00, 1.10, 1.55],
    servicos: [0.90, 0.85, 0.95, 1.00, 1.00, 1.00, 0.95, 0.95, 1.00, 1.05, 1.10, 1.25],
    tecnologia: [0.95, 0.90, 1.00, 1.00, 1.00, 1.05, 1.00, 1.00, 1.05, 1.05, 1.00, 1.00],
    industria: [0.85, 0.80, 0.95, 1.00, 1.05, 1.05, 1.00, 1.00, 1.05, 1.05, 1.10, 1.10],
    alimentacao: [0.90, 0.85, 0.95, 0.95, 1.00, 1.05, 1.10, 1.00, 0.95, 1.00, 1.05, 1.20],
    saude: [1.00, 0.95, 1.00, 1.00, 1.00, 1.00, 1.05, 1.00, 1.00, 1.00, 1.00, 1.00],
    default: [0.95, 0.90, 0.95, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.05, 1.15],
  };

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentMonth = new Date().getMonth();

  const forecastData = useMemo(() => {
    const factor = growthFactors[scenario];
    const sectorSeason = seasonality[sector] || seasonality.default;

    return Array.from({ length: 12 }, (_, i) => {
      const monthIdx = (currentMonth + i) % 12;
      const growthMultiplier = Math.pow(factor.revenue, i / 12);
      const seasonalMultiplier = sectorSeason[monthIdx];
      const projectedRevenue = Math.round(baseRevenue * growthMultiplier * seasonalMultiplier);
      const taxRate = getEffectiveRate(taxRegime, projectedRevenue);
      const projectedTax = Math.round(projectedRevenue * taxRate);
      const employeeCost = employeeCount * 250000 * Math.pow(factor.cost, i / 12); // R$ 2.500 custo médio por funcionário
      const totalCost = Math.round(projectedTax + employeeCost);

      return {
        month: monthNames[monthIdx],
        receita: Math.round(projectedRevenue / 100),
        impostos: Math.round(projectedTax / 100),
        custoTotal: Math.round(totalCost / 100),
        margem: Math.round(((projectedRevenue - totalCost) / projectedRevenue) * 100),
      };
    });
  }, [scenario, baseRevenue, taxRegime, sector, employeeCount, currentMonth]);

  const totalTax12m = forecastData.reduce((sum, d) => sum + d.impostos, 0);
  const totalRevenue12m = forecastData.reduce((sum, d) => sum + d.receita, 0);
  const avgTaxRate = totalRevenue12m > 0 ? ((totalTax12m / totalRevenue12m) * 100).toFixed(1) : '0.0';
  const peakMonth = forecastData.reduce((max, d) => d.impostos > max.impostos ? d : max, forecastData[0]);
  const valleyMonth = forecastData.reduce((min, d) => d.impostos < min.impostos ? d : min, forecastData[0]);

  const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR')}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            Projeção de Impostos 12 Meses
          </h2>
          <p className="text-muted-foreground mt-1">
            Forecast inteligente da carga tributária com sazonalidade do seu setor
          </p>
        </div>
        <Select value={scenario} onValueChange={(v: any) => setScenario(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="conservative">📉 Conservador</SelectItem>
            <SelectItem value="moderate">📊 Moderado</SelectItem>
            <SelectItem value="optimistic">📈 Otimista</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Impostos Projetados (12m)', value: formatCurrency(totalTax12m), icon: DollarSign, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Alíquota Efetiva Média', value: `${avgTaxRate}%`, icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Mês Pico', value: `${peakMonth.month}: ${formatCurrency(peakMonth.impostos)}`, icon: ArrowUpRight, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Mês Baixo', value: `${valleyMonth.month}: ${formatCurrency(valleyMonth.impostos)}`, icon: ArrowDownRight, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                </div>
                <p className="text-lg font-bold text-foreground">{kpi.value}</p>
                <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Gráfico principal */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Projeção Receita vs Impostos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorImpostos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Area type="monotone" dataKey="receita" stroke="hsl(var(--primary))" fill="url(#colorReceita)" name="Receita" strokeWidth={2} />
                <Area type="monotone" dataKey="impostos" stroke="#ef4444" fill="url(#colorImpostos)" name="Impostos" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Margem líquida por mês */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Margem Líquida Projetada (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(v: number) => [`${v}%`, 'Margem']} />
                <Bar dataKey="margem" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Margem %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Insight */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Insight da IA</p>
            <p className="text-xs text-muted-foreground mt-1">
              {parseFloat(avgTaxRate) > 20
                ? `Com alíquota efetiva de ${avgTaxRate}%, recomendamos avaliar a migração para ${taxRegime === 'lucro_real' ? 'Lucro Presumido' : 'Simples Nacional'}. Use o Comparador de Regimes para simular.`
                : `Sua alíquota efetiva de ${avgTaxRate}% está dentro da média do setor. O mês de ${peakMonth.month} será o de maior carga. Planeje seu caixa com antecedência.`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
