import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, ShieldAlert, History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { dateBR, perc } from '@/lib/difal/format';
import { UFS, type TaxRule } from '@/lib/difal/types';

type RuleForm = Partial<TaxRule> & { motivo?: string };

export default function DifalRegras() {
  const qc = useQueryClient();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  const [uf, setUf] = useState('todas');
  const [status, setStatus] = useState('todos');
  const [editando, setEditando] = useState<RuleForm | null>(null);
  const [logsDe, setLogsDe] = useState<string | null>(null);

  const { data: regras, isLoading } = useQuery({
    queryKey: ['difal-regras'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('difal_tax_rules')
        .select('*')
        .order('uf_destino', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as TaxRule[];
    },
  });

  const { data: logs } = useQuery({
    queryKey: ['difal-rule-logs', logsDe],
    enabled: !!logsDe,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('difal_rule_audit_logs')
        .select('*')
        .eq('rule_id', logsDe as string)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtradas = useMemo(
    () =>
      (regras ?? []).filter(
        (r) => (uf === 'todas' || r.uf_destino === uf) && (status === 'todos' || r.status === status),
      ),
    [regras, uf, status],
  );

  const salvar = async () => {
    if (!editando) return;
    const payload = {
      uf_origem: editando.uf_origem || null,
      uf_destino: editando.uf_destino,
      tipo_operacao: editando.tipo_operacao || 'venda',
      aliquota_interna: Number(editando.aliquota_interna),
      aliquota_interestadual: Number(editando.aliquota_interestadual),
      fcp_percentual: Number(editando.fcp_percentual ?? 0),
      base_calculo_metodo: editando.base_calculo_metodo ?? 'simples',
      responsavel_recolhimento: editando.responsavel_recolhimento ?? 'remetente',
      codigo_receita: editando.codigo_receita ?? null,
      vigencia_inicio: editando.vigencia_inicio,
      vigencia_fim: editando.vigencia_fim || null,
      fonte_oficial: editando.fonte_oficial ?? null,
      norma: editando.norma ?? null,
      observacoes: editando.motivo ?? editando.observacoes ?? null,
      nivel_confianca: editando.nivel_confianca ?? 'revisado',
      is_demo: editando.is_demo ?? false,
      status: editando.status ?? 'rascunho',
      ultima_revisao_em: new Date().toISOString(),
    };

    if (!payload.uf_destino || !payload.vigencia_inicio || Number.isNaN(payload.aliquota_interna)) {
      toast({ title: 'Campos obrigatórios', description: 'UF de destino, alíquotas e vigência são obrigatórios.', variant: 'destructive' });
      return;
    }

    const { error } = editando.id
      ? await supabase.from('difal_tax_rules').update(payload as never).eq('id', editando.id)
      : await supabase.from('difal_tax_rules').insert(payload as never);

    if (error) {
      toast({ title: 'Não foi possível salvar a regra', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Regra salva', description: 'A alteração foi registrada no log de auditoria.' });
    setEditando(null);
    qc.invalidateQueries({ queryKey: ['difal-regras'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Regras por estado</h1>
          <p className="text-sm text-muted-foreground">
            Fonte única das alíquotas usadas pelo motor de cálculo — nada é fixado na interface.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setEditando({ status: 'rascunho', base_calculo_metodo: 'simples', vigencia_inicio: new Date().toISOString().slice(0, 10) })}>
            <Plus className="h-4 w-4 mr-2" /> Nova regra
          </Button>
        )}
      </div>

      {!isAdmin && (
        <div className="flex gap-3 rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
          <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
          Você tem acesso somente de leitura. Apenas administradores cadastram ou alteram regras fiscais.
        </div>
      )}

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="text-base">Regras cadastradas</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select value={uf} onValueChange={setUf}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as UFs</SelectItem>
                {UFS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="arquivado">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Destino</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Operação</TableHead>
                  <TableHead>Interna</TableHead>
                  <TableHead>Interestadual</TableHead>
                  <TableHead>FCP</TableHead>
                  <TableHead>Vigência</TableHead>
                  <TableHead>Confiança</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtradas.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.uf_destino}</TableCell>
                    <TableCell>{r.uf_origem ?? 'Qualquer'}</TableCell>
                    <TableCell>{r.tipo_operacao}</TableCell>
                    <TableCell>{perc(r.aliquota_interna)}</TableCell>
                    <TableCell>{perc(r.aliquota_interestadual)}</TableCell>
                    <TableCell>{perc(r.fcp_percentual)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {dateBR(r.vigencia_inicio)}{r.vigencia_fim ? ` – ${dateBR(r.vigencia_fim)}` : ''}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.is_demo ? 'secondary' : 'default'}>
                        {r.is_demo ? 'Demonstrativa' : r.nivel_confianca}
                      </Badge>
                    </TableCell>
                    <TableCell><Badge variant="outline">{r.status}</Badge></TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" onClick={() => setLogsDe(r.id)} aria-label="Histórico"><History className="h-4 w-4" /></Button>
                      {isAdmin && (
                        <Button variant="ghost" size="icon" onClick={() => setEditando(r)} aria-label="Editar"><Pencil className="h-4 w-4" /></Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editando} onOpenChange={(o) => !o && setEditando(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editando?.id ? 'Editar regra' : 'Nova regra'}</DialogTitle></DialogHeader>
          {editando && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="UF de destino *">
                <Select value={editando.uf_destino ?? ''} onValueChange={(v) => setEditando({ ...editando, uf_destino: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{UFS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </Campo>
              <Campo label="UF de origem (vazio = qualquer)">
                <Select value={editando.uf_origem ?? 'qualquer'} onValueChange={(v) => setEditando({ ...editando, uf_origem: v === 'qualquer' ? null : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qualquer">Qualquer origem</SelectItem>
                    {UFS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Campo>
              <Campo label="Tipo de operação">
                <Input value={editando.tipo_operacao ?? 'venda'} onChange={(e) => setEditando({ ...editando, tipo_operacao: e.target.value })} />
              </Campo>
              <Campo label="Método de base">
                <Select value={editando.base_calculo_metodo ?? 'simples'} onValueChange={(v) => setEditando({ ...editando, base_calculo_metodo: v as 'simples' | 'dupla' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simples">Base simples</SelectItem>
                    <SelectItem value="dupla">Base dupla</SelectItem>
                  </SelectContent>
                </Select>
              </Campo>
              <Campo label="Alíquota interna (%) *">
                <Input type="number" step="0.01" value={editando.aliquota_interna ?? ''} onChange={(e) => setEditando({ ...editando, aliquota_interna: Number(e.target.value) })} />
              </Campo>
              <Campo label="Alíquota interestadual (%) *">
                <Input type="number" step="0.01" value={editando.aliquota_interestadual ?? ''} onChange={(e) => setEditando({ ...editando, aliquota_interestadual: Number(e.target.value) })} />
              </Campo>
              <Campo label="FCP (%)">
                <Input type="number" step="0.01" value={editando.fcp_percentual ?? ''} onChange={(e) => setEditando({ ...editando, fcp_percentual: Number(e.target.value) })} />
              </Campo>
              <Campo label="Responsável pelo recolhimento">
                <Select value={editando.responsavel_recolhimento ?? 'remetente'} onValueChange={(v) => setEditando({ ...editando, responsavel_recolhimento: v as never })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remetente">Remetente</SelectItem>
                    <SelectItem value="destinatario">Destinatário</SelectItem>
                    <SelectItem value="marketplace">Marketplace</SelectItem>
                    <SelectItem value="nao_aplicavel">Não aplicável</SelectItem>
                  </SelectContent>
                </Select>
              </Campo>
              <Campo label="Código de receita">
                <Input value={editando.codigo_receita ?? ''} onChange={(e) => setEditando({ ...editando, codigo_receita: e.target.value })} />
              </Campo>
              <Campo label="Vigência início *">
                <Input type="date" value={editando.vigencia_inicio ?? ''} onChange={(e) => setEditando({ ...editando, vigencia_inicio: e.target.value })} />
              </Campo>
              <Campo label="Vigência fim">
                <Input type="date" value={editando.vigencia_fim ?? ''} onChange={(e) => setEditando({ ...editando, vigencia_fim: e.target.value })} />
              </Campo>
              <Campo label="Nível de confiança">
                <Select value={editando.nivel_confianca ?? 'revisado'} onValueChange={(v) => setEditando({ ...editando, nivel_confianca: v as never, is_demo: v === 'demonstrativo' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="demonstrativo">Demonstrativo</SelectItem>
                    <SelectItem value="revisado">Revisado</SelectItem>
                    <SelectItem value="oficial">Oficial</SelectItem>
                  </SelectContent>
                </Select>
              </Campo>
              <Campo label="Status">
                <Select value={editando.status ?? 'rascunho'} onValueChange={(v) => setEditando({ ...editando, status: v as never })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="arquivado">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </Campo>
              <Campo label="Fonte oficial" className="sm:col-span-2">
                <Input value={editando.fonte_oficial ?? ''} onChange={(e) => setEditando({ ...editando, fonte_oficial: e.target.value })} />
              </Campo>
              <Campo label="Norma" className="sm:col-span-2">
                <Input value={editando.norma ?? ''} onChange={(e) => setEditando({ ...editando, norma: e.target.value })} />
              </Campo>
              <Campo label="Motivo da alteração / observações" className="sm:col-span-2">
                <Textarea value={editando.motivo ?? editando.observacoes ?? ''} onChange={(e) => setEditando({ ...editando, motivo: e.target.value })} />
              </Campo>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button onClick={salvar}>Salvar regra</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!logsDe} onOpenChange={(o) => !o && setLogsDe(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Histórico de alterações da regra</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {(logs ?? []).length === 0 && <p className="text-sm text-muted-foreground">Nenhuma alteração registrada.</p>}
            {(logs ?? []).map((l) => (
              <div key={l.id} className="text-sm border-b border-border/60 pb-2">
                <p className="font-medium">{l.field_name}</p>
                <p className="text-muted-foreground">
                  {l.old_value ?? '—'} → {l.new_value ?? '—'} · {dateBR(l.created_at)}
                </p>
                {l.reason && <p className="text-muted-foreground italic">{l.reason}</p>}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Campo({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
