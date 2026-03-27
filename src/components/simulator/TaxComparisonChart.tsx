import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimulationResult, formatCurrency } from '@/lib/taxData';
import { TransitionYear } from '@/components/simulator/YearSelector';

interface TaxComparisonChartProps {
  result: SimulationResult;
  selectedYear: TransitionYear;
}

const COLORS = {
  before: [
    'hsl(var(--destructive) / 0.95)',
    'hsl(var(--destructive) / 0.8)',
    'hsl(var(--destructive) / 0.65)',
    'hsl(var(--destructive) / 0.5)',
    'hsl(var(--destructive) / 0.35)',
  ],
  after: [
    'hsl(var(--primary) / 0.95)',
    'hsl(var(--primary) / 0.8)',
    'hsl(var(--primary) / 0.65)',
  ],
};

export const TaxComparisonChart: React.FC<TaxComparisonChartProps> = ({ result, selectedYear }) => {
  // Bar chart data - comparison
  const barData = [
    {
      name: 'Sistema Atual',
      total: result.beforeTaxes.total,
      fill: 'hsl(var(--destructive))',
    },
    {
      name: `Reforma ${selectedYear}`,
      total: result.afterTaxes.total,
      fill: 'hsl(var(--primary))',
    },
  ];

  // Pie chart data - before
  const beforePieData = [
    { name: 'ICMS', value: result.beforeTaxes.icms, color: COLORS.before[0] },
    { name: 'ISS', value: result.beforeTaxes.iss, color: COLORS.before[1] },
    { name: 'PIS', value: result.beforeTaxes.pis, color: COLORS.before[2] },
    { name: 'COFINS', value: result.beforeTaxes.cofins, color: COLORS.before[3] },
    { name: 'IPI', value: result.beforeTaxes.ipi, color: COLORS.before[4] },
  ].filter(item => item.value > 0);

  // Pie chart data - after
  const afterPieData = [
    { name: 'IBS', value: result.afterTaxes.ibs, color: COLORS.after[0] },
    { name: 'CBS', value: result.afterTaxes.cbs, color: COLORS.after[1] },
    { name: 'IS', value: result.afterTaxes.is, color: COLORS.after[2] },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="text-foreground font-medium">{payload[0].payload.name}</p>
          <p className="text-primary">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="text-foreground font-medium">{payload[0].name}</p>
          <p className="text-primary">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Bar Chart - Total Comparison */}
      <Card className="bg-card/70 border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Comparativo Total</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number" 
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Charts - Tax Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/70 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-destructive">Sistema Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={beforePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {beforePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend 
                  formatter={(value) => <span className="text-muted-foreground text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-primary">Reforma {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={afterPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {afterPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend 
                  formatter={(value) => <span className="text-muted-foreground text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
