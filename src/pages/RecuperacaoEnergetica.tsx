import { useMemo, useState } from "react";
import QuizShell, { QuizStep } from "@/components/quiz/QuizShell";
import QuizConfirmation from "@/components/quiz/QuizConfirmation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Zap, ShieldCheck, Clock, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { contactSchema, docSchema, ufSchema, firstError } from "@/lib/quizValidation";
import { z } from "zod";

const BRL = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default function RecuperacaoEnergetica() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [protocol, setProtocol] = useState<string | null>(null);

  const [clientType, setClientType] = useState<"pf" | "pj">("pj");
  const [distributor, setDistributor] = useState("");
  const [uf, setUf] = useState("");
  const [installations, setInstallations] = useState("1");
  const [monthlyBill, setMonthlyBill] = useState("");
  const [months, setMonths] = useState("120");
  const [name, setName] = useState(user?.user_metadata?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [document, setDocument] = useState("");

  const billNumber = Number(monthlyBill.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
  const estimated = useMemo(() => {
    const inst = Number(installations) || 1;
    return Math.round(billNumber * 100 * 0.28 * (Number(months) || 0) * inst);
  }, [billNumber, months, installations]);
  const meetsMinimum = estimated >= 15000;

  const submit = async () => {
    const schema = z.object({
      distributor: z.string().trim().min(2, "Distribuidora obrigatória"),
      uf: ufSchema,
      installations: z.coerce.number().int().min(1, "Mín. 1 instalação"),
      billNumber: z.number().positive("Informe o valor da conta"),
      document: docSchema(clientType),
    }).merge(contactSchema);

    const parsed = schema.safeParse({
      name, email, phone, distributor, uf, installations, billNumber, document,
    });
    if (!parsed.success) {
      toast({ title: firstError(parsed.error), variant: "destructive" });
      return;
    }
    if (!meetsMinimum) {
      toast({ title: "Valor mínimo não atingido", description: "Estimativa precisa ser ≥ R$ 150.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("energy_recovery_requests")
      .insert({
        user_id: user?.id ?? null,
        full_name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        document: document.trim(),
        client_type: clientType,
        monthly_bill_cents: Math.round(billNumber * 100),
        months_estimated: Number(months),
        estimated_recovery_cents: estimated,
        status: "pending",
        approval_stage: "new_lead",
        metadata: { distributor, uf, installations: Number(installations) },
      })
      .select("id")
      .single();
    setSaving(false);
    if (error) return toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
    setProtocol(data?.id ? data.id.slice(0, 8).toUpperCase() : null);
    setDone(true);
  };

  const steps: QuizStep[] = [
    {
      title: "Recuperação Fiscal Energética",
      subtitle: "Devolução de ICMS indevido cobrado na conta de luz — base em decisão do STF.",
      canNext: true,
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: ShieldCheck, t: "100% administrativo", d: "Sem tese em discussão" },
            { icon: Clock, t: "Retroativo até 10 anos", d: "Recupere o passado" },
            { icon: Building2, t: "PJ e PF", d: "Extensível a colaboradores" },
            { icon: Zap, t: "Base STF", d: "Sem risco jurídico" },
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
      title: "Quem vai solicitar?",
      subtitle: "A recuperação pode ser feita por empresa ou pessoa física.",
      canNext: true,
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          {[{ v: "pj", l: "Empresa (PJ)", d: "CNPJ ativo com conta de luz comercial/industrial" },
            { v: "pf", l: "Pessoa Física", d: "Titular da conta de luz residencial" }].map((o) => (
            <button
              key={o.v} type="button"
              onClick={() => setClientType(o.v as "pf" | "pj")}
              className={`rounded-xl border p-4 text-left transition ${clientType === o.v ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
            >
              <p className="font-semibold">{o.l}</p>
              <p className="text-xs text-muted-foreground mt-1">{o.d}</p>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Sua distribuidora de energia",
      subtitle: "Precisamos saber onde a conta é emitida.",
      canNext: distributor.trim().length > 1 && uf.length === 2,
      content: (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Label>Distribuidora (Enel, CPFL, Light, Neoenergia...)</Label>
            <Input value={distributor} onChange={(e) => setDistributor(e.target.value)} placeholder="Ex: Enel SP" maxLength={80} />
          </div>
          <div>
            <Label>UF</Label>
            <Input value={uf} onChange={(e) => setUf(e.target.value.toUpperCase().slice(0, 2))} placeholder="SP" />
          </div>
          <div className="sm:col-span-3">
            <Label>Quantidade de instalações / unidades consumidoras</Label>
            <Input value={installations} onChange={(e) => setInstallations(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" />
          </div>
        </div>
      ),
    },
    {
      title: "Consumo e período",
      subtitle: "Valor médio mensal da conta e período a recuperar.",
      canNext: billNumber > 0,
      content: (
        <div className="space-y-4">
          <div>
            <Label>Valor médio mensal da conta (R$)</Label>
            <Input inputMode="decimal" placeholder="Ex: 850" value={monthlyBill} onChange={(e) => setMonthlyBill(e.target.value)} maxLength={12} />
          </div>
          <div>
            <Label>Período retroativo</Label>
            <Select value={months} onValueChange={setMonths}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="60">Últimos 5 anos (60 meses)</SelectItem>
                <SelectItem value="120">Últimos 10 anos (120 meses)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {billNumber > 0 && (
            <div className="rounded-xl border border-primary/40 bg-primary/5 p-4">
              <p className="text-[11px] uppercase text-muted-foreground">Estimativa de devolução</p>
              <p className="mt-1 text-3xl font-bold text-primary">{BRL(estimated)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                ~28% da fatura (TUSD/TE) × {installations} instalação(ões) × {months} meses.
              </p>
              {!meetsMinimum && <p className="mt-2 text-xs text-destructive">Mínimo para operar: R$ 150.</p>}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Seus dados de contato",
      subtitle: "Nosso parceiro retorna em até 24h úteis.",
      canNext: !!name.trim() && !!email.trim() && !!phone.trim() && !!document.trim(),
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Nome / Razão social" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
          <Input placeholder={clientType === "pj" ? "CNPJ" : "CPF"} value={document} onChange={(e) => setDocument(e.target.value)} maxLength={18} />
          <Input placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={160} />
          <Input placeholder="WhatsApp com DDD" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
        </div>
      ),
    },
  ];

  return (
    <QuizShell
      brandLabel="Recuperação Energética"
      title="Quiz Recuperação Fiscal Energética | AtentAI"
      metaDescription="Simule sua devolução de ICMS indevido na conta de luz em 5 passos."
      step={step} steps={steps}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onNext={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
      onSubmit={submit}
      submitting={saving}
      submitLabel="Enviar para análise"
      done={done}
      doneContent={
        <QuizConfirmation
          headline="Solicitação enviada com sucesso!"
          subline="Nosso parceiro fiscal recebeu seu pedido e vai analisar sua elegibilidade."
          protocol={protocol}
          highlight={{ label: "Estimativa de devolução", value: BRL(estimated) }}
          summary={[
            { label: "Solicitante", value: name },
            { label: "Perfil", value: clientType === "pj" ? "Pessoa Jurídica" : "Pessoa Física" },
            { label: "Documento", value: document },
            { label: "Distribuidora", value: `${distributor} / ${uf}` },
            { label: "Instalações", value: installations },
            { label: "Conta média", value: BRL(Math.round(billNumber * 100)) },
            { label: "Período", value: `${months} meses` },
            { label: "Contato", value: `${email} · ${phone}` },
          ]}
          nextSteps={[
            { title: "Análise em até 24h úteis", description: "O parceiro valida os dados e confirma a elegibilidade." },
            { title: "Envio dos documentos", description: "Solicitaremos faturas dos últimos meses e procuração." },
            { title: "Recuperação administrativa", description: "Iniciamos o pedido e você acompanha em tempo real." },
          ]}
          chatHref="/chat/guilherme?servico=recuperacao-energetica"
        />
      }
    />
  );
}
