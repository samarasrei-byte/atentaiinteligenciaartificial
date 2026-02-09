import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  CreditCard, 
  Lock, 
  X, 
  ArrowRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useMPCheckout } from '@/contexts/MPCheckoutContext';
import { toast } from 'sonner';

interface PaymentBannerStickyProps {
  serviceType: 'limpanome' | 'limpanome-pj';
  servicePriceCents: number;
  requestId?: string;
  isPaid?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const serviceConfig = {
  'limpanome': {
    name: 'Limpa Nome',
    icon: Shield,
    gradient: 'from-emerald-500/10 via-emerald-50/50 to-teal-500/5',
    borderColor: 'border-emerald-200/60',
    buttonGradient: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
  },
  'limpanome-pj': {
    name: 'Limpa Nome CNPJ',
    icon: Shield,
    gradient: 'from-emerald-500/10 via-emerald-50/50 to-teal-500/5',
    borderColor: 'border-emerald-200/60',
    buttonGradient: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
  },
};

/**
 * Banner de pagamento sticky premium
 * - Separado visualmente do chat
 * - Sticky no topo
 * - Desaparece após pagamento
 * - CTA destacado e claro
 */
export const PaymentBannerSticky: React.FC<PaymentBannerStickyProps> = ({
  serviceType,
  servicePriceCents,
  requestId,
  isPaid = false,
  onDismiss,
  className,
}) => {
  const { openCheckout } = useMPCheckout();
  const [isLoading, setIsLoading] = useState(false);

  const config = serviceConfig[serviceType] || serviceConfig['limpanome'];
  const ServiceIcon = config.icon;

  const formatPrice = (cents: number) => 
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(cents / 100);

  const [isDismissed, setIsDismissed] = useState(false);

  const handlePayment = async () => {
    if (!requestId) {
      toast.error('Erro ao processar pagamento');
      return;
    }

    openCheckout({
      amountCents: servicePriceCents,
      serviceName: config.name,
      serviceType: serviceType,
      description: `Ativação do serviço ${config.name}`,
      gradient: 'from-emerald-500 to-teal-600',
      metadata: { request_id: requestId },
      onSuccess: () => {
        toast.success('Pagamento realizado! Serviço ativado.');
      },
    });
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  // Don't render if paid or dismissed
  if (isPaid || isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'relative rounded-xl border overflow-hidden',
          'bg-gradient-to-r',
          config.gradient,
          config.borderColor,
          'shadow-sm',
          className
        )}
      >
        {/* Content */}
        <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Icon and Text */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-11 w-11 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
              <ServiceIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-sm sm:text-base">
                Ative seu {config.name} por {formatPrice(servicePriceCents)}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
                Seu chat com o especialista está ativo! Complete o pagamento para iniciar o serviço.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handlePayment}
            disabled={isLoading}
            className={cn(
              'shrink-0 gap-2 px-5 h-10 text-white font-medium',
              config.buttonGradient,
              'shadow-md hover:shadow-lg transition-all'
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            Ativar agora
            {!isLoading && <ArrowRight className="h-4 w-4" />}
          </Button>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-black/5 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Security footer */}
        <div className="px-4 sm:px-6 py-2 bg-white/60 border-t border-border/30 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            <span>Pagamento seguro via Mercado Pago</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Seus dados estão protegidos</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentBannerSticky;
