import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bot, MessageSquare, FileSearch, ShieldCheck, Activity, Eye, BarChart3 } from 'lucide-react';

const agentes = [
  {
    nome: 'Agente de Atendimento Fiscal',
    desc: 'Responde dúvidas tributárias dos clientes com base na legislação vigente e na LC 214/2025.',
    icon: MessageSquare,
    status: 'ativo',
    logs: 1247,
    precisao: 94,
    color: '#2563EB',
  },
  {
    nome: 'Agente de Triagem Documental',
    desc: 'Classifica e valida documentos fiscais recebidos, identificando inconsistências automaticamente.',
    icon: FileSearch,
    status: 'ativo',
    logs: 856,
    precisao: 97,
    color: '#059669',
  },
  {
    nome: 'Agente de Compliance',
    desc: 'Monitora obrigações acessórias e prazos, gerando alertas preventivos para a equipe.',
    icon: ShieldCheck,
    status: 'pausado',
    logs: 432,
    precisao: 91,
    color: '#D97706',
  },
  {
    nome: 'Agente de Monitoramento de Risco',
    desc: 'Analisa continuamente a carteira de clientes para identificar riscos fiscais emergentes.',
    icon: Activity,
    status: 'ativo',
    logs: 2103,
    precisao: 89,
    color: '#7C3AED',
  },
];

const logsRecentes = [
  { agente: 'Atendimento Fiscal', acao: 'Respondeu consulta sobre crédito de ICMS-ST', tempo: '2 min atrás', supervisionado: true },
  { agente: 'Triagem Documental', acao: 'Classificou 12 notas fiscais de entrada', tempo: '8 min atrás', supervisionado: false },
  { agente: 'Monitoramento de Risco', acao: 'Detectou divergência na EFD de cliente', tempo: '15 min atrás', supervisionado: true },
  { agente: 'Atendimento Fiscal', acao: 'Gerou parecer sobre recuperação de PIS/COFINS', tempo: '32 min atrás', supervisionado: true },
];

export default function SeracAgentesIA() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1B3A5C]">Agentes de IA</h2>
        <p className="text-sm text-[#6B7280] mt-1">Assistentes inteligentes com supervisão humana</p>
      </div>

      {/* Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agentes.map((a, i) => (
          <Card key={i} className="border-[#E5E7EB] hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${a.color}10` }}>
                    <a.icon className="h-5 w-5" style={{ color: a.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1B3A5C] text-sm">{a.nome}</p>
                    <Badge variant={a.status === 'ativo' ? 'default' : 'secondary'} className="text-[10px] mt-1">{a.status.toUpperCase()}</Badge>
                  </div>
                </div>
                <Switch defaultChecked={a.status === 'ativo'} />
              </div>
              <p className="text-xs text-[#6B7280] mb-4">{a.desc}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9CA3AF]">{a.logs.toLocaleString()} logs registrados</span>
                <span className="font-semibold" style={{ color: a.color }}>Precisão: {a.precisao}%</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="text-xs flex-1 border-[#E5E7EB]">
                  <Eye className="h-3 w-3 mr-1" /> Supervisionar
                </Button>
                <Button size="sm" variant="outline" className="text-xs flex-1 border-[#E5E7EB]">
                  <BarChart3 className="h-3 w-3 mr-1" /> Relatório
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Logs */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#1B3A5C] flex items-center gap-2">
            <Bot className="h-4 w-4" /> Logs Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {logsRecentes.map((l, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-[10px]">{l.agente}</Badge>
                <p className="text-sm text-[#4B5563]">{l.acao}</p>
              </div>
              <div className="flex items-center gap-2">
                {l.supervisionado && <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-0">Supervisionado</Badge>}
                <span className="text-xs text-[#9CA3AF]">{l.tempo}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
