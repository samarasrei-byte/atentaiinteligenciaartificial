import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, ShieldCheck, FileSearch, MessageSquare, Activity,
  User, CheckCircle2, AlertTriangle, Clock, ChevronDown,
  ChevronUp, ThumbsUp, RotateCcw, Zap
} from "lucide-react";

/* ── Types ── */
interface AgentMessage {
  id: number;
  agent: string;
  role: "reforma" | "compliance" | "triagem" | "atendimento" | "supervisor";
  message: string;
  timestamp: string;
  status: "ativo" | "analisando" | "concluído";
}

/* ── Data ── */
const agentConfig = {
  reforma: { label: "Monitoramento da Reforma", icon: Activity, color: "bg-violet-100 text-violet-700", dot: "bg-violet-500" },
  compliance: { label: "Compliance Fiscal", icon: ShieldCheck, color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  triagem: { label: "Triagem Documental", icon: FileSearch, color: "bg-sky-100 text-sky-700", dot: "bg-sky-500" },
  atendimento: { label: "Atendimento ao Cliente", icon: MessageSquare, color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  supervisor: { label: "Supervisor SERAC", icon: User, color: "bg-slate-200 text-slate-800", dot: "bg-slate-700" },
};

const conversation: AgentMessage[] = [
  { id: 1, agent: "Agente Reforma", role: "reforma", message: "Cliente Alfa Ltda – possível aumento de carga tributária com IBS. Simulação realizada.", timestamp: "09:12", status: "concluído" },
  { id: 2, agent: "Agente Compliance", role: "compliance", message: "Inconsistência identificada no crédito de PIS/COFINS. Sugerindo revisão.", timestamp: "09:14", status: "concluído" },
  { id: 3, agent: "Agente Triagem", role: "triagem", message: "Documentos classificados e organizados. 3 pendências sinalizadas.", timestamp: "09:15", status: "concluído" },
  { id: 4, agent: "Agente Atendimento", role: "atendimento", message: "Cliente notificado com resumo estratégico.", timestamp: "09:17", status: "concluído" },
  { id: 5, agent: "Supervisor SERAC", role: "supervisor", message: "Revisão validada. Aprovar recomendação e enviar relatório final.", timestamp: "09:20", status: "ativo" },
];

const statusConfig = {
  ativo: { label: "Ativo", cls: "bg-emerald-100 text-emerald-700" },
  analisando: { label: "Analisando", cls: "bg-amber-100 text-amber-700" },
  concluído: { label: "Concluído", cls: "bg-slate-100 text-slate-600" },
};

const riskConfig = {
  baixo: { label: "Baixo", cls: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  medio: { label: "Médio", cls: "text-amber-600 bg-amber-50 border-amber-200" },
  alto: { label: "Alto", cls: "text-red-600 bg-red-50 border-red-200" },
};

/* ── Component ── */
export function SeracAgentsOrchestration({ compact = false }: { compact?: boolean }) {
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [expanded, setExpanded] = useState(false);
  const [approved, setApproved] = useState(false);

  // Animate messages appearing one by one
  useEffect(() => {
    if (visibleMessages < conversation.length) {
      const timer = setTimeout(() => setVisibleMessages((v) => v + 1), 800);
      return () => clearTimeout(timer);
    }
  }, [visibleMessages]);

  const risk = "medio" as keyof typeof riskConfig;

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden ${compact ? "" : "max-w-5xl mx-auto"}`}>
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-900">Agentes SERAC em Ação</h3>
          </div>
          <p className="text-sm text-slate-500">Orquestração Inteligente com Supervisão Humana</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border ${riskConfig[risk].cls}`}>
            <AlertTriangle className="w-3 h-3" />
            Risco: {riskConfig[risk].label}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-600">
            <Zap className="w-3 h-3" /> 5 agentes
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Chat Panel */}
        <div className="flex-1 p-5 border-b lg:border-b-0 lg:border-r border-slate-100">
          <div className="space-y-3 min-h-[280px]">
            <AnimatePresence>
              {conversation.slice(0, visibleMessages).map((msg) => {
                const cfg = agentConfig[msg.role];
                const Icon = cfg.icon;
                const isSuper = msg.role === "supervisor";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`flex gap-3 ${isSuper ? "bg-slate-50 -mx-2 px-2 py-2 rounded-xl border border-slate-200" : ""}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm font-semibold text-slate-800">{cfg.label}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusConfig[msg.status].cls}`}>
                          {statusConfig[msg.status].label}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5 ml-auto">
                          <Clock className="w-2.5 h-2.5" /> {msg.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{msg.message}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {visibleMessages < conversation.length && (
              <div className="flex items-center gap-2 pl-12">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs text-slate-400">Agente processando...</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => setApproved(true)}
              disabled={approved}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition-colors ${
                approved
                  ? "bg-emerald-100 text-emerald-700 cursor-default"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {approved ? "Ação Aprovada" : "Aprovar ação"}
            </button>
            <button className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />
              Solicitar revisão humana
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 text-xs font-medium px-4 py-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors ml-auto"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              Ver Log Completo
            </button>
          </div>

          {/* Expandable Log */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  {[
                    { t: "09:10", a: "Reforma", d: "Iniciou monitoramento do cliente Alfa Ltda" },
                    { t: "09:11", a: "Reforma", d: "Simulação IBS/CBS concluída — aumento estimado +3,2%" },
                    { t: "09:13", a: "Compliance", d: "Análise de créditos PIS/COFINS iniciada" },
                    { t: "09:14", a: "Compliance", d: "Divergência de R$ 48.000 identificada" },
                    { t: "09:15", a: "Triagem", d: "42 documentos processados, 3 pendências" },
                    { t: "09:17", a: "Atendimento", d: "Notificação enviada ao cliente via plataforma" },
                    { t: "09:20", a: "Supervisor", d: "Validação final concluída" },
                  ].map((log, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs">
                      <span className="text-slate-400 font-mono w-10 flex-shrink-0">{log.t}</span>
                      <span className="font-medium text-slate-600 w-24 flex-shrink-0">{log.a}</span>
                      <span className="text-slate-500">{log.d}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar — Client Summary */}
        <div className="lg:w-72 p-5 bg-slate-50/50">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Resumo do Caso</h4>
          <div className="space-y-4">
            {[
              { label: "Cliente", value: "Alfa Ltda" },
              { label: "Regime", value: "Lucro Presumido" },
              { label: "Impacto Reforma", value: "+3,2%", highlight: true },
              { label: "Economia identificada", value: "R$ 48.000/ano", highlight: true },
              { label: "Risco fiscal", value: "Médio", badge: true },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                {item.badge ? (
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${riskConfig[risk].cls}`}>
                    <AlertTriangle className="w-3 h-3" /> {item.value}
                  </span>
                ) : (
                  <p className={`text-sm font-semibold ${item.highlight ? "text-emerald-700" : "text-slate-800"}`}>{item.value}</p>
                )}
              </div>
            ))}
          </div>

          {/* Agent Status */}
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-6 mb-3">Agentes Ativos</h4>
          <div className="space-y-2">
            {(Object.entries(agentConfig) as [string, typeof agentConfig.reforma][]).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${cfg.dot} ${key !== "supervisor" ? "animate-pulse" : ""}`} />
                <span className="text-xs text-slate-600 truncate">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
