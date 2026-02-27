import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';

const complianceItems = [
  { area: 'Obrigações Acessórias', status: 'ok', progresso: 95, pendencias: 2 },
  { area: 'SPED Fiscal', status: 'warning', progresso: 78, pendencias: 8 },
  { area: 'EFD-Contribuições', status: 'ok', progresso: 100, pendencias: 0 },
  { area: 'DCTF', status: 'alert', progresso: 45, pendencias: 15 },
  { area: 'ECF', status: 'ok', progresso: 90, pendencias: 3 },
  { area: 'ECD', status: 'warning', progresso: 72, pendencias: 6 },
];

const riscos = [
  { desc: 'Divergência SPED x EFD em 3 clientes', nivel: 'alto', prazo: '5 dias' },
  { desc: 'DCTF com pendência de retificação', nivel: 'medio', prazo: '15 dias' },
  { desc: 'Certidão negativa próxima do vencimento', nivel: 'alto', prazo: '3 dias' },
  { desc: 'Inconsistência de NCM em notas fiscais', nivel: 'baixo', prazo: '30 dias' },
];

export default function SeracCompliance() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1B3A5C]">Compliance & Risco</h2>
        <p className="text-sm text-[#6B7280] mt-1">Monitoramento de conformidade fiscal da carteira</p>
      </div>

      {/* Score geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-[#E5E7EB] bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-100"><CheckCircle2 className="h-6 w-6 text-emerald-600" /></div>
            <div>
              <p className="text-xs text-[#6B7280]">Score de Compliance</p>
              <p className="text-3xl font-bold text-emerald-600">82%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E5E7EB] bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-100"><AlertTriangle className="h-6 w-6 text-amber-600" /></div>
            <div>
              <p className="text-xs text-[#6B7280]">Pendências Ativas</p>
              <p className="text-3xl font-bold text-amber-600">34</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E5E7EB] bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-100"><XCircle className="h-6 w-6 text-red-600" /></div>
            <div>
              <p className="text-xs text-[#6B7280]">Riscos Críticos</p>
              <p className="text-3xl font-bold text-red-600">4</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance areas */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#1B3A5C] flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Áreas de Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {complianceItems.map((c, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-40 text-sm font-medium text-[#4B5563]">{c.area}</div>
              <div className="flex-1">
                <Progress value={c.progresso} className="h-2" />
              </div>
              <span className="text-sm font-mono font-semibold text-[#1B3A5C] w-12 text-right">{c.progresso}%</span>
              <Badge variant={c.status === 'ok' ? 'default' : c.status === 'warning' ? 'secondary' : 'destructive'} className="text-[10px] w-16 justify-center">
                {c.pendencias} pend.
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Riscos */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#1B3A5C] flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Riscos Identificados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {riscos.map((r, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <Badge variant={r.nivel === 'alto' ? 'destructive' : r.nivel === 'medio' ? 'default' : 'secondary'} className="text-[10px]">
                  {r.nivel.toUpperCase()}
                </Badge>
                <p className="text-sm text-[#4B5563]">{r.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                <Clock className="h-3 w-3" /> {r.prazo}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
