import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  CheckCircle2, AlertCircle, Clock, Globe, Building2,
  CreditCard, FileText, Bot, Target, Scale, Shield, Gavel
} from 'lucide-react';
import { cn } from '@/lib/utils';

const integracoes = [
  { nome: 'Receita Federal', desc: 'Consulta CNPJ, situação cadastral, certidões', icon: Building2, status: 'connected', latencia: '120ms', chamadas: '12.480' },
  { nome: 'SEFAZ', desc: 'NF-e, SPED Fiscal, CT-e, MDF-e', icon: FileText, status: 'connected', latencia: '85ms', chamadas: '45.200' },
  { nome: 'INPI', desc: 'Consulta marcas, patentes e registros', icon: Shield, status: 'connected', latencia: '200ms', chamadas: '3.120' },
  { nome: 'APIs Bancárias', desc: 'Open Banking, conciliação bancária, PIX', icon: CreditCard, status: 'connected', latencia: '95ms', chamadas: '8.900' },
  { nome: 'APIs Folha de Pagamento', desc: 'eSocial, FGTS Digital, DCTFWeb', icon: FileText, status: 'connected', latencia: '150ms', chamadas: '6.340' },
  { nome: 'APIs Cartórios', desc: 'CENSEC, Central de Protestos, ONR', icon: Gavel, status: 'connected', latencia: '180ms', chamadas: '2.100' },
  { nome: 'APIs Jurídicas', desc: 'Tribunais, processos, diários oficiais', icon: Scale, status: 'warning', latencia: '250ms', chamadas: '1.850' },
  { nome: 'AtentAI Engine', desc: 'Motor de IA fiscal, simuladores, diagnóstico', icon: Bot, status: 'connected', latencia: '45ms', chamadas: '78.500' },
  { nome: 'G8 Prospect', desc: 'Prospecção B2B, enriquecimento de leads', icon: Target, status: 'connected', latencia: '65ms', chamadas: '34.200' },
  { nome: 'Clauthor', desc: 'Agentes IA especializados em compliance e tax', icon: Bot, status: 'connected', latencia: '55ms', chamadas: '22.100' },
  { nome: 'WhatsApp Business', desc: 'Mensagens automatizadas, chatbot, notificações', icon: Globe, status: 'connected', latencia: '70ms', chamadas: '56.300' },
  { nome: 'Mercado Pago', desc: 'Pagamentos, checkout, assinaturas', icon: CreditCard, status: 'connected', latencia: '90ms', chamadas: '4.600' },
];

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'connected': return { label: 'Conectado', cls: 'text-success', icon: CheckCircle2 };
    case 'warning': return { label: 'Instável', cls: 'text-accent-foreground', icon: AlertCircle };
    case 'offline': return { label: 'Offline', cls: 'text-destructive', icon: Clock };
    default: return { label: 'Desconhecido', cls: 'text-muted-foreground', icon: AlertCircle };
  }
};

export default function SeracAPIHub() {
  const connected = integracoes.filter(i => i.status === 'connected').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">API Hub — Central de Integrações</h2>
          <p className="text-sm text-muted-foreground mt-1">Todas as conexões ativas e monitoradas em tempo real</p>
        </div>
        <Badge className="bg-success/10 text-success border-0 text-xs">
          <CheckCircle2 className="h-3 w-3 mr-1" /> {connected}/{integracoes.length} APIs conectadas
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'APIs Ativas', value: connected.toString(), cls: 'text-success' },
          { label: 'Chamadas/mês', value: '275K+', cls: 'text-primary' },
          { label: 'Uptime', value: '99.7%', cls: 'text-info' },
          { label: 'Latência Média', value: '112ms', cls: 'text-accent-foreground' },
        ].map((k) => (
          <Card key={k.label} className="border-border">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className={cn("text-2xl font-bold mt-1", k.cls)}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {integracoes.map((api, i) => {
          const statusInfo = getStatusInfo(api.status);
          return (
            <Card key={i} className="border-border hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-secondary/10">
                      <api.icon className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{api.nome}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <statusInfo.icon className={cn("h-3 w-3", statusInfo.cls)} />
                        <span className={cn("text-[10px] font-medium", statusInfo.cls)}>{statusInfo.label}</span>
                      </div>
                    </div>
                  </div>
                  <Switch defaultChecked={api.status === 'connected'} />
                </div>
                <p className="text-xs text-muted-foreground mb-3">{api.desc}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                  <span>Latência: <strong className="text-foreground/70">{api.latencia}</strong></span>
                  <span>Chamadas: <strong className="text-foreground/70">{api.chamadas}</strong></span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
