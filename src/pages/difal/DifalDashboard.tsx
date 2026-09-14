import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, Calculator, TrendingUp, MapPin, Bell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard DIFAL</h1>
          <p className="text-sm text-muted-foreground">Visão consolidada das simulações do período.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {periodos.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={ufFiltro} onValueChange={setUfFiltro}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="UF destino" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todos os destinos</SelectItem>
              {UFS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button asChild>
            <Link to="/difal/nova-simulacao"><PlusCircle className="h-4 w-4 mr-2" /> Nova simulação</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)
        ) : (
          <>
            <KpiCard icon={Calculator} label="Simulações no período" value={String(totals.count)} />
            <KpiCard icon={TrendingUp} label="DIFAL estimado" value={brl(totals.difal)} />
            <KpiCard icon={TrendingUp} label="FCP estimado" value={brl(totals.fcp)} />
            <KpiCard icon={MapPin} label="Destino mais usado" value={topDestinos[0]?.[0] ?? '—'} />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">DIFAL + FCP estimado por mês</CardTitle></CardHeader>
          <CardContent className="h-[260px]">
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma simulação calculada no período.</p>
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
          <CardHeader><CardTitle className="text-base">Estados de destino mais usados</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {topDestinos.length === 0 && <p className="text-sm text-muted-foreground">Sem dados ainda.</p>}
            {topDestinos.map(([uf, qtd]) => (
              <div key={uf} className="flex items-center justify-between text-sm">
                <span className="font-medium">{uf}</span>
                <Badge variant="secondary">{qtd} simulação(ões)</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Últimas simulações</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(sims ?? []).slice(0, 6).map((s) => (
              <Link
                key={s.id}
                to={`/difal/historico?sim=${s.id}`}
                className="flex items-center justify-between text-sm rounded-md px-2 py-2 hover:bg-muted"
              >
                <span>#{s.numero} · {s.uf_origem} → {s.uf_destino} · {dateBR(s.data_operacao)}</span>
                <span className="font-medium tabular-nums">{brl(s.valor_total_cents)}</span>
              </Link>
            ))}
            {(sims ?? []).length === 0 && !isLoading && (
              <p className="text-sm text-muted-foreground">Nenhuma simulação registrada ainda.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" /> Alertas recentes</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(alertas ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum alerta legislativo publicado.</p>
            )}
            {(alertas ?? []).map((a) => (
              <div key={a.id} className="text-sm flex items-start justify-between gap-3">
                <span>{a.uf ? `${a.uf} · ` : ''}{a.titulo}</span>
                <Badge variant={a.severidade === 'alta' ? 'destructive' : 'secondary'}>{a.severidade}</Badge>
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
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
          <Icon className="h-4 w-4" /> {label}
        </div>
        <p className="text-2xl font-semibold tracking-tight mt-2">{value}</p>
      </CardContent>
    </Card>
  );
}
