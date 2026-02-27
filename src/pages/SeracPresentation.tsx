import { Helmet } from "react-helmet-async";
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from "framer-motion";
import { SeracAgentsOrchestration } from "@/components/serac/SeracAgentsOrchestration";
import { SeracAgentSimulation } from "@/components/serac/SeracAgentSimulation";
import { useRef, useEffect, useState } from "react";
import {
  Shield, BarChart3, Users, Brain,
  ArrowRight, ChevronDown,
  TrendingUp, Target, Zap, Building2, Scale,
  DollarSign, Calendar, Layers, Sparkles,
  Rocket, Globe, Code2, Cpu, Eye,
  LineChart, Bot, Lightbulb
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
        <title>SERAC Intelligence Platform | White Label powered by Atentai</title>
        <meta name="description" content="Apresentação institucional: SERAC Intelligence Platform — White Label estratégico powered by Atentai com Máquina de Prospecção Nacional de Contadores" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden font-sans">

        {/* ═══════ HERO with Parallax + Image ═══════ */}
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
          {/* Hero background image with parallax */}
          <motion.div style={{ scale: heroImgScale }} className="absolute inset-0">
            <img src={seracHeroBg} alt="" className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/40 to-slate-950" />
          </motion.div>
          {/* Animated grid */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(hsl(185 60% 50% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(185 60% 50% / 0.3) 1px, transparent 0)", backgroundSize: "60px 60px" }} />
          {/* Floating particles */}
          <FloatingParticles count={40} />
          {/* Glow orbs parallax */}
          <motion.div style={{ y: heroY }} className="absolute inset-0">
            <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-cyan-500/8 blur-[150px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/8 blur-[120px]" />
            <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[100px]" />
          </motion.div>

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
              
              {/* Live counter strip */}
              <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-8 mt-8 mb-6">
                {[
                  { value: 13800, suffix: "+", label: "Cartórios" },
                  { value: 520000, suffix: "+", label: "Contadores" },
                  { value: 4320000, prefix: "R$ ", label: "Receita/ano" },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      <AnimatedCounter value={s.value} prefix={s.prefix || ""} suffix={s.suffix || ""} duration={2.5} />
                    </div>
                    <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider font-semibold">{s.label}</p>
                  </div>
                ))}
              </motion.div>

              <motion.p variants={fadeIn} className="text-sm text-slate-600 tracking-[0.3em] uppercase font-medium">
                Powered by Atentai
              </motion.p>
              <motion.div variants={fadeIn} className="mt-14 flex justify-center gap-4">
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
          <FloatingParticles count={15} />
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
              description="Startup de tecnologia fiscal e inteligência artificial. Foco principal: prospecção ativa de empresas e contadores para a base SERAC. Motor de IA com análise preditiva, automação tributária e inteligência fiscal que alimenta toda a plataforma."
              icon={Brain}
              tags={["Tecnologia Fiscal", "Prospecção", "IA"]}
              gradient="bg-cyan-500"
            />
            <StartupCard
              name="G8 Prospect"
              description="Startup especializada em prospecção e geração de leads qualificados B2B. Máquina de aquisição de clientes com pipeline de vendas automatizado, responsável por trazer empresas e contadores para o ecossistema SERAC."
              icon={Target}
              tags={["Prospecção", "Leads B2B", "Growth"]}
              gradient="bg-violet-500"
            />
            <StartupCard
              name="Clauthor"
              description="Startup de agentes de inteligência artificial especializados por área. Desenvolve e opera agentes de IA para compliance, fiscal, jurídico, atendimento e automação de processos — cada área com seu agente dedicado."
              icon={Bot}
              tags={["Agentes IA", "Multi-área", "Automação"]}
              gradient="bg-emerald-500"
            />
          </div>
        </ParallaxSection>

        {/* ═══════ PARCERIA EXCLUSIVA — COMO FUNCIONA ═══════ */}
        <ParallaxSection className="bg-slate-900/30 border-t border-white/[0.03]" speed={0.3}>
          <FloatingParticles count={20} />
          <motion.div variants={fadeUp} className="text-center mb-16">
            <Badge>Parceria Exclusiva</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">
              AtentAI Prospecta. <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">SERAC Atende.</span>
            </h2>
            <p className="text-slate-500 text-lg mt-4 max-w-3xl mx-auto">
              A AtentAI é a máquina de prospecção que traz <strong className="text-slate-300">empresas e contadores</strong> para a base da SERAC. 
              A SERAC, com seus <strong className="text-slate-300">+250 colaboradores e +2.500 clientes</strong>, faz o que faz de melhor: contabilidade de excelência.
            </p>
          </motion.div>

          {/* Flow visual */}
          <motion.div variants={fadeUp} className="mb-14">
            <GlassCard glow className="p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-500/5 rounded-full blur-[100px]" />
              <div className="relative z-10">
                <p className="text-slate-600 text-xs font-bold tracking-[0.2em] uppercase mb-10 text-center">Como funciona a parceria</p>
                <div className="grid md:grid-cols-3 gap-8 items-center">
                  {/* Step 1 */}
                  <motion.div variants={slideLeft} className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-5">
                      <Target className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">AtentAI Prospecta</h3>
                    <p className="text-slate-500 text-sm">Prospecção ativa de <strong className="text-cyan-400">empresas, contadores e cartórios</strong> em todo o Brasil com IA e automação</p>
                  </motion.div>
                  {/* Arrow */}
                  <motion.div variants={scaleIn} className="hidden md:flex justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-px bg-gradient-to-r from-cyan-500/50 to-violet-500/50" />
                      <ArrowRight className="w-6 h-6 text-cyan-400" />
                      <div className="w-24 h-px bg-gradient-to-r from-violet-500/50 to-emerald-500/50" />
                    </div>
                  </motion.div>
                  {/* Step 2 */}
                  <motion.div variants={slideRight} className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                      <Building2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">SERAC Atende</h3>
                    <p className="text-slate-500 text-sm">+250 profissionais fazem a <strong className="text-emerald-400">contabilidade, fiscal, jurídico e consultoria</strong> para os clientes captados</p>
                  </motion.div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Quem ganha o quê */}
          <motion.div variants={fadeUp} className="mb-10">
            <p className="text-slate-600 text-xs font-bold tracking-[0.2em] uppercase mb-6 text-center">Modelo ganha-ganha-ganha</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div variants={fadeUp} whileHover={{ y: -5 }}>
              <GlassCard accent className="p-8 h-full">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">
                  <Brain className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AtentAI ganha</h3>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-white">Setup estratégico</strong> pela implantação da plataforma</span></li>
                  <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-white">Mensalidade fixa</strong> pela manutenção + prospecção contínua</span></li>
                  <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-white">% sobre novos contratos</strong> — performance sobre empresas captadas</span></li>
                  <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-white">Plano mensal por contador</strong> — cada contador ativo na base paga mensalidade</span></li>
                </ul>
              </GlassCard>
            </motion.div>
            <motion.div variants={fadeUp} whileHover={{ y: -5 }}>
              <GlassCard accent className="p-8 h-full">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                  <Building2 className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">SERAC ganha</h3>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-white">Fluxo constante de empresas</strong> — novos clientes todos os meses sem esforço comercial</span></li>
                  <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-white">Contadores na base</strong> — rede de contadores parceiros gerando volume</span></li>
                  <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-white">Plataforma white label</strong> com a marca SERAC posicionada nacionalmente</span></li>
                  <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-white">Receita escalável</strong> — fatura contabilidade dos clientes captados</span></li>
                </ul>
              </GlassCard>
            </motion.div>
            <motion.div variants={fadeUp} whileHover={{ y: -5 }}>
              <GlassCard accent className="p-8 h-full">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5">
                  <Users className="w-7 h-7 text-violet-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Empresas ganham</h3>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-white">Contabilidade de excelência</strong> — atendidas pela SERAC com +250 profissionais</span></li>
                  <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-white">Economia tributária real</strong> — diagnóstico com IA identifica sobrepagamentos</span></li>
                  <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-white">Preparação para 2026</strong> — prontas para IBS + CBS antes dos concorrentes</span></li>
                  <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-white">Suporte completo</strong> — contábil, fiscal, jurídico e consultivo</span></li>
                </ul>
              </GlassCard>
            </motion.div>
          </div>

          {/* Highlight */}
          <motion.div variants={scaleIn} className="mt-14">
            <GlassCard accent glow className="p-10 text-center">
              <p className="text-xl text-slate-300 leading-relaxed">
                A AtentAI traz <span className="text-cyan-400 font-bold">empresas e contadores</span> para a base da SERAC.<br />
                A SERAC faz a contabilidade. <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">Todo mundo ganha.</span>
              </p>
            </GlassCard>
          </motion.div>
        </ParallaxSection>

        {/* ═══════ QUEM SOMOS — with AI Brain Image ═══════ */}
        <ParallaxSection className="bg-slate-900/50 border-t border-white/[0.03]" speed={0.4}>
          <motion.div variants={fadeUp} className="text-center mb-6">
            <Badge>Quem Somos</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">
              O SERAC é <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">referência nacional</span>
            </h2>
          </motion.div>

          {/* Real SERAC images */}
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
                <p className="text-slate-400 text-xs">+200 profissionais</p>
              </div>
            </div>
          </motion.div>

          {/* Area tags */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-14">
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
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
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

        {/* ═══════ OPORTUNIDADE DE MERCADO — with animated numbers ═══════ */}
        <ParallaxSection className="bg-slate-950 border-t border-white/[0.03]">
          <FloatingParticles count={20} />
          <motion.div variants={fadeUp} className="text-center mb-16">
            <Badge>Oportunidade</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">
              Reforma Tributária<br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">2026</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {[
              { icon: Users, value: 520000, prefix: "+", label: "Profissionais contábeis no Brasil" },
              { icon: Building2, value: 90000, prefix: "+", label: "Organizações contábeis ativas" },
            ].map((s, i) => (
              <motion.div key={i} variants={scaleIn} whileHover={{ scale: 1.03 }}>
                <GlassCard glow className="p-10 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-5">
                      <s.icon className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">
                      <AnimatedCounter value={s.value} prefix={s.prefix} duration={2} />
                    </div>
                    <p className="text-slate-500">{s.label}</p>
                  </div>
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
                  <motion.div key={i} whileHover={{ x: 5 }} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.06] transition-colors">
                    <item.icon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <span className="text-slate-300 font-medium">{item.t}</span>
                  </motion.div>
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

        {/* ═══════ A SOLUÇÃO — with Dashboard Image ═══════ */}
        <ParallaxSection className="bg-slate-900/50 border-t border-white/[0.03]" speed={0.3}>
          <motion.div variants={scaleIn} className="text-center mb-8">
            <Badge>A Solução</Badge>
            <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white mt-3" style={{ textShadow: "0 0 60px hsl(185 80% 50% / 0.1)" }}>SERAC</h2>
            <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent mt-2">Intelligence Platform</p>
          </motion.div>
          
          {/* Dashboard preview image */}
          <motion.div variants={scaleIn} className="my-12 relative">
            <div className="relative rounded-2xl overflow-hidden border border-cyan-500/20 shadow-[0_0_80px_hsl(185_80%_50%/0.15)]">
              <img src={seracDashboard} alt="Dashboard" className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            </div>
            {/* Floating metrics over image */}
            <motion.div 
              className="absolute top-4 right-4 sm:top-8 sm:right-8"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <GlassCard className="px-4 py-3">
                <div className="text-cyan-400 font-black text-lg">
                  <AnimatedCounter value={97} suffix="%" duration={1.5} />
                </div>
                <p className="text-slate-500 text-[10px]">Precisão IA</p>
              </GlassCard>
            </motion.div>
            <motion.div 
              className="absolute bottom-12 left-4 sm:bottom-16 sm:left-8"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <GlassCard className="px-4 py-3">
                <div className="text-emerald-400 font-black text-lg">
                  <AnimatedCounter value={340} suffix="+" duration={1.5} />
                </div>
                <p className="text-slate-500 text-[10px]">Diagnósticos/mês</p>
              </GlassCard>
            </motion.div>
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

          <motion.p variants={fadeIn} className="text-slate-600 text-sm tracking-[0.3em] uppercase text-center mt-10 font-medium">Powered by Atentai</motion.p>
        </ParallaxSection>

        {/* ═══════ DIFERENCIAL ESTRATÉGICO ═══════ */}
        <ParallaxSection className="bg-slate-950 border-t border-white/[0.03]" speed={0.35}>
          <FloatingParticles count={15} />
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
              <motion.div key={i} variants={i % 2 === 0 ? slideLeft : slideRight} whileHover={{ y: -5 }}>
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

          {/* Agent Simulation with Tabs */}
          <motion.div variants={fadeUp} className="mt-14">
            <SeracAgentSimulation />
          </motion.div>
        </ParallaxSection>

        {/* ═══════ MÁQUINA DE PROSPECÇÃO ═══════ */}
        <ParallaxSection className="bg-slate-900/50 border-t border-white/[0.03]" speed={0.25}>
          <FloatingParticles count={20} />
          <motion.div variants={fadeUp} className="text-center mb-16">
            <Badge>Prospecção Incluída</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">
              Aquisição Ativa de <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Contadores & Cartórios</span>
            </h2>
          </motion.div>

          {/* Dados de Cartórios do Brasil */}
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
                <p className="text-slate-500 text-sm leading-relaxed">
                  Vamos prospectar <span className="text-cyan-400 font-bold">1.000 cartórios por mês</span> em todo o Brasil, 
                  com abordagem consultiva e diagnóstico tributário personalizado para cada serventia. 
                  Com base no faturamento médio de R$ 2M/ano por cartório, a economia média identificada é de <span className="text-emerald-400 font-bold">R$ 74.000/ano</span>.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={fadeUp} className="mb-12">
            <GlassCard className="p-10">
              <p className="text-slate-600 text-xs font-bold tracking-[0.2em] uppercase mb-10">Prospecção mensal estruturada</p>
              <div className="space-y-5">
                <FunnelStep value="5.000" label="Contadores + 1.000 cartórios impactados por mês" width="w-full" index={0} />
                <FunnelStep value="10%" label="Taxa média de resposta → 600 respostas" width="w-[85%]" index={1} />
                <FunnelStep value="30%" label="Conversão para reunião → 180 reuniões" width="w-[65%]" index={2} />
                <FunnelStep value="20%" label="Taxa de fechamento → 36 contratos" width="w-[45%]" index={3} />
              </div>
            </GlassCard>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-5">
            <GlowingStat value={36} label="Novos contratos/mês" sub="Contadores + Cartórios" />
            <GlowingStat value={90} label="Receita adicional/mês" sub="R$ 90k — Ticket médio: R$ 2.500" />
            <GlowingStat value={540} label="Acumulados em 6 meses" sub="R$ 540k — Crescimento composto" />
          </div>
        </ParallaxSection>

        {/* ═══════ MODELO FINANCEIRO ═══════ */}
        <ParallaxSection className="bg-slate-950 border-t border-white/[0.03]">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <Badge>Investimento</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">Como a AtentAI Monetiza</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <motion.div variants={slideLeft}>
              <GlassCard className="p-8 h-full">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">
                  <DollarSign className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-6">1. Setup Estratégico</h3>
                <p className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">R$ 120k – R$ 180k</p>
                <p className="text-slate-500 text-sm">Implantação da plataforma white label, configuração de agentes IA e integração completa</p>
              </GlassCard>
            </motion.div>

            <motion.div variants={fadeUp}>
              <GlassCard accent className="p-8 h-full">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-6">2. Mensalidade Fixa</h3>
                <p className="text-3xl font-black text-emerald-400 mb-3">R$ 25k – R$ 60k/mês</p>
                <p className="text-slate-500 text-sm">Manutenção da plataforma + máquina de prospecção ativa de empresas e contadores para a SERAC</p>
              </GlassCard>
            </motion.div>

            <motion.div variants={slideRight}>
              <GlassCard glow className="p-8 h-full">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5">
                  <Users className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-6">3. Plano Mensal por Contador</h3>
                <p className="text-3xl font-black text-violet-400 mb-3">R$ 199 – R$ 499/mês</p>
                <p className="text-slate-500 text-sm">Cada contador ativo na base paga um plano mensal pela plataforma AtentAI — receita recorrente escalável</p>
              </GlassCard>
            </motion.div>
          </div>

          <motion.div variants={fadeUp}>
            <GlassCard accent glow className="p-8 text-center">
              <p className="text-slate-500 text-xs font-bold tracking-[0.2em] uppercase mb-4">Receita adicional de performance</p>
              <p className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">10% a 20% sobre novos contratos fechados</p>
              <p className="text-slate-500 text-sm">A AtentAI ganha uma % sobre cada empresa que entra para a base da SERAC através da prospecção</p>
            </GlassCard>
          </motion.div>

          <motion.div variants={fadeUp} className="text-center mt-8">
            <GlassButton variant="default">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Contrato mínimo: <strong className="text-white">12 meses</strong>
            </GlassButton>
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
              { value: 12, label: "Novos contratos/mês" },
              { value: 144, label: "Total de contratos/ano" },
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
                <p className="text-sm text-slate-500 tracking-[0.3em] uppercase font-bold mb-3">Receita potencial anual</p>
                <p className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent" style={{ textShadow: "0 0 40px hsl(185 80% 50% / 0.2)" }}>
                  R$ <AnimatedCounter value={4320000} duration={3} />
                </p>
              </div>
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
          <FloatingParticles count={25} />
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
            SERAC Intelligence Platform — <span className="text-slate-500">Powered by Atentai</span>
          </p>
        </footer>
      </div>
    </>
  );
}
