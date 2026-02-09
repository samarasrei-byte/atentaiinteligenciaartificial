import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  CreditCard, Shield, Check, Star, Zap, Lock,
  MessageCircle, FileCheck, Sparkles, Loader2, ArrowRight
} from 'lucide-react';
import { useMPCheckout } from '@/contexts/MPCheckoutContext';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface ServicePaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: 'limpanome' | 'fiscal' | 'bi-contabilidade';
  servicePriceCents: number;
  onPaymentSuccess?: () => void;
}

/**
 * ServicePaywallModal - Modal de pagamento DENTRO do painel
 * 
 * REGRA SaaS: Pagamento acontece DEPOIS do onboarding e criação de conta
 * - Chat continua funcionando mesmo sem pagamento
 * - Serviço fica bloqueado até pagamento
 * - Stripe Checkout modal/popup
 */
export const ServicePaywallModal: React.FC<ServicePaywallModalProps> = ({
  isOpen,
  onClose,
  serviceType,
  servicePriceCents,
  onPaymentSuccess,
}) => {
  const { user, session } = useAuth();
  const { openCheckout } = useMPCheckout();
  const [isLoading, setIsLoading] = useState(false);

  const serviceDetails = {
    'limpanome': {
      name: 'Limpa Nome',
      description: 'Remoção de registros nos bureaus de crédito',
      features: [
        'Análise completa do seu histórico',
        'Remoção de registros SERASA/SPC',
        'Acompanhamento em tempo real',
        'Bônus: Regularização de Score',
      ],
      icon: Shield,
      gradient: 'from-emerald-500 to-green-600',
    },
    'fiscal': {
      name: 'Análise Fiscal',
      description: 'Recuperação de créditos tributários',
      features: [
        'Análise por especialista humano',
        'Identificação de oportunidades',
        'Relatório completo auditável',
        'Pague apenas no êxito (50%)',
      ],
      icon: FileCheck,
      gradient: 'from-emerald-500 to-teal-600',
    },
    'bi-contabilidade': {
      name: 'BI+ Contabilidade',
      description: 'Inteligência financeira completa',
      features: [
        'Dashboard em tempo real',
        'IA + Análise humana',
        'Insights automáticos',
        'Suporte especializado',
      ],
      icon: Sparkles,
      gradient: 'from-indigo-500 to-purple-600',
    },
  };

  const service = serviceDetails[serviceType];
  const ServiceIcon = service.icon;
  const priceFormatted = (servicePriceCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const handlePayment = async () => {
    if (!user || !session) {
      toast.error('Você precisa estar logado para continuar.');
      return;
    }

    openCheckout({
      amountCents: servicePriceCents,
      serviceName: service.name,
      serviceType: serviceType,
      description: service.description,
      gradient: service.gradient,
      onSuccess: () => {
        toast.success('Pagamento realizado! Serviço ativado.');
        onPaymentSuccess?.();
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <div className={`bg-gradient-to-br ${service.gradient} p-6 text-white`}>
          <DialogHeader className="text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <ServiceIcon className="h-8 w-8" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">
                  {service.name}
                </DialogTitle>
                <DialogDescription className="text-white/80">
                  {service.description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Price */}
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold">{priceFormatted}</span>
            <span className="text-white/70 text-sm">pagamento único</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Chat continues message */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
            <MessageCircle className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-sm text-foreground">Chat continua ativo!</p>
              <p className="text-xs text-muted-foreground">
                Você pode conversar com seu especialista mesmo antes do pagamento.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <p className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              O que está incluso:
            </p>
            <ul className="space-y-2">
              {service.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <Button
            onClick={handlePayment}
            disabled={isLoading}
            size="lg"
            className={`w-full h-14 text-lg font-semibold bg-gradient-to-r ${service.gradient} hover:opacity-90 shadow-lg transition-all group`}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Ativar serviço agora
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>

          {/* Security & Skip */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="h-3 w-3" />
              Pagamento seguro via Mercado Pago
            </div>
            <button
              type="button"
              onClick={onClose}
              className="hover:text-foreground transition-colors"
            >
              Pagar depois
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServicePaywallModal;
