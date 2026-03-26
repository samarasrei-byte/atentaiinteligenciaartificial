import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/plans';
import { 
  FileText, 
  FileSpreadsheet, 
  Loader2, 
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Brain
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface IRDeclaration {
  id: string;
  user_id: string;
  fiscal_year: number;
  declaration_type: string;
  status: string;
  full_name: string | null;
  cpf: string | null;
  total_income_cents: number | null;
  total_deductions_cents: number | null;
  tax_due_cents: number | null;
  refund_cents: number | null;
  ai_confidence_percent: number | null;
  ai_analysis: any;
  created_at: string;
  completed_at: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Rascunho', color: 'bg-muted text-muted-foreground', icon: Clock },
  pending_documents: { label: 'Aguardando Docs', color: 'bg-amber-500/20 text-amber-600', icon: Clock },
  processing: { label: 'Processando', color: 'bg-blue-500/20 text-blue-600', icon: RefreshCw },
  ai_analysis: { label: 'IA Analisando', color: 'bg-purple-500/20 text-purple-600', icon: Brain },
  review: { label: 'Em Revisão', color: 'bg-primary/20 text-primary', icon: Eye },
  completed: { label: 'Concluído', color: 'bg-emerald-500/20 text-emerald-600', icon: CheckCircle },
  error: { label: 'Erro', color: 'bg-destructive/20 text-destructive', icon: AlertCircle },
};

const formatCurrency = (cents: number) =>
  `R$ ${(cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

export function IRManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [declarations, setDeclarations] = useState<IRDeclaration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDecl, setSelectedDecl] = useState<IRDeclaration | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (user) {
      fetchDeclarations();
    }
  }, [user]);

  const fetchDeclarations = async () => {
    try {
      // Query the ACTUAL table used by the IR flow
      const { data, error } = await supabase
        .from('ir_ai_declarations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeclarations((data as IRDeclaration[]) || []);
    } catch (error) {
      console.error('Error fetching IR declarations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedDecl || !newStatus) return;

    setIsUpdating(true);
    try {
      const updateData: Record<string, any> = { status: newStatus };
      
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('ir_ai_declarations')
        .update(updateData)
        .eq('id', selectedDecl.id);

      if (error) throw error;

      toast({
        title: 'Status atualizado',
        description: 'O status da declaração foi atualizado com sucesso.',
      });

      fetchDeclarations();
      setShowDetailsDialog(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: error.message,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const openDetails = (decl: IRDeclaration) => {
    setSelectedDecl(decl);
    setNewStatus(decl.status);
    setShowDetailsDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Declarações de IR (Contador IA)</h2>
          <p className="text-muted-foreground">Gerencie as declarações processadas por IA</p>
        </div>
        <Button variant="outline" onClick={fetchDeclarations}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {declarations.filter(r => r.status === 'pending_documents').length}
                </div>
                <p className="text-sm text-muted-foreground">Aguardando Docs</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {declarations.filter(r => r.status === 'ai_analysis' || r.status === 'processing').length}
                </div>
                <p className="text-sm text-muted-foreground">IA Processando</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {declarations.filter(r => r.status === 'review').length}
                </div>
                <p className="text-sm text-muted-foreground">Em Revisão</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-emerald-600">
                  {declarations.filter(r => r.status === 'completed').length}
                </div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {declarations.filter(r => r.status === 'error').length}
                </div>
                <p className="text-sm text-muted-foreground">Com Erro</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Year breakdown */}
      {declarations.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Resumo por Ano Fiscal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {Array.from(new Set(declarations.map(r => r.fiscal_year))).sort((a, b) => b - a).map(year => {
                const yearDecls = declarations.filter(r => r.fiscal_year === year);
                const completed = yearDecls.filter(r => r.status === 'completed').length;
                return (
                  <div key={year} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{year}</div>
                    <div className="text-sm">
                      <p><strong>{yearDecls.length}</strong> declarações</p>
                      <p className="text-muted-foreground">{completed} concluídas</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Declarações</CardTitle>
        </CardHeader>
        <CardContent>
          {declarations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma declaração de IR encontrada.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contribuinte</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Rendimentos</TableHead>
                  <TableHead>Confiança IA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {declarations.map((decl) => {
                  const status = statusConfig[decl.status] || statusConfig.error;
                  const StatusIcon = status.icon;
                  
                  return (
                    <TableRow key={decl.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{decl.full_name || 'Não informado'}</p>
                          <p className="text-sm text-muted-foreground">{decl.cpf || '-'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {decl.declaration_type === 'simples' ? (
                            <FileText className="h-4 w-4 text-primary" />
                          ) : (
                            <FileSpreadsheet className="h-4 w-4 text-primary" />
                          )}
                          <span className="capitalize">{decl.declaration_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{decl.fiscal_year}</TableCell>
                      <TableCell>
                        {decl.total_income_cents ? formatCurrency(decl.total_income_cents) : '-'}
                      </TableCell>
                      <TableCell>
                        {decl.ai_confidence_percent != null ? (
                          <Badge className={
                            decl.ai_confidence_percent >= 80 ? 'bg-emerald-500/20 text-emerald-600' :
                            decl.ai_confidence_percent >= 60 ? 'bg-amber-500/20 text-amber-600' :
                            'bg-red-500/20 text-red-600'
                          }>
                            {decl.ai_confidence_percent}%
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(decl.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDetails(decl)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Declaração</DialogTitle>
            <DialogDescription>
              IR {selectedDecl?.declaration_type?.toUpperCase()} - Ano {selectedDecl?.fiscal_year}
            </DialogDescription>
          </DialogHeader>

          {selectedDecl && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Nome</label>
                  <p className="font-medium">{selectedDecl.full_name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">CPF</label>
                  <p className="font-medium">{selectedDecl.cpf || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Confiança IA</label>
                  <p className="font-medium">
                    {selectedDecl.ai_confidence_percent != null ? `${selectedDecl.ai_confidence_percent}%` : 'Não analisado'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Status Atual</label>
                  <p className="font-medium capitalize">{statusConfig[selectedDecl.status]?.label || selectedDecl.status}</p>
                </div>
              </div>

              {/* Financial Summary */}
              {(selectedDecl.total_income_cents || selectedDecl.total_deductions_cents) && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-3">Resumo Financeiro</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Rendimentos:</span>
                      <p className="font-medium">{formatCurrency(selectedDecl.total_income_cents || 0)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Deduções:</span>
                      <p className="font-medium text-emerald-600">{formatCurrency(selectedDecl.total_deductions_cents || 0)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Imposto Devido:</span>
                      <p className="font-medium text-amber-600">{formatCurrency(selectedDecl.tax_due_cents || 0)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Restituição:</span>
                      <p className="font-medium text-emerald-600">{formatCurrency(selectedDecl.refund_cents || 0)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Analysis extras */}
              {selectedDecl.ai_analysis?.recommended_model && (
                <div className="p-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    Recomendação IA
                  </h4>
                  <p className="text-sm">
                    Modelo: <strong className="capitalize">{selectedDecl.ai_analysis.recommended_model}</strong>
                  </p>
                  {selectedDecl.ai_analysis.recommendation_reason && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedDecl.ai_analysis.recommendation_reason}</p>
                  )}
                  {selectedDecl.ai_analysis.malha_fina_risk && (
                    <p className="text-sm mt-2">
                      Risco Malha Fina: <Badge className={
                        selectedDecl.ai_analysis.malha_fina_risk === 'alto' ? 'bg-red-500/20 text-red-600' :
                        selectedDecl.ai_analysis.malha_fina_risk === 'medio' ? 'bg-amber-500/20 text-amber-600' :
                        'bg-emerald-500/20 text-emerald-600'
                      }>{selectedDecl.ai_analysis.malha_fina_risk}</Badge>
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Atualizar Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending_documents">Aguardando Documentos</SelectItem>
                    <SelectItem value="processing">Processando</SelectItem>
                    <SelectItem value="ai_analysis">IA Analisando</SelectItem>
                    <SelectItem value="review">Em Revisão</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="error">Erro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Fechar
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isUpdating}>
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
