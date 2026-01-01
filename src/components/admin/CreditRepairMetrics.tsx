import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Users, DollarSign, Clock, CheckCircle, AlertCircle, Loader2, CalendarIcon, Download, FileText, FileSpreadsheet, Timer } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, subDays, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { exportCreditRepairToExcel, exportCreditRepairToPdf, CreditRepairReportData } from '@/lib/exportCreditRepairReports';
import { useToast } from '@/hooks/use-toast';

interface CreditRepairRequest {
  id: string;
  full_name: string;
  status: string;
  payment_status: string;
  final_price_cents: number;
  debt_amount_cents: number;
  created_at: string;
  completed_at: string | null;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado'
};

const chartConfig = {
  requests: {
    label: "Solicitações",
    color: "hsl(var(--primary))",
  },
  revenue: {
    label: "Receita",
    color: "hsl(var(--chart-2))",
  },
};

type DateRange = {
  from: Date;
  to: Date;
};

const quickFilters = [
  { label: 'Últimos 7 dias', days: 7 },
  { label: 'Últimos 30 dias', days: 30 },
  { label: 'Últimos 90 dias', days: 90 },
  { label: 'Este ano', days: 365 },
];

export function CreditRepairMetrics() {
  const [requests, setRequests] = useState<CreditRepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [activeQuickFilter, setActiveQuickFilter] = useState<number>(30);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_repair_requests')
        .select('id, full_name, status, payment_status, final_price_cents, debt_amount_cents, created_at, completed_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar por período
  const filteredRequests = requests.filter(r => {
    const createdAt = new Date(r.created_at);
    return isWithinInterval(createdAt, { start: dateRange.from, end: dateRange.to });
  });

  const applyQuickFilter = (days: number) => {
    setActiveQuickFilter(days);
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date(),
    });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  // Calcular métricas com dados filtrados
  const totalRequests = filteredRequests.length;
  const completedRequests = filteredRequests.filter(r => r.status === 'completed').length;
  const inProgressRequests = filteredRequests.filter(r => r.status === 'in_progress').length;
  const pendingRequests = filteredRequests.filter(r => r.status === 'pending').length;
  const paidRequests = filteredRequests.filter(r => r.payment_status === 'paid');
  const totalRevenue = paidRequests.reduce((sum, r) => sum + r.final_price_cents, 0);
  const conversionRate = totalRequests > 0 ? ((completedRequests / totalRequests) * 100) : 0;
  const avgTicket = paidRequests.length > 0 ? totalRevenue / paidRequests.length : 0;

  // Calcular tempo médio de conclusão
  const completedWithDates = filteredRequests.filter(r => r.status === 'completed' && r.completed_at);
  const avgCompletionDays = completedWithDates.length > 0
    ? completedWithDates.reduce((sum, r) => {
        const created = new Date(r.created_at);
        const completed = new Date(r.completed_at!);
        return sum + differenceInDays(completed, created);
      }, 0) / completedWithDates.length
    : 0;

  // Dados para gráfico de tempo de conclusão por mês
  const completionTimeData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    
    const monthCompleted = filteredRequests.filter(r => {
      if (r.status !== 'completed' || !r.completed_at) return false;
      const completedAt = new Date(r.completed_at);
      return completedAt >= start && completedAt <= end;
    });

    const avgDays = monthCompleted.length > 0
      ? monthCompleted.reduce((sum, r) => {
          const created = new Date(r.created_at);
          const completed = new Date(r.completed_at!);
          return sum + differenceInDays(completed, created);
        }, 0) / monthCompleted.length
      : 0;

    return {
      month: format(date, 'MMM', { locale: ptBR }),
      dias: Math.round(avgDays * 10) / 10,
      concluidos: monthCompleted.length
    };
  });

  // Exportar relatórios
  const handleExportExcel = () => {
    const reportData: CreditRepairReportData = {
      requests: filteredRequests,
      dateRange: { start: dateRange.from, end: dateRange.to },
      stats: {
        total: totalRequests,
        pending: pendingRequests,
        inProgress: inProgressRequests,
        completed: completedRequests,
        totalRevenue,
        paidCount: paidRequests.length,
        avgTicket,
        conversionRate,
      },
    };
    exportCreditRepairToExcel(reportData);
    toast({
      title: 'Exportação Concluída',
      description: 'Relatório Excel baixado com sucesso!',
    });
  };

  const handleExportPdf = () => {
    const reportData: CreditRepairReportData = {
      requests: filteredRequests,
      dateRange: { start: dateRange.from, end: dateRange.to },
      stats: {
        total: totalRequests,
        pending: pendingRequests,
        inProgress: inProgressRequests,
        completed: completedRequests,
        totalRevenue,
        paidCount: paidRequests.length,
        avgTicket,
        conversionRate,
      },
    };
    exportCreditRepairToPdf(reportData);
    toast({
      title: 'Exportação Concluída',
      description: 'Relatório PDF baixado com sucesso!',
    });
  };

  // Dados para gráfico de pizza (status)
  const statusData = [
    { name: 'Pendente', value: pendingRequests, color: 'hsl(var(--chart-4))' },
    { name: 'Em Andamento', value: inProgressRequests, color: 'hsl(var(--chart-2))' },
    { name: 'Concluído', value: completedRequests, color: 'hsl(var(--primary))' },
  ].filter(d => d.value > 0);

  // Dados mensais (últimos 6 meses)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    
    const monthRequests = filteredRequests.filter(r => {
      const createdAt = new Date(r.created_at);
      return createdAt >= start && createdAt <= end;
    });

    const monthRevenue = monthRequests
      .filter(r => r.payment_status === 'paid')
      .reduce((sum, r) => sum + r.final_price_cents, 0);

    return {
      month: format(date, 'MMM', { locale: ptBR }),
      requests: monthRequests.length,
      revenue: monthRevenue / 100
    };
  });

  // Dados para gráfico de pagamentos
  const paymentData = [
    { name: 'Pagos', value: paidRequests.length, color: 'hsl(var(--primary))' },
    { name: 'Pendentes', value: filteredRequests.filter(r => r.payment_status === 'pending').length, color: 'hsl(var(--chart-4))' },
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros de Data e Exportação */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((filter) => (
                <Button
                  key={filter.days}
                  variant={activeQuickFilter === filter.days ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyQuickFilter(filter.days)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            {/* Date Pickers */}
            <div className="flex flex-wrap gap-2 items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => date && setDateRange(prev => ({ ...prev, from: date }))}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground">até</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => date && setDateRange(prev => ({ ...prev, to: date }))}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>

              {/* Export Buttons */}
              <div className="flex gap-2 ml-4">
                <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPdf} className="gap-2">
                  <FileText className="h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Solicitações</p>
                <p className="text-3xl font-bold text-primary">{totalRequests}</p>
              </div>
              <Users className="h-10 w-10 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
              </div>
              <DollarSign className="h-10 w-10 text-green-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-3xl font-bold text-blue-600">{inProgressRequests}</p>
              </div>
              <Clock className="h-10 w-10 text-blue-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-3xl font-bold text-emerald-600">{conversionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-emerald-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
                <p className="text-3xl font-bold text-amber-600">{avgCompletionDays.toFixed(0)} dias</p>
              </div>
              <Timer className="h-10 w-10 text-amber-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Evolução Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorRequests)"
                  name="Solicitações"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhuma solicitação encontrada
              </div>
            )}
          </CardContent>
        </Card>

        {/* Receita Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Receita']}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="hsl(var(--chart-2))" 
                  radius={[4, 4, 0, 0]}
                  name="Receita"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status de Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Status de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {paymentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum pagamento encontrado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico Tempo Médio de Conclusão */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Timer className="h-5 w-5 text-amber-500" />
              Tempo Médio de Conclusão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={completionTimeData}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value}d`} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [
                    name === 'dias' ? `${value} dias` : value, 
                    name === 'dias' ? 'Tempo Médio' : 'Concluídos'
                  ]}
                />
                <Bar 
                  dataKey="dias" 
                  fill="hsl(var(--chart-4))" 
                  radius={[4, 4, 0, 0]}
                  name="Tempo Médio (dias)"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Métricas adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Ticket Médio</p>
            <p className="text-2xl font-bold text-primary">
              {paidRequests.length > 0 
                ? formatCurrency(avgTicket)
                : 'R$ 0,00'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Concluídos</p>
            <p className="text-2xl font-bold text-green-600">{completedRequests}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Pendentes</p>
            <p className="text-2xl font-bold text-amber-600">{pendingRequests}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
