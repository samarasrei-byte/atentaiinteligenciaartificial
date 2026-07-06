import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Car, Truck, Wrench, Sprout, Ship,
  CheckCircle2, ShieldCheck, TrendingUp, Sparkles,
  ArrowRight, ArrowLeft, MessageCircle, Phone, Mail, User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";

const WHATSAPP_NUMBER = "5511985214895";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Olá! Fiz o Quiz de Cartas Contempladas e quero receber a proposta.",
)}`;

type CartaKey =
  | "imovel"
  | "automovel"
  | "caminhao"
  | "reforma_servicos"
  | "rural"
  | "nautico";

interface CartaOption {
  key: CartaKey;
  label: string;
  short: string;
  icon: React.ElementType;
  benefits: string[];
  ticket: string;
}

const CARTAS: CartaOption[] = [
  {
    key: "imovel",
    label: "Carta de Imóvel",
    short: "Casa, apartamento, terreno ou comercial",
    icon: Home,
    ticket: "R$ 150 mil a R$ 2,5 milhões",
    benefits: [
      "Crédito à vista com poder de negociação",
      "Compra, construção, reforma ou quitação",
      "Sem juros do financiamento tradicional",
      "Uso do FGTS permitido",
    ],
  },
  {
    key: "automovel",
    label: "Carta de Automóvel",
    short: "Carros zero, seminovos e importados",
    icon: Car,
    ticket: "R$ 40 mil a R$ 300 mil",
    benefits: [
      "Negocie como cliente à vista na concessionária",
      "Descontos que não existem no financiamento",
      "Zero entrada e sem análise de score",
      "Liberação em até 7 dias úteis",
    ],
  },
  {
    key: "caminhao",
    label: "Carta de Caminhão / Pesados",
    short: "Frota, cavalo mecânico e maquinário",
    icon: Truck,
    ticket: "R$ 200 mil a R$ 900 mil",
    benefits: [
      "Renove ou amplie sua frota sem descapitalizar",
      "Ideal para MEIs, transportadoras e autônomos",
      "Aceita implementos e agregados",
      "Dedução fiscal para pessoa jurídica",
    ],
  },
  {
    key: "reforma_servicos",
    label: "Serviços e Reforma",
    short: "Reforma, viagens, eventos e capital",
    icon: Wrench,
    ticket: "R$ 20 mil a R$ 250 mil",
    benefits: [
      "Uso livre do crédito após contemplação",
      "Sem comprovação de destinação",
      "Parcelas até 25% menores que empréstimos",
      "Perfeito para trocar dívida cara",
    ],
  },
  {
    key: "rural",
    label: "Rural / Agronegócio",
    short: "Terras, tratores e implementos",
    icon: Sprout,
    ticket: "R$ 100 mil a R$ 3 milhões",
    benefits: [
      "Aquisição de terras produtivas",
      "Máquinas, tratores e colheitadeiras",
      "Compatível com linhas do Plano Safra",
      "Planejamento sucessório rural",
    ],
  },
  {
    key: "nautico",
    label: "Náutico e Aeronáutico",
    short: "Lanchas, jet skis e aeronaves",
    icon: Ship,
    ticket: "R$ 80 mil a R$ 1,2 milhão",
    benefits: [
      "Aquisição planejada de embarcações",
      "Renda extra com fretamento",
      "Sem juros abusivos do financiamento naval",
      "Assessoria completa de documentação",
    ],
  },
];

const URGENCIA = [
  { key: "asap", label: "Nos próximos 30 dias" },
  { key: "3m", label: "Em até 3 meses" },
  { key: "6m", label: "Em até 6 meses" },
  { key: "explorando", label: "Só estou explorando" },
];

type Step = 0 | 1 | 2 | 3;

export default function CartasContempladasQuiz() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(0);
  const [selected, setSelected] = useState<CartaKey | null>(null);
  const [urgencia, setUrgencia] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    credit_range: "",
    message: "",
  });

  const carta = useMemo(
    () => (selected ? CARTAS.find((c) => c.key === selected)! : null),
    [selected],
  );

  const progress = ((step + 1) / 4) * 100;

  const next = () => setStep((s) => Math.min(3, (s + 1) as Step));
  const back = () => setStep((s) => Math.max(0, (s - 1) as Step));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carta) return;
    if (!form.full_name || !form.email || !form.phone) {
      toast({ title: "Preencha nome, e-mail e WhatsApp", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("mentoria_cartas_leads").insert({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        carta_type: carta.label,
        credit_range: form.credit_range || carta.ticket,
        message: form.message.trim() || null,
        source: "quiz_landing",
        metadata: { carta_key: carta.key, urgencia },
      });
      if (error) throw error;
      setDone(true);
      toast({
        title: "Diagnóstico enviado!",
        description: "Vamos te chamar no WhatsApp em até 24h.",
      });
      window.open(WHATSAPP_LINK, "_blank", "noopener");
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente ou fale conosco pelo WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Helmet>
        <title>Quiz Cartas Contempladas | AtentAI</title>
        <meta
          name="description"
          content="Descubra em 4 passos a carta contemplada ideal para você. Crédito à vista, sem juros, liberado em até 7 dias."
        />
      </Helmet>

      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/cartas-contempladas" className="flex items-center gap-2">
            <img src="/logo-atentai.png" alt="AtentAI" className="h-8 w-8 rounded-full" />
            <span className="text-sm font-semibold tracking-tight">
              AtentAI · <span className="text-muted-foreground">Quiz Cartas</span>
            </span>
          </Link>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground md:inline-flex"
          >
            <MessageCircle className="h-4 w-4" /> (11) 98521-4895
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10 sm:py-16">
        {!done ? (
          <>
            {/* Header do quiz */}
            <div className="mb-8 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Quiz gratuito · 4 passos
              </span>
              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">
                Descubra a <span className="text-primary">carta contemplada</span> ideal para você
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
                Responda 4 perguntas rápidas e receba um diagnóstico personalizado com faixa de crédito, benefícios e próximos passos.
              </p>
            </div>

            {/* Progress */}
            <div className="mb-8">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Passo {step + 1} de 4</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10"
              >
                {/* STEP 0 — tipo de carta */}
                {step === 0 && (
                  <div>
                    <h2 className="text-xl font-semibold sm:text-2xl">
                      Qual é o seu objetivo?
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Escolha o tipo de carta que faz sentido para você.
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {CARTAS.map((c) => {
                        const Icon = c.icon;
                        const active = selected === c.key;
                        return (
                          <button
                            key={c.key}
                            type="button"
                            onClick={() => setSelected(c.key)}
                            className={`group flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                              active
                                ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                                : "border-border bg-background hover:border-primary/50"
                            }`}
                          >
                            <div
                              className={`grid h-12 w-12 place-items-center rounded-xl ${
                                active
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground group-hover:text-foreground"
                              }`}
                            >
                              <Icon className="h-6 w-6" />
                            </div>
                            <span className={`text-xs font-semibold ${active ? "text-primary" : "text-foreground"}`}>
                              {c.label.replace("Carta de ", "").replace("Carta ", "")}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 1 — benefícios (auto detalhe) */}
                {step === 1 && carta && (
                  <div>
                    <span className="text-xs uppercase tracking-widest text-primary">
                      {carta.short}
                    </span>
                    <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{carta.label}</h2>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Faixa de crédito:</span>
                      <span className="font-semibold text-foreground">{carta.ticket}</span>
                    </div>
                    <ul className="mt-6 space-y-3">
                      {carta.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                          <span className="text-sm text-foreground/85">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* STEP 2 — urgência */}
                {step === 2 && (
                  <div>
                    <h2 className="text-xl font-semibold sm:text-2xl">
                      Quando você quer usar o crédito?
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Isso nos ajuda a priorizar cartas com prazo compatível.
                    </p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {URGENCIA.map((u) => {
                        const active = urgencia === u.key;
                        return (
                          <button
                            key={u.key}
                            type="button"
                            onClick={() => setUrgencia(u.key)}
                            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                              active
                                ? "border-primary bg-primary/10"
                                : "border-border bg-background hover:border-primary/50"
                            }`}
                          >
                            <div
                              className={`h-4 w-4 flex-shrink-0 rounded-full border-2 ${
                                active ? "border-primary bg-primary" : "border-muted-foreground/40"
                              }`}
                            />
                            <span className={`text-sm font-medium ${active ? "text-primary" : "text-foreground"}`}>
                              {u.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 3 — dados */}
                {step === 3 && carta && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="mb-2">
                      <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        <ShieldCheck className="h-3.5 w-3.5" /> Seu diagnóstico está pronto
                      </span>
                      <h2 className="mt-3 text-xl font-semibold sm:text-2xl">
                        Onde enviamos sua proposta?
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Recomendação:{" "}
                        <span className="font-semibold text-primary">{carta.label}</span> ·{" "}
                        {carta.ticket}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="full_name">
                          <UserIcon className="mr-1 inline h-3.5 w-3.5" /> Nome completo *
                        </Label>
                        <Input
                          id="full_name"
                          value={form.full_name}
                          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                          placeholder="Seu nome"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">
                          <Phone className="mr-1 inline h-3.5 w-3.5" /> WhatsApp *
                        </Label>
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="(11) 98521-4895"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email">
                        <Mail className="mr-1 inline h-3.5 w-3.5" /> E-mail *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="voce@email.com"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="credit_range">Valor de crédito desejado</Label>
                      <Input
                        id="credit_range"
                        value={form.credit_range}
                        onChange={(e) => setForm({ ...form, credit_range: e.target.value })}
                        placeholder={`ex.: ${carta.ticket}`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="message">Alguma observação? (opcional)</Label>
                      <Textarea
                        id="message"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="min-h-20"
                        placeholder="Conte um pouco sobre o seu objetivo..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-full py-6 text-base font-semibold"
                    >
                      {submitting ? "Enviando..." : "Receber minha proposta"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Ao enviar você concorda em receber contato por WhatsApp e e-mail.
                    </p>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Nav do quiz */}
            {step < 3 && (
              <div className="mt-6 flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={back}
                  disabled={step === 0}
                  className="rounded-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button
                  onClick={next}
                  disabled={
                    (step === 0 && !selected) ||
                    (step === 2 && !urgencia)
                  }
                  className="rounded-full px-6"
                >
                  Continuar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          /* SUCCESS */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-primary/30 bg-primary/5 p-10 text-center"
          >
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold sm:text-3xl">Tudo certo, {form.full_name.split(" ")[0]}!</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Recebemos suas respostas. Um especialista vai te chamar no WhatsApp em até 24h com a proposta de{" "}
              <span className="font-semibold text-foreground">{carta?.label}</span>.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                <Button className="rounded-full px-6">
                  <MessageCircle className="mr-2 h-4 w-4" /> Adiantar pelo WhatsApp
                </Button>
              </a>
              <Link to="/cartas-contempladas">
                <Button variant="outline" className="rounded-full px-6">
                  Voltar para o site
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* KPIs */}
        {!done && (
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { v: "R$ 480M", l: "em créditos liberados" },
              { v: "2.300+", l: "contemplados" },
              { v: "8 anos", l: "de experiência" },
              { v: "7 dias", l: "média de liberação" },
            ].map((k) => (
              <div key={k.l} className="rounded-2xl border border-border bg-card p-4 text-center">
                <p className="text-xl font-bold text-primary sm:text-2xl">{k.v}</p>
                <p className="mt-1 text-xs text-muted-foreground">{k.l}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating WhatsApp */}
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 transition hover:scale-105 sm:bottom-6 sm:right-6"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}
