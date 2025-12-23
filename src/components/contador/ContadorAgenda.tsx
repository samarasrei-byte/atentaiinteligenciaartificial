import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  X, 
  MessageSquare,
  Video,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Plus,
  LayoutGrid,
  List,
  Zap,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { format, addDays, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, isToday, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  date: Date;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'scheduled';
  notes?: string;
  type: 'consultation' | 'followup' | 'urgent';
  meetingType: 'video' | 'presencial' | 'phone';
  userId: string;
}

interface Client {
  user_id: string;
  full_name: string;
  email: string;
}

export const ContadorAgenda: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'list'>('day');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newConsultation, setNewConsultation] = useState({
    clientId: '',
    date: new Date(),
    time: '09:00',
    meetingType: 'video' as 'video' | 'presencial' | 'phone',
    notes: '',
  });

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 20) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  }, []);

  const fetchClients = async () => {
    setIsLoadingClients(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .not('user_id', 'eq', user?.id);

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoadingClients(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    fetchClients();
    setNewConsultation({
      clientId: '',
      date: selectedDate,
      time: '09:00',
      meetingType: 'video',
      notes: '',
    });
  };

  const handleCreateConsultation = async () => {
    if (!newConsultation.clientId || !user) {
      toast({ variant: 'destructive', title: 'Selecione um cliente' });
      return;
    }

    setIsCreating(true);
    try {
      const [hours, minutes] = newConsultation.time.split(':').map(Number);
      const scheduledAt = setMinutes(setHours(newConsultation.date, hours), minutes);

      const { error } = await supabase.from('consultations').insert({
        user_id: newConsultation.clientId,
        contador_id: user.id,
        scheduled_at: scheduledAt.toISOString(),
        status: 'scheduled',
        notes: newConsultation.notes || null,
      });

      if (error) throw error;

      toast({ title: 'Consulta agendada com sucesso!' });
      setIsModalOpen(false);
      fetchConsultations();
    } catch (error) {
      console.error('Error creating consultation:', error);
      toast({ variant: 'destructive', title: 'Erro ao agendar consulta' });
    } finally {
      setIsCreating(false);
    }
  };

  const fetchConsultations = async () => {
    if (!user) return;

    try {
      // Fetch consultations where user is contador
      const { data: consultations, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('contador_id', user.id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      // Fetch profiles for client names
      const userIds = [...new Set(consultations?.map(c => c.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, phone')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Transform consultations to appointments
      const transformedAppointments: Appointment[] = (consultations || []).map(c => {
        const profile = profileMap.get(c.user_id);
        const scheduledDate = c.scheduled_at ? new Date(c.scheduled_at) : new Date(c.created_at);

        return {
          id: c.id,
          clientName: profile?.full_name || 'Cliente',
          clientEmail: profile?.email || '',
          clientPhone: profile?.phone || undefined,
          date: scheduledDate,
          time: format(scheduledDate, 'HH:mm'),
          duration: 60, // Default duration
          status: c.status as Appointment['status'],
          notes: c.notes || undefined,
          type: c.status === 'pending' ? 'urgent' : 'consultation',
          meetingType: 'video',
          userId: c.user_id,
        };
      });

      setAppointments(transformedAppointments);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar agenda',
        description: 'Não foi possível carregar as consultas.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConsultations();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('contador-agenda')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consultations',
          filter: `contador_id=eq.${user?.id}`,
        },
        () => {
          fetchConsultations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchConsultations();
  };

  const getStatusConfig = (status: Appointment['status']) => {
    const configs = {
      pending: { bg: 'bg-accent/20', text: 'text-accent', border: 'border-accent/50', label: 'Pendente', icon: Clock },
      confirmed: { bg: 'bg-success/20', text: 'text-success', border: 'border-success/50', label: 'Confirmado', icon: CheckCircle },
      completed: { bg: 'bg-info/20', text: 'text-info', border: 'border-info/50', label: 'Concluído', icon: CheckCircle },
      cancelled: { bg: 'bg-destructive/20', text: 'text-destructive', border: 'border-destructive/50', label: 'Cancelado', icon: X },
      scheduled: { bg: 'bg-success/20', text: 'text-success', border: 'border-success/50', label: 'Agendado', icon: CalendarIcon },
    };
    return configs[status] || configs.pending;
  };

  const getTypeConfig = (type: Appointment['type']) => {
    const configs = {
      consultation: { bg: 'bg-primary/20', text: 'text-primary', label: 'Consulta', icon: User },
      followup: { bg: 'bg-info/20', text: 'text-info', label: 'Retorno', icon: MessageSquare },
      urgent: { bg: 'bg-destructive/20', text: 'text-destructive', label: 'Urgente', icon: Zap },
    };
    return configs[type];
  };

  const getMeetingIcon = (type: Appointment['meetingType']) => {
    const icons = {
      video: Video,
      presencial: MapPin,
      phone: Phone,
    };
    return icons[type];
  };

  const handleConfirm = async (id: string) => {
    const { error } = await supabase
      .from('consultations')
      .update({ status: 'scheduled' })
      .eq('id', id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao confirmar consulta' });
    } else {
      toast({ title: 'Consulta confirmada!' });
      fetchConsultations();
    }
  };

  const handleCancel = async (id: string) => {
    const { error } = await supabase
      .from('consultations')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao cancelar consulta' });
    } else {
      toast({ title: 'Consulta cancelada' });
      fetchConsultations();
    }
  };

  const handleComplete = async (id: string) => {
    const { error } = await supabase
      .from('consultations')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao concluir consulta' });
    } else {
      toast({ title: 'Consulta concluída!' });
      fetchConsultations();
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      return true;
    });
  }, [appointments, filterStatus]);

  const selectedDateAppointments = useMemo(() => {
    return filteredAppointments
      .filter(a => isSameDay(a.date, selectedDate))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [filteredAppointments, selectedDate]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  const getAppointmentsForDay = (date: Date) => {
    return filteredAppointments.filter(a => isSameDay(a.date, date));
  };

  const stats = useMemo(() => ({
    today: appointments.filter(a => isSameDay(a.date, new Date())).length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length,
    urgent: appointments.filter(a => a.type === 'urgent' && a.status !== 'completed' && a.status !== 'cancelled').length,
  }), [appointments]);

  const AppointmentCard = ({ appointment, compact = false }: { appointment: Appointment; compact?: boolean }) => {
    const statusConfig = getStatusConfig(appointment.status);
    const typeConfig = getTypeConfig(appointment.type);
    const MeetingIcon = getMeetingIcon(appointment.meetingType);
    const StatusIcon = statusConfig.icon;

    if (compact) {
      return (
        <div className={cn(
          "p-2 rounded-lg border-l-4 cursor-pointer hover:scale-[1.02] transition-all",
          statusConfig.bg,
          statusConfig.border
        )}>
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm text-foreground truncate">{appointment.clientName}</span>
            {appointment.type === 'urgent' && <Zap className="h-3 w-3 text-destructive" />}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Clock className="h-3 w-3" />
            <span>{appointment.time}</span>
            <span className="mx-1">•</span>
            <MeetingIcon className="h-3 w-3" />
          </div>
        </div>
      );
    }

    return (
      <div className={cn(
        "p-4 rounded-xl border-l-4 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all group",
        statusConfig.border
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className={cn("p-2 rounded-lg", typeConfig.bg)}>
                <User className={cn("h-4 w-4", typeConfig.text)} />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{appointment.clientName}</h4>
                <p className="text-sm text-muted-foreground">{appointment.clientEmail}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">{appointment.time}</span>
                <span className="text-muted-foreground">({appointment.duration}min)</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                <MeetingIcon className="h-4 w-4 text-info" />
                <span className="capitalize">{appointment.meetingType}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn(statusConfig.bg, statusConfig.text, "border-0 gap-1")}>
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
              <Badge className={cn(typeConfig.bg, typeConfig.text, "border-0")}>
                {typeConfig.label}
              </Badge>
            </div>
            
            {appointment.notes && (
              <p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/30 border border-border/50">
                {appointment.notes}
              </p>
            )}
          </div>
          
          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {appointment.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  className="bg-success text-success-foreground hover:bg-success/90"
                  onClick={() => handleConfirm(appointment.id)}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleCancel(appointment.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
              <>
                <Button size="sm" variant="outline" className="border-primary/50">
                  <Video className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleComplete(appointment.id)}>
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Agenda de Consultas</h2>
          <p className="text-muted-foreground">Gerencie seus atendimentos de forma eficiente</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
          <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={handleOpenModal}>
            <Plus className="h-4 w-4" />
            Nova Consulta
          </Button>
        </div>
      </div>

      {/* Modal Nova Consulta */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Nova Consulta
            </DialogTitle>
            <DialogDescription>
              Agende uma nova consulta selecionando o cliente, data e horário.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Cliente */}
            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              <Select
                value={newConsultation.clientId}
                onValueChange={(value) => setNewConsultation(prev => ({ ...prev, clientId: value }))}
              >
                <SelectTrigger id="client" className="w-full">
                  <SelectValue placeholder={isLoadingClients ? "Carregando..." : "Selecione um cliente"} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.user_id} value={client.user_id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{client.full_name || client.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label>Data</Label>
              <div className="border rounded-lg p-3">
                <Calendar
                  mode="single"
                  selected={newConsultation.date}
                  onSelect={(date) => date && setNewConsultation(prev => ({ ...prev, date }))}
                  locale={ptBR}
                  className="rounded-lg pointer-events-auto mx-auto"
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </div>
            </div>

            {/* Horário */}
            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <Select
                value={newConsultation.time}
                onValueChange={(value) => setNewConsultation(prev => ({ ...prev, time: value }))}
              >
                <SelectTrigger id="time" className="w-full">
                  <SelectValue placeholder="Selecione um horário" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{slot}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Reunião */}
            <div className="space-y-2">
              <Label htmlFor="meetingType">Tipo de Reunião</Label>
              <Select
                value={newConsultation.meetingType}
                onValueChange={(value: 'video' | 'presencial' | 'phone') => 
                  setNewConsultation(prev => ({ ...prev, meetingType: value }))
                }
              >
                <SelectTrigger id="meetingType" className="w-full">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-info" />
                      <span>Videochamada</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="presencial">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-success" />
                      <span>Presencial</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="phone">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-accent" />
                      <span>Telefone</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Adicione observações sobre a consulta..."
                value={newConsultation.notes}
                onChange={(e) => setNewConsultation(prev => ({ ...prev, notes: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateConsultation} 
              disabled={isCreating || !newConsultation.clientId}
              className="bg-primary"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Agendando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Agendar Consulta
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.today}</p>
              <p className="text-sm text-muted-foreground">Hoje</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent/20">
              <Clock className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/20">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.confirmed}</p>
              <p className="text-sm text-muted-foreground">Confirmadas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/20">
              <Zap className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.urgent}</p>
              <p className="text-sm text-muted-foreground">Urgentes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Sidebar */}
        <Card className="lg:col-span-1 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Calendário
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ptBR}
              className="rounded-lg pointer-events-auto"
              modifiers={{
                hasAppointment: (date) => getAppointmentsForDay(date).length > 0,
              }}
              modifiersStyles={{
                hasAppointment: {
                  fontWeight: 'bold',
                  backgroundColor: 'hsl(var(--primary) / 0.1)',
                  color: 'hsl(var(--primary))',
                },
              }}
            />
            
            {/* Quick Stats for Selected Date */}
            <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/50">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-foreground">
                  {selectedDateAppointments.length}
                </span>
                <span className="text-sm text-muted-foreground">consultas</span>
              </div>
            </div>

            {/* Filter */}
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Filtrar por status</p>
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'scheduled', 'completed'].map(status => (
                  <Button
                    key={status}
                    size="sm"
                    variant={filterStatus === status ? 'default' : 'outline'}
                    className={cn(
                      "text-xs",
                      filterStatus === status && "bg-primary"
                    )}
                    onClick={() => setFilterStatus(status)}
                  >
                    {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendentes' : status === 'scheduled' ? 'Agendadas' : 'Concluídas'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                  <CardTitle className="text-lg">
                    {isToday(selectedDate) ? 'Hoje' : format(selectedDate, "EEEE", { locale: ptBR })}
                  </CardTitle>
                  <CardDescription>
                    {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'day' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('day')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {viewMode === 'day' ? (
                <div className="space-y-4">
                  {selectedDateAppointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="p-4 rounded-full bg-muted/50 mb-4">
                        <CalendarIcon className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma consulta</h3>
                      <p className="text-muted-foreground max-w-sm">
                        Não há consultas agendadas para este dia.
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      {selectedDateAppointments.map((appointment, index) => (
                        <div key={appointment.id} className="relative pl-8 pb-4">
                          {index < selectedDateAppointments.length - 1 && (
                            <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-border" />
                          )}
                          <div
                            className={cn(
                              "absolute left-0 top-2 w-6 h-6 rounded-full flex items-center justify-center",
                              getStatusConfig(appointment.status).bg
                            )}
                          >
                            <div
                              className={cn(
                                "w-3 h-3 rounded-full",
                                appointment.status === 'scheduled' || appointment.status === 'confirmed'
                                  ? 'bg-success'
                                  : appointment.status === 'pending'
                                    ? 'bg-accent'
                                    : appointment.status === 'completed'
                                      ? 'bg-info'
                                      : 'bg-destructive'
                              )}
                            />
                          </div>
                          <AppointmentCard appointment={appointment} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : viewMode === 'week' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
                    {weekDays.map((day) => {
                      const dayAppts = getAppointmentsForDay(day).sort((a, b) => a.time.localeCompare(b.time));
                      return (
                        <div
                          key={day.toISOString()}
                          className={cn(
                            'rounded-xl border border-border p-3 bg-muted/10 hover:bg-muted/20 transition-colors',
                            isToday(day) && 'ring-2 ring-primary/40',
                            isSameDay(day, selectedDate) && 'border-primary/40'
                          )}
                        >
                          <button
                            className="w-full text-left"
                            onClick={() => {
                              setSelectedDate(day);
                              setViewMode('day');
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-muted-foreground uppercase">
                                  {format(day, 'EEE', { locale: ptBR })}
                                </p>
                                <p className="text-lg font-bold text-foreground">{format(day, 'dd')}</p>
                              </div>
                              {dayAppts.length > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {dayAppts.length}
                                </Badge>
                              )}
                            </div>
                          </button>

                          <div className="mt-3 space-y-2">
                            {dayAppts.length === 0 ? (
                              <p className="text-xs text-muted-foreground">Sem consultas</p>
                            ) : (
                              dayAppts.slice(0, 4).map((appointment) => (
                                <AppointmentCard key={appointment.id} appointment={appointment} compact />
                              ))
                            )}
                            {dayAppts.length > 4 && (
                              <p className="text-xs text-muted-foreground">+{dayAppts.length - 4} mais</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAppointments
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .slice(0, 10)
                    .map(appointment => (
                      <div
                        key={appointment.id}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border transition-all hover:bg-muted/50",
                          isSameDay(appointment.date, selectedDate) && "ring-2 ring-primary/50"
                        )}
                      >
                        <div className="text-center min-w-[50px]">
                          <p className="text-lg font-bold text-foreground">
                            {format(appointment.date, 'dd')}
                          </p>
                          <p className="text-xs text-muted-foreground uppercase">
                            {format(appointment.date, 'MMM', { locale: ptBR })}
                          </p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{appointment.clientName}</span>
                            {appointment.type === 'urgent' && (
                              <Badge className="bg-destructive/20 text-destructive border-0 text-xs">
                                <Zap className="h-3 w-3 mr-1" />
                                Urgente
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{appointment.time} • {appointment.duration}min</p>
                        </div>
                        <Badge
                          className={cn(
                            getStatusConfig(appointment.status).bg,
                            getStatusConfig(appointment.status).text,
                            "border-0"
                          )}
                        >
                          {getStatusConfig(appointment.status).label}
                        </Badge>
                      </div>
                    ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContadorAgenda;
