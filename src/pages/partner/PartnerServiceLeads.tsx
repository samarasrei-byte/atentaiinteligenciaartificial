import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Lock, CheckCircle2, XCircle, Clock, HandshakeIcon, Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export type PartnerServiceTable = "energy_recovery_requests" | "water_recovery_requests" | "solar_requests";

interface Props {
  table: PartnerServiceTable;
  serviceLabel: string;
  valueField: "estimated_recovery_cents" | "estimated_savings_cents";
  valueLabel: string;
}

interface Row {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  approval_stage: string;
  partner_notes: string | null;
  admin_notes: string | null;
  metadata: any;
  created_at: string;
  [k: string]: any;
}

const STAGE: Record<string, { label: string; className: string; Icon: any }> = {
  new_lead: { label: "Novo lead", className: "bg-amber-500/15 text-amber-500 border-amber-500/30", Icon: Clock },
  partner_approved: { label: "Aprovado — aguarda admin", className: "bg-blue-500/15 text-blue-600 border-blue-500/30", Icon: HandshakeIcon },
  partner_rejected: { label: "Rejeitado", className: "bg-red-500/15 text-red-500 border-red-500/30", Icon: XCircle },
  admin_released: { label: "Contato liberado", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", Icon: CheckCircle2 },
};

const BRL = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((cents || 0) / 100);

const maskEmail = (e: string) => {
  const [u, d] = (e || "").split("@");
  if (!u || !d) return "•••@•••";
  return `${u.slice(0, 2)}${"•".repeat(Math.max(2, u.length - 2))}@${d}`;
};
const maskPhone = (p: string) => {
  const d = (p || "").replace(/\D/g, "");
  if (d.length < 4) return "•• ••••• ••••";
  return `(${d.slice(0, 2)}) •••••-${d.slice(-2)}`;
};

export function PartnerServiceLeads({ table, serviceLabel, valueField, valueLabel }: Props) {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else setRows((data ?? []) as Row[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`partner-${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  const approve = async (id: string) => {
    setSavingId(id);
    const { error } = await supabase.from(table).update({
      approval_stage: "partner_approved",
      partner_notes: notesDraft[id] ?? null,
    }).eq("id", id);
    setSavingId(null);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else toast({ title: "Aprovado!", description: "Admin foi notificado." });
  };

  const reject = async (id: string) => {
    setSavingId(id);
    const { error } = await supabase.from(table).update({
      approval_stage: "partner_rejected",
      partner_notes: notesDraft[id] ?? null,
    }).eq("id", id);
    setSavingId(null);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else toast({ title: "Rejeitado" });
  };

  const kpi = useMemo(() => ({
    total: rows.length,
    pending: rows.filter(r => r.approval_stage === "new_lead").length,
    waiting: rows.filter(r => r.approval_stage === "partner_approved").length,
    released: rows.filter(r => r.approval_stage === "admin_released").length,
  }), [rows]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Total leads", v: kpi.total },
          { l: "Novos", v: kpi.pending },
          { l: "Aguardando admin", v: kpi.waiting },
          { l: "Liberados", v: kpi.released },
        ].map((k) => (
          <Card key={k.l}><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{k.l}</p>
            <p className="mt-1 text-2xl font-bold">{k.v}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{serviceLabel} — {rows.length} solicitação(ões)</p>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="mr-2 h-4 w-4" />Atualizar</Button>
      </div>

      {loading ? (
        <div className="py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">Nenhuma solicitação ainda.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => {
            const S = STAGE[r.approval_stage] ?? STAGE.new_lead;
            const released = r.approval_stage === "admin_released";
            const canEdit = r.approval_stage === "new_lead";
            return (
              <div key={r.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{r.full_name}</p>
                      <Badge className={`border ${S.className}`}><S.Icon className="mr-1 h-3 w-3" />{S.label}</Badge>
                      <Badge variant="outline" className="text-xs">{r.client_type?.toUpperCase()}</Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Recebido em {format(new Date(r.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-muted-foreground">{valueLabel}</p>
                    <p className="text-lg font-bold text-primary">{BRL(r[valueField])}</p>
                  </div>
                </div>

                <div className={`rounded-lg border p-3 text-xs ${released ? "border-emerald-500/40 bg-emerald-500/10" : "border-dashed border-border bg-muted/30"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {released ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                    <span className="font-semibold">{released ? "Contato liberado" : "Bloqueado até liberação do admin"}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">E-mail</p>
                      {released ? (
                        <a href={`mailto:${r.email}`} className="font-mono text-sm hover:text-primary flex items-center gap-1"><Mail className="h-3 w-3" />{r.email}</a>
                      ) : <p className="font-mono text-sm text-muted-foreground">{maskEmail(r.email)}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">WhatsApp</p>
                      {released ? (
                        <a href={`https://wa.me/${r.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="font-mono text-sm hover:text-primary flex items-center gap-1"><Phone className="h-3 w-3" />{r.phone}</a>
                      ) : <p className="font-mono text-sm text-muted-foreground">{maskPhone(r.phone)}</p>}
                    </div>
                  </div>
                </div>

                {r.admin_notes && (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2 text-xs">
                    <p className="text-[10px] font-semibold uppercase text-emerald-600">Nota do admin</p>
                    <p>{r.admin_notes}</p>
                  </div>
                )}

                {canEdit ? (
                  <div className="space-y-2 rounded-lg border border-border bg-background/60 p-3">
                    <Textarea
                      value={notesDraft[r.id] ?? r.partner_notes ?? ""}
                      onChange={(e) => setNotesDraft((p) => ({ ...p, [r.id]: e.target.value }))}
                      placeholder="Observações da análise..."
                      className="min-h-16 text-sm"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => approve(r.id)} disabled={savingId === r.id}>
                        <CheckCircle2 className="mr-1.5 h-4 w-4" />Aprovar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => reject(r.id)} disabled={savingId === r.id}>
                        <XCircle className="mr-1.5 h-4 w-4" />Rejeitar
                      </Button>
                    </div>
                  </div>
                ) : (
                  r.partner_notes && (
                    <div className="rounded-lg border border-border/60 bg-muted/30 p-2 text-xs">
                      <p className="text-[10px] font-semibold uppercase text-muted-foreground">Sua observação</p>
                      <p>{r.partner_notes}</p>
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
