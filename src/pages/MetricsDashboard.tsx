import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Building2, 
  ArrowLeft,
  RefreshCw,
  Activity,
  Clock,
  CreditCard,
  FileText,
  Bot,
  Calendar
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";

interface MetricCard {
  title: string;
  value: number | string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ElementType;
  color: string;
}

interface RealtimeMetrics {
  totalUsers: number;
  activeSubscriptions: number;
  aiQuestions: number;
  simulations: number;
  consultations: number;
  certificates: number;
}

export default function MetricsDashboard() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const [metrics, setMetrics] = useState<RealtimeMetrics>({
    totalUsers: 0,
    activeSubscriptions: 0,
    aiQuestions: 0,
    simulations: 0,
    consultations: 0,
    certificates: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      // Fetch total users
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch active subscriptions
      const { count: subsCount } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Fetch AI questions
      const { count: aiCount } = await supabase
        .from("ai_chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("role", "user");

      // Fetch simulations
      const { count: simsCount } = await supabase
        .from("tax_simulations")
        .select("*", { count: "exact", head: true });

      // Fetch consultations
      const { count: consultCount } = await supabase
        .from("consultations")
        .select("*", { count: "exact", head: true });

      // Fetch certificates
      const { count: certsCount } = await supabase
        .from("certificate_requests")
        .select("*", { count: "exact", head: true });

      setMetrics({
        totalUsers: usersCount || 0,
        activeSubscriptions: subsCount || 0,
        aiQuestions: aiCount || 0,
        simulations: simsCount || 0,
        consultations: consultCount || 0,
        certificates: certsCount || 0,
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    // Set up real-time listeners
    const profilesChannel = supabase
      .channel("profiles-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, fetchMetrics)
      .subscribe();

    const subscriptionsChannel = supabase
      .channel("subscriptions-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "subscriptions" }, fetchMetrics)
      .subscribe();

    const aiChannel = supabase
      .channel("ai-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "ai_chat_messages" }, fetchMetrics)
      .subscribe();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(subscriptionsChannel);
      supabase.removeChannel(aiChannel);
      clearInterval(interval);
    };
  }, []);

  // Mock data for charts
  const dailyGrowthData = [
    { day: "Seg", users: 45, questions: 320 },
    { day: "Ter", users: 52, questions: 410 },
    { day: "Qua", users: 48, questions: 380 },
    { day: "Qui", users: 70, questions: 520 },
    { day: "Sex", users: 61, questions: 480 },
    { day: "Sáb", users: 35, questions: 210 },
    { day: "Dom", users: 28, questions: 180 },
  ];

  const monthlyRevenueData = [
    { month: "Jul", revenue: 12500 },
    { month: "Ago", revenue: 18200 },
    { month: "Set", revenue: 24800 },
    { month: "Out", revenue: 32100 },
    { month: "Nov", revenue: 41500 },
    { month: "Dez", revenue: 50857 },
  ];

  const metricCards: MetricCard[] = [
    {
      title: "Usuários Totais",
      value: metrics.totalUsers.toLocaleString("pt-BR"),
      change: "+12.5%",
      changeType: "positive",
      icon: Users,
      color: "from-primary to-primary/70",
    },
    {
      title: "Assinaturas Ativas",
      value: metrics.activeSubscriptions.toLocaleString("pt-BR"),
      change: "+8.2%",
      changeType: "positive",
      icon: CreditCard,
      color: "from-success to-success/70",
    },
    {
      title: "Perguntas IA",
      value: metrics.aiQuestions.toLocaleString("pt-BR"),
      change: "+23.1%",
      changeType: "positive",
      icon: Bot,
      color: "from-accent to-accent/70",
    },
    {
      title: "Simulações",
      value: metrics.simulations.toLocaleString("pt-BR"),
      change: "+15.7%",
      changeType: "positive",
      icon: FileText,
      color: "from-info to-info/70",
    },
    {
      title: "Consultas",
      value: metrics.consultations.toLocaleString("pt-BR"),
      change: "+5.3%",
      changeType: "positive",
      icon: MessageSquare,
      color: "from-warning to-warning/70",
    },
    {
      title: "Certificados",
      value: metrics.certificates.toLocaleString("pt-BR"),
      change: "+18.9%",
      changeType: "positive",
      icon: Calendar,
      color: "from-destructive to-destructive/70",
    },
  ];

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-4">
              Esta página é exclusiva para administradores.
            </p>
            <Button onClick={() => navigate("/")}>Voltar ao Início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Dashboard de Métricas
                </h1>
                <p className="text-sm text-muted-foreground">
                  Acompanhamento em tempo real
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Atualizado: {lastUpdate.toLocaleTimeString("pt-BR")}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMetrics}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-6">
          <Badge variant="outline" className="gap-1">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Tempo Real Ativo
          </Badge>
          <Badge variant="secondary">Auto-atualização: 30s</Badge>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {metricCards.map((metric, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <div className="relative z-10">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center mb-3`}>
                    <metric.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <Badge
                    variant={metric.changeType === "positive" ? "default" : "secondary"}
                    className="mt-2 text-xs"
                  >
                    {metric.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Atividade Semanal
              </CardTitle>
              <CardDescription>Novos usuários e perguntas IA por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyGrowthData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                      name="Usuários"
                    />
                    <Area
                      type="monotone"
                      dataKey="questions"
                      stroke="hsl(var(--accent))"
                      fillOpacity={1}
                      fill="url(#colorQuestions)"
                      name="Perguntas"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-success" />
                Receita Mensal
              </CardTitle>
              <CardDescription>Evolução da receita em R$ milhares</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, "Receita"]}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="hsl(var(--success))"
                      radius={[4, 4, 0, 0]}
                      name="Receita"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Atividade ao Vivo
            </CardTitle>
            <CardDescription>Eventos recentes da plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Novo usuário registrado", time: "há 2 min", icon: Users, color: "text-primary" },
                { action: "Assinatura Premium ativada", time: "há 5 min", icon: CreditCard, color: "text-success" },
                { action: "Simulação tributária realizada", time: "há 8 min", icon: FileText, color: "text-info" },
                { action: "Pergunta respondida pela IA", time: "há 12 min", icon: Bot, color: "text-accent" },
                { action: "Consulta agendada com contador", time: "há 15 min", icon: Calendar, color: "text-warning" },
              ].map((event, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className={`w-8 h-8 rounded-full bg-background flex items-center justify-center ${event.color}`}>
                    <event.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{event.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
