import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Search, Download, MapPin, Building2, Star, MessageSquare } from 'lucide-react';

const leadsMock = [
  { nome: 'Escritório Contábil Exata', regiao: 'São Paulo - SP', porte: 'Médio', cnae: '6920-6/01', regime: 'Lucro Presumido', score: 92 },
  { nome: 'Contabilidade Alfa', regiao: 'Rio de Janeiro - RJ', porte: 'Pequeno', cnae: '6920-6/01', regime: 'Simples Nacional', score: 85 },
  { nome: 'Grupo Fiscal Sul', regiao: 'Curitiba - PR', porte: 'Grande', cnae: '6920-6/02', regime: 'Lucro Real', score: 78 },
  { nome: 'Assessoria Tributária Norte', regiao: 'Manaus - AM', porte: 'Médio', cnae: '6920-6/01', regime: 'Lucro Presumido', score: 71 },
  { nome: 'BPO Contábil Center', regiao: 'Belo Horizonte - MG', porte: 'Médio', cnae: '6920-6/02', regime: 'Simples Nacional', score: 88 },
];

export default function SeracProspeccao() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1B3A5C]">Prospecção Estratégica</h2>
          <p className="text-sm text-[#6B7280] mt-1">Identificação e qualificação de escritórios contábeis</p>
        </div>
        <Button className="bg-[#1B3A5C] hover:bg-[#1B3A5C]/90 text-white">
          <Download className="h-4 w-4 mr-2" /> Exportar Leads
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
              <Input placeholder="Buscar..." className="pl-9 border-[#E5E7EB]" />
            </div>
            <Select><SelectTrigger className="border-[#E5E7EB]"><SelectValue placeholder="Região" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sp">São Paulo</SelectItem>
                <SelectItem value="rj">Rio de Janeiro</SelectItem>
                <SelectItem value="mg">Minas Gerais</SelectItem>
              </SelectContent>
            </Select>
            <Select><SelectTrigger className="border-[#E5E7EB]"><SelectValue placeholder="Porte" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pequeno">Pequeno</SelectItem>
                <SelectItem value="medio">Médio</SelectItem>
                <SelectItem value="grande">Grande</SelectItem>
              </SelectContent>
            </Select>
            <Select><SelectTrigger className="border-[#E5E7EB]"><SelectValue placeholder="Regime" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="simples">Simples Nacional</SelectItem>
                <SelectItem value="presumido">Lucro Presumido</SelectItem>
                <SelectItem value="real">Lucro Real</SelectItem>
              </SelectContent>
            </Select>
            <Select><SelectTrigger className="border-[#E5E7EB]"><SelectValue placeholder="Score mínimo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="70">70+</SelectItem>
                <SelectItem value="80">80+</SelectItem>
                <SelectItem value="90">90+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads */}
      <div className="grid gap-4">
        {leadsMock.map((l, i) => (
          <Card key={i} className="border-[#E5E7EB] hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#2563EB]/5 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1B3A5C]">{l.nome}</p>
                    <div className="flex items-center gap-2 text-xs text-[#6B7280] mt-0.5">
                      <MapPin className="h-3 w-3" /> {l.regiao}
                      <span>•</span> CNAE {l.cnae}
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
                  <Button size="sm" className="bg-[#2563EB] hover:bg-[#2563EB]/90 text-white">
                    <MessageSquare className="h-3.5 w-3.5 mr-1" /> Abordar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
