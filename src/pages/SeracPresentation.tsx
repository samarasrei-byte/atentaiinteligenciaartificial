import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Shield, BarChart3, Users, Brain,
  CheckCircle2, ArrowRight, ChevronDown,
  TrendingUp, Target, Zap, Building2, Scale,
  DollarSign, Calendar, Layers
} from "lucide-react";

/* ── Animations ── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" as const } },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

/* ── Corporate Card ── */
function Card({ children, className = "", accent = false }: { children: React.ReactNode; className?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border ${accent ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-white"} shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
      {children}
    </div>
  );
}

/* ── Funnel Step ── */
function FunnelStep({ value, label, width, index }: { value: string; label: string; width: string; index: number }) {
  return (
    <motion.div variants={fadeUp} className="flex flex-col items-center">
      <div className={`${width} mx-auto rounded-xl py-4 text-center mb-2 transition-all`} style={{ background: `linear-gradient(135deg, hsl(160 60% ${48 - index * 6}%), hsl(175 50% ${40 - index * 5}%))` }}>
        <span className="text-white font-bold text-lg">{value}</span>
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
          <span className="text-xs font-semibold text-emerald-700">R${values[i]}k</span>
          <div
            className="w-full rounded-t-lg"
            style={{
              height: `${(values[i] / max) * 100}%`,
              background: `linear-gradient(to top, hsl(160 60% 40%), hsl(175 50% 55%))`,
            }}
          />
          <span className="text-xs text-slate-400 mt-1">{m}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Section Wrapper ── */
function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`py-24 lg:py-32 px-6 ${className}`}>
      <motion.div
        className="max-w-5xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
      >
        {children}
      </motion.div>
    </section>
  );
}

/* ── Section Badge ── */
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-emerald-700 bg-emerald-100 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
      {children}
    </span>
  );
}

export default function SeracPresentation() {
  return (
    <>
      <Helmet>
        <title>SERAC Intelligence Platform | White Label powered by Atentai</title>
        <meta name="description" content="Apresentação institucional: SERAC Intelligence Platform — White Label estratégico powered by Atentai com Máquina de Prospecção Nacional de Contadores" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden font-sans">

        {/* ═══════ HERO ═══════ */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(160 40% 50%) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-emerald-100/40 blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-emerald-50/60 blur-3xl translate-y-1/3 -translate-x-1/4" />

          <motion.div className="relative z-10 max-w-4xl mx-auto px-6 text-center" initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp}>
              <Badge>White Label Estratégico</Badge>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight text-slate-900 mb-3">
              SERAC
            </motion.h1>
            <motion.p variants={fadeUp} className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-700 mb-3">
              Intelligence Platform
            </motion.p>
            <motion.p variants={fadeUp} className="text-lg text-slate-500 mb-3">
              Com Máquina de Prospecção Nacional de Contadores
            </motion.p>
            <motion.p variants={fadeIn} className="text-sm text-slate-400 tracking-widest uppercase">
              Powered by Atentai
            </motion.p>
            <motion.div variants={fadeIn} className="mt-16">
              <ChevronDown className="w-7 h-7 text-slate-300 mx-auto animate-bounce" />
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════ SLIDE 1 — OPORTUNIDADE DE MERCADO ═══════ */}
        <Section className="bg-slate-50">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <Badge>Oportunidade</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mt-2">
              O Mercado Contábil Brasileiro<br />
              na Era da <span className="text-emerald-700">Reforma Tributária</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            {[
              { icon: Users, value: "+520 mil", label: "Profissionais contábeis no Brasil" },
              { icon: Building2, value: "+90 mil", label: "Organizações contábeis ativas" },
            ].map((s, i) => (
              <motion.div key={i} variants={scaleIn}>
                <Card className="p-8 text-center">
                  <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <s.icon className="w-7 h-7 text-emerald-700" />
                  </div>
                  <div className="text-4xl font-black text-emerald-700 mb-2">{s.value}</div>
                  <p className="text-slate-500">{s.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp}>
            <Card className="p-8">
              <p className="text-slate-400 text-sm uppercase tracking-widest mb-6">Reforma Tributária 2026 exige reposicionamento estratégico</p>
              <p className="text-slate-600 mb-4 font-medium">Escritórios precisarão de:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: Brain, t: "Inteligência fiscal" },
                  { icon: BarChart3, t: "Simulação de impacto" },
                  { icon: Shield, t: "Compliance automatizado" },
                  { icon: Scale, t: "Suporte jurídico estruturado" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <item.icon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-slate-700">{item.t}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-12 text-center">
            <p className="text-2xl lg:text-3xl font-bold text-slate-900">
              Quem liderar agora <span className="text-emerald-700">domina o mercado da Reforma.</span>
            </p>
          </motion.div>
        </Section>

        {/* ═══════ SLIDE 2 — A SOLUÇÃO ═══════ */}
        <Section className="bg-white">
          <motion.div variants={scaleIn} className="text-center mb-6">
            <Badge>A Solução</Badge>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 mt-2">SERAC</h2>
            <p className="text-2xl lg:text-3xl font-bold text-emerald-700 mt-1">Intelligence Platform</p>
          </motion.div>
          <motion.p variants={fadeUp} className="text-slate-500 text-lg mb-10 max-w-2xl mx-auto text-center">
            Plataforma white label exclusiva da SERAC, com:
          </motion.p>

          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {[
              { icon: Brain, t: "Inteligência Fiscal com IA" },
              { icon: BarChart3, t: "Simulador da Reforma Tributária 2026" },
              { icon: Shield, t: "Agentes de IA para atendimento e compliance" },
              { icon: Target, t: "Prospecção ativa de contadores e escritórios" },
              { icon: Scale, t: "Suporte jurídico integrado" },
              { icon: Layers, t: "Dashboard executivo estratégico" },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="p-5 flex items-center gap-4 h-full">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-5 h-5 text-emerald-700" />
                  </div>
                  <span className="text-slate-700 font-medium">{f.t}</span>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.p variants={fadeIn} className="text-slate-400 text-sm tracking-widest uppercase text-center">Powered by Atentai</motion.p>
        </Section>

        {/* ═══════ SLIDE 3 — DIFERENCIAL ESTRATÉGICO ═══════ */}
        <Section className="bg-slate-50">
          <motion.div variants={fadeUp} className="text-center mb-4">
            <Badge>Diferencial</Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-bold text-slate-900 text-center mb-3">
            Não é Software.
          </motion.h2>
          <motion.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-bold text-center mb-12">
            É <span className="text-emerald-700">Infraestrutura de Crescimento.</span>
          </motion.h2>

          <div className="grid sm:grid-cols-2 gap-5 mb-14">
            {[
              { icon: Zap, t: "Tecnologia", d: "IA aplicada à gestão contábil" },
              { icon: Shield, t: "Autoridade técnica", d: "Posicionamento nacional" },
              { icon: Users, t: "Aquisição previsível de contadores", d: "Pipeline estruturado" },
              { icon: TrendingUp, t: "Receita recorrente escalável", d: "Crescimento sustentável" },
            ].map((d, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="p-6 h-full">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                    <d.icon className="w-6 h-6 text-emerald-700" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{d.t}</h3>
                  <p className="text-slate-500 text-sm">{d.d}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp}>
            <Card accent className="p-8 text-center">
              <p className="text-lg text-slate-700">
                SERAC deixa de ser apenas escritório contábil e passa a ser{" "}
                <span className="text-emerald-700 font-bold">plataforma nacional de inteligência fiscal.</span>
              </p>
            </Card>
          </motion.div>
        </Section>

        {/* ═══════ SLIDE 4 — MÁQUINA DE PROSPECÇÃO ═══════ */}
        <Section className="bg-white">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <Badge>Prospecção Incluída</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mt-2">
              Aquisição Ativa de <span className="text-emerald-700">Contadores</span>
            </h2>
          </motion.div>

          <motion.div variants={fadeUp} className="mb-10">
            <Card className="p-8">
              <p className="text-slate-400 text-sm uppercase tracking-widest mb-8">Prospecção mensal estruturada</p>
              <div className="space-y-5">
                <FunnelStep value="2.000" label="Contadores impactados por mês" width="w-full" index={0} />
                <FunnelStep value="10%" label="Taxa média de resposta → 200 respostas" width="w-[85%]" index={1} />
                <FunnelStep value="30%" label="Conversão para reunião → 60 reuniões" width="w-[65%]" index={2} />
                <FunnelStep value="20%" label="Taxa de fechamento → 12 contratos" width="w-[45%]" index={3} />
              </div>
            </Card>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { value: "12", label: "Novos contratos por mês", sub: "Ticket médio: R$ 2.500" },
              { value: "R$ 30k", label: "Receita adicional/mês", sub: "A partir do primeiro mês" },
              { value: "R$ 180k", label: "Acumulados em 6 meses", sub: "Crescimento composto" },
            ].map((r, i) => (
              <motion.div key={i} variants={scaleIn}>
                <Card className="p-6 text-center">
                  <div className="text-3xl font-black text-emerald-700 mb-2">{r.value}</div>
                  <p className="text-slate-700 font-medium mb-1">{r.label}</p>
                  <p className="text-slate-400 text-xs">{r.sub}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ═══════ SLIDE 5 — MODELO FINANCEIRO ═══════ */}
        <Section className="bg-slate-50">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <Badge>Investimento</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mt-2">Estrutura de Investimento</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <motion.div variants={fadeUp}>
              <Card className="p-8 h-full">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Modelo White Label + Prospecção
                </h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Setup estratégico</p>
                    <p className="text-2xl font-bold text-emerald-700">R$ 120.000 a R$ 180.000</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Mensalidade</p>
                    <p className="text-2xl font-bold text-emerald-700">R$ 30.000 a R$ 60.000</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card accent className="p-8 h-full">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Modelo Híbrido (Performance)
                </h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Mensalidade fixa</p>
                    <p className="text-2xl font-bold text-emerald-700">R$ 25.000</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">+ Performance</p>
                    <p className="text-2xl font-bold text-emerald-700">10% a 20%</p>
                    <p className="text-slate-500 text-sm mt-1">sobre novos contratos fechados</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          <motion.div variants={fadeUp} className="text-center">
            <Card className="inline-flex items-center gap-2 px-6 py-3">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-600 font-medium">Contrato mínimo: <strong className="text-slate-900">12 meses</strong></span>
            </Card>
          </motion.div>
        </Section>

        {/* ═══════ SLIDE 6 — PROJEÇÃO 12 MESES ═══════ */}
        <Section className="bg-white">
          <motion.div variants={fadeUp} className="text-center mb-6">
            <Badge>Projeção</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mt-2">Projeção de 12 Meses</h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {[
              { value: "12/mês", label: "Novos contratos" },
              { value: "144/ano", label: "Total de contratos" },
              { value: "R$ 2.500", label: "Ticket médio" },
            ].map((s, i) => (
              <motion.div key={i} variants={scaleIn}>
                <Card className="p-5 text-center">
                  <div className="text-2xl font-black text-emerald-700">{s.value}</div>
                  <p className="text-slate-500 text-sm mt-1">{s.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp}>
            <Card className="p-8">
              <ProjectionChart />
            </Card>
          </motion.div>

          <motion.div variants={scaleIn} className="mt-8 text-center">
            <Card accent className="inline-block px-10 py-6">
              <p className="text-sm text-slate-500 uppercase tracking-widest mb-2">Receita potencial anual</p>
              <p className="text-4xl lg:text-5xl font-black text-emerald-700">R$ 4.320.000</p>
            </Card>
          </motion.div>
        </Section>

        {/* ═══════ SLIDE 7 — POSICIONAMENTO FINAL ═══════ */}
        <Section className="bg-slate-900 text-white">
          <motion.div variants={fadeUp} className="text-center mb-4">
            <span className="inline-block text-emerald-400 bg-emerald-400/10 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
              Posicionamento
            </span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-bold text-white text-center mb-12">
            SERAC como <span className="text-emerald-400">Plataforma Nacional</span><br />da Reforma 2026
          </motion.h2>

          <motion.div variants={fadeUp} className="max-w-3xl mx-auto text-center space-y-6">
            <p className="text-xl text-slate-300 leading-relaxed">
              A SERAC não está adquirindo tecnologia.<br />
              <strong className="text-white">Está estruturando uma máquina de crescimento nacional.</strong>
            </p>
            <div className="w-16 h-px bg-emerald-500/40 mx-auto" />
            <p className="text-xl text-slate-300 leading-relaxed">
              A Reforma Tributária será o maior evento contábil da década.<br />
              <strong className="text-emerald-400">Quem liderar agora se torna referência definitiva.</strong>
            </p>
          </motion.div>
        </Section>

        {/* ═══════ SLIDE 8 — CTA ═══════ */}
        <Section className="bg-white">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <Badge>Próximo Passo</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mt-2">Próximo Passo</h2>
          </motion.div>

          <div className="max-w-2xl mx-auto space-y-4 mb-14">
            {[
              { step: "01", t: "Aprovação do modelo" },
              { step: "02", t: "Definição do formato de monetização" },
              { step: "03", t: "Início da implementação" },
              { step: "04", t: "Go-live estratégico" },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="p-5 flex items-center gap-5">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-700 font-bold text-sm">{s.step}</span>
                  </div>
                  <span className="text-slate-800 font-semibold text-lg">{s.t}</span>
                  <ArrowRight className="w-5 h-5 text-emerald-400 ml-auto" />
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div variants={scaleIn} className="text-center">
            <Card accent className="inline-block px-12 py-8">
              <p className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
                O momento de posicionamento é <span className="text-emerald-700">agora.</span>
              </p>
              <p className="text-slate-500">SERAC Intelligence Platform · Powered by Atentai</p>
            </Card>
          </motion.div>
        </Section>

        {/* Footer */}
        <footer className="py-8 px-6 text-center border-t border-slate-200 bg-white">
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} SERAC Intelligence Platform · Powered by Atentai</p>
        </footer>
      </div>
    </>
  );
}
