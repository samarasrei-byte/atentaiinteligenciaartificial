import { Helmet } from "react-helmet-async";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { SeracAgentsOrchestration } from "@/components/serac/SeracAgentsOrchestration";
import { SeracAgentSimulation } from "@/components/serac/SeracAgentSimulation";
import { useRef, useEffect, useState } from "react";
import {
  Shield, BarChart3, Users, Brain,
  ArrowRight, ChevronDown,
  TrendingUp, Target, Zap, Building2, Scale,
  Calendar, Layers, Sparkles,
  Rocket, Globe, Code2, Cpu, Eye,
  Bot, Lightbulb, FileText,
  CheckCircle2, Award, Crown, Star
} from "lucide-react";
import seracHeroBg from "@/assets/serac-hero-futuristic.jpg";
import seracAiBrain from "@/assets/serac-ai-brain.jpg";
import seracDashboard from "@/assets/serac-dashboard.jpg";
import seracOffice from "@/assets/serac-office.png";
import seracBuilding from "@/assets/serac-building.png";
import seracLogo from "@/assets/logo_serac.png";

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
function GlassButton({ children, className = "", variant = "default", onClick }: { children: React.ReactNode; className?: string; variant?: "default" | "primary" | "ghost"; onClick?: () => void }) {
  const base = "inline-flex items-center gap-2 font-semibold rounded-xl px-6 py-3 transition-all duration-300 backdrop-blur-md border text-sm";
  const variants = {
    default: "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20 hover:text-white",
    primary: "border-cyan-400/40 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 hover:from-cyan-500/30 hover:to-blue-500/30 hover:text-white shadow-[0_0_20px_hsl(185_80%_50%/0.2)] hover:shadow-[0_0_30px_hsl(185_80%_50%/0.35)]",
    ghost: "border-transparent bg-transparent text-slate-400 hover:text-cyan-400 hover:bg-white/5",
  };
  return <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
}

/* ── Parallax Section ── */
function ParallaxSection({ children, className = "", id, speed = 0.3 }: { children: React.ReactNode; className?: string; id?: string; speed?: number; }) {
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
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowStickyCTA(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const whatsappLink = "https://wa.me/5511999999999?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20uma%20reuni%C3%A3o%20sobre%20a%20proposta%20SERAC.";

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
            <img src={seracHeroBg} alt="" className="w-full h-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/40 to-slate-950" />
          </motion.div>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(hsl(185 60% 50% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(185 60% 50% / 0.3) 1px, transparent 0)", backgroundSize: "60px 60px" }} />
          <FloatingParticles count={50} />
          <motion.div style={{ y: heroY }} className="absolute inset-0">
            <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-cyan-500/8 blur-[150px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/8 blur-[120px]" />
          </motion.div>

          <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp}>
                <Badge>Proposta Exclusiva · Contrato 12 Meses</Badge>
              </motion.div>
              <motion.div variants={fadeUp} className="flex justify-center mb-4">
                <img src={seracLogo} alt="SERAC" className="h-20 sm:h-24 lg:h-32 object-contain drop-shadow-[0_0_40px_hsl(185_80%_50%/0.3)]" />
              </motion.div>
              <motion.p variants={fadeUp} className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent mb-6">
                Seu Departamento Comercial com IA
              </motion.p>
              <motion.p variants={fadeUp} className="text-lg text-slate-400 mb-8 max-w-3xl mx-auto leading-relaxed">
                3 startups de tecnologia. 1 ecossistema integrado. <strong className="text-white">Plataforma White Label</strong> com a marca SERAC + <strong className="text-cyan-400">exclusividade total</strong> no marketplace + <strong className="text-emerald-400">time comercial de IA 24/7</strong>
              </motion.p>

              {/* Market stats */}
              <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-8 mt-6 mb-8">
                {[
                  { value: 21000000, suffix: "+", label: "Empresas no Brasil" },
                  { value: 13800, suffix: "+", label: "Cartórios" },
                  { value: 520000, suffix: "+", label: "Contadores" },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      <AnimatedCounter value={s.value} suffix={s.suffix} duration={2.5} />
                    </div>
                    <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider font-semibold">{s.label}</p>
                  </div>
                ))}
              </motion.div>

              <motion.p variants={fadeIn} className="text-sm text-slate-600 tracking-[0.3em] uppercase font-medium">
                Powered by AtentAI · G8 Prospect · Clauthor
              </motion.p>
              <motion.div variants={fadeIn} className="mt-12 flex flex-wrap justify-center gap-4">
                <GlassButton variant="primary" className="cursor-pointer" onClick={() => scrollToSection('proposta-comercial')}>
                  <Rocket className="w-4 h-4" /> Ver Proposta Completa
                </GlassButton>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <GlassButton className="cursor-pointer">
                    <ArrowRight className="w-4 h-4" /> Agendar Reunião
                  </GlassButton>
                </a>
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

        {/* ═══════ ECOSSISTEMA DE 3 STARTUPS — VALORIZADO ═══════ */}
        <ParallaxSection className="bg-slate-950 border-t border-white/[0.03]" speed={0.2}>
          <FloatingParticles count={20} />
          <motion.div variants={fadeUp} className="text-center mb-16">
            <Badge>Ecossistema de Tecnologia</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">
              3 Startups. <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">1 Ecossistema Único.</span>
            </h2>
            <p className="text-slate-500 text-lg mt-4 max-w-3xl mx-auto">O SERAC terá acesso a um ecossistema que já movimenta o mercado, com tecnologia consolidada, clientes ativos e resultados comprovados</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {/* AtentAI */}
            <motion.div variants={scaleIn}>
              <GlassCard className="p-8 h-full relative overflow-hidden group cursor-pointer">
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 bg-cyan-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20 bg-cyan-500/10">
                    <Brain className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-1">AtentAI</h3>
                  <p className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4">Plataforma White Label</p>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5">
                    Plataforma de <strong className="text-white">Inteligência Fiscal</strong> e marketplace de serviços contábeis. O SERAC terá uma <strong className="text-cyan-400">versão exclusiva com seu logo e marca</strong> — como se fosse um software próprio.
                  </p>
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-slate-300">Centenas de usuários ativos</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-slate-300">Marketplace com valor de mercado consolidado</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-slate-300">Exclusividade total para o SERAC</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["White Label", "Marketplace", "Exclusividade", "IA Fiscal"].map((tag, i) => (
                      <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* G8 Prospect */}
            <motion.div variants={scaleIn}>
              <GlassCard className="p-8 h-full relative overflow-hidden group cursor-pointer">
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 bg-violet-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-violet-500/20 bg-violet-500/10">
                    <Target className="w-8 h-8 text-violet-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-1">G8 Prospect</h3>
                  <p className="text-violet-400 text-xs font-bold uppercase tracking-wider mb-4">Ecossistema de 8 Startups</p>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5">
                    Ecossistema de inovação com <strong className="text-white">7 anos de experiência</strong> no mercado. Já gerou mais de <strong className="text-violet-400">R$ 360 milhões em negócios</strong> para seus clientes.
                  </p>
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-xs">
                      <Award className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-slate-300"><strong className="text-white">7 anos</strong> de experiência no mercado</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-slate-300"><strong className="text-white">R$ 360M+</strong> em negócios gerados</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Crown className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-slate-300">Trabalha com grandes empresas</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Leads B2B", "C-Levels", "8 Startups", "R$ 360M+"].map((tag, i) => (
                      <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Clauthor */}
            <motion.div variants={scaleIn}>
              <GlassCard className="p-8 h-full relative overflow-hidden group cursor-pointer">
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 bg-emerald-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 bg-emerald-500/10">
                    <Bot className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-1">Clauthor</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Empresa Americana</p>
                    <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">🇺🇸 USA</span>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5">
                    Empresa <strong className="text-white">americana</strong> chegando com tudo no Brasil. Plataforma de <strong className="text-emerald-400">"AI Employees"</strong> — agentes de IA que automatizam prospecção, compliance e gestão. Trabalham <strong className="text-white">24/7</strong> com grandes clientes globais.
                  </p>
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-xs">
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-slate-300">Empresa americana com operação global</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Star className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-slate-300">Grandes clientes corporativos</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-slate-300">Agentes de IA operando 24/7</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["AI Employees", "24/7", "Global", "Enterprise"].map((tag, i) => (
                      <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          <motion.div variants={fadeUp}>
            <GlassCard accent glow className="p-8 text-center">
              <p className="text-xl text-slate-300 leading-relaxed">
                O SERAC terá acesso a <span className="text-white font-bold">todo esse ecossistema</span> integrado: <span className="text-cyan-400 font-bold">AtentAI</span> como plataforma White Label exclusiva · <span className="text-violet-400 font-bold">G8 Prospect</span> com 7 anos de experiência e R$ 360M+ em negócios · <span className="text-emerald-400 font-bold">Clauthor</span> com tecnologia americana de ponta
              </p>
            </GlassCard>
          </motion.div>
        </ParallaxSection>

        {/* ═══════ 3 CANAIS DE OPERAÇÃO ═══════ */}
        <ParallaxSection className="bg-slate-900/30 border-t border-white/[0.03]" speed={0.3}>
          <FloatingParticles count={20} />
          <motion.div variants={fadeUp} className="text-center mb-16">
            <Badge>Operação Comercial</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">
              3 Canais. <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">1 Destino: SERAC.</span>
            </h2>
            <p className="text-slate-500 text-lg mt-4 max-w-3xl mx-auto">
              O ecossistema funciona como uma <strong className="text-slate-300">extensão do time comercial do SERAC</strong> — atuando em 3 frentes simultâneas com inteligência artificial
            </p>
          </motion.div>

          {/* Canal 1 - Exclusividade AtentAI */}
          <motion.div variants={fadeUp} className="mb-6">
            <GlassCard accent glow className="p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Canal 1</p>
                    <h3 className="text-2xl font-black text-white">Exclusividade AtentAI</h3>
                  </div>
                </div>
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  Todos os clientes que chegam pela plataforma AtentAI buscando <strong className="text-white">serviços contábeis</strong> serão direcionados <strong className="text-cyan-400">exclusivamente</strong> para o SERAC. O marketplace da AtentAI terá apenas o SERAC como parceiro contábil. <strong className="text-white">Sem concorrência.</strong>
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <Shield className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                    <p className="text-white font-bold text-sm">Exclusividade total</p>
                    <p className="text-slate-500 text-xs">Único parceiro contábil</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <Layers className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                    <p className="text-white font-bold text-sm">Todos os serviços</p>
                    <p className="text-slate-500 text-xs">Marketplace completo</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <Brain className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                    <p className="text-white font-bold text-sm">White Label</p>
                    <p className="text-slate-500 text-xs">Logo e marca SERAC</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Canal 2 - Infraestrutura Tech */}
          <motion.div variants={fadeUp} className="mb-6">
            <GlassCard className="p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px]" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Cpu className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Canal 2</p>
                    <h3 className="text-2xl font-black text-white">Infraestrutura Completa</h3>
                  </div>
                </div>
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  O SERAC recebe <strong className="text-white">toda a estrutura tecnológica</strong>: plataforma White Label, sistema completo com IA, simuladores da Reforma Tributária 2026, dashboard executivo e agentes de IA da Clauthor como <strong className="text-emerald-400">time comercial dedicado 24/7</strong>.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { icon: Brain, t: "Inteligência Fiscal com IA" },
                    { icon: BarChart3, t: "Simulador Reforma 2026" },
                    { icon: Bot, t: "Agentes IA 24/7" },
                    { icon: Layers, t: "Dashboard Executivo" },
                    { icon: Scale, t: "Compliance Tributário" },
                    { icon: Globe, t: "Plataforma White Label" },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <f.icon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-300 text-sm font-medium">{f.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Canal 3 - Prospecção Ativa */}
          <motion.div variants={fadeUp}>
            <GlassCard className="p-10 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/5 rounded-full blur-[100px]" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <Target className="w-8 h-8 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-violet-400 text-xs font-bold uppercase tracking-wider">Canal 3</p>
                    <h3 className="text-2xl font-black text-white">Prospecção Ativa com IA</h3>
                  </div>
                </div>
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  <strong className="text-white">5 campanhas por mês</strong> de prospecção ativa com IA, gerando leads qualificados e direcionando diretamente para o <strong className="text-violet-400">time comercial do SERAC</strong>. Empresas, contadores e cartórios prospectados simultaneamente.
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <Building2 className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                    <p className="text-white font-bold">Empresas</p>
                    <p className="text-slate-500 text-xs mt-1">Para contabilidade exclusiva SERAC</p>
                  </div>
                  <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <Users className="w-8 h-8 text-violet-400 mx-auto mb-3" />
                    <p className="text-white font-bold">Contadores</p>
                    <p className="text-slate-500 text-xs mt-1">Para eventos e mentorias SERAC</p>
                  </div>
                  <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <Scale className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                    <p className="text-white font-bold">Cartórios</p>
                    <p className="text-slate-500 text-xs mt-1">Para serviços especializados</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </ParallaxSection>

        {/* ═══════ O QUE O SERAC RECEBE ═══════ */}
        <ParallaxSection className="bg-slate-950 border-t border-white/[0.03]" speed={0.3}>
          <FloatingParticles count={15} />
          <motion.div variants={fadeUp} className="text-center mb-16">
            <Badge>Entregáveis</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">
              Tudo que o SERAC <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">recebe</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {[
              { icon: Globe, t: "Plataforma White Label", d: "Software completo com logo e marca SERAC — o mercado vê como produto próprio" },
              { icon: Shield, t: "Exclusividade no Marketplace", d: "Único parceiro contábil no AtentAI — sem concorrência, todos os leads são seus" },
              { icon: Bot, t: "Time Comercial de IA 24/7", d: "Agentes da Clauthor trabalhando ininterruptamente como extensão do seu time" },
              { icon: Target, t: "5 Campanhas/Mês", d: "Prospecção ativa mensal com IA para empresas, contadores e cartórios" },
              { icon: BarChart3, t: "Simulador Reforma 2026", d: "Ferramenta exclusiva de simulação IBS + CBS para atrair e converter leads" },
              { icon: Brain, t: "Inteligência Fiscal com IA", d: "Diagnósticos tributários automatizados que identificam economia para os clientes" },
              { icon: Layers, t: "Dashboard Executivo", d: "Painel estratégico com métricas, projeções e análises em tempo real" },
              { icon: Users, t: "Clube de Mentorias", d: "Contadores e cartórios prospectados alimentam o programa de capacitação SERAC" },
              { icon: Calendar, t: "Contrato de 12 Meses", d: "Operação estruturada com reajuste anual baseado em resultados comprovados" },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                <GlassCard className="p-6 h-full relative overflow-hidden group cursor-pointer">
                  <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-cyan-500/5 blur-[60px] group-hover:bg-cyan-500/10 transition-all duration-700" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                      <item.icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-white font-bold text-base mb-2">{item.t}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{item.d}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </ParallaxSection>

        {/* ═══════ PORTFÓLIO DE SERVIÇOS ═══════ */}
        <ParallaxSection className="bg-slate-900/30 border-t border-white/[0.03]" speed={0.3}>
          <FloatingParticles count={15} />
          <motion.div variants={fadeUp} className="text-center mb-16">
            <Badge>Portfólio Completo</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">
              Serviços que a SERAC <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">já domina</span>
            </h2>
            <p className="text-slate-500 text-lg mt-4 max-w-3xl mx-auto">
              Todos os serviços abaixo estarão disponíveis no marketplace exclusivo — o AtentAI canaliza os leads, o SERAC executa
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {[
              { icon: Building2, name: "Contabilidade para Empresas", tags: ["MEI", "ME", "EPP", "Lucro Real"] },
              { icon: Scale, name: "Serviços para Cartórios", tags: ["Cartórios", "Nicho", "13.800+"] },
              { icon: Cpu, name: "Contabilidade para Infoprodutores", tags: ["Digital", "PLR", "E-commerce"] },
              { icon: Code2, name: "Contabilidade para Games", tags: ["Games", "Tech", "Startups"] },
              { icon: FileText, name: "Imposto de Renda", tags: ["IRPF", "IRPJ", "Restituição"] },
              { icon: Shield, name: "Marcas e Patentes", tags: ["INPI", "Marca", "Patente"] },
              { icon: Globe, name: "Certificado Digital", tags: ["e-CPF", "e-CNPJ", "NF-e"] },
              { icon: Lightbulb, name: "Consultoria Empresarial", tags: ["Estratégia", "Gestão", "Crescimento"] },
            ].map((service, i) => (
              <motion.div key={i} variants={scaleIn} whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                <GlassCard className="p-6 h-full relative overflow-hidden group cursor-pointer">
                  <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-cyan-500/5 blur-[60px] group-hover:bg-cyan-500/10 transition-all duration-700" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                      <service.icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-white font-bold text-sm mb-3">{service.name}</h3>
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

          <motion.div variants={fadeUp} className="mb-14">
            <SeracAgentsOrchestration />
          </motion.div>

          <motion.div variants={fadeUp}>
            <SeracAgentSimulation />
          </motion.div>
        </ParallaxSection>

        {/* ═══════ PROPOSTA — PLANOS SEPARADOS + BUNDLE ═══════ */}
        <ParallaxSection id="proposta-comercial" className="bg-slate-900/50 border-t border-white/[0.03]" speed={0.3}>
          <FloatingParticles count={20} />
          <motion.div variants={fadeUp} className="text-center mb-16">
            <Badge>Proposta Comercial</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">
              Escolha o <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Plano Ideal</span>
            </h2>
            <p className="text-slate-500 text-lg mt-4 max-w-3xl mx-auto">
              Contrate cada solução separadamente ou aproveite o pacote completo com condição especial
            </p>
          </motion.div>

          {/* 3 Planos Individuais */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {/* AtentAI White Label */}
            <motion.div variants={fadeUp} whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
              <GlassCard className="p-8 h-full relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-cyan-500/5 blur-[80px]" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">
                    <Brain className="w-7 h-7 text-cyan-400" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-black text-white">AtentAI</h3>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400/70 bg-cyan-500/5 border border-cyan-500/10 px-2 py-0.5 rounded-full">White Label</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-6">Plataforma completa com a marca SERAC — o mercado enxerga como tecnologia própria</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-black text-white">R$ 30.000</span>
                    <span className="text-slate-500 text-sm">/mês</span>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      "Plataforma White Label com logo e cores SERAC",
                      "Exclusividade total no marketplace",
                      "Dashboard executivo e relatórios",
                      "Simulador Reforma Tributária 2026",
                      "Inteligência fiscal com IA integrada",
                      "Marketplace de serviços exclusivo",
                      "Suporte técnico dedicado",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-400 text-xs">{item}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-600 uppercase tracking-wider font-medium">Comissão do parceiro: 10% sobre contratos fechados</p>
                </div>
              </GlassCard>
            </motion.div>

            {/* G8 Prospect */}
            <motion.div variants={fadeUp} whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
              <GlassCard className="p-8 h-full relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-violet-500/5 blur-[80px]" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5">
                    <Target className="w-7 h-7 text-violet-400" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-black text-white">G8 Prospect</h3>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-violet-400/70 bg-violet-500/5 border border-violet-500/10 px-2 py-0.5 rounded-full">Campanhas</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-6">Prospecção ativa multicanal com 7 anos de experiência e R$ 360M+ em negócios gerados</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-black text-white">R$ 20.000</span>
                    <span className="text-slate-500 text-sm">/mês</span>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      "5 campanhas ativas por mês",
                      "Prospecção empresas, contadores e cartórios",
                      "Acesso a base de C-Levels e decisores",
                      "Qualificação inteligente de leads",
                      "Relatórios de performance das campanhas",
                      "Estratégia de abordagem personalizada",
                      "7 anos de track record comprovado",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-400 text-xs">{item}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-600 uppercase tracking-wider font-medium">Comissão do parceiro: 10% sobre contratos fechados</p>
                </div>
              </GlassCard>
            </motion.div>

            {/* Clauthor Agentes IA */}
            <motion.div variants={fadeUp} whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
              <GlassCard className="p-8 h-full relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-emerald-500/5 blur-[80px]" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                    <Bot className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-black text-white">Clauthor</h3>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400/70 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-full">Agentes IA</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-6">Departamento de agentes inteligentes operando 24/7 como extensão do time comercial SERAC</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-black text-white">R$ 6.000</span>
                    <span className="text-slate-500 text-sm">/mês</span>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      "5 agentes de IA especializados",
                      "SDR Tributário automatizado 24/7",
                      "Diagnóstico Tributário com IA",
                      "Especialista em Cartórios",
                      "Customer Success automatizado",
                      "Diretor de Inteligência Comercial",
                      "Tecnologia americana de ponta",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-400 text-xs">{item}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-600 uppercase tracking-wider font-medium">Comissão do parceiro: 10% sobre contratos fechados</p>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Pacote Completo */}
          <motion.div variants={fadeUp} className="mb-10">
            <GlassCard accent glow className="p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-500/5 rounded-full blur-[100px]" />
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center gap-3 mb-3 justify-center md:justify-start">
                      <Crown className="w-8 h-8 text-amber-400" />
                      <h3 className="text-2xl font-black text-white">Pacote Ecossistema Completo</h3>
                    </div>
                    <p className="text-slate-400 mb-4">AtentAI White Label + G8 Prospect Campanhas + Clauthor Agentes IA — tudo integrado em uma única operação</p>
                    
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
                      <span className="inline-flex items-center gap-1.5 text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold px-3 py-1 rounded-full">
                        <Brain className="w-3 h-3" /> AtentAI
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-violet-400 bg-violet-500/10 border border-violet-500/20 text-xs font-bold px-3 py-1 rounded-full">
                        <Target className="w-3 h-3" /> G8 Prospect
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full">
                        <Bot className="w-3 h-3" /> Clauthor
                      </span>
                    </div>

                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <span className="text-slate-600 line-through text-lg">R$ 56.000/mês</span>
                      <span className="text-amber-400 text-sm font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">Economia de R$ 6.000/mês</span>
                    </div>
                  </div>

                  <div className="text-center md:text-right flex-shrink-0">
                    <div className="mb-2">
                      <span className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">R$ 50.000</span>
                      <span className="text-slate-500 text-lg">/mês</span>
                    </div>
                    <p className="text-slate-500 text-xs mb-4">Contrato de 12 meses · Reajuste por resultado</p>
                    <p className="text-amber-400 text-xs font-bold">+ 10% de comissão sobre novos contratos</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Comparativo Avulso vs Bundle */}
          <motion.div variants={fadeUp}>
            <GlassCard className="p-8">
              <h4 className="text-white font-bold text-center mb-6">Comparativo: Avulso vs. Pacote Completo</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-slate-400 font-medium py-3 pr-4">Solução</th>
                      <th className="text-center text-slate-400 font-medium py-3 px-4">Avulso</th>
                      <th className="text-center text-cyan-400 font-medium py-3 pl-4">Pacote</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "AtentAI White Label", avulso: "R$ 30.000", pacote: true },
                      { name: "G8 Prospect Campanhas", avulso: "R$ 20.000", pacote: true },
                      { name: "Clauthor Agentes IA", avulso: "R$ 6.000", pacote: true },
                      { name: "Integração total entre soluções", avulso: "—", pacote: true },
                      { name: "Economia mensal", avulso: "—", pacote: false, highlight: "R$ 6.000" },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-white/[0.04]">
                        <td className="text-slate-300 py-3 pr-4 font-medium">{row.name}</td>
                        <td className="text-center text-slate-500 py-3 px-4">{row.avulso}</td>
                        <td className="text-center py-3 pl-4">
                          {row.highlight ? (
                            <span className="text-amber-400 font-bold">{row.highlight}</span>
                          ) : row.pacote ? (
                            <CheckCircle2 className="w-5 h-5 text-cyan-400 mx-auto" />
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="text-white font-bold py-3 pr-4">Total</td>
                      <td className="text-center text-slate-400 font-bold py-3 px-4">R$ 56.000/mês</td>
                      <td className="text-center font-black py-3 pl-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent text-lg">R$ 50.000/mês</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        </ParallaxSection>

        {/* ═══════ DEFESA ESTRATÉGICA — CEO ═══════ */}
        <ParallaxSection className="bg-slate-950 border-t border-white/[0.03]" speed={0.35}>
          <FloatingParticles count={15} />
          <motion.div variants={fadeUp} className="text-center mb-5">
            <Badge>Perspectiva Estratégica</Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-black text-white text-center mb-14">
            Por que o SERAC <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">precisa</span> disso agora
          </motion.h2>

          <motion.div variants={fadeUp} className="max-w-4xl mx-auto">
            <GlassCard glow className="p-10 md:p-14 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-500/5 rounded-full blur-[100px]" />
              <div className="relative z-10 space-y-6 text-slate-300 leading-relaxed">
                <p>
                  A <strong className="text-white">Reforma Tributária de 2026</strong> será o maior evento contábil da década. Quem se posicionar agora como líder terá vantagem competitiva definitiva.
                </p>
                <p>
                  Com este ecossistema, o SERAC recebe: uma <span className="text-cyan-400 font-bold">plataforma White Label</span> que o mercado enxerga como tecnologia própria do SERAC, <span className="text-emerald-400 font-bold">exclusividade total</span> no maior marketplace fiscal com IA do país, e um <span className="text-violet-400 font-bold">time comercial de IA</span> da Clauthor (empresa americana com grandes clientes globais) prospectando 24/7.
                </p>
                <p>
                  A G8 Prospect traz <strong className="text-white">7 anos de experiência</strong> e já gerou <strong className="text-violet-400">mais de R$ 360 milhões em negócios</strong>. A AtentAI já tem centenas de usuários ativos e um marketplace com valor de mercado consolidado. A Clauthor é uma <strong className="text-emerald-400">empresa americana</strong> que trabalha com grandes clientes globais.
                </p>
                <p>
                  Nosso modelo de <span className="text-cyan-400 font-bold">comissionamento</span> é a prova da nossa confiança: <span className="text-white font-bold">nós só ganhamos mais se o SERAC ganha mais</span>. É uma operação de crescimento com risco compartilhado.
                </p>
                <p className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  A oportunidade é agora. A Reforma Tributária 2026 vai definir quem lidera — e o SERAC tem tudo para ser esse líder.
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </ParallaxSection>

        {/* ═══════ FAQ ═══════ */}
        <ParallaxSection className="bg-slate-900/50 border-t border-white/[0.03]" speed={0.2}>
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
              question="O que exatamente o SERAC recebe com essa proposta?"
              answer="O SERAC recebe: (1) Plataforma White Label completa com logo e marca SERAC; (2) Exclusividade total no marketplace AtentAI — todos os leads contábeis são direcionados apenas para o SERAC; (3) Time comercial de IA 24/7 da Clauthor prospectando empresas, contadores e cartórios; (4) 5 campanhas de prospecção por mês; (5) Toda a infraestrutura tecnológica incluindo simuladores da Reforma 2026, dashboard executivo e inteligência fiscal."
            />
            <FAQItem
              index={2}
              question="Como funciona a exclusividade no marketplace?"
              answer="O SERAC será o único parceiro contábil no marketplace AtentAI. Isso significa que todos os leads que chegam buscando serviços contábeis são direcionados exclusivamente para o SERAC — sem concorrência. A AtentAI se torna uma extensão do departamento de vendas do SERAC."
            />
            <FAQItem
              index={3}
              question="Quem são as empresas por trás dessa proposta?"
              answer="São 3 startups integradas: AtentAI — plataforma de inteligência fiscal com centenas de usuários e marketplace consolidado; G8 Prospect — ecossistema com 7 anos de experiência e R$ 360M+ em negócios gerados; e Clauthor — empresa americana com tecnologia de ponta que trabalha com grandes clientes globais."
            />
            <FAQItem
              index={4}
              question="A plataforma White Label realmente parece ser do SERAC?"
              answer="Sim. A plataforma terá o logo, as cores e a identidade visual do SERAC. O mercado, os clientes e os contadores verão a plataforma como um produto próprio do SERAC. A tecnologia AtentAI, G8 e Clauthor operam nos bastidores como infraestrutura."
            />
            <FAQItem
              index={5}
              question="Como funciona o contrato de 12 meses?"
              answer="É um contrato de operação de 12 meses com reajuste anual baseado nos resultados comprovados. O modelo de comissionamento garante que nossos interesses estão alinhados — ganhamos mais quando o SERAC ganha mais. É uma operação de crescimento, não um custo fixo."
            />
            <FAQItem
              index={6}
              question="Por que não construir essa estrutura internamente?"
              answer="Construir internamente significaria: contratar dezenas de desenvolvedores, criar uma plataforma do zero, desenvolver agentes de IA, construir um marketplace, e montar uma equipe de prospecção. Isso levaria meses e custaria muito mais. Com nossa proposta, o SERAC tem acesso imediato a toda essa infraestrutura já testada e com resultados comprovados."
            />
            <FAQItem
              index={7}
              question="Qual a garantia de qualidade dos leads?"
              answer="Os agentes de IA da Clauthor são treinados para identificar e qualificar leads com alta precisão. A prospecção é segmentada por empresas, contadores e cartórios. E nosso modelo de comissionamento garante que estamos incentivados a entregar leads de altíssima qualidade — nosso sucesso depende do sucesso do SERAC."
            />
          </div>
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
        <ParallaxSection className="bg-slate-900/50 border-t border-white/[0.03]" speed={0.2}>
          <FloatingParticles count={25} />
          <motion.div variants={fadeUp} className="text-center mb-14">
            <Badge>Próximo Passo</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-white mt-3">Próximo Passo</h2>
          </motion.div>

          <div className="max-w-2xl mx-auto space-y-4 mb-16">
            {[
              { step: "01", t: "Aprovação do modelo de operação" },
              { step: "02", t: "Assinatura do contrato de 12 meses" },
              { step: "03", t: "Customização da plataforma White Label" },
              { step: "04", t: "Ativação dos agentes de IA e campanhas" },
              { step: "05", t: "Go-live e início da prospecção ativa" },
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

          <motion.div variants={scaleIn} className="text-center space-y-4">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <GlassButton variant="primary" className="text-lg px-10 py-5 cursor-pointer">
                <Rocket className="w-5 h-5" /> Agendar Reunião Estratégica <ArrowRight className="w-5 h-5" />
              </GlassButton>
            </a>
            <p className="text-slate-600 text-xs">Reunião sem compromisso · 30 minutos · Online</p>
          </motion.div>
        </ParallaxSection>

        {/* Footer */}
        <footer className="py-16 px-6 border-t border-white/[0.04]">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} SERAC Intelligence Platform
            </p>
            <p className="text-slate-700 text-xs">
              Powered by AtentAI · G8 Prospect · Clauthor
            </p>
            <p className="text-slate-700 text-[10px] uppercase tracking-widest">
              Documento confidencial · Proposta comercial exclusiva
            </p>
          </div>
        </footer>

        {/* Sticky CTA */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: showStickyCTA ? 0 : 100, opacity: showStickyCTA ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <button className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-[0_0_30px_hsl(185_80%_50%/0.4)] hover:shadow-[0_0_50px_hsl(185_80%_50%/0.6)] transition-all duration-300 hover:scale-105">
              <Rocket className="w-4 h-4" />
              Agendar Reunião
            </button>
          </a>
        </motion.div>
      </div>
    </>
  );
}
