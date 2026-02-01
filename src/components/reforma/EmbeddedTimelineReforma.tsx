import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Building2,
  User,
  Briefcase,
  FileText,
  TrendingUp,
  Bell,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TimelineEvent {
  date: string;
  year: number;
  title: string;
  description: string;
  details: string[];
  status: "completed" | "current" | "upcoming";
  impact: "high" | "medium" | "low";
  profiles: ("empresa" | "autonomo" | "contador")[];
  icon: React.ElementType;
}

const timelineEvents: TimelineEvent[] = [
  {
    date: "16 de Janeiro de 2025",
    year: 2025,
    title: "Publicação da LC 214/2025",
    description: "Lei Complementar que regulamenta a Reforma Tributária é sancionada",
    details: [
      "Define regras de IBS (estadual/municipal) e CBS (federal)",
      "Estabelece alíquota de referência entre 26,5% e 28%",
      "Cria o Imposto Seletivo sobre produtos específicos",
      "Define período de transição de 2026 a 2033"
    ],
    status: "completed",
    impact: "high",
    profiles: ["empresa", "autonomo", "contador"],
    icon: FileText
  },
  {
    date: "1º de Janeiro de 2026",
    year: 2026,
    title: "Início do Período de Teste",
    description: "Cobrança teste de CBS (0,9%) e IBS (0,1%) inicia",
    details: [
      "CBS federal: 0,9% sobre operações",
      "IBS estadual/municipal: 0,1% sobre operações",
      "PIS e COFINS continuam com alíquotas normais",
      "Empresas devem adaptar sistemas de nota fiscal"
    ],
    status: "upcoming",
    impact: "high",
    profiles: ["empresa", "autonomo", "contador"],
    icon: TrendingUp
  },
  {
    date: "1º de Janeiro de 2027",
    year: 2027,
    title: "Transição Gradual - Fase 2",
    description: "Aumento das alíquotas de IBS e CBS",
    details: [
      "CBS aumenta gradualmente",
      "IBS aumenta gradualmente",
      "Início da redução de PIS e COFINS",
      "Empresas devem calcular os dois sistemas em paralelo"
    ],
    status: "upcoming",
    impact: "high",
    profiles: ["empresa", "autonomo", "contador"],
    icon: TrendingUp
  },
  {
    date: "1º de Janeiro de 2029",
    year: 2029,
    title: "Extinção Total de PIS/COFINS",
    description: "PIS e COFINS são completamente extintos",
    details: [
      "CBS assume 100% da carga tributária federal sobre consumo",
      "Fim das obrigações acessórias de PIS/COFINS",
      "Créditos acumulados devem ser utilizados ou compensados"
    ],
    status: "upcoming",
    impact: "high",
    profiles: ["empresa", "autonomo", "contador"],
    icon: CheckCircle2
  },
  {
    date: "1º de Janeiro de 2033",
    year: 2033,
    title: "Extinção Total ICMS/ISS",
    description: "Sistema tributário novo entra em vigor pleno",
    details: [
      "IBS assume 100% da carga tributária estadual/municipal",
      "Fim definitivo de ICMS e ISS",
      "Alíquota plena de referência: 26,5% a 28%",
      "Sistema único simplificado em todo o país"
    ],
    status: "upcoming",
    impact: "high",
    profiles: ["empresa", "autonomo", "contador"],
    icon: Sparkles
  }
];

const profileInfo = {
  empresa: {
    icon: Building2,
    title: "Para Empresas",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30"
  },
  autonomo: {
    icon: User,
    title: "Para Autônomos",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30"
  },
  contador: {
    icon: Briefcase,
    title: "Para Contadores",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30"
  }
};

function calculateDaysUntil(dateString: string): number {
  const eventDate = new Date(dateString.replace(/(\d+)º? de (\w+) de (\d+)/, (_, day, month, year) => {
    const months: Record<string, string> = {
      "Janeiro": "01", "Fevereiro": "02", "Março": "03", "Abril": "04",
      "Maio": "05", "Junho": "06", "Julho": "07", "Agosto": "08",
      "Setembro": "09", "Outubro": "10", "Novembro": "11", "Dezembro": "12"
    };
    return `${year}-${months[month]}-${day.padStart(2, "0")}`;
  }));
  const today = new Date();
  const diffTime = eventDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

interface EmbeddedTimelineReformaProps {
  variant?: 'empresa' | 'autonomo' | 'contador';
}

export const EmbeddedTimelineReforma: React.FC<EmbeddedTimelineReformaProps> = ({ variant }) => {
  const [selectedProfile, setSelectedProfile] = useState<"all" | "empresa" | "autonomo" | "contador">(
    variant || "all"
  );

  const filteredEvents = selectedProfile === "all" 
    ? timelineEvents 
    : timelineEvents.filter(event => event.profiles.includes(selectedProfile));

  const nextEvent = timelineEvents.find(e => e.status === "upcoming");
  const daysUntilNext = nextEvent ? calculateDaysUntil(nextEvent.date) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Timeline da Reforma Tributária</h2>
        </div>
        <p className="text-muted-foreground">
          Acompanhe todas as datas importantes da transição tributária brasileira
        </p>
      </div>

      {/* Countdown Card */}
      {nextEvent && daysUntilNext > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Próximo evento importante</p>
                <p className="font-semibold text-foreground">{nextEvent.title}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">{daysUntilNext}</p>
                <p className="text-sm text-muted-foreground">dias restantes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Filter */}
      {!variant && (
        <Tabs value={selectedProfile} onValueChange={(v) => setSelectedProfile(v as typeof selectedProfile)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="empresa" className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Empresas</span>
            </TabsTrigger>
            <TabsTrigger value="autonomo" className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Autônomos</span>
            </TabsTrigger>
            <TabsTrigger value="contador" className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Contadores</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-6">
          {filteredEvents.map((event) => {
            const IconComponent = event.icon;
            const daysUntil = calculateDaysUntil(event.date);
            
            return (
              <div key={event.title} className="relative flex items-start pl-12">
                {/* Timeline Node */}
                <div className={cn(
                  "absolute left-0 w-8 h-8 rounded-full flex items-center justify-center z-10",
                  event.status === "completed" ? "bg-primary text-primary-foreground" :
                  event.status === "current" ? "bg-accent text-accent-foreground animate-pulse" :
                  "bg-muted text-muted-foreground"
                )}>
                  <IconComponent className="w-4 h-4" />
                </div>

                {/* Content Card */}
                <Card className={cn(
                  "flex-1",
                  event.status === "completed" && "opacity-75",
                  event.impact === "high" && event.status === "upcoming" && "border-primary/50"
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {event.date}
                        </CardDescription>
                        <CardTitle className="text-lg mt-1">{event.title}</CardTitle>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {event.status === "completed" && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Concluído
                          </Badge>
                        )}
                        {event.status === "upcoming" && daysUntil > 0 && daysUntil <= 365 && (
                          <Badge variant="destructive">
                            <Clock className="w-3 h-3 mr-1" />
                            {daysUntil} dias
                          </Badge>
                        )}
                        {event.impact === "high" && event.status === "upcoming" && (
                          <Badge variant="outline" className="border-destructive text-destructive">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Alto Impacto
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{event.description}</p>
                    <ul className="space-y-2">
                      {event.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Profile Tags */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                      {event.profiles.map(profile => {
                        const info = profileInfo[profile];
                        return (
                          <Badge 
                            key={profile} 
                            variant="outline" 
                            className={cn("text-xs", info.borderColor, info.color)}
                          >
                            {info.title.replace("Para ", "")}
                          </Badge>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legal Disclaimer */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Aviso Legal</p>
              <p>
                Informações baseadas na EC 132/2023 e LC 214/2025. 
                Datas e alíquotas podem sofrer alterações conforme regulamentação adicional.
                Não substitui consultoria contábil profissional.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmbeddedTimelineReforma;
