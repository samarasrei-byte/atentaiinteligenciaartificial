import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sun, TrendingDown, Share2, Wallet, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const BRL = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default function PlacasSolares() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bill, setBill] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [name, setName] = useState(user?.user_metadata?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const toCents = (v: string) => Math.round((Number(v.replace(/[^\d,]/g, "").replace(",", ".")) || 0) * 100);
  const billCents = toCents(bill);

  const est = useMemo(() => {
    // Economia média 90% da conta após instalação
    const monthlySave = Math.round(billCents * 0.9);
    const kwh = Math.round((billCents / 100) / 0.85); // ~R$0,85/kWh
    const yearlySave = monthlySave * 12;
    const in10y = yearlySave * 10;
    return { monthlySave, yearlySave, in10y, kwh };
  }, [billCents]);

  const canSimulate = billCents > 0;

  const submit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast({ title: "Preencha nome, e-mail e WhatsApp", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("solar_requests").insert({
      user_id: user?.id ?? null,
      full_name: name, email, phone,
      client_type: "pj",
      monthly_bill_cents: billCents,
      monthly_kwh: est.kwh,
      address, city, state,
      estimated_savings_cents: est.monthlySave,
      status: "pending",
      approval_stage: "new_lead",
    });
    setSaving(false);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Solicitação enviada!", description: "Nosso parceiro fará o estudo preliminar." });
    setBill(""); setPhone("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Placas Solares Custo Zero | AtentAI</title>
        <meta name="description" content="Energia solar com custo zero de entrada: a economia paga o financiamento e ainda sobra no caixa." />
      </Helmet>

      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <Badge variant="outline" className="mb-4 border-primary/40 text-primary"><Sparkles className="mr-1 h-3 w-3" /> Custo zero de entrada</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Placas Solares <span className="text-primary">Custo Zero</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            A economia paga o financiamento e ainda sobra no caixa. Após a quitação, a economia é integral da empresa.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-4">
            {[
              { icon: Sun, t: "Estudo preliminar", d: "Com 1 mês de conta" },
              { icon: TrendingDown, t: "Economia integral", d: "Após quitação" },
              { icon: Share2, t: "Energia compartilhada", d: "Entre empresas" },
              { icon: Wallet, t: "Fluxo positivo", d: "Desde o mês 1" },
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
              <CardTitle className="flex items-center gap-2"><Sun className="h-5 w-5 text-primary" /> Simulador de economia</CardTitle>
              <CardDescription>Estimativa com base em 1 mês de conta de energia.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Valor médio mensal da conta (R$)</Label>
                <Input value={bill} onChange={(e) => setBill(e.target.value)} placeholder="Ex: 3.500" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-3"><Label>Endereço</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
                <div className="sm:col-span-2"><Label>Cidade</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
                <div><Label>UF</Label><Input value={state} onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))} /></div>
              </div>

              {canSimulate && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-primary/40 bg-primary/5 p-4">
                  <div><p className="text-[10px] uppercase text-muted-foreground">Economia/mês</p><p className="text-lg font-bold text-primary">{BRL(est.monthlySave)}</p></div>
                  <div><p className="text-[10px] uppercase text-muted-foreground">Economia/ano</p><p className="text-lg font-bold text-primary">{BRL(est.yearlySave)}</p></div>
                  <div><p className="text-[10px] uppercase text-muted-foreground">Em 10 anos</p><p className="text-lg font-bold text-primary">{BRL(est.in10y)}</p></div>
                  <div><p className="text-[10px] uppercase text-muted-foreground">Consumo</p><p className="text-lg font-bold">{est.kwh} kWh</p></div>
                </div>
              )}

              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-sm font-semibold">Solicitar estudo preliminar</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Nome / Razão social" value={name} onChange={(e) => setName(e.target.value)} />
                  <Input placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <Input placeholder="WhatsApp com DDD" value={phone} onChange={(e) => setPhone(e.target.value)} className="sm:col-span-2" />
                </div>
                <Button onClick={submit} disabled={saving || !canSimulate} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Solicitar estudo"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 h-fit">
            <CardHeader><CardTitle className="text-base">Como funciona</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                "Estudo preliminar com 1 mês de conta",
                "Visita técnica para análise da estrutura",
                "Energia gerada pode ser compartilhada entre empresas",
                "Economia paga o financiamento — sobra no caixa",
                "Após quitação, a economia é 100% da empresa",
              ].map((s, i) => (
                <div key={s} className="flex items-start gap-2">
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary shrink-0">{i + 1}</div>
                  <p className="text-muted-foreground">{s}</p>
                </div>
              ))}
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Sem investimento inicial
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
