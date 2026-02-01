import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  Radar,
  ShieldCheck,
  FileBarChart,
  Clock,
  CheckCircle2,
  Circle,
  Sparkles,
  RefreshCw,
} from "lucide-react";

type Variant = "empresa" | "autonomo" | "contador";

type ChecklistItem = {
  id: string;
  title: string;
  description: string;
};

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  {
    id: "mapear_receitas",
    title: "Mapear receitas e produtos",
    description: "Classifique receitas por tipo para simular impactos de IBS/CBS e créditos.",
  },
  {
    id: "rever_precificacao",
    title: "Rever precificação e margem",
    description: "Recalcule preço, margem e repasse para cenários 2026–2033.",
  },
  {
    id: "processos_credito",
    title: "Criar processo de créditos",
    description: "Defina rotina para apurar e aproveitar créditos (documentos, fornecedores, regras).",
  },
  {
    id: "sistemas_fiscal",
    title: "Ajustar ERP/fiscal",
    description: "Prepare sistemas para novas alíquotas, apurações e obrigações do período de transição.",
  },
];

function storageKey(userId: string) {
  return `reforma_radar_${userId}`;
}

export function ReformaRadar({ variant }: { variant: Variant }) {
  const { user, hasRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sector, setSector] = useState<string>("");
  const [taxRegime, setTaxRegime] = useState<string>("");
  const [monthlyRevenue, setMonthlyRevenue] = useState<string>("");

  const [done, setDone] = useState<Record<string, boolean>>({});

  const canPrefill = useMemo(() => {
    if (!user) return false;
    // Contador pode abrir, mas não tem dados próprios de empresa/autônomo normalmente
    if (hasRole("contador") && variant === "contador") return false;
    return true;
  }, [user, hasRole, variant]);

  useEffect(() => {
    if (!user) return;
    try {
      const raw = localStorage.getItem(storageKey(user.id));
      if (raw) setDone(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    try {
      localStorage.setItem(storageKey(user.id), JSON.stringify(done));
    } catch {
      // ignore
    }
  }, [done, user]);

  const prefill = async () => {
    if (!user || !canPrefill) return;
    setLoading(true);
    try {
      if (hasRole("autonomo")) {
        const { data } = await supabase
          .from("autonomo_profiles")
          .select("monthly_revenue_average_cents,current_regime,profession_category")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data) {
          const cents = data.monthly_revenue_average_cents ?? 0;
          setMonthlyRevenue(String(Math.round(cents / 100)));
          setTaxRegime((data.current_regime || "").toUpperCase());
          setSector(data.profession_category || "servicos");
        }
      } else {
        const { data } = await supabase
          .from("companies")
          .select("monthly_revenue_cents,tax_regime,sector")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data) {
          const cents = data.monthly_revenue_cents ?? 0;
          setMonthlyRevenue(String(Math.round(cents / 100)));
          setTaxRegime((data.tax_regime || "").replace(/_/g, " ").toUpperCase());
          setSector(data.sector || "");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Prefill automático (silencioso)
    void prefill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const checklistProgress = useMemo(() => {
    const total = DEFAULT_CHECKLIST.length;
    const completed = DEFAULT_CHECKLIST.filter((i) => done[i.id]).length;
    return { total, completed, pct: total ? Math.round((completed / total) * 100) : 0 };
  }, [done]);

  const insight = useMemo(() => {
    // Sem “chute” de alíquota específica por setor aqui; foco em orientação moderna e acionável.
    const rev = Number(monthlyRevenue || 0);
    const revBand = !rev
      ? ""
      : rev < 30000
        ? "(baixa complexidade)"
        : rev < 200000
          ? "(complexidade média)"
          : "(alta complexidade)";

    return {
      headline: "Radar Reforma 2026: do impacto ao plano de ação",
      sub:
        sector || taxRegime || monthlyRevenue
          ? `Perfil: ${sector || "setor n/d"} • ${taxRegime || "regime n/d"} • R$ ${monthlyRevenue || "0"}/mês ${revBand}`
          : "Preencha os dados para personalizar o radar.",
      next:
        !taxRegime
          ? "Defina o regime atual para gerar recomendações por prioridade."
          : "Comece pelo checklist e use a simulação de transição para validar decisões.",
    };
  }, [monthlyRevenue, sector, taxRegime]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Radar className="h-6 w-6 text-primary" />
            Radar Reforma
            <Badge className="bg-primary/15 text-primary border-primary/20" variant="outline">
              2026–2033
            </Badge>
          </h2>
          <p className="text-muted-foreground">{insight.sub}</p>
        </div>
        <Button variant="outline" onClick={prefill} disabled={loading} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Atualizar dados
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Perfil de impacto (rápido)
            </CardTitle>
            <CardDescription>
              Preencha (ou deixe o sistema pré-preencher) para orientar prioridades.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Setor</Label>
              <Input value={sector} onChange={(e) => setSector(e.target.value)} placeholder="ex: servicos, comercio..." />
            </div>
            <div className="space-y-2">
              <Label>Regime atual</Label>
              <Input value={taxRegime} onChange={(e) => setTaxRegime(e.target.value)} placeholder="ex: SIMPLES, LP..." />
            </div>
            <div className="space-y-2">
              <Label>Faturamento mensal (R$)</Label>
              <Input
                inputMode="numeric"
                value={monthlyRevenue}
                onChange={(e) => setMonthlyRevenue(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="ex: 50000"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Plano de ação
            </CardTitle>
            <CardDescription>{insight.next}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Checklist</span>
              <span className="text-sm font-semibold text-foreground">
                {checklistProgress.completed}/{checklistProgress.total} • {checklistProgress.pct}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${checklistProgress.pct}%` }}
                aria-label="Progresso do checklist"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Dica: combine este plano com o Simulador de Transição e a Timeline.
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileBarChart className="h-5 w-5 text-primary" />
              Checklist de adequação (moderno e prático)
            </CardTitle>
            <CardDescription>Marque o que já foi feito. Fica salvo só para sua conta neste dispositivo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {DEFAULT_CHECKLIST.map((item) => {
              const checked = !!done[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => setDone((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border transition-colors",
                    checked ? "bg-primary/5 border-primary/25" : "bg-card hover:bg-muted/40 border-border"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {checked ? (
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Próximos marcos
            </CardTitle>
            <CardDescription>Foco no que muda primeiro, sem ruído.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-lg bg-muted/40 border">
              <p className="text-sm font-semibold text-foreground">2026</p>
              <p className="text-sm text-muted-foreground">Início da transição: organização de dados e governança fiscal.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/40 border">
              <p className="text-sm font-semibold text-foreground">2027–2029</p>
              <p className="text-sm text-muted-foreground">Ajustes operacionais: precificação, crédito e rotinas de apuração.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/40 border">
              <p className="text-sm font-semibold text-foreground">2030–2033</p>
              <p className="text-sm text-muted-foreground">Convergência: consolidação do modelo e auditoria de resultados.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-xs text-muted-foreground">
        Observação: este radar é um hub de orientação e execução; os cálculos detalhados permanecem nas ferramentas (LC214/Transição).
      </div>
    </div>
  );
}

export default ReformaRadar;
