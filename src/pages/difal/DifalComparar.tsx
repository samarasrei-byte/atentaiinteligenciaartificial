import { useState } from 'react';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { GitCompare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { calcularDifal } from '@/lib/difal/engine';
import { fetchRules } from '@/lib/difal/api';
import { brl, parseCents, perc } from '@/lib/difal/format';
import { UFS, type CalculationResult, type SimulationInput } from '@/lib/difal/types';

interface LinhaComparacao {
  uf: string;
  result: CalculationResult;
}

export default function DifalComparar() {
  const [ufOrigem, setUfOrigem] = useState('SP');
  const [destinos, setDestinos] = useState<string[]>(['RJ', 'MG', 'BA']);
  const [valorCents, setValorCents] = useState(100000);
  const [valorText, setValorText] = useState('1.000,00');
  const [contribuinte, setContribuinte] = useState(false);
  const [linhas, setLinhas] = useState<LinhaComparacao[]>([]);
  const [carregando, setCarregando] = useState(false);

  const toggleDestino = (uf: string) =>
    setDestinos((d) => (d.includes(uf) ? d.filter((x) => x !== uf) : [...d, uf]));

  const comparar = async () => {
    if (!ufOrigem || destinos.length === 0 || valorCents <= 0) {
      toast({ title: 'Revise os dados', description: 'Informe origem, destinos e valor da operação.', variant: 'destructive' });
      return;
    }
    setCarregando(true);
    try {
      const resultados: LinhaComparacao[] = [];
      for (const uf of destinos.filter((u) => u !== ufOrigem)) {
        const rules = await fetchRules(uf);
        const input: SimulationInput = {
          data_operacao: new Date().toISOString().slice(0, 10),
          uf_origem: ufOrigem,
          uf_destino: uf,
          tipo_operacao: 'venda',
          finalidade: 'consumo',
          destinatario_contribuinte: contribuinte,
          valor_produtos_cents: valorCents,
          frete_cents: 0,
          seguro_cents: 0,
          outras_despesas_cents: 0,
          descontos_cents: 0,
          itens: [
            {
              descricao: 'Operação comparativa',
              quantidade: 1,
              valor_unitario_cents: valorCents,
              desconto_cents: 0,
              substituicao_tributaria: false,
              sujeito_fcp: true,
            },
          ],
        };
        resultados.push({ uf, result: calcularDifal(input, rules) });
      }
      setLinhas(resultados);
    } catch {
      toast({ title: 'Erro ao comparar', description: 'Não foi possível carregar as regras.', variant: 'destructive' });
    } finally {
      setCarregando(false);
    }
  };

  const menor = linhas
    .filter((l) => !l.result.needs_review)
    .reduce<number | null>((min, l) => (min === null || l.result.total_estimado_cents < min ? l.result.total_estimado_cents : min), null);

  const chartData = linhas
    .filter((l) => !l.result.needs_review)
    .map((l) => ({ uf: l.uf, total: l.result.total_estimado_cents / 100 }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Comparar estados</h1>
        <p className="text-sm text-muted-foreground">A mesma operação simulada em diferentes UFs de destino.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Parâmetros da comparação</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label className="text-xs text-muted-foreground">UF de origem</Label>
              <Select value={ufOrigem} onValueChange={setUfOrigem}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{UFS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Valor da operação</Label>
              <Input
                className="mt-1.5"
                inputMode="decimal"
                value={valorText}
                onChange={(e) => { setValorText(e.target.value); setValorCents(parseCents(e.target.value)); }}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm pb-2">
                <Switch checked={contribuinte} onCheckedChange={setContribuinte} />
                Destinatário contribuinte
              </label>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">UFs de destino</Label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {UFS.map((uf) => (
                <button
                  key={uf}
                  onClick={() => toggleDestino(uf)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                    destinos.includes(uf)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {uf}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={comparar} disabled={carregando}>
            <GitCompare className="h-4 w-4 mr-2" /> {carregando ? 'Comparando...' : 'Comparar'}
          </Button>
        </CardContent>
      </Card>

      {linhas.length > 0 && (
        <>
          <Card>
            <CardHeader><CardTitle className="text-base">Comparativo</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>UF destino</TableHead>
                    <TableHead>Alíq. interna</TableHead>
                    <TableHead>Alíq. interestadual</TableHead>
                    <TableHead>DIFAL</TableHead>
                    <TableHead>FCP</TableHead>
                    <TableHead>Total estimado</TableHead>
                    <TableHead>Diferença</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linhas.map((l) => (
                    <TableRow key={l.uf}>
                      <TableCell className="font-medium">{l.uf}</TableCell>
                      {l.result.needs_review ? (
                        <TableCell colSpan={6} className="text-sm text-muted-foreground">
                          {l.result.review_reason}
                        </TableCell>
                      ) : (
                        <>
                          <TableCell>{perc(l.result.aliquota_interna)}</TableCell>
                          <TableCell>{perc(l.result.aliquota_interestadual)}</TableCell>
                          <TableCell>{brl(l.result.difal_cents)}</TableCell>
                          <TableCell>{brl(l.result.fcp_cents)}</TableCell>
                          <TableCell className="font-semibold">{brl(l.result.total_estimado_cents)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {menor === null ? '—' : `+ ${brl(l.result.total_estimado_cents - menor)}`}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {chartData.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Total estimado por destino</CardTitle></CardHeader>
              <CardContent className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                    <XAxis dataKey="uf" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(v: number) => brl(Math.round(v * 100))} />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
