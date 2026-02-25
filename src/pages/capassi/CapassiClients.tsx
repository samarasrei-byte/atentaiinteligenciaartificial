import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Users, Search } from 'lucide-react';

export default function CapassiClients() {
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Clientes</h2>
        <p className="text-sm text-white/40">Base de clientes da plataforma</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white/5 border-[#372938] text-white placeholder:text-white/30"
        />
      </div>

      <Card className="bg-[#0B0F1A] border-[#372938]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-[#55FFAA]" />
            {filtered.length} clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-white/40">Carregando...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#372938' }}>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/40">Nome</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/40">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/40">Telefone</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/40">Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: '#372938' }}>
                      <td className="py-3 px-4 text-sm text-white/80">{c.full_name || '-'}</td>
                      <td className="py-3 px-4 text-sm text-white/60">{c.email || '-'}</td>
                      <td className="py-3 px-4 text-sm text-white/60">{c.phone || '-'}</td>
                      <td className="py-3 px-4 text-sm text-white/40">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
