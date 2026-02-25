import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ArrowUpRight,
  BarChart3
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

export default function CapassiDashboard() {
  const [period, setPeriod] = useState('30d');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCosts, setTotalCosts] = useState(0);
  const [clientCount, setClientCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: revenues } = await supabase.from('financial_revenues').select('amount_cents');
      const { data: costs } = await supabase.from('financial_costs').select('amount_cents');
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

      setTotalRevenue((revenues || []).reduce((s, r) => s + (r.amount_cents || 0), 0));
      setTotalCosts((costs || []).reduce((s, c) => s + (c.amount_cents || 0), 0));
      setClientCount(count || 0);
    };
    fetchData();
  }, [period]);

  const netProfit = totalRevenue - totalCosts;

  const mockMonthly = [
    { month: 'Jan', revenue: 320000, costs: 180000 },
    { month: 'Fev', revenue: 450000, costs: 200000 },
    { month: 'Mar', revenue: 380000, costs: 190000 },
    { month: 'Abr', revenue: 520000, costs: 210000 },
    { month: 'Mai', revenue: 610000, costs: 230000 },
    { month: 'Jun', revenue: 580000, costs: 220000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Dashboard Financeiro</h2>
          <p className="text-sm text-white/40">Visão consolidada — Capassi Finance</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px] bg-white/5 border-[#372938] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 dias</SelectItem>
            <SelectItem value="30d">30 dias</SelectItem>
            <SelectItem value="90d">90 dias</SelectItem>
            <SelectItem value="12m">12 meses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#0B0F1A] border-[#372938]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/40">Receita Total</p>
                <p className="text-2xl font-bold text-[#55FFAA]">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#55FFAA]/10">
                <TrendingUp className="h-6 w-6 text-[#55FFAA]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0B0F1A] border-[#372938]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/40">Custos</p>
                <p className="text-2xl font-bold text-red-400">{formatCurrency(totalCosts)}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10">
                <TrendingDown className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0B0F1A] border-[#372938]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/40">Lucro Líquido</p>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-[#55FFAA]' : 'text-red-400'}`}>
                  {formatCurrency(netProfit)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-violet-500/10">
                <DollarSign className="h-6 w-6 text-violet-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0B0F1A] border-[#372938]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/40">Clientes</p>
                <p className="text-2xl font-bold text-white">{clientCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="bg-[#0B0F1A] border-[#372938]">
        <CardHeader>
          <CardTitle className="text-base text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#55FFAA]" />
            Evolução Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockMonthly}>
                <defs>
                  <linearGradient id="capRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#55FFAA" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#55FFAA" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="capCosts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#372938" />
                <XAxis dataKey="month" stroke="#ffffff40" />
                <YAxis tickFormatter={(v) => `R$${(v / 100).toFixed(0)}`} stroke="#ffffff40" />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#0B0F1A', border: '1px solid #372938', borderRadius: 8, color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#55FFAA" fillOpacity={1} fill="url(#capRevenue)" name="Receitas" />
                <Area type="monotone" dataKey="costs" stroke="#ef4444" fillOpacity={1} fill="url(#capCosts)" name="Custos" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
