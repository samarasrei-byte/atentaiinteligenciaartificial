import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimulationResult, formatCurrency } from '@/lib/taxData';

interface TaxComparisonChartProps {
  result: SimulationResult;
}

const COLORS = {
  before: ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'],
  after: ['#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#ccfbf1'],
};

export const TaxComparisonChart: React.FC<TaxComparisonChartProps> = ({ result }) => {
  // Bar chart data - comparison
  const barData = [
    {
      name: 'Sistema Atual',
      total: result.beforeTaxes.total,
      fill: '#f97316',
    },
    {
      name: 'Reforma 2026',
      total: result.afterTaxes.total,
      fill: '#14b8a6',
    },
  ];

  // Pie chart data - before
  const beforePieData = [
    { name: 'ICMS', value: result.beforeTaxes.icms, color: '#f97316' },
    { name: 'ISS', value: result.beforeTaxes.iss, color: '#fb923c' },
    { name: 'PIS', value: result.beforeTaxes.pis, color: '#fdba74' },
    { name: 'COFINS', value: result.beforeTaxes.cofins, color: '#fed7aa' },
    { name: 'IPI', value: result.beforeTaxes.ipi, color: '#ffedd5' },
  ].filter(item => item.value > 0);

  // Pie chart data - after
  const afterPieData = [
    { name: 'IBS', value: result.afterTaxes.ibs, color: '#14b8a6' },
    { name: 'CBS', value: result.afterTaxes.cbs, color: '#2dd4bf' },
    { name: 'IS', value: result.afterTaxes.is, color: '#5eead4' },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-lg">
          <p className="text-white font-medium">{payload[0].payload.name}</p>
          <p className="text-cyan-400">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-lg">
          <p className="text-white font-medium">{payload[0].name}</p>
          <p className="text-cyan-400">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Bar Chart - Total Comparison */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Comparativo Total</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="number" 
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
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
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-400">Sistema Atual</CardTitle>
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
                  formatter={(value) => <span className="text-slate-300 text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-cyan-400">Reforma 2026</CardTitle>
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
                  formatter={(value) => <span className="text-slate-300 text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
