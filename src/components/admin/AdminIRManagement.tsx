import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
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
  Sparkles, Bug, Download, AlertTriangle, Filter, Search, ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

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
  updated_at: string;
}

interface IRDocument {
  id: string;
  declaration_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size_bytes: number | null;
  mime_type: string | null;
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

const docStatusConfig: Record<string, { label: string; emoji: string; color: string }> = {
  pending: { label: 'Pendente', emoji: '⏸️', color: 'bg-muted text-muted-foreground' },
  processing: { label: 'Processando', emoji: '⏳', color: 'bg-blue-500/10 text-blue-500' },
  extracted: { label: 'Extraído', emoji: '✅', color: 'bg-emerald-500/10 text-emerald-500' },
  error: { label: 'Erro', emoji: '❌', color: 'bg-destructive/10 text-destructive' },
};

const statusOptions = ['draft', 'pending_documents', 'processing', 'ai_analysis', 'review', 'completed', 'error'];

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((cents || 0) / 100);

const formatBytes = (bytes: number | null) => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const AdminIRManagement: React.FC = () => {
  const { toast } = useToast();
  const [declarations, setDeclarations] = useState<IRDeclaration[]>([]);
  const [documents, setDocuments] = useState<Record<string, IRDocument[]>>({});
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Record<string, { name: string; email: string }>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  const fetchDeclarations = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ir_ai_declarations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error('Error fetching declarations:', error);
      toast({ title: 'Erro ao carregar declarações', description: error.message, variant: 'destructive' });
    }

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
  }, [toast]);

  const fetchDocuments = async (declarationId: string) => {
    const { data, error } = await supabase
      .from('ir_ai_documents')
      .select('*')
      .eq('declaration_id', declarationId)
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching docs:', error);
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
      toast({ title: 'Erro ao atualizar status', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Status atualizado', description: `Definido como: ${statusConfig[newStatus]?.label || newStatus}` });
      fetchDeclarations();
    }
    setUpdatingStatus(null);
  };

  const getDocumentUrl = async (filePath: string) => {
    const { data } = await supabase.storage
      .from('ir-ai-documents')
      .createSignedUrl(filePath, 3600);
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    } else {
      toast({ title: 'Erro ao gerar link do documento', variant: 'destructive' });
    }
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
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ir_ai_documents',
      }, (payload) => {
        // Refresh docs for the affected declaration
        const declId = (payload.new as any)?.declaration_id || (payload.old as any)?.declaration_id;
        if (declId && expandedId === declId) {
          fetchDocuments(declId);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchDeclarations, expandedId]);

  // Filtered declarations
  const filtered = declarations.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const profile = profiles[d.user_id];
      const nameMatch = (d.full_name || profile?.name || '').toLowerCase().includes(term);
      const emailMatch = (profile?.email || '').toLowerCase().includes(term);
      const cpfMatch = (d.cpf || '').includes(term);
      if (!nameMatch && !emailMatch && !cpfMatch) return false;
    }
    return true;
  });

  const stats = {
    total: declarations.length,
    pending: declarations.filter(d => ['draft', 'pending_documents'].includes(d.status)).length,
    processing: declarations.filter(d => ['processing', 'ai_analysis'].includes(d.status)).length,
    completed: declarations.filter(d => d.status === 'completed').length,
    review: declarations.filter(d => d.status === 'review').length,
    errors: declarations.filter(d => d.status === 'error').length,
  };

  // Diagnostic checks (only uses server-side data, not in-memory doc state)
  const diagnostics = {
    staleProcessing: declarations.filter(d => {
      if (d.status !== 'processing' && d.status !== 'ai_analysis') return false;
      const updatedAt = new Date(d.updated_at || d.created_at);
      return (Date.now() - updatedAt.getTime()) > 30 * 60 * 1000; // > 30 min
    }).length,
    lowConfidence: declarations.filter(d => d.ai_confidence_percent != null && d.ai_confidence_percent < 50 && d.ai_confidence_percent > 0).length,
    errorDocs: Object.values(documents).flat().filter(d => d.ai_status === 'error').length,
    draftNoAction: declarations.filter(d => {
      if (d.status !== 'draft' && d.status !== 'pending_documents') return false;
      const createdAt = new Date(d.created_at);
      return (Date.now() - createdAt.getTime()) > 24 * 60 * 60 * 1000; // > 24h sem ação
    }).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Imposto de Renda — Contador IA
          </h2>
          <p className="text-sm text-muted-foreground">Monitoramento completo do fluxo de IR automatizado</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showDebugPanel ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="gap-2"
          >
            <Bug className="h-3.5 w-3.5" /> Debug
          </Button>
          <Button variant="outline" size="sm" onClick={fetchDeclarations} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar
          </Button>
        </div>
      </div>

      {/* Debug/Health Panel */}
      {showDebugPanel && (
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-500">
              <Bug className="h-4 w-4" /> Diagnóstico do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className={`p-3 rounded-lg ${diagnostics.staleProcessing > 0 ? 'bg-red-500/10 border border-red-500/20' : 'bg-muted/30'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className={`h-4 w-4 ${diagnostics.staleProcessing > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <p className="text-xs font-medium">Travados (+30min)</p>
                </div>
                <p className="text-2xl font-bold">{diagnostics.staleProcessing}</p>
                {diagnostics.staleProcessing > 0 && (
                  <p className="text-[10px] text-red-500 mt-1">⚠️ Edge function pode ter falhado</p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${stats.errors > 0 ? 'bg-red-500/10 border border-red-500/20' : 'bg-muted/30'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className={`h-4 w-4 ${stats.errors > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <p className="text-xs font-medium">Declarações com Erro</p>
                </div>
                <p className="text-2xl font-bold">{stats.errors}</p>
              </div>
              <div className={`p-3 rounded-lg ${diagnostics.errorDocs > 0 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-muted/30'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className={`h-4 w-4 ${diagnostics.errorDocs > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
                  <p className="text-xs font-medium">Docs com Falha</p>
                </div>
                <p className="text-2xl font-bold">{diagnostics.errorDocs}</p>
              </div>
              <div className={`p-3 rounded-lg ${diagnostics.lowConfidence > 0 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-muted/30'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Brain className={`h-4 w-4 ${diagnostics.lowConfidence > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
                  <p className="text-xs font-medium">Baixa Confiança (&lt;50%)</p>
                </div>
                <p className="text-2xl font-bold">{diagnostics.lowConfidence}</p>
              </div>
              <div className={`p-3 rounded-lg ${diagnostics.draftNoAction > 0 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-muted/30'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className={`h-4 w-4 ${diagnostics.draftNoAction > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
                  <p className="text-xs font-medium">Sem ação (+24h)</p>
                </div>
                <p className="text-2xl font-bold">{diagnostics.draftNoAction}</p>
                {diagnostics.draftNoAction > 0 && (
                  <p className="text-[10px] text-amber-500 mt-1">Usuários pagaram mas não enviaram docs</p>
                )}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">
              💡 Expandir declaração mostra docs detalhados. "Sem ação +24h" indica usuários que pagaram e não retornaram — considere enviar lembrete.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: BarChart3, color: 'text-purple-500 bg-purple-500/10' },
          { label: 'Pendentes', value: stats.pending, icon: Upload, color: 'text-amber-500 bg-amber-500/10' },
          { label: 'Processando', value: stats.processing, icon: Brain, color: 'text-blue-500 bg-blue-500/10' },
          { label: 'Revisão', value: stats.review, icon: Eye, color: 'text-indigo-500 bg-indigo-500/10' },
          { label: 'Concluídas', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10' },
          { label: 'Erros', value: stats.errors, icon: AlertCircle, color: stats.errors > 0 ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground bg-muted' },
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

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou CPF..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-3.5 w-3.5 mr-2" />
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {statusOptions.map(s => (
              <SelectItem key={s} value={s}>{statusConfig[s]?.label || s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {filtered.length} de {declarations.length} declarações
        </span>
      </div>

      {/* Declarations List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Declarações</CardTitle>
          <CardDescription>Clique para expandir — documentos, análise IA, erros e controle de status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">
                {declarations.length === 0
                  ? 'Nenhuma declaração de IR ainda'
                  : 'Nenhuma declaração encontrada com esses filtros'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(decl => {
                const config = statusConfig[decl.status] || statusConfig.draft;
                const Icon = config.icon;
                const isExpanded = expandedId === decl.id;
                const declDocs = documents[decl.id] || [];
                const profile = profiles[decl.user_id];
                const errorDocs = declDocs.filter(d => d.ai_status === 'error');

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
                            <Badge variant="secondary" className={`text-[10px] gap-1 ${
                              decl.ai_confidence_percent < 50 ? 'text-amber-500' : ''
                            }`}>
                              <Brain className="h-3 w-3" />
                              {decl.ai_confidence_percent}%
                            </Badge>
                          )}
                          {errorDocs.length > 0 && isExpanded && (
                            <Badge className="bg-destructive/10 text-destructive border-0 text-[10px]">
                              {errorDocs.length} doc(s) com erro
                            </Badge>
                          )}
                          <span className="text-[11px] text-muted-foreground/60 ml-auto">
                            {formatDistanceToNow(new Date(decl.created_at), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                        {(decl.status === 'completed' || decl.status === 'review') && (
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
                        )}
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

                        {/* Info grid */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground/60 text-xs">CPF</p>
                            <p>{decl.cpf || 'Não informado'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground/60 text-xs">Tipo</p>
                            <p>{decl.declaration_type === 'completa' ? 'Completa' : 'Simplificada'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground/60 text-xs">Confiança IA</p>
                            <p className={decl.ai_confidence_percent != null && decl.ai_confidence_percent < 50 ? 'text-amber-500 font-medium' : ''}>
                              {decl.ai_confidence_percent != null ? `${decl.ai_confidence_percent}%` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground/60 text-xs">Criada em</p>
                            <p>{new Date(decl.created_at).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground/60 text-xs">ID</p>
                            <p className="text-[10px] font-mono text-muted-foreground break-all">{decl.id}</p>
                          </div>
                        </div>

                        {/* Documents */}
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Documentos ({declDocs.length})
                          </h4>
                          {declDocs.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">
                              Nenhum documento enviado ainda
                              {decl.status === 'draft' && ' — usuário precisa acessar o painel e fazer upload'}
                            </p>
                          ) : (
                            <div className="space-y-1.5">
                              {declDocs.map(doc => {
                                const dsc = docStatusConfig[doc.ai_status] || docStatusConfig.pending;
                                return (
                                  <div key={doc.id} className="p-3 rounded-lg bg-muted/30 border border-border text-sm">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <FileText className="h-4 w-4 text-purple-400 shrink-0" />
                                        <span className="truncate font-medium">{doc.file_name}</span>
                                        <Badge variant="secondary" className="text-[10px] shrink-0">{doc.document_type}</Badge>
                                        <span className="text-[10px] text-muted-foreground">{formatBytes(doc.file_size_bytes)}</span>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <Badge className={`${dsc.color} border-0`}>
                                          {dsc.emoji} {dsc.label}
                                        </Badge>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={(e) => { e.stopPropagation(); getDocumentUrl(doc.file_path); }}
                                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                          title="Visualizar documento"
                                        >
                                          <ExternalLink className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    {/* Error details for failed docs */}
                                    {doc.ai_status === 'error' && (
                                      <div className="mt-2 p-2 rounded bg-destructive/5 border border-destructive/10">
                                        <p className="text-xs text-destructive flex items-center gap-1">
                                          <AlertTriangle className="h-3 w-3" />
                                          Falha na análise — possíveis causas: PDF protegido/corrompido, imagem ilegível, formato não suportado, ou timeout da IA
                                        </p>
                                      </div>
                                    )}

                                    {/* Extracted data preview */}
                                    {doc.ai_status === 'extracted' && doc.ai_extracted_data && (
                                      <div className="mt-2 text-xs text-muted-foreground">
                                        {doc.ai_extracted_data.source_name && (
                                          <span>Fonte: {doc.ai_extracted_data.source_name} </span>
                                        )}
                                        {doc.ai_extracted_data.items?.length > 0 && (
                                          <span>• {doc.ai_extracted_data.items.length} item(ns) extraídos </span>
                                        )}
                                        {doc.ai_extracted_data.confidence_percent != null && (
                                          <span className={doc.ai_extracted_data.confidence_percent < 50 ? 'text-amber-500' : ''}>
                                            • {doc.ai_extracted_data.confidence_percent}% confiança
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
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
                            {decl.ai_analysis.optimization_tips?.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {decl.ai_analysis.optimization_tips.map((tip: string, i: number) => (
                                  <div key={i} className="flex items-start gap-1.5 text-xs text-emerald-500">
                                    <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0" />
                                    <span>{tip}</span>
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
