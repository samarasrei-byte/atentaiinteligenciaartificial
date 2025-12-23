import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { STRIPE_PLANS, formatPrice } from '@/lib/stripe';

interface PlanData {
  name: string;
  value: number;
  revenue: number;
  color: string;
}

interface PlanDistributionChartProps {
  simulatorCount: number;
  premiumCount: number;
  contadorCount: number;
}

export function PlanDistributionChart({ simulatorCount, premiumCount, contadorCount }: PlanDistributionChartProps) {
  const data: PlanData[] = [
    { 
      name: 'Simulador', 
      value: simulatorCount, 
      revenue: simulatorCount * STRIPE_PLANS.simulator.price,
      color: 'hsl(var(--primary))' 
    },
    { 
      name: 'AtentAI Premium', 
      value: premiumCount, 
      revenue: premiumCount * STRIPE_PLANS.premium.price,
      color: 'hsl(var(--info))' 
    },
    { 
      name: 'Contador Premium', 
      value: contadorCount, 
      revenue: contadorCount * STRIPE_PLANS.contador.price,
      color: 'hsl(var(--success))' 
    },
  ].filter(d => d.value > 0);

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} assinantes ({Math.round((data.value / total) * 100)}%)
          </p>
          <p className="text-sm text-success font-medium">
            Receita: {formatPrice(data.revenue)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (total === 0) {
    return (
      <Card className="bg-card border-border shadow-soft">
        <CardHeader>
          <CardTitle>Distribuição de Planos</CardTitle>
          <CardDescription>Nenhuma assinatura ativa</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Aguardando dados...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-soft">
      <CardHeader>
        <CardTitle>Distribuição de Planos</CardTitle>
        <CardDescription>
          {total} assinaturas ativas • Receita: {formatPrice(totalRevenue)}/mês
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    className="transition-opacity hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Detalhes dos Planos */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
          {data.map((plan) => (
            <div key={plan.name} className="text-center">
              <div 
                className="w-3 h-3 rounded-full mx-auto mb-1"
                style={{ backgroundColor: plan.color }}
              />
              <p className="text-lg font-bold text-foreground">{plan.value}</p>
              <p className="text-xs text-muted-foreground">{plan.name}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
