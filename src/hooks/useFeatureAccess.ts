import { useAuth } from '@/contexts/AuthContext';
import { PlanType, AI_LIMITS } from '@/lib/stripe';

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
  | 'subscriber-discounts'
  | 'bi-dashboard'
  | 'forecast'
  | 'alerts'
  | 'erp-integration';

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

// Feature access matrix by plan - Atentai Commercial Model
const featuresByPlan: Record<PlanType, Feature[]> = {
  clarity: [
    'simulator',
    'ai-chat',
    'pdf-export',
    'timeline-2026-2033',
    'bi-dashboard',
    'glossary',
  ],
  control: [
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
    'bi-dashboard',
    'forecast',
    'alerts',
  ],
  performance: [
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
    'bi-dashboard',
    'forecast',
    'alerts',
    'erp-integration',
  ],
};

// Plan hierarchy for comparison
const planHierarchy: Record<PlanType, number> = {
  clarity: 1,
  control: 2,
  performance: 3,
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
    const plan = subscription.plan as PlanType;
    return featuresByPlan[plan]?.includes(feature) ?? false;
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
    const currentPlan = subscription.plan as PlanType;
    return planHierarchy[currentPlan] >= planHierarchy[minPlan];
  };

  const getRequiredPlan = (feature: Feature): PlanType | null => {
    for (const plan of ['clarity', 'control', 'performance'] as PlanType[]) {
      if (featuresByPlan[plan].includes(feature)) {
        return plan;
      }
    }
    return null;
  };

  const isSubscribed = subscription.subscribed && subscription.plan !== null;
  
  // Get AI limits based on plan
  const getAILimits = () => {
    if (!subscription.plan) return { dailyQuestions: 0, mode: 'educational' as const };
    const plan = subscription.plan as PlanType;
    return AI_LIMITS[plan] || AI_LIMITS.clarity;
  };

  return {
    hasFeature,
    hasFreeService,
    hasPlan,
    getRequiredPlan,
    isSubscribed,
    currentPlan: subscription.plan as PlanType | null,
    subscriptionEnd: subscription.subscriptionEnd,
    getAILimits,
    // Export for external use
    freeServices: FREE_SERVICES,
  };
}
