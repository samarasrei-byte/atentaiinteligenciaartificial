import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Car, Truck, Wrench, Sprout, Ship,
  CheckCircle2, ShieldCheck, TrendingUp, Sparkles,
  ArrowRight, ArrowLeft, MessageCircle, Phone, Mail, User as UserIcon,
  Calculator, Calendar, Percent, Wallet, TrendingDown, Landmark, PiggyBank,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";

const WHATSAPP_NUMBER = "5511985214895";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Olá! Fiz o Quiz de Cartas Contempladas e quero receber a proposta.",
)}`;

type CartaKey = "imovel" | "automovel" | "caminhao" | "reforma_servicos" | "rural" | "nautico";

interface CartaOption {
  key: CartaKey;
  label: string;
  short: string;
  icon: React.ElementType;
  benefits: string[];
  ticket: string;
  min: number; max: number; default: number;
  prazos: number[];
  taxaTotal: number;
}

const CARTAS: CartaOption[] = [
  { key: "imovel", label: "Carta de Imóvel", short: "Casa, apto, terreno ou comercial", icon: Home, ticket: "R$ 150 mil a R$ 2,5 mi", min: 150_000, max: 2_500_000, default: 400_000, prazos: [180, 200, 220, 240], taxaTotal: 0.20, benefits: [
      "Crédito à vista com poder de negociação",
      "Compra, construção, reforma ou quitação",
      "Sem juros — só taxa administrativa",
      "FGTS aceito para lance e amortização",
      "Parcelas até 40% menores que o banco",
      "Sem consulta ao score de crédito",
  ]},
  { key: "automovel", label: "Carta de Automóvel", short: "Carros zero, seminovos e importados", icon: Car, ticket: "R$ 40 mil a R$ 300 mil", min: 40_000, max: 300_000, default: 90_000, prazos: [60, 72, 80, 84], taxaTotal: 0.18, benefits: [
      "Negocie como cliente à vista",
      "Descontos exclusivos na concessionária",
      "Zero entrada e sem análise de score",
      "Liberação em até 7 dias após contemplação",
      "Aceita seminovos até 10 anos",
      "Ideal para motorista de app",
  ]},
  { key: "caminhao", label: "Caminhão / Pesados", short: "Frota, cavalo mecânico e maquinário", icon: Truck, ticket: "R$ 200 mil a R$ 900 mil", min: 200_000, max: 900_000, default: 350_000, prazos: [80, 100, 120], taxaTotal: 0.22, benefits: [
      "Renove frota sem descapitalizar",
      "Ideal para MEIs e transportadoras",
      "Aceita implementos e agregados",
      "Dedução fiscal integral para PJ",
      "Compatível com Repetro",
      "Máquinas agrícolas e construção",
  ]},
  { key: "reforma_servicos", label: "Serviços / Reforma", short: "Reforma, viagem, evento, capital de giro", icon: Wrench, ticket: "R$ 20 mil a R$ 250 mil", min: 20_000, max: 250_000, default: 60_000, prazos: [48, 60, 72], taxaTotal: 0.20, benefits: [
      "Uso livre do crédito",
      "Sem comprovação de destinação",
      "Até 25% mais barato que empréstimo",
      "Troca dívida cara (cartão/cheque)",
      "Financia reforma, evento, cirurgia",
      "Sem IOF extra do banco",
  ]},
  { key: "rural", label: "Rural / Agro", short: "Terras, tratores e implementos", icon: Sprout, ticket: "R$ 100 mil a R$ 3 mi", min: 100_000, max: 3_000_000, default: 500_000, prazos: [120, 180, 200, 240], taxaTotal: 0.20, benefits: [
      "Aquisição de terras produtivas",
      "Máquinas, tratores e pivôs",
      "Compatível com Plano Safra",
      "Planejamento sucessório rural",
      "Silos, armazéns e infraestrutura",
      "Redução de carga tributária",
  ]},
  { key: "nautico", label: "Náutico / Aéreo", short: "Lanchas, jet skis e aeronaves", icon: Ship, ticket: "R$ 80 mil a R$ 1,2 mi", min: 80_000, max: 1_200_000, default: 250_000, prazos: [72, 100, 120], taxaTotal: 0.22, benefits: [
      "Embarcações e aeronaves planejadas",
      "Renda extra com fretamento",
      "Sem juros abusivos do setor",
      "Assessoria Marinha / ANAC",
      "Aceita usados em bom estado",
      "Substitui multipropriedade cara",
  ]},
];

const URGENCIA = [
  { key: "asap", label: "Nos próximos 30 dias" },
  { key: "3m", label: "Em até 3 meses" },
  { key: "6m", label: "Em até 6 meses" },
  { key: "explorando", label: "Só estou explorando" },
];

const TAXA_BANCO_AA: Record<CartaKey, number> = {
  imovel: 0.115, automovel: 0.245, caminhao: 0.22,
  reforma_servicos: 0.42, rural: 0.14, nautico: 0.28,
};

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const formatBRLInput = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (!digits) return "";
  return Number(digits).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
};
const parseBRLInput = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
};

const priceInstallment = (principal: number, annualRate: number, months: number) => {
  if (!principal || !months) return 0;
  const i = Math.pow(1 + annualRate, 1 / 12) - 1;
  if (i === 0) return principal / months;
  return (principal * i) / (1 - Math.pow(1 + i, -months));
};

const AGIO_CONTEMPLADA = 0.18;
const ESPERA_MEDIA_MESES = 24;

const TOTAL_STEPS = 9; // 0..8

export default function CartasContempladasQuiz() {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<CartaKey | null>(null);
  const [urgencia, setUrgencia] = useState<string | null>(null);
  const [credito, setCredito] = useState<number>(0);
  const [creditoInput, setCreditoInput] = useState<string>("");
  const [prazo, setPrazo] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [lgpd, setLgpd] = useState(false);
  const [partialSaved, setPartialSaved] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", message: "" });

  const carta = useMemo(() => (selected ? CARTAS.find((c) => c.key === selected)! : null), [selected]);

  const handleSelect = (k: CartaKey) => {
    setSelected(k);
    const c = CARTAS.find((x) => x.key === k)!;
    setCredito(c.default);
    setCreditoInput(formatBRLInput(String(c.default)));
    setPrazo(c.prazos[Math.floor(c.prazos.length / 2)]);
  };

  const creditoValido = !!carta && credito >= carta.min && credito <= carta.max;
  const prazoValido = prazo >= 12 && prazo <= 300;
  const errorCredito = !carta ? null
    : credito === 0 ? "Informe o valor do crédito"
    : credito < carta.min ? `Mínimo: ${brl(carta.min)}`
    : credito > carta.max ? `Máximo: ${brl(carta.max)}`
    : null;
  const errorPrazo = prazo === 0 ? "Informe o prazo em meses"
    : prazo < 12 ? "Prazo mínimo: 12 meses"
    : prazo > 300 ? "Prazo máximo: 300 meses"
    : null;

  const simulacao = useMemo(() => {
    if (!carta || !creditoValido || !prazoValido) return null;
    const totalComTaxa = credito * (1 + carta.taxaTotal);
    const parcela = totalComTaxa / prazo;
    const lanceSugerido = credito * 0.25;
    const bancoAA = TAXA_BANCO_AA[carta.key];
    const parcelaBanco = priceInstallment(credito, bancoAA, prazo);
    const totalBanco = parcelaBanco * prazo;
    const economia = Math.max(0, totalBanco - totalComTaxa);
    const agio = credito * AGIO_CONTEMPLADA;
    const totalContemplada = totalComTaxa + agio;
    const parcelaContemplada = totalComTaxa / prazo;
    return { parcela, totalComTaxa, lanceSugerido, parcelaBanco, totalBanco, economia, bancoAA, agio, totalContemplada, parcelaContemplada };
  }, [carta, credito, prazo, creditoValido, prazoValido]);

  const progress = ((step + 1) / TOTAL_STEPS) * 100;
  const next = () => setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());

  const canNext = (() => {
    if (step === 2 && !selected) return false;
    if (step === 4 && !creditoValido) return false;
    if (step === 5 && !prazoValido) return false;
    if (step === 7 && !urgencia) return false;
    return true;
  })();

  // Captura parcial ao entrar na simulação (passo 6): salva se já houver email
  const savePartialLead = async () => {
    if (partialSaved || !carta || !emailValido || !form.full_name.trim()) return;
    try {
      await supabase.from("mentoria_cartas_leads").insert({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || "pendente",
        carta_type: carta.label,
        credit_range: credito ? brl(credito) : carta.ticket,
        message: "[LEAD PARCIAL - quiz não finalizado]",
        source: "quiz_landing_partial",
        metadata: { carta_key: carta.key, urgencia, partial: true },
      });
      setPartialSaved(true);
    } catch (e) { console.warn("partial lead skipped", e); }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carta) return;
    if (!form.full_name || !form.email || !form.phone) {
      toast({ title: "Preencha nome, e-mail e WhatsApp", variant: "destructive" });
      return;
    }
    if (!emailValido) {
      toast({ title: "E-mail inválido", variant: "destructive" });
      return;
    }
    if (!lgpd) {
      toast({ title: "Autorize o contato (LGPD) para continuar", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("mentoria_cartas_leads").insert({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        carta_type: carta.label,
        credit_range: credito ? brl(credito) : carta.ticket,
        message: form.message.trim() || null,
        source: "quiz_landing",
        metadata: {
          carta_key: carta.key, urgencia, lgpd_consent: true,
          simulacao: simulacao ? {
            credito, prazo_meses: prazo,
            parcela_estimada: Math.round(simulacao.parcela),
            total_com_taxa: Math.round(simulacao.totalComTaxa),
            lance_sugerido: Math.round(simulacao.lanceSugerido),
            taxa_total_pct: carta.taxaTotal * 100,
            parcela_banco: Math.round(simulacao.parcelaBanco),
            economia_estimada: Math.round(simulacao.economia),
            taxa_banco_aa_pct: simulacao.bancoAA * 100,
          } : null,
        },
      });
      if (error) throw error;
      setDone(true);
      toast({ title: "Diagnóstico enviado!", description: "Vamos te chamar no WhatsApp em até 24h." });
      window.open(WHATSAPP_LINK, "_blank", "noopener");
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao enviar", description: "Tente novamente ou fale conosco pelo WhatsApp.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const stepTitles = [
    "Benefícios da carta contemplada",
    "Banco x Carta contemplada",
    "Qual seu objetivo?",
    "Vantagens específicas",
    "Valor do crédito",
    "Prazo em meses",
    "Sua simulação",
    "Quando quer usar?",
    "Resumo e proposta",
  ];


  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background text-foreground antialiased">
      <Helmet>
        <title>Quiz Cartas Contempladas | AtentAI</title>
        <meta name="description" content="Descubra em 9 passos a carta contemplada ideal, simule sua parcela e receba proposta. Crédito à vista, sem juros, liberado em até 7 dias." />
      </Helmet>

      {/* NAV */}
      <header className="flex-shrink-0 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5 sm:px-6 sm:py-3">
          <Link to="/cartas-contempladas" className="flex items-center gap-2">
            <img src="/logo-atentai.png" alt="AtentAI" className="h-6 w-6 rounded-full sm:h-7 sm:w-7" />
            <span className="text-xs font-semibold tracking-tight sm:text-sm">
              AtentAI · <span className="text-muted-foreground">Quiz Cartas</span>
            </span>
          </Link>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground md:inline-flex">
            <MessageCircle className="h-3.5 w-3.5" /> (11) 98521-4895
          </a>
        </div>
      </header>

      {/* Progress + título compactos */}
      {!done && (
        <div className="flex-shrink-0 border-b border-border/60 bg-background/60 backdrop-blur">
          <div className="mx-auto max-w-3xl px-4 py-2.5 sm:px-6 sm:py-3">
            <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="font-medium">Passo {step + 1} de {TOTAL_STEPS} · <span className="text-foreground">{stepTitles[step]}</span></span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        </div>
      )}

      {/* CONTENT AREA — flex-1, overflow interno somente */}
      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto flex min-h-full max-w-3xl flex-col px-4 py-4 sm:px-6 sm:py-6">
          {!done ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6"
              >
                {/* STEP 0 — benefícios */}
                {step === 0 && (
                  <div>
                    <h2 className="text-lg font-semibold sm:text-2xl">Por que uma carta contemplada?</h2>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                      3 vantagens que ninguém te conta no banco.
                    </p>
                    <div className="mt-4 grid gap-2.5 sm:mt-5 sm:grid-cols-3 sm:gap-3">
                      {[
                        { icon: PiggyBank, title: "Zero juros", desc: "Só taxa administrativa. Sem juros compostos." },
                        { icon: TrendingDown, title: "Até 45% menor", desc: "Parcela x financiamento tradicional." },
                        { icon: ShieldCheck, title: "Poder de à vista", desc: "Negocie desconto como quem paga na hora." },
                      ].map((b) => (
                        <div key={b.title} className="rounded-xl border border-border bg-background/60 p-3 sm:p-4">
                          <b.icon className="h-5 w-5 text-primary" />
                          <p className="mt-2 text-sm font-semibold">{b.title}</p>
                          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">{b.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 1 — Comparativo banco x carta */}
                {step === 1 && (
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <TrendingDown className="h-3.5 w-3.5" /> Comparativo real
                    </span>
                    <h2 className="mt-3 text-lg font-semibold sm:text-2xl">Banco x Carta contemplada</h2>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                      Exemplo: R$ 100.000 em 120 meses.
                    </p>
                    {(() => {
                      const V = 100_000, N = 120, rBanco = 0.22;
                      const pBanco = priceInstallment(V, rBanco, N);
                      const pCarta = (V * 1.20) / N;
                      const econ = pBanco * N - V * 1.20;
                      return (
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-destructive">
                              <Landmark className="h-3.5 w-3.5" /> Banco (CDC ~22% a.a.)
                            </div>
                            <p className="mt-1 text-xl font-bold text-foreground">{brl(pBanco)}<span className="text-xs font-normal text-muted-foreground">/mês</span></p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">Total: {brl(pBanco * N)}</p>
                          </div>
                          <div className="rounded-xl border border-primary/40 bg-primary/10 p-3">
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-primary">
                              <Sparkles className="h-3.5 w-3.5" /> Carta contemplada
                            </div>
                            <p className="mt-1 text-xl font-bold text-primary">{brl(pCarta)}<span className="text-xs font-normal text-muted-foreground">/mês</span></p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">Total: {brl(V * 1.20)}</p>
                          </div>
                          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3">
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                              <PiggyBank className="h-3.5 w-3.5" /> Economia
                            </div>
                            <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">{brl(econ)}</p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">no total pago</p>
                          </div>
                        </div>
                      );
                    })()}
                    <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                      * Consórcio cobra apenas taxa administrativa (~20%); banco cobra juros compostos ao longo do tempo.
                    </p>
                  </div>
                )}

                {/* STEP 2 — tipo de carta */}
                {step === 2 && (
                  <div>
                    <h2 className="text-lg font-semibold sm:text-2xl">Qual é o seu objetivo?</h2>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Escolha o tipo de carta.</p>
                    <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
                      {CARTAS.map((c) => {
                        const Icon = c.icon;
                        const active = selected === c.key;
                        return (
                          <button key={c.key} type="button" onClick={() => handleSelect(c.key)}
                            className={`group flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all sm:p-4 ${active ? "border-primary bg-primary/10 shadow-md shadow-primary/10" : "border-border bg-background hover:border-primary/50"}`}>
                            <div className={`grid h-10 w-10 place-items-center rounded-xl sm:h-12 sm:w-12 ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:text-foreground"}`}>
                              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <span className={`text-[11px] font-semibold leading-tight sm:text-xs ${active ? "text-primary" : "text-foreground"}`}>
                              {c.label.replace("Carta de ", "").replace("Carta ", "")}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 3 — benefícios da carta escolhida */}
                {step === 3 && carta && (
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-primary sm:text-xs">{carta.short}</span>
                    <h2 className="mt-1 text-xl font-bold sm:text-2xl">{carta.label}</h2>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      <span className="text-muted-foreground">Faixa:</span>
                      <span className="font-semibold text-foreground">{carta.ticket}</span>
                    </div>
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2 sm:gap-2.5">
                      {carta.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2 rounded-xl border border-border/60 bg-background/60 p-2.5">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                          <span className="text-xs text-foreground/85 sm:text-sm">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* STEP 4 — Valor do crédito */}
                {step === 4 && carta && (
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <Calculator className="h-3.5 w-3.5" /> Valor do crédito
                    </span>
                    <h2 className="mt-3 text-lg font-semibold sm:text-2xl">Quanto você precisa?</h2>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                      Faixa disponível para <b>{carta.label}</b>: {brl(carta.min)} – {brl(carta.max)}
                    </p>
                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="credito-input" className="text-sm font-medium">Valor</Label>
                        <span className="text-lg font-bold text-primary">{brl(credito)}</span>
                      </div>
                      <Input id="credito-input" inputMode="numeric" value={creditoInput}
                        onChange={(e) => { const m = formatBRLInput(e.target.value); setCreditoInput(m); setCredito(parseBRLInput(m)); }}
                        onBlur={() => { if (carta && credito) { const c = Math.max(carta.min, Math.min(carta.max, credito)); setCredito(c); setCreditoInput(formatBRLInput(String(c))); } }}
                        placeholder="Digite o valor desejado"
                        className={`h-12 text-base font-semibold ${errorCredito ? "border-destructive focus-visible:ring-destructive" : ""}`} />
                      <Slider value={[Math.max(carta.min, Math.min(carta.max, credito || carta.min))]}
                        min={carta.min} max={carta.max}
                        step={Math.max(1000, Math.round((carta.max - carta.min) / 100))}
                        onValueChange={(v) => { setCredito(v[0]); setCreditoInput(formatBRLInput(String(v[0]))); }} />
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>{brl(carta.min)}</span><span>{brl(carta.max)}</span>
                      </div>
                      {errorCredito && <p className="text-xs font-medium text-destructive">{errorCredito}</p>}
                    </div>
                  </div>
                )}

                {/* STEP 5 — Prazo */}
                {step === 5 && carta && (
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <Calendar className="h-3.5 w-3.5" /> Prazo
                    </span>
                    <h2 className="mt-3 text-lg font-semibold sm:text-2xl">Em quantos meses?</h2>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                      Escolha um prazo sugerido ou digite (12 a 300 meses).
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {carta.prazos.map((p) => (
                        <button key={p} type="button" onClick={() => setPrazo(p)}
                          className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${prazo === p ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/50"}`}>
                          {p}x
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Input id="prazo-custom" type="number" inputMode="numeric" min={12} max={300}
                        value={prazo || ""} onChange={(e) => { const v = parseInt(e.target.value, 10); setPrazo(Number.isFinite(v) ? Math.max(0, Math.min(300, v)) : 0); }}
                        placeholder="Ou digite (12 a 300)"
                        className={`h-12 flex-1 text-base ${errorPrazo ? "border-destructive focus-visible:ring-destructive" : ""}`} />
                      <span className="text-sm text-muted-foreground">meses</span>
                    </div>
                    {errorPrazo && <p className="mt-2 text-xs font-medium text-destructive">{errorPrazo}</p>}
                  </div>
                )}

                {/* STEP 6 — Resultado */}
                {step === 6 && carta && simulacao && (
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <Sparkles className="h-3.5 w-3.5" /> Sua simulação
                    </span>
                    <h2 className="mt-3 text-lg font-semibold sm:text-2xl">{brl(credito)} em {prazo}x</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                        <p className="text-[11px] text-muted-foreground">Parcela mensal</p>
                        <p className="text-xl font-bold text-primary sm:text-2xl">{brl(simulacao.parcela)}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">por {prazo} meses</p>
                      </div>
                      <div className="rounded-xl border border-border bg-background/60 p-3">
                        <p className="text-[11px] text-muted-foreground"><Wallet className="mr-1 inline h-3 w-3" />Lance sugerido</p>
                        <p className="text-lg font-semibold text-foreground sm:text-xl">{brl(simulacao.lanceSugerido)}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">~25% do crédito</p>
                      </div>
                      <div className="rounded-xl border border-border bg-background/60 p-3">
                        <p className="text-[11px] text-muted-foreground"><Percent className="mr-1 inline h-3 w-3" />Total pago</p>
                        <p className="text-lg font-semibold text-foreground sm:text-xl">{brl(simulacao.totalComTaxa)}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">sem juros compostos</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-primary/40 bg-primary/10 p-3">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                          <Sparkles className="h-3.5 w-3.5" /> Contemplada (imediata)
                        </div>
                        <p className="mt-1 text-lg font-bold">{brl(simulacao.parcelaContemplada)}<span className="text-xs font-normal text-muted-foreground">/mês</span></p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">+ ágio à vista: <b className="text-foreground">{brl(simulacao.agio)}</b> · crédito em 7 dias</p>
                      </div>
                      <div className="rounded-xl border border-border bg-muted/40 p-3">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" /> Cota comum
                        </div>
                        <p className="mt-1 text-lg font-bold">{brl(simulacao.parcela)}<span className="text-xs font-normal text-muted-foreground">/mês</span></p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">Sem ágio · espera ~{ESPERA_MEDIA_MESES} meses</p>
                      </div>
                    </div>
                    <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                      * Valores ilustrativos. Podem variar por administradora.
                    </p>
                  </div>
                )}
                {step === 6 && (!carta || !simulacao) && (
                  <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                    Volte e ajuste crédito e prazo para gerar a simulação.
                  </div>
                )}

                {/* STEP 7 — urgência */}
                {step === 7 && (
                  <div>
                    <h2 className="text-lg font-semibold sm:text-2xl">Quando quer usar o crédito?</h2>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Isso ajusta nossa recomendação final.</p>
                    <div className="mt-5 grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                      {URGENCIA.map((u) => {
                        const active = urgencia === u.key;
                        return (
                          <button key={u.key} type="button" onClick={() => setUrgencia(u.key)}
                            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${active ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/50"}`}>
                            <div className={`h-4 w-4 flex-shrink-0 rounded-full border-2 ${active ? "border-primary bg-primary" : "border-muted-foreground/40"}`} />
                            <span className={`text-sm font-medium ${active ? "text-primary" : "text-foreground"}`}>{u.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 8 — Resumo + formulário */}
                {step === 8 && carta && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        <ShieldCheck className="h-3.5 w-3.5" /> Diagnóstico pronto
                      </span>
                      <h2 className="mt-2 text-lg font-semibold sm:text-2xl">Onde enviamos sua proposta?</h2>
                      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                        <span className="font-semibold text-primary">{carta.label}</span> · {brl(credito)} em {prazo}x
                      </p>
                    </div>

                    {simulacao && (
                      <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-3 sm:p-4">
                        <div className="grid gap-2.5 sm:grid-cols-3">
                          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-2.5">
                            <div className="text-[10px] font-medium text-destructive"><Landmark className="mr-1 inline h-3 w-3" />Banco</div>
                            <p className="mt-0.5 text-base font-bold">{brl(simulacao.parcelaBanco)}<span className="text-[10px] text-muted-foreground">/mês</span></p>
                          </div>
                          <div className="rounded-lg border border-primary/40 bg-primary/10 p-2.5">
                            <div className="text-[10px] font-medium text-primary"><Sparkles className="mr-1 inline h-3 w-3" />Consórcio</div>
                            <p className="mt-0.5 text-base font-bold text-primary">{brl(simulacao.parcela)}<span className="text-[10px] text-muted-foreground">/mês</span></p>
                          </div>
                          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2.5">
                            <div className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400"><PiggyBank className="mr-1 inline h-3 w-3" />Economia</div>
                            <p className="mt-0.5 text-base font-bold text-emerald-600 dark:text-emerald-400">{brl(simulacao.economia)}</p>
                          </div>
                        </div>
                        <p className="mt-2.5 text-[11px] leading-relaxed text-foreground/85">
                          <b className="text-primary">Recomendação:</b>{" "}
                          {urgencia === "asap"
                            ? `Carta JÁ CONTEMPLADA (ágio ${brl(simulacao.agio)}) — crédito em 7 dias.`
                            : urgencia === "3m"
                              ? `Contemplada com ágio de ${brl(simulacao.agio)} é o caminho seguro.`
                              : urgencia === "6m"
                                ? `Cota comum com lance de ${brl(simulacao.lanceSugerido)}.`
                                : `Cota comum economiza o ágio de ${brl(simulacao.agio)}.`}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="full_name" className="text-xs"><UserIcon className="mr-1 inline h-3 w-3" />Nome *</Label>
                        <Input id="full_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Seu nome" required className="h-11" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-xs"><Phone className="mr-1 inline h-3 w-3" />WhatsApp *</Label>
                        <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 98521-4895" required className="h-11" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs"><Mail className="mr-1 inline h-3 w-3" />E-mail *</Label>
                      <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="voce@email.com" required className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="message" className="text-xs">Observação (opcional)</Label>
                      <Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="min-h-16" placeholder="Conte um pouco sobre seu objetivo..." />
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full rounded-full py-5 text-sm font-semibold">
                      {submitting ? "Enviando..." : "Receber minha proposta"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <p className="text-center text-[10px] text-muted-foreground">
                      Ao enviar você concorda em receber contato por WhatsApp e e-mail.
                    </p>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center sm:p-10">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground sm:h-16 sm:w-16">
                <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <h2 className="text-xl font-bold sm:text-3xl">Tudo certo, {form.full_name.split(" ")[0]}!</h2>
              <p className="mx-auto mt-3 max-w-md text-xs text-muted-foreground sm:text-sm">
                Recebemos suas respostas e a simulação. Um especialista vai te chamar no WhatsApp em até 24h com a proposta de{" "}
                <span className="font-semibold text-foreground">{carta?.label}</span>
                {simulacao && <> — parcela estimada de <span className="font-semibold text-foreground">{brl(simulacao.parcela)}</span>.</>}
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button className="w-full rounded-full px-6 sm:w-auto"><MessageCircle className="mr-2 h-4 w-4" /> Adiantar pelo WhatsApp</Button>
                </a>
                <Link to="/cartas-contempladas" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full rounded-full px-6 sm:w-auto">Voltar para o site</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* FOOTER NAV fixo */}
      {!done && (
        <footer className="flex-shrink-0 border-t border-border bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5">
            <Button variant="ghost" onClick={back} disabled={step === 0} className="rounded-full" size="sm">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Voltar
            </Button>
            {step < TOTAL_STEPS - 1 ? (
              <Button onClick={next} disabled={!canNext} className="rounded-full px-5 sm:px-6" size="sm">
                Continuar <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            ) : (
              <span className="text-[11px] text-muted-foreground">Preencha e envie ↑</span>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
