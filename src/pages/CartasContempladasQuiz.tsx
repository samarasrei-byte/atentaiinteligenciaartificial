import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Car, Truck, Wrench, Sprout, Ship,
  CheckCircle2, ShieldCheck, TrendingUp, Sparkles,
  ArrowRight, MessageCircle, Phone, Mail, User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";

const WHATSAPP_NUMBER = "5511985214895";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Olá! Quero conhecer a Mentoria de Cartas Contempladas.",
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

const STEPS = [
  { n: "01", t: "Diagnóstico gratuito", d: "Você preenche o formulário e nossa equipe entende seu objetivo." },
  { n: "02", t: "Estratégia personalizada", d: "Selecionamos a carta ideal com o menor custo e prazo." },
  { n: "03", t: "Contemplação em até 7 dias", d: "Liberamos o crédito para você usar como quiser." },
];

const DEPOIMENTOS = [
  { nome: "Rodrigo M.", cidade: "São Paulo · SP", texto: "Comprei meu apartamento com 30% de desconto. A mentoria mudou minha vida financeira." },
  { nome: "Juliana P.", cidade: "Curitiba · PR", texto: "Troquei meu carro em 6 dias. Zero burocracia, atendimento impecável." },
  { nome: "Marcos T.", cidade: "Goiânia · GO", texto: "Renovei minha frota de 3 caminhões sem descapitalizar minha empresa." },
];

export default function CartasContempladasMentoria() {
  const { toast } = useToast();
  const [selected, setSelected] = useState<CartaKey>("imovel");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    credit_range: "",
    message: "",
  });

  const carta = useMemo(() => CARTAS.find((c) => c.key === selected)!, [selected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        metadata: { carta_key: carta.key },
      });
      if (error) throw error;
      toast({
        title: "Inscrição enviada!",
        description: "Nossa equipe entrará em contato em até 24h.",
      });
      setForm({ full_name: "", email: "", phone: "", credit_range: "", message: "" });
      // Abre WhatsApp em nova aba para conversão imediata
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
    <div className="min-h-screen bg-[#0A0A0A] text-white antialiased">
      <Helmet>
        <title>Mentoria Cartas Contempladas | Guilherme Mesquita</title>
        <meta
          name="description"
          content="Mentoria exclusiva de Cartas Contempladas. Crédito com desconto de até 30%, sem juros, liberado em até 7 dias. Imóvel, veículos, rural e mais."
        />
      </Helmet>

      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0A0A]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/cartas-contempladas" className="flex items-center gap-2">
            <img src="/logo-atentai.png" alt="AtentAI" className="h-8 w-8 rounded-full" />
            <span className="text-sm font-semibold tracking-wide">
              <span className="text-[#D4AF37]">Mentoria</span> Cartas Contempladas
            </span>
          </Link>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-2 text-xs font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black md:inline-flex"
          >
            <MessageCircle className="h-4 w-4" /> (11) 98521-4895
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(212,175,55,0.15),transparent_60%),radial-gradient(circle_at_80%_90%,rgba(212,175,55,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-20 text-center sm:pt-24 sm:pb-28">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-1.5 text-xs font-medium text-[#D4AF37]"
          >
            <Sparkles className="h-3.5 w-3.5" /> Mentoria exclusiva com Guilherme Mesquita
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl"
          >
            Realize seu sonho com{" "}
            <span className="bg-gradient-to-r from-[#D4AF37] via-[#F1D97A] to-[#D4AF37] bg-clip-text text-transparent">
              Cartas Contempladas
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mx-auto mt-6 max-w-2xl text-base text-white/70 sm:text-lg"
          >
            Crédito à vista, sem juros e com poder de negociação de até 30% de desconto.
            Uma mentoria completa para você escolher a carta certa e comprar o que
            sempre quis, sem armadilhas.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <a href="#formulario">
              <Button className="rounded-full bg-[#D4AF37] px-8 py-6 text-base font-semibold text-black hover:bg-[#F1D97A]">
                Quero minha mentoria gratuita <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="rounded-full border-white/20 bg-transparent px-8 py-6 text-base text-white hover:bg-white/10">
                <MessageCircle className="mr-2 h-4 w-4" /> Falar no WhatsApp
              </Button>
            </a>
          </motion.div>

          {/* KPIs */}
          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { v: "R$ 480M", l: "em créditos liberados" },
              { v: "2.300+", l: "clientes contemplados" },
              { v: "8 anos", l: "de experiência" },
              { v: "7 dias", l: "para o crédito cair" },
            ].map((k) => (
              <div key={k.l} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
                <p className="text-2xl font-bold text-[#D4AF37] sm:text-3xl">{k.v}</p>
                <p className="mt-1 text-xs text-white/60">{k.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ESCOLHA A CARTA */}
      <section className="border-y border-white/5 bg-[#0F0F0F] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Escolha a <span className="text-[#D4AF37]">carta ideal</span> para você
            </h2>
            <p className="mt-3 text-white/60">
              Cada perfil recebe uma estratégia diferente. Clique e veja os benefícios.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {CARTAS.map((c) => {
              const Icon = c.icon;
              const active = c.key === selected;
              return (
                <button
                  key={c.key}
                  onClick={() => setSelected(c.key)}
                  className={`group flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                    active
                      ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-lg shadow-[#D4AF37]/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/25"
                  }`}
                >
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-xl ${
                      active ? "bg-[#D4AF37] text-black" : "bg-white/5 text-white/70 group-hover:text-white"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className={`text-xs font-semibold ${active ? "text-[#D4AF37]" : "text-white/80"}`}>
                    {c.label.replace("Carta de ", "").replace("Carta ", "")}
                  </span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={carta.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="mt-8 grid grid-cols-1 gap-6 rounded-3xl border border-[#D4AF37]/20 bg-gradient-to-br from-[#D4AF37]/[0.05] to-transparent p-8 lg:grid-cols-2"
            >
              <div>
                <span className="text-xs uppercase tracking-widest text-[#D4AF37]">
                  {carta.short}
                </span>
                <h3 className="mt-2 text-2xl font-bold sm:text-3xl">{carta.label}</h3>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-[#D4AF37]" />
                  <span className="text-white/80">Faixa de crédito:</span>
                  <span className="font-semibold text-white">{carta.ticket}</span>
                </div>
                <a href="#formulario">
                  <Button className="mt-6 rounded-full bg-[#D4AF37] text-black hover:bg-[#F1D97A]">
                    Quero essa carta <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
              <ul className="space-y-3">
                {carta.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#D4AF37]" />
                    <span className="text-sm text-white/80">{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* PASSO A PASSO */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Como funciona a mentoria</h2>
            <p className="mt-3 text-white/60">3 passos simples até o seu crédito cair</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
                <span className="text-5xl font-bold text-[#D4AF37]/40">{s.n}</span>
                <h3 className="mt-3 text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-white/60">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="border-y border-white/5 bg-[#0F0F0F] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Quem já foi <span className="text-[#D4AF37]">contemplado</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {DEPOIMENTOS.map((d) => (
              <div key={d.nome} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <div className="mb-3 flex text-[#D4AF37]">★★★★★</div>
                <p className="text-sm text-white/80">"{d.texto}"</p>
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="text-sm font-semibold">{d.nome}</p>
                  <p className="text-xs text-white/50">{d.cidade}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORMULÁRIO */}
      <section id="formulario" className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-1.5 text-xs font-medium text-[#D4AF37]">
              <ShieldCheck className="h-3.5 w-3.5" /> Diagnóstico 100% gratuito
            </span>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Inscreva-se na mentoria</h2>
            <p className="mt-3 text-white/60">
              Você escolheu:{" "}
              <span className="font-semibold text-[#D4AF37]">{carta.label}</span>
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="full_name" className="text-white/70">
                  <UserIcon className="mr-1 inline h-3.5 w-3.5" /> Nome completo *
                </Label>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
                  placeholder="Seu nome"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-white/70">
                  <Phone className="mr-1 inline h-3.5 w-3.5" /> WhatsApp *
                </Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
                  placeholder="(11) 98521-4895"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/70">
                <Mail className="mr-1 inline h-3.5 w-3.5" /> E-mail *
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
                placeholder="voce@email.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="carta" className="text-white/70">Tipo de carta</Label>
              <Select value={selected} onValueChange={(v) => setSelected(v as CartaKey)}>
                <SelectTrigger id="carta" className="border-white/15 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CARTAS.map((c) => (
                    <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="credit_range" className="text-white/70">Valor de crédito desejado</Label>
              <Input
                id="credit_range"
                value={form.credit_range}
                onChange={(e) => setForm({ ...form, credit_range: e.target.value })}
                className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
                placeholder={`ex.: ${carta.ticket}`}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message" className="text-white/70">Como podemos ajudar? (opcional)</Label>
              <Textarea
                id="message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="min-h-24 border-white/15 bg-white/5 text-white placeholder:text-white/30"
                placeholder="Conte um pouco sobre o seu objetivo..."
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#D4AF37] py-6 text-base font-semibold text-black hover:bg-[#F1D97A] disabled:opacity-50"
            >
              {submitting ? "Enviando..." : "Quero receber o contato da mentoria"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-center text-xs text-white/40">
              Ao enviar você concorda em receber contato pelo WhatsApp e e-mail.
            </p>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <img src="/logo-atentai.png" alt="AtentAI" className="h-6 w-6 rounded-full" />
            AtentAI · Cartas Contempladas
          </div>
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Todos os direitos reservados.
          </p>
        </div>
      </footer>

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
