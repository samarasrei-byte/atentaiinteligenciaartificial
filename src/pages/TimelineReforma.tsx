import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Download,
  Share2,
  Sparkles
} from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
    date: "31 de Dezembro de 2026",
    year: 2026,
    title: "Fim do Período de Teste",
    description: "Encerramento da fase inicial de transição",
    details: [
      "Avaliação dos resultados do período de teste",
      "Ajustes nas alíquotas se necessário",
      "Preparação para aumento gradual em 2027"
    ],
    status: "upcoming",
    impact: "medium",
    profiles: ["empresa", "contador"],
    icon: Clock
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
    date: "1º de Janeiro de 2028",
    year: 2028,
    title: "Início da Extinção de ICMS/ISS",
    description: "Redução progressiva de ICMS e ISS começa",
    details: [
      "ICMS estadual inicia redução de 10% ao ano",
      "ISS municipal inicia redução de 10% ao ano",
      "IBS e CBS aumentam proporcionalmente",
      "Sistema híbrido complexo exige atenção redobrada"
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
    description: "MEI, ME, LTDA, EPP e mais",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30"
  },
  autonomo: {
    icon: User,
    title: "Para Autônomos",
    description: "Profissionais liberais e freelancers",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30"
  },
  contador: {
    icon: Briefcase,
    title: "Para Contadores",
    description: "Profissionais da contabilidade",
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

export default function TimelineReforma() {
  const [selectedProfile, setSelectedProfile] = useState<"all" | "empresa" | "autonomo" | "contador">("all");
  const { permission, requestPermission } = usePushNotifications();
  const navigate = useNavigate();

  const filteredEvents = selectedProfile === "all" 
    ? timelineEvents 
    : timelineEvents.filter(event => event.profiles.includes(selectedProfile));

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success("Você será notificado sobre os prazos da Reforma Tributária!");
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Timeline da Reforma Tributária LC 214/2025",
          text: "Confira todas as datas importantes da Reforma Tributária brasileira",
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copiado para a área de transferência!");
      }
    } catch {
      toast.error("Não foi possível compartilhar");
    }
  };

  const handleNavigate = (section: string) => {
    navigate(`/#${section}`);
  };

  const nextEvent = timelineEvents.find(e => e.status === "upcoming");
  const daysUntilNext = nextEvent ? calculateDaysUntil(nextEvent.date) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={handleNavigate} />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-4">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">Lei Complementar 214/2025</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Timeline da{" "}
            <span className="text-primary">Reforma Tributária</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Acompanhe todas as datas importantes da transição tributária brasileira, 
            de 2025 a 2033.
          </p>

          {/* Countdown Card */}
          {nextEvent && daysUntilNext > 0 && (
            <Card className="max-w-md mx-auto mb-8 border-primary/30 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/20">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm text-muted-foreground">Próximo evento</p>
                    <p className="font-semibold text-foreground">{nextEvent.title}</p>
                    <p className="text-2xl font-bold text-primary">
                      {daysUntilNext} dias
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {permission.status !== "granted" && permission.isSupported && (
              <Button onClick={handleEnableNotifications} variant="default">
                <Bell className="w-4 h-4 mr-2" />
                Ativar Alertas
              </Button>
            )}
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
            <Button variant="outline" asChild>
              <Link to="/ferramentas-lc214">
                <Download className="w-4 h-4 mr-2" />
                Ferramentas LC 214
              </Link>
            </Button>
          </div>
        </section>

        {/* Profile Filter */}
        <section className="mb-8">
          <Tabs value={selectedProfile} onValueChange={(v) => setSelectedProfile(v as typeof selectedProfile)}>
            <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="empresa" className="flex items-center gap-1">
                <Building2 className="w-4 h-4 hidden sm:block" />
                Empresas
              </TabsTrigger>
              <TabsTrigger value="autonomo" className="flex items-center gap-1">
                <User className="w-4 h-4 hidden sm:block" />
                Autônomos
              </TabsTrigger>
              <TabsTrigger value="contador" className="flex items-center gap-1">
                <Briefcase className="w-4 h-4 hidden sm:block" />
                Contadores
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedProfile} className="mt-8">
              {/* Profile Info Card */}
              {selectedProfile !== "all" && (
                <Card className={cn(
                  "mb-8 max-w-2xl mx-auto",
                  profileInfo[selectedProfile].borderColor,
                  profileInfo[selectedProfile].bgColor
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={cn("p-3 rounded-full", profileInfo[selectedProfile].bgColor)}>
                        {(() => {
                          const IconComponent = profileInfo[selectedProfile].icon;
                          return <IconComponent className={cn("w-6 h-6", profileInfo[selectedProfile].color)} />;
                        })()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {profileInfo[selectedProfile].title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {profileInfo[selectedProfile].description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Timeline */}
              <div className="relative max-w-4xl mx-auto">
                {/* Vertical Line */}
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-1/2" />

                {filteredEvents.map((event, index) => {
                  const isLeft = index % 2 === 0;
                  const IconComponent = event.icon;
                  const daysUntil = calculateDaysUntil(event.date);
                  
                  return (
                    <div
                      key={event.title}
                      className={cn(
                        "relative flex items-start mb-8 md:mb-12",
                        "pl-12 md:pl-0",
                        isLeft ? "md:flex-row" : "md:flex-row-reverse"
                      )}
                    >
                      {/* Timeline Node */}
                      <div className={cn(
                        "absolute left-0 md:left-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10 md:-translate-x-1/2",
                        event.status === "completed" ? "bg-primary text-primary-foreground" :
                        event.status === "current" ? "bg-accent text-accent-foreground animate-pulse" :
                        "bg-muted text-muted-foreground"
                      )}>
                        <IconComponent className="w-4 h-4" />
                      </div>

                      {/* Content Card */}
                      <Card className={cn(
                        "w-full md:w-[calc(50%-2rem)]",
                        event.status === "completed" && "opacity-75",
                        event.impact === "high" && event.status === "upcoming" && "border-destructive/50"
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
                            <div className="flex gap-2">
                              {event.status === "completed" && (
                                <Badge variant="secondary" className="bg-primary/10 text-primary">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Concluído
                                </Badge>
                              )}
                              {event.status === "upcoming" && daysUntil > 0 && daysUntil <= 365 && (
                                <Badge variant="destructive" className="animate-pulse">
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
            </TabsContent>
          </Tabs>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12 px-4 bg-primary/5 rounded-2xl">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Prepare-se para a Reforma Tributária
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Use nossas ferramentas de simulação para entender o impacto na sua empresa ou atividade.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/simulador">
                <TrendingUp className="w-5 h-5 mr-2" />
                Simular Impacto
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/contadores-publico">
                <Briefcase className="w-5 h-5 mr-2" />
                Falar com Contador
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
