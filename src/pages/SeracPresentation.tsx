import { Helmet } from "react-helmet-async";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { SeracAgentsOrchestration } from "@/components/serac/SeracAgentsOrchestration";
import { SeracAgentSimulation } from "@/components/serac/SeracAgentSimulation";
import { useRef, useEffect, useState } from "react";
import {
  Shield, BarChart3, Users, Brain,
  ArrowRight, ChevronDown,
  TrendingUp, Target, Zap, Building2, Scale,
  DollarSign, Calendar, Layers, Sparkles,
  Rocket, Globe, Code2, Cpu, Eye,
  LineChart, Bot, Lightbulb, FileText,
  MessageCircle, HelpCircle, CheckCircle2
} from "lucide-react";
import seracHeroBg from "@/assets/serac-hero-bg.jpg";
import seracAiBrain from "@/assets/serac-ai-brain.jpg";
import seracDashboard from "@/assets/serac-dashboard.jpg";
import seracOffice from "@/assets/serac-office.png";
import seracBuilding from "@/assets/serac-building.png";

/* ── Animated Counter ── */
function AnimatedCounter({ value, suffix = "", prefix = "", duration = 2 }: { value: number; suffix?: string; prefix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = value;
    const step = end / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplayed(end);
        clearInterval(timer);
      } else {
        setDisplayed(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}{displayed.toLocaleString("pt-BR")}{suffix}
    </span>
  );
}

/* ── Floating Particles ── */
function FloatingParticles({ count = 30 }: { count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-cyan-400/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

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

/* ── Glowing Number Card ── */
function GlowingStat({ value, label, sub, delay = 0 }: { value: number; label: string; sub: string; delay?: number }) {
  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <GlassCard glow className="p-7 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent" />
        <div className="relative z-10">
          <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">
            <AnimatedCounter value={value} duration={2} />
          </div>
          <p className="text-slate-300 font-semibold mb-1">{label}</p>
          <p className="text-slate-600 text-xs">{sub}</p>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ── FAQ Item ── */
function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div variants={fadeUp}>
      <GlassCard className={`p-6 cursor-pointer transition-all duration-300 ${open ? "border-cyan-500/30" : ""}`}>
        <button onClick={() => setOpen(!open)} className="w-full text-left flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-cyan-400 font-bold text-xs">P{index}</span>
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm leading-relaxed">{question}</p>
            {open && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-slate-400 text-sm mt-3 leading-relaxed"
              >
                {answer}
              </motion.p>
            )}
          </div>
          <ChevronDown className={`w-5 h-5 text-cyan-500/50 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
        </button>
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
  const heroImgScale = useTransform(heroScroll, [0, 1], [1, 1.3]);

  return (
    <>
      <Helmet>
        <title>SERAC Intelligence Platform | Proposta Comercial powered by AtentAI</title>
        <meta name="description" content="Proposta comercial estratégica: Departamento de Agentes de Prospecção exclusivo para SERAC — powered by AtentAI, G8 Prospect & Clauthor" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden font-sans">

        {/* ═══════ HERO ═══════ */}
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
          <motion.div style={{ scale: heroImgScale }} className="absolute inset-0">
            <img src={seracHeroBg} alt="" className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/40 to-slate-950" />
          </motion.div>
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(hsl(185 60% 50% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(185 60% 50% / 0.3) 1px, transparent 0)", backgroundSize: "60px 60px" }} />
          <FloatingParticles count={40} />
          <motion.div style={{ y: heroY }} className="absolute inset-0">
            <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-cyan-500/8 blur-[150px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/8 blur-[120px]" />
            <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[100px]" />
          </motion.div>

          <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp}>
                <Badge>Proposta Comercial Exclusiva</Badge>
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-6xl sm:text-7xl lg:text-9xl font-black tracking-tighter text-white mb-4" style={{ textShadow: "0 0 80px hsl(185 80% 50% / 0.15)" }}>
                SERAC
              </motion.h1>
              <motion.p variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent mb-4">
                Departamento de Prospecção com IA
              </motion.p>
              <motion.p variants={fadeUp} className="text-lg text-slate-400 mb-4 max-w-3xl mx-auto">
                Criação de um departamento de agentes de prospecção dedicado e exclusivo para o SERAC, integrando <strong className="text-cyan-400">AtentAI</strong>, <strong className="text-violet-400">G8 Prospect</strong> e <strong className="text-emerald-400">Clauthor</strong>
              </motion.p>

              {/* Live counter strip */}
              <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-8 mt-8 mb-6">
                {[
                  { value: 21000000, suffix: "+", label: "Empresas no Brasil" },
                  { value: 13800, suffix: "+", label: "Cartórios" },
                  { value: 520000, suffix: "+", label: "Contadores" },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      <AnimatedCounter value={s.value} prefix="" suffix={s.suffix || ""} duration={2.5} />
                    </div>
                    <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider font-semibold">{s.label}</p>
                  </div>
                ))}
              </motion.div>

              <motion.p variants={fadeIn} className="text-sm text-slate-600 tracking-[0.3em] uppercase font-medium">
                Powered by AtentAI · G8 Prospect · Clauthor
              </motion.p>
              <motion.div variants={fadeIn} className="mt-14 flex justify-center gap-4">
                <GlassButton variant="primary">
                  <Rocket className="w-4 h-4" /> Ver Proposta Completa
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

        {/* ═══════ QUEM É O SERAC ═══════ */}
        <ParallaxSection className="bg-slate-900/30 border-t border-white/[0.03]" speed={0.4}>
          <motion.div variants={fadeUp} className="text-center mb-6">
            <Badge>O SERAC</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">
              Referência <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">nacional em contabilidade</span>
            </h2>
          </motion.div>

          <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-6 my-12">
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_0_40px_hsl(185_80%_50%/0.1)] group">
              <img src={seracBuilding} alt="Sede SERAC" className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-white font-bold text-sm">Sede SERAC</p>
                <p className="text-slate-400 text-xs">São Paulo, SP</p>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_0_40px_hsl(185_80%_50%/0.1)] group">
              <img src={seracOffice} alt="Escritório SERAC" className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-white font-bold text-sm">Operação SERAC</p>
                <p className="text-slate-400 text-xs">+300 profissionais</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="mb-12">
            <GlassCard glow className="p-10 text-center">
              <p className="text-xl text-slate-300 leading-relaxed">
                O SERAC é um escritório de contabilidade de <span className="text-cyan-400 font-bold">referência nacional</span>, com uma equipe robusta de mais de <span className="text-white font-bold">300 colaboradores</span>, atendendo a mais de <span className="text-white font-bold">3.500 clientes</span>. Sua atuação abrange as áreas <span className="text-emerald-400 font-bold">contábil, fiscal, jurídica e de tecnologia</span>.
              </p>
            </GlassCard>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-14">
            {["Contábil", "Fiscal", "Consultiva", "Jurídica", "Tecnologia"].map((area, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl py-5 px-6 text-center hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300 cursor-pointer">
                  <span className="text-slate-300 font-bold text-lg">{area}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid sm:grid-cols-4 gap-5">
            {[
              { icon: Users, t: "300+", d: "Colaboradores" },
              { icon: Building2, t: "3.500+", d: "Clientes ativos" },
              { icon: Shield, t: "Compliance", d: "Metodologia preventiva" },
              { icon: Target, t: "Nacional", d: "Atuação em todo o Brasil" },
            ].map((d, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <GlassCard className="p-7 text-center h-full">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                    <d.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-1">{d.t}</h3>
                  <p className="text-slate-500 text-sm">{d.d}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </ParallaxSection>

        {/* ═══════ ECOSSISTEMA DE 3 STARTUPS ═══════ */}
        <ParallaxSection className="bg-slate-950 border-t border-white/[0.03]" speed={0.2}>
          <FloatingParticles count={15} />
          <motion.div variants={fadeUp} className="text-center mb-16">
            <Badge>Ecossistema</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">
              3 Startups. <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">1 Departamento de Prospecção.</span>
            </h2>
            <p className="text-slate-500 text-lg mt-4 max-w-3xl mx-auto">A integração das três startups cria uma solução robusta e inovadora para aquisição de clientes qualificados</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <StartupCard
              name="AtentAI"
              description="Plataforma de Inteligência Fiscal e máquina de prospecção white label. Fornece o marketplace e a plataforma tecnológica que canaliza empresas, contadores e cartórios para a base do SERAC. O SERAC terá exclusividade total no marketplace."
              icon={Brain}
              tags={["Plataforma", "Marketplace", "Exclusividade"]}
              gradient="bg-cyan-500"
            />
            <StartupCard
              name="G8 Prospect"
              description="Ecossistema de inovação que reúne 8 startups disruptivas. Oferece acesso a uma vasta base de leads qualificados — C-Levels, diretores e decisores estratégicos. Atua como hub que potencializa a sinergia entre as tecnologias."
              icon={Target}
              tags={["Leads B2B", "C-Levels", "8 Startups"]}
              gradient="bg-violet-500"
            />
            <StartupCard
              name="Clauthor"
              description="Plataforma de 'AI Employees' — agentes de IA que automatizam prospecção, atendimento, gestão financeira e compliance. Trabalham 24/7, sem interrupções, com economia significativa de custos operacionais. Orquestrados em squads coordenados."
              icon={Bot}
              tags={["AI Employees", "24/7", "Squads IA"]}
              gradient="bg-emerald-500"
            />
          </div>

          <motion.div variants={fadeUp} className="mt-10">
            <GlassCard accent glow className="p-8 text-center">
              <p className="text-xl text-slate-300 leading-relaxed">
                Cada startup desempenha um papel crucial: <span className="text-cyan-400 font-bold">AtentAI</span> fornece plataforma e marketplace · <span className="text-violet-400 font-bold">G8 Prospect</span> oferece ecossistema e leads · <span className="text-emerald-400 font-bold">Clauthor</span> provê agentes de IA que escalam a prospecção
              </p>
            </GlassCard>
          </motion.div>
        </ParallaxSection>

        {/* ═══════ PROPOSTA COMERCIAL ═══════ */}
        <ParallaxSection className="bg-slate-900/30 border-t border-white/[0.03]" speed={0.3}>
          <FloatingParticles count={20} />
          <motion.div variants={fadeUp} className="text-center mb-16">
            <Badge>Proposta Comercial</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">
              Departamento de <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Agentes de Prospecção</span>
            </h2>
            <p className="text-slate-500 text-lg mt-4 max-w-3xl mx-auto">
              Implementação e operação de um departamento dedicado de agentes de IA para prospecção exclusiva do SERAC
            </p>
          </motion.div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <motion.div variants={slideLeft}>
              <GlassCard className="p-10 h-full relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/5 rounded-full blur-[80px]" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6">
                    <DollarSign className="w-7 h-7 text-cyan-400" />
                  </div>
                  <p className="text-slate-500 text-xs font-bold tracking-[0.2em] uppercase mb-3">Investimento Inicial (Setup)</p>
                  <h3 className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">R$ 45.000</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Valor único — cobre a customização e integração profunda dos agentes de IA da <span className="text-emerald-400 font-bold">Clauthor</span> com a plataforma <span className="text-cyan-400 font-bold">AtentAI</span>, adaptando-os às necessidades específicas do SERAC.
                  </p>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div variants={slideRight}>
              <GlassCard accent glow className="p-10 h-full relative overflow-hidden">
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-[80px]" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                    <TrendingUp className="w-7 h-7 text-emerald-400" />
                  </div>
                  <p className="text-slate-500 text-xs font-bold tracking-[0.2em] uppercase mb-3">Mensalidade</p>
                  <h3 className="text-5xl font-black text-emerald-400 mb-4">R$ 35.000<span className="text-2xl text-slate-500">/mês</span></h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Operação contínua da máquina de prospecção — manutenção dos agentes de IA, gestão das campanhas e <span className="text-white font-bold">prospecção qualificada através dos 3 canais</span>.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Key terms */}
          <div className="grid sm:grid-cols-3 gap-5 mb-10">
            <motion.div variants={fadeUp} whileHover={{ y: -5 }}>
              <GlassCard className="p-6 text-center h-full">
                <Shield className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <h4 className="text-white font-bold mb-2">Exclusividade Total</h4>
                <p className="text-slate-500 text-xs">O SERAC será o único parceiro ofertante no marketplace AtentAI. Todos os leads são direcionados exclusivamente para o SERAC.</p>
              </GlassCard>
            </motion.div>
            <motion.div variants={fadeUp} whileHover={{ y: -5 }}>
              <GlassCard className="p-6 text-center h-full">
                <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <h4 className="text-white font-bold mb-2">Comissionamento</h4>
                <p className="text-slate-500 text-xs">Comissão sobre os serviços prestados pelo SERAC a clientes prospectados, alinhando interesses em um modelo de crescimento mútuo.</p>
              </GlassCard>
            </motion.div>
            <motion.div variants={fadeUp} whileHover={{ y: -5 }}>
              <GlassCard className="p-6 text-center h-full">
                <Bot className="w-8 h-8 text-violet-400 mx-auto mb-3" />
                <h4 className="text-white font-bold mb-2">Agentes IA 24/7</h4>
                <p className="text-slate-500 text-xs">AI Employees da Clauthor trabalhando sem interrupções, com prospecção automatizada, inteligente e escalável.</p>
              </GlassCard>
            </motion.div>
          </div>

          {/* 3 Canais de Prospecção */}
          <motion.div variants={fadeUp}>
            <GlassCard glow className="p-10">
              <p className="text-slate-600 text-xs font-bold tracking-[0.2em] uppercase mb-8 text-center">3 Canais de Prospecção para o SERAC</p>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { icon: Users, label: "Canal 1 — Contadores", desc: "Prospecção de contadores para eventos, mentorias e programas de capacitação do SERAC", color: "cyan" },
                  { icon: Building2, label: "Canal 2 — Empresas", desc: "Prospecção de empresas para a contabilidade exclusiva do SERAC via marketplace AtentAI", color: "emerald" },
                  { icon: Scale, label: "Canal 3 — Cartórios", desc: "Prospecção de cartórios para serviços especializados, direcionados ao time comercial do SERAC", color: "violet" },
                ].map((item, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.05 }} className="text-center p-6 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <item.icon className={`w-10 h-10 text-${item.color}-400 mx-auto mb-3`} />
                    <p className="text-white font-bold text-sm mb-2">{item.label}</p>
                    <p className="text-slate-500 text-xs">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <p className="text-lg text-slate-300 leading-relaxed">
                  Todos os leads gerados são direcionados <span className="text-cyan-400 font-bold">exclusivamente</span> para o SERAC — sem concorrência no marketplace
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </ParallaxSection>

        {/* ═══════ COMO FUNCIONA — 3 CANAIS ═══════ */}
        <ParallaxSection className="bg-slate-950 border-t border-white/[0.03]" speed={0.3}>
          <FloatingParticles count={20} />
          <motion.div variants={fadeUp} className="text-center mb-16">
            <Badge>Como Funciona</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">
              3 Canais de Prospecção. <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">1 Destino: SERAC.</span>
            </h2>
            <p className="text-slate-500 text-lg mt-4 max-w-3xl mx-auto">
              O ecossistema de 3 startups funciona como uma <strong className="text-slate-300">extensão do time comercial do SERAC</strong> — prospectando empresas, contadores e cartórios com IA e direcionando tudo exclusivamente para o SERAC.
            </p>
          </motion.div>

          {/* Flow visual */}
          <motion.div variants={fadeUp} className="mb-14">
            <GlassCard glow className="p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-500/5 rounded-full blur-[100px]" />
              <div className="relative z-10">
                <p className="text-slate-600 text-xs font-bold tracking-[0.2em] uppercase mb-10 text-center">Escopo da Prospecção</p>
                <div className="grid md:grid-cols-3 gap-8 items-center">
                  <motion.div variants={slideLeft} className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-5">
                      <Target className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">Prospecção com IA</h3>
                    <p className="text-slate-500 text-sm">AtentAI + G8 Prospect + Clauthor prospectam <strong className="text-cyan-400">empresas, contadores e cartórios</strong> com abordagem multicanal e inteligente</p>
                  </motion.div>
                  <motion.div variants={scaleIn} className="hidden md:flex justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-px bg-gradient-to-r from-cyan-500/50 to-violet-500/50" />
                      <ArrowRight className="w-6 h-6 text-cyan-400" />
                      <div className="w-24 h-px bg-gradient-to-r from-violet-500/50 to-emerald-500/50" />
                    </div>
                  </motion.div>
                  <motion.div variants={slideRight} className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                      <Building2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">SERAC Atende</h3>
                    <p className="text-slate-500 text-sm">+300 profissionais fazem a <strong className="text-emerald-400">contabilidade exclusiva</strong>. Contadores e cartórios entram no <strong className="text-emerald-400">clube de mentorias</strong></p>
                  </motion.div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* O que o SERAC recebe */}
          <motion.div variants={fadeUp} className="mb-10">
            <p className="text-slate-600 text-xs font-bold tracking-[0.2em] uppercase mb-6 text-center">O que cada parte entrega</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div variants={fadeUp} whileHover={{ y: -5 }}>
              <GlassCard accent className="p-8 h-full">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">
                  <Brain className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AtentAI entrega</h3>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-white">Setup R$ 45k</strong> pela implantação</span></li>
                  <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-white">R$ 35k/mês</strong> pela operação contínua</span></li>
                  <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-white">Comissão sobre contratos</strong> fechados via prospecção</span></li>
                </ul>
              </GlassCard>
            </motion.div>
            <motion.div variants={fadeUp} whileHover={{ y: -5 }}>
              <GlassCard accent className="p-8 h-full">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                  <Building2 className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">SERAC recebe</h3>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-white">Exclusividade total</strong> no marketplace AtentAI</span></li>
                  <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-white">Plataforma White Label</strong> com o logo e marca do SERAC</span></li>
                  <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-white">3 canais de prospecção</strong> alimentando o time comercial</span></li>
                  <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-white">Agentes de IA</strong> como time comercial dedicado 24/7</span></li>
                  <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-white">Clube de mentorias</strong> com contadores e cartórios</span></li>
                </ul>
              </GlassCard>
            </motion.div>
            <motion.div variants={fadeUp} whileHover={{ y: -5 }}>
              <GlassCard accent className="p-8 h-full">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5">
                  <Users className="w-7 h-7 text-violet-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Clientes recebem</h3>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-white">Contabilidade de excelência</strong> — SERAC com +300 profissionais</span></li>
                  <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-white">Economia tributária</strong> com diagnóstico por IA</span></li>
                  <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-white">Preparação para 2026</strong> — IBS + CBS</span></li>
                </ul>
              </GlassCard>
            </motion.div>
          </div>
        </ParallaxSection>

        {/* ═══════ JUSTIFICATIVA FINANCEIRA ═══════ */}
        <ParallaxSection className="bg-slate-900/50 border-t border-white/[0.03]" speed={0.25}>
          <FloatingParticles count={15} />
          <motion.div variants={fadeUp} className="text-center mb-16">
            <Badge>Análise de Valor</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">
              Por que este investimento <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">vale a pena</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div variants={slideLeft}>
              <GlassCard className="p-8 h-full">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-cyan-400" /> Comparativo de Mercado
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Mercado (White Label)</p>
                    <p className="text-slate-400 text-sm">Setup: <span className="text-white font-bold">R$ 120k – R$ 180k</span></p>
                    <p className="text-slate-400 text-sm">Mensalidade: <span className="text-white font-bold">R$ 25k – R$ 60k</span></p>
                  </div>
                  <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                    <p className="text-cyan-400 text-xs uppercase tracking-wider mb-1 font-bold">Nossa Proposta</p>
                    <p className="text-slate-300 text-sm">Setup: <span className="text-cyan-400 font-bold">R$ 45.000</span> (75% abaixo do teto)</p>
                    <p className="text-slate-300 text-sm">Mensalidade: <span className="text-cyan-400 font-bold">R$ 35.000</span> (dentro da faixa)</p>
                  </div>
                </div>
                <p className="text-slate-500 text-xs mt-4 leading-relaxed">
                  Custo-benefício superior: exclusividade + plataforma White Label + integração de 3 startups + agentes de IA 24/7
                </p>
              </GlassCard>
            </motion.div>

            <motion.div variants={slideRight}>
              <GlassCard className="p-8 h-full">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-emerald-400" /> ROI Projetado
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-white/[0.06]">
                    <span className="text-slate-400 text-sm">Novos contratos/mês</span>
                    <span className="text-white font-bold">36</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/[0.06]">
                    <span className="text-slate-400 text-sm">Ticket médio</span>
                    <span className="text-white font-bold">R$ 2.500</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/[0.06]">
                    <span className="text-slate-400 text-sm">Receita adicional/mês</span>
                    <span className="text-emerald-400 font-bold">R$ 90.000</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-slate-400 text-sm">Investimento mensal</span>
                    <span className="text-cyan-400 font-bold">R$ 35.000</span>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">ROI líquido mensal</p>
                    <p className="text-3xl font-black text-emerald-400">R$ 55.000+</p>
                    <p className="text-emerald-400/60 text-xs mt-1">2.5x de retorno sobre investimento</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          <motion.div variants={fadeUp}>
            <GlassCard accent glow className="p-8 text-center">
              <p className="text-xl text-slate-300 leading-relaxed">
                O SERAC não está pagando por prospecção. Está pagando por uma <span className="text-cyan-400 font-bold">máquina de aquisição de clientes exclusiva e otimizada por IA</span> que seria <span className="text-white font-bold">muito mais cara e complexa de construir internamente</span>.
              </p>
            </GlassCard>
          </motion.div>
        </ParallaxSection>

        {/* ═══════ PORTFÓLIO DE SERVIÇOS ═══════ */}
        <ParallaxSection className="bg-slate-950 border-t border-white/[0.03]" speed={0.3}>
          <FloatingParticles count={15} />
          <motion.div variants={fadeUp} className="text-center mb-16">
            <Badge>Portfólio Completo</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">
              Serviços que a SERAC <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">já domina</span>
            </h2>
            <p className="text-slate-500 text-lg mt-4 max-w-3xl mx-auto">
              Nossa prospecção vai além dos serviços listados no AtentAI — o objetivo é trazer clientes para o SERAC para todos os serviços contábeis
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {[
              { icon: Building2, name: "Contabilidade para Empresas", desc: "Orientação, planejamento tributário e compliance completo para empresas de todos os portes", tags: ["MEI", "ME", "EPP", "Lucro Real"] },
              { icon: Scale, name: "Serviços para Cartórios", desc: "Contabilidade especializada para serventias extrajudiciais — nicho com 13.800+ unidades", tags: ["Cartórios", "Nicho", "R$ 28B"] },
              { icon: Cpu, name: "Contabilidade para Infoprodutores", desc: "Gestão fiscal sob medida para criadores de conteúdo, cursos online e produtos digitais", tags: ["Digital", "PLR", "E-commerce"] },
              { icon: Code2, name: "Contabilidade para Games", desc: "Especializada para estúdios de games e empresas de entretenimento digital", tags: ["Games", "Tech", "Startups"] },
              { icon: FileText, name: "Imposto de Renda", desc: "Declaração de IR Simples e Completo com otimização fiscal para PF e PJ", tags: ["IRPF", "IRPJ", "Restituição"] },
              { icon: Shield, name: "Marcas e Patentes", desc: "Registro junto ao INPI com acompanhamento completo", tags: ["INPI", "Marca", "Patente"] },
              { icon: Globe, name: "Certificado Digital", desc: "Emissão de certificados e-CPF, e-CNPJ, NF-e para empresas e profissionais", tags: ["e-CPF", "e-CNPJ", "NF-e"] },
              { icon: Lightbulb, name: "Consultoria Empresarial", desc: "Consultoria estratégica, planejamento financeiro e reestruturação", tags: ["Estratégia", "Gestão", "Crescimento"] },
            ].map((service, i) => (
              <motion.div key={i} variants={scaleIn} whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                <GlassCard className="p-6 h-full relative overflow-hidden group cursor-pointer">
                  <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-cyan-500/5 blur-[60px] group-hover:bg-cyan-500/10 transition-all duration-700" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                      <service.icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-white font-bold text-base mb-2">{service.name}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed mb-4">{service.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {service.tags.map((tag, j) => (
                        <span key={j} className="text-[9px] font-bold uppercase tracking-wider text-cyan-400/70 bg-cyan-500/5 border border-cyan-500/10 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </ParallaxSection>

        {/* ═══════ MÁQUINA DE PROSPECÇÃO (FUNIL) ═══════ */}
        <ParallaxSection className="bg-slate-900/50 border-t border-white/[0.03]" speed={0.25}>
          <FloatingParticles count={20} />
          <motion.div variants={fadeUp} className="text-center mb-16">
            <Badge>Funil de Prospecção</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">3 Canais de Prospecção</span> gerando contratos
            </h2>
          </motion.div>

          {/* Cartórios highlight */}
          <motion.div variants={fadeUp} className="mb-12">
            <GlassCard glow className="p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-60 h-60 bg-violet-500/5 rounded-full blur-[80px]" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Mercado de Cartórios no Brasil</h3>
                    <p className="text-slate-500 text-xs">Oportunidade massiva e nichada</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { value: 13800, suffix: "+", label: "Cartórios no Brasil", detail: "Serventias extrajudiciais ativas" },
                    { value: 28, prefix: "R$ ", suffix: "B", label: "Faturamento anual", detail: "Emolumentos + custas" },
                    { value: 1000, label: "Prospectados/mês", detail: "Nossa meta de prospecção" },
                    { value: 73, suffix: "%", label: "Pagam impostos a mais", detail: "Oportunidade de economia" },
                  ].map((item, i) => (
                    <motion.div key={i} whileHover={{ scale: 1.05 }} className="text-center p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="text-2xl font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                        <AnimatedCounter value={item.value} prefix={item.prefix || ""} suffix={item.suffix || ""} duration={2} />
                      </div>
                      <p className="text-slate-300 text-sm font-semibold">{item.label}</p>
                      <p className="text-slate-600 text-[10px] mt-0.5">{item.detail}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Funnel */}
          <motion.div variants={fadeUp} className="mb-12">
            <GlassCard className="p-10">
              <p className="text-slate-600 text-xs font-bold tracking-[0.2em] uppercase mb-10">Prospecção estruturada por 3 canais de IA</p>
              <div className="space-y-5">
                <FunnelStep value="3 Canais" label="Empresas + Contadores + Cartórios prospectados via IA 24/7" width="w-full" index={0} />
                <FunnelStep value="10%" label="Taxa média de resposta → 500 respostas" width="w-[85%]" index={1} />
                <FunnelStep value="30%" label="Conversão para reunião → 150 reuniões" width="w-[65%]" index={2} />
                <FunnelStep value="20%" label="Taxa de fechamento → 30 novos contratos" width="w-[45%]" index={3} />
              </div>
            </GlassCard>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-5">
            <GlowingStat value={3} label="Canais de Prospecção" sub="Empresas + Contadores + Cartórios" />
            <GlowingStat value={300} label="Profissionais SERAC" sub="Time pronto para atender a demanda" />
            <GlowingStat value={3500} label="Clientes Atuais" sub="Base sólida para crescimento exponencial" />
          </div>
        </ParallaxSection>

        {/* ═══════ DEFESA ESTRATÉGICA — CEO ═══════ */}
        <ParallaxSection className="bg-slate-950 border-t border-white/[0.03]" speed={0.35}>
          <FloatingParticles count={15} />
          <motion.div variants={fadeUp} className="text-center mb-5">
            <Badge>Perspectiva do CEO</Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-black text-white text-center mb-14">
            Defesa <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Estratégica</span>
          </motion.h2>

          <motion.div variants={fadeUp} className="max-w-4xl mx-auto">
            <GlassCard glow className="p-10 md:p-14 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-500/5 rounded-full blur-[100px]" />
              <div className="relative z-10 space-y-6 text-slate-300 leading-relaxed">
                <p className="text-slate-500 text-xs font-bold tracking-[0.3em] uppercase">Carta do CEO</p>
                <p className="text-lg">
                  Prezados SERAC,
                </p>
                <p>
                  Esta proposta não é um <span className="text-slate-500">custo operacional</span>. É um <span className="text-cyan-400 font-bold">investimento em uma máquina de crescimento</span> que posicionará o SERAC na vanguarda do mercado.
                </p>
                <p>
                  <span className="text-white font-bold">"Por que pagar por prospecção se já temos a AtentAI?"</span> — Estamos oferecendo a <span className="text-emerald-400 font-bold">exclusividade total</span> do SERAC no marketplace da AtentAI. Todos os leads qualificados serão direcionados <span className="text-white font-bold">exclusivamente</span> para vocês. Isso transforma a AtentAI em uma extensão do seu próprio departamento de vendas.
                </p>
                <p>
                  O setup de <span className="text-cyan-400 font-bold">R$ 45.000</span> é a engenharia por trás da máquina — está <span className="text-white font-bold">abaixo da média de mercado</span> para implementações de plataformas white label de prospecção.
                </p>
                <p>
                  O modelo de <span className="text-violet-400 font-bold">comissionamento</span> é a prova da nossa confiança: <span className="text-white font-bold">nós só ganhamos mais se vocês ganharem mais</span>. É um modelo de parceria de crescimento, onde o risco é compartilhado e o sucesso é mútuo.
                </p>
                <p className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Essa é a oportunidade de dominar o mercado de contabilidade — posicionando o SERAC como a plataforma nacional de referência para a Reforma Tributária de 2026.
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </ParallaxSection>

        {/* ═══════ PLATAFORMA & AGENTES ═══════ */}
        <ParallaxSection className="bg-slate-900/50 border-t border-white/[0.03]" speed={0.25}>
          <motion.div variants={fadeUp} className="text-center mb-8">
            <Badge>Tecnologia</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">
              SERAC Intelligence <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Platform</span>
            </h2>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4 mb-8">
            <motion.div whileHover={{ scale: 1.05 }}>
              <GlassCard className="px-4 py-3">
                <div className="text-cyan-400 font-black text-lg">
                  <AnimatedCounter value={520000} suffix="+" duration={2} />
                </div>
                <p className="text-slate-500 text-[10px]">Contadores no Brasil</p>
              </GlassCard>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <GlassCard className="px-4 py-3">
                <div className="text-violet-400 font-black text-lg">
                  <AnimatedCounter value={3} duration={1} />
                </div>
                <p className="text-slate-500 text-[10px]">Canais de Prospecção IA</p>
              </GlassCard>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <GlassCard className="px-4 py-3">
                <div className="text-emerald-400 font-black text-lg">
                  <AnimatedCounter value={300} suffix="+" duration={1.5} />
                </div>
                <p className="text-slate-500 text-[10px]">Profissionais SERAC</p>
              </GlassCard>
            </motion.div>
          </motion.div>

          <motion.p variants={fadeUp} className="text-slate-500 text-lg mb-12 max-w-2xl mx-auto text-center">
            Plataforma <span className="text-cyan-400 font-bold">White Label</span> exclusiva — com a marca e o logo do SERAC, como se fosse um software próprio
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
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -5, scale: 1.02 }}>
                <GlassCard className="p-6 flex items-center gap-4 h-full">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <span className="text-slate-300 font-semibold">{f.t}</span>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>

          <motion.p variants={fadeIn} className="text-slate-600 text-sm tracking-[0.3em] uppercase text-center mt-10 font-medium">Powered by AtentAI</motion.p>
        </ParallaxSection>

        {/* ═══════ AGENTES IA ═══════ */}
        <ParallaxSection className="bg-slate-950 border-t border-white/[0.03]" speed={0.35}>
          <FloatingParticles count={15} />
          <motion.div variants={fadeUp} className="text-center mb-5">
            <Badge>Agentes de IA</Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-black text-white text-center mb-3">
            Não é Software.
          </motion.h2>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-black text-center mb-14">
            É <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Infraestrutura de Crescimento.</span>
          </motion.h2>

          {/* Agents Orchestration */}
          <motion.div variants={fadeUp} className="mb-14">
            <SeracAgentsOrchestration />
          </motion.div>

          {/* Agent Simulation */}
          <motion.div variants={fadeUp}>
            <SeracAgentSimulation />
          </motion.div>
        </ParallaxSection>

        {/* ═══════ PROJEÇÃO 12 MESES ═══════ */}
        <ParallaxSection className="bg-slate-900/50 border-t border-white/[0.03]" speed={0.3}>
          <FloatingParticles count={15} />
          <motion.div variants={fadeUp} className="text-center mb-8">
            <Badge>Projeção</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">Projeção de 12 Meses</h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-5 mb-8">
            {[
              { value: 30, label: "Novos contratos/mês" },
              { value: 360, label: "Total de contratos/ano" },
              { value: 2500, label: "Ticket médio (R$)" },
            ].map((s, i) => (
              <motion.div key={i} variants={scaleIn} whileHover={{ scale: 1.05 }}>
                <GlassCard className="p-6 text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    <AnimatedCounter value={s.value} duration={1.5} />
                  </div>
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
            <GlassCard accent glow className="inline-block px-12 py-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/10 to-cyan-500/5" />
              <div className="relative z-10">
                <p className="text-sm text-slate-500 tracking-[0.3em] uppercase font-bold mb-3">Receita potencial anual (SERAC)</p>
                <p className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent" style={{ textShadow: "0 0 40px hsl(185 80% 50% / 0.2)" }}>
                  R$ <AnimatedCounter value={900000} duration={3} />
                </p>
                <p className="text-slate-500 text-xs mt-2">30 contratos/mês × R$ 2.500 × 12 meses</p>
              </div>
            </GlassCard>
          </motion.div>
        </ParallaxSection>

        {/* ═══════ FAQ ═══════ */}
        <ParallaxSection className="bg-slate-950 border-t border-white/[0.03]" speed={0.2}>
          <FloatingParticles count={10} />
          <motion.div variants={fadeUp} className="text-center mb-16">
            <Badge>FAQ</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">
              Perguntas <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Frequentes</span>
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-4">
            <FAQItem
              index={1}
              question="Por que o valor da proposta é de R$ 35.000 mensais e um setup de R$ 45.000?"
              answer="O valor reflete a exclusividade total que o SERAC terá no marketplace da AtentAI, garantindo que todos os leads sejam direcionados apenas para vocês. O setup cobre a customização e integração profunda dos agentes de IA da Clauthor, otimizando a prospecção para os segmentos específicos. Este investimento é crucial para construir uma máquina de crescimento dedicada e eficiente — e está abaixo da média de mercado (R$ 120k-180k de setup)."
            />
            <FAQItem
              index={2}
              question="Qual a garantia de que os leads serão de qualidade?"
              answer="Nossa metodologia utiliza agentes de IA da Clauthor, treinados para identificar e qualificar leads com alta precisão. A prospecção é segmentada para empresas, contadores e cartórios, garantindo relevância. Nosso modelo de comissionamento também nos incentiva a entregar leads de alta qualidade — nosso sucesso está diretamente ligado ao seu."
            />
            <FAQItem
              index={3}
              question="Como a exclusividade no marketplace do AtentAI funciona na prática?"
              answer="Para os leads que geramos buscando serviços contábeis, o SERAC será o único parceiro ofertante. Isso elimina a concorrência e posiciona o SERAC como a solução preferencial, maximizando as chances de conversão. A AtentAI se torna uma extensão do departamento de vendas do SERAC."
            />
            <FAQItem
              index={4}
              question="Vocês prospectarão mesmo que os serviços do SERAC não estejam no AtentAI?"
              answer="Sim. Nossa prospecção vai além dos serviços listados no AtentAI. O objetivo é trazer clientes para o SERAC, independentemente de seus serviços estarem ou não formalmente listados no marketplace. A ideia é que o SERAC seja o parceiro exclusivo para todos os serviços contábeis."
            />
            <FAQItem
              index={5}
              question="Como vocês garantem que o investimento valerá a pena?"
              answer="A projeção é de 30 novos contratos/mês com ticket médio de R$ 2.500, gerando R$ 75.000+ em receita adicional mensal — contra um investimento de R$ 35.000. O setup é um investimento único na infraestrutura, e a mensalidade garante a operação contínua de uma máquina de aquisição que seria muito mais cara de construir internamente."
            />
            <FAQItem
              index={6}
              question="Qual o papel de cada startup nessa proposta?"
              answer="Cada startup é crucial: AtentAI fornece a plataforma e o marketplace; G8 Prospect oferece o ecossistema de inovação e acesso a uma vasta base de leads qualificados (C-Levels, diretores, decisores); e Clauthor provê os agentes de IA que otimizam e escalam a prospecção 24/7. Juntas, formam uma solução completa."
            />
            <FAQItem
              index={7}
              question='"Vamos pagar para trazer leads para nossa própria plataforma e ainda vamos ganhar?"'
              answer="Sim, e com grande vantagem. Vocês não estão pagando apenas para trazer leads. Estão pagando para ter uma máquina de aquisição de clientes exclusiva e otimizada por IA, que garante que o SERAC seja o único beneficiário desses leads. É um atalho para o crescimento, eliminando a necessidade de construir um departamento de prospecção interno com a mesma escala."
            />
          </div>
        </ParallaxSection>

        {/* ═══════ POSICIONAMENTO FINAL ═══════ */}
        <ParallaxSection className="bg-slate-900/50 border-t border-white/[0.03]" speed={0.4}>
          <motion.div variants={fadeUp} className="text-center mb-5">
            <Badge>Posicionamento</Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-black text-white text-center mb-14">
            SERAC como <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Plataforma Nacional</span><br />da Reforma 2026
          </motion.h2>

          <motion.div variants={fadeUp} className="max-w-3xl mx-auto text-center space-y-8">
            <p className="text-2xl text-slate-300 leading-relaxed">
              O SERAC não está adquirindo tecnologia.<br />
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
        <ParallaxSection className="bg-slate-950 border-t border-white/[0.03]" speed={0.2}>
          <FloatingParticles count={25} />
          <motion.div variants={fadeUp} className="text-center mb-14">
            <Badge>Próximo Passo</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">Próximo Passo</h2>
          </motion.div>

          <div className="max-w-2xl mx-auto space-y-4 mb-16">
            {[
              { step: "01", t: "Aprovação do modelo de operação" },
              { step: "02", t: "Pagamento do setup (R$ 45.000)" },
              { step: "03", t: "Customização dos agentes de IA" },
              { step: "04", t: "Go-live e início da prospecção" },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ x: 10 }}>
                <GlassCard className="p-6 flex items-center gap-5 cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-black text-sm">{s.step}</span>
                  </div>
                  <span className="text-white font-bold flex-1">{s.t}</span>
                  <ArrowRight className="w-5 h-5 text-cyan-500/40" />
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <motion.div variants={scaleIn} className="text-center">
            <GlassButton variant="primary" className="text-lg px-10 py-5">
              <Rocket className="w-5 h-5" /> Agendar Reunião Estratégica <ArrowRight className="w-5 h-5" />
            </GlassButton>
          </motion.div>
        </ParallaxSection>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-white/[0.04] text-center">
          <p className="text-slate-600 text-sm">
            SERAC Intelligence Platform — <span className="text-slate-500">Powered by AtentAI · G8 Prospect · Clauthor</span>
          </p>
        </footer>
      </div>
    </>
  );
}
