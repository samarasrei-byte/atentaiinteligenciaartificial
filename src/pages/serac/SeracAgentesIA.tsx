import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Bot, Target, TrendingUp, Users, ShieldCheck, BookOpen,
  User, Eye, BarChart3, Megaphone, Gamepad2, Building
} from 'lucide-react';
import { SeracAgentsOrchestration } from '@/components/serac/SeracAgentsOrchestration';
import { SeracAgentSimulation } from '@/components/serac/SeracAgentSimulation';

const agentes = [
  {
    nome: 'SDR Tributário',
    desc: 'Capta e qualifica leads automaticamente. Classifica como Frio, Morno, Quente ou Premium.',
    icon: Target,
    status: 'ativo',
    logs: 5247,
    precisao: 92,
    color: '#3B82F6',
  },
  {
    nome: 'Diagnóstico Tributário',
    desc: 'Analisa faturamento e regime para identificar economia fiscal. Gera gatilho de contratação.',
    icon: TrendingUp,
    status: 'ativo',
    logs: 3420,
    precisao: 97,
    color: '#10B981',
  },
  {
    nome: 'Especialista Cartórios',
    desc: 'Agente nichado para o setor extrajudicial. Conhece legislação específica de cartórios.',
    icon: Building,
    status: 'ativo',
    logs: 1890,
    precisao: 96,
    color: '#8B5CF6',
  },
  {
    nome: 'Especialista Infoprodutores',
    desc: 'Focado em criadores digitais, SaaS e vendas online. Tributação sobre royalties e cursos.',
    icon: Megaphone,
    status: 'ativo',
    logs: 2103,
    precisao: 94,
    color: '#F43F5E',
  },
  {
    nome: 'Especialista Gamers',
    desc: 'Streamers, e-sports e gaming. Tributação sobre doações, subs, patrocínios e premiações.',
    icon: Gamepad2,
    status: 'ativo',
    logs: 856,
    precisao: 93,
    color: '#06B6D4',
  },
  {
    nome: 'Customer Success AI',
    desc: 'Acompanha clientes, envia alertas fiscais, sugere melhorias e gera upsell automático.',
    icon: ShieldCheck,
    status: 'ativo',
    logs: 8932,
    precisao: 95,
    color: '#F59E0B',
  },
  {
    nome: 'Autoridade & Conteúdo',
    desc: 'Gera conteúdo técnico, respostas especializadas e posicionamento de autoridade.',
    icon: BookOpen,
    status: 'ativo',
    logs: 4521,
    precisao: 91,
    color: '#EC4899',
  },
  {
    nome: 'Diretor de Inteligência',
    desc: 'Supervisiona todos os agentes, valida decisões e aprova propostas premium.',
    icon: User,
    status: 'ativo',
    logs: 6800,
    precisao: 99,
    color: '#0891B2',
  },
];

const logsRecentes = [
  { agente: 'SDR Tributário', acao: 'Lead premium captado: Cartório São José — score 92%', tempo: '2 min atrás', supervisionado: false },
  { agente: 'Diagnóstico', acao: 'Economia de R$ 74k/ano identificada para lead premium', tempo: '5 min atrás', supervisionado: true },
  { agente: 'Esp. Infoprodutores', acao: 'Proposta personalizada enviada — migração de regime', tempo: '12 min atrás', supervisionado: true },
  { agente: 'Customer Success', acao: 'Upsell detectado: cliente cresceu 40%, sugerindo Lucro Presumido', tempo: '18 min atrás', supervisionado: false },
  { agente: 'Conteúdo', acao: 'Artigo publicado: regime tributário para infoprodutores 2026', tempo: '25 min atrás', supervisionado: false },
  { agente: 'Diretor', acao: 'Relatório semanal DIEC aprovado: 30 novos contratos, R$ 75k receita', tempo: '32 min atrás', supervisionado: true },
];

export default function SeracAgentesIA() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1B3A5C]">DIEC — Inteligência Fiscal e Crescimento</h2>
        <p className="text-sm text-[#6B7280] mt-1">Departamento de agentes especializados com supervisão humana</p>
      </div>

      {/* Orchestration Card */}
      <SeracAgentsOrchestration compact />

      {/* Agent Simulation */}
      <SeracAgentSimulation />

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
                <span className="text-[#9CA3AF]">{a.logs.toLocaleString()} logs</span>
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
            <Bot className="h-4 w-4" /> Logs Recentes — DIEC
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
