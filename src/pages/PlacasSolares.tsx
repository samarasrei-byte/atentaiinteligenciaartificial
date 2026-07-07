import { useMemo, useState } from "react";
import QuizShell, { QuizStep } from "@/components/quiz/QuizShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Sun, TrendingDown, Share2, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const BRL = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
const toCents = (v: string) =>
  Math.round((Number(v.replace(/[^\d,]/g, "").replace(",", ".")) || 0) * 100);

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export default function PlacasSolares() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const [clientType, setClientType] = useState<"pf" | "pj">("pj");
  const [uf, setUf] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [roofType, setRoofType] = useState("");
  const [ownership, setOwnership] = useState<"propria" | "alugada" | "">("");
  const [bill, setBill] = useState("");
  const [name, setName] = useState(user?.user_metadata?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [document, setDocument] = useState("");

  const billCents = toCents(bill);
  const est = useMemo(() => {
    const monthlySave = Math.round(billCents * 0.9);
    const kwh = Math.round((billCents / 100) / 0.85);
    const yearlySave = monthlySave * 12;
    return { monthlySave, yearlySave, in10y: yearlySave * 10, kwh };
  }, [billCents]);

  const submit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !document.trim()) {
      toast({ title: "Preencha todos os dados de contato", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("solar_requests").insert({
      user_id: user?.id ?? null,
      full_name: name, email, phone,
      client_type: clientType,
      monthly_bill_cents: billCents,
      monthly_kwh: est.kwh,
      address, city, state: uf,
      estimated_savings_cents: est.monthlySave,
      status: "pending",
      approval_stage: "new_lead",
    });
    setSaving(false);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    setDone(true);
  };

  const steps: QuizStep[] = [
    {
      title: "Placas Solares Custo Zero",
      subtitle: "A economia paga o financiamento — sobra no caixa desde o mês 1.",
      canNext: true,
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: Sun, t: "Estudo preliminar", d: "Com 1 mês de conta" },
            { icon: TrendingDown, t: "Economia integral", d: "Após quitação" },
            { icon: Share2, t: "Energia compartilhada", d: "Entre unidades/empresas" },
            { icon: Wallet, t: "Fluxo positivo", d: "Desde o mês 1" },
          ].map((b) => (
            <Card key={b.t} className="p-4">
              <b.icon className="h-5 w-5 text-primary mb-2" />
              <p className="text-sm font-semibold">{b.t}</p>
              <p className="text-xs text-muted-foreground">{b.d}</p>
            </Card>
          ))}
        </div>
      ),
    },
    {
      title: "Perfil do solicitante",
      canNext: true,
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          {[{ v: "pj", l: "Empresa (PJ)", d: "Rateio possível entre unidades" },
            { v: "pf", l: "Pessoa Física", d: "Instalação residencial" }].map((o) => (
            <button key={o.v} type="button"
              onClick={() => setClientType(o.v as "pf" | "pj")}
              className={`rounded-xl border p-4 text-left transition ${clientType === o.v ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
              <p className="font-semibold">{o.l}</p>
              <p className="text-xs text-muted-foreground mt-1">{o.d}</p>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Onde será a instalação?",
      subtitle: "Estado e cidade definem a viabilidade e o dimensionamento.",
      canNext: uf.length === 2 && city.trim().length > 1,
      content: (
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label>UF</Label>
            <Select value={uf} onValueChange={setUf}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{UFS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Cidade</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex: Campinas" />
          </div>
          <div className="sm:col-span-3">
            <Label>Endereço (opcional)</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número, bairro" />
          </div>
        </div>
      ),
    },
    {
      title: "Estrutura e imóvel",
      canNext: !!roofType && !!ownership,
      content: (
        <div className="space-y-4">
          <div>
            <Label>Tipo de telhado / estrutura</Label>
            <Select value={roofType} onValueChange={setRoofType}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ceramico">Cerâmico</SelectItem>
                <SelectItem value="metalico">Metálico</SelectItem>
                <SelectItem value="fibrocimento">Fibrocimento</SelectItem>
                <SelectItem value="laje">Laje</SelectItem>
                <SelectItem value="solo">Solo (área livre)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Imóvel</Label>
            <Select value={ownership} onValueChange={(v: "propria" | "alugada") => setOwnership(v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="propria">Próprio</SelectItem>
                <SelectItem value="alugada">Alugado (requer anuência)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
    },
    {
      title: "Sua conta de energia",
      subtitle: "Basta o valor médio de 1 mês para dimensionamento inicial.",
      canNext: billCents > 0,
      content: (
        <div className="space-y-4">
          <div>
            <Label>Valor médio mensal da conta (R$)</Label>
            <Input value={bill} onChange={(e) => setBill(e.target.value)} placeholder="Ex: 3.500" />
          </div>
          {billCents > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-primary/40 bg-primary/5 p-4">
              <div><p className="text-[10px] uppercase text-muted-foreground">Economia/mês</p><p className="text-lg font-bold text-primary">{BRL(est.monthlySave)}</p></div>
              <div><p className="text-[10px] uppercase text-muted-foreground">Economia/ano</p><p className="text-lg font-bold text-primary">{BRL(est.yearlySave)}</p></div>
              <div><p className="text-[10px] uppercase text-muted-foreground">Em 10 anos</p><p className="text-lg font-bold text-primary">{BRL(est.in10y)}</p></div>
              <div><p className="text-[10px] uppercase text-muted-foreground">Consumo</p><p className="text-lg font-bold">{est.kwh} kWh</p></div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Dados de contato",
      subtitle: "O parceiro fará o estudo preliminar e retorna com proposta.",
      canNext: !!name.trim() && !!email.trim() && !!phone.trim() && !!document.trim(),
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Nome / Razão social" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder={clientType === "pj" ? "CNPJ" : "CPF"} value={document} onChange={(e) => setDocument(e.target.value)} />
          <Input placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="WhatsApp com DDD" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      ),
    },
  ];

  return (
    <QuizShell
      brandLabel="Placas Solares"
      title="Quiz Placas Solares Custo Zero | AtentAI"
      metaDescription="Simule energia solar sem investimento inicial em 6 passos."
      step={step} steps={steps}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onNext={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
      onSubmit={submit}
      submitting={saving}
      submitLabel="Solicitar estudo"
      done={done}
      doneContent={
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          <h2 className="mt-4 text-2xl font-bold">Estudo solicitado!</h2>
          <p className="mt-2 text-muted-foreground">
            Economia estimada: <span className="text-primary font-semibold">{BRL(est.monthlySave)}/mês</span>. Retorno com proposta em até 3 dias úteis.
          </p>
        </div>
      }
    />
  );
}
