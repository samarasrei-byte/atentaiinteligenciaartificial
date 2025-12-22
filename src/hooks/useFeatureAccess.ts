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
  | 'contador-consultation'
  | 'custom-reports'
  | 'api-integration'
  | 'multiple-companies';

// Feature access matrix by plan
const featuresByPlan: Record<PlanType, Feature[]> = {
  simulator: [
    'simulator',
    'pdf-export',
  ],
  premium: [
    'simulator',
    'ai-chat',
    'ai-chat-unlimited',
    'pdf-export',
    'excel-export',
    'locacao-simulator',
    'regime-comparator',
    'timeline-2026-2033',
  ],
};

// Plan hierarchy for comparison
const planHierarchy: Record<PlanType, number> = {
  simulator: 1,
  premium: 2,
};

export function useFeatureAccess() {
  const { subscription, user } = useAuth();

  const hasFeature = (feature: Feature): boolean => {
    if (!user || !subscription.subscribed || !subscription.plan) {
      return false;
    }
    return featuresByPlan[subscription.plan]?.includes(feature) ?? false;
  };

  const hasPlan = (minPlan: PlanType): boolean => {
    if (!user || !subscription.subscribed || !subscription.plan) {
      return false;
    }
    return planHierarchy[subscription.plan] >= planHierarchy[minPlan];
  };

  const getRequiredPlan = (feature: Feature): PlanType | null => {
    for (const plan of ['simulator', 'premium'] as PlanType[]) {
      if (featuresByPlan[plan].includes(feature)) {
        return plan;
      }
    }
    return null;
  };

  const isSubscribed = subscription.subscribed && subscription.plan !== null;

  return {
    hasFeature,
    hasPlan,
    getRequiredPlan,
    isSubscribed,
    currentPlan: subscription.plan,
    subscriptionEnd: subscription.subscriptionEnd,
  };
}
