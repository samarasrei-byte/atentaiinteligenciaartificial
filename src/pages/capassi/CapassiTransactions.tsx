import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Plus, Download, Upload, RefreshCw, Search, Filter,
  ArrowUpRight, ArrowDownRight, Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useRef } from 'react';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v / 100);

export default function CapassiTransactions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [revenues, setRevenues] = useState<any[]>([]);
  const [costs, setCosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const PAGE_SIZE = 20;

  const fetchAll = async () => {
    setLoading(true);
    const [rev, cost] = await Promise.all([
      supabase.from('financial_revenues').select('*').order('revenue_date', { ascending: false }),
      supabase.from('financial_costs').select('*').order('cost_date', { ascending: false }),
    ]);
    setRevenues(rev.data || []);
    setCosts(cost.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const allTransactions = [
    ...revenues.map(r => ({ ...r, _type: 'revenue' as const, _date: r.revenue_date, _amount: r.amount_cents, _desc: r.description || r.service_slug || r.plan_name || '-' })),
    ...costs.map(c => ({ ...c, _type: 'cost' as const, _date: c.cost_date, _amount: c.amount_cents, _desc: c.description || c.cost_type || c.category || '-' })),
  ].sort((a, b) => new Date(b._date).getTime() - new Date(a._date).getTime());

  const filtered = allTransactions
    .filter(t => typeFilter === 'all' || t._type === typeFilter)
    .filter(t => !search || t._desc.toLowerCase().includes(search.toLowerCase()));

  const totalFiltered = filtered.length;
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);

  const totalRev = filtered.filter(t => t._type === 'revenue').reduce((s, t) => s + t._amount, 0);
  const totalCost = filtered.filter(t => t._type === 'cost').reduce((s, t) => s + t._amount, 0);

  const exportCSV = () => {
    const header = 'Data,Tipo,Descrição,Valor\n';
    const rows = filtered.map(t =>
      `${t._date},${t._type === 'revenue' ? 'Receita' : 'Custo'},${t._desc},${(t._amount / 100).toFixed(2)}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'capassi-transacoes.csv'; a.click();
  };

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').slice(1).filter(Boolean);
      let imported = 0;
      for (const line of lines) {
        const [date, type, desc, amount] = line.split(',');
        const cents = Math.round(parseFloat(amount) * 100);
        if (type?.trim().toLowerCase() === 'receita') {
          await supabase.from('financial_revenues').insert({ revenue_date: date.trim(), amount_cents: cents, service_slug: desc.trim() || 'import', source: 'csv' });
        } else {
          await supabase.from('financial_costs').insert({ cost_date: date.trim(), amount_cents: cents, cost_type: 'outros', description: desc.trim(), user_id: user!.id });
        }
        imported++;
      }
      toast({ title: `${imported} transações importadas com sucesso` });
      fetchAll();
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Transações</h2>
          <p className="text-sm text-white/30">Receitas e custos unificados com filtros avançados</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={fetchAll} className="border-white/10 text-white/50 hover:text-white bg-transparent hover:bg-white/5">
            <RefreshCw className="h-3.5 w-3.5 mr-2" /> Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} className="border-white/10 text-white/50 hover:text-white bg-transparent hover:bg-white/5">
            <Download className="h-3.5 w-3.5 mr-2" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="border-white/10 text-white/50 hover:text-white bg-transparent hover:bg-white/5">
            <Upload className="h-3.5 w-3.5 mr-2" /> Importar
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={importCSV} />
        </div>
      </div>

      {/* Summary strip */}
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
            <p className="text-xs text-white/40">Custos</p>
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
          <Input
            placeholder="Buscar transação..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-10 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 h-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[140px] bg-white/[0.03] border-white/10 text-white/70 h-9 text-xs">
            <Filter className="h-3.5 w-3.5 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="revenue">Receitas</SelectItem>
            <SelectItem value="cost">Custos</SelectItem>
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
                      <th className="text-left py-3 px-5 text-[11px] font-medium text-white/30 uppercase tracking-wider">Descrição</th>
                      <th className="text-right py-3 px-5 text-[11px] font-medium text-white/30 uppercase tracking-wider">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((t, i) => (
                      <tr key={t.id || i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-5 text-sm text-white/60">
                          {new Date(t._date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-5">
                          <Badge className={`text-[10px] ${t._type === 'revenue' ? 'bg-[#55FFAA]/10 text-[#55FFAA] border-[#55FFAA]/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {t._type === 'revenue' ? '↑ Receita' : '↓ Custo'}
                          </Badge>
                        </td>
                        <td className="py-3 px-5 text-sm text-white/50 max-w-[300px] truncate">{t._desc}</td>
                        <td className={`py-3 px-5 text-right font-mono font-semibold text-sm ${t._type === 'revenue' ? 'text-[#55FFAA]' : 'text-red-400'}`}>
                          {t._type === 'revenue' ? '+' : '-'}{fmt(t._amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
                <span className="text-xs text-white/30">{totalFiltered} registros</span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="h-7 w-7 text-white/40">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-white/50">{page + 1} / {totalPages || 1}</span>
                  <Button variant="ghost" size="icon" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="h-7 w-7 text-white/40">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
