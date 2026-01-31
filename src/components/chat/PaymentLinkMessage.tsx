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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PaymentLinkMessageProps {
  serviceType: 'limpanome' | 'fiscal' | 'bi-contabilidade';
  servicePriceCents: number;
  requestId: string;
  isPaid?: boolean;
  className?: string;
}

const serviceLabels = {
  'limpanome': { name: 'Limpa Nome', icon: Shield, gradient: 'from-emerald-500 to-green-600' },
  'fiscal': { name: 'Análise Fiscal', icon: Sparkles, gradient: 'from-violet-500 to-purple-600' },
  'bi-contabilidade': { name: 'BI+ Contabilidade', icon: Sparkles, gradient: 'from-indigo-500 to-blue-600' },
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
  const [isLoading, setIsLoading] = useState(false);

  const service = serviceLabels[serviceType];
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

    setIsLoading(true);

    try {
      const functionMap = {
        'limpanome': 'create-credit-repair-payment',
        'fiscal': 'create-fiscal-payment',
        'bi-contabilidade': 'create-fiscal-payment',
      };

      const { data, error } = await supabase.functions.invoke(functionMap[serviceType], {
        body: { 
          serviceType, 
          amount: servicePriceCents,
          requestId,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.info('Janela de pagamento aberta!');
      } else {
        throw new Error('URL de checkout não retornada');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Erro ao iniciar pagamento.');
    } finally {
      setIsLoading(false);
    }
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
          Pagamento seguro via Stripe
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentLinkMessage;
