import { useMemo, useState } from "react";
import QuizShell, { QuizStep } from "@/components/quiz/QuizShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Droplets, Gavel, Clock, Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const BRL = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
const toCents = (v: string) =>
  Math.round((Number(v.replace(/[^\d,]/g, "").replace(",", ".")) || 0) * 100);

export default function RecuperacaoHidrica() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isPJ, setIsPJ] = useState<boolean | null>(null);
  const [concessionaria, setConcessionaria] = useState("");
  const [uf, setUf] = useState("");
  const [segment, setSegment] = useState("");
  const [b1, setB1] = useState(""); const [b2, setB2] = useState(""); const [b3, setB3] = useState("");
  const [name, setName] = useState(user?.user_metadata?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [cnpj, setCnpj] = useState("");

  const avgCents = (toCents(b1) + toCents(b2) + toCents(b3)) / 3;
  const estimated = useMemo(() => Math.round(avgCents * 0.22 * 60), [avgCents]);
  const meetsMinimum = estimated >= 200000;

  const submit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !cnpj.trim()) {
      toast({ title: "Preencha todos os dados de contato", variant: "destructive" });
      return;
    }
    if (!meetsMinimum) {
      toast({ title: "Valor mínimo não atingido", description: "Estimativa mínima: R$ 2.000.", variant: "destructive" });
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
    setDone(true);
  };

  const steps: QuizStep[] = [
    {
      title: "Recuperação Fiscal Hídrica",
      subtitle: "Devolução do Fator K cobrado indevidamente na conta de água — via mandado de segurança.",
      canNext: true,
      content: (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Gavel, t: "Mandado de Segurança", d: "Sem risco de sucumbência" },
            { icon: Clock, t: "Retroativo 5 anos", d: "Recuperação cheia" },
            { icon: Scale, t: "Cálculo contábil", d: "Base auditável" },
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
      title: "Você está solicitando como PJ?",
      subtitle: "A recuperação hídrica só é operada para pessoa jurídica.",
      canNext: isPJ === true,
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          {[{ v: true, l: "Sim, sou PJ", d: "Empresa com CNPJ ativo e conta de água" },
            { v: false, l: "Não, sou PF", d: "Serviço indisponível — apenas PJ" }].map((o) => (
            <button
              key={String(o.v)} type="button"
              onClick={() => setIsPJ(o.v)}
              className={`rounded-xl border p-4 text-left transition ${isPJ === o.v ? (o.v ? "border-primary bg-primary/5" : "border-destructive bg-destructive/5") : "border-border hover:border-primary/40"}`}
            >
              <p className="font-semibold">{o.l}</p>
              <p className="text-xs text-muted-foreground mt-1">{o.d}</p>
            </button>
          ))}
          {isPJ === false && (
            <p className="sm:col-span-2 text-xs text-destructive">Este serviço é exclusivo para empresas. Confira Recuperação Energética (disponível para PF).</p>
          )}
        </div>
      ),
    },
    {
      title: "Concessionária e segmento",
      subtitle: "Onde a conta é emitida e o setor de atuação.",
      canNext: concessionaria.trim().length > 1 && uf.length === 2 && segment.trim().length > 1,
      content: (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Label>Concessionária (Sabesp, Copasa, Cedae...)</Label>
            <Input value={concessionaria} onChange={(e) => setConcessionaria(e.target.value)} placeholder="Ex: Sabesp" />
          </div>
          <div>
            <Label>UF</Label>
            <Input value={uf} onChange={(e) => setUf(e.target.value.toUpperCase().slice(0, 2))} placeholder="SP" />
          </div>
          <div className="sm:col-span-3">
            <Label>Segmento (indústria, comércio, serviços...)</Label>
            <Input value={segment} onChange={(e) => setSegment(e.target.value)} placeholder="Ex: Indústria alimentícia" />
          </div>
        </div>
      ),
    },
    {
      title: "Últimas 3 contas de água",
      subtitle: "Informe os valores em reais. Mínimo para operar: R$ 2.000 de estimativa.",
      canNext: toCents(b1) > 0 && toCents(b2) > 0 && toCents(b3) > 0,
      content: (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div><Label>Conta mês 1</Label><Input value={b1} onChange={(e) => setB1(e.target.value)} placeholder="1.200" /></div>
            <div><Label>Conta mês 2</Label><Input value={b2} onChange={(e) => setB2(e.target.value)} placeholder="1.180" /></div>
            <div><Label>Conta mês 3</Label><Input value={b3} onChange={(e) => setB3(e.target.value)} placeholder="1.250" /></div>
          </div>
          {avgCents > 0 && (
            <div className="rounded-xl border border-primary/40 bg-primary/5 p-4">
              <p className="text-[11px] uppercase text-muted-foreground">Estimativa de devolução (5 anos)</p>
              <p className="mt-1 text-3xl font-bold text-primary">{BRL(estimated)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Base: Fator K médio 22% sobre 60 meses.</p>
              {!meetsMinimum && <p className="mt-2 text-xs text-destructive">Mínimo para operar: R$ 2.000.</p>}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Dados de contato",
      subtitle: "Retorno em até 48h úteis com plano de ação.",
      canNext: !!name.trim() && !!email.trim() && !!phone.trim() && !!cnpj.trim(),
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Razão social" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="CNPJ" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
          <Input placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="WhatsApp com DDD" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      ),
    },
  ];

  return (
    <QuizShell
      brandLabel="Recuperação Hídrica"
      title="Quiz Recuperação Fiscal Hídrica | AtentAI"
      metaDescription="Simule a devolução do Fator K na conta de água em 5 passos."
      step={step} steps={steps}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onNext={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
      onSubmit={submit}
      submitting={saving}
      submitLabel="Enviar para análise"
      done={done}
      doneContent={
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          <Droplets className="mx-auto mt-2 h-6 w-6 text-primary" />
          <h2 className="mt-4 text-2xl font-bold">Solicitação enviada!</h2>
          <p className="mt-2 text-muted-foreground">
            Estimativa: <span className="text-primary font-semibold">{BRL(estimated)}</span>. Análise em até 48h úteis.
          </p>
        </div>
      }
    />
  );
}
