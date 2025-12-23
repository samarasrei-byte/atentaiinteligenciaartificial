import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  MessageSquare, 
  Calculator, 
  Users, 
  Calendar,
  Clock,
  BarChart3
} from 'lucide-react';

interface UsageData {
  aiQuestionsToday: number;
  aiQuestionsThisWeek: number;
  aiQuestionsThisMonth: number;
  simulationsToday: number;
  simulationsThisWeek: number;
  simulationsThisMonth: number;
  activeUsersToday: number;
  activeUsersThisWeek: number;
  consultationsScheduledThisWeek: number;
  consultationsCompletedThisWeek: number;
  averageResponseTime: number;
  peakHour: string;
}

interface UsageMetricsProps {
  data: UsageData;
}

export function UsageMetrics({ data }: UsageMetricsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 100);
  };

  const aiGrowth = calculateGrowth(data.aiQuestionsThisWeek, data.aiQuestionsThisMonth / 4);
  const simGrowth = calculateGrowth(data.simulationsThisWeek, data.simulationsThisMonth / 4);

  return (
    <div className="space-y-6">
      {/* Métricas em Tempo Real */}
      <Card className="bg-card border-border shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Métricas de Uso em Tempo Real
              </CardTitle>
              <CardDescription>Atividade da plataforma nas últimas 24 horas</CardDescription>
            </div>
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <div className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse" />
              Ao Vivo
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">Usuários Ativos Hoje</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{data.activeUsersToday}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {data.activeUsersThisWeek} esta semana
              </p>
            </div>
            
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">Perguntas IA Hoje</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{data.aiQuestionsToday}</p>
              <div className="flex items-center gap-1 mt-1">
                {aiGrowth >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
                <span className={`text-xs ${aiGrowth >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {aiGrowth >= 0 ? '+' : ''}{aiGrowth}% vs média
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calculator className="h-4 w-4" />
                <span className="text-sm">Simulações Hoje</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{data.simulationsToday}</p>
              <div className="flex items-center gap-1 mt-1">
                {simGrowth >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
                <span className={`text-xs ${simGrowth >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {simGrowth >= 0 ? '+' : ''}{simGrowth}% vs média
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Horário de Pico</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{data.peakHour}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tempo médio: {data.averageResponseTime}s
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uso Semanal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-info" />
              Uso da IA - Semanal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Perguntas esta semana</span>
                <span className="font-medium text-foreground">{formatNumber(data.aiQuestionsThisWeek)}</span>
              </div>
              <Progress value={Math.min((data.aiQuestionsThisWeek / (data.aiQuestionsThisMonth || 1)) * 100, 100)} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-2xl font-bold text-foreground">{formatNumber(data.aiQuestionsThisMonth)}</p>
                <p className="text-xs text-muted-foreground">Total este mês</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(data.aiQuestionsThisMonth / 30)}
                </p>
                <p className="text-xs text-muted-foreground">Média diária</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Simulações - Semanal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Simulações esta semana</span>
                <span className="font-medium text-foreground">{formatNumber(data.simulationsThisWeek)}</span>
              </div>
              <Progress value={Math.min((data.simulationsThisWeek / (data.simulationsThisMonth || 1)) * 100, 100)} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-2xl font-bold text-foreground">{formatNumber(data.simulationsThisMonth)}</p>
                <p className="text-xs text-muted-foreground">Total este mês</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(data.simulationsThisMonth / 30)}
                </p>
                <p className="text-xs text-muted-foreground">Média diária</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consultas com Contador */}
      <Card className="bg-card border-border shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-success" />
            Consultas com Contador - Esta Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-info/10 rounded-lg border border-info/20">
              <p className="text-3xl font-bold text-info">{data.consultationsScheduledThisWeek}</p>
              <p className="text-sm text-muted-foreground">Agendadas</p>
            </div>
            <div className="p-4 bg-success/10 rounded-lg border border-success/20">
              <p className="text-3xl font-bold text-success">{data.consultationsCompletedThisWeek}</p>
              <p className="text-sm text-muted-foreground">Concluídas</p>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-3xl font-bold text-accent">
                {Math.round((data.consultationsCompletedThisWeek / (data.consultationsScheduledThisWeek || 1)) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-3xl font-bold text-primary">{data.averageResponseTime}s</p>
              <p className="text-sm text-muted-foreground">Tempo Médio Resposta</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
