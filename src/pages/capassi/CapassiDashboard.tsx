import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useCapassi } from '@/contexts/CapassiContext';
import {
  TrendingUp, TrendingDown, DollarSign, Users, BarChart3,
  ArrowUpRight, ArrowDownRight, Wallet, Percent, Activity,
  RefreshCw, Clock, Target
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Line
} from 'recharts';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v / 100);

const fmtCompact = (v: number) => {
  const abs = Math.abs(v / 100);
  if (abs >= 1000000) return `R$ ${(v / 100 / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `R$ ${(v / 100 / 1000).toFixed(1)}K`;
  return fmt(v);
};

export default function CapassiDashboard() {
  const { currentOrg, currentCompany, loading: ctxLoading } = useCapassi();
  const [period, setPeriod] = useState('30d');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCosts, setTotalCosts] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [revenueByCategory, setRevenueByCategory] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [alertCount, setAlertCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!currentOrg) return;
    setLoading(true);

    let txQuery = supabase.from('capassi_transactions' as any).select('*').eq('organization_id', currentOrg.id);
    if (currentCompany) txQuery = txQuery.eq('company_id', currentCompany.id);

    let clientQuery = supabase.from('capassi_clients' as any).select('*', { count: 'exact', head: true }).eq('organization_id', currentOrg.id);
    if (currentCompany) clientQuery = clientQuery.eq('company_id', currentCompany.id);

    let alertQuery = supabase.from('capassi_financial_alerts' as any).select('*', { count: 'exact', head: true }).eq('organization_id', currentOrg.id).eq('is_read', false);

    const [txRes, clientRes, alertRes] = await Promise.all([txQuery, clientQuery, alertQuery]);

    const transactions = (txRes.data || []) as any[];
    setTransactionCount(transactions.length);
    setClientCount(clientRes.count || 0);
    setAlertCount(alertRes.count || 0);

    const rev = transactions.filter((t: any) => t.type === 'receita');
    const cost = transactions.filter((t: any) => t.type === 'despesa');
    const totalRev = rev.reduce((s: number, t: any) => s + (t.amount_cents || 0), 0);
    const totalCst = cost.reduce((s: number, t: any) => s + (t.amount_cents || 0), 0);
    setTotalRevenue(totalRev);
    setTotalCosts(totalCst);

    // Revenue by category
    const byCategory: Record<string, number> = {};
    rev.forEach((t: any) => {
      const key = t.category || 'outros';
      byCategory[key] = (byCategory[key] || 0) + (t.amount_cents || 0);
    });
    const PIE_COLORS = ['#55FFAA', '#00CC77', '#33DDFF', '#7C5CFC', '#FF6B6B', '#FFB84D'];
    setRevenueByCategory(
      Object.entries(byCategory).sort(([, a], [, b]) => b - a).slice(0, 6)
        .map(([name, value], i) => ({ name, value, color: PIE_COLORS[i % PIE_COLORS.length] }))
    );

    // Monthly aggregation
    const byMonth: Record<string, { revenue: number; costs: number }> = {};
    transactions.forEach((t: any) => {
      const m = t.date?.substring(0, 7) || 'N/A';
      if (!byMonth[m]) byMonth[m] = { revenue: 0, costs: 0 };
      if (t.type === 'receita') byMonth[m].revenue += t.amount_cents || 0;
      else byMonth[m].costs += t.amount_cents || 0;
    });
    setMonthlyData(
      Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-12)
        .map(([month, vals]) => ({ month: month.substring(5), revenue: vals.revenue, costs: vals.costs, profit: vals.revenue - vals.costs }))
    );

    // Recent
    const recent = [...transactions].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
    setRecentTransactions(recent);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [currentOrg?.id, currentCompany?.id, period]);

  if (ctxLoading || (!currentOrg && loading)) {
    return <div className="py-20 text-center text-white/30">Carregando...</div>;
  }

  if (!currentOrg) {
    return (
      <div className="py-20 text-center">
        <p className="text-white/50 text-lg mb-2">Nenhuma organização encontrada</p>
        <p className="text-white/30 text-sm">Crie uma organização no seletor lateral para começar.</p>
      </div>
    );
  }

  const netProfit = totalRevenue - totalCosts;
  const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  const kpis = [
    { label: 'Receita Total', value: fmtCompact(totalRevenue), icon: TrendingUp, color: '#55FFAA', bgColor: 'rgba(85,255,170,0.08)', trend: `${margin}% margem`, trendUp: true },
    { label: 'Custos Totais', value: fmtCompact(totalCosts), icon: TrendingDown, color: '#ef4444', bgColor: 'rgba(239,68,68,0.08)', trend: `${transactionCount} tx`, trendUp: false },
    { label: 'Lucro Líquido', value: fmtCompact(netProfit), icon: DollarSign, color: netProfit >= 0 ? '#55FFAA' : '#ef4444', bgColor: netProfit >= 0 ? 'rgba(85,255,170,0.08)' : 'rgba(239,68,68,0.08)', trend: `${margin}%`, trendUp: netProfit >= 0 },
    { label: 'Clientes Ativos', value: clientCount.toString(), icon: Users, color: '#33DDFF', bgColor: 'rgba(51,221,255,0.08)', trend: `${alertCount} alertas`, trendUp: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Dashboard Executivo</h2>
          <p className="text-sm text-white/30 mt-1">{currentOrg.name}{currentCompany ? ` — ${currentCompany.name}` : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} className="border-white/10 text-white/50 hover:text-white bg-transparent hover:bg-white/5">
            <RefreshCw className="h-3.5 w-3.5 mr-2" /> Atualizar
          </Button>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px] bg-white/[0.03] border-white/10 text-white/70 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="all">Todo período</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="bg-white/[0.02] border-white/[0.06] hover:border-white/10 transition-all group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-xs font-medium text-white/40 uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
                  <div className="flex items-center gap-1.5">
                    {kpi.trendUp ? <ArrowUpRight className="h-3.5 w-3.5 text-[#55FFAA]" /> : <ArrowDownRight className="h-3.5 w-3.5 text-red-400" />}
                    <span className={`text-xs font-medium ${kpi.trendUp ? 'text-[#55FFAA]/70' : 'text-red-400/70'}`}>{kpi.trend}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl transition-transform group-hover:scale-110" style={{ backgroundColor: kpi.bgColor }}>
                  <kpi.icon className="h-5 w-5" style={{ color: kpi.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/80 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#55FFAA]" /> Evolução Financeira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="capRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#55FFAA" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#55FFAA" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="capCostGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => fmtCompact(v)} stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => fmt(value)} contentStyle={{ backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#55FFAA" strokeWidth={2} fillOpacity={1} fill="url(#capRevGrad)" name="Receitas" />
                  <Area type="monotone" dataKey="costs" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#capCostGrad)" name="Custos" />
                  <Line type="monotone" dataKey="profit" stroke="#7C5CFC" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Lucro" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/80 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-[#33DDFF]" /> Receita por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={revenueByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                    {revenueByCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => fmt(value)} contentStyle={{ backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2">
              {revenueByCategory.slice(0, 4).map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-white/50 capitalize truncate max-w-[120px]">{s.name.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="text-white/70 font-mono">{fmtCompact(s.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-white/[0.02] border-white/[0.06]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white/80 flex items-center justify-between">
            <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-[#55FFAA]" /> Atividade Recente</div>
            <Button variant="ghost" size="sm" className="text-white/30 hover:text-white text-xs h-7" asChild>
              <a href="/capassi/transactions">Ver tudo →</a>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          {recentTransactions.map((t: any, i: number) => (
            <div key={t.id || i} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === 'receita' ? 'bg-[#55FFAA]/10' : 'bg-red-500/10'}`}>
                  {t.type === 'receita' ? <ArrowUpRight className="h-4 w-4 text-[#55FFAA]" /> : <ArrowDownRight className="h-4 w-4 text-red-400" />}
                </div>
                <div>
                  <p className="text-xs font-medium text-white/70">{t.description}</p>
                  <p className="text-[10px] text-white/30">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <span className={`text-sm font-mono font-medium ${t.type === 'receita' ? 'text-[#55FFAA]' : 'text-red-400'}`}>
                {t.type === 'receita' ? '+' : '-'}{fmtCompact(t.amount_cents)}
              </span>
            </div>
          ))}
          {recentTransactions.length === 0 && !loading && (
            <p className="text-white/30 text-sm text-center py-8">Nenhuma transação. Adicione transações para ver dados aqui.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
