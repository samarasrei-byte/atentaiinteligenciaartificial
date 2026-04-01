import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { IRRequestForm } from '@/components/ir/IRRequestForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, useInView } from 'framer-motion';
import {
  FileText, FileSpreadsheet, Brain, Upload, Shield, Zap,
  CheckCircle2, Clock, TrendingUp, AlertTriangle, Star,
  ArrowRight, Sparkles, Eye, BarChart3, Lock, Users,
  ChevronDown, Award, Target, Mail,
} from 'lucide-react';
import { formatPrice, SUBSCRIBER_DISCOUNTS } from '@/lib/plans';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0, 0, 0.2, 1] as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const IRPage = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (section: string) => {
    if (section === 'form') {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    navigate('/');
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header onNavigate={scrollToSection} />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/40 via-background to-background" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-purple-600/8 blur-[120px]" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-[100px]" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden" animate="visible" variants={stagger}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={fadeUp}>
              <Badge className="mb-6 bg-purple-500/15 text-purple-400 border-purple-500/25 px-4 py-1.5 text-sm">
                <Brain className="w-3.5 h-3.5 mr-1.5" />
                Exercício {new Date().getFullYear()} — Ano-Base {new Date().getFullYear() - 1}
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]"
            >
              <span className="text-foreground">Sua declaração de IR</span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
                feita por Inteligência Artificial
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Envie seus documentos. A IA extrai, calcula, compara modelos e entrega 
              seu resultado com restituição maximizada — em minutos, não em dias.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={scrollToForm}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 rounded-full h-14 px-10 text-lg font-semibold shadow-lg shadow-purple-600/25"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Fazer minha declaração
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full h-14 px-8 text-lg border-border/60 text-muted-foreground hover:text-foreground"
              >
                Como funciona
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>

            {/* Trust signals */}
            <motion.div variants={fadeUp} className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-400" /> LGPD compliant</span>
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-400" /> Resultado em minutos</span>
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-purple-400" /> 97% de precisão</span>
              <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-blue-400" /> Dados criptografados</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ COMO FUNCIONA ═══════════ */}
      <StepsSection />

      {/* ═══════════ PLANOS ═══════════ */}
      <PlansSection onSelectPlan={scrollToForm} />

      {/* ═══════════ DIFERENCIAIS ═══════════ */}
      <FeaturesSection />

      {/* ═══════════ FAQ RÁPIDO ═══════════ */}
      <FAQSection />

      {/* ═══════════ FORMULÁRIO ═══════════ */}
      <section ref={formRef} className="py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-950/10 to-background" />
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-emerald-500/15 text-emerald-400 border-emerald-500/25">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Comece agora
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Preencha e contrate
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              Seus dados ficam protegidos. Após o pagamento, acesse o Painel do Contador IA.
            </p>
          </div>

          <IRRequestForm onSuccess={() => navigate('/contador-ia')} />
        </div>
      </section>

      <Footer onNavigate={scrollToSection} />
    </div>
  );
};

/* ═══════════ STEPS SECTION ═══════════ */
function StepsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const steps = [
    {
      step: 1,
      title: 'Contrate online',
      desc: 'Escolha IR Simples ou Completo, preencha seus dados e faça o pagamento via Pix ou cartão.',
      icon: Target,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      step: 2,
      title: 'Envie documentos',
      desc: 'Faça upload dos informes de rendimentos, recibos médicos, educação — PDF, JPG ou PNG.',
      icon: Upload,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      step: 3,
      title: 'IA analisa tudo',
      desc: 'Nossa IA com visão computacional extrai dados, calcula impostos e compara Simples vs Completo.',
      icon: Brain,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
    },
    {
      step: 4,
      title: 'Checklist fiscal',
      desc: 'Responda perguntas sobre dependentes, bens, previdência — a IA ajusta cálculos automaticamente.',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      step: 5,
      title: 'Resultado completo',
      desc: 'Receba rendimentos, deduções, restituição estimada, risco de malha fina e dicas de otimização.',
      icon: BarChart3,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      step: 6,
      title: 'Envio à Receita',
      desc: 'IR Simples: você envia com o programa da Receita. IR Completo: contador revisa e envia por você.',
      icon: Mail,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
    },
  ];

  return (
    <section id="como-funciona" className="py-16 md:py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.div variants={fadeUp}>
            <Badge className="mb-4 bg-purple-500/15 text-purple-400 border-purple-500/25">
              <Zap className="w-3 h-3 mr-1" /> Processo 100% digital
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-foreground">
            Como funciona em 6 etapas
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Do pagamento ao resultado final — tudo automatizado por IA
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto"
        >
          {steps.map((s) => (
            <motion.div key={s.step} variants={fadeUp}>
              <Card className={`h-full bg-card/60 backdrop-blur-sm border ${s.border} hover:border-purple-500/30 transition-all group`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                      <s.icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">
                      Etapa {s.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════ PLANS SECTION ═══════════ */
function PlansSection({ onSelectPlan }: { onSelectPlan: () => void }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-16 md:py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-950/15 to-background" />
      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <motion.div
          initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger}
          className="text-center mb-14"
        >
          <motion.div variants={fadeUp}>
            <Badge className="mb-4 bg-emerald-500/15 text-emerald-400 border-emerald-500/25">
              <Award className="w-3 h-3 mr-1" /> Escolha seu plano
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-foreground">
            Dois planos, uma IA poderosa
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
        >
          {/* IR SIMPLES */}
          <motion.div variants={fadeUp}>
            <Card className="h-full bg-card/60 backdrop-blur-sm border-border hover:border-blue-500/30 transition-all relative overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">IR Simples</h3>
                    <p className="text-xs text-muted-foreground">Para CLT com poucos rendimentos</p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-foreground">
                    {formatPrice(SUBSCRIBER_DISCOUNTS.ir_simples.basePrice)}
                  </span>
                  <span className="text-muted-foreground text-sm ml-1">pagamento único</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    'Análise 100% por IA (Gemini)',
                    '1 fonte de renda (CLT)',
                    'Deduções básicas (saúde, educação)',
                    'Comparação Simples vs Completo',
                    'Risco de Malha Fina',
                    'Resultado por email',
                    'Você envia à Receita',
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button onClick={onSelectPlan} className="w-full rounded-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                  Contratar Simples
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* IR COMPLETO */}
          <motion.div variants={fadeUp}>
            <Card className="h-full bg-card/60 backdrop-blur-sm border-purple-500/30 hover:border-purple-500/50 transition-all relative overflow-hidden ring-1 ring-purple-500/20">
              {/* Popular badge */}
              <div className="absolute top-0 right-0">
                <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                  MAIS POPULAR
                </div>
              </div>
              <CardContent className="p-8 pt-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">IR Completo</h3>
                    <p className="text-xs text-muted-foreground">Investimentos, aluguéis, múltiplas fontes</p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-foreground">
                    {formatPrice(SUBSCRIBER_DISCOUNTS.ir_completo.basePrice)}
                  </span>
                  <span className="text-muted-foreground text-sm ml-1">pagamento único</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    'Tudo do Simples +',
                    'Múltiplas fontes de renda',
                    'Investimentos (ações, FIIs, cripto)',
                    'Renda de aluguéis',
                    'Renda do exterior',
                    'Checklist fiscal avançado',
                    'Contador revisa e envia à Receita',
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className={`w-4 h-4 ${i === 0 ? 'text-blue-400' : 'text-purple-400'} mt-0.5 shrink-0`} />
                      <span className={i === 6 ? 'text-emerald-400 font-medium' : ''}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button onClick={onSelectPlan} className="w-full rounded-full h-12 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-purple-600/25">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Contratar Completo
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════ FEATURES SECTION ═══════════ */
function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const features = [
    {
      icon: Brain,
      title: 'IA com Visão Computacional',
      desc: 'Gemini 2.5 Flash lê PDFs e imagens com OCR nativo. Extrai CNPJ, rendimentos, IRRF e deduções automaticamente.',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      icon: TrendingUp,
      title: 'Cálculo Dual Automático',
      desc: 'O motor fiscal calcula Simples e Completo simultaneamente e recomenda o modelo que paga menos imposto.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: AlertTriangle,
      title: 'Detector de Malha Fina',
      desc: 'Avaliação automática de risco: deduções médicas excessivas, inconsistências de IRRF, valores fora do padrão.',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      icon: Shield,
      title: 'Travas Legais Obrigatórias',
      desc: 'Teto do desconto simplificado (R$ 16.754), limite educação (R$ 3.561), PGBL (12%), dependente (R$ 2.275).',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      icon: Eye,
      title: 'Confiança Transparente',
      desc: 'Cada documento recebe um índice de confiança. Se abaixo de 70%, alerta para revisão manual.',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      icon: Clock,
      title: 'Resultado em Minutos',
      desc: 'Enquanto um contador leva dias, a IA entrega seu resumo fiscal completo em minutos — com email automático.',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
    },
  ];

  return (
    <section className="py-16 md:py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="text-center mb-14">
          <motion.div variants={fadeUp}>
            <Badge className="mb-4 bg-violet-500/15 text-violet-400 border-violet-500/25">
              <Sparkles className="w-3 h-3 mr-1" /> Tecnologia
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-foreground">
            Por que a IA é mais precisa
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto"
        >
          {features.map((f, i) => (
            <motion.div key={i} variants={fadeUp}>
              <Card className="h-full bg-card/40 backdrop-blur-sm border-border/50 hover:border-purple-500/20 transition-all">
                <CardContent className="p-6">
                  <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                    <f.icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════ FAQ SECTION ═══════════ */
function FAQSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const faqs = [
    {
      q: 'Preciso de contador para enviar minha declaração?',
      a: 'No IR Simples, a IA faz toda a análise e você usa o programa da Receita Federal para enviar. No IR Completo, um contador credenciado revisa e transmite para você.',
    },
    {
      q: 'Quais documentos preciso enviar?',
      a: 'Informes de rendimentos (empresa, banco), recibos médicos, comprovantes de educação, notas de corretagem, DARFs. Aceita PDF, JPG, PNG e WEBP até 10MB.',
    },
    {
      q: 'A IA acerta mesmo? É segura?',
      a: 'A IA tem 97% de precisão e cada extração vem com índice de confiança. O motor fiscal aplica travas legais (tetos de deduções) e detecta riscos de malha fina automaticamente.',
    },
    {
      q: 'Quanto tempo demora?',
      a: 'A análise por IA leva minutos. Após o upload dos documentos e checklist fiscal, seu resultado completo fica pronto em menos de 10 minutos.',
    },
    {
      q: 'E se eu tiver investimentos e cripto?',
      a: 'Escolha o IR Completo. A IA trata ações, FIIs, criptomoedas, renda de aluguéis e até renda do exterior. O contador revisa e garante a precisão.',
    },
    {
      q: 'Meus dados estão seguros?',
      a: 'Sim. Dados criptografados, armazenamento isolado por usuário (RLS), documentos expiram automaticamente e a plataforma é LGPD compliant.',
    },
  ];

  return (
    <section className="py-16 md:py-24 relative">
      <div className="container mx-auto px-4 max-w-3xl" ref={ref}>
        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="text-center mb-12">
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-foreground">
            Perguntas frequentes
          </motion.h2>
        </motion.div>

        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div key={i} variants={fadeUp}>
              <Card className="bg-card/40 backdrop-blur-sm border-border/50">
                <CardContent className="p-5">
                  <h4 className="font-semibold text-foreground mb-2">{faq.q}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default IRPage;
