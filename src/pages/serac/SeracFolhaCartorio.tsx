import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  FileText, Upload, CheckCircle2, AlertTriangle, Clock, Send,
  Building2, Users, Search, BarChart3
} from 'lucide-react';

const solicitacoes = [
  { empresa: 'Tech Solutions Ltda', tipo: 'Folha Mensal', status: 'analisando', progresso: 65, inconsistencias: 3, data: '27/02/2026' },
  { empresa: 'Comércio Central ME', tipo: 'Folha + 13º', status: 'enviado_cartorio', progresso: 85, inconsistencias: 0, data: '26/02/2026' },
  { empresa: 'Indústria Alfa S/A', tipo: 'Rescisão', status: 'validado', progresso: 100, inconsistencias: 0, data: '25/02/2026' },
  { empresa: 'Saúde Prime Ltda', tipo: 'Folha Mensal', status: 'pendente', progresso: 20, inconsistencias: 5, data: '27/02/2026' },
  { empresa: 'Logística Express', tipo: 'Férias Coletivas', status: 'analisando', progresso: 45, inconsistencias: 2, data: '26/02/2026' },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: '#6B7280' },
  analisando: { label: 'Analisando', color: '#2563EB' },
  enviado_cartorio: { label: 'Enviado ao Cartório', color: '#7C3AED' },
  validado: { label: 'Validado', color: '#059669' },
  rejeitado: { label: 'Rejeitado', color: '#DC2626' },
};

export default function SeracFolhaCartorio() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1B3A5C]">Folha & Cartório</h2>
          <p className="text-sm text-[#6B7280] mt-1">Análise automatizada de folha e envio para validação cartorial</p>
        </div>
        <Button className="bg-[#1B3A5C] hover:bg-[#1B3A5C]/90 text-white">
          <Upload className="h-4 w-4 mr-2" /> Enviar Nova Folha
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Folhas Processadas', value: '247', icon: FileText, color: '#2563EB' },
          { label: 'Inconsistências Detectadas', value: '18', icon: AlertTriangle, color: '#DC2626' },
          { label: 'Enviadas ao Cartório', value: '189', icon: Send, color: '#7C3AED' },
          { label: 'Validadas', value: '172', icon: CheckCircle2, color: '#059669' },
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

      {/* Solicitações */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#1B3A5C] flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Solicitações em Andamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {solicitacoes.map((s, i) => {
            const st = statusLabels[s.status] || statusLabels.pendente;
            return (
              <div key={i} className="p-4 rounded-lg border border-[#E5E7EB] hover:shadow-sm transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1B3A5C]/5 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-[#1B3A5C]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1B3A5C]">{s.empresa}</p>
                      <p className="text-xs text-[#6B7280]">{s.tipo} • {s.data}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {s.inconsistencias > 0 && (
                      <Badge variant="destructive" className="text-[10px]">
                        <AlertTriangle className="h-3 w-3 mr-1" /> {s.inconsistencias} inconsist.
                      </Badge>
                    )}
                    <Badge className="text-[10px]" style={{ backgroundColor: `${st.color}15`, color: st.color, border: 'none' }}>
                      {st.label}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={s.progresso} className="h-2 flex-1" />
                  <span className="text-xs font-mono text-[#6B7280] w-10 text-right">{s.progresso}%</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
