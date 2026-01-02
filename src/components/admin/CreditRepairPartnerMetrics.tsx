import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, BarChart, Bar, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Building, TrendingUp, DollarSign, Users, Percent, Loader2, BarChart3,
  PieChart as PieChartIcon, CheckCircle, Clock, FileText, RefreshCw, Award
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Partner {
  id: string;
  company_name: string;
  trade_name: string | null;
  commission_percent: number;
  is_active: boolean;
  total_requests: number;
  total_revenue_cents: number;
}

interface CreditRepairRequest {
  id: string;
  status: string;
  payment_status: string;
  final_price_cents: number;
  created_at: string;
  partner_id: string | null;
}

const COLORS = [
  'hsl(var(--primary))', 
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))', 
  'hsl(var(--chart-4))',
  'hsl(var(--success))',
  'hsl(var(--info))',
];

const chartConfig = {
  requests: { label: "Solicitações", color: "hsl(var(--primary))" },
  revenue: { label: "Receita", color: "hsl(var(--chart-2))" },
  commission: { label: "Comissão", color: "hsl(var(--success))" },
};

export function CreditRepairPartnerMetrics() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [requests, setRequests] = useState<CreditRepairRequest[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [partnersRes, requestsRes] = await Promise.all([
        supabase.from('credit_repair_partners').select('*').order('company_name'),
        supabase.from('credit_repair_requests').select('id, status, payment_status, final_price_cents, created_at, partner_id')
      ]);

      if (partnersRes.data) setPartners(partnersRes.data);
      if (requestsRes.data) setRequests(requestsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  // Filter requests by selected partner
  const filteredRequests = selectedPartnerId === 'all'
    ? requests.filter(r => r.partner_id)
    : requests.filter(r => r.partner_id === selectedPartnerId);

  // Calculate stats per partner
  const partnerStats = partners.map(partner => {
    const partnerRequests = requests.filter(r => r.partner_id === partner.id);
    const paidRequests = partnerRequests.filter(r => r.payment_status === 'paid');
    const totalRevenue = paidRequests.reduce((sum, r) => sum + r.final_price_cents, 0);
    const commission = totalRevenue * partner.commission_percent / 100;
    const completedCount = partnerRequests.filter(r => r.status === 'completed').length;
    const conversionRate = partnerRequests.length > 0 ? (completedCount / partnerRequests.length) * 100 : 0;

    return {
      ...partner,
      requestCount: partnerRequests.length,
      paidCount: paidRequests.length,
      revenue: totalRevenue,
      commission,
      conversionRate,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Ranking data for chart
  const rankingData = partnerStats.slice(0, 10).map(p => ({
    name: p.trade_name || p.company_name.slice(0, 15),
    revenue: p.revenue / 100,
    commission: p.commission / 100,
    requests: p.requestCount,
  }));

  // Monthly data for selected partner or all
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
      revenue: monthRevenue / 100,
    };
  });

  // Distribution by partner pie chart
  const partnerDistribution = partnerStats.slice(0, 6).map((p, i) => ({
    name: p.trade_name || p.company_name.slice(0, 12),
    value: p.revenue / 100,
    color: COLORS[i % COLORS.length],
  })).filter(d => d.value > 0);

  // Global stats
  const totalPartnerRequests = filteredRequests.length;
  const totalPartnerRevenue = filteredRequests
    .filter(r => r.payment_status === 'paid')
    .reduce((sum, r) => sum + r.final_price_cents, 0);
  const totalCommissions = partnerStats.reduce((sum, p) => sum + p.commission, 0);
  const avgConversion = partnerStats.length > 0
    ? partnerStats.reduce((sum, p) => sum + p.conversionRate, 0) / partnerStats.length
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-success" />
            Métricas por Parceiro
          </h2>
          <p className="text-sm text-muted-foreground">Análise de desempenho das empresas parceiras</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecionar parceiro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Parceiros</SelectItem>
              {partners.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.trade_name || p.company_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Solicitações</p>
                <p className="text-3xl font-bold text-primary">{totalPartnerRequests}</p>
              </div>
              <FileText className="h-10 w-10 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita de Parceiros</p>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalPartnerRevenue)}</p>
              </div>
              <DollarSign className="h-10 w-10 text-blue-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Comissões</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(totalCommissions)}</p>
              </div>
              <Percent className="h-10 w-10 text-green-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversão Média</p>
                <p className="text-3xl font-bold text-amber-600">{avgConversion.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-amber-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking de Parceiros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Ranking de Receita por Parceiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rankingData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[350px]">
                <BarChart data={rankingData} layout="vertical" margin={{ left: 0 }}>
                  <XAxis type="number" tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Receita (R$)" radius={4} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribuição por Parceiro */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Distribuição de Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            {partnerDistribution.length > 0 ? (
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={partnerDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {partnerDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evolução Mensal */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Evolução Mensal {selectedPartnerId !== 'all' && '- Parceiro Selecionado'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="partnerColorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="partnerColorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
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
                  fill="url(#partnerColorRequests)"
                  name="Solicitações"
                />
                <Legend />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Partner Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building className="h-5 w-5 text-success" />
            Desempenho Detalhado por Parceiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Parceiro</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Solicitações</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Pagos</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Receita</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Comissão %</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Valor Comissão</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Conversão</th>
                </tr>
              </thead>
              <tbody>
                {partnerStats.map((partner, index) => (
                  <motion.tr
                    key={partner.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{partner.trade_name || partner.company_name}</p>
                          {partner.trade_name && (
                            <p className="text-xs text-muted-foreground">{partner.company_name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {partner.is_active ? (
                        <Badge className="bg-success/10 text-success"><CheckCircle className="h-3 w-3 mr-1" />Ativo</Badge>
                      ) : (
                        <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Inativo</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-medium">{partner.requestCount}</td>
                    <td className="py-3 px-4 text-center font-medium text-success">{partner.paidCount}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(partner.revenue)}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="outline" className="text-primary">{partner.commission_percent}%</Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-success">{formatCurrency(partner.commission)}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={partner.conversionRate >= 50 ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'}>
                        {partner.conversionRate.toFixed(1)}%
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
