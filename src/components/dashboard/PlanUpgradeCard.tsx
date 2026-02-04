import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Lock,
  Target,
  TrendingUp,
  Zap,
  Phone
} from 'lucide-react';
import { STRIPE_PLANS, formatPrice, PlanType } from '@/lib/stripe';
import { InPanelUpgradeModal } from '@/components/subscription/InPanelUpgradeModal';

const planOrder: PlanType[] = ['clarity', 'control', 'performance'];

const planIcons: Record<PlanType, React.ElementType> = {
  clarity: Target,
  control: TrendingUp,
  performance: Crown,
};

const planColors: Record<PlanType, string> = {
  clarity: 'from-blue-500 to-cyan-500',
  control: 'from-primary to-primary/70',
  performance: 'from-accent to-orange-500',
};

const upgradeReasons: Record<PlanType, string[]> = {
  clarity: [],
  control: [
    'Real x Orçado e forecast',
    'Alertas inteligentes e simulações',
    'IA analítica orientada à ação',
    'Apoio a decisões táticas',
  ],
  performance: [
    'P&L por área, produto ou unidade',
    'IA como apoio estratégico sênior',
    'Integração com ERP e CRM',
    'Planejamento financeiro completo',
  ],
};

export function PlanUpgradeCard() {
  const { subscription } = useAuth();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  
  const currentPlanIndex = subscription.plan 
    ? planOrder.indexOf(subscription.plan as PlanType) 
    : -1;
  
  const nextPlan = currentPlanIndex >= 0 && currentPlanIndex < planOrder.length - 1 
    ? planOrder[currentPlanIndex + 1] 
    : null;

  const handleUpgradeClick = (plan: PlanType) => {
    // Performance is custom pricing
    if (plan === 'performance') {
      window.open('https://wa.me/5511999999999?text=Olá! Tenho interesse no plano Atentai Performance.', '_blank');
      return;
    }
    setSelectedPlan(plan);
    setUpgradeModalOpen(true);
  };

  // If user has the highest plan, show appreciation message
  if (!nextPlan || subscription.plan === 'performance') {
    return (
      <Card className="bg-gradient-to-br from-accent/10 to-orange-500/10 border-accent/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
              <Crown className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Plano Performance Ativo</h3>
              <p className="text-sm text-muted-foreground">
                Você tem acesso a todas as funcionalidades do Atentai!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const nextPlanData = STRIPE_PLANS[nextPlan];
  const NextPlanIcon = planIcons[nextPlan];
  const reasons = upgradeReasons[nextPlan];
  const isCustomPricing = 'customPricing' in nextPlanData && nextPlanData.customPricing;

  return (
    <>
      <Card className="overflow-hidden border-primary/20 hover:border-primary/40 transition-colors">
        <div className={`h-2 bg-gradient-to-r ${planColors[nextPlan]}`} />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Evolua seu plano
            </CardTitle>
            <Badge variant="outline" className="text-primary border-primary/30">
              <Sparkles className="h-3 w-3 mr-1" />
              Recomendado
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${planColors[nextPlan]}`}>
              <NextPlanIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground">{nextPlanData.name}</h4>
              <p className="text-sm text-muted-foreground">{nextPlanData.description}</p>
            </div>
            <div className="text-right">
              {isCustomPricing ? (
                <p className="font-bold text-foreground text-sm">Sob Consulta</p>
              ) : (
                <>
                  <p className="font-bold text-foreground">{formatPrice(nextPlanData.price)}</p>
                  <p className="text-xs text-muted-foreground">/mês</p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">O que você ganha:</p>
            <ul className="space-y-2">
              {reasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Seu plano atual</span>
              <span>Plano completo</span>
            </div>
            <Progress value={((currentPlanIndex + 1) / planOrder.length) * 100} className="h-2" />
            <div className="flex justify-between">
              {planOrder.map((plan, index) => {
                const Icon = planIcons[plan];
                const isActive = index <= currentPlanIndex;
                const isCurrent = index === currentPlanIndex;
                return (
                  <div 
                    key={plan} 
                    className={`flex flex-col items-center gap-1 ${
                      isActive ? 'text-primary' : 'text-muted-foreground/50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isCurrent 
                        ? 'bg-primary text-primary-foreground' 
                        : isActive 
                          ? 'bg-primary/20' 
                          : 'bg-muted'
                    }`}>
                      {isActive ? (
                        <Icon className="h-3 w-3" />
                      ) : (
                        <Lock className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Button 
            onClick={() => handleUpgradeClick(nextPlan)} 
            className={`w-full bg-gradient-to-r ${planColors[nextPlan]} hover:opacity-90`}
          >
            {isCustomPricing ? (
              <>
                <Phone className="h-4 w-4 mr-2" />
                Falar com Especialista
              </>
            ) : (
              <>
                Fazer upgrade para {nextPlanData.name}
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      <InPanelUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        upgradeType="subscription"
        planType={selectedPlan || undefined}
        onSuccess={() => setUpgradeModalOpen(false)}
      />
    </>
  );
}
