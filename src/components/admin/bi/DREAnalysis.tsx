import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, FileText, Brain, Loader2, TrendingUp, TrendingDown, 
  AlertTriangle, CheckCircle, BarChart3, RefreshCw, Eye, Trash2,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DREAnalysisRecord {
  id: string;
  file_name: string;
  client_name: string | null;
  period_label: string | null;
  status: string;
  ai_summary: string | null;
  ai_kpis: any;
  ai_recommendations: string | null;
  ai_full_analysis: string | null;
  created_at: string;
  analyzed_at: string | null;
}

export const DREAnalysis: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<DREAnalysisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<DREAnalysisRecord | null>(null);
  const [clientName, setClientName] = useState('');
  const [periodLabel, setPeriodLabel] = useState('');

  const loadAnalyses = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('dre_analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses((data || []) as DREAnalysisRecord[]);
    } catch (error) {
      console.error('Error loading DRE analyses:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadAnalyses(); }, [loadAnalyses]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'Máximo 10MB', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('dre-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create analysis record
      const { data: record, error: insertError } = await supabase
        .from('dre_analyses')
        .insert({
          uploaded_by: user.id,
          file_name: file.name,
          file_path: filePath,
          file_size_bytes: file.size,
          client_name: clientName || null,
          period_label: periodLabel || null,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({ title: 'Documento enviado!', description: 'Clique em "Analisar com IA" para processar.' });
      setClientName('');
      setPeriodLabel('');
      await loadAnalyses();

      // Extract text from file for analysis
      const text = await extractTextFromFile(file);
      if (text && record) {
        await triggerAnalysis((record as DREAnalysisRecord).id, text, clientName, periodLabel);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const extractTextFromFile = async (file: File): Promise<string | null> => {
    // For text-based files, read directly
    if (file.type === 'text/plain' || file.type === 'text/csv' || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
      return await file.text();
    }
    // For other files (PDF, Excel), we'll rely on the user pasting data or future OCR
    // For now, try to read as text
    try {
      const text = await file.text();
      if (text && text.length > 50) return text;
    } catch {}
    return null;
  };

  const triggerAnalysis = async (analysisId: string, documentText: string, name?: string, period?: string) => {
    setIsAnalyzing(analysisId);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-dre', {
        body: { analysisId, documentText, clientName: name, periodLabel: period },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: '✅ Análise concluída!', description: 'DRE processado com sucesso pela IA.' });
      await loadAnalyses();
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({ title: 'Erro na análise', description: error.message, variant: 'destructive' });
    } finally {
      setIsAnalyzing(null);
    }
  };

  const deleteAnalysis = async (id: string) => {
    try {
      const { error } = await supabase.from('dre_analyses').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Análise removida' });
      if (selectedAnalysis?.id === id) setSelectedAnalysis(null);
      await loadAnalyses();
    } catch (error: any) {
      toast({ title: 'Erro ao remover', description: error.message, variant: 'destructive' });
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  };

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <Card className="border-dashed border-2 border-indigo-200 bg-indigo-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            Análise de DRE com Inteligência Artificial
          </CardTitle>
          <CardDescription>
            Envie um DRE (PDF, CSV, TXT ou XLSX) e a IA irá extrair KPIs, gerar resumo executivo e recomendações estratégicas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            <Input
              placeholder="Nome do cliente (opcional)"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            <Input
              placeholder="Período (ex: Jan-Dez 2025)"
              value={periodLabel}
              onChange={(e) => setPeriodLabel(e.target.value)}
            />
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.csv,.txt,.xls,.xlsx,.doc,.docx"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isUploading}>
                <span>
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isUploading ? 'Enviando...' : 'Enviar DRE'}
                </span>
              </Button>
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            📎 Formatos aceitos: PDF, CSV, TXT, XLS, XLSX • Máximo 10MB • A análise usa IA com supervisão humana
          </p>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Análises Realizadas</CardTitle>
                <Button variant="ghost" size="icon" onClick={loadAnalyses} className="h-8 w-8">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[450px]">
                {isLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </div>
                ) : analyses.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <BarChart3 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Nenhuma análise ainda</p>
                    <p className="text-xs text-muted-foreground mt-1">Envie um DRE acima para começar</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {analyses.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setSelectedAnalysis(a)}
                        className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                          selectedAnalysis?.id === a.id ? 'bg-indigo-50 border-l-2 border-indigo-500' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{a.file_name}</p>
                            {a.client_name && (
                              <p className="text-xs text-muted-foreground">{a.client_name}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: ptBR })}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {a.status === 'analyzed' ? (
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Analisado
                              </Badge>
                            ) : a.status === 'analyzing' || isAnalyzing === a.id ? (
                              <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px]">
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Analisando
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
                                Pendente
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => { e.stopPropagation(); deleteAnalysis(a.id); }}
                            >
                              <Trash2 className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Detail */}
        <div className="lg:col-span-3">
          {selectedAnalysis ? (
            <AnalysisDetail
              analysis={selectedAnalysis}
              formatCurrency={formatCurrency}
              formatPercent={formatPercent}
            />
          ) : (
            <Card className="h-[520px] flex items-center justify-center">
              <div className="text-center">
                <Eye className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Selecione uma análise para visualizar</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-component for analysis detail view
const AnalysisDetail: React.FC<{
  analysis: DREAnalysisRecord;
  formatCurrency: (v: number) => string;
  formatPercent: (v: number) => string;
}> = ({ analysis, formatCurrency, formatPercent }) => {
  const kpis = analysis.ai_kpis || {};

  if (analysis.status !== 'analyzed') {
    return (
      <Card className="h-[520px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground">Análise em processamento...</p>
        </div>
      </Card>
    );
  }

  const kpiItems = [
    { label: 'Receita Bruta', value: kpis.receita_bruta_cents, type: 'currency' },
    { label: 'Receita Líquida', value: kpis.receita_liquida_cents, type: 'currency' },
    { label: 'Lucro Bruto', value: kpis.lucro_bruto_cents, type: 'currency' },
    { label: 'EBITDA', value: kpis.ebitda_cents, type: 'currency' },
    { label: 'Lucro Líquido', value: kpis.lucro_liquido_cents, type: 'currency' },
    { label: 'Margem Bruta', value: kpis.margem_bruta_percent, type: 'percent' },
    { label: 'Margem Líquida', value: kpis.margem_liquida_percent, type: 'percent' },
    { label: 'Margem EBITDA', value: kpis.margem_ebitda_percent, type: 'percent' },
  ].filter(k => k.value != null);

  let riskAlerts: string[] = [];
  try {
    const full = analysis.ai_full_analysis ? JSON.parse(analysis.ai_full_analysis) : {};
    riskAlerts = full.risk_alerts || [];
  } catch {}

  return (
    <ScrollArea className="h-[520px]">
      <div className="space-y-4 pr-4">
        {/* Header */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{analysis.file_name}</CardTitle>
                <CardDescription>
                  {analysis.client_name && `${analysis.client_name} • `}
                  {analysis.period_label && `${analysis.period_label} • `}
                  Analisado {analysis.analyzed_at && formatDistanceToNow(new Date(analysis.analyzed_at), { addSuffix: true, locale: ptBR })}
                </CardDescription>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Concluído
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* KPIs Grid */}
        {kpiItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {kpiItems.map((kpi) => (
              <Card key={kpi.label} className="p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{kpi.label}</p>
                <p className="text-sm font-bold mt-1">
                  {kpi.type === 'currency' ? formatCurrency(kpi.value) : formatPercent(kpi.value)}
                </p>
                {kpi.type === 'percent' && (
                  <div className="flex items-center gap-1 mt-0.5">
                    {kpi.value > 0 ? (
                      <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Summary */}
        {analysis.ai_summary && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-500" />
                Resumo Executivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {analysis.ai_summary}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Risk Alerts */}
        {riskAlerts.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-4 w-4" />
                Alertas de Risco
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {riskAlerts.map((alert, i) => (
                  <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">⚠️</span>
                    {alert}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {analysis.ai_recommendations && (
          <Card className="border-indigo-200 bg-indigo-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-indigo-700">
                <Brain className="h-4 w-4" />
                Recomendações Estratégicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-indigo-900/80 whitespace-pre-line leading-relaxed">
                {analysis.ai_recommendations}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};

export default DREAnalysis;
