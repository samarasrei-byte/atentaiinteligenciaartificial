import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Users, 
  MessageSquare, 
  CreditCard,
  FileText,
  Bot,
  Calendar,
  TrendingUp,
  Clock,
  RefreshCw,
  Zap,
  UserPlus,
  ShoppingCart,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface RealtimeEvent {
  id: string;
  type: 'user' | 'subscription' | 'ai' | 'simulation' | 'consultation' | 'certificate';
  title: string;
  description: string;
  timestamp: Date;
}

interface Metrics {
  totalUsers: number;
  activeSubscriptions: number;
  aiQuestions: number;
  simulations: number;
  consultations: number;
  certificates: number;
}

interface DailyData {
  day: string;
  users: number;
  questions: number;
}

interface MonthlyRevenueData {
  month: string;
  revenue: number;
}

export const AdminRealtimeDashboard: React.FC = () => {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalUsers: 0,
    activeSubscriptions: 0,
    aiQuestions: 0,
    simulations: 0,
    consultations: 0,
    certificates: 0
  });
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueData[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const addEvent = (event: Omit<RealtimeEvent, 'id' | 'timestamp'>) => {
    const newEvent: RealtimeEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    setEvents(prev => [newEvent, ...prev].slice(0, 50));
  };

  const fetchMetrics = async () => {
    try {
      const [usersRes, subsRes, aiRes, simsRes, consultRes, certsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('ai_chat_messages').select('*', { count: 'exact', head: true }).eq('role', 'user'),
        supabase.from('tax_simulations').select('*', { count: 'exact', head: true }),
        supabase.from('consultations').select('*', { count: 'exact', head: true }),
        supabase.from('certificate_requests').select('*', { count: 'exact', head: true })
      ]);

      setMetrics({
        totalUsers: usersRes.count || 0,
        activeSubscriptions: subsRes.count || 0,
        aiQuestions: aiRes.count || 0,
        simulations: simsRes.count || 0,
        consultations: consultRes.count || 0,
        certificates: certsRes.count || 0
      });

      // Fetch daily data
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const dailyDataResult: DailyData[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString();
        
        const [usersDay, questionsDay] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true })
            .gte('created_at', dayStart).lt('created_at', dayEnd),
          supabase.from('ai_chat_messages').select('id', { count: 'exact', head: true })
            .eq('role', 'user').gte('created_at', dayStart).lt('created_at', dayEnd)
        ]);
        
        dailyDataResult.push({
          day: dayNames[date.getDay()],
          users: usersDay.count || 0,
          questions: questionsDay.count || 0
        });
      }
      setDailyData(dailyDataResult);

      // Fetch monthly revenue
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthlyData: MonthlyRevenueData[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString();
        
        const { data: paymentsData } = await supabase
          .from('payments')
          .select('amount_cents')
          .eq('status', 'completed')
          .gte('created_at', monthStart)
          .lt('created_at', monthEnd);
        
        const totalRevenue = (paymentsData || []).reduce((sum, p) => sum + p.amount_cents, 0) / 100;
        
        monthlyData.push({
          month: monthNames[date.getMonth()],
          revenue: totalRevenue
        });
      }
      setMonthlyRevenue(monthlyData);

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    // Set up real-time listeners
    const profilesChannel = supabase
      .channel('realtime-profiles')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
        addEvent({
          type: 'user',
          title: 'Novo usuário cadastrado',
          description: (payload.new as any).email || 'Novo usuário'
        });
        fetchMetrics();
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    const subsChannel = supabase
      .channel('realtime-subs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, (payload) => {
        const newData = payload.new as any;
        if (payload.eventType === 'INSERT') {
          addEvent({
            type: 'subscription',
            title: 'Nova assinatura',
            description: `Plano ${newData.plan_type} ativado`
          });
        } else if (payload.eventType === 'UPDATE' && newData.status === 'cancelled') {
          addEvent({
            type: 'subscription',
            title: 'Assinatura cancelada',
            description: `Plano ${newData.plan_type} cancelado`
          });
        }
        fetchMetrics();
      })
      .subscribe();

    const aiChannel = supabase
      .channel('realtime-ai')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ai_chat_messages' }, (payload) => {
        if ((payload.new as any).role === 'user') {
          addEvent({
            type: 'ai',
            title: 'Nova pergunta IA',
            description: 'Usuário fez uma pergunta ao assistente'
          });
          fetchMetrics();
        }
      })
      .subscribe();

    const simsChannel = supabase
      .channel('realtime-sims')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tax_simulations' }, () => {
        addEvent({
          type: 'simulation',
          title: 'Nova simulação',
          description: 'Simulação tributária realizada'
        });
        fetchMetrics();
      })
      .subscribe();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(subsChannel);
      supabase.removeChannel(aiChannel);
      supabase.removeChannel(simsChannel);
      clearInterval(interval);
    };
  }, []);

  const getEventIcon = (type: RealtimeEvent['type']) => {
    const icons = {
      user: <UserPlus className="h-4 w-4 text-primary" />,
      subscription: <CreditCard className="h-4 w-4 text-success" />,
      ai: <Bot className="h-4 w-4 text-accent" />,
      simulation: <FileText className="h-4 w-4 text-info" />,
      consultation: <Calendar className="h-4 w-4 text-warning" />,
      certificate: <FileText className="h-4 w-4 text-muted-foreground" />
    };
    return icons[type];
  };

  const metricCards = [
    { title: 'Usuários', value: metrics.totalUsers, icon: Users, color: 'from-primary to-primary/70' },
    { title: 'Assinaturas', value: metrics.activeSubscriptions, icon: CreditCard, color: 'from-success to-success/70' },
    { title: 'Perguntas IA', value: metrics.aiQuestions, icon: Bot, color: 'from-accent to-accent/70' },
    { title: 'Simulações', value: metrics.simulations, icon: FileText, color: 'from-info to-info/70' },
    { title: 'Consultas', value: metrics.consultations, icon: MessageSquare, color: 'from-warning to-warning/70' },
    { title: 'Certificados', value: metrics.certificates, icon: Calendar, color: 'from-destructive to-destructive/70' }
  ];

  if (isLoading) {
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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Dashboard Tempo Real
          </h2>
          <p className="text-muted-foreground">Monitoramento ao vivo da plataforma</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={isConnected ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}>
              <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
              {isConnected ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {lastUpdate.toLocaleTimeString('pt-BR')}
          </div>
          <Button variant="outline" onClick={fetchMetrics} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricCards.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <div className="relative z-10">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center mb-3`}>
                  <metric.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <p className="text-2xl font-bold">{metric.value.toLocaleString('pt-BR')}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Atividade Semanal
            </CardTitle>
            <CardDescription>Novos usuários e perguntas IA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorUsersRT" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorQuestionsRT" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorUsersRT)" name="Usuários" />
                  <Area type="monotone" dataKey="questions" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorQuestionsRT)" name="Perguntas" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-success" />
              Receita Mensal
            </CardTitle>
            <CardDescription>Evolução da receita em R$</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Receita" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            Eventos ao Vivo
            <Badge variant="outline" className="ml-2">{events.length}</Badge>
          </CardTitle>
          <CardDescription>Atividades em tempo real da plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aguardando eventos...</p>
                <p className="text-sm mt-2">Os eventos aparecerão aqui conforme ocorrem</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 rounded-full bg-background">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {event.timestamp.toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRealtimeDashboard;
