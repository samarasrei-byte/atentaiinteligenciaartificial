import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Shield, CheckCircle2, ArrowRight, Phone, MessageCircle,
  Clock, Star, XCircle, CheckCircle, Ban, CreditCard,
  FileText, Headphones, Lock, Award, AlertTriangle, TrendingUp,
  ChevronDown, User, Zap, Scale, Eye, Fingerprint, BadgeCheck,
  Sparkles, Target, Heart, ShieldCheck, Gavel, BarChart3,
  UserCheck, Timer, ThumbsUp
} from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import SamaraChatWidget from "@/components/limpa-nome/SamaraChatWidget";
import heroImg from "@/assets/limpa-nome-hero.png";

const WHATSAPP_NUMBER = "5511985214895";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Vim limpar o meu nome através do AtentAI")}`;
const PHONE_DISPLAY = "(11) 98521-4895";

function useCounter(end: number, duration = 2200, startOnView = true) {
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
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function CTAButton({ className = "", size = "lg", text = "QUERO LIMPAR MEU NOME" }: { className?: string; size?: "lg" | "xl"; text?: string }) {
  return (
    <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-block group w-full sm:w-auto">
      <Button
        className={`relative overflow-hidden bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-wider shadow-[0_0_40px_rgba(16,185,129,0.35)] hover:shadow-[0_0_60px_rgba(16,185,129,0.55)] transition-all duration-500 hover:-translate-y-1 w-full sm:w-auto ${size === "xl" ? "text-xs sm:text-sm md:text-lg px-5 sm:px-10 md:px-14 py-5 sm:py-7 md:py-8 rounded-2xl" : "text-xs sm:text-sm px-5 sm:px-8 py-4 sm:py-6 rounded-xl"} ${className}`}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />
        <span className="leading-tight">{text}</span>
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform shrink-0" />
      </Button>
    </a>
  );
}

function StatItem({ end, suffix, label, icon: Icon }: { end: number; suffix: string; label: string; icon?: any }) {
  const { count, ref } = useCounter(end);
  return (
    <div className="text-center p-4 sm:p-6">
      {Icon && <Icon className="w-6 h-6 text-emerald-400 mx-auto mb-3" />}
      <span ref={ref} className="text-3xl sm:text-5xl font-black bg-gradient-to-b from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
        {count.toLocaleString("pt-BR")}{suffix}
      </span>
      <p className="mt-2 text-white/40 text-xs sm:text-sm font-medium uppercase tracking-wider">{label}</p>
    </div>
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

  const faqs = [
    { q: "Preciso quitar minha dívida pra limpar o nome?", a: "Não necessariamente. Se a negativação contém irregularidades previstas no Código de Defesa do Consumidor, é possível buscar a remoção judicial sem pagamento integral da dívida." },
    { q: "Mas isso não é golpe? É legal mesmo?", a: "Totalmente legal. Utilizamos o CDC (Lei 8.078/90), a Lei do Superendividamento (14.181/21) e jurisprudências já consolidadas nos tribunais brasileiros. É o seu direito, nós apenas te ajudamos a exercer." },
    { q: "Funciona pra CNPJ e empresas?", a: "Sim! Já regularizamos mais de 12.836 CNPJs em todo o Brasil. Empresas de todos os portes e segmentos." },
    { q: "Em quanto tempo meu nome fica limpo?", a: "A análise inicial sai em até 48 horas úteis. O prazo total varia conforme a complexidade, mas você recebe atualizações em cada etapa do processo." },
    { q: "E se o meu caso não tiver solução?", a: "Você fica sabendo antes de pagar qualquer coisa. Trabalhamos com transparência total, sem surpresas e sem letras miúdas." },
    { q: "Qual o investimento?", a: "O serviço completo custa R$ 840,00 à vista, ou entrada de R$ 500 + 4x de R$ 85. Inclui análise completa, acompanhamento jurídico e suporte dedicado." },
  ];

  return (
    <>
      <Helmet>
        <title>Limpa Nome AtentAI | Regularize CPF e CNPJ com Análise Jurídica</title>
        <meta name="description" content="Mais de 36.800 análises realizadas. Descubra se seu nome pode ser regularizado pela lei, sem quitar a dívida. Atendimento em todo o Brasil." />
      </Helmet>

      <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-emerald-500/30">

        {/* ═══════════ HERO ═══════════ */}
        <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
          {/* BG layers */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(16,185,129,0.12),_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.08),_transparent_50%)]" />
          <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-emerald-500/[0.04] to-transparent" />
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }} />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Left content */}
              <div className="order-2 lg:order-1">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={heroVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm mb-8"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span className="text-emerald-300 text-xs sm:text-sm font-semibold">
                    +36.800 casos analisados em todo o Brasil
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={heroVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.95] tracking-tight"
                >
                  <span className="block text-white">Seu nome</span>
                  <span className="block text-white">pode ser</span>
                  <span className="block bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 bg-clip-text text-transparent mt-1">
                    limpo pela lei.
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={heroVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.25 }}
                  className="mt-6 text-base sm:text-lg md:text-xl text-white/50 max-w-lg leading-relaxed"
                >
                  Mesmo com dívidas, a lei pode estar do seu lado.
                  Descubra se você tem direito à{" "}
                  <span className="text-white font-semibold">remoção da negativação</span> sem precisar pagar tudo.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={heroVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mt-8 flex flex-col sm:flex-row gap-4"
                >
                  <CTAButton size="xl" text="ANALISAR MEU CASO AGORA" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={heroVisible ? { opacity: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.55 }}
                  className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-sm text-white/40"
                >
                  <span className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    Resposta em minutos via WhatsApp
                  </span>
                  <span className="hidden sm:inline text-white/15">|</span>
                  <a href={`tel:+${WHATSAPP_NUMBER}`} className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                    <Phone className="w-3.5 h-3.5" />
                    {PHONE_DISPLAY}
                  </a>
                </motion.div>

                {/* Trust micro-badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={heroVisible ? { opacity: 1 } : {}}
                  transition={{ delay: 0.65 }}
                  className="mt-8 flex flex-wrap gap-2"
                >
                  {[
                    { icon: ShieldCheck, label: "100% Legal" },
                    { icon: Gavel, label: "Base CDC" },
                    { icon: Target, label: "27 estados" },
                    { icon: ThumbsUp, label: "92% êxito" },
                  ].map(({ icon: Icon, label }) => (
                    <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-full text-xs text-white/60 backdrop-blur-sm">
                      <Icon className="w-3 h-3 text-emerald-400" />
                      {label}
                    </span>
                  ))}
                </motion.div>
              </div>

              {/* Right image */}
              <motion.div
                className="order-1 lg:order-2 flex justify-center lg:justify-end"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={heroVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.9, delay: 0.2 }}
              >
                <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-3xl blur-[80px]" />
                  <img
                    src={heroImg}
                    alt="AtentAI Limpa Nome - Regularização Jurídica"
                    className="relative w-full h-auto rounded-3xl shadow-2xl shadow-emerald-500/10"
                    loading="eager"
                  />
                  {/* Floating badge on image */}
                  <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 px-4 py-3 sm:px-5 sm:py-3.5 bg-[#0f172a]/90 border border-emerald-500/20 backdrop-blur-xl rounded-2xl shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-emerald-400 font-black text-lg leading-none">92%</p>
                        <p className="text-white/40 text-[10px] sm:text-xs mt-0.5">Taxa de êxito</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ChevronDown className="w-5 h-5 text-white/15" />
          </motion.div>
        </section>

        {/* ═══════════ SOCIAL PROOF BAR ═══════════ */}
        <Section className="py-12 sm:py-16 px-4 border-y border-white/[0.04] bg-white/[0.015]">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <StatItem end={23995} suffix="+" label="CPFs analisados" icon={UserCheck} />
            <StatItem end={12836} suffix="+" label="CNPJs analisados" icon={BarChart3} />
            <StatItem end={92} suffix="%" label="Taxa de êxito" icon={TrendingUp} />
            <StatItem end={27} suffix="" label="Estados atendidos" icon={Target} />
          </div>
        </Section>

        {/* ═══════════ PROBLEMA ═══════════ */}
        <Section className="px-4 py-14 sm:py-24" id="problema">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm font-semibold mb-6">
                <AlertTriangle className="w-4 h-4" /> VOCÊ SABIA?
              </span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight">
                O nome negativado{" "}
                <span className="bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">destrói</span>
                <br className="hidden sm:block" /> sua vida financeira
              </h2>
              <p className="mt-4 text-white/45 text-base sm:text-lg max-w-xl mx-auto">
                Mais do que uma dívida, é a sua liberdade travada em todas as frentes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Ban, title: "Crédito bloqueado", desc: "Cartões recusados, financiamentos negados, portas fechadas em todos os bancos." },
                { icon: XCircle, title: "Aluguel impossível", desc: "Ficha rejeitada em imobiliárias. Sem conseguir alugar nem um apartamento simples." },
                { icon: AlertTriangle, title: "Emprego comprometido", desc: "Empresas consultam CPF na contratação. Nome sujo pode custar sua vaga." },
                { icon: Lock, title: "Vida paralisada", desc: "Sem linha telefônica, sem plano de saúde, sem poder empreender." },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-red-500/[0.06] to-transparent border border-red-500/10 hover:border-red-500/25 transition-all duration-500"
                >
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-500/[0.06] via-emerald-500/[0.03] to-transparent border border-emerald-500/15 text-center"
            >
              <p className="text-lg sm:text-xl text-white/70 font-medium">
                <span className="text-emerald-400 font-bold">Mais de 40% das negativações no Brasil têm irregularidades</span>
                <br />
                <span className="text-white/40 text-base">e a maioria das pessoas não sabe que pode contestar.</span>
              </p>
            </motion.div>
          </div>
        </Section>

        {/* ═══════════ SOLUÇÃO ═══════════ */}
        <Section className="px-4 py-14 sm:py-24 relative" id="solucao">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.05),_transparent_70%)]" />
          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-semibold mb-6">
                <Zap className="w-4 h-4" /> COMO RESOLVEMOS
              </span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight mb-4">
                Análise jurídica inteligente{" "}
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                  com base na legislação brasileira
                </span>
              </h2>
              <p className="text-white/45 text-base sm:text-lg max-w-2xl mx-auto">
                Nada de promessas vazias. Aplicamos a lei ao seu favor com fundamento técnico e jurídico sólido.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {[
                { icon: Gavel, title: "Direito, não milagre", desc: "Fundamentação legal real baseada no CDC, Lei 14.181/21 e decisões dos tribunais.", highlight: true },
                { icon: Fingerprint, title: "Análise personalizada", desc: "Cada CPF e CNPJ é único. Estudamos cada detalhe para encontrar irregularidades.", highlight: false },
                { icon: ShieldCheck, title: "Proteção completa", desc: "Do diagnóstico à resolução, com contrato digital, suporte dedicado e acompanhamento.", highlight: false },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className={`group p-6 sm:p-8 rounded-2xl border transition-all duration-500 ${item.highlight ? "bg-emerald-500/[0.08] border-emerald-500/25 shadow-[0_0_40px_rgba(16,185,129,0.08)]" : "bg-white/[0.03] border-white/[0.06] hover:border-emerald-500/20"}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ${item.highlight ? "bg-emerald-500/20" : "bg-emerald-500/10"}`}>
                    <item.icon className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-white/45 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ═══════════ COMPARAÇÃO ═══════════ */}
        <Section className="px-4 py-14 sm:py-24" id="comparacao">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 sm:mb-14">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black">
                Renegociação <span className="text-white/20">vs</span>{" "}
                <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">Análise Jurídica</span>
              </h2>
              <p className="mt-3 text-white/40 text-base sm:text-lg">Entenda a diferença que muda tudo</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="p-5 sm:p-8 rounded-2xl bg-gradient-to-b from-red-500/[0.05] to-transparent border border-red-500/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="text-xl font-black text-red-400">Renegociação comum</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Você paga a dívida (total ou parcial)",
                    "Fica na mão do banco ou credor",
                    "Histórico negativo continua no sistema",
                    "Resolve o sintoma, não a causa",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3 text-white/50 text-sm">
                      <XCircle className="w-4 h-4 text-red-400/60 shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 sm:p-8 rounded-2xl bg-gradient-to-b from-emerald-500/[0.08] to-transparent border-2 border-emerald-500/25 relative shadow-[0_0_50px_rgba(16,185,129,0.08)]">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 bg-emerald-500 text-black text-[10px] sm:text-xs font-black rounded-full uppercase tracking-wider">
                  ✨ Recomendado
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-black text-emerald-400">Análise Jurídica AtentAI</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Busca irregularidades na negativação",
                    "Possibilidade real de remoção sem pagar",
                    "Fundamentado em lei (CDC + 14.181/21)",
                    "Ataca a raiz do problema definitivamente",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3 text-white/80 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center mt-12">
              <CTAButton text="EU QUERO LIMPAR MEU NOME" />
            </div>
          </div>
        </Section>

        {/* ═══════════ SAMARA CHAT ═══════════ */}
        <Section className="px-4 py-14 sm:py-24 relative" id="chat-samara">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.04),_transparent_60%)]" />
          <div className="relative max-w-5xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-semibold mb-6">
              <MessageCircle className="w-4 h-4" /> TIRE SUAS DÚVIDAS AGORA
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black mb-3">
              Fale com a{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">Samara</span>
            </h2>
            <p className="text-white/45 text-sm sm:text-lg max-w-lg mx-auto mb-10">
              Ela tira todas as suas dúvidas na hora e conecta você com o Guilherme Mesquita
            </p>
            <SamaraChatWidget />
          </div>
        </Section>

        {/* ═══════════ COMO FUNCIONA ═══════════ */}
        <Section className="px-4 py-14 sm:py-24 relative" id="como-funciona">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(16,185,129,0.05),_transparent_60%)]" />
          <div className="relative max-w-6xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-semibold mb-6">
              <Target className="w-4 h-4" /> PROCESSO SIMPLES
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black mb-4">
              Do contato à{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">regularização</span>
            </h2>
            <p className="text-white/40 mb-12 sm:mb-16 text-base sm:text-lg">4 etapas simples, sem burocracia</p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {[
                { step: "01", icon: Phone, title: "Contato", desc: "Fale com a gente pelo WhatsApp. Rápido, seguro e sem compromisso." },
                { step: "02", icon: Eye, title: "Diagnóstico", desc: "Equipe jurídica analisa cada negativação no seu CPF ou CNPJ." },
                { step: "03", icon: FileText, title: "Parecer", desc: "Receba o resultado da análise com as possibilidades reais." },
                { step: "04", icon: Headphones, title: "Resolução", desc: "Acompanhamos seu caso até a regularização completa." },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative p-4 sm:p-7 rounded-2xl bg-white/[0.025] border border-white/[0.05] hover:border-emerald-500/20 transition-all duration-500 group text-left"
                >
                  <span className="text-5xl sm:text-6xl font-black text-emerald-500/[0.06] absolute top-3 right-4 group-hover:text-emerald-500/10 transition-colors">
                    {item.step}
                  </span>
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">{item.title}</h3>
                  <p className="text-white/40 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ═══════════ DEPOIMENTOS ═══════════ */}
        <Section className="px-4 py-14 sm:py-24" id="depoimentos">
          <div className="max-w-6xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-semibold mb-6">
              <Heart className="w-4 h-4" /> RESULTADOS REAIS
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black mb-4">
              Quem{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">confiou</span>{" "}
              na AtentAI
            </h2>
            <p className="text-white/35 mb-12 sm:mb-14 text-base sm:text-lg">Histórias reais de clientes que reconquistaram sua liberdade financeira</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {[
                { name: "Marcos Oliveira", city: "Rio de Janeiro, RJ", text: "Negativado há 4 anos, já tinha desistido. Em menos de 2 meses, meu nome ficou limpo. Consegui financiar meu carro logo depois. Incrível!", rating: 5 },
                { name: "Patrícia Duarte", city: "Salvador, BA", text: "A equipe do Guilherme é séria de verdade. Me explicaram tudo, sem enrolação. Meu CNPJ estava travando tudo e agora consegui até crédito bancário.", rating: 5 },
                { name: "Rafael Mendes", city: "Curitiba, PR", text: "Fui atendido pela Samara primeiro e depois pelo Guilherme. Profissionais demais. Meu nome foi limpo e voltei a ter acesso a crédito. Recomendo muito!", rating: 5 },
                { name: "Ana Beatriz S.", city: "São Paulo, SP", text: "Achei que era golpe, mas pesquisei e decidi confiar. Melhor decisão. Em 45 dias meu nome estava regularizado e meu score subiu 200 pontos.", rating: 5 },
              ].map((d, i) => (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 sm:p-7 rounded-2xl bg-white/[0.025] border border-white/[0.06] text-left hover:border-emerald-500/15 transition-all duration-500"
                >
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(d.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                    ))}
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed mb-5 italic">"{d.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.04]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black font-black text-xs">
                      {d.name.charAt(0)}{d.name.split(" ")[1]?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{d.name}</p>
                      <p className="text-white/30 text-xs">{d.city}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ═══════════ ESPECIALISTA ═══════════ */}
        <Section className="px-4 py-14 sm:py-24 relative" id="especialista">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_rgba(16,185,129,0.06),_transparent_50%)]" />
          <div className="relative max-w-4xl mx-auto">
            <div className="p-6 sm:p-10 md:p-12 rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-emerald-500/[0.07] via-white/[0.02] to-transparent border border-emerald-500/15 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10">
                <div className="relative shrink-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.25)]">
                    <User className="w-14 h-14 sm:w-16 sm:h-16 text-black/80" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center">
                    <BadgeCheck className="w-4 h-4 text-black" />
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <h3 className="text-2xl sm:text-3xl font-black text-white mb-1">Guilherme Mesquita</h3>
                  <p className="text-emerald-400 font-semibold text-sm sm:text-base mb-4">
                    Especialista em Defesa do Consumidor e Regularização
                  </p>
                  <p className="text-white/55 leading-relaxed text-sm sm:text-base">
                    Mais de <span className="text-white font-semibold">8 anos</span> dedicados à análise de negativações indevidas e defesa dos
                    direitos do consumidor. Já conduziu a regularização de{" "}
                    <span className="text-emerald-400 font-semibold">milhares de CPFs e CNPJs</span> em todos os 27 estados brasileiros,
                    com atendimento humanizado e resultados comprovados.
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-6">
                    {[
                      { icon: Award, label: "+36.800 análises" },
                      { icon: Target, label: "27 estados" },
                      { icon: TrendingUp, label: "92% de êxito" },
                    ].map((s) => (
                      <span key={s.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-full text-white/60 text-xs font-medium">
                        <s.icon className="w-3.5 h-3.5 text-emerald-400" />
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ═══════════ OFERTA ═══════════ */}
        <Section className="px-4 py-14 sm:py-24" id="oferta">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-semibold mb-6">
              <CreditCard className="w-4 h-4" /> INVESTIMENTO
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black mb-3">
              Regularize seu nome{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">de verdade</span>
            </h2>
            <p className="text-white/40 mb-10 sm:mb-12 text-base sm:text-lg">Um investimento que pode mudar sua vida financeira para sempre</p>

            <div className="p-6 sm:p-10 md:p-14 rounded-2xl sm:rounded-[2rem] bg-gradient-to-b from-emerald-500/[0.08] to-transparent border-2 border-emerald-500/20 relative shadow-[0_0_60px_rgba(16,185,129,0.08)]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-gradient-to-r from-emerald-400 to-emerald-500 text-black font-black text-[10px] sm:text-xs rounded-full uppercase tracking-wider shadow-lg">
                🔥 Vagas limitadas esta semana
              </div>

              <div className="mb-10 mt-4">
                <p className="text-white/25 text-lg line-through mb-1">De R$ 1.500,00</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-xl sm:text-2xl text-white/40 font-bold">R$</span>
                  <span className="text-5xl sm:text-7xl md:text-8xl font-black bg-gradient-to-b from-emerald-300 to-emerald-500 bg-clip-text text-transparent leading-none">
                    840
                  </span>
                </div>
                <p className="text-white/45 mt-3 text-sm sm:text-base">
                  ou <span className="text-white font-bold">R$ 500</span> de entrada + 4x de <span className="text-white font-bold">R$ 85</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-md mx-auto mb-10">
                {[
                  "Análise jurídica completa",
                  "Acompanhamento integral do caso",
                  "Contrato digital seguro",
                  "Suporte dedicado via WhatsApp",
                  "Parecer de viabilidade antes do pagamento",
                  "Garantia de transparência total",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-2.5 text-white/65">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs sm:text-sm">{t}</span>
                  </div>
                ))}
              </div>

              <CTAButton size="xl" text="QUERO LIMPAR MEU NOME AGORA" />
              <p className="mt-5 text-white/35 text-xs sm:text-sm flex items-center justify-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <a href={`tel:+${WHATSAPP_NUMBER}`} className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                  {PHONE_DISPLAY}
                </a>
              </p>
            </div>
          </div>
        </Section>

        {/* ═══════════ GARANTIA ═══════════ */}
        <Section className="px-4 py-16 sm:py-20" id="garantia">
          <div className="max-w-3xl mx-auto">
            <div className="p-8 sm:p-10 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-500/[0.05] to-transparent border border-emerald-500/10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
                <Lock className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-4">Garantia de Transparência</h3>
              <p className="text-white/50 leading-relaxed text-sm sm:text-lg max-w-xl mx-auto">
                Se não houver viabilidade jurídica, <span className="text-white font-semibold">você fica sabendo antes de pagar</span>.
                Se o serviço não for cumprido conforme contratado, <span className="text-emerald-400 font-bold">devolvemos seu dinheiro</span>.
              </p>
            </div>
          </div>
        </Section>

        {/* ═══════════ FAQ ═══════════ */}
        <Section className="px-4 py-14 sm:py-24" id="faq">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-2xl sm:text-4xl font-black text-white">Perguntas frequentes</h2>
              <p className="text-white/35 mt-2 text-sm sm:text-base">Tudo que você precisa saber antes de dar o próximo passo</p>
            </div>
            <div className="space-y-2.5">
              {faqs.map((faq, i) => (
                <motion.button
                  key={i}
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full text-left p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/[0.025] border border-white/[0.05] hover:border-emerald-500/15 transition-all duration-300"
                  layout
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-white text-sm sm:text-base">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-emerald-400 shrink-0 transition-transform duration-300 ${activeFaq === i ? "rotate-180" : ""}`} />
                  </div>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 text-white/45 text-sm leading-relaxed overflow-hidden"
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

        {/* ═══════════ URGÊNCIA ═══════════ */}
        <Section className="px-4 py-14 sm:py-20" id="urgencia">
          <div className="max-w-3xl mx-auto text-center">
            <div className="p-6 sm:p-10 rounded-2xl bg-gradient-to-r from-red-500/[0.06] via-transparent to-emerald-500/[0.06] border border-white/[0.06]">
              <Timer className="w-10 h-10 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl sm:text-2xl font-black text-white mb-3">
                Vagas <span className="text-red-400">limitadas</span> por semana
              </h3>
              <p className="text-white/40 mb-6 text-sm sm:text-base max-w-md mx-auto">
                Atendimento personalizado exige dedicação. Por isso, aceitamos poucos casos por semana.
              </p>
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tracking-widest">
                  {urgencyMin}:{urgencySec.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        </Section>

        {/* ═══════════ CTA FINAL ═══════════ */}
        <section className="px-4 py-16 sm:py-24 pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(16,185,129,0.12),_transparent_60%)]" />
          <div className="relative max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-5">
              Pronto pra{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">reconquistar</span>
              <br />sua liberdade financeira?
            </h2>
            <p className="text-white/45 mb-8 sm:mb-10 text-sm sm:text-lg max-w-lg mx-auto">
              Fale agora com o Guilherme Mesquita. Sem compromisso, sem enrolação.
            </p>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-block group w-full sm:w-auto">
              <Button className="relative overflow-hidden bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-base md:text-lg px-5 sm:px-12 py-5 sm:py-8 rounded-2xl uppercase tracking-wider shadow-[0_0_50px_rgba(16,185,129,0.4)] hover:shadow-[0_0_70px_rgba(16,185,129,0.5)] transition-all duration-500 hover:-translate-y-1.5 w-full sm:w-auto">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 shrink-0" />
                <span className="leading-tight">QUERO LIMPAR MEU NOME AGORA</span>
              </Button>
            </a>
            <p className="mt-5 text-white/35 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-2">
              <a href={`tel:+${WHATSAPP_NUMBER}`} className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                <Phone className="w-3.5 h-3.5" />
                {PHONE_DISPLAY}
              </a>
            </p>
            <p className="mt-4 text-white/20 text-xs">AtentAI Regularização Jurídica</p>
          </div>
        </section>

        {/* ═══════════ FLOATING WHATSAPP ═══════════ */}
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-110 transition-all duration-300 group"
          aria-label="WhatsApp"
        >
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-black group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full animate-pulse" />
        </a>
      </div>
    </>
  );
}
