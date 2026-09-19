import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { brl, dateBR } from '@/lib/difal/format';
import { exportSimulationPdf } from '@/lib/difal/pdf';
import type { CalculationResult, SimulationInput } from '@/lib/difal/types';
import { FileText, Loader2, Search } from 'lucide-react';

interface Row {
  id: string;
  numero: number;
  uf_origem: string;
  uf_destino: string;
  data_operacao: string;
  valor_total_cents: number;
  created_by_email: string | null;
  difal_calculation_results: Array<Record<string, unknown>> | null;
}

export default function DifalRelatorios() {
  const { toast } = useToast();
  const hoje = new Date();
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const [de, setDe] = useState(primeiroDia.toISOString().slice(0, 10));
  const [ate, setAte] = useState(hoje.toISOString().slice(0, 10));
  const [gerando, setGerando] = useState<string | null>(null);
  const [buscaTabela, setBuscaTabela] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['difal-relatorios', de, ate],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from('difal_simulations')
        .select('id, numero, uf_origem, uf_destino, data_operacao, valor_total_cents, created_by_email, difal_calculation_results(*)')
        .eq('status', 'calculada')
        .gte('data_operacao', de)
        .lte('data_operacao', ate)
        .order('data_operacao', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const rotaPesquisada = useMemo(() => {
    return (data ?? []).filter((row) => 
      String(row.numero).includes(buscaTabela) ||
      row.uf_origem.toLowerCase().includes(buscaTabela.toLowerCase()) ||
      row.uf_destino.toLowerCase().includes(buscaTabela.toLowerCase())
    );
  }, [data, buscaTabela]);

  const totais = useMemo(() => {
    const rows = data ?? [];
    const somaDifal = rows.reduce((acumulado, simulacao) => {
      const resultado = simulacao.difal_calculation_results?.[0] as { difal_cents?: number } | undefined;
      return acumulado + (resultado?.difal_cents ?? 0);
    }, 0);
    const somaFcp = rows.reduce((acumulado, simulacao) => {
      const resultado = simulacao.difal_calculation_results?.[0] as { fcp_cents?: number } | undefined;
      return acumulado + (resultado?.fcp_cents ?? 0);
    }, 0);
    const somaOperacoes = rows.reduce((acumulado, simulacao) => acumulado + (simulacao.valor_total_cents ?? 0), 0);
    return { qtd: rows.length, somaDifal, somaFcp, somaOperacoes };
  }, [data]);

  const gerarPdf = async (row: Row) => {
    setGerando(row.id);
    try {
      const resultado = row.difal_calculation_results?.[0] as unknown as CalculationResult | undefined;
      const { data: simulacao, error: simulacaoError } = await supabase
        .from('difal_simulations')
        .select('*')
        .eq('id', row.id)
        .maybeSingle();
      const { data: itens, error: itensError } = await supabase
        .from('difal_simulation_items')
        .select('*')
        .eq('simulation_id', row.id);

      if (simulacaoError || itensError || !resultado || !simulacao) {
        toast({
          title: 'Não foi possível gerar o relatório',
          description: 'Confira se a simulação possui um resultado calculado e tente novamente.',
          variant: 'destructive',
        });
        return;
      }

      exportSimulationPdf({
        input: { ...(simulacao as unknown as SimulationInput), itens: (itens ?? []) as never },
        result: resultado,
        usuario: row.created_by_email,
        numero: row.numero,
      });
    } finally {
      setGerando(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Consulte as simulações calculadas no período e gere o relatório individual em PDF.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base">Filtros de Período</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="de">Data inicial</Label>
            <Input id="de" type="date" value={de} onChange={(event) => setDe(event.target.value)} className="w-full" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ate">Data final</Label>
            <Input id="ate" type="date" value={ate} onChange={(event) => setAte(event.target.value)} className="w-full" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Simulações calculadas', valor: String(totais.qtd) },
          { label: 'Valor das operações', valor: brl(totais.somaOperacoes) },
          { label: 'DIFAL estimado', valor: brl(totais.somaDifal) },
          { label: 'FCP estimado', valor: brl(totais.somaFcp) },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-6">
              <p className="text-sm uppercase tracking-wider font-medium text-muted-foreground mb-2">{item.label}</p>
              <p className="text-2xl font-semibold tracking-tight">{item.valor}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-base">Simulações encontradas</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por Nº, Origem ou Destino..."
              value={buscaTabela}
              onChange={(e) => setBuscaTabela(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 flex justify-center" aria-label="Carregando simulações">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : rotaPesquisada.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Nenhuma simulação encontrada para esta busca.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="pl-6 w-24">Nº</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Rota (Origem → Destino)</TableHead>
                    <TableHead className="text-right">Operação</TableHead>
                    <TableHead className="text-right">DIFAL</TableHead>
                    <TableHead className="text-right">FCP</TableHead>
                    <TableHead className="text-right pr-6 w-32">Relatório</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rotaPesquisada.map((row) => {
                    const resultado = row.difal_calculation_results?.[0] as
                      | { difal_cents?: number; fcp_cents?: number }
                      | undefined;
                    return (
                      <TableRow key={row.id}>
                        <TableCell className="pl-6 font-medium">#{row.numero}</TableCell>
                        <TableCell>{dateBR(row.data_operacao)}</TableCell>
                        <TableCell>
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/50 text-xs font-medium">
                            {row.uf_origem} <span className="text-muted-foreground">→</span> {row.uf_destino}
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{brl(row.valor_total_cents)}</TableCell>
                        <TableCell className="text-right tabular-nums text-red-600 dark:text-red-400">{brl(resultado?.difal_cents ?? 0)}</TableCell>
                        <TableCell className="text-right tabular-nums text-red-600 dark:text-red-400">{brl(resultado?.fcp_cents ?? 0)}</TableCell>
                        <TableCell className="text-right pr-6">
                          <Button variant="outline" size="sm" onClick={() => gerarPdf(row)} disabled={gerando === row.id} className="w-full">
                            {gerando === row.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><FileText className="h-4 w-4 mr-2" />PDF</>}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
