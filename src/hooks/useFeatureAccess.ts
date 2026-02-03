import { useAuth } from '@/contexts/AuthContext';
import { PlanType } from '@/lib/stripe';

type Feature = 
  | 'simulator'
  | 'ai-chat'
  | 'ai-chat-unlimited'
  | 'pdf-export'
  | 'excel-export'
  | 'locacao-simulator'
  | 'regime-comparator'
  | 'timeline-2026-2033'
  | 'pf-pj-calculator'
  | 'glossary'
  | 'tax-autopilot'
  | 'transition-simulator'
  | 'company-edit'
  | 'subscriber-discounts';

// ============================================================
// SERVIÇOS GRATUITOS - Acessíveis a TODOS os usuários autenticados
// Estes serviços são do marketplace e não requerem assinatura
// ============================================================
type FreeService = 
  | 'limpa-nome'        // Pago por transação (R$780) - Chat com Guilherme
  | 'analise-fiscal'    // Grátis (Success Fee 50%) - Chat com Guilherme  
  | 'bi-contabilidade'; // Sob consulta - Chat com César

// Serviços gratuitos disponíveis para todos os usuários autenticados
const FREE_SERVICES: FreeService[] = [
  'limpa-nome',
  'analise-fiscal', 
  'bi-contabilidade',
];

// Feature access matrix by plan - aligned with STRIPE_PLANS features
const featuresByPlan: Record<PlanType, Feature[]> = {
  simulator: [
    'simulator',
    'pdf-export',
    'timeline-2026-2033',
  ],
  autonomo: [
    'simulator',
    'ai-chat',
    'ai-chat-unlimited',
    'pdf-export',
    'regime-comparator',
    'pf-pj-calculator',
    'timeline-2026-2033',
  ],
  premium: [
    'simulator',
    'ai-chat',
    'ai-chat-unlimited',
    'pdf-export',
    'excel-export',
    'regime-comparator',
    'timeline-2026-2033',
    'locacao-simulator',
    'pf-pj-calculator',
    'glossary',
    'tax-autopilot',
  ],
  contador: [
    'simulator',
    'ai-chat',
    'ai-chat-unlimited',
    'pdf-export',
    'excel-export',
    'regime-comparator',
    'timeline-2026-2033',
    'locacao-simulator',
    'pf-pj-calculator',
    'glossary',
    'tax-autopilot',
    'transition-simulator',
    'company-edit',
    'subscriber-discounts',
  ],
};

// Plan hierarchy for comparison
const planHierarchy: Record<PlanType, number> = {
  simulator: 1,
  autonomo: 2,
  premium: 3,
  contador: 4,
};

export function useFeatureAccess() {
  const { subscription, user } = useAuth();

  /**
   * Check if user has access to a PAID feature (requires subscription)
   */
  const hasFeature = (feature: Feature): boolean => {
    if (!user || !subscription.subscribed || !subscription.plan) {
      return false;
    }
    return featuresByPlan[subscription.plan]?.includes(feature) ?? false;
  };

  /**
   * Check if user has access to a FREE service (marketplace services)
   * These are available to ALL authenticated users regardless of subscription
   */
  const hasFreeService = (service: FreeService): boolean => {
    if (!user) return false;
    return FREE_SERVICES.includes(service);
  };

  const hasPlan = (minPlan: PlanType): boolean => {
    if (!user || !subscription.subscribed || !subscription.plan) {
      return false;
    }
    return planHierarchy[subscription.plan] >= planHierarchy[minPlan];
  };

  const getRequiredPlan = (feature: Feature): PlanType | null => {
    for (const plan of ['simulator', 'autonomo', 'premium', 'contador'] as PlanType[]) {
      if (featuresByPlan[plan].includes(feature)) {
        return plan;
      }
    }
    return null;
  };

  const isSubscribed = subscription.subscribed && subscription.plan !== null;

  return {
    hasFeature,
    hasFreeService,
    hasPlan,
    getRequiredPlan,
    isSubscribed,
    currentPlan: subscription.plan,
    subscriptionEnd: subscription.subscriptionEnd,
    // Export for external use
    freeServices: FREE_SERVICES,
  };
}
