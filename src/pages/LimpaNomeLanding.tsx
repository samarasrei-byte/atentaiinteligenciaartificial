import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Shield, CheckCircle2, ArrowRight, Phone, MessageCircle,
  Clock, Users, Star, XCircle, CheckCircle, Ban, CreditCard,
  FileText, Headphones, Lock, Award, AlertTriangle, TrendingUp,
  ChevronDown, User, Zap, Scale, Eye, Fingerprint, BadgeCheck,
  Sparkles, Target, Heart
} from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";

const WHATSAPP_LINK = "https://wa.me/5511999999999?text=Ol%C3%A1%2C%20quero%20analisar%20meu%20caso%20de%20Limpa%20Nome%20AtentAI";

// Animated counter hook
function useCounter(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref as any, { once: true });
  
  useEffect(() => {
    if (!startOnView || !isInView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end, duration, startOnView]);
  
  return { count, ref };
}

function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function CTAButton({ className = "", size = "lg", text = "QUERO ANALISAR MEU CASO AGORA" }: { className?: string; size?: "lg" | "xl"; text?: string }) {
  return (
    <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-block group">
      <Button
        className={`relative overflow-hidden bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-wider shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] transition-all duration-500 hover:-translate-y-1.5 ${size === "xl" ? "text-lg px-12 py-8 rounded-2xl" : "text-base px-8 py-6 rounded-xl"} ${className}`}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <MessageCircle className="w-5 h-5 mr-2" />
        {text}
        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </a>
  );
}

function StatItem({ end, suffix, label }: { end: number; suffix: string; label: string }) {
  const { count, ref } = useCounter(end);
  return (
    <div className="text-center">
      <span ref={ref} className="text-4xl sm:text-5xl font-black bg-gradient-to-b from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
        {count}{suffix}
      </span>
      <p className="mt-2 text-white/40 text-sm font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}

function FloatingParticle({ delay = 0, left = "50%" }: { delay?: number; left?: string }) {
  return (
    <motion.div
      className="absolute w-1 h-1 bg-emerald-400/40 rounded-full"
      style={{ left }}
      initial={{ y: "100vh", opacity: 0 }}
      animate={{ y: "-10vh", opacity: [0, 1, 1, 0] }}
      transition={{ duration: 8, delay, repeat: Infinity, ease: "linear" }}
    />
  );
}

export default function LimpaNomeLanding() {
  const [urgencyMin, setUrgencyMin] = useState(14);
  const [urgencySec, setUrgencySec] = useState(59);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => { setHeroVisible(true); }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setUrgencySec(s => {
        if (s === 0) {
          setUrgencyMin(m => (m === 0 ? 14 : m - 1));
          return 59;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // stats rendered via StatItem components

  const faqs = [
    { q: "Isso é realmente legal?", a: "100% legal. Utilizamos mecanismos previstos no Código de Defesa do Consumidor (CDC), Lei do Superendividamento e jurisprudências consolidadas nos tribunais brasileiros." },
    { q: "Preciso pagar a dívida toda?", a: "Não necessariamente. Se forem encontradas irregularidades na negativação, é possível buscar a remoção judicial sem quitar o valor total da dívida." },
    { q: "Quanto tempo leva o processo?", a: "A análise inicial é feita em até 48h úteis. O prazo total depende da complexidade do caso, mas mantemos você informado em cada etapa." },
    { q: "Funciona para CNPJ também?", a: "Sim! Atendemos tanto Pessoa Física (CPF) quanto Pessoa Jurídica (CNPJ) em todo o território nacional." },
    { q: "E se meu caso não tiver viabilidade?", a: "Você é informado antes de qualquer cobrança. Trabalhamos com total transparência sem surpresas." },
  ];

  return (
    <>
      <Helmet>
        <title>Limpa Nome AtentAI Regularize seu CPF ou CNPJ com Análise Jurídica</title>
        <meta name="description" content="Descubra se seu nome pode ser limpo pela lei. Análise jurídica completa, 100% legal, com atendimento em todo o Brasil. Vagas limitadas." />
      </Helmet>

      <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden selection:bg-emerald-500/30">

        {/* ========== HERO ========== */}
        <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
          {/* Massive BG Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.15),_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.08),_transparent_50%)]" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/[0.07] rounded-full blur-[150px]" />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />

          {/* Floating particles */}
          {[10, 25, 40, 55, 70, 85].map((l, i) => (
            <FloatingParticle key={i} delay={i * 1.3} left={`${l}%`} />
          ))}

          <div className="relative z-10 max-w-5xl mx-auto text-center">
            {/* Top badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={heroVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm mb-10"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>
              <span className="text-emerald-300 text-sm font-semibold">
                Vagas limitadas • Oferta encerra em {urgencyMin}:{urgencySec.toString().padStart(2, '0')}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={heroVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight">
                <span className="block bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                  Seu nome pode ser
                </span>
                <span className="block mt-2 bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                  limpo pela lei
                </span>
              </h1>
              <p className="mt-4 text-2xl sm:text-3xl text-white/40 font-light">
                mesmo com dívidas
              </p>
            </motion.div>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={heroVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="mt-8 text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed"
            >
              Descubra agora se você pode sair da negativação{" "}
              <span className="text-white font-medium">sem precisar quitar tudo imediatamente</span>
            </motion.p>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap justify-center gap-3 mt-10"
            >
              {[
                { icon: Shield, label: "100% Legal" },
                { icon: Eye, label: "Análise completa" },
                { icon: Target, label: "Todo o Brasil" },
                { icon: BadgeCheck, label: "Garantia" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-full text-sm text-white/80 backdrop-blur-sm hover:bg-white/[0.08] transition-colors">
                  <Icon className="w-4 h-4 text-emerald-400" />
                  {label}
                </span>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={heroVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="mt-12"
            >
              <CTAButton size="xl" />
              <p className="mt-5 text-white/30 text-sm flex items-center justify-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                Atendimento rápido via WhatsApp • Sem compromisso
              </p>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ChevronDown className="w-6 h-6 text-white/20" />
          </motion.div>
        </section>

        {/* ========== SOCIAL PROOF COUNTER BAR ========== */}
        <Section className="py-16 px-4 border-y border-white/[0.06] bg-white/[0.02]">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem end={847} suffix="+" label="Casos analisados" />
            <StatItem end={92} suffix="%" label="Taxa de êxito" />
            <StatItem end={27} suffix="" label="Estados atendidos" />
            <StatItem end={8} suffix="+" label="Anos de experiência" />
          </div>
        </Section>

        {/* ========== SEÇÃO PROBLEMA ========== */}
        <Section className="px-4 py-24" id="problema">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold mb-6">
                <AlertTriangle className="w-4 h-4" /> O PROBLEMA
              </span>
              <h2 className="text-4xl sm:text-5xl font-black leading-tight">
                Você sabe o que o{" "}
                <span className="bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">nome negativado</span>
                <br />faz com sua vida?
              </h2>
              <p className="mt-4 text-white/50 text-lg max-w-2xl mx-auto">
                Ter o nome sujo vai muito além de uma dívida. É a sua liberdade financeira travada.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Ban, title: "Crédito negado", desc: "Cartões, empréstimos e financiamentos recusados automaticamente. Portas fechadas em todos os bancos.", color: "red" },
                { icon: XCircle, title: "Sem alugar imóvel", desc: "Ficha rejeitada em imobiliárias. O sonho da casa própria ou do aluguel travado indefinidamente.", color: "red" },
                { icon: AlertTriangle, title: "Vida completamente travada", desc: "Emprego, parcerias comerciais, investimentos tudo bloqueado por uma restrição no seu nome.", color: "red" },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="group p-8 rounded-3xl bg-gradient-to-b from-red-500/[0.08] to-transparent border border-red-500/15 hover:border-red-500/30 transition-all duration-500"
                >
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                    <item.icon className="w-7 h-7 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-white/50 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-emerald-500/[0.08] to-transparent border border-emerald-500/20 text-center"
            >
              <Sparkles className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
              <p className="text-xl text-white/80 font-medium">
                <span className="text-emerald-400 font-bold">Muitas negativações no Brasil possuem irregularidades</span>
                <br /><span className="text-white/50">e você pode nem saber disso.</span>
              </p>
            </motion.div>
          </div>
        </Section>

        {/* ========== SEÇÃO SOLUÇÃO ========== */}
        <Section className="px-4 py-24 relative" id="solucao">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.06),_transparent_70%)]" />
          <div className="relative max-w-5xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" /> A SOLUÇÃO
            </span>

            <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-6">
              Análise jurídica estratégica<br />baseada no{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                Código de Defesa do Consumidor
              </span>
            </h2>

            <p className="text-white/50 text-lg max-w-2xl mx-auto mb-14">
              Não vendemos milagres. Usamos a lei a seu favor com análise técnica e fundamentação jurídica sólida.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Scale, title: "Não é milagre", desc: "É direito previsto em lei. Fundamentos legais reais para cada caso específico.", gradient: "from-emerald-500/20 to-emerald-500/5" },
                { icon: FileText, title: "Baseado na lei", desc: "CDC, Lei do Superendividamento (14.181/21) e jurisprudências consolidadas nos tribunais.", gradient: "from-emerald-500/15 to-emerald-500/5" },
                { icon: Fingerprint, title: "Caso individual", desc: "Cada situação é única. Análise personalizada com atenção a cada detalhe do seu perfil.", gradient: "from-emerald-500/10 to-emerald-500/5" },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className={`group p-8 rounded-3xl bg-gradient-to-b ${item.gradient} border border-emerald-500/15 hover:border-emerald-500/30 transition-all duration-500`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-500">
                    <item.icon className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-white/50 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ========== COMPARAÇÃO ========== */}
        <Section className="px-4 py-24" id="comparacao">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl sm:text-5xl font-black">
                Renegociação <span className="text-white/30">vs</span>{" "}
                <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">Defesa Jurídica</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Renegociação */}
              <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-red-500/[0.06] to-transparent border border-red-500/15">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-black text-red-400">Renegociação</h3>
                </div>
                <ul className="space-y-5">
                  {[
                    "Precisa pagar a dívida total ou parcial",
                    "Depende da boa vontade do banco/credor",
                    "Mantém histórico negativo no sistema",
                    "Apenas adia o problema não resolve",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3 text-white/60">
                      <XCircle className="w-5 h-5 text-red-400/70 shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Defesa Jurídica */}
              <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-emerald-500/[0.1] to-transparent border-2 border-emerald-500/30 relative shadow-[0_0_60px_rgba(16,185,129,0.1)]">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-emerald-500 text-black text-xs font-black rounded-full uppercase tracking-wider">
                  ✨ Recomendado
                </div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-black text-emerald-400">Defesa Jurídica</h3>
                </div>
                <ul className="space-y-5">
                  {[
                    "Análise técnica de irregularidades na dívida",
                    "Possibilidade real de remoção da negativação",
                    "Fundamentado no CDC e legislação vigente",
                    "Resolve a causa raiz não apenas o sintoma",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3 text-white/90">
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center mt-14">
              <CTAButton />
            </div>
          </div>
        </Section>

        {/* ========== COMO FUNCIONA ========== */}
        <Section className="px-4 py-24 relative" id="como-funciona">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(16,185,129,0.06),_transparent_60%)]" />
          <div className="relative max-w-5xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-6">
              <Target className="w-4 h-4" /> PASSO A PASSO
            </span>
            <h2 className="text-4xl sm:text-5xl font-black mb-16">
              Como funciona?{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">4 passos simples</span>
            </h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { step: "01", icon: Phone, title: "Contato", desc: "Fale conosco pelo WhatsApp e envie seus dados básicos de forma segura." },
                { step: "02", icon: FileText, title: "Análise", desc: "Equipe jurídica analisa detalhadamente cada negativação do seu caso." },
                { step: "03", icon: CheckCircle, title: "Viabilidade", desc: "Você recebe o parecer com as possibilidades reais e próximos passos." },
                { step: "04", icon: Headphones, title: "Acompanhamento", desc: "Acompanhamos todo o processo com atualizações até a resolução." },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/20 transition-all duration-500 group"
                >
                  <span className="text-6xl font-black text-emerald-500/[0.08] absolute top-4 right-6 group-hover:text-emerald-500/15 transition-colors">
                    {item.step}
                  </span>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 transition-colors">
                    <item.icon className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ========== PROVA SOCIAL ========== */}
        <Section className="px-4 py-24" id="depoimentos">
          <div className="max-w-5xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-6">
              <Heart className="w-4 h-4" /> DEPOIMENTOS
            </span>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Quem já{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">regularizou</span>{" "}
              recomenda
            </h2>
            <p className="text-white/40 mb-14 text-lg">Histórias reais de quem saiu da negativação</p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "Ana Paula R.", city: "São Paulo, SP", text: "Fiquei 3 anos negativada e achava que não tinha solução. Em poucas semanas meu nome ficou limpo. O atendimento foi impecável do início ao fim!", rating: 5 },
                { name: "Carlos Eduardo M.", city: "Belo Horizonte, MG", text: "O Guilherme e a equipe foram incríveis. Transparência total, me explicaram cada passo. Confiança de verdade recomendo sem medo.", rating: 5 },
                { name: "Fernanda Lima S.", city: "Curitiba, PR", text: "Minha empresa estava completamente travada pelo CNPJ negativado. Resolveram e agora consegui até linha de crédito. Mudou minha vida!", rating: 5 },
              ].map((d, i) => (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] text-left hover:border-emerald-500/20 transition-all duration-500"
                >
                  <div className="flex gap-1 mb-5">
                    {[...Array(d.rating)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-emerald-400 text-emerald-400" />
                    ))}
                  </div>
                  <p className="text-white/70 leading-relaxed mb-6 italic">"{d.text}"</p>
                  <div className="flex items-center gap-3 pt-5 border-t border-white/[0.06]">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black font-black text-sm">
                      {d.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{d.name}</p>
                      <p className="text-white/35 text-xs">{d.city}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ========== AUTORIDADE ========== */}
        <Section className="px-4 py-24 relative" id="especialista">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_rgba(16,185,129,0.08),_transparent_50%)]" />
          <div className="relative max-w-4xl mx-auto">
            <div className="p-10 md:p-14 rounded-[2rem] bg-gradient-to-br from-emerald-500/[0.08] via-white/[0.02] to-transparent border border-emerald-500/20 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="relative shrink-0">
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.3)]">
                    <User className="w-16 h-16 text-black/80" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <BadgeCheck className="w-5 h-5 text-black" />
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <h3 className="text-3xl font-black text-white mb-1">Guilherme Mesquita</h3>
                  <p className="text-emerald-400 font-semibold text-lg mb-5">
                    Especialista em Regularização Jurídica • +8 anos de experiência
                  </p>
                  <p className="text-white/60 leading-relaxed text-lg">
                    Especialista em análise de negativações e defesa do consumidor. Já ajudou{" "}
                    <span className="text-white font-semibold">centenas de pessoas e empresas</span> a regularizarem sua situação 
                    cadastral utilizando mecanismos legais do CDC. Atendimento humanizado, transparente e com{" "}
                    <span className="text-emerald-400 font-semibold">resultados comprovados</span>.
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-8">
                    {[
                      { icon: Award, label: "+847 casos analisados" },
                      { icon: Target, label: "27 estados" },
                      { icon: TrendingUp, label: "92% de êxito" },
                    ].map((s) => (
                      <span key={s.label} className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-full text-white/70 text-sm font-medium">
                        <s.icon className="w-4 h-4 text-emerald-400" />
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ========== OFERTA ========== */}
        <Section className="px-4 py-24" id="oferta">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-6">
              <CreditCard className="w-4 h-4" /> OFERTA ESPECIAL
            </span>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Regularize seu nome com{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">acompanhamento jurídico</span>
            </h2>
            <p className="text-white/40 mb-12 text-lg">Investimento único que pode mudar sua vida financeira</p>

            <div className="p-10 md:p-14 rounded-[2rem] bg-gradient-to-b from-emerald-500/[0.1] to-transparent border-2 border-emerald-500/25 relative shadow-[0_0_80px_rgba(16,185,129,0.1)]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-8 py-2 bg-gradient-to-r from-emerald-400 to-emerald-500 text-black font-black text-sm rounded-full uppercase tracking-wider shadow-lg">
                🔥 Oferta por Tempo Limitado
              </div>

              {/* Preço */}
              <div className="mb-10 mt-4">
                <p className="text-white/30 text-xl line-through mb-2">De R$ 1.500,00</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-2xl text-white/50 font-bold">R$</span>
                  <span className="text-7xl sm:text-8xl font-black bg-gradient-to-b from-emerald-300 to-emerald-500 bg-clip-text text-transparent leading-none">
                    747
                  </span>
                </div>
                <p className="text-white/50 mt-4 text-base">
                  ou entrada de <span className="text-white font-bold">R$ 500</span> + 3x de <span className="text-white font-bold">R$ 100</span>
                </p>
              </div>

              {/* O que inclui */}
              <div className="grid sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto mb-12">
                {[
                  "Análise completa do caso",
                  "Possível ação jurídica",
                  "Acompanhamento integral",
                  "Contrato digital seguro",
                  "Suporte dedicado via WhatsApp",
                  "Garantia de transparência total",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-3 text-white/70">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-sm">{t}</span>
                  </div>
                ))}
              </div>

              <CTAButton size="xl" />
            </div>
          </div>
        </Section>

        {/* ========== GARANTIA ========== */}
        <Section className="px-4 py-20" id="garantia">
          <div className="max-w-3xl mx-auto">
            <div className="p-10 rounded-3xl bg-gradient-to-br from-emerald-500/[0.06] to-transparent border border-emerald-500/15 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-3xl font-black text-white mb-5">Garantia de Transparência</h3>
              <p className="text-white/60 leading-relaxed text-lg max-w-xl mx-auto">
                Se não houver viabilidade jurídica, <span className="text-white font-semibold">você é informado antes de qualquer cobrança</span>.
                Se o serviço não for cumprido conforme o contrato, <span className="text-emerald-400 font-bold">devolvemos seu dinheiro</span>.
              </p>
            </div>
          </div>
        </Section>

        {/* ========== FAQ ========== */}
        <Section className="px-4 py-24" id="faq">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-black text-white">Perguntas Frequentes</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.button
                  key={i}
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full text-left p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/20 transition-all duration-300"
                  layout
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-bold text-white text-lg">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-emerald-400 shrink-0 transition-transform duration-300 ${activeFaq === i ? "rotate-180" : ""}`} />
                  </div>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 text-white/50 leading-relaxed overflow-hidden"
                      >
                        {faq.a}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </div>
          </div>
        </Section>

        {/* ========== URGÊNCIA FINAL ========== */}
        <Section className="px-4 py-20" id="urgencia">
          <div className="max-w-3xl mx-auto text-center">
            <div className="p-10 rounded-3xl bg-gradient-to-r from-red-500/[0.08] via-transparent to-emerald-500/[0.08] border border-white/[0.08]">
              <Clock className="w-12 h-12 text-red-400 mx-auto mb-5" />
              <h3 className="text-3xl font-black text-white mb-4">
                Estamos liberando <span className="text-red-400">poucas vagas</span> por semana
              </h3>
              <p className="text-white/50 mb-8 text-lg">
                Devido à alta demanda e ao atendimento personalizado, trabalhamos com número limitado de casos simultâneos.
              </p>
              <div className="inline-flex items-center gap-4 px-8 py-4 bg-white/[0.04] border border-white/[0.08] rounded-2xl">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span className="text-2xl font-black text-emerald-400 font-mono tracking-widest">
                  {urgencyMin}:{urgencySec.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        </Section>

        {/* ========== CTA FINAL ========== */}
        <section className="px-4 py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(16,185,129,0.15),_transparent_60%)]" />
          <div className="relative max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-6">
              Descubra agora se seu nome<br />pode ser{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">regularizado</span>
            </h2>
            <p className="text-white/50 mb-12 text-xl">
              Converse com nosso especialista gratuitamente. Sem compromisso.
            </p>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-block group">
              <Button className="relative overflow-hidden bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xl px-14 py-9 rounded-2xl uppercase tracking-wider shadow-[0_0_60px_rgba(16,185,129,0.4)] hover:shadow-[0_0_80px_rgba(16,185,129,0.6)] transition-all duration-500 hover:-translate-y-2">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <MessageCircle className="w-7 h-7 mr-3" />
                FALAR COM ESPECIALISTA NO WHATSAPP
              </Button>
            </a>
            <p className="mt-8 text-white/25 text-sm">AtentAI • Regularização Jurídica • CNPJ ativo</p>
          </div>
        </section>

        {/* ========== FLOATING WHATSAPP ========== */}
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-110 transition-all duration-300 group"
          aria-label="WhatsApp"
        >
          <MessageCircle className="w-7 h-7 text-black group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
        </a>
      </div>
    </>
  );
}
