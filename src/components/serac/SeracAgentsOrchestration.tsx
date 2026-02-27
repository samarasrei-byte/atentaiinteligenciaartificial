import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, ShieldCheck, User, Clock, CheckCircle2,
  AlertTriangle, ChevronDown, ChevronUp, ThumbsUp,
  RotateCcw, Zap, Target, TrendingUp, Megaphone,
  BookOpen, Users, Gamepad2, FileText
} from "lucide-react";

/* ── Types ── */
interface AgentMessage {
  id: number;
  agent: string;
  role: string;
  message: string;
  timestamp: string;
  status: "ativo" | "analisando" | "concluído";
}

/* ── Data ── */
const agentConfig: Record<string, { label: string; icon: React.ElementType; color: string; dot: string }> = {
  sdr: { label: "SDR Tributário", icon: Target, color: "bg-blue-500/15 text-blue-400", dot: "bg-blue-500" },
  diagnostico: { label: "Diagnóstico Tributário", icon: TrendingUp, color: "bg-emerald-500/15 text-emerald-400", dot: "bg-emerald-500" },
  nicho: { label: "Especialista de Nicho", icon: Users, color: "bg-violet-500/15 text-violet-400", dot: "bg-violet-500" },
  success: { label: "Customer Success", icon: ShieldCheck, color: "bg-amber-500/15 text-amber-400", dot: "bg-amber-500" },
  conteudo: { label: "Autoridade & Conteúdo", icon: BookOpen, color: "bg-rose-500/15 text-rose-400", dot: "bg-rose-500" },
  diretor: { label: "Diretor de Inteligência", icon: User, color: "bg-cyan-500/15 text-cyan-400", dot: "bg-cyan-400" },
};

const conversation: AgentMessage[] = [
  { id: 1, agent: "SDR Tributário", role: "sdr", message: "Lead captado: Cartório São José — faturamento R$ 3.2M/ano, Lucro Presumido. Classificado como PREMIUM.", timestamp: "09:10", status: "concluído" },
  { id: 2, agent: "Diagnóstico Tributário", role: "diagnostico", message: "Análise concluída: empresa pode estar pagando 18,7% a mais de impostos. Economia potencial: R$ 74.000/ano.", timestamp: "09:14", status: "concluído" },
  { id: 3, agent: "Especialista Cartórios", role: "nicho", message: "Regime atual sub-ótimo para cartórios com essa faixa de faturamento. Sugerindo migração para Lucro Real.", timestamp: "09:16", status: "concluído" },
  { id: 4, agent: "Customer Success", role: "success", message: "Proposta personalizada gerada. Score de conversão: 92%. Agendamento automático para consultor sênior.", timestamp: "09:19", status: "concluído" },
  { id: 5, agent: "Diretor de Inteligência", role: "diretor", message: "Lead premium validado. Aprovar envio de proposta e agendar reunião estratégica.", timestamp: "09:22", status: "ativo" },
];

const statusConfig = {
  ativo: { label: "Ativo", cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" },
  analisando: { label: "Analisando", cls: "bg-amber-500/15 text-amber-400 border border-amber-500/20" },
  concluído: { label: "Concluído", cls: "bg-slate-500/15 text-slate-400 border border-slate-500/20" },
};

const riskConfig = {
  baixo: { label: "Baixo", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  medio: { label: "Médio", cls: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  alto: { label: "Alto", cls: "text-red-400 bg-red-500/10 border-red-500/20" },
};

/* ── Component ── */
export function SeracAgentsOrchestration({ compact = false }: { compact?: boolean }) {
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [expanded, setExpanded] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    if (visibleMessages < conversation.length) {
      const timer = setTimeout(() => setVisibleMessages((v) => v + 1), 800);
      return () => clearTimeout(timer);
    }
  }, [visibleMessages]);

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-lg overflow-hidden ${compact ? "" : "max-w-5xl mx-auto"}`}>
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_hsl(185_80%_60%/0.5)]" />
            <h3 className="text-lg font-bold text-white">DIEC — Inteligência Fiscal e Crescimento</h3>
          </div>
          <p className="text-sm text-slate-400">Orquestração de Agentes Especializados com Supervisão Humana</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Target className="w-3 h-3" /> Lead Premium
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
            <Zap className="w-3 h-3 text-cyan-400" /> 6 agentes
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Chat Panel */}
        <div className="flex-1 p-5 border-b lg:border-b-0 lg:border-r border-white/10">
          <div className="space-y-3 min-h-[280px]">
            <AnimatePresence>
              {conversation.slice(0, visibleMessages).map((msg) => {
                const cfg = agentConfig[msg.role];
                const Icon = cfg.icon;
                const isDirector = msg.role === "diretor";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`flex gap-3 ${isDirector ? "bg-cyan-500/5 -mx-2 px-2 py-2 rounded-xl border border-cyan-500/20" : ""}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm font-semibold text-slate-200">{cfg.label}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusConfig[msg.status].cls}`}>
                          {statusConfig[msg.status].label}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5 ml-auto">
                          <Clock className="w-2.5 h-2.5" /> {msg.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">{msg.message}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {visibleMessages < conversation.length && (
              <div className="flex items-center gap-2 pl-12">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-500/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-500/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-500/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs text-slate-500">Agente processando...</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/10">
            <button
              onClick={() => setApproved(true)}
              disabled={approved}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition-all ${
                approved
                  ? "bg-emerald-500/15 text-emerald-400 cursor-default border border-emerald-500/20"
                  : "bg-cyan-500 text-white hover:bg-cyan-600 shadow-[0_0_12px_hsl(185_80%_50%/0.3)]"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {approved ? "Proposta Aprovada" : "Aprovar Proposta"}
            </button>
            <button className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />
              Solicitar revisão
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 text-xs font-medium px-4 py-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors ml-auto"
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
                <div className="mt-3 space-y-2 p-3 rounded-xl bg-white/5 border border-white/10">
                  {[
                    { t: "09:08", a: "SDR", d: "Lead captado via campanha segmentada — Cartórios SP" },
                    { t: "09:10", a: "SDR", d: "Qualificação: faturamento R$ 3.2M, Lucro Presumido → PREMIUM" },
                    { t: "09:12", a: "Diagnóstico", d: "Análise tributária iniciada — cruzamento com base setorial" },
                    { t: "09:14", a: "Diagnóstico", d: "Economia identificada: R$ 74.000/ano via migração de regime" },
                    { t: "09:16", a: "Nicho", d: "Análise setorial cartórios — regime sub-ótimo confirmado" },
                    { t: "09:19", a: "Success", d: "Proposta gerada com score 92%. Consultor sênior notificado" },
                    { t: "09:22", a: "Diretor", d: "Validação final concluída — aprovado para reunião" },
                  ].map((log, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs">
                      <span className="text-cyan-500/70 font-mono w-10 flex-shrink-0">{log.t}</span>
                      <span className="font-medium text-slate-400 w-24 flex-shrink-0">{log.a}</span>
                      <span className="text-slate-500">{log.d}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="lg:w-72 p-5 bg-white/[0.02]">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Lead Capturado</h4>
          <div className="space-y-4">
            {[
              { label: "Empresa", value: "Cartório São José" },
              { label: "Segmento", value: "Cartórios" },
              { label: "Faturamento", value: "R$ 3.2M/ano" },
              { label: "Regime atual", value: "Lucro Presumido" },
              { label: "Economia potencial", value: "R$ 74.000/ano", highlight: true },
              { label: "Score", value: "92% — Premium", highlight: true },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{item.label}</p>
                <p className={`text-sm font-semibold ${item.highlight ? "text-cyan-400" : "text-slate-200"}`}>{item.value}</p>
              </div>
            ))}
          </div>

          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-6 mb-3">Agentes DIEC</h4>
          <div className="space-y-2">
            {Object.entries(agentConfig).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
                <span className="text-xs text-slate-400 truncate">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
