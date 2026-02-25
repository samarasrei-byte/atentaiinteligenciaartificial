import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, Mail, Phone, Calendar, Download, ChevronLeft, ChevronRight, User2 } from 'lucide-react';

const PAGE_SIZE = 15;

export default function CapassiClients() {
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setClients(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = clients.filter(c =>
    (c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const exportCSV = () => {
    const header = 'Nome,Email,Telefone,Cadastro\n';
    const rows = filtered.map(c =>
      `"${c.full_name || '-'}","${c.email || '-'}","${c.phone || '-'}","${c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '-'}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'capassi-clientes.csv'; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Clientes</h2>
          <p className="text-sm text-white/30">Base completa de clientes da plataforma</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} className="border-white/10 text-white/50 hover:text-white bg-transparent hover:bg-white/5">
          <Download className="h-3.5 w-3.5 mr-2" /> Exportar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: clients.length, color: '#55FFAA' },
          { label: 'Este mês', value: clients.filter(c => c.created_at && new Date(c.created_at).getMonth() === new Date().getMonth()).length, color: '#33DDFF' },
          { label: 'Com email', value: clients.filter(c => c.email).length, color: '#7C5CFC' },
          { label: 'Com telefone', value: clients.filter(c => c.phone).length, color: '#FFB84D' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            <div>
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="pl-10 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 h-9"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Table */}
        <Card className="lg:col-span-2 bg-white/[0.02] border-white/[0.06]">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-white/30">Carregando...</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="text-left py-3 px-5 text-[11px] font-medium text-white/30 uppercase tracking-wider">Cliente</th>
                        <th className="text-left py-3 px-5 text-[11px] font-medium text-white/30 uppercase tracking-wider hidden md:table-cell">Email</th>
                        <th className="text-left py-3 px-5 text-[11px] font-medium text-white/30 uppercase tracking-wider hidden md:table-cell">Cadastro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((c) => (
                        <tr
                          key={c.id}
                          onClick={() => setSelectedClient(c)}
                          className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer ${selectedClient?.id === c.id ? 'bg-[#55FFAA]/5' : ''}`}
                        >
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#55FFAA]/20 to-[#33DDFF]/20 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-white/70">
                                  {(c.full_name || '?').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-sm text-white/80 truncate">{c.full_name || 'Sem nome'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-5 text-sm text-white/40 hidden md:table-cell">{c.email || '-'}</td>
                          <td className="py-3 px-5 text-xs text-white/30 hidden md:table-cell">
                            {c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
                  <span className="text-xs text-white/30">{filtered.length} clientes</span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="h-7 w-7 text-white/40">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-white/50">{page + 1}/{totalPages || 1}</span>
                    <Button variant="ghost" size="icon" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="h-7 w-7 text-white/40">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Client Detail */}
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white/80 flex items-center gap-2">
              <User2 className="h-4 w-4 text-[#55FFAA]" />
              Detalhes do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedClient ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#55FFAA]/20 to-[#33DDFF]/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {(selectedClient.full_name || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{selectedClient.full_name || 'Sem nome'}</p>
                    <Badge className="bg-[#55FFAA]/10 text-[#55FFAA] border-[#55FFAA]/20 text-[10px]">Ativo</Badge>
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  {[
                    { icon: Mail, label: 'Email', value: selectedClient.email },
                    { icon: Phone, label: 'Telefone', value: selectedClient.phone },
                    { icon: Calendar, label: 'Cadastro', value: selectedClient.created_at ? new Date(selectedClient.created_at).toLocaleDateString('pt-BR') : null },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                      <item.icon className="h-4 w-4 text-white/20 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-white/30 uppercase">{item.label}</p>
                        <p className="text-sm text-white/70 truncate">{item.value || '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Users className="h-10 w-10 text-white/10 mx-auto mb-3" />
                <p className="text-sm text-white/30">Selecione um cliente para ver detalhes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
