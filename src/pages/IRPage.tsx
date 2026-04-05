import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { IRRequestForm } from '@/components/ir/IRRequestForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  FileText, FileSpreadsheet, Brain, Upload, Shield, Zap,
  CheckCircle2, Clock, TrendingUp, AlertTriangle, Star,
  ArrowRight, Sparkles, Eye, BarChart3, Lock,
  ChevronDown, Award, Play, Cpu, ScanLine,
  Users, Timer, ArrowDown, Flame, Crown, Rocket,
  Check, X, Gift, Headphones,
} from 'lucide-react';
import { formatPrice, SUBSCRIBER_DISCOUNTS } from '@/lib/plans';

/* ═══════ Animation Variants ═══════ */
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } },
};
const fadeScale = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

/* ═══════ Animated Counter Hook ═══════ */
function useCounter(target: number, inView: boolean, duration = 2000) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  React.useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);
  return count;
}

const IRPage = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const scrollToSection = (section: string) => {
    if (section === 'form') { formRef.current?.scrollIntoView({ behavior: 'smooth' }); return; }
    navigate('/');
  };
  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="dark min-h-screen bg-background overflow-x-hidden">
      <Header onNavigate={scrollToSection} />

      {/* ═══════ HERO — Cinematic Full Impact ═══════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Multi-layer background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_150%_100%_at_50%_-30%,hsl(270_70%_15%/0.8),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_80%_20%,hsl(240_80%_18%/0.4),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_10%_80%,hsl(200_80%_20%/0.3),transparent_60%)]" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

        {/* Floating orbs */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/[0.06] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-600/[0.05] blur-[100px] pointer-events-none" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container mx-auto px-4 relative z-10 pt-20">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center max-w-5xl mx-auto">
            {/* Urgency badge */}
            <motion.div variants={fadeUp} className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 backdrop-blur-md">
                <Flame className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="text-sm font-bold text-red-300">Prazo IRPF 2026: 30 de maio</span>
                <span className="text-xs text-muted-foreground/60 hidden sm:inline">• Não perca o prazo</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black tracking-[-0.03em] leading-[0.92]">
              <span className="text-foreground">Seu Imposto de Renda</span>
              <br />
              <span className="relative">
                <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-blue-400 bg-clip-text text-transparent">
                  feito por IA
                </span>
                {/* Underline accent */}
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p variants={fadeUp} className="mt-8 text-lg md:text-xl text-muted-foreground/70 max-w-2xl mx-auto leading-relaxed">
              Envie seus documentos e a inteligência artificial extrai, calcula e maximiza
              sua restituição. <span className="text-foreground font-semibold">Resultado em minutos, não em dias.</span>
            </motion.p>

            {/* CTA cluster */}
            <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={scrollToForm}
                className="group relative h-16 px-12 rounded-2xl text-lg font-black bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 bg-[length:200%_100%] hover:bg-[position:right_center] transition-all duration-500 shadow-[0_0_60px_-10px_hsl(270_60%_50%/0.6)] hover:shadow-[0_0_80px_-10px_hsl(270_60%_50%/0.8)] hover:-translate-y-1 hover:scale-[1.02] text-white"
              >
                <Rocket className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Declarar agora
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform" />
              </Button>
              <button
                onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors text-sm font-medium"
              >
                Como funciona
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </button>
            </motion.div>

            {/* Social proof strip */}
            <motion.div variants={fadeUp} className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground/50">
              <span className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 border-2 border-background flex items-center justify-center">
                      <Users className="w-3 h-3 text-white" />
                    </div>
                  ))}
                </div>
                <span className="text-foreground/80 font-semibold">2.400+</span> declarações
              </span>
              <span className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-foreground/80 font-semibold">4.9</span> avaliação
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>LGPD • AES-256</span>
              </span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/10 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-2.5 rounded-full bg-purple-400/60" />
          </div>
        </motion.div>
      </section>

      {/* ═══════ LIVE METRICS ═══════ */}
      <LiveMetrics />

      {/* ═══════ PROCESS — Cinematic Timeline ═══════ */}
      <StepsSection />

      {/* ═══════ PLANS — Dramatic Comparison ═══════ */}
      <PlansSection onSelectPlan={scrollToForm} />

      {/* ═══════ TECH — Premium Bento Grid ═══════ */}
      <TechSection />

      {/* ═══════ TESTIMONIALS ═══════ */}
      <TestimonialsSection />

      {/* ═══════ FAQ ═══════ */}
      <FAQSection />

      {/* ═══════ CTA FINAL ═══════ */}
      <CTASection onAction={scrollToForm} />

      {/* ═══════ FORM ═══════ */}
      <section ref={formRef} className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,hsl(270_50%_15%/0.2),transparent_60%)]" />
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 backdrop-blur-sm">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Formulário seguro
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-foreground">
              Comece sua declaração
            </h2>
            <p className="text-muted-foreground/60 mt-3 max-w-lg mx-auto">
              Dados protegidos com criptografia end-to-end. Após pagamento, acesse o Painel IA.
            </p>
          </div>
          <IRRequestForm onSuccess={() => navigate('/contador-ia')} />
        </div>
      </section>

      <Footer onNavigate={scrollToSection} />
    </div>
  );
};

/* ═══════ LIVE METRICS — Animated Counters ═══════ */
function LiveMetrics() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });

  const declarations = useCounter(2437, inView);
  const accuracy = useCounter(97, inView, 1500);
  const avgTime = useCounter(4, inView, 1000);
  const saved = useCounter(847, inView, 1800);

  return (
    <section ref={ref} className="relative -mt-1 py-12 md:py-16 border-y border-white/[0.04]">
      <div className="absolute inset-0 bg-white/[0.015]" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
          {[
            { value: declarations.toLocaleString('pt-BR'), suffix: '+', label: 'Declarações feitas', icon: FileText, color: 'text-purple-400' },
            { value: `${accuracy}`, suffix: '%', label: 'Precisão da IA', icon: Brain, color: 'text-emerald-400' },
            { value: `${avgTime}`, suffix: 'min', label: 'Tempo médio', icon: Timer, color: 'text-amber-400' },
            { value: `R$ ${saved}`, suffix: '', label: 'Economia média', icon: TrendingUp, color: 'text-blue-400' },
          ].map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="text-center"
            >
              <m.icon className={`w-5 h-5 ${m.color} mx-auto mb-3 opacity-60`} />
              <div className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                {m.value}<span className="text-lg font-bold text-muted-foreground/40">{m.suffix}</span>
              </div>
              <div className="text-xs text-muted-foreground/40 mt-1 font-medium uppercase tracking-wider">{m.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════ STEPS ═══════ */
function StepsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const steps = [
    { step: 1, title: 'Contrate online', desc: 'Escolha Simples ou Completo. Pague via Pix ou cartão em 30 segundos.', icon: Play, accent: 'from-blue-500 to-cyan-400' },
    { step: 2, title: 'Envie documentos', desc: 'Upload de informes de rendimento, recibos médicos e educação.', icon: Upload, accent: 'from-purple-500 to-violet-400' },
    { step: 3, title: 'IA analisa tudo', desc: 'Visão computacional extrai dados e compara Simples vs Completo automaticamente.', icon: ScanLine, accent: 'from-violet-500 to-fuchsia-400' },
    { step: 4, title: 'Checklist fiscal', desc: 'Responda sobre dependentes, bens e previdência. A IA ajusta os cálculos.', icon: CheckCircle2, accent: 'from-emerald-500 to-teal-400' },
    { step: 5, title: 'Resultado completo', desc: 'Restituição estimada, risco de malha fina e dicas de otimização fiscal.', icon: BarChart3, accent: 'from-amber-500 to-orange-400' },
    { step: 6, title: 'Envio à Receita', desc: 'Simples: você envia. Completo: contador revisa e transmite por você.', icon: Award, accent: 'from-cyan-500 to-blue-400' },
  ];

  return (
    <section id="como-funciona" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="text-center mb-20">
          <motion.div variants={fadeUp}>
            <Badge className="mb-5 bg-purple-500/10 text-purple-300 border-purple-500/20 backdrop-blur-sm px-5 py-2">
              <Zap className="w-4 h-4 mr-2" /> 100% Digital
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-black text-foreground tracking-tight">
            6 etapas. <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">Zero burocracia.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground/60 mt-4 max-w-lg mx-auto text-lg">
            Do pagamento ao resultado, tudo automatizado por IA
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <motion.div key={s.step} variants={fadeUp}>
              <div className="group relative h-full rounded-3xl bg-card/20 backdrop-blur-sm border border-white/[0.06] hover:border-purple-500/20 p-7 transition-all duration-500 hover:bg-card/40 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${s.accent} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.accent} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <s.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[11px] font-black text-muted-foreground/30 uppercase tracking-[0.25em]">
                      Etapa {String(s.step).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="font-black text-foreground text-xl mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground/60 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════ PLANS ═══════ */
function PlansSection({ onSelectPlan }: { onSelectPlan: () => void }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_50%,hsl(270_50%_15%/0.15),transparent_70%)]" />
      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="text-center mb-16">
          <motion.div variants={fadeUp}>
            <Badge className="mb-5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 backdrop-blur-sm px-5 py-2">
              <Award className="w-4 h-4 mr-2" /> Planos
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-black text-foreground tracking-tight">
            Escolha seu plano
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground/60 mt-4 max-w-lg mx-auto text-lg">
            Simples para CLT. Completo para quem tem investimentos ou múltiplas fontes.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* IR SIMPLES */}
          <motion.div variants={fadeScale}>
            <div className="group h-full rounded-[2rem] bg-card/20 backdrop-blur-sm border border-white/[0.06] hover:border-blue-500/25 transition-all duration-500 p-8 md:p-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-foreground">IR Simples</h3>
                    <p className="text-sm text-muted-foreground/50">CLT com poucos rendimentos</p>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl md:text-6xl font-black text-foreground tracking-tight">
                      {formatPrice(SUBSCRIBER_DISCOUNTS.ir_simples.basePrice)}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground/40">pagamento único</span>
                </div>

                <div className="space-y-3.5 mb-10">
                  {[
                    'Análise 100% por IA (Gemini)',
                    '1 fonte de renda (CLT)',
                    'Deduções básicas (saúde, educação)',
                    'Comparação Simples vs Completo',
                    'Detector de Malha Fina',
                    'Resultado por email',
                    'Você envia à Receita',
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground/70">
                      <Check className="w-4 h-4 text-blue-400 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>

                <Button onClick={onSelectPlan} className="w-full h-14 rounded-2xl text-base font-bold bg-blue-600/90 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300">
                  Contratar Simples
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* IR COMPLETO */}
          <motion.div variants={fadeScale}>
            <div className="group h-full rounded-[2rem] bg-card/20 backdrop-blur-sm border-2 border-purple-500/25 hover:border-purple-500/40 transition-all duration-500 p-8 md:p-10 relative overflow-hidden">
              {/* Glow */}
              <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-purple-500/10 blur-[80px] group-hover:bg-purple-500/15 transition-all duration-700" />
              <div className="absolute -bottom-32 -left-32 w-48 h-48 rounded-full bg-violet-500/8 blur-[60px]" />

              {/* Popular badge */}
              <div className="absolute top-6 right-6">
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-purple-600/30">
                  <Crown className="w-3 h-3" />
                  Mais popular
                </div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <FileSpreadsheet className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-foreground">IR Completo</h3>
                    <p className="text-sm text-muted-foreground/50">Investimentos, aluguéis, múltiplas fontes</p>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl md:text-6xl font-black text-foreground tracking-tight">
                      {formatPrice(SUBSCRIBER_DISCOUNTS.ir_completo.basePrice)}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground/40">pagamento único</span>
                </div>

                <div className="space-y-3.5 mb-10">
                  {[
                    { text: 'Tudo do Simples +', highlight: true },
                    { text: 'Múltiplas fontes de renda' },
                    { text: 'Investimentos (ações, FIIs, cripto)' },
                    { text: 'Renda de aluguéis e exterior' },
                    { text: 'Checklist fiscal avançado' },
                    { text: 'Otimização máxima de restituição' },
                    { text: 'Contador revisa e envia à Receita', special: true },
                  ].map((f, i) => (
                    <div key={i} className={`flex items-center gap-3 text-sm ${f.special ? 'text-emerald-400 font-semibold' : 'text-muted-foreground/70'}`}>
                      <Check className={`w-4 h-4 shrink-0 ${f.special ? 'text-emerald-400' : f.highlight ? 'text-blue-400' : 'text-purple-400'}`} />
                      {f.text}
                    </div>
                  ))}
                </div>

                <Button onClick={onSelectPlan} className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all duration-300">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Contratar Completo
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Guarantee */}
        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={fadeUp} className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-sm text-emerald-400/80">
            <Shield className="w-4 h-4" />
            <span>Garantia de satisfação • Reembolso em até 7 dias</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════ TECH — Premium Bento ═══════ */
function TechSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const features = [
    { icon: ScanLine, title: 'Visão Computacional', desc: 'Gemini 2.5 lê PDFs e imagens com OCR nativo. Extrai CNPJ, rendimentos, IRRF e deduções automaticamente.', accent: 'from-purple-500 to-violet-500', span: 'md:col-span-2' },
    { icon: TrendingUp, title: 'Cálculo Dual', desc: 'Compara Simples e Completo. Recomenda o que paga menos.', accent: 'from-emerald-500 to-teal-500' },
    { icon: AlertTriangle, title: 'Detector Malha Fina', desc: 'Identifica inconsistências antes da Receita.', accent: 'from-amber-500 to-orange-500' },
    { icon: Shield, title: 'Travas Legais', desc: 'Tetos atualizados: simplificado, educação, PGBL, dependente.', accent: 'from-blue-500 to-cyan-500' },
    { icon: Eye, title: 'Score de Confiança', desc: 'Cada documento recebe nota. <70% = revisão manual.', accent: 'from-cyan-500 to-blue-500' },
    { icon: Clock, title: 'Minutos, não dias', desc: 'Resultado completo enquanto contadores levam dias.', accent: 'from-rose-500 to-pink-500', span: 'md:col-span-2' },
  ];

  return (
    <section className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="text-center mb-16">
          <motion.div variants={fadeUp}>
            <Badge className="mb-5 bg-violet-500/10 text-violet-300 border-violet-500/20 backdrop-blur-sm px-5 py-2">
              <Cpu className="w-4 h-4 mr-2" /> Tecnologia
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-black text-foreground tracking-tight">
            Engenharia de <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">precisão fiscal</span>
          </motion.h2>
        </motion.div>

        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <motion.div key={i} variants={fadeScale} className={f.span || ''}>
              <div className="group h-full rounded-3xl bg-card/15 backdrop-blur-sm border border-white/[0.05] hover:border-purple-500/15 p-7 transition-all duration-500 hover:bg-card/30 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${f.accent} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground/60 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════ TESTIMONIALS ═══════ */
function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const testimonials = [
    { name: 'Ana C.', role: 'CLT • São Paulo', text: 'Fiz em 3 minutos o que o contador levava 2 semanas. E ainda descobri que tinha mais restituição.', rating: 5 },
    { name: 'Ricardo M.', role: 'Investidor • Curitiba', text: 'Tinha medo de declarar ações e FIIs. A IA calculou tudo certinho, até o dedo-duro.', rating: 5 },
    { name: 'Juliana S.', role: 'Autônoma • BH', text: 'Melhor custo-benefício. R$ 89 e em 5 minutos já tinha o resultado completo. Incrível.', rating: 5 },
  ];

  return (
    <section className="py-24 md:py-32 relative" ref={ref}>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="text-center mb-16">
          <motion.div variants={fadeUp}>
            <Badge className="mb-5 bg-amber-500/10 text-amber-300 border-amber-500/20 backdrop-blur-sm px-5 py-2">
              <Star className="w-4 h-4 mr-2" /> Depoimentos
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-black text-foreground tracking-tight">
            Quem usou, aprovou
          </motion.h2>
        </motion.div>

        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div key={i} variants={fadeUp}>
              <div className="h-full rounded-3xl bg-card/15 backdrop-blur-sm border border-white/[0.05] p-7 hover:border-purple-500/15 transition-all duration-300">
                <div className="flex gap-0.5 mb-5">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground/50">{t.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════ FAQ ═══════ */
function FAQSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const faqs = [
    { q: 'Preciso de contador para enviar?', a: 'IR Simples: a IA faz toda análise e você envia pelo programa da Receita. IR Completo: contador credenciado revisa e transmite.' },
    { q: 'Quais documentos aceita?', a: 'Informes de rendimentos, recibos médicos, educação, notas de corretagem, DARFs. PDF, JPG, PNG e WEBP até 10MB.' },
    { q: 'A IA é precisa?', a: '97% de precisão com índice de confiança por documento. Motor fiscal com travas legais e detecção de malha fina.' },
    { q: 'Quanto tempo demora?', a: 'A análise leva minutos. Resultado completo em menos de 10 minutos após upload.' },
    { q: 'Tenho investimentos e cripto?', a: 'Escolha IR Completo. A IA trata ações, FIIs, cripto, aluguéis e renda do exterior.' },
    { q: 'Dados seguros?', a: 'Criptografia AES-256, isolamento por usuário (RLS), expiração automática de documentos. LGPD compliant.' },
  ];

  return (
    <section className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4 max-w-3xl" ref={ref}>
        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="text-center mb-14">
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
            Dúvidas frequentes
          </motion.h2>
        </motion.div>

        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.details key={i} variants={fadeUp} className="group">
              <summary className="flex items-center justify-between cursor-pointer p-5 rounded-2xl bg-card/15 backdrop-blur-sm border border-white/[0.05] hover:border-purple-500/15 hover:bg-card/30 transition-all duration-300 list-none">
                <span className="font-semibold text-foreground pr-4">{faq.q}</span>
                <ChevronDown className="w-5 h-5 text-muted-foreground/30 shrink-0 group-open:rotate-180 transition-transform duration-300" />
              </summary>
              <div className="px-5 pb-5 pt-3">
                <p className="text-sm text-muted-foreground/60 leading-relaxed">{faq.a}</p>
              </div>
            </motion.details>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════ CTA FINAL ═══════ */
function CTASection({ onAction }: { onAction: () => void }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-24 md:py-32 relative" ref={ref}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_50%,hsl(270_50%_20%/0.25),transparent_70%)]" />
      <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
        <motion.div variants={fadeUp} className="relative rounded-[2.5rem] overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/15 via-card/30 to-violet-600/15 backdrop-blur-sm" />
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />

          <div className="relative z-10 border border-purple-500/15 rounded-[2.5rem] p-10 md:p-16">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-600/30">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
              Não deixe para <br className="hidden sm:block" />a última hora
            </h2>
            <p className="text-muted-foreground/60 mb-10 max-w-lg mx-auto text-lg">
              Declare agora e receba sua restituição nos primeiros lotes.
            </p>
            <Button
              onClick={onAction}
              className="h-16 px-12 rounded-2xl text-lg font-black bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-[0_0_60px_-10px_hsl(270_60%_50%/0.6)] hover:shadow-[0_0_80px_-10px_hsl(270_60%_50%/0.8)] hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Começar minha declaração
            </Button>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground/40">
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> LGPD compliant</span>
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> AES-256</span>
              <span className="flex items-center gap-1.5"><Headphones className="w-3.5 h-3.5" /> Suporte humano</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default IRPage;
