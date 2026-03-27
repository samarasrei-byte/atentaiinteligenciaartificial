import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, Shield, Lock, Sparkles, ArrowRight, X
} from 'lucide-react';
import { ServicePaywallModal } from './ServicePaywallModal';

interface ServicePaywallBannerProps {
  serviceType: 'limpanome' | 'fiscal';
  servicePriceCents: number;
  isPaid: boolean;
  onDismiss?: () => void;
}

/**
 * ServicePaywallBanner - Banner de pagamento exibido no painel
 * 
 * Mostra quando o serviço ainda não foi pago
 * Clica para abrir o ServicePaywallModal
 */
export const ServicePaywallBanner: React.FC<ServicePaywallBannerProps> = ({
  serviceType,
  servicePriceCents,
  isPaid,
  onDismiss,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isPaid || isDismissed) return null;

  const serviceLabels = {
    'limpanome': 'Limpa Nome',
    'fiscal': 'Análise Fiscal',
    'bi-contabilidade': 'BI+ Contabilidade',
  };

  const priceFormatted = (servicePriceCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border border-primary/20 p-4 md:p-6"
      >
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">
                Ative seu {serviceLabels[serviceType]} por {priceFormatted}
              </h3>
              <p className="text-sm text-muted-foreground">
                Seu chat com o especialista está ativo! Complete o pagamento para iniciar o serviço.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-lg group"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Ativar agora
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <button
              onClick={handleDismiss}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Security badge */}
        <div className="relative z-10 mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          Pagamento seguro via Stripe • Seus dados estão protegidos
        </div>
      </motion.div>

      <ServicePaywallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceType={serviceType}
        servicePriceCents={servicePriceCents}
      />
    </>
  );
};

export default ServicePaywallBanner;
