import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Shield, 
  Scale, 
  BarChart3,
  TrendingDown,
  Users,
  CreditCard,
  FileText,
  X,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  service: 'limpa-nome' | 'fiscal' | 'bi' | 'system';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  action?: {
    label: string;
    tabId: string;
  };
}

/**
 * AdminAlertsHub - Central de Alertas Críticos
 * 
 * Exibe alertas em tempo real de:
 * - Serviços (Limpa Nome, Fiscal, BI)
 * - Sistema (pagamentos, documentos, usuários)
 * - Performance (KPIs, churn, receita)
 */
export const AdminAlertsHub: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'critical',
      service: 'limpa-nome',
      title: 'Documento pendente há 3 dias',
      description: 'Cliente João Silva aguardando análise de documento desde 28/01',
      timestamp: '10 min atrás',
      isRead: false,
      action: { label: 'Ver Solicitação', tabId: 'limpa-nome' },
    },
    {
      id: '2',
      type: 'warning',
      service: 'fiscal',
      title: 'Prazo de entrega próximo',
      description: 'Análise fiscal da empresa XYZ LTDA vence em 2 dias',
      timestamp: '1 hora atrás',
      isRead: false,
      action: { label: 'Abrir Análise', tabId: 'modulo-fiscal' },
    },
    {
      id: '3',
      type: 'info',
      service: 'bi',
      title: 'Novo relatório disponível',
      description: 'Relatório mensal de performance gerado automaticamente',
      timestamp: '2 horas atrás',
      isRead: false,
      action: { label: 'Ver Relatório', tabId: 'bi-accounting' },
    },
    {
      id: '4',
      type: 'warning',
      service: 'system',
      title: 'Pagamento não confirmado',
      description: '3 pagamentos aguardando confirmação do gateway',
      timestamp: '3 horas atrás',
      isRead: true,
      action: { label: 'Ver Pagamentos', tabId: 'revenue' },
    },
    {
      id: '5',
      type: 'success',
      service: 'limpa-nome',
      title: 'Caso resolvido',
      description: 'Cliente Maria Oliveira teve nome limpo com sucesso',
      timestamp: '5 horas atrás',
      isRead: true,
    },
  ]);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning': return <Clock className="h-5 w-5 text-amber-500" />;
      case 'info': return <Bell className="h-5 w-5 text-blue-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    }
  };

  const getServiceBadge = (service: Alert['service']) => {
    const config = {
      'limpa-nome': { icon: Shield, color: 'bg-emerald-100 text-emerald-700 border-emerald-300', label: 'Limpa Nome' },
      'fiscal': { icon: Scale, color: 'bg-violet-100 text-violet-700 border-violet-300', label: 'Análise Fiscal' },
      'bi': { icon: BarChart3, color: 'bg-blue-100 text-blue-700 border-blue-300', label: 'BI' },
      'system': { icon: CreditCard, color: 'bg-slate-100 text-slate-700 border-slate-300', label: 'Sistema' },
    };
    const cfg = config[service];
    const Icon = cfg.icon;
    return (
      <Badge variant="outline" className={cn('gap-1', cfg.color)}>
        <Icon className="h-3 w-3" />
        {cfg.label}
      </Badge>
    );
  };

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const unreadCount = alerts.filter(a => !a.isRead).length;
  const criticalCount = alerts.filter(a => a.type === 'critical' && !a.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Central de Alertas</h2>
            <p className="text-muted-foreground">Notificações em tempo real de todos os serviços</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {criticalCount > 0 && (
            <Badge className="bg-red-500 text-white animate-pulse">
              {criticalCount} crítico{criticalCount > 1 ? 's' : ''}
            </Badge>
          )}
          <Badge variant="outline">
            {unreadCount} não lido{unreadCount !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-700">{alerts.filter(a => a.type === 'critical').length}</p>
                <p className="text-sm text-red-600">Críticos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold text-amber-700">{alerts.filter(a => a.type === 'warning').length}</p>
                <p className="text-sm text-amber-600">Avisos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-700">{alerts.filter(a => a.type === 'info').length}</p>
                <p className="text-sm text-blue-600">Informativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold text-emerald-700">{alerts.filter(a => a.type === 'success').length}</p>
                <p className="text-sm text-emerald-600">Sucesso</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas Recentes</CardTitle>
          <CardDescription>Clique para marcar como lido ou executar ação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum alerta pendente</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-xl border transition-all',
                  !alert.isRead ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border',
                  alert.type === 'critical' && !alert.isRead && 'border-red-300 bg-red-50/50'
                )}
              >
                <div className="shrink-0 mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getServiceBadge(alert.service)}
                    {!alert.isRead && (
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                  <h4 className="font-semibold text-foreground">{alert.title}</h4>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {alert.action && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        markAsRead(alert.id);
                        onNavigate?.(alert.action!.tabId);
                      }}
                    >
                      {alert.action.label}
                    </Button>
                  )}
                  {!alert.isRead && (
                    <Button size="sm" variant="ghost" onClick={() => markAsRead(alert.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => dismissAlert(alert.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAlertsHub;
