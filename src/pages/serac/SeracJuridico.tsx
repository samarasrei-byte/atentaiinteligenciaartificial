import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gavel, Search, FileText, AlertTriangle, MessageSquare, BookOpen, ExternalLink } from 'lucide-react';

const pareceres = [
  { titulo: 'Créditos de ICMS-ST na Revenda', tema: 'ICMS', data: '2025-02-20', autor: 'Dr. Paulo Mendes' },
  { titulo: 'Exclusão do ICMS da Base de PIS/COFINS', tema: 'PIS/COFINS', data: '2025-02-15', autor: 'Dra. Ana Beatriz' },
  { titulo: 'Implicações da LC 214/2025 para Serviços', tema: 'Reforma Tributária', data: '2025-02-10', autor: 'Dr. Carlos Lima' },
  { titulo: 'Planejamento Sucessório em Holdings', tema: 'Societário', data: '2025-01-28', autor: 'Dra. Mariana Costa' },
];

const alertasLegais = [
  { titulo: 'IN RFB 2.228/2025 - Novas regras EFD', prazo: '01/04/2026', impacto: 'alto' },
  { titulo: 'Convênio ICMS 178/2025 - Diferencial de alíquotas', prazo: '15/03/2026', impacto: 'medio' },
  { titulo: 'Portaria PGFN 14.402 - Transação tributária', prazo: '30/06/2026', impacto: 'baixo' },
];

export default function SeracJuridico() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1B3A5C]">Jurídico Integrado</h2>
          <p className="text-sm text-[#6B7280] mt-1">Assessoria jurídica e biblioteca de pareceres</p>
        </div>
        <Button className="bg-[#1B3A5C] hover:bg-[#1B3A5C]/90 text-white">
          <MessageSquare className="h-4 w-4 mr-2" /> Canal com Assessoria
        </Button>
      </div>

      {/* Search */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            <Input placeholder="Buscar pareceres por tema, legislação ou palavra-chave..." className="pl-9 border-[#E5E7EB]" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pareceres */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#1B3A5C] flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Biblioteca de Pareceres
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pareceres.map((p, i) => (
              <div key={i} className="p-3 rounded-lg border border-[#E5E7EB] hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#1B3A5C]">{p.titulo}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px]">{p.tema}</Badge>
                      <span className="text-xs text-[#9CA3AF]">{new Date(p.data).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1">{p.autor}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-[#2563EB]">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Alertas Legais */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#1B3A5C] flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Alertas Legais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertasLegais.map((a, i) => (
              <div key={i} className="p-3 rounded-lg border border-[#E5E7EB]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-[#1B3A5C]">{a.titulo}</p>
                  <Badge variant={a.impacto === 'alto' ? 'destructive' : a.impacto === 'medio' ? 'default' : 'secondary'} className="text-[10px]">
                    {a.impacto.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-[#6B7280]">Prazo: {a.prazo}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
