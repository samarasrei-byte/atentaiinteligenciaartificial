import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Target, Search, Download, MapPin, Building2, Star,
  MessageSquare, Users, Gavel, TrendingUp, Calendar,
  CheckCircle2, DollarSign
} from 'lucide-react';
import { useState } from 'react';

const canalData = {
  empresas: {
    label: 'Empresas',
    icon: Building2,
    color: '#2563EB',
    kpis: { captados: 342, qualificados: 189, reunioes: 47, contratos: 23, receita: 'R$ 92.400/mês' },
    leads: [
      { nome: 'Tech Solutions Ltda', regiao: 'São Paulo - SP', porte: 'Médio', regime: 'Lucro Presumido', score: 92, setor: 'Tecnologia' },
      { nome: 'E-Commerce Brasil Shop', regiao: 'Rio de Janeiro - RJ', porte: 'Grande', regime: 'Lucro Real', score: 88, setor: 'E-commerce' },
      { nome: 'Holdings Capital SA', regiao: 'São Paulo - SP', porte: 'Grande', regime: 'Lucro Real', score: 95, setor: 'Holdings' },
      { nome: 'Startup GameDev Studio', regiao: 'Florianópolis - SC', porte: 'Pequeno', regime: 'Simples Nacional', score: 79, setor: 'Games/Tech' },
      { nome: 'Saúde Prime Clínicas', regiao: 'Belo Horizonte - MG', porte: 'Médio', regime: 'Lucro Presumido', score: 84, setor: 'Saúde' },
    ]
  },
  contadores: {
    label: 'Contadores',
    icon: Users,
    color: '#059669',
    kpis: { captados: 187, qualificados: 102, reunioes: 31, contratos: 14, receita: 'R$ 45.800/mês' },
    leads: [
      { nome: 'Escritório Contábil Exata', regiao: 'São Paulo - SP', porte: 'Médio', regime: 'Lucro Presumido', score: 92, setor: 'Contabilidade' },
      { nome: 'Contabilidade Alfa', regiao: 'Rio de Janeiro - RJ', porte: 'Pequeno', regime: 'Simples Nacional', score: 85, setor: 'Contabilidade' },
      { nome: 'Grupo Fiscal Sul', regiao: 'Curitiba - PR', porte: 'Grande', regime: 'Lucro Real', score: 78, setor: 'Contabilidade' },
      { nome: 'BPO Contábil Center', regiao: 'Belo Horizonte - MG', porte: 'Médio', regime: 'Simples Nacional', score: 88, setor: 'BPO' },
    ]
  },
  cartorios: {
    label: 'Cartórios',
    icon: Gavel,
    color: '#7C3AED',
    kpis: { captados: 98, qualificados: 54, reunioes: 18, contratos: 9, receita: 'R$ 67.200/mês' },
    leads: [
      { nome: 'Cartório 3º Ofício - SP', regiao: 'São Paulo - SP', porte: 'Grande', regime: 'Lucro Presumido', score: 94, setor: 'Notas' },
      { nome: 'Cartório 1º Registro - RJ', regiao: 'Rio de Janeiro - RJ', porte: 'Médio', regime: 'Lucro Presumido', score: 91, setor: 'Registro' },
      { nome: 'Tabelionato Central - MG', regiao: 'Belo Horizonte - MG', porte: 'Médio', regime: 'Lucro Presumido', score: 86, setor: 'Protesto' },
      { nome: 'Cartório 5º Ofício - PR', regiao: 'Curitiba - PR', porte: 'Pequeno', regime: 'Lucro Presumido', score: 82, setor: 'Notas' },
    ]
  },
};

type CanalKey = keyof typeof canalData;

export default function SeracProspeccao() {
  const [canal, setCanal] = useState<CanalKey>('empresas');
  const [search, setSearch] = useState('');
  const data = canalData[canal];
  const filtered = data.leads.filter(l => !search || l.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1B3A5C]">Prospecção Estratégica — 3 Canais</h2>
          <p className="text-sm text-[#6B7280] mt-1">Empresas • Contadores • Cartórios</p>
        </div>
        <Button className="bg-[#1B3A5C] hover:bg-[#1B3A5C]/90 text-white">
          <Download className="h-4 w-4 mr-2" /> Exportar Leads
        </Button>
      </div>

      {/* Canal Tabs */}
      <Tabs value={canal} onValueChange={(v) => setCanal(v as CanalKey)}>
        <TabsList className="bg-[#F3F4F6]">
          {Object.entries(canalData).map(([key, val]) => (
            <TabsTrigger key={key} value={key} className="flex items-center gap-2">
              <val.icon className="h-4 w-4" /> {val.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(canalData).map(([key, val]) => (
          <TabsContent key={key} value={key} className="mt-4 space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Captados', value: val.kpis.captados, icon: Target },
                { label: 'Qualificados', value: val.kpis.qualificados, icon: CheckCircle2 },
                { label: 'Reuniões', value: val.kpis.reunioes, icon: Calendar },
                { label: 'Contratos', value: val.kpis.contratos, icon: TrendingUp },
                { label: 'Receita', value: val.kpis.receita, icon: DollarSign },
              ].map((k) => (
                <Card key={k.label} className="border-[#E5E7EB]">
                  <CardContent className="p-4 text-center">
                    <k.icon className="h-4 w-4 mx-auto mb-1" style={{ color: val.color }} />
                    <p className="text-xs text-[#6B7280]">{k.label}</p>
                    <p className="text-lg font-bold" style={{ color: val.color }}>{k.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
              <Input placeholder={`Buscar lead de ${val.label}...`} value={search} onChange={e => setSearch(e.target.value)} className="pl-9 border-[#E5E7EB]" />
            </div>

            {/* Leads */}
            <div className="grid gap-4">
              {filtered.map((l, i) => (
                <Card key={i} className="border-[#E5E7EB] hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${val.color}10` }}>
                          <val.icon className="h-5 w-5" style={{ color: val.color }} />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1B3A5C]">{l.nome}</p>
                          <div className="flex items-center gap-2 text-xs text-[#6B7280] mt-0.5">
                            <MapPin className="h-3 w-3" /> {l.regiao}
                            <span>•</span> {l.setor}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xs text-[#6B7280]">Porte</p>
                          <Badge variant="secondary" className="text-[10px]">{l.porte}</Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-[#6B7280]">Regime</p>
                          <p className="text-xs font-medium text-[#4B5563]">{l.regime}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-[#6B7280]">Score</p>
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                            <span className="text-lg font-bold text-[#1B3A5C]">{l.score}</span>
                          </div>
                        </div>
                        <Button size="sm" style={{ backgroundColor: val.color }} className="text-white hover:opacity-90">
                          <MessageSquare className="h-3.5 w-3.5 mr-1" /> Abordar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
