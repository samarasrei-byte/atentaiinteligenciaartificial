import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  Clock, 
  Bot,
  User,
  Download,
  Eye,
  Sparkles,
  AlertCircle,
  FileSpreadsheet,
  FileBarChart2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Report {
  id: string;
  title: string;
  type: 'financial' | 'operational' | 'tax' | 'custom';
  status: 'draft' | 'pending_approval' | 'approved' | 'sent';
  generated_at: Date;
  approved_by?: string;
  approved_at?: Date;
  recipient?: string;
  content: string;
}

const reportTypeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  financial: { label: 'Financeiro', icon: FileBarChart2, color: 'text-emerald-600 bg-emerald-100' },
  operational: { label: 'Operacional', icon: FileSpreadsheet, color: 'text-blue-600 bg-blue-100' },
  tax: { label: 'Fiscal', icon: FileText, color: 'text-violet-600 bg-violet-100' },
  custom: { label: 'Personalizado', icon: Sparkles, color: 'text-amber-600 bg-amber-100' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  pending_approval: { label: 'Aguardando Aprovação', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  approved: { label: 'Aprovado', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  sent: { label: 'Enviado', color: 'bg-blue-100 text-blue-700 border-blue-200' },
};

export const BIReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      title: 'Relatório Mensal de Receitas - Janeiro 2026',
      type: 'financial',
      status: 'pending_approval',
      generated_at: new Date(),
      content: 'Resumo financeiro do mês com análise de tendências e projeções...',
    },
    {
      id: '2',
      title: 'Análise de Performance de Serviços',
      type: 'operational',
      status: 'approved',
      generated_at: new Date(Date.now() - 86400000),
      approved_by: 'Guilherme',
      approved_at: new Date(Date.now() - 3600000),
      content: 'Métricas de desempenho por serviço com recomendações...',
    },
    {
      id: '3',
      title: 'Relatório Fiscal Trimestral',
      type: 'tax',
      status: 'sent',
      generated_at: new Date(Date.now() - 172800000),
      approved_by: 'Guilherme',
      approved_at: new Date(Date.now() - 86400000),
      recipient: 'contabilidade@empresa.com',
      content: 'Consolidação fiscal do trimestre...',
    },
  ]);
  const [showNewReport, setShowNewReport] = useState(false);
  const [newReportType, setNewReportType] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    if (!newReportType) return;
    
    setIsGenerating(true);
    
    // Simulate AI report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newReport: Report = {
      id: Date.now().toString(),
      title: `Relatório ${reportTypeConfig[newReportType]?.label} - ${format(new Date(), "MMMM yyyy", { locale: ptBR })}`,
      type: newReportType as Report['type'],
      status: 'draft',
      generated_at: new Date(),
      content: 'Relatório gerado automaticamente pela IA com base nos dados mais recentes...',
    };
    
    setReports(prev => [newReport, ...prev]);
    setShowNewReport(false);
    setNewReportType('');
    setIsGenerating(false);
  };

  const handleApprove = (id: string) => {
    setReports(prev => prev.map(r => 
      r.id === id 
        ? { ...r, status: 'approved' as const, approved_by: 'Guilherme', approved_at: new Date() } 
        : r
    ));
  };

  const handleSend = (id: string) => {
    setReports(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'sent' as const, recipient: 'destinatario@empresa.com' } : r
    ));
  };

  const pendingCount = reports.filter(r => r.status === 'pending_approval').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-violet-600" />
            Relatórios Automatizados
          </h2>
          <p className="text-sm text-slate-500">IA gera relatórios • Aprovação humana antes do envio</p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              {pendingCount} aguardando aprovação
            </Badge>
          )}
          <Button onClick={() => setShowNewReport(true)}>
            <Sparkles className="h-4 w-4 mr-2" />
            Gerar Relatório
          </Button>
        </div>
      </div>

      {/* New Report Form */}
      {showNewReport && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5 text-indigo-600" />
              Gerar Novo Relatório com IA
            </CardTitle>
            <CardDescription>A IA irá compilar os dados e gerar o relatório. Você revisará antes de aprovar.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={newReportType} onValueChange={setNewReportType}>
                <SelectTrigger className="w-[250px] bg-white">
                  <SelectValue placeholder="Tipo de relatório" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Financeiro (DRE, Caixa)</SelectItem>
                  <SelectItem value="operational">Operacional (KPIs, Performance)</SelectItem>
                  <SelectItem value="tax">Fiscal (Impostos, Obrigações)</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleGenerateReport} disabled={!newReportType || isGenerating}>
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar com IA
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowNewReport(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports List */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Relatórios Gerados</CardTitle>
          <CardDescription>Histórico de relatórios com status de aprovação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => {
              const typeInfo = reportTypeConfig[report.type];
              const statusInfo = statusConfig[report.status];
              const TypeIcon = typeInfo.icon;

              return (
                <div
                  key={report.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-lg ${typeInfo.color}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{report.title}</h3>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-1">{report.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Bot className="h-3 w-3" />
                            Gerado: {format(report.generated_at, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </span>
                          {report.approved_by && (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <User className="h-3 w-3" />
                              Aprovado por {report.approved_by}
                            </span>
                          )}
                          {report.recipient && (
                            <span className="flex items-center gap-1 text-blue-600">
                              <Send className="h-3 w-3" />
                              Enviado para {report.recipient}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Badge className={`${statusInfo.color} border`}>
                        {statusInfo.label}
                      </Badge>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        {report.status === 'draft' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setReports(prev => prev.map(r => 
                              r.id === report.id ? { ...r, status: 'pending_approval' as const } : r
                            ))}
                          >
                            Submeter
                          </Button>
                        )}
                        
                        {report.status === 'pending_approval' && (
                          <Button 
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleApprove(report.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                        )}
                        
                        {report.status === 'approved' && (
                          <Button 
                            size="sm"
                            onClick={() => handleSend(report.id)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Enviar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Importante: Validação Humana</p>
            <p className="text-sm text-amber-700 mt-1">
              Todos os relatórios gerados pela IA passam por revisão humana antes de serem enviados. 
              Nenhum relatório é enviado automaticamente sem a aprovação de César.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
