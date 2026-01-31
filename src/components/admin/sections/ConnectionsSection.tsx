import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  CreditCard, 
  Globe, 
  Key, 
  Webhook, 
  ExternalLink,
  Check,
  AlertCircle,
  Loader2,
  Settings,
} from 'lucide-react';

interface Connection {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: 'active' | 'error' | 'pending' | 'inactive';
  type: 'whatsapp' | 'payment' | 'api' | 'webhook';
  config?: {
    apiKey?: boolean;
    webhookUrl?: string;
  };
}

const connections: Connection[] = [
  {
    id: 'whatsapp-atendimento',
    name: 'WhatsApp – Atendimento',
    description: 'Canal principal de suporte (Guilherme)',
    icon: MessageCircle,
    status: 'active',
    type: 'whatsapp',
  },
  {
    id: 'whatsapp-bi',
    name: 'WhatsApp – BI & Contabilidade',
    description: 'Canal de comunicação contábil (Admin)',
    icon: MessageCircle,
    status: 'pending',
    type: 'whatsapp',
  },
  {
    id: 'asaas',
    name: 'Asaas',
    description: 'Gateway de pagamentos e cobranças',
    icon: CreditCard,
    status: 'active',
    type: 'payment',
  },
  {
    id: 'oasis',
    name: 'Oasis',
    description: 'Integração com sistema Oasis',
    icon: Globe,
    status: 'inactive',
    type: 'api',
  },
  {
    id: 'api-atentai',
    name: 'API AtentAI',
    description: 'API própria da plataforma',
    icon: Key,
    status: 'active',
    type: 'api',
    config: {
      apiKey: true,
    },
  },
];

const getStatusConfig = (status: Connection['status']) => {
  switch (status) {
    case 'active':
      return { 
        label: 'Ativo', 
        color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        icon: Check,
      };
    case 'error':
      return { 
        label: 'Erro', 
        color: 'bg-destructive/10 text-destructive border-destructive/20',
        icon: AlertCircle,
      };
    case 'pending':
      return { 
        label: 'Sincronizando', 
        color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        icon: Loader2,
      };
    case 'inactive':
      return { 
        label: 'Inativo', 
        color: 'bg-muted text-muted-foreground border-border',
        icon: AlertCircle,
      };
  }
};

export const ConnectionsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Conexões</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie integrações e APIs conectadas à plataforma
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Webhook className="h-4 w-4 mr-2" />
          Webhooks
        </Button>
      </div>

      {/* Connection Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {connections.map((connection) => {
          const Icon = connection.icon;
          const statusConfig = getStatusConfig(connection.status);
          const StatusIcon = statusConfig.icon;

          return (
            <Card 
              key={connection.id} 
              className="group hover:shadow-md transition-all duration-200 border-border/50"
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`
                    h-12 w-12 rounded-xl flex items-center justify-center shrink-0
                    ${connection.status === 'active' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted text-muted-foreground'}
                  `}>
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {connection.name}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] ${statusConfig.color}`}
                      >
                        <StatusIcon className={`h-3 w-3 mr-1 ${connection.status === 'pending' ? 'animate-spin' : ''}`} />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {connection.description}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button variant="ghost" size="sm" className="h-8 text-xs">
                        <Settings className="h-3 w-3 mr-1.5" />
                        Configurar
                      </Button>
                      {connection.config?.apiKey && (
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                          <Key className="h-3 w-3 mr-1.5" />
                          API Key
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-8 text-xs">
                        <ExternalLink className="h-3 w-3 mr-1.5" />
                        Docs
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* API Keys Section */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            API Keys da Plataforma
          </CardTitle>
          <CardDescription>
            Gerencie suas chaves de API para integrações externas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
              <div>
                <p className="font-medium text-sm">Production Key</p>
                <code className="text-xs text-muted-foreground">sk_live_**********************abc123</code>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Copiar</Button>
                <Button variant="ghost" size="sm" className="text-destructive">Revogar</Button>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <Key className="h-4 w-4 mr-2" />
              Gerar Nova API Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* External APIs */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            APIs Externas
          </CardTitle>
          <CardDescription>
            Conecte APIs de parceiros e serviços externos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm mb-4">
              Nenhuma API externa conectada
            </p>
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Conectar API
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionsSection;
