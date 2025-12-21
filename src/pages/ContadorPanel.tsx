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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  ArrowLeft, 
  FileText,
  Calendar,
  DollarSign,
  Star,
  Users,
  Check,
  X,
  Clock,
  Loader2,
  Shield
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
  user_profile?: {
    full_name: string | null;
    email: string | null;
  };
}

const ContadorPanel = () => {
  const navigate = useNavigate();
  const { user, hasRole, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [contadorProfile, setContadorProfile] = useState<ContadorProfile | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isSaving, setIsSaving] = useState(false);

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
      // Fetch contador profile
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

      // Fetch consultations
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
      pending: { color: 'bg-amber-500', label: 'Pendente' },
      scheduled: { color: 'bg-blue-500', label: 'Agendada' },
      completed: { color: 'bg-green-500', label: 'Concluída' },
      cancelled: { color: 'bg-red-500', label: 'Cancelada' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  const pendingConsultations = consultations.filter(c => c.status === 'pending');
  const completedConsultations = consultations.filter(c => c.status === 'completed');
  const totalEarnings = completedConsultations.reduce((sum, c) => sum + c.price_cents - c.platform_fee_cents, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold text-white">Painel do Contador</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-amber-500/20">
                  <Clock className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Pendentes</p>
                  <p className="text-2xl font-bold text-white">{pendingConsultations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/20">
                  <Check className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Concluídas</p>
                  <p className="text-2xl font-bold text-white">{completedConsultations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/20">
                  <DollarSign className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Ganhos Totais</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(totalEarnings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-amber-500/20">
                  <Star className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Avaliação</p>
                  <p className="text-2xl font-bold text-white">
                    {contadorProfile?.rating ? Number(contadorProfile.rating).toFixed(1) : '5.0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="consultations" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="consultations" className="data-[state=active]:bg-blue-600">
              <Calendar className="h-4 w-4 mr-2" />
              Consultas
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600">
              <Users className="h-4 w-4 mr-2" />
              Meu Perfil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consultations">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">Consultas Solicitadas</CardTitle>
                <CardDescription className="text-slate-400">
                  Gerencie as solicitações de consultoria dos clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {consultations.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">Nenhuma consulta solicitada ainda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {consultations.map((consultation) => (
                      <div key={consultation.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                        <div>
                          <p className="font-medium text-white">
                            Cliente #{consultation.user_id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-slate-400">
                            {new Date(consultation.created_at).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-sm text-slate-400">
                            Valor: {formatCurrency(consultation.price_cents)} (você recebe {formatCurrency(consultation.price_cents - consultation.platform_fee_cents)})
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(consultation.status)}
                          {consultation.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleUpdateConsultation(consultation.id, 'scheduled')}
                                className="bg-blue-600 hover:bg-blue-700"
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
                          )}
                          {consultation.status === 'scheduled' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateConsultation(consultation.id, 'completed')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Concluir
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">Configurações do Perfil</CardTitle>
                <CardDescription className="text-slate-400">
                  Configure suas informações que serão exibidas para os clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="crc" className="text-slate-300">Número CRC</Label>
                    <Input
                      id="crc"
                      value={crcNumber}
                      onChange={(e) => setCrcNumber(e.target.value)}
                      placeholder="Ex: 12345/O-SP"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialty" className="text-slate-300">Especialidade</Label>
                    <Input
                      id="specialty"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder="Ex: Reforma Tributária, Planejamento Fiscal"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-slate-300">Biografia</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Conte um pouco sobre sua experiência..."
                    className="bg-slate-700/50 border-slate-600 text-white min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="rate" className="text-slate-300">Valor por Sessão (R$)</Label>
                    <Input
                      id="rate"
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="150"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                    <p className="text-xs text-slate-500">10% será destinado à plataforma</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Disponibilidade</Label>
                    <div className="flex items-center gap-3 pt-2">
                      <Switch
                        checked={isAvailable}
                        onCheckedChange={setIsAvailable}
                      />
                      <span className="text-slate-300">
                        {isAvailable ? 'Disponível para consultas' : 'Indisponível'}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Salvar Perfil
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ContadorPanel;
