import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, Eye, Send, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PaymentFlowType = 'fixed' | 'variable';

interface PaymentFlowBadgeProps {
  flowType: PaymentFlowType;
  status: string;
  paymentStatus: string;
  fixedPriceCents?: number;
  analyzedPriceCents?: number;
  onSendPayment?: () => void;
  className?: string;
}

/**
 * PaymentFlowBadge - Indicador visual do fluxo de pagamento
 * 
 * REGRA DE NEGÓCIO:
 * - VALOR FIXO (Limpa Nome): Mostra valor e permite pagamento direto
 * - VALOR VARIÁVEL (BI, Fiscal): Mostra "Em análise" até valor ser definido
 */
export const PaymentFlowBadge: React.FC<PaymentFlowBadgeProps> = ({
  flowType,
  status,
  paymentStatus,
  fixedPriceCents,
  analyzedPriceCents,
  onSendPayment,
  className,
}) => {
  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  // Se já foi pago
  if (paymentStatus === 'paid') {
    return (
      <Badge className={cn("bg-emerald-500 text-white gap-1.5", className)}>
        <CheckCircle className="h-3.5 w-3.5" />
        Pago
      </Badge>
    );
  }

  // VALOR FIXO - Mostra preço e permite pagamento direto
  if (flowType === 'fixed') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5">
          <DollarSign className="h-3.5 w-3.5" />
          {fixedPriceCents ? formatCurrency(fixedPriceCents) : 'R$ 780,00'}
        </Badge>
        {onSendPayment && paymentStatus !== 'paid' && (
          <Button size="sm" variant="default" onClick={onSendPayment} className="h-7 text-xs">
            <Send className="h-3 w-3 mr-1" />
            Enviar Pagamento
          </Button>
        )}
      </div>
    );
  }

  // VALOR VARIÁVEL - Depende do status
  // Se ainda está em análise inicial, não mostra valor
  if (status === 'pending' || status === 'analyzing' || !analyzedPriceCents) {
    return (
      <Badge variant="outline" className={cn("bg-amber-50 text-amber-700 border-amber-200 gap-1.5", className)}>
        <Eye className="h-3.5 w-3.5" />
        Em análise
      </Badge>
    );
  }

  // Se já foi analisado e tem valor definido
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 gap-1.5">
        <DollarSign className="h-3.5 w-3.5" />
        {formatCurrency(analyzedPriceCents)}
      </Badge>
      {onSendPayment && paymentStatus !== 'paid' && (
        <Button size="sm" variant="default" onClick={onSendPayment} className="h-7 text-xs">
          <Send className="h-3 w-3 mr-1" />
          Enviar para Pagamento
        </Button>
      )}
    </div>
  );
};

/**
 * ServiceStatusBadge - Badge de status do serviço
 */
interface ServiceStatusBadgeProps {
  status: string;
  flowType: PaymentFlowType;
}

export const ServiceStatusBadge: React.FC<ServiceStatusBadgeProps> = ({ status, flowType }) => {
  // Para serviços de valor variável, status "pending" significa "Em análise"
  const getConfig = () => {
    if (flowType === 'variable' && (status === 'pending' || status === 'analyzing')) {
      return { label: 'Em Análise', class: 'bg-blue-50 text-blue-700 border-blue-200', icon: Eye };
    }

    const configs: Record<string, { label: string; class: string; icon: any }> = {
      pending: { label: 'Pendente', class: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
      analyzing: { label: 'Em Análise', class: 'bg-blue-50 text-blue-700 border-blue-200', icon: Eye },
      in_progress: { label: 'Em Andamento', class: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock },
      negotiating: { label: 'Negociando', class: 'bg-violet-50 text-violet-700 border-violet-200', icon: Clock },
      approved: { label: 'Aprovado', class: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
      completed: { label: 'Concluído', class: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
      cancelled: { label: 'Cancelado', class: 'bg-red-50 text-red-700 border-red-200', icon: Clock },
    };

    return configs[status] || configs.pending;
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-1.5", config.class)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
};

export default PaymentFlowBadge;
