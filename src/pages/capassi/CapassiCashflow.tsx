import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend, LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v / 100);

const fmtCompact = (v: number) => {
  const abs = Math.abs(v / 100);
  if (abs >= 1000000) return `R$ ${(v / 100 / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `R$ ${(v / 100 / 1000).toFixed(1)}K`;
  return fmt(v);
};

export default function CapassiCashflow() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data: rev } = await supabase.from('financial_revenues').select('amount_cents, revenue_date');
      const { data: cost } = await supabase.from('financial_costs').select('amount_cents, cost_date');

      const byMonth: Record<string, { revenue: number; costs: number }> = {};
      (rev || []).forEach(r => {
        const m = r.revenue_date?.substring(0, 7) || 'N/A';
        if (!byMonth[m]) byMonth[m] = { revenue: 0, costs: 0 };
        byMonth[m].revenue += r.amount_cents || 0;
      });
      (cost || []).forEach(c => {
        const m = c.cost_date?.substring(0, 7) || 'N/A';
        if (!byMonth[m]) byMonth[m] = { revenue: 0, costs: 0 };
        byMonth[m].costs += c.amount_cents || 0;
      });

      let runningBalance = 0;
      const sorted = Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, vals]) => {
          const net = vals.revenue - vals.costs;
          runningBalance += net;
          return {
            month: month.substring(5),
            revenue: vals.revenue,
            costs: vals.costs,
            net,
            balance: runningBalance,
          };
        });

      setData(sorted);
    };
    fetch();
  }, []);

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalCosts = data.reduce((s, d) => s + d.costs, 0);
  const totalNet = totalRevenue - totalCosts;
  const avgMonthlyNet = data.length > 0 ? totalNet / data.length : 0;
  const currentBalance = data.length > 0 ? data[data.length - 1].balance : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white">Fluxo de Caixa</h2>
        <p className="text-sm text-white/30">Projeção de entradas, saídas e saldo acumulado</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Entradas', value: fmtCompact(totalRevenue), icon: ArrowUpRight, color: '#55FFAA' },
          { label: 'Total Saídas', value: fmtCompact(totalCosts), icon: ArrowDownRight, color: '#ef4444' },
          { label: 'Saldo Líquido', value: fmtCompact(totalNet), icon: Wallet, color: totalNet >= 0 ? '#55FFAA' : '#ef4444' },
          { label: 'Saldo Acumulado', value: fmtCompact(currentBalance), icon: TrendingUp, color: '#7C5CFC' },
        ].map(k => (
          <Card key={k.label} className="bg-white/[0.02] border-white/[0.06]">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${k.color}10` }}>
                  <k.icon className="h-4 w-4" style={{ color: k.color }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: k.color }}>{k.value}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">{k.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Chart - Combined */}
      <Card className="bg-white/[0.02] border-white/[0.06]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white/80 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#55FFAA]" />
            Fluxo Mensal com Saldo Acumulado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <defs>
                  <linearGradient id="cfRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#55FFAA" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#55FFAA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tickFormatter={(v) => fmtCompact(v)} stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => fmtCompact(v)} stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: number) => fmt(value)}
                  contentStyle={{ backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }}
                />
                <Legend />
                <ReferenceLine yAxisId="left" y={0} stroke="rgba(255,255,255,0.1)" />
                <Bar yAxisId="left" dataKey="revenue" fill="#55FFAA" name="Entradas" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
                <Bar yAxisId="left" dataKey="costs" fill="#ef4444" name="Saídas" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
                <Line yAxisId="right" type="monotone" dataKey="balance" stroke="#7C5CFC" strokeWidth={2.5} dot={{ fill: '#7C5CFC', r: 3 }} name="Saldo Acumulado" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Net Flow Chart */}
      <Card className="bg-white/[0.02] border-white/[0.06]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white/80">Resultado Líquido Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => fmtCompact(v)} stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => fmt(value)} contentStyle={{ backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                <Area type="monotone" dataKey="net" stroke="#7C5CFC" strokeWidth={2} fillOpacity={1} fill="url(#netGrad)" name="Resultado" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
