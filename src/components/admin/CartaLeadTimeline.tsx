import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Clock, Send, ShieldCheck, XCircle, CheckCircle2, Ban, RefreshCw, ChevronDown, ChevronUp,
} from "lucide-react";

interface Lead {
  id: string;
  created_at: string;
  full_name: string;
  approval_stage: string;
  partner_approved_at: string | null;
  partner_rejection_reason: string | null;
  partner_validation_notes: string | null;
  admin_released_at: string | null;
  admin_release_notes: string | null;
}

interface AuditRow {
  id: string;
  action_type: string;
  success: boolean;
  failure_reason: string | null;
  metadata: any;
  created_at: string;
}

const ACTION: Record<string, { label: string; Icon: any; color: string }> = {
  carta_partner_approve: { label: "Parceiro aprovou", Icon: ShieldCheck, color: "text-blue-600" },
  carta_partner_reject: { label: "Parceiro rejeitou", Icon: XCircle, color: "text-red-500" },
  carta_admin_release: { label: "Admin liberou contato", Icon: CheckCircle2, color: "text-emerald-600" },
  carta_admin_deny: { label: "Admin negou liberação", Icon: Ban, color: "text-red-600" },
};

interface Event {
  at: string;
  Icon: any;
  color: string;
  title: string;
  detail?: string | null;
  actor?: string | null;
  success?: boolean;
}

export function CartaLeadTimeline({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("audit_logs")
      .select("id, action_type, success, failure_reason, metadata, created_at")
      .eq("resource_type", "mentoria_cartas_lead")
      .eq("resource_id", lead.id)
      .order("created_at", { ascending: true });
    setAudit((data ?? []) as AuditRow[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!open) return;
    load();
    const channel = supabase
      .channel(`carta-audit-${lead.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "audit_logs", filter: `resource_id=eq.${lead.id}` },
        () => load(),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lead.id]);

  // Build unified event list: lead fields + audit rows
  const events: Event[] = [];
  events.push({
    at: lead.created_at,
    Icon: Send,
    color: "text-slate-500",
    title: "Quiz enviado pelo cliente",
    detail: lead.full_name,
    success: true,
  });
  audit.forEach((a) => {
    const cfg = ACTION[a.action_type];
    if (!cfg) return;
    events.push({
      at: a.created_at,
      Icon: cfg.Icon,
      color: a.success ? cfg.color : "text-red-500",
      title: cfg.label + (a.success ? "" : " (falhou)"),
      detail: a.failure_reason
        ?? a.metadata?.reason
        ?? a.metadata?.notes
        ?? null,
      actor: a.metadata?.actor_email ?? null,
      success: a.success,
    });
  });
  // Fallback to lead columns if audit is empty (older leads)
  if (audit.length === 0) {
    if (lead.partner_approved_at) events.push({
      at: lead.partner_approved_at, Icon: ShieldCheck, color: "text-blue-600",
      title: "Parceiro aprovou", detail: lead.partner_validation_notes, success: true,
    });
    if (lead.partner_rejection_reason) events.push({
      at: lead.partner_approved_at ?? lead.created_at, Icon: XCircle, color: "text-red-500",
      title: "Parceiro rejeitou", detail: lead.partner_rejection_reason, success: true,
    });
    if (lead.admin_released_at) events.push({
      at: lead.admin_released_at,
      Icon: lead.approval_stage === "admin_denied" ? Ban : CheckCircle2,
      color: lead.approval_stage === "admin_denied" ? "text-red-600" : "text-emerald-600",
      title: lead.approval_stage === "admin_denied" ? "Admin negou liberação" : "Admin liberou contato",
      detail: lead.admin_release_notes,
      success: true,
    });
  }
  events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  const currentStage = lead.approval_stage;
  const lastAt = events[events.length - 1]?.at ?? lead.created_at;

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs hover:bg-muted/40"
      >
        <span className="flex items-center gap-2 font-semibold text-foreground">
          <Clock className="h-3.5 w-3.5 text-primary" />
          Linha do tempo do lead
          <Badge variant="secondary" className="ml-1 text-[10px]">
            {events.length} evento{events.length === 1 ? "" : "s"}
          </Badge>
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          Último: {format(new Date(lastAt), "dd/MM HH:mm", { locale: ptBR })}
          {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </span>
      </button>

      {open && (
        <div className="border-t border-border/60 p-3">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3 animate-spin" /> Carregando eventos...
            </div>
          ) : (
            <ol className="relative space-y-3 border-l border-border/60 pl-4">
              {events.map((e, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[19px] top-0.5 flex h-3 w-3 items-center justify-center rounded-full border border-border bg-background">
                    <e.Icon className={`h-2.5 w-2.5 ${e.color}`} />
                  </span>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <p className={`text-xs font-semibold ${e.success === false ? "text-red-500" : "text-foreground"}`}>
                      {e.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(e.at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                    </span>
                    {e.actor && (
                      <span className="text-[10px] text-muted-foreground">• {e.actor}</span>
                    )}
                  </div>
                  {e.detail && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">"{e.detail}"</p>
                  )}
                </li>
              ))}
              <li className="relative">
                <span className="absolute -left-[19px] top-0.5 flex h-3 w-3 items-center justify-center rounded-full border border-primary bg-primary/20">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                </span>
                <p className="text-xs font-semibold text-primary">
                  Estado atual: {currentStage.replace(/_/g, " ")}
                </p>
              </li>
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
