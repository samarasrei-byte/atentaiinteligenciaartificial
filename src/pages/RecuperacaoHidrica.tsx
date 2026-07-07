import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Droplets, Scale, Gavel, Clock, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const BRL = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default function RecuperacaoHidrica() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [b1, setB1] = useState(""); const [b2, setB2] = useState(""); const [b3, setB3] = useState("");
  const [name, setName] = useState(user?.user_metadata?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const toCents = (v: string) => Math.round((Number(v.replace(/[^\d,]/g, "").replace(",", ".")) || 0) * 100);

  const estimated = useMemo(() => {
    const avg = (toCents(b1) + toCents(b2) + toCents(b3)) / 3;
    // Fator K médio devolvido ~22% * 60 meses
    return Math.round(avg * 0.22 * 60);
  }, [b1, b2, b3]);

  const canSimulate = toCents(b1) > 0 && toCents(b2) > 0 && toCents(b3) > 0;
  const meetsMinimum = estimated >= 200000; // R$ 2.000 mínimo

  const submit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast({ title: "Preencha nome, e-mail e WhatsApp", variant: "destructive" });
      return;
    }
    if (!meetsMinimum) {
      toast({ title: "Valor mínimo não atingido", description: "Estimativa mínima para operar: R$ 2.000.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("water_recovery_requests").insert({
      user_id: user?.id ?? null,
      full_name: name, email, phone,
      client_type: "pj",
      bill_1_cents: toCents(b1),
      bill_2_cents: toCents(b2),
      bill_3_cents: toCents(b3),
      estimated_recovery_cents: estimated,
      status: "pending",
      approval_stage: "new_lead",
    });
    setSaving(false);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Solicitação enviada!", description: "Análise em até 48h úteis." });
    setB1(""); setB2(""); setB3(""); setPhone("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Recuperação Fiscal Hídrica — Fator K | AtentAI</title>
        <meta name="description" content="Devolução do Fator K cobrado indevidamente na conta de água. 100% judicial via mandado de segurança, sem risco de sucumbência." />
      </Helmet>

      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <Badge variant="outline" className="mb-4 border-primary/40 text-primary"><Sparkles className="mr-1 h-3 w-3" /> Judicial · Mandado de Segurança</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Recuperação Fiscal <span className="text-primary">Hídrica</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Devolução do Fator K cobrado na conta de água com base em cálculo contábil dos últimos 5 anos.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Gavel, t: "Via Mandado de Segurança", d: "Sem risco de sucumbência" },
              { icon: Clock, t: "Retroativo 5 anos", d: "Recuperação cheia" },
              { icon: Scale, t: "Cálculo contábil", d: "Base sólida e auditável" },
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

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Droplets className="h-5 w-5 text-primary" /> Simulador de recuperação</CardTitle>
              <CardDescription>Informe as 3 últimas contas de água para uma estimativa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div><Label>Conta mês 1 (R$)</Label><Input value={b1} onChange={(e) => setB1(e.target.value)} placeholder="Ex: 1.200" /></div>
                <div><Label>Conta mês 2 (R$)</Label><Input value={b2} onChange={(e) => setB2(e.target.value)} placeholder="Ex: 1.180" /></div>
                <div><Label>Conta mês 3 (R$)</Label><Input value={b3} onChange={(e) => setB3(e.target.value)} placeholder="Ex: 1.250" /></div>
              </div>

              {canSimulate && (
                <div className="rounded-xl border border-primary/40 bg-primary/5 p-4">
                  <p className="text-xs uppercase text-muted-foreground">Estimativa de devolução (5 anos)</p>
                  <p className="mt-1 text-3xl font-bold text-primary">{BRL(estimated)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Cálculo referencial. Valor final depende da análise contábil.</p>
                  {!meetsMinimum && <p className="mt-2 text-xs text-destructive">Mínimo para operar: R$ 2.000.</p>}
                </div>
              )}

              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-sm font-semibold">Enviar solicitação</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Razão social / Nome" value={name} onChange={(e) => setName(e.target.value)} />
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
            <CardHeader><CardTitle className="text-base">Como funciona</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                "Envio das últimas 3 contas de água",
                "Cálculo do Fator K indevido",
                "Impetração de mandado de segurança",
                "Compensação/restituição via ordem judicial",
              ].map((s, i) => (
                <div key={s} className="flex items-start gap-2">
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary shrink-0">{i + 1}</div>
                  <p className="text-muted-foreground">{s}</p>
                </div>
              ))}
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Sem risco de sucumbência
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
