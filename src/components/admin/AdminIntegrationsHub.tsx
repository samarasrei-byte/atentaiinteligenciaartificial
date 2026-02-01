import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  CreditCard, 
  Key, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Settings,
  Shield,
  Loader2,
  User,
  Phone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * AdminIntegrationsHub - Central de Integrações do Admin
 * 
 * Gerencia:
 * - WhatsApp API (Instância Guilherme + César)
 * - Asaas API (Pagamentos)
 * - API Keys da Plataforma
 * - Webhooks
 */
export const AdminIntegrationsHub: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('whatsapp');
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  // Estado das integrações (mock - conectar com backend real)
  const [integrations, setIntegrations] = useState({
    whatsapp: {
      guilherme: {
        enabled: true,
        phone: '+5511999999999',
        instanceId: 'guilherme-atendimento-001',
        status: 'connected' as 'connected' | 'disconnected' | 'pending',
      },
      cesar: {
        enabled: true,
        phone: '+5511888888888',
        instanceId: 'cesar-bi-001',
        status: 'connected' as 'connected' | 'disconnected' | 'pending',
      },
    },
    asaas: {
      enabled: true,
      apiKey: 'aact_YTU5YTE0M2M2MTc4MjE2NDk0YzEzMg==',
      environment: 'production' as 'sandbox' | 'production',
      webhookUrl: 'https://wtiexyrawenxckctbwzn.functions.supabase.co/guest-payment-webhook',
      status: 'connected' as 'connected' | 'disconnected' | 'pending',
    },
    platform: {
      publicKey: 'pk_live_atentai_xxxxxxxxxxxxx',
      secretKey: 'sk_live_atentai_xxxxxxxxxxxxx',
      webhookSecret: 'whsec_atentai_xxxxxxxxxxxxx',
    },
  });

  const toggleShowKey = (key: string) => {
    setShowApiKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado!', description: `${label} copiado para a área de transferência` });
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    toast({ title: 'Salvo!', description: 'Configurações atualizadas com sucesso' });
  };

  const getStatusBadge = (status: 'connected' | 'disconnected' | 'pending') => {
    const config = {
      connected: { class: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: CheckCircle, label: 'Conectado' },
      disconnected: { class: 'bg-red-100 text-red-700 border-red-300', icon: AlertCircle, label: 'Desconectado' },
      pending: { class: 'bg-amber-100 text-amber-700 border-amber-300', icon: RefreshCw, label: 'Pendente' },
    };
    const cfg = config[status];
    const Icon = cfg.icon;
    return (
      <Badge variant="outline" className={cn('gap-1', cfg.class)}>
        <Icon className="h-3 w-3" />
        {cfg.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Central de Integrações
          </h2>
          <p className="text-muted-foreground">Gerencie APIs, webhooks e conexões externas</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Salvar Alterações
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="whatsapp" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="asaas" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Asaas
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Zap className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        {/* WhatsApp Tab */}
        <TabsContent value="whatsapp" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Instância Guilherme */}
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-transparent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">G</span>
                    </div>
                    <div>
                      <CardTitle className="text-emerald-900">Instância Guilherme</CardTitle>
                      <CardDescription>Limpa Nome • Análise Fiscal • Atendimento</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(integrations.whatsapp.guilherme.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Ativo</Label>
                  <Switch 
                    checked={integrations.whatsapp.guilherme.enabled}
                    onCheckedChange={(checked) => setIntegrations(prev => ({
                      ...prev,
                      whatsapp: {
                        ...prev.whatsapp,
                        guilherme: { ...prev.whatsapp.guilherme, enabled: checked }
                      }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={integrations.whatsapp.guilherme.phone}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        whatsapp: {
                          ...prev.whatsapp,
                          guilherme: { ...prev.whatsapp.guilherme, phone: e.target.value }
                        }
                      }))}
                      placeholder="+5511999999999"
                    />
                    <Button variant="outline" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Instance ID</Label>
                  <div className="flex gap-2">
                    <Input value={integrations.whatsapp.guilherme.instanceId} disabled className="font-mono text-sm" />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(integrations.whatsapp.guilherme.instanceId, 'Instance ID')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full gap-2 text-emerald-600 border-emerald-300 hover:bg-emerald-50">
                  <ExternalLink className="h-4 w-4" />
                  Abrir Painel WhatsApp
                </Button>
              </CardContent>
            </Card>

            {/* Instância César */}
            <Card className="border-violet-200 bg-gradient-to-br from-violet-50/50 to-transparent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">C</span>
                    </div>
                    <div>
                      <CardTitle className="text-violet-900">Instância César</CardTitle>
                      <CardDescription>BI • Contabilidade • Relatórios</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(integrations.whatsapp.cesar.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Ativo</Label>
                  <Switch 
                    checked={integrations.whatsapp.cesar.enabled}
                    onCheckedChange={(checked) => setIntegrations(prev => ({
                      ...prev,
                      whatsapp: {
                        ...prev.whatsapp,
                        cesar: { ...prev.whatsapp.cesar, enabled: checked }
                      }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={integrations.whatsapp.cesar.phone}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        whatsapp: {
                          ...prev.whatsapp,
                          cesar: { ...prev.whatsapp.cesar, phone: e.target.value }
                        }
                      }))}
                      placeholder="+5511888888888"
                    />
                    <Button variant="outline" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Instance ID</Label>
                  <div className="flex gap-2">
                    <Input value={integrations.whatsapp.cesar.instanceId} disabled className="font-mono text-sm" />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(integrations.whatsapp.cesar.instanceId, 'Instance ID')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full gap-2 text-violet-600 border-violet-300 hover:bg-violet-50">
                  <ExternalLink className="h-4 w-4" />
                  Abrir Painel WhatsApp
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Asaas Tab */}
        <TabsContent value="asaas" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-100">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Integração Asaas</CardTitle>
                    <CardDescription>Gateway de pagamentos e cobranças</CardDescription>
                  </div>
                </div>
                {getStatusBadge(integrations.asaas.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Integração Ativa</Label>
                  <p className="text-sm text-muted-foreground">Habilitar cobranças via Asaas</p>
                </div>
                <Switch 
                  checked={integrations.asaas.enabled}
                  onCheckedChange={(checked) => setIntegrations(prev => ({
                    ...prev,
                    asaas: { ...prev.asaas, enabled: checked }
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input 
                    type={showApiKeys['asaas'] ? 'text' : 'password'}
                    value={integrations.asaas.apiKey}
                    onChange={(e) => setIntegrations(prev => ({
                      ...prev,
                      asaas: { ...prev.asaas, apiKey: e.target.value }
                    }))}
                    className="font-mono"
                  />
                  <Button variant="outline" size="icon" onClick={() => toggleShowKey('asaas')}>
                    {showApiKeys['asaas'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(integrations.asaas.apiKey, 'API Key')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ambiente</Label>
                <div className="flex gap-4">
                  <Button 
                    variant={integrations.asaas.environment === 'sandbox' ? 'default' : 'outline'}
                    onClick={() => setIntegrations(prev => ({ ...prev, asaas: { ...prev.asaas, environment: 'sandbox' } }))}
                  >
                    Sandbox
                  </Button>
                  <Button 
                    variant={integrations.asaas.environment === 'production' ? 'default' : 'outline'}
                    onClick={() => setIntegrations(prev => ({ ...prev, asaas: { ...prev.asaas, environment: 'production' } }))}
                  >
                    Produção
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <div className="flex gap-2">
                  <Input value={integrations.asaas.webhookUrl} disabled className="font-mono text-sm" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(integrations.asaas.webhookUrl, 'Webhook URL')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Configure esta URL no painel do Asaas para receber notificações</p>
              </div>

              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Abrir Painel Asaas
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-100">
                  <Key className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <CardTitle>API Keys da Plataforma</CardTitle>
                  <CardDescription>Chaves para integração externa com a AtentAI</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Chave Pública (Publishable Key)</Label>
                <div className="flex gap-2">
                  <Input value={integrations.platform.publicKey} disabled className="font-mono text-sm" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(integrations.platform.publicKey, 'Public Key')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Use no frontend para identificar requisições</p>
              </div>

              <div className="space-y-2">
                <Label>Chave Secreta (Secret Key)</Label>
                <div className="flex gap-2">
                  <Input 
                    type={showApiKeys['secret'] ? 'text' : 'password'}
                    value={integrations.platform.secretKey}
                    disabled
                    className="font-mono text-sm"
                  />
                  <Button variant="outline" size="icon" onClick={() => toggleShowKey('secret')}>
                    {showApiKeys['secret'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(integrations.platform.secretKey, 'Secret Key')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-red-500">⚠️ Nunca exponha esta chave no frontend</p>
              </div>

              <div className="space-y-2">
                <Label>Webhook Secret</Label>
                <div className="flex gap-2">
                  <Input 
                    type={showApiKeys['webhook'] ? 'text' : 'password'}
                    value={integrations.platform.webhookSecret}
                    disabled
                    className="font-mono text-sm"
                  />
                  <Button variant="outline" size="icon" onClick={() => toggleShowKey('webhook')}>
                    {showApiKeys['webhook'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(integrations.platform.webhookSecret, 'Webhook Secret')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Use para validar assinaturas de webhooks</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Regenerar Chaves
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-100">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Webhooks Configurados</CardTitle>
                  <CardDescription>Endpoints para receber notificações em tempo real</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { name: 'Pagamentos', url: '/guest-payment-webhook', status: 'active' },
                  { name: 'Stripe Connect', url: '/stripe-connect-webhook', status: 'active' },
                  { name: 'Assinaturas', url: '/check-subscription', status: 'active' },
                  { name: 'Documentos', url: '/process-document-expiration', status: 'active' },
                ].map((webhook, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-2 w-2 rounded-full',
                        webhook.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'
                      )} />
                      <div>
                        <p className="font-medium">{webhook.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">{webhook.url}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                      Ativo
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminIntegrationsHub;
