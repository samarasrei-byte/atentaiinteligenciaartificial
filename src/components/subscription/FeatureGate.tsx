import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InPanelUpgradeModal } from './InPanelUpgradeModal';
import { PlanType } from '@/lib/stripe';

interface FeatureGateProps {
  children: React.ReactNode;
  /** Name of the feature shown in the locked overlay */
  featureName: string;
  /** Optional description */
  featureDescription?: string;
  /** Minimum plan required (defaults to 'simulator') */
  requiredPlan?: PlanType;
}

/**
 * Wraps a feature section. If the user has no active subscription,
 * renders a visually appealing lock overlay with upgrade CTA instead
 * of the actual content.
 */
export function FeatureGate({
  children,
  featureName,
  featureDescription,
  requiredPlan = 'simulator',
}: FeatureGateProps) {
  const { subscription } = useAuth();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const isSubscribed = subscription?.subscribed && subscription?.plan !== null;

  if (isSubscribed) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="space-y-6">
        <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="relative mb-6">
              <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20">
                <Lock className="h-10 w-10 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 p-1.5 rounded-full bg-accent">
                <Crown className="h-4 w-4 text-white" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-2">
              {featureName}
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
              {featureDescription ||
                `Este recurso está disponível para assinantes. Assine um plano para desbloquear ${featureName.toLowerCase()} e muito mais.`}
            </p>

            <Button
              size="lg"
              className="gap-2 px-8"
              onClick={() => setUpgradeModalOpen(true)}
            >
              <Sparkles className="h-5 w-5" />
              Assinar para Desbloquear
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              A partir de R$ 39,99/mês • Cancele quando quiser
            </p>
          </CardContent>
        </Card>
      </div>

      <InPanelUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        upgradeType="subscription"
        planType={requiredPlan}
        onSuccess={() => setUpgradeModalOpen(false)}
      />
    </>
  );
}
