import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ArrowRight, ShieldCheck, TrendingUp, Users, Database, Cpu, Layers, Building2,
  BarChart3, Lock, Award, Rocket, Sparkles, Target, Zap, LineChart, Globe2,
  FileCheck2, Crown, CheckCircle2, DollarSign, Briefcase, Network, Mail, PhoneCall
} from "lucide-react";
import { motion } from "framer-motion";

// ============================================================
// ATENTAI — ENTERPRISE ACQUISITION / STRATEGIC SALE
// Pitch B2B: venda da plataforma completa para uma empresa
// ============================================================

const KPIS = [
  { value: "R$ 2,3 tri", label: "TAM fiscal Brasil", sub: "Arrecadação tributária 2025" },
  { value: "20 M+", label: "Empresas impactadas", sub: "Reforma Tributária 2026" },
  { value: "Pré-launch", label: "Ativo virgem de mercado", sub: "Sem queima de marca, sem CAC" },
  { value: "R$ 39-840", label: "ARPU modular", sub: "6 linhas de receita prontas" },
];

const ASSETS = [
  { icon: Cpu, title: "IA Fiscal Proprietária", desc: "Motor treinado em LC 214/2025, IBS, CBS e IR. Não é wrapper de LLM — é IP defensável.", tag: "TECNOLOGIA" },
  { icon: Database, title: "Stack Full-Cloud Escalável", desc: "React 18 + Supabase + Edge Functions + RLS em 100% do banco. LGPD compliant end-to-end.", tag: "INFRA" },
  { icon: Layers, title: "6 Módulos Monetizados", desc: "Simulador, Autônomo, Premium, IR, Limpa Nome e NF — todos com checkout interno via Mercado Pago.", tag: "PRODUTO" },
  { icon: Network, title: "Marketplace de Contadores", desc: "Rede de profissionais certificados prontos para escala nacional B2B/B2C.", tag: "REDE" },
  { icon: FileCheck2, title: "Compliance & Segurança", desc: "Auditoria de segurança zerada, RBAC completo, webhooks HMAC-SHA256, storage isolado por owner.", tag: "GOVERNANÇA" },
  { icon: Briefcase, title: "Marca & Domínios", desc: "atentai.com.br + subdomínios técnicos, identidade visual madura, SEO estruturado — pronto para lançamento em Q1 2026.", tag: "BRAND" },
];

const REVENUE_STREAMS = [
  { name: "Simulador Tributário", arpu: "R$ 39,99", freq: "mensal" },
  { name: "Plano Autônomo", arpu: "R$ 65", freq: "mensal" },
  { name: "Plano Premium", arpu: "R$ 157", freq: "mensal" },
  { name: "Análise de IR", arpu: "R$ 89 – 189", freq: "anual" },
  { name: "Limpa Nome", arpu: "R$ 840", freq: "one-shot" },
  { name: "Emissão de NF", arpu: "R$ 97", freq: "mensal" },
];

const WHY_BUY = [
  { icon: Target, title: "Time-to-Market Zero", desc: "3 anos de engenharia embalados. Ligue o marketing e comece a faturar amanhã." },
  { icon: TrendingUp, title: "Timing Regulatório", desc: "Reforma Tributária 2026-2033. Janela única de aquisição — depois de janeiro o preço triplica." },
  { icon: Award, title: "Moat Técnico Real", desc: "IA proprietária + base legal curada. Concorrente demora 18 meses e R$ 4M pra chegar aqui." },
  { icon: Globe2, title: "Nacional & Escalável", desc: "Arquitetura serverless suporta 10× volume sem refactor. Pronto pra rollout LATAM." },
];

const IDEAL_BUYER = [
  "Grupos contábeis regionais buscando produto SaaS proprietário",
  "Fintechs querendo entrar em compliance fiscal B2B/B2C",
  "ERPs legados precisando modernizar sem construir do zero",
  "Family offices e PE buscando ativo digital com Reforma como catalisador",
  "Bancos digitais expandindo para PJ / MEI / autônomos",
];

const DEAL_INCLUDES = [
  "Código-fonte completo (frontend, backend, edge functions, IA)",
  "Domínios: atentai.com.br + subdomínios técnicos",
  "Ativo pré-launch: sem passivos, sem legado, sem CAC gasto",
  "Playbooks de marketing, funil e onboarding validados",
  "Pipeline comercial ativo e contratos em negociação",
  "Transição técnica assistida (90 dias com founding team)",
  "Identidade visual, presença SEO e conteúdo produzido",
];

const FAQS = [
  { q: "Qual o modelo da transação?", a: "Aquisição total, participação majoritária ou joint venture estratégica. Aberto a estruturas com earn-out atrelado a metas de crescimento pós-integração." },
  { q: "O time atual continua?", a: "Founding team disponível para 90 dias de transição técnica e comercial. Contratação permanente negociável conforme fit estratégico." },
  { q: "Qual o ticket de referência?", a: "Múltiplos de ARR + valor estratégico do IP fiscal e timing regulatório. Range compartilhado sob NDA em reunião de qualificação." },
  { q: "Existe due diligence pronta?", a: "Sim. Data room organizado: código, contratos, financeiro, jurídico, segurança e métricas. Acesso liberado após NDA assinado." },
  { q: "E a Reforma Tributária, muda o valor?", a: "A janela 2026-2027 é o pico de demanda. Adquirir agora é comprar o ativo antes do mercado precificar corretamente o timing." },
  { q: "Como iniciamos a conversa?", a: "Reunião de 30 minutos com o founding team. Sem compromisso, sob NDA. Agende pelo botão acima ou envie e-mail direto." },
];

export default function VenderAtentai() {
  // Força dark mode nesta LP (design cinematográfico projetado para dark)
  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");
    root.classList.add("dark");
    return () => {
      if (!hadDark) root.classList.remove("dark");
    };
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground">

      <Helmet>
        <title>Atentai — Oportunidade de Aquisição Estratégica | Reforma 2026</title>
        <meta name="description" content="Adquira a plataforma fiscal completa do Brasil. IA proprietária, 6 linhas de receita e timing único da Reforma Tributária 2026. Pitch para grupos, fintechs e PE." />
        <link rel="canonical" href="https://www.atentai.com.br/vender-atentai" />
        <meta property="og:title" content="Atentai — Aquisição Estratégica" />
        <meta property="og:description" content="Plataforma fiscal com IA proprietária pronta para escala nacional. Oportunidade única antes da Reforma Tributária 2026." />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* ============ HERO — CINEMATIC ============ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.2),transparent_50%)]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Ambient orbs */}
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] rounded-full bg-accent/20 blur-[160px]" />

        <div className="container mx-auto px-6 relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl"
          >
            {/* Top marker */}
            <div className="flex items-center gap-3 mb-10">
              <div className="h-px w-12 bg-accent" />
              <span className="text-xs tracking-[0.3em] uppercase text-accent font-semibold">
                Confidencial · Oportunidade de Aquisição
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[-0.03em] leading-[0.95] mb-8">
              Não vendemos<br />
              <span className="text-muted-foreground/40">assinaturas.</span><br />
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-[shimmer_4s_linear_infinite]">
                  Vendemos o Atentai.
                </span>
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-4 leading-relaxed">
              A plataforma fiscal mais completa do Brasil está disponível para{" "}
              <span className="text-foreground font-semibold">aquisição estratégica</span>.
            </p>
            <p className="text-base md:text-lg text-muted-foreground/70 max-w-2xl mb-14">
              IA proprietária. 6 módulos rodando. Marketplace ativo. Compliance zerado.
              Timing perfeito da Reforma Tributária 2026.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Button
                size="lg"
                onClick={() => scrollTo("contact")}
                className="group text-base px-8 py-7 bg-foreground text-background hover:bg-foreground/90 shadow-[0_20px_50px_-15px_hsl(var(--foreground)/0.5)]"
              >
                Solicitar Data Room
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollTo("assets")}
                className="text-base px-8 py-7 border-foreground/20 hover:border-foreground/40 backdrop-blur-sm"
              >
                Ver o que está incluso
              </Button>
            </div>

            {/* KPI strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-foreground/10">
              {KPIS.map((k, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <div className="text-2xl md:text-3xl font-black tracking-tight mb-1">{k.value}</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">{k.label}</div>
                  <div className="text-[11px] text-muted-foreground/60">{k.sub}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50">
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-muted-foreground/50 to-transparent" />
        </div>

        <style>{`
          @keyframes shimmer { to { background-position: 200% center; } }
        `}</style>
      </section>

      {/* ============ THESIS ============ */}
      <section className="py-32 border-t border-foreground/5">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-4">
              <div className="sticky top-24">
                <span className="text-xs tracking-[0.3em] uppercase text-accent font-semibold">01 · Tese</span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-4 leading-[1.05]">
                  Uma janela<br />
                  que <span className="text-accent">não volta.</span>
                </h2>
              </div>
            </div>
            <div className="md:col-span-8 space-y-8 text-lg md:text-xl leading-relaxed text-muted-foreground">
              <p>
                A Reforma Tributária brasileira reescreve, entre <span className="text-foreground font-semibold">2026 e 2033</span>,
                as regras de <span className="text-foreground">R$ 2,3 trilhões</span> em arrecadação anual.
              </p>
              <p>
                <span className="text-foreground font-semibold">20 milhões de empresas</span> precisam simular, migrar e recalcular.
                O mercado inteiro está órfão de ferramentas — os ERPs legados não sabem, os contadores estão sobrecarregados,
                e ninguém tem IA treinada em <span className="text-foreground">LC 214/2025</span>.
              </p>
              <p>
                O Atentai já resolveu isso. <span className="text-foreground font-semibold">A pergunta não é se alguém vai dominar essa categoria.
                A pergunta é quem chega primeiro — construindo por 3 anos, ou comprando pronto hoje.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ASSETS INCLUDED ============ */}
      <section id="assets" className="py-32 border-t border-foreground/5 bg-gradient-to-b from-background via-primary/[0.02] to-background">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mb-20">
            <span className="text-xs tracking-[0.3em] uppercase text-accent font-semibold">02 · Ativos</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mt-4 leading-[1.05]">
              O que o comprador leva.
            </h2>
            <p className="text-lg text-muted-foreground mt-6">
              Não é uma ideia. Não é um MVP. É um ecossistema em produção, com arquitetura validada, motor de receita ativado e IP defensável.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/10 rounded-3xl overflow-hidden border border-foreground/10">
            {ASSETS.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative bg-background p-8 hover:bg-primary/[0.03] transition-colors"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center group-hover:bg-accent/10 group-hover:border-accent/30 transition-all">
                    <a.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold">{a.tag}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{a.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
                <div className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full bg-gradient-to-r from-accent to-primary transition-all duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ REVENUE STREAMS ============ */}
      <section className="py-32 border-t border-foreground/5">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-12 gap-12 items-end mb-16">
            <div className="md:col-span-7">
              <span className="text-xs tracking-[0.3em] uppercase text-accent font-semibold">03 · Monetização</span>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight mt-4 leading-[1.05]">
                6 linhas de receita.<br />
                <span className="text-muted-foreground/50">Um único checkout.</span>
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="text-lg text-muted-foreground">
                Modular por design. Cada usuário entra por um produto e sobe o funil — recorrência mensal,
                anual e one-shot no mesmo motor de pagamento.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {REVENUE_STREAMS.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-background hover:border-accent/40 transition-all p-6"
              >
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold">
                    Stream · 0{i + 1}
                  </span>
                  <DollarSign className="w-4 h-4 text-accent" />
                </div>
                <h3 className="text-lg font-bold mb-2">{r.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tight">{r.arpu}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{r.freq}</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHY BUY ============ */}
      <section className="py-32 border-t border-foreground/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,hsl(var(--accent)/0.08),transparent_50%)]" />
        <div className="container mx-auto px-6 max-w-6xl relative">
          <div className="mb-20 max-w-3xl">
            <span className="text-xs tracking-[0.3em] uppercase text-accent font-semibold">04 · Por que comprar</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mt-4 leading-[1.05]">
              Construir custa 3 anos.<br />
              <span className="text-accent">Comprar custa uma reunião.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {WHY_BUY.map((w, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group flex gap-6 p-8 rounded-3xl border border-foreground/10 bg-gradient-to-br from-background to-primary/[0.03] hover:border-accent/40 transition-all"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_15px_40px_-10px_hsl(var(--primary)/0.5)]">
                  <w.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{w.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{w.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ IDEAL BUYER ============ */}
      <section className="py-32 border-t border-foreground/5">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="text-xs tracking-[0.3em] uppercase text-accent font-semibold">05 · Perfil do comprador</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-4 leading-[1.05] mb-6">
                Quem faz sentido<br />nessa mesa.
              </h2>
              <p className="text-lg text-muted-foreground">
                Estamos abertos a conversar com organizações que enxergam a Reforma Tributária como catalisador
                — não como problema.
              </p>
            </div>

            <div className="space-y-3">
              {IDEAL_BUYER.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-4 p-5 rounded-2xl border border-foreground/10 hover:border-accent/40 hover:bg-primary/[0.02] transition-all"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-accent">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <p className="text-foreground/90 leading-relaxed pt-1">{b}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHAT'S INCLUDED — DEAL SHEET ============ */}
      <section className="py-32 border-t border-foreground/5 bg-gradient-to-b from-background to-primary/[0.03]">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.3em] uppercase text-accent font-semibold">06 · Deal Sheet</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mt-4 leading-[1.05]">
              Tudo dentro da transação.
            </h2>
          </div>

          <div className="rounded-3xl border border-foreground/10 overflow-hidden backdrop-blur-sm">
            {DEAL_INCLUDES.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-6 px-8 py-6 ${i !== 0 ? "border-t border-foreground/5" : ""} hover:bg-primary/[0.03] transition-colors`}
              >
                <span className="text-xs font-mono text-muted-foreground/50 w-8">{String(i + 1).padStart(2, "0")}</span>
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-lg font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="py-32 border-t border-foreground/5">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="mb-16">
            <span className="text-xs tracking-[0.3em] uppercase text-accent font-semibold">07 · FAQ</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mt-4 leading-[1.05]">
              Perguntas de M&A.
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-foreground/10 rounded-2xl px-6 bg-background hover:border-accent/30 transition-colors"
              >
                <AccordionTrigger className="text-left font-bold hover:no-underline py-5">
                  <span className="flex items-center gap-4">
                    <span className="text-xs font-mono text-accent">{String(i + 1).padStart(2, "0")}</span>
                    {f.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pl-10">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ============ FINAL CTA — CONTACT ============ */}
      <section id="contact" className="relative py-32 border-t border-foreground/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent)/0.4),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="container mx-auto px-6 relative z-10 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 backdrop-blur-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs tracking-[0.2em] uppercase text-primary-foreground/90 font-semibold">
              Aceitando conversas até Q1 2026
            </span>
          </div>

          <h2 className="text-4xl md:text-7xl font-black tracking-[-0.03em] leading-[0.95] text-primary-foreground mb-8">
            A próxima categoria fiscal<br />
            <span className="italic font-light">tem dono?</span>
          </h2>

          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-12">
            Reunião de 30 minutos com o founding team, sob NDA. Sem compromisso, sem apresentação genérica —
            direto ao data room e aos números.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              asChild
              className="text-base px-10 py-7 bg-primary-foreground text-primary hover:bg-primary-foreground/95 shadow-2xl font-bold"
            >
              <a href="mailto:contato@atentai.com.br?subject=Interesse em aquisição — Atentai">
                <Mail className="w-5 h-5 mr-2" />
                contato@atentai.com.br
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-base px-8 py-7 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <a href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20tenho%20interesse%20em%20conversar%20sobre%20a%20aquisi%C3%A7%C3%A3o%20do%20Atentai.">
                <PhoneCall className="w-5 h-5 mr-2" />
                Agendar chamada
              </a>
            </Button>
          </div>

          <div className="pt-10 border-t border-primary-foreground/15 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-primary-foreground/60">
            <span className="flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> NDA disponível</span>
            <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> Data room organizado</span>
            <span className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5" /> Founding team disponível</span>
          </div>
        </div>
      </section>

      {/* ============ FOOTER MARK ============ */}
      <footer className="py-12 border-t border-foreground/5">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-black tracking-tight">Atentai</span>
            <span className="text-xs text-muted-foreground">· Documento confidencial</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Atentai · Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
