import { Helmet } from "react-helmet-async";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Shield, BarChart3, Users, Brain,
  CheckCircle2, ArrowRight, Rocket, Globe, ChevronDown,
  TrendingUp, Target, Zap, Building2, Scale,
  DollarSign, Calendar, Phone, Layers
} from "lucide-react";
// Background images replaced with CSS gradients

/* ── Animations ── */
const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1 } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" as const } },
};
const stagger = { visible: { transition: { staggerChildren: 0.15 } } };
const staggerFast = { visible: { transition: { staggerChildren: 0.08 } } };

/* ── Parallax Gradient Background ── */
function ParallaxBg({ gradient = "radial-gradient(ellipse at 50% 50%, hsl(175 40% 12%), hsl(220 45% 6%))", overlay = "bg-black/60" }: { gradient?: string; overlay?: string; src?: string; speed?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: gradient }} />
      <div className={`absolute inset-0 ${overlay}`} />
    </div>
  );
}

/* ── Glass Card ── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative backdrop-blur-xl bg-white/[0.06] border border-white/[0.1] rounded-2xl overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ── Funnel Step ── */
function FunnelStep({ value, label, width }: { value: string; label: string; width: string }) {
  return (
    <motion.div variants={fadeUp} className="flex flex-col items-center">
      <div className={`${width} bg-gradient-to-r from-primary/80 to-primary/40 rounded-lg py-4 text-center mb-2`}>
        <span className="text-white font-bold text-lg">{value}</span>
      </div>
      <span className="text-white/50 text-sm text-center">{label}</span>
    </motion.div>
  );
}

/* ── Projection Chart (simple bar chart) ── */
function ProjectionChart() {
  const months = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10", "M11", "M12"];
  const values = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360];
  const max = 360;
  return (
    <div className="flex items-end gap-2 h-48 mt-8">
      {months.map((m, i) => (
        <motion.div
          key={m}
          className="flex-1 flex flex-col items-center gap-1"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.5 }}
          style={{ transformOrigin: "bottom" }}
        >
          <span className="text-xs text-primary font-semibold">R${values[i]}k</span>
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary/60"
            style={{ height: `${(values[i] / max) * 100}%` }}
          />
          <span className="text-xs text-white/40 mt-1">{m}</span>
        </motion.div>
      ))}
    </div>
  );
}

export default function SeracPresentation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.06], [1, 0.95]);

  return (
    <>
      <Helmet>
        <title>SERAC Intelligence Platform | White Label powered by Atentai</title>
        <meta name="description" content="Apresentação institucional: SERAC Intelligence Platform — White Label estratégico powered by Atentai com Máquina de Prospecção Nacional de Contadores" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div ref={containerRef} className="min-h-screen text-white overflow-x-hidden" style={{ background: "linear-gradient(180deg, hsl(220 45% 6%) 0%, hsl(220 40% 8%) 100%)" }}>

        {/* ═══════ HERO — ABERTURA ═══════ */}
        <motion.section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ opacity: heroOpacity, scale: heroScale }}>
          <ParallaxBg gradient="radial-gradient(ellipse at 30% 40%, hsl(175 50% 15%), hsl(220 45% 6%))" overlay="bg-black/50" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />

          <motion.div className="relative z-10 max-w-5xl mx-auto px-6 text-center" initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="mb-8">
              <span className="text-primary/60 text-sm tracking-[0.4em] uppercase font-medium">White Label Estratégico</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter mb-4" style={{ textShadow: "0 0 80px hsl(175 60% 40% / 0.3)" }}>
              SERAC
            </motion.h1>
            <motion.p variants={fadeUp} className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white/80 mb-2">Intelligence Platform</motion.p>
            <motion.p variants={fadeUp} className="text-lg text-white/40 mb-4">Com Máquina de Prospecção Nacional de Contadores</motion.p>
            <motion.p variants={fadeIn} className="text-sm text-white/25 tracking-widest uppercase">Powered by Atentai</motion.p>

            <motion.div variants={fadeIn} className="mt-20">
              <ChevronDown className="w-8 h-8 text-white/20 mx-auto animate-bounce" />
            </motion.div>
          </motion.div>
        </motion.section>

        {/* ═══════ SLIDE 1 — OPORTUNIDADE DE MERCADO ═══════ */}
        <section className="relative py-32 lg:py-40 px-6 overflow-hidden">
          <ParallaxBg gradient="radial-gradient(ellipse at 60% 30%, hsl(200 40% 12%), hsl(220 45% 6%))" overlay="bg-black/70" />

          <motion.div className="relative z-10 max-w-5xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="text-primary/60 text-sm tracking-[0.4em] uppercase font-medium">Oportunidade</span>
              <h2 className="text-3xl lg:text-5xl font-bold mt-4">O Mercado Contábil Brasileiro<br />na Era da <span className="text-primary">Reforma Tributária</span></h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-6 mb-12">
              {[
                { icon: Users, value: "+520 mil", label: "Profissionais contábeis no Brasil" },
                { icon: Building2, value: "+90 mil", label: "Organizações contábeis ativas" },
              ].map((s, i) => (
                <motion.div key={i} variants={scaleIn}>
                  <GlassCard className="p-8 text-center">
                    <s.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                    <div className="text-4xl font-black text-primary mb-2">{s.value}</div>
                    <p className="text-white/60">{s.label}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp}>
              <GlassCard className="p-8">
                <p className="text-white/50 text-sm uppercase tracking-widest mb-6">Reforma Tributária 2026 exige reposicionamento estratégico</p>
                <p className="text-white/60 mb-4">Escritórios precisarão de:</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { icon: Brain, t: "Inteligência fiscal" },
                    { icon: BarChart3, t: "Simulação de impacto" },
                    { icon: Shield, t: "Compliance automatizado" },
                    { icon: Scale, t: "Suporte jurídico estruturado" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                      <item.icon className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-white/70">{item.t}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-12 text-center">
              <p className="text-2xl lg:text-3xl font-bold">
                Quem liderar agora <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">domina o mercado da Reforma.</span>
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════ SLIDE 2 — A SOLUÇÃO ═══════ */}
        <section className="relative py-32 lg:py-48 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,hsl(175_40%_15%),transparent_60%)]" />

          <motion.div className="relative z-10 max-w-5xl mx-auto text-center" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.div variants={scaleIn} className="mb-6">
              <h2 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight" style={{ textShadow: "0 0 60px hsl(175 60% 40% / 0.3)" }}>SERAC</h2>
              <p className="text-2xl lg:text-3xl font-bold text-primary mt-2">Intelligence Platform</p>
            </motion.div>
            <motion.p variants={fadeUp} className="text-white/50 text-lg mb-12 max-w-2xl mx-auto">
              Plataforma white label exclusiva da SERAC, com:
            </motion.p>

            <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12" variants={staggerFast} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              {[
                { icon: Brain, t: "Inteligência Fiscal com IA" },
                { icon: BarChart3, t: "Simulador da Reforma Tributária 2026" },
                { icon: Shield, t: "Agentes de IA para atendimento e compliance" },
                { icon: Target, t: "Prospecção ativa de contadores e escritórios" },
                { icon: Scale, t: "Suporte jurídico integrado" },
                { icon: Layers, t: "Dashboard executivo estratégico" },
              ].map((f, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-6 flex items-center gap-4 h-full hover:border-primary/30 transition-colors duration-500">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-white/80 font-medium text-left">{f.t}</span>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>

            <motion.p variants={fadeIn} className="text-white/25 text-sm tracking-widest uppercase">Powered by Atentai</motion.p>
          </motion.div>
        </section>

        {/* ═══════ SLIDE 3 — DIFERENCIAL ESTRATÉGICO ═══════ */}
        <section className="relative py-32 lg:py-40 px-6 overflow-hidden">
          <ParallaxBg gradient="radial-gradient(ellipse at 40% 60%, hsl(175 35% 10%), hsl(220 45% 6%))" overlay="bg-black/70" />

          <motion.div className="relative z-10 max-w-4xl mx-auto text-center" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-bold mb-4">
              Não é Software.
            </motion.h2>
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-bold mb-12">
              É <span className="text-primary">Infraestrutura de Crescimento.</span>
            </motion.h2>

            <div className="grid sm:grid-cols-2 gap-4 mb-16">
              {[
                { icon: Zap, t: "Tecnologia", d: "IA aplicada à gestão contábil" },
                { icon: Shield, t: "Autoridade técnica", d: "Posicionamento nacional" },
                { icon: Users, t: "Aquisição previsível de contadores", d: "Pipeline estruturado" },
                { icon: TrendingUp, t: "Receita recorrente escalável", d: "Crescimento sustentável" },
              ].map((d, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-6 text-left h-full">
                    <d.icon className="w-8 h-8 text-primary mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">{d.t}</h3>
                    <p className="text-white/50 text-sm">{d.d}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp}>
              <GlassCard className="p-8 border-primary/20">
                <p className="text-lg text-white/70">
                  SERAC deixa de ser apenas escritório contábil e passa a ser{" "}
                  <span className="text-primary font-bold">plataforma nacional de inteligência fiscal.</span>
                </p>
              </GlassCard>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════ SLIDE 4 — MÁQUINA DE PROSPECÇÃO ═══════ */}
        <section className="relative py-32 lg:py-40 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,hsl(175_40%_10%),transparent_50%)]" />

          <motion.div className="relative z-10 max-w-5xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="text-primary/60 text-sm tracking-[0.4em] uppercase font-medium">Prospecção Incluída</span>
              <h2 className="text-3xl lg:text-5xl font-bold mt-4">Aquisição Ativa de <span className="text-primary">Contadores</span></h2>
            </motion.div>

            <motion.div variants={fadeUp} className="mb-12">
              <GlassCard className="p-8">
                <p className="text-white/40 text-sm uppercase tracking-widest mb-8">Prospecção mensal estruturada</p>
                <div className="space-y-4">
                  <FunnelStep value="2.000" label="Contadores impactados por mês" width="w-full" />
                  <FunnelStep value="10%" label="Taxa média de resposta → 200 respostas" width="w-[85%]" />
                  <FunnelStep value="30%" label="Conversão para reunião → 60 reuniões" width="w-[65%]" />
                  <FunnelStep value="20%" label="Taxa de fechamento → 12 contratos" width="w-[45%]" />
                </div>
              </GlassCard>
            </motion.div>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { value: "12", label: "Novos contratos por mês", sub: "Ticket médio: R$ 2.500" },
                { value: "R$ 30k", label: "Receita adicional/mês", sub: "A partir do primeiro mês" },
                { value: "R$ 180k", label: "Acumulados em 6 meses", sub: "Crescimento composto" },
              ].map((r, i) => (
                <motion.div key={i} variants={scaleIn}>
                  <GlassCard className="p-6 text-center">
                    <div className="text-3xl font-black text-primary mb-2">{r.value}</div>
                    <p className="text-white/70 font-medium mb-1">{r.label}</p>
                    <p className="text-white/40 text-xs">{r.sub}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ═══════ SLIDE 5 — MODELO FINANCEIRO ═══════ */}
        <section className="relative py-32 lg:py-40 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-transparent" />

          <motion.div className="relative z-10 max-w-4xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="text-primary/60 text-sm tracking-[0.4em] uppercase font-medium">Investimento</span>
              <h2 className="text-3xl lg:text-5xl font-bold mt-4">Estrutura de Investimento</h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <motion.div variants={fadeUp}>
                <GlassCard className="p-8 h-full">
                  <h3 className="text-lg font-bold text-white mb-6">Modelo White Label + Prospecção</h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-white/40 text-sm mb-1">Setup estratégico</p>
                      <p className="text-2xl font-bold text-primary">R$ 120.000 a R$ 180.000</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-sm mb-1">Mensalidade</p>
                      <p className="text-2xl font-bold text-primary">R$ 30.000 a R$ 60.000</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div variants={fadeUp}>
                <GlassCard className="p-8 h-full border-primary/20">
                  <h3 className="text-lg font-bold text-white mb-6">Modelo Híbrido</h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-white/40 text-sm mb-1">Mensalidade fixa</p>
                      <p className="text-2xl font-bold text-primary">R$ 25.000</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-sm mb-1">Performance</p>
                      <p className="text-2xl font-bold text-accent">10% a 20%</p>
                      <p className="text-white/50 text-sm">sobre novos contratos fechados</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} className="text-center">
              <GlassCard className="inline-block px-8 py-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="text-white/70 font-medium">Contrato mínimo: <span className="text-primary font-bold">12 meses</span></span>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════ SLIDE 6 — PROJEÇÃO 12 MESES ═══════ */}
        <section className="relative py-32 lg:py-40 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,hsl(220_50%_10%),transparent_50%)]" />

          <motion.div className="relative z-10 max-w-5xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <span className="text-primary/60 text-sm tracking-[0.4em] uppercase font-medium">Projeção</span>
              <h2 className="text-3xl lg:text-5xl font-bold mt-4">Simulação de 12 Meses</h2>
            </motion.div>

            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              {[
                { value: "12/mês", label: "Novos contratos", icon: Users },
                { value: "144/ano", label: "Total de contratos", icon: TrendingUp },
                { value: "R$ 2.500", label: "Ticket médio", icon: DollarSign },
              ].map((s, i) => (
                <motion.div key={i} variants={scaleIn}>
                  <GlassCard className="p-6 text-center">
                    <s.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <div className="text-2xl font-black text-white mb-1">{s.value}</div>
                    <p className="text-white/50 text-sm">{s.label}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp}>
              <GlassCard className="p-8">
                <p className="text-white/40 text-sm uppercase tracking-widest mb-2">Receita acumulada mês a mês (R$ mil)</p>
                <ProjectionChart />
              </GlassCard>
            </motion.div>

            <motion.div variants={scaleIn} className="mt-8 text-center">
              <GlassCard className="inline-block px-10 py-6 border-primary/30">
                <p className="text-white/50 text-sm mb-2">Receita potencial anual</p>
                <p className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent" style={{ filter: "drop-shadow(0 0 40px hsl(175 60% 40% / 0.3))" }}>
                  R$ 4.320.000
                </p>
              </GlassCard>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════ SLIDE 7 — POSICIONAMENTO FINAL ═══════ */}
        <section className="relative py-32 lg:py-40 px-6 overflow-hidden">
          <ParallaxBg gradient="radial-gradient(ellipse at 50% 50%, hsl(175 40% 12%), hsl(220 45% 6%))" overlay="bg-black/60" />

          <motion.div className="relative z-10 max-w-4xl mx-auto text-center" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.div variants={fadeUp}>
              <Globe className="w-16 h-16 text-primary/40 mx-auto mb-8" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-bold mb-8">
              SERAC como <span className="text-primary">Plataforma Nacional</span><br />da Reforma 2026
            </motion.h2>

            <motion.div variants={fadeUp} className="space-y-6 mb-12">
              <GlassCard className="p-8">
                <p className="text-xl text-white/70 leading-relaxed">
                  A SERAC não está adquirindo tecnologia.<br />
                  <span className="text-primary font-bold text-2xl">Está estruturando uma máquina de crescimento nacional.</span>
                </p>
              </GlassCard>
            </motion.div>

            <motion.div variants={fadeUp}>
              <p className="text-lg text-white/50 mb-4">A Reforma Tributária será o maior evento contábil da década.</p>
              <p className="text-2xl lg:text-3xl font-bold">
                Quem liderar agora se torna <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">referência definitiva.</span>
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════ SLIDE 8 — CALL TO ACTION ═══════ */}
        <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,hsl(175_40%_10%),transparent_50%)]" />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-sm" />
          </div>

          <motion.div className="relative z-10 text-center max-w-3xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-black mb-12">
              Próximo Passo
            </motion.h2>

            <motion.div className="space-y-4 mb-16" variants={staggerFast}>
              {[
                { num: "01", t: "Aprovação do modelo" },
                { num: "02", t: "Definição do formato de monetização" },
                { num: "03", t: "Início da implementação" },
                { num: "04", t: "Go-live estratégico" },
              ].map((step, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-mono font-bold text-sm">{step.num}</span>
                    </div>
                    <span className="text-white/80 font-medium text-lg">{step.t}</span>
                    <CheckCircle2 className="w-5 h-5 text-primary/40 ml-auto" />
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={scaleIn} className="mb-12">
              <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent" style={{ filter: "drop-shadow(0 0 40px hsl(175 60% 40% / 0.3))" }}>
                O momento de posicionamento é agora.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://atentai.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-[0_0_40px_-10px_hsl(175_60%_40%/0.5)] group"
              >
                <Rocket className="w-5 h-5" />
                Agendar Reunião
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-5 rounded-2xl border border-white/10 text-white/70 font-medium text-lg hover:bg-white/[0.05] transition-colors"
              >
                <Phone className="w-5 h-5" />
                Falar pelo WhatsApp
              </a>
            </motion.div>

            <motion.p variants={fadeIn} className="mt-12 text-white/20 text-sm tracking-widest uppercase">
              Powered by Atentai
            </motion.p>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 text-center border-t border-white/[0.05]">
          <p className="text-white/20 text-sm">© {new Date().getFullYear()} SERAC Intelligence Platform · Powered by Atentai</p>
        </footer>
      </div>
    </>
  );
}
