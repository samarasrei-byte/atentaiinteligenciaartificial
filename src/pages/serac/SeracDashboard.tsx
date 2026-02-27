import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users, TrendingUp, DollarSign, Bot,
  ArrowUpRight, Building2, Scale, Landmark,
  Target, FileSignature, BrainCircuit,
  Activity, MessageCircle, Video, Send,
  Sparkles, BarChart3, PieChart, Zap
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

/* ── KPIs ── */
const kpis = [
  { label: 'Leads Captados', value: '1.284', icon: Users, change: '+18%' },
  { label: 'Score Médio', value: '78.4', icon: Target, change: '+3.2' },
  { label: 'Receita Projetada', value: 'R$ 4.2M', icon: DollarSign, change: '+22%' },
  { label: 'ROI Plataforma', value: '340%', icon: TrendingUp, change: '+45%' },
];

/* ── Previsão ── */
const forecast = [
  { mes: 'Mar', receita: 320, leads: 180 }, { mes: 'Abr', receita: 380, leads: 210 },
  { mes: 'Mai', receita: 420, leads: 240 }, { mes: 'Jun', receita: 510, leads: 290 },
  { mes: 'Jul', receita: 580, leads: 330 }, { mes: 'Ago', receita: 650, leads: 370 },
  { mes: 'Set', receita: 720, leads: 410 }, { mes: 'Out', receita: 810, leads: 460 },
  { mes: 'Nov', receita: 890, leads: 510 }, { mes: 'Dez', receita: 980, leads: 560 },
];

/* ── Pipeline ── */
const pipeline = [
  { stage: 'Prospecção', count: 342, pct: 100 },
  { stage: 'Qualificação', count: 218, pct: 64 },
  { stage: 'Proposta', count: 89, pct: 26 },
  { stage: 'Fechamento', count: 23, pct: 7 },
];

/* ── Agentes ── */
const agents = [
  { name: 'Sofia — SDR Tributário', role: 'Prospecção inteligente', accuracy: 94, processed: 1847, status: 'online' },
  { name: 'Lucas — Diagnóstico IA', role: 'Análise fiscal automatizada', accuracy: 97, processed: 1203, status: 'online' },
  { name: 'Ana — Customer Success', role: 'Retenção e relacionamento', accuracy: 89, processed: 923, status: 'online' },
  { name: 'Rafael — Diretor IA', role: 'Supervisão estratégica', accuracy: 98, processed: 2134, status: 'online' },
];

/* ── Chat do Assistente ── */
const assistantMessages = [
  { id: 1, role: 'assistant', text: 'Bom dia! Sou a Sofia, sua assistente de inteligência fiscal da SERAC. 🤖' },
  { id: 2, role: 'assistant', text: 'Identifiquei 12 leads com alto potencial de conversão hoje. O setor de Comércio está com taxa 2x maior que a média.' },
  { id: 3, role: 'assistant', text: '📊 KPIs atualizados: Economia tributária identificada subiu para R$ 1.8M (+18% mês anterior). Recomendo priorizar reuniões com clientes do Simples Nacional.' },
  { id: 4, role: 'assistant', text: '🎯 Reunião agendada: Amanhã 14h — Diagnóstico Tributário com 3 leads qualificados do setor de Serviços. Lucas (Diagnóstico IA) já preparou o material.' },
];

/* ── Canais ── */
const channels = [
  { name: 'Empresas', leads: 624, icon: Building2, conversion: 12.4 },
  { name: 'Contadores', leads: 387, icon: Users, conversion: 15.2 },
  { name: 'Cartórios', leads: 273, icon: Landmark, conversion: 8.7 },
];

/* ── Reuniões ── */
const meetings = [
  { title: 'Diagnóstico Tributário — Tech Solutions', time: '14:00', agents: ['Sofia', 'Lucas'], type: 'Análise Fiscal' },
  { title: 'Onboarding — Cartório Vila Nova', time: '16:00', agents: ['Ana', 'Rafael'], type: 'Integração' },
  { title: 'Review Semanal — Pipeline Q1', time: '10:00 (amanhã)', agents: ['Rafael', 'Sofia', 'Lucas'], type: 'Estratégia' },
];

export default function SeracDashboard() {
  const [chatInput, setChatInput] = useState('');
  const [visibleMessages, setVisibleMessages] = useState<typeof assistantMessages>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i >= assistantMessages.length) {
        clearInterval(interval);
        return;
      }
      const msg = assistantMessages[i];
      if (msg) {
        setVisibleMessages(prev => [...prev, msg]);
      }
      i++;
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Visão Geral</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Inteligência em tempo real · Powered by IA</p>
        </div>
        <Badge className="serac-badge gap-1.5 px-3 py-1.5">
          <Activity className="h-3 w-3" /> Live
        </Badge>
      </motion.div>

      {/* KPIs — Minimalista */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="serac-card group hover:serac-card-hover transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl serac-icon-bg">
                    <kpi.icon className="h-4 w-4 serac-icon" />
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <ArrowUpRight className="h-3 w-3" />
                    <span className="text-xs font-semibold">{kpi.change}</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground tracking-tight">{kpi.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider">{kpi.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Assistente IA + Gráfico de Previsão */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Assistente Sofia — Chat */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="serac-card h-full flex flex-col">
            <div className="p-4 border-b border-border flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full serac-gradient flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-card" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Sofia — Assistente IA SERAC</p>
                <p className="text-[10px] text-muted-foreground">Inteligência fiscal personalizada</p>
              </div>
              <Sparkles className="h-4 w-4 serac-icon animate-pulse" />
            </div>

            <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[320px] min-h-[260px]">
              <AnimatePresence>
                {visibleMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="flex gap-2"
                  >
                    <div className="w-6 h-6 rounded-full serac-gradient flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                    <div className="serac-chat-bubble rounded-xl rounded-tl-sm px-3 py-2 text-xs leading-relaxed text-foreground max-w-[85%]">
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Pergunte à Sofia..."
                  className="flex-1 bg-muted/50 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-[hsl(var(--serac-primary,217_91%_60%))]"
                />
                <button className="p-2 rounded-lg serac-gradient text-white hover:opacity-90 transition-opacity">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Gráfico de Previsão */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3"
        >
          <Card className="serac-card h-full">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 serac-icon" />
                <p className="text-sm font-semibold text-foreground">Projeção de Crescimento</p>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[hsl(217,91%,60%)]" /> Receita</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Leads</span>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecast}>
                    <defs>
                      <linearGradient id="seracReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(217,91%,60%)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(217,91%,60%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="seracLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34D399" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid hsl(var(--border))',
                        fontSize: 12,
                        background: 'hsl(var(--card))',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Area type="monotone" dataKey="receita" stroke="hsl(217,91%,60%)" strokeWidth={2} fill="url(#seracReceita)" />
                    <Area type="monotone" dataKey="leads" stroke="#34D399" strokeWidth={2} fill="url(#seracLeads)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Agentes IA + Reuniões */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Equipe de Agentes IA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="serac-card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 serac-icon" />
                <p className="text-sm font-semibold text-foreground">Equipe de Agentes IA</p>
              </div>
              <Badge className="serac-badge text-[10px]">4 online</Badge>
            </div>
            <CardContent className="p-4 space-y-2">
              {agents.map((a) => (
                <div key={a.name} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full serac-gradient flex items-center justify-center">
                        <BrainCircuit className="h-4 w-4 text-white" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-card" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{a.name}</p>
                      <p className="text-[10px] text-muted-foreground">{a.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-[10px]">
                    <div className="text-center">
                      <p className="font-bold text-emerald-400">{a.accuracy}%</p>
                      <p className="text-muted-foreground">Acurácia</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-foreground">{a.processed.toLocaleString('pt-BR')}</p>
                      <p className="text-muted-foreground">Processados</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Reuniões com Agentes + Diretores */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="serac-card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 serac-icon" />
                <p className="text-sm font-semibold text-foreground">Reuniões — Agentes IA + Diretores</p>
              </div>
              <Badge variant="outline" className="text-[10px] border-border">{meetings.length} agendadas</Badge>
            </div>
            <CardContent className="p-4 space-y-3">
              {meetings.map((m, i) => (
                <div key={m.title} className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{m.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{m.time}</p>
                    </div>
                    <Badge className="serac-badge-subtle text-[9px]">{m.type}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">Agentes:</span>
                    {m.agents.map(a => (
                      <span key={a} className="text-[10px] serac-agent-tag px-2 py-0.5 rounded-full">{a}</span>
                    ))}
                    <span className="text-[10px] serac-agent-tag px-2 py-0.5 rounded-full">+ Diretor</span>
                  </div>
                </div>
              ))}
              <div className="pt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                <Zap className="h-3 w-3 serac-icon" />
                <span>Os agentes preparam análises automaticamente antes de cada reunião</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pipeline + Canais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="serac-card">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <FileSignature className="h-4 w-4 serac-icon" />
              <p className="text-sm font-semibold text-foreground">Pipeline de Contratos</p>
            </div>
            <CardContent className="p-4 space-y-3">
              {pipeline.map((s, i) => (
                <div key={s.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{s.stage}</span>
                    <span className="font-bold text-foreground">{s.count} leads</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ delay: 0.8 + i * 0.15, duration: 0.6 }}
                      className="h-full rounded-full serac-gradient"
                      style={{ opacity: 1 - i * 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Canais de Prospecção */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="serac-card">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <PieChart className="h-4 w-4 serac-icon" />
              <p className="text-sm font-semibold text-foreground">Canais de Prospecção</p>
            </div>
            <CardContent className="p-4 space-y-3">
              {channels.map((ch) => (
                <div key={ch.name} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg serac-icon-bg">
                      <ch.icon className="h-4 w-4 serac-icon" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{ch.name}</p>
                      <p className="text-[10px] text-muted-foreground">{ch.conversion}% conversão</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold serac-icon">{ch.leads}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Reforma 2026 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
        <Card className="serac-card">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 serac-icon" />
              <p className="text-sm font-semibold text-foreground">Reforma Tributária 2026 — Impacto SERAC</p>
            </div>
            <Badge className="serac-badge text-[10px]">IBS + CBS Jan/2027</Badge>
          </div>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Clientes impactados', value: '189', pct: 76 },
                { label: 'Simulações realizadas', value: '1.247', pct: 88 },
                { label: 'Economia identificada', value: 'R$ 2.4M', pct: 65 },
                { label: 'Migrações planejadas', value: '34', pct: 42 },
              ].map((ind) => (
                <div key={ind.label} className="space-y-2">
                  <p className="text-xl font-bold text-foreground">{ind.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{ind.label}</p>
                  <Progress value={ind.pct} className="h-1.5 serac-progress" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
