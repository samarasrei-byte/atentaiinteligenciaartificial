import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Sparkles, ArrowRight, ShieldCheck, Zap, Bot, Users, TrendingUp, Calculator,
  FileCheck2, MessageCircle, Crown, CheckCircle2, Star, Building2, Rocket,
  BarChart3, Lock, Clock, Award, Target, Briefcase, HeartHandshake, Globe2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const DIFFERENTIALS = [
  { icon: Calculator, title: "Simulador IBS + CBS", desc: "Compare cenários antes e depois da Reforma Tributária 2026 com precisão de LC 214/2025." },
  { icon: Bot, title: "IA Fiscal Proprietária", desc: "Motor de IA treinado exclusivamente na legislação brasileira. Respostas em segundos, 24/7." },
  { icon: FileCheck2, title: "Análise de IR com IA", desc: "OCR + validação legal automática. Detecta oportunidades de restituição e evita malha fina." },
  { icon: HeartHandshake, title: "Limpa Nome Profissional", desc: "Negociação assistida com equipe especializada. Recuperação de crédito com transparência total." },
  { icon: Briefcase, title: "Marketplace de Contadores", desc: "Rede de contadores certificados prontos para atender empresas, autônomos e MEIs." },
  { icon: BarChart3, title: "BI Fiscal & Painel Empresa", desc: "Dashboards em tempo real: DRE, fluxo de caixa, compliance e projeções tributárias." },
];

const MODULES = [
  { name: "Simulador Tributário", price: "R$ 39,99/mês", tag: "Entry" },
  { name: "Plano Autônomo", price: "R$ 65/mês", tag: "MEI & PF" },
  { name: "Plano Premium", price: "R$ 157/mês", tag: "Empresa" },
  { name: "IR — Simples/Completo", price: "R$ 89 / R$ 189", tag: "Anual" },
  { name: "Limpa Nome", price: "R$ 840", tag: "One-shot" },
  { name: "Emissão de NF", price: "R$ 97/mês", tag: "Recorrente" },
];

const MARKET_STATS = [
  { value: "R$ 2,3 tri", label: "Arrecadação tributária BR 2025" },
  { value: "21 mi", label: "MEIs e autônomos ativos" },
  { value: "20 mi", label: "Empresas impactadas pela reforma" },
  { value: "63 mi", label: "Brasileiros negativados (SPC/Serasa)" },
];

const COMPETITORS = [
  { us: "IA proprietária treinada em LC 214/2025", them: "Chatbots genéricos sem base legal" },
  { us: "Checkout interno, zero fricção", them: "Redirecionamentos e cadastros longos" },
  { us: "Contadores humanos + IA no mesmo hub", them: "Ou software puro, ou consultoria cara" },
  { us: "A partir de R$ 39,99/mês", them: "ERPs fiscais a partir de R$ 500/mês" },
  { us: "Mobile-first, PWA instalável", them: "Sistemas desktop legados" },
];

const TESTIMONIALS = [
  { name: "Marina S.", role: "Autônoma — Design", text: "Descobri que pagaria R$ 4.200 a mais em 2027 sem me preparar. O simulador salvou meu negócio." },
  { name: "Carlos R.", role: "MEI — E-commerce", text: "Em 3 minutos entendi o impacto real do IBS. A IA respondeu tudo que meu contador cobrava R$ 300 pra explicar." },
  { name: "Contab. Priscila", role: "Escritório contábil", text: "Migrei 40 clientes pra plataforma. O painel de compliance economiza 12h/semana da minha equipe." },
];

const FAQS = [
  { q: "O que é o Atentai exatamente?", a: "É uma plataforma completa de inteligência fiscal com IA proprietária, simuladores, análise de IR, limpa nome, marketplace de contadores e BI. Um ecossistema fiscal em um só lugar." },
  { q: "Preciso ser contador para usar?", a: "Não. A plataforma atende empresas, autônomos, MEIs e pessoas físicas com linguagem simples. Contadores têm um hub profissional dedicado." },
  { q: "A IA substitui meu contador?", a: "Não substitui — potencializa. A IA cuida das dúvidas do dia a dia e cálculos; o contador fica livre para estratégia. Também temos contadores humanos no marketplace." },
  { q: "Quanto tempo até ver resultado?", a: "O simulador mostra economia projetada em minutos. Assinantes acessam relatórios completos imediatamente." },
  { q: "Existe garantia?", a: "Sim. 7 dias de garantia incondicional em todos os planos recorrentes. Cancele com 1 clique se não amar." },
  { q: "Como funciona o pagamento?", a: "Mercado Pago — Pix, cartão ou boleto. Recorrência automática e segura, com nota fiscal emitida." },
  { q: "Meus dados estão seguros?", a: "Sim. Criptografia ponta-a-ponta, RLS em 100% do banco, LGPD compliant e infraestrutura Supabase enterprise." },
];

export default function VenderAtentai() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Atentai — A Plataforma Fiscal Completa para a Reforma Tributária 2026</title>
        <meta name="description" content="Simulador IBS/CBS, IA fiscal 24/7, análise de IR, limpa nome e marketplace de contadores. A partir de R$ 39,99/mês. 7 dias de garantia." />
        <link rel="canonical" href="https://www.atentai.com.br/vender-atentai" />
        <meta property="og:title" content="Atentai — Inteligência Fiscal Completa" />
        <meta property="og:description" content="Tudo que sua empresa precisa para a Reforma Tributária 2026 em uma única plataforma." />
        <meta property="og:type" content="product" />
        <meta property="og:url" content="https://www.atentai.com.br/vender-atentai" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* HERO */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[160px] opacity-40" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[140px] opacity-40" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="mb-6 bg-accent/15 text-accent border-accent/30 hover:bg-accent/20">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Reforma Tributária 2026 · LC 214/2025
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
              Toda a inteligência fiscal do Brasil,
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
                em uma plataforma só.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              Simulador IBS + CBS, IA fiscal 24/7, análise de IR, limpa nome e marketplace
              de contadores certificados. <span className="text-foreground font-semibold">Preparado para 2026.</span>
            </p>

            <p className="text-base text-muted-foreground/80 max-w-xl mx-auto mb-10">
              Mais de <strong className="text-foreground">20 milhões de empresas</strong> serão impactadas.
              Você pode ser uma das que economiza — ou uma das que paga a mais.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button
                size="lg"
                onClick={() => navigate('/pricing')}
                className="w-full sm:w-auto text-lg px-10 py-7 bg-gradient-to-r from-accent to-orange-500 hover:opacity-90 shadow-2xl shadow-accent/30 group"
              >
                <Crown className="w-5 h-5 mr-2" />
                Começar agora — R$ 39,99/mês
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/simulador')}
                className="w-full sm:w-auto text-lg px-8 py-7"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Testar simulador grátis
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-success" /> 7 dias de garantia</div>
              <div className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-success" /> LGPD compliant</div>
              <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-success" /> Cancele com 1 clique</div>
              <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-accent fill-accent" /> 4.9/5 · +2.400 usuários</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MARKET STATS */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">O mercado</p>
            <h2 className="text-2xl md:text-3xl font-bold">Um oceano de oportunidade — e de risco.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {MARKET_STATS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {s.value}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFFERENTIALS */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <Badge variant="secondary" className="mb-4">Diferenciais</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Por que o Atentai é <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">diferente</span>?
            </h2>
            <p className="text-muted-foreground text-lg">
              Não somos mais um chatbot. Somos o único ecossistema fiscal com IA proprietária,
              contadores humanos e módulos completos rodando juntos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DIFFERENTIALS.map((d, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="h-full hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary/20">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg">
                      <d.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{d.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES / MARKETPLACE */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <Badge variant="secondary" className="mb-4">Módulos & Preços</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Um marketplace, <span className="text-accent">tudo dentro</span>.
            </h2>
            <p className="text-muted-foreground text-lg">
              Escolha só o que precisa. Combine planos. Sem taxa de setup, sem fidelidade.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {MODULES.map((m, i) => (
              <Card key={i} className="hover:border-primary/40 transition-colors">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{m.name}</span>
                      <Badge variant="outline" className="text-[10px]">{m.tag}</Badge>
                    </div>
                    <p className="text-lg font-bold text-primary">{m.price}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button size="lg" onClick={() => navigate('/pricing')} className="bg-primary hover:bg-primary/90">
              Ver todos os planos <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* VS COMPETITORS */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4">Comparativo</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Atentai vs. o resto do mercado</h2>
          </div>

          <div className="rounded-2xl border-2 border-border overflow-hidden">
            <div className="grid grid-cols-2 bg-muted/50 p-4 font-semibold">
              <div className="flex items-center gap-2 text-primary"><Award className="w-5 h-5" /> Atentai</div>
              <div className="text-muted-foreground">Outros</div>
            </div>
            {COMPETITORS.map((c, i) => (
              <div key={i} className={`grid grid-cols-2 p-4 border-t border-border ${i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                <div className="flex items-start gap-2 pr-4">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{c.us}</span>
                </div>
                <div className="text-sm text-muted-foreground pl-4 border-l border-border">{c.them}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-20 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <Badge variant="secondary" className="mb-4">Prova social</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Quem usa, não volta mais atrás.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i} className="hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-accent fill-accent" />
                    ))}
                  </div>
                  <p className="text-foreground/90 italic mb-4">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-border">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* GUARANTEE */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="border-2 border-success/40 bg-gradient-to-br from-success/5 to-background">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="inline-flex w-16 h-16 rounded-full bg-success/15 items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Garantia incondicional de 7 dias</h2>
              <p className="text-muted-foreground text-lg mb-6">
                Teste tudo. Se não sentir que economizou ao menos 10× o valor do plano em clareza fiscal,
                devolvemos <strong>100%</strong> do valor. Sem perguntas, sem burocracia, cancele com 1 clique.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success" /> Reembolso automático</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success" /> Sem fidelidade</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success" /> Suporte humano</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Perguntas frequentes</Badge>
            <h2 className="text-3xl md:text-5xl font-bold">Tudo que você precisa saber</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border rounded-xl px-5 bg-background">
                <AccordionTrigger className="text-left font-semibold hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent)/0.4)_0%,transparent_50%)]" />

        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <Rocket className="w-14 h-14 text-white mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
            A Reforma começa em 2026.<br />
            <span className="text-accent-foreground">Você começa hoje.</span>
          </h2>
          <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto">
            Cada mês sem se preparar é dinheiro deixado na mesa. Comece agora — leva 2 minutos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/pricing')}
              className="w-full sm:w-auto text-lg px-10 py-7 bg-white text-primary hover:bg-white/95 shadow-2xl font-bold"
            >
              <Crown className="w-5 h-5 mr-2" />
              Assinar agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/comecar')}
              className="w-full sm:w-auto text-lg px-8 py-7 border-white/40 text-white hover:bg-white/15"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Falar com especialista
            </Button>
          </div>

          <p className="text-white/70 text-sm mt-8">
            A partir de <strong className="text-white">R$ 39,99/mês</strong> · 7 dias de garantia · Cancele quando quiser
          </p>
        </div>
      </section>
    </div>
  );
}
