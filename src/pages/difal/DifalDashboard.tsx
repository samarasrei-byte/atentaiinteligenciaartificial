import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  PlusCircle, Calculator, TrendingUp, MapPin, Bell,
  Sparkles, GitCompare, Scale, FileText, ArrowRight, ShieldCheck, History
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { brl, dateBR } from '@/lib/difal/format';
import { UFS } from '@/lib/difal/types';

interface SimRow {
  id: string;
  numero: number;
  data_operacao: string;
  uf_origem: string;
  uf_destino: string;
  valor_total_cents: number;
  status: string;
  created_at: string;
  difal_calculation_results: Array<{ difal_cents: number; fcp_cents: number; total_estimado_cents: number }>;
}

const periodos = [
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
  { value: '365', label: 'Últimos 12 meses' },
];

export default function DifalDashboard() {
  const [periodo, setPeriodo] = useState('90');
  const [ufFiltro, setUfFiltro] = useState('todas');

  const desde = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - Number(periodo));
    return d.toISOString();
  }, [periodo]);

  const { data: sims, isLoading } = useQuery({
    queryKey: ['difal-dashboard', periodo, ufFiltro],
    queryFn: async () => {
      let q = supabase
        .from('difal_simulations')
        .select('id, numero, data_operacao, uf_origem, uf_destino, valor_total_cents, status, created_at, difal_calculation_results(difal_cents, fcp_cents, total_estimado_cents)')
        .gte('created_at', desde)
        .order('created_at', { ascending: false });
      if (ufFiltro !== 'todas') q = q.eq('uf_destino', ufFiltro);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as SimRow[];
    },
  });

  const { data: alertas } = useQuery({
    queryKey: ['difal-dashboard-alertas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('difal_legislative_alerts')
        .select('id, uf, titulo, severidade, created_at')
        .eq('publicado', true)
        .order('created_at', { ascending: false })
        .limit(4);
      if (error) throw error;
      return data ?? [];
    },
  });

  const totals = useMemo(() => {
    const rows = sims ?? [];
    let difal = 0;
    let fcp = 0;
    rows.forEach((s) => s.difal_calculation_results?.forEach((r) => { difal += r.difal_cents ?? 0; fcp += r.fcp_cents ?? 0; }));
    return { count: rows.length, difal, fcp };
  }, [sims]);

  const topDestinos = useMemo(() => {
    const map = new Map<string, number>();
    (sims ?? []).forEach((s) => map.set(s.uf_destino, (map.get(s.uf_destino) ?? 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [sims]);

  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    (sims ?? []).forEach((s) => {
      const mes = s.data_operacao.slice(0, 7);
      const total = (s.difal_calculation_results ?? []).reduce((a, r) => a + (r.total_estimado_cents ?? 0), 0);
      map.set(mes, (map.get(mes) ?? 0) + total);
    });
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([mes, cents]) => ({ mes, valor: cents / 100 }));
  }, [sims]);

  return (
    <div className="space-y-8">
      {/* Banner de Boas-vindas / Hero no Painel */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-xl border border-border/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="h-3.5 w-3.5" />
              Módulo DIFAL Marketplace
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Gestão e Simulação do Diferencial de Alíquotas
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Consulte regras dos 26 estados e DF, calcule DIFAL com memória de cálculo transparente e gere laudos auditáveis.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20">
              <Link to="/difal/nova-simulacao"><PlusCircle className="h-4 w-4 mr-2" /> Nova Simulação</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-xl">
              <Link to="/difal-info">Apresentação do Módulo</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Atalhos Rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <QuickLinkCard 
          to="/difal/nova-simulacao"
          icon={Calculator}
          title="Nova Simulação"
          desc="Calcular NFe ou pedido"
        />
        <QuickLinkCard 
          to="/difal/comparar"
          icon={GitCompare}
          title="Comparar Estados"
          desc="Cenários interestaduais"
        />
        <QuickLinkCard 
          to="/difal/regras"
          icon={Scale}
          title="Regras por Estado"
          desc="Alíquotas e Decretos"
        />
        <QuickLinkCard 
          to="/difal/relatorios"
          icon={FileText}
          title="Relatórios & PDF"
          desc="Exportações auditáveis"
        />
      </div>

      {/* Barra de Filtros e Cabeçalho do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Indicadores do Período</h2>
          <p className="text-xs text-muted-foreground">Volume de simulações e projeções de tributos apurados.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {periodos.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={ufFiltro} onValueChange={setUfFiltro}>
            <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="UF destino" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todos os destinos</SelectItem>
              {UFS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <KpiCard icon={Calculator} label="Simulações no período" value={String(totals.count)} />
            <KpiCard icon={TrendingUp} label="DIFAL estimado" value={brl(totals.difal)} />
            <KpiCard icon={TrendingUp} label="FCP estimado" value={brl(totals.fcp)} />
            <KpiCard icon={MapPin} label="Destino mais usado" value={topDestinos[0]?.[0] ?? '—'} />
          </>
        )}
      </div>

      {/* Gráfico e Destinos */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">DIFAL + FCP Estimado por Mês</CardTitle>
            <CardDescription className="text-xs">Valores calculados em operações interestaduais.</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px]">
            {chartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Calculator className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma simulação calculada no período.</p>
                <Button asChild size="sm" variant="link" className="mt-1">
                  <Link to="/difal/nova-simulacao">Fazer primeira simulação <ArrowRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="mes" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v: number) => brl(Math.round(v * 100))} />
                  <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estados de Destino Mais Usados</CardTitle>
            <CardDescription className="text-xs">Distribuição por UF de entrega.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topDestinos.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">Sem dados registrados ainda.</p>
            )}
            {topDestinos.map(([uf, qtd]) => (
              <div key={uf} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/30">
                <span className="font-semibold text-foreground">{uf}</span>
                <Badge variant="secondary">{qtd} simulação(ões)</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Histórico Recente e Alertas */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Últimas Simulações
              </CardTitle>
              <CardDescription className="text-xs">Operações salvas recentemente.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link to="/difal/historico">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {(sims ?? []).slice(0, 5).map((s) => (
              <Link
                key={s.id}
                to={`/difal/historico?sim=${s.id}`}
                className="flex items-center justify-between text-sm rounded-lg px-3 py-2.5 hover:bg-muted/60 border border-transparent hover:border-border transition-all"
              >
                <div>
                  <p className="font-medium text-xs sm:text-sm">#{s.numero} · {s.uf_origem} → {s.uf_destino}</p>
                  <p className="text-[11px] text-muted-foreground">{dateBR(s.data_operacao)}</p>
                </div>
                <span className="font-semibold tabular-nums text-foreground">{brl(s.valor_total_cents)}</span>
              </Link>
            ))}
            {(sims ?? []).length === 0 && !isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Nenhuma simulação registrada ainda.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-500" />
                Radar Legislativo Recente
              </CardTitle>
              <CardDescription className="text-xs">Atualizações e decretos de ICMS / DIFAL.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link to="/difal/alertas">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {(alertas ?? []).length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Nenhum alerta legislativo publicado no momento.
              </div>
            )}
            {(alertas ?? []).map((a) => (
              <div key={a.id} className="text-sm p-3 rounded-lg bg-muted/30 flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-xs sm:text-sm">{a.uf ? `${a.uf} · ` : ''}{a.titulo}</p>
                  <p className="text-[11px] text-muted-foreground">{dateBR(a.created_at)}</p>
                </div>
                <Badge variant={a.severidade === 'alta' ? 'destructive' : 'secondary'} className="text-[10px]">
                  {a.severidade}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card className="hover:border-primary/30 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
          <Icon className="h-4 w-4 text-primary" /> {label}
        </div>
        <p className="text-2xl font-bold tracking-tight mt-2 text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function QuickLinkCard({ to, icon: Icon, title, desc }: { to: string; icon: React.ElementType; title: string; desc: string }) {
  return (
    <Link 
      to={to} 
      className="p-4 rounded-xl border border-border bg-card hover:bg-muted/40 hover:border-primary/40 transition-all flex flex-col justify-between group shadow-sm"
    >
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-105 transition-transform">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </Link>
  );
}
