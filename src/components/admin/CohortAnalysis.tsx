import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  RefreshCw,
  Target,
  Clock
} from 'lucide-react';

interface CohortData {
  cohort: string;
  total: number;
  retentionByWeek: number[];
}

interface RetentionMetric {
  period: string;
  week1: number;
  week2: number;
  week3: number;
  week4: number;
}

export const CohortAnalysis: React.FC = () => {
  const [cohorts, setCohorts] = useState<CohortData[]>([]);
  const [retentionData, setRetentionData] = useState<RetentionMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewType, setViewType] = useState<'table' | 'chart'>('table');

  const fetchCohortData = async () => {
    setIsLoading(true);
    try {
      // Get users grouped by signup month
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, created_at')
        .order('created_at', { ascending: true });

      if (!profiles || profiles.length === 0) {
        setCohorts([]);
        setRetentionData([]);
        setIsLoading(false);
        return;
      }

      // Get activity data
      const { data: aiMessages } = await supabase
        .from('ai_chat_messages')
        .select('user_id, created_at');

      const { data: simulations } = await supabase
        .from('tax_simulations')
        .select('user_id, created_at');

      // Combine activity
      const userActivity = new Map<string, Date[]>();
      
      [...(aiMessages || []), ...(simulations || [])].forEach(item => {
        const userId = item.user_id;
        const date = new Date(item.created_at);
        if (!userActivity.has(userId)) {
          userActivity.set(userId, []);
        }
        userActivity.get(userId)!.push(date);
      });

      // Group users by signup month and calculate retention
      const monthlyUsers = new Map<string, { userId: string; signupDate: Date }[]>();
      
      profiles.forEach(p => {
        const signupDate = new Date(p.created_at);
        const monthKey = `${signupDate.getFullYear()}-${String(signupDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyUsers.has(monthKey)) {
          monthlyUsers.set(monthKey, []);
        }
        monthlyUsers.get(monthKey)!.push({ userId: p.user_id, signupDate });
      });

      // Calculate retention by week for each cohort
      const cohortResults: CohortData[] = [];
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      // Get last 6 months
      const sortedMonths = Array.from(monthlyUsers.keys()).sort().slice(-6);
      
      sortedMonths.forEach(monthKey => {
        const users = monthlyUsers.get(monthKey)!;
        const [year, month] = monthKey.split('-').map(Number);
        const cohortName = `${monthNames[month - 1]} ${year}`;
        
        // Calculate retention for weeks 1-4
        const retentionByWeek: number[] = [];
        
        for (let week = 1; week <= 4; week++) {
          let activeCount = 0;
          
          users.forEach(({ userId, signupDate }) => {
            const weekStart = new Date(signupDate);
            weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);
            
            const activities = userActivity.get(userId) || [];
            const hasActivity = activities.some(date => date >= weekStart && date < weekEnd);
            
            if (hasActivity) activeCount++;
          });
          
          const retention = users.length > 0 ? (activeCount / users.length) * 100 : 0;
          retentionByWeek.push(Math.round(retention));
        }
        
        cohortResults.push({
          cohort: cohortName,
          total: users.length,
          retentionByWeek
        });
      });
      
      setCohorts(cohortResults);

      // Create retention data for chart
      const retentionMetrics: RetentionMetric[] = cohortResults.map(c => ({
        period: c.cohort,
        week1: c.retentionByWeek[0] || 0,
        week2: c.retentionByWeek[1] || 0,
        week3: c.retentionByWeek[2] || 0,
        week4: c.retentionByWeek[3] || 0
      }));
      
      setRetentionData(retentionMetrics);
    } catch (error) {
      console.error('Error fetching cohort data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCohortData();
  }, []);

  const getRetentionColor = (value: number) => {
    if (value >= 70) return 'bg-success/20 text-success';
    if (value >= 50) return 'bg-primary/20 text-primary';
    if (value >= 30) return 'bg-warning/20 text-warning';
    return 'bg-destructive/20 text-destructive';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate averages
  const avgRetention = cohorts.length > 0 
    ? {
        week1: Math.round(cohorts.reduce((sum, c) => sum + (c.retentionByWeek[0] || 0), 0) / cohorts.length),
        week2: Math.round(cohorts.reduce((sum, c) => sum + (c.retentionByWeek[1] || 0), 0) / cohorts.length),
        week3: Math.round(cohorts.reduce((sum, c) => sum + (c.retentionByWeek[2] || 0), 0) / cohorts.length),
        week4: Math.round(cohorts.reduce((sum, c) => sum + (c.retentionByWeek[3] || 0), 0) / cohorts.length),
      }
    : { week1: 0, week2: 0, week3: 0, week4: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Análise de Cohort
          </h2>
          <p className="text-muted-foreground">Retenção de usuários por período de signup</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={viewType} onValueChange={(v: 'table' | 'chart') => setViewType(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="table">Tabela</SelectItem>
              <SelectItem value="chart">Gráfico</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchCohortData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Retenção Semana 1</p>
                <p className="text-3xl font-bold">{avgRetention.week1}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-info/20">
                <TrendingUp className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Retenção Semana 2</p>
                <p className="text-3xl font-bold">{avgRetention.week2}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-success/20">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Retenção Semana 3</p>
                <p className="text-3xl font-bold">{avgRetention.week3}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-warning/20">
                <Calendar className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Retenção Semana 4</p>
                <p className="text-3xl font-bold">{avgRetention.week4}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Table or Chart */}
      {viewType === 'table' ? (
        <Card>
          <CardHeader>
            <CardTitle>Tabela de Cohort</CardTitle>
            <CardDescription>Retenção semanal por mês de cadastro</CardDescription>
          </CardHeader>
          <CardContent>
            {cohorts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum dado de cohort disponível</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Cohort</th>
                      <th className="text-center py-3 px-4">Usuários</th>
                      <th className="text-center py-3 px-4">Semana 1</th>
                      <th className="text-center py-3 px-4">Semana 2</th>
                      <th className="text-center py-3 px-4">Semana 3</th>
                      <th className="text-center py-3 px-4">Semana 4</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohorts.map((cohort) => (
                      <tr key={cohort.cohort} className="border-b hover:bg-muted/30">
                        <td className="py-3 px-4 font-medium">{cohort.cohort}</td>
                        <td className="text-center py-3 px-4">
                          <Badge variant="outline">{cohort.total}</Badge>
                        </td>
                        {cohort.retentionByWeek.map((retention, i) => (
                          <td key={i} className="text-center py-3 px-4">
                            <Badge className={getRetentionColor(retention)}>
                              {retention}%
                            </Badge>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Gráfico de Retenção</CardTitle>
            <CardDescription>Visualização da retenção por semana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="period" className="text-xs" />
                  <YAxis className="text-xs" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value}%`, '']}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="week1" stroke="hsl(var(--primary))" name="Semana 1" strokeWidth={2} />
                  <Line type="monotone" dataKey="week2" stroke="hsl(var(--info))" name="Semana 2" strokeWidth={2} />
                  <Line type="monotone" dataKey="week3" stroke="hsl(var(--success))" name="Semana 3" strokeWidth={2} />
                  <Line type="monotone" dataKey="week4" stroke="hsl(var(--warning))" name="Semana 4" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2">Maior Queda de Retenção</h4>
              <p className="text-sm text-muted-foreground">
                A maior queda geralmente ocorre entre a semana 1 e 2. 
                Considere implementar emails de onboarding mais efetivos neste período.
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2">Ação Recomendada</h4>
              <p className="text-sm text-muted-foreground">
                Usuários que passam da semana 2 têm maior probabilidade de se tornarem usuários ativos.
                Foque em engajamento inicial.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CohortAnalysis;
