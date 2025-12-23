import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, DollarSign, TrendingUp, Activity, Clock, CheckCircle, 
  AlertTriangle, Settings, Shield, Database, Zap, Globe,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface SystemHealthProps {
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  responseTime: number;
  activeUsers: number;
  queuedJobs: number;
}

export const SystemHealthCard: React.FC<{ health: SystemHealthProps }> = ({ health }) => {
  const statusConfig = {
    healthy: { color: 'bg-emerald-500', text: 'text-emerald-500', label: 'Operacional' },
    warning: { color: 'bg-amber-500', text: 'text-amber-500', label: 'Atenção' },
    critical: { color: 'bg-red-500', text: 'text-red-500', label: 'Crítico' },
  };

  const config = statusConfig[health.status];

  return (
    <Card className="bg-card border-border shadow-soft overflow-hidden">
      <div className={`h-1 ${config.color}`} />
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Status do Sistema
          </CardTitle>
          <Badge className={`${config.color}/10 ${config.text}`}>
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Uptime</p>
            <p className="text-lg font-bold text-foreground">{health.uptime}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Tempo Resposta</p>
            <p className="text-lg font-bold text-foreground">{health.responseTime}ms</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Usuários Ativos</p>
            <p className="text-lg font-bold text-foreground">{health.activeUsers}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Jobs na Fila</p>
            <p className="text-lg font-bold text-foreground">{health.queuedJobs}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface QuickStatProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change?: { value: number; type: 'increase' | 'decrease' };
  color: string;
}

export const QuickStatCard: React.FC<QuickStatProps> = ({ icon: Icon, label, value, change, color }) => {
  return (
    <Card className="bg-card border-border shadow-soft">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg bg-${color}/10`}>
            <Icon className={`h-5 w-5 text-${color}`} />
          </div>
          {change && (
            <div className={`flex items-center text-xs ${change.type === 'increase' ? 'text-emerald-500' : 'text-red-500'}`}>
              {change.type === 'increase' ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {change.value}%
            </div>
          )}
        </div>
        <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
};

interface RecentActivityItem {
  id: string;
  type: 'user' | 'payment' | 'consultation' | 'system';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error';
}

export const AdminActivityFeed: React.FC<{ activities: RecentActivityItem[] }> = ({ activities }) => {
  const typeConfig = {
    user: { icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    payment: { icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    consultation: { icon: Activity, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    system: { icon: Settings, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  };

  const statusConfig = {
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    error: 'text-red-500',
  };

  return (
    <Card className="bg-card border-border shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map(activity => {
            const config = typeConfig[activity.type];
            const Icon = config.icon;
            
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${config.bg}`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{activity.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  {activity.status && (
                    <span className={`text-xs ${statusConfig[activity.status]}`}>
                      {activity.status === 'success' && '✓'}
                      {activity.status === 'warning' && '⚠'}
                      {activity.status === 'error' && '✕'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export const QuickActionsAdmin: React.FC = () => {
  const actions = [
    { icon: Users, label: 'Novo Usuário', description: 'Criar conta manualmente' },
    { icon: Shield, label: 'Gerenciar Roles', description: 'Permissões de acesso' },
    { icon: Database, label: 'Backup', description: 'Exportar dados' },
    { icon: Globe, label: 'Configurações', description: 'Ajustes do sistema' },
  ];

  return (
    <Card className="bg-card border-border shadow-soft">
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button 
              key={index} 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-primary/5 hover:border-primary/30"
            >
              <action.icon className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="font-medium">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Mock data for demonstration
export const mockSystemHealth: SystemHealthProps = {
  status: 'healthy',
  uptime: '99.9%',
  responseTime: 145,
  activeUsers: 42,
  queuedJobs: 3,
};

export const mockActivities: RecentActivityItem[] = [
  { id: '1', type: 'user', title: 'Novo usuário', description: 'maria@empresa.com se cadastrou', timestamp: '2min', status: 'success' },
  { id: '2', type: 'payment', title: 'Pagamento recebido', description: 'Assinatura Premium - R$ 97,00', timestamp: '15min', status: 'success' },
  { id: '3', type: 'consultation', title: 'Consulta agendada', description: 'João Santos × Dr. Silva', timestamp: '1h', status: 'success' },
  { id: '4', type: 'system', title: 'Backup automático', description: 'Backup diário concluído', timestamp: '3h', status: 'success' },
  { id: '5', type: 'user', title: 'Login falho', description: 'Tentativas excedidas - user@test.com', timestamp: '4h', status: 'warning' },
];

export default { SystemHealthCard, QuickStatCard, AdminActivityFeed, QuickActionsAdmin };
