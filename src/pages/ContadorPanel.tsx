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
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import AppSidebar from '@/components/layout/AppSidebar';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { ContadorStats } from '@/components/dashboard/ContadorStats';
import { ProfessionalChat } from '@/components/chat/ProfessionalChat';
import { ContadorAgenda } from '@/components/contador/ContadorAgenda';
import { LegalUpdates } from '@/components/contador/LegalUpdates';
import { WithdrawalSystem } from '@/components/contador/WithdrawalSystem';
import { StripeConnectSetup } from '@/components/contador/StripeConnectSetup';
import { ContadorReportGenerator } from '@/components/contador/ContadorReportGenerator';
import CompanyOpeningManagement from '@/components/contador/CompanyOpeningManagement';
import { IRManagement } from '@/components/contador/IRManagement';
import { FloatingAIAgent } from '@/components/ai/FloatingAIAgent';
import { CertificateManagement } from '@/components/contador/CertificateManagement';
import { 
  FileText, Calendar, DollarSign, Star, Users, Check, X, Clock, Loader2,
  Wallet, TrendingUp, Save, Award, Target, MessageSquare, RefreshCw,
  CheckCircle, AlertCircle, XCircle, Menu, Banknote, FileDown, Building2,
  ScrollText,
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

// Mock data for simulation (test@atentai.com.br)
const mockConsultations: Consultation[] = [
  { id: '1', user_id: 'user-1', status: 'completed', scheduled_at: '2024-12-20T10:00:00Z', price_cents: 15000, platform_fee_cents: 1500, notes: 'Consulta sobre Simples Nacional', rating: 5, created_at: '2024-12-18T08:00:00Z', completed_at: '2024-12-20T11:00:00Z' },
  { id: '2', user_id: 'user-2', status: 'completed', scheduled_at: '2024-12-19T14:00:00Z', price_cents: 15000, platform_fee_cents: 1500, notes: 'Dúvidas sobre IBS e CBS', rating: 5, created_at: '2024-12-17T09:00:00Z', completed_at: '2024-12-19T15:00:00Z' },
  { id: '3', user_id: 'user-3', status: 'scheduled', scheduled_at: '2024-12-24T10:00:00Z', price_cents: 15000, platform_fee_cents: 1500, notes: 'Reforma tributária', rating: null, created_at: '2024-12-21T10:00:00Z', completed_at: null },
  { id: '4', user_id: 'user-1', status: 'completed', scheduled_at: '2024-12-15T16:00:00Z', price_cents: 15000, platform_fee_cents: 1500, notes: 'Lucro Presumido', rating: 4, created_at: '2024-12-13T11:00:00Z', completed_at: '2024-12-15T17:00:00Z' },
  { id: '5', user_id: 'user-4', status: 'pending', scheduled_at: null, price_cents: 15000, platform_fee_cents: 1500, notes: null, rating: null, created_at: '2024-12-22T08:00:00Z', completed_at: null },
  { id: '6', user_id: 'user-2', status: 'completed', scheduled_at: '2024-12-10T09:00:00Z', price_cents: 15000, platform_fee_cents: 1500, notes: 'MEI para ME', rating: 5, created_at: '2024-12-08T14:00:00Z', completed_at: '2024-12-10T10:00:00Z' },
];

const mockClients: ClientInfo[] = [
  { user_id: 'user-1', email: 'maria@empresa.com', full_name: 'Maria Silva', consultations_count: 2, total_spent: 30000, last_consultation: '2024-12-20T11:00:00Z' },
  { user_id: 'user-2', email: 'joao@tech.com', full_name: 'João Santos', consultations_count: 2, total_spent: 30000, last_consultation: '2024-12-19T15:00:00Z' },
  { user_id: 'user-3', email: 'ana@startup.com', full_name: 'Ana Costa', consultations_count: 1, total_spent: 15000, last_consultation: '2024-12-21T10:00:00Z' },
  { user_id: 'user-4', email: 'pedro@comercio.com', full_name: 'Pedro Oliveira', consultations_count: 1, total_spent: 15000, last_consultation: '2024-12-22T08:00:00Z' },
];

const mockProfile: ContadorProfile = {
  id: 'profile-1',
  crc_number: '12345/O-SP',
  specialty: 'Reforma Tributária, Simples Nacional',
  bio: 'Contador especializado em Reforma Tributária com 15 anos de experiência.',
  hourly_rate_cents: 15000,
  rating: 4.9,
  total_consultations: 6,
  available: true,
};

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
  const [isSimulation, setIsSimulation] = useState(false);

  // Form state
  const [crcNumber, setCrcNumber] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('150');
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) navigate('/auth');
      // Allow access if user has contador role, admin role, or has a contador profile
      // The profile check will happen in fetchContadorData
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchContadorData();
    }
  }, [user, authLoading]);

  const fetchContadorData = async () => {
    try {
      // Use mock data for simulation mode
      if (user?.email === 'teste@atentai.com.br') {
        setIsSimulation(true);
        setContadorProfile(mockProfile);
        setConsultations(mockConsultations);
        setClients(mockClients);
        setCrcNumber(mockProfile.crc_number);
        setSpecialty(mockProfile.specialty);
        setBio(mockProfile.bio);
        setHourlyRate((mockProfile.hourly_rate_cents / 100).toString());
        setIsAvailable(mockProfile.available);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      // First check if user has admin role - they can access everything
      if (hasRole('admin')) {
        // Admin can view but may not have a contador profile
        setIsLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from('contador_profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (profileData) {
        // Check if profile is complete (has CRC number)
        if (!profileData.crc_number) {
          navigate('/contador/onboarding');
          return;
        }
        setContadorProfile(profileData);
        setCrcNumber(profileData.crc_number || '');
        setSpecialty(profileData.specialty || '');
        setBio(profileData.bio || '');
        setHourlyRate(((profileData.hourly_rate_cents || 15000) / 100).toString());
        setIsAvailable(profileData.available);
      } else {
        // No profile exists - check if they have contador role
        if (hasRole('contador')) {
          // Has role but no profile, redirect to onboarding
          navigate('/contador/onboarding');
          return;
        } else {
          // No role and no profile, access denied
          toast({ variant: 'destructive', title: 'Acesso negado', description: 'Você não tem permissão para acessar esta área' });
          navigate('/dashboard');
          return;
        }
      }

      const { data: consultData } = await supabase
        .from('consultations')
        .select('*')
        .eq('contador_id', user!.id)
        .order('created_at', { ascending: false });

      setConsultations(consultData || []);

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
            clientsMap.set(c.user_id, { user_id: c.user_id, email: '', full_name: null, consultations_count: 1, total_spent: c.price_cents, last_consultation: c.created_at });
          }
        }
        const clientIds = Array.from(clientsMap.keys());
        const { data: profilesData } = await supabase.from('profiles').select('user_id, email, full_name').in('user_id', clientIds);
        if (profilesData) {
          for (const p of profilesData) {
            const client = clientsMap.get(p.user_id);
            if (client) { client.email = p.email || ''; client.full_name = p.full_name; }
          }
        }
        setClients(Array.from(clientsMap.values()).sort((a, b) => b.consultations_count - a.consultations_count));
      }
    } catch (error) { console.error('Error:', error); }
    finally { setIsLoading(false); setIsRefreshing(false); }
  };

  const handleRefresh = async () => { setIsRefreshing(true); await fetchContadorData(); toast({ title: 'Dados atualizados!' }); };
  const handleTabChange = (tab: string) => { setActiveTab(tab); setSearchParams({ tab }); setMobileMenuOpen(false); };
  const formatCurrency = (cents: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  const handleUpdateConsultation = async (consultationId: string, status: string) => {
    if (isSimulation) {
      setConsultations(prev => prev.map(c => c.id === consultationId ? { ...c, status, completed_at: status === 'completed' ? new Date().toISOString() : c.completed_at } : c));
      toast({ title: 'Consulta atualizada!' });
      return;
    }
    const updateData: any = { status };
    if (status === 'completed') updateData.completed_at = new Date().toISOString();
    const { error } = await supabase.from('consultations').update(updateData).eq('id', consultationId);
    if (!error) { toast({ title: 'Consulta atualizada!' }); fetchContadorData(); }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    if (isSimulation) {
      setTimeout(() => { toast({ title: 'Perfil salvo (simulação)!' }); setIsSaving(false); }, 1000);
      return;
    }
    try {
      const profileData = { user_id: user!.id, crc_number: crcNumber, specialty, bio, hourly_rate_cents: Math.round(parseFloat(hourlyRate) * 100), available: isAvailable };
      if (contadorProfile) {
        await supabase.from('contador_profiles').update(profileData).eq('id', contadorProfile.id);
      } else {
        await supabase.from('contador_profiles').insert(profileData);
      }
      toast({ title: 'Perfil salvo!' });
      fetchContadorData();
    } catch (error: any) { toast({ variant: 'destructive', title: 'Erro', description: error.message }); }
    finally { setIsSaving(false); }
  };

  const getStatusBadge = (status: string) => {
    const c: Record<string, { class: string; icon: any; label: string }> = {
      pending: { class: 'bg-amber-500/10 text-amber-500', icon: Clock, label: 'Pendente' },
      scheduled: { class: 'bg-blue-500/10 text-blue-500', icon: Calendar, label: 'Agendada' },
      completed: { class: 'bg-emerald-500/10 text-emerald-500', icon: CheckCircle, label: 'Concluída' },
      cancelled: { class: 'bg-red-500/10 text-red-500', icon: XCircle, label: 'Cancelada' },
    };
    const cfg = c[status] || c.pending;
    const Icon = cfg.icon;
    return <Badge variant="outline" className={cfg.class}><Icon className="h-3 w-3 mr-1" />{cfg.label}</Badge>;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex w-full">
        {/* Sidebar placeholder */}
        <div className="hidden lg:block w-56 border-r bg-card/50">
          <div className="p-4 space-y-4">
            <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 w-full rounded-lg bg-muted/60 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 p-8">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
              <FileText className="absolute inset-0 m-auto h-8 w-8 text-blue-500/60" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Carregando Painel</h2>
              <p className="text-muted-foreground text-sm">Verificando perfil e permissões do contador...</p>
            </div>
            <div className="flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i}
                  className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pendingConsultations = consultations.filter(c => c.status === 'pending');
  const scheduledConsultations = consultations.filter(c => c.status === 'scheduled');
  const completedConsultations = consultations.filter(c => c.status === 'completed');
  const totalEarnings = completedConsultations.reduce((sum, c) => sum + c.price_cents - c.platform_fee_cents, 0);
  const totalPlatformFees = completedConsultations.reduce((sum, c) => sum + c.platform_fee_cents, 0);

  const earningsData = [
    { month: 'Jul', ganhos: totalEarnings * 0.5 },
    { month: 'Ago', ganhos: totalEarnings * 0.6 },
    { month: 'Set', ganhos: totalEarnings * 0.7 },
    { month: 'Out', ganhos: totalEarnings * 0.8 },
    { month: 'Nov', ganhos: totalEarnings * 0.9 },
    { month: 'Dez', ganhos: totalEarnings },
  ];

  const activities = consultations.slice(0, 5).map(c => ({
    id: c.id,
    type: 'consultation' as const,
    title: c.status === 'completed' ? 'Consulta concluída' : c.status === 'scheduled' ? 'Consulta agendada' : 'Nova solicitação',
    description: formatCurrency(c.price_cents - c.platform_fee_cents),
    timestamp: new Date(c.created_at).toLocaleDateString('pt-BR'),
  }));

  return (
    <div className="min-h-screen bg-background flex w-full">
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />}
      <div className="hidden lg:block">
        <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} variant="contador" activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <AppSidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} variant="contador" activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
      
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56'}`}>
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}><Menu className="h-5 w-5" /></Button>
              <div className="p-2 rounded-xl bg-blue-500/10 hidden sm:flex"><FileText className="h-6 w-6 text-blue-500" /></div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg lg:text-2xl font-bold">Painel do Contador</h1>
                  {isSimulation && <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">Simulação</Badge>}
                </div>
                <p className="text-sm text-muted-foreground hidden sm:block">{profile?.full_name || 'Contador'} • {contadorProfile?.specialty || 'Especialista'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationCenter notifications={notifications} unreadCount={unreadCount} onMarkAsRead={markAsRead} onMarkAllAsRead={markAllAsRead} onClear={clearNotifications} />
              <Badge className={`hidden sm:flex ${isAvailable ? 'bg-emerald-500/20 text-emerald-600' : 'bg-muted'}`}>{isAvailable ? 'Disponível' : 'Indisponível'}</Badge>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="hidden sm:flex">
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6 space-y-6">
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatsCard icon={Clock} label="Pendentes" value={pendingConsultations.length} color="accent" />
                <StatsCard icon={Calendar} label="Agendadas" value={scheduledConsultations.length} color="info" />
                <StatsCard icon={Check} label="Concluídas" value={completedConsultations.length} color="success" />
                <StatsCard icon={Wallet} label="Ganhos" value={formatCurrency(totalEarnings)} color="success" />
                <StatsCard icon={Star} label="Avaliação" value={contadorProfile?.rating ? Number(contadorProfile.rating).toFixed(1) : '5.0'} color="accent" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-card border-border shadow-soft">
                  <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-500" />Evolução dos Ganhos</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={earningsData}>
                        <defs><linearGradient id="colorGanhos" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <YAxis tickFormatter={(v) => `R$${(v / 100).toFixed(0)}`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Area type="monotone" dataKey="ganhos" stroke="hsl(142, 76%, 36%)" strokeWidth={2} fillOpacity={1} fill="url(#colorGanhos)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <ActivityFeed activities={activities} title="Atividade Recente" />
              </div>
              {pendingConsultations.length > 0 && (
                <Card className="bg-amber-500/5 border-amber-500/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-amber-500" />Ação Necessária</CardTitle>
                      <Badge className="bg-amber-500/20 text-amber-600">{pendingConsultations.length} pendente{pendingConsultations.length > 1 ? 's' : ''}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pendingConsultations.slice(0, 3).map((c) => (
                        <div key={c.id} className="flex items-center justify-between p-4 bg-card rounded-lg border">
                          <div>
                            <p className="font-medium">Cliente #{c.user_id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">{new Date(c.created_at).toLocaleDateString('pt-BR')} • {formatCurrency(c.price_cents - c.platform_fee_cents)}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleUpdateConsultation(c.id, 'scheduled')} className="bg-emerald-600 hover:bg-emerald-700"><Check className="h-4 w-4 mr-1" />Aceitar</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleUpdateConsultation(c.id, 'cancelled')}><X className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {activeTab === 'stats' && <ContadorStats consultations={consultations} />}
          
          {activeTab === 'agenda' && <ContadorAgenda />}

          {activeTab === 'company-opening' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-emerald-500" />
                  Abertura de Empresas
                </h2>
                <p className="text-muted-foreground">Gerencie solicitações de abertura de empresa com precificação</p>
              </div>
              <CompanyOpeningManagement />
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <ScrollText className="h-6 w-6 text-primary" />
                  Gestão de Certidões
                </h2>
                <p className="text-muted-foreground">Gerencie solicitações de certidões e faça upload dos documentos emitidos</p>
              </div>
              <CertificateManagement />
            </div>
          )}

          {activeTab === 'ir' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-6 w-6 text-amber-500" />
                  Gestão de Imposto de Renda
                </h2>
                <p className="text-muted-foreground">Gerencie solicitações de declaração de IR dos seus clientes</p>
              </div>
              <IRManagement />
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Central de Atualizações Legais</h2>
                <p className="text-muted-foreground">Mantenha-se atualizado com as últimas mudanças na legislação tributária</p>
              </div>
              <LegalUpdates trialDaysRemaining={30} isTrialActive={true} />
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Chat com Clientes</h2>
                <p className="text-muted-foreground">Converse com seus clientes - envie mensagens, áudios e documentos</p>
              </div>
              <ProfessionalChat isContador={true} />
            </div>
          )}

          {activeTab === 'consultations' && (
            <Card className="bg-card border-border shadow-soft">
              <CardHeader><CardTitle>Todas as Consultas</CardTitle><CardDescription>Histórico completo</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {consultations.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                      <div>
                        <p className="font-medium">Cliente #{c.user_id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">{new Date(c.created_at).toLocaleDateString('pt-BR')}</p>
                        {c.notes && <p className="text-xs text-muted-foreground mt-1">Notas: {c.notes}</p>}
                      </div>
                      <div className="text-right space-y-2">
                        <p className="font-bold">{formatCurrency(c.price_cents - c.platform_fee_cents)}</p>
                        {getStatusBadge(c.status)}
                        <div className="flex gap-2 justify-end">
                          {c.status === 'pending' && (
                            <>
                              <Button size="sm" onClick={() => handleUpdateConsultation(c.id, 'scheduled')} className="bg-emerald-600"><Check className="h-3 w-3" /></Button>
                              <Button size="sm" variant="destructive" onClick={() => handleUpdateConsultation(c.id, 'cancelled')}><X className="h-3 w-3" /></Button>
                            </>
                          )}
                          {c.status === 'scheduled' && <Button size="sm" onClick={() => handleUpdateConsultation(c.id, 'completed')} className="bg-emerald-600">Concluir</Button>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'clients' && (
            <Card className="bg-card border-border shadow-soft">
              <CardHeader><CardTitle>Meus Clientes</CardTitle><CardDescription>{clients.length} clientes</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clients.map((client) => (
                    <div key={client.user_id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{client.full_name?.[0] || client.email[0]?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium">{client.full_name || 'Cliente'}</p>
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(client.total_spent)}</p>
                        <Badge variant="outline">{client.consultations_count} consulta{client.consultations_count > 1 ? 's' : ''}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'withdrawals' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Saques</h2>
                <p className="text-muted-foreground">Solicite a transferência dos seus ganhos via PIX</p>
              </div>
              <WithdrawalSystem 
                availableBalance={totalEarnings} 
                onWithdrawalCreated={handleRefresh}
              />
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="space-y-6">
              {/* Stripe Connect Section */}
              <StripeConnectSetup />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard icon={Wallet} label="Ganhos Totais" value={formatCurrency(totalEarnings)} color="success" />
                <StatsCard icon={DollarSign} label="Taxa Plataforma" value={formatCurrency(totalPlatformFees)} color="accent" />
                <StatsCard icon={Target} label="Por Consulta" value={formatCurrency(parseInt(hourlyRate) * 100)} color="info" />
                <StatsCard icon={TrendingUp} label="Este Mês" value={formatCurrency(totalEarnings * 0.3)} color="success" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-card border-border shadow-soft">
                  <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-500" />Detalhamento</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {completedConsultations.map((c) => (
                        <div key={c.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium">Cliente #{c.user_id.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">{new Date(c.completed_at || c.created_at).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-600">{formatCurrency(c.price_cents - c.platform_fee_cents)}</p>
                            <p className="text-xs text-muted-foreground">Taxa: {formatCurrency(c.platform_fee_cents)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                {contadorProfile && (
                  <ContadorReportGenerator
                    contadorName={profile?.full_name || 'Contador'}
                    contadorEmail={user?.email || ''}
                    profile={{
                      crc_number: contadorProfile.crc_number,
                      specialty: contadorProfile.specialty,
                      rating: contadorProfile.rating,
                      total_consultations: contadorProfile.total_consultations,
                    }}
                    consultations={consultations}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <Card className="bg-card border-border shadow-soft">
              <CardHeader><CardTitle>Avaliações</CardTitle><CardDescription>Feedback dos clientes</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedConsultations.filter(c => c.rating).map((c) => (
                    <div key={c.id} className="p-4 bg-muted/30 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">Cliente #{c.user_id.slice(0, 8)}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < (c.rating || 0) ? 'text-amber-500 fill-amber-500' : 'text-muted'}`} />)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{c.notes || 'Sem comentário'}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card border-border shadow-soft">
                <CardHeader><CardTitle>Informações Profissionais</CardTitle><CardDescription>Configure seu perfil</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>Número CRC</Label><Input value={crcNumber} onChange={(e) => setCrcNumber(e.target.value)} placeholder="12345/O-SP" /></div>
                  <div className="space-y-2"><Label>Especialidade</Label><Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Reforma Tributária, Lucro Real..." /></div>
                  <div className="space-y-2"><Label>Biografia</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Conte sobre sua experiência..." className="min-h-[100px]" /></div>
                  <div className="space-y-2"><Label>Valor da Consulta (R$)</Label><Input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} /></div>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div><Label>Disponível para consultas</Label><p className="text-xs text-muted-foreground">Aparecer na lista</p></div>
                    <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
                  </div>
                  <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full">{isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Salvar Perfil</Button>
                </CardContent>
              </Card>
              <Card className="bg-card border-border shadow-soft">
                <CardHeader><CardTitle>Estatísticas do Perfil</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Avaliação Média</span>
                    <div className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-500 fill-amber-500" /><span className="font-bold">{contadorProfile?.rating?.toFixed(1) || '5.0'}</span></div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Consultas Concluídas</span>
                    <span className="font-bold">{completedConsultations.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Clientes Atendidos</span>
                    <span className="font-bold">{clients.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Taxa de Conclusão</span>
                    <span className="font-bold text-emerald-600">{consultations.length > 0 ? Math.round((completedConsultations.length / consultations.length) * 100) : 0}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      {/* Floating AI Agent */}
      <FloatingAIAgent context="contador" />
    </div>
  );
};

export default ContadorPanel;