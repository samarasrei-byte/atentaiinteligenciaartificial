import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GraduationCap, Calendar, Users, Star, Play, Award, Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mentorias = [
  { titulo: 'Masterclass Reforma Tributária 2026', mentor: 'Dr. Marcos Cintra', data: '05/03/2026', vagas: 12, inscritos: 48, tipo: 'Ao vivo', nivel: 'Avançado' },
  { titulo: 'Planejamento Tributário para Holdings', mentor: 'Dra. Ana Beatriz', data: '10/03/2026', vagas: 8, inscritos: 32, tipo: 'Ao vivo', nivel: 'Expert' },
  { titulo: 'Contabilidade para Cartórios', mentor: 'Carlos Figueiredo', data: '15/03/2026', vagas: 20, inscritos: 15, tipo: 'Online', nivel: 'Intermediário' },
  { titulo: 'IA Aplicada à Contabilidade', mentor: 'Equipe AtentAI', data: '20/03/2026', vagas: 30, inscritos: 28, tipo: 'Gravado', nivel: 'Básico' },
  { titulo: 'Compliance e SPED 2026', mentor: 'Paula Rezende', data: '25/03/2026', vagas: 15, inscritos: 11, tipo: 'Ao vivo', nivel: 'Intermediário' },
];

const ranking = [
  { nome: 'Dr. Marcos Lima', pontos: 4850, posicao: 1, certificados: 12 },
  { nome: 'Ana Beatriz Costa', pontos: 4200, posicao: 2, certificados: 10 },
  { nome: 'Carlos Figueiredo', pontos: 3900, posicao: 3, certificados: 9 },
  { nome: 'Paula Rezende', pontos: 3500, posicao: 4, certificados: 8 },
  { nome: 'Roberto Almeida', pontos: 3100, posicao: 5, certificados: 7 },
];

const nivelCls: Record<string, string> = {
  'Básico': 'bg-success/10 text-success',
  'Intermediário': 'bg-primary/10 text-primary',
  'Avançado': 'bg-accent/20 text-accent-foreground',
  'Expert': 'bg-destructive/10 text-destructive',
};

export default function SeracMentorias() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Clube SERAC — Mentorias & Capacitação</h2>
          <p className="text-sm text-muted-foreground mt-1">Programa de desenvolvimento para contadores e parceiros</p>
        </div>
        <Badge className="bg-accent/20 text-accent-foreground border-0">
          <Trophy className="h-3 w-3 mr-1" /> Gamificação Ativa
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Mentorias Ativas', value: '5', icon: GraduationCap, cls: 'text-primary bg-primary/10' },
          { label: 'Participantes', value: '134', icon: Users, cls: 'text-success bg-success/10' },
          { label: 'Certificados Emitidos', value: '89', icon: Award, cls: 'text-info bg-info/10' },
          { label: 'Nota Média', value: '4.8', icon: Star, cls: 'text-accent-foreground bg-accent/20' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Próximas Mentorias</h3>
          {mentorias.map((m, i) => (
            <Card key={i} className="border-border hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn("text-[10px] border-none", nivelCls[m.nivel])}>{m.nivel}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{m.tipo}</Badge>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{m.titulo}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">por {m.mentor}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {m.data}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {m.inscritos}/{m.vagas + m.inscritos} vagas</span>
                    </div>
                  </div>
                  <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                    <Play className="h-3 w-3 mr-1" /> Inscrever
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4 text-accent" /> Ranking de Engajamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ranking.map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  r.posicao <= 3 ? "bg-gradient-to-br from-accent to-accent/70 text-accent-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {r.posicao}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{r.nome}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{r.pontos.toLocaleString()} pts</span>
                    <span>•</span>
                    <span>{r.certificados} certificados</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
