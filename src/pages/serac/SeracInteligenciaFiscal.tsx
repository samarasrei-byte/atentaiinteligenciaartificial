import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Brain, Lightbulb, AlertTriangle, TrendingUp, Search, CheckCircle2, XCircle } from 'lucide-react';

const insights = [
  { tipo: 'Crédito Tributário', cliente: 'Tech Solutions Ltda', valor: 'R$ 45.200', desc: 'Crédito de PIS/COFINS não aproveitado sobre insumos', status: 'pending', confianca: 94 },
  { tipo: 'Economia', cliente: 'Comércio Central ME', valor: 'R$ 12.800/mês', desc: 'Reorganização societária pode reduzir carga em 15%', status: 'validated', confianca: 87 },
  { tipo: 'Inconsistência', cliente: 'Indústria Alfa S/A', valor: 'R$ 8.500', desc: 'Divergência entre SPED Fiscal e EFD-Contribuições', status: 'alert', confianca: 96 },
  { tipo: 'Risco', cliente: 'Saúde Prime Ltda', valor: 'R$ 120.000', desc: 'Classificação NCM incorreta pode gerar auto de infração', status: 'alert', confianca: 91 },
  { tipo: 'Crédito Tributário', cliente: 'Logística Express', valor: 'R$ 22.000', desc: 'Crédito presumido de ICMS sobre frete não utilizado', status: 'pending', confianca: 89 },
];

export default function SeracInteligenciaFiscal() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1B3A5C]">Inteligência Fiscal</h2>
          <p className="text-sm text-[#6B7280] mt-1">IA AtentAI aplicada à análise contábil</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-[#4B5563]">
            <Switch defaultChecked /> Sugestão Automática
          </div>
          <div className="flex items-center gap-2 text-sm text-[#4B5563]">
            <Switch /> Validação Manual
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Créditos Identificados', value: 'R$ 67.200', icon: TrendingUp, color: '#059669' },
          { label: 'Oportunidades de Economia', value: '14', icon: Lightbulb, color: '#2563EB' },
          { label: 'Inconsistências', value: '7', icon: AlertTriangle, color: '#DC2626' },
          { label: 'Riscos Potenciais', value: '3', icon: Search, color: '#D97706' },
        ].map((k) => (
          <Card key={k.label} className="border-[#E5E7EB]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: `${k.color}10` }}>
                <k.icon className="h-5 w-5" style={{ color: k.color }} />
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">{k.label}</p>
                <p className="text-lg font-bold" style={{ color: k.color }}>{k.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#1B3A5C] flex items-center gap-2">
            <Brain className="h-4 w-4" /> Insights da IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.map((ins, i) => (
            <div key={i} className="p-4 rounded-lg border border-[#E5E7EB] bg-white hover:shadow-sm transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={ins.status === 'alert' ? 'destructive' : ins.status === 'validated' ? 'default' : 'secondary'} className="text-[10px]">
                      {ins.tipo}
                    </Badge>
                    <span className="text-xs text-[#9CA3AF]">Confiança: {ins.confianca}%</span>
                  </div>
                  <p className="text-sm font-semibold text-[#1B3A5C]">{ins.cliente}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{ins.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold text-[#1B3A5C]">{ins.valor}</p>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50">
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
