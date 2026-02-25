import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Copy, Eye, Pencil, Trash2, ExternalLink, BarChart3 } from "lucide-react";
import { Helmet } from "react-helmet-async";

function slugify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface FormData {
  client_name: string;
  segment: string;
  headline: string;
  subheadline: string;
  slug: string;
  cta_whatsapp: string;
  cta_calendar_link: string;
  metrics: { tasks_automated: number; hours_saved: number; productivity_increase: number; clients_impacted: number; active_agents: number };
  roi_data: { monthly_hours_saved: number; hourly_rate_brl: number; annual_projection_multiplier: number };
  sections_config: Record<string, boolean>;
  is_active: boolean;
}

const defaultForm: FormData = {
  client_name: "", segment: "contador_fiscal",
  headline: "Como o Atentai pode transformar seu escritório em uma operação 3x mais produtiva",
  subheadline: "Automatize processos, reduza erros e aumente a produtividade da sua equipe contábil.",
  slug: "", cta_whatsapp: "", cta_calendar_link: "",
  metrics: { tasks_automated: 1500, hours_saved: 320, productivity_increase: 67, clients_impacted: 200, active_agents: 12 },
  roi_data: { monthly_hours_saved: 40, hourly_rate_brl: 150, annual_projection_multiplier: 12 },
  sections_config: { hero: true, what_is: true, features: true, social_proof: true, pain_points: true, transformation: true, roi: true, demo: true, testimonials: true, cta: true },
  is_active: true,
};

const sectionLabels: Record<string, string> = {
  hero: "Abertura Impactante", what_is: "O que é o Atentai", features: "Funcionalidades",
  social_proof: "Prova Social", pain_points: "Problemas do Contador", transformation: "Antes x Depois",
  roi: "Simulação ROI", demo: "Demonstração", testimonials: "Cases de Sucesso", cta: "CTA Final",
};

export default function AdminPresentations() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);

  const { data: presentations = [], isLoading } = useQuery({
    queryKey: ["admin-presentations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sales_presentations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (f: FormData) => {
      const payload = { ...f, created_by: user?.id };
      if (editId) {
        const { error } = await supabase.from("sales_presentations").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("sales_presentations").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-presentations"] }); setOpen(false); setEditId(null); setForm(defaultForm); toast.success(editId ? "Apresentação atualizada!" : "Apresentação criada!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("sales_presentations").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-presentations"] }); toast.success("Apresentação removida!"); },
  });

  const openEdit = (p: any) => {
    setEditId(p.id);
    setForm({ client_name: p.client_name, segment: p.segment, headline: p.headline, subheadline: p.subheadline, slug: p.slug, cta_whatsapp: p.cta_whatsapp || "", cta_calendar_link: p.cta_calendar_link || "", metrics: p.metrics, roi_data: p.roi_data, sections_config: p.sections_config, is_active: p.is_active });
    setOpen(true);
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/apresentacao/${slug}`);
    toast.success("Link copiado!");
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Helmet><title>Apresentações Comerciais | Admin</title></Helmet>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Apresentações Comerciais</h1>
          <p className="text-muted-foreground text-sm">Crie e gerencie apresentações personalizadas para contadores</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditId(null); setForm(defaultForm); } }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Nova Apresentação</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? "Editar" : "Nova"} Apresentação</DialogTitle></DialogHeader>
            <div className="space-y-6 py-4">
              {/* Basic */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Cliente</Label>
                  <Input value={form.client_name} onChange={e => { setForm(f => ({ ...f, client_name: e.target.value, slug: slugify(e.target.value) })); }} placeholder="Escritório Silva Contabilidade" />
                </div>
                <div>
                  <Label>Segmento</Label>
                  <Input value={form.segment} onChange={e => setForm(f => ({ ...f, segment: e.target.value }))} placeholder="contador fiscal" />
                </div>
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
                <p className="text-xs text-muted-foreground mt-1">/apresentacao/{form.slug || "..."}</p>
              </div>
              <div>
                <Label>Headline</Label>
                <Textarea value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} rows={2} />
              </div>
              <div>
                <Label>Subheadline</Label>
                <Textarea value={form.subheadline} onChange={e => setForm(f => ({ ...f, subheadline: e.target.value }))} rows={2} />
              </div>

              {/* Metrics */}
              <div>
                <h3 className="font-semibold mb-3">Métricas</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(form.metrics).map(([k, v]) => (
                    <div key={k}>
                      <Label className="text-xs capitalize">{k.replace(/_/g, " ")}</Label>
                      <Input type="number" value={v} onChange={e => setForm(f => ({ ...f, metrics: { ...f.metrics, [k]: Number(e.target.value) } }))} />
                    </div>
                  ))}
                </div>
              </div>

              {/* ROI */}
              <div>
                <h3 className="font-semibold mb-3">ROI</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label className="text-xs">Horas/mês</Label><Input type="number" value={form.roi_data.monthly_hours_saved} onChange={e => setForm(f => ({ ...f, roi_data: { ...f.roi_data, monthly_hours_saved: Number(e.target.value) } }))} /></div>
                  <div><Label className="text-xs">R$/hora</Label><Input type="number" value={form.roi_data.hourly_rate_brl} onChange={e => setForm(f => ({ ...f, roi_data: { ...f.roi_data, hourly_rate_brl: Number(e.target.value) } }))} /></div>
                  <div><Label className="text-xs">Meses</Label><Input type="number" value={form.roi_data.annual_projection_multiplier} onChange={e => setForm(f => ({ ...f, roi_data: { ...f.roi_data, annual_projection_multiplier: Number(e.target.value) } }))} /></div>
                </div>
              </div>

              {/* CTA */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>WhatsApp (nº)</Label><Input value={form.cta_whatsapp} onChange={e => setForm(f => ({ ...f, cta_whatsapp: e.target.value }))} placeholder="5511999999999" /></div>
                <div><Label>Link de Agenda</Label><Input value={form.cta_calendar_link} onChange={e => setForm(f => ({ ...f, cta_calendar_link: e.target.value }))} placeholder="https://cal.com/..." /></div>
              </div>

              {/* Sections */}
              <div>
                <h3 className="font-semibold mb-3">Seções Ativas</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(form.sections_config).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                      <span className="text-sm">{sectionLabels[k] || k}</span>
                      <Switch checked={v} onCheckedChange={c => setForm(f => ({ ...f, sections_config: { ...f.sections_config, [k]: c } }))} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={c => setForm(f => ({ ...f, is_active: c }))} />
                <Label>Ativa</Label>
              </div>

              <Button className="w-full" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending || !form.client_name || !form.slug}>
                {saveMutation.isPending ? "Salvando..." : editId ? "Salvar Alterações" : "Criar Apresentação"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4">{[1,2,3].map(i => <Card key={i}><CardContent className="p-6"><div className="h-16 animate-pulse bg-muted rounded" /></CardContent></Card>)}</div>
      ) : presentations.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">Nenhuma apresentação criada ainda.</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {presentations.map((p: any) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{p.client_name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                      {p.is_active ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">/apresentacao/{p.slug}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {p.view_count} views</span>
                    <span>{p.segment}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => copyLink(p.slug)} title="Copiar link"><Copy className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" asChild title="Visualizar"><a href={`/apresentacao/${p.slug}`} target="_blank"><ExternalLink className="w-4 h-4" /></a></Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)} title="Editar"><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm("Remover?")) deleteMutation.mutate(p.id); }} title="Remover"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
