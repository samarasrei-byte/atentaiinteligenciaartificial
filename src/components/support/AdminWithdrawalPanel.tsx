import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Search,
  RefreshCw,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  Key,
} from 'lucide-react';

interface WithdrawalRequest {
  id: string;
  contador_id: string;
  amount_cents: number;
  pix_key: string;
  pix_key_type: string;
  status: string;
  notes: string | null;
  rejection_reason: string | null;
  requested_at: string;
  processed_at: string | null;
  created_at: string;
  contador_profile?: {
    full_name: string | null;
    email: string | null;
  };
}

export const AdminWithdrawalPanel: React.FC = () => {
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Action Dialog State
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchWithdrawals();

    // Real-time subscription
    const channel = supabase
      .channel('admin-withdrawals')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'withdrawal_requests' },
        () => fetchWithdrawals()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchWithdrawals = async () => {
    try {
      // Fetch withdrawal requests
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (withdrawalsError) throw withdrawalsError;

      // Fetch contador profiles for each request
      const contadorIds = [...new Set(withdrawalsData?.map(w => w.contador_id) || [])];
      
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', contadorIds);

      // Merge profiles with withdrawals
      const enrichedWithdrawals = (withdrawalsData || []).map(w => ({
        ...w,
        contador_profile: profilesData?.find(p => p.user_id === w.contador_id) || null
      }));

      setWithdrawals(enrichedWithdrawals);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao carregar solicitações de saque',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedWithdrawal) return;

    setIsProcessing(true);
    try {
      const updates: Record<string, any> = {
        status: action === 'approve' ? 'approved' : 'rejected',
        processed_at: new Date().toISOString(),
      };

      if (action === 'reject' && rejectionReason) {
        updates.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from('withdrawal_requests')
        .update(updates)
        .eq('id', selectedWithdrawal.id);

      if (error) throw error;

      toast({
        title: action === 'approve' ? 'Saque aprovado!' : 'Saque rejeitado',
        description: action === 'approve' 
          ? 'O pagamento deve ser processado via PIX.' 
          : 'O contador foi notificado.',
      });

      setSelectedWithdrawal(null);
      setActionType(null);
      setRejectionReason('');
      fetchWithdrawals();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { class: string; icon: any; label: string }> = {
      pending: { class: 'bg-amber-500/10 text-amber-500 border-amber-500/30', icon: Clock, label: 'Pendente' },
      approved: { class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30', icon: CheckCircle, label: 'Aprovado' },
      rejected: { class: 'bg-destructive/10 text-destructive border-destructive/30', icon: XCircle, label: 'Rejeitado' },
    };
    const cfg = config[status] || config.pending;
    const Icon = cfg.icon;
    return (
      <Badge variant="outline" className={cfg.class}>
        <Icon className="h-3 w-3 mr-1" />
        {cfg.label}
      </Badge>
    );
  };

  const getPixKeyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cpf: 'CPF',
      cnpj: 'CNPJ',
      email: 'E-mail',
      phone: 'Telefone',
      random: 'Chave Aleatória',
    };
    return labels[type] || type;
  };

  const filteredWithdrawals = withdrawals.filter(w => {
    const matchesSearch = 
      w.contador_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.contador_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.pix_key.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
  const totalPendingAmount = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + w.amount_cents, 0);

  if (isLoading) {
    return (
      <Card className="bg-card border-border shadow-soft">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Pendente</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPendingAmount)}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Solicitações</p>
                <p className="text-2xl font-bold text-foreground">{withdrawals.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-info/10">
                <Wallet className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawals List */}
      <Card className="bg-card border-border shadow-soft">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Solicitações de Saque
              </CardTitle>
              <CardDescription>
                Gerencie os saques dos contadores
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="approved">Aprovados</SelectItem>
                  <SelectItem value="rejected">Rejeitados</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setIsRefreshing(true);
                  fetchWithdrawals();
                }}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredWithdrawals.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma solicitação encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWithdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg border border-border"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">
                          {withdrawal.contador_profile?.full_name || 'Contador'}
                        </p>
                        {getStatusBadge(withdrawal.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {withdrawal.contador_profile?.email}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(withdrawal.requested_at).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Key className="h-3 w-3" />
                          {getPixKeyTypeLabel(withdrawal.pix_key_type)}: {withdrawal.pix_key}
                        </span>
                      </div>
                      {withdrawal.notes && (
                        <p className="text-sm text-muted-foreground italic">
                          "{withdrawal.notes}"
                        </p>
                      )}
                      {withdrawal.rejection_reason && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Motivo: {withdrawal.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="text-left sm:text-right">
                      <p className="text-2xl font-bold text-foreground">
                        {formatCurrency(withdrawal.amount_cents)}
                      </p>
                    </div>
                    
                    {withdrawal.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            setActionType('approve');
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            setActionType('reject');
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={!!actionType} onOpenChange={() => {
        setActionType(null);
        setSelectedWithdrawal(null);
        setRejectionReason('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Aprovar Saque' : 'Rejeitar Saque'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'Confirme a aprovação do saque. Você deverá processar o pagamento via PIX.'
                : 'Informe o motivo da rejeição do saque.'}
            </DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contador:</span>
                  <span className="font-medium">{selectedWithdrawal.contador_profile?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-bold text-lg">{formatCurrency(selectedWithdrawal.amount_cents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chave PIX:</span>
                  <span className="font-medium">{selectedWithdrawal.pix_key}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium">{getPixKeyTypeLabel(selectedWithdrawal.pix_key_type)}</span>
                </div>
              </div>

              {actionType === 'reject' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Motivo da Rejeição</label>
                  <Textarea
                    placeholder="Informe o motivo da rejeição..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionType(null);
                setSelectedWithdrawal(null);
                setRejectionReason('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleAction(actionType!)}
              disabled={isProcessing || (actionType === 'reject' && !rejectionReason)}
              className={actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              variant={actionType === 'reject' ? 'destructive' : 'default'}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {actionType === 'approve' ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
