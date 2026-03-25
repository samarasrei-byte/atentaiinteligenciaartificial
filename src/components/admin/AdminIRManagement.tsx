import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Brain, FileText, Upload, CheckCircle2, AlertCircle,
  RefreshCw, Clock, Eye, Loader2, BarChart3, ChevronDown, ChevronUp,
  Sparkles
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface IRDeclaration {
  id: string;
  user_id: string;
  fiscal_year: number;
  declaration_type: string;
  status: string;
  full_name: string | null;
  cpf: string | null;
  total_income_cents: number;
  total_deductions_cents: number;
  tax_due_cents: number;
  refund_cents: number;
  ai_confidence_percent: number | null;
  ai_analysis: any;
  created_at: string;
}

interface IRDocument {
  id: string;
  declaration_id: string;
  document_type: string;
  file_name: string;
  ai_status: string;
  ai_extracted_data: any;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Rascunho', color: 'bg-muted text-muted-foreground', icon: FileText },
  pending_documents: { label: 'Aguardando Docs', color: 'bg-amber-500/10 text-amber-600', icon: Upload },
  processing: { label: 'Processando', color: 'bg-blue-500/10 text-blue-600', icon: Loader2 },
  ai_analysis: { label: 'IA Analisando', color: 'bg-purple-500/10 text-purple-600', icon: Brain },
  review: { label: 'Em Revisão', color: 'bg-indigo-500/10 text-indigo-600', icon: Eye },
  completed: { label: 'Concluída', color: 'bg-emerald-500/10 text-emerald-600', icon: CheckCircle2 },
  error: { label: 'Erro', color: 'bg-destructive/10 text-destructive', icon: AlertCircle },
};

const statusOptions = ['draft', 'pending_documents', 'processing', 'ai_analysis', 'review', 'completed', 'error'];

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((cents || 0) / 100);

export const AdminIRManagement: React.FC = () => {
  const { toast } = useToast();
  const [declarations, setDeclarations] = useState<IRDeclaration[]>([]);
  const [documents, setDocuments] = useState<Record<string, IRDocument[]>>({});
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Record<string, { name: string; email: string }>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchDeclarations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('ir_ai_declarations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    const items = (data || []) as any[];
    setDeclarations(items);

    // Fetch user profiles
    const userIds = [...new Set(items.map((d: any) => d.user_id))];
    if (userIds.length > 0) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);

      const map: Record<string, { name: string; email: string }> = {};
      (profileData || []).forEach((p: any) => {
        map[p.user_id] = { name: p.full_name || 'Sem nome', email: p.email || '' };
      });
      setProfiles(map);
    }

    setLoading(false);
  };

  const fetchDocuments = async (declarationId: string) => {
    const { data } = await supabase
      .from('ir_ai_documents')
      .select('*')
      .eq('declaration_id', declarationId)
      .order('created_at', { ascending: false });

    setDocuments(prev => ({ ...prev, [declarationId]: (data || []) as any[] }));
  };

  const handleExpand = (declId: string) => {
    if (expandedId === declId) {
      setExpandedId(null);
    } else {
      setExpandedId(declId);
      if (!documents[declId]) {
        fetchDocuments(declId);
      }
    }
  };

  const handleStatusChange = async (declId: string, newStatus: string) => {
    setUpdatingStatus(declId);
    const updateData: any = { status: newStatus };
    if (newStatus === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('ir_ai_declarations')
      .update(updateData)
      .eq('id', declId);

    if (error) {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
    } else {
      toast({ title: 'Status atualizado', description: `Definido como: ${statusConfig[newStatus]?.label || newStatus}` });
      fetchDeclarations();
    }
    setUpdatingStatus(null);
  };

  useEffect(() => {
    fetchDeclarations();

    const channel = supabase
      .channel('admin-ir-declarations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ir_ai_declarations',
      }, () => fetchDeclarations())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const stats = {
    total: declarations.length,
    pending: declarations.filter(d => ['draft', 'pending_documents'].includes(d.status)).length,
    processing: declarations.filter(d => ['processing', 'ai_analysis'].includes(d.status)).length,
    completed: declarations.filter(d => d.status === 'completed').length,
    review: declarations.filter(d => d.status === 'review').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Imposto de Renda — Contador IA
          </h2>
          <p className="text-sm text-muted-foreground">Declarações processadas por inteligência artificial</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDeclarations} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: BarChart3, color: 'text-purple-500 bg-purple-500/10' },
          { label: 'Pendentes', value: stats.pending, icon: Upload, color: 'text-amber-500 bg-amber-500/10' },
          { label: 'Processando', value: stats.processing, icon: Brain, color: 'text-blue-500 bg-blue-500/10' },
          { label: 'Revisão', value: stats.review, icon: Eye, color: 'text-indigo-500 bg-indigo-500/10' },
          { label: 'Concluídas', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10' },
        ].map((s, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color.split(' ')[1]}`}>
                <s.icon className={`h-4 w-4 ${s.color.split(' ')[0]}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Declarations List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Declarações</CardTitle>
          <CardDescription>Clique para expandir e ver documentos, análise IA e controlar status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : declarations.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">Nenhuma declaração de IR ainda</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                As declarações aparecerão aqui quando os usuários iniciarem pelo Contador IA
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {declarations.map(decl => {
                const config = statusConfig[decl.status] || statusConfig.draft;
                const Icon = config.icon;
                const isExpanded = expandedId === decl.id;
                const declDocs = documents[decl.id] || [];
                const profile = profiles[decl.user_id];

                return (
                  <div key={decl.id} className="rounded-xl border border-border overflow-hidden">
                    {/* Header row */}
                    <div
                      className="flex items-start gap-4 p-4 bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer"
                      onClick={() => handleExpand(decl.id)}
                    >
                      <div className={`p-2.5 rounded-lg ${config.color} shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">
                            {decl.full_name || profile?.name || 'Usuário'}
                          </p>
                          {profile?.email && (
                            <span className="text-xs text-muted-foreground">{profile.email}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className={`text-[10px] ${config.color}`}>
                            {config.label}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {decl.declaration_type === 'completa' ? 'Completa' : 'Simples'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Ano: {decl.fiscal_year}
                          </span>
                          {decl.ai_confidence_percent != null && decl.ai_confidence_percent > 0 && (
                            <Badge variant="secondary" className="text-[10px] gap-1">
                              <Brain className="h-3 w-3" />
                              {decl.ai_confidence_percent}%
                            </Badge>
                          )}
                          <span className="text-[11px] text-muted-foreground/60 ml-auto">
                            {formatDistanceToNow(new Date(decl.created_at), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                        {decl.status === 'completed' || decl.status === 'review' ? (
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Renda: {formatCurrency(decl.total_income_cents)}</span>
                            <span>Deduções: {formatCurrency(decl.total_deductions_cents)}</span>
                            {(decl.refund_cents || 0) > 0 && (
                              <span className="text-emerald-600">Restituição: {formatCurrency(decl.refund_cents)}</span>
                            )}
                            {(decl.tax_due_cents || 0) > 0 && (
                              <span className="text-destructive">Imposto: {formatCurrency(decl.tax_due_cents)}</span>
                            )}
                          </div>
                        ) : null}
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />}
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="border-t border-border p-4 space-y-4 bg-muted/10">
                        {/* Status control */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground">Alterar status:</span>
                          <Select
                            value={decl.status}
                            onValueChange={(val) => handleStatusChange(decl.id, val)}
                            disabled={updatingStatus === decl.id}
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map(s => (
                                <SelectItem key={s} value={s}>
                                  {statusConfig[s]?.label || s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {updatingStatus === decl.id && <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>

                        {/* Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground/60 text-xs">CPF</p>
                            <p>{decl.cpf || 'Não informado'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground/60 text-xs">Tipo</p>
                            <p>{decl.declaration_type === 'completa' ? 'Declaração Completa' : 'Declaração Simplificada'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground/60 text-xs">Confiança IA</p>
                            <p>{decl.ai_confidence_percent != null ? `${decl.ai_confidence_percent}%` : 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground/60 text-xs">Criada em</p>
                            <p>{new Date(decl.created_at).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>

                        {/* Documents */}
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Documentos ({declDocs.length})
                          </h4>
                          {declDocs.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">Nenhum documento enviado ainda</p>
                          ) : (
                            <div className="space-y-1.5">
                              {declDocs.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border text-sm">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="h-4 w-4 text-purple-400 shrink-0" />
                                    <span className="truncate">{doc.file_name}</span>
                                    <Badge variant="secondary" className="text-[10px] shrink-0">{doc.document_type}</Badge>
                                  </div>
                                  <Badge className={
                                    doc.ai_status === 'extracted' ? 'bg-emerald-500/10 text-emerald-500 border-0' :
                                    doc.ai_status === 'processing' ? 'bg-blue-500/10 text-blue-500 border-0' :
                                    doc.ai_status === 'error' ? 'bg-destructive/10 text-destructive border-0' :
                                    'bg-muted text-muted-foreground border-0'
                                  }>
                                    {doc.ai_status === 'extracted' ? '✅ Extraído' :
                                     doc.ai_status === 'processing' ? '⏳ Processando' :
                                     doc.ai_status === 'error' ? '❌ Erro' : '⏸️ Pendente'}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* AI Analysis preview */}
                        {decl.ai_analysis && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-purple-400" />
                              Análise IA
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="p-3 rounded-lg bg-muted/30">
                                <p className="text-xs text-muted-foreground">Rendimentos</p>
                                <p className="font-bold text-blue-500">{formatCurrency(decl.total_income_cents)}</p>
                              </div>
                              <div className="p-3 rounded-lg bg-muted/30">
                                <p className="text-xs text-muted-foreground">Deduções</p>
                                <p className="font-bold text-emerald-500">{formatCurrency(decl.total_deductions_cents)}</p>
                              </div>
                              <div className="p-3 rounded-lg bg-muted/30">
                                <p className="text-xs text-muted-foreground">Imposto</p>
                                <p className="font-bold text-amber-500">{formatCurrency(decl.tax_due_cents)}</p>
                              </div>
                              <div className="p-3 rounded-lg bg-muted/30">
                                <p className="text-xs text-muted-foreground">Restituição</p>
                                <p className="font-bold text-emerald-500">{formatCurrency(decl.refund_cents)}</p>
                              </div>
                            </div>
                            {decl.ai_analysis.recommended_model && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Modelo recomendado: <strong className="text-purple-500 capitalize">{decl.ai_analysis.recommended_model}</strong>
                                {decl.ai_analysis.recommendation_reason && ` — ${decl.ai_analysis.recommendation_reason}`}
                              </p>
                            )}
                            {decl.ai_analysis.alerts?.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {decl.ai_analysis.alerts.map((alert: string, i: number) => (
                                  <div key={i} className="flex items-start gap-1.5 text-xs text-amber-500">
                                    <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                                    <span>{alert}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminIRManagement;
