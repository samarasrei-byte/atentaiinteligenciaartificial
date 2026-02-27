import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, BarChart3, Shield, DollarSign, Lightbulb } from 'lucide-react';

const relatorios = [
  { titulo: 'Impacto da Reforma Tributária', desc: 'Análise individual por cliente do impacto IBS+CBS', icon: BarChart3, color: '#2563EB', tipo: 'PDF / Excel' },
  { titulo: 'Estratégias Adotadas', desc: 'Compilado de estratégias fiscais implementadas', icon: Lightbulb, color: '#059669', tipo: 'PDF' },
  { titulo: 'Risco Fiscal da Carteira', desc: 'Mapa de risco consolidado de todos os clientes', icon: Shield, color: '#DC2626', tipo: 'PDF / Excel' },
  { titulo: 'Economia Estimada', desc: 'Resumo de créditos e economias identificados', icon: DollarSign, color: '#D97706', tipo: 'PDF' },
  { titulo: 'Recomendações Estratégicas', desc: 'Plano de ação personalizado por cliente', icon: FileText, color: '#7C3AED', tipo: 'PDF' },
];

const historico = [
  { nome: 'Relatório Reforma Q1 2026', gerado: '2026-02-25', formato: 'PDF', tamanho: '2.4 MB' },
  { nome: 'Risco Fiscal - Fevereiro', gerado: '2026-02-20', formato: 'Excel', tamanho: '1.8 MB' },
  { nome: 'Economia Identificada - Jan', gerado: '2026-01-30', formato: 'PDF', tamanho: '1.2 MB' },
  { nome: 'Estratégias Q4 2025', gerado: '2025-12-28', formato: 'PDF', tamanho: '3.1 MB' },
];

export default function SeracRelatorios() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1B3A5C]">Relatórios</h2>
        <p className="text-sm text-[#6B7280] mt-1">Geração automática de relatórios estratégicos</p>
      </div>

      {/* Report types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatorios.map((r, i) => (
          <Card key={i} className="border-[#E5E7EB] hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${r.color}10` }}>
                  <r.icon className="h-5 w-5" style={{ color: r.color }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#1B3A5C] text-sm">{r.titulo}</p>
                  <p className="text-xs text-[#6B7280] mt-1">{r.desc}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-[10px]">{r.tipo}</Badge>
                <Button size="sm" className="bg-[#1B3A5C] hover:bg-[#1B3A5C]/90 text-white text-xs">
                  <Download className="h-3 w-3 mr-1" /> Gerar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* History */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#1B3A5C] flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Histórico de Relatórios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {historico.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-[#6B7280]" />
                  <div>
                    <p className="text-sm font-medium text-[#1B3A5C]">{h.nome}</p>
                    <p className="text-xs text-[#9CA3AF]">{new Date(h.gerado).toLocaleDateString('pt-BR')} • {h.tamanho}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{h.formato}</Badge>
                  <Button size="sm" variant="ghost" className="text-[#2563EB]">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
