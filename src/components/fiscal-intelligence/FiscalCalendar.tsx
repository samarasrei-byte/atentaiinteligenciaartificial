import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, AlertTriangle, CheckCircle2, Clock, Bell, ChevronLeft, ChevronRight, FileText, DollarSign, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore, isAfter, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaxObligation {
  id: string;
  name: string;
  description: string;
  dueDay: number;
  category: 'federal' | 'estadual' | 'municipal' | 'previdenciario';
  applicableRegimes: string[];
  icon: React.ElementType;
  priority: 'high' | 'medium' | 'low';
  penalty: string;
}

// Base de obrigações fiscais brasileiras
const TAX_OBLIGATIONS: TaxObligation[] = [
  { id: 'das', name: 'DAS (Simples Nacional)', description: 'Documento de Arrecadação do Simples Nacional', dueDay: 20, category: 'federal', applicableRegimes: ['simples_nacional'], icon: DollarSign, priority: 'high', penalty: 'Multa de 2% ao mês + juros SELIC' },
  { id: 'irpj', name: 'IRPJ', description: 'Imposto de Renda Pessoa Jurídica (trimestral)', dueDay: 30, category: 'federal', applicableRegimes: ['lucro_presumido', 'lucro_real'], icon: DollarSign, priority: 'high', penalty: 'Multa de 0,33% ao dia (máx 20%)' },
  { id: 'csll', name: 'CSLL', description: 'Contribuição Social sobre o Lucro Líquido', dueDay: 30, category: 'federal', applicableRegimes: ['lucro_presumido', 'lucro_real'], icon: DollarSign, priority: 'high', penalty: 'Multa de 0,33% ao dia (máx 20%)' },
  { id: 'pis', name: 'PIS/PASEP', description: 'Programa de Integração Social', dueDay: 25, category: 'federal', applicableRegimes: ['lucro_presumido', 'lucro_real'], icon: DollarSign, priority: 'medium', penalty: 'Multa de 2% ao mês + juros SELIC' },
  { id: 'cofins', name: 'COFINS', description: 'Contribuição para Financiamento da Seguridade Social', dueDay: 25, category: 'federal', applicableRegimes: ['lucro_presumido', 'lucro_real'], icon: DollarSign, priority: 'medium', penalty: 'Multa de 2% ao mês + juros SELIC' },
  { id: 'inss', name: 'GPS (INSS)', description: 'Contribuição Previdenciária Patronal', dueDay: 20, category: 'previdenciario', applicableRegimes: ['simples_nacional', 'lucro_presumido', 'lucro_real'], icon: Building2, priority: 'high', penalty: 'Multa de 2% ao mês + juros SELIC' },
  { id: 'fgts', name: 'FGTS', description: 'Fundo de Garantia do Tempo de Serviço', dueDay: 7, category: 'previdenciario', applicableRegimes: ['simples_nacional', 'lucro_presumido', 'lucro_real'], icon: Building2, priority: 'high', penalty: 'Multa de 5% no mês + 10% após' },
  { id: 'dctf', name: 'DCTF', description: 'Declaração de Débitos e Créditos Tributários Federais', dueDay: 15, category: 'federal', applicableRegimes: ['lucro_presumido', 'lucro_real'], icon: FileText, priority: 'medium', penalty: 'Multa de R$ 500 por mês de atraso' },
  { id: 'sped_fiscal', name: 'SPED Fiscal', description: 'Sistema Público de Escrituração Digital', dueDay: 25, category: 'federal', applicableRegimes: ['lucro_presumido', 'lucro_real'], icon: FileText, priority: 'medium', penalty: 'Multa de R$ 1.500 por mês de atraso' },
  { id: 'efd', name: 'EFD Contribuições', description: 'Escrituração Fiscal Digital das Contribuições', dueDay: 10, category: 'federal', applicableRegimes: ['lucro_presumido', 'lucro_real'], icon: FileText, priority: 'medium', penalty: 'Multa de R$ 500 por mês de atraso' },
  { id: 'icms', name: 'ICMS', description: 'Imposto sobre Circulação de Mercadorias', dueDay: 15, category: 'estadual', applicableRegimes: ['lucro_presumido', 'lucro_real'], icon: DollarSign, priority: 'high', penalty: 'Multa de 2% ao dia + juros' },
  { id: 'iss', name: 'ISS', description: 'Imposto Sobre Serviços', dueDay: 10, category: 'municipal', applicableRegimes: ['lucro_presumido', 'lucro_real'], icon: DollarSign, priority: 'medium', penalty: 'Multa de 2% ao mês + juros' },
  { id: 'das_mei', name: 'DAS-MEI', description: 'Pagamento mensal do MEI', dueDay: 20, category: 'federal', applicableRegimes: ['mei'], icon: DollarSign, priority: 'high', penalty: 'Juros de 0,33% ao dia + multa de 20%' },
  { id: 'dasn_simei', name: 'DASN-SIMEI', description: 'Declaração Anual do Simples Nacional MEI (Maio)', dueDay: 31, category: 'federal', applicableRegimes: ['mei'], icon: FileText, priority: 'high', penalty: 'Multa mínima de R$ 50' },
];

interface FiscalCalendarProps {
  companyType?: string;
  taxRegime?: string;
  hasEmployees?: boolean;
}

export const FiscalCalendar: React.FC<FiscalCalendarProps> = ({
  companyType = 'me',
  taxRegime = 'simples_nacional',
  hasEmployees = false,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // Mapeia tipo de empresa para regime equivalente para MEI
  const effectiveRegime = companyType === 'mei' ? 'mei' : taxRegime;

  // Filtra obrigações aplicáveis ao regime
  const applicableObligations = useMemo(() => {
    let filtered = TAX_OBLIGATIONS.filter(ob => ob.applicableRegimes.includes(effectiveRegime));
    // Remove FGTS/INSS se não tem empregados e é MEI
    if (!hasEmployees && companyType === 'mei') {
      filtered = filtered.filter(ob => !['fgts', 'inss'].includes(ob.id));
    }
    if (filter !== 'all') {
      filtered = filtered.filter(ob => ob.category === filter);
    }
    return filtered;
  }, [effectiveRegime, hasEmployees, companyType, filter]);

  // Gera eventos do mês
  const monthEvents = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const year = start.getFullYear();
    const month = start.getMonth();

    return applicableObligations.map(ob => {
      const lastDay = new Date(year, month + 1, 0).getDate();
      const day = Math.min(ob.dueDay, lastDay);
      const dueDate = new Date(year, month, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let status: 'upcoming' | 'due_soon' | 'overdue' | 'completed' = 'upcoming';
      const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntil < 0) status = 'overdue';
      else if (daysUntil <= 5) status = 'due_soon';
      else if (daysUntil <= 0) status = 'completed';

      return { ...ob, dueDate, status, daysUntil };
    }).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [currentMonth, applicableObligations]);

  // Dias do calendário visual
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Eventos por dia
  const eventsByDay = useMemo(() => {
    const map: Record<string, typeof monthEvents> = {};
    monthEvents.forEach(ev => {
      const key = format(ev.dueDate, 'yyyy-MM-dd');
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });
    return map;
  }, [monthEvents]);

  const selectedDayEvents = selectedDate
    ? eventsByDay[format(selectedDate, 'yyyy-MM-dd')] || []
    : [];

  const overdueCount = monthEvents.filter(e => e.status === 'overdue').length;
  const dueSoonCount = monthEvents.filter(e => e.status === 'due_soon').length;

  const categoryColors: Record<string, string> = {
    federal: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    estadual: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
    municipal: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    previdenciario: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  };

  const statusConfig = {
    overdue: { color: 'bg-red-500', label: 'Vencido', textColor: 'text-red-600' },
    due_soon: { color: 'bg-amber-500', label: 'Próximo', textColor: 'text-amber-600' },
    upcoming: { color: 'bg-emerald-500', label: 'No prazo', textColor: 'text-emerald-600' },
    completed: { color: 'bg-muted', label: 'Pago', textColor: 'text-muted-foreground' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          Calendário Fiscal Inteligente
        </h2>
        <p className="text-muted-foreground mt-1">
          Todas as obrigações fiscais da sua empresa com alertas automáticos
        </p>
      </div>

      {/* Alertas */}
      {(overdueCount > 0 || dueSoonCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {overdueCount > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-red-500/30 bg-red-500/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-600">{overdueCount} obrigação(ões) vencida(s)</p>
                    <p className="text-xs text-muted-foreground">Regularize para evitar multas</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          {dueSoonCount > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-600">{dueSoonCount} vencendo em até 5 dias</p>
                    <p className="text-xs text-muted-foreground">Prepare-se para o pagamento</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário Visual */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-semibold text-lg capitalize min-w-[160px] text-center">
                  {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </span>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="federal">Federal</SelectItem>
                  <SelectItem value="estadual">Estadual</SelectItem>
                  <SelectItem value="municipal">Municipal</SelectItem>
                  <SelectItem value="previdenciario">Previdenciário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
              ))}
            </div>
            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for offset */}
              {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {calendarDays.map(day => {
                const key = format(day, 'yyyy-MM-dd');
                const dayEvents = eventsByDay[key] || [];
                const hasOverdue = dayEvents.some(e => e.status === 'overdue');
                const hasDueSoon = dayEvents.some(e => e.status === 'due_soon');
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDate(dayEvents.length > 0 ? day : null)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all text-sm
                      ${isToday(day) ? 'ring-2 ring-primary font-bold' : ''}
                      ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'}
                      ${dayEvents.length > 0 ? 'cursor-pointer' : 'cursor-default'}
                    `}
                  >
                    <span className={isSelected ? 'text-primary-foreground' : ''}>{day.getDate()}</span>
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayEvents.slice(0, 3).map((ev, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${statusConfig[ev.status].color}`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className={`w-2 h-2 rounded-full ${cfg.color}`} />
                  {cfg.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lista de obrigações do dia ou do mês */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              {selectedDate
                ? `Obrigações de ${format(selectedDate, 'dd/MM')}`
                : 'Próximas obrigações'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {(selectedDate ? selectedDayEvents : monthEvents.slice(0, 8)).map((ev, i) => (
                <motion.div
                  key={ev.id + format(ev.dueDate, 'MM')}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`text-[10px] ${categoryColors[ev.category]}`}>
                          {ev.category === 'previdenciario' ? 'Previd.' : ev.category.charAt(0).toUpperCase() + ev.category.slice(1)}
                        </Badge>
                        <span className={`text-[10px] font-medium ${statusConfig[ev.status].textColor}`}>
                          {ev.status === 'overdue' ? `${Math.abs(ev.daysUntil)}d atraso` :
                           ev.status === 'due_soon' ? `${ev.daysUntil}d restantes` :
                           `Dia ${format(ev.dueDate, 'dd')}`}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">{ev.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{ev.description}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${statusConfig[ev.status].color}`} />
                  </div>
                  {ev.status === 'overdue' && (
                    <p className="text-[10px] text-red-500 mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> {ev.penalty}
                    </p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {monthEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                Nenhuma obrigação para este período
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
