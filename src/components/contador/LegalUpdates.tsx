import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Scale,
  Bell,
  Search,
  ExternalLink,
  Clock,
  CheckCircle,
  BookOpen,
  Filter,
  Volume2,
  VolumeX,
  Calendar,
  AlertTriangle,
  TrendingUp,
  FileText,
  Crown,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PLANS } from "@/lib/plans";
import { useNavigate } from "react-router-dom";

interface LegalUpdate {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  source: string;
  sourceUrl?: string;
  impact: "alto" | "medio" | "baixo";
  isRead: boolean;
}

const mockUpdates: LegalUpdate[] = [
  {
    id: "1",
    title: "Lei Complementar 214/2025 - Regulamentação do IBS e CBS",
    summary: "Publicada a lei que regulamenta o IBS e CBS. Define alíquotas de referência, regras de transição, créditos e obrigações acessórias. Contadores devem se preparar para as mudanças que começam em 2026.",
    category: "Reforma Tributária",
    date: "2025-01-15",
    source: "Diário Oficial da União",
    sourceUrl: "https://www.planalto.gov.br",
    impact: "alto",
    isRead: false,
  },
  {
    id: "2",
    title: "IN RFB 2.237/2024 - Declaração do IBS/CBS",
    summary: "Nova instrução normativa estabelece o modelo de declaração unificada para IBS e CBS. Prazo de entrega será mensal, até o dia 25 do mês seguinte. Implementação gradual a partir de julho/2026.",
    category: "Obrigações Acessórias",
    date: "2024-12-20",
    source: "Receita Federal",
    sourceUrl: "https://www.gov.br/receitafederal",
    impact: "alto",
    isRead: true,
  },
  {
    id: "3",
    title: "Resolução CGSN 175/2024 - Simples Nacional na Reforma",
    summary: "Define como empresas do Simples Nacional serão tratadas no novo sistema. Mantém opção pelo regime simplificado, mas com ajustes nas alíquotas e forma de cálculo do IBS/CBS dentro do DAS.",
    category: "Simples Nacional",
    date: "2024-12-18",
    source: "CGSN",
    impact: "medio",
    isRead: false,
  },
  {
    id: "4",
    title: "Portaria MF 1.892/2024 - Cashback Tributário",
    summary: "Regulamenta o mecanismo de devolução de impostos para famílias de baixa renda. Define procedimentos, percentuais e prazos para operacionalização do cashback previsto na reforma tributária.",
    category: "Benefícios Fiscais",
    date: "2024-12-15",
    source: "Ministério da Fazenda",
    sourceUrl: "https://www.gov.br/fazenda",
    impact: "medio",
    isRead: true,
  },
  {
    id: "5",
    title: "Decreto 12.456/2024 - Imposto Seletivo sobre Bebidas",
    summary: "Estabelece alíquotas e regras do Imposto Seletivo sobre bebidas açucaradas e alcoólicas. Vigência a partir de janeiro/2027. Impacto significativo para indústria de bebidas.",
    category: "Imposto Seletivo",
    date: "2024-12-10",
    source: "Presidência da República",
    impact: "alto",
    isRead: false,
  },
  {
    id: "6",
    title: "Convênio ICMS 200/2024 - Transição ICMS para IBS",
    summary: "Define cronograma detalhado de redução do ICMS durante período de transição (2026-2032). Estabelece procedimentos para aproveitamento de créditos acumulados.",
    category: "Reforma Tributária",
    date: "2024-12-05",
    source: "CONFAZ",
    impact: "alto",
    isRead: true,
  },
  {
    id: "7",
    title: "Ato Declaratório 45/2024 - Profissionais Liberais",
    summary: "Esclarece tratamento tributário de profissionais liberais (advogados, médicos, engenheiros, contadores) no novo sistema. Confirma redução de 30% na alíquota padrão para essas atividades.",
    category: "Profissionais Liberais",
    date: "2024-12-01",
    source: "Receita Federal",
    impact: "medio",
    isRead: false,
  },
  {
    id: "8",
    title: "Lei 15.234/2024 - Split Payment Obrigatório",
    summary: "Torna obrigatório o split payment (divisão automática do pagamento) para operações acima de R$ 5.000. Bancos e fintechs devem se adaptar até dezembro/2026.",
    category: "Pagamentos",
    date: "2024-11-28",
    source: "Congresso Nacional",
    impact: "alto",
    isRead: true,
  },
];

const categories = [
  "Todos",
  "Reforma Tributária",
  "Obrigações Acessórias",
  "Simples Nacional",
  "Benefícios Fiscais",
  "Imposto Seletivo",
  "Profissionais Liberais",
  "Pagamentos",
];

interface Props {
  // Removed trial props - not used anymore
}

export function LegalUpdates({}: Props) {
  const { toast } = useToast();
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const [updates, setUpdates] = useState<LegalUpdate[]>(mockUpdates);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [impactFilter, setImpactFilter] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setSpeechSupported(false);
    }
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSubscribePremium = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para assinar o plano premium",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsLoadingSubscription(true);
    try {
      navigate("/pricing");
      return;
    } catch (error: any) {
      console.error("Erro ao criar checkout:", error);
      toast({
        title: "Erro ao processar",
        description: error.message || "Não foi possível iniciar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  // Check if user already has contador subscription
  const hasContadorPlan = subscription.subscribed && subscription.plan === "contador";

  const filteredUpdates = updates.filter((update) => {
    const matchesSearch =
      update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todos" || update.category === selectedCategory;
    const matchesImpact = !impactFilter || update.impact === impactFilter;
    return matchesSearch && matchesCategory && matchesImpact;
  });

  const unreadCount = updates.filter((u) => !u.isRead).length;

  const markAsRead = (id: string) => {
    setUpdates((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isRead: true } : u))
    );
  };

  const markAllAsRead = () => {
    setUpdates((prev) => prev.map((u) => ({ ...u, isRead: true })));
    toast({ title: "Todas as atualizações marcadas como lidas" });
  };

  const speakText = (text: string, id: string) => {
    if (!speechSupported) return;

    if (currentSpeakingId === id && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.9;

    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find((v) => v.lang.includes("pt"));
    if (ptVoice) utterance.voice = ptVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentSpeakingId(id);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const getImpactBadge = (impact: string) => {
    const config: Record<string, { class: string; label: string }> = {
      alto: { class: "bg-red-500/10 text-red-500 border-red-500/30", label: "Alto Impacto" },
      medio: { class: "bg-amber-500/10 text-amber-500 border-amber-500/30", label: "Médio Impacto" },
      baixo: { class: "bg-green-500/10 text-green-500 border-green-500/30", label: "Baixo Impacto" },
    };
    const cfg = config[impact] || config.baixo;
    return <Badge variant="outline" className={cfg.class}>{cfg.label}</Badge>;
  };

  return (
    <div className="space-y-6">
{/* Subscription Status Banner */}
      {!hasContadorPlan && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-full">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Assine para acesso completo
                </p>
                <p className="text-sm text-muted-foreground">
                  Tenha acesso a todas as atualizações legais e recursos premium
                </p>
              </div>
            </div>
            <Button 
              onClick={handleSubscribePremium}
              disabled={isLoadingSubscription}
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
            >
              {isLoadingSubscription ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Crown className="h-4 w-4 mr-2" />
              )}
              Ver Planos
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Premium Active Banner */}
      {hasContadorPlan && (
        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-green-500/20 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Plano Contador Premium Ativo
              </p>
              <p className="text-sm text-muted-foreground">
                Você tem acesso completo a todas as atualizações legais
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{updates.length}</p>
              <p className="text-xs text-muted-foreground">Atualizações</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Bell className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{unreadCount}</p>
              <p className="text-xs text-muted-foreground">Não lidas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {updates.filter((u) => u.impact === "alto").length}
              </p>
              <p className="text-xs text-muted-foreground">Alto Impacto</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">2026</p>
              <p className="text-xs text-muted-foreground">Início Reforma</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar atualizações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={impactFilter === "alto" ? "default" : "outline"}
                size="sm"
                onClick={() => setImpactFilter(impactFilter === "alto" ? null : "alto")}
                className="text-xs"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Alto Impacto
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Marcar todas como lidas
              </Button>
            </div>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-xs"
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Updates List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-4 pr-4">
          {filteredUpdates.map((update) => (
            <Card
              key={update.id}
              className={`transition-all ${
                !update.isRead
                  ? "border-primary/50 bg-primary/5"
                  : "bg-card"
              }`}
              onClick={() => markAsRead(update.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {!update.isRead && (
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {update.category}
                      </Badge>
                      {getImpactBadge(update.impact)}
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {update.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {update.summary}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(update.date).toLocaleDateString("pt-BR")}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {update.source}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(`${update.title}. ${update.summary}`, update.id);
                      }}
                      disabled={!speechSupported}
                      className={
                        currentSpeakingId === update.id && isSpeaking
                          ? "text-primary"
                          : ""
                      }
                    >
                      {currentSpeakingId === update.id && isSpeaking ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    {update.sourceUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(update.sourceUrl, "_blank");
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredUpdates.length === 0 && (
            <div className="text-center py-12">
              <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">
                Nenhuma atualização encontrada
              </p>
              <p className="text-muted-foreground">
                Tente ajustar os filtros de busca
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
