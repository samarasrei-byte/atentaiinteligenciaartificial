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
import { FileText, Loader2 } from 'lucide-react';

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
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Período de consulta</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="de">Data inicial</Label>
            <Input id="de" type="date" value={de} onChange={(event) => setDe(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ate">Data final</Label>
            <Input id="ate" type="date" value={ate} onChange={(event) => setAte(event.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Simulações calculadas', valor: String(totais.qtd) },
          { label: 'Valor das operações', valor: brl(totais.somaOperacoes) },
          { label: 'DIFAL estimado', valor: brl(totais.somaDifal) },
          { label: 'FCP estimado', valor: brl(totais.somaFcp) },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-xl font-semibold tracking-tight">{item.valor}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Simulações encontradas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 flex justify-center" aria-label="Carregando simulações">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (data ?? []).length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nenhuma simulação calculada foi encontrada para o período selecionado.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Rota</TableHead>
                    <TableHead className="text-right">Operação</TableHead>
                    <TableHead className="text-right">DIFAL</TableHead>
                    <TableHead className="text-right">FCP</TableHead>
                    <TableHead className="text-right">Relatório</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data ?? []).map((row) => {
                    const resultado = row.difal_calculation_results?.[0] as
                      | { difal_cents?: number; fcp_cents?: number }
                      | undefined;
                    return (
                      <TableRow key={row.id}>
                        <TableCell>{row.numero}</TableCell>
                        <TableCell>{dateBR(row.data_operacao)}</TableCell>
                        <TableCell>{row.uf_origem} → {row.uf_destino}</TableCell>
                        <TableCell className="text-right">{brl(row.valor_total_cents)}</TableCell>
                        <TableCell className="text-right">{brl(resultado?.difal_cents ?? 0)}</TableCell>
                        <TableCell className="text-right">{brl(resultado?.fcp_cents ?? 0)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => gerarPdf(row)} disabled={gerando === row.id}>
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
