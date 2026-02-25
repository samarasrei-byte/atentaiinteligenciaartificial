import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useCapassi } from '@/contexts/CapassiContext';
import { useToast } from '@/hooks/use-toast';
import { Users, Search, Mail, Phone, Calendar, Download, ChevronLeft, ChevronRight, User2, Plus } from 'lucide-react';

const PAGE_SIZE = 15;
const SEGMENTS = ['tecnologia', 'varejo', 'servicos', 'industria', 'saude', 'educacao', 'financeiro', 'construcao', 'agronegocio', 'outros'];

export default function CapassiClients() {
  const { currentOrg, currentCompany } = useCapassi();
  const { toast } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDocument, setNewDocument] = useState('');
  const [newSegment, setNewSegment] = useState('outros');

  const fetchClients = async () => {
    if (!currentOrg) return;
    setLoading(true);
    let query = supabase.from('capassi_clients' as any).select('*').eq('organization_id', currentOrg.id).order('created_at', { ascending: false });
    if (currentCompany) query = query.eq('company_id', currentCompany.id);
    const { data } = await query;
    setClients((data || []) as any[]);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, [currentOrg?.id, currentCompany?.id]);

  const createClient = async () => {
    if (!newName.trim() || !currentOrg || !currentCompany) return;
    const { error } = await supabase.from('capassi_clients' as any).insert({
      organization_id: currentOrg.id,
      company_id: currentCompany.id,
      name: newName.trim(),
      email: newEmail || null,
      phone: newPhone || null,
      document: newDocument || null,
      segment: newSegment,
    } as any);
    if (error) { toast({ title: 'Erro ao criar cliente', variant: 'destructive' }); return; }
    toast({ title: 'Cliente criado!' });
    setShowNew(false); setNewName(''); setNewEmail(''); setNewPhone(''); setNewDocument('');
    fetchClients();
  };

  const filtered = clients.filter((c: any) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.document || '').includes(search)
  );

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  if (!currentOrg) return <div className="py-20 text-center text-white/30">Selecione uma organização</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Clientes</h2>
          <p className="text-sm text-white/30">Base de clientes — {currentOrg.name}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showNew} onOpenChange={setShowNew}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#55FFAA] text-black hover:bg-[#55FFAA]/80" disabled={!currentCompany}>
                <Plus className="h-3.5 w-3.5 mr-2" /> Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0d1117] border-white/10 text-white">
              <DialogHeader><DialogTitle>Novo Cliente</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <Input placeholder="Nome *" value={newName} onChange={e => setNewName(e.target.value)} className="bg-white/5 border-white/10 text-white" />
                <Input placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="bg-white/5 border-white/10 text-white" />
                <Input placeholder="Telefone" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="bg-white/5 border-white/10 text-white" />
                <Input placeholder="CPF/CNPJ" value={newDocument} onChange={e => setNewDocument(e.target.value)} className="bg-white/5 border-white/10 text-white" />
                <Select value={newSegment} onValueChange={setNewSegment}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>{SEGMENTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <Button onClick={createClient} className="w-full bg-[#55FFAA] text-black hover:bg-[#55FFAA]/80">Criar</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={() => {
            const header = 'Nome,Email,Telefone,Documento,Segmento,Status\n';
            const rows = filtered.map((c: any) => `"${c.name}","${c.email||''}","${c.phone||''}","${c.document||''}","${c.segment||''}","${c.status}"`).join('\n');
            const blob = new Blob([header + rows], { type: 'text/csv' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'capassi-clientes.csv'; a.click();
          }} className="border-white/10 text-white/50 hover:text-white bg-transparent hover:bg-white/5">
            <Download className="h-3.5 w-3.5 mr-2" /> Exportar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: clients.length, color: '#55FFAA' },
          { label: 'Ativos', value: clients.filter((c: any) => c.status === 'ativo').length, color: '#33DDFF' },
          { label: 'Com email', value: clients.filter((c: any) => c.email).length, color: '#7C5CFC' },
          { label: 'Com documento', value: clients.filter((c: any) => c.document).length, color: '#FFB84D' },
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
        <Input placeholder="Buscar por nome, email ou documento..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="pl-10 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 h-9" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-white/[0.02] border-white/[0.06]">
          <CardContent className="p-0">
            {loading ? <div className="p-12 text-center text-white/30">Carregando...</div> : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="text-left py-3 px-5 text-[11px] font-medium text-white/30 uppercase tracking-wider">Cliente</th>
                        <th className="text-left py-3 px-5 text-[11px] font-medium text-white/30 uppercase tracking-wider hidden md:table-cell">Segmento</th>
                        <th className="text-left py-3 px-5 text-[11px] font-medium text-white/30 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((c: any) => (
                        <tr key={c.id} onClick={() => setSelectedClient(c)}
                          className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer ${selectedClient?.id === c.id ? 'bg-[#55FFAA]/5' : ''}`}>
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#55FFAA]/20 to-[#33DDFF]/20 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-white/70">{(c.name || '?').charAt(0).toUpperCase()}</span>
                              </div>
                              <div>
                                <span className="text-sm text-white/80 truncate block">{c.name}</span>
                                <span className="text-[10px] text-white/30">{c.email || ''}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-5 text-xs text-white/40 capitalize hidden md:table-cell">{c.segment || '-'}</td>
                          <td className="py-3 px-5">
                            <Badge className={`text-[10px] ${c.status === 'ativo' ? 'bg-[#55FFAA]/10 text-[#55FFAA] border-[#55FFAA]/20' : 'bg-white/5 text-white/30 border-white/10'}`}>
                              {c.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
                  <span className="text-xs text-white/30">{filtered.length} clientes</span>
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

        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white/80 flex items-center gap-2"><User2 className="h-4 w-4 text-[#55FFAA]" /> Detalhes</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedClient ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#55FFAA]/20 to-[#33DDFF]/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{(selectedClient.name || '?').charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{selectedClient.name}</p>
                    <Badge className={`text-[10px] ${selectedClient.status === 'ativo' ? 'bg-[#55FFAA]/10 text-[#55FFAA] border-[#55FFAA]/20' : 'bg-white/5 text-white/30'}`}>{selectedClient.status}</Badge>
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  {[
                    { icon: Mail, label: 'Email', value: selectedClient.email },
                    { icon: Phone, label: 'Telefone', value: selectedClient.phone },
                    { icon: Users, label: 'Documento', value: selectedClient.document },
                    { icon: Calendar, label: 'Segmento', value: selectedClient.segment },
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
                <p className="text-sm text-white/30">Selecione um cliente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
