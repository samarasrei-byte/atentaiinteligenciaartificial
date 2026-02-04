import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Zap, 
  Building2, 
  Briefcase, 
  Plus,
  Users,
  TrendingUp,
  CheckCircle,
  Star
} from 'lucide-react';
import { STRIPE_PLANS, formatPrice } from '@/lib/stripe';

interface PlanCardProps {
  name: string;
  price: number;
  description: string;
  features: readonly string[];
  icon: React.ElementType;
  gradient: string;
  isPopular?: boolean;
  isHighlight?: boolean;
  priceId: string;
  productId: string;
}

const PlanCard: React.FC<PlanCardProps> = ({
  name,
  price,
  description,
  features,
  icon: Icon,
  gradient,
  isPopular,
  isHighlight,
  priceId,
  productId,
}) => {
  return (
    <Card className={`relative overflow-hidden ${isHighlight ? 'border-primary shadow-lg' : 'border-border'}`}>
      {isPopular && (
        <div className="absolute top-0 right-0">
          <Badge className="rounded-none rounded-bl-lg bg-primary">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-lg">{name}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <span className="text-3xl font-bold">{formatPrice(price)}</span>
          <span className="text-muted-foreground">/mês</span>
        </div>
        
        <ul className="space-y-2">
          {features.slice(0, 4).map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
          {features.length > 4 && (
            <li className="text-xs text-muted-foreground">
              +{features.length - 4} mais recursos
            </li>
          )}
        </ul>
        
        <div className="pt-3 border-t space-y-2">
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Price ID:</strong> {priceId}</p>
            <p><strong>Product ID:</strong> {productId}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  mrr: number;
  churnRate: number;
}

interface AdminSubscriptionsPanelProps {
  subscriptions?: any[];
  stats?: SubscriptionStats;
}

export const AdminSubscriptionsPanel: React.FC<AdminSubscriptionsPanelProps> = ({
  subscriptions = [],
  stats = {
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    mrr: 0,
    churnRate: 0,
  },
}) => {
  const currentPlans = [
    {
      ...STRIPE_PLANS.clarity,
      icon: Zap,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      ...STRIPE_PLANS.control,
      icon: Crown,
      gradient: 'from-primary to-primary/70',
    },
    {
      ...STRIPE_PLANS.performance,
      icon: Building2,
      gradient: 'from-accent to-orange-500',
    },
  ];

  const suggestedPlans = [
    {
      name: 'Enterprise',
      description: 'Para grandes escritórios e redes',
      price: 49900,
      features: [
        'Tudo do Business Pro',
        'White Label completo',
        'API ilimitada',
        'Suporte dedicado 24/7',
        'SLA garantido',
      ],
      icon: Building2,
      gradient: 'from-slate-600 to-slate-800',
    },
    {
      name: 'API Only',
      description: 'Integração com ERPs e sistemas',
      price: 29900,
      features: [
        'Acesso completo à API',
        'Webhooks ilimitados',
        'Documentação técnica',
        'Suporte técnico dedicado',
      ],
      icon: Zap,
      gradient: 'from-indigo-500 to-violet-600',
    },
    {
      name: 'Parceiro Global',
      description: 'Para redes de distribuição',
      price: 99900,
      features: [
        'Multi-tenant',
        'Comissionamento automático',
        'Dashboard de parceiros',
        'Treinamento incluso',
      ],
      icon: Users,
      gradient: 'from-rose-500 to-red-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSubscriptions}</p>
                <p className="text-xs text-muted-foreground">Total Assinantes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatPrice(stats.mrr)}</p>
                <p className="text-xs text-muted-foreground">MRR</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 border-rose-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20">
                <TrendingUp className="h-5 w-5 text-rose-500 rotate-180" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.churnRate}%</p>
                <p className="text-xs text-muted-foreground">Churn Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Plans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Planos Atuais</h3>
            <p className="text-sm text-muted-foreground">Planos disponíveis na plataforma</p>
          </div>
          <Badge variant="outline" className="text-primary border-primary">
            {currentPlans.length} planos
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentPlans.map((plan) => (
            <PlanCard
              key={plan.priceId}
              name={plan.name}
              price={plan.price}
              description={plan.description}
              features={plan.features}
              icon={plan.icon}
              gradient={plan.gradient}
              isPopular={'popular' in plan ? (plan as any).popular : false}
              isHighlight={'highlight' in plan ? (plan as any).highlight : false}
              priceId={plan.priceId}
              productId={plan.productId}
            />
          ))}
        </div>
      </div>

      {/* Suggested New Plans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Sugestões de Novos Planos</h3>
            <p className="text-sm text-muted-foreground">Planos que podem ser adicionados para crescimento</p>
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Criar Novo Plano
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestedPlans.map((plan) => (
            <Card key={plan.name} className="relative overflow-hidden border-dashed border-2 opacity-80 hover:opacity-100 transition-opacity">
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-xs">Sugestão</Badge>
              </div>
              
              <CardHeader className="pb-2">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-2`}>
                  <plan.icon className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-base">{plan.name}</CardTitle>
                <CardDescription className="text-xs">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div>
                  <span className="text-2xl font-bold">{formatPrice(plan.price)}</span>
                  <span className="text-muted-foreground text-sm">/mês</span>
                </div>
                
                <ul className="space-y-1">
                  {plan.features.slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button variant="outline" size="sm" className="w-full mt-2 gap-2">
                  <Plus className="h-3 w-3" />
                  Criar Este Plano
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Subscriptions */}
      {subscriptions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Assinaturas Recentes</h3>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {subscriptions.slice(0, 10).map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">Plano {sub.plan_type}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(sub.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(sub.price_cents)}</p>
                      <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                        {sub.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptionsPanel;
