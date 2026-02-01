import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  CreditCard, 
  Key, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Save,
  Loader2,
  Settings2,
  Code,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WhatsAppQRConnect } from './integrations/WhatsAppQRConnect';
import { ExternalAPIsConfig } from './integrations/ExternalAPIsConfig';
import { PlatformAPIGenerator } from './integrations/PlatformAPIGenerator';

/**
 * AdminIntegrationsHub - Central de Integrações do Admin
 * 
 * Gerencia:
 * - WhatsApp API (Instância Guilherme + César) com QR Code
 * - APIs Externas (Asaas, OpenAI, Resend, Stripe)
 * - API da Plataforma com geração de chaves e documentação
 * - Webhooks
 */
export const AdminIntegrationsHub: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('whatsapp');
  const [isSaving, setIsSaving] = useState(false);

  // WhatsApp instances config
  const whatsappInstances = [
    {
      id: 'guilherme',
      name: 'Guilherme',
      phone: '+5511999999999',
      instanceId: 'guilherme-atendimento-001',
      status: 'disconnected' as const,
      color: 'emerald',
      bgColor: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      services: ['Limpa Nome', 'Análise Fiscal', 'Atendimento'],
    },
    {
      id: 'cesar',
      name: 'César',
      phone: '+5511888888888',
      instanceId: 'cesar-bi-001',
      status: 'disconnected' as const,
      color: 'violet',
      bgColor: 'bg-gradient-to-br from-violet-500 to-indigo-600',
      services: ['BI', 'Contabilidade', 'Relatórios'],
    },
  ];

  const handleSave = async () => {
    setIsSaving(true);
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
          <TabsTrigger value="apis" className="gap-2">
            <Settings2 className="h-4 w-4" />
            APIs Externas
          </TabsTrigger>
          <TabsTrigger value="platform-api" className="gap-2">
            <Code className="h-4 w-4" />
            Minha API
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Zap className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        {/* WhatsApp Tab - Now with QR Code */}
        <TabsContent value="whatsapp" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">WhatsApp Business</h3>
              <p className="text-sm text-muted-foreground">Conecte suas instâncias via QR Code</p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
              <MessageSquare className="h-3 w-3 mr-1" />
              WhatsApp Business API
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {whatsappInstances.map((instance) => (
              <WhatsAppQRConnect 
                key={instance.id}
                instance={instance}
                onStatusChange={(id, status) => {
                  toast({
                    title: status === 'connected' ? 'WhatsApp conectado!' : 'Status atualizado',
                    description: `Instância ${id} agora está ${status}`,
                  });
                }}
              />
            ))}
          </div>
        </TabsContent>

        {/* External APIs Tab */}
        <TabsContent value="apis" className="space-y-6">
          <ExternalAPIsConfig />
        </TabsContent>

        {/* Platform API Tab */}
        <TabsContent value="platform-api" className="space-y-6">
          <PlatformAPIGenerator />
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
                  { name: 'Pagamentos', url: '/guest-payment-webhook', status: 'active', events: ['payment.success', 'payment.failed'] },
                  { name: 'Stripe Connect', url: '/stripe-connect-webhook', status: 'active', events: ['account.updated', 'transfer.created'] },
                  { name: 'Assinaturas', url: '/check-subscription', status: 'active', events: ['subscription.created', 'subscription.cancelled'] },
                  { name: 'Documentos', url: '/process-document-expiration', status: 'active', events: ['document.expired', 'document.pending'] },
                  { name: 'WhatsApp', url: '/whatsapp-webhook', status: 'pending', events: ['message.received', 'status.update'] },
                ].map((webhook, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-2.5 w-2.5 rounded-full',
                        webhook.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                      )} />
                      <div>
                        <p className="font-medium">{webhook.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">{webhook.url}</p>
                        <div className="flex gap-1 mt-1">
                          {webhook.events.map((event, j) => (
                            <Badge key={j} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        webhook.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-amber-50 text-amber-700 border-amber-300'
                      )}
                    >
                      {webhook.status === 'active' ? 'Ativo' : 'Pendente'}
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
