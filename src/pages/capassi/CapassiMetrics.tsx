import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import {
  PieChart as PieChartIcon, TrendingUp, Users, DollarSign,
  ArrowUpRight, ArrowDownRight, Activity, Target, Repeat, Clock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line
} from 'recharts';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v / 100);

const fmtCompact = (v: number) => {
  const abs = Math.abs(v / 100);
  if (abs >= 1000000) return `R$ ${(v / 100 / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `R$ ${(v / 100 / 1000).toFixed(1)}K`;
  return fmt(v);
};

export default function CapassiMetrics() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [revenues, setRevenues] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [subRes, revRes, profRes] = await Promise.all([
        supabase.from('subscriptions').select('*'),
        supabase.from('financial_revenues').select('amount_cents, revenue_date, revenue_type'),
        supabase.from('profiles').select('created_at'),
      ]);
      setSubscriptions(subRes.data || []);
      setRevenues(revRes.data || []);
      setProfiles(profRes.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  // Calculate MRR
  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const mrr = activeSubs.reduce((s, sub) => s + (sub.price_cents || 0), 0);

  // ARR
  const arr = mrr * 12;

  // Total customers
  const totalCustomers = profiles.length;

  // Churn (simplified)
  const cancelledSubs = subscriptions.filter(s => s.status === 'cancelled');
  const churnRate = subscriptions.length > 0 ? ((cancelledSubs.length / subscriptions.length) * 100).toFixed(1) : '0';

  // ARPU
  const arpu = activeSubs.length > 0 ? mrr / activeSubs.length : 0;

  // LTV (simplified: ARPU / churn)
  const churnNum = parseFloat(churnRate) / 100;
  const ltv = churnNum > 0 ? arpu / churnNum : arpu * 24;

  // Monthly revenue growth
  const revenueByMonth: Record<string, number> = {};
  revenues.forEach(r => {
    const m = r.revenue_date?.substring(0, 7) || 'N/A';
    revenueByMonth[m] = (revenueByMonth[m] || 0) + (r.amount_cents || 0);
  });
  const mrrHistory = Object.entries(revenueByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, value]) => ({ month: month.substring(5), value }));

  // Customer growth
  const customerByMonth: Record<string, number> = {};
  profiles.forEach(p => {
    const m = (p.created_at || '').substring(0, 7);
    if (m) customerByMonth[m] = (customerByMonth[m] || 0) + 1;
  });
  let cumCustomers = 0;
  const customerGrowth = Object.entries(customerByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, count]) => {
      cumCustomers += count;
      return { month: month.substring(5), newCustomers: count, total: cumCustomers };
    });

  // Recurring vs one-time
  const recurring = revenues.filter(r => r.revenue_type === 'recurring').reduce((s, r) => s + (r.amount_cents || 0), 0);
  const oneTime = revenues.filter(r => r.revenue_type !== 'recurring').reduce((s, r) => s + (r.amount_cents || 0), 0);
  const recurringPercent = (recurring + oneTime) > 0 ? ((recurring / (recurring + oneTime)) * 100).toFixed(0) : '0';

  const kpis = [
    { label: 'MRR', value: fmtCompact(mrr), icon: TrendingUp, color: '#55FFAA', sub: 'Receita Recorrente Mensal' },
    { label: 'ARR', value: fmtCompact(arr), icon: Target, color: '#33DDFF', sub: 'Receita Anual Recorrente' },
    { label: 'Churn', value: `${churnRate}%`, icon: ArrowDownRight, color: '#ef4444', sub: 'Taxa de Cancelamento' },
    { label: 'ARPU', value: fmtCompact(arpu), icon: DollarSign, color: '#7C5CFC', sub: 'Receita Média por Usuário' },
    { label: 'LTV', value: fmtCompact(ltv), icon: Clock, color: '#FFB84D', sub: 'Valor Vitalício do Cliente' },
    { label: 'Recorrente', value: `${recurringPercent}%`, icon: Repeat, color: '#00CC77', sub: 'da receita total' },
  ];

  if (loading) {
    return <div className="py-20 text-center text-white/30">Carregando métricas SaaS...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white">Métricas SaaS</h2>
        <p className="text-sm text-white/30">MRR, ARR, Churn, LTV, ARPU e crescimento</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {kpis.map(k => (
          <Card key={k.label} className="bg-white/[0.02] border-white/[0.06] hover:border-white/10 transition-all">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">{k.label}</p>
                  <p className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
                  <p className="text-[10px] text-white/25">{k.sub}</p>
                </div>
                <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${k.color}10` }}>
                  <k.icon className="h-5 w-5" style={{ color: k.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* MRR History */}
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/80 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#55FFAA]" />
              Evolução da Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mrrHistory}>
                  <defs>
                    <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#55FFAA" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#55FFAA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => fmtCompact(v)} stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                  <Area type="monotone" dataKey="value" stroke="#55FFAA" strokeWidth={2} fillOpacity={1} fill="url(#mrrGrad)" name="Receita" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Growth */}
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/80 flex items-center gap-2">
              <Users className="h-4 w-4 text-[#33DDFF]" />
              Crescimento de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                  <Bar dataKey="newCustomers" fill="#33DDFF" name="Novos" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
                  <Line type="monotone" dataKey="total" stroke="#7C5CFC" strokeWidth={2} dot={false} name="Acumulado" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
