import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useRef, useEffect, useMemo } from "react";
import {
  Zap, Shield, BarChart3, Clock, Users, Brain,
  CheckCircle2, XCircle, ArrowRight, MessageCircle,
  CalendarDays, Rocket, TrendingUp, Target, Layers,
  ChevronDown, Sparkles, Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Presentation {
  id: string;
  slug: string;
  client_name: string;
  segment: string;
  headline: string;
  subheadline: string;
  metrics: { tasks_automated: number; hours_saved: number; productivity_increase: number; clients_impacted: number; active_agents: number };
  roi_data: { monthly_hours_saved: number; hourly_rate_brl: number; annual_projection_multiplier: number };
  testimonials: { name: string; company: string; text: string; metric: string }[];
  sections_config: Record<string, boolean>;
  cta_whatsapp: string;
  cta_calendar_link: string;
}

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let frame: number; const dur = 2000; const start = performance.now();
    const animate = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * ease).toLocaleString("pt-BR") + suffix;
      if (p < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

export default function SalesPresentation() {
  const { slug } = useParams<{ slug: string }>();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: pres, isLoading } = useQuery({
    queryKey: ["presentation", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_presentations")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();
      if (error) throw error;
      // increment view
      supabase.from("sales_presentations").update({ view_count: (data.view_count || 0) + 1 }).eq("id", data.id).then();
      return data as unknown as Presentation;
    },
    enabled: !!slug,
  });

  const roi = useMemo(() => {
    if (!pres) return { monthly: 0, annual: 0 };
    const m = pres.roi_data.monthly_hours_saved * pres.roi_data.hourly_rate_brl;
    return { monthly: m, annual: m * pres.roi_data.annual_projection_multiplier };
  }, [pres]);

  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">Carregando apresentação...</p>
      </div>
    </div>
  );

  if (!pres) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground text-lg">Apresentação não encontrada.</p>
    </div>
  );

  const s = pres.sections_config;
  const features = [
    { icon: Zap, title: "Automação de Processos", desc: "Elimine tarefas repetitivas com IA" },
    { icon: Brain, title: "Gestão Inteligente", desc: "Decisões baseadas em dados reais" },
    { icon: Shield, title: "Redução de Erros", desc: "Validação automática de documentos" },
    { icon: Clock, title: "Economia de Tempo", desc: "Processos 3x mais rápidos" },
    { icon: Target, title: "Organização de Demandas", desc: "Fluxos otimizados e rastreáveis" },
    { icon: BarChart3, title: "Relatórios Estratégicos", desc: "Insights financeiros em tempo real" },
    { icon: Users, title: "Gestão de Equipe", desc: "Produtividade monitorada" },
    { icon: TrendingUp, title: "Monitoramento", desc: "KPIs e métricas automatizadas" },
    { icon: Layers, title: "Integração Financeira", desc: "Dados conectados e centralizados" },
  ];

  return (
    <>
      <Helmet>
        <title>{pres.client_name} | Atentai - Apresentação Comercial</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div ref={containerRef} className="min-h-screen bg-background text-foreground overflow-x-hidden">

        {/* ===== HERO ===== */}
        {s.hero && (
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div
              className="absolute inset-0 z-0"
              style={{ background: "var(--gradient-hero)" }}
            />
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_30%_20%,hsl(175_65%_35%/0.15),transparent_50%)]" />
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_70%_80%,hsl(45_95%_55%/0.08),transparent_50%)]" />

            <motion.div
              className="relative z-10 max-w-5xl mx-auto px-6 text-center"
              initial="hidden" animate="visible" variants={stagger}
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/80 text-sm mb-8">
                <Sparkles className="w-4 h-4" />
                Apresentação exclusiva para {pres.client_name}
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6">
                {pres.headline.replace(/seu escritório/gi, pres.client_name)}
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed">
                {pres.subheadline}
              </motion.p>

              <motion.div variants={fadeUp}>
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6 rounded-2xl shadow-lg gap-2 group">
                  Quero ver como funciona
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-16 animate-bounce">
                <ChevronDown className="w-8 h-8 text-white/40 mx-auto" />
              </motion.div>
            </motion.div>
          </section>
        )}

        {/* ===== O QUE É ===== */}
        {s.what_is && (
          <section className="py-24 lg:py-32 px-6">
            <motion.div className="max-w-4xl mx-auto text-center" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Bot className="w-4 h-4" /> Conheça o Atentai
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-bold mb-6">
                A plataforma de <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">inteligência contábil</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                O Atentai combina automação inteligente, IA e gestão estratégica para transformar escritórios de contabilidade em operações altamente eficientes e lucrativas.
              </motion.p>
            </motion.div>
          </section>
        )}

        {/* ===== FEATURES ===== */}
        {s.features && (
          <section className="py-24 lg:py-32 px-6 bg-muted/30">
            <motion.div className="max-w-6xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
              <motion.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-bold text-center mb-4">O que o Atentai faz por você</motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground text-center mb-16 text-lg">Cada funcionalidade pensada para o contador moderno</motion.p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((f, i) => (
                  <motion.div key={i} variants={fadeUp}
                    className="group bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <f.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                    <p className="text-muted-foreground text-sm">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* ===== SOCIAL PROOF ===== */}
        {s.social_proof && (
          <section className="py-24 lg:py-32 px-6" style={{ background: "var(--gradient-hero)" }}>
            <motion.div className="max-w-5xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
              <motion.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-bold text-white text-center mb-16">Números que falam por si</motion.h2>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
                {[
                  { v: pres.metrics.tasks_automated, l: "Tarefas Automatizadas", s: "+" },
                  { v: pres.metrics.hours_saved, l: "Horas Economizadas", s: "+" },
                  { v: pres.metrics.productivity_increase, l: "Aumento de Produtividade", s: "%" },
                  { v: pres.metrics.clients_impacted, l: "Clientes Impactados", s: "+" },
                  { v: pres.metrics.active_agents, l: "Agentes Ativos", s: "" },
                ].map((m, i) => (
                  <motion.div key={i} variants={fadeUp} className="text-center">
                    <div className="text-4xl lg:text-5xl font-extrabold text-accent mb-2">
                      <CountUp target={m.v} suffix={m.s === "%" ? "%" : ""} />
                      {m.s === "+" && <span className="text-accent/60 text-2xl">+</span>}
                    </div>
                    <p className="text-white/60 text-sm">{m.l}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* ===== PAIN POINTS ===== */}
        {s.pain_points && (
          <section className="py-24 lg:py-32 px-6">
            <motion.div className="max-w-4xl mx-auto text-center" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
              <motion.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-bold mb-6">Você se identifica?</motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-12">Os desafios que todo contador enfrenta — e que o Atentai resolve.</motion.p>
              <div className="grid sm:grid-cols-2 gap-4 text-left">
                {["Excesso de tarefas manuais consumindo seu dia", "Falta de controle sobre prazos e entregas", "Retrabalho constante por erros evitáveis", "Equipe sobrecarregada e desmotivada", "Falta de visão estratégica sobre o negócio"].map((p, i) => (
                  <motion.div key={i} variants={fadeUp} className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{p}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* ===== TRANSFORMATION ===== */}
        {s.transformation && (
          <section className="py-24 lg:py-32 px-6 bg-muted/30">
            <motion.div className="max-w-5xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
              <motion.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-bold text-center mb-16">A Transformação</motion.h2>
              <div className="grid md:grid-cols-2 gap-8">
                <motion.div variants={fadeUp} className="bg-card rounded-2xl p-8 border border-destructive/20">
                  <h3 className="text-xl font-bold text-destructive mb-6">❌ Antes do Atentai</h3>
                  {["Planilhas desconectadas", "Processos 100% manuais", "Falta de controle", "Decisões no escuro", "Equipe improdutiva"].map((t, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 text-muted-foreground">
                      <XCircle className="w-4 h-4 text-destructive flex-shrink-0" /><span>{t}</span>
                    </div>
                  ))}
                </motion.div>
                <motion.div variants={fadeUp} className="bg-card rounded-2xl p-8 border border-success/20 shadow-lg">
                  <h3 className="text-xl font-bold text-success mb-6">✅ Com o Atentai</h3>
                  {["Sistema inteligente e integrado", "Automação com IA", "Controle total em tempo real", "Decisões estratégicas com dados", "Equipe 3x mais produtiva"].map((t, i) => (
                    <div key={i} className="flex items-center gap-3 py-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" /><span className="font-medium">{t}</span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </section>
        )}

        {/* ===== ROI ===== */}
        {s.roi && (
          <section className="py-24 lg:py-32 px-6">
            <motion.div className="max-w-4xl mx-auto text-center" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
              <motion.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-bold mb-4">Simulação de ROI</motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-12">Projeção personalizada para {pres.client_name}</motion.p>
              <div className="grid sm:grid-cols-3 gap-6">
                <motion.div variants={fadeUp} className="bg-card rounded-2xl p-8 border border-border/50">
                  <Clock className="w-10 h-10 text-primary mx-auto mb-4" />
                  <div className="text-4xl font-extrabold text-primary mb-2">{pres.roi_data.monthly_hours_saved}h</div>
                  <p className="text-muted-foreground text-sm">Horas economizadas/mês</p>
                </motion.div>
                <motion.div variants={fadeUp} className="bg-card rounded-2xl p-8 border border-accent/30 shadow-lg">
                  <TrendingUp className="w-10 h-10 text-accent mx-auto mb-4" />
                  <div className="text-4xl font-extrabold text-accent mb-2">R$ {roi.monthly.toLocaleString("pt-BR")}</div>
                  <p className="text-muted-foreground text-sm">Economia mensal estimada</p>
                </motion.div>
                <motion.div variants={fadeUp} className="bg-primary rounded-2xl p-8 text-primary-foreground shadow-xl">
                  <Rocket className="w-10 h-10 mx-auto mb-4 opacity-80" />
                  <div className="text-4xl font-extrabold mb-2">R$ {roi.annual.toLocaleString("pt-BR")}</div>
                  <p className="text-sm opacity-80">Projeção anual</p>
                </motion.div>
              </div>
            </motion.div>
          </section>
        )}

        {/* ===== TESTIMONIALS ===== */}
        {s.testimonials && pres.testimonials?.length > 0 && (
          <section className="py-24 lg:py-32 px-6 bg-muted/30">
            <motion.div className="max-w-5xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
              <motion.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-bold text-center mb-16">Cases de Sucesso</motion.h2>
              <div className="grid md:grid-cols-3 gap-6">
                {pres.testimonials.map((t, i) => (
                  <motion.div key={i} variants={fadeUp} className="bg-card rounded-2xl p-6 border border-border/50">
                    <div className="bg-accent/10 text-accent font-bold text-sm px-3 py-1 rounded-full inline-block mb-4">{t.metric}</div>
                    <p className="text-muted-foreground mb-4 italic">"{t.text}"</p>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.company}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* ===== CTA FINAL ===== */}
        {s.cta && (
          <section className="py-24 lg:py-32 px-6 relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,hsl(45_95%_55%/0.08),transparent_60%)]" />
            <motion.div className="max-w-3xl mx-auto text-center relative z-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-bold text-white mb-6">
                Pronto para transformar o {pres.client_name}?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-white/70 text-lg mb-10">
                Junte-se aos escritórios que já economizam tempo e dinheiro com o Atentai.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6 rounded-2xl gap-2 group">
                  <Rocket className="w-5 h-5" />
                  Quero implementar no meu escritório
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                {pres.cta_whatsapp && (
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-2xl gap-2" asChild>
                    <a href={`https://wa.me/${pres.cta_whatsapp}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-5 h-5" /> Falar no WhatsApp
                    </a>
                  </Button>
                )}
                {pres.cta_calendar_link && (
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-2xl gap-2" asChild>
                    <a href={pres.cta_calendar_link} target="_blank" rel="noopener noreferrer">
                      <CalendarDays className="w-5 h-5" /> Agendar Reunião
                    </a>
                  </Button>
                )}
              </motion.div>
            </motion.div>
          </section>
        )}

        {/* Footer */}
        <footer className="py-8 px-6 text-center">
          <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} Atentai · Inteligência Artificial para Contadores</p>
        </footer>
      </div>
    </>
  );
}
