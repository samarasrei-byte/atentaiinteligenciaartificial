import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { STRIPE_PLANS, formatPrice } from '@/lib/stripe';
import { 
  ArrowLeft, 
  Building2, 
  Briefcase, 
  Calculator,
  Check,
  Brain,
  TrendingUp,
  FileText,
  MessageSquare,
  Shield,
  Zap,
  Star,
  Crown,
  Users,
  PiggyBank,
  Scale,
  Clock,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ProfileType = 'empresa' | 'autonomo' | 'contador';

interface ProfilePlan {
  planKey: 'simulator' | 'premium' | 'contador';
  recommended: boolean;
  benefits: string[];
  useCase: string;
}

interface ProfileData {
  type: ProfileType;
  label: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  description: string;
  headline: string;
  plans: ProfilePlan[];
}

const profilesData: ProfileData[] = [
  {
    type: 'empresa',
    label: 'Empresa',
    icon: Building2,
    color: 'text-blue-500',
    bgGradient: 'from-blue-500/20 to-cyan-500/20',
    description: 'Soluções para empresas de todos os portes',
    headline: 'Prepare sua empresa para a Reforma Tributária',
    plans: [
      {
        planKey: 'simulator',
        recommended: false,
        useCase: 'Ideal para empresas que querem entender o impacto inicial',
        benefits: [
          'Simule o impacto da reforma nos seus impostos',
          'Visualize a timeline de transição 2026-2033',
          'Exporte relatórios em PDF para reuniões',
          'Comparativo antes/depois da reforma'
        ]
      },
      {
        planKey: 'premium',
        recommended: true,
        useCase: 'Perfeito para planejamento estratégico completo',
        benefits: [
          'IA especializada para tirar todas suas dúvidas',
          'Comparador de regimes (Simples vs Presumido vs Real)',
          'Piloto automático tributário com alertas',
          'Simulador de locação e exportação Excel',
          'Acesso a todas as ferramentas avançadas'
        ]
      },
      {
        planKey: 'contador',
        recommended: false,
        useCase: 'Para empresas que precisam de suporte especializado',
        benefits: [
          'Contador especializado disponível para consultas',
          '2 consultas mensais incluídas',
          'Análise tributária personalizada do seu caso',
          'Chat direto com contador',
          'Suporte prioritário 24h'
        ]
      }
    ]
  },
  {
    type: 'autonomo',
    label: 'Autônomo',
    icon: Briefcase,
    color: 'text-purple-500',
    bgGradient: 'from-purple-500/20 to-pink-500/20',
    description: 'Para profissionais liberais e prestadores de serviço',
    headline: 'Descubra a melhor estrutura para você: PF ou PJ?',
    plans: [
      {
        planKey: 'simulator',
        recommended: false,
        useCase: 'Para entender se vale a pena abrir PJ',
        benefits: [
          'Simulação rápida de impostos como PF vs PJ',
          'Entenda o impacto da reforma no seu bolso',
          'Relatório em PDF para consultar depois',
          'Sem compromisso, cancele quando quiser'
        ]
      },
      {
        planKey: 'premium',
        recommended: true,
        useCase: 'Para quem quer maximizar seus ganhos',
        benefits: [
          'Calculadora PF vs PJ completa',
          'Descubra se MEI, ME ou Simples é melhor',
          'IA para tirar dúvidas sobre sua situação',
          'Alerta de limite do MEI antes de estourar',
          'Acompanhamento automático de otimizações'
        ]
      },
      {
        planKey: 'contador',
        recommended: false,
        useCase: 'Para quem quer abrir empresa com segurança',
        benefits: [
          'Orientação personalizada para abrir empresa',
          'Contador disponível para tirar dúvidas',
          'Análise do melhor regime tributário',
          'Suporte para toda a documentação',
          'Acompanhamento da abertura'
        ]
      }
    ]
  },
  {
    type: 'contador',
    label: 'Contador',
    icon: Calculator,
    color: 'text-teal-500',
    bgGradient: 'from-teal-500/20 to-emerald-500/20',
    description: 'Ferramentas para atender seus clientes',
    headline: 'Atenda mais clientes com ferramentas inteligentes',
    plans: [
      {
        planKey: 'simulator',
        recommended: false,
        useCase: 'Para demonstrar o impacto aos clientes',
        benefits: [
          'Mostre simulações de impacto para clientes',
          'Gere relatórios profissionais em PDF',
          'Ferramenta de apoio para reuniões',
          'Comparativos visuais antes/depois'
        ]
      },
      {
        planKey: 'premium',
        recommended: true,
        useCase: 'Para oferecer consultoria completa',
        benefits: [
          'IA para responder dúvidas complexas',
          'Todas as ferramentas de simulação',
          'Comparador de regimes para cada cliente',
          'Relatórios Excel para análises detalhadas',
          'Piloto automático para monitorar clientes'
        ]
      },
      {
        planKey: 'contador',
        recommended: false,
        useCase: 'Para atender clientes na plataforma',
        benefits: [
          'Receba consultas de clientes da plataforma',
          'Chat integrado para comunicação',
          'Gerencie sua agenda de consultas',
          'Ganhe por cada consulta realizada',
          'Dashboard de métricas e ganhos'
        ]
      }
    ]
  }
];

const getPlanIcon = (planKey: string) => {
  switch (planKey) {
    case 'simulator': return <Calculator className="h-5 w-5" />;
    case 'premium': return <Brain className="h-5 w-5" />;
    case 'contador': return <Crown className="h-5 w-5" />;
    default: return <Zap className="h-5 w-5" />;
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

const PlanosPorPerfil = () => {
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState<ProfileType>('empresa');

  const currentProfile = profilesData.find(p => p.type === selectedProfile)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-foreground hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            <img src="/logo-atentai.png" alt="AtentAI" className="h-8" />
            
            <Button
              variant="outline"
              onClick={() => navigate('/planos')}
              className="border-primary text-primary hover:bg-primary/10"
            >
              Comparar Todos
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Title */}
        <div className="text-center mb-8">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
            Planos por Perfil
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Encontre o plano ideal para você
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Selecione seu perfil para ver as recomendações personalizadas
          </p>
        </div>

        {/* Profile Tabs */}
        <Tabs value={selectedProfile} onValueChange={(v) => setSelectedProfile(v as ProfileType)} className="w-full">
          <TabsList className="grid grid-cols-3 max-w-md mx-auto mb-8 h-auto p-1">
            {profilesData.map((profile) => {
              const Icon = profile.icon;
              return (
                <TabsTrigger 
                  key={profile.type} 
                  value={profile.type}
                  className={cn(
                    "flex flex-col items-center gap-1 py-3 data-[state=active]:bg-background",
                    profile.color
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{profile.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {profilesData.map((profile) => (
            <TabsContent key={profile.type} value={profile.type} className="mt-0">
              {/* Profile Header */}
              <div className={cn(
                "rounded-2xl p-6 md:p-8 mb-8 bg-gradient-to-br",
                profile.bgGradient
              )}>
                <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center bg-background/80",
                    profile.color
                  )}>
                    <profile.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">
                      {profile.headline}
                    </h2>
                    <p className="text-muted-foreground">
                      {profile.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {profile.plans.map((planItem) => {
                  const plan = STRIPE_PLANS[planItem.planKey];
                  
                  return (
                    <Card 
                      key={planItem.planKey}
                      className={cn(
                        "relative overflow-hidden transition-all hover:shadow-lg",
                        planItem.recommended && "ring-2 ring-primary"
                      )}
                    >
                      {planItem.recommended && (
                        <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1.5 text-xs font-medium">
                          <Star className="h-3 w-3 inline mr-1" />
                          Recomendado para você
                        </div>
                      )}
                      
                      <CardHeader className={cn("text-center", planItem.recommended && "pt-10")}>
                        <div className={cn(
                          "w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-gradient-to-br text-white",
                          getPlanColor(planItem.planKey)
                        )}>
                          {getPlanIcon(planItem.planKey)}
                        </div>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {planItem.useCase}
                        </CardDescription>
                        <div className="mt-3">
                          <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                          <span className="text-muted-foreground">/mês</span>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <ul className="space-y-3">
                          {planItem.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className={cn(
                                "h-4 w-4 mt-0.5 flex-shrink-0",
                                planItem.recommended ? "text-primary" : "text-muted-foreground"
                              )} />
                              <span className="text-sm text-foreground">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <Button 
                          className={cn(
                            "w-full mt-6",
                            planItem.recommended 
                              ? "bg-primary hover:bg-primary/90" 
                              : "bg-muted text-foreground hover:bg-muted/80"
                          )}
                          onClick={() => navigate('/auth')}
                        >
                          {planItem.recommended ? 'Começar Agora' : 'Selecionar Plano'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* CTA Section */}
              <div className="mt-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Ainda não tem certeza? Compare todos os recursos em detalhes
                </p>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/planos')}
                >
                  Ver Comparativo Completo
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default PlanosPorPerfil;
