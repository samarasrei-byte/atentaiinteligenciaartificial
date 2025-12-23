import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, Loader2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConsultationSchedulerProps {
  consultationId: string;
  currentScheduledAt: string | null;
  isContador: boolean;
  onScheduled: (date: string) => void;
}

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00'
];

export function ConsultationScheduler({
  consultationId,
  currentScheduledAt,
  isContador,
  onScheduled
}: ConsultationSchedulerProps) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(
    currentScheduledAt ? new Date(currentScheduledAt) : undefined
  );
  const [time, setTime] = useState<string>(
    currentScheduledAt ? format(new Date(currentScheduledAt), 'HH:mm') : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSchedule = async () => {
    if (!date || !time) {
      toast({
        title: 'Selecione data e horário',
        description: 'Por favor, escolha uma data e horário para a consulta.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const [hours, minutes] = time.split(':').map(Number);
    const scheduledDate = new Date(date);
    scheduledDate.setHours(hours, minutes, 0, 0);

    const { error } = await supabase
      .from('consultations')
      .update({
        scheduled_at: scheduledDate.toISOString(),
        status: 'scheduled',
      })
      .eq('id', consultationId);

    if (error) {
      toast({
        title: 'Erro ao agendar',
        description: 'Não foi possível agendar a consulta. Tente novamente.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    toast({
      title: 'Consulta agendada!',
      description: `Agendada para ${format(scheduledDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
    });

    onScheduled(scheduledDate.toISOString());
    setIsSubmitting(false);
    setIsOpen(false);
  };

  if (currentScheduledAt) {
    return (
      <Card className="bg-success/5 border-success/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Consulta Agendada</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(currentScheduledAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>
          {isContador && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3"
              onClick={() => setIsOpen(true)}
            >
              Reagendar
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Agendar Consulta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date < new Date()}
              initialFocus
              locale={ptBR}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <Select value={time} onValueChange={setTime}>
          <SelectTrigger>
            <Clock className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Selecione o horário" />
          </SelectTrigger>
          <SelectContent>
            {timeSlots.map((slot) => (
              <SelectItem key={slot} value={slot}>
                {slot}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {date && time && (
          <Badge variant="outline" className="w-full justify-center py-2 bg-primary/5">
            {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })} às {time}
          </Badge>
        )}

        <Button
          onClick={handleSchedule}
          disabled={!date || !time || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Agendando...
            </>
          ) : (
            'Confirmar Agendamento'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
