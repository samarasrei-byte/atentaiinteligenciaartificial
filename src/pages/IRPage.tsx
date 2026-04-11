import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { IRRequestForm } from '@/components/ir/IRRequestForm';
import { Button } from '@/components/ui/button';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  FileText, FileSpreadsheet, Brain, Upload, Shield, Zap,
  CheckCircle2, Clock, TrendingUp, AlertTriangle, Star,
  ArrowRight, Sparkles, Eye, BarChart3, Lock,
  ChevronDown, Award, Cpu, ScanLine,
  Users, Timer, ArrowDown, Crown, Rocket,
  Check, Headphones,
} from 'lucide-react';
import { formatPrice, SUBSCRIBER_DISCOUNTS } from '@/lib/plans';

/* ═══════ Smooth Animations ═══════ */
const ease = [0.25, 0.1, 0, 1] as const;
const fadeIn = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease } },
};
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

/* ═══════ Counter Hook ═══════ */
function useCounter(target: number, inView: boolean, duration = 2000) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  React.useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setCount(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);
  return count;
}

const IRPage = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);

  // Force dark mode on this page
  useEffect(() => {
    const html = document.documentElement;
    const hadDark = html.classList.contains('dark');
    html.classList.add('dark');
    return () => { if (!hadDark) html.classList.remove('dark'); };
  }, []);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const scrollToSection = (section: string) => {
    if (section === 'form') { formRef.current?.scrollIntoView({ behavior: 'smooth' }); return; }
    navigate('/');
  };
  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden antialiased">
      <Header onNavigate={scrollToSection} />

      {/* ═══════ HERO ═══════ */}
      <section ref={heroRef} className="relative min-h-[100svh] flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(180deg, hsl(240 10% 4%) 0%, hsl(240 10% 8%) 50%, hsl(260 20% 12%) 100%)' }}>
        {/* Deep ambient glows */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full blur-[180px]" style={{ background: 'radial-gradient(ellipse, hsl(var(--primary) / 0.15), transparent 70%)' }} />
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] rounded-full blur-[140px]" style={{ background: 'radial-gradient(ellipse, hsl(265 80% 60% / 0.08), transparent 70%)' }} />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: 'radial-gradient(ellipse, hsl(var(--info) / 0.06), transparent 70%)' }} />
        </div>
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container mx-auto px-6 relative z-10 pt-24">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center max-w-4xl mx-auto">
            {/* Urgency pill */}
            <motion.div variants={fadeIn} className="flex justify-center mb-10">
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.06] backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
                <span className="text-sm font-semibold text-white/80">Exercício 2026 — Ano-Base 2025</span>
              </div>
            </motion.div>

            {/* Headline — Apple-style */}
            <motion.h1 variants={fadeIn} className="text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold tracking-[-0.035em] leading-[0.95] text-white">
              Sua declaração de IR
              <br />
              <span className="bg-clip-text text-transparent" style={{
                backgroundImage: 'linear-gradient(135deg, hsl(265 90% 70%), hsl(250 100% 75%), hsl(280 80% 65%))'
              }}>
                feita por Inteligência Artificial
              </span>
            </motion.h1>

            <motion.p variants={fadeIn} className="mt-7 text-lg md:text-xl text-white/60 max-w-xl mx-auto leading-relaxed font-light">
              Envie seus documentos. A IA extrai, calcula, compara modelos e entrega seu resultado com restituição maximizada
              <span className="block mt-1 text-white/80 font-medium">— em minutos, não em dias.</span>
            </motion.p>

            {/* CTA */}
            <motion.div variants={fadeIn} className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={scrollToForm}
                size="lg"
                className="h-14 px-10 rounded-full text-base font-semibold hover:-translate-y-0.5 transition-all duration-300 text-white" style={{
                  background: 'linear-gradient(135deg, hsl(265 80% 60%), hsl(250 90% 65%))',
                  boxShadow: '0 0 40px hsl(265 80% 60% / 0.3), 0 4px 20px hsl(265 80% 60% / 0.2)',
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Fazer minha declaração
              </Button>
              <button
                onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/15 bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] transition-all text-sm font-medium backdrop-blur-sm"
              >
                Como funciona
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </motion.div>

            {/* Trust bar */}
            <motion.div variants={fadeIn} className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-white/50">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-green-400" />
                LGPD compliant
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Resultado em minutos
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-primary" />
                97% de precisão
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-white/40" />
                Dados criptografados
              </span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll dot */}
        <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2" animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-white/30" />
          </div>
        </motion.div>
      </section>

      {/* ═══════ METRICS ═══════ */}
      <MetricsBar />

      {/* ═══════ STEPS ═══════ */}
      <StepsSection />

      {/* ═══════ PLANS ═══════ */}
      <PlansSection onSelectPlan={scrollToForm} />

      {/* ═══════ TECH ═══════ */}
      <TechSection />

      {/* ═══════ TESTIMONIALS ═══════ */}
      <TestimonialsSection />

      {/* ═══════ FAQ ═══════ */}
      <FAQSection />

      {/* ═══════ CTA FINAL ═══════ */}
      <FinalCTA onAction={scrollToForm} />

      {/* ═══════ FORM ═══════ */}
      <section ref={formRef} className="py-20 md:py-28 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/[0.04] rounded-full blur-[120px]" />
        <div className="container mx-auto px-6 max-w-3xl relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-success mb-4">
              <CheckCircle2 className="w-4 h-4" />
              Formulário seguro
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
              Comece sua declaração
            </h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto">
              Dados protegidos com criptografia end-to-end.
            </p>
          </div>
          <IRRequestForm onSuccess={() => navigate('/empresa?tab=ir-declaracao')} />
        </div>
      </section>

      <Footer onNavigate={scrollToSection} />
    </div>
  );
};

/* ═══════ METRICS BAR ═══════ */
function MetricsBar() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });
  const declarations = useCounter(2437, inView);
  const accuracy = useCounter(97, inView, 1500);
  const avgTime = useCounter(4, inView, 1000);
  const saved = useCounter(847, inView, 1800);

  const items = [
    { value: declarations.toLocaleString('pt-BR'), suffix: '+', label: 'Declarações', icon: FileText },
    { value: `${accuracy}`, suffix: '%', label: 'Precisão IA', icon: Brain },
    { value: `${avgTime}`, suffix: 'min', label: 'Tempo médio', icon: Timer },
    { value: `R$${saved}`, suffix: '', label: 'Economia média', icon: TrendingUp },
  ];

  return (
    <section ref={ref} className="py-10 border-y border-border/30">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {items.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1, duration: 0.5 }} className="text-center">
              <m.icon className="w-4 h-4 text-muted-foreground/40 mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                {m.value}<span className="text-sm font-medium text-muted-foreground">{m.suffix}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1 tracking-wide">{m.label}</div>
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
    { n: '01', title: 'Contrate online', desc: 'Escolha Simples ou Completo. Pague via Pix ou cartão.', icon: Zap },
    { n: '02', title: 'Envie documentos', desc: 'Upload de informes, recibos médicos e educação.', icon: Upload },
    { n: '03', title: 'IA analisa tudo', desc: 'Visão computacional extrai dados e compara regimes.', icon: ScanLine },
    { n: '04', title: 'Checklist fiscal', desc: 'Dependentes, bens e previdência. IA ajusta os cálculos.', icon: CheckCircle2 },
    { n: '05', title: 'Resultado completo', desc: 'Restituição estimada, risco de malha fina e otimização.', icon: BarChart3 },
    { n: '06', title: 'Envio à Receita', desc: 'Simples: você envia. Completo: contador revisa e transmite.', icon: Award },
  ];

  return (
    <section id="como-funciona" className="py-24 md:py-36">
      <div className="container mx-auto px-6" ref={ref}>
        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="text-center mb-20">
          <motion.p variants={fadeIn} className="text-sm font-semibold text-primary uppercase tracking-[0.15em] mb-4">100% Digital</motion.p>
          <motion.h2 variants={fadeIn} className="text-4xl md:text-[3.5rem] font-extrabold text-foreground tracking-tight leading-[1.1]">
            6 etapas. Zero burocracia.
          </motion.h2>
          <motion.p variants={fadeIn} className="text-muted-foreground mt-4 max-w-md mx-auto text-lg font-light">
            Do pagamento ao resultado, tudo automatizado.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((s) => (
            <motion.div key={s.n} variants={fadeIn}>
              <div className="group h-full rounded-2xl bg-card/50 border border-border/50 hover:border-primary/20 p-6 transition-all duration-300 hover:shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <s.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                    Etapa {s.n}
                  </span>
                </div>
                <h3 className="font-bold text-foreground text-lg mb-1.5">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
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
    <section className="py-24 md:py-36 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/[0.03] rounded-full blur-[160px]" />
      <div className="container mx-auto px-6 relative z-10" ref={ref}>
        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="text-center mb-16">
          <motion.p variants={fadeIn} className="text-sm font-semibold text-primary uppercase tracking-[0.15em] mb-4">Planos</motion.p>
          <motion.h2 variants={fadeIn} className="text-4xl md:text-[3.5rem] font-extrabold text-foreground tracking-tight leading-[1.1]">
            Escolha seu plano
          </motion.h2>
          <motion.p variants={fadeIn} className="text-muted-foreground mt-4 max-w-md mx-auto text-lg font-light">
            Simples para CLT. Completo para investidores.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* IR SIMPLES */}
          <motion.div variants={scaleIn}>
            <div className="h-full rounded-2xl bg-card border border-border/60 p-8 md:p-10 transition-all duration-300 hover:shadow-[var(--shadow-medium)] hover:border-border">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-info" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">IR Simples</h3>
                  <p className="text-sm text-muted-foreground">CLT com poucos rendimentos</p>
                </div>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-extrabold text-foreground tracking-tight">
                  {formatPrice(SUBSCRIBER_DISCOUNTS.ir_simples.basePrice)}
                </span>
                <span className="text-sm text-muted-foreground ml-2">pagamento único</span>
              </div>

              <div className="space-y-3 mb-10">
                {[
                  'Análise 100% por Inteligência Artificial',
                  '1 fonte de renda (CLT)',
                  'Deduções básicas (saúde, educação)',
                  'Comparação Simples vs Completo',
                  'Detector de Malha Fina',
                  'Resultado por email',
                  'Você envia à Receita',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-success shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              <Button onClick={onSelectPlan} variant="outline" className="w-full h-12 rounded-xl text-base font-semibold border-border hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all duration-300">
                Contratar Simples
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* IR COMPLETO */}
          <motion.div variants={scaleIn}>
            <div className="h-full rounded-2xl bg-card border-2 border-primary/30 p-8 md:p-10 relative transition-all duration-300 hover:shadow-[var(--shadow-glow)] overflow-hidden">
              {/* Subtle top accent */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

              {/* Popular badge */}
              <div className="absolute top-6 right-6">
                <div className="flex items-center gap-1.5 bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  <Crown className="w-3 h-3" />
                  Popular
                </div>
              </div>

              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">IR Completo</h3>
                  <p className="text-sm text-muted-foreground">Investimentos, múltiplas fontes</p>
                </div>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-extrabold text-foreground tracking-tight">
                  {formatPrice(SUBSCRIBER_DISCOUNTS.ir_completo.basePrice)}
                </span>
                <span className="text-sm text-muted-foreground ml-2">pagamento único</span>
              </div>

              <div className="space-y-3 mb-10">
                {[
                  { text: 'Tudo do Simples +', highlight: true },
                  { text: 'Múltiplas fontes de renda' },
                  { text: 'Investimentos (ações, FIIs, cripto)' },
                  { text: 'Renda de aluguéis e exterior' },
                  { text: 'Checklist fiscal avançado' },
                  { text: 'Otimização máxima de restituição' },
                  { text: 'Contador revisa e envia à Receita', special: true },
                ].map((f, i) => (
                  <div key={i} className={`flex items-center gap-3 text-sm ${f.special ? 'text-success font-medium' : 'text-muted-foreground'}`}>
                    <Check className={`w-4 h-4 shrink-0 ${f.special ? 'text-success' : f.highlight ? 'text-info' : 'text-primary'}`} />
                    {f.text}
                  </div>
                ))}
              </div>

              <Button onClick={onSelectPlan} className="w-full h-12 rounded-xl text-base font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-[var(--shadow-glow)] transition-all duration-300">
                <Sparkles className="w-4 h-4 mr-2" />
                Contratar Completo
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Guarantee */}
        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={fadeIn} className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-success" />
            Garantia de satisfação • Reembolso em até 7 dias
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════ TECH ═══════ */
function TechSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const features = [
    { icon: ScanLine, title: 'Visão Computacional', desc: 'IA avançada lê PDFs e imagens com OCR nativo. Extrai rendimentos e deduções automaticamente.', wide: true },
    { icon: TrendingUp, title: 'Cálculo Dual', desc: 'Compara Simples e Completo. Recomenda o que paga menos.' },
    { icon: AlertTriangle, title: 'Detector Malha Fina', desc: 'Identifica inconsistências antes da Receita Federal.' },
    { icon: Shield, title: 'Travas Legais', desc: 'Tetos atualizados: simplificado, educação, PGBL, dependente.' },
    { icon: Eye, title: 'Score de Confiança', desc: 'Cada documento recebe nota. Abaixo de 70% = revisão manual.' },
    { icon: Clock, title: 'Minutos, não dias', desc: 'Resultado completo enquanto contadores levam semanas.', wide: true },
  ];

  return (
    <section className="py-24 md:py-36">
      <div className="container mx-auto px-6" ref={ref}>
        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="text-center mb-16">
          <motion.p variants={fadeIn} className="text-sm font-semibold text-primary uppercase tracking-[0.15em] mb-4">Tecnologia</motion.p>
          <motion.h2 variants={fadeIn} className="text-4xl md:text-[3.5rem] font-extrabold text-foreground tracking-tight leading-[1.1]">
            Engenharia de precisão fiscal
          </motion.h2>
        </motion.div>

        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <motion.div key={i} variants={scaleIn} className={f.wide ? 'md:col-span-2' : ''}>
              <div className="group h-full rounded-2xl bg-card/50 border border-border/50 hover:border-primary/20 p-6 transition-all duration-300 hover:shadow-[var(--shadow-soft)]">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-base mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
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
    { name: 'Ana C.', role: 'CLT • São Paulo', text: 'Fiz em 3 minutos o que o contador levava 2 semanas. E ainda descobri que tinha mais restituição.' },
    { name: 'Ricardo M.', role: 'Investidor • Curitiba', text: 'Tinha medo de declarar ações e FIIs. A IA calculou tudo certinho, até o dedo-duro.' },
    { name: 'Juliana S.', role: 'Autônoma • BH', text: 'Melhor custo-benefício. R$ 89 e em 5 minutos já tinha o resultado completo.' },
  ];

  return (
    <section className="py-24 md:py-36" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="text-center mb-16">
          <motion.p variants={fadeIn} className="text-sm font-semibold text-accent uppercase tracking-[0.15em] mb-4">Depoimentos</motion.p>
          <motion.h2 variants={fadeIn} className="text-4xl md:text-[3.5rem] font-extrabold text-foreground tracking-tight leading-[1.1]">
            Quem usou, aprovou
          </motion.h2>
        </motion.div>

        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div key={i} variants={fadeIn}>
              <div className="h-full rounded-2xl bg-card/50 border border-border/50 p-6 hover:border-border transition-colors duration-300">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-accent text-accent" />)}
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
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
    { q: 'Dados seguros?', a: 'Criptografia AES-256, isolamento por usuário, expiração automática de documentos. LGPD compliant.' },
  ];

  return (
    <section className="py-24 md:py-36">
      <div className="container mx-auto px-6 max-w-2xl" ref={ref}>
        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="text-center mb-14">
          <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Dúvidas frequentes
          </motion.h2>
        </motion.div>

        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.details key={i} variants={fadeIn} className="group">
              <summary className="flex items-center justify-between cursor-pointer p-5 rounded-xl bg-card/50 border border-border/50 hover:border-border transition-colors duration-200 list-none">
                <span className="font-medium text-foreground pr-4 text-[15px]">{faq.q}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 group-open:rotate-180 transition-transform duration-200" />
              </summary>
              <div className="px-5 pb-5 pt-2">
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            </motion.details>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════ FINAL CTA ═══════ */
function FinalCTA({ onAction }: { onAction: () => void }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-24 md:py-36" ref={ref}>
      <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={fadeIn} className="container mx-auto px-6 max-w-2xl text-center">
        <div className="rounded-3xl bg-card border border-border/60 p-10 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/[0.03] rounded-full blur-[100px]" />

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3 tracking-tight">
              Não deixe para última hora
            </h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto">
              Declare agora e receba sua restituição nos primeiros lotes.
            </p>
            <Button
              onClick={onAction}
              size="lg"
              className="h-14 px-10 rounded-full text-base font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-[var(--shadow-glow)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Começar minha declaração
            </Button>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> LGPD</span>
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> AES-256</span>
              <span className="flex items-center gap-1.5"><Headphones className="w-3.5 h-3.5" /> Suporte humano</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default IRPage;
