import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2, Calculator, Save, Eraser, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { calcularDifal } from '@/lib/difal/engine';
import { fetchRules, saveSimulation } from '@/lib/difal/api';
import { brl, isValidNCM, parseCents } from '@/lib/difal/format';
import { exportSimulationPdf } from '@/lib/difal/pdf';
import { UFS, type CalculationResult, type SimulationInput, type SimulationItemInput } from '@/lib/difal/types';
import { DifalResultado } from '@/components/difal/DifalResultado';

const novoItem = (): SimulationItemInput => ({
  descricao: '',
  codigo_interno: '',
  ncm: '',
  cest: '',
  cfop: '',
  quantidade: 1,
  valor_unitario_cents: 0,
  desconto_cents: 0,
  substituicao_tributaria: false,
  sujeito_fcp: false,
  fcp_percentual: null,
});

const inicial = (): SimulationInput => ({
  data_operacao: new Date().toISOString().slice(0, 10),
  uf_origem: '',
  uf_destino: '',
  tipo_operacao: 'venda',
  finalidade: 'consumo',
  destinatario_contribuinte: false,
  regime_vendedor: 'simples_nacional',
  regime_comprador: 'nao_contribuinte',
  canal_venda: '',
  responsavel_recolhimento: null,
  valor_produtos_cents: 0,
  frete_cents: 0,
  seguro_cents: 0,
  outras_despesas_cents: 0,
  descontos_cents: 0,
  comissao_tipo: null,
  comissao_valor: null,
  itens: [novoItem()],
});

const etapas = ['Operação', 'Valores', 'Produtos', 'Revisão'];

export default function DifalNovaSimulacao() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [etapa, setEtapa] = useState(0);
  const [form, setForm] = useState<SimulationInput>(inicial);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [salvando, setSalvando] = useState(false);

  const { data: empresas } = useQuery({
    queryKey: ['difal-empresas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('difal_companies')
        .select('id, razao_social, cnpj, uf')
        .is('deleted_at', null);
      if (error) throw error;
      return data ?? [];
    },
  });
  const [companyId, setCompanyId] = useState<string>('');

  const set = <K extends keyof SimulationInput>(key: K, value: SimulationInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setItem = (idx: number, patch: Partial<SimulationItemInput>) =>
    setForm((f) => ({ ...f, itens: f.itens.map((it, i) => (i === idx ? { ...it, ...patch } : it)) }));

  const totalItens = form.itens.reduce(
    (acc, i) => acc + i.quantidade * i.valor_unitario_cents - i.desconto_cents,
    0,
  );

  const validarEtapa = (): string | null => {
    if (etapa === 0) {
      if (!form.data_operacao) return 'Informe a data da operação.';
      if (!form.uf_origem) return 'Selecione a UF de origem.';
      if (!form.uf_destino) return 'Selecione a UF de destino.';
      if (form.uf_origem === form.uf_destino) return 'Origem e destino não podem ser a mesma UF.';
    }
    if (etapa === 1 && form.valor_produtos_cents <= 0) return 'Informe o valor dos produtos.';
    if (etapa === 2) {
      if (form.itens.length === 0) return 'Adicione ao menos um produto.';
      const invalido = form.itens.find((i) => !i.descricao.trim() || i.quantidade <= 0 || i.valor_unitario_cents <= 0);
      if (invalido) return 'Preencha descrição, quantidade e valor unitário de todos os itens.';
      const ncmInvalido = form.itens.find((i) => i.ncm && !isValidNCM(i.ncm));
      if (ncmInvalido) return 'NCM inválido: informe 8 dígitos.';
    }
    return null;
  };

  const avancar = () => {
    const erro = validarEtapa();
    if (erro) {
      toast({ title: 'Revise os dados', description: erro, variant: 'destructive' });
      return;
    }
    setEtapa((e) => Math.min(e + 1, etapas.length - 1));
  };

  const calcular = async () => {
    const erro = validarEtapa();
    if (erro) {
      toast({ title: 'Revise os dados', description: erro, variant: 'destructive' });
      return;
    }
    try {
      const rules = await fetchRules(form.uf_destino);
      const r = calcularDifal(form, rules);
      setResult(r);
      if (r.needs_review) {
        toast({ title: 'Revisão necessária', description: r.review_reason, variant: 'destructive' });
      } else {
        toast({ title: 'Cálculo concluído', description: 'Confira o resultado e a memória de cálculo.' });
      }
    } catch {
      toast({ title: 'Erro ao buscar regras', description: 'Tente novamente em instantes.', variant: 'destructive' });
    }
  };

  const salvar = async (status: 'rascunho' | 'calculada' | 'revisao') => {
    setSalvando(true);
    try {
      await saveSimulation({
        input: form,
        result: status === 'rascunho' ? null : result,
        companyId: companyId || null,
        status,
        userEmail: user?.email ?? null,
      });
      toast({ title: 'Simulação salva', description: 'Disponível no histórico do módulo.' });
      navigate('/difal/historico');
    } catch {
      toast({ title: 'Não foi possível salvar', description: 'Verifique sua conexão e tente novamente.', variant: 'destructive' });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nova simulação</h1>
        <p className="text-sm text-muted-foreground">
          Preencha as quatro etapas. As alíquotas vêm das regras cadastradas no sistema.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {etapas.map((label, i) => (
          <button
            key={label}
            onClick={() => setEtapa(i)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              i === etapa ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      {etapa === 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Dados da operação</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Data da operação">
              <Input type="date" value={form.data_operacao} onChange={(e) => set('data_operacao', e.target.value)} />
            </Field>
            <Field label="Empresa (opcional)">
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger><SelectValue placeholder="Selecione uma empresa" /></SelectTrigger>
                <SelectContent>
                  {(empresas ?? []).map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.razao_social}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="UF de origem">
              <Select value={form.uf_origem} onValueChange={(v) => set('uf_origem', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{UFS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="UF de destino">
              <Select value={form.uf_destino} onValueChange={(v) => set('uf_destino', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{UFS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Tipo de operação">
              <Select value={form.tipo_operacao} onValueChange={(v) => set('tipo_operacao', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="venda">Venda</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="devolucao">Devolução</SelectItem>
                  <SelectItem value="remessa">Remessa</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Finalidade">
              <Select value={form.finalidade} onValueChange={(v) => set('finalidade', v as SimulationInput['finalidade'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="consumo">Consumidor final</SelectItem>
                  <SelectItem value="revenda">Revenda</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Regime do vendedor">
              <Select value={String(form.regime_vendedor)} onValueChange={(v) => set('regime_vendedor', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mei">MEI</SelectItem>
                  <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                  <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                  <SelectItem value="lucro_real">Lucro Real</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Regime do comprador">
              <Select value={String(form.regime_comprador)} onValueChange={(v) => set('regime_comprador', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao_contribuinte">Não contribuinte</SelectItem>
                  <SelectItem value="mei">MEI</SelectItem>
                  <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                  <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                  <SelectItem value="lucro_real">Lucro Real</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Marketplace ou canal de venda">
              <Input
                placeholder="Ex.: loja própria, marketplace X"
                value={form.canal_venda ?? ''}
                onChange={(e) => set('canal_venda', e.target.value)}
              />
            </Field>
            <Field label="Responsável pelo recolhimento">
              <Select
                value={form.responsavel_recolhimento ?? 'regra'}
                onValueChange={(v) => set('responsavel_recolhimento', v === 'regra' ? null : (v as never))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="regra">Conforme a regra cadastrada</SelectItem>
                  <SelectItem value="remetente">Remetente</SelectItem>
                  <SelectItem value="destinatario">Destinatário</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="flex items-center justify-between rounded-lg border border-border p-3 sm:col-span-2">
              <div>
                <p className="text-sm font-medium">Destinatário é contribuinte de ICMS</p>
                <p className="text-xs text-muted-foreground">Altera o tratamento aplicado pela regra.</p>
              </div>
              <Switch
                checked={form.destinatario_contribuinte}
                onCheckedChange={(v) => set('destinatario_contribuinte', v)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {etapa === 1 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Valores da operação</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <MoneyField label="Valor dos produtos" value={form.valor_produtos_cents} onChange={(c) => set('valor_produtos_cents', c)} />
            <MoneyField label="Frete" value={form.frete_cents} onChange={(c) => set('frete_cents', c)} />
            <MoneyField label="Seguro" value={form.seguro_cents} onChange={(c) => set('seguro_cents', c)} />
            <MoneyField label="Outras despesas" value={form.outras_despesas_cents} onChange={(c) => set('outras_despesas_cents', c)} />
            <MoneyField label="Descontos" value={form.descontos_cents} onChange={(c) => set('descontos_cents', c)} />
            <Field label="Comissão do marketplace">
              <div className="flex gap-2">
                <Select
                  value={form.comissao_tipo ?? 'nenhuma'}
                  onValueChange={(v) => set('comissao_tipo', v === 'nenhuma' ? null : (v as 'percentual' | 'fixo'))}
                >
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhuma">Sem comissão</SelectItem>
                    <SelectItem value="percentual">Percentual</SelectItem>
                    <SelectItem value="fixo">Valor fixo</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  step="0.01"
                  disabled={!form.comissao_tipo}
                  value={form.comissao_valor ?? ''}
                  onChange={(e) => set('comissao_valor', e.target.value === '' ? null : Number(e.target.value))}
                />
              </div>
            </Field>
            <div className="sm:col-span-2 rounded-lg border border-border p-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total da operação</span>
              <span className="text-lg font-semibold tabular-nums">
                {brl(form.valor_produtos_cents + form.frete_cents + form.seguro_cents + form.outras_despesas_cents - form.descontos_cents)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {etapa === 2 && (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Produtos da operação</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setForm((f) => ({ ...f, itens: [...f.itens, novoItem()] }))}>
              <Plus className="h-4 w-4 mr-2" /> Adicionar item
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {form.itens.map((item, idx) => (
              <div key={idx} className="rounded-lg border border-border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Item {idx + 1}</Badge>
                  {form.itens.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setForm((f) => ({ ...f, itens: f.itens.filter((_, i) => i !== idx) }))}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Descrição" className="sm:col-span-2">
                    <Input value={item.descricao} onChange={(e) => setItem(idx, { descricao: e.target.value })} />
                  </Field>
                  <Field label="Código interno">
                    <Input value={item.codigo_interno ?? ''} onChange={(e) => setItem(idx, { codigo_interno: e.target.value })} />
                  </Field>
                  <Field label="NCM (8 dígitos)">
                    <Input
                      value={item.ncm ?? ''}
                      onChange={(e) => setItem(idx, { ncm: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                      placeholder="00000000"
                    />
                    {item.ncm && !isValidNCM(item.ncm) && (
                      <p className="text-xs text-destructive mt-1">NCM deve ter 8 dígitos.</p>
                    )}
                  </Field>
                  <Field label="CEST">
                    <Input value={item.cest ?? ''} onChange={(e) => setItem(idx, { cest: e.target.value })} />
                  </Field>
                  <Field label="CFOP">
                    <Input value={item.cfop ?? ''} onChange={(e) => setItem(idx, { cfop: e.target.value })} />
                  </Field>
                  <Field label="Quantidade">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantidade}
                      onChange={(e) => setItem(idx, { quantidade: Number(e.target.value) })}
                    />
                  </Field>
                  <MoneyField label="Valor unitário" value={item.valor_unitario_cents} onChange={(c) => setItem(idx, { valor_unitario_cents: c })} />
                  <MoneyField label="Desconto do item" value={item.desconto_cents} onChange={(c) => setItem(idx, { desconto_cents: c })} />
                  <Field label="FCP do item (%)">
                    <Input
                      type="number"
                      step="0.01"
                      disabled={!item.sujeito_fcp}
                      placeholder="Usar percentual da regra"
                      value={item.fcp_percentual ?? ''}
                      onChange={(e) => setItem(idx, { fcp_percentual: e.target.value === '' ? null : Number(e.target.value) })}
                    />
                  </Field>
                </div>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={item.substituicao_tributaria} onCheckedChange={(v) => setItem(idx, { substituicao_tributaria: v })} />
                    Sujeito a ST
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={item.sujeito_fcp} onCheckedChange={(v) => setItem(idx, { sujeito_fcp: v })} />
                    Sujeito a FCP
                  </label>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Soma dos itens</span>
              <span className="font-semibold tabular-nums">{brl(totalItens)}</span>
            </div>
            {totalItens !== form.valor_produtos_cents && (
              <p className="text-xs text-muted-foreground">
                A soma dos itens difere do valor de produtos informado na etapa 2. A base usa os valores da etapa 2.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {etapa === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Revisão da simulação</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Linha label="Operação" value={`${form.uf_origem || '—'} → ${form.uf_destino || '—'} · ${form.tipo_operacao}`} />
              <Linha label="Data" value={form.data_operacao} />
              <Linha label="Finalidade" value={form.finalidade === 'consumo' ? 'Consumidor final' : 'Revenda'} />
              <Linha label="Destinatário" value={form.destinatario_contribuinte ? 'Contribuinte' : 'Não contribuinte'} />
              <Linha label="Canal" value={form.canal_venda || '—'} />
              <Separator />
              <Linha label="Produtos" value={brl(form.valor_produtos_cents)} />
              <Linha label="Frete / seguro / outras" value={`${brl(form.frete_cents)} / ${brl(form.seguro_cents)} / ${brl(form.outras_despesas_cents)}`} />
              <Linha label="Descontos" value={brl(form.descontos_cents)} />
              <Linha label="Itens" value={`${form.itens.length} produto(s)`} />
              <div className="flex flex-wrap gap-2 pt-2">
                <Button onClick={calcular}><Calculator className="h-4 w-4 mr-2" /> Calcular DIFAL</Button>
                <Button variant="outline" disabled={salvando} onClick={() => salvar('rascunho')}>
                  <Save className="h-4 w-4 mr-2" /> Salvar como rascunho
                </Button>
                {result && !result.needs_review && (
                  <Button variant="outline" disabled={salvando} onClick={() => salvar('calculada')}>
                    <Save className="h-4 w-4 mr-2" /> Salvar simulação calculada
                  </Button>
                )}
                <Button variant="ghost" onClick={() => { setForm(inicial()); setResult(null); setEtapa(0); }}>
                  <Eraser className="h-4 w-4 mr-2" /> Limpar formulário
                </Button>
                <Button variant="ghost" onClick={() => navigate('/difal')}>Cancelar</Button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <DifalResultado
              result={result}
              onExportPdf={() =>
                exportSimulationPdf({
                  input: form,
                  result,
                  empresa: (empresas ?? []).find((e) => e.id === companyId) ?? null,
                  usuario: user?.email ?? null,
                })
              }
            />
          )}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" disabled={etapa === 0} onClick={() => setEtapa((e) => e - 1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        {etapa < etapas.length - 1 && (
          <Button onClick={avancar}>
            Avançar <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function MoneyField({ label, value, onChange }: { label: string; value: number; onChange: (cents: number) => void }) {
  const [text, setText] = useState(value ? (value / 100).toFixed(2).replace('.', ',') : '');
  return (
    <Field label={label}>
      <Input
        inputMode="decimal"
        placeholder="0,00"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(parseCents(e.target.value));
        }}
      />
    </Field>
  );
}

function Linha({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border/60 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
