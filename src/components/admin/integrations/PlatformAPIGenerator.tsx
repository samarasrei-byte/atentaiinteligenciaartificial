import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Key, 
  Copy, 
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Code,
  Book,
  ExternalLink,
  Plus,
  Trash2,
  Settings,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface APIKey {
  id: string;
  name: string;
  key: string;
  type: 'publishable' | 'secret';
  createdAt: Date;
  lastUsed: Date | null;
  permissions: string[];
  isActive: boolean;
}

export const PlatformAPIGenerator: React.FC = () => {
  const { toast } = useToast();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Chave Produção',
      key: 'pk_live_atentai_5f8a2b3c4d5e6f7g8h9i0j',
      type: 'publishable',
      createdAt: new Date('2024-01-15'),
      lastUsed: new Date(),
      permissions: ['read:users', 'read:services'],
      isActive: true,
    },
    {
      id: '2',
      name: 'Chave Secreta Produção',
      key: 'sk_live_atentai_9z8y7x6w5v4u3t2s1r0q',
      type: 'secret',
      createdAt: new Date('2024-01-15'),
      lastUsed: new Date(),
      permissions: ['read:*', 'write:*'],
      isActive: true,
    },
    {
      id: '3',
      name: 'Webhook Secret',
      key: 'whsec_atentai_abc123def456ghi789',
      type: 'secret',
      createdAt: new Date('2024-02-01'),
      lastUsed: null,
      permissions: ['webhooks'],
      isActive: true,
    },
  ]);

  const toggleShowKey = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado!', description: `${label} copiada para a área de transferência` });
  };

  const generateNewKey = async (type: 'publishable' | 'secret') => {
    if (!newKeyName.trim()) {
      toast({ title: 'Nome obrigatório', description: 'Digite um nome para a chave', variant: 'destructive' });
      return;
    }
    
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const prefix = type === 'publishable' ? 'pk_live_atentai_' : 'sk_live_atentai_';
    const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: prefix + randomPart,
      type,
      createdAt: new Date(),
      lastUsed: null,
      permissions: type === 'publishable' ? ['read:users', 'read:services'] : ['read:*', 'write:*'],
      isActive: true,
    };
    
    setApiKeys(prev => [...prev, newKey]);
    setNewKeyName('');
    setIsGenerating(false);
    
    toast({ 
      title: 'Chave gerada! 🎉', 
      description: 'Guarde sua chave secreta em local seguro' 
    });
  };

  const revokeKey = (keyId: string) => {
    setApiKeys(prev => prev.map(key => 
      key.id === keyId ? { ...key, isActive: false } : key
    ));
    toast({ 
      title: 'Chave revogada', 
      description: 'A chave não pode mais ser usada',
      variant: 'destructive'
    });
  };

  const deleteKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId));
    toast({ title: 'Chave excluída' });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const codeExamples = {
    curl: `# AtentAI API
curl -X POST "https://api.atentai.com.br/v1/services" \\
  -H "Authorization: Bearer sk_live_atentai_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"type": "fiscal_analysis", "user_email": "cliente@email.com"}'

# Mercado Pago - Consultar Pagamentos
curl -H 'Authorization: Bearer <ENV_ACCESS_TOKEN>' \\
  https://api.mercadopago.com/v1/payments`,
    
    javascript: `import { AtentAI } from '@atentai/sdk';

const atentai = new AtentAI('sk_live_atentai_xxx');

// Criar nova solicitação de serviço
const request = await atentai.services.create({
  type: 'fiscal_analysis',
  user_email: 'cliente@email.com',
  metadata: { source: 'api' }
});

console.log(request.id);`,

    python: `from atentai import AtentAI

client = AtentAI(api_key="sk_live_atentai_xxx")

# Criar nova solicitação de serviço
request = client.services.create(
    type="fiscal_analysis",
    user_email="cliente@email.com",
    metadata={"source": "api"}
)

print(request.id)`,
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="keys" className="gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="docs" className="gap-2">
            <Book className="h-4 w-4" />
            Documentação
          </TabsTrigger>
          <TabsTrigger value="examples" className="gap-2">
            <Code className="h-4 w-4" />
            Exemplos
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="keys" className="space-y-6 mt-6">
          {/* Generate New Key */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Gerar Nova Chave
              </CardTitle>
              <CardDescription>Crie novas chaves de API para integração</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label>Nome da Chave</Label>
                  <Input 
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Ex: Integração ERP, App Mobile..."
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => generateNewKey('publishable')}
                  disabled={isGenerating}
                  variant="outline"
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
                  Gerar Chave Pública
                </Button>
                <Button 
                  onClick={() => generateNewKey('secret')}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
                  Gerar Chave Secreta
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Keys */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Chaves Ativas</h3>
            
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id} className={cn(
                'transition-all',
                !apiKey.isActive && 'opacity-50 bg-muted/50'
              )}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        'p-2 rounded-lg',
                        apiKey.type === 'publishable' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                      )}>
                        {apiKey.type === 'publishable' ? <Key className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{apiKey.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {apiKey.type === 'publishable' ? 'Pública' : 'Secreta'}
                          </Badge>
                          {!apiKey.isActive && (
                            <Badge variant="destructive" className="text-xs">Revogada</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                            {showKeys[apiKey.id] ? apiKey.key : apiKey.key.substring(0, 20) + '•'.repeat(15)}
                          </code>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Criada: {formatDate(apiKey.createdAt)}
                          </span>
                          {apiKey.lastUsed && (
                            <span>Último uso: {formatDate(apiKey.lastUsed)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleShowKey(apiKey.id)}
                      >
                        {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(apiKey.key, 'Chave')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {apiKey.isActive && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => revokeKey(apiKey.id)}
                          className="text-amber-600 hover:text-amber-700"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteKey(apiKey.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="docs" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5 text-primary" />
                Documentação da API AtentAI
              </CardTitle>
              <CardDescription>
                Referência completa para integração com a plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Base URL */}
              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-xs text-muted-foreground">Base URL</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-sm font-mono">https://api.atentai.com.br/v1</code>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => copyToClipboard('https://api.atentai.com.br/v1', 'Base URL')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Endpoints */}
              <div className="space-y-4">
                <h4 className="font-semibold">Endpoints Disponíveis</h4>
                
                <div className="grid gap-3">
                  {[
                    { method: 'GET', path: '/services', desc: 'Listar serviços disponíveis' },
                    { method: 'POST', path: '/services', desc: 'Criar nova solicitação de serviço' },
                    { method: 'GET', path: '/services/:id', desc: 'Obter detalhes de uma solicitação' },
                    { method: 'PUT', path: '/services/:id', desc: 'Atualizar status de solicitação' },
                    { method: 'GET', path: '/users', desc: 'Listar usuários (admin)' },
                    { method: 'POST', path: '/users', desc: 'Criar novo usuário' },
                    { method: 'GET', path: '/webhooks', desc: 'Listar webhooks configurados' },
                    { method: 'POST', path: '/webhooks', desc: 'Registrar novo webhook' },
                  ].map((endpoint, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'font-mono text-xs min-w-16 justify-center',
                          endpoint.method === 'GET' && 'bg-blue-50 text-blue-600 border-blue-200',
                          endpoint.method === 'POST' && 'bg-green-50 text-green-600 border-green-200',
                          endpoint.method === 'PUT' && 'bg-amber-50 text-amber-600 border-amber-200',
                          endpoint.method === 'DELETE' && 'bg-red-50 text-red-600 border-red-200',
                        )}
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="font-mono text-sm">{endpoint.path}</code>
                      <span className="text-sm text-muted-foreground ml-auto">{endpoint.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Authentication */}
              <div className="space-y-3">
                <h4 className="font-semibold">Autenticação</h4>
                <p className="text-sm text-muted-foreground">
                  Todas as requisições devem incluir a chave de API no header Authorization:
                </p>
                <div className="p-3 bg-gray-900 rounded-lg">
                  <code className="text-sm text-green-400 font-mono">
                    Authorization: Bearer sk_live_atentai_xxx
                  </code>
                </div>
              </div>

              <Button className="w-full gap-2">
                <ExternalLink className="h-4 w-4" />
                Ver Documentação Completa
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                Exemplos de Código
              </CardTitle>
              <CardDescription>Exemplos práticos de integração</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="curl">
                <TabsList className="mb-4">
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                </TabsList>

                {Object.entries(codeExamples).map(([lang, code]) => (
                  <TabsContent key={lang} value={lang}>
                    <div className="relative">
                      <pre className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
                        <code className="text-sm text-gray-100 font-mono whitespace-pre">
                          {code}
                        </code>
                      </pre>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        onClick={() => copyToClipboard(code, 'Código')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformAPIGenerator;
