import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v / 100);

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

      const sorted = Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, vals]) => ({
          month,
          revenue: vals.revenue,
          costs: vals.costs,
          net: vals.revenue - vals.costs,
        }));

      setData(sorted);
    };
    fetch();
  }, []);

  const totalNet = data.reduce((s, d) => s + d.net, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Fluxo de Caixa</h2>
        <p className="text-sm text-white/40">Projeção de entradas e saídas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#0B0F1A] border-[#372938]">
          <CardContent className="p-6">
            <p className="text-sm text-white/40">Total Entradas</p>
            <p className="text-xl font-bold text-[#55FFAA]">{fmt(data.reduce((s, d) => s + d.revenue, 0))}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0B0F1A] border-[#372938]">
          <CardContent className="p-6">
            <p className="text-sm text-white/40">Total Saídas</p>
            <p className="text-xl font-bold text-red-400">{fmt(data.reduce((s, d) => s + d.costs, 0))}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0B0F1A] border-[#372938]">
          <CardContent className="p-6">
            <p className="text-sm text-white/40">Saldo Líquido</p>
            <p className={`text-xl font-bold ${totalNet >= 0 ? 'text-[#55FFAA]' : 'text-red-400'}`}>{fmt(totalNet)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#0B0F1A] border-[#372938]">
        <CardHeader>
          <CardTitle className="text-base text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#55FFAA]" />
            Fluxo Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#372938" />
                <XAxis dataKey="month" stroke="#ffffff40" />
                <YAxis tickFormatter={(v) => `R$${(v / 100).toFixed(0)}`} stroke="#ffffff40" />
                <Tooltip
                  formatter={(value: number) => fmt(value)}
                  contentStyle={{ backgroundColor: '#0B0F1A', border: '1px solid #372938', borderRadius: 8, color: '#fff' }}
                />
                <Legend />
                <ReferenceLine y={0} stroke="#ffffff20" />
                <Bar dataKey="revenue" fill="#55FFAA" name="Entradas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="costs" fill="#ef4444" name="Saídas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
