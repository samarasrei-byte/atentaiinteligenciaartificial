import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import AppSidebar from '@/components/layout/AppSidebar';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { 
  FileText,
  Calendar,
  DollarSign,
  Star,
  Users,
  Check,
  X,
  Clock,
  Loader2,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  Activity,
  Save,
  Award,
  Target,
  MessageSquare,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Menu,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ContadorProfile {
  id: string;
  crc_number: string;
  specialty: string;
  bio: string;
  hourly_rate_cents: number;
  rating: number;
  total_consultations: number;
  available: boolean;
}

interface Consultation {
  id: string;
  user_id: string;
  status: string;
  scheduled_at: string | null;
  price_cents: number;
  platform_fee_cents: number;
  notes: string | null;
  rating: number | null;
  created_at: string;
  completed_at: string | null;
}

interface ClientInfo {
  user_id: string;
  email: string;
  full_name: string | null;
  consultations_count: number;
  total_spent: number;
  last_consultation: string;
}

const ContadorPanel = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile, hasRole, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  
  const [isLoading, setIsLoading] = useState(true);
  const [contadorProfile, setContadorProfile] = useState<ContadorProfile | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form state
  const [crcNumber, setCrcNumber] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!hasRole('contador') && !hasRole('admin')) {
        toast({
          variant: 'destructive',
          title: 'Acesso negado',
          description: 'Você não tem permissão para acessar esta página',
        });
        navigate('/dashboard');
      }
    }
  }, [user, authLoading, hasRole, navigate, toast]);

  useEffect(() => {
    if (user && (hasRole('contador') || hasRole('admin'))) {
      fetchContadorData();
      
      const channel = supabase
        .channel('contador-consultations')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'consultations',
            filter: `contador_id=eq.${user.id}`
          },
          () => fetchContadorData()
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, hasRole]);

  const fetchContadorData = async () => {
    try {
      const { data: profileData } = await supabase
        .from('contador_profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (profileData) {
        setContadorProfile(profileData);
        setCrcNumber(profileData.crc_number || '');
        setSpecialty(profileData.specialty || '');
        setBio(profileData.bio || '');
        setHourlyRate(((profileData.hourly_rate_cents || 15000) / 100).toString());
        setIsAvailable(profileData.available);
      }

      const { data: consultData } = await supabase
        .from('consultations')
        .select('*')
        .eq('contador_id', user!.id)
        .order('created_at', { ascending: false });

      setConsultations(consultData || []);

      // Build clients list from consultations
      if (consultData && consultData.length > 0) {
        const clientsMap = new Map<string, ClientInfo>();
        
        for (const c of consultData) {
          const existing = clientsMap.get(c.user_id);
          if (existing) {
            existing.consultations_count++;
            existing.total_spent += c.price_cents;
            if (new Date(c.created_at) > new Date(existing.last_consultation)) {
              existing.last_consultation = c.created_at;
            }
          } else {
            clientsMap.set(c.user_id, {
              user_id: c.user_id,
              email: '',
              full_name: null,
              consultations_count: 1,
              total_spent: c.price_cents,
              last_consultation: c.created_at,
            });
          }
        }

        // Fetch client profiles
        const clientIds = Array.from(clientsMap.keys());
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, email, full_name')
          .in('user_id', clientIds);

        if (profilesData) {
          for (const p of profilesData) {
            const client = clientsMap.get(p.user_id);
            if (client) {
              client.email = p.email || '';
              client.full_name = p.full_name;
            }
          }
        }

        setClients(Array.from(clientsMap.values()).sort((a, b) => b.consultations_count - a.consultations_count));
      }
    } catch (error) {
      console.error('Error fetching contador data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchContadorData();
    toast({ title: 'Dados atualizados!' });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const profileData = {
        user_id: user!.id,
        crc_number: crcNumber,
        specialty,
        bio,
        hourly_rate_cents: Math.round(parseFloat(hourlyRate) * 100),
        available: isAvailable,
      };

      if (contadorProfile) {
        const { error } = await supabase
          .from('contador_profiles')
          .update(profileData)
          .eq('id', contadorProfile.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contador_profiles')
          .insert(profileData);

        if (error) throw error;
      }

      toast({
        title: 'Perfil salvo!',
        description: 'Suas informações foram atualizadas',
      });
      
      fetchContadorData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao salvar perfil',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateConsultation = async (consultationId: string, status: string) => {
    try {
      const updateData: any = { status };
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('consultations')
        .update(updateData)
        .eq('id', consultationId);

      if (error) throw error;

      toast({
        title: 'Consulta atualizada!',
        description: `Status alterado para ${status}`,
      });
      
      fetchContadorData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao atualizar consulta',
      });
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { class: string; icon: any; label: string }> = {
      pending: { class: 'bg-accent/10 text-accent border-accent/20', icon: Clock, label: 'Pendente' },
      scheduled: { class: 'bg-info/10 text-info border-info/20', icon: Calendar, label: 'Agendada' },
      completed: { class: 'bg-success/10 text-success border-success/20', icon: CheckCircle, label: 'Concluída' },
      cancelled: { class: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle, label: 'Cancelada' },
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    return (
      <Badge variant="outline" className={c.class}>
        <Icon className="h-3 w-3 mr-1" />
        {c.label}
      </Badge>
    );
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingConsultations = consultations.filter(c => c.status === 'pending');
  const scheduledConsultations = consultations.filter(c => c.status === 'scheduled');
  const completedConsultations = consultations.filter(c => c.status === 'completed');
  const totalEarnings = completedConsultations.reduce((sum, c) => sum + c.price_cents - c.platform_fee_cents, 0);
  const totalPlatformFees = completedConsultations.reduce((sum, c) => sum + c.platform_fee_cents, 0);
  const averageRating = completedConsultations.filter(c => c.rating).reduce((sum, c, _, arr) => sum + (c.rating || 0) / arr.length, 0);

  // Chart data
  const earningsData = [
    { month: 'Jul', ganhos: totalEarnings * 0.5 },
    { month: 'Ago', ganhos: totalEarnings * 0.6 },
    { month: 'Set', ganhos: totalEarnings * 0.7 },
    { month: 'Out', ganhos: totalEarnings * 0.8 },
    { month: 'Nov', ganhos: totalEarnings * 0.9 },
    { month: 'Dez', ganhos: totalEarnings },
  ];

  const statusData = [
    { name: 'Pendentes', value: pendingConsultations.length, color: 'hsl(var(--accent))' },
    { name: 'Agendadas', value: scheduledConsultations.length, color: 'hsl(var(--info))' },
    { name: 'Concluídas', value: completedConsultations.length, color: 'hsl(var(--success))' },
  ].filter(d => d.value > 0);

  // Activities
  const activities = consultations.slice(0, 5).map(c => ({
    id: c.id,
    type: 'consultation' as const,
    title: c.status === 'completed' ? 'Consulta concluída' : c.status === 'scheduled' ? 'Consulta agendada' : 'Nova solicitação',
    description: formatCurrency(c.price_cents - c.platform_fee_cents),
    timestamp: new Date(c.created_at).toLocaleDateString('pt-BR'),
  }));

  return (
    <div className="min-h-screen bg-background flex">
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      
      <div className="hidden lg:block">
        <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} variant="contador" />
      </div>
      
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <AppSidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} variant="contador" />
      </div>
      
      <main className={`flex-1 transition-all duration-300 lg:${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div className="p-2 rounded-lg bg-info/10 hidden sm:flex">
                <FileText className="h-5 w-5 text-info" />
              </div>
              <div>
                <h1 className="text-lg lg:text-2xl font-bold text-foreground">Painel do Contador</h1>
                <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">
                  {profile?.full_name || 'Contador'} • {contadorProfile?.specialty || 'Especialista'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationCenter notifications={notifications} unreadCount={unreadCount} onMarkAsRead={markAsRead} onMarkAllAsRead={markAllAsRead} onClear={clearNotifications} />
              <Badge className={`hidden sm:flex ${isAvailable ? 'bg-success' : 'bg-muted'}`}>
                {isAvailable ? 'Disponível' : 'Indisponível'}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="hidden sm:flex">
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6 space-y-6">
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearchParams({ tab: v }); }}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 max-w-2xl">
              <TabsTrigger value="overview" className="text-xs lg:text-sm">Visão Geral</TabsTrigger>
              <TabsTrigger value="consultations" className="text-xs lg:text-sm">Consultas</TabsTrigger>
              <TabsTrigger value="clients" className="text-xs lg:text-sm hidden lg:flex">Clientes</TabsTrigger>
              <TabsTrigger value="earnings" className="text-xs lg:text-sm hidden lg:flex">Ganhos</TabsTrigger>
              <TabsTrigger value="profile" className="text-xs lg:text-sm">Perfil</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatsCard icon={Clock} label="Pendentes" value={pendingConsultations.length} color="accent" />
                <StatsCard icon={Calendar} label="Agendadas" value={scheduledConsultations.length} color="info" />
                <StatsCard icon={Check} label="Concluídas" value={completedConsultations.length} color="success" />
                <StatsCard icon={Wallet} label="Ganhos" value={formatCurrency(totalEarnings)} color="success" />
                <StatsCard icon={Star} label="Avaliação" value={contadorProfile?.rating ? Number(contadorProfile.rating).toFixed(1) : '5.0'} color="accent" />
              </div>

              {/* Charts and Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Earnings Chart */}
                <Card className="lg:col-span-2 bg-card border-border shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-success" />
                      Evolução dos Ganhos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={earningsData}>
                        <defs>
                          <linearGradient id="colorGanhos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <YAxis tickFormatter={(v) => `R$${(v / 100).toFixed(0)}`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Area type="monotone" dataKey="ganhos" stroke="hsl(var(--success))" strokeWidth={2} fillOpacity={1} fill="url(#colorGanhos)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <ActivityFeed activities={activities} title="Atividade Recente" />
              </div>

              {/* Pending Consultations Quick View */}
              {pendingConsultations.length > 0 && (
                <Card className="bg-accent/5 border-accent/20 shadow-soft">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-accent" />
                        Ação Necessária
                      </CardTitle>
                      <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                        {pendingConsultations.length} pendente{pendingConsultations.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pendingConsultations.slice(0, 3).map((c) => (
                        <div key={c.id} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                          <div>
                            <p className="font-medium text-foreground">Cliente #{c.user_id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(c.created_at).toLocaleDateString('pt-BR')} • {formatCurrency(c.price_cents - c.platform_fee_cents)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleUpdateConsultation(c.id, 'scheduled')} className="bg-success hover:bg-success/90">
                              <Check className="h-4 w-4 mr-1" /> Aceitar
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleUpdateConsultation(c.id, 'cancelled')}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="consultations" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard icon={Clock} label="Pendentes" value={pendingConsultations.length} color="accent" />
                <StatsCard icon={Calendar} label="Agendadas" value={scheduledConsultations.length} color="info" />
                <StatsCard icon={CheckCircle} label="Concluídas" value={completedConsultations.length} color="success" />
                <StatsCard icon={XCircle} label="Canceladas" value={consultations.filter(c => c.status === 'cancelled').length} color="destructive" />
              </div>

              {/* All Consultations */}
              <Card className="bg-card border-border shadow-soft">
                <CardHeader>
                  <CardTitle>Todas as Consultas</CardTitle>
                  <CardDescription>Histórico completo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {consultations.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                        <div>
                          <p className="font-medium text-foreground">Cliente #{c.user_id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(c.created_at).toLocaleDateString('pt-BR')}
                          </p>
                          {c.notes && <p className="text-xs text-muted-foreground mt-1">Notas: {c.notes}</p>}
                        </div>
                        <div className="text-right space-y-2">
                          <p className="font-bold text-foreground">{formatCurrency(c.price_cents - c.platform_fee_cents)}</p>
                          {getStatusBadge(c.status)}
                          {c.status === 'pending' && (
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" onClick={() => handleUpdateConsultation(c.id, 'scheduled')} className="bg-success hover:bg-success/90">
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleUpdateConsultation(c.id, 'cancelled')}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          {c.status === 'scheduled' && (
                            <Button size="sm" onClick={() => handleUpdateConsultation(c.id, 'completed')} className="bg-success hover:bg-success/90 mt-2">
                              Concluir
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {consultations.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">Nenhuma consulta encontrada</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clients" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard icon={Users} label="Total de Clientes" value={clients.length} color="primary" />
                <StatsCard icon={Target} label="Consultas Totais" value={consultations.length} color="info" />
                <StatsCard icon={Award} label="Recorrentes" value={clients.filter(c => c.consultations_count > 1).length} color="success" />
              </div>

              <Card className="bg-card border-border shadow-soft">
                <CardHeader>
                  <CardTitle>Meus Clientes</CardTitle>
                  <CardDescription>Lista de clientes que já consultaram com você</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {clients.map((client) => (
                      <div key={client.user_id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {client.full_name?.[0] || client.email[0]?.toUpperCase() || 'C'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{client.full_name || 'Cliente'}</p>
                            <p className="text-sm text-muted-foreground">{client.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Última consulta: {new Date(client.last_consultation).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">{formatCurrency(client.total_spent)}</p>
                          <Badge variant="outline" className="text-xs">
                            {client.consultations_count} consulta{client.consultations_count > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {clients.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">Nenhum cliente ainda</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="earnings" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard icon={Wallet} label="Ganhos Totais" value={formatCurrency(totalEarnings)} color="success" />
                <StatsCard icon={DollarSign} label="Taxa Plataforma" value={formatCurrency(totalPlatformFees)} subtitle="10% retido" color="accent" />
                <StatsCard icon={Target} label="Valor por Consulta" value={formatCurrency(parseInt(hourlyRate) * 100)} color="info" />
                <StatsCard icon={TrendingUp} label="Este Mês" value={formatCurrency(totalEarnings * 0.3)} color="success" />
              </div>

              <Card className="bg-card border-border shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-success" />
                    Evolução dos Ganhos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={earningsData}>
                      <defs>
                        <linearGradient id="colorGanhos2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `R$${(v / 100).toFixed(0)}`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Area type="monotone" dataKey="ganhos" stroke="hsl(var(--success))" strokeWidth={2} fillOpacity={1} fill="url(#colorGanhos2)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Earnings Breakdown */}
              <Card className="bg-card border-border shadow-soft">
                <CardHeader>
                  <CardTitle>Detalhamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {completedConsultations.slice(0, 10).map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">Cliente #{c.user_id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(c.completed_at || c.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-success">{formatCurrency(c.price_cents - c.platform_fee_cents)}</p>
                          <p className="text-xs text-muted-foreground">Taxa: {formatCurrency(c.platform_fee_cents)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-card border-border shadow-soft">
                  <CardHeader>
                    <CardTitle>Informações Profissionais</CardTitle>
                    <CardDescription>Configure seu perfil de contador</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="crc">Número CRC</Label>
                      <Input
                        id="crc"
                        value={crcNumber}
                        onChange={(e) => setCrcNumber(e.target.value)}
                        placeholder="Ex: 12345/O-SP"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialty">Especialidade</Label>
                      <Input
                        id="specialty"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        placeholder="Ex: Reforma Tributária, Lucro Real..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografia</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Conte sobre sua experiência e qualificações..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rate">Valor da Consulta (R$)</Label>
                      <Input
                        id="rate"
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        placeholder="150"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <Label>Disponível para consultas</Label>
                        <p className="text-xs text-muted-foreground">Aparecer na lista de contadores</p>
                      </div>
                      <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
                    </div>

                    <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Salvar Perfil
                    </Button>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="bg-card border-border shadow-soft">
                    <CardHeader>
                      <CardTitle>Estatísticas do Perfil</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-muted-foreground">Avaliação Média</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-accent fill-accent" />
                          <span className="font-bold">{contadorProfile?.rating ? Number(contadorProfile.rating).toFixed(1) : '5.0'}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-muted-foreground">Total de Consultas</span>
                        <span className="font-bold">{completedConsultations.length}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-muted-foreground">Clientes Atendidos</span>
                        <span className="font-bold">{clients.length}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-muted-foreground">Taxa de Conclusão</span>
                        <span className="font-bold text-success">
                          {consultations.length > 0 ? Math.round((completedConsultations.length / consultations.length) * 100) : 0}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-info to-info/80 text-info-foreground">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold mb-2">Dicas para Mais Clientes</h3>
                      <ul className="space-y-2 text-sm opacity-90">
                        <li>✓ Mantenha seu perfil sempre atualizado</li>
                        <li>✓ Responda rapidamente às solicitações</li>
                        <li>✓ Peça avaliações aos clientes satisfeitos</li>
                        <li>✓ Especialize-se na Reforma Tributária</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ContadorPanel;
