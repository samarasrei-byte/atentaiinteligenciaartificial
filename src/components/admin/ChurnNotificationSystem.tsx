import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Bell,
  AlertTriangle,
  Send,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Mail,
  MessageSquare,
  Zap,
  Target,
  UserMinus,
  Sparkles
} from 'lucide-react';
import { AIChurnMessageGenerator } from './AIChurnMessageGenerator';

interface AtRiskUser {
  id: string;
  email: string;
  full_name: string | null;
  lastActive: string;
  daysInactive: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  notificationSent: boolean;
}

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  triggerDays: number;
  isActive: boolean;
}

interface AutomationSettings {
  enabled: boolean;
  lowRiskDays: number;
  mediumRiskDays: number;
  highRiskDays: number;
  criticalRiskDays: number;
  autoSendEnabled: boolean;
}

const defaultTemplates: NotificationTemplate[] = [
  {
    id: '1',
    name: 'Sentimos sua falta',
    subject: 'Sentimos sua falta no Atent.AI! 💙',
    body: `Olá {nome},

Percebemos que você não acessa a plataforma há alguns dias. Esperamos que esteja tudo bem!

Temos novidades que podem te interessar:
- Novas funcionalidades no simulador tributário
- Melhorias no chat com IA
- Novos contadores disponíveis

Volte a explorar a Atent.AI e descubra como podemos ajudar você a economizar ainda mais.

Equipe Atent.AI`,
    triggerDays: 7,
    isActive: true
  },
  {
    id: '2',
    name: 'Oferta especial',
    subject: 'Oferta exclusiva para você voltar! 🎁',
    body: `Olá {nome},

Como um dos nossos usuários especiais, queremos oferecer algo exclusivo para você.

Use o cupom VOLTEI20 e ganhe 20% de desconto na renovação do seu plano!

Esta oferta é válida por 7 dias.

Esperamos você de volta!

Equipe Atent.AI`,
    triggerDays: 14,
    isActive: true
  },
  {
    id: '3',
    name: 'Última chance',
    subject: '⚠️ Sua conta precisa de atenção',
    body: `Olá {nome},

Notamos que sua conta está inativa há algum tempo.

Antes de qualquer mudança, gostaríamos de entender como podemos ajudar.

Você pode:
- Responder este email com suas dúvidas
- Agendar uma consultoria gratuita
- Acessar nosso chat de suporte

Sua opinião é muito importante para nós.

Equipe Atent.AI`,
    triggerDays: 21,
    isActive: true
  }
];

export const ChurnNotificationSystem: React.FC = () => {
  const [atRiskUsers, setAtRiskUsers] = useState<AtRiskUser[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>(defaultTemplates);
  const [settings, setSettings] = useState<AutomationSettings>({
    enabled: true,
    lowRiskDays: 7,
    mediumRiskDays: 14,
    highRiskDays: 21,
    criticalRiskDays: 30,
    autoSendEnabled: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [customMessage, setCustomMessage] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  const getRiskLevel = (daysInactive: number): AtRiskUser['riskLevel'] => {
    if (daysInactive >= settings.criticalRiskDays) return 'critical';
    if (daysInactive >= settings.highRiskDays) return 'high';
    if (daysInactive >= settings.mediumRiskDays) return 'medium';
    if (daysInactive >= settings.lowRiskDays) return 'low';
    return 'low';
  };

  const getRiskColor = (level: AtRiskUser['riskLevel']) => {
    const colors = {
      low: 'bg-info/20 text-info',
      medium: 'bg-warning/20 text-warning',
      high: 'bg-orange-500/20 text-orange-500',
      critical: 'bg-destructive/20 text-destructive'
    };
    return colors[level];
  };

  const getRiskLabel = (level: AtRiskUser['riskLevel']) => {
    const labels = {
      low: 'Baixo',
      medium: 'Médio',
      high: 'Alto',
      critical: 'Crítico'
    };
    return labels[level];
  };

  const fetchAtRiskUsers = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      
      // Fetch profiles with subscriptions
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, updated_at')
        .order('updated_at', { ascending: true });
      
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('user_id, status')
        .eq('status', 'active');
      
      const activeUserIds = new Set(subscriptions?.map(s => s.user_id) || []);
      
      // Get sent notifications (simulated - would need real table)
      const sentNotifications = new Set<string>();
      
      const users: AtRiskUser[] = (profiles || [])
        .filter(p => activeUserIds.has(p.user_id))
        .map(p => {
          const lastActive = new Date(p.updated_at);
          const daysInactive = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            id: p.user_id,
            email: p.email || 'N/A',
            full_name: p.full_name,
            lastActive: lastActive.toLocaleDateString('pt-BR'),
            daysInactive,
            riskLevel: getRiskLevel(daysInactive),
            notificationSent: sentNotifications.has(p.user_id)
          };
        })
        .filter(u => u.daysInactive >= settings.lowRiskDays)
        .sort((a, b) => b.daysInactive - a.daysInactive);
      
      setAtRiskUsers(users);
    } catch (error) {
      console.error('Error fetching at-risk users:', error);
      toast.error('Erro ao carregar usuários em risco');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAtRiskUsers();
  }, [settings]);

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === atRiskUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(atRiskUsers.map(u => u.id)));
    }
  };

  const handleSendNotifications = async () => {
    if (selectedUsers.size === 0) {
      toast.error('Selecione pelo menos um usuário');
      return;
    }
    
    setIsSending(true);
    try {
      const usersToNotify = atRiskUsers.filter(u => selectedUsers.has(u.id));
      
      // Create notifications in the database
      const notifications = usersToNotify.map(user => ({
        user_id: user.id,
        title: customSubject || 'Sentimos sua falta!',
        message: (customMessage || templates[0].body).replace('{nome}', user.full_name || 'Usuário'),
        notification_type: 'churn_prevention',
        service_type: 'retention'
      }));
      
      const { error } = await supabase
        .from('service_notifications')
        .insert(notifications);
      
      if (error) throw error;
      
      setSentCount(usersToNotify.length);
      setSelectedUsers(new Set());
      toast.success(`${usersToNotify.length} notificações enviadas com sucesso!`);
      
      // Refresh users
      await fetchAtRiskUsers();
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast.error('Erro ao enviar notificações');
    } finally {
      setIsSending(false);
    }
  };

  const riskCounts = {
    low: atRiskUsers.filter(u => u.riskLevel === 'low').length,
    medium: atRiskUsers.filter(u => u.riskLevel === 'medium').length,
    high: atRiskUsers.filter(u => u.riskLevel === 'high').length,
    critical: atRiskUsers.filter(u => u.riskLevel === 'critical').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Sistema de Notificações de Churn
          </h2>
          <p className="text-muted-foreground">Notificações automáticas para usuários em risco de cancelamento</p>
        </div>
        <Button variant="outline" onClick={fetchAtRiskUsers} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-info/5 border-info/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-8 w-8 text-info mx-auto mb-2" />
              <p className="text-2xl font-bold">{riskCounts.low}</p>
              <p className="text-sm text-muted-foreground">Risco Baixo</p>
              <Badge variant="outline" className="mt-2 bg-info/10 text-info">
                {settings.lowRiskDays}-{settings.mediumRiskDays - 1} dias
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-warning/5 border-warning/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold">{riskCounts.medium}</p>
              <p className="text-sm text-muted-foreground">Risco Médio</p>
              <Badge variant="outline" className="mt-2 bg-warning/10 text-warning">
                {settings.mediumRiskDays}-{settings.highRiskDays - 1} dias
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-500/5 border-orange-500/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <UserMinus className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{riskCounts.high}</p>
              <p className="text-sm text-muted-foreground">Risco Alto</p>
              <Badge variant="outline" className="mt-2 bg-orange-500/10 text-orange-500">
                {settings.highRiskDays}-{settings.criticalRiskDays - 1} dias
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-2xl font-bold">{riskCounts.critical}</p>
              <p className="text-sm text-muted-foreground">Risco Crítico</p>
              <Badge variant="outline" className="mt-2 bg-destructive/10 text-destructive">
                +{settings.criticalRiskDays} dias
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários em Risco
          </TabsTrigger>
          <TabsTrigger value="ai-generator" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Gerador IA
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* AI Generator Tab */}
        <TabsContent value="ai-generator" className="space-y-4">
          <AIChurnMessageGenerator
            userName={atRiskUsers[0]?.full_name || ''}
            userEmail={atRiskUsers[0]?.email || ''}
            daysInactive={atRiskUsers[0]?.daysInactive || 14}
            riskLevel={atRiskUsers[0]?.riskLevel || 'medium'}
            onMessageGenerated={(message, subject) => {
              setCustomMessage(message);
              setCustomSubject(subject);
              toast.success('Mensagem aplicada! Vá para "Usuários em Risco" para enviar.');
            }}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          {/* Action Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={handleSelectAll}>
                    {selectedUsers.size === atRiskUsers.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                  </Button>
                  <Badge variant="outline">
                    {selectedUsers.size} selecionados
                  </Badge>
                </div>
                <Button 
                  onClick={handleSendNotifications}
                  disabled={selectedUsers.size === 0 || isSending}
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Notificações
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Assunto personalizado</Label>
                <Input
                  placeholder="Deixe em branco para usar o template padrão"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2 mt-4">
                <Label>Mensagem personalizada</Label>
                <Textarea
                  placeholder="Deixe em branco para usar o template padrão. Use {nome} para inserir o nome do usuário."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-warning" />
                Usuários em Risco de Churn
                <Badge variant="outline">{atRiskUsers.length}</Badge>
              </CardTitle>
              <CardDescription>
                Selecione os usuários para enviar notificações de retenção
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : atRiskUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success opacity-50" />
                  <p>Nenhum usuário em risco identificado</p>
                  <p className="text-sm mt-2">Todos os usuários estão ativos!</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {atRiskUsers.map((user) => (
                      <div 
                        key={user.id} 
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedUsers.has(user.id) 
                            ? 'bg-primary/10 border-primary' 
                            : 'bg-muted/30 hover:bg-muted/50'
                        }`}
                        onClick={() => handleSelectUser(user.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getRiskColor(user.riskLevel)}`}>
                            <span className="text-sm font-medium">{(user.email[0] || '?').toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-medium">{user.full_name || user.email}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Último acesso</p>
                            <p className="font-medium">{user.lastActive}</p>
                          </div>
                          <Badge className={getRiskColor(user.riskLevel)}>
                            {getRiskLabel(user.riskLevel)} • {user.daysInactive} dias
                          </Badge>
                          {user.notificationSent && (
                            <Badge variant="outline" className="bg-success/10 text-success">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Enviado
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      {template.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Após {template.triggerDays} dias
                      </Badge>
                      <Switch 
                        checked={template.isActive}
                        onCheckedChange={(checked) => {
                          setTemplates(prev => prev.map(t => 
                            t.id === template.id ? { ...t, isActive: checked } : t
                          ));
                        }}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Assunto</Label>
                    <Input value={template.subject} readOnly className="bg-muted/30" />
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label>Mensagem</Label>
                    <Textarea value={template.body} readOnly className="bg-muted/30" rows={6} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Configurações de Automação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Sistema ativado</Label>
                  <p className="text-sm text-muted-foreground">Monitorar usuários em risco automaticamente</p>
                </div>
                <Switch 
                  checked={settings.enabled}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, enabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Envio automático</Label>
                  <p className="text-sm text-muted-foreground">Enviar notificações automaticamente baseado nos templates</p>
                </div>
                <Switch 
                  checked={settings.autoSendEnabled}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, autoSendEnabled: checked }))}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Risco Baixo (dias)</Label>
                  <Input 
                    type="number" 
                    value={settings.lowRiskDays}
                    onChange={(e) => setSettings(s => ({ ...s, lowRiskDays: parseInt(e.target.value) || 7 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Risco Médio (dias)</Label>
                  <Input 
                    type="number" 
                    value={settings.mediumRiskDays}
                    onChange={(e) => setSettings(s => ({ ...s, mediumRiskDays: parseInt(e.target.value) || 14 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Risco Alto (dias)</Label>
                  <Input 
                    type="number" 
                    value={settings.highRiskDays}
                    onChange={(e) => setSettings(s => ({ ...s, highRiskDays: parseInt(e.target.value) || 21 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Risco Crítico (dias)</Label>
                  <Input 
                    type="number" 
                    value={settings.criticalRiskDays}
                    onChange={(e) => setSettings(s => ({ ...s, criticalRiskDays: parseInt(e.target.value) || 30 }))}
                  />
                </div>
              </div>

              <Button 
                className="w-full"
                onClick={() => toast.success('Configurações salvas!')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-warning" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{sentCount}</p>
                  <p className="text-sm text-muted-foreground">Notificações enviadas</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-success">{atRiskUsers.length}</p>
                  <p className="text-sm text-muted-foreground">Usuários em risco</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-warning">{templates.filter(t => t.isActive).length}</p>
                  <p className="text-sm text-muted-foreground">Templates ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChurnNotificationSystem;
