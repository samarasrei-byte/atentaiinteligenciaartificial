import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  HandCoins,
  ArrowRight,
  Check,
  TrendingDown,
  FileText,
  Search,
  RefreshCw,
  Trophy,
  Star,
  MessageCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const WHATSAPP_NUMBER = "5511985214895";
const WHATSAPP_DISPLAY = "(11) 98521-4895";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Olá! Quero saber mais sobre cartas contempladas."
)}`;

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`relative py-20 sm:py-28 ${className}`}>
      <div className="container mx-auto px-6 max-w-6xl">{children}</div>
    </section>
  );
}

export default function CartasContempladas() {
  const [openFaq, setOpenFaq] = useState<string | undefined>("q1");

  const stats = [
    { value: "R$ 480M", label: "em créditos liberados" },
    { value: "2.300+", label: "clientes contemplados" },
    { value: "8 anos", label: "de experiência no mercado" },
    { value: "7 dias", label: "média para crédito em mãos" },
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Crédito imediato",
      desc: "Valor total em mãos para usar quando e como quiser. Sua oportunidade não espera.",
    },
    {
      icon: TrendingDown,
      title: "Economia sem juros",
      desc: "Adeus juros bancários. Pague apenas o ágio e economize milhares frente a financiamentos.",
    },
    {
      icon: HandCoins,
      title: "Poder de negociação",
      desc: "Você é comprador à vista. Garanta os melhores descontos no imóvel ou veículo.",
    },
    {
      icon: ShieldCheck,
      title: "Segurança total",
      desc: "Operação 100% regulamentada. Transferência feita na administradora, com garantia jurídica.",
    },
  ];

  const steps = [
    { icon: FileText, title: "Escolha sua carta", desc: "Definimos juntos o valor de crédito ideal para o seu objetivo." },
    { icon: Search, title: "Análise e aprovação", desc: "Verificamos disponibilidade e elegibilidade para a transferência." },
    { icon: RefreshCw, title: "Transferência segura", desc: "Transferimos a carta para o seu nome com total transparência." },
    { icon: Trophy, title: "Realize seu sonho", desc: "Crédito liberado. Compre seu bem e celebre sua conquista." },
  ];

  const testimonials = [
    {
      name: "Marcos T.",
      role: "Empresário, SP",
      text: "Comprei meu apartamento com 18% de desconto pagando à vista. Economia que financiamento nenhum dá.",
    },
    {
      name: "Juliana R.",
      role: "Médica, MG",
      text: "Em 7 dias o crédito estava liberado. Processo sério, com contrato registrado na administradora.",
    },
    {
      name: "Rafael C.",
      role: "Engenheiro, RJ",
      text: "Comparei com financiamento: economizaria R$ 240 mil em juros. Fechei na hora.",
    },
  ];

  const faqs = [
    {
      id: "q1",
      q: "Carta contemplada é segura?",
      a: "Sim, 100% segura e regulamentada. A transferência é feita diretamente na administradora do consórcio, com contrato e todas as garantias legais.",
    },
    {
      id: "q2",
      q: "Qual a diferença para um financiamento?",
      a: "A principal diferença é a ausência de juros. Você paga um ágio pela agilidade, mas economiza muito mais ao longo do tempo, sem as taxas e juros compostos do financiamento.",
    },
    {
      id: "q3",
      q: "Posso usar para qualquer tipo de bem?",
      a: "Depende da modalidade da carta (imóvel, veículo, serviço). Uma carta de imóvel pode ser usada para comprar qualquer tipo de imóvel, por exemplo.",
    },
    {
      id: "q4",
      q: "Quanto tempo leva para ter o crédito?",
      a: "Após a aprovação da transferência e análise de crédito, o processo é rápido. Em poucos dias o crédito está disponível para uso.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Carta Contemplada: Seu Atalho para a Conquista | AtentAI</title>
        <meta
          name="description"
          content="Realize seus sonhos de imóvel ou carro com cartas contempladas. Crédito imediato, sem juros e com poder de negociação."
        />
        <link rel="canonical" href="https://www.atentai.com.br/cartas-contempladas" />
        <meta property="og:title" content="Carta Contemplada: Seu Atalho para a Conquista" />
        <meta
          property="og:description"
          content="Crédito imediato, sem juros, com poder de negociação. Conquiste seu imóvel ou carro hoje."
        />
        <meta property="og:url" content="https://www.atentai.com.br/cartas-contempladas" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        {/* ============== HEADER ============== */}
        <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-40">
          <nav className="container mx-auto px-6 max-w-6xl py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              <img
                src="/logo-atentai.png"
                alt="AtentAI"
                className="h-8 sm:h-10 w-auto transition-transform group-hover:scale-105"
                onError={(e) => {
                  const t = e.target as HTMLImageElement;
                  t.style.display = "none";
                }}
              />
              <span className="hidden sm:inline-block h-6 w-px bg-border" />
              <span className="text-sm sm:text-base font-semibold tracking-tight text-foreground">
                Cartas Contempladas
              </span>
            </a>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border border-border hover:bg-muted transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{WHATSAPP_DISPLAY}</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>
          </nav>
        </header>

        {/* ============== HERO ============== */}
        <Section className="pt-20 sm:pt-28">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/40 text-xs font-medium text-muted-foreground mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Crédito imediato. Sem juros. 100% regulamentado.
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] text-foreground"
            >
              Seu sonho não espera.
              <br />
              <span className="text-primary">Carta Contemplada</span>,
              <br />
              o atalho inteligente.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Crédito imediato, <strong className="text-foreground">sem juros</strong> e com poder de negociação.
              Realize seu imóvel ou carro novo <strong className="text-foreground">agora</strong>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-10 flex flex-col sm:flex-row gap-3 items-center justify-center"
            >
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Quero meu crédito agora <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-full font-semibold text-sm border border-border hover:bg-muted transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> {WHATSAPP_DISPLAY}
              </a>
            </motion.div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Sem burocracia infinita</span>
              <span className="inline-flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Transferência via administradora</span>
              <span className="inline-flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Atendimento humano</span>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border">
            {stats.map((s) => (
              <div key={s.label} className="bg-background px-6 py-8 text-center">
                <div className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{s.value}</div>
                <div className="mt-2 text-xs sm:text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ============== PROBLEMA x SOLUÇÃO ============== */}
        <Section className="bg-muted/30">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Cansado de juros abusivos e <span className="text-primary">espera infinita</span>?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-3xl p-8 sm:p-10 bg-background border border-border">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6 bg-destructive/10 text-destructive">
                O caminho lento
              </div>
              <h3 className="text-2xl font-bold mb-4">Financiamento tradicional</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0 bg-destructive" /> Décadas pagando juros que dobram o valor do bem</li>
                <li className="flex gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0 bg-destructive" /> Sorteios incertos e lances disputados</li>
                <li className="flex gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0 bg-destructive" /> Burocracia bancária que trava sua decisão</li>
                <li className="flex gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0 bg-destructive" /> Preço cheio na compra, sem desconto à vista</li>
              </ul>
            </div>

            <div className="rounded-3xl p-8 sm:p-10 bg-background border-2 border-primary/40">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6 bg-primary/10 text-primary">
                O atalho inteligente
              </div>
              <h3 className="text-2xl font-bold mb-4">Carta Contemplada</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3"><Check className="w-5 h-5 shrink-0 mt-0.5 text-primary" /> Poder de compra à vista, sem um centavo de juros</li>
                <li className="flex gap-3"><Check className="w-5 h-5 shrink-0 mt-0.5 text-primary" /> Crédito disponível em poucos dias</li>
                <li className="flex gap-3"><Check className="w-5 h-5 shrink-0 mt-0.5 text-primary" /> Você negocia descontos como comprador à vista</li>
                <li className="flex gap-3"><Check className="w-5 h-5 shrink-0 mt-0.5 text-primary" /> Transferência registrada na administradora</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* ============== BENEFÍCIOS ============== */}
        <Section>
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Por que é a sua <span className="text-primary">melhor decisão</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-2xl p-6 bg-background border border-border hover:border-primary/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-primary/10">
                  <b.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{b.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ============== COMO FUNCIONA ============== */}
        <Section id="como-funciona" className="bg-muted/30">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Sua conquista em <span className="text-primary">poucos passos</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl p-6 bg-background border border-border relative"
              >
                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-primary text-primary-foreground">
                  {i + 1}
                </div>
                <s.icon className="w-7 h-7 mb-4 text-primary" />
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ============== PROVA SOCIAL ============== */}
        <Section>
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Quem já <span className="text-primary">conquistou</span> com a gente
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Mais de <strong className="text-foreground">2.300 clientes</strong> satisfeitos e{" "}
              <strong className="text-foreground">R$ 480 milhões</strong> em créditos liberados.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl p-6 bg-background border border-border"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-base leading-relaxed mb-6 text-foreground">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-primary text-primary-foreground">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Especialistas em cartas contempladas há mais de 8 anos.
          </div>
        </Section>

        {/* ============== FAQ ============== */}
        <Section className="bg-muted/30">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Suas dúvidas, <span className="text-primary">nossas respostas</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible value={openFaq} onValueChange={setOpenFaq} className="space-y-3">
              {faqs.map((f) => (
                <AccordionItem
                  key={f.id}
                  value={f.id}
                  className="rounded-2xl px-6 border border-border bg-background"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="leading-relaxed pb-5 text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Section>

        {/* ============== CTA FINAL ============== */}
        <Section>
          <div className="rounded-3xl p-10 sm:p-16 text-center bg-foreground text-background">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Não deixe seu sonho para depois.
            </h2>
            <p className="mt-6 text-lg max-w-2xl mx-auto opacity-80">
              A oportunidade de ter crédito imediato e sem juros está a um clique.
              As melhores cartas são disputadas. Garanta a sua agora.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 items-center justify-center">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-10 py-5 rounded-full font-semibold text-base bg-background text-foreground hover:opacity-90 transition-opacity"
              >
                Falar com um especialista <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-5 rounded-full font-semibold text-sm border border-background/30 hover:bg-background/10 transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> {WHATSAPP_DISPLAY}
              </a>
            </div>
          </div>
        </Section>

        {/* ============== FOOTER ============== */}
        <footer className="border-t border-border">
          <div className="container mx-auto px-6 max-w-6xl py-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/logo-atentai.png"
                alt="AtentAI"
                className="h-7 w-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="h-5 w-px bg-border" />
              <span className="text-sm font-semibold">Cartas Contempladas</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
                <MessageCircle className="w-4 h-4" /> {WHATSAPP_DISPLAY}
              </a>
              <a href="/privacidade" className="hover:text-foreground transition-colors">Privacidade</a>
              <a href="/termos" className="hover:text-foreground transition-colors">Termos</a>
            </div>
          </div>
          <div className="text-center text-xs pb-8 text-muted-foreground">
            © {new Date().getFullYear()} AtentAI. Todos os direitos reservados.
          </div>
        </footer>
      </div>
    </>
  );
}
