import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Building2, 
  User, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle,
  DollarSign,
  Eye,
  Download,
  Send,
  AlertCircle,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '@/lib/taxConstants';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Pendente',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: <Clock className="h-4 w-4" />,
  },
  analyzing: {
    label: 'Em Análise',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: <Eye className="h-4 w-4" />,
  },
  documents_pending: {
    label: 'Docs Pendentes',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    icon: <FileText className="h-4 w-4" />,
  },
  in_progress: {
    label: 'Em Andamento',
    color: 'bg-primary/20 text-primary border-primary/30',
    icon: <TrendingUp className="h-4 w-4" />,
  },
  completed: {
    label: 'Concluído',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: <XCircle className="h-4 w-4" />,
  },
};

const PRICING_TEMPLATES = [
  { regime: 'mei', label: 'MEI', price: 15000, description: 'Abertura de MEI completa' },
  { regime: 'me-simples', label: 'ME Simples Nacional', price: 80000, description: 'Abertura de ME no Simples Nacional' },
  { regime: 'me-presumido', label: 'ME Lucro Presumido', price: 120000, description: 'Abertura de ME no Lucro Presumido' },
];

const CompanyOpeningManagement: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [priceInput, setPriceInput] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [contadorNotes, setContadorNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch all pending requests (not assigned)
  const { data: pendingRequests, isLoading: loadingPending } = useQuery({
    queryKey: ['company-opening-pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_opening_requests')
        .select('*')
        .is('contador_id', null)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Fetch assigned requests
  const { data: assignedRequests, isLoading: loadingAssigned } = useQuery({
    queryKey: ['company-opening-assigned', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_opening_requests')
        .select('*')
        .eq('contador_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch documents for selected request
  const { data: documents } = useQuery({
    queryKey: ['company-opening-documents', selectedRequest?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_opening_documents')
        .select('*')
        .eq('request_id', selectedRequest.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedRequest?.id,
  });

  // Accept request mutation
  const acceptMutation = useMutation({
    mutationFn: async ({ requestId, price, description }: { requestId: string; price: number; description: string }) => {
      const { error } = await supabase
        .from('company_opening_requests')
        .update({
          contador_id: user?.id,
          status: 'analyzing',
          service_price_cents: price,
          service_description: description,
          status_updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-opening-pending'] });
      queryClient.invalidateQueries({ queryKey: ['company-opening-assigned'] });
      toast.success('Solicitação aceita com sucesso!');
      setDialogOpen(false);
      setSelectedRequest(null);
    },
    onError: (error) => {
      console.error('Accept error:', error);
      toast.error('Erro ao aceitar solicitação.');
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status, notes }: { requestId: string; status: string; notes?: string }) => {
      const updateData: any = {
        status,
        status_updated_at: new Date().toISOString(),
      };
      
      if (notes) {
        updateData.contador_notes = notes;
      }

      const { error } = await supabase
        .from('company_opening_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-opening-assigned'] });
      toast.success('Status atualizado!');
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast.error('Erro ao atualizar status.');
    },
  });

  // Update document status mutation
  const updateDocumentMutation = useMutation({
    mutationFn: async ({ docId, status, rejectionReason }: { docId: string; status: string; rejectionReason?: string }) => {
      const { error } = await supabase
        .from('company_opening_documents')
        .update({
          status,
          rejection_reason: rejectionReason,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', docId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-opening-documents'] });
      toast.success('Documento atualizado!');
    },
  });

  const handleAcceptRequest = (request: any) => {
    setSelectedRequest(request);
    // Set default price based on recommended regime
    const template = PRICING_TEMPLATES.find(p => p.regime === request.recommended_regime);
    if (template) {
      setPriceInput(formatCurrency(template.price / 100));
      setServiceDescription(template.description);
    }
    setDialogOpen(true);
  };

  const handleConfirmAccept = () => {
    if (!selectedRequest) return;
    const price = parseCurrencyInput(priceInput) * 100;
    acceptMutation.mutate({
      requestId: selectedRequest.id,
      price,
      description: serviceDescription,
    });
  };

  const handleDownloadDocument = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage
      .from('company-documents')
      .download(filePath);

    if (error) {
      toast.error('Erro ao baixar documento.');
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderRequestCard = (request: any, showAccept = false) => {
    const statusConfig = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
    
    return (
      <Card key={request.id} className="bg-card/50 border-border/50">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{request.full_name}</p>
                <p className="text-xs text-muted-foreground">{request.email}</p>
              </div>
            </div>
            <Badge className={statusConfig.color}>
              {statusConfig.icon}
              <span className="ml-1">{statusConfig.label}</span>
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
            <div>
              <p className="text-muted-foreground">Regime Recomendado</p>
              <p className="font-medium text-foreground capitalize">
                {request.recommended_regime?.replace('-', ' ') || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Faturamento Anual</p>
              <p className="font-medium text-foreground">
                {formatCurrency(request.annual_revenue_cents / 100)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Localização</p>
              <p className="font-medium text-foreground">
                {request.city}/{request.state}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Profissão</p>
              <p className="font-medium text-foreground">{request.profession || 'N/A'}</p>
            </div>
          </div>

          {request.service_price_cents > 0 && (
            <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30 mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">
                  Valor do Serviço: {formatCurrency(request.service_price_cents / 100)}
                </span>
              </div>
              {request.service_description && (
                <p className="text-xs text-emerald-400/70 mt-1">{request.service_description}</p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Criado em {format(new Date(request.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
            
            {showAccept ? (
              <Button size="sm" onClick={() => handleAcceptRequest(request)}>
                <DollarSign className="h-4 w-4 mr-1" />
                Aceitar e Precificar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Select
                  value={request.status}
                  onValueChange={(status) => updateStatusMutation.mutate({ requestId: request.id, status })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analyzing">Em Análise</SelectItem>
                    <SelectItem value="documents_pending">Docs Pendentes</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedRequest(request)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingRequests?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Aguardando</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {assignedRequests?.filter(r => r.status === 'analyzing').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Em Análise</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {assignedRequests?.filter(r => r.status === 'in_progress').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {assignedRequests?.filter(r => r.status === 'completed').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            Novas Solicitações
            {pendingRequests && pendingRequests.length > 0 && (
              <Badge className="ml-2 bg-amber-500 text-white">{pendingRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="assigned">Minhas Solicitações</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {loadingPending ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pendingRequests && pendingRequests.length > 0 ? (
            pendingRequests.map(request => renderRequestCard(request, true))
          ) : (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma solicitação pendente no momento.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assigned" className="space-y-4">
          {loadingAssigned ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : assignedRequests && assignedRequests.length > 0 ? (
            assignedRequests.map(request => renderRequestCard(request, false))
          ) : (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Você ainda não aceitou nenhuma solicitação.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Accept Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aceitar Solicitação</DialogTitle>
            <DialogDescription>
              Defina o preço do serviço para {selectedRequest?.full_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Quick pricing templates */}
            <div className="space-y-2">
              <Label>Sugestões de Preço</Label>
              <div className="grid grid-cols-1 gap-2">
                {PRICING_TEMPLATES.map((template) => (
                  <Button
                    key={template.regime}
                    variant="outline"
                    size="sm"
                    className={`justify-between ${
                      selectedRequest?.recommended_regime === template.regime 
                        ? 'border-primary bg-primary/10' 
                        : ''
                    }`}
                    onClick={() => {
                      setPriceInput(formatCurrency(template.price / 100));
                      setServiceDescription(template.description);
                    }}
                  >
                    <span>{template.label}</span>
                    <span className="font-bold">{formatCurrency(template.price / 100)}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Valor do Serviço</Label>
              <Input
                id="price"
                value={priceInput}
                onChange={(e) => setPriceInput(formatCurrencyInput(e.target.value))}
                placeholder="R$ 0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição do Serviço</Label>
              <Textarea
                id="description"
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="Descreva o que está incluso..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmAccept}
              disabled={acceptMutation.isPending || !priceInput}
            >
              {acceptMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Review Dialog */}
      {selectedRequest && !dialogOpen && (
        <Dialog open={!!selectedRequest && !dialogOpen} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes da Solicitação</DialogTitle>
              <DialogDescription>
                {selectedRequest.full_name} - {selectedRequest.email}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Request details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Telefone</p>
                  <p className="font-medium">{selectedRequest.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">CPF</p>
                  <p className="font-medium">{selectedRequest.cpf}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Faturamento Anual</p>
                  <p className="font-medium">{formatCurrency(selectedRequest.annual_revenue_cents / 100)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Despesas Mensais</p>
                  <p className="font-medium">{formatCurrency(selectedRequest.monthly_expenses_cents / 100)}</p>
                </div>
              </div>

              {/* Documents */}
              {documents && documents.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium">Documentos</p>
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{doc.document_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadDocument(doc.file_path, doc.document_name)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-emerald-500"
                          onClick={() => updateDocumentMutation.mutate({ docId: doc.id, status: 'approved' })}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => updateDocumentMutation.mutate({ 
                            docId: doc.id, 
                            status: 'rejected',
                            rejectionReason: 'Documento inválido ou ilegível'
                          })}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notas do Contador</Label>
                <Textarea
                  value={contadorNotes}
                  onChange={(e) => setContadorNotes(e.target.value)}
                  placeholder="Adicione observações sobre esta solicitação..."
                  rows={3}
                />
                <Button 
                  size="sm"
                  onClick={() => {
                    updateStatusMutation.mutate({
                      requestId: selectedRequest.id,
                      status: selectedRequest.status,
                      notes: contadorNotes
                    });
                  }}
                >
                  Salvar Notas
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CompanyOpeningManagement;
