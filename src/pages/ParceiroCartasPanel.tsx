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
  CheckCircle2, XCircle, Clock, FileText, Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Helmet } from "react-helmet-async";

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
  partner_validated: boolean;
  partner_validation_status: string | null;
  partner_validation_notes: string | null;
  partner_validated_at: string | null;
}

const VAL_STATUS: Record<string, { label: string; className: string; Icon: any }> = {
  pending: { label: "Pendente", className: "bg-amber-500/15 text-amber-500 border-amber-500/30", Icon: Clock },
  valid: { label: "Válida", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", Icon: CheckCircle2 },
  invalid: { label: "Inválida", className: "bg-red-500/15 text-red-500 border-red-500/30", Icon: XCircle },
  needs_docs: { label: "Falta documentação", className: "bg-blue-500/15 text-blue-500 border-blue-500/30", Icon: FileText },
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

  const updateValidation = async (id: string, status: string) => {
    setSavingId(id);
    const patch: any = {
      partner_validation_status: status,
      partner_validated: status === "valid",
      partner_validated_at: new Date().toISOString(),
    };
    if (notesDraft[id] !== undefined) patch.partner_validation_notes = notesDraft[id];
    const { error } = await supabase.from("mentoria_cartas_leads").update(patch).eq("id", id);
    setSavingId(null);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Validação atualizada" });
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    }
  };

  const saveNotes = async (id: string) => {
    setSavingId(id);
    const { error } = await supabase
      .from("mentoria_cartas_leads")
      .update({ partner_validation_notes: notesDraft[id] ?? "" })
      .eq("id", id);
    setSavingId(null);
    if (error) toast({ title: "Erro ao salvar nota", description: error.message, variant: "destructive" });
    else toast({ title: "Observação salva" });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      const matchQ = !q || l.full_name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.phone.includes(q);
      const status = l.partner_validation_status ?? "pending";
      const matchS = filter === "all" || status === filter;
      return matchQ && matchS;
    });
  }, [leads, search, filter]);

  const kpi = useMemo(() => ({
    total: leads.length,
    pending: leads.filter((l) => (l.partner_validation_status ?? "pending") === "pending").length,
    valid: leads.filter((l) => l.partner_validation_status === "valid").length,
    invalid: leads.filter((l) => l.partner_validation_status === "invalid").length,
  }), [leads]);

  const exportCsv = () => {
    const header = ["Data", "Nome", "Email", "WhatsApp", "Carta", "Crédito", "Validação", "Observação parceiro"];
    const rows = filtered.map((l) => [
      format(new Date(l.created_at), "dd/MM/yyyy HH:mm"),
      l.full_name, l.email, l.phone, l.carta_type, l.credit_range ?? "",
      VAL_STATUS[l.partner_validation_status ?? "pending"]?.label ?? "Pendente",
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
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { l: "Total leads", v: kpi.total, c: "text-foreground" },
            { l: "Pendentes", v: kpi.pending, c: "text-amber-500" },
            { l: "Válidas", v: kpi.valid, c: "text-emerald-600" },
            { l: "Inválidas", v: kpi.invalid, c: "text-red-500" },
          ].map((k) => (
            <Card key={k.l}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{k.l}</p>
                <p className={`mt-1 text-2xl font-bold ${k.c}`}>{k.v}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Leads do Quiz de Cartas</CardTitle>
              <CardDescription>Valide se a carta contemplada é real e conforme.</CardDescription>
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
                <Input className="pl-10" placeholder="Buscar por nome, e-mail ou telefone..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder="Filtro" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas validações</SelectItem>
                  {Object.entries(VAL_STATUS).map(([k, v]) => (
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
                  const status = lead.partner_validation_status ?? "pending";
                  const S = VAL_STATUS[status] ?? VAL_STATUS.pending;
                  const meta = lead.metadata ?? {};
                  const sim = meta.simulacao ?? {};
                  const notes = notesDraft[lead.id] ?? lead.partner_validation_notes ?? "";
                  return (
                    <div key={lead.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1 min-w-[240px]">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-foreground">{lead.full_name}</p>
                            <Badge className={`border ${S.className}`}><S.Icon className="mr-1 h-3 w-3" />{S.label}</Badge>
                            <Badge variant="secondary" className="text-xs">{lead.carta_type}</Badge>
                            {lead.credit_range && (
                              <Badge variant="outline" className="text-xs">{lead.credit_range}</Badge>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-primary"><Mail className="h-3 w-3" />{lead.email}</a>
                            <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary"><Phone className="h-3 w-3" />{lead.phone}</a>
                            <span>{format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Simulação */}
                      {sim.credito && (
                        <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs sm:grid-cols-4">
                          <div><p className="text-muted-foreground">Crédito</p><p className="font-semibold">R$ {Number(sim.credito).toLocaleString("pt-BR")}</p></div>
                          <div><p className="text-muted-foreground">Prazo</p><p className="font-semibold">{sim.prazo_meses}x</p></div>
                          <div><p className="text-muted-foreground">Parcela</p><p className="font-semibold">R$ {Number(sim.parcela_estimada).toLocaleString("pt-BR")}</p></div>
                          <div><p className="text-muted-foreground">Economia vs banco</p><p className="font-semibold text-emerald-600">R$ {Number(sim.economia_estimada ?? 0).toLocaleString("pt-BR")}</p></div>
                        </div>
                      )}

                      {lead.message && (
                        <p className="rounded-lg bg-muted/40 p-2 text-xs text-muted-foreground italic">"{lead.message}"</p>
                      )}

                      <div className="space-y-2">
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotesDraft((p) => ({ ...p, [lead.id]: e.target.value }))}
                          placeholder="Observações da validação (documento verificado, número da cota, administradora, motivo etc.)"
                          className="min-h-16 text-sm"
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => saveNotes(lead.id)} disabled={savingId === lead.id}>
                            Salvar observação
                          </Button>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => updateValidation(lead.id, "valid")} disabled={savingId === lead.id}>
                            <CheckCircle2 className="mr-1.5 h-4 w-4" />Marcar como válida
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => updateValidation(lead.id, "invalid")} disabled={savingId === lead.id}>
                            <XCircle className="mr-1.5 h-4 w-4" />Inválida
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => updateValidation(lead.id, "needs_docs")} disabled={savingId === lead.id}>
                            <FileText className="mr-1.5 h-4 w-4" />Falta doc
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => updateValidation(lead.id, "pending")} disabled={savingId === lead.id}>
                            <Clock className="mr-1.5 h-4 w-4" />Pendente
                          </Button>
                        </div>
                        {lead.partner_validated_at && (
                          <p className="text-[10px] text-muted-foreground">
                            Última validação: {format(new Date(lead.partner_validated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </p>
                        )}
                      </div>
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
