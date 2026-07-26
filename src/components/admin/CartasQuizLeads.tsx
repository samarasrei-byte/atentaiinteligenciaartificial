import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  GraduationCap, Search, Phone, Mail, RefreshCw, ExternalLink, Download,
  CheckCircle2, XCircle, Clock, HandshakeIcon, Sparkles, ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CartaLeadTimeline } from "./CartaLeadTimeline";

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  carta_type: string;
  credit_range: string | null;
  message: string | null;
  status: string;
  source: string | null;
  created_at: string;
  metadata: any;
  partner_validation_notes: string | null;
  partner_approved_at: string | null;
  partner_rejection_reason: string | null;
  approval_stage: string;
  admin_released_at: string | null;
  admin_release_notes: string | null;
  score: number | null;
  score_band: string | null;
  lost_reason: string | null;
}

interface StatusHistory {
  id: string;
  lead_id: string;
  from_status: string | null;
  to_status: string;
  reason: string | null;
  changed_by_email: string | null;
  created_at: string;
}

const BAND: Record<string, { label: string; className: string }> = {
  A: { label: "A · Alto (80+)", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  B: { label: "B · Bom (60-79)", className: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  C: { label: "C · Médio (40-59)", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  D: { label: "D · Baixo (<40)", className: "bg-red-500/15 text-red-500 border-red-500/30" },
};

const LOST_REASONS = [
  "Sem interesse",
  "Sem orçamento",
  "Sem perfil de crédito",
  "Concorrente",
  "Não respondeu",
  "Contato inválido",
  "Outro",
];

const STATUS: Record<string, { label: string; className: string }> = {
  new: { label: "Novo", className: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
  contacted: { label: "Contatado", className: "bg-blue-500/15 text-blue-500 border-blue-500/30" },
  qualified: { label: "Qualificado", className: "bg-violet-500/15 text-violet-500 border-violet-500/30" },
  won: { label: "Fechado", className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
  lost: { label: "Perdido", className: "bg-red-500/15 text-red-500 border-red-500/30" },
};

const STAGE: Record<string, { label: string; className: string; Icon: any }> = {
  pending_partner: { label: "Aguarda parceiro", className: "bg-slate-500/15 text-slate-500 border-slate-500/30", Icon: Clock },
  partner_approved: { label: "🟡 Parceiro aprovou — liberar", className: "bg-blue-500/15 text-blue-600 border-blue-500/30", Icon: HandshakeIcon },
  partner_rejected: { label: "Parceiro rejeitou", className: "bg-red-500/15 text-red-500 border-red-500/30", Icon: XCircle },
  admin_released: { label: "Contato liberado", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", Icon: CheckCircle2 },
  admin_denied: { label: "Admin negou", className: "bg-red-500/15 text-red-500 border-red-500/30", Icon: XCircle },
};

export default function MentoriaCartasLeads() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [bandFilter, setBandFilter] = useState<string>("all");
  const [lostReasonFilter, setLostReasonFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [releaseNotes, setReleaseNotes] = useState<Record<string, string>>({});
  const [lostReasonDraft, setLostReasonDraft] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [history, setHistory] = useState<Record<string, StatusHistory[]>>({});
  const [openHistory, setOpenHistory] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("mentoria_cartas_leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar leads", description: error.message, variant: "destructive" });
    } else {
      setLeads((data ?? []) as Lead[]);
    }
    setLoading(false);
  };

  const loadHistory = async (leadId: string) => {
    const { data } = await supabase
      .from("lead_status_history" as any)
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });
    setHistory((p) => ({ ...p, [leadId]: (data ?? []) as unknown as StatusHistory[] }));
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("mentoria-leads-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mentoria_cartas_leads" },
        () => load(),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (id: string, status: string, extra?: { lost_reason?: string | null }) => {
    const payload: any = { status };
    if (extra && "lost_reason" in extra) payload.lost_reason = extra.lost_reason;
    const { error } = await supabase.from("mentoria_cartas_leads").update(payload).eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Status atualizado" });
      await logAudit("lead_status_change", id, true, { to: status, lost_reason: extra?.lost_reason });
      if (openHistory[id]) loadHistory(id);
    }
  };

  const toggleHistory = async (id: string) => {
    const next = !openHistory[id];
    setOpenHistory((p) => ({ ...p, [id]: next }));
    if (next && !history[id]) await loadHistory(id);
  };

  const logAudit = async (action_type: string, resource_id: string, success: boolean, metadata: any = {}, failure_reason?: string) => {
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user?.id;
    if (!uid) return;
    await supabase.from("audit_logs").insert({
      user_id: uid,
      action_type,
      resource_type: "mentoria_cartas_lead",
      resource_id,
      success,
      failure_reason: failure_reason ?? null,
      metadata: { ...metadata, actor_role: "admin", actor_email: sess.session?.user?.email },
    });
  };

  const releaseContact = async (id: string) => {
    const { data: session } = await supabase.auth.getSession();
    setSavingId(id);
    const notes = releaseNotes[id] ?? null;
    const { error } = await supabase.from("mentoria_cartas_leads").update({
      approval_stage: "admin_released",
      admin_released_at: new Date().toISOString(),
      admin_released_by: session.session?.user?.id ?? null,
      admin_release_notes: notes,
    }).eq("id", id);
    setSavingId(null);
    if (error) {
      await logAudit("carta_admin_release", id, false, { notes }, error.message);
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      await logAudit("carta_admin_release", id, true, { notes });
      toast({ title: "Contato liberado", description: "O parceiro foi notificado." });
    }
  };

  const denyRelease = async (id: string) => {
    const { data: session } = await supabase.auth.getSession();
    setSavingId(id);
    const notes = releaseNotes[id] ?? "Negado pelo admin";
    const { error } = await supabase.from("mentoria_cartas_leads").update({
      approval_stage: "admin_denied",
      admin_released_at: new Date().toISOString(),
      admin_released_by: session.session?.user?.id ?? null,
      admin_release_notes: notes,
    }).eq("id", id);
    setSavingId(null);
    if (error) {
      await logAudit("carta_admin_deny", id, false, { notes }, error.message);
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      await logAudit("carta_admin_deny", id, true, { notes });
      toast({ title: "Liberação negada" });
    }
  };

  const filtered = useMemo(() => leads.filter((l) => {
    const q = search.toLowerCase();
    const matchQ = !q || l.full_name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.phone.includes(q);
    const matchS = statusFilter === "all" || l.status === statusFilter;
    const matchStage = stageFilter === "all" || l.approval_stage === stageFilter;
    const matchBand = bandFilter === "all" || (l.score_band ?? "—") === bandFilter;
    const matchLost = lostReasonFilter === "all" || (l.lost_reason ?? "") === lostReasonFilter;
    return matchQ && matchS && matchStage && matchBand && matchLost;
  }), [leads, search, statusFilter, stageFilter, bandFilter, lostReasonFilter]);

  const kpi = {
    total: leads.length,
    novos: leads.filter((l) => l.status === "new").length,
    aguardando: leads.filter((l) => l.approval_stage === "partner_approved").length,
    liberados: leads.filter((l) => l.approval_stage === "admin_released").length,
  };

  const bandCounts = useMemo(() => {
    const c: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, "—": 0 };
    leads.forEach((l) => { c[l.score_band ?? "—"] = (c[l.score_band ?? "—"] ?? 0) + 1; });
    return c;
  }, [leads]);

  const exportCsv = () => {
    const header = ["Data", "Nome", "Email", "WhatsApp", "Carta", "Crédito", "Etapa", "Status", "Mensagem", "Notas do parceiro"];
    const rows = filtered.map((l) => [
      format(new Date(l.created_at), "dd/MM/yyyy HH:mm"),
      l.full_name, l.email, l.phone, l.carta_type, l.credit_range ?? "",
      STAGE[l.approval_stage]?.label ?? l.approval_stage,
      STATUS[l.status]?.label ?? l.status,
      (l.message ?? "").replace(/\n/g, " "),
      (l.partner_validation_notes ?? "").replace(/\n/g, " "),
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `mentoria-cartas-leads-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <GraduationCap className="h-6 w-6 text-primary" />
            Quiz — Cartas Contempladas
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Fluxo: cliente conclui quiz → parceiro valida → você libera contato → parceiro fecha o negócio.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="mr-2 h-4 w-4" />Atualizar</Button>
          <Button variant="outline" size="sm" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />CSV</Button>
          <a href="/cartas-contempladas/quiz" target="_blank" rel="noopener noreferrer">
            <Button size="sm"><ExternalLink className="mr-2 h-4 w-4" />Ver landing</Button>
          </a>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { l: "Total", v: kpi.total, c: "text-foreground" },
          { l: "Novos", v: kpi.novos, c: "text-amber-500" },
          { l: "🟡 Aguardando liberação", v: kpi.aguardando, c: "text-blue-600" },
          { l: "Contatos liberados", v: kpi.liberados, c: "text-emerald-600" },
        ].map((k) => (
          <Card key={k.l}><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{k.l}</p>
            <p className={`mt-1 text-2xl font-bold ${k.c}`}>{k.v}</p>
          </CardContent></Card>
        ))}
      </div>

      {/* Ranking por score */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ranking por score</CardTitle>
          <CardDescription>Faixas do score empresarial/risco enviado pelo quiz.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {(["A","B","C","D","—"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBandFilter(bandFilter === b ? "all" : b)}
                className={`rounded-lg border p-3 text-left transition ${bandFilter === b ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {BAND[b]?.label ?? "Sem score"}
                </p>
                <p className="mt-1 text-2xl font-bold">{bandCounts[b] ?? 0}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inscrições</CardTitle>
          <CardDescription>Gerencie leads, valide e libere o contato para o parceiro.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-10" placeholder="Buscar por nome, e-mail ou telefone..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-full lg:w-52"><SelectValue placeholder="Etapa" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as etapas</SelectItem>
                {Object.entries(STAGE).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                {Object.entries(STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={bandFilter} onValueChange={setBandFilter}>
              <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Faixa" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as faixas</SelectItem>
                {(["A","B","C","D"] as const).map((b) => <SelectItem key={b} value={b}>{BAND[b].label}</SelectItem>)}
                <SelectItem value="—">Sem score</SelectItem>
              </SelectContent>
            </Select>
            <Select value={lostReasonFilter} onValueChange={setLostReasonFilter}>
              <SelectTrigger className="w-full lg:w-48"><SelectValue placeholder="Motivo perda" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos motivos</SelectItem>
                {LOST_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="py-10 text-center text-muted-foreground">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">Nenhum lead encontrado.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((lead) => {
                const s = STATUS[lead.status] ?? STATUS.new;
                const stg = STAGE[lead.approval_stage] ?? STAGE.pending_partner;
                const meta = lead.metadata ?? {};
                const sim = meta.simulacao ?? {};
                const needsRelease = lead.approval_stage === "partner_approved";

                return (
                  <div key={lead.id} className={`rounded-xl border p-4 space-y-3 transition ${needsRelease ? "border-blue-500/50 bg-blue-500/5" : "border-border bg-card hover:border-primary/40"}`}>
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-foreground">{lead.full_name}</p>
                          <Badge className={`border ${stg.className}`}><stg.Icon className="mr-1 h-3 w-3" />{stg.label}</Badge>
                          <Badge className={`border ${s.className}`}>{s.label}</Badge>
                          <Badge variant="secondary" className="text-xs">{lead.carta_type}</Badge>
                          {lead.score_band && (
                            <Badge className={`border ${BAND[lead.score_band]?.className ?? ""}`}>
                              Faixa {lead.score_band}{lead.score != null ? ` · ${lead.score}` : ""}
                            </Badge>
                          )}
                          {lead.lost_reason && (
                            <Badge variant="outline" className="text-[10px] border-red-500/40 text-red-500">
                              Perda: {lead.lost_reason}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-primary"><Mail className="h-3 w-3" />{lead.email}</a>
                          <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary"><Phone className="h-3 w-3" />{lead.phone}</a>
                          {lead.credit_range && <span>Crédito: <b className="text-foreground">{lead.credit_range}</b></span>}
                          <span>{format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                        </div>
                        {lead.message && <p className="mt-2 rounded-lg bg-muted/40 p-2 text-xs text-muted-foreground">"{lead.message}"</p>}
                      </div>
                      <Select value={lead.status} onValueChange={(v) => updateStatus(lead.id, v)}>
                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Simulação */}
                    {sim.credito && (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                          <Sparkles className="h-3.5 w-3.5" />Simulação do cliente
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                          <div><p className="text-muted-foreground">Valor</p><p className="font-bold">R$ {Number(sim.credito).toLocaleString("pt-BR")}</p></div>
                          <div><p className="text-muted-foreground">Prazo</p><p className="font-bold">{sim.prazo_meses}x</p></div>
                          <div><p className="text-muted-foreground">Parcela</p><p className="font-bold">R$ {Number(sim.parcela_estimada).toLocaleString("pt-BR")}</p></div>
                          <div><p className="text-muted-foreground">Economia</p><p className="font-bold text-emerald-600">R$ {Number(sim.economia_estimada ?? 0).toLocaleString("pt-BR")}</p></div>
                        </div>
                      </div>
                    )}

                    {/* Observação do parceiro */}
                    {lead.partner_validation_notes && (
                      <div className="rounded-lg border border-border/60 bg-muted/30 p-2 text-xs">
                        <p className="text-[10px] font-semibold uppercase text-muted-foreground flex items-center gap-1"><ShieldCheck className="h-3 w-3" />Análise do parceiro</p>
                        <p>{lead.partner_validation_notes}</p>
                        {lead.partner_approved_at && (
                          <p className="mt-1 text-[10px] text-muted-foreground">Aprovado em {format(new Date(lead.partner_approved_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                        )}
                      </div>
                    )}
                    {lead.partner_rejection_reason && (
                      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-xs">
                        <p className="text-[10px] font-semibold uppercase text-destructive">Rejeitado pelo parceiro</p>
                        <p>{lead.partner_rejection_reason}</p>
                      </div>
                    )}

                    {/* Ação de liberação — só aparece quando parceiro aprovou */}
                    {needsRelease && (
                      <div className="rounded-lg border border-blue-500/40 bg-blue-500/10 p-3 space-y-2">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Autorizar parceiro a contatar este cliente?</p>
                        <Textarea
                          value={releaseNotes[lead.id] ?? ""}
                          onChange={(e) => setReleaseNotes((p) => ({ ...p, [lead.id]: e.target.value }))}
                          placeholder="Nota opcional para o parceiro (instruções, condições comerciais etc.)"
                          className="min-h-14 text-sm"
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => releaseContact(lead.id)} disabled={savingId === lead.id}>
                            <CheckCircle2 className="mr-1.5 h-4 w-4" />Liberar contato
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => denyRelease(lead.id)} disabled={savingId === lead.id}>
                            <XCircle className="mr-1.5 h-4 w-4" />Negar liberação
                          </Button>
                        </div>
                      </div>
                    )}

                    {lead.admin_release_notes && lead.approval_stage === "admin_released" && (
                      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2 text-xs">
                        <p className="text-[10px] font-semibold uppercase text-emerald-600">Nota da liberação</p>
                        <p>{lead.admin_release_notes}</p>
                      </div>
                    )}



                    {/* Motivo de perda */}
                    {lead.status === "lost" && (
                      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 space-y-2">
                        <p className="text-[10px] font-semibold uppercase text-red-600">Motivo da perda</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Select
                            value={lead.lost_reason ?? lostReasonDraft[lead.id] ?? ""}
                            onValueChange={(v) => {
                              setLostReasonDraft((p) => ({ ...p, [lead.id]: v }));
                              updateStatus(lead.id, "lost", { lost_reason: v });
                            }}
                          >
                            <SelectTrigger className="w-56"><SelectValue placeholder="Selecionar motivo" /></SelectTrigger>
                            <SelectContent>
                              {LOST_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Histórico de mudanças de status */}
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-2">
                      <button
                        onClick={() => toggleHistory(lead.id)}
                        className="flex w-full items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                      >
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Histórico de status</span>
                        <span>{openHistory[lead.id] ? "▲" : "▼"}</span>
                      </button>
                      {openHistory[lead.id] && (
                        <div className="mt-2 space-y-1.5">
                          {(history[lead.id] ?? []).length === 0 ? (
                            <p className="text-xs text-muted-foreground">Nenhuma mudança registrada ainda.</p>
                          ) : (
                            (history[lead.id] ?? []).map((h) => (
                              <div key={h.id} className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="text-muted-foreground">
                                  {format(new Date(h.created_at), "dd/MM HH:mm", { locale: ptBR })}
                                </span>
                                <Badge variant="outline" className="text-[10px]">
                                  {STATUS[h.from_status ?? ""]?.label ?? h.from_status ?? "—"} → {STATUS[h.to_status]?.label ?? h.to_status}
                                </Badge>
                                <span className="text-muted-foreground">por</span>
                                <span className="font-medium text-foreground">{h.changed_by_email ?? "sistema"}</span>
                                {h.reason && <span className="text-muted-foreground">· {h.reason}</span>}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    <CartaLeadTimeline lead={lead} />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
