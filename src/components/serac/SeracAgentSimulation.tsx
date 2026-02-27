import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, ShieldCheck, FileSearch, MessageSquare, User,
  Megaphone, Clock, CheckCircle2, AlertTriangle, ArrowRight,
  Zap, TrendingUp, Mail, Phone, BarChart3
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
    id: "reforma",
    label: "Monitoramento da Reforma",
    shortLabel: "Reforma",
    icon: Activity,
    color: "text-violet-400",
    dotColor: "bg-violet-500",
    description: "Monitora em tempo real todas as mudanças legislativas da Reforma Tributária 2026 e simula impacto nos clientes.",
    kpis: [
      { label: "Alertas/mês", value: "142" },
      { label: "Simulações", value: "89" },
      { label: "Precisão", value: "97%" },
    ],
    simulation: [
      { from: "Agente Reforma", text: "Nova publicação detectada: Lei Complementar IBS/CBS — analisando impacto...", time: "09:01", type: "info" },
      { from: "Agente Reforma", text: "Impacto calculado para 23 clientes no regime Lucro Presumido. Aumento médio de +2,8%.", time: "09:03", type: "alert" },
      { from: "Agente Reforma", text: "Simulação detalhada gerada para Alfa Ltda: carga tributária sobe R$ 18.400/ano.", time: "09:05", type: "action" },
      { from: "Agente Reforma", text: "Relatório de impacto consolidado enviado ao Supervisor para validação.", time: "09:07", type: "success" },
    ],
  },
  {
    id: "compliance",
    label: "Compliance Fiscal",
    shortLabel: "Compliance",
    icon: ShieldCheck,
    color: "text-amber-400",
    dotColor: "bg-amber-500",
    description: "Verifica automaticamente inconsistências fiscais, créditos tributários e obrigações acessórias em tempo real.",
    kpis: [
      { label: "Inconsistências", value: "34" },
      { label: "Economia gerada", value: "R$ 890k" },
      { label: "Obrigações", value: "100%" },
    ],
    simulation: [
      { from: "Agente Compliance", text: "Iniciando auditoria automatizada nos créditos de PIS/COFINS — Alfa Ltda.", time: "09:10", type: "info" },
      { from: "Agente Compliance", text: "⚠️ Divergência de R$ 48.000 no crédito de PIS. Possível recuperação.", time: "09:12", type: "alert" },
      { from: "Agente Compliance", text: "Cruzamento SPED x NF-e concluído. 3 notas sem correspondência identificadas.", time: "09:14", type: "action" },
      { from: "Agente Compliance", text: "Dossiê de compliance gerado. Encaminhando para revisão do Supervisor.", time: "09:16", type: "success" },
    ],
  },
  {
    id: "triagem",
    label: "Triagem Documental",
    shortLabel: "Triagem",
    icon: FileSearch,
    color: "text-sky-400",
    dotColor: "bg-sky-500",
    description: "Classifica, organiza e valida documentos recebidos usando OCR e IA, sinalizando pendências automaticamente.",
    kpis: [
      { label: "Docs/dia", value: "1.200+" },
      { label: "Tempo médio", value: "3s" },
      { label: "Acurácia", value: "99.2%" },
    ],
    simulation: [
      { from: "Agente Triagem", text: "42 documentos recebidos de Alfa Ltda. Iniciando classificação por IA.", time: "09:15", type: "info" },
      { from: "Agente Triagem", text: "OCR aplicado em 12 notas fiscais digitalizadas. Dados extraídos com sucesso.", time: "09:16", type: "action" },
      { from: "Agente Triagem", text: "⚠️ 3 documentos com pendência: DARF vencido, CND expirada, contrato sem assinatura.", time: "09:17", type: "alert" },
      { from: "Agente Triagem", text: "Documentos organizados por categoria. Dashboard atualizado.", time: "09:18", type: "success" },
    ],
  },
  {
    id: "atendimento",
    label: "Atendimento ao Cliente",
    shortLabel: "Atendimento",
    icon: MessageSquare,
    color: "text-emerald-400",
    dotColor: "bg-emerald-500",
    description: "Atende clientes 24/7 com respostas contextuais, escala para humanos quando necessário e mantém histórico completo.",
    kpis: [
      { label: "Satisfação", value: "96%" },
      { label: "Tempo resposta", value: "<30s" },
      { label: "Resolução IA", value: "78%" },
    ],
    simulation: [
      { from: "Agente Atendimento", text: "Cliente Alfa Ltda abriu chamado: 'Qual o impacto da reforma no meu regime?'", time: "09:20", type: "info" },
      { from: "Agente Atendimento", text: "Contexto carregado: Lucro Presumido, setor serviços, faturamento R$ 2.4M/ano.", time: "09:20", type: "action" },
      { from: "Agente Atendimento", text: "Resposta personalizada enviada com simulação + link para relatório detalhado.", time: "09:21", type: "success" },
      { from: "Agente Atendimento", text: "Cliente satisfeito — NPS 9. Caso encerrado automaticamente.", time: "09:25", type: "success" },
    ],
  },
  {
    id: "comercial",
    label: "Comercial & Nutrição de Leads",
    shortLabel: "Comercial",
    icon: Megaphone,
    color: "text-rose-400",
    dotColor: "bg-rose-500",
    description: "Prospecta contadores, nutre leads com conteúdo estratégico e qualifica oportunidades para o time de vendas.",
    kpis: [
      { label: "Leads/mês", value: "5.000" },
      { label: "Conversão", value: "6%" },
      { label: "Pipeline", value: "R$ 750k" },
    ],
    simulation: [
      { from: "Agente Comercial", text: "Campanha de prospecção iniciada: 5.000 contadores segmentados por região e porte.", time: "08:00", type: "info" },
      { from: "Agente Comercial", text: "E-mail de impacto tributário enviado — 'Como a Reforma afeta seus clientes'. Taxa abertura: 32%.", time: "10:00", type: "action" },
      { from: "Agente Comercial", text: "147 leads engajaram. Score atualizado. 23 qualificados para reunião.", time: "14:00", type: "alert" },
      { from: "Agente Comercial", text: "Sequência de nutrição ativada: webinar + case study + proposta personalizada.", time: "15:00", type: "action" },
      { from: "Agente Comercial", text: "✅ 8 reuniões agendadas automaticamente. Pipeline atualizado: +R$ 200k.", time: "17:00", type: "success" },
    ],
  },
  {
    id: "supervisor",
    label: "Supervisor Humano (Contador SERAC)",
    shortLabel: "Supervisor",
    icon: User,
    color: "text-cyan-400",
    dotColor: "bg-cyan-400",
    description: "Valida decisões críticas dos agentes, aprova recomendações e garante a qualidade estratégica de todas as entregas.",
    kpis: [
      { label: "Validações/dia", value: "45" },
      { label: "Aprovação", value: "94%" },
      { label: "Tempo revisão", value: "8min" },
    ],
    simulation: [
      { from: "Supervisor SERAC", text: "Recebidos 4 relatórios dos agentes para validação — priorizando por urgência.", time: "09:30", type: "info" },
      { from: "Supervisor SERAC", text: "Relatório de Compliance aprovado. Economia de R$ 48k confirmada para Alfa Ltda.", time: "09:35", type: "success" },
      { from: "Supervisor SERAC", text: "Ajuste solicitado no relatório de Reforma: incluir cenário otimista na simulação.", time: "09:38", type: "action" },
      { from: "Supervisor SERAC", text: "Leads qualificados pelo Agente Comercial revisados. 6/8 aprovados para proposta.", time: "09:42", type: "success" },
      { from: "Supervisor SERAC", text: "✅ Todas as validações concluídas. Relatório final enviado ao cliente.", time: "09:50", type: "success" },
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
  const [activeTab, setActiveTab] = useState("reforma");
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
          <h3 className="text-xl font-black text-white">Simulação dos Agentes</h3>
        </div>
        <p className="text-sm text-slate-500">Veja como cada agente atua em tempo real</p>
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
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/[0.05] border border-white/[0.08]`}>
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
