import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  FileText, Upload, CheckCircle2, AlertTriangle, Send,
  Building2, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

const solicitacoes = [
  { empresa: 'Tech Solutions Ltda', tipo: 'Folha Mensal', status: 'analisando', progresso: 65, inconsistencias: 3, data: '27/02/2026' },
  { empresa: 'Comércio Central ME', tipo: 'Folha + 13º', status: 'enviado_cartorio', progresso: 85, inconsistencias: 0, data: '26/02/2026' },
  { empresa: 'Indústria Alfa S/A', tipo: 'Rescisão', status: 'validado', progresso: 100, inconsistencias: 0, data: '25/02/2026' },
  { empresa: 'Saúde Prime Ltda', tipo: 'Folha Mensal', status: 'pendente', progresso: 20, inconsistencias: 5, data: '27/02/2026' },
  { empresa: 'Logística Express', tipo: 'Férias Coletivas', status: 'analisando', progresso: 45, inconsistencias: 2, data: '26/02/2026' },
];

const statusLabels: Record<string, { label: string; cls: string }> = {
  pendente: { label: 'Pendente', cls: 'bg-muted text-muted-foreground' },
  analisando: { label: 'Analisando', cls: 'bg-primary/10 text-primary' },
  enviado_cartorio: { label: 'Enviado ao Cartório', cls: 'bg-info/10 text-info' },
  validado: { label: 'Validado', cls: 'bg-success/10 text-success' },
  rejeitado: { label: 'Rejeitado', cls: 'bg-destructive/10 text-destructive' },
};

export default function SeracFolhaCartorio() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Folha & Cartório</h2>
          <p className="text-sm text-muted-foreground mt-1">Análise automatizada de folha e envio para validação cartorial</p>
        </div>
        <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
          <Upload className="h-4 w-4 mr-2" /> Enviar Nova Folha
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Folhas Processadas', value: '247', icon: FileText, cls: 'text-primary bg-primary/10' },
          { label: 'Inconsistências Detectadas', value: '18', icon: AlertTriangle, cls: 'text-destructive bg-destructive/10' },
          { label: 'Enviadas ao Cartório', value: '189', icon: Send, cls: 'text-info bg-info/10' },
          { label: 'Validadas', value: '172', icon: CheckCircle2, cls: 'text-success bg-success/10' },
        ].map((k) => (
          <Card key={k.label} className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2.5 rounded-lg", k.cls.split(' ')[1])}>
                <k.icon className={cn("h-5 w-5", k.cls.split(' ')[0])} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className={cn("text-lg font-bold", k.cls.split(' ')[0])}>{k.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Solicitações em Andamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {solicitacoes.map((s, i) => {
            const st = statusLabels[s.status] || statusLabels.pendente;
            return (
              <div key={i} className="p-4 rounded-lg border border-border hover:shadow-sm transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{s.empresa}</p>
                      <p className="text-xs text-muted-foreground">{s.tipo} • {s.data}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {s.inconsistencias > 0 && (
                      <Badge variant="destructive" className="text-[10px]">
                        <AlertTriangle className="h-3 w-3 mr-1" /> {s.inconsistencias} inconsist.
                      </Badge>
                    )}
                    <Badge className={cn("text-[10px] border-none", st.cls)}>{st.label}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={s.progresso} className="h-2 flex-1" />
                  <span className="text-xs font-mono text-muted-foreground w-10 text-right">{s.progresso}%</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
