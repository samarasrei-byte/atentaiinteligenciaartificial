import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  CreditCard, Shield, Check, Zap, Lock,
  Loader2, ArrowRight, MessageCircle, Scale, Brain, Building2, X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice, SUBSCRIBER_DISCOUNTS } from '@/lib/stripe';
import { useNavigate } from 'react-router-dom';
import { MPTransparentCheckout } from '@/components/payments/MPTransparentCheckout';

interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  serviceType?: 'pf' | 'pj';
  flowType: 'checkout' | 'request';
  requestTable?: string;
  priceCents: number;
  features: string[];
  successFee?: boolean;
}

const SERVICE_CONFIGS: Record<string, ServiceConfig> = {
  'limpa-nome-pf': {
    id: 'limpa-nome-pf',
    name: 'Limpa Nome',
    description: 'Regularize seu CPF e limpe restrições nos bureaus de crédito',
    icon: Shield,
    gradient: 'from-emerald-500 to-green-600',
    serviceType: 'pf',
    flowType: 'checkout',
    priceCents: 78000,
    features: [
      'Análise completa do histórico',
      'Remoção de registros SERASA/SPC',
      'Acompanhamento em tempo real',
      'Bônus: Regularização de Score',
    ],
  },
  'limpa-nome-pj': {
    id: 'limpa-nome-pj',
    name: 'Limpa Nome CNPJ',
    description: 'Regularize seu CNPJ e limpe restrições nos bureaus de crédito',
    icon: Building2,
    gradient: 'from-emerald-500 to-green-600',
    serviceType: 'pj',
    flowType: 'checkout',
    priceCents: 97000,
    features: [
      'Análise completa do histórico',
      'Remoção de registros SERASA/SPC',
      'Acompanhamento em tempo real',
      'Bônus: Regularização de Score',
    ],
  },
  'analise-fiscal': {
    id: 'analise-fiscal',
    name: 'Análise Fiscal',
    description: 'Recuperação de créditos tributários com taxa de sucesso',
    icon: Scale,
    gradient: 'from-blue-500 to-indigo-600',
    flowType: 'request',
    requestTable: 'fiscal_analysis_requests',
    priceCents: 0,
    features: [
      'Análise 100% gratuita',
      'Identificação de oportunidades',
      'Relatório completo auditável',
      'Pague apenas no êxito (50%)',
    ],
    successFee: true,
  },
  'bi-contabilidade': {
    id: 'bi-contabilidade',
    name: 'BI+ Contabilidade',
    description: 'Inteligência financeira completa para sua empresa',
    icon: Brain,
    gradient: 'from-purple-500 to-pink-600',
    flowType: 'request',
    requestTable: 'bi_requests',
    priceCents: 0,
    features: [
      'Dashboard em tempo real',
      'IA + Análise humana',
      'Insights automáticos',
      'Suporte especializado',
    ],
    successFee: false,
  },
};

interface ServiceCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceKey: string;
  onSuccess?: () => void;
}

export const ServiceCheckoutModal: React.FC<ServiceCheckoutModalProps> = ({
  isOpen,
  onClose,
  serviceKey,
  onSuccess,
}) => {
  const { user, session, subscription, profile } = useAuth();
  const navigate = useNavigate();
  const config = SERVICE_CONFIGS[serviceKey];
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(true);
  const [lastClickTime, setLastClickTime] = useState(0);

  if (!config) return null;

  const Icon = config.icon;
  const isSubscriber = subscription?.subscribed || false;

  let displayPrice = config.priceCents;
  if (isSubscriber && config.priceCents > 0) {
    const discountKey = serviceKey.startsWith('limpa-nome') 
      ? (serviceKey === 'limpa-nome-pf' ? 'credit_repair_pf' : 'credit_repair_pj')
      : null;
    if (discountKey && SUBSCRIBER_DISCOUNTS[discountKey]) {
      displayPrice = SUBSCRIBER_DISCOUNTS[discountKey].discountedPrice;
    }
  }

  const handleAction = async () => {
    const now = Date.now();
    if (now - lastClickTime < 2000) return;
    setLastClickTime(now);
    if (isLoading) return;

    if (!user || !session) {
      toast.error('Você precisa estar logado para continuar.');
      navigate('/auth?redirect=' + encodeURIComponent(window.location.pathname));
      onClose();
      return;
    }

    if (!user.email) {
      toast.error('Email não encontrado. Por favor, complete seu cadastro.');
      return;
    }

    if (config.flowType === 'checkout') {
      // Show embedded Mercado Pago checkout
      setShowCheckout(true);
    } else {
      // Request flow (Fiscal / BI)
      setIsLoading(true);
      try {
        const tableName = config.requestTable!;
        const { error } = await supabase
          .from(tableName as any)
          .insert({
            user_id: user.id,
            full_name: profile?.full_name || 'Cliente',
            email: user.email,
            phone: profile?.phone || '',
            status: 'pending',
            payment_status: config.successFee ? 'success_fee' : 'pending_analysis',
          })
          .select()
          .single();

        if (error) throw error;

        toast.success('Solicitação enviada! Redirecionando para o chat...');
        onSuccess?.();
        onClose();
        const chatTab = config.id === 'analise-fiscal' ? 'chat-fiscal' : 'chat-bi';
        navigate(`/empresa?tab=${chatTab}`);
      } catch (error: any) {
        console.error('Service action error:', error);
        toast.error(error.message || 'Erro ao processar. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleMPSuccess = (paymentId: number) => {
    onSuccess?.();
    setShowCheckout(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden max-h-[90vh] md:max-h-[85vh] overflow-y-auto w-[95vw] sm:w-full mx-auto">
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
            {config.successFee ? (
              <>
                <span className="text-2xl font-bold">GRÁTIS</span>
                <span className="text-white/70 text-sm">análise + 50% no êxito</span>
              </>
            ) : config.priceCents === 0 ? (
              <>
                <span className="text-2xl font-bold">Sob Consulta</span>
                <span className="text-white/70 text-sm">fale com especialista</span>
              </>
            ) : (
              <>
                <span className="text-4xl font-bold">{formatPrice(displayPrice)}</span>
                <span className="text-white/70 text-sm">pagamento único</span>
              </>
            )}
          </div>

          {isSubscriber && config.priceCents > 0 && displayPrice < config.priceCents && (
            <Badge className="mt-3 bg-white/20 text-white border-white/30">
              10% OFF para assinantes
            </Badge>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Embedded Mercado Pago Checkout */}
          {showCheckout && config.flowType === 'checkout' && user?.email ? (
            <MPTransparentCheckout
              amountCents={displayPrice}
              serviceName={config.name}
              serviceType={config.serviceType || config.id}
              description={config.description}
              payerEmail={user.email}
              payerName={profile?.full_name || 'Cliente'}
              accessToken={session?.access_token}
              metadata={{
                service_key: serviceKey,
              }}
              onSuccess={handleMPSuccess}
              onError={(err) => console.error('MP error:', err)}
            />
          ) : (
            <>
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
                onClick={handleAction}
                disabled={isLoading}
                size="lg"
                className={`w-full h-14 text-lg font-semibold bg-gradient-to-r ${config.gradient} hover:opacity-90 shadow-lg transition-all group`}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : config.flowType === 'checkout' ? (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Pagar agora
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Solicitar e ir para Chat
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </>
          )}

          {/* Security */}
          <div className="flex items-center justify-center text-xs text-muted-foreground gap-2">
            <Lock className="h-3 w-3" />
            {config.flowType === 'checkout' ? 'Pagamento seguro via Mercado Pago' : 'Dados protegidos'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceCheckoutModal;
