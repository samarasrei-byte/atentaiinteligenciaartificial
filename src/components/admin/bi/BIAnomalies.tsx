import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Bell,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Anomaly {
  id: string;
  type: 'revenue_drop' | 'churn_spike' | 'unusual_activity' | 'margin_alert' | 'cash_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  metric: string;
  change: number;
  detected_at: Date;
  status: 'pending' | 'reviewed' | 'dismissed';
  reviewed_by?: string;
}

const severityConfig: Record<string, { color: string; bgColor: string; icon: React.ElementType }> = {
  low: { color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-200', icon: Eye },
  medium: { color: 'text-amber-700', bgColor: 'bg-amber-100 border-amber-200', icon: AlertTriangle },
  high: { color: 'text-orange-700', bgColor: 'bg-orange-100 border-orange-200', icon: AlertTriangle },
  critical: { color: 'text-red-700', bgColor: 'bg-red-100 border-red-200', icon: XCircle },
};

const typeIcons: Record<string, React.ElementType> = {
  revenue_drop: TrendingDown,
  churn_spike: Users,
  unusual_activity: Clock,
  margin_alert: DollarSign,
  cash_risk: DollarSign,
};

export const BIAnomalies: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectAnomalies();
  }, []);

  const detectAnomalies = async () => {
    setLoading(true);
    
    try {
      // Fetch recent data for anomaly detection
      const [payments, subscriptions] = await Promise.all([
        supabase.from('payments').select('amount_cents, created_at').eq('status', 'completed').order('created_at', { ascending: false }).limit(200),
        supabase.from('subscriptions').select('status, created_at, updated_at').order('created_at', { ascending: false }).limit(100),
      ]);

      // Analyze for anomalies (simplified detection)
      const detectedAnomalies: Anomaly[] = [];
      
      // Check for revenue variations
      if (payments.data && payments.data.length > 10) {
        const recentTotal = payments.data.slice(0, 10).reduce((sum, p) => sum + p.amount_cents, 0);
        const olderTotal = payments.data.slice(10, 20).reduce((sum, p) => sum + p.amount_cents, 0);
        
        if (olderTotal > 0 && recentTotal < olderTotal * 0.7) {
          detectedAnomalies.push({
            id: '1',
            type: 'revenue_drop',
            severity: 'high',
            title: 'Queda de Receita Detectada',
            description: 'Os últimos pagamentos mostram uma queda significativa em relação ao período anterior.',
            metric: 'Receita',
            change: -((1 - recentTotal / olderTotal) * 100),
            detected_at: new Date(),
            status: 'pending',
          });
        }
      }

      // Check for churn
      const cancelledSubs = subscriptions.data?.filter(s => s.status === 'cancelled').length || 0;
      const totalSubs = subscriptions.data?.length || 1;
      const churnRate = (cancelledSubs / totalSubs) * 100;

      if (churnRate > 15) {
        detectedAnomalies.push({
          id: '2',
          type: 'churn_spike',
          severity: churnRate > 30 ? 'critical' : 'medium',
          title: 'Taxa de Churn Elevada',
          description: `${churnRate.toFixed(1)}% dos assinantes recentes cancelaram. Investigar causas.`,
          metric: 'Churn Rate',
          change: churnRate,
          detected_at: new Date(Date.now() - 3600000),
          status: 'pending',
        });
      }

      // Add some example anomalies for demo
      detectedAnomalies.push(
        {
          id: '3',
          type: 'margin_alert',
          severity: 'medium',
          title: 'Margem Abaixo do Esperado',
          description: 'A margem de lucro do serviço Limpa Nome está 12% abaixo da meta mensal.',
          metric: 'Margem',
          change: -12,
          detected_at: new Date(Date.now() - 7200000),
          status: 'pending',
        },
        {
          id: '4',
          type: 'unusual_activity',
          severity: 'low',
          title: 'Pico de Solicitações',
          description: 'Volume de solicitações 45% acima da média. Verificar se é campanha ou tendência.',
          metric: 'Volume',
          change: 45,
          detected_at: new Date(Date.now() - 86400000),
          status: 'reviewed',
          reviewed_by: 'Equipe',
        }
      );

      setAnomalies(detectedAnomalies);
    } catch (error) {
      console.error('Error detecting anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (id: string, action: 'reviewed' | 'dismissed') => {
    setAnomalies(prev => prev.map(a => 
      a.id === id ? { ...a, status: action, reviewed_by: 'Equipe' } : a
    ));
  };

  const pendingCount = anomalies.filter(a => a.status === 'pending').length;
  const criticalCount = anomalies.filter(a => a.severity === 'critical' && a.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Detecção de Anomalias
          </h2>
          <p className="text-sm text-slate-500">IA detecta padrões incomuns • Revisão humana obrigatória</p>
        </div>
        <Button variant="outline" size="sm" onClick={detectAnomalies}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Analisar Novamente
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Bell className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{anomalies.length}</p>
                <p className="text-sm text-slate-500">Total Detectadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
                <p className="text-sm text-slate-500">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{criticalCount}</p>
                <p className="text-sm text-slate-500">Críticas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{anomalies.filter(a => a.status !== 'pending').length}</p>
                <p className="text-sm text-slate-500">Revisadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anomalies List */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Alertas Detectados</CardTitle>
          <CardDescription>Anomalias identificadas pela IA aguardando revisão humana</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-slate-500">Analisando dados...</div>
            ) : anomalies.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Nenhuma anomalia detectada</p>
                <p className="text-sm text-slate-500">Todos os indicadores estão dentro do esperado</p>
              </div>
            ) : (
              anomalies.map((anomaly) => {
                const TypeIcon = typeIcons[anomaly.type] || AlertTriangle;
                const severityInfo = severityConfig[anomaly.severity];
                const SeverityIcon = severityInfo.icon;

                return (
                  <div
                    key={anomaly.id}
                    className={`p-4 rounded-xl border ${
                      anomaly.status === 'pending' 
                        ? 'bg-white border-slate-200' 
                        : 'bg-slate-50 border-slate-200 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-lg ${severityInfo.bgColor}`}>
                          <TypeIcon className={`h-5 w-5 ${severityInfo.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{anomaly.title}</h3>
                            <Badge className={`${severityInfo.bgColor} ${severityInfo.color} border text-xs`}>
                              {anomaly.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{anomaly.description}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(anomaly.detected_at, "dd/MM HH:mm", { locale: ptBR })}
                            </span>
                            <span className="flex items-center gap-1">
                              {anomaly.change > 0 ? (
                                <TrendingUp className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-red-600" />
                              )}
                              {anomaly.change > 0 ? '+' : ''}{anomaly.change.toFixed(1)}%
                            </span>
                            {anomaly.reviewed_by && (
                              <span className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle2 className="h-3 w-3" />
                                Revisado por {anomaly.reviewed_by}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {anomaly.status === 'pending' && (
                        <div className="flex gap-2 shrink-0">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                            onClick={() => handleReview(anomaly.id, 'reviewed')}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Revisar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-slate-500"
                            onClick={() => handleReview(anomaly.id, 'dismissed')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Ignorar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
