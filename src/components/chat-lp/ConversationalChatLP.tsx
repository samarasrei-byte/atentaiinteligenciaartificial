import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { RotateCcw, Send, ShieldCheck, CheckCircle2, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ————————————————————————————————————————————————————————
// Script types
// ————————————————————————————————————————————————————————
export type Chip = { label: string; value: string };

export type ScriptStep =
  | { id: string; type: "bot"; text: string | ((a: Record<string, string>) => string); delay?: number }
  | { id: string; type: "chips"; field: string; chips: Chip[]; next?: (v: string) => string | null }
  | {
      id: string;
      type: "input";
      field: string;
      placeholder: string;
      kind: "text" | "email" | "phone" | "currency" | "cnpj";
      validate?: (v: string) => string | null; // returns error or null
      transform?: (v: string) => string;
    }
  | { id: string; type: "consent"; field: string; label: string }
  | { id: string; type: "submit"; label?: string };

export interface ChatLPConfig {
  brand: string;
  agentName: string;
  agentRole: string;
  agentAvatarUrl?: string; // optional; fallback = initials
  agentInitials: string;
  title: string;
  metaDescription: string;
  cartaType: string; // maps to mentoria_cartas_leads.carta_type
  source: string; // e.g. "chat_carta_credito_empresas"
  whatsapp: string; // digits only
  script: ScriptStep[];
  brandGradient?: string; // e.g. "from-emerald-500 to-teal-500"
  backHref?: string;
}

type Bubble =
  | { role: "bot"; text: string; ts: number }
  | { role: "user"; text: string; ts: number };

// ————————————————————————————————————————————————————————
// Formatting helpers
// ————————————————————————————————————————————————————————
const digits = (s: string) => s.replace(/\D/g, "");

const formatPhoneBR = (v: string) => {
  const d = digits(v).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const formatCNPJ = (v: string) => {
  const d = digits(v).slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

const formatCurrencyBR = (v: string) => {
  const d = digits(v).slice(0, 12);
  if (!d) return "";
  return Number(d).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ————————————————————————————————————————————————————————
// Engine
// ————————————————————————————————————————————————————————
export default function ConversationalChatLP({ config }: { config: ChatLPConfig }) {
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [stepIdx, setStepIdx] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [typing, setTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);

  const total = config.script.length;
  const progress = Math.min(100, Math.round((stepIdx / total) * 100));
  const current = config.script[stepIdx];

  // auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [bubbles, typing, current?.id]);

  // Play bot messages automatically
  useEffect(() => {
    if (!current || submitted) return;
    if (current.type === "bot") {
      setTyping(true);
      const text = typeof current.text === "function" ? current.text(answers) : current.text;
      const t = window.setTimeout(() => {
        setTyping(false);
        setBubbles((b) => [...b, { role: "bot", text, ts: Date.now() }]);
        setStepIdx((s) => s + 1);
      }, current.delay ?? 700);
      return () => window.clearTimeout(t);
    }
    if (current.type === "input") {
      // focus input
      const t = window.setTimeout(() => inputRef.current?.focus(), 100);
      return () => window.clearTimeout(t);
    }
  }, [stepIdx, current, submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetChat = () => {
    setAnswers({});
    setBubbles([]);
    setStepIdx(0);
    setInputValue("");
    setConsent(false);
    setSubmitted(false);
    setLeadId(null);
  };

  const commit = (fieldValue: string, displayText: string, field: string) => {
    setBubbles((b) => [...b, { role: "user", text: displayText, ts: Date.now() }]);
    setAnswers((a) => ({ ...a, [field]: fieldValue }));
    setInputValue("");
    setStepIdx((s) => s + 1);
  };

  const handleChip = (chip: Chip) => {
    if (current?.type !== "chips") return;
    commit(chip.value, chip.label, current.field);
  };

  const handleInputSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (current?.type !== "input") return;
    const raw = inputValue.trim();
    if (!raw) return;

    // validation
    if (current.kind === "email" && !emailRegex.test(raw)) {
      toast({ title: "E-mail inválido", variant: "destructive" });
      return;
    }
    if (current.kind === "phone" && digits(raw).length < 10) {
      toast({ title: "WhatsApp inválido", description: "Use DDD + número.", variant: "destructive" });
      return;
    }
    if (current.kind === "cnpj" && digits(raw).length !== 14) {
      toast({ title: "CNPJ inválido", description: "Precisa ter 14 dígitos.", variant: "destructive" });
      return;
    }
    if (current.kind === "currency" && !digits(raw)) {
      toast({ title: "Valor inválido", variant: "destructive" });
      return;
    }
    if (current.validate) {
      const err = current.validate(raw);
      if (err) {
        toast({ title: err, variant: "destructive" });
        return;
      }
    }
    const stored = current.transform ? current.transform(raw) : raw;
    commit(stored, raw, current.field);
  };

  const submitLead = async () => {
    if (!consent) {
      toast({ title: "Autorize o contato (LGPD) para continuar", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const full_name = answers.full_name?.trim() || "Lead sem nome";
      const email = (answers.email || "").trim().toLowerCase();
      const phone = (answers.phone || "").trim() || "pendente";
      const credit_range = answers.credito || answers.faturamento || null;
      const { data, error } = await supabase
        .from("mentoria_cartas_leads")
        .insert({
          full_name,
          email,
          phone,
          carta_type: config.cartaType,
          credit_range,
          message: answers.message || null,
          source: config.source,
          metadata: { chat_answers: answers, lgpd_consent: true },
        })
        .select("id")
        .single();
      if (error) throw error;
      setLeadId(data.id);
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Erro ao enviar", description: err?.message ?? "Tente novamente.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // when we hit submit step, auto-render composer with consent + button
  useEffect(() => {
    if (current?.type === "submit" && !submitted) {
      // no auto action; user must consent+click
    }
  }, [current, submitted]);

  // ————————————————————————————————————————————————————————
  // Render helpers
  // ————————————————————————————————————————————————————————
  const gradient = config.brandGradient ?? "from-emerald-500 to-teal-500";
  const whatsappLink = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(
    `Olá! Conversei com ${config.agentName} sobre ${config.cartaType}.`,
  )}`;

  const Avatar = ({ size = "sm" }: { size?: "sm" | "md" }) => {
    const dim = size === "md" ? "h-10 w-10 text-sm" : "h-7 w-7 text-[10px]";
    if (config.agentAvatarUrl) {
      return (
        <img
          src={config.agentAvatarUrl}
          alt={config.agentName}
          className={`${dim} rounded-full object-cover ring-1 ring-white/10`}
        />
      );
    }
    return (
      <div
        className={`${dim} grid place-items-center rounded-full bg-gradient-to-br ${gradient} font-bold text-white ring-1 ring-white/10`}
      >
        {config.agentInitials}
      </div>
    );
  };

  const showInput = current?.type === "input" && !submitted;
  const showChips = current?.type === "chips" && !submitted;
  const showSubmit = current?.type === "submit" && !submitted;

  return (
    <div className="dark flex h-[100dvh] flex-col overflow-hidden bg-[#0a0f14] text-white antialiased">
      <Helmet>
        <title>{config.title}</title>
        <meta name="description" content={config.metaDescription} />
      </Helmet>

      {/* Ambient glow */}
      <div
        className={`pointer-events-none absolute inset-0 -z-0 bg-gradient-to-b ${gradient} opacity-[0.06] blur-3xl`}
        aria-hidden
      />

      {/* Header */}
      <header className="relative z-10 flex-shrink-0 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link to={config.backHref ?? "/"} className="flex items-center gap-3">
            <div className="relative">
              <Avatar size="md" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-black/60" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">
                {config.agentName} · <span className="text-white/60">{config.brand}</span>
              </p>
              <p className="text-[11px] text-white/50">
                <span className="text-emerald-400">●</span> {config.agentRole} · Online
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <div className="hidden h-1 w-32 overflow-hidden rounded-full bg-white/10 sm:block">
              <div
                className={`h-full bg-gradient-to-r ${gradient} transition-all`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={resetChat}
              className="h-8 rounded-full border border-white/10 bg-white/5 text-xs text-white/80 hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="mr-1.5 h-3 w-3" />
              Recomeçar
            </Button>
          </div>
        </div>
      </header>

      {/* Conversation */}
      <main ref={scrollRef} className="relative z-10 min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-6">
          {bubbles.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-end gap-2 ${b.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {b.role === "bot" && <Avatar />}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
                  b.role === "bot"
                    ? "rounded-bl-md bg-white/[0.06] text-white/90"
                    : `rounded-br-md bg-gradient-to-br ${gradient} text-white shadow-lg`
                }`}
              >
                {b.text}
              </div>
            </motion.div>
          ))}

          <AnimatePresence>
            {typing && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-end gap-2"
              >
                <Avatar />
                <div className="rounded-2xl rounded-bl-md bg-white/[0.06] px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400"
                        style={{ animationDelay: `${i * 120}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success card */}
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 rounded-2xl border border-white/10 bg-gradient-to-br ${gradient} p-[1px]`}
            >
              <div className="rounded-2xl bg-[#0a0f14] p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${gradient}`}>
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Recebido! Um especialista já foi acionado.</p>
                    <p className="text-[12px] text-white/60">
                      Protocolo <span className="font-mono text-white/80">{leadId?.slice(0, 8).toUpperCase()}</span>{" "}
                      · Retorno em até 24h úteis.
                    </p>
                  </div>
                </div>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button className={`mt-4 w-full rounded-full bg-gradient-to-r ${gradient} font-semibold`}>
                    <MessageCircle className="mr-2 h-4 w-4" /> Adiantar pelo WhatsApp
                  </Button>
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Interaction area */}
      <footer className="relative z-10 flex-shrink-0 border-t border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 py-3">
          {showChips && current.type === "chips" && (
            <div className="flex flex-wrap gap-2">
              {current.chips.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => handleChip(c)}
                  className={`rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[13px] font-medium text-white/90 transition hover:border-white/30 hover:bg-white/10 active:scale-[0.98]`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}

          {showInput && current.type === "input" && (
            <form onSubmit={handleInputSubmit} className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => {
                  const v = e.target.value;
                  if (current.kind === "phone") setInputValue(formatPhoneBR(v));
                  else if (current.kind === "cnpj") setInputValue(formatCNPJ(v));
                  else if (current.kind === "currency") setInputValue(formatCurrencyBR(v));
                  else setInputValue(v);
                }}
                placeholder={current.placeholder}
                inputMode={
                  current.kind === "email"
                    ? "email"
                    : current.kind === "phone" || current.kind === "cnpj" || current.kind === "currency"
                    ? "numeric"
                    : "text"
                }
                type={current.kind === "email" ? "email" : "text"}
                className="h-12 flex-1 rounded-full border-white/10 bg-white/[0.05] text-white placeholder:text-white/40 focus-visible:ring-emerald-400/40"
              />
              <Button
                type="submit"
                size="icon"
                className={`h-12 w-12 rounded-full bg-gradient-to-br ${gradient}`}
                aria-label="Enviar"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )}

          {showSubmit && (
            <div className="space-y-3">
              <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[11px] leading-relaxed text-white/70">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 accent-emerald-400"
                />
                <span>
                  Autorizo a {config.brand} e parceiros a entrarem em contato por WhatsApp, e-mail e telefone com a
                  proposta, conforme a <b className="text-white">LGPD (Lei 13.709/2018)</b>.
                </span>
              </label>
              <Button
                onClick={submitLead}
                disabled={submitting || !consent}
                className={`w-full rounded-full bg-gradient-to-r ${gradient} py-6 text-sm font-semibold`}
              >
                {submitting ? "Enviando..." : current.type === "submit" ? current.label ?? "Enviar solicitação" : "Enviar"}
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-[10px] text-white/40">
                <ShieldCheck className="h-3 w-3" /> Seus dados são criptografados e usados apenas para esta proposta.
              </p>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
