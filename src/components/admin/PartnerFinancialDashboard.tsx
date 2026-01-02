import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  CheckCircle2,
  Clock,
  Loader2,
  Building2,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  FileText
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export function PartnerFinancialDashboard() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "all">("30d");

  const { data: partners, isLoading: loadingPartners } = useQuery({
    queryKey: ["credit-repair-partners-financial"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("credit_repair_partners")
        .select("*")
        .eq("is_active", true)
        .order("total_revenue_cents", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: requests, isLoading: loadingRequests } = useQuery({
    queryKey: ["credit-repair-requests-financial", period],
    queryFn: async () => {
      let query = supabase
        .from("credit_repair_requests")
        .select("*")
        .eq("payment_status", "paid")
        .not("partner_id", "is", null);

      if (period !== "all") {
        const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        query = query.gte("created_at", startDate.toISOString());
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: withdrawals, isLoading: loadingWithdrawals } = useQuery({
    queryKey: ["partner-withdrawals-financial", period],
    queryFn: async () => {
      let query = supabase
        .from("partner_withdrawal_requests")
        .select("*");

      if (period !== "all") {
        const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        query = query.gte("created_at", startDate.toISOString());
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  // Calculate metrics
  const totalRevenue = requests?.reduce((sum, r) => sum + r.final_price_cents, 0) || 0;
  const totalCommissionsPaid = withdrawals?.filter(w => w.status === "completed").reduce((sum, w) => sum + w.amount_cents, 0) || 0;
  const pendingCommissions = withdrawals?.filter(w => w.status === "pending").reduce((sum, w) => sum + w.amount_cents, 0) || 0;
  const completedRequests = requests?.filter(r => r.status === "completed").length || 0;
  const activePartners = partners?.filter(p => p.stripe_account_id).length || 0;

  // Calculate platform commission (15%)
  const platformCommission = requests?.reduce((sum, r) => {
    const partnerCommission = partners?.find(p => p.id === r.partner_id)?.commission_percent || 15;
    return sum + (r.final_price_cents * (100 - partnerCommission) / 100);
  }, 0) || 0;

  // Prepare chart data - revenue by day
  const revenueByDay = requests?.reduce((acc, r) => {
    const date = new Date(r.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    acc[date] = (acc[date] || 0) + r.final_price_cents;
    return acc;
  }, {} as Record<string, number>) || {};

  const revenueChartData = Object.entries(revenueByDay)
    .map(([date, value]) => ({ date, value: value / 100 }))
    .slice(-14);

  // Partner revenue distribution
  const partnerRevenueData = partners?.slice(0, 5).map(p => ({
    name: p.trade_name || p.company_name,
    value: p.total_revenue_cents / 100,
  })) || [];

  // Withdrawal status distribution
  const withdrawalStatusData = [
    { name: "Aprovados", value: withdrawals?.filter(w => w.status === "completed").length || 0, color: "#10b981" },
    { name: "Pendentes", value: withdrawals?.filter(w => w.status === "pending").length || 0, color: "#f59e0b" },
    { name: "Rejeitados", value: withdrawals?.filter(w => w.status === "rejected").length || 0, color: "#ef4444" },
  ].filter(d => d.value > 0);

  // Monthly comparison
  const currentMonth = new Date().getMonth();
  const lastMonthRevenue = requests?.filter(r => new Date(r.created_at).getMonth() === currentMonth - 1)
    .reduce((sum, r) => sum + r.final_price_cents, 0) || 0;
  const thisMonthRevenue = requests?.filter(r => new Date(r.created_at).getMonth() === currentMonth)
    .reduce((sum, r) => sum + r.final_price_cents, 0) || 0;
  const growthPercent = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;

  const isLoading = loadingPartners || loadingRequests || loadingWithdrawals;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Financeiro</h2>
          <p className="text-muted-foreground">Métricas consolidadas de comissões pagas aos parceiros</p>
        </div>
        <Select value={period} onValueChange={(v: "7d" | "30d" | "90d" | "all") => setPeriod(v)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="all">Todo período</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {growthPercent >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ${growthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(growthPercent).toFixed(1)}% vs mês anterior
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Comissões Pagas</p>
                <p className="text-2xl font-bold">{formatCurrency(totalCommissionsPaid)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {withdrawals?.filter(w => w.status === "completed").length || 0} saques realizados
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Comissões Pendentes</p>
                <p className="text-2xl font-bold">{formatCurrency(pendingCommissions)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {withdrawals?.filter(w => w.status === "pending").length || 0} saques aguardando
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Plataforma</p>
                <p className="text-2xl font-bold">{formatCurrency(platformCommission)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Taxa média de ~15%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Receita ao Longo do Tempo</CardTitle>
            <CardDescription>Faturamento diário do período</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `R$${v}`} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value * 100), 'Receita']}
                    contentStyle={{ borderRadius: '8px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Partner Revenue Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top 5 Parceiros por Receita</CardTitle>
            <CardDescription>Distribuição de faturamento por parceiro</CardDescription>
          </CardHeader>
          <CardContent>
            {partnerRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={partnerRevenueData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tickFormatter={(v) => `R$${v}`} className="text-xs" />
                  <YAxis type="category" dataKey="name" className="text-xs" width={100} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value * 100), 'Receita']}
                    contentStyle={{ borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                Nenhum parceiro ativo
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Withdrawal Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status dos Saques</CardTitle>
            <CardDescription>Distribuição por status</CardDescription>
          </CardHeader>
          <CardContent>
            {withdrawalStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={withdrawalStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {withdrawalStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                Nenhum saque registrado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Partner Stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Resumo de Parceiros</CardTitle>
            <CardDescription>Visão geral dos parceiros ativos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Building2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{partners?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Parceiros</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <CreditCard className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold">{activePartners}</p>
                <p className="text-sm text-muted-foreground">Com Stripe</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <FileText className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold">{requests?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Solicitações</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-emerald-600" />
                <p className="text-2xl font-bold">{completedRequests}</p>
                <p className="text-sm text-muted-foreground">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Withdrawals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Últimos Saques</CardTitle>
          <CardDescription>Histórico recente de pagamentos aos parceiros</CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawals && withdrawals.length > 0 ? (
            <div className="space-y-3">
              {withdrawals.slice(0, 10).map((w) => {
                const partner = partners?.find(p => p.id === w.partner_id);
                return (
                  <div key={w.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{partner?.trade_name || partner?.company_name || 'Parceiro'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(w.requested_at).toLocaleDateString('pt-BR')} - {w.pix_key_type.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold">{formatCurrency(w.amount_cents)}</p>
                      <Badge variant={
                        w.status === "completed" ? "default" :
                        w.status === "pending" ? "outline" : "destructive"
                      }>
                        {w.status === "completed" ? "Pago" :
                         w.status === "pending" ? "Pendente" : "Rejeitado"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum saque registrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
