import React, { useRef } from 'react';
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
  ChevronDown, Award, Mail, Play, Cpu, ScanLine,
} from 'lucide-react';
import { formatPrice, SUBSCRIBER_DISCOUNTS } from '@/lib/plans';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};
const fadeScale = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const IRPage = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const scrollToSection = (section: string) => {
    if (section === 'form') { formRef.current?.scrollIntoView({ behavior: 'smooth' }); return; }
    navigate('/');
  };
  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header onNavigate={scrollToSection} />

      {/* ═══════ HERO — Cinematic ═══════ */}
      <section ref={heroRef} className="relative pt-28 pb-24 md:pt-40 md:pb-36 overflow-hidden">
        {/* Layered background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,hsl(270_60%_18%/0.6),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_80%_30%,hsl(240_70%_20%/0.3),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_60%,hsl(200_70%_25%/0.2),transparent_60%)]" />
        {/* Animated grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        {/* Floating orb */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(270 60% 50% / 0.08) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container mx-auto px-4 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center max-w-5xl mx-auto">
            <motion.div variants={fadeUp}>
              <Badge className="mb-8 bg-purple-500/10 text-purple-300 border-purple-500/20 px-5 py-2 text-sm font-medium backdrop-blur-sm">
                <Cpu className="w-4 h-4 mr-2 animate-pulse" />
                Exercício {new Date().getFullYear()} — Powered by Gemini AI
              </Badge>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]">
              <span className="text-foreground">Declare seu IR</span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-blue-400 bg-clip-text text-transparent">
                com IA em minutos
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-8 text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed font-light">
              Upload. Análise. Resultado. A inteligência artificial extrai seus dados,
              calcula impostos e maximiza sua restituição automaticamente.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={scrollToForm}
                className="group relative h-14 px-10 rounded-full text-lg font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 bg-[length:200%_100%] hover:bg-[position:right_center] transition-all duration-500 shadow-[0_0_40px_-8px_hsl(270_60%_50%/0.5)] hover:shadow-[0_0_60px_-8px_hsl(270_60%_50%/0.7)] hover:-translate-y-0.5 text-white"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Começar declaração
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                className="h-14 px-8 rounded-full text-lg text-muted-foreground hover:text-foreground border border-border/30 hover:border-border/60 backdrop-blur-sm"
              >
                Como funciona
                <ChevronDown className="w-4 h-4 ml-2 animate-bounce" />
              </Button>
            </motion.div>

            {/* Metrics strip */}
            <motion.div variants={fadeUp} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { value: '97%', label: 'Precisão IA', icon: Brain, color: 'text-purple-400' },
                { value: '<5min', label: 'Resultado', icon: Zap, color: 'text-amber-400' },
                { value: 'LGPD', label: 'Compliant', icon: Shield, color: 'text-emerald-400' },
                { value: 'AES-256', label: 'Criptografia', icon: Lock, color: 'text-blue-400' },
              ].map((m, i) => (
                <div key={i} className="group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
                  <m.icon className={`w-5 h-5 ${m.color} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                  <div className="text-xl font-black text-foreground">{m.value}</div>
                  <div className="text-xs text-muted-foreground/60 mt-0.5">{m.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════ PROCESS — Timeline ═══════ */}
      <StepsSection />

      {/* ═══════ PLANS — Side by side ═══════ */}
      <PlansSection onSelectPlan={scrollToForm} />

      {/* ═══════ TECH — Bento grid ═══════ */}
      <FeaturesSection />

      {/* ═══════ FAQ ═══════ */}
      <FAQSection />

      {/* ═══════ CTA FINAL ═══════ */}
      <CTASection onAction={scrollToForm} />

      {/* ═══════ FORM ═══════ */}
      <section ref={formRef} className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,hsl(270_50%_15%/0.15),transparent_60%)]" />
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 backdrop-blur-sm">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Comece agora
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-foreground">
              Preencha e contrate
            </h2>
            <p className="text-muted-foreground/70 mt-3 max-w-lg mx-auto">
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

/* ═══════ STEPS ═══════ */
function StepsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const steps = [
    { step: 1, title: 'Contrate online', desc: 'Escolha Simples ou Completo, preencha dados e pague via Pix ou cartão.', icon: Play, accent: 'from-blue-500 to-cyan-500' },
    { step: 2, title: 'Envie documentos', desc: 'Upload de informes, recibos médicos e educação — PDF, JPG ou PNG.', icon: Upload, accent: 'from-purple-500 to-violet-500' },
    { step: 3, title: 'IA analisa tudo', desc: 'Visão computacional extrai dados e compara Simples vs Completo.', icon: ScanLine, accent: 'from-violet-500 to-fuchsia-500' },
    { step: 4, title: 'Checklist fiscal', desc: 'Responda sobre dependentes, bens e previdência — IA ajusta cálculos.', icon: CheckCircle2, accent: 'from-emerald-500 to-teal-500' },
    { step: 5, title: 'Resultado completo', desc: 'Restituição estimada, risco de malha fina e dicas de otimização.', icon: BarChart3, accent: 'from-amber-500 to-orange-500' },
    { step: 6, title: 'Envio à Receita', desc: 'Simples: você envia. Completo: contador revisa e transmite.', icon: Mail, accent: 'from-cyan-500 to-blue-500' },
  ];

  return (
    <section id="como-funciona" className="py-20 md:py-28 relative">
      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="text-center mb-16">
          <motion.div variants={fadeUp}>
            <Badge className="mb-4 bg-purple-500/10 text-purple-300 border-purple-500/20 backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5 mr-1.5" /> 100% Digital
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-black text-foreground">
            6 etapas. Zero burocracia.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground/70 mt-4 max-w-lg mx-auto">
            Do pagamento ao resultado — tudo automatizado por IA
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="max-w-5xl mx-auto">
          {/* Desktop: 2-column alternating */}
          <div className="hidden md:grid grid-cols-2 gap-x-16 gap-y-8 relative">
            {/* Center line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-purple-500/20 to-transparent" />
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                variants={fadeUp}
                className={`relative ${i % 2 === 1 ? 'col-start-2' : 'col-start-1 text-right'}`}
              >
                {/* Connector dot */}
                <div className={`absolute top-6 ${i % 2 === 0 ? '-right-[2.55rem]' : '-left-[2.55rem]'} w-4 h-4 rounded-full bg-gradient-to-r ${s.accent} shadow-lg`} />
                
                <div className={`group p-6 rounded-3xl bg-card/30 backdrop-blur-sm border border-border/30 hover:border-purple-500/20 hover:bg-card/50 transition-all duration-500 ${i % 2 === 0 ? 'mr-4' : 'ml-4'}`}>
                  <div className={`flex items-center gap-3 mb-3 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                    {i % 2 === 1 && (
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${s.accent} flex items-center justify-center shadow-lg`}>
                        <s.icon className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <span className="text-xs font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                      {String(s.step).padStart(2, '0')}
                    </span>
                    {i % 2 === 0 && (
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${s.accent} flex items-center justify-center shadow-lg`}>
                        <s.icon className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-1.5">{s.title}</h3>
                  <p className="text-sm text-muted-foreground/70 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Mobile: vertical timeline */}
          <div className="md:hidden space-y-4">
            {steps.map((s) => (
              <motion.div key={s.step} variants={fadeUp} className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${s.accent} flex items-center justify-center shadow-lg shrink-0`}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-px h-full bg-border/20 mt-2" />
                </div>
                <div className="pb-6">
                  <span className="text-xs font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Etapa {s.step}</span>
                  <h3 className="font-bold text-foreground text-lg mt-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground/70 leading-relaxed mt-1">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
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
    <section className="py-20 md:py-28 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_50%,hsl(270_50%_15%/0.12),transparent_70%)]" />
      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="text-center mb-16">
          <motion.div variants={fadeUp}>
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 backdrop-blur-sm">
              <Award className="w-3.5 h-3.5 mr-1.5" /> Planos
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-black text-foreground">
            Escolha como declarar
          </motion.h2>
        </motion.div>

        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* IR SIMPLES */}
          <motion.div variants={fadeScale}>
            <div className="group h-full rounded-[2rem] bg-card/30 backdrop-blur-sm border border-border/30 hover:border-blue-500/30 transition-all duration-500 p-8 md:p-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-foreground">IR Simples</h3>
                    <p className="text-sm text-muted-foreground/60">CLT com poucos rendimentos</p>
                  </div>
                </div>

                <div className="mb-8 flex items-baseline gap-2">
                  <span className="text-5xl font-black text-foreground tracking-tight">
                    {formatPrice(SUBSCRIBER_DISCOUNTS.ir_simples.basePrice)}
                  </span>
                  <span className="text-muted-foreground/50 text-sm">único</span>
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
                    <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground/80">
                      <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      {f}
                    </div>
                  ))}
                </div>

                <Button onClick={onSelectPlan} className="w-full h-13 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all">
                  Contratar Simples
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* IR COMPLETO */}
          <motion.div variants={fadeScale}>
            <div className="group h-full rounded-[2rem] bg-card/30 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all duration-500 p-8 md:p-10 relative overflow-hidden ring-1 ring-purple-500/10">
              {/* Glow effect */}
              <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-purple-500/10 blur-[80px] group-hover:bg-purple-500/15 transition-all duration-700" />
              {/* Popular ribbon */}
              <div className="absolute top-6 right-6">
                <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-purple-600/30">
                  Popular
                </div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <FileSpreadsheet className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-foreground">IR Completo</h3>
                    <p className="text-sm text-muted-foreground/60">Investimentos, aluguéis, múltiplas fontes</p>
                  </div>
                </div>

                <div className="mb-8 flex items-baseline gap-2">
                  <span className="text-5xl font-black text-foreground tracking-tight">
                    {formatPrice(SUBSCRIBER_DISCOUNTS.ir_completo.basePrice)}
                  </span>
                  <span className="text-muted-foreground/50 text-sm">único</span>
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
                    <div key={i} className={`flex items-center gap-3 text-sm ${f.special ? 'text-emerald-400 font-semibold' : 'text-muted-foreground/80'}`}>
                      <div className={`w-5 h-5 rounded-full ${f.highlight ? 'bg-blue-500/10' : 'bg-purple-500/10'} flex items-center justify-center shrink-0`}>
                        <CheckCircle2 className={`w-3.5 h-3.5 ${f.highlight ? 'text-blue-400' : f.special ? 'text-emerald-400' : 'text-purple-400'}`} />
                      </div>
                      {f.text}
                    </div>
                  ))}
                </div>

                <Button onClick={onSelectPlan} className="w-full h-13 rounded-2xl text-base font-bold bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Contratar Completo
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════ FEATURES — Bento Grid ═══════ */
function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const features = [
    { icon: ScanLine, title: 'Visão Computacional', desc: 'Gemini 2.5 lê PDFs e imagens com OCR nativo. Extrai CNPJ, rendimentos, IRRF e deduções.', accent: 'from-purple-500 to-violet-500', span: 'lg:col-span-2' },
    { icon: TrendingUp, title: 'Cálculo Dual', desc: 'Compara Simples e Completo simultaneamente. Recomenda o modelo que paga menos.', accent: 'from-emerald-500 to-teal-500', span: '' },
    { icon: AlertTriangle, title: 'Detector Malha Fina', desc: 'Deduções excessivas, inconsistências de IRRF, valores fora do padrão.', accent: 'from-amber-500 to-orange-500', span: '' },
    { icon: Shield, title: 'Travas Legais', desc: 'Teto simplificado R$ 16.754, educação R$ 3.561, PGBL 12%, dependente R$ 2.275.', accent: 'from-blue-500 to-cyan-500', span: '' },
    { icon: Eye, title: 'Índice de Confiança', desc: 'Cada documento recebe score. Abaixo de 70%, alerta para revisão manual.', accent: 'from-cyan-500 to-blue-500', span: '' },
    { icon: Clock, title: 'Minutos, não dias', desc: 'Enquanto contadores levam dias, a IA entrega em minutos com email automático.', accent: 'from-rose-500 to-pink-500', span: 'lg:col-span-2' },
  ];

  return (
    <section className="py-20 md:py-28 relative">
      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="text-center mb-16">
          <motion.div variants={fadeUp}>
            <Badge className="mb-4 bg-violet-500/10 text-violet-300 border-violet-500/20 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Tecnologia
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-black text-foreground">
            Engenharia de precisão fiscal
          </motion.h2>
        </motion.div>

        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <motion.div key={i} variants={fadeScale} className={f.span}>
              <div className="group h-full rounded-3xl bg-card/20 backdrop-blur-sm border border-border/20 hover:border-purple-500/20 p-6 md:p-8 transition-all duration-500 hover:bg-card/40 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${f.accent} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground/70 leading-relaxed">{f.desc}</p>
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
    <section className="py-20 md:py-28 relative">
      <div className="container mx-auto px-4 max-w-3xl" ref={ref}>
        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="text-center mb-14">
          <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-black text-foreground">
            Perguntas frequentes
          </motion.h2>
        </motion.div>

        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.details key={i} variants={fadeUp} className="group">
              <summary className="flex items-center justify-between cursor-pointer p-5 rounded-2xl bg-card/20 backdrop-blur-sm border border-border/20 hover:border-purple-500/15 hover:bg-card/40 transition-all duration-300 list-none">
                <span className="font-semibold text-foreground pr-4">{faq.q}</span>
                <ChevronDown className="w-5 h-5 text-muted-foreground/40 shrink-0 group-open:rotate-180 transition-transform duration-300" />
              </summary>
              <div className="px-5 pb-5 pt-2">
                <p className="text-sm text-muted-foreground/70 leading-relaxed">{faq.a}</p>
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
    <section className="py-20 md:py-28 relative" ref={ref}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_50%,hsl(270_50%_20%/0.2),transparent_70%)]" />
      <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
        <motion.div variants={fadeUp} className="bg-gradient-to-br from-purple-500/10 via-card/40 to-violet-500/10 backdrop-blur-sm border border-purple-500/15 rounded-[2.5rem] p-10 md:p-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-600/30">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
            Pronto para declarar sem estresse?
          </h2>
          <p className="text-muted-foreground/70 mb-8 max-w-lg mx-auto">
            Junte-se a milhares de brasileiros que já usam IA para declarar o Imposto de Renda com mais precisão e menos dor de cabeça.
          </p>
          <Button
            onClick={onAction}
            className="h-14 px-10 rounded-full text-lg font-bold bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-[0_0_40px_-8px_hsl(270_60%_50%/0.5)] hover:shadow-[0_0_60px_-8px_hsl(270_60%_50%/0.7)] hover:-translate-y-0.5 transition-all"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Começar agora
          </Button>
          <div className="mt-6 flex justify-center gap-6 text-xs text-muted-foreground/50">
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> LGPD</span>
            <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> AES-256</span>
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> 97% precisão</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default IRPage;
