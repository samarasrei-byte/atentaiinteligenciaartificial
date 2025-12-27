import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

/**
 * Cronograma de transição tributária conforme LC 214/2025
 * IBS (estadual/municipal) + CBS (federal) substituindo tributos atuais
 */
const TRANSITION_SCHEDULE = [
  {
    year: 2026,
    phase: "Teste",
    ibs: 0.1,
    cbs: 0.9,
    total: 1.0,
    description: "Fase de teste. Tributos atuais permanecem iguais, IBS/CBS coletados para calibragem.",
    status: "upcoming",
  },
  {
    year: 2027,
    phase: "Teste",
    ibs: 0.1,
    cbs: 0.9,
    total: 1.0,
    description: "Continuação da fase de teste com ajustes de sistema.",
    status: "upcoming",
  },
  {
    year: 2028,
    phase: "Teste",
    ibs: 0.1,
    cbs: 0.9,
    total: 1.0,
    description: "Último ano de teste antes da transição efetiva.",
    status: "upcoming",
  },
  {
    year: 2029,
    phase: "Transição 10%",
    ibs: 1.77,
    cbs: 0.88,
    total: 2.65,
    description: "Início da extinção gradual de PIS, COFINS, ICMS e ISS.",
    status: "upcoming",
  },
  {
    year: 2030,
    phase: "Transição 20%",
    ibs: 3.54,
    cbs: 1.76,
    total: 5.30,
    description: "Redução de 20% nos tributos atuais substituídos por IBS/CBS.",
    status: "upcoming",
  },
  {
    year: 2031,
    phase: "Transição 40%",
    ibs: 7.08,
    cbs: 3.52,
    total: 10.60,
    description: "Redução de 40% nos tributos atuais.",
    status: "upcoming",
  },
  {
    year: 2032,
    phase: "Transição 70%",
    ibs: 12.39,
    cbs: 6.16,
    total: 18.55,
    description: "Redução de 70% nos tributos atuais.",
    status: "upcoming",
  },
  {
    year: 2033,
    phase: "Definitivo",
    ibs: 17.7,
    cbs: 8.8,
    total: 26.5,
    description: "Extinção completa de PIS, COFINS, ICMS e ISS. Novo sistema em vigor pleno.",
    status: "final",
  },
];

interface TaxTransitionTimelineProps {
  compact?: boolean;
}

export function TaxTransitionTimeline({ compact = false }: TaxTransitionTimelineProps) {
  const currentYear = new Date().getFullYear();

  const getStatusIcon = (status: string, year: number) => {
    if (year < currentYear) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (year === currentYear) return <TrendingUp className="h-4 w-4 text-primary animate-pulse" />;
    if (status === "final") return <CheckCircle2 className="h-4 w-4 text-primary" />;
    return <CalendarDays className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusBadge = (status: string, year: number) => {
    if (year < currentYear) return <Badge variant="secondary">Concluído</Badge>;
    if (year === currentYear) return <Badge className="bg-primary">Atual</Badge>;
    if (status === "final") return <Badge variant="outline" className="border-primary text-primary">Definitivo</Badge>;
    return <Badge variant="outline">Futuro</Badge>;
  };

  if (compact) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Transição Tributária Gradual (2026-2033)
              </p>
              <p className="text-xs text-muted-foreground">
                As alíquotas do novo sistema (IBS + CBS) entram em vigor progressivamente: 
                1% em 2026-2028 (teste), 10% em 2029, 20% em 2030, 40% em 2031, 70% em 2032, 
                e 100% (26,5%) em 2033. Os valores simulados consideram o regime definitivo.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="text-xs">2026: 1%</Badge>
                <Badge variant="outline" className="text-xs">2029: 2,65%</Badge>
                <Badge variant="outline" className="text-xs">2031: 10,6%</Badge>
                <Badge variant="outline" className="text-xs border-primary text-primary">2033: 26,5%</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Cronograma de Transição Tributária
        </CardTitle>
        <CardDescription>
          Implementação gradual do IBS + CBS conforme LC 214/2025 (Reforma Tributária)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="space-y-4">
            {TRANSITION_SCHEDULE.map((item, index) => (
              <div key={item.year} className="relative pl-10">
                {/* Timeline dot */}
                <div 
                  className={`absolute left-2.5 w-3 h-3 rounded-full border-2 ${
                    item.year < currentYear 
                      ? "bg-green-500 border-green-500" 
                      : item.year === currentYear 
                        ? "bg-primary border-primary animate-pulse" 
                        : item.status === "final"
                          ? "bg-primary/20 border-primary"
                          : "bg-background border-border"
                  }`}
                />
                
                <div className={`p-3 rounded-lg border ${
                  item.year === currentYear 
                    ? "border-primary bg-primary/5" 
                    : item.status === "final"
                      ? "border-primary/50 bg-primary/5"
                      : "border-border bg-card"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status, item.year)}
                      <span className="font-bold text-lg">{item.year}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{item.phase}</span>
                    </div>
                    {getStatusBadge(item.status, item.year)}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="text-center p-2 rounded bg-muted/50">
                      <div className="text-xs text-muted-foreground">IBS</div>
                      <div className="font-semibold text-blue-600 dark:text-blue-400">{item.ibs}%</div>
                    </div>
                    <div className="text-center p-2 rounded bg-muted/50">
                      <div className="text-xs text-muted-foreground">CBS</div>
                      <div className="font-semibold text-green-600 dark:text-green-400">{item.cbs}%</div>
                    </div>
                    <div className="text-center p-2 rounded bg-primary/10">
                      <div className="text-xs text-muted-foreground">Total</div>
                      <div className="font-bold text-primary">{item.total}%</div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-amber-700 dark:text-amber-400">Importante:</strong> Os simuladores mostram 
              o cenário do regime definitivo (2033). Durante a transição, a carga tributária efetiva 
              será proporcional ao percentual implementado em cada ano.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TransitionDisclaimer() {
  return (
    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          <strong className="text-amber-700 dark:text-amber-400">Transição gradual:</strong> As alíquotas 
          do novo sistema (IBS + CBS = 26,5%) entram em vigor progressivamente de 2026 a 2033. 
          Os valores simulados consideram o regime definitivo. 
          <span className="text-foreground"> LC 214/2025.</span>
        </p>
      </div>
    </div>
  );
}
