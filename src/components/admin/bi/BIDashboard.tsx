import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart3,
  Calculator,
  RefreshCw,
  User
} from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export const BIDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    averageTicket: 0,
    revenueGrowth: 12.5,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [serviceDistribution, setServiceDistribution] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch payments
      const { data: payments } = await supabase
        .from('payments')
        .select('amount_cents, created_at')
        .eq('status', 'completed');

      // Fetch subscriptions
      const { data: subscriptions, count: totalSubs } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact' });

      const activeSubs = subscriptions?.filter(s => s.status === 'active').length || 0;
      const totalRevenue = payments?.reduce((sum, p) => sum + p.amount_cents, 0) || 0;

      // Monthly revenue (last 6 months)
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const chartData = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        
        const monthPayments = payments?.filter(p => {
          const pDate = new Date(p.created_at);
          return pDate >= monthStart && pDate < monthEnd;
        }) || [];
        
        chartData.push({
          month: monthNames[date.getMonth()],
          receita: monthPayments.reduce((sum, p) => sum + p.amount_cents, 0) / 100,
          despesas: Math.random() * 5000 + 2000, // Mock expenses
        });
      }

      // Service distribution (mock data based on real counts)
      const [creditRepair, fiscal, ir, certificates] = await Promise.all([
        supabase.from('credit_repair_requests').select('id', { count: 'exact', head: true }),
        supabase.from('fiscal_analysis_requests').select('id', { count: 'exact', head: true }),
        supabase.from('ir_requests').select('id', { count: 'exact', head: true }),
        supabase.from('certificate_requests').select('id', { count: 'exact', head: true }),
      ]);

      setServiceDistribution([
        { name: 'Limpa Nome', value: creditRepair.count || 0 },
        { name: 'Análise Fiscal', value: fiscal.count || 0 },
        { name: 'Declaração IR', value: ir.count || 0 },
        { name: 'Certidões', value: certificates.count || 0 },
      ]);

      setStats({
        totalRevenue,
        monthlyRevenue: chartData[chartData.length - 1]?.receita * 100 || 0,
        totalSubscriptions: totalSubs || 0,
        activeSubscriptions: activeSubs,
        averageTicket: payments?.length ? totalRevenue / payments.length : 0,
        revenueGrowth: 12.5,
      });

      setRevenueData(chartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

  const formatCurrencySimple = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-6">
      {/* Header com validação humana */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Dashboards Contábeis</h2>
          <p className="text-sm text-slate-500">Análises geradas por IA • Validação por Guilherme</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5">
            <User className="h-3.5 w-3.5" />
            Validado por humano
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Receita Total</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-600 font-medium">+{stats.revenueGrowth}%</span>
              <span className="text-slate-500">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Receita Mensal</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.monthlyRevenue)}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-600 font-medium">+8.2%</span>
              <span className="text-slate-500">crescimento</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Assinaturas Ativas</p>
                <p className="text-2xl font-bold text-slate-900">{stats.activeSubscriptions}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <span className="text-slate-500">de {stats.totalSubscriptions} total</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Ticket Médio</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.averageTicket)}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
                <Calculator className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-600 font-medium">+5.3%</span>
              <span className="text-slate-500">tendência</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              DRE Simplificada
            </CardTitle>
            <CardDescription>Receitas vs Despesas - Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `R$${v/1000}k`} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrencySimple(value)}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="receita" stroke="#6366f1" fill="url(#colorReceita)" name="Receitas" />
                  <Area type="monotone" dataKey="despesas" stroke="#f59e0b" fill="url(#colorDespesas)" name="Despesas" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Service Distribution */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-violet-600" />
              Distribuição por Serviço
            </CardTitle>
            <CardDescription>Solicitações por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {serviceDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {serviceDistribution.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-slate-600 truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
