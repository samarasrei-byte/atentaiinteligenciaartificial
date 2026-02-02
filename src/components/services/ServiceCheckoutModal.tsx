import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

function openCheckoutPopupOrFallback(url: string) {
  // Most popup blockers allow a window opened synchronously during the click.
  // So we open a blank window first, then navigate it.
  const w = window.open('', '_blank');
  if (!w) {
    // Fallback: same-tab redirect (always works)
    window.location.assign(url);
    return;
  }
  try {
    w.opener = null;
  } catch {
    // ignore
  }
  w.location.href = url;
}

interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  /** 'pf' | 'pj' for limpa-nome; null for others */
  serviceType?: 'pf' | 'pj';
  /** 'checkout' | 'request' */
  flowType: 'checkout' | 'request';
  /** Edge function for checkout */
  edgeFunction?: string;
  /** DB table for request */
  requestTable?: string;
  /** Price in cents (0 if success fee) */
  priceCents: number;
  features: string[];
  successFee?: boolean;
}

const SERVICE_CONFIGS: Record<string, ServiceConfig> = {
  'limpa-nome-pf': {
    id: 'limpa-nome-pf',
    name: 'Limpa Nome Pessoa Física',
    description: 'Regularize seu CPF e limpe restrições nos bureaus de crédito',
    icon: Shield,
    gradient: 'from-emerald-500 to-green-600',
    serviceType: 'pf',
    flowType: 'checkout',
    edgeFunction: 'create-limpa-nome-checkout',
    priceCents: 28000, // R$ 280,00 FIXED
    features: [
      'Análise completa do histórico',
      'Remoção de registros SERASA/SPC',
      'Acompanhamento em tempo real',
      'Bônus: Regularização de Score',
    ],
  },
  'limpa-nome-pj': {
    id: 'limpa-nome-pj',
    name: 'Limpa Nome Empresa (CNPJ)',
    description: 'Regularize seu CNPJ e limpe restrições nos bureaus de crédito',
    icon: Building2,
    gradient: 'from-emerald-500 to-green-600',
    serviceType: 'pj',
    flowType: 'checkout',
    edgeFunction: 'create-limpa-nome-checkout',
    priceCents: 28000, // R$ 280,00 FIXED
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
  serviceKey: string; // 'limpa-nome-pf' | 'limpa-nome-pj' | 'analise-fiscal' | 'bi-contabilidade'
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
  const [isLoading, setIsLoading] = useState(false);

  const config = SERVICE_CONFIGS[serviceKey];
  if (!config) return null;

  const Icon = config.icon;
  const isSubscriber = subscription?.subscribed || false;

  // Calculate price with potential discount
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
    if (!user || !session) {
      toast.error('Você precisa estar logado para continuar.');
      return;
    }

    // Open popup immediately to avoid blockers (only for checkout flow)
    let pendingPopup: Window | null = null;
    if (config.flowType === 'checkout') {
      pendingPopup = window.open('', '_blank');
    }

    setIsLoading(true);

    try {
      if (config.flowType === 'checkout') {
        // Limpa Nome checkout
        const { data, error } = await supabase.functions.invoke(config.edgeFunction!, {
          body: { 
            serviceType: config.serviceType,
            email: user.email,
            fullName: profile?.full_name || 'Cliente',
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) throw error;

        if (data?.url) {
          if (pendingPopup) {
            try {
              pendingPopup.opener = null;
            } catch {
              // ignore
            }
            pendingPopup.location.href = data.url;
          } else {
            openCheckoutPopupOrFallback(data.url);
          }
          toast.info('Janela de pagamento aberta. Complete o pagamento para ativar.');
          onSuccess?.();
          onClose();
        } else {
          throw new Error('URL de checkout não retornada');
        }
      } else {
        // Create request without checkout (Fiscal / BI)
        const tableName = config.requestTable!;
        
        // Generic request insert
        const { data: request, error } = await supabase
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

        // Redirect to chat
        const chatTab = config.id === 'analise-fiscal' ? 'chat-fiscal' : 'chat-bi';
        navigate(`/empresa?tab=${chatTab}`);
      }
    } catch (error: any) {
      console.error('Service action error:', error);
      toast.error(error.message || 'Erro ao processar. Tente novamente.');
      if (pendingPopup) {
        try {
          pendingPopup.close();
        } catch {
          // ignore
        }
      }
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

          {/* Discount badge */}
          {isSubscriber && config.priceCents > 0 && displayPrice < config.priceCents && (
            <Badge className="mt-3 bg-white/20 text-white border-white/30">
              10% OFF para assinantes
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

          {/* Security */}
          <div className="flex items-center justify-center text-xs text-muted-foreground gap-2">
            <Lock className="h-3 w-3" />
            {config.flowType === 'checkout' ? 'Pagamento seguro via Stripe' : 'Dados protegidos'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceCheckoutModal;
