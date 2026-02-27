import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Eye, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const clientesMock = [
  { nome: 'Tech Solutions Ltda', cnpj: '12.345.678/0001-90', regime: 'Lucro Presumido', setor: 'Tecnologia', risco: 42, oportunidades: 3, status: 'ativo' },
  { nome: 'Comércio Central ME', cnpj: '98.765.432/0001-10', regime: 'Simples Nacional', setor: 'Comércio', risco: 28, oportunidades: 1, status: 'ativo' },
  { nome: 'Indústria Alfa S/A', cnpj: '11.222.333/0001-44', regime: 'Lucro Real', setor: 'Indústria', risco: 65, oportunidades: 5, status: 'ativo' },
  { nome: 'Saúde Prime Ltda', cnpj: '55.666.777/0001-88', regime: 'Lucro Presumido', setor: 'Saúde', risco: 51, oportunidades: 2, status: 'ativo' },
  { nome: 'Logística Express', cnpj: '33.444.555/0001-22', regime: 'Simples Nacional', setor: 'Logística', risco: 19, oportunidades: 1, status: 'ativo' },
  { nome: 'Construtora Sólida', cnpj: '77.888.999/0001-66', regime: 'Lucro Real', setor: 'Construção', risco: 73, oportunidades: 4, status: 'alerta' },
];

const getRiscoColor = (r: number) => r >= 60 ? '#DC2626' : r >= 40 ? '#D97706' : '#059669';

export default function SeracClientes() {
  const [search, setSearch] = useState('');
  const filtered = clientesMock.filter(c => c.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1B3A5C]">Clientes — Visão 360°</h2>
          <p className="text-sm text-[#6B7280] mt-1">{clientesMock.length} clientes na carteira</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
          <Input placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 border-[#E5E7EB]" />
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map((c, i) => (
          <Card key={i} className="border-[#E5E7EB] hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1B3A5C]/5 flex items-center justify-center">
                    <Users className="h-5 w-5 text-[#1B3A5C]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#1B3A5C]">{c.nome}</p>
                      {c.status === 'alerta' && <Badge variant="destructive" className="text-[10px]">ALERTA</Badge>}
                    </div>
                    <p className="text-xs text-[#6B7280]">{c.cnpj} • {c.regime} • {c.setor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-[#6B7280]">Score Risco</p>
                    <p className="text-lg font-bold" style={{ color: getRiscoColor(c.risco) }}>{c.risco}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-[#6B7280]">Oportunidades</p>
                    <p className="text-lg font-bold text-[#2563EB]">{c.oportunidades}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="text-[#2563EB]"><Eye className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-[#4B5563]"><FileText className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
