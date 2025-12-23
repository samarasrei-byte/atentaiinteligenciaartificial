import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Star, 
  TrendingUp, 
  Users, 
  Calendar,
  CheckCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ContadorStatsProps {
  consultations: Array<{
    id: string;
    status: string;
    price_cents: number;
    rating: number | null;
    created_at: string;
    completed_at: string | null;
  }>;
}

const COLORS = ['#14b8a6', '#f59e0b', '#ef4444', '#6366f1'];

export function ContadorStats({ consultations }: ContadorStatsProps) {
  // Calculate stats
  const completedConsultations = consultations.filter(c => c.status === 'completed');
  const totalRevenue = completedConsultations.reduce((sum, c) => sum + c.price_cents, 0);
  const avgRating = completedConsultations
    .filter(c => c.rating !== null)
    .reduce((sum, c, _, arr) => sum + (c.rating || 0) / arr.length, 0);

  // Revenue by month (last 6 months)
  const revenueByMonth = React.useMemo(() => {
    const months: { [key: string]: number } = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleDateString('pt-BR', { month: 'short' });
      months[key] = 0;
    }

    completedConsultations.forEach(c => {
      if (c.completed_at) {
        const date = new Date(c.completed_at);
        const key = date.toLocaleDateString('pt-BR', { month: 'short' });
        if (months[key] !== undefined) {
          months[key] += c.price_cents / 100;
        }
      }
    });

    return Object.entries(months).map(([month, value]) => ({
      month,
      receita: value
    }));
  }, [completedConsultations]);

  // Rating distribution
  const ratingDistribution = React.useMemo(() => {
    const dist: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    completedConsultations.forEach(c => {
      if (c.rating) {
        dist[c.rating] = (dist[c.rating] || 0) + 1;
      }
    });
    return Object.entries(dist).map(([rating, count]) => ({
      rating: `${rating}★`,
      count,
      fill: rating === '5' ? '#14b8a6' : rating === '4' ? '#22c55e' : rating === '3' ? '#f59e0b' : rating === '2' ? '#f97316' : '#ef4444'
    }));
  }, [completedConsultations]);

  // Consultation status distribution
  const statusDistribution = React.useMemo(() => {
    const dist: { [key: string]: number } = {};
    consultations.forEach(c => {
      dist[c.status] = (dist[c.status] || 0) + 1;
    });
    const statusLabels: { [key: string]: string } = {
      pending: 'Pendentes',
      scheduled: 'Agendadas',
      completed: 'Concluídas',
      cancelled: 'Canceladas'
    };
    return Object.entries(dist).map(([status, count], idx) => ({
      name: statusLabels[status] || status,
      value: count,
      fill: COLORS[idx % COLORS.length]
    }));
  }, [consultations]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalRevenue / 100)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avaliação Média</p>
                <p className="text-2xl font-bold text-foreground">
                  {avgRating.toFixed(1)} <span className="text-accent">★</span>
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Star className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Consultas Concluídas</p>
                <p className="text-2xl font-bold text-foreground">
                  {completedConsultations.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Consultas</p>
                <p className="text-2xl font-bold text-foreground">
                  {consultations.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-info/20 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueByMonth}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" tickFormatter={(v) => `R$${v}`} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Receita']}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="receita" 
                    stroke="#14b8a6" 
                    fillOpacity={1}
                    fill="url(#colorReceita)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-accent" />
              Distribuição de Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="rating" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  />
                  <Bar dataKey="count" name="Avaliações" radius={[4, 4, 0, 0]}>
                    {ratingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-info" />
              Status das Consultas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-4">
                {statusDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-sm text-foreground">{item.name}</span>
                    <Badge variant="outline">{item.value}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
