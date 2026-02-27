import { Helmet } from "react-helmet-async";
import { motion, useScroll, useTransform } from "framer-motion";
import { SeracAgentsOrchestration } from "@/components/serac/SeracAgentsOrchestration";
import { useRef } from "react";
import {
  Shield, BarChart3, Users, Brain,
  ArrowRight, ChevronDown,
  TrendingUp, Target, Zap, Building2, Scale,
  DollarSign, Calendar, Layers, Sparkles,
  Rocket, Globe, Code2, Cpu, Eye,
  LineChart, Bot, Lightbulb
} from "lucide-react";

/* ── Animations ── */
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
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
const slideLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};
const slideRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};

/* ── Glass Card ── */
function GlassCard({ children, className = "", accent = false, glow = false }: { children: React.ReactNode; className?: string; accent?: boolean; glow?: boolean }) {
  return (
    <div className={`
      rounded-2xl border backdrop-blur-xl transition-all duration-500 group
      ${accent
        ? "border-cyan-400/30 bg-gradient-to-br from-cyan-950/50 to-slate-900/50 shadow-[0_0_30px_hsl(185_80%_50%/0.1)]"
        : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.15]"
      }
      ${glow ? "shadow-[0_0_40px_hsl(185_80%_50%/0.15)] hover:shadow-[0_0_60px_hsl(185_80%_50%/0.25)]" : "shadow-2xl"}
      ${className}
    `}>
      {children}
    </div>
  );
}

/* ── Glass Button ── */
function GlassButton({ children, className = "", variant = "default" }: { children: React.ReactNode; className?: string; variant?: "default" | "primary" | "ghost" }) {
  const base = "inline-flex items-center gap-2 font-semibold rounded-xl px-6 py-3 transition-all duration-300 backdrop-blur-md border text-sm";
  const variants = {
    default: "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20 hover:text-white",
    primary: "border-cyan-400/40 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 hover:from-cyan-500/30 hover:to-blue-500/30 hover:text-white shadow-[0_0_20px_hsl(185_80%_50%/0.2)] hover:shadow-[0_0_30px_hsl(185_80%_50%/0.35)]",
    ghost: "border-transparent bg-transparent text-slate-400 hover:text-cyan-400 hover:bg-white/5",
  };
  return <button className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
}

/* ── Funnel Step ── */
function FunnelStep({ value, label, width, index }: { value: string; label: string; width: string; index: number }) {
  return (
    <motion.div variants={fadeUp} className="flex flex-col items-center">
      <div
        className={`${width} mx-auto rounded-2xl py-5 text-center mb-2 border border-cyan-500/20 backdrop-blur-lg`}
        style={{ background: `linear-gradient(135deg, hsl(185 80% ${20 - index * 3}% / 0.6), hsl(200 70% ${15 - index * 3}% / 0.4))` }}
      >
        <span className="text-cyan-300 font-black text-xl">{value}</span>
      </div>
      <span className="text-slate-500 text-sm text-center max-w-xs">{label}</span>
    </motion.div>
  );
}

/* ── Projection Chart ── */
function ProjectionChart() {
  const months = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10", "M11", "M12"];
  const values = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360];
  const max = 400;
  return (
    <div className="flex items-end gap-2 sm:gap-3 h-56 mt-8 px-2">
      {months.map((m, i) => (
        <motion.div
          key={m}
          className="flex-1 flex flex-col items-center gap-1"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.07, duration: 0.5 }}
          style={{ transformOrigin: "bottom" }}
        >
          <span className="text-xs font-bold text-cyan-400">R${values[i]}k</span>
          <div
            className="w-full rounded-t-lg"
            style={{
              height: `${(values[i] / max) * 100}%`,
              background: `linear-gradient(to top, hsl(185 80% 25%), hsl(200 70% 55%))`,
              boxShadow: "0 0 20px hsl(185 80% 40% / 0.4)",
            }}
          />
          <span className="text-xs text-slate-600 mt-1">{m}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Parallax Section ── */
function ParallaxSection({ children, className = "", id, speed = 0.3 }: { children: React.ReactNode; className?: string; id?: string; speed?: number }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [80 * speed, -80 * speed]);

  return (
    <section id={id} ref={ref} className={`relative py-28 lg:py-36 px-6 overflow-hidden ${className}`}>
      <motion.div
        className="max-w-6xl mx-auto relative z-10"
        style={{ y }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
      >
        {children}
      </motion.div>
    </section>
  );
}

/* ── Badge ── */
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold tracking-[0.2em] uppercase px-5 py-2 rounded-full mb-5 backdrop-blur-sm">
      <Sparkles className="w-3 h-3" />
      {children}
    </span>
  );
}

/* ── Startup Card ── */
function StartupCard({ name, description, icon: Icon, tags, gradient }: {
  name: string; description: string; icon: React.ElementType; tags: string[]; gradient: string;
}) {
  return (
    <motion.div variants={scaleIn}>
      <GlassCard className="p-8 h-full relative overflow-hidden group cursor-pointer">
        {/* Background glow */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 ${gradient}`} />
        <div className="relative z-10">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-white/10 backdrop-blur-sm ${gradient} bg-opacity-20`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-black text-white mb-3">{name}</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-5">{description}</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default function SeracPresentation() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], [0, 200]);
  const heroOpacity = useTransform(heroScroll, [0, 0.6], [1, 0]);
  const heroScale = useTransform(heroScroll, [0, 0.6], [1, 0.9]);

  return (
    <>
      <Helmet>
        <title>SERAC Intelligence Platform | White Label powered by Atentai</title>
        <meta name="description" content="Apresentação institucional: SERAC Intelligence Platform — White Label estratégico powered by Atentai com Máquina de Prospecção Nacional de Contadores" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden font-sans">

        {/* ═══════ HERO with Parallax ═══════ */}
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
          {/* Animated grid */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(hsl(185 60% 50% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(185 60% 50% / 0.3) 1px, transparent 0)", backgroundSize: "60px 60px" }} />
          {/* Glow orbs parallax */}
          <motion.div style={{ y: heroY }} className="absolute inset-0">
            <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-cyan-500/8 blur-[150px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/8 blur-[120px]" />
            <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[100px]" />
            <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[80px]" />
          </motion.div>
          {/* Noise texture */}
          <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />

          <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp}>
                <Badge>White Label Estratégico</Badge>
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-6xl sm:text-7xl lg:text-9xl font-black tracking-tighter text-white mb-4" style={{ textShadow: "0 0 80px hsl(185 80% 50% / 0.15)" }}>
                SERAC
              </motion.h1>
              <motion.p variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent mb-4">
                Intelligence Platform
              </motion.p>
              <motion.p variants={fadeUp} className="text-lg text-slate-400 mb-4 max-w-2xl mx-auto">
                Com Máquina de Prospecção Nacional de Contadores
              </motion.p>
              <motion.p variants={fadeIn} className="text-sm text-slate-600 tracking-[0.3em] uppercase font-medium">
                Powered by Atentai
              </motion.p>
              <motion.div variants={fadeIn} className="mt-20 flex justify-center gap-4">
                <GlassButton variant="primary">
                  <Rocket className="w-4 h-4" /> Explorar Plataforma
                </GlassButton>
                <GlassButton>
                  <Eye className="w-4 h-4" /> Ver Demo
                </GlassButton>
              </motion.div>
              <motion.div variants={fadeIn} className="mt-14">
                <ChevronDown className="w-7 h-7 text-cyan-500/40 mx-auto animate-bounce" />
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════ STARTUPS ECOSYSTEM ═══════ */}
        <ParallaxSection className="bg-slate-950 border-t border-white/[0.03]" speed={0.2}>
          <motion.div variants={fadeUp} className="text-center mb-16">
            <Badge>Ecossistema</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">
              3 Startups. <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">1 Visão.</span>
            </h2>
            <p className="text-slate-500 text-lg mt-4 max-w-2xl mx-auto">Tecnologia de ponta unida para transformar o mercado contábil brasileiro</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <StartupCard
              name="AtentAI"
              description="Inteligência Artificial aplicada à gestão contábil e fiscal. Motor de IA que alimenta toda a plataforma com análise preditiva e automação inteligente."
              icon={Brain}
              tags={["IA", "Machine Learning", "NLP"]}
              gradient="bg-cyan-500"
            />
            <StartupCard
              name="G8"
              description="Infraestrutura de dados e compliance para o mercado financeiro. Segurança, governança e processamento em escala nacional."
              icon={Shield}
              tags={["Compliance", "Data", "Segurança"]}
              gradient="bg-violet-500"
            />
            <StartupCard
              name="Clauthor"
              description="Plataforma de automação jurídica e documental. Geração inteligente de contratos, pareceres e análise de risco legal."
              icon={Scale}
              tags={["Legal Tech", "Automação", "Docs"]}
              gradient="bg-emerald-500"
            />
          </div>
        </ParallaxSection>

        {/* ═══════ QUEM SOMOS — Inspired by reference ═══════ */}
        <ParallaxSection className="bg-slate-900/50 border-t border-white/[0.03]" speed={0.4}>
          <motion.div variants={fadeUp} className="text-center mb-6">
            <Badge>Quem Somos</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">
              O SERAC é <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">referência nacional</span>
            </h2>
          </motion.div>

          {/* Area tags — glass style like reference */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto mt-12 mb-14">
            {["Contábil", "Fiscal", "Consultiva", "Jurídica", "Tecnologia"].map((area, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div className={`rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl py-5 px-6 text-center hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300 cursor-pointer ${i === 4 ? "sm:col-span-1" : ""}`}>
                  <span className="text-slate-300 font-bold text-lg">{area}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Diferenciais */}
          <motion.div variants={fadeUp} className="text-center mb-8">
            <span className="text-slate-600 text-xs font-bold tracking-[0.3em] uppercase">Diferenciais</span>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { icon: Sparkles, t: "Modernização", d: "Tecnologia de ponta para escritórios contábeis" },
              { icon: Shield, t: "Metodologia Preventiva", d: "Compliance proativo e gestão de riscos" },
              { icon: Users, t: "Capital Humano", d: "Equipe especializada em transformação digital" },
              { icon: Target, t: "Resultados Mensuráveis", d: "KPIs claros e ROI comprovado" },
            ].map((d, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-7 h-full">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">
                    <d.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{d.t}</h3>
                  <p className="text-slate-500 text-sm">{d.d}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </ParallaxSection>

        {/* ═══════ OPORTUNIDADE DE MERCADO ═══════ */}
        <ParallaxSection className="bg-slate-950 border-t border-white/[0.03]">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <Badge>Oportunidade</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">
              Reforma Tributária<br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">2026</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {[
              { icon: Users, value: "+520 mil", label: "Profissionais contábeis no Brasil" },
              { icon: Building2, value: "+90 mil", label: "Organizações contábeis ativas" },
            ].map((s, i) => (
              <motion.div key={i} variants={scaleIn}>
                <GlassCard glow className="p-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-5">
                    <s.icon className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">{s.value}</div>
                  <p className="text-slate-500">{s.label}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp}>
            <GlassCard className="p-8">
              <p className="text-slate-600 text-xs font-bold tracking-[0.2em] uppercase mb-6">Reforma Tributária 2026 exige reposicionamento estratégico</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: Brain, t: "Inteligência fiscal" },
                  { icon: BarChart3, t: "Simulação de impacto" },
                  { icon: Shield, t: "Compliance automatizado" },
                  { icon: Scale, t: "Suporte jurídico estruturado" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.06] transition-colors">
                    <item.icon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <span className="text-slate-300 font-medium">{item.t}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-14 text-center">
            <p className="text-3xl lg:text-4xl font-black text-white">
              Quem liderar agora <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">domina o mercado.</span>
            </p>
          </motion.div>
        </ParallaxSection>

        {/* ═══════ A SOLUÇÃO ═══════ */}
        <ParallaxSection className="bg-slate-900/50 border-t border-white/[0.03]" speed={0.3}>
          <motion.div variants={scaleIn} className="text-center mb-8">
            <Badge>A Solução</Badge>
            <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white mt-3" style={{ textShadow: "0 0 60px hsl(185 80% 50% / 0.1)" }}>SERAC</h2>
            <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent mt-2">Intelligence Platform</p>
          </motion.div>
          <motion.p variants={fadeUp} className="text-slate-500 text-lg mb-12 max-w-2xl mx-auto text-center">
            Plataforma white label exclusiva da SERAC
          </motion.p>

          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {[
              { icon: Brain, t: "Inteligência Fiscal com IA" },
              { icon: BarChart3, t: "Simulador da Reforma Tributária 2026" },
              { icon: Bot, t: "Agentes de IA para compliance" },
              { icon: Target, t: "Prospecção ativa de contadores" },
              { icon: Scale, t: "Suporte jurídico integrado" },
              { icon: Layers, t: "Dashboard executivo estratégico" },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 flex items-center gap-4 h-full">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <span className="text-slate-300 font-semibold">{f.t}</span>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>

          <motion.p variants={fadeIn} className="text-slate-600 text-sm tracking-[0.3em] uppercase text-center mt-10 font-medium">Powered by Atentai</motion.p>
        </ParallaxSection>

        {/* ═══════ DIFERENCIAL ESTRATÉGICO ═══════ */}
        <ParallaxSection className="bg-slate-950 border-t border-white/[0.03]" speed={0.35}>
          <motion.div variants={fadeUp} className="text-center mb-5">
            <Badge>Diferencial</Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-black text-white text-center mb-3">
            Não é Software.
          </motion.h2>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-black text-center mb-14">
            É <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Infraestrutura de Crescimento.</span>
          </motion.h2>

          <div className="grid sm:grid-cols-2 gap-6 mb-16">
            {[
              { icon: Zap, t: "Tecnologia", d: "IA aplicada à gestão contábil" },
              { icon: Shield, t: "Autoridade técnica", d: "Posicionamento nacional" },
              { icon: Users, t: "Aquisição previsível", d: "Pipeline estruturado de contadores" },
              { icon: TrendingUp, t: "Receita escalável", d: "Crescimento sustentável e recorrente" },
            ].map((d, i) => (
              <motion.div key={i} variants={i % 2 === 0 ? slideLeft : slideRight}>
                <GlassCard className="p-8 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">
                    <d.icon className="w-7 h-7 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{d.t}</h3>
                  <p className="text-slate-500">{d.d}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp}>
            <GlassCard accent glow className="p-10 text-center">
              <p className="text-xl text-slate-300 leading-relaxed">
                SERAC deixa de ser apenas escritório contábil e passa a ser{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">plataforma nacional de inteligência fiscal.</span>
              </p>
            </GlassCard>
          </motion.div>

          {/* Agents Orchestration */}
          <motion.div variants={fadeUp} className="mt-14">
            <SeracAgentsOrchestration />
          </motion.div>
        </ParallaxSection>

        {/* ═══════ MÁQUINA DE PROSPECÇÃO ═══════ */}
        <ParallaxSection className="bg-slate-900/50 border-t border-white/[0.03]" speed={0.25}>
          <motion.div variants={fadeUp} className="text-center mb-16">
            <Badge>Prospecção Incluída</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">
              Aquisição Ativa de <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Contadores</span>
            </h2>
          </motion.div>

          <motion.div variants={fadeUp} className="mb-12">
            <GlassCard className="p-10">
              <p className="text-slate-600 text-xs font-bold tracking-[0.2em] uppercase mb-10">Prospecção mensal estruturada</p>
              <div className="space-y-5">
                <FunnelStep value="5.000" label="Contadores impactados por mês" width="w-full" index={0} />
                <FunnelStep value="10%" label="Taxa média de resposta → 500 respostas" width="w-[85%]" index={1} />
                <FunnelStep value="30%" label="Conversão para reunião → 150 reuniões" width="w-[65%]" index={2} />
                <FunnelStep value="20%" label="Taxa de fechamento → 30 contratos" width="w-[45%]" index={3} />
              </div>
            </GlassCard>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { value: "30", label: "Novos contratos/mês", sub: "Ticket médio: R$ 2.500" },
              { value: "R$ 75k", label: "Receita adicional/mês", sub: "A partir do primeiro mês" },
              { value: "R$ 450k", label: "Acumulados em 6 meses", sub: "Crescimento composto" },
            ].map((r, i) => (
              <motion.div key={i} variants={scaleIn}>
                <GlassCard glow className="p-7 text-center">
                  <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">{r.value}</div>
                  <p className="text-slate-300 font-semibold mb-1">{r.label}</p>
                  <p className="text-slate-600 text-xs">{r.sub}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </ParallaxSection>

        {/* ═══════ MODELO FINANCEIRO ═══════ */}
        <ParallaxSection className="bg-slate-950 border-t border-white/[0.03]">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <Badge>Investimento</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">Estrutura de Investimento</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <motion.div variants={slideLeft}>
              <GlassCard className="p-10 h-full">
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-cyan-400" />
                  </div>
                  White Label + Prospecção
                </h3>
                <div className="space-y-8">
                  <div>
                    <p className="text-slate-600 text-xs font-bold tracking-wider uppercase mb-2">Setup estratégico</p>
                    <p className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">R$ 120k – R$ 180k</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs font-bold tracking-wider uppercase mb-2">Mensalidade</p>
                    <p className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">R$ 30k – R$ 60k</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div variants={slideRight}>
              <GlassCard accent glow className="p-10 h-full">
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                  </div>
                  Modelo Híbrido (Performance)
                </h3>
                <div className="space-y-8">
                  <div>
                    <p className="text-slate-600 text-xs font-bold tracking-wider uppercase mb-2">Mensalidade fixa</p>
                    <p className="text-3xl font-black text-cyan-400">R$ 25.000</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs font-bold tracking-wider uppercase mb-2">+ Performance</p>
                    <p className="text-3xl font-black text-cyan-400">10% a 20%</p>
                    <p className="text-slate-500 text-sm mt-2">sobre novos contratos fechados</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          <motion.div variants={fadeUp} className="text-center">
            <GlassButton variant="default">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Contrato mínimo: <strong className="text-white">12 meses</strong>
            </GlassButton>
          </motion.div>
        </ParallaxSection>

        {/* ═══════ PROJEÇÃO 12 MESES ═══════ */}
        <ParallaxSection className="bg-slate-900/50 border-t border-white/[0.03]" speed={0.3}>
          <motion.div variants={fadeUp} className="text-center mb-8">
            <Badge>Projeção</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">Projeção de 12 Meses</h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-5 mb-8">
            {[
              { value: "12/mês", label: "Novos contratos" },
              { value: "144/ano", label: "Total de contratos" },
              { value: "R$ 2.500", label: "Ticket médio" },
            ].map((s, i) => (
              <motion.div key={i} variants={scaleIn}>
                <GlassCard className="p-6 text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{s.value}</div>
                  <p className="text-slate-500 text-sm mt-2">{s.label}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp}>
            <GlassCard className="p-10">
              <ProjectionChart />
            </GlassCard>
          </motion.div>

          <motion.div variants={scaleIn} className="mt-10 text-center">
            <GlassCard accent glow className="inline-block px-12 py-8">
              <p className="text-sm text-slate-500 tracking-[0.3em] uppercase font-bold mb-3">Receita potencial anual</p>
              <p className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent" style={{ textShadow: "0 0 40px hsl(185 80% 50% / 0.2)" }}>
                R$ 4.320.000
              </p>
            </GlassCard>
          </motion.div>
        </ParallaxSection>

        {/* ═══════ POSICIONAMENTO FINAL ═══════ */}
        <ParallaxSection className="bg-slate-950 border-t border-white/[0.03]" speed={0.4}>
          <motion.div variants={fadeUp} className="text-center mb-5">
            <Badge>Posicionamento</Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-black text-white text-center mb-14">
            SERAC como <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Plataforma Nacional</span><br />da Reforma 2026
          </motion.h2>

          <motion.div variants={fadeUp} className="max-w-3xl mx-auto text-center space-y-8">
            <p className="text-2xl text-slate-300 leading-relaxed">
              A SERAC não está adquirindo tecnologia.<br />
              <strong className="text-white">Está estruturando uma máquina de crescimento nacional.</strong>
            </p>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mx-auto" />
            <p className="text-2xl text-slate-300 leading-relaxed">
              A Reforma Tributária será o maior evento contábil da década.<br />
              <strong className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Quem liderar agora se torna referência definitiva.</strong>
            </p>
          </motion.div>
        </ParallaxSection>

        {/* ═══════ CTA ═══════ */}
        <ParallaxSection className="bg-slate-900/50 border-t border-white/[0.03]" speed={0.2}>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <Badge>Próximo Passo</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">Próximo Passo</h2>
          </motion.div>

          <div className="max-w-2xl mx-auto space-y-4 mb-16">
            {[
              { step: "01", t: "Aprovação do modelo" },
              { step: "02", t: "Definição do formato de monetização" },
              { step: "03", t: "Início da implementação" },
              { step: "04", t: "Go-live estratégico" },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 flex items-center gap-5 cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-black text-sm">{s.step}</span>
                  </div>
                  <span className="text-white font-bold text-lg">{s.t}</span>
                  <ArrowRight className="w-5 h-5 text-cyan-500/40 ml-auto group-hover:text-cyan-400 transition-colors" />
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <motion.div variants={scaleIn} className="text-center">
            <GlassCard accent glow className="inline-block px-14 py-10">
              <p className="text-3xl lg:text-4xl font-black text-white mb-3">
                O momento é <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">agora.</span>
              </p>
              <p className="text-slate-500 font-medium">SERAC Intelligence Platform · Powered by Atentai</p>
              <div className="flex justify-center gap-4 mt-8">
                <GlassButton variant="primary">
                  <Rocket className="w-4 h-4" /> Iniciar Parceria
                </GlassButton>
                <GlassButton>
                  <Globe className="w-4 h-4" /> Agendar Reunião
                </GlassButton>
              </div>
            </GlassCard>
          </motion.div>
        </ParallaxSection>

        {/* Footer */}
        <footer className="py-10 px-6 text-center border-t border-white/[0.05] bg-slate-950">
          <p className="text-slate-600 text-sm font-medium">© {new Date().getFullYear()} SERAC Intelligence Platform · Powered by Atentai</p>
        </footer>
      </div>
    </>
  );
}
