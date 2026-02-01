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
  MessageCircle, FileCheck, Sparkles, Loader2, ArrowRight,
  Brain, Scale, Building2, Crown, X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { STRIPE_PLANS, SUBSCRIBER_DISCOUNTS, formatPrice, PlanType, ServiceType } from '@/lib/stripe';

type UpgradeType = 'subscription' | 'service';

interface ServiceConfig {
  type: ServiceType;
  name: string;
  description: string;
  priceCents: number;
  features: readonly string[];
  icon: React.ElementType;
  gradient: string;
  edgeFunction: string;
  successFee?: boolean;
}

interface PlanConfig {
  type: PlanType;
  name: string;
  description: string;
  priceCents: number;
  features: readonly string[];
  icon: React.ElementType;
  gradient: string;
}

const SERVICE_CONFIGS: Record<string, ServiceConfig> = {
  'limpa-nome': {
    type: 'credit_repair_pf',
    name: 'Limpa Nome',
    description: 'Regularize seu CPF e limpe restrições nos bureaus de crédito',
    priceCents: SUBSCRIBER_DISCOUNTS.credit_repair_pf.basePrice,
    features: [
      'Análise completa do seu histórico',
      'Remoção de registros SERASA/SPC',
      'Acompanhamento em tempo real',
      'Bônus: Regularização de Score',
    ],
    icon: Shield,
    gradient: 'from-emerald-500 to-green-600',
    edgeFunction: 'create-credit-repair-payment',
  },
  'analise-fiscal': {
    type: 'fiscal_analysis',
    name: 'Análise Fiscal',
    description: 'Recuperação de créditos tributários com taxa de sucesso',
    priceCents: 0, // Free analysis - success fee
    features: [
      'Análise 100% gratuita',
      'Identificação de oportunidades',
      'Relatório completo auditável',
      'Pague apenas no êxito (50%)',
    ],
    icon: Scale,
    gradient: 'from-blue-500 to-indigo-600',
    edgeFunction: 'create-fiscal-payment',
    successFee: true,
  },
  'bi-contabilidade': {
    type: 'business_consulting',
    name: 'BI+ Contabilidade',
    description: 'Inteligência financeira completa para sua empresa',
    priceCents: SUBSCRIBER_DISCOUNTS.business_consulting.basePrice,
    features: [
      'Dashboard em tempo real',
      'IA + Análise humana',
      'Insights automáticos',
      'Suporte especializado',
    ],
    icon: Brain,
    gradient: 'from-purple-500 to-pink-600',
    edgeFunction: 'create-fiscal-payment',
  },
  'abertura-empresa': {
    type: 'company_opening',
    name: 'Abertura de Empresa',
    description: 'Abertura completa de CNPJ com suporte contábil',
    priceCents: SUBSCRIBER_DISCOUNTS.company_opening.basePrice,
    features: [
      'Análise do melhor regime',
      'Registro na Junta Comercial',
      'Alvará e licenças',
      'CNPJ ativo em até 7 dias',
    ],
    icon: Building2,
    gradient: 'from-amber-500 to-orange-600',
    edgeFunction: 'create-company-opening-payment',
  },
};

const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
  simulator: {
    type: 'simulator',
    name: STRIPE_PLANS.simulator.name,
    description: STRIPE_PLANS.simulator.description,
    priceCents: STRIPE_PLANS.simulator.price,
    features: STRIPE_PLANS.simulator.features,
    icon: Zap,
    gradient: 'from-blue-500 to-cyan-500',
  },
  autonomo: {
    type: 'autonomo',
    name: STRIPE_PLANS.autonomo.name,
    description: STRIPE_PLANS.autonomo.description,
    priceCents: STRIPE_PLANS.autonomo.price,
    features: STRIPE_PLANS.autonomo.features,
    icon: Star,
    gradient: 'from-emerald-500 to-teal-500',
  },
  premium: {
    type: 'premium',
    name: STRIPE_PLANS.premium.name,
    description: STRIPE_PLANS.premium.description,
    priceCents: STRIPE_PLANS.premium.price,
    features: STRIPE_PLANS.premium.features,
    icon: Crown,
    gradient: 'from-primary to-primary/70',
  },
  contador: {
    type: 'contador',
    name: STRIPE_PLANS.contador.name,
    description: STRIPE_PLANS.contador.description,
    priceCents: STRIPE_PLANS.contador.price,
    features: STRIPE_PLANS.contador.features,
    icon: Crown,
    gradient: 'from-amber-500 to-orange-500',
  },
};

interface InPanelUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  upgradeType: UpgradeType;
  serviceKey?: string; // e.g., 'limpa-nome', 'analise-fiscal'
  planType?: PlanType;
  onSuccess?: () => void;
}

export const InPanelUpgradeModal: React.FC<InPanelUpgradeModalProps> = ({
  isOpen,
  onClose,
  upgradeType,
  serviceKey,
  planType,
  onSuccess,
}) => {
  const { user, session, subscription } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Get config based on upgrade type
  const serviceConfig = serviceKey ? SERVICE_CONFIGS[serviceKey] : null;
  const planConfig = planType ? PLAN_CONFIGS[planType] : null;

  const config = upgradeType === 'service' ? serviceConfig : planConfig;
  
  if (!config) {
    return null;
  }

  const Icon = config.icon;
  const isSubscriber = subscription?.subscribed || false;
  
  // Calculate price with potential discount
  let displayPrice = config.priceCents;
  if (upgradeType === 'service' && serviceConfig && isSubscriber) {
    const discount = SUBSCRIBER_DISCOUNTS[serviceConfig.type];
    displayPrice = discount?.discountedPrice || config.priceCents;
  }

  const priceFormatted = formatPrice(displayPrice);
  const isSuccessFee = upgradeType === 'service' && serviceConfig?.successFee;

  const handlePayment = async () => {
    if (!user || !session) {
      toast.error('Você precisa estar logado para continuar.');
      return;
    }

    setIsLoading(true);

    try {
      let edgeFunction: string;
      let body: Record<string, any>;

      if (upgradeType === 'subscription' && planConfig) {
        edgeFunction = 'create-checkout';
        body = { 
          priceId: STRIPE_PLANS[planConfig.type].priceId,
        };
      } else if (upgradeType === 'service' && serviceConfig) {
        edgeFunction = serviceConfig.edgeFunction;
        body = { 
          serviceType: serviceConfig.type,
          amount: displayPrice,
        };
      } else {
        throw new Error('Configuração inválida');
      }

      const { data, error } = await supabase.functions.invoke(edgeFunction, {
        body,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe Checkout in new tab
        window.open(data.url, '_blank');
        toast.info('Janela de pagamento aberta. Complete o pagamento para ativar.');
        onSuccess?.();
      } else {
        throw new Error('URL de checkout não retornada');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-br ${config.gradient} p-6 text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          
          <DialogHeader className="text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Icon className="h-8 w-8" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">
                  {config.name}
                </DialogTitle>
                <DialogDescription className="text-white/80">
                  {config.description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Price */}
          <div className="mt-4 flex items-baseline gap-2">
            {isSuccessFee ? (
              <>
                <span className="text-2xl font-bold">GRÁTIS</span>
                <span className="text-white/70 text-sm">análise + 50% no êxito</span>
              </>
            ) : (
              <>
                <span className="text-4xl font-bold">{priceFormatted}</span>
                <span className="text-white/70 text-sm">
                  {upgradeType === 'subscription' ? '/mês' : 'pagamento único'}
                </span>
              </>
            )}
          </div>

          {/* Discount badge */}
          {isSubscriber && upgradeType === 'service' && !isSuccessFee && serviceConfig && (
            <Badge className="mt-3 bg-white/20 text-white border-white/30">
              <Sparkles className="h-3 w-3 mr-1" />
              {Math.round(SUBSCRIBER_DISCOUNTS[serviceConfig.type].discount * 100)}% OFF para assinantes
            </Badge>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Features */}
          <div className="space-y-3">
            <p className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              O que está incluso:
            </p>
            <ul className="space-y-2">
              {config.features.map((feature, i) => (
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
            className={`w-full h-14 text-lg font-semibold bg-gradient-to-r ${config.gradient} hover:opacity-90 shadow-lg transition-all group`}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                {upgradeType === 'subscription' ? 'Assinar agora' : 'Contratar serviço'}
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>

          {/* Security */}
          <div className="flex items-center justify-center text-xs text-muted-foreground gap-2">
            <Lock className="h-3 w-3" />
            Pagamento seguro via Stripe
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InPanelUpgradeModal;
