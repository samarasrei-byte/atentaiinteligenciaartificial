import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { formatPrice } from '@/lib/stripe';
import { 
  FileText, 
  FileSpreadsheet, 
  Loader2, 
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface IRRequest {
  id: string;
  user_id: string;
  ir_type: string;
  fiscal_year: number;
  full_name: string;
  cpf: string | null;
  email: string | null;
  phone: string | null;
  has_investments: boolean;
  has_rental_income: boolean;
  has_foreign_income: boolean;
  income_sources_count: number;
  notes: string | null;
  base_price_cents: number;
  final_price_cents: number;
  discount_applied: boolean;
  status: string;
  payment_status: string;
  created_at: string;
  completed_at: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Aguardando Pagamento', color: 'bg-yellow-500/20 text-yellow-600', icon: Clock },
  paid: { label: 'Pago - Aguardando', color: 'bg-blue-500/20 text-blue-600', icon: Clock },
  in_progress: { label: 'Em Andamento', color: 'bg-primary/20 text-primary', icon: RefreshCw },
  documents_pending: { label: 'Docs Pendentes', color: 'bg-orange-500/20 text-orange-600', icon: AlertCircle },
  completed: { label: 'Concluído', color: 'bg-success/20 text-success', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-destructive/20 text-destructive', icon: AlertCircle },
};

export function IRManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<IRRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<IRRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('ir_requests')
        .select('*')
        .eq('contador_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching IR requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest || !newStatus) return;

    setIsUpdating(true);
    try {
      const updateData: Record<string, any> = { status: newStatus };
      
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('ir_requests')
        .update(updateData)
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: 'Status atualizado',
        description: 'O status da declaração foi atualizado com sucesso.',
      });

      fetchRequests();
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

  const openDetails = (request: IRRequest) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
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
          <h2 className="text-2xl font-bold">Declarações de IR</h2>
          <p className="text-muted-foreground">Gerencie as solicitações de Imposto de Renda</p>
        </div>
        <Button variant="outline" onClick={fetchRequests}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {requests.filter(r => r.payment_status === 'paid' && r.status !== 'completed').length}
            </div>
            <p className="text-sm text-muted-foreground">Aguardando</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'in_progress').length}
            </div>
            <p className="text-sm text-muted-foreground">Em Andamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'completed').length}
            </div>
            <p className="text-sm text-muted-foreground">Concluídas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-success">
              {formatPrice(
                requests
                  .filter(r => r.payment_status === 'paid')
                  .reduce((sum, r) => sum + r.final_price_cents * 0.85, 0)
              )}
            </div>
            <p className="text-sm text-muted-foreground">Receita (85%)</p>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitações</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma solicitação de IR atribuída a você.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => {
                  const status = statusConfig[request.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  
                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.full_name}</p>
                          <p className="text-sm text-muted-foreground">{request.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {request.ir_type === 'simples' ? (
                            <FileText className="h-4 w-4 text-primary" />
                          ) : (
                            <FileSpreadsheet className="h-4 w-4 text-primary" />
                          )}
                          <span className="capitalize">{request.ir_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{request.fiscal_year}</TableCell>
                      <TableCell>
                        <div>
                          <p>{formatPrice(request.final_price_cents)}</p>
                          {request.discount_applied && (
                            <Badge variant="outline" className="text-xs">
                              Com desconto
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(request.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDetails(request)}
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
              IR {selectedRequest?.ir_type?.toUpperCase()} - Ano {selectedRequest?.fiscal_year}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Nome</label>
                  <p className="font-medium">{selectedRequest.full_name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">CPF</label>
                  <p className="font-medium">{selectedRequest.cpf || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium">{selectedRequest.email || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Telefone</label>
                  <p className="font-medium">{selectedRequest.phone || '-'}</p>
                </div>
              </div>

              {selectedRequest.ir_type === 'completo' && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Informações Adicionais</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span>Investimentos:</span>
                      <Badge variant={selectedRequest.has_investments ? 'default' : 'outline'}>
                        {selectedRequest.has_investments ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Aluguéis:</span>
                      <Badge variant={selectedRequest.has_rental_income ? 'default' : 'outline'}>
                        {selectedRequest.has_rental_income ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Renda exterior:</span>
                      <Badge variant={selectedRequest.has_foreign_income ? 'default' : 'outline'}>
                        {selectedRequest.has_foreign_income ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Fontes de renda:</span>
                      <Badge variant="outline">{selectedRequest.income_sources_count}</Badge>
                    </div>
                  </div>
                </div>
              )}

              {selectedRequest.notes && (
                <div>
                  <label className="text-sm text-muted-foreground">Observações</label>
                  <p className="p-2 bg-muted/50 rounded">{selectedRequest.notes}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Atualizar Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Pago - Aguardando</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="documents_pending">Documentos Pendentes</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
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
