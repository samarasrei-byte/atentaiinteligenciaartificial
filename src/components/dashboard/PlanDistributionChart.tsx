import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PLANS, formatPrice } from '@/lib/plans';

interface PlanData {
  name: string;
  value: number;
  revenue: number;
  color: string;
}

interface PlanDistributionChartProps {
  simulatorCount?: number;
  autonomoCount?: number;
  premiumCount?: number;
  contadorCount?: number;
  // Legacy props for backwards compatibility
  clarityCount?: number;
  controlCount?: number;
  performanceCount?: number;
}

export function PlanDistributionChart({ 
  simulatorCount = 0, 
  autonomoCount = 0, 
  premiumCount = 0, 
  contadorCount = 0,
  // Map legacy props if provided
  clarityCount = 0,
  controlCount = 0,
  performanceCount = 0,
}: PlanDistributionChartProps) {
  // Use legacy props if provided and new props are 0
  const actualSimulator = simulatorCount || clarityCount;
  const actualAutonomo = autonomoCount;
  const actualPremium = premiumCount || controlCount;
  const actualContador = contadorCount || performanceCount;

  const data: PlanData[] = [
    { 
      name: PLANS.simulator.name, 
      value: actualSimulator, 
      revenue: actualSimulator * PLANS.simulator.price,
      color: 'hsl(var(--info))' 
    },
    { 
      name: PLANS.autonomo.name, 
      value: actualAutonomo, 
      revenue: actualAutonomo * PLANS.autonomo.price,
      color: 'hsl(142 76% 36%)' 
    },
    { 
      name: PLANS.premium.name, 
      value: actualPremium, 
      revenue: actualPremium * PLANS.premium.price,
      color: 'hsl(var(--primary))' 
    },
    { 
      name: PLANS.contador.name, 
      value: actualContador, 
      revenue: actualContador * PLANS.contador.price,
      color: 'hsl(var(--accent))' 
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-4 border-t border-border">
          {data.map((plan) => (
            <div key={plan.name} className="text-center">
              <div 
                className="w-3 h-3 rounded-full mx-auto mb-1"
                style={{ backgroundColor: plan.color }}
              />
              <p className="text-lg font-bold text-foreground">{plan.value}</p>
              <p className="text-xs text-muted-foreground truncate">{plan.name}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
