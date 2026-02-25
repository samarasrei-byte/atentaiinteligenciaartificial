import { Helmet } from "react-helmet-async";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  Zap, Shield, BarChart3, Clock, Users, Brain,
  CheckCircle2, ArrowRight, Sparkles, Bot, Target,
  TrendingUp, FileText, MessageCircle, AlertTriangle,
  Layers, Rocket, Globe, ChevronDown, Eye, Search,
  PieChart, Activity, LineChart
} from "lucide-react";

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

/* ── CountUp ── */
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame: number;
    const dur = 2500;
    const start = performance.now();
    const animate = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(target * ease).toLocaleString("pt-BR") + suffix;
      if (p < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

/* ── Particle effect (CSS-only) ── */
function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-primary/20"
          style={{
            width: `${Math.random() * 4 + 1}px`,
            height: `${Math.random() * 4 + 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 6 + 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}
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

/* ── Glow Text ── */
function GlowText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`relative ${className}`}>
      <span className="absolute inset-0 blur-2xl opacity-40 bg-gradient-to-r from-primary to-info" />
      <span className="relative">{children}</span>
    </span>
  );
}

export default function SeracPresentation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.08], [1, 0.95]);

  return (
    <>
      <Helmet>
        <title>SERAC + ATETAI | A Nova Era da Contabilidade Inteligente</title>
        <meta name="description" content="Apresentação exclusiva: SERAC + ATETAI - Inteligência Artificial Estratégica para Contadores" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div ref={containerRef} className="min-h-screen text-white overflow-x-hidden" style={{ background: "linear-gradient(180deg, hsl(220 45% 6%) 0%, hsl(220 40% 8%) 100%)" }}>

        {/* ═══════ SLIDE 1 — HERO ═══════ */}
        <motion.section
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          {/* Background layers */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,hsl(220_50%_15%),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,hsl(175_40%_12%),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_80%,hsl(240_40%_10%),transparent_50%)]" />
          
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "80px 80px" }}
          />
          
          <ParticleField />
          
          {/* Digital lines animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="absolute h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
                style={{
                  width: `${Math.random() * 40 + 20}%`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 60}%`,
                  animation: `shimmer ${Math.random() * 4 + 3}s linear infinite`,
                  animationDelay: `${i * 0.8}s`,
                }}
              />
            ))}
          </div>

          <motion.div
            className="relative z-10 max-w-5xl mx-auto px-6 text-center"
            initial="hidden" animate="visible" variants={stagger}
          >
            <motion.div variants={fadeUp} className="mb-12">
              <h1 className="text-6xl sm:text-7xl lg:text-9xl font-black tracking-tighter mb-4"
                style={{ textShadow: "0 0 80px hsl(175 60% 40% / 0.3)" }}>
                SERAC
              </h1>
              <p className="text-lg sm:text-xl text-white/50 tracking-[0.3em] uppercase font-light">
                Referência Nacional em Contabilidade, Consultoria e Tecnologia
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-16">
              {[
                { v: "3.500+", l: "Clientes" },
                { v: "20+", l: "Estados" },
                { v: "300+", l: "Colaboradores" },
              ].map((m, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-primary" style={{ textShadow: "0 0 30px hsl(175 60% 40% / 0.4)" }}>{m.v}</div>
                  <div className="text-sm text-white/40 mt-1">{m.l}</div>
                </div>
              ))}
            </motion.div>

            <motion.p variants={fadeUp} className="text-white/30 text-lg italic mb-6">
              Agora, um novo capítulo começa.
            </motion.p>

            <motion.div variants={scaleIn} className="inline-block">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-r from-primary via-info to-primary bg-clip-text text-transparent"
                style={{ filter: "drop-shadow(0 0 40px hsl(175 60% 40% / 0.4))" }}>
                ATETAI
              </div>
            </motion.div>

            <motion.div variants={fadeIn} className="mt-20">
              <ChevronDown className="w-8 h-8 text-white/20 mx-auto animate-bounce" />
            </motion.div>
          </motion.div>
        </motion.section>

        {/* ═══════ SLIDE 2 — QUEM É O SERAC ═══════ */}
        <section className="relative py-32 lg:py-40 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,hsl(220_50%_12%),transparent_60%)]" />
          
          <motion.div className="relative z-10 max-w-5xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="text-primary/60 text-sm tracking-[0.4em] uppercase font-medium">Quem Somos</span>
              <h2 className="text-4xl lg:text-6xl font-bold mt-4">O SERAC é referência nacional</h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
              {["Contábil", "Fiscal", "Consultiva", "Jurídica", "Tecnologia"].map((area, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-5 text-center hover:bg-white/[0.1] transition-colors duration-500">
                    <span className="text-white/80 font-medium">{area}</span>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp} className="text-center mb-8">
              <span className="text-white/40 text-sm tracking-widest uppercase">Diferenciais</span>
            </motion.div>

            <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={staggerFast} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              {[
                { icon: Sparkles, t: "Modernização" },
                { icon: Shield, t: "Metodologia Preventiva" },
                { icon: Users, t: "Atendimento Personalizado" },
                { icon: Target, t: "Preço Competitivo" },
                { icon: Rocket, t: "Clube de Benefícios" },
              ].map((d, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-5 flex items-center gap-4 hover:border-primary/30 transition-colors duration-500">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <d.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-white/80 font-medium">{d.t}</span>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════ SLIDE 3 — O FUTURO CHEGOU ═══════ */}
        <section className="relative py-32 lg:py-40 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-transparent" />
          
          <motion.div className="relative z-10 max-w-3xl mx-auto text-center" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-bold mb-8">
              O mercado contábil <span className="text-primary">mudou.</span>
            </motion.h2>
            
            <motion.p variants={fadeUp} className="text-white/40 text-lg mb-12">Empresas exigem:</motion.p>
            
            <div className="grid grid-cols-2 gap-4 mb-16">
              {[
                { icon: Zap, t: "Velocidade" },
                { icon: Brain, t: "Inteligência" },
                { icon: Activity, t: "Dados em tempo real" },
                { icon: Target, t: "Estratégia" },
              ].map((r, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-6 text-center">
                    <r.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <span className="text-white/70 font-medium">{r.t}</span>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            <motion.p variants={fadeUp} className="text-2xl lg:text-3xl font-semibold text-white/60">
              Como transformar referência em <span className="text-accent font-bold">supremacia</span>?
            </motion.p>
          </motion.div>
        </section>

        {/* ═══════ SLIDE 4 — SURGE A ATETAI ═══════ */}
        <section className="relative py-32 lg:py-48 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,hsl(175_40%_15%),transparent_60%)]" />
          <ParticleField />
          
          <motion.div className="relative z-10 max-w-4xl mx-auto text-center" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.div variants={scaleIn}>
              <Bot className="w-16 h-16 text-primary mx-auto mb-6 opacity-60" />
            </motion.div>
            <motion.h2 variants={scaleIn}
              className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight bg-gradient-to-r from-primary via-info to-primary bg-clip-text text-transparent mb-6"
              style={{ filter: "drop-shadow(0 0 60px hsl(175 60% 40% / 0.3))" }}
            >
              ATETAI
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xl sm:text-2xl text-white/50 tracking-wide mb-10">
              Inteligência Artificial Estratégica para Contadores
            </motion.p>
            <motion.div variants={fadeUp}>
              <GlassCard className="inline-block px-8 py-5">
                <p className="text-lg text-white/70">
                  A ATETAI não substitui o SERAC. <br />
                  <span className="text-primary font-semibold">Ela potencializa.</span>
                </p>
              </GlassCard>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════ SLIDE 5 — O QUE A ATETAI TRAZ ═══════ */}
        <section className="relative py-32 lg:py-40 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,hsl(220_50%_10%),transparent_50%)]" />
          
          <motion.div className="relative z-10 max-w-6xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-20">
              <span className="text-primary/60 text-sm tracking-[0.4em] uppercase font-medium">Capacidades</span>
              <h2 className="text-4xl lg:text-6xl font-bold mt-4">O que a ATETAI traz para o SERAC</h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: Search, num: "01", title: "Geração Inteligente de Leads",
                  points: ["Identifica empresas com potencial tributário", "Detecta oportunidades de economia fiscal", "Gera diagnóstico automático", "Classifica leads por nível de oportunidade"],
                },
                {
                  icon: BarChart3, num: "02", title: "Painel Executivo em Tempo Real",
                  points: ["KPIs automáticos", "Margem por cliente", "Rentabilidade por segmento", "Risco fiscal", "Oportunidades de upsell"],
                },
                {
                  icon: Layers, num: "03", title: "Automação Inteligente",
                  points: ["Classificação automática de documentos", "Leitura inteligente de notas fiscais", "Alertas fiscais preventivos", "Workflow automatizado"],
                  highlight: "Redução de custo operacional.",
                },
                {
                  icon: MessageCircle, num: "04", title: "IA Consultiva para Clientes",
                  points: ["Simulação tributária", "Diagnóstico fiscal automático", "Chat inteligente", "Projeção financeira"],
                  highlight: "Mais valor percebido. Mais retenção.",
                },
              ].map((f, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-8 h-full hover:border-primary/20 transition-all duration-500 group">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <f.icon className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <span className="text-primary/40 text-xs font-mono">{f.num}</span>
                        <h3 className="text-xl font-bold text-white">{f.title}</h3>
                      </div>
                    </div>
                    <ul className="space-y-3 mb-4">
                      {f.points.map((p, j) => (
                        <li key={j} className="flex items-start gap-3 text-white/60">
                          <CheckCircle2 className="w-4 h-4 text-primary/60 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{p}</span>
                        </li>
                      ))}
                    </ul>
                    {f.highlight && (
                      <div className="mt-4 pt-4 border-t border-white/[0.06]">
                        <p className="text-accent text-sm font-semibold">{f.highlight}</p>
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ═══════ SLIDE 6 — IMPACTO DIRETO ═══════ */}
        <section className="relative py-32 lg:py-40 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,hsl(175_40%_10%),transparent_50%)]" />
          
          <motion.div className="relative z-10 max-w-5xl mx-auto text-center" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.div variants={fadeUp}>
              <span className="text-primary/60 text-sm tracking-[0.4em] uppercase font-medium">Resultados</span>
              <h2 className="text-4xl lg:text-6xl font-bold mt-4 mb-16">Impacto Direto</h2>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-20">
              {[
                { icon: Search, label: "Leads Qualificados", color: "text-primary" },
                { icon: TrendingUp, label: "Margem", color: "text-accent" },
                { icon: Rocket, label: "Produtividade", color: "text-info" },
                { icon: Users, label: "Retenção", color: "text-success" },
                { icon: Globe, label: "Autoridade", color: "text-primary" },
              ].map((m, i) => (
                <motion.div key={i} variants={scaleIn}>
                  <GlassCard className="p-6 text-center hover:scale-105 transition-transform duration-500">
                    <m.icon className={`w-8 h-8 ${m.color} mx-auto mb-3`} />
                    <span className="text-white/60 text-sm font-medium">{m.label}</span>
                    <div className="mt-2 h-1 rounded-full bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0" />
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp}>
              <p className="text-white/40 text-lg mb-4">SERAC passa a ser:</p>
              <h3 className="text-3xl lg:text-5xl font-bold">
                A Contabilidade <span className="bg-gradient-to-r from-primary via-info to-accent bg-clip-text text-transparent">Mais Inteligente</span> do Brasil.
              </h3>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════ SLIDE 7 — MODO ESTRATÉGICO ═══════ */}
        <section className="relative py-32 lg:py-40 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-transparent" />
          
          <motion.div className="relative z-10 max-w-4xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="text-primary/60 text-sm tracking-[0.4em] uppercase font-medium">Para Sócios</span>
              <h2 className="text-4xl lg:text-6xl font-bold mt-4">Modo Estratégico</h2>
            </motion.div>

            <motion.div variants={fadeUp}>
              <GlassCard className="p-8 lg:p-12">
                <p className="text-white/40 text-sm uppercase tracking-widest mb-8">ATETAI entrega diariamente:</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: FileText, t: "Resumo executivo" },
                    { icon: AlertTriangle, t: "Alertas críticos" },
                    { icon: TrendingUp, t: "Projeções de crescimento" },
                    { icon: Eye, t: "Clientes com risco" },
                    { icon: Target, t: "Oportunidades estratégicas" },
                  ].map((item, i) => (
                    <motion.div key={i} variants={fadeUp} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                      <item.icon className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-white/70">{item.t}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
                  <p className="text-accent font-semibold text-lg">Como um Chief AI Officer interno.</p>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════ SLIDE 8 — POSICIONAMENTO ═══════ */}
        <section className="relative py-32 lg:py-40 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,hsl(175_40%_12%),transparent_60%)]" />
          
          <motion.div className="relative z-10 max-w-4xl mx-auto text-center" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.div variants={fadeUp}>
              <Globe className="w-16 h-16 text-primary/40 mx-auto mb-8" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-bold mb-8">
              SERAC já é referência.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/40 text-xl mb-6">Com ATETAI, torna-se:</motion.p>
            <motion.h3 variants={scaleIn} className="text-3xl lg:text-5xl font-black bg-gradient-to-r from-primary via-info to-accent bg-clip-text text-transparent"
              style={{ filter: "drop-shadow(0 0 40px hsl(175 60% 40% / 0.3))" }}>
              Pioneiro em Inteligência Artificial Contábil.
            </motion.h3>
          </motion.div>
        </section>

        {/* ═══════ SLIDE FINAL — CTA ═══════ */}
        <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,hsl(175_40%_10%),transparent_50%)]" />
          <ParticleField />
          
          {/* Light beam effect */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-sm" />
          </div>

          <motion.div className="relative z-10 text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={scaleIn} className="flex items-center justify-center gap-4 sm:gap-8 mb-10">
              <span className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-white"
                style={{ textShadow: "0 0 60px hsl(0 0% 100% / 0.1)" }}>
                SERAC
              </span>
              <span className="text-3xl sm:text-4xl lg:text-5xl font-light text-primary/40">+</span>
              <span className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight bg-gradient-to-r from-primary to-info bg-clip-text text-transparent"
                style={{ filter: "drop-shadow(0 0 40px hsl(175 60% 40% / 0.3))" }}>
                ATETAI
              </span>
            </motion.div>

            <motion.h2 variants={fadeUp} className="text-2xl lg:text-3xl font-bold text-white/80 mb-12">
              A Nova Era da Contabilidade Inteligente
            </motion.h2>

            <motion.div variants={staggerFast} className="flex flex-col items-center gap-3 mb-16">
              {["Mais inteligência.", "Mais estratégia.", "Mais crescimento."].map((t, i) => (
                <motion.p key={i} variants={fadeUp} className="text-lg text-white/40">{t}</motion.p>
              ))}
            </motion.div>

            <motion.div variants={fadeUp}>
              <a
                href="https://atentai.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-primary to-info text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-[0_0_40px_-10px_hsl(175_60%_40%/0.5)] group"
              >
                <Rocket className="w-5 h-5" />
                Quero saber mais
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 text-center border-t border-white/[0.05]">
          <p className="text-white/20 text-sm">© {new Date().getFullYear()} SERAC + ATETAI · Inteligência Artificial para Contadores</p>
        </footer>
      </div>
    </>
  );
}
