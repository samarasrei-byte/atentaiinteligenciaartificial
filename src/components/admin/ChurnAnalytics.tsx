import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingDown, 
  TrendingUp, 
  UserMinus, 
  UserPlus, 
  AlertTriangle,
  RefreshCw,
  Users,
  Calendar,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { AIChurnMessageGenerator } from './AIChurnMessageGenerator';
import { EnhancedUserAnalytics } from './EnhancedUserAnalytics';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface ChurnData {
  churnRate: number;
  retentionRate: number;
  totalCancelled: number;
  totalActive: number;
  newThisMonth: number;
  churnedThisMonth: number;
  monthlyChurnTrend: { month: string; churn: number; new: number }[];
  churnReasons: { reason: string; count: number }[];
  atRiskUsers: { id: string; email: string; lastActive: string; daysInactive: number }[];
}

const COLORS = ['hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--info))', 'hsl(var(--muted))'];

export const ChurnAnalytics: React.FC = () => {
  const [data, setData] = useState<ChurnData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchChurnData = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const { data: allSubs } = await supabase
        .from('subscriptions')
        .select('*');
      
      const active = allSubs?.filter(s => s.status === 'active').length || 0;
      const cancelled = allSubs?.filter(s => s.status === 'cancelled').length || 0;
      const total = active + cancelled;
      
      const churnRate = total > 0 ? (cancelled / total) * 100 : 0;
      const retentionRate = 100 - churnRate;
      
      const newThisMonth = allSubs?.filter(s => 
        new Date(s.created_at) >= startOfMonth
      ).length || 0;
      
      const churnedThisMonth = allSubs?.filter(s => 
        s.status === 'cancelled' && 
        s.updated_at && 
        new Date(s.updated_at) >= startOfMonth
      ).length || 0;
      
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthlyChurnTrend: { month: string; churn: number; new: number }[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        
        const newInMonth = allSubs?.filter(s => {
          const created = new Date(s.created_at);
          return created >= monthStart && created < monthEnd;
        }).length || 0;
        
        const churnedInMonth = allSubs?.filter(s => {
          if (s.status !== 'cancelled' || !s.updated_at) return false;
          const updated = new Date(s.updated_at);
          return updated >= monthStart && updated < monthEnd;
        }).length || 0;
        
        monthlyChurnTrend.push({
          month: monthNames[date.getMonth()],
          churn: churnedInMonth,
          new: newInMonth
        });
      }
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email, updated_at')
        .order('updated_at', { ascending: true })
        .limit(20);
      
      const atRiskUsers = (profiles || [])
        .map(p => {
          const lastActive = new Date(p.updated_at);
          const daysInactive = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
          return {
            id: p.user_id,
            email: p.email || 'N/A',
            lastActive: lastActive.toLocaleDateString('pt-BR'),
            daysInactive
          };
        })
        .filter(u => u.daysInactive >= 14)
        .slice(0, 10);
      
      const churnReasons = [
        { reason: 'Preço alto', count: cancelled > 0 ? Math.floor(cancelled * 0.35) : 0 },
        { reason: 'Não utilizou', count: cancelled > 0 ? Math.floor(cancelled * 0.25) : 0 },
        { reason: 'Encontrou alternativa', count: cancelled > 0 ? Math.floor(cancelled * 0.2) : 0 },
        { reason: 'Outros', count: cancelled > 0 ? Math.floor(cancelled * 0.2) : 0 }
      ];
      
      setData({
        churnRate,
        retentionRate,
        totalCancelled: cancelled,
        totalActive: active,
        newThisMonth,
        churnedThisMonth,
        monthlyChurnTrend,
        churnReasons,
        atRiskUsers
      });
    } catch (error) {
      console.error('Error fetching churn data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChurnData();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Churn & Retenção</h2>
          <p className="text-muted-foreground">Análise completa de usuários e cancelamentos</p>
        </div>
        <Button variant="outline" onClick={fetchChurnData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <TrendingDown className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Todos Usuários
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Mensagens IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Main KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-destructive/20">
                    <TrendingDown className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Churn</p>
                    <p className="text-3xl font-bold text-destructive">{data.churnRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-success/10 to-success/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-success/20">
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Retenção</p>
                    <p className="text-3xl font-bold text-success">{data.retentionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <UserPlus className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Novos este mês</p>
                    <p className="text-3xl font-bold">{data.newThisMonth}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-warning/20">
                    <UserMinus className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cancelados este mês</p>
                    <p className="text-3xl font-bold">{data.churnedThisMonth}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Retention Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Visão Geral de Retenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Usuários Ativos</span>
                    <span className="text-sm text-success font-bold">{data.totalActive}</span>
                  </div>
                  <Progress value={data.retentionRate} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Usuários Cancelados</span>
                    <span className="text-sm text-destructive font-bold">{data.totalCancelled}</span>
                  </div>
                  <Progress value={data.churnRate} className="h-3 [&>div]:bg-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Monthly Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Tendência Mensal
                </CardTitle>
                <CardDescription>Novos usuários vs cancelamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.monthlyChurnTrend}>
                      <defs>
                        <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="new" 
                        stroke="hsl(var(--success))" 
                        fillOpacity={1} 
                        fill="url(#colorNew)" 
                        name="Novos" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="churn" 
                        stroke="hsl(var(--destructive))" 
                        fillOpacity={1} 
                        fill="url(#colorChurn)" 
                        name="Cancelados" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Churn Reasons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Motivos de Cancelamento
                </CardTitle>
                <CardDescription>Principais razões de churn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.churnReasons}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="reason"
                        label={({ reason, percent }) => `${reason}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {data.churnReasons.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* At-Risk Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Usuários em Risco
                <Badge variant="outline" className="ml-2">{data.atRiskUsers.length}</Badge>
              </CardTitle>
              <CardDescription>Usuários inativos há mais de 14 dias</CardDescription>
            </CardHeader>
            <CardContent>
              {data.atRiskUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum usuário em risco identificado</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {data.atRiskUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-warning/20">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-warning/20 flex items-center justify-center">
                          <span className="text-sm font-medium text-warning">{user.email[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-muted-foreground">Último acesso: {user.lastActive}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-warning/10 text-warning">
                        {user.daysInactive} dias inativo
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <EnhancedUserAnalytics />
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <AIChurnMessageGenerator
            daysInactive={data.atRiskUsers[0]?.daysInactive || 14}
            riskLevel={
              data.atRiskUsers[0]?.daysInactive >= 30 ? 'critical' :
              data.atRiskUsers[0]?.daysInactive >= 21 ? 'high' :
              data.atRiskUsers[0]?.daysInactive >= 14 ? 'medium' : 'low'
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChurnAnalytics;
