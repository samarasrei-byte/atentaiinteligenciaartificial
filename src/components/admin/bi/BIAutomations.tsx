import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Zap, 
  Bot, 
  User, 
  Clock, 
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Settings,
  RefreshCw,
  Mail,
  FileText,
  Bell,
  Shield,
  TrendingUp
} from 'lucide-react';

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  status: 'active' | 'paused' | 'pending_approval';
  requiresApproval: boolean;
  lastRun?: Date;
  nextRun?: Date;
  runsCount: number;
  pendingActions: number;
  icon: React.ElementType;
}

interface PendingAction {
  id: string;
  automationId: string;
  automationName: string;
  description: string;
  suggestedAction: string;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
}

export const BIAutomations: React.FC = () => {
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: '1',
      name: 'Alerta de Margem Baixa',
      description: 'Detecta quando a margem de um serviço cai abaixo de 20%',
      trigger: 'Margem < 20%',
      action: 'Notifica admin para revisão',
      status: 'active',
      requiresApproval: true,
      lastRun: new Date(Date.now() - 3600000),
      nextRun: new Date(Date.now() + 3600000),
      runsCount: 45,
      pendingActions: 2,
      icon: TrendingUp,
    },
    {
      id: '2',
      name: 'Relatório Semanal',
      description: 'Gera e envia relatório semanal de performance',
      trigger: 'Todo domingo às 18h',
      action: 'Gera relatório → Aguarda aprovação → Envia',
      status: 'active',
      requiresApproval: true,
      lastRun: new Date(Date.now() - 604800000),
      nextRun: new Date(Date.now() + 259200000),
      runsCount: 12,
      pendingActions: 0,
      icon: FileText,
    },
    {
      id: '3',
      name: 'Notificação de Novo Cliente',
      description: 'Notifica quando um novo cliente contrata serviço premium',
      trigger: 'Novo pagamento > R$ 500',
      action: 'Envia notificação push para admin',
      status: 'active',
      requiresApproval: false,
      lastRun: new Date(Date.now() - 86400000),
      runsCount: 89,
      pendingActions: 0,
      icon: Bell,
    },
    {
      id: '4',
      name: 'Verificação de Documentos Pendentes',
      description: 'Lista clientes com documentos pendentes há mais de 7 dias',
      trigger: 'Diariamente às 9h',
      action: 'Gera lista → Admin decide próxima ação',
      status: 'paused',
      requiresApproval: true,
      lastRun: new Date(Date.now() - 172800000),
      runsCount: 30,
      pendingActions: 5,
      icon: Shield,
    },
  ]);

  const [pendingActions, setPendingActions] = useState<PendingAction[]>([
    {
      id: '1',
      automationId: '1',
      automationName: 'Alerta de Margem Baixa',
      description: 'Margem do serviço "Análise Fiscal" está em 18.5%',
      suggestedAction: 'Revisar precificação ou custos operacionais',
      createdAt: new Date(Date.now() - 1800000),
      priority: 'high',
    },
    {
      id: '2',
      automationId: '1',
      automationName: 'Alerta de Margem Baixa',
      description: 'Margem do serviço "Certidões" está em 19.2%',
      suggestedAction: 'Monitorar por mais uma semana',
      createdAt: new Date(Date.now() - 7200000),
      priority: 'medium',
    },
  ]);

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(a => 
      a.id === id 
        ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } 
        : a
    ));
  };

  const handleApproveAction = (actionId: string) => {
    setPendingActions(prev => prev.filter(a => a.id !== actionId));
  };

  const handleDismissAction = (actionId: string) => {
    setPendingActions(prev => prev.filter(a => a.id !== actionId));
  };

  const activeCount = automations.filter(a => a.status === 'active').length;
  const totalPendingActions = pendingActions.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            Automações Inteligentes
          </h2>
          <p className="text-sm text-slate-500">IA sugere ações • Execução apenas com aprovação humana</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            {activeCount} ativas
          </Badge>
          {totalPendingActions > 0 && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {totalPendingActions} ações pendentes
            </Badge>
          )}
        </div>
      </div>

      {/* Pending Actions */}
      {pendingActions.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              Ações Sugeridas pela IA
            </CardTitle>
            <CardDescription className="text-amber-700">
              Estas ações foram identificadas pelas automações e aguardam sua decisão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingActions.map((action) => (
                <div
                  key={action.id}
                  className="p-4 bg-white rounded-xl border border-amber-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-amber-600 font-medium">{action.automationName}</span>
                        <Badge className={`text-xs ${
                          action.priority === 'high' 
                            ? 'bg-red-100 text-red-700 border-red-200' 
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                        }`}>
                          {action.priority === 'high' ? 'Alta' : 'Média'}
                        </Badge>
                      </div>
                      <p className="font-medium text-slate-900">{action.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Bot className="h-4 w-4 text-indigo-600" />
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Sugestão da IA:</span> {action.suggestedAction}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button 
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleApproveAction(action.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleDismissAction(action.id)}
                      >
                        Ignorar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Automations List */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Automações Configuradas</CardTitle>
          <CardDescription>Processos automatizados com supervisão humana</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automations.map((automation) => {
              const Icon = automation.icon;
              return (
                <div
                  key={automation.id}
                  className={`p-4 rounded-xl border ${
                    automation.status === 'active'
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-lg ${
                        automation.status === 'active'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{automation.name}</h3>
                          {automation.requiresApproval && (
                            <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200 gap-1">
                              <User className="h-3 w-3" />
                              Aprovação
                            </Badge>
                          )}
                          {automation.pendingActions > 0 && (
                            <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                              {automation.pendingActions} pendente(s)
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">{automation.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            Trigger: {automation.trigger}
                          </span>
                          <span className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            {automation.runsCount} execuções
                          </span>
                          {automation.lastRun && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Última: {automation.lastRun.toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">
                          {automation.status === 'active' ? 'Ativa' : 'Pausada'}
                        </span>
                        <Switch
                          checked={automation.status === 'active'}
                          onCheckedChange={() => toggleAutomation(automation.id)}
                        />
                      </div>
                      <Button size="sm" variant="ghost">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
        <div className="flex items-start gap-3">
          <Bot className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-indigo-800">Agentes de IA com Supervisão</p>
            <p className="text-sm text-indigo-700 mt-1">
              Todos os agentes de IA são configurados para <strong>sugerir ações</strong>, nunca para executar automaticamente. 
              Cada ação requer aprovação explícita de Guilherme antes de ser executada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
