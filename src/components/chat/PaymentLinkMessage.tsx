import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Shield, 
  Sparkles, 
  ArrowRight, 
  Loader2,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useMPCheckout } from '@/contexts/MPCheckoutContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PaymentLinkMessageProps {
  serviceType: 'limpanome' | 'limpanome-pj' | 'fiscal' | 'bi' | 'certidao' | 'ir';
  servicePriceCents: number;
  requestId: string;
  isPaid?: boolean;
  className?: string;
}

const serviceLabels: Record<string, { name: string; icon: typeof Shield; gradient: string }> = {
  'limpanome': { name: 'Limpa Nome PF', icon: Shield, gradient: 'from-emerald-500 to-green-600' },
  'limpanome-pj': { name: 'Limpa Nome CNPJ', icon: Shield, gradient: 'from-emerald-500 to-green-600' },
  'fiscal': { name: 'Análise Fiscal', icon: CreditCard, gradient: 'from-blue-500 to-indigo-600' },
  'bi': { name: 'Emissão de NF', icon: Sparkles, gradient: 'from-emerald-500 to-teal-600' },
  'certidao': { name: 'Certidão', icon: Shield, gradient: 'from-teal-500 to-cyan-600' },
  'ir': { name: 'Declaração IR', icon: CreditCard, gradient: 'from-amber-500 to-orange-600' },
};

/**
 * PaymentLinkMessage - Mensagem especial de link de pagamento
 * 
 * Guilherme/César podem enviar esse componente no chat
 * O cliente clica e abre Stripe Checkout
 */
export const PaymentLinkMessage: React.FC<PaymentLinkMessageProps> = ({
  serviceType,
  servicePriceCents,
  requestId,
  isPaid = false,
  className,
}) => {
  const { session } = useAuth();
  const { openCheckout } = useMPCheckout();
  const [isLoading, setIsLoading] = useState(false);

  const service = serviceLabels[serviceType] || { name: serviceType, icon: CreditCard, gradient: 'from-primary to-primary/70' };
  const ServiceIcon = service.icon;
  const priceFormatted = (servicePriceCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const handlePayment = async () => {
    if (!session) {
      toast.error('Você precisa estar logado para pagar.');
      return;
    }

    openCheckout({
      amountCents: servicePriceCents,
      serviceName: service.name,
      serviceType: serviceType,
      description: `Pagamento ${service.name}`,
      gradient: service.gradient,
      metadata: { request_id: requestId },
      allowedMethods: ['card'],
      isRecurring: true,
      onSuccess: () => {
        toast.success('Pagamento realizado com sucesso!');
      },
    });
  };

  if (isPaid) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 p-4 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-100">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-emerald-800">Pagamento confirmado! ✅</p>
            <p className="text-sm text-emerald-600">
              {service.name} • {priceFormatted}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl overflow-hidden shadow-lg border border-slate-200 ${className}`}
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${service.gradient} p-4 text-white`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
            <ServiceIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold">{service.name}</p>
            <p className="text-sm text-white/80">Link de Pagamento</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 text-sm">Valor:</span>
          <span className="text-2xl font-bold text-slate-900">{priceFormatted}</span>
        </div>

        <Button
          onClick={handlePayment}
          disabled={isLoading}
          className={`w-full h-12 font-semibold bg-gradient-to-r ${service.gradient} hover:opacity-90 shadow-md group`}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Pagar agora
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <Lock className="h-3 w-3" />
          Pagamento seguro via Mercado Pago
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentLinkMessage;
