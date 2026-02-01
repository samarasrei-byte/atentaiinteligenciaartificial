import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface FinancialOverviewProps {
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  revenueByService: { name: string; value: number; color: string }[];
  partnerDistribution: { name: string; value: number; color: string }[];
  monthlyData: { month: string; revenue: number; costs: number }[];
  period: string;
  onPeriodChange: (value: string) => void;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

export const FinancialOverview: React.FC<FinancialOverviewProps> = ({
  totalRevenue,
  totalCosts,
  netProfit,
  revenueByService,
  partnerDistribution,
  monthlyData,
  period,
  onPeriodChange
}) => {
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';
  const isProfit = netProfit >= 0;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Visão Geral Financeira</h2>
          <p className="text-sm text-muted-foreground">Resumo consolidado de receitas, custos e lucro</p>
        </div>
        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="12m">Últimos 12 meses</SelectItem>
            <SelectItem value="all">Todo período</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total que Entrou</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-600">+12.5% vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Custos</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalCosts)}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600">-5.2% vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${isProfit ? 'from-violet-500/10 to-violet-600/5 border-violet-500/20' : 'from-orange-500/10 to-orange-600/5 border-orange-500/20'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lucro Líquido</p>
                <p className={`text-2xl font-bold ${isProfit ? 'text-violet-600' : 'text-orange-600'}`}>
                  {formatCurrency(netProfit)}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${isProfit ? 'bg-violet-500/10' : 'bg-orange-500/10'}`}>
                <DollarSign className={`h-6 w-6 ${isProfit ? 'text-violet-500' : 'text-orange-500'}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="outline" className={`${isProfit ? 'text-violet-600 border-violet-300' : 'text-orange-600 border-orange-300'}`}>
                Margem: {profitMargin}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5 text-primary" />
              Evolução Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis tickFormatter={(v) => `R$${(v/100).toFixed(0)}`} className="text-xs" />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    name="Receitas"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="costs" 
                    stroke="#ef4444" 
                    fillOpacity={1} 
                    fill="url(#colorCosts)" 
                    name="Custos"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Faturamento por serviço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart className="h-5 w-5 text-primary" />
              Faturamento por Serviço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={revenueByService}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {revenueByService.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por sócio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-5 w-5 text-primary" />
            Distribuição por Sócio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={partnerDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                <YAxis type="category" dataKey="name" width={150} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {partnerDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
