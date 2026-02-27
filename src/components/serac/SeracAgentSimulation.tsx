import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, TrendingUp, Users, ShieldCheck, BookOpen,
  User, Clock, CheckCircle2, Zap, Gamepad2,
  FileText, Megaphone, Building
} from "lucide-react";

interface SimMessage {
  from: string;
  text: string;
  time: string;
  type: "action" | "alert" | "success" | "info";
}

interface AgentTab {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  color: string;
  dotColor: string;
  description: string;
  kpis: { label: string; value: string }[];
  simulation: SimMessage[];
}

const agents: AgentTab[] = [
  {
    id: "sdr",
    label: "SDR Tributário (Captação e Qualificação)",
    shortLabel: "SDR",
    icon: Target,
    color: "text-blue-400",
    dotColor: "bg-blue-500",
    description: "Capta e qualifica leads automaticamente. Identifica faturamento, regime tributário, segmento e dor atual. Classifica como Frio, Morno, Quente ou Premium.",
    kpis: [
      { label: "Leads/mês", value: "5.000" },
      { label: "Qualificados", value: "23%" },
      { label: "Premium", value: "8%" },
    ],
    simulation: [
      { from: "SDR Tributário", text: "Novo lead capturado via landing page: Cartório São José — SP. Iniciando qualificação...", time: "09:01", type: "info" },
      { from: "SDR Tributário", text: "Dados coletados: Faturamento R$ 3.2M/ano, Lucro Presumido, 12 funcionários, sem planejamento tributário.", time: "09:03", type: "action" },
      { from: "SDR Tributário", text: "⭐ Lead classificado como PREMIUM. Score: 92/100. Dor principal: carga tributária elevada.", time: "09:04", type: "success" },
      { from: "SDR Tributário", text: "Lead encaminhado automaticamente para Consultor Sênior Carlos Mendes. Reunião sugerida em 48h.", time: "09:05", type: "success" },
    ],
  },
  {
    id: "diagnostico",
    label: "Diagnóstico Tributário Inteligente",
    shortLabel: "Diagnóstico",
    icon: TrendingUp,
    color: "text-emerald-400",
    dotColor: "bg-emerald-500",
    description: "Analisa faturamento, regime tributário e estrutura da empresa para identificar excesso de tributação e oportunidades de economia fiscal.",
    kpis: [
      { label: "Diagnósticos/mês", value: "340" },
      { label: "Economia média", value: "R$ 52k" },
      { label: "Conversão", value: "34%" },
    ],
    simulation: [
      { from: "Diagnóstico", text: "Iniciando análise tributária de Cartório São José: cruzando dados com base setorial de 1.200 cartórios...", time: "09:10", type: "info" },
      { from: "Diagnóstico", text: "⚠️ Regime atual (Lucro Presumido) sub-ótimo. Economia estimada com migração para Lucro Real: R$ 74.000/ano.", time: "09:13", type: "alert" },
      { from: "Diagnóstico", text: "Créditos de PIS/COFINS não aproveitados identificados: R$ 28.000 em recuperação retroativa.", time: "09:15", type: "alert" },
      { from: "Diagnóstico", text: "Relatório gerado: 'Sua empresa pode estar pagando até 18,7% a mais de impostos do que deveria.'", time: "09:16", type: "success" },
    ],
  },
  {
    id: "cartorios",
    label: "Especialista em Cartórios",
    shortLabel: "Cartórios",
    icon: Building,
    color: "text-violet-400",
    dotColor: "bg-violet-500",
    description: "Agente especializado no segmento de cartórios. Conhece a legislação específica, tributação diferenciada e desafios operacionais do setor.",
    kpis: [
      { label: "Cartórios ativos", value: "187" },
      { label: "Economia gerada", value: "R$ 4.2M" },
      { label: "Satisfação", value: "97%" },
    ],
    simulation: [
      { from: "Esp. Cartórios", text: "Contexto carregado: setor extrajudicial, regime emolumentar, peculiaridades ISSQN de serviços notariais.", time: "09:16", type: "info" },
      { from: "Esp. Cartórios", text: "Cartórios com faturamento acima de R$ 2M têm 73% de chance de economia com Lucro Real, segundo nossa base.", time: "09:17", type: "action" },
      { from: "Esp. Cartórios", text: "Sugestão: restructuração societária para separação de serviços registrais e notariais. Impacto: -12% de carga.", time: "09:18", type: "action" },
      { from: "Esp. Cartórios", text: "Proposta customizada para cartório gerada com linguagem específica do setor. Pronta para envio.", time: "09:19", type: "success" },
    ],
  },
  {
    id: "infoprodutores",
    label: "Especialista em Infoprodutores",
    shortLabel: "Infoprodutores",
    icon: Megaphone,
    color: "text-rose-400",
    dotColor: "bg-rose-500",
    description: "Atende criadores de conteúdo, infoprodutores e negócios digitais com foco em tributação sobre royalties, SaaS e vendas digitais.",
    kpis: [
      { label: "Infoprodutores", value: "312" },
      { label: "Ticket médio", value: "R$ 3.800" },
      { label: "Retenção", value: "94%" },
    ],
    simulation: [
      { from: "Esp. Infoprodutores", text: "Lead identificado: infoprodutor com faturamento R$ 800k/mês em cursos online. Regime: Simples Nacional.", time: "10:00", type: "info" },
      { from: "Esp. Infoprodutores", text: "⚠️ Simples Nacional com Anexo V é sub-ótimo acima de R$ 480k/mês. Recomendação: migrar para Lucro Presumido.", time: "10:03", type: "alert" },
      { from: "Esp. Infoprodutores", text: "Economia projetada: R$ 156.000/ano com reestruturação + holding patrimonial.", time: "10:05", type: "action" },
      { from: "Esp. Infoprodutores", text: "Material personalizado gerado: 'Guia Tributário para Infoprodutores 2026'. Enviado ao lead.", time: "10:07", type: "success" },
    ],
  },
  {
    id: "gamers",
    label: "Especialista em Gamers & Streamers",
    shortLabel: "Gamers",
    icon: Gamepad2,
    color: "text-cyan-400",
    dotColor: "bg-cyan-500",
    description: "Focado em streamers, e-sports e criadores de conteúdo gaming. Tributação sobre doações, subs, patrocínios e premiações.",
    kpis: [
      { label: "Gamers ativos", value: "89" },
      { label: "Economia média", value: "R$ 42k" },
      { label: "NPS", value: "96" },
    ],
    simulation: [
      { from: "Esp. Gamers", text: "Streamer captado: receita de R$ 120k/mês entre subs, doações e patrocínios. Pessoa Física atualmente.", time: "11:00", type: "info" },
      { from: "Esp. Gamers", text: "⚠️ Tributação PF em 27,5% sobre rendimentos. Economia com PJ (Simples): 60% de redução tributária.", time: "11:02", type: "alert" },
      { from: "Esp. Gamers", text: "Planejamento inclui: abertura MEI/ME, conta PJ, contratos de patrocínio restructurados.", time: "11:04", type: "action" },
      { from: "Esp. Gamers", text: "Proposta enviada na linguagem do público gamer. Call agendada para amanhã.", time: "11:05", type: "success" },
    ],
  },
  {
    id: "success",
    label: "Customer Success AI",
    shortLabel: "Success",
    icon: ShieldCheck,
    color: "text-amber-400",
    dotColor: "bg-amber-500",
    description: "Acompanha clientes ativos, envia alertas sobre impostos e riscos, sugere melhorias e gera oportunidades de upsell automático.",
    kpis: [
      { label: "Clientes ativos", value: "1.847" },
      { label: "Upsell/mês", value: "R$ 320k" },
      { label: "Churn", value: "2.1%" },
    ],
    simulation: [
      { from: "Customer Success", text: "Alerta para cliente Tech Solutions: prazo DCTF vence em 5 dias. Notificação enviada.", time: "08:00", type: "info" },
      { from: "Customer Success", text: "Oportunidade detectada: cliente cresceu 40% em 6 meses. Sugerindo migração de Simples para Lucro Presumido.", time: "08:15", type: "alert" },
      { from: "Customer Success", text: "E-mail personalizado enviado: 'Identificamos que sua empresa pode reduzir impostos migrando de regime.'", time: "08:20", type: "action" },
      { from: "Customer Success", text: "✅ Cliente aceitou reunião de upsell. Valor estimado do upgrade: R$ 4.200/mês.", time: "09:00", type: "success" },
    ],
  },
  {
    id: "conteudo",
    label: "Autoridade & Conteúdo",
    shortLabel: "Conteúdo",
    icon: BookOpen,
    color: "text-pink-400",
    dotColor: "bg-pink-500",
    description: "Gera conteúdo técnico de autoridade, responde perguntas especializadas e posiciona o SERAC como referência nacional em inteligência fiscal.",
    kpis: [
      { label: "Conteúdos/mês", value: "240" },
      { label: "Engajamento", value: "+180%" },
      { label: "Leads orgânicos", value: "890" },
    ],
    simulation: [
      { from: "Agente Conteúdo", text: "Tendência detectada: 'regime tributário para infoprodutor' com +340% de buscas. Gerando artigo técnico.", time: "07:00", type: "info" },
      { from: "Agente Conteúdo", text: "Artigo publicado: 'Qual o melhor regime tributário para infoprodutores em 2026?' — SEO otimizado.", time: "07:30", type: "action" },
      { from: "Agente Conteúdo", text: "Respostas automáticas configuradas para 15 perguntas frequentes sobre Reforma Tributária.", time: "08:00", type: "action" },
      { from: "Agente Conteúdo", text: "✅ Post gerou 47 leads orgânicos nas últimas 24h. Pipeline atualizado automaticamente.", time: "09:00", type: "success" },
    ],
  },
  {
    id: "diretor",
    label: "Diretor de Inteligência (Humano)",
    shortLabel: "Diretor",
    icon: User,
    color: "text-slate-300",
    dotColor: "bg-cyan-400",
    description: "Supervisiona todos os agentes, valida decisões estratégicas, aprova propostas premium e garante qualidade da operação.",
    kpis: [
      { label: "Validações/dia", value: "68" },
      { label: "Aprovação", value: "94%" },
      { label: "Tempo revisão", value: "6min" },
    ],
    simulation: [
      { from: "Diretor", text: "Dashboard matinal: 23 leads premium qualificados, 4 propostas pendentes, 2 upsells em andamento.", time: "08:30", type: "info" },
      { from: "Diretor", text: "Proposta Cartório São José revisada e aprovada. Economia de R$ 74k/ano validada pela equipe técnica.", time: "09:25", type: "success" },
      { from: "Diretor", text: "Ajuste solicitado na proposta do infoprodutor: incluir cenário com holding patrimonial.", time: "09:30", type: "action" },
      { from: "Diretor", text: "✅ Relatório semanal DIEC: 30 novos contratos, R$ 75k em receita adicional, pipeline de R$ 1.2M.", time: "10:00", type: "success" },
    ],
  },
];

const typeStyles = {
  action: "border-l-blue-500/50 bg-blue-500/5",
  alert: "border-l-amber-500/50 bg-amber-500/5",
  success: "border-l-emerald-500/50 bg-emerald-500/5",
  info: "border-l-slate-500/50 bg-slate-500/5",
};

export function SeracAgentSimulation() {
  const [activeTab, setActiveTab] = useState("sdr");
  const [visibleMsgs, setVisibleMsgs] = useState(0);

  const active = agents.find((a) => a.id === activeTab)!;

  useEffect(() => {
    setVisibleMsgs(0);
  }, [activeTab]);

  useEffect(() => {
    if (visibleMsgs < active.simulation.length) {
      const timer = setTimeout(() => setVisibleMsgs((v) => v + 1), 600);
      return () => clearTimeout(timer);
    }
  }, [visibleMsgs, active.simulation.length]);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_hsl(185_80%_60%/0.5)]" />
          <h3 className="text-xl font-black text-white">Simulação dos Agentes DIEC</h3>
        </div>
        <p className="text-sm text-slate-500">Departamento de Inteligência Fiscal e Crescimento — veja cada agente em ação</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/[0.06] px-4 overflow-x-auto">
        <div className="flex gap-1 min-w-max py-2">
          {agents.map((agent) => {
            const Icon = agent.icon;
            const isActive = activeTab === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => setActiveTab(agent.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap
                  ${isActive
                    ? "bg-white/[0.08] border border-white/[0.12] text-white shadow-lg backdrop-blur-sm"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] border border-transparent"
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? agent.color : ""}`} />
                <span className="hidden sm:inline">{agent.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col lg:flex-row"
        >
          {/* Left — Agent Info + KPIs */}
          <div className="lg:w-80 p-6 border-b lg:border-b-0 lg:border-r border-white/[0.06] bg-white/[0.01]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/[0.05] border border-white/[0.08]">
                <active.icon className={`w-6 h-6 ${active.color}`} />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">{active.label}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${active.dotColor} animate-pulse`} />
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Online</span>
                </div>
              </div>
            </div>

            <p className="text-slate-500 text-sm leading-relaxed mb-6">{active.description}</p>

            <h5 className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold mb-3">Métricas</h5>
            <div className="space-y-3">
              {active.kpis.map((kpi, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-slate-500 text-xs font-medium">{kpi.label}</span>
                  <span className="text-cyan-400 font-black text-sm">{kpi.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Simulation */}
          <div className="flex-1 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Zap className="w-4 h-4 text-cyan-500/50" />
              <span className="text-xs text-slate-600 uppercase tracking-[0.2em] font-bold">Simulação em tempo real</span>
            </div>

            <div className="space-y-3 min-h-[260px]">
              <AnimatePresence>
                {active.simulation.slice(0, visibleMsgs).map((msg, i) => (
                  <motion.div
                    key={`${activeTab}-${i}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`border-l-2 rounded-r-xl p-4 ${typeStyles[msg.type]}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-400">{msg.from}</span>
                      <span className="text-[10px] text-slate-600 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {msg.time}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{msg.text}</p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {visibleMsgs < active.simulation.length && (
                <div className="flex items-center gap-2 pl-4 pt-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-500/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-cyan-500/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-cyan-500/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs text-slate-600">Processando...</span>
                </div>
              )}

              {visibleMsgs >= active.simulation.length && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 pt-3 pl-4"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500/60" />
                  <span className="text-xs text-emerald-500/60 font-medium">Simulação concluída</span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
