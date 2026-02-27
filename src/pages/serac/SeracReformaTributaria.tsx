import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scale, Clock, AlertTriangle, Calculator, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const timeline = [
  { year: '2026', title: 'Início CBS', desc: 'Contribuição sobre Bens e Serviços federal entra em vigor', status: 'upcoming' },
  { year: '2027', title: 'Teste IBS', desc: 'Período de teste do IBS (estadual/municipal)', status: 'future' },
  { year: '2029', title: 'IBS 10%', desc: 'Implementação gradual do IBS a 10% da alíquota final', status: 'future' },
  { year: '2033', title: 'Transição Completa', desc: 'Extinção total do ICMS e ISS', status: 'future' },
];

const alertsMock = [
  { client: 'Tech Solutions Ltda', regime: 'Lucro Presumido', alert: 'Aumento estimado de 12% na carga tributária', severity: 'high' },
  { client: 'Comércio Central ME', regime: 'Simples Nacional', alert: 'Possível benefício com créditos de IBS', severity: 'medium' },
  { client: 'Indústria Alfa S/A', regime: 'Lucro Real', alert: 'Impacto neutro - monitorar evolução', severity: 'low' },
  { client: 'Saúde Prime Ltda', regime: 'Lucro Presumido', alert: 'Setor saúde com alíquota reduzida prevista', severity: 'info' },
];

export default function SeracReformaTributaria() {
  const [regime, setRegime] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1B3A5C]">Reforma Tributária 2026</h2>
        <p className="text-sm text-[#6B7280] mt-1">IBS + CBS • Análise de impacto e simulações</p>
      </div>

      {/* IBS + CBS Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-[#E5E7EB] bg-gradient-to-br from-[#1B3A5C] to-[#2563EB] text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="h-6 w-6" />
              <h3 className="text-lg font-bold">IBS - Imposto sobre Bens e Serviços</h3>
            </div>
            <p className="text-sm text-white/80 mb-3">Substituirá o ICMS (estadual) e ISS (municipal). Alíquota estimada: 17,7%</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-white/60">Alíquota Final</p>
                <p className="text-xl font-bold">17,7%</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-white/60">Início Transição</p>
                <p className="text-xl font-bold">2029</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E5E7EB] bg-gradient-to-br from-[#059669] to-[#10B981] text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="h-6 w-6" />
              <h3 className="text-lg font-bold">CBS - Contribuição sobre Bens e Serviços</h3>
            </div>
            <p className="text-sm text-white/80 mb-3">Substituirá PIS e COFINS (federal). Alíquota estimada: 8,8%</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-white/60">Alíquota Final</p>
                <p className="text-xl font-bold">8,8%</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-white/60">Início</p>
                <p className="text-xl font-bold">2026</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#1B3A5C] flex items-center gap-2">
            <Clock className="h-4 w-4" /> Linha do Tempo de Implementação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {timeline.map((t, i) => (
              <div key={i} className="flex-1 relative">
                <div className="flex items-center gap-3 md:flex-col md:items-start">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${t.status === 'upcoming' ? 'bg-[#2563EB]' : 'bg-[#9CA3AF]'}`}>
                    {t.year}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1B3A5C] text-sm">{t.title}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{t.desc}</p>
                  </div>
                </div>
                {i < timeline.length - 1 && <div className="hidden md:block absolute top-5 left-[52px] w-full h-0.5 bg-[#E5E7EB]" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#1B3A5C] flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Alertas por Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alertsMock.map((a, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <Badge variant={a.severity === 'high' ? 'destructive' : a.severity === 'medium' ? 'default' : 'secondary'} className="text-[10px]">
                  {a.severity === 'high' ? 'CRÍTICO' : a.severity === 'medium' ? 'ATENÇÃO' : a.severity === 'low' ? 'BAIXO' : 'INFO'}
                </Badge>
                <div>
                  <p className="text-sm font-medium text-[#1B3A5C]">{a.client}</p>
                  <p className="text-xs text-[#6B7280]">{a.regime} • {a.alert}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-[#2563EB] text-xs">Simular <ArrowRight className="h-3 w-3 ml-1" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Simulator */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#1B3A5C] flex items-center gap-2">
            <Calculator className="h-4 w-4" /> Simulador de Impacto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Select value={regime} onValueChange={setRegime}>
              <SelectTrigger><SelectValue placeholder="Regime Tributário" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="simples">Simples Nacional</SelectItem>
                <SelectItem value="presumido">Lucro Presumido</SelectItem>
                <SelectItem value="real">Lucro Real</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger><SelectValue placeholder="Porte da Empresa" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mei">MEI</SelectItem>
                <SelectItem value="me">ME</SelectItem>
                <SelectItem value="epp">EPP</SelectItem>
                <SelectItem value="medio">Médio Porte</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger><SelectValue placeholder="Setor" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="comercio">Comércio</SelectItem>
                <SelectItem value="servicos">Serviços</SelectItem>
                <SelectItem value="industria">Indústria</SelectItem>
                <SelectItem value="tecnologia">Tecnologia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Mock result */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#FEF2F2] rounded-lg p-4 border border-red-100">
              <p className="text-xs text-red-600 font-medium">Carga Atual</p>
              <p className="text-2xl font-bold text-red-700 mt-1">R$ 42.500/mês</p>
              <p className="text-xs text-red-500 mt-1">ICMS + ISS + PIS/COFINS</p>
            </div>
            <div className="bg-[#F0FDF4] rounded-lg p-4 border border-green-100">
              <p className="text-xs text-emerald-600 font-medium">Carga Projetada (IBS+CBS)</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">R$ 38.200/mês</p>
              <p className="text-xs text-emerald-500 mt-1">Economia estimada de 10.1%</p>
            </div>
            <div className="bg-[#EFF6FF] rounded-lg p-4 border border-blue-100">
              <p className="text-xs text-blue-600 font-medium">Estratégia Recomendada</p>
              <p className="text-sm font-semibold text-[#1B3A5C] mt-1">Manter regime atual e maximizar créditos de IBS na fase de transição.</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                <CheckCircle2 className="h-3 w-3" /> Oportunidade identificada
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
