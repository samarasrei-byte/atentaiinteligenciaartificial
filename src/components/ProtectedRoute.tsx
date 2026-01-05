import { useAuth } from '@/contexts/AuthContext';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { PlanType, STRIPE_PLANS } from '@/lib/stripe';
import { Navigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPlan?: PlanType;
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requiredPlan,
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, loading, isQAMode, qaFlags } = useAuth();
  const { hasPlan, currentPlan } = useFeatureAccess();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // QA Mode: bypass paywall if enabled
  if (isQAMode && qaFlags.BYPASS_PAYWALL && requiredPlan) {
    return <>{children}</>;
  }

  // Check plan access
  if (requiredPlan && !hasPlan(requiredPlan)) {
    const plan = STRIPE_PLANS[requiredPlan];
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Funcionalidade Premium</CardTitle>
            <CardDescription>
              Esta funcionalidade requer o plano {plan.name} ou superior.
              {currentPlan && (
                <span className="block mt-2 text-muted-foreground">
                  Seu plano atual: <strong className="text-foreground">{STRIPE_PLANS[currentPlan].name}</strong>
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="font-medium text-sm mb-2">Recursos incluídos no {plan.name}:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {plan.features.slice(0, 4).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link to="/pricing">
                  Fazer Upgrade
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/dashboard">Voltar ao Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
