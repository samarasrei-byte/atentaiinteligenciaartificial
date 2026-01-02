import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Gift,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface CashbackMetrics {
  totalDistributed: number;
  totalClaimed: number;
  totalRedeemed: number;
  pendingCashback: number;
  expiringSoon: number;
  conversionRate: number;
  claimRate: number;
  avgCashbackAmount: number;
  usersWithCashback: number;
  monthlyTrend: { month: string; distributed: number; claimed: number }[];
  levelDistribution: { level: string; count: number; color: string }[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--accent))', 'hsl(var(--info))'];

const CashbackMetricsDashboard = () => {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['admin-cashback-metrics'],
    queryFn: async (): Promise<CashbackMetrics> => {
      // Fetch all cashback records
      const { data: cashbackData, error: cashbackError } = await supabase
        .from('user_cashback')
        .select('*');

      if (cashbackError) throw cashbackError;

      const records = cashbackData || [];

      // Calculate metrics
      const totalDistributed = records.reduce((sum, r) => sum + r.total_spent_cents * (r.cashback_percent / 100), 0);
      const totalClaimed = records.filter(r => r.is_claimed).reduce((sum, r) => sum + r.cashback_amount_cents, 0);
      const pendingCashback = records.filter(r => !r.is_claimed).reduce((sum, r) => sum + r.cashback_amount_cents, 0);
      
      // Cashback that was used (reduced from original)
      const totalRedeemed = records.filter(r => r.is_claimed).reduce((sum, r) => {
        const originalAmount = r.total_spent_cents * (r.cashback_percent / 100);
        return sum + Math.max(0, originalAmount - r.cashback_amount_cents);
      }, 0);

      // Calculate expiring soon (within 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const expiringSoon = records.filter(r => 
        r.is_claimed && 
        r.expires_at && 
        new Date(r.expires_at) <= thirtyDaysFromNow &&
        r.cashback_amount_cents > 0
      ).length;

      // Unique users with cashback
      const usersWithCashback = new Set(records.map(r => r.user_id)).size;

      // Rates
      const claimRate = records.length > 0 
        ? (records.filter(r => r.is_claimed).length / records.length) * 100 
        : 0;
      
      const claimedWithValue = records.filter(r => r.is_claimed);
      const conversionRate = claimedWithValue.length > 0
        ? (claimedWithValue.filter(r => r.cashback_amount_cents < r.total_spent_cents * (r.cashback_percent / 100)).length / claimedWithValue.length) * 100
        : 0;

      const avgCashbackAmount = records.length > 0
        ? records.reduce((sum, r) => sum + r.cashback_amount_cents, 0) / records.length
        : 0;

      // Monthly trend (last 6 months)
      const monthlyTrend: { month: string; distributed: number; claimed: number }[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
        
        const monthRecords = records.filter(r => r.month_year === monthKey);
        monthlyTrend.push({
          month: monthName,
          distributed: monthRecords.reduce((sum, r) => sum + r.total_spent_cents * (r.cashback_percent / 100), 0) / 100,
          claimed: monthRecords.filter(r => r.is_claimed).reduce((sum, r) => sum + r.cashback_amount_cents, 0) / 100,
        });
      }

      // Level distribution based on services used
      const levelCounts = { bronze: 0, prata: 0, ouro: 0, platina: 0 };
      records.forEach(r => {
        if (r.services_used >= 10) levelCounts.platina++;
        else if (r.services_used >= 5) levelCounts.ouro++;
        else if (r.services_used >= 3) levelCounts.prata++;
        else levelCounts.bronze++;
      });

      const levelDistribution = [
        { level: 'Bronze', count: levelCounts.bronze, color: '#CD7F32' },
        { level: 'Prata', count: levelCounts.prata, color: '#C0C0C0' },
        { level: 'Ouro', count: levelCounts.ouro, color: '#FFD700' },
        { level: 'Platina', count: levelCounts.platina, color: '#E5E4E2' },
      ];

      return {
        totalDistributed,
        totalClaimed,
        totalRedeemed,
        pendingCashback,
        expiringSoon,
        conversionRate,
        claimRate,
        avgCashbackAmount,
        usersWithCashback,
        monthlyTrend,
        levelDistribution,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const formatCurrency = (cents: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="bg-card">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <Card className="bg-destructive/10 border-destructive">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>Erro ao carregar métricas de cashback</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            Métricas de Cashback
          </h2>
          <p className="text-muted-foreground">Visão geral do programa de fidelidade</p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary">
          {metrics.usersWithCashback} usuários ativos
        </Badge>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Distribuído</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(metrics.totalDistributed)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-primary/20">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Resgatado</p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(metrics.totalClaimed)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-success/20">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilizado em Compras</p>
                <p className="text-2xl font-bold text-accent">
                  {formatCurrency(metrics.totalRedeemed)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-accent/20">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendente de Resgate</p>
                <p className="text-2xl font-bold text-info">
                  {formatCurrency(metrics.pendingCashback)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-info/20">
                <Clock className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rates and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Taxa de Resgate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{metrics.claimRate.toFixed(1)}%</span>
                <Badge variant={metrics.claimRate > 70 ? 'default' : 'secondary'}>
                  {metrics.claimRate > 70 ? 'Excelente' : metrics.claimRate > 50 ? 'Bom' : 'Regular'}
                </Badge>
              </div>
              <Progress value={metrics.claimRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Usuários que resgataram seu cashback
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Taxa de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{metrics.conversionRate.toFixed(1)}%</span>
                <Badge variant={metrics.conversionRate > 30 ? 'default' : 'secondary'}>
                  {metrics.conversionRate > 30 ? 'Alto' : 'Médio'}
                </Badge>
              </div>
              <Progress value={metrics.conversionRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Cashback usado em novas compras
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Expirando em 30 dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{metrics.expiringSoon}</span>
                <Badge variant={metrics.expiringSoon > 10 ? 'destructive' : 'outline'}>
                  {metrics.expiringSoon > 10 ? 'Atenção' : 'Normal'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Cashbacks que expiram em breve
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Tendência Mensal</CardTitle>
            <CardDescription>Distribuição vs Resgate nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `R$${v}`} />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, '']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="distributed" name="Distribuído" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="claimed" name="Resgatado" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Level Distribution */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Distribuição por Nível</CardTitle>
            <CardDescription>Usuários por tier de cashback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.levelDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="level"
                    label={({ level, count }) => `${level}: ${count}`}
                  >
                    {metrics.levelDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{metrics.usersWithCashback}</p>
            <p className="text-sm text-muted-foreground">Usuários com Cashback</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-success" />
            <p className="text-2xl font-bold">{formatCurrency(metrics.avgCashbackAmount)}</p>
            <p className="text-sm text-muted-foreground">Média por Usuário</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <Gift className="h-8 w-8 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">
              {((metrics.totalClaimed / (metrics.totalDistributed || 1)) * 100).toFixed(0)}%
            </p>
            <p className="text-sm text-muted-foreground">Taxa de Ativação</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-info" />
            <p className="text-2xl font-bold">
              {formatCurrency(metrics.totalDistributed - metrics.pendingCashback)}
            </p>
            <p className="text-sm text-muted-foreground">Valor em Circulação</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CashbackMetricsDashboard;
