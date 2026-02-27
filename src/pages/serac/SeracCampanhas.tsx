import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Megaphone, TrendingUp, Users, CalendarCheck, FileSignature,
  ArrowUpRight, Zap, Target, BarChart3, Brain, Filter,
  Play, Pause, Eye
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, LineChart, Line, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Button } from '@/components/ui/button';

/* ── Summary ── */
const summary = [
  { label: 'Campanhas Ativas', value: '5', icon: Play, accent: '#059669' },
  { label: 'Leads Captados (Mês)', value: '1.847', icon: Users, accent: '#2563EB' },
  { label: 'Taxa de Resposta', value: '23.4%', icon: TrendingUp, accent: '#7C3AED' },
  { label: 'Conversão → Reunião', value: '12.8%', icon: CalendarCheck, accent: '#0891B2' },
  { label: 'Conversão → Contrato', value: '4.2%', icon: FileSignature, accent: '#D97706' },
  { label: 'ROI Médio', value: '380%', icon: BarChart3, accent: '#059669' },
];

/* ── Campaigns ── */
const campaigns = [
  {
    id: 1, name: 'Reforma Tributária 2026 – Empresas SP/RJ',
    source: 'G8 Prospect', channel: 'Empresas', status: 'active',
    leads: 456, responses: 134, meetings: 67, contracts: 23,
    roi: 420, budget: 'R$ 8.500', invested: 'R$ 6.200',
    niches: ['Comércio', 'Serviços', 'Indústria'],
    aiSuggestion: 'Aumentar frequência de follow-up para leads mornos do setor de Serviços — taxa de conversão 2x maior nesse segmento.',
  },
  {
    id: 2, name: 'Cartórios – Região Sul e Sudeste',
    source: 'AtentAI', channel: 'Cartórios', status: 'active',
    leads: 273, responses: 89, meetings: 41, contracts: 12,
    roi: 310, budget: 'R$ 5.000', invested: 'R$ 4.100',
    niches: ['Tabelionato', 'Registro Civil', 'Notas'],
    aiSuggestion: 'Cartórios de notas têm maior receptividade. Priorizar abordagem com diagnóstico tributário de emolumentos.',
  },
  {
    id: 3, name: 'Contadores – Clube de Mentorias SERAC',
    source: 'G8 Prospect', channel: 'Contadores', status: 'active',
    leads: 387, responses: 112, meetings: 52, contracts: 21,
    roi: 520, budget: 'R$ 6.000', invested: 'R$ 5.800',
    niches: ['Escritórios pequenos', 'Contadores solo', 'Sociedades'],
    aiSuggestion: 'Escritórios com 3-10 clientes apresentam maior interesse. Incluir case de economia real na abordagem.',
  },
  {
    id: 4, name: 'Infoprodutores – Nacional',
    source: 'AtentAI', channel: 'Empresas', status: 'active',
    leads: 198, responses: 45, meetings: 18, contracts: 7,
    roi: 280, budget: 'R$ 4.000', invested: 'R$ 3.200',
    niches: ['Cursos Online', 'PLR', 'Coprodução'],
    aiSuggestion: 'Segmento altamente sensível a preço. Destacar economia tributária real com simulação personalizada.',
  },
  {
    id: 5, name: 'Startups & Games – Tech Hubs',
    source: 'G8 Prospect', channel: 'Empresas', status: 'active',
    leads: 156, responses: 34, meetings: 12, contracts: 4,
    roi: 190, budget: 'R$ 3.500', invested: 'R$ 2.800',
    niches: ['SaaS', 'Estúdios', 'Startups early-stage'],
    aiSuggestion: 'Startups com faturamento > R$ 500K/ano são os melhores alvos. Abordagem consultiva com Valuation.',
  },
];

/* ── Monthly Performance ── */
const monthlyPerformance = [
  { mes: 'Out', leads: 980, reunioes: 67, contratos: 18 },
  { mes: 'Nov', leads: 1120, reunioes: 78, contratos: 24 },
  { mes: 'Dez', leads: 1340, reunioes: 89, contratos: 29 },
  { mes: 'Jan', leads: 1560, reunioes: 102, contratos: 35 },
  { mes: 'Fev', leads: 1847, reunioes: 134, contratos: 42 },
];

/* ── By Niche ── */
const nicheData = [
  { name: 'Comércio', value: 28, color: '#2563EB' },
  { name: 'Serviços', value: 24, color: '#7C3AED' },
  { name: 'Cartórios', value: 18, color: '#059669' },
  { name: 'Contadores', value: 16, color: '#D97706' },
  { name: 'Tech/Games', value: 8, color: '#0891B2' },
  { name: 'Infoprodutores', value: 6, color: '#DC2626' },
];

export default function SeracCampanhas() {
  const [selectedChannel, setSelectedChannel] = useState<string>('all');

  const filtered = selectedChannel === 'all'
    ? campaigns
    : campaigns.filter(c => c.channel === selectedChannel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1B3A5C]">Central de Campanhas</h2>
          <p className="text-sm text-[#6B7280] mt-1">Gestão multicanal AtentAI + G8 Prospect</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Filter className="h-3.5 w-3.5" /> Filtrar
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {summary.map((s) => (
          <Card key={s.label} className="border-[#E5E7EB]">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 rounded-md" style={{ backgroundColor: `${s.accent}10` }}>
                  <s.icon className="h-3.5 w-3.5" style={{ color: s.accent }} />
                </div>
              </div>
              <p className="text-lg font-bold" style={{ color: s.accent }}>{s.value}</p>
              <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Channel Tabs + Campaign List */}
      <Tabs value={selectedChannel} onValueChange={setSelectedChannel}>
        <TabsList className="bg-[#F3F4F6]">
          <TabsTrigger value="all" className="text-xs">Todas</TabsTrigger>
          <TabsTrigger value="Empresas" className="text-xs">Empresas</TabsTrigger>
          <TabsTrigger value="Contadores" className="text-xs">Contadores</TabsTrigger>
          <TabsTrigger value="Cartórios" className="text-xs">Cartórios</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedChannel} className="mt-4 space-y-3">
          {filtered.map((c) => (
            <Card key={c.id} className="border-[#E5E7EB] hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-[#1B3A5C] truncate">{c.name}</h3>
                      <Badge variant="outline" className={`text-[10px] shrink-0 ${c.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {c.status === 'active' ? 'Ativa' : 'Pausada'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[#9CA3AF]">
                      Fonte: <span className="font-medium text-[#6B7280]">{c.source}</span> · Nichos: {c.niches.join(', ')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-[#059669]">{c.roi}%</p>
                    <p className="text-[10px] text-[#9CA3AF]">ROI</p>
                  </div>
                </div>

                {/* Funnel metrics */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { label: 'Leads', value: c.leads, color: '#2563EB' },
                    { label: 'Respostas', value: c.responses, color: '#7C3AED' },
                    { label: 'Reuniões', value: c.meetings, color: '#0891B2' },
                    { label: 'Contratos', value: c.contracts, color: '#059669' },
                  ].map((m) => (
                    <div key={m.label} className="bg-[#F9FAFB] rounded-lg p-2 text-center">
                      <p className="text-sm font-bold" style={{ color: m.color }}>{m.value}</p>
                      <p className="text-[10px] text-[#9CA3AF]">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* AI Suggestion */}
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                  <Brain className="h-3.5 w-3.5 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-blue-800 leading-relaxed">{c.aiSuggestion}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Performance */}
        <Card className="border-[#E5E7EB]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#1B3A5C] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#2563EB]" />
              Evolução Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="leads" name="Leads" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="reunioes" name="Reuniões" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="contratos" name="Contratos" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Segmentação por Nicho */}
        <Card className="border-[#E5E7EB]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#1B3A5C] flex items-center gap-2">
              <Target className="h-4 w-4 text-[#D97706]" />
              Segmentação por Nicho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={nicheData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                    {nicheData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {nicheData.map((n) => (
                <div key={n.name} className="flex items-center gap-1.5 text-[11px]">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: n.color }} />
                  <span className="text-[#6B7280]">{n.name}</span>
                  <span className="font-bold text-[#1B3A5C] ml-auto">{n.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
