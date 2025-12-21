import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  ArrowLeft, 
  Check,
  Calculator,
  MessageSquare,
  Users,
  Crown,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const plans = [
  {
    id: 'simulator',
    name: 'Simulador',
    price: 30,
    description: 'Acesso ao simulador de impostos',
    features: [
      'Simulações ilimitadas',
      'Comparativo antes/depois',
      'Relatórios detalhados',
      'Histórico de simulações',
    ],
    icon: Calculator,
    color: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'ai',
    name: 'IA Tributária',
    price: 50,
    description: 'Chat com IA especializada',
    features: [
      'Chat ilimitado com IA',
      'Respostas personalizadas',
      'Base de conhecimento atualizada',
      'Histórico de conversas',
    ],
    icon: MessageSquare,
    color: 'from-teal-500 to-cyan-500',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99,
    description: 'Acesso completo à plataforma',
    features: [
      'Tudo do Simulador',
      'Tudo da IA Tributária',
      '1 consultoria grátis/mês',
      'Suporte prioritário',
      'Atualizações exclusivas',
    ],
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const handleSubscribe = (planId: string) => {
    if (!user) {
      toast({
        title: 'Faça login primeiro',
        description: 'Você precisa estar logado para assinar um plano',
      });
      navigate('/auth');
      return;
    }

    // For now, show a message that Stripe integration is coming
    toast({
      title: 'Em breve!',
      description: 'O sistema de pagamentos será integrado em breve com Stripe.',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(user ? '/dashboard' : '/')}
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-teal-400" />
            <span className="text-xl font-bold text-white">Planos AITENTO</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Escolha seu plano
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Desbloqueie o poder da IA e consultoria especializada para dominar a Reforma Tributária
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative bg-slate-800/50 border-slate-700 hover:border-slate-500 transition-all ${
                plan.popular ? 'ring-2 ring-teal-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500">
                  Mais Popular
                </Badge>
              )}
              <CardHeader className="text-center pt-8">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mx-auto mb-4`}>
                  <plan.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                <CardDescription className="text-slate-400">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <span className="text-4xl font-bold text-white">R$ {plan.price}</span>
                  <span className="text-slate-400">/mês</span>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-slate-300">
                      <Check className="h-5 w-5 text-teal-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90`}
                >
                  Assinar Agora
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Consultation Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <CardTitle className="text-2xl text-white">Consultoria com Contador</CardTitle>
              <CardDescription className="text-slate-400">
                Precisa de ajuda especializada? Agende uma sessão com um contador certificado
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div>
                <span className="text-4xl font-bold text-white">R$ 150</span>
                <span className="text-slate-400">/sessão</span>
              </div>
              <p className="text-sm text-slate-400">
                10% do valor vai para a plataforma, 90% para o contador
              </p>
              <Button
                onClick={() => navigate('/contadores')}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90"
              >
                Ver Contadores Disponíveis
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
