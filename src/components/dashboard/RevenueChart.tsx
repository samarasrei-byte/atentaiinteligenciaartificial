import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface RevenueDataPoint {
  month: string;
  receita: number;
  assinaturas: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  title?: string;
  description?: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  title = 'Receita Mensal',
  description = 'Evolução da receita nos últimos meses',
}) => {
  return (
    <Card className="bg-card border-border shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAssinaturas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [formatCurrency(value), name === 'receita' ? 'Receita' : 'Assinaturas']}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Area 
              type="monotone" 
              dataKey="receita" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorReceita)" 
            />
            <Area 
              type="monotone" 
              dataKey="assinaturas" 
              stroke="hsl(var(--success))" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorAssinaturas)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
