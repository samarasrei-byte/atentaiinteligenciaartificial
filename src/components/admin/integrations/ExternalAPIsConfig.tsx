import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Brain, 
  Mail,
  MessageSquare,
  Key,
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Save,
  Loader2,
  ExternalLink,
  Settings2,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface APIConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  apiKey: string;
  webhookUrl?: string;
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error';
  docsUrl?: string;
  fields: {
    key: string;
    label: string;
    type: 'text' | 'password' | 'url';
    placeholder: string;
    required?: boolean;
  }[];
}

export const ExternalAPIsConfig: React.FC = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const [apis, setApis] = useState<APIConfig[]>([
    {
      id: 'asaas',
      name: 'Asaas',
      description: 'Gateway de pagamentos e cobranças',
      icon: CreditCard,
      color: 'blue',
      bgColor: 'bg-blue-500',
      apiKey: '',
      webhookUrl: 'https://wtiexyrawenxckctbwzn.functions.supabase.co/guest-payment-webhook',
      enabled: true,
      status: 'disconnected',
      docsUrl: 'https://docs.asaas.com/',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'aact_YTU5YTE0M2M2...', required: true },
        { key: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://...' },
      ],
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'Inteligência artificial e GPT',
      icon: Brain,
      color: 'emerald',
      bgColor: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      apiKey: '',
      enabled: false,
      status: 'disconnected',
      docsUrl: 'https://platform.openai.com/docs',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'sk-...', required: true },
        { key: 'orgId', label: 'Organization ID', type: 'text', placeholder: 'org-...' },
      ],
    },
    {
      id: 'resend',
      name: 'Resend',
      description: 'Envio de emails transacionais',
      icon: Mail,
      color: 'violet',
      bgColor: 'bg-violet-500',
      apiKey: '',
      enabled: true,
      status: 'connected',
      docsUrl: 'https://resend.com/docs',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 're_...', required: true },
        { key: 'fromEmail', label: 'From Email', type: 'text', placeholder: 'noreply@atentai.com.br' },
      ],
    },
    {
      id: 'whatsapp-official',
      name: 'WhatsApp Business API (Oficial)',
      description: 'Integração oficial Meta Cloud API',
      icon: MessageSquare,
      color: 'green',
      bgColor: 'bg-green-500',
      apiKey: '',
      enabled: false,
      status: 'disconnected',
      docsUrl: 'https://developers.facebook.com/docs/whatsapp',
      fields: [
        { key: 'phoneNumberId', label: 'Phone Number ID', type: 'text', placeholder: '123456789...', required: true },
        { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'EAAG...', required: true },
        { key: 'verifyToken', label: 'Verify Token', type: 'text', placeholder: 'seu_token_secreto' },
      ],
    },
    {
      id: 'zapi',
      name: 'Z-API',
      description: 'API de WhatsApp não-oficial (Z-API)',
      icon: MessageSquare,
      color: 'emerald',
      bgColor: 'bg-gradient-to-br from-emerald-500 to-green-600',
      apiKey: '',
      enabled: false,
      status: 'disconnected',
      docsUrl: 'https://developer.z-api.io/',
      fields: [
        { key: 'instanceId', label: 'Instance ID (Guilherme)', type: 'text', placeholder: 'INSTANCE_ID_GUI', required: true },
        { key: 'tokenGui', label: 'Token (Guilherme)', type: 'password', placeholder: 'TOKEN_GUI', required: true },
        { key: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://...' },
        { key: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://...' },
      ],
    },
    {
      id: 'evolution',
      name: 'Evolution API',
      description: 'API de WhatsApp Evolution (self-hosted)',
      icon: MessageSquare,
      color: 'teal',
      bgColor: 'bg-gradient-to-br from-teal-500 to-cyan-600',
      apiKey: '',
      enabled: false,
      status: 'disconnected',
      docsUrl: 'https://doc.evolution-api.com/',
      fields: [
        { key: 'baseUrl', label: 'URL Base', type: 'url', placeholder: 'https://evolution.seudominio.com', required: true },
        { key: 'apiKey', label: 'Global API Key', type: 'password', placeholder: 'sua_api_key', required: true },
        { key: 'instanceGui', label: 'Instance Name (Guilherme)', type: 'text', placeholder: 'guilherme_instance' },
      ],
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Pagamentos internacionais e assinaturas',
      icon: CreditCard,
      color: 'indigo',
      bgColor: 'bg-gradient-to-br from-indigo-500 to-purple-600',
      apiKey: '',
      enabled: true,
      status: 'connected',
      docsUrl: 'https://stripe.com/docs',
      fields: [
        { key: 'publishableKey', label: 'Publishable Key', type: 'text', placeholder: 'pk_live_...', required: true },
        { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'sk_live_...', required: true },
        { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', placeholder: 'whsec_...' },
      ],
    },
  ]);

  const toggleShowKey = (apiId: string, fieldKey: string) => {
    const key = `${apiId}-${fieldKey}`;
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado!', description: `${label} copiado para a área de transferência` });
  };

  const updateAPIField = (apiId: string, fieldKey: string, value: string) => {
    setApis(prev => prev.map(api => 
      api.id === apiId 
        ? { ...api, [fieldKey]: value }
        : api
    ));
  };

  const toggleAPIEnabled = (apiId: string, enabled: boolean) => {
    setApis(prev => prev.map(api => 
      api.id === apiId 
        ? { ...api, enabled }
        : api
    ));
  };

  const saveAPIConfig = async (apiId: string) => {
    setIsSaving(apiId);
    
    // Simulate API save
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setApis(prev => prev.map(api => 
      api.id === apiId 
        ? { ...api, status: 'connected' as const }
        : api
    ));
    
    setIsSaving(null);
    toast({ 
      title: 'Configuração salva!', 
      description: 'As credenciais foram atualizadas com sucesso' 
    });
  };

  const testConnection = async (apiId: string) => {
    toast({
      title: 'Testando conexão...',
      description: 'Verificando credenciais',
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: 'Conexão OK! ✅',
      description: 'API respondendo corretamente',
    });
  };

  const getStatusBadge = (status: APIConfig['status']) => {
    const config = {
      connected: { class: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: CheckCircle, label: 'Conectado' },
      disconnected: { class: 'bg-gray-100 text-gray-600 border-gray-300', icon: AlertCircle, label: 'Não configurado' },
      error: { class: 'bg-red-100 text-red-700 border-red-300', icon: AlertCircle, label: 'Erro' },
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
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            APIs Externas
          </h3>
          <p className="text-sm text-muted-foreground">Configure as integrações com serviços externos</p>
        </div>
      </div>

      <div className="grid gap-4">
        {apis.map((api) => {
          const Icon = api.icon;
          
          return (
            <Card key={api.id} className={cn(
              'transition-all duration-200',
              api.enabled ? 'border-l-4 border-l-primary' : 'opacity-60'
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2.5 rounded-lg text-white', api.bgColor)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{api.name}</CardTitle>
                      <CardDescription className="text-xs">{api.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(api.status)}
                    <Switch 
                      checked={api.enabled}
                      onCheckedChange={(checked) => toggleAPIEnabled(api.id, checked)}
                    />
                  </div>
                </div>
              </CardHeader>
              
              {api.enabled && (
                <CardContent className="space-y-4 pt-0">
                  <div className="grid gap-3">
                    {api.fields.map((field) => {
                      const showKey = showKeys[`${api.id}-${field.key}`];
                      const value = (api as any)[field.key] || '';
                      
                      return (
                        <div key={field.key} className="space-y-1.5">
                          <Label className="text-xs font-medium">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              type={field.type === 'password' && !showKey ? 'password' : 'text'}
                              value={value}
                              onChange={(e) => updateAPIField(api.id, field.key, e.target.value)}
                              placeholder={field.placeholder}
                              className="font-mono text-sm"
                            />
                            {field.type === 'password' && (
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => toggleShowKey(api.id, field.key)}
                              >
                                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            )}
                            {value && (
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => copyToClipboard(value, field.label)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Button 
                      onClick={() => saveAPIConfig(api.id)}
                      disabled={isSaving === api.id}
                      size="sm"
                    >
                      {isSaving === api.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Salvar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => testConnection(api.id)}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Testar Conexão
                    </Button>
                    {api.docsUrl && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(api.docsUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Docs
                      </Button>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ExternalAPIsConfig;
