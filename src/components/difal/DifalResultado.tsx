import { AlertCircle, FileDown, BadgeCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DifalDisclaimer } from './DifalDisclaimer';
import { brl, dateBR, perc } from '@/lib/difal/format';
import type { CalculationResult } from '@/lib/difal/types';

const responsavelLabel: Record<string, string> = {
  remetente: 'Remetente (vendedor)',
  destinatario: 'Destinatário',
  marketplace: 'Marketplace / canal de venda',
  nao_aplicavel: 'Não aplicável',
};

interface DifalResultadoProps {
  result: CalculationResult;
  onExportPdf?: () => void;
}

export function DifalResultado({ result, onExportPdf }: DifalResultadoProps) {
  if (result.needs_review) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" /> Revisão necessária
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-foreground">{result.review_reason}</p>
          <p className="text-sm text-muted-foreground">
            Nenhum valor foi estimado. O sistema não gera alíquotas sem regra cadastrada — solicite a
            configuração administrativa da regra correspondente.
          </p>
          <DifalDisclaimer />
        </CardContent>
      </Card>
    );
  }

  const linhas: Array<[string, string]> = [
    ['Valor da operação', brl(result.valor_operacao_cents)],
    ['Base de cálculo', brl(result.base_calculo_cents)],
    ['Alíquota interestadual', perc(result.aliquota_interestadual)],
    ['Alíquota interna do destino', perc(result.aliquota_interna)],
    ['Percentual de DIFAL', perc(result.percentual_difal)],
    ['ICMS interestadual', brl(result.icms_interestadual_cents)],
    ['Percentual de FCP', perc(result.fcp_percentual)],
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Resultado estimado</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Regra vigente desde {dateBR(result.regra_vigencia_inicio)} ·{' '}
              {result.regra_fonte ?? 'fonte não informada'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={result.nivel_confianca === 'oficial' ? 'default' : 'secondary'}>
              {result.nivel_confianca === 'oficial' ? (
                <BadgeCheck className="h-3 w-3 mr-1" />
              ) : null}
              {result.nivel_confianca === 'demonstrativo'
                ? 'Dados demonstrativos'
                : result.nivel_confianca === 'revisado'
                  ? 'Regra revisada'
                  : 'Regra oficial'}
            </Badge>
            {onExportPdf && (
              <Button variant="outline" size="sm" onClick={onExportPdf}>
                <FileDown className="h-4 w-4 mr-2" /> PDF
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">DIFAL</p>
              <p className="text-2xl font-semibold tracking-tight">{brl(result.difal_cents)}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">FCP</p>
              <p className="text-2xl font-semibold tracking-tight">{brl(result.fcp_cents)}</p>
            </div>
            <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total estimado</p>
              <p className="text-2xl font-semibold tracking-tight text-primary">
                {brl(result.total_estimado_cents)}
              </p>
            </div>
          </div>

          <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {linhas.map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm border-b border-border/60 py-1.5">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium tabular-nums">{value}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm border-b border-border/60 py-1.5">
              <span className="text-muted-foreground">Responsável pelo recolhimento</span>
              <span className="font-medium">
                {responsavelLabel[result.responsavel_recolhimento ?? ''] ?? '—'}
              </span>
            </div>
          </div>

          {result.observacoes_fiscais.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Observações fiscais</p>
              <ul className="space-y-1.5">
                {result.observacoes_fiscais.map((o, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-primary">•</span>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Memória de cálculo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.memoria_calculo.map((passo, i) => (
            <div key={i} className="space-y-1">
              <p className="font-semibold text-sm">{passo.titulo}</p>
              <p className="text-sm text-muted-foreground">{passo.detalhe}</p>
              {passo.formula && (
                <p className="text-sm font-mono bg-muted rounded px-2 py-1 inline-block">
                  {passo.formula}
                </p>
              )}
              {passo.resultado && (
                <p className="text-sm font-semibold">= {passo.resultado}</p>
              )}
              {i < result.memoria_calculo.length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </CardContent>
      </Card>

      <DifalDisclaimer />
    </div>
  );
}
