import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  ArrowRight, 
  Crown, 
  Brain, 
  Calculator, 
  Users,
  User,
  Sparkles,
  Calendar,
  Mail,
  Loader2,
  PartyPopper
} from 'lucide-react';
import { STRIPE_PLANS, formatPrice, PlanType } from '@/lib/stripe';

const planIcons: Record<PlanType, React.ElementType> = {
  simulator: Calculator,
  autonomo: User,
  premium: Brain,
  contador: Users,
};

const planColors: Record<PlanType, string> = {
  simulator: 'from-blue-500 to-cyan-500',
  autonomo: 'from-emerald-500 to-teal-500',
  premium: 'from-primary to-primary/70',
  contador: 'from-accent to-orange-500',
};

const nextSteps: Record<PlanType, { icon: React.ElementType; title: string; description: string }[]> = {
  simulator: [
    { icon: Calculator, title: 'Acesse o Simulador', description: 'Simule o impacto tributário da sua empresa' },
    { icon: Calendar, title: 'Veja a Timeline', description: 'Acompanhe a transição 2026-2033' },
  ],
  autonomo: [
    { icon: Calculator, title: 'Simulador PF vs PJ', description: 'Compare regimes tributários' },
    { icon: Brain, title: 'Converse com a IA', description: 'Tire dúvidas sobre sua situação fiscal' },
    { icon: User, title: 'Complete seu Perfil', description: 'Configure suas informações profissionais' },
  ],
  premium: [
    { icon: Brain, title: 'Converse com a IA', description: 'Tire suas dúvidas sobre tributação' },
    { icon: Calculator, title: 'Use o Simulador', description: 'Compare cenários tributários' },
    { icon: Sparkles, title: 'Ative o Piloto Automático', description: 'Otimize sua estrutura fiscal automaticamente' },
  ],
  contador: [
    { icon: Users, title: 'Agende uma Consulta', description: 'Fale com um contador especializado' },
    { icon: Brain, title: 'Use a IA Ilimitada', description: 'Tire todas as suas dúvidas' },
    { icon: Sparkles, title: 'Configure Alertas', description: 'Receba notificações de oportunidades fiscais' },
    { icon: Mail, title: 'Suporte Prioritário', description: 'Atendimento em até 24h' },
  ],
};

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { subscription, checkSubscription, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const refreshSubscription = async () => {
      setIsLoading(true);
      await checkSubscription();
      setIsLoading(false);
    };
    
    // Refresh subscription status after payment
    refreshSubscription();
  }, [checkSubscription]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Confirmando seu pagamento...</p>
        </div>
      </div>
    );
  }

  const currentPlan = subscription.plan as PlanType | null;
  const planData = currentPlan ? STRIPE_PLANS[currentPlan] : null;
  const PlanIcon = currentPlan ? planIcons[currentPlan] : Crown;
  const steps = currentPlan ? nextSteps[currentPlan] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Confetti-like decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="absolute top-32 right-20 w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        <div className="absolute top-40 left-1/4 w-4 h-4 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        <div className="absolute top-28 right-1/3 w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }} />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl relative">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <PartyPopper className="h-6 w-6 text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Pagamento Confirmado!
            </h1>
            <PartyPopper className="h-6 w-6 text-accent scale-x-[-1]" />
          </div>
          <p className="text-muted-foreground text-lg">
            Bem-vindo ao {planData?.name || 'AtentAI'}! Seu acesso já está liberado.
          </p>
        </div>

        {/* Plan Summary Card */}
        <Card className="mb-8 overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${currentPlan ? planColors[currentPlan] : 'from-primary to-primary/70'}`} />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${currentPlan ? planColors[currentPlan] : 'from-primary to-primary/70'}`}>
                  <PlanIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>{planData?.name || 'Plano Ativo'}</CardTitle>
                  <CardDescription>{planData?.description}</CardDescription>
                </div>
              </div>
              <Badge className="bg-green-500">Ativo</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Valor mensal</p>
                <p className="text-xl font-bold text-foreground">
                  {planData ? formatPrice(planData.price) : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Próxima renovação</p>
                <p className="text-xl font-bold text-foreground">
                  {subscription.subscriptionEnd 
                    ? new Date(subscription.subscriptionEnd).toLocaleDateString('pt-BR')
                    : 'N/A'
                  }
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div>
              <p className="text-sm font-medium text-foreground mb-3">Funcionalidades incluídas:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {planData?.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Próximos Passos
            </CardTitle>
            <CardDescription>
              Aproveite ao máximo seu novo plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div 
                    key={index}
                    className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => navigate('/dashboard')}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <StepIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={() => navigate('/dashboard')}
            className="bg-primary hover:bg-primary/90"
          >
            Ir para o Dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate('/pricing')}
          >
            Ver todos os planos
          </Button>
        </div>

        {/* Email confirmation note */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          <Mail className="h-4 w-4 inline mr-1" />
          Um email de confirmação foi enviado para {user?.email}
        </p>
      </div>
    </div>
  );
}
