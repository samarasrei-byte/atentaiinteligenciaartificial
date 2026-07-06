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
  /** faixa de crédito em R$ para o simulador */
  min: number;
  max: number;
  default: number;
  /** prazos típicos em meses */
  prazos: number[];
  /** taxa total estimada (admin + fundo + seguro) sobre o crédito */
  taxaTotal: number;
}

const CARTAS: CartaOption[] = [
  {
    key: "imovel",
    label: "Carta de Imóvel",
    short: "Casa, apartamento, terreno ou comercial",
    icon: Home,
    ticket: "R$ 150 mil a R$ 2,5 milhões",
    min: 150_000, max: 2_500_000, default: 400_000,
    prazos: [180, 200, 220, 240],
    taxaTotal: 0.20,
    benefits: [
      "Crédito à vista com poder de negociação de cliente pagante",
      "Compra, construção, reforma ou quitação de financiamento",
      "Sem juros do financiamento tradicional — só taxa administrativa",
      "Uso do FGTS permitido para lance e amortização",
      "Aceita permuta com outro imóvel",
      "Parcelas até 40% menores que financiamento bancário",
      "Sem consulta ao score de crédito para contemplação",
      "Escritura e transferência com assessoria jurídica inclusa",
    ],
  },
  {
    key: "automovel",
    label: "Carta de Automóvel",
    short: "Carros zero, seminovos e importados",
    icon: Car,
    ticket: "R$ 40 mil a R$ 300 mil",
    min: 40_000, max: 300_000, default: 90_000,
    prazos: [60, 72, 80, 84],
    taxaTotal: 0.18,
    benefits: [
      "Negocie como cliente à vista na concessionária",
      "Descontos exclusivos que não existem no financiamento",
      "Zero entrada e sem análise de score",
      "Liberação em até 7 dias úteis após contemplação",
      "Aceita carros seminovos com até 10 anos",
      "Ideal para app de motorista (Uber, 99)",
      "Troca de veículo simplificada sem quitar o consórcio",
      "Seguro auto opcional embutido na parcela",
    ],
  },
  {
    key: "caminhao",
    label: "Carta de Caminhão / Pesados",
    short: "Frota, cavalo mecânico e maquinário",
    icon: Truck,
    ticket: "R$ 200 mil a R$ 900 mil",
    min: 200_000, max: 900_000, default: 350_000,
    prazos: [80, 100, 120],
    taxaTotal: 0.22,
    benefits: [
      "Renove ou amplie sua frota sem descapitalizar o caixa",
      "Ideal para MEIs, transportadoras e autônomos",
      "Aceita implementos, carretas e agregados",
      "Dedução fiscal integral para pessoa jurídica",
      "Compatível com o Repetro para transporte de carga",
      "Aquisição de máquinas agrícolas e de construção",
      "Prazo de até 120 meses com parcela previsível",
      "Liberação para pagar fornecedor no exterior (importados)",
    ],
  },
  {
    key: "reforma_servicos",
    label: "Serviços e Reforma",
    short: "Reforma, viagens, eventos e capital de giro",
    icon: Wrench,
    ticket: "R$ 20 mil a R$ 250 mil",
    min: 20_000, max: 250_000, default: 60_000,
    prazos: [48, 60, 72],
    taxaTotal: 0.20,
    benefits: [
      "Uso livre do crédito após contemplação",
      "Sem comprovação obrigatória de destinação",
      "Parcelas até 25% menores que empréstimos pessoais",
      "Perfeito para trocar dívida cara (cheque especial, cartão)",
      "Financia reforma, festa de casamento, cirurgia estética",
      "Capital de giro para expandir o negócio",
      "Aceita como garantia para outras operações",
      "Sem IOF adicional como em empréstimos bancários",
    ],
  },
  {
    key: "rural",
    label: "Rural / Agronegócio",
    short: "Terras, tratores e implementos",
    icon: Sprout,
    ticket: "R$ 100 mil a R$ 3 milhões",
    min: 100_000, max: 3_000_000, default: 500_000,
    prazos: [120, 180, 200, 240],
    taxaTotal: 0.20,
    benefits: [
      "Aquisição de terras produtivas e propriedades rurais",
      "Máquinas, tratores, colheitadeiras e pivôs",
      "Compatível com linhas do Plano Safra",
      "Planejamento sucessório rural com blindagem patrimonial",
      "Construção de silos, armazéns e infraestrutura",
      "Ideal para expansão de área plantada",
      "Aceita safra futura como parte do lance",
      "Redução de carga tributária para produtor rural",
    ],
  },
  {
    key: "nautico",
    label: "Náutico e Aeronáutico",
    short: "Lanchas, jet skis e aeronaves",
    icon: Ship,
    ticket: "R$ 80 mil a R$ 1,2 milhão",
    min: 80_000, max: 1_200_000, default: 250_000,
    prazos: [72, 100, 120],
    taxaTotal: 0.22,
    benefits: [
      "Aquisição planejada de embarcações e aeronaves",
      "Fonte de renda extra com fretamento e táxi aéreo",
      "Sem juros abusivos do financiamento naval / aeronáutico",
      "Assessoria completa de documentação (Marinha / ANAC)",
      "Aceita embarcações usadas em bom estado",
      "Seguro casco e responsabilidade civil opcionais",
      "Ideal para PJ com dedução fiscal",
      "Substitui cotas de multipropriedade caras",
    ],
  },
];

const URGENCIA = [
  { key: "asap", label: "Nos próximos 30 dias" },
  { key: "3m", label: "Em até 3 meses" },
  { key: "6m", label: "Em até 6 meses" },
  { key: "explorando", label: "Só estou explorando" },
];

type Step = 0 | 1 | 2 | 3 | 4;

// Taxa média anual de mercado (banco) por tipo de crédito — para comparação
const TAXA_BANCO_AA: Record<CartaKey, number> = {
  imovel: 0.115,           // financiamento imobiliário
  automovel: 0.245,        // CDC veículo
  caminhao: 0.22,          // Finame / CDC pesados
  reforma_servicos: 0.42,  // crédito pessoal / consignado
  rural: 0.14,             // crédito rural / Pronaf comercial
  nautico: 0.28,           // financiamento náutico / aeronáutico
};

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

// Parcela Price: P = V * i / (1 - (1+i)^-n)
const priceInstallment = (principal: number, annualRate: number, months: number) => {
  const i = Math.pow(1 + annualRate, 1 / 12) - 1;
  if (i === 0) return principal / months;
  return (principal * i) / (1 - Math.pow(1 + i, -months));
};

export default function CartasContempladasQuiz() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(0);
  const [selected, setSelected] = useState<CartaKey | null>(null);
  const [urgencia, setUrgencia] = useState<string | null>(null);
  const [credito, setCredito] = useState<number>(0);
  const [prazo, setPrazo] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    message: "",
  });

  const carta = useMemo(
    () => (selected ? CARTAS.find((c) => c.key === selected)! : null),
    [selected],
  );

  // reset simulator quando muda carta
  const handleSelect = (k: CartaKey) => {
    setSelected(k);
    const c = CARTAS.find((x) => x.key === k)!;
    setCredito(c.default);
    setPrazo(c.prazos[Math.floor(c.prazos.length / 2)]);
  };

  const simulacao = useMemo(() => {
    if (!carta || !credito || !prazo) return null;
    const totalComTaxa = credito * (1 + carta.taxaTotal);
    const parcela = totalComTaxa / prazo;
    const lanceSugerido = credito * 0.25;
    const bancoAA = TAXA_BANCO_AA[carta.key];
    const parcelaBanco = priceInstallment(credito, bancoAA, prazo);
    const totalBanco = parcelaBanco * prazo;
    const economia = Math.max(0, totalBanco - totalComTaxa);
    return {
      parcela,
      totalComTaxa,
      lanceSugerido,
      taxaMensalEquivalente: (carta.taxaTotal / prazo) * 100,
      parcelaBanco,
      totalBanco,
      economia,
      bancoAA,
    };
  }, [carta, credito, prazo]);

  const progress = ((step + 1) / 5) * 100;

  const next = () => setStep((s) => Math.min(4, s + 1) as Step);
  const back = () => setStep((s) => Math.max(0, s - 1) as Step);

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
        credit_range: credito ? brl(credito) : carta.ticket,
        message: form.message.trim() || null,
        source: "quiz_landing",
        metadata: {
          carta_key: carta.key,
          urgencia,
          simulacao: simulacao
            ? {
                credito,
                prazo_meses: prazo,
                parcela_estimada: Math.round(simulacao.parcela),
                total_com_taxa: Math.round(simulacao.totalComTaxa),
                lance_sugerido: Math.round(simulacao.lanceSugerido),
                taxa_total_pct: carta.taxaTotal * 100,
              }
            : null,
        },
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
          content="Descubra em 5 passos a carta contemplada ideal, simule sua parcela e receba proposta. Crédito à vista, sem juros, liberado em até 7 dias."
        />
      </Helmet>

      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link to="/cartas-contempladas" className="flex items-center gap-2">
            <img src="/logo-atentai.png" alt="AtentAI" className="h-7 w-7 rounded-full sm:h-8 sm:w-8" />
            <span className="text-xs font-semibold tracking-tight sm:text-sm">
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

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-16">
        {!done ? (
          <>
            {/* Header do quiz */}
            <div className="mb-6 text-center sm:mb-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary sm:px-4">
                <Sparkles className="h-3.5 w-3.5" /> Quiz gratuito · 5 passos
              </span>
              <h1 className="mt-4 text-2xl font-bold tracking-tight sm:mt-5 sm:text-5xl">
                Descubra a <span className="text-primary">carta contemplada</span> ideal para você
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:mt-4 sm:text-base">
                Responda 5 perguntas rápidas, simule a parcela do seu consórcio e receba um diagnóstico personalizado.
              </p>
            </div>

            {/* Progress */}
            <div className="mb-6 sm:mb-8">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Passo {step + 1} de 5</span>
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
                className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:rounded-3xl sm:p-10"
              >
                {/* STEP 0 — tipo de carta */}
                {step === 0 && (
                  <div>
                    <h2 className="text-lg font-semibold sm:text-2xl">
                      Qual é o seu objetivo?
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                      Escolha o tipo de carta que faz sentido para você.
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:grid-cols-3 sm:gap-3">
                      {CARTAS.map((c) => {
                        const Icon = c.icon;
                        const active = selected === c.key;
                        return (
                          <button
                            key={c.key}
                            type="button"
                            onClick={() => handleSelect(c.key)}
                            className={`group flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all sm:p-4 ${
                              active
                                ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                                : "border-border bg-background hover:border-primary/50"
                            }`}
                          >
                            <div
                              className={`grid h-10 w-10 place-items-center rounded-xl sm:h-12 sm:w-12 ${
                                active
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground group-hover:text-foreground"
                              }`}
                            >
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

                {/* STEP 1 — benefícios */}
                {step === 1 && carta && (
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-primary sm:text-xs">
                      {carta.short}
                    </span>
                    <h2 className="mt-2 text-xl font-bold sm:text-3xl">{carta.label}</h2>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs sm:mt-4 sm:px-4 sm:py-2 sm:text-sm">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Faixa:</span>
                      <span className="font-semibold text-foreground">{carta.ticket}</span>
                    </div>
                    <ul className="mt-5 grid gap-2.5 sm:mt-6 sm:grid-cols-2 sm:gap-3">
                      {carta.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-background/60 p-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary sm:h-5 sm:w-5" />
                          <span className="text-xs text-foreground/85 sm:text-sm">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* STEP 2 — SIMULADOR */}
                {step === 2 && carta && simulacao && (
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <Calculator className="h-3.5 w-3.5" /> Simulador de consórcio
                    </span>
                    <h2 className="mt-3 text-xl font-semibold sm:text-2xl">
                      Simule sua parcela
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                      Estimativa baseada na taxa administrativa média do mercado ({(carta.taxaTotal * 100).toFixed(0)}% total).
                      Valores finais podem variar por administradora.
                    </p>

                    {/* Slider crédito */}
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Valor do crédito</Label>
                        <span className="text-base font-bold text-primary sm:text-lg">{brl(credito)}</span>
                      </div>
                      <Slider
                        value={[credito]}
                        min={carta.min}
                        max={carta.max}
                        step={Math.max(1000, Math.round((carta.max - carta.min) / 100))}
                        onValueChange={(v) => setCredito(v[0])}
                      />
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>{brl(carta.min)}</span>
                        <span>{brl(carta.max)}</span>
                      </div>
                    </div>

                    {/* Prazo */}
                    <div className="mt-6 space-y-2">
                      <Label className="text-sm font-medium">
                        <Calendar className="mr-1 inline h-3.5 w-3.5" /> Prazo (meses)
                      </Label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {carta.prazos.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPrazo(p)}
                            className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                              prazo === p
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background hover:border-primary/50"
                            }`}
                          >
                            {p}x
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Resultado */}
                    <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:p-6">
                      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                        <Sparkles className="h-4 w-4" /> Estimativa
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <p className="text-[11px] text-muted-foreground">Parcela mensal</p>
                          <p className="text-xl font-bold text-foreground sm:text-2xl">
                            {brl(simulacao.parcela)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">por {prazo} meses</p>
                        </div>
                        <div className="border-t border-border pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                          <p className="text-[11px] text-muted-foreground">
                            <Wallet className="mr-1 inline h-3 w-3" /> Lance sugerido
                          </p>
                          <p className="text-lg font-semibold text-foreground sm:text-xl">
                            {brl(simulacao.lanceSugerido)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">~25% do crédito</p>
                        </div>
                        <div className="border-t border-border pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                          <p className="text-[11px] text-muted-foreground">
                            <Percent className="mr-1 inline h-3 w-3" /> Total com taxa
                          </p>
                          <p className="text-lg font-semibold text-foreground sm:text-xl">
                            {brl(simulacao.totalComTaxa)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">sem juros compostos</p>
                        </div>
                      </div>
                      <p className="mt-4 border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">
                        * Simulação ilustrativa. Consórcio não cobra juros — apenas taxa administrativa, fundo de reserva e seguro (variam por administradora). A carta contemplada permite antecipar essa parcela pagando à vista com poder de negociação.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 3 — urgência */}
                {step === 3 && (
                  <div>
                    <h2 className="text-lg font-semibold sm:text-2xl">
                      Quando você quer usar o crédito?
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                      Isso nos ajuda a priorizar cartas com prazo compatível.
                    </p>
                    <div className="mt-5 grid gap-2.5 sm:mt-6 sm:grid-cols-2 sm:gap-3">
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

                {/* STEP 4 — dados */}
                {step === 4 && carta && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="mb-2">
                      <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        <ShieldCheck className="h-3.5 w-3.5" /> Seu diagnóstico está pronto
                      </span>
                      <h2 className="mt-3 text-lg font-semibold sm:text-2xl">
                        Onde enviamos sua proposta?
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                        <span className="font-semibold text-primary">{carta.label}</span> · {brl(credito)} em {prazo}x de{" "}
                        <span className="font-semibold text-foreground">
                          {simulacao ? brl(simulacao.parcela) : "—"}
                        </span>
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
                      className="w-full rounded-full py-5 text-sm font-semibold sm:py-6 sm:text-base"
                    >
                      {submitting ? "Enviando..." : "Receber minha proposta"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <p className="text-center text-[11px] text-muted-foreground sm:text-xs">
                      Ao enviar você concorda em receber contato por WhatsApp e e-mail.
                    </p>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Nav do quiz */}
            {step < 4 && (
              <div className="mt-5 flex items-center justify-between sm:mt-6">
                <Button
                  variant="ghost"
                  onClick={back}
                  disabled={step === 0}
                  className="rounded-full"
                  size="sm"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button
                  onClick={next}
                  disabled={
                    (step === 0 && !selected) ||
                    (step === 2 && (!credito || !prazo)) ||
                    (step === 3 && !urgencia)
                  }
                  className="rounded-full px-5 sm:px-6"
                  size="sm"
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
            className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center sm:rounded-3xl sm:p-10"
          >
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground sm:h-16 sm:w-16">
              <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <h2 className="text-xl font-bold sm:text-3xl">Tudo certo, {form.full_name.split(" ")[0]}!</h2>
            <p className="mx-auto mt-3 max-w-md text-xs text-muted-foreground sm:text-sm">
              Recebemos suas respostas e a simulação. Um especialista vai te chamar no WhatsApp em até 24h com a proposta de{" "}
              <span className="font-semibold text-foreground">{carta?.label}</span>
              {simulacao && (
                <>
                  {" "}— parcela estimada de{" "}
                  <span className="font-semibold text-foreground">{brl(simulacao.parcela)}</span>.
                </>
              )}
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button className="w-full rounded-full px-6 sm:w-auto">
                  <MessageCircle className="mr-2 h-4 w-4" /> Adiantar pelo WhatsApp
                </Button>
              </a>
              <Link to="/cartas-contempladas" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full rounded-full px-6 sm:w-auto">
                  Voltar para o site
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* KPIs */}
        {!done && (
          <div className="mt-10 grid grid-cols-2 gap-2.5 sm:mt-12 sm:grid-cols-4 sm:gap-3">
            {[
              { v: "R$ 480M", l: "em créditos liberados" },
              { v: "2.300+", l: "contemplados" },
              { v: "8 anos", l: "de experiência" },
              { v: "7 dias", l: "média de liberação" },
            ].map((k) => (
              <div key={k.l} className="rounded-2xl border border-border bg-card p-3 text-center sm:p-4">
                <p className="text-lg font-bold text-primary sm:text-2xl">{k.v}</p>
                <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">{k.l}</p>
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
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 transition hover:scale-105 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
      </a>
    </div>
  );
}
