import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Shield, CheckCircle2, ArrowRight, Phone, MessageCircle,
  Clock, Users, Star, XCircle, CheckCircle, Ban, CreditCard,
  FileText, Headphones, Lock, Award, AlertTriangle, TrendingUp,
  ChevronDown, User
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Helmet } from "react-helmet-async";

const WHATSAPP_LINK = "https://wa.me/5511999999999?text=Ol%C3%A1%2C%20quero%20analisar%20meu%20caso%20de%20Limpa%20Nome";

function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function CTAButton({ className = "", size = "lg" }: { className?: string; size?: "lg" | "xl" }) {
  return (
    <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
      <Button
        className={`bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-wide shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:-translate-y-1 ${size === "xl" ? "text-lg px-10 py-7 rounded-2xl" : "text-base px-8 py-6 rounded-xl"} ${className}`}
      >
        <MessageCircle className="w-5 h-5 mr-2" />
        QUERO ANALISAR MEU CASO AGORA
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </a>
  );
}

export default function LimpaNomeLanding() {
  const navigate = useNavigate();
  const [urgencyMin, setUrgencyMin] = useState(14);
  const [urgencySec, setUrgencySec] = useState(59);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

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
    { q: "Isso é legal?", a: "Sim! Utilizamos mecanismos previstos no Código de Defesa do Consumidor e na legislação vigente. Toda análise é jurídica e 100% legal." },
    { q: "Preciso pagar a dívida?", a: "Não necessariamente. Se houver irregularidades na negativação, é possível buscar a remoção sem quitar o valor total." },
    { q: "Quanto tempo leva?", a: "Cada caso é único, mas em média a análise inicial é feita em até 48h úteis." },
    { q: "Funciona para CNPJ também?", a: "Sim! Atendemos tanto Pessoa Física (CPF) quanto Pessoa Jurídica (CNPJ)." },
  ];

  return (
    <>
      <Helmet>
        <title>Limpa Nome AtentAI — Regularize seu CPF ou CNPJ com Análise Jurídica</title>
        <meta name="description" content="Descubra se seu nome pode ser limpo pela lei. Análise jurídica completa, 100% legal, com atendimento em todo o Brasil. Vagas limitadas." />
      </Helmet>

      {/* ========== HERO ========== */}
      <div className="min-h-screen bg-black text-white overflow-x-hidden">
        <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-20 overflow-hidden">
          {/* BG Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-emerald-950/30" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[200px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[150px]" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            {/* Urgência badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-semibold mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Vagas limitadas esta semana • {urgencyMin}:{urgencySec.toString().padStart(2, '0')}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] mb-6"
            >
              Seu nome pode ser{" "}
              <span className="text-emerald-400">limpo pela lei</span>
              <br />
              <span className="text-white/60 text-3xl sm:text-4xl md:text-5xl">— mesmo com dívidas</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed"
            >
              Descubra agora se você pode sair da negativação{" "}
              <span className="text-white font-semibold">sem precisar quitar tudo imediatamente</span>
            </motion.p>

            {/* Bullets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-3 mb-10"
            >
              {[
                "Procedimento 100% legal",
                "Análise completa do seu caso",
                "Atendimento em todo o Brasil",
                "Garantia de satisfação",
              ].map((t) => (
                <span key={t} className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  {t}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <CTAButton size="xl" />
              <p className="mt-4 text-white/40 text-xs">Atendimento rápido via WhatsApp • Sem compromisso</p>
            </motion.div>
          </div>
        </section>

        {/* ========== SEÇÃO PROBLEMA ========== */}
        <Section className="px-4 py-20 bg-gray-950" id="problema">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Você sabe o que o <span className="text-red-400">nome negativado</span> faz com sua vida?
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Ter o nome sujo vai muito além de uma dívida. É a sua liberdade financeira travada.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Ban, title: "Crédito negado", desc: "Cartões, empréstimos e financiamentos recusados automaticamente." },
                { icon: XCircle, title: "Sem alugar imóvel", desc: "Ficha rejeitada em imobiliárias por restrição no CPF ou CNPJ." },
                { icon: AlertTriangle, title: "Vida travada", desc: "Oportunidades de emprego, parcerias e investimentos bloqueadas." },
              ].map((item) => (
                <div key={item.title} className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 text-center">
                  <item.icon className="w-10 h-10 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/60 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
              <p className="text-white/80 text-lg">
                <span className="text-emerald-400 font-bold">Muitas negativações no Brasil possuem irregularidades</span> — e você pode nem saber disso.
              </p>
            </div>
          </div>
        </Section>

        {/* ========== SEÇÃO SOLUÇÃO ========== */}
        <Section className="px-4 py-20 bg-black" id="solucao">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-6">
              <Shield className="w-4 h-4" /> A SOLUÇÃO
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
              Análise jurídica estratégica baseada no{" "}
              <span className="text-emerald-400">Código de Defesa do Consumidor</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-6 mt-10">
              {[
                { icon: Shield, title: "Não é milagre", desc: "É direito. Utilizamos fundamentos legais reais para analisar cada caso." },
                { icon: FileText, title: "Baseado na lei", desc: "CDC, Lei do Superendividamento e jurisprudências consolidadas." },
                { icon: User, title: "Caso individual", desc: "Cada situação é analisada com atenção aos detalhes do seu perfil." },
              ].map((item) => (
                <div key={item.title} className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                  <item.icon className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/60 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ========== COMPARAÇÃO ========== */}
        <Section className="px-4 py-20 bg-gray-950" id="comparacao">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-white text-center mb-12">
              Renegociação <span className="text-white/40">vs</span> <span className="text-emerald-400">Defesa Jurídica</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Renegociação */}
              <div className="p-8 rounded-2xl bg-red-500/5 border border-red-500/20">
                <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
                  <XCircle className="w-6 h-6" /> Renegociação
                </h3>
                <ul className="space-y-4">
                  {[
                    "Precisa pagar a dívida total",
                    "Depende da vontade do banco",
                    "Mantém histórico negativo",
                    "Apenas adia o problema",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3 text-white/70">
                      <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Defesa Jurídica */}
              <div className="p-8 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-black text-xs font-black rounded-full uppercase">
                  Recomendado
                </div>
                <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
                  <Shield className="w-6 h-6" /> Defesa Jurídica
                </h3>
                <ul className="space-y-4">
                  {[
                    "Análise de irregularidades na dívida",
                    "Possibilidade de remoção da negativação",
                    "Baseado no CDC e legislação vigente",
                    "Resolve a causa raiz do problema",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3 text-white/90">
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center mt-10">
              <CTAButton />
            </div>
          </div>
        </Section>

        {/* ========== COMO FUNCIONA ========== */}
        <Section className="px-4 py-20 bg-black" id="como-funciona">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-12">
              Como funciona? <span className="text-emerald-400">4 passos simples</span>
            </h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { step: "1", icon: Phone, title: "Contato", desc: "Fale conosco pelo WhatsApp e envie seus dados básicos." },
                { step: "2", icon: FileText, title: "Análise", desc: "Nossa equipe jurídica analisa detalhadamente seu caso." },
                { step: "3", icon: CheckCircle, title: "Viabilidade", desc: "Você recebe o parecer com as possibilidades reais." },
                { step: "4", icon: Headphones, title: "Acompanhamento", desc: "Acompanhamos todo o processo até a resolução." },
              ].map((item) => (
                <div key={item.step} className="relative p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-black font-black text-lg flex items-center justify-center mx-auto mb-4">
                    {item.step}
                  </div>
                  <item.icon className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                  <h3 className="font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-white/50 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ========== PROVA SOCIAL ========== */}
        <Section className="px-4 py-20 bg-gray-950" id="depoimentos">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Quem já <span className="text-emerald-400">regularizou</span> recomenda
            </h2>
            <p className="text-white/50 mb-12">Histórias reais de quem saiu da negativação</p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "Ana Paula R.", city: "São Paulo, SP", text: "Fiquei 3 anos negativada e achava que não tinha solução. Em poucas semanas meu nome ficou limpo. Recomendo demais!" },
                { name: "Carlos Eduardo M.", city: "Belo Horizonte, MG", text: "O atendimento foi rápido e transparente. Me explicaram tudo e conduziram o caso com muita seriedade. Confiança total." },
                { name: "Fernanda Lima S.", city: "Curitiba, PR", text: "Minha empresa estava travada por causa do CNPJ negativado. Resolveram e agora consegui até linha de crédito. Muito grata!" },
              ].map((d) => (
                <div key={d.name} className="p-6 rounded-2xl bg-white/5 border border-white/10 text-left">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                    ))}
                  </div>
                  <p className="text-white/80 text-sm mb-4 leading-relaxed italic">"{d.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                      {d.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{d.name}</p>
                      <p className="text-white/40 text-xs">{d.city}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ========== AUTORIDADE ========== */}
        <Section className="px-4 py-20 bg-black" id="especialista">
          <div className="max-w-3xl mx-auto">
            <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-white/5 border border-emerald-500/20">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-28 h-28 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center shrink-0">
                  <User className="w-14 h-14 text-emerald-400" />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-black text-white mb-1">Guilherme Barros</h3>
                  <p className="text-emerald-400 font-semibold mb-4">Especialista em Regularização Jurídica • +8 anos de experiência</p>
                  <p className="text-white/70 leading-relaxed">
                    Especialista em análise de negativações e defesa do consumidor. Já ajudou centenas de pessoas e empresas a 
                    regularizarem sua situação cadastral utilizando mecanismos legais previstos no CDC. Atendimento humanizado, 
                    transparente e com resultados comprovados.
                  </p>
                  <div className="flex flex-wrap gap-4 mt-6">
                    {[
                      { icon: Award, label: "+500 casos" },
                      { icon: Users, label: "Todo Brasil" },
                      { icon: TrendingUp, label: "92% êxito" },
                    ].map((s) => (
                      <span key={s.label} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/80 text-xs font-medium">
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

        {/* ========== OFERTA ========== */}
        <Section className="px-4 py-20 bg-gray-950" id="oferta">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Regularize seu nome com <span className="text-emerald-400">acompanhamento jurídico</span>
            </h2>
            <p className="text-white/50 mb-10">Investimento único que pode mudar sua vida financeira</p>

            <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-transparent border-2 border-emerald-500/30 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-emerald-500 text-black font-black text-sm rounded-full uppercase">
                Oferta Especial
              </div>

              {/* Preço */}
              <div className="mb-8">
                <p className="text-white/40 text-lg line-through mb-1">De R$ 1.500,00</p>
                <p className="text-5xl sm:text-6xl font-black text-emerald-400">R$ 747</p>
                <p className="text-white/60 mt-2 text-sm">
                  ou entrada de <span className="text-white font-semibold">R$ 500</span> + 3x de <span className="text-white font-semibold">R$ 100</span>
                </p>
              </div>

              {/* O que inclui */}
              <div className="grid sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto mb-10">
                {[
                  "Análise completa do caso",
                  "Possível ação jurídica",
                  "Acompanhamento integral",
                  "Contrato digital seguro",
                  "Suporte dedicado via WhatsApp",
                  "Garantia de transparência",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-white/80 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    {t}
                  </div>
                ))}
              </div>

              <CTAButton size="xl" />
            </div>
          </div>
        </Section>

        {/* ========== GARANTIA ========== */}
        <Section className="px-4 py-16 bg-black" id="garantia">
          <div className="max-w-3xl mx-auto">
            <div className="p-8 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center">
              <Lock className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-white mb-4">Garantia de Transparência</h3>
              <p className="text-white/70 leading-relaxed max-w-xl mx-auto">
                Se não houver viabilidade jurídica, <span className="text-white font-semibold">você é informado antes de qualquer cobrança</span>.
                Se o serviço não for cumprido conforme o contrato, <span className="text-emerald-400 font-semibold">devolvemos seu dinheiro</span>.
              </p>
            </div>
          </div>
        </Section>

        {/* ========== FAQ ========== */}
        <Section className="px-4 py-20 bg-gray-950" id="faq">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-white text-center mb-10">Perguntas Frequentes</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <button
                  key={i}
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full text-left p-5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-white/50 transition-transform ${activeFaq === i ? "rotate-180" : ""}`} />
                  </div>
                  {activeFaq === i && (
                    <p className="mt-3 text-white/60 text-sm leading-relaxed">{faq.a}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* ========== URGÊNCIA FINAL ========== */}
        <Section className="px-4 py-16 bg-black" id="urgencia">
          <div className="max-w-3xl mx-auto text-center">
            <div className="p-8 rounded-2xl bg-gradient-to-r from-red-500/10 to-emerald-500/10 border border-white/10">
              <Clock className="w-10 h-10 text-red-400 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-white mb-3">
                Estamos liberando <span className="text-red-400">poucas vagas</span> por semana
              </h3>
              <p className="text-white/60 mb-6">
                Devido à alta demanda e ao atendimento personalizado, trabalhamos com número limitado de casos simultâneos.
              </p>
              <p className="text-emerald-400 font-bold text-lg mb-6">
                Tempo restante para esta oferta: {urgencyMin}:{urgencySec.toString().padStart(2, '0')}
              </p>
            </div>
          </div>
        </Section>

        {/* ========== CTA FINAL ========== */}
        <section className="px-4 py-24 bg-gradient-to-t from-emerald-950/30 to-black text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Descubra agora se seu nome pode ser <span className="text-emerald-400">regularizado</span>
            </h2>
            <p className="text-white/60 mb-10 text-lg">
              Converse com nosso especialista gratuitamente. Sem compromisso.
            </p>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xl px-12 py-8 rounded-2xl uppercase tracking-wide shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 transition-all duration-300 hover:-translate-y-1">
                <MessageCircle className="w-6 h-6 mr-3" />
                FALAR COM ESPECIALISTA NO WHATSAPP
              </Button>
            </a>
            <p className="mt-6 text-white/30 text-xs">AtentAI • Regularização Jurídica • CNPJ ativo</p>
          </div>
        </section>

        {/* ========== FLOATING WHATSAPP ========== */}
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-110 transition-all duration-300"
          aria-label="WhatsApp"
        >
          <MessageCircle className="w-7 h-7 text-white" />
        </a>
      </div>
    </>
  );
}
