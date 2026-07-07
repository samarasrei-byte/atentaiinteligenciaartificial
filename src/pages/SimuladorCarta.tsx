import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Ticket, TrendingDown, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const BRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

export default function SimuladorCarta() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [credito, setCredito] = useState("300000");
  const [prazo, setPrazo] = useState("180");
  const [taxaAdm, setTaxaAdm] = useState("18");
  const [lancePct, setLancePct] = useState("25");
  const [tipo, setTipo] = useState("imovel");
  const [name, setName] = useState(user?.user_metadata?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const sim = useMemo(() => {
    const c = Number(credito) || 0;
    const p = Number(prazo) || 1;
    const tx = Number(taxaAdm) / 100;
    const lance = Number(lancePct) / 100;
    const total = c * (1 + tx);
    const parcela = total / p;
    const lanceEmbutido = c * lance;
    const taxaBanco = 12; // % aa referência
    const parcelaBanco = (c * (1 + (taxaBanco / 100) * (p / 12))) / p;
    const economia = Math.max(0, (parcelaBanco - parcela) * p);
    return { total, parcela, lanceEmbutido, taxaBanco, economia, parcelaBanco };
  }, [credito, prazo, taxaAdm, lancePct]);

  const submit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast({ title: "Preencha nome, e-mail e WhatsApp", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("mentoria_cartas_leads").insert({
      full_name: name, email, phone,
      carta_type: tipo,
      credit_range: `R$ ${Number(credito).toLocaleString("pt-BR")}`,
      source: "simulador-carta",
      status: "new",
      approval_stage: "pending_partner",
      metadata: {
        simulacao: {
          credito: Number(credito),
          prazo_meses: Number(prazo),
          parcela_estimada: Math.round(sim.parcela),
          lance_sugerido: Math.round(sim.lanceEmbutido),
          taxa_total_pct: Number(taxaAdm),
          taxa_banco_aa_pct: sim.taxaBanco,
          economia_estimada: Math.round(sim.economia),
        },
      },
    });
    setSaving(false);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Simulação enviada!", description: "Um especialista vai analisar e retornar." });
    setPhone("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Simulador de Carta Contemplada | AtentAI</title>
        <meta name="description" content="Simule crédito, prazo e parcela de uma carta de crédito contemplada. Compare com financiamento bancário." />
      </Helmet>

      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <Badge variant="outline" className="mb-3 border-primary/40 text-primary"><Sparkles className="mr-1 h-3 w-3" /> Simulação em segundos</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Simulador de <span className="text-primary">Carta Contemplada</span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Compare parcela × lance embutido × economia versus financiamento bancário.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Ticket className="h-5 w-5 text-primary" /> Parâmetros</CardTitle>
              <CardDescription>Ajuste os valores da carta que você deseja adquirir.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Tipo de carta</Label>
                  <Select value={tipo} onValueChange={setTipo}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="imovel">Imóvel</SelectItem>
                      <SelectItem value="veiculo">Veículo</SelectItem>
                      <SelectItem value="servicos">Serviços</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Valor do crédito (R$)</Label><Input value={credito} onChange={(e) => setCredito(e.target.value.replace(/\D/g, ""))} /></div>
                <div><Label>Prazo (meses)</Label><Input value={prazo} onChange={(e) => setPrazo(e.target.value.replace(/\D/g, ""))} /></div>
                <div><Label>Taxa administrativa (%)</Label><Input value={taxaAdm} onChange={(e) => setTaxaAdm(e.target.value)} /></div>
                <div><Label>Lance embutido (%)</Label><Input value={lancePct} onChange={(e) => setLancePct(e.target.value)} /></div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-primary/40 bg-primary/5 p-4">
                <div><p className="text-[10px] uppercase text-muted-foreground">Parcela carta</p><p className="text-lg font-bold text-primary">{BRL(sim.parcela)}</p></div>
                <div><p className="text-[10px] uppercase text-muted-foreground">Parcela banco</p><p className="text-lg font-bold">{BRL(sim.parcelaBanco)}</p></div>
                <div><p className="text-[10px] uppercase text-muted-foreground">Lance sugerido</p><p className="text-lg font-bold">{BRL(sim.lanceEmbutido)}</p></div>
                <div><p className="text-[10px] uppercase text-muted-foreground">Economia total</p><p className="text-lg font-bold text-emerald-600 flex items-center gap-1"><TrendingDown className="h-4 w-4" />{BRL(sim.economia)}</p></div>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-sm font-semibold">Falar com especialista</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
                  <Input placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <Input placeholder="WhatsApp com DDD" value={phone} onChange={(e) => setPhone(e.target.value)} className="sm:col-span-2" />
                </div>
                <Button onClick={submit} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar simulação"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 h-fit">
            <CardHeader><CardTitle className="text-base">Por que carta contemplada?</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {[
                "Sem juros bancários — apenas taxa administrativa",
                "Crédito disponível imediatamente após contemplação",
                "Parcela mais leve que financiamento tradicional",
                "Pode ser usada para imóvel, veículo ou serviços",
              ].map((s) => (
                <div key={s} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p>{s}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
