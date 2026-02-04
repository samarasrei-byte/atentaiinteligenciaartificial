import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Crown, 
  ArrowRight, 
  MessageSquare,
  Sparkles,
  Check,
  Lock
} from 'lucide-react';
import { BI_PLANS, BIPlanType } from '@/lib/stripe';

interface BIAccessCardProps {
  variant?: 'full' | 'compact' | 'minimal';
}

/**
 * BIAccessCard - Shows BI access status and CTA for subscription
 * This component should be used in all user panels (Empresa, Autônomo, Afiliado)
 * to display BI access status and encourage subscription
 */
export function BIAccessCard({ variant = 'full' }: BIAccessCardProps) {
  const { subscription } = useAuth();
  const navigate = useNavigate();

  // Check if user has BI subscription
  const hasBIAccess = subscription.subscribed && subscription.plan && 
    ['clarity', 'control', 'performance'].includes(subscription.plan as string);
  
  const currentPlanKey = hasBIAccess ? (subscription.plan as BIPlanType) : null;
  const currentPlan = currentPlanKey ? BI_PLANS[currentPlanKey] : null;

  // Plan visual configurations
  const planStyles: Record<BIPlanType, { icon: typeof BarChart3; gradient: string; bgColor: string }> = {
    clarity: {
      icon: BarChart3,
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
    control: {
      icon: TrendingUp,
      gradient: 'from-primary to-primary/70',
      bgColor: 'bg-primary/5',
    },
    performance: {
      icon: Crown,
      gradient: 'from-accent to-orange-500',
      bgColor: 'bg-accent/5',
    },
  };

  // If user has BI access, show their plan status
  if (hasBIAccess && currentPlanKey && currentPlan) {
    const style = planStyles[currentPlanKey];
    const Icon = style.icon;

    if (variant === 'minimal') {
      return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${style.gradient}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{currentPlan.name}</p>
            <p className="text-xs text-muted-foreground">BI Ativo</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/bi')}>
            <BarChart3 className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    if (variant === 'compact') {
      return (
        <Card className={`${style.bgColor} border-none`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${style.gradient} shadow-md`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{currentPlan.name}</p>
                  <p className="text-xs text-muted-foreground">Plano ativo</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => navigate('/dashboard/bi')}>
                  Abrir BI
                </Button>
                <Button size="sm" variant="ghost" onClick={() => navigate('/chat/cesar')}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Full variant
    return (
      <Card className={`${style.bgColor}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${style.gradient} shadow-lg`}>
                <Icon className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">{currentPlan.name}</CardTitle>
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <Check className="h-3 w-3 mr-1" />
                    Ativo
                  </Badge>
                </div>
                <CardDescription className="mt-1">
                  {currentPlan.description}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate('/dashboard/bi')} className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Abrir BI
            </Button>
            <Button variant="outline" onClick={() => navigate('/chat/cesar')} className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Falar com César
            </Button>
          </div>
          
          {/* Upgrade suggestion for non-Performance plans */}
          {currentPlanKey !== 'performance' && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Quer mais funcionalidades?
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/chat/cesar?upgrade=true`)}
                className="gap-2"
              >
                <Sparkles className="h-3 w-3" />
                Solicitar Upgrade
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // No BI access - show CTA to subscribe
  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-dashed">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted">
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">BI+ Contabilidade</p>
          <p className="text-xs text-muted-foreground">Não ativo</p>
        </div>
        <Button size="sm" onClick={() => navigate('/bi-contabilidade')}>
          Ver Planos
        </Button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">BI+ Contabilidade</p>
                <p className="text-xs text-muted-foreground">Desbloqueie inteligência fiscal</p>
              </div>
            </div>
            <Button onClick={() => navigate('/bi-contabilidade')} className="gap-2">
              Ver Planos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full CTA variant
  return (
    <Card className="border-2 border-dashed bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-primary to-accent shadow-lg">
          <BarChart3 className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-xl">BI+ Contabilidade™</CardTitle>
        <CardDescription>
          Desbloqueie dashboards financeiros, IA analítica e supervisão humana
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-xl bg-background/80">
            <BarChart3 className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <p className="text-xs font-medium">Clarity</p>
            <p className="text-xs text-muted-foreground">R$ 1.497/mês</p>
          </div>
          <div className="p-3 rounded-xl bg-background/80 ring-2 ring-primary">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xs font-medium">Control</p>
            <p className="text-xs text-muted-foreground">R$ 3.497/mês</p>
          </div>
          <div className="p-3 rounded-xl bg-background/80">
            <Crown className="h-5 w-5 mx-auto mb-1 text-accent" />
            <p className="text-xs font-medium">Performance</p>
            <p className="text-xs text-muted-foreground">R$ 8.000+</p>
          </div>
        </div>
        
        <Button onClick={() => navigate('/bi-contabilidade')} className="w-full gap-2" size="lg">
          <Sparkles className="h-4 w-4" />
          Ver Planos e Assinar
          <ArrowRight className="h-4 w-4" />
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          Após contratação, você será direcionado ao César para onboarding
        </p>
      </CardContent>
    </Card>
  );
}
