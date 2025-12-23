import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, 
  Loader2, Plus, Banknote, Calendar,
} from 'lucide-react';

interface WithdrawalRequest {
  id: string;
  amount_cents: number;
  pix_key: string;
  pix_key_type: string;
  status: string;
  requested_at: string;
  processed_at: string | null;
  rejection_reason: string | null;
}

interface WithdrawalSystemProps {
  availableBalance: number; // in cents
  onWithdrawalCreated?: () => void;
}

const pixKeyTypes = [
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Telefone' },
  { value: 'random', label: 'Chave Aleatória' },
];

export const WithdrawalSystem: React.FC<WithdrawalSystemProps> = ({
  availableBalance,
  onWithdrawalCreated,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [amount, setAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      fetchWithdrawals();
    }
  }, [user]);

  const fetchWithdrawals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('contador_id', user.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setWithdrawals((data as WithdrawalRequest[]) || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const amountCents = Math.round(parseFloat(amount) * 100);
    if (!amount || isNaN(amountCents) || amountCents < 5000) {
      newErrors.amount = 'Valor mínimo é R$ 50,00';
    } else if (amountCents > availableBalance) {
      newErrors.amount = 'Saldo insuficiente';
    }

    if (!pixKey.trim()) {
      newErrors.pixKey = 'Chave PIX é obrigatória';
    }

    if (!pixKeyType) {
      newErrors.pixKeyType = 'Selecione o tipo da chave';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;

    setIsSubmitting(true);
    try {
      const amountCents = Math.round(parseFloat(amount) * 100);

      const { error } = await supabase.from('withdrawal_requests').insert({
        contador_id: user.id,
        amount_cents: amountCents,
        pix_key: pixKey.trim(),
        pix_key_type: pixKeyType,
      });

      if (error) throw error;

      toast({
        title: 'Solicitação enviada!',
        description: 'Seu pedido de saque está em análise',
      });

      setDialogOpen(false);
      setAmount('');
      setPixKey('');
      setPixKeyType('');
      fetchWithdrawals();
      onWithdrawalCreated?.();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao solicitar saque',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { class: string; icon: any; label: string }> = {
      pending: { class: 'bg-amber-500/20 text-amber-500', icon: Clock, label: 'Pendente' },
      approved: { class: 'bg-blue-500/20 text-blue-500', icon: CheckCircle, label: 'Aprovado' },
      rejected: { class: 'bg-red-500/20 text-red-500', icon: XCircle, label: 'Rejeitado' },
      paid: { class: 'bg-emerald-500/20 text-emerald-500', icon: Banknote, label: 'Pago' },
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

  const pendingAmount = withdrawals
    .filter((w) => w.status === 'pending' || w.status === 'approved')
    .reduce((sum, w) => sum + w.amount_cents, 0);

  const effectiveBalance = availableBalance - pendingAmount;

  return (
    <Card className="bg-card border-border shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-500" />
              Saques
            </CardTitle>
            <CardDescription>Solicite a transferência dos seus ganhos</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                disabled={effectiveBalance < 5000}
              >
                <Plus className="h-4 w-4 mr-2" />
                Solicitar Saque
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Solicitar Saque</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Preencha os dados para transferência via PIX
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Balance Info */}
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Saldo disponível</span>
                    <span className="text-xl font-bold text-emerald-400">
                      {formatCurrency(effectiveBalance)}
                    </span>
                  </div>
                  {pendingAmount > 0 && (
                    <p className="text-xs text-amber-400 mt-2">
                      {formatCurrency(pendingAmount)} em saques pendentes
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Valor do Saque *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0,00"
                      min="50"
                      step="0.01"
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  {errors.amount && <p className="text-sm text-red-400">{errors.amount}</p>}
                  <p className="text-xs text-slate-500">Valor mínimo: R$ 50,00</p>
                </div>

                {/* PIX Key Type */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Tipo da Chave PIX *</Label>
                  <Select value={pixKeyType} onValueChange={setPixKeyType}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {pixKeyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.pixKeyType && <p className="text-sm text-red-400">{errors.pixKeyType}</p>}
                </div>

                {/* PIX Key */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Chave PIX *</Label>
                  <Input
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="Digite sua chave PIX"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                  {errors.pixKey && <p className="text-sm text-red-400">{errors.pixKey}</p>}
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5" />
                    <p className="text-sm text-blue-400">
                      O pagamento será processado em até 3 dias úteis após aprovação.
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="border-slate-600 text-slate-300"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Banknote className="h-4 w-4 mr-2" />
                  )}
                  Confirmar Saque
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Balance Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/30">
            <p className="text-sm text-emerald-400">Saldo Disponível</p>
            <p className="text-2xl font-bold text-emerald-500">{formatCurrency(effectiveBalance)}</p>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/30">
            <p className="text-sm text-amber-400">Em Processamento</p>
            <p className="text-2xl font-bold text-amber-500">{formatCurrency(pendingAmount)}</p>
          </div>
        </div>

        {/* Withdrawal History */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Histórico de Saques
          </h4>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum saque solicitado ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {formatCurrency(withdrawal.amount_cents)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(withdrawal.requested_at).toLocaleDateString('pt-BR')}
                      {' • '}
                      PIX {withdrawal.pix_key_type.toUpperCase()}
                    </p>
                    {withdrawal.rejection_reason && (
                      <p className="text-sm text-red-400 mt-1">{withdrawal.rejection_reason}</p>
                    )}
                  </div>
                  {getStatusBadge(withdrawal.status)}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
