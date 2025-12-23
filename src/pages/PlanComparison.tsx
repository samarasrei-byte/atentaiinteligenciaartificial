import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STRIPE_PLANS, formatPrice } from '@/lib/stripe';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Check, 
  X, 
  ArrowLeft, 
  Calculator, 
  Brain, 
  UserCheck, 
  FileText, 
  Clock,
  TrendingUp,
  MessageSquare,
  Shield,
  Zap,
  Star,
  Crown,
  Loader2
} from 'lucide-react';

interface Feature {
  name: string;
  description: string;
  simulator: boolean | string;
  premium: boolean | string;
  contador: boolean | string;
  category: 'core' | 'ai' | 'tools' | 'support' | 'contador';
}

const features: Feature[] = [
  // Core Features
  { name: 'Simulador de Impacto Tributário', description: 'Calcule impostos antes e depois da reforma', simulator: true, premium: true, contador: true, category: 'core' },
  { name: 'Comparativo Antes/Depois', description: 'Visualize as diferenças na carga tributária', simulator: true, premium: true, contador: true, category: 'core' },
  { name: 'Timeline da Transição 2026-2033', description: 'Acompanhe a evolução das alíquotas', simulator: true, premium: true, contador: true, category: 'core' },
  { name: 'Relatório em PDF', description: 'Exporte análises completas', simulator: true, premium: true, contador: true, category: 'core' },
  { name: 'Relatório em Excel', description: 'Dados estruturados para análise', simulator: false, premium: true, contador: true, category: 'core' },
  
  // AI Features
  { name: 'Agente de IA', description: 'Perguntas ilimitadas sobre a reforma', simulator: false, premium: 'Ilimitado', contador: 'Ilimitado', category: 'ai' },
  { name: 'Base LC 214/2025', description: 'Conhecimento atualizado da legislação', simulator: false, premium: true, contador: true, category: 'ai' },
  { name: 'Análise Personalizada', description: 'Respostas contextualizadas para seu negócio', simulator: false, premium: true, contador: true, category: 'ai' },
  
  // Tools
  { name: 'Comparador de Regimes Fiscais', description: 'Simples vs Presumido vs Real', simulator: false, premium: true, contador: true, category: 'tools' },
  { name: 'Calculadora PF vs PJ', description: 'Qual estrutura é melhor para você', simulator: false, premium: true, contador: true, category: 'tools' },
  { name: 'Simulador de Locação', description: 'Impacto tributário em imóveis', simulator: false, premium: true, contador: true, category: 'tools' },
  { name: 'Glossário Tributário', description: 'Termos e conceitos explicados', simulator: false, premium: true, contador: true, category: 'tools' },
  { name: 'Piloto Automático Tributário', description: 'Monitoramento contínuo de oportunidades', simulator: false, premium: true, contador: true, category: 'tools' },
  
  // Support
  { name: 'Suporte por Email', description: 'Resposta em até 48h', simulator: true, premium: true, contador: true, category: 'support' },
  { name: 'Suporte Prioritário', description: 'Resposta em até 4h', simulator: false, premium: false, contador: true, category: 'support' },
  { name: 'Suporte 24h', description: 'Atendimento a qualquer hora', simulator: false, premium: false, contador: true, category: 'support' },
  
  // Contador
  { name: 'Chat com Contador', description: 'Comunicação direta com especialista', simulator: false, premium: false, contador: 'Ilimitado', category: 'contador' },
  { name: 'Consultas Mensais', description: 'Reuniões com contador especializado', simulator: false, premium: false, contador: '2/mês', category: 'contador' },
  { name: 'Agendamento Prioritário', description: 'Horários preferenciais', simulator: false, premium: false, contador: true, category: 'contador' },
  { name: 'Análise Tributária Personalizada', description: 'Estudo específico do seu caso', simulator: false, premium: false, contador: true, category: 'contador' },
  { name: 'Edição de Dados da Empresa', description: 'Atualize informações a qualquer momento', simulator: false, premium: false, contador: true, category: 'contador' },
];

const categoryLabels: Record<string, { label: string; icon: typeof Calculator }> = {
  core: { label: 'Recursos Essenciais', icon: Calculator },
  ai: { label: 'Inteligência Artificial', icon: Brain },
  tools: { label: 'Ferramentas Avançadas', icon: TrendingUp },
  support: { label: 'Suporte', icon: MessageSquare },
  contador: { label: 'Contador Especializado', icon: UserCheck },
};

const PlanComparison = () => {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);

  const handleSubscribe = async (planKey: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (subscription.subscribed && subscription.plan === planKey) {
      toast({
        title: 'Plano atual',
        description: 'Você já está inscrito neste plano.',
      });
      return;
    }

    setLoadingPlan(planKey);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: STRIPE_PLANS[planKey as keyof typeof STRIPE_PLANS].priceId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível iniciar o checkout.',
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const renderFeatureValue = (value: boolean | string, planKey: string) => {
    if (typeof value === 'string') {
      return (
        <span className="font-semibold text-primary">{value}</span>
      );
    }
    
    if (value) {
      return (
        <Check className={`h-5 w-5 ${planKey === 'contador' ? 'text-amber-500' : planKey === 'premium' ? 'text-primary' : 'text-success'}`} />
      );
    }
    
    return <X className="h-5 w-5 text-muted-foreground/50" />;
  };

  const getPlanIcon = (planKey: string) => {
    switch (planKey) {
      case 'simulator': return <Calculator className="h-6 w-6" />;
      case 'premium': return <Brain className="h-6 w-6" />;
      case 'contador': return <Crown className="h-6 w-6" />;
      default: return <Zap className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planKey: string) => {
    switch (planKey) {
      case 'simulator': return 'from-blue-500 to-cyan-500';
      case 'premium': return 'from-teal-500 to-emerald-500';
      case 'contador': return 'from-amber-500 to-orange-500';
      default: return 'from-primary to-primary';
    }
  };

  const categories = ['core', 'ai', 'tools', 'support', 'contador'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            <img src="/logo-atentai.png" alt="AtentAI" className="h-8" />
            
            <Button
              variant="outline"
              onClick={() => navigate('/pricing')}
              className="border-teal-500 text-teal-400 hover:bg-teal-500/10"
            >
              Ver Preços
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 mb-4">
            Comparativo Completo
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Compare os Planos em Detalhes
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Escolha o plano ideal para suas necessidades com a Lei Complementar 214/2025
          </p>
        </div>

        {/* Plan Headers (Sticky) */}
        <div className="sticky top-[73px] z-40 bg-slate-900/95 backdrop-blur-xl rounded-t-2xl border border-slate-700 border-b-0 py-6 px-4 md:px-8">
          <div className="grid grid-cols-4 gap-4">
            <div className="flex items-center">
              <span className="text-sm font-medium text-muted-foreground">Recursos</span>
            </div>
            
            {(['simulator', 'premium', 'contador'] as const).map((planKey) => {
              const plan = STRIPE_PLANS[planKey];
              const isCurrentPlan = subscription.subscribed && subscription.plan === planKey;
              
              return (
                <div key={planKey} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${getPlanColor(planKey)} mb-3`}>
                    {getPlanIcon(planKey)}
                  </div>
                  <h3 className="font-bold text-white text-sm md:text-base">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mt-1">
                    <span className="text-xl md:text-2xl font-bold text-white">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-xs text-white/60">/mês</span>
                  </div>
                  {isCurrentPlan && (
                    <Badge className="mt-2 bg-success/20 text-success border-success/30">
                      Seu Plano
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Table */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-b-2xl border border-slate-700 border-t-0 overflow-hidden">
          {categories.map((category) => {
            const categoryInfo = categoryLabels[category];
            const categoryFeatures = features.filter(f => f.category === category);
            const CategoryIcon = categoryInfo.icon;
            
            return (
              <div key={category}>
                {/* Category Header */}
                <div className="bg-slate-700/30 px-4 md:px-8 py-4 border-t border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <CategoryIcon className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-semibold text-white">{categoryInfo.label}</h4>
                  </div>
                </div>
                
                {/* Features */}
                {categoryFeatures.map((feature, idx) => (
                  <div
                    key={feature.name}
                    className={`grid grid-cols-4 gap-4 px-4 md:px-8 py-4 ${
                      idx < categoryFeatures.length - 1 ? 'border-b border-slate-700/50' : ''
                    } hover:bg-slate-700/20 transition-colors`}
                  >
                    <div>
                      <p className="font-medium text-white text-sm">{feature.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 hidden md:block">
                        {feature.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      {renderFeatureValue(feature.simulator, 'simulator')}
                    </div>
                    
                    <div className="flex items-center justify-center">
                      {renderFeatureValue(feature.premium, 'premium')}
                    </div>
                    
                    <div className="flex items-center justify-center">
                      {renderFeatureValue(feature.contador, 'contador')}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* CTA Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {(['simulator', 'premium', 'contador'] as const).map((planKey) => {
            const plan = STRIPE_PLANS[planKey];
            const isCurrentPlan = subscription.subscribed && subscription.plan === planKey;
            const isLoading = loadingPlan === planKey;
            
            return (
              <Card key={planKey} className={`bg-slate-800/50 border-slate-700 ${
                planKey === 'premium' ? 'ring-2 ring-teal-500/50' : ''
              } ${planKey === 'contador' ? 'ring-2 ring-amber-500/50' : ''}`}>
                <CardHeader className="text-center pb-2">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${getPlanColor(planKey)} mx-auto mb-3`}>
                    {getPlanIcon(planKey)}
                  </div>
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-white/60">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">{formatPrice(plan.price)}</span>
                    <span className="text-white/60">/mês</span>
                  </div>
                  
                  <Button
                    onClick={() => handleSubscribe(planKey)}
                    disabled={isCurrentPlan || isLoading}
                    className={`w-full ${
                      isCurrentPlan
                        ? 'bg-slate-600'
                        : planKey === 'premium'
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600'
                        : planKey === 'contador'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {isCurrentPlan ? 'Plano Atual' : 'Assinar Agora'}
                  </Button>
                  
                  {planKey === 'premium' && !isCurrentPlan && (
                    <p className="text-xs text-teal-400 mt-2">Mais Popular</p>
                  )}
                  {planKey === 'contador' && !isCurrentPlan && (
                    <p className="text-xs text-amber-400 mt-2">Melhor Valor</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Dúvidas Frequentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-white mb-2">Posso trocar de plano depois?</h3>
                <p className="text-sm text-white/60">
                  Sim! Você pode fazer upgrade ou downgrade a qualquer momento. A diferença será calculada proporcionalmente.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-white mb-2">O pagamento é seguro?</h3>
                <p className="text-sm text-white/60">
                  100% seguro. Utilizamos a Stripe, líder mundial em pagamentos online, com criptografia de ponta.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-white mb-2">Posso cancelar quando quiser?</h3>
                <p className="text-sm text-white/60">
                  Sim, sem multas ou taxas. Você mantém o acesso até o fim do período pago.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-white mb-2">As consultas não usadas acumulam?</h3>
                <p className="text-sm text-white/60">
                  As consultas mensais são renovadas a cada ciclo de faturamento e não acumulam.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanComparison;
