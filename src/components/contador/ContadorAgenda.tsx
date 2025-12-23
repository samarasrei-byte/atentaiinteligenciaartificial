import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, X, MessageSquare } from 'lucide-react';

interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  date: Date;
  time: string;
  duration: number; // minutes
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  type: 'consultation' | 'followup' | 'urgent';
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    clientName: 'Maria Silva',
    clientEmail: 'maria@empresa.com',
    clientPhone: '(11) 99999-1111',
    date: new Date(),
    time: '09:00',
    duration: 60,
    status: 'confirmed',
    notes: 'Discussão sobre mudança de regime tributário',
    type: 'consultation',
  },
  {
    id: '2',
    clientName: 'João Santos',
    clientEmail: 'joao@tech.com',
    clientPhone: '(11) 99999-2222',
    date: new Date(),
    time: '11:00',
    duration: 30,
    status: 'pending',
    type: 'followup',
  },
  {
    id: '3',
    clientName: 'Ana Costa',
    clientEmail: 'ana@startup.com',
    date: new Date(Date.now() + 86400000),
    time: '14:00',
    duration: 60,
    status: 'confirmed',
    notes: 'Análise de impacto da Reforma Tributária',
    type: 'consultation',
  },
  {
    id: '4',
    clientName: 'Pedro Oliveira',
    clientEmail: 'pedro@comercio.com',
    date: new Date(Date.now() + 86400000 * 2),
    time: '10:00',
    duration: 45,
    status: 'pending',
    type: 'urgent',
  },
];

export const ContadorAgenda: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const getStatusConfig = (status: Appointment['status']) => {
    const configs = {
      pending: { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Pendente' },
      confirmed: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', label: 'Confirmado' },
      completed: { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'Concluído' },
      cancelled: { bg: 'bg-red-500/10', text: 'text-red-600', label: 'Cancelado' },
    };
    return configs[status];
  };

  const getTypeConfig = (type: Appointment['type']) => {
    const configs = {
      consultation: { bg: 'bg-primary/10', text: 'text-primary', label: 'Consulta' },
      followup: { bg: 'bg-info/10', text: 'text-info', label: 'Retorno' },
      urgent: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Urgente' },
    };
    return configs[type];
  };

  const handleConfirm = (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmed' as const } : a));
  };

  const handleCancel = (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' as const } : a));
  };

  const todayAppointments = appointments.filter(a => 
    a.date.toDateString() === new Date().toDateString()
  );

  const upcomingAppointments = appointments.filter(a => 
    a.date > new Date() && a.status !== 'cancelled'
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Agenda</h2>
        <p className="text-muted-foreground">Gerencie suas consultas e compromissos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{todayAppointments.length}</p>
            <p className="text-sm text-muted-foreground">Hoje</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{appointments.filter(a => a.status === 'pending').length}</p>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">{upcomingAppointments.length}</p>
            <p className="text-sm text-muted-foreground">Próximas</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-info">{appointments.filter(a => a.type === 'urgent').length}</p>
            <p className="text-sm text-muted-foreground">Urgentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Appointments */}
      <Card className="bg-card border-border shadow-soft">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Agenda de Hoje</CardTitle>
              <CardDescription>{formatDate(new Date())}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma consulta agendada para hoje</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map(appointment => {
                const statusConfig = getStatusConfig(appointment.status);
                const typeConfig = getTypeConfig(appointment.type);
                
                return (
                  <div key={appointment.id} className="p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground">{appointment.clientName}</span>
                          <Badge className={`${typeConfig.bg} ${typeConfig.text} border-0`}>
                            {typeConfig.label}
                          </Badge>
                          <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0`}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {appointment.time} ({appointment.duration}min)
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {appointment.clientEmail}
                          </span>
                          {appointment.clientPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {appointment.clientPhone}
                            </span>
                          )}
                        </div>
                        
                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground bg-background/50 p-2 rounded-lg">
                            {appointment.notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {appointment.status === 'pending' && (
                          <>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleConfirm(appointment.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirmar
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleCancel(appointment.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card className="bg-card border-border shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-info" />
            Próximas Consultas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingAppointments.slice(0, 5).map(appointment => {
              const statusConfig = getStatusConfig(appointment.status);
              const typeConfig = getTypeConfig(appointment.type);
              
              return (
                <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">
                        {appointment.date.getDate()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.date.toLocaleDateString('pt-BR', { month: 'short' })}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{appointment.clientName}</p>
                      <p className="text-sm text-muted-foreground">{appointment.time} - {appointment.duration}min</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${typeConfig.bg} ${typeConfig.text} border-0`}>
                      {typeConfig.label}
                    </Badge>
                    <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0`}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContadorAgenda;
