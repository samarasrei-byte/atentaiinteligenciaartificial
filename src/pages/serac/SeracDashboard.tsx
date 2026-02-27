import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users, TrendingUp, DollarSign, BarChart3, Bot, Megaphone,
  ArrowUpRight, ArrowDownRight, Building2, Scale, Landmark,
  Target, Zap, CalendarCheck, FileSignature, BrainCircuit,
  Activity, Flame
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, AreaChart, Area, LineChart, Line, Legend
} from 'recharts';

/* ── KPIs ── */
const kpis = [
  { label: 'Leads Captados', value: '1.284', icon: Users, change: '+18%', up: true, accent: '#2563EB' },
  { label: 'Score Médio', value: '78.4', icon: Target, change: '+3.2', up: true, accent: '#059669' },
  { label: 'Receita Projetada', value: 'R$ 4.2M', icon: DollarSign, change: '+22%', up: true, accent: '#7C3AED' },
  { label: 'ROI Plataforma', value: '340%', icon: TrendingUp, change: '+45%', up: true, accent: '#0891B2' },
  { label: 'Economia Tributária', value: 'R$ 1.8M', icon: Scale, change: '+R$ 320K', up: true, accent: '#059669' },
  { label: 'Contratos Pipeline', value: '67', icon: FileSignature, change: '+12', up: true, accent: '#D97706' },
];

/* ── Leads por Canal ── */
const leadsByChannel = [
  { canal: 'Empresas', leads: 624, qualified: 412, meetings: 89, contracts: 34, color: '#2563EB', icon: Building2 },
  { canal: 'Contadores', leads: 387, qualified: 264, meetings: 52, contracts: 21, color: '#7C3AED', icon: Users },
  { canal: 'Cartórios', leads: 273, qualified: 198, meetings: 41, contracts: 12, color: '#059669', icon: Landmark },
];

/* ── Pipeline ── */
const pipelineStages = [
  { stage: 'Prospecção', count: 342, value: 'R$ 1.2M', pct: 100 },
  { stage: 'Qualificação', count: 218, value: 'R$ 890K', pct: 64 },
  { stage: 'Proposta', count: 89, value: 'R$ 520K', pct: 26 },
  { stage: 'Negociação', count: 45, value: 'R$ 380K', pct: 13 },
  { stage: 'Fechamento', count: 23, value: 'R$ 210K', pct: 7 },
];

/* ── Campanhas Ativas ── */
const activeCampaigns = [
  { name: 'Reforma 2026 – Empresas SP', source: 'G8 Prospect', leads: 156, conversion: 12.4, status: 'active' },
  { name: 'Cartórios – Região Sul', source: 'AtentAI', leads: 89, conversion: 8.7, status: 'active' },
  { name: 'Contadores – Mentoria SERAC', source: 'G8 Prospect', leads: 234, conversion: 15.2, status: 'active' },
  { name: 'Infoprodutores – Nacional', source: 'AtentAI', leads: 67, conversion: 9.1, status: 'paused' },
];

/* ── Performance Agentes ── */
const agentPerformance = [
  { agent: 'SDR Tributário', accuracy: 94, leadsProcessed: 1847, conversions: 342, status: 'online' },
  { agent: 'Diagnóstico IA', accuracy: 97, leadsProcessed: 1203, conversions: 891, status: 'online' },
  { agent: 'Esp. Cartórios', accuracy: 92, leadsProcessed: 456, conversions: 198, status: 'online' },
  { agent: 'Customer Success', accuracy: 89, leadsProcessed: 923, conversions: 567, status: 'online' },
  { agent: 'Compliance IA', accuracy: 96, leadsProcessed: 678, conversions: 421, status: 'online' },
  { agent: 'Diretor IA', accuracy: 98, leadsProcessed: 2134, conversions: 1284, status: 'online' },
];

/* ── Previsão 12 Meses ── */
const forecast12m = [
  { mes: 'Mar', receita: 320, leads: 180 },
  { mes: 'Abr', receita: 380, leads: 210 },
  { mes: 'Mai', receita: 420, leads: 240 },
  { mes: 'Jun', receita: 510, leads: 290 },
  { mes: 'Jul', receita: 580, leads: 330 },
  { mes: 'Ago', receita: 650, leads: 370 },
  { mes: 'Set', receita: 720, leads: 410 },
  { mes: 'Out', receita: 810, leads: 460 },
  { mes: 'Nov', receita: 890, leads: 510 },
  { mes: 'Dez', receita: 980, leads: 560 },
  { mes: 'Jan', receita: 1050, leads: 610 },
  { mes: 'Fev', receita: 1150, leads: 670 },
];

/* ── Reforma 2026 ── */
const reformaIndicators = [
  { label: 'Clientes impactados', value: '189', pct: 76 },
  { label: 'Simulações realizadas', value: '1.247', pct: 88 },
  { label: 'Economia identificada', value: 'R$ 2.4M', pct: 65 },
  { label: 'Migrações planejadas', value: '34', pct: 42 },
];

export default function SeracDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1B3A5C]">Dashboard Executivo</h2>
          <p className="text-sm text-[#6B7280] mt-1">Visão estratégica consolidada · Atualizado em tempo real</p>
        </div>
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5">
          <Activity className="h-3 w-3" />
          Live
        </Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-[#E5E7EB] hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${kpi.accent}10` }}>
                  <kpi.icon className="h-4 w-4" style={{ color: kpi.accent }} />
                </div>
                <div className="flex items-center gap-0.5">
                  {kpi.up ? <ArrowUpRight className="h-3 w-3 text-emerald-600" /> : <ArrowDownRight className="h-3 w-3 text-red-500" />}
                  <span className="text-[10px] font-semibold text-emerald-600">{kpi.change}</span>
                </div>
              </div>
              <p className="text-xl font-bold" style={{ color: kpi.accent }}>{kpi.value}</p>
              <p className="text-[10px] text-[#9CA3AF] mt-0.5 uppercase tracking-wider">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leads por Canal + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leads por Canal */}
        <Card className="border-[#E5E7EB]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#1B3A5C] flex items-center gap-2">
              <Target className="h-4 w-4 text-[#2563EB]" />
              Leads por Canal de Prospecção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {leadsByChannel.map((ch) => (
              <div key={ch.canal} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md" style={{ backgroundColor: `${ch.color}15` }}>
                      <ch.icon className="h-3.5 w-3.5" style={{ color: ch.color }} />
                    </div>
                    <span className="text-sm font-medium text-[#374151]">{ch.canal}</span>
                  </div>
                  <span className="text-lg font-bold" style={{ color: ch.color }}>{ch.leads}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div className="bg-[#F9FAFB] rounded-md p-1.5 text-center">
                    <p className="font-bold text-[#374151]">{ch.qualified}</p>
                    <p className="text-[#9CA3AF]">Qualificados</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md p-1.5 text-center">
                    <p className="font-bold text-[#374151]">{ch.meetings}</p>
                    <p className="text-[#9CA3AF]">Reuniões</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md p-1.5 text-center">
                    <p className="font-bold text-[#374151]">{ch.contracts}</p>
                    <p className="text-[#9CA3AF]">Contratos</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pipeline de Contratos */}
        <Card className="border-[#E5E7EB]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#1B3A5C] flex items-center gap-2">
              <FileSignature className="h-4 w-4 text-[#7C3AED]" />
              Pipeline de Contratos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pipelineStages.map((s, i) => (
              <div key={s.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#374151]">{s.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#6B7280]">{s.count} leads</span>
                    <span className="font-bold text-[#1B3A5C]">{s.value}</span>
                  </div>
                </div>
                <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${s.pct}%`,
                      background: `linear-gradient(90deg, #2563EB, #7C3AED)`,
                      opacity: 1 - i * 0.15,
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
              <span className="text-xs text-[#6B7280]">Valor total no pipeline</span>
              <span className="text-lg font-bold text-[#1B3A5C]">R$ 3.2M</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campanhas Ativas + Performance Agentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Campanhas Ativas */}
        <Card className="border-[#E5E7EB]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#1B3A5C] flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-[#D97706]" />
              Campanhas Ativas
              <Badge variant="outline" className="ml-auto text-[10px]">{activeCampaigns.filter(c => c.status === 'active').length} ativas</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeCampaigns.map((c) => (
              <div key={c.name} className="flex items-center justify-between p-2.5 rounded-lg bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#374151] truncate">{c.name}</p>
                  <p className="text-[10px] text-[#9CA3AF]">{c.source}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#1B3A5C]">{c.leads} leads</p>
                    <p className="text-[10px] text-emerald-600">{c.conversion}% conv.</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${c.status === 'active' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Performance dos Agentes IA */}
        <Card className="border-[#E5E7EB]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#1B3A5C] flex items-center gap-2">
              <Bot className="h-4 w-4 text-[#0891B2]" />
              Performance dos Agentes IA
              <Badge className="ml-auto bg-emerald-100 text-emerald-700 text-[10px]">24/7 Online</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {agentPerformance.map((a) => (
              <div key={a.agent} className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F9FAFB] transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative">
                    <BrainCircuit className="h-4 w-4 text-[#0891B2]" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 border border-white" />
                  </div>
                  <span className="text-xs font-medium text-[#374151] truncate">{a.agent}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-[10px]">
                  <div className="text-center">
                    <p className="font-bold text-[#059669]">{a.accuracy}%</p>
                    <p className="text-[#9CA3AF]">Acurácia</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-[#1B3A5C]">{a.leadsProcessed.toLocaleString('pt-BR')}</p>
                    <p className="text-[#9CA3AF]">Processados</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Previsão 12 Meses + Reforma 2026 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Previsão */}
        <Card className="border-[#E5E7EB] lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#1B3A5C] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#059669]" />
              Previsão de Crescimento – 12 Meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast12m}>
                  <defs>
                    <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }}
                    formatter={(value: number, name: string) => [
                      name === 'receita' ? `R$ ${value}K` : value,
                      name === 'receita' ? 'Receita' : 'Leads'
                    ]}
                  />
                  <Legend verticalAlign="top" height={36} formatter={(v) => v === 'receita' ? 'Receita (R$ K)' : 'Leads'} />
                  <Area type="monotone" dataKey="receita" stroke="#2563EB" strokeWidth={2} fill="url(#receitaGrad)" />
                  <Area type="monotone" dataKey="leads" stroke="#059669" strokeWidth={2} fill="url(#leadsGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Indicadores Reforma 2026 */}
        <Card className="border-[#E5E7EB]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#1B3A5C] flex items-center gap-2">
              <Scale className="h-4 w-4 text-[#D97706]" />
              Reforma 2026
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reformaIndicators.map((ind) => (
              <div key={ind.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6B7280]">{ind.label}</span>
                  <span className="font-bold text-[#1B3A5C]">{ind.value}</span>
                </div>
                <Progress value={ind.pct} className="h-1.5" />
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-[#E5E7EB]">
              <div className="flex items-center gap-2 text-xs text-[#D97706]">
                <Flame className="h-3.5 w-3.5" />
                <span className="font-medium">IBS + CBS em vigor Jan/2027</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
