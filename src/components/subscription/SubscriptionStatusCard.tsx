import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  BarChart3, 
  TrendingUp, 
  Crown, 
  ArrowRight, 
  MessageSquare,
  Sparkles,
  Calendar,
  Shield
} from 'lucide-react';
import { BI_PLANS, PLANS, BIPlanType, PlanType } from '@/lib/plans';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SubscriptionStatusCardProps {
  showUpgrade?: boolean;
  compact?: boolean;
}

export function SubscriptionStatusCard({ showUpgrade = true, compact = false }: SubscriptionStatusCardProps) {
  const { subscription } = useAuth();
  const navigate = useNavigate();

  // Determine if it's a BI plan or platform plan
  const currentPlanKey = subscription.plan;
  const isBIPlan = currentPlanKey && (currentPlanKey as string) in BI_PLANS;
  const isPlatformPlan = currentPlanKey && currentPlanKey in PLANS;

  // Get current BI plan if applicable
  const currentBIPlanKey = isBIPlan ? (currentPlanKey as BIPlanType) : null;
  const currentBIPlan = currentBIPlanKey ? BI_PLANS[currentBIPlanKey] : null;

  // Plan configurations for display
  const biPlanConfigs: Record<BIPlanType, {
    icon: typeof BarChart3;
    gradient: string;
    bgColor: string;
    benefits: string[];
    limitations: string[];
  }> = {
    clarity: {
      icon: BarChart3,
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      benefits: [
        'BI padrão com DRE gerencial',
        'Resultado, margem e despesas',
        'IA explicativa e educativa',
        'Supervisão humana obrigatória',
        'Relatórios mensais em PDF',
      ],
      limitations: [
        'Sem forecast e projeções',
        'Sem alertas inteligentes',
        'Sem integração ERP/CRM',
      ],
    },
    control: {
      icon: TrendingUp,
      gradient: 'from-primary to-primary/70',
      bgColor: 'bg-primary/5',
      benefits: [
        'Tudo do Clarity incluído',
        'Real x Orçado e forecast',
        'Indicadores personalizados',
        'Alertas inteligentes',
        'Simulações de cenários',
        'IA analítica e orientada à ação',
      ],
      limitations: [
        'Sem P&L por área/produto',
        'Sem integração ERP/CRM',
      ],
    },
    performance: {
      icon: Crown,
      gradient: 'from-accent to-orange-500',
      bgColor: 'bg-accent/5',
      benefits: [
        'Tudo do Control incluído',
        'P&L por área, produto ou unidade',
        'IA como apoio estratégico sênior',
        'Recomendações financeiras e comerciais',
        'Integração ERP e CRM',
        'Planejamento financeiro completo',
        'Linguagem executiva e estratégica',
      ],
      limitations: [],
    },
  };

  // If no BI subscription, show CTA
  if (!subscription.subscribed || !currentBIPlanKey || !currentBIPlan) {
    return (
      <Card className="border-dashed border-2">
        <CardHeader className="text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-3 text-primary" />
          <CardTitle>Nenhum plano BI ativo</CardTitle>
          <CardDescription>
            Assine um plano Atentai para desbloquear o BI completo
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => navigate('/bi-contabilidade')} className="gap-2">
            Ver Planos Atentai
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const config = biPlanConfigs[currentBIPlanKey];
  const Icon = config.icon;

  // Determine upgrade options
  const upgradeOptions: BIPlanType[] = [];
  if (currentBIPlanKey === 'clarity') {
    upgradeOptions.push('control', 'performance');
  } else if (currentBIPlanKey === 'control') {
    upgradeOptions.push('performance');
  }

  if (compact) {
    return (
      <Card className={`${config.bgColor} border-none`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${config.gradient}`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{currentBIPlan.name}</p>
                <p className="text-xs text-muted-foreground">Plano ativo</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/dashboard/bi')}
              >
                Abrir BI
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/chat/especialista')}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${config.bgColor}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${config.gradient} shadow-lg`}>
              <Icon className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{currentBIPlan.name}</CardTitle>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Check className="h-3 w-3 mr-1" />
                  Ativo
                </Badge>
              </div>
              <CardDescription className="mt-1">
                {currentBIPlan.description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Subscription Details */}
        {subscription.subscriptionEnd && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Próxima renovação: {format(new Date(subscription.subscriptionEnd), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
        )}

        {/* Benefits */}
        <div>
          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Benefícios do seu plano
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {config.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Limitations */}
        {config.limitations.length > 0 && (
          <div>
            <h4 className="font-medium text-muted-foreground mb-3">Limitações</h4>
            <ul className="space-y-2">
              {config.limitations.map((limitation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <X className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{limitation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <Button onClick={() => navigate('/dashboard/bi')} className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Abrir BI
          </Button>
          <Button variant="outline" onClick={() => navigate('/chat/especialista')} className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Falar com Especialista
          </Button>
        </div>

        {/* Upgrade Options */}
        {showUpgrade && upgradeOptions.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Quer mais funcionalidades? Faça upgrade:
            </p>
            <div className="flex flex-wrap gap-2">
              {upgradeOptions.map((planKey) => {
                const upgradePlan = BI_PLANS[planKey];
                return (
                  <Button
                    key={planKey}
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/chat/especialista?upgrade=${planKey}`)}
                    className="gap-2"
                  >
                    <Sparkles className="h-3 w-3" />
                    Upgrade para {upgradePlan.name}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
