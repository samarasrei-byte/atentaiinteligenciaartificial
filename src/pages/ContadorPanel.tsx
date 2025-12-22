import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import AppSidebar from '@/components/layout/AppSidebar';
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
} from 'lucide-react';

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
}

const ContadorPanel = () => {
  const navigate = useNavigate();
  const { user, hasRole, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [contadorProfile, setContadorProfile] = useState<ContadorProfile | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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
    } catch (error) {
      console.error('Error fetching contador data:', error);
    } finally {
      setIsLoading(false);
    }
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
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-accent text-accent-foreground', label: 'Pendente' },
      scheduled: { color: 'bg-info text-info-foreground', label: 'Agendada' },
      completed: { color: 'bg-success text-success-foreground', label: 'Concluída' },
      cancelled: { color: 'bg-destructive text-destructive-foreground', label: 'Cancelada' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
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

  const statsCards = [
    { icon: Clock, label: 'Pendentes', value: pendingConsultations.length, color: 'text-accent', bgColor: 'bg-accent/10' },
    { icon: Calendar, label: 'Agendadas', value: scheduledConsultations.length, color: 'text-info', bgColor: 'bg-info/10' },
    { icon: Check, label: 'Concluídas', value: completedConsultations.length, color: 'text-success', bgColor: 'bg-success/10' },
    { icon: Wallet, label: 'Ganhos', value: formatCurrency(totalEarnings), color: 'text-success', bgColor: 'bg-success/10', isLarge: true },
    { icon: Star, label: 'Avaliação', value: contadorProfile?.rating ? Number(contadorProfile.rating).toFixed(1) : '5.0', color: 'text-accent', bgColor: 'bg-accent/10' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        variant="contador"
      />
      
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <FileText className="h-6 w-6 text-info" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Painel do Contador</h1>
                <p className="text-sm text-muted-foreground">Gerencie suas consultas e perfil</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={isAvailable ? 'bg-success' : 'bg-muted'}>
                {isAvailable ? 'Disponível' : 'Indisponível'}
              </Badge>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
              >
                Voltar ao Dashboard
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {statsCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="bg-card border-border shadow-soft">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className={`font-bold ${stat.isLarge ? 'text-lg' : 'text-xl'} text-foreground`}>
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Consultations */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card border-border shadow-soft">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Consultas Pendentes</CardTitle>
                      <CardDescription>Solicitações aguardando sua resposta</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-accent border-accent">
                      {pendingConsultations.length} pendentes
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {pendingConsultations.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhuma consulta pendente</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingConsultations.slice(0, 5).map((consultation) => (
                        <div 
                          key={consultation.id} 
                          className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              Cliente #{consultation.user_id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(consultation.created_at).toLocaleDateString('pt-BR')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Valor: {formatCurrency(consultation.price_cents)} 
                              <span className="text-success ml-1">
                                (você recebe {formatCurrency(consultation.price_cents - consultation.platform_fee_cents)})
                              </span>
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateConsultation(consultation.id, 'scheduled')}
                              className="bg-success hover:bg-success/90"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUpdateConsultation(consultation.id, 'cancelled')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Scheduled Consultations */}
              <Card className="bg-card border-border shadow-soft">
                <CardHeader>
                  <CardTitle className="text-xl">Consultas Agendadas</CardTitle>
                  <CardDescription>Próximas sessões com clientes</CardDescription>
                </CardHeader>
                <CardContent>
                  {scheduledConsultations.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">Nenhuma consulta agendada</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {scheduledConsultations.map((consultation) => (
                        <div 
                          key={consultation.id} 
                          className="flex items-center justify-between p-4 bg-info/5 rounded-lg border border-info/20"
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              Cliente #{consultation.user_id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(consultation.price_cents - consultation.platform_fee_cents)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateConsultation(consultation.id, 'completed')}
                            className="bg-success hover:bg-success/90"
                          >
                            Concluir
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Profile Settings */}
            <div className="space-y-6">
              <Card className="bg-card border-border shadow-soft">
                <CardHeader>
                  <CardTitle className="text-xl">Meu Perfil</CardTitle>
                  <CardDescription>Configure suas informações</CardDescription>
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
                      placeholder="Ex: Reforma Tributária"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografia</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Conte sobre sua experiência..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate">Valor por Sessão (R$)</Label>
                    <Input
                      id="rate"
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="150"
                    />
                    <p className="text-xs text-muted-foreground">10% destinado à plataforma</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Label>Disponibilidade</Label>
                    <Switch
                      checked={isAvailable}
                      onCheckedChange={setIsAvailable}
                    />
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-full"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar Perfil
                  </Button>
                </CardContent>
              </Card>

              {/* Earnings Summary */}
              <Card className="bg-gradient-to-br from-success to-success/80 text-success-foreground">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white/10">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm opacity-80">Total Ganhos</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-sm opacity-80">
                      {completedConsultations.length} consultas concluídas
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContadorPanel;
