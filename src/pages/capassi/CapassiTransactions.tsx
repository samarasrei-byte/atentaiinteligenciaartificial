import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useCapassi } from '@/contexts/CapassiContext';
import { useToast } from '@/hooks/use-toast';
import {
  Plus, Download, Upload, RefreshCw, Search, Filter,
  ArrowUpRight, ArrowDownRight, Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v / 100);

const CATEGORIES = [
  'vendas', 'servicos', 'recorrente', 'outros_receita',
  'pessoal', 'marketing', 'tecnologia', 'infraestrutura',
  'impostos', 'financeiro', 'administrativo', 'outros_despesa'
];

const STATUS_OPTIONS = ['pago', 'pendente', 'atrasado', 'cancelado'];
const PAYMENT_METHODS = ['pix', 'boleto', 'cartao_credito', 'cartao_debito', 'transferencia', 'dinheiro'];
const RECURRENCE_OPTIONS = ['unico', 'mensal', 'trimestral', 'anual'];

export default function CapassiTransactions() {
  const { currentOrg, currentCompany } = useCapassi();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [showNew, setShowNew] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const PAGE_SIZE = 20;

  // New transaction form
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<string>('receita');
  const [newCategory, setNewCategory] = useState('vendas');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStatus, setNewStatus] = useState('pendente');
  const [newPayment, setNewPayment] = useState('');
  const [newRecurrence, setNewRecurrence] = useState('unico');

  const fetchAll = async () => {
    if (!currentOrg) return;
    setLoading(true);
    let query = supabase.from('capassi_transactions' as any).select('*').eq('organization_id', currentOrg.id).order('date', { ascending: false });
    if (currentCompany) query = query.eq('company_id', currentCompany.id);
    const { data } = await query;
    setTransactions((data || []) as any[]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [currentOrg?.id, currentCompany?.id]);

  const filtered = transactions
    .filter((t: any) => typeFilter === 'all' || t.type === typeFilter)
    .filter((t: any) => !search || t.description?.toLowerCase().includes(search.toLowerCase()));

  const totalFiltered = filtered.length;
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);

  const totalRev = filtered.filter((t: any) => t.type === 'receita').reduce((s: number, t: any) => s + (t.amount_cents || 0), 0);
  const totalCost = filtered.filter((t: any) => t.type === 'despesa').reduce((s: number, t: any) => s + (t.amount_cents || 0), 0);

  const createTransaction = async () => {
    if (!newDesc.trim() || !newAmount || !currentOrg || !currentCompany) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }
    const cents = Math.round(parseFloat(newAmount) * 100);
    const { error } = await supabase.from('capassi_transactions' as any).insert({
      organization_id: currentOrg.id,
      company_id: currentCompany.id,
      description: newDesc.trim(),
      amount_cents: cents,
      type: newType,
      category: newCategory,
      date: newDate,
      status: newStatus,
      payment_method: newPayment || null,
      recurrence: newRecurrence,
    } as any);
    if (error) { toast({ title: 'Erro ao criar transação', variant: 'destructive' }); return; }
    toast({ title: 'Transação criada!' });
    setShowNew(false);
    setNewDesc(''); setNewAmount('');
    fetchAll();
  };

  const exportCSV = () => {
    const header = 'Data,Tipo,Categoria,Descrição,Valor,Status\n';
    const rows = filtered.map((t: any) =>
      `${t.date},${t.type},${t.category},${t.description},${(t.amount_cents / 100).toFixed(2)},${t.status}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'capassi-transacoes.csv'; a.click();
  };

  if (!currentOrg) return <div className="py-20 text-center text-white/30">Selecione uma organização</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Transações</h2>
          <p className="text-sm text-white/30">Receitas e despesas — {currentOrg.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={showNew} onOpenChange={setShowNew}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#55FFAA] text-black hover:bg-[#55FFAA]/80" disabled={!currentCompany}>
                <Plus className="h-3.5 w-3.5 mr-2" /> Nova
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0d1117] border-white/10 text-white max-w-md">
              <DialogHeader><DialogTitle>Nova Transação</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <Input placeholder="Descrição *" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="bg-white/5 border-white/10 text-white" />
                <Input placeholder="Valor (R$) *" type="number" step="0.01" value={newAmount} onChange={e => setNewAmount(e.target.value)} className="bg-white/5 border-white/10 text-white" />
                <div className="grid grid-cols-2 gap-2">
                  <Select value={newType} onValueChange={setNewType}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="bg-white/5 border-white/10 text-white" />
                <div className="grid grid-cols-2 gap-2">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={newRecurrence} onValueChange={setNewRecurrence}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RECURRENCE_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createTransaction} className="w-full bg-[#55FFAA] text-black hover:bg-[#55FFAA]/80">Criar Transação</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={fetchAll} className="border-white/10 text-white/50 hover:text-white bg-transparent hover:bg-white/5">
            <RefreshCw className="h-3.5 w-3.5 mr-2" /> Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} className="border-white/10 text-white/50 hover:text-white bg-transparent hover:bg-white/5">
            <Download className="h-3.5 w-3.5 mr-2" /> CSV
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#55FFAA]/5 border border-[#55FFAA]/10">
          <ArrowUpRight className="h-4 w-4 text-[#55FFAA]" />
          <div>
            <p className="text-xs text-white/40">Receitas</p>
            <p className="text-sm font-bold text-[#55FFAA]">{fmt(totalRev)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/10">
          <ArrowDownRight className="h-4 w-4 text-red-400" />
          <div>
            <p className="text-xs text-white/40">Despesas</p>
            <p className="text-sm font-bold text-red-400">{fmt(totalCost)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
          <Calendar className="h-4 w-4 text-violet-400" />
          <div>
            <p className="text-xs text-white/40">Total</p>
            <p className="text-sm font-bold text-white">{totalFiltered} registros</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
          <Input placeholder="Buscar transação..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-10 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 h-9" />
        </div>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[140px] bg-white/[0.03] border-white/10 text-white/70 h-9 text-xs">
            <Filter className="h-3.5 w-3.5 mr-2" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="receita">Receitas</SelectItem>
            <SelectItem value="despesa">Despesas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="bg-white/[0.02] border-white/[0.06]">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-white/30">Carregando transações...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left py-3 px-5 text-[11px] font-medium text-white/30 uppercase tracking-wider">Data</th>
                      <th className="text-left py-3 px-5 text-[11px] font-medium text-white/30 uppercase tracking-wider">Tipo</th>
                      <th className="text-left py-3 px-5 text-[11px] font-medium text-white/30 uppercase tracking-wider">Categoria</th>
                      <th className="text-left py-3 px-5 text-[11px] font-medium text-white/30 uppercase tracking-wider">Descrição</th>
                      <th className="text-left py-3 px-5 text-[11px] font-medium text-white/30 uppercase tracking-wider">Status</th>
                      <th className="text-right py-3 px-5 text-[11px] font-medium text-white/30 uppercase tracking-wider">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((t: any, i: number) => (
                      <tr key={t.id || i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-5 text-sm text-white/60">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                        <td className="py-3 px-5">
                          <Badge className={`text-[10px] ${t.type === 'receita' ? 'bg-[#55FFAA]/10 text-[#55FFAA] border-[#55FFAA]/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {t.type === 'receita' ? '↑ Receita' : '↓ Despesa'}
                          </Badge>
                        </td>
                        <td className="py-3 px-5 text-xs text-white/40 capitalize">{(t.category || '').replace(/_/g, ' ')}</td>
                        <td className="py-3 px-5 text-sm text-white/50 max-w-[200px] truncate">{t.description}</td>
                        <td className="py-3 px-5">
                          <Badge className={`text-[10px] ${
                            t.status === 'pago' ? 'bg-[#55FFAA]/10 text-[#55FFAA] border-[#55FFAA]/20' :
                            t.status === 'atrasado' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            t.status === 'cancelado' ? 'bg-white/5 text-white/30 border-white/10' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>{t.status}</Badge>
                        </td>
                        <td className={`py-3 px-5 text-right font-mono font-semibold text-sm ${t.type === 'receita' ? 'text-[#55FFAA]' : 'text-red-400'}`}>
                          {t.type === 'receita' ? '+' : '-'}{fmt(t.amount_cents)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
                <span className="text-xs text-white/30">{totalFiltered} registros</span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="h-7 w-7 text-white/40"><ChevronLeft className="h-4 w-4" /></Button>
                  <span className="text-xs text-white/50">{page + 1} / {totalPages || 1}</span>
                  <Button variant="ghost" size="icon" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="h-7 w-7 text-white/40"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
