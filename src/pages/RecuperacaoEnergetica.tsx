import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Scale, ShieldCheck, Clock, Building2, Users, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const BRL = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default function RecuperacaoEnergetica() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [monthlyBill, setMonthlyBill] = useState<string>("");
  const [months, setMonths] = useState<string>("120");
  const [clientType, setClientType] = useState<"pf" | "pj">("pj");
  const [name, setName] = useState(user?.user_metadata?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const estimated = useMemo(() => {
    const bill = Number(monthlyBill.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
    const m = Number(months) || 0;
    // ~28% da conta corresponde a TUSD/TE-ICMS recuperável em média
    const recoveryCents = Math.round(bill * 100 * 0.28 * m);
    return recoveryCents;
  }, [monthlyBill, months]);

  const canSimulate = Number(monthlyBill) > 0;
  const meetsMinimum = estimated >= 15000; // R$ 150 mínimo

  const submit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast({ title: "Preencha nome, e-mail e WhatsApp", variant: "destructive" });
      return;
    }
    if (!meetsMinimum) {
      toast({ title: "Valor mínimo não atingido", description: "A recuperação estimada precisa ser ≥ R$ 150." , variant: "destructive"});
      return;
    }
    setSaving(true);
    const bill = Number(monthlyBill.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
    const { error } = await supabase.from("energy_recovery_requests").insert({
      user_id: user?.id ?? null,
      full_name: name,
      email,
      phone,
      client_type: clientType,
      monthly_bill_cents: Math.round(bill * 100),
      months_estimated: Number(months),
      estimated_recovery_cents: estimated,
      status: "pending",
      approval_stage: "new_lead",
    });
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Solicitação enviada!", description: "Nosso parceiro vai analisar em até 24h." });
    setMonthlyBill(""); setPhone("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Recuperação Fiscal Energética — ICMS Indevido | AtentAI</title>
        <meta name="description" content="Devolução de ICMS indevido cobrado na conta de luz. STF já decidiu. 100% administrativo, retroativo até 10 anos, sem risco jurídico." />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <Badge variant="outline" className="mb-4 border-primary/40 text-primary"><Sparkles className="mr-1 h-3 w-3" /> Decisão STF confirmada</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Recuperação Fiscal <span className="text-primary">Energética</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Devolução de ICMS indevido cobrado na sua conta de luz, com base na decisão já confirmada pelo Supremo Tribunal Federal.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, t: "100% administrativo", d: "Sem tese em discussão" },
              { icon: Clock, t: "Retroativo até 10 anos", d: "Recupere o passado" },
              { icon: Building2, t: "PJ e PF", d: "Extensível a colaboradores" },
              { icon: Scale, t: "Sem risco jurídico", d: "Base em decisão do STF" },
            ].map((b) => (
              <div key={b.t} className="rounded-xl border border-border bg-card p-4">
                <b.icon className="h-5 w-5 text-primary mb-2" />
                <p className="text-sm font-semibold">{b.t}</p>
                <p className="text-xs text-muted-foreground">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simulator */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /> Simulador de devolução</CardTitle>
              <CardDescription>Basta o valor médio de 1 mês de conta para uma estimativa inicial.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Tipo</Label>
                  <Select value={clientType} onValueChange={(v: "pf" | "pj") => setClientType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pj">Empresa (PJ)</SelectItem>
                      <SelectItem value="pf">Pessoa Física (PF)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Meses a recuperar</Label>
                  <Select value={months} onValueChange={setMonths}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">Últimos 5 anos (60m)</SelectItem>
                      <SelectItem value="120">Últimos 10 anos (120m)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Valor médio mensal da conta de luz (R$)</Label>
                <Input inputMode="decimal" placeholder="Ex: 850" value={monthlyBill} onChange={(e) => setMonthlyBill(e.target.value)} />
              </div>

              {canSimulate && (
                <div className="rounded-xl border border-primary/40 bg-primary/5 p-4">
                  <p className="text-xs uppercase text-muted-foreground">Estimativa de devolução</p>
                  <p className="mt-1 text-3xl font-bold text-primary">{BRL(estimated)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Cálculo referencial baseado em ~28% da fatura (TUSD/TE). Valor final depende da análise das contas.
                  </p>
                  {!meetsMinimum && (
                    <p className="mt-2 text-xs text-destructive">Valor mínimo para operar: R$ 150 estimados.</p>
                  )}
                </div>
              )}

              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-sm font-semibold">Enviar solicitação</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
                  <Input placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <Input placeholder="WhatsApp com DDD" value={phone} onChange={(e) => setPhone(e.target.value)} className="sm:col-span-2" />
                </div>
                <Button onClick={submit} disabled={saving || !canSimulate} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar para análise"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 h-fit">
            <CardHeader>
              <CardTitle className="text-base">Como funciona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                "Envio de 1 mês de conta para análise",
                "Cálculo do valor recuperável (ICMS sobre TUSD/TE)",
                "Pedido administrativo protocolado",
                "Devolução em até 12 meses",
              ].map((s, i) => (
                <div key={s} className="flex items-start gap-2">
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary shrink-0">{i + 1}</div>
                  <p className="text-muted-foreground">{s}</p>
                </div>
              ))}
              <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-xs">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Extensível a colaboradores</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Empresas podem estender o benefício a funcionários via convênio.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Sem risco jurídico · Sem sucumbência
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
