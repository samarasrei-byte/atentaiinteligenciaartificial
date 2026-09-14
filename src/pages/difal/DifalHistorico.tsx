import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Eye, Copy, Archive, FileDown, Search, PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { brl, dateBR } from '@/lib/difal/format';
import { exportSimulationPdf } from '@/lib/difal/pdf';
import type { CalculationResult, SimulationInput } from '@/lib/difal/types';
import { DifalResultado } from '@/components/difal/DifalResultado';

interface Row {
  id: string;
  numero: number;
  created_at: string;
  created_by_email: string | null;
  data_operacao: string;
  uf_origem: string;
  uf_destino: string;
  valor_total_cents: number;
  status: string;
  company_id: string | null;
  difal_calculation_results: Array<Record<string, unknown>>;
}

export default function DifalHistorico() {
  const qc = useQueryClient();
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState('todos');
  const [arquivar, setArquivar] = useState<Row | null>(null);
  const [detalhe, setDetalhe] = useState<{ row: Row; result: CalculationResult } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['difal-historico'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('difal_simulations')
        .select('id, numero, created_at, created_by_email, data_operacao, uf_origem, uf_destino, valor_total_cents, status, company_id, difal_calculation_results(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return (data ?? []).filter((r) => {
      if (status !== 'todos' && r.status !== status) return false;
      if (!termo) return true;
      return [String(r.numero), r.uf_origem, r.uf_destino, r.created_by_email ?? '']
        .join(' ')
        .toLowerCase()
        .includes(termo);
    });
  }, [data, busca, status]);

  const abrirDetalhe = (row: Row) => {
    const res = row.difal_calculation_results?.[0];
    if (!res) {
      toast({ title: 'Sem resultado', description: 'Esta simulação ainda é um rascunho.' });
      return;
    }
    setDetalhe({ row, result: res as unknown as CalculationResult });
  };

  const duplicar = async (row: Row) => {
    const { data: original, error } = await supabase
      .from('difal_simulations')
      .select('*, difal_simulation_items(*)')
      .eq('id', row.id)
      .maybeSingle();
    if (error || !original) {
      toast({ title: 'Erro ao duplicar', variant: 'destructive' });
      return;
    }
    const { id, numero, created_at, updated_at, created_by, difal_simulation_items, ...rest } = original as never as Record<string, unknown> & { difal_simulation_items: Array<Record<string, unknown>> };
    const { data: nova, error: insErr } = await supabase
      .from('difal_simulations')
      .insert({ ...(rest as never), status: 'rascunho' })
      .select('id')
      .single();
    if (insErr || !nova) {
      toast({ title: 'Erro ao duplicar', variant: 'destructive' });
      return;
    }
    if (difal_simulation_items?.length) {
      await supabase.from('difal_simulation_items').insert(
        difal_simulation_items.map((i) => {
          const { id: _i, simulation_id: _s, created_at: _c, updated_at: _u, ...item } = i;
          return { ...(item as never), simulation_id: nova.id };
        }),
      );
    }
    toast({ title: 'Simulação duplicada', description: 'Criada como rascunho.' });
    qc.invalidateQueries({ queryKey: ['difal-historico'] });
  };

  const confirmarArquivar = async () => {
    if (!arquivar) return;
    const { error } = await supabase.from('difal_simulations').update({ status: 'arquivada' }).eq('id', arquivar.id);
    setArquivar(null);
    if (error) {
      toast({ title: 'Não foi possível arquivar', variant: 'destructive' });
      return;
    }
    toast({ title: 'Simulação arquivada' });
    qc.invalidateQueries({ queryKey: ['difal-historico'] });
  };

  const exportar = async (row: Row) => {
    const res = row.difal_calculation_results?.[0] as unknown as CalculationResult | undefined;
    const { data: itens } = await supabase.from('difal_simulation_items').select('*').eq('simulation_id', row.id);
    const { data: sim } = await supabase.from('difal_simulations').select('*').eq('id', row.id).maybeSingle();
    if (!res || !sim) {
      toast({ title: 'Sem resultado para exportar', variant: 'destructive' });
      return;
    }
    const input = { ...(sim as unknown as SimulationInput), itens: (itens ?? []) as never };
    exportSimulationPdf({ input, result: res, usuario: row.created_by_email, numero: row.numero });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Histórico de simulações</h1>
          <p className="text-sm text-muted-foreground">Consulte, duplique, exporte ou arquive simulações.</p>
        </div>
        <Button asChild><Link to="/difal/nova-simulacao"><PlusCircle className="h-4 w-4 mr-2" /> Nova simulação</Link></Button>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="text-base">Simulações registradas</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar por número, UF ou usuário" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="calculada">Calculada</SelectItem>
                <SelectItem value="revisao">Revisão necessária</SelectItem>
                <SelectItem value="arquivada">Arquivada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : filtradas.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nenhuma simulação encontrada. Crie a primeira em “Nova simulação”.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Rota</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>DIFAL + FCP</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtradas.map((r) => {
                  const res = r.difal_calculation_results?.[0] as unknown as CalculationResult | undefined;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.numero}</TableCell>
                      <TableCell>{dateBR(r.data_operacao)}</TableCell>
                      <TableCell className="max-w-[160px] truncate">{r.created_by_email ?? '—'}</TableCell>
                      <TableCell>{r.uf_origem} → {r.uf_destino}</TableCell>
                      <TableCell className="tabular-nums">{brl(r.valor_total_cents)}</TableCell>
                      <TableCell className="tabular-nums">{res ? brl(res.total_estimado_cents) : '—'}</TableCell>
                      <TableCell><Badge variant={r.status === 'calculada' ? 'default' : 'secondary'}>{r.status}</Badge></TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button variant="ghost" size="icon" onClick={() => abrirDetalhe(r)} aria-label="Visualizar"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => duplicar(r)} aria-label="Duplicar"><Copy className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => exportar(r)} aria-label="Exportar"><FileDown className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setArquivar(r)} aria-label="Arquivar"><Archive className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!arquivar} onOpenChange={(o) => !o && setArquivar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar simulação #{arquivar?.numero}?</AlertDialogTitle>
            <AlertDialogDescription>
              A simulação deixa de aparecer nos filtros padrão, mas o histórico é preservado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarArquivar}>Arquivar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!detalhe} onOpenChange={(o) => !o && setDetalhe(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Simulação #{detalhe?.row.numero}</DialogTitle></DialogHeader>
          {detalhe && <DifalResultado result={detalhe.result} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
