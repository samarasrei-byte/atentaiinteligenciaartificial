import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { 
  Brain, Target, Rocket, TrendingUp, Users, Zap, Shield, 
  Globe, ChevronDown, BarChart3, Lightbulb, ArrowRight,
  Building2, FileText, Calculator, CreditCard, Award,
  Layers, PieChart, Megaphone, Handshake, DollarSign,
  Star, CheckCircle2, Sparkles, Eye
} from 'lucide-react';

// ─── Reusable Components ────────────────────────────────────────────

function SlideContainer({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}>
      {children}
    </section>
  );
}

function AnimatedElement({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function GlowOrb({ className }: { className: string }) {
  return <div className={`absolute rounded-full blur-[120px] opacity-20 pointer-events-none ${className}`} />;
}

function GridPattern() {
  return (
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
      style={{
        backgroundImage: `linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }}
    />
  );
}

function SlideNumber({ num, total = 12 }: { num: number; total?: number }) {
  return (
    <div className="absolute bottom-8 right-8 text-xs font-mono tracking-widest text-white/20">
      {String(num).padStart(2, '0')} / {total}
    </div>
  );
}

function SectionTag({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 mb-6">
      <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
      <span className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-300">{text}</span>
    </div>
  );
}

// ─── Slide 1: Cover ──────────────────────────────────────────────────

function SlideCover() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.08], [1, 0.95]);

  return (
    <SlideContainer id="capa" className="bg-[#07060B]">
      <GlowOrb className="w-[800px] h-[800px] bg-violet-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <GlowOrb className="w-[400px] h-[400px] bg-blue-500 top-[20%] left-[20%]" />
      <GlowOrb className="w-[300px] h-[300px] bg-fuchsia-500 bottom-[20%] right-[20%]" />
      <GridPattern />
      
      <motion.div style={{ opacity, scale }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight text-white mb-6">
            Atent
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              aí
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/50 font-light max-w-2xl mx-auto mb-12 tracking-wide">
            O marketplace inteligente de tributos do Brasil
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
            {['Inteligência Artificial', 'Marketplace', 'Tributos'].map((tag) => (
              <span key={tag} className="px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase border border-white/10 text-white/40 bg-white/5">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex flex-col items-center gap-2 text-white/20"
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.div>
      </motion.div>
      <SlideNumber num={1} />
    </SlideContainer>
  );
}

// ─── Slide 2: Problema ──────────────────────────────────────────────

function SlideProblema() {
  const problems = [
    { icon: Target, text: 'Sistema tributário complexo, caro e inacessível', stat: '95%', statLabel: 'não entendem seus impostos' },
    { icon: Users, text: 'Milhões de autônomos e empresas irregulares', stat: '22M+', statLabel: 'CNPJs ativos no Brasil' },
    { icon: Shield, text: 'Falta de acesso a serviços contábeis acessíveis', stat: '70%', statLabel: 'sem contador' },
    { icon: CreditCard, text: 'Dificuldade para limpar nome e acessar crédito', stat: '72M', statLabel: 'inadimplentes no país' },
  ];

  return (
    <SlideContainer id="problema" className="bg-[#07060B]">
      <GlowOrb className="w-[600px] h-[600px] bg-red-600/40 top-[10%] right-[10%]" />
      <GridPattern />
      
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20">
        <AnimatedElement>
          <SectionTag text="O Problema" />
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
            O Brasil tem o sistema<br />
            tributário <span className="text-red-400">mais complexo</span><br />
            do mundo.
          </h2>
          <p className="text-lg text-white/40 mb-16 max-w-xl">
            E milhões de pessoas pagam o preço por isso todos os dias.
          </p>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((p, i) => (
            <AnimatedElement key={i} delay={0.15 * i}>
              <div className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 hover:border-red-500/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <p.icon className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/80 font-medium mb-3">{p.text}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-red-400">{p.stat}</span>
                      <span className="text-xs text-white/30">{p.statLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedElement>
          ))}
        </div>
      </div>
      <SlideNumber num={2} />
    </SlideContainer>
  );
}

// ─── Slide 3: Solução ───────────────────────────────────────────────

function SlideSolucao() {
  const features = [
    { icon: Zap, text: 'Regularização fiscal acessível' },
    { icon: Brain, text: 'IA contábil automatizada' },
    { icon: Rocket, text: 'Serviços tributários em poucos cliques' },
    { icon: Globe, text: 'Inclusão financeira em escala' },
  ];

  return (
    <SlideContainer id="solucao" className="bg-[#07060B]">
      <GlowOrb className="w-[700px] h-[700px] bg-violet-600 top-1/2 left-0 -translate-y-1/2 -translate-x-1/3" />
      <GlowOrb className="w-[400px] h-[400px] bg-cyan-500 bottom-[10%] right-[10%]" />
      <GridPattern />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <AnimatedElement>
            <SectionTag text="A Solução" />
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Tributos.
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Simplificados.
              </span>
            </h2>
            <p className="text-lg text-white/40 leading-relaxed mb-10">
              O Atentaí é um marketplace de tributos com inteligência artificial que simplifica a vida financeira de pessoas e empresas.
            </p>
            <div className="flex items-center gap-3">
              <div className="px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold">
                Conheça a plataforma
              </div>
              <ArrowRight className="w-4 h-4 text-violet-400" />
            </div>
          </AnimatedElement>

          <div className="space-y-4">
            {features.map((f, i) => (
              <AnimatedElement key={i} delay={0.1 * i}>
                <div className="flex items-center gap-5 p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-violet-500/[0.05] hover:border-violet-500/20 transition-all duration-500">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-6 h-6 text-violet-400" />
                  </div>
                  <span className="text-white/80 font-medium text-lg">{f.text}</span>
                </div>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </div>
      <SlideNumber num={3} />
    </SlideContainer>
  );
}

// ─── Slide 4: Produto ───────────────────────────────────────────────

function SlideProduto() {
  const products = [
    { icon: Shield, name: 'Limpar Nome', desc: 'Redução de até 4x', color: 'from-emerald-500 to-teal-600' },
    { icon: FileText, name: 'Emissão de NF', desc: 'Nota fiscal em minutos', color: 'from-blue-500 to-indigo-600' },
    { icon: Calculator, name: 'IR com IA', desc: 'Declaração inteligente', color: 'from-violet-500 to-purple-600' },
    { icon: BarChart3, name: 'Simulador Tributário', desc: 'Análise em tempo real', color: 'from-cyan-500 to-blue-600' },
    { icon: CreditCard, name: 'Análise Fiscal', desc: 'Crédito facilitado', color: 'from-amber-500 to-orange-600' },
    { icon: DollarSign, name: 'Créditos a Receber', desc: 'Descubra valores', color: 'from-green-500 to-emerald-600' },
    { icon: Brain, name: 'Contador IA', desc: 'Inteligência artificial', color: 'from-fuchsia-500 to-pink-600' },
    { icon: PieChart, name: 'BI Tributário', desc: 'Dashboard analítico', color: 'from-indigo-500 to-violet-600' },
    { icon: FileText, name: 'Certidões Fiscais', desc: 'Emissão rápida', color: 'from-teal-500 to-cyan-600' },
  ];

  const soon = [
    { icon: Building2, text: 'Abertura de empresas' },
    { icon: Award, text: 'Registro de marca e patente' },
    { icon: FileText, text: 'Certidões negativas automatizadas' },
  ];

  return (
    <SlideContainer id="produto" className="bg-[#07060B]">
      <GlowOrb className="w-[600px] h-[600px] bg-blue-600 top-[5%] left-1/2 -translate-x-1/2" />
      <GridPattern />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20">
        <AnimatedElement>
          <SectionTag text="Produto" />
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
            Plataforma <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">completa</span>
          </h2>
          <p className="text-lg text-white/40 mb-14 max-w-xl">
            Tudo que você precisa para sua vida tributária, em um só lugar.
          </p>
        </AnimatedElement>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
          {products.map((p, i) => (
            <AnimatedElement key={i} delay={0.06 * i}>
              <div className="group relative p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 hover:border-violet-500/20">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4 opacity-80 group-hover:opacity-100 transition-opacity`}>
                  <p.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-1">{p.name}</h3>
                <p className="text-white/30 text-sm">{p.desc}</p>
              </div>
            </AnimatedElement>
          ))}
        </div>

        <AnimatedElement delay={0.5}>
          <div className="p-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/20 mb-4">Em breve</p>
            <div className="flex flex-wrap gap-4">
              {soon.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-white/30">
                  <s.icon className="w-4 h-4" />
                  <span className="text-sm">{s.text}</span>
                </div>
              ))}
            </div>
          </div>
        </AnimatedElement>
      </div>
      <SlideNumber num={4} />
    </SlideContainer>
  );
}

// ─── Slide 5: Diferencial ───────────────────────────────────────────

function SlideDiferencial() {
  const diffs = [
    { icon: Layers, title: 'Marketplace de Tributos', desc: 'Modelo único no Brasil. Centralizamos todos os serviços fiscais.' },
    { icon: Brain, title: 'Automação com IA', desc: 'Inteligência artificial aplicada em cada etapa do processo.' },
    { icon: Users, title: 'Preços Acessíveis', desc: 'Democratizamos o acesso a serviços tributários de qualidade.' },
    { icon: Globe, title: 'Inclusão Financeira', desc: 'Levamos regularização fiscal para milhões de brasileiros.' },
    { icon: Sparkles, title: 'One-Stop Shop', desc: 'Plataforma completa. Tudo em poucos cliques.' },
  ];

  return (
    <SlideContainer id="diferencial" className="bg-[#07060B]">
      <GlowOrb className="w-[500px] h-[500px] bg-violet-600 bottom-[10%] left-[5%]" />
      <GlowOrb className="w-[400px] h-[400px] bg-cyan-500 top-[15%] right-[5%]" />
      <GridPattern />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20">
        <AnimatedElement className="text-center mb-16">
          <SectionTag text="Diferencial" />
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            Por que o <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Atentaí</span>?
          </h2>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diffs.map((d, i) => (
            <AnimatedElement key={i} delay={0.1 * i}>
              <div className={`group relative p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-violet-500/[0.05] hover:border-violet-500/20 transition-all duration-500 ${i === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}>
                <d.icon className="w-8 h-8 text-violet-400 mb-5" />
                <h3 className="text-xl font-bold text-white mb-2">{d.title}</h3>
                <p className="text-white/40 leading-relaxed">{d.desc}</p>
              </div>
            </AnimatedElement>
          ))}
        </div>
      </div>
      <SlideNumber num={5} />
    </SlideContainer>
  );
}

// ─── Slide 6: Mercado ───────────────────────────────────────────────

function SlideMercado() {
  const stats = [
    { value: '22M+', label: 'CNPJs Ativos', sub: 'no Brasil' },
    { value: '72M', label: 'Inadimplentes', sub: 'pessoas no país' },
    { value: 'R$600B+', label: 'Mercado Tributário', sub: 'volume anual' },
    { value: '2026', label: 'Reforma Tributária', sub: 'IBS e CBS' },
  ];

  return (
    <SlideContainer id="mercado" className="bg-[#07060B]">
      <GlowOrb className="w-[800px] h-[800px] bg-blue-700/40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <GridPattern />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20">
        <AnimatedElement className="text-center mb-16">
          <SectionTag text="Mercado" />
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
            Um mercado <span className="text-blue-400">gigante</span>
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            A reforma tributária brasileira e a economia informal criam uma oportunidade sem precedentes.
          </p>
        </AnimatedElement>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <AnimatedElement key={i} delay={0.12 * i}>
              <div className="text-center p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-blue-500/[0.05] hover:border-blue-500/20 transition-all duration-500">
                <p className="text-4xl md:text-5xl font-black bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent mb-2">{s.value}</p>
                <p className="text-white/60 font-semibold text-sm mb-1">{s.label}</p>
                <p className="text-white/25 text-xs">{s.sub}</p>
              </div>
            </AnimatedElement>
          ))}
        </div>

        <AnimatedElement delay={0.6} className="mt-14">
          <div className="flex items-center justify-center gap-3 text-white/20 text-sm">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Crescimento da economia informal + reforma tributária = <span className="text-emerald-400 font-semibold">demanda exponencial</span></span>
          </div>
        </AnimatedElement>
      </div>
      <SlideNumber num={6} />
    </SlideContainer>
  );
}

// ─── Slide 7: Modelo de Negócio ─────────────────────────────────────

function SlideModelo() {
  const models = [
    { icon: DollarSign, title: 'Comissão sobre serviços', desc: 'Revenue share em cada transação da plataforma', pct: '15-30%' },
    { icon: Rocket, title: 'Assinaturas SaaS', desc: 'Planos recorrentes com IA contábil', pct: 'MRR' },
    { icon: FileText, title: 'Serviços Fiscais', desc: 'Venda direta de serviços tributários', pct: 'One-time' },
    { icon: Handshake, title: 'Parcerias', desc: 'Rede de contadores e empresas', pct: 'B2B' },
  ];

  return (
    <SlideContainer id="modelo" className="bg-[#07060B]">
      <GlowOrb className="w-[500px] h-[500px] bg-emerald-600/40 top-[10%] right-[10%]" />
      <GridPattern />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20">
        <AnimatedElement>
          <SectionTag text="Modelo de Negócio" />
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-14">
            Múltiplas fontes de <span className="text-emerald-400">receita</span>
          </h2>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {models.map((m, i) => (
            <AnimatedElement key={i} delay={0.12 * i}>
              <div className="group relative p-7 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-emerald-500/[0.04] hover:border-emerald-500/20 transition-all duration-500">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <m.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                    {m.pct}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{m.title}</h3>
                <p className="text-white/40">{m.desc}</p>
              </div>
            </AnimatedElement>
          ))}
        </div>
      </div>
      <SlideNumber num={7} />
    </SlideContainer>
  );
}

// ─── Slide 8: Estratégia de Crescimento ─────────────────────────────

function SlideCrescimento() {
  const strategies = [
    { icon: Megaphone, text: 'Marketing digital de alta performance' },
    { icon: Users, text: 'Aquisição de leads via ecossistema próprio' },
    { icon: TrendingUp, text: 'Tráfego pago e estratégias de growth' },
    { icon: Handshake, text: 'Expansão via parceiros contábeis' },
  ];

  return (
    <SlideContainer id="crescimento" className="bg-[#07060B]">
      <GlowOrb className="w-[600px] h-[600px] bg-violet-600/40 bottom-[10%] left-[10%]" />
      <GlowOrb className="w-[300px] h-[300px] bg-blue-500/30 top-[20%] right-[20%]" />
      <GridPattern />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <AnimatedElement>
            <SectionTag text="Growth" />
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
              Escala com
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">precisão</span>
            </h2>
            <p className="text-lg text-white/40 leading-relaxed">
              Estratégias de crescimento validadas com foco em aquisição eficiente e retenção de longo prazo.
            </p>
          </AnimatedElement>

          <div className="space-y-4">
            {strategies.map((s, i) => (
              <AnimatedElement key={i} delay={0.12 * i}>
                <div className="flex items-center gap-5 p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-violet-500/[0.04] hover:border-violet-500/20 transition-all duration-500">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <s.icon className="w-5 h-5 text-violet-400" />
                  </div>
                  <span className="text-white/80 font-medium">{s.text}</span>
                </div>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </div>
      <SlideNumber num={8} />
    </SlideContainer>
  );
}

// ─── Slide 9: Smart Money ───────────────────────────────────────────

function SlideSmartMoney() {
  return (
    <SlideContainer id="investimento" className="bg-[#07060B]">
      <GlowOrb className="w-[700px] h-[700px] bg-amber-600/30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <GridPattern />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20">
        <AnimatedElement className="text-center mb-16">
          <SectionTag text="Smart Money" />
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
            Investimento <span className="text-amber-400">estratégico</span>
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            Buscamos investidores que entendam o mercado contábil e tributário.
          </p>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <AnimatedElement delay={0.1}>
            <div className="p-8 rounded-3xl border border-amber-500/20 bg-amber-500/[0.03] text-center">
              <p className="text-5xl md:text-6xl font-black text-amber-400 mb-2">R$ 100k</p>
              <p className="text-white/40 font-medium">Rodada de investimento</p>
            </div>
          </AnimatedElement>
          <AnimatedElement delay={0.2}>
            <div className="p-8 rounded-3xl border border-violet-500/20 bg-violet-500/[0.03] text-center">
              <p className="text-5xl md:text-6xl font-black text-violet-400 mb-2">20%</p>
              <p className="text-white/40 font-medium">Equity oferecido</p>
            </div>
          </AnimatedElement>
        </div>

        <AnimatedElement delay={0.3}>
          <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.02]">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/20 mb-6">Uso do capital</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/60 text-sm font-medium">Marketing & Aquisição</span>
                  <span className="text-amber-400 font-bold">50%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500" initial={{ width: 0 }} whileInView={{ width: '100%' }} transition={{ duration: 1.2, delay: 0.5 }} viewport={{ once: true }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/60 text-sm font-medium">Produto & Tecnologia</span>
                  <span className="text-violet-400 font-bold">50%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500" initial={{ width: 0 }} whileInView={{ width: '100%' }} transition={{ duration: 1.2, delay: 0.7 }} viewport={{ once: true }} />
                </div>
              </div>
            </div>
          </div>
        </AnimatedElement>

        <AnimatedElement delay={0.5} className="mt-8 text-center">
          <p className="text-white/30 text-sm italic">
            Valorizamos smart money: investidores que tragam conhecimento, rede e experiência no setor.
          </p>
        </AnimatedElement>
      </div>
      <SlideNumber num={9} />
    </SlideContainer>
  );
}

// ─── Slide 10: Fundador ─────────────────────────────────────────────

function SlideFundador() {
  const achievements = [
    'Empreendedor serial',
    'Criador de 8 startups',
    'Especialista em crescimento',
    'Destaque em startups 2025',
  ];

  return (
    <SlideContainer id="fundador" className="bg-[#07060B]">
      <GlowOrb className="w-[500px] h-[500px] bg-violet-600/30 top-[20%] left-[10%]" />
      <GridPattern />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <AnimatedElement>
            <div className="relative">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-3xl bg-gradient-to-br from-violet-500/20 to-blue-500/10 border border-white/5 flex items-center justify-center mx-auto lg:mx-0">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl font-black text-white">GM</span>
                  </div>
                  <p className="text-white/60 text-sm">Fundador & CEO</p>
                </div>
              </div>
            </div>
          </AnimatedElement>

          <AnimatedElement delay={0.2}>
            <SectionTag text="Fundador" />
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
              Guilherme Monteiro
            </h2>
            <p className="text-lg text-violet-400 font-medium mb-8">Founder & CEO</p>

            <div className="space-y-3 mb-10">
              {achievements.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span className="text-white/60">{a}</span>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <p className="text-white/50 italic leading-relaxed">
                "Busco investidores que realmente entendam o mercado e queiram construir algo grande juntos."
              </p>
            </div>
          </AnimatedElement>
        </div>
      </div>
      <SlideNumber num={10} />
    </SlideContainer>
  );
}

// ─── Slide 11: Visão ────────────────────────────────────────────────

function SlideVisao() {
  return (
    <SlideContainer id="visao" className="bg-[#07060B]">
      <GlowOrb className="w-[900px] h-[900px] bg-violet-700/30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <GlowOrb className="w-[400px] h-[400px] bg-cyan-500/20 top-[10%] left-[10%]" />
      <GlowOrb className="w-[400px] h-[400px] bg-fuchsia-500/20 bottom-[10%] right-[10%]" />
      <GridPattern />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20 text-center">
        <AnimatedElement>
          <SectionTag text="Visão" />
          <div className="mb-8">
            <Eye className="w-12 h-12 text-violet-400 mx-auto mb-6" />
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-8 leading-[1.1]">
            Democratizar o acesso aos
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              serviços tributários
            </span>
            <br />
            no Brasil.
          </h2>
          <p className="text-xl text-white/30 max-w-2xl mx-auto leading-relaxed">
            Transformar o Atentaí na principal plataforma tributária da América Latina.
          </p>
        </AnimatedElement>

        <AnimatedElement delay={0.4} className="mt-16">
          <div className="flex items-center justify-center gap-8 text-white/15">
            <div className="flex flex-col items-center gap-2">
              <Globe className="w-8 h-8" />
              <span className="text-xs font-medium">LATAM</span>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="flex flex-col items-center gap-2">
              <Brain className="w-8 h-8" />
              <span className="text-xs font-medium">IA</span>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="flex flex-col items-center gap-2">
              <TrendingUp className="w-8 h-8" />
              <span className="text-xs font-medium">ESCALA</span>
            </div>
          </div>
        </AnimatedElement>
      </div>
      <SlideNumber num={11} />
    </SlideContainer>
  );
}

// ─── Slide 12: Encerramento ─────────────────────────────────────────

function SlideEncerramento() {
  return (
    <SlideContainer id="contato" className="bg-[#07060B]">
      <GlowOrb className="w-[1000px] h-[1000px] bg-violet-600/25 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <GlowOrb className="w-[500px] h-[500px] bg-blue-500/15 top-[10%] right-[10%]" />
      <GlowOrb className="w-[400px] h-[400px] bg-fuchsia-500/15 bottom-[10%] left-[10%]" />
      <GridPattern />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20 text-center">
        <AnimatedElement>
          <h2 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight text-white mb-6">
            Atent
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              aí
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-white/40 font-light mb-16 max-w-2xl mx-auto">
            "O futuro da contabilidade é inteligente, acessível e automatizado."
          </p>
        </AnimatedElement>

        <AnimatedElement delay={0.3}>
          <div className="inline-flex flex-col items-center gap-6">
            <div className="px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold text-lg shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105 transition-all duration-300 cursor-pointer">
              Vamos construir juntos
            </div>
            <p className="text-white/20 text-sm">
              O maior marketplace de tributos do Brasil
            </p>
          </div>
        </AnimatedElement>

        <AnimatedElement delay={0.5} className="mt-20">
          <div className="flex items-center justify-center gap-6 text-white/15 text-xs">
            <span>atentai.com.br</span>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <span>contato@atentai.com.br</span>
          </div>
        </AnimatedElement>
      </div>
      <SlideNumber num={12} />
    </SlideContainer>
  );
}

// ─── Navigation Dots ────────────────────────────────────────────────

function NavigationDots() {
  const sections = ['capa', 'problema', 'solucao', 'produto', 'diferencial', 'mercado', 'modelo', 'crescimento', 'investimento', 'fundador', 'visao', 'contato'];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = sections.indexOf(entry.target.id);
            if (idx >= 0) setActive(idx);
          }
        });
      },
      { threshold: 0.4 }
    );

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-2">
      {sections.map((id, i) => (
        <button
          key={id}
          onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            active === i ? 'bg-violet-400 scale-150' : 'bg-white/15 hover:bg-white/30'
          }`}
          aria-label={`Ir para slide ${i + 1}`}
        />
      ))}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────

export default function PitchDeck() {
  return (
    <>
      <Helmet>
        <title>Atentaí | Pitch Deck - Marketplace Inteligente de Tributos</title>
        <meta name="description" content="Pitch deck da Atentaí - O marketplace inteligente de tributos do Brasil. IA, automação e inclusão financeira." />
      </Helmet>

      <div className="bg-[#07060B] text-white overflow-x-hidden">
        <NavigationDots />
        <SlideCover />
        <SlideProblema />
        <SlideSolucao />
        <SlideProduto />
        <SlideDiferencial />
        <SlideMercado />
        <SlideModelo />
        <SlideCrescimento />
        <SlideSmartMoney />
        <SlideFundador />
        <SlideVisao />
        <SlideEncerramento />
      </div>
    </>
  );
}
