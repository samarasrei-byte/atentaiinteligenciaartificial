import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Rocket,
  ShieldCheck,
  Zap,
  HandCoins,
  Sparkles,
  ArrowRight,
  Check,
  Clock,
  TrendingDown,
  FileText,
  Search,
  RefreshCw,
  Trophy,
  Star,
  ChevronDown,
  MessageCircle,
  Instagram,
  Facebook,
  Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Scoped theme — neon purple + sea green. Lives only inside this page.
const SCOPED_THEME = `
  .cc-theme {
    --cc-bg: #07060d;
    --cc-bg-2: #0c0a18;
    --cc-surface: rgba(255,255,255,0.04);
    --cc-border: rgba(255,255,255,0.08);
    --cc-text: #f5f3ff;
    --cc-muted: rgba(245,243,255,0.65);
    --cc-purple: #a855f7;
    --cc-purple-glow: #c084fc;
    --cc-sea: #2dd4bf;
    --cc-sea-glow: #5eead4;
  }
  .cc-theme .cc-grad-text {
    background: linear-gradient(110deg, var(--cc-purple-glow) 0%, var(--cc-sea-glow) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .cc-theme .cc-btn-primary {
    background: linear-gradient(135deg, var(--cc-purple) 0%, #7c3aed 100%);
    color: #fff;
    box-shadow: 0 0 0 1px rgba(168,85,247,.4), 0 12px 40px -10px rgba(168,85,247,.6);
    transition: transform .25s ease, box-shadow .25s ease;
  }
  .cc-theme .cc-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 0 1px rgba(192,132,252,.6), 0 20px 60px -10px rgba(168,85,247,.8);
  }
  .cc-theme .cc-btn-ghost {
    background: rgba(45,212,191,.08);
    color: var(--cc-sea-glow);
    border: 1px solid rgba(45,212,191,.35);
    transition: all .25s ease;
  }
  .cc-theme .cc-btn-ghost:hover {
    background: rgba(45,212,191,.16);
    border-color: rgba(94,234,212,.6);
  }
  .cc-theme .cc-card {
    background: linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.01));
    border: 1px solid var(--cc-border);
    backdrop-filter: blur(12px);
  }
  .cc-theme .cc-glow-purple { box-shadow: 0 0 60px -10px rgba(168,85,247,.35); }
  .cc-theme .cc-glow-sea { box-shadow: 0 0 60px -10px rgba(45,212,191,.35); }
  .cc-theme .cc-mesh {
    background:
      radial-gradient(800px 500px at 15% 10%, rgba(168,85,247,.25), transparent 60%),
      radial-gradient(700px 500px at 85% 30%, rgba(45,212,191,.18), transparent 60%),
      radial-gradient(900px 700px at 50% 100%, rgba(124,58,237,.22), transparent 60%),
      var(--cc-bg);
  }
  .cc-theme .cc-grid-bg {
    background-image:
      linear-gradient(rgba(168,85,247,.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(45,212,191,.05) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
  }
  @keyframes cc-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  .cc-theme .cc-float { animation: cc-float 7s ease-in-out infinite; }
`;

const WHATSAPP_LINK =
  "https://wa.me/5511999999999?text=Quero%20saber%20mais%20sobre%20cartas%20contempladas";

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
    <section id={id} className={`relative py-24 sm:py-32 ${className}`}>
      <div className="container mx-auto px-6 max-w-6xl">{children}</div>
    </section>
  );
}

export default function CartasContempladas() {
  const [openFaq, setOpenFaq] = useState<string | undefined>("q1");

  const benefits = [
    {
      icon: Zap,
      title: "Crédito Imediato",
      desc: "Valor total em mãos para usar quando e como quiser. Sua oportunidade não espera.",
    },
    {
      icon: TrendingDown,
      title: "Economia Sem Juros",
      desc: "Adeus juros bancários. Pague apenas o ágio e economize milhares frente a financiamentos.",
    },
    {
      icon: HandCoins,
      title: "Poder de Negociação",
      desc: "Você é comprador à vista. Garanta os melhores descontos no imóvel ou veículo.",
    },
    {
      icon: ShieldCheck,
      title: "Segurança Total",
      desc: "Operação 100% regulamentada. Transferência feita na administradora, com garantia jurídica.",
    },
  ];

  const steps = [
    { icon: FileText, title: "Escolha Sua Carta", desc: "Definimos juntos o valor de crédito ideal para seu objetivo." },
    { icon: Search, title: "Análise e Aprovação", desc: "Verificamos disponibilidade e sua elegibilidade para a transferência." },
    { icon: RefreshCw, title: "Transferência Segura", desc: "Transferimos a carta para seu nome com total transparência." },
    { icon: Trophy, title: "Realize Seu Sonho", desc: "Crédito liberado. Compre seu bem e celebre sua conquista." },
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
      a: "Após a aprovação da transferência e análise de crédito, o processo é rápido — geralmente em poucos dias o crédito está disponível para uso.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Carta Contemplada: Seu Atalho para a Conquista | AtentAI</title>
        <meta
          name="description"
          content="Realize seus sonhos de imóvel ou carro com cartas contempladas. Crédito imediato, sem juros e com poder de negociação. Descubra como!"
        />
        <link rel="canonical" href="https://www.atentai.com.br/cartas-contempladas" />
        <meta property="og:title" content="Carta Contemplada: Seu Atalho para a Conquista" />
        <meta
          property="og:description"
          content="Crédito imediato, sem juros, com poder de negociação. Conquiste seu imóvel ou carro hoje."
        />
        <meta property="og:url" content="https://www.atentai.com.br/cartas-contempladas" />
      </Helmet>

      <style dangerouslySetInnerHTML={{ __html: SCOPED_THEME }} />

      <div
        className="cc-theme min-h-screen overflow-x-hidden"
        style={{
          background: "var(--cc-bg)",
          color: "var(--cc-text)",
          fontFamily: "'Poppins', system-ui, sans-serif",
        }}
      >
        {/* ============== HERO ============== */}
        <header className="relative cc-mesh">
          <div className="absolute inset-0 cc-grid-bg pointer-events-none" />
          {/* Floating orbs */}
          <div
            aria-hidden
            className="absolute top-20 -left-20 w-72 h-72 rounded-full cc-float"
            style={{ background: "radial-gradient(circle, rgba(168,85,247,.4), transparent 70%)", filter: "blur(40px)" }}
          />
          <div
            aria-hidden
            className="absolute top-40 -right-10 w-80 h-80 rounded-full cc-float"
            style={{ background: "radial-gradient(circle, rgba(45,212,191,.35), transparent 70%)", filter: "blur(50px)", animationDelay: "2s" }}
          />

          <nav className="relative z-10 container mx-auto px-6 max-w-6xl py-6 flex items-center justify-between">
            <a href="#" className="flex items-center gap-2 font-bold tracking-tight">
              <Sparkles className="w-5 h-5" style={{ color: "var(--cc-sea-glow)" }} />
              <span className="cc-grad-text text-lg">Cartas Contempladas</span>
            </a>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full cc-btn-ghost"
            >
              <MessageCircle className="w-4 h-4" /> Falar no WhatsApp
            </a>
          </nav>

          <div className="relative z-10 container mx-auto px-6 max-w-6xl pt-16 pb-32 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium mb-8"
              style={{ borderColor: "rgba(45,212,191,.4)", background: "rgba(45,212,191,.08)", color: "var(--cc-sea-glow)" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--cc-sea)" }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--cc-sea)" }} />
              </span>
              Crédito imediato • Sem juros • 100% regulamentado
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] max-w-4xl mx-auto"
            >
              Seu Sonho Não Espera: <br />
              <span className="cc-grad-text">Carta Contemplada</span>,<br />
              o atalho inteligente.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-8 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed"
              style={{ color: "var(--cc-muted)" }}
            >
              Crédito imediato, <strong style={{ color: "var(--cc-text)" }}>sem juros</strong> e com poder de negociação.
              Realize seu imóvel ou carro novo <strong style={{ color: "var(--cc-text)" }}>agora</strong>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center"
            >
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="cc-btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base"
              >
                Quero meu crédito agora <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#como-funciona"
                className="cc-btn-ghost inline-flex items-center gap-2 px-6 py-4 rounded-full font-semibold text-sm"
              >
                Entenda como funciona
              </a>
            </motion.div>

            <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm" style={{ color: "var(--cc-muted)" }}>
              <span className="inline-flex items-center gap-2"><Check className="w-4 h-4" style={{ color: "var(--cc-sea-glow)" }} /> Sem análise burocrática infinita</span>
              <span className="inline-flex items-center gap-2"><Check className="w-4 h-4" style={{ color: "var(--cc-sea-glow)" }} /> Transferência via administradora</span>
              <span className="inline-flex items-center gap-2"><Check className="w-4 h-4" style={{ color: "var(--cc-sea-glow)" }} /> Atendimento humano e ágil</span>
            </div>
          </div>
        </header>

        {/* ============== PROBLEMA x SOLUÇÃO ============== */}
        <Section>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Cansado de juros abusivos <br />e <span className="cc-grad-text">espera infinita</span>?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="cc-card rounded-3xl p-8 sm:p-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6" style={{ background: "rgba(255,90,90,.1)", color: "#ff8a8a" }}>
                <Clock className="w-3.5 h-3.5" /> O caminho lento
              </div>
              <h3 className="text-2xl font-bold mb-4">Financiamento e consórcio tradicional</h3>
              <ul className="space-y-3" style={{ color: "var(--cc-muted)" }}>
                <li className="flex gap-3"><span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#ff8a8a" }} /> Décadas pagando juros que dobram o valor do bem</li>
                <li className="flex gap-3"><span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#ff8a8a" }} /> Sorteios incertos e lances disputados</li>
                <li className="flex gap-3"><span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#ff8a8a" }} /> Burocracia bancária que trava sua decisão</li>
                <li className="flex gap-3"><span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#ff8a8a" }} /> Preço cheio na compra, sem desconto à vista</li>
              </ul>
            </div>

            <div className="cc-card rounded-3xl p-8 sm:p-10 cc-glow-purple" style={{ borderColor: "rgba(168,85,247,.35)" }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6" style={{ background: "rgba(45,212,191,.12)", color: "var(--cc-sea-glow)" }}>
                <Rocket className="w-3.5 h-3.5" /> O atalho inteligente
              </div>
              <h3 className="text-2xl font-bold mb-4">Carta Contemplada</h3>
              <ul className="space-y-3" style={{ color: "var(--cc-muted)" }}>
                <li className="flex gap-3"><Check className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--cc-sea-glow)" }} /> Poder de compra à vista, sem um centavo de juros</li>
                <li className="flex gap-3"><Check className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--cc-sea-glow)" }} /> Crédito disponível em poucos dias</li>
                <li className="flex gap-3"><Check className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--cc-sea-glow)" }} /> Você negocia descontos como comprador à vista</li>
                <li className="flex gap-3"><Check className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--cc-sea-glow)" }} /> Transferência registrada na administradora</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* ============== BENEFÍCIOS ============== */}
        <Section className="cc-mesh">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Por que a carta contemplada<br />é a sua <span className="cc-grad-text">melhor decisão</span>?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="cc-card rounded-2xl p-6 group hover:cc-glow-purple transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    background: i % 2 === 0 ? "rgba(168,85,247,.15)" : "rgba(45,212,191,.15)",
                    border: i % 2 === 0 ? "1px solid rgba(168,85,247,.35)" : "1px solid rgba(45,212,191,.35)",
                  }}
                >
                  <b.icon className="w-6 h-6" style={{ color: i % 2 === 0 ? "var(--cc-purple-glow)" : "var(--cc-sea-glow)" }} />
                </div>
                <h3 className="font-bold text-lg mb-2">{b.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--cc-muted)" }}>{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ============== COMO FUNCIONA ============== */}
        <Section id="como-funciona">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Simples assim: <span className="cc-grad-text">sua conquista em poucos passos</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="cc-card rounded-2xl p-6 relative"
              >
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full flex items-center justify-center font-black text-lg"
                  style={{ background: "linear-gradient(135deg, var(--cc-purple), var(--cc-sea))", color: "#07060d" }}>
                  {i + 1}
                </div>
                <s.icon className="w-7 h-7 mb-4" style={{ color: "var(--cc-sea-glow)" }} />
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--cc-muted)" }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ============== PROVA SOCIAL ============== */}
        <Section className="cc-mesh">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Quem já <span className="cc-grad-text">conquistou</span> com a gente
            </h2>
            <p className="mt-4 text-lg" style={{ color: "var(--cc-muted)" }}>
              Mais de <strong style={{ color: "var(--cc-text)" }}>2.300 clientes</strong> satisfeitos e{" "}
              <strong style={{ color: "var(--cc-text)" }}>R$ 480 milhões</strong> em créditos liberados.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="cc-card rounded-2xl p-6"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className="w-4 h-4 fill-current" style={{ color: "var(--cc-sea-glow)" }} />
                  ))}
                </div>
                <p className="text-base leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                    style={{ background: "linear-gradient(135deg, var(--cc-purple), var(--cc-sea))", color: "#07060d" }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs" style={{ color: "var(--cc-muted)" }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-14 flex items-center justify-center gap-3 text-sm" style={{ color: "var(--cc-muted)" }}>
            <ShieldCheck className="w-5 h-5" style={{ color: "var(--cc-sea-glow)" }} />
            Especialistas em cartas contempladas há mais de 8 anos.
          </div>
        </Section>

        {/* ============== FAQ ============== */}
        <Section>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Suas dúvidas, <span className="cc-grad-text">nossas respostas</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible value={openFaq} onValueChange={setOpenFaq} className="space-y-3">
              {faqs.map((f) => (
                <AccordionItem
                  key={f.id}
                  value={f.id}
                  className="cc-card rounded-2xl px-6 border-0"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-5 [&[data-state=open]>svg]:rotate-180">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="leading-relaxed pb-5" style={{ color: "var(--cc-muted)" }}>
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Section>

        {/* ============== CTA FINAL ============== */}
        <Section>
          <div
            className="relative overflow-hidden rounded-3xl p-10 sm:p-16 text-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(168,85,247,.25) 0%, rgba(45,212,191,.18) 100%)",
              border: "1px solid rgba(168,85,247,.35)",
            }}
          >
            <div
              aria-hidden
              className="absolute -top-20 -right-20 w-80 h-80 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(45,212,191,.35), transparent 70%)", filter: "blur(60px)" }}
            />
            <div
              aria-hidden
              className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(168,85,247,.4), transparent 70%)", filter: "blur(60px)" }}
            />
            <div className="relative">
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                Não deixe seu sonho <br />
                <span className="cc-grad-text">para depois</span>.
              </h2>
              <p className="mt-6 text-lg max-w-2xl mx-auto" style={{ color: "var(--cc-muted)" }}>
                A oportunidade de ter crédito imediato e sem juros está a um clique.
                As melhores cartas são disputadas — garanta a sua agora.
              </p>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="cc-btn-primary mt-10 inline-flex items-center gap-2 px-10 py-5 rounded-full font-bold text-base"
              >
                Falar com um especialista agora <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </Section>

        {/* ============== FOOTER ============== */}
        <footer className="border-t" style={{ borderColor: "var(--cc-border)" }}>
          <div className="container mx-auto px-6 max-w-6xl py-12 grid md:grid-cols-3 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 font-bold mb-2">
                <Sparkles className="w-4 h-4" style={{ color: "var(--cc-sea-glow)" }} />
                <span className="cc-grad-text">Cartas Contempladas</span>
              </div>
              <p className="text-sm" style={{ color: "var(--cc-muted)" }}>
                Especialistas em consórcios contemplados.<br />
                contato@atentai.com.br
              </p>
            </div>

            <div className="flex md:justify-center gap-6 text-sm" style={{ color: "var(--cc-muted)" }}>
              <a href="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</a>
              <a href="/termos" className="hover:text-white transition-colors">Termos de Uso</a>
            </div>

            <div className="flex md:justify-end gap-3">
              {[
                { icon: MessageCircle, href: WHATSAPP_LINK, label: "WhatsApp" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                  style={{
                    border: "1px solid rgba(168,85,247,.35)",
                    color: "var(--cc-purple-glow)",
                    background: "rgba(168,85,247,.08)",
                  }}
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="text-center text-xs pb-8" style={{ color: "var(--cc-muted)" }}>
            © {new Date().getFullYear()} Cartas Contempladas. Todos os direitos reservados.
          </div>
        </footer>
      </div>
    </>
  );
}
