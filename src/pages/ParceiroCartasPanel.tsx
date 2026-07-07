import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldCheck, LogOut, Search, RefreshCw, Download, Mail, Phone,
  CheckCircle2, XCircle, Clock, Lock, Loader2, Sparkles, HandshakeIcon,
  Ticket, Zap, Droplets, Sun,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PartnerServiceLeads } from "./partner/PartnerServiceLeads";

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
}

const STAGE: Record<string, { label: string; className: string; Icon: any; desc: string }> = {
  pending_partner: { label: "Aguardando análise", className: "bg-amber-500/15 text-amber-500 border-amber-500/30", Icon: Clock, desc: "Revise a solicitação e aprove ou rejeite." },
  partner_approved: { label: "Aprovado — aguarda admin", className: "bg-blue-500/15 text-blue-600 border-blue-500/30", Icon: HandshakeIcon, desc: "Admin foi notificado. Aguarde a liberação do contato." },
  partner_rejected: { label: "Rejeitado por você", className: "bg-red-500/15 text-red-500 border-red-500/30", Icon: XCircle, desc: "Você marcou este lead como não conforme." },
  admin_released: { label: "Contato liberado", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", Icon: CheckCircle2, desc: "Admin liberou o contato. Feche o negócio." },
  admin_denied: { label: "Negado pelo admin", className: "bg-red-500/15 text-red-500 border-red-500/30", Icon: XCircle, desc: "O admin não autorizou o contato." },
};

const maskEmail = (email: string) => {
  const [u, d] = email.split("@");
  if (!u || !d) return "•••@•••";
  return `${u.slice(0, 2)}${"•".repeat(Math.max(2, u.length - 2))}@${d}`;
};
const maskPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "•• ••••• ••••";
  return `(${digits.slice(0, 2)}) •••••-${digits.slice(-2)}`;
};

export default function ParceiroCartasPanel() {
  const nav = useNavigate();
  const { toast } = useToast();
  const [checking, setChecking] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [rejectDraft, setRejectDraft] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email?.toLowerCase();
      if (email !== "parceiro@atentai.com.br") {
        nav("/parceiro/cartas/login", { replace: true });
      }
      setChecking(false);
    });
  }, [nav]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("mentoria_cartas_leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar", description: error.message, variant: "destructive" });
    } else {
      setLeads((data ?? []) as Lead[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (checking) return;
    load();
    const channel = supabase
      .channel("parceiro-cartas-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "mentoria_cartas_leads" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking]);

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
      metadata: { ...metadata, actor_role: "carta_partner", actor_email: sess.session?.user?.email },
    });
  };

  const approve = async (id: string) => {
    setSavingId(id);
    const patch: any = {
      approval_stage: "partner_approved",
      partner_approved_at: new Date().toISOString(),
      partner_rejection_reason: null,
    };
    if (notesDraft[id] !== undefined) patch.partner_validation_notes = notesDraft[id];
    const { error } = await supabase.from("mentoria_cartas_leads").update(patch).eq("id", id);
    setSavingId(null);
    if (error) {
      await logAudit("carta_partner_approve", id, false, { notes: notesDraft[id] ?? null }, error.message);
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      await logAudit("carta_partner_approve", id, true, { notes: notesDraft[id] ?? null });
      toast({ title: "Aprovado!", description: "Admin foi notificado para liberar o contato." });
    }
  };

  const reject = async (id: string) => {
    const reason = rejectDraft[id]?.trim();
    if (!reason) {
      toast({ title: "Informe o motivo da rejeição", variant: "destructive" });
      return;
    }
    setSavingId(id);
    const { error } = await supabase.from("mentoria_cartas_leads").update({
      approval_stage: "partner_rejected",
      partner_rejection_reason: reason,
      partner_validation_notes: notesDraft[id] ?? null,
    }).eq("id", id);
    setSavingId(null);
    if (error) {
      await logAudit("carta_partner_reject", id, false, { reason }, error.message);
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      await logAudit("carta_partner_reject", id, true, { reason });
      toast({ title: "Rejeitado" });
    }
  };

  const saveNotes = async (id: string) => {
    setSavingId(id);
    const { error } = await supabase.from("mentoria_cartas_leads")
      .update({ partner_validation_notes: notesDraft[id] ?? "" }).eq("id", id);
    setSavingId(null);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else toast({ title: "Observação salva" });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      const matchQ = !q || l.full_name.toLowerCase().includes(q) || l.carta_type.toLowerCase().includes(q);
      const matchS = filter === "all" || l.approval_stage === filter;
      return matchQ && matchS;
    });
  }, [leads, search, filter]);

  const kpi = useMemo(() => ({
    total: leads.length,
    pending: leads.filter((l) => l.approval_stage === "pending_partner").length,
    waiting: leads.filter((l) => l.approval_stage === "partner_approved").length,
    released: leads.filter((l) => l.approval_stage === "admin_released").length,
  }), [leads]);

  const exportCsv = () => {
    const header = ["Data", "Nome", "Carta", "Crédito", "Etapa", "Observações"];
    const rows = filtered.map((l) => [
      format(new Date(l.created_at), "dd/MM/yyyy HH:mm"),
      l.full_name, l.carta_type, l.credit_range ?? "",
      STAGE[l.approval_stage]?.label ?? l.approval_stage,
      (l.partner_validation_notes ?? "").replace(/\n/g, " "),
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `cartas-validacao-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    nav("/parceiro/cartas/login", { replace: true });
  };

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet><title>Validação de Cartas | Parceiro</title></Helmet>

      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Painel do Parceiro</p>
              <p className="text-[11px] text-muted-foreground leading-tight">Validação de cartas contempladas</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-xs text-foreground/85">
          <p className="font-semibold text-primary mb-1">Como funciona</p>
          <ol className="list-decimal pl-4 space-y-0.5">
            <li>Analise a solicitação e a simulação de valor.</li>
            <li>Aprove se estiver conforme — o admin receberá notificação.</li>
            <li>Assim que o admin liberar, os dados de contato aparecerão para você fechar o negócio.</li>
          </ol>
        </div>

        <Tabs defaultValue="cartas" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="cartas" className="gap-1.5"><Ticket className="h-4 w-4" /> Cartas</TabsTrigger>
            <TabsTrigger value="energia" className="gap-1.5"><Zap className="h-4 w-4" /> Energia</TabsTrigger>
            <TabsTrigger value="hidrica" className="gap-1.5"><Droplets className="h-4 w-4" /> Água</TabsTrigger>
            <TabsTrigger value="solar" className="gap-1.5"><Sun className="h-4 w-4" /> Solar</TabsTrigger>
          </TabsList>

          <TabsContent value="cartas" className="space-y-6 mt-6">

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { l: "Total leads", v: kpi.total, c: "text-foreground" },
            { l: "Aguardando análise", v: kpi.pending, c: "text-amber-500" },
            { l: "Aguardando admin", v: kpi.waiting, c: "text-blue-500" },
            { l: "Contatos liberados", v: kpi.released, c: "text-emerald-600" },
          ].map((k) => (
            <Card key={k.l}><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{k.l}</p>
              <p className={`mt-1 text-2xl font-bold ${k.c}`}>{k.v}</p>
            </CardContent></Card>
          ))}
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Leads do Quiz</CardTitle>
              <CardDescription>Analise a simulação e aprove ou rejeite cada solicitação.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={load}><RefreshCw className="mr-2 h-4 w-4" />Atualizar</Button>
              <Button variant="outline" size="sm" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />CSV</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-10" placeholder="Buscar por nome ou tipo de carta..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-64"><SelectValue placeholder="Filtro" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as etapas</SelectItem>
                  {Object.entries(STAGE).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="py-12 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">Nenhum lead encontrado.</div>
            ) : (
              <div className="space-y-3">
                {filtered.map((lead) => {
                  const S = STAGE[lead.approval_stage] ?? STAGE.pending_partner;
                  const meta = lead.metadata ?? {};
                  const sim = meta.simulacao ?? {};
                  const notes = notesDraft[lead.id] ?? lead.partner_validation_notes ?? "";
                  const released = lead.approval_stage === "admin_released";
                  const canEdit = lead.approval_stage === "pending_partner";

                  return (
                    <div key={lead.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                      {/* Header */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1 min-w-[240px]">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-foreground">{lead.full_name}</p>
                            <Badge className={`border ${S.className}`}><S.Icon className="mr-1 h-3 w-3" />{S.label}</Badge>
                            <Badge variant="secondary" className="text-xs">{lead.carta_type}</Badge>
                            {lead.credit_range && <Badge variant="outline" className="text-xs">{lead.credit_range}</Badge>}
                          </div>
                          <p className="mt-1 text-[11px] text-muted-foreground">{S.desc}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Recebido em {format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>

                      {/* Contato (mascarado até liberação) */}
                      <div className={`rounded-lg border p-3 text-xs ${released ? "border-emerald-500/40 bg-emerald-500/10" : "border-dashed border-border bg-muted/30"}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {released ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                          <span className="font-semibold">{released ? "Contato liberado" : "Contato bloqueado até liberação do admin"}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <div>
                            <p className="text-[10px] uppercase text-muted-foreground">E-mail</p>
                            {released ? (
                              <a href={`mailto:${lead.email}`} className="font-mono text-sm hover:text-primary flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</a>
                            ) : (
                              <p className="font-mono text-sm text-muted-foreground">{maskEmail(lead.email)}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] uppercase text-muted-foreground">WhatsApp</p>
                            {released ? (
                              <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="font-mono text-sm hover:text-primary flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</a>
                            ) : (
                              <p className="font-mono text-sm text-muted-foreground">{maskPhone(lead.phone)}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Simulação de valor */}
                      {sim.credito && (
                        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                            <Sparkles className="h-3.5 w-3.5" /> Simulação do cliente
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                            <div><p className="text-muted-foreground">Valor desejado</p><p className="font-bold text-base">R$ {Number(sim.credito).toLocaleString("pt-BR")}</p></div>
                            <div><p className="text-muted-foreground">Prazo</p><p className="font-bold text-base">{sim.prazo_meses}x</p></div>
                            <div><p className="text-muted-foreground">Parcela</p><p className="font-bold text-base">R$ {Number(sim.parcela_estimada).toLocaleString("pt-BR")}</p></div>
                            <div><p className="text-muted-foreground">Economia vs banco</p><p className="font-bold text-base text-emerald-600">R$ {Number(sim.economia_estimada ?? 0).toLocaleString("pt-BR")}</p></div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                            <span>Lance sugerido: <b className="text-foreground">R$ {Number(sim.lance_sugerido ?? 0).toLocaleString("pt-BR")}</b></span>
                            <span>Taxa admin.: <b className="text-foreground">{sim.taxa_total_pct}%</b></span>
                            <span>Taxa banco: <b className="text-foreground">{Number(sim.taxa_banco_aa_pct ?? 0).toFixed(1)}% aa</b></span>
                          </div>
                        </div>
                      )}

                      {lead.message && (
                        <p className="rounded-lg bg-muted/40 p-2 text-xs text-muted-foreground italic">"{lead.message}"</p>
                      )}

                      {lead.admin_release_notes && (
                        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2 text-xs">
                          <p className="text-[10px] font-semibold uppercase text-emerald-600">Nota do admin</p>
                          <p className="text-foreground/85">{lead.admin_release_notes}</p>
                        </div>
                      )}

                      {/* Ações de análise (só quando pendente) */}
                      {canEdit ? (
                        <div className="space-y-2 rounded-lg border border-border bg-background/60 p-3">
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotesDraft((p) => ({ ...p, [lead.id]: e.target.value }))}
                            placeholder="Observações da análise (número da cota, administradora, documento verificado etc.)"
                            className="min-h-16 text-sm"
                          />
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => saveNotes(lead.id)} disabled={savingId === lead.id}>Salvar rascunho</Button>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => approve(lead.id)} disabled={savingId === lead.id}>
                              <CheckCircle2 className="mr-1.5 h-4 w-4" />Aprovar e notificar admin
                            </Button>
                          </div>
                          <div className="pt-2 border-t border-border/60">
                            <p className="text-[11px] font-semibold text-muted-foreground mb-1">Rejeitar</p>
                            <Input
                              placeholder="Motivo da rejeição (obrigatório)"
                              value={rejectDraft[lead.id] ?? ""}
                              onChange={(e) => setRejectDraft((p) => ({ ...p, [lead.id]: e.target.value }))}
                              className="mb-2 text-sm h-9"
                            />
                            <Button size="sm" variant="destructive" onClick={() => reject(lead.id)} disabled={savingId === lead.id}>
                              <XCircle className="mr-1.5 h-4 w-4" />Rejeitar solicitação
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {lead.partner_validation_notes && (
                            <div className="rounded-lg border border-border/60 bg-muted/30 p-2 text-xs">
                              <p className="text-[10px] font-semibold uppercase text-muted-foreground">Sua observação</p>
                              <p>{lead.partner_validation_notes}</p>
                            </div>
                          )}
                          {lead.partner_rejection_reason && (
                            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-xs">
                              <p className="text-[10px] font-semibold uppercase text-destructive">Motivo da rejeição</p>
                              <p>{lead.partner_rejection_reason}</p>
                            </div>
                          )}
                          {lead.partner_approved_at && (
                            <p className="text-[10px] text-muted-foreground">
                              Aprovado em {format(new Date(lead.partner_approved_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              {lead.admin_released_at && ` · liberado em ${format(new Date(lead.admin_released_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}`}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
