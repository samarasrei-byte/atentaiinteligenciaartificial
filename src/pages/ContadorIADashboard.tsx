import React, { useState, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Brain, Upload, FileText, CheckCircle2, AlertCircle,
  TrendingUp, TrendingDown, DollarSign, Shield, Sparkles,
  LogOut, Loader2, Eye, FileUp, Trash2, BarChart3, Zap,
  Star, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

type Declaration = {
  id: string;
  fiscal_year: number;
  declaration_type: string;
  status: string;
  full_name: string | null;
  cpf: string | null;
  total_income_cents: number;
  total_deductions_cents: number;
  tax_due_cents: number;
  refund_cents: number;
  ai_analysis: any;
  ai_confidence_percent: number | null;
  created_at: string;
};

type DocFile = {
  id: string;
  declaration_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  ai_extracted_data: any;
  ai_status: string;
  created_at: string;
};

const statusMap: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Rascunho', color: 'text-muted-foreground bg-muted', icon: FileText },
  pending_documents: { label: 'Envie documentos', color: 'text-amber-400 bg-amber-500/10', icon: Upload },
  processing: { label: 'Processando', color: 'text-blue-400 bg-blue-500/10', icon: Loader2 },
  ai_analysis: { label: 'IA Analisando', color: 'text-purple-400 bg-purple-500/10', icon: Brain },
  review: { label: 'Revisar', color: 'text-emerald-400 bg-emerald-500/10', icon: Eye },
  completed: { label: 'Concluída', color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle2 },
  error: { label: 'Erro', color: 'text-red-400 bg-red-500/10', icon: AlertCircle },
};

const docTypeLabels: Record<string, string> = {
  informe_rendimentos: 'Informe de Rendimentos',
  comprovante_medico: 'Comprovante Médico',
  comprovante_educacao: 'Comprovante Educação',
  recibo_aluguel: 'Recibo de Aluguel',
  nota_corretagem: 'Nota de Corretagem',
  darf: 'DARF',
  other: 'Outro',
};

const formatCurrency = (cents: number) =>
  `R$ ${(cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

const ContadorIADashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [activeDeclaration, setActiveDeclaration] = useState<Declaration | null>(null);
  const [documents, setDocuments] = useState<DocFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingDocId, setAnalyzingDocId] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState('informe_rendimentos');
  const initializedRef = useRef(false);

  const loadDocuments = useCallback(async (declarationId: string) => {
    const { data } = await supabase
      .from('ir_ai_documents')
      .select('*')
      .eq('declaration_id', declarationId)
      .order('created_at', { ascending: false });
    setDocuments((data as DocFile[]) || []);
  }, []);

  // Load declarations - only once on mount
  const loadDeclarations = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data } = await supabase
      .from('ir_ai_declarations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    const decls = (data as Declaration[]) || [];
    setDeclarations(decls);
    if (decls.length > 0 && !initializedRef.current) {
      initializedRef.current = true;
      setActiveDeclaration(decls[0]);
      loadDocuments(decls[0].id);
    }
    setIsLoading(false);
  }, [user, loadDocuments]);

  React.useEffect(() => { loadDeclarations(); }, [loadDeclarations]);

  // Create new declaration
  const createDeclaration = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('ir_ai_declarations')
      .insert({
        user_id: user.id,
        full_name: profile?.full_name || '',
        fiscal_year: new Date().getFullYear() - 1,
      })
      .select()
      .single();
    if (error) { toast.error('Erro ao criar declaração'); return; }
    toast.success('Declaração criada! Envie seus documentos.');
    setActiveDeclaration(data as Declaration);
    setDocuments([]);
    loadDeclarations();
  };

  // Upload document
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !activeDeclaration || !user) return;
    setIsUploading(true);

    for (const file of Array.from(e.target.files)) {
      const filePath = `${user.id}/${activeDeclaration.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('ir-ai-documents')
        .upload(filePath, file);

      if (uploadError) {
        toast.error(`Erro ao enviar ${file.name}`);
        continue;
      }

      await supabase.from('ir_ai_documents').insert({
        declaration_id: activeDeclaration.id,
        user_id: user.id,
        document_type: selectedDocType,
        file_name: file.name,
        file_path: filePath,
        file_size_bytes: file.size,
        mime_type: file.type,
      });
    }

    toast.success('Documentos enviados!');
    loadDocuments(activeDeclaration.id);
    setIsUploading(false);
    e.target.value = '';
  };

  // Analyze single document
  const analyzeDocument = async (doc: DocFile) => {
    setAnalyzingDocId(doc.id);
    try {
      const { error } = await supabase.functions.invoke('ai-ir-analyze', {
        body: {
          declarationId: activeDeclaration?.id,
          documentId: doc.id,
          documentType: doc.document_type,
          action: 'analyze_document',
        },
      });
      if (error) throw error;
      toast.success(`"${doc.file_name}" analisado!`);
      if (activeDeclaration) loadDocuments(activeDeclaration.id);
    } catch (err: any) {
      toast.error(err?.message || 'Erro na análise');
    }
    setAnalyzingDocId(null);
  };

  // Analyze all pending docs sequentially (avoids rate limits)
  const analyzeAllPending = async () => {
    if (!activeDeclaration) return;
    setIsAnalyzing(true);
    for (const doc of pendingDocs) {
      await analyzeDocument(doc);
      // Small delay between requests to avoid rate limits
      await new Promise(r => setTimeout(r, 1500));
    }
    setIsAnalyzing(false);
  };

  // Delete document
  const deleteDocument = async (doc: DocFile) => {
    const confirmed = window.confirm(`Excluir "${doc.file_name}"?`);
    if (!confirmed) return;
    
    // Delete from storage
    await supabase.storage.from('ir-ai-documents').remove([doc.file_path]);
    // Delete from database
    await supabase.from('ir_ai_documents').delete().eq('id', doc.id);
    toast.success('Documento excluído');
    if (activeDeclaration) loadDocuments(activeDeclaration.id);
  };

  // Generate full summary
  const generateSummary = async () => {
    if (!activeDeclaration) return;
    setIsAnalyzing(true);
    try {
      const { error } = await supabase.functions.invoke('ai-ir-analyze', {
        body: { declarationId: activeDeclaration.id, action: 'generate_summary' },
      });
      if (error) throw error;
      toast.success('Declaração analisada! Revise os dados.');
      loadDeclarations();
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao gerar resumo');
    }
    setIsAnalyzing(false);
  };

  const extractedDocs = documents.filter(d => d.ai_status === 'extracted');
  const pendingDocs = documents.filter(d => d.ai_status === 'pending');
  const analysis = activeDeclaration?.ai_analysis;

  const metrics = [
    { label: 'Rendimentos', value: formatCurrency(activeDeclaration?.total_income_cents || 0), icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Deduções', value: formatCurrency(activeDeclaration?.total_deductions_cents || 0), icon: TrendingDown, color: 'text-emerald-400' },
    { label: 'Imposto devido', value: formatCurrency(activeDeclaration?.tax_due_cents || 0), icon: DollarSign, color: 'text-amber-400' },
    { label: 'Restituição', value: formatCurrency(activeDeclaration?.refund_cents || 0), icon: TrendingUp, color: 'text-emerald-400' },
  ];

  const getProgress = (status: string) => {
    const map: Record<string, number> = {
      pending_documents: 25, processing: 50, ai_analysis: 75, review: 90, completed: 100,
    };
    return map[status] || 10;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>AtentAI - Contador IA | Imposto de Renda</title>
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2">
              <img src="/logo-atentai.png" alt="AtentAI" className="h-7 w-auto" />
            </a>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              <Brain className="w-3 h-3 mr-1" /> Contador IA
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={createDeclaration} className="bg-emerald-500 hover:bg-emerald-600 rounded-full h-9 px-4 text-sm">
              <Sparkles className="w-4 h-4 mr-1" /> Nova Declaração
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { signOut(); navigate('/'); }} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-7 h-7 text-purple-400" />
            Contador IA — Imposto de Renda
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Envie seus documentos e a IA faz sua declaração em minutos
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        )}

        {/* No declarations */}
        {declarations.length === 0 && !isLoading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card border-border text-center py-16">
              <CardContent>
                <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Seu Contador IA está pronto</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Envie seus documentos e a inteligência artificial mais avançada do Brasil 
                  vai fazer sua declaração de IR automaticamente.
                </p>
                <Button onClick={createDeclaration} className="bg-purple-500 hover:bg-purple-600 rounded-full px-8 h-11">
                  <Sparkles className="w-4 h-4 mr-2" /> Iniciar minha declaração
                </Button>
                <div className="flex items-center justify-center gap-6 mt-8 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Dados protegidos</span>
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Análise em minutos</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3" /> 97% de precisão</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Active declaration */}
        {activeDeclaration && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/50 border border-border rounded-full p-1 mb-8">
              <TabsTrigger value="overview" className="rounded-full data-[state=active]:bg-purple-500 data-[state=active]:text-white text-muted-foreground text-sm px-5">
                Visão geral
              </TabsTrigger>
              <TabsTrigger value="documents" className="rounded-full data-[state=active]:bg-purple-500 data-[state=active]:text-white text-muted-foreground text-sm px-5">
                Documentos ({documents.length})
              </TabsTrigger>
              <TabsTrigger value="analysis" className="rounded-full data-[state=active]:bg-purple-500 data-[state=active]:text-white text-muted-foreground text-sm px-5">
                Análise IA
              </TabsTrigger>
              <TabsTrigger value="result" className="rounded-full data-[state=active]:bg-purple-500 data-[state=active]:text-white text-muted-foreground text-sm px-5">
                Resultado
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW */}
            <TabsContent value="overview">
              <div className="mb-6">
                <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Declaração {activeDeclaration.fiscal_year}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {(() => { const s = statusMap[activeDeclaration.status] || statusMap.error; return (
                            <Badge className={`${s.color} border-0`}><s.icon className="w-3 h-3 mr-1" />{s.label}</Badge>
                          ); })()}
                          {activeDeclaration.ai_confidence_percent != null && activeDeclaration.ai_confidence_percent > 0 && (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-0">
                              {activeDeclaration.ai_confidence_percent}% confiança
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Brain className="w-12 h-12 text-purple-400/30" />
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Progresso</span>
                        <span>{getProgress(activeDeclaration.status)}%</span>
                      </div>
                      <Progress value={getProgress(activeDeclaration.status)} className="h-2 bg-muted" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {metrics.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="bg-card border-border">
                      <CardContent className="p-4">
                        <m.icon className={`w-4 h-4 ${m.color} mb-2`} />
                        <p className="text-lg font-bold">{m.value}</p>
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Steps */}
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { step: 1, title: 'Enviar documentos', desc: 'Informes, recibos e comprovantes', icon: Upload, done: documents.length > 0, action: () => setActiveTab('documents') },
                  { step: 2, title: 'IA analisa', desc: 'Extração automática de dados', icon: Brain, done: extractedDocs.length > 0, action: () => setActiveTab('analysis') },
                  { step: 3, title: 'Revisar resultado', desc: 'Confira e aprove', icon: CheckCircle2, done: activeDeclaration.status === 'review' || activeDeclaration.status === 'completed', action: () => setActiveTab('result') },
                ].map((s) => (
                  <Card
                    key={s.step}
                    className={`cursor-pointer transition-all ${s.done ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-card border-border'} hover:border-purple-500/30`}
                    onClick={s.action}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${s.done ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                          {s.done ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                        </div>
                        <s.icon className={`w-5 h-5 ${s.done ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                      </div>
                      <p className="font-medium text-sm">{s.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* DOCUMENTS */}
            <TabsContent value="documents">
              <div className="space-y-6">
                <Card className="bg-card border-border border-dashed">
                  <CardContent className="p-8 text-center">
                    <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-2">Envie seus documentos</h3>
                    <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
                      Informes de rendimentos, comprovantes médicos, recibos de educação, notas de corretagem e mais
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                      {Object.entries(docTypeLabels).map(([key, label]) => (
                        <Button
                          key={key}
                          size="sm"
                          variant={selectedDocType === key ? 'default' : 'outline'}
                          onClick={() => setSelectedDocType(key)}
                          className={`rounded-full text-xs ${selectedDocType === key ? 'bg-purple-500 hover:bg-purple-600' : 'border-border text-muted-foreground hover:text-foreground'}`}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>

                    <label className="cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={isUploading}
                      />
                      <Button asChild className="bg-purple-500 hover:bg-purple-600 rounded-full px-8" disabled={isUploading}>
                        <span>
                          {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileUp className="w-4 h-4 mr-2" />}
                          {isUploading ? 'Enviando...' : 'Selecionar arquivos'}
                        </span>
                      </Button>
                    </label>
                  </CardContent>
                </Card>

                {/* Document list */}
                {documents.length > 0 && (
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Documentos enviados ({documents.length})</CardTitle>
                        {pendingDocs.length > 0 && (
                          <Button
                            size="sm"
                            onClick={analyzeAllPending}
                            disabled={isAnalyzing}
                            className="bg-purple-500 hover:bg-purple-600 rounded-full text-xs"
                          >
                            {isAnalyzing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Brain className="w-3 h-3 mr-1" />}
                            Analisar todos ({pendingDocs.length})
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="w-5 h-5 text-purple-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{doc.file_name}</p>
                              <p className="text-xs text-muted-foreground">{docTypeLabels[doc.document_type] || doc.document_type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge className={
                              doc.ai_status === 'extracted' ? 'bg-emerald-500/10 text-emerald-400 border-0' :
                              doc.ai_status === 'processing' ? 'bg-blue-500/10 text-blue-400 border-0' :
                              doc.ai_status === 'error' ? 'bg-red-500/10 text-red-400 border-0' :
                              'bg-muted text-muted-foreground border-0'
                            }>
                              {doc.ai_status === 'extracted' ? '✅ Extraído' :
                               doc.ai_status === 'processing' ? '⏳ Processando' :
                               doc.ai_status === 'error' ? '❌ Erro' : '⏸️ Pendente'}
                            </Badge>
                            {doc.ai_status === 'pending' && (
                              <Button size="sm" variant="ghost" onClick={() => analyzeDocument(doc)} disabled={analyzingDocId === doc.id || isAnalyzing} className="text-purple-400 hover:text-purple-300">
                                {analyzingDocId === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => deleteDocument(doc)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* ANALYSIS */}
            <TabsContent value="analysis">
              <div className="space-y-6">
                {extractedDocs.length === 0 ? (
                  <Card className="bg-card border-border text-center py-12">
                    <CardContent>
                      <Brain className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">Nenhum documento analisado ainda</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Envie e analise documentos na aba anterior</p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
                      <CardContent className="p-6 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold">{extractedDocs.length} documentos analisados</h3>
                          <p className="text-sm text-muted-foreground">Gere o resumo completo da declaração</p>
                        </div>
                        <Button onClick={generateSummary} disabled={isAnalyzing} className="bg-purple-500 hover:bg-purple-600 rounded-full">
                          {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                          Gerar declaração
                        </Button>
                      </CardContent>
                    </Card>

                    {extractedDocs.map((doc) => (
                      <Card key={doc.id} className="bg-card border-border">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <FileText className="w-4 h-4 text-purple-400" />
                            {doc.file_name}
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px]">
                              {docTypeLabels[doc.document_type] || doc.document_type}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {doc.ai_extracted_data && (
                            <div className="space-y-2 text-sm">
                              {doc.ai_extracted_data.source_name && (
                                <p className="text-muted-foreground">
                                  <span className="text-muted-foreground/60">Fonte:</span> {doc.ai_extracted_data.source_name}
                                </p>
                              )}
                              {doc.ai_extracted_data.source_document && (
                                <p className="text-muted-foreground">
                                  <span className="text-muted-foreground/60">CNPJ/CPF:</span> {doc.ai_extracted_data.source_document}
                                </p>
                              )}
                              {doc.ai_extracted_data.items?.map((item: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30">
                                  <span className="text-muted-foreground">{item.description}</span>
                                  <span className="font-medium">{formatCurrency(item.value_cents || 0)}</span>
                                </div>
                              ))}
                              {doc.ai_extracted_data.observations && (
                                <p className="text-xs text-muted-foreground/70 mt-2 italic">
                                  📝 {doc.ai_extracted_data.observations}
                                </p>
                              )}
                              {doc.ai_extracted_data.confidence_percent != null && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Progress value={doc.ai_extracted_data.confidence_percent} className="h-1.5 flex-1 bg-muted" />
                                  <span className="text-xs text-muted-foreground">
                                    {doc.ai_extracted_data.confidence_percent}% confiança
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
              </div>
            </TabsContent>

            {/* RESULT */}
            <TabsContent value="result">
              {!analysis ? (
                <Card className="bg-card border-border text-center py-12">
                  <CardContent>
                    <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">Resultado ainda não gerado</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Analise os documentos e gere a declaração primeiro</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Summary */}
                  <Card className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">Resultado da Declaração</h3>
                          <p className="text-sm text-muted-foreground">Ano-base {activeDeclaration.fiscal_year}</p>
                        </div>
                        {activeDeclaration.ai_confidence_percent != null && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                            {activeDeclaration.ai_confidence_percent}% confiança
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-muted/30">
                          <p className="text-xs text-muted-foreground">Rendimentos</p>
                          <p className="text-lg font-bold text-blue-400">{formatCurrency(activeDeclaration.total_income_cents)}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/30">
                          <p className="text-xs text-muted-foreground">Deduções</p>
                          <p className="text-lg font-bold text-emerald-400">{formatCurrency(activeDeclaration.total_deductions_cents)}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/30">
                          <p className="text-xs text-muted-foreground">Imposto</p>
                          <p className="text-lg font-bold text-amber-400">{formatCurrency(activeDeclaration.tax_due_cents)}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/30">
                          <p className="text-xs text-muted-foreground">Restituição</p>
                          <p className="text-lg font-bold text-emerald-400">{formatCurrency(activeDeclaration.refund_cents)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendation */}
                  {analysis.recommended_model && (
                    <Card className="bg-card border-border">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
                          <div>
                            <p className="font-medium">Modelo recomendado: <span className="text-purple-400 capitalize">{analysis.recommended_model}</span></p>
                            {analysis.recommendation_reason && (
                              <p className="text-sm text-muted-foreground mt-1">{analysis.recommendation_reason}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Deductions detail */}
                  {analysis.deduction_items?.length > 0 && (
                    <Card className="bg-card border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2 text-emerald-400">
                          <TrendingDown className="w-4 h-4" /> Deduções Identificadas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {analysis.deduction_items.map((ded: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30">
                            <div>
                              <span className="text-sm">{ded.description}</span>
                              {ded.category && <span className="text-xs text-muted-foreground ml-2">({ded.category})</span>}
                            </div>
                            <span className="text-sm font-medium text-emerald-400">{formatCurrency(ded.value_cents || 0)}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Alerts */}
                  {analysis.alerts?.length > 0 && (
                    <Card className="bg-card border-amber-500/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2 text-amber-400">
                          <AlertCircle className="w-4 h-4" /> Alertas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {analysis.alerts.map((alert: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <AlertCircle className="w-3 h-3 text-amber-400 mt-1 shrink-0" />
                            <p className="text-muted-foreground">{alert}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Optimization tips */}
                  {analysis.optimization_tips?.length > 0 && (
                    <Card className="bg-card border-emerald-500/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2 text-emerald-400">
                          <TrendingUp className="w-4 h-4" /> Dicas de Otimização
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {analysis.optimization_tips.map((tip: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-1 shrink-0" />
                            <p className="text-muted-foreground">{tip}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Income sources */}
                  {analysis.income_sources?.length > 0 && (
                    <Card className="bg-card border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Fontes de Rendimento</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {analysis.income_sources.map((src: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30">
                            <span className="text-sm text-muted-foreground">{src.source}</span>
                            <span className="text-sm font-medium">{formatCurrency(src.value_cents || 0)}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Disclaimer */}
                  <Card className="bg-muted/20 border-border">
                    <CardContent className="p-4 flex items-start gap-3">
                      <Lock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Esta análise é gerada por inteligência artificial e tem caráter informativo. 
                        A responsabilidade pela declaração é do contribuinte. Recomendamos a revisão 
                        por um contador credenciado para casos complexos.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default ContadorIADashboard;
