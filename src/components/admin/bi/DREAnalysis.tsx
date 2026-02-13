import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, Brain, Loader2, TrendingUp,
  AlertTriangle, CheckCircle, BarChart3, RefreshCw, Eye, Trash2,
  ArrowUpRight, ArrowDownRight, ClipboardPaste, Send, FileSpreadsheet, Download, GitCompareArrows
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
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
  const [analysisStep, setAnalysisStep] = useState(0);
  const analysisTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<DREAnalysisRecord | null>(null);
  const [compareAnalysis, setCompareAnalysis] = useState<DREAnalysisRecord | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [clientName, setClientName] = useState('');
  const [periodLabel, setPeriodLabel] = useState('');
  const [manualText, setManualText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [pendingAnalysisId, setPendingAnalysisId] = useState<string | null>(null);

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

    if (file.size > 25 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'Máximo 25MB', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('dre-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

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

      // Try to extract text from file
      const text = await extractTextFromFile(file);
      
      if (text && text.length > 100 && record) {
        // Auto-analyze if text extraction worked
        toast({ title: 'Documento enviado!', description: 'Iniciando análise com IA...' });
        await loadAnalyses();
        await triggerAnalysis((record as DREAnalysisRecord).id, text, clientName, periodLabel);
      } else if (record) {
        // Text extraction failed (likely PDF) - ask user to paste text
        toast({ 
          title: 'Documento enviado!', 
          description: 'Cole o texto do DRE abaixo para a IA analisar (PDFs precisam de texto manual).', 
        });
        setPendingAnalysisId((record as DREAnalysisRecord).id);
        setShowManualInput(true);
        await loadAnalyses();
      }

      setClientName('');
      setPeriodLabel('');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const extractTextFromFile = async (file: File): Promise<string | null> => {
    // Text/CSV files
    if (file.type === 'text/plain' || file.type === 'text/csv' || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
      return await file.text();
    }
    
    // Excel files - use xlsx library
    if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx') || 
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel') {
      try {
        console.time('Excel parsing');
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array', dense: true });
        const allText: string[] = [];
        
        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          if (sheet) {
            allText.push(`=== ${sheetName} ===`);
            const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
            allText.push(csv);
          }
        }
        
        const text = allText.join('\n\n');
        console.timeEnd('Excel parsing');
        console.log('Excel text extracted:', text.length, 'chars');
        if (text.length > 100) {
          return text;
        }
      } catch (err) {
        console.error('Excel parse error:', err);
      }
      return null;
    }
    
    // Other files - try reading as text
    try {
      const text = await file.text();
      const nonPrintable = (text.match(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g) || []).length;
      if (nonPrintable < text.length * 0.1 && text.length > 100) {
        return text;
      }
    } catch {}
    return null;
  };

  const handleManualAnalysis = async () => {
    if (!manualText.trim() || !pendingAnalysisId) {
      toast({ title: 'Cole o texto do DRE', description: 'O campo de texto não pode estar vazio.', variant: 'destructive' });
      return;
    }
    
    await triggerAnalysis(pendingAnalysisId, manualText.trim(), clientName, periodLabel);
    setManualText('');
    setShowManualInput(false);
    setPendingAnalysisId(null);
  };

  const handleAnalyzeFromText = async () => {
    if (!manualText.trim() || !user) {
      toast({ title: 'Cole o texto do DRE', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const { data: record, error: insertError } = await supabase
        .from('dre_analyses')
        .insert({
          uploaded_by: user.id,
          file_name: `DRE-texto-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.txt`,
          file_path: 'manual-text-input',
          client_name: clientName || null,
          period_label: periodLabel || null,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await loadAnalyses();
      await triggerAnalysis((record as DREAnalysisRecord).id, manualText.trim(), clientName, periodLabel);
      setManualText('');
      setShowManualInput(false);
      setClientName('');
      setPeriodLabel('');
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const analysisSteps = [
    '📄 Lendo documento...',
    '🔍 Extraindo dados financeiros...',
    '🧮 Calculando KPIs...',
    '🤖 IA analisando margens e tendências...',
    '📊 Gerando recomendações estratégicas...',
    '✍️ Finalizando relatório...',
  ];

  const triggerAnalysis = async (analysisId: string, documentText: string, name?: string, period?: string) => {
    setIsAnalyzing(analysisId);
    setAnalysisStep(0);
    
    // Animate through steps
    let step = 0;
    analysisTimerRef.current = setInterval(() => {
      step = Math.min(step + 1, analysisSteps.length - 1);
      setAnalysisStep(step);
    }, 4000);

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
      if (analysisTimerRef.current) clearInterval(analysisTimerRef.current);
      setIsAnalyzing(null);
      setAnalysisStep(0);
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

  const retryAnalysisWithText = (analysisId: string) => {
    setPendingAnalysisId(analysisId);
    setShowManualInput(true);
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
            Envie um DRE ou cole o texto diretamente. A IA irá extrair KPIs, gerar resumo executivo e recomendações estratégicas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
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
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <label className="cursor-pointer flex-1">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.csv,.txt,.xls,.xlsx,.doc,.docx"
                onChange={handleFileUpload}
                disabled={isUploading || isAnalyzing !== null}
              />
              <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isUploading}>
                <span>
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isUploading ? 'Enviando...' : 'Enviar Arquivo DRE'}
                </span>
              </Button>
            </label>
            <Button 
              variant="outline" 
              className="flex-1 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              onClick={() => setShowManualInput(!showManualInput)}
            >
              <ClipboardPaste className="h-4 w-4 mr-2" />
              {showManualInput ? 'Ocultar Campo de Texto' : 'Colar Texto do DRE'}
            </Button>
          </div>

          {/* Manual text input area */}
          {showManualInput && (
            <div className="space-y-3 p-4 bg-white rounded-lg border border-indigo-200">
              <p className="text-sm font-medium text-indigo-700">
                📋 Cole o conteúdo do DRE abaixo (copie do PDF ou planilha):
              </p>
              <Textarea
                placeholder={`Cole aqui o texto do DRE...

Exemplo:
Receita Bruta: R$ 1.500.000,00
(-) Deduções: R$ 150.000,00
Receita Líquida: R$ 1.350.000,00
(-) CMV: R$ 810.000,00
Lucro Bruto: R$ 540.000,00
...`}
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                className="min-h-[150px] font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button
                  onClick={pendingAnalysisId ? handleManualAnalysis : handleAnalyzeFromText}
                  disabled={!manualText.trim() || isAnalyzing !== null}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {isAnalyzing ? 'Analisando...' : 'Analisar com IA'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowManualInput(false);
                    setManualText('');
                    setPendingAnalysisId(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            📎 Formatos aceitos: PDF, CSV, TXT, XLS, XLSX • Máximo 10MB • Para PDFs, copie e cole o texto • A análise usa IA com supervisão humana
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
                <div className="flex items-center gap-1">
                  <Button 
                    variant={compareMode ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => { setCompareMode(!compareMode); setCompareAnalysis(null); }}
                    className={`h-8 text-xs ${compareMode ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                  >
                    <GitCompareArrows className="h-3.5 w-3.5 mr-1" />
                    Comparar
                  </Button>
                  <Button variant="ghost" size="icon" onClick={loadAnalyses} className="h-8 w-8">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {compareMode && (
                <p className="text-xs text-indigo-600 mt-1">
                  {!selectedAnalysis ? 'Selecione a 1ª análise' : !compareAnalysis ? 'Agora selecione a 2ª análise' : 'Comparando duas análises'}
                </p>
              )}
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
                    <p className="text-xs text-muted-foreground mt-1">Envie um DRE ou cole o texto acima para começar</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {analyses.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          if (compareMode) {
                            if (!selectedAnalysis) {
                              setSelectedAnalysis(a);
                            } else if (selectedAnalysis.id !== a.id) {
                              setCompareAnalysis(a);
                            }
                          } else {
                            setSelectedAnalysis(a);
                            setCompareAnalysis(null);
                          }
                        }}
                        className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                          selectedAnalysis?.id === a.id ? 'bg-indigo-50 border-l-2 border-indigo-500' : 
                          compareAnalysis?.id === a.id ? 'bg-purple-50 border-l-2 border-purple-500' : ''
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
                              <div className="flex flex-col gap-1">
                                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px]">
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Analisando
                                </Badge>
                                {isAnalyzing === a.id && (
                                  <p className="text-[9px] text-indigo-500 animate-pulse max-w-[140px] truncate">
                                    {analysisSteps[analysisStep]}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <Badge 
                                className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); retryAnalysisWithText(a.id); }}
                              >
                                <ClipboardPaste className="h-3 w-3 mr-1" />
                                Colar Texto
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
          {compareMode && selectedAnalysis && compareAnalysis ? (
            <ComparisonView
              analysis1={selectedAnalysis}
              analysis2={compareAnalysis}
              formatCurrency={formatCurrency}
              formatPercent={formatPercent}
            />
          ) : selectedAnalysis ? (
            <AnalysisDetail
              analysis={selectedAnalysis}
              formatCurrency={formatCurrency}
              formatPercent={formatPercent}
            />
          ) : (
            <Card className="h-[520px] flex items-center justify-center">
              <div className="text-center">
                <Eye className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  {compareMode ? 'Selecione duas análises para comparar' : 'Selecione uma análise para visualizar'}
                </p>
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
          <p className="text-xs text-muted-foreground mt-1">Se estiver pendente, cole o texto do DRE clicando no badge "Colar Texto"</p>
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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => exportPDF(analysis, kpiItems, formatCurrency, formatPercent)}
                >
                  <Download className="h-3 w-3 mr-1" />
                  PDF
                </Button>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Concluído
                </Badge>
              </div>
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

// PDF Export helper
const exportPDF = (
  analysis: DREAnalysisRecord,
  kpiItems: { label: string; value: number; type: string }[],
  formatCurrency: (v: number) => string,
  formatPercent: (v: number) => string
) => {
  const doc = new jsPDF();
  let y = 20;
  
  doc.setFontSize(18);
  doc.text('Relatório DRE — BI+ Contabilidade™', 14, y);
  y += 10;
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Arquivo: ${analysis.file_name}`, 14, y);
  y += 5;
  if (analysis.client_name) { doc.text(`Cliente: ${analysis.client_name}`, 14, y); y += 5; }
  if (analysis.period_label) { doc.text(`Período: ${analysis.period_label}`, 14, y); y += 5; }
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, y);
  y += 12;
  
  // KPIs
  if (kpiItems.length > 0) {
    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.text('KPIs Extraídos', 14, y);
    y += 8;
    doc.setFontSize(10);
    kpiItems.forEach((kpi) => {
      const val = kpi.type === 'currency' ? formatCurrency(kpi.value) : formatPercent(kpi.value);
      doc.text(`${kpi.label}: ${val}`, 18, y);
      y += 6;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    y += 6;
  }
  
  // Summary
  if (analysis.ai_summary) {
    doc.setFontSize(13);
    doc.text('Resumo Executivo', 14, y);
    y += 8;
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(analysis.ai_summary, 180);
    lines.forEach((line: string) => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text(line, 14, y);
      y += 5;
    });
    y += 6;
  }
  
  // Recommendations
  if (analysis.ai_recommendations) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(13);
    doc.text('Recomendações Estratégicas', 14, y);
    y += 8;
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(analysis.ai_recommendations, 180);
    lines.forEach((line: string) => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text(line, 14, y);
      y += 5;
    });
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('AtentAI — BI+ Contabilidade™ | IA acelera. Humano decide.', 14, 290);
    doc.text(`Página ${i}/${pageCount}`, 180, 290);
  }
  
  doc.save(`DRE-${analysis.client_name || 'analise'}-${new Date().toISOString().slice(0,10)}.pdf`);
};

// Comparison View component
const ComparisonView: React.FC<{
  analysis1: DREAnalysisRecord;
  analysis2: DREAnalysisRecord;
  formatCurrency: (v: number) => string;
  formatPercent: (v: number) => string;
}> = ({ analysis1, analysis2, formatCurrency, formatPercent }) => {
  const kpis1 = analysis1.ai_kpis || {};
  const kpis2 = analysis2.ai_kpis || {};

  const kpiKeys = [
    { key: 'receita_bruta_cents', label: 'Receita Bruta', type: 'currency' },
    { key: 'receita_liquida_cents', label: 'Receita Líquida', type: 'currency' },
    { key: 'lucro_bruto_cents', label: 'Lucro Bruto', type: 'currency' },
    { key: 'ebitda_cents', label: 'EBITDA', type: 'currency' },
    { key: 'lucro_liquido_cents', label: 'Lucro Líquido', type: 'currency' },
    { key: 'margem_bruta_percent', label: 'Margem Bruta', type: 'percent' },
    { key: 'margem_liquida_percent', label: 'Margem Líquida', type: 'percent' },
    { key: 'margem_ebitda_percent', label: 'Margem EBITDA', type: 'percent' },
  ].filter(k => kpis1[k.key] != null || kpis2[k.key] != null);

  const calcVariation = (v1: number | null, v2: number | null) => {
    if (v1 == null || v2 == null || v1 === 0) return null;
    return ((v2 - v1) / Math.abs(v1)) * 100;
  };

  const fmt = (val: number | null, type: string) => {
    if (val == null) return '—';
    return type === 'currency' ? formatCurrency(val) : formatPercent(val);
  };

  if (analysis1.status !== 'analyzed' || analysis2.status !== 'analyzed') {
    return (
      <Card className="h-[520px] flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Ambas as análises precisam estar concluídas para comparar.</p>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[520px]">
      <div className="space-y-4 pr-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <GitCompareArrows className="h-5 w-5 text-purple-600" />
              Comparativo de Períodos
            </CardTitle>
            <CardDescription>
              {analysis1.client_name || analysis1.file_name} vs {analysis2.client_name || analysis2.file_name}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 text-muted-foreground font-medium">KPI</th>
                <th className="text-right p-2 font-medium text-indigo-700">
                  {analysis1.period_label || 'Período 1'}
                </th>
                <th className="text-right p-2 font-medium text-purple-700">
                  {analysis2.period_label || 'Período 2'}
                </th>
                <th className="text-right p-2 font-medium text-muted-foreground">Variação</th>
              </tr>
            </thead>
            <tbody>
              {kpiKeys.map(({ key, label, type }) => {
                const v1 = kpis1[key] ?? null;
                const v2 = kpis2[key] ?? null;
                const variation = calcVariation(v1, v2);
                return (
                  <tr key={key} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-2 text-muted-foreground">{label}</td>
                    <td className="p-2 text-right font-mono font-medium">{fmt(v1, type)}</td>
                    <td className="p-2 text-right font-mono font-medium">{fmt(v2, type)}</td>
                    <td className="p-2 text-right">
                      {variation != null ? (
                        <span className={`inline-flex items-center gap-1 font-medium ${variation >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {variation >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {Math.abs(variation).toFixed(1)}%
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Side-by-side summaries */}
        {(analysis1.ai_summary || analysis2.ai_summary) && (
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Resumo — {analysis1.period_label || 'Período 1'}</p>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-6">{analysis1.ai_summary || '—'}</p>
            </Card>
            <Card className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Resumo — {analysis2.period_label || 'Período 2'}</p>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-6">{analysis2.ai_summary || '—'}</p>
            </Card>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default DREAnalysis;
