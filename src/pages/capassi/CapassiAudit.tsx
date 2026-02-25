import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useCapassi } from '@/contexts/CapassiContext';
import { Shield, Search, Download, ChevronLeft, ChevronRight, Filter, CheckCircle2, XCircle } from 'lucide-react';

const PAGE_SIZE = 25;

export default function CapassiAudit() {
  const { currentOrg } = useCapassi();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!currentOrg) return;
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('capassi_audit_logs' as any)
        .select('*')
        .eq('organization_id', currentOrg.id)
        .order('created_at', { ascending: false })
        .limit(500);
      setLogs((data || []) as any[]);
      setLoading(false);
    };
    fetch();
  }, [currentOrg?.id]);

  const filtered = logs
    .filter((l: any) => actionFilter === 'all' || l.action === actionFilter)
    .filter((l: any) => !search || l.action?.toLowerCase().includes(search.toLowerCase()) || l.entity_type?.toLowerCase().includes(search.toLowerCase()));

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const uniqueActions = [...new Set(logs.map((l: any) => l.action))];

  const exportCSV = () => {
    const header = 'Data,Ação,Entidade,ID Entidade\n';
    const rows = filtered.map((l: any) =>
      `"${new Date(l.created_at).toLocaleString('pt-BR')}","${l.action}","${l.entity_type}","${l.entity_id || '-'}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'capassi-auditoria.csv'; a.click();
  };

  if (!currentOrg) return <div className="py-20 text-center text-white/30">Selecione uma organização</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Auditoria</h2>
          <p className="text-sm text-white/30">Logs de atividade — {currentOrg.name}</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} className="border-white/10 text-white/50 hover:text-white bg-transparent hover:bg-white/5">
          <Download className="h-3.5 w-3.5 mr-2" /> Exportar
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <Shield className="h-4 w-4 text-white/40" />
          <div><p className="text-lg font-bold text-white">{logs.length}</p><p className="text-[10px] text-white/30 uppercase">Total Logs</p></div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#55FFAA]/5 border border-[#55FFAA]/10">
          <CheckCircle2 className="h-4 w-4 text-[#55FFAA]" />
          <div><p className="text-lg font-bold text-[#55FFAA]">{uniqueActions.length}</p><p className="text-[10px] text-white/30 uppercase">Tipos de Ação</p></div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
          <Input placeholder="Buscar por ação ou entidade..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-10 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 h-9" />
        </div>
        <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[160px] bg-white/[0.03] border-white/10 text-white/70 h-9 text-xs">
            <Filter className="h-3.5 w-3.5 mr-2" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {uniqueActions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-white/[0.02] border-white/[0.06]">
        <CardContent className="p-0">
          {loading ? <div className="p-12 text-center text-white/30">Carregando logs...</div> : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left py-3 px-5 text-[11px] font-medium text-white/30 uppercase tracking-wider">Data/Hora</th>
                      <th className="text-left py-3 px-5 text-[11px] font-medium text-white/30 uppercase tracking-wider">Ação</th>
                      <th className="text-left py-3 px-5 text-[11px] font-medium text-white/30 uppercase tracking-wider">Entidade</th>
                      <th className="text-left py-3 px-5 text-[11px] font-medium text-white/30 uppercase tracking-wider hidden lg:table-cell">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((log: any) => (
                      <tr key={log.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-5 text-xs text-white/50 font-mono whitespace-nowrap">{new Date(log.created_at).toLocaleString('pt-BR')}</td>
                        <td className="py-3 px-5">
                          <Badge className="bg-[#55FFAA]/10 text-[#55FFAA] border-[#55FFAA]/20 text-[10px]">{log.action}</Badge>
                        </td>
                        <td className="py-3 px-5 text-sm text-white/50">{log.entity_type}</td>
                        <td className="py-3 px-5 text-xs text-white/30 max-w-[200px] truncate hidden lg:table-cell">
                          {log.new_data ? JSON.stringify(log.new_data).substring(0, 60) + '...' : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
                <span className="text-xs text-white/30">{filtered.length} registros</span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="h-7 w-7 text-white/40"><ChevronLeft className="h-4 w-4" /></Button>
                  <span className="text-xs text-white/50">{page + 1}/{totalPages || 1}</span>
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
