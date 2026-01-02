import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Wallet, Clock, CheckCircle, XCircle, Banknote, 
  Loader2, Search, Building2, DollarSign
} from 'lucide-react';

interface WithdrawalRequest {
  id: string;
  partner_id: string;
  requested_by: string;
  amount_cents: number;
  pix_key: string;
  pix_key_type: string;
  status: string;
  requested_at: string;
  processed_at: string | null;
  rejection_reason: string | null;
  notes: string | null;
  partner?: {
    company_name: string;
    trade_name: string | null;
  };
}

export function PartnerWithdrawalPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Dialog state
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [dialogType, setDialogType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('partner_withdrawal_requests')
        .select(`
          *,
          partner:credit_repair_partners(company_name, trade_name)
        `)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao carregar saques',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedWithdrawal || !user) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('partner_withdrawal_requests')
        .update({
          status: 'approved',
          processed_at: new Date().toISOString(),
          processed_by: user.id,
        })
        .eq('id', selectedWithdrawal.id);

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Saque aprovado com sucesso',
      });

      setDialogType(null);
      setSelectedWithdrawal(null);
      fetchWithdrawals();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao aprovar saque',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal || !user || !rejectionReason.trim()) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('partner_withdrawal_requests')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
          processed_by: user.id,
          rejection_reason: rejectionReason.trim(),
        })
        .eq('id', selectedWithdrawal.id);

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Saque rejeitado',
      });

      setDialogType(null);
      setSelectedWithdrawal(null);
      setRejectionReason('');
      fetchWithdrawals();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao rejeitar saque',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('partner_withdrawal_requests')
        .update({
          status: 'paid',
          processed_at: new Date().toISOString(),
          processed_by: user.id,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Saque marcado como pago',
      });

      fetchWithdrawals();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao atualizar saque',
      });
    }
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { class: string; icon: any; label: string }> = {
      pending: { class: 'bg-amber-500/20 text-amber-600 border-amber-300', icon: Clock, label: 'Pendente' },
      approved: { class: 'bg-blue-500/20 text-blue-600 border-blue-300', icon: CheckCircle, label: 'Aprovado' },
      rejected: { class: 'bg-red-500/20 text-red-600 border-red-300', icon: XCircle, label: 'Rejeitado' },
      paid: { class: 'bg-emerald-500/20 text-emerald-600 border-emerald-300', icon: Banknote, label: 'Pago' },
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={config.class}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const filteredWithdrawals = withdrawals.filter(w => {
    const matchesSearch = 
      w.partner?.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.pix_key.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: withdrawals.filter(w => w.status === 'pending').length,
    pendingAmount: withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amount_cents, 0),
    approved: withdrawals.filter(w => w.status === 'approved').length,
    approvedAmount: withdrawals.filter(w => w.status === 'approved').reduce((sum, w) => sum + w.amount_cents, 0),
    paid: withdrawals.filter(w => w.status === 'paid').length,
    paidAmount: withdrawals.filter(w => w.status === 'paid').reduce((sum, w) => sum + w.amount_cents, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">Pendentes</p>
                <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
                <p className="text-sm text-amber-600">{formatCurrency(stats.pendingAmount)}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Aprovados</p>
                <p className="text-2xl font-bold text-blue-700">{stats.approved}</p>
                <p className="text-sm text-blue-600">{formatCurrency(stats.approvedAmount)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Pagos</p>
                <p className="text-2xl font-bold text-emerald-700">{stats.paid}</p>
                <p className="text-sm text-emerald-600">{formatCurrency(stats.paidAmount)}</p>
              </div>
              <Banknote className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Saques de Parceiros
          </CardTitle>
          <CardDescription>
            Gerencie as solicitações de saque das empresas parceiras
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por parceiro ou chave PIX..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-md border border-border bg-background"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendentes</option>
              <option value="approved">Aprovados</option>
              <option value="rejected">Rejeitados</option>
              <option value="paid">Pagos</option>
            </select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredWithdrawals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum saque encontrado</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Parceiro</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Chave PIX</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Solicitado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWithdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{withdrawal.partner?.company_name || 'N/A'}</p>
                            {withdrawal.partner?.trade_name && (
                              <p className="text-xs text-muted-foreground">{withdrawal.partner.trade_name}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-emerald-500" />
                          <span className="font-bold">{formatCurrency(withdrawal.amount_cents)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-mono text-sm">{withdrawal.pix_key}</p>
                          <p className="text-xs text-muted-foreground uppercase">{withdrawal.pix_key_type}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(withdrawal.requested_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {withdrawal.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                                onClick={() => {
                                  setSelectedWithdrawal(withdrawal);
                                  setDialogType('approve');
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedWithdrawal(withdrawal);
                                  setDialogType('reject');
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rejeitar
                              </Button>
                            </>
                          )}
                          {withdrawal.status === 'approved' && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleMarkAsPaid(withdrawal.id)}
                            >
                              <Banknote className="h-4 w-4 mr-1" />
                              Marcar Pago
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={dialogType === 'approve'} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Aprovar Saque</DialogTitle>
            <DialogDescription>
              Confirme a aprovação do saque de {selectedWithdrawal && formatCurrency(selectedWithdrawal.amount_cents)}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Após a aprovação, o parceiro aguardará o pagamento via PIX.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleApprove} 
              disabled={isProcessing}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirmar Aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={dialogType === 'reject'} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Rejeitar Saque</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição do saque
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Textarea
              placeholder="Motivo da rejeição..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleReject} 
              disabled={isProcessing || !rejectionReason.trim()}
              variant="destructive"
            >
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
