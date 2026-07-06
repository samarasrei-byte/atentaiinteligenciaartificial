import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  GraduationCap, Search, Phone, Mail, RefreshCw, ExternalLink, Download,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
}

const STATUS: Record<string, { label: string; className: string }> = {
  new: { label: "Novo", className: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
  contacted: { label: "Contatado", className: "bg-blue-500/15 text-blue-500 border-blue-500/30" },
  qualified: { label: "Qualificado", className: "bg-violet-500/15 text-violet-500 border-violet-500/30" },
  won: { label: "Fechado", className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
  lost: { label: "Perdido", className: "bg-red-500/15 text-red-500 border-red-500/30" },
};

export default function MentoriaCartasLeads() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  useEffect(() => {
    load();
    const channel = supabase
      .channel("mentoria-leads-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mentoria_cartas_leads" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("mentoria_cartas_leads")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      toast({ title: "Status atualizado" });
    }
  };

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      l.full_name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.phone.includes(q);
    const matchS = statusFilter === "all" || l.status === statusFilter;
    return matchQ && matchS;
  });

  const kpi = {
    total: leads.length,
    novos: leads.filter((l) => l.status === "new").length,
    qualificados: leads.filter((l) => l.status === "qualified").length,
    fechados: leads.filter((l) => l.status === "won").length,
  };

  const exportCsv = () => {
    const header = ["Data", "Nome", "Email", "WhatsApp", "Carta", "Crédito", "Status", "Mensagem"];
    const rows = filtered.map((l) => [
      format(new Date(l.created_at), "dd/MM/yyyy HH:mm"),
      l.full_name,
      l.email,
      l.phone,
      l.carta_type,
      l.credit_range ?? "",
      STATUS[l.status]?.label ?? l.status,
      (l.message ?? "").replace(/\n/g, " "),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mentoria-cartas-leads-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <GraduationCap className="h-6 w-6 text-primary" />
            Mentoria — Cartas Contempladas
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Leads da landing page /cartas-contempladas/mentoria
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
          <a href="/cartas-contempladas/mentoria" target="_blank" rel="noopener noreferrer">
            <Button size="sm">
              <ExternalLink className="mr-2 h-4 w-4" /> Ver landing
            </Button>
          </a>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { l: "Total", v: kpi.total, c: "text-foreground" },
          { l: "Novos", v: kpi.novos, c: "text-amber-500" },
          { l: "Qualificados", v: kpi.qualificados, c: "text-violet-500" },
          { l: "Fechados", v: kpi.fechados, c: "text-emerald-500" },
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
        <CardHeader>
          <CardTitle>Inscrições</CardTitle>
          <CardDescription>Gerencie leads e altere o status conforme o contato evolui.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Buscar por nome, e-mail ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(STATUS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="py-10 text-center text-muted-foreground">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              Nenhum lead encontrado ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((lead) => {
                const s = STATUS[lead.status] ?? STATUS.new;
                return (
                  <div
                    key={lead.id}
                    className="rounded-xl border border-border bg-card p-4 transition hover:border-primary/40"
                  >
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-foreground">{lead.full_name}</p>
                          <Badge className={`border ${s.className}`}>{s.label}</Badge>
                          <Badge variant="secondary" className="text-xs">
                            {lead.carta_type}
                          </Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <a
                            href={`mailto:${lead.email}`}
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            <Mail className="h-3 w-3" /> {lead.email}
                          </a>
                          <a
                            href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            <Phone className="h-3 w-3" /> {lead.phone}
                          </a>
                          {lead.credit_range && (
                            <span>Crédito: <b className="text-foreground">{lead.credit_range}</b></span>
                          )}
                          <span>
                            {format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        {lead.message && (
                          <p className="mt-2 rounded-lg bg-muted/40 p-2 text-xs text-muted-foreground">
                            "{lead.message}"
                          </p>
                        )}
                      </div>
                      <Select
                        value={lead.status}
                        onValueChange={(v) => updateStatus(lead.id, v)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
