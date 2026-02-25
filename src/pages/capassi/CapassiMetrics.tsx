import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useCapassi } from '@/contexts/CapassiContext';
import {
  TrendingUp, Users, DollarSign, ArrowDownRight, Target, Repeat, Clock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Line
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
  const { currentOrg, currentCompany } = useCapassi();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrg) return;
    const fetch = async () => {
      setLoading(true);
      let txQ = supabase.from('capassi_transactions' as any).select('amount_cents, date, type, category, recurrence').eq('organization_id', currentOrg.id);
      let clQ = supabase.from('capassi_clients' as any).select('created_at, status').eq('organization_id', currentOrg.id);
      if (currentCompany) { txQ = txQ.eq('company_id', currentCompany.id); clQ = clQ.eq('company_id', currentCompany.id); }
      const [txRes, clRes] = await Promise.all([txQ, clQ]);
      setTransactions((txRes.data || []) as any[]);
      setClients((clRes.data || []) as any[]);
      setLoading(false);
    };
    fetch();
  }, [currentOrg?.id, currentCompany?.id]);

  const rev = transactions.filter((t: any) => t.type === 'receita');
  const recurring = rev.filter((t: any) => t.recurrence && t.recurrence !== 'unico');
  const oneTime = rev.filter((t: any) => !t.recurrence || t.recurrence === 'unico');

  const mrrTotal = recurring.reduce((s: number, t: any) => s + (t.amount_cents || 0), 0);
  const oneTimeTotal = oneTime.reduce((s: number, t: any) => s + (t.amount_cents || 0), 0);
  const totalRev = mrrTotal + oneTimeTotal;
  const recurringPercent = totalRev > 0 ? ((mrrTotal / totalRev) * 100).toFixed(0) : '0';

  const activeClients = clients.filter((c: any) => c.status === 'ativo').length;
  const inactiveClients = clients.filter((c: any) => c.status === 'inativo').length;
  const churnRate = clients.length > 0 ? ((inactiveClients / clients.length) * 100).toFixed(1) : '0';
  const arpu = activeClients > 0 ? totalRev / activeClients : 0;
  const churnNum = parseFloat(churnRate) / 100;
  const ltv = churnNum > 0 ? arpu / churnNum : arpu * 24;

  // Monthly revenue
  const byMonth: Record<string, number> = {};
  rev.forEach((t: any) => {
    const m = t.date?.substring(0, 7) || 'N/A';
    byMonth[m] = (byMonth[m] || 0) + (t.amount_cents || 0);
  });
  const mrrHistory = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-12)
    .map(([month, value]) => ({ month: month.substring(5), value }));

  // Client growth
  const clientByMonth: Record<string, number> = {};
  clients.forEach((c: any) => { const m = (c.created_at || '').substring(0, 7); if (m) clientByMonth[m] = (clientByMonth[m] || 0) + 1; });
  let cum = 0;
  const clientGrowth = Object.entries(clientByMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-12)
    .map(([month, count]) => { cum += count; return { month: month.substring(5), newCustomers: count, total: cum }; });

  const kpis = [
    { label: 'MRR', value: fmtCompact(mrrTotal), icon: TrendingUp, color: '#55FFAA', sub: 'Receita Recorrente' },
    { label: 'ARR', value: fmtCompact(mrrTotal * 12), icon: Target, color: '#33DDFF', sub: 'Receita Anual' },
    { label: 'Churn', value: `${churnRate}%`, icon: ArrowDownRight, color: '#ef4444', sub: 'Taxa de Inativação' },
    { label: 'ARPU', value: fmtCompact(arpu), icon: DollarSign, color: '#7C5CFC', sub: 'Receita Média/Cliente' },
    { label: 'LTV', value: fmtCompact(ltv), icon: Clock, color: '#FFB84D', sub: 'Valor Vitalício' },
    { label: 'Recorrente', value: `${recurringPercent}%`, icon: Repeat, color: '#00CC77', sub: 'da receita total' },
  ];

  if (loading) return <div className="py-20 text-center text-white/30">Carregando métricas...</div>;
  if (!currentOrg) return <div className="py-20 text-center text-white/30">Selecione uma organização</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white">Métricas SaaS</h2>
        <p className="text-sm text-white/30">MRR, ARR, Churn, LTV, ARPU — {currentOrg.name}</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/80 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#55FFAA]" /> Evolução da Receita</CardTitle>
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

        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/80 flex items-center gap-2"><Users className="h-4 w-4 text-[#33DDFF]" /> Crescimento de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientGrowth}>
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
