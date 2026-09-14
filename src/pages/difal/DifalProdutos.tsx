import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { isValidNCM } from '@/lib/difal/format';
import { Loader2, Package, Pencil, Plus, Trash2 } from 'lucide-react';

interface ProdutoRow {
  id: string;
  descricao: string;
  ncm: string | null;
  cest: string | null;
  cfop: string | null;
  codigo_interno: string | null;
  created_at: string;
}

const emptyForm = { descricao: '', ncm: '', cest: '', cfop: '', codigo_interno: '' };

export default function DifalProdutos() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [busca, setBusca] = useState('');
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [excluir, setExcluir] = useState<ProdutoRow | null>(null);
  const [salvando, setSalvando] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['difal-produtos'],
    queryFn: async (): Promise<ProdutoRow[]> => {
      const { data, error } = await supabase
        .from('difal_products')
        .select('id, descricao, ncm, cest, cfop, codigo_interno, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProdutoRow[];
    },
  });

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return data ?? [];
    return (data ?? []).filter((p) =>
      [p.descricao, p.ncm ?? '', p.cest ?? '', p.cfop ?? '', p.codigo_interno ?? '']
        .join(' ')
        .toLowerCase()
        .includes(termo),
    );
  }, [data, busca]);

  const abrirNovo = () => {
    setForm(emptyForm);
    setEditId(null);
    setOpen(true);
  };

  const abrirEdicao = (p: ProdutoRow) => {
    setForm({
      descricao: p.descricao,
      ncm: p.ncm ?? '',
      cest: p.cest ?? '',
      cfop: p.cfop ?? '',
      codigo_interno: p.codigo_interno ?? '',
    });
    setEditId(p.id);
    setOpen(true);
  };

  const salvar = async () => {
    if (!form.descricao.trim()) {
      toast({ title: 'Informe a descrição do produto', variant: 'destructive' });
      return;
    }
    if (form.ncm && !isValidNCM(form.ncm)) {
      toast({ title: 'NCM inválido', description: 'O NCM deve ter 8 dígitos.', variant: 'destructive' });
      return;
    }
    setSalvando(true);
    const payload = {
      descricao: form.descricao.trim(),
      ncm: form.ncm.trim() || null,
      cest: form.cest.trim() || null,
      cfop: form.cfop.trim() || null,
      codigo_interno: form.codigo_interno.trim() || null,
    };

    let error;
    if (editId) {
      ({ error } = await supabase.from('difal_products').update(payload).eq('id', editId));
    } else {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) {
        setSalvando(false);
        toast({ title: 'Sessão expirada', description: 'Entre novamente para cadastrar produtos.', variant: 'destructive' });
        return;
      }
      ({ error } = await supabase.from('difal_products').insert({ ...payload, created_by: uid }));
    }
    setSalvando(false);
    if (error) {
      toast({ title: 'Não foi possível salvar', description: error.message, variant: 'destructive' });
      return;
    }
    setOpen(false);
    toast({ title: editId ? 'Produto atualizado' : 'Produto cadastrado' });
    qc.invalidateQueries({ queryKey: ['difal-produtos'] });
  };

  const confirmarExclusao = async () => {
    if (!excluir) return;
    const { error } = await supabase.from('difal_products').delete().eq('id', excluir.id);
    setExcluir(null);
    if (error) {
      toast({ title: 'Não foi possível excluir', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Produto excluído' });
    qc.invalidateQueries({ queryKey: ['difal-produtos'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Produtos e NCM</h1>
          <p className="text-sm text-muted-foreground">
            Cadastro usado para pesquisar produtos nas simulações de DIFAL.
          </p>
        </div>
        <Button onClick={abrirNovo}>
          <Plus className="h-4 w-4 mr-2" /> Novo produto
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Catálogo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Buscar por descrição, NCM, CEST, CFOP ou código interno"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtrados.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Package className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nenhum produto cadastrado ainda. Cadastre o primeiro para agilizar suas simulações.
              </p>
              <Button variant="outline" onClick={abrirNovo}>
                <Plus className="h-4 w-4 mr-2" /> Cadastrar produto
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>NCM</TableHead>
                    <TableHead>CEST</TableHead>
                    <TableHead>CFOP</TableHead>
                    <TableHead>Código interno</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrados.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.descricao}</TableCell>
                      <TableCell>{p.ncm ?? '—'}</TableCell>
                      <TableCell>{p.cest ?? '—'}</TableCell>
                      <TableCell>{p.cfop ?? '—'}</TableCell>
                      <TableCell>{p.codigo_interno ?? '—'}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button variant="ghost" size="icon" onClick={() => abrirEdicao(p)} aria-label="Editar produto">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setExcluir(p)} aria-label="Excluir produto">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar produto' : 'Novo produto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="descricao">Descrição *</Label>
              <Input id="descricao" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ncm">NCM (8 dígitos)</Label>
                <Input id="ncm" value={form.ncm} onChange={(e) => setForm({ ...form, ncm: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cest">CEST</Label>
                <Input id="cest" value={form.cest} onChange={(e) => setForm({ ...form, cest: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cfop">CFOP</Label>
                <Input id="cfop" value={form.cfop} onChange={(e) => setForm({ ...form, cfop: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="codigo">Código interno</Label>
                <Input id="codigo" value={form.codigo_interno} onChange={(e) => setForm({ ...form, codigo_interno: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={salvando}>
              {salvando && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!excluir} onOpenChange={(o) => !o && setExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto</AlertDialogTitle>
            <AlertDialogDescription>
              O produto "{excluir?.descricao}" será removido do catálogo. Simulações já salvas não são alteradas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
