import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Filter,
  LayoutGrid,
  List,
  AlertCircle,
  Zap
} from 'lucide-react';
import { format, addDays, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isBefore, addHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  date: Date;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  type: 'consultation' | 'followup' | 'urgent';
  meetingType: 'video' | 'presencial' | 'phone';
}

const generateMockAppointments = (): Appointment[] => {
  const today = new Date();
  return [
    {
      id: '1',
      clientName: 'Maria Silva',
      clientEmail: 'maria@empresa.com',
      clientPhone: '(11) 99999-1111',
      date: today,
      time: '09:00',
      duration: 60,
      status: 'confirmed',
      notes: 'Discussão sobre mudança de regime tributário para Lucro Presumido',
      type: 'consultation',
      meetingType: 'video',
    },
    {
      id: '2',
      clientName: 'João Santos',
      clientEmail: 'joao@tech.com',
      clientPhone: '(11) 99999-2222',
      date: today,
      time: '11:30',
      duration: 30,
      status: 'pending',
      type: 'followup',
      meetingType: 'phone',
    },
    {
      id: '3',
      clientName: 'Carlos Mendes',
      clientEmail: 'carlos@comercio.com',
      date: today,
      time: '14:00',
      duration: 45,
      status: 'confirmed',
      notes: 'Análise de documentos para Reforma Tributária',
      type: 'urgent',
      meetingType: 'video',
    },
    {
      id: '4',
      clientName: 'Ana Costa',
      clientEmail: 'ana@startup.com',
      date: addDays(today, 1),
      time: '10:00',
      duration: 60,
      status: 'confirmed',
      notes: 'Planejamento tributário anual',
      type: 'consultation',
      meetingType: 'presencial',
    },
    {
      id: '5',
      clientName: 'Pedro Oliveira',
      clientEmail: 'pedro@industria.com',
      date: addDays(today, 1),
      time: '15:00',
      duration: 45,
      status: 'pending',
      type: 'consultation',
      meetingType: 'video',
    },
    {
      id: '6',
      clientName: 'Fernanda Lima',
      clientEmail: 'fernanda@servicos.com',
      date: addDays(today, 2),
      time: '09:30',
      duration: 60,
      status: 'confirmed',
      type: 'followup',
      meetingType: 'phone',
    },
    {
      id: '7',
      clientName: 'Ricardo Souza',
      clientEmail: 'ricardo@tech.com',
      date: addDays(today, 3),
      time: '11:00',
      duration: 30,
      status: 'pending',
      type: 'urgent',
      meetingType: 'video',
    },
  ];
};

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00'
];

export const ContadorAgenda: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(generateMockAppointments);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'list'>('day');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getStatusConfig = (status: Appointment['status']) => {
    const configs = {
      pending: { bg: 'bg-amber-500/20', text: 'text-amber-500', border: 'border-amber-500/50', label: 'Pendente', icon: Clock },
      confirmed: { bg: 'bg-emerald-500/20', text: 'text-emerald-500', border: 'border-emerald-500/50', label: 'Confirmado', icon: CheckCircle },
      completed: { bg: 'bg-blue-500/20', text: 'text-blue-500', border: 'border-blue-500/50', label: 'Concluído', icon: CheckCircle },
      cancelled: { bg: 'bg-red-500/20', text: 'text-red-500', border: 'border-red-500/50', label: 'Cancelado', icon: X },
    };
    return configs[status];
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

  const handleConfirm = (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmed' as const } : a));
  };

  const handleCancel = (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' as const } : a));
  };

  const handleComplete = (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'completed' as const } : a));
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
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
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
            
            <div className="flex items-center gap-4 text-sm">
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
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleConfirm(appointment.id)}>
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleCancel(appointment.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            {appointment.status === 'confirmed' && (
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Agenda de Consultas</h2>
          <p className="text-muted-foreground">Gerencie seus atendimentos de forma eficiente</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="h-4 w-4" />
          Nova Consulta
        </Button>
      </div>

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
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/20">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
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
                {['all', 'pending', 'confirmed', 'completed'].map(status => (
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
                    {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendentes' : status === 'confirmed' ? 'Confirmadas' : 'Concluídas'}
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
                        Não há consultas agendadas para este dia. Clique em "Nova Consulta" para agendar.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Timeline View */}
                      <div className="relative">
                        {selectedDateAppointments.map((appointment, index) => (
                          <div key={appointment.id} className="relative pl-8 pb-4">
                            {/* Timeline Line */}
                            {index < selectedDateAppointments.length - 1 && (
                              <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-border" />
                            )}
                            {/* Timeline Dot */}
                            <div className={cn(
                              "absolute left-0 top-2 w-6 h-6 rounded-full flex items-center justify-center",
                              getStatusConfig(appointment.status).bg
                            )}>
                              <div className={cn(
                                "w-3 h-3 rounded-full",
                                appointment.status === 'confirmed' ? 'bg-emerald-500' :
                                appointment.status === 'pending' ? 'bg-amber-500' :
                                appointment.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'
                              )} />
                            </div>
                            <AppointmentCard appointment={appointment} />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
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
                        <Badge className={cn(
                          getStatusConfig(appointment.status).bg,
                          getStatusConfig(appointment.status).text,
                          "border-0"
                        )}>
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
