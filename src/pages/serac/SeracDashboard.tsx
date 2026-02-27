import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users, TrendingUp, DollarSign, Bot, Megaphone,
  ArrowUpRight, ArrowDownRight, Building2, Scale, Landmark,
  Target, FileSignature, BrainCircuit,
  Activity, Flame
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';

/* ── KPIs ── */
const kpis = [
  { label: 'Leads Captados', value: '1.284', icon: Users, change: '+18%', up: true },
  { label: 'Score Médio', value: '78.4', icon: Target, change: '+3.2', up: true },
  { label: 'Receita Projetada', value: 'R$ 4.2M', icon: DollarSign, change: '+22%', up: true },
  { label: 'ROI Plataforma', value: '340%', icon: TrendingUp, change: '+45%', up: true },
  { label: 'Economia Tributária', value: 'R$ 1.8M', icon: Scale, change: '+R$ 320K', up: true },
  { label: 'Contratos Pipeline', value: '67', icon: FileSignature, change: '+12', up: true },
];

/* ── Leads por Canal ── */
const leadsByChannel = [
  { canal: 'Empresas', leads: 624, qualified: 412, meetings: 89, contracts: 34, icon: Building2 },
  { canal: 'Contadores', leads: 387, qualified: 264, meetings: 52, contracts: 21, icon: Users },
  { canal: 'Cartórios', leads: 273, qualified: 198, meetings: 41, contracts: 12, icon: Landmark },
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
  { agent: 'SDR Tributário', accuracy: 94, leadsProcessed: 1847, status: 'online' },
  { agent: 'Diagnóstico IA', accuracy: 97, leadsProcessed: 1203, status: 'online' },
  { agent: 'Esp. Cartórios', accuracy: 92, leadsProcessed: 456, status: 'online' },
  { agent: 'Customer Success', accuracy: 89, leadsProcessed: 923, status: 'online' },
  { agent: 'Compliance IA', accuracy: 96, leadsProcessed: 678, status: 'online' },
  { agent: 'Diretor IA', accuracy: 98, leadsProcessed: 2134, status: 'online' },
];

/* ── Previsão 12 Meses ── */
const forecast12m = [
  { mes: 'Mar', receita: 320, leads: 180 }, { mes: 'Abr', receita: 380, leads: 210 },
  { mes: 'Mai', receita: 420, leads: 240 }, { mes: 'Jun', receita: 510, leads: 290 },
  { mes: 'Jul', receita: 580, leads: 330 }, { mes: 'Ago', receita: 650, leads: 370 },
  { mes: 'Set', receita: 720, leads: 410 }, { mes: 'Out', receita: 810, leads: 460 },
  { mes: 'Nov', receita: 890, leads: 510 }, { mes: 'Dez', receita: 980, leads: 560 },
  { mes: 'Jan', receita: 1050, leads: 610 }, { mes: 'Fev', receita: 1150, leads: 670 },
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
          <h2 className="text-2xl font-bold text-foreground">Dashboard Executivo</h2>
          <p className="text-sm text-muted-foreground mt-1">Visão estratégica consolidada · Atualizado em tempo real</p>
        </div>
        <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1.5">
          <Activity className="h-3 w-3" /> Live
        </Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-border hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <kpi.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex items-center gap-0.5">
                  {kpi.up ? <ArrowUpRight className="h-3 w-3 text-success" /> : <ArrowDownRight className="h-3 w-3 text-destructive" />}
                  <span className="text-[10px] font-semibold text-success">{kpi.change}</span>
                </div>
              </div>
              <p className="text-xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leads por Canal + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leads por Canal */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Leads por Canal de Prospecção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {leadsByChannel.map((ch) => (
              <div key={ch.canal} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <ch.icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{ch.canal}</span>
                  </div>
                  <span className="text-lg font-bold text-primary">{ch.leads}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  {[
                    { label: 'Qualificados', value: ch.qualified },
                    { label: 'Reuniões', value: ch.meetings },
                    { label: 'Contratos', value: ch.contracts },
                  ].map(m => (
                    <div key={m.label} className="bg-muted rounded-md p-1.5 text-center">
                      <p className="font-bold text-foreground">{m.value}</p>
                      <p className="text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pipeline de Contratos */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileSignature className="h-4 w-4 text-info" /> Pipeline de Contratos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pipelineStages.map((s, i) => (
              <div key={s.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{s.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{s.count} leads</span>
                    <span className="font-bold text-foreground">{s.value}</span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-primary"
                    style={{ width: `${s.pct}%`, opacity: 1 - i * 0.15 }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Valor total no pipeline</span>
              <span className="text-lg font-bold text-foreground">R$ 3.2M</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campanhas Ativas + Performance Agentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Campanhas Ativas */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-accent" /> Campanhas Ativas
              <Badge variant="outline" className="ml-auto text-[10px]">{activeCampaigns.filter(c => c.status === 'active').length} ativas</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeCampaigns.map((c) => (
              <div key={c.name} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground">{c.source}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-bold text-foreground">{c.leads} leads</p>
                    <p className="text-[10px] text-success">{c.conversion}% conv.</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${c.status === 'active' ? 'bg-success' : 'bg-accent'}`} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Performance dos Agentes IA */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Bot className="h-4 w-4 text-info" /> Performance dos Agentes IA
              <Badge className="ml-auto bg-success/10 text-success text-[10px]">24/7 Online</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {agentPerformance.map((a) => (
              <div key={a.agent} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative">
                    <BrainCircuit className="h-4 w-4 text-info" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-success border border-card" />
                  </div>
                  <span className="text-xs font-medium text-foreground truncate">{a.agent}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-[10px]">
                  <div className="text-center">
                    <p className="font-bold text-success">{a.accuracy}%</p>
                    <p className="text-muted-foreground">Acurácia</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-foreground">{a.leadsProcessed.toLocaleString('pt-BR')}</p>
                    <p className="text-muted-foreground">Processados</p>
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
        <Card className="border-border lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" /> Previsão de Crescimento – 12 Meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast12m}>
                  <defs>
                    <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12, background: 'hsl(var(--card))' }} />
                  <Legend verticalAlign="top" height={36} formatter={(v) => v === 'receita' ? 'Receita (R$ K)' : 'Leads'} />
                  <Area type="monotone" dataKey="receita" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#receitaGrad)" />
                  <Area type="monotone" dataKey="leads" stroke="hsl(var(--success))" strokeWidth={2} fill="url(#leadsGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Indicadores Reforma 2026 */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Scale className="h-4 w-4 text-accent" /> Reforma 2026
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reformaIndicators.map((ind) => (
              <div key={ind.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{ind.label}</span>
                  <span className="font-bold text-foreground">{ind.value}</span>
                </div>
                <Progress value={ind.pct} className="h-1.5" />
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-accent-foreground">
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
