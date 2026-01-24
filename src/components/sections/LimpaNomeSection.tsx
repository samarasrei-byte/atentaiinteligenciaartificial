import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  CheckCircle, 
  Sparkles,
  ArrowRight,
  Star,
  TrendingDown,
  Clock,
  FileCheck,
  Award,
  Users,
  Zap,
  Building2,
  User,
  Briefcase,
  Heart,
  Handshake
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAuth } from "@/contexts/AuthContext";
import { PartnerConnectionOnboarding } from "@/components/limpa-nome/PartnerConnectionOnboarding";

const bureaus = [
  { name: 'SPC', color: 'bg-blue-500' },
  { name: 'Serasa', color: 'bg-red-500' },
  { name: 'SCPC', color: 'bg-green-500' },
  { name: 'Boa Vista', color: 'bg-purple-500' },
  { name: 'Quod', color: 'bg-amber-500' },
  { name: 'Cenprot', color: 'bg-cyan-500' },
  { name: 'Registrato', color: 'bg-indigo-500' },
  { name: 'CADIN', color: 'bg-pink-500' },
];

const benefits = [
  { icon: Users, title: 'Análise Humana Real', desc: 'Seu caso será analisado por especialistas reais, não por robôs' },
  { icon: Handshake, title: 'Parceiros Especializados', desc: 'Conexão com profissionais confiáveis e experientes' },
  { icon: Shield, title: 'Serviço 100% Jurídico', desc: 'Liminar coletiva para exclusão permanente dos apontamentos' },
  { icon: Award, title: '🎁 Bônus: Aumento de Score', desc: 'Regularização do score inclusa para quem limpar o nome!' },
];

const includedPF = [
  'Análise personalizada por especialista humano',
  'Liminar coletiva para exclusão permanente',
  'Antecipação do prazo prescricional',
  'Exclusão em SPC, Serasa, SCPC, Boa Vista e mais',
  'Processo 100% jurídico e documentado',
  'Acompanhamento por 90 dias',
  'Suporte prioritário via WhatsApp',
  '🎁 Bônus: Regularização de Score inclusa!',
];

const includedPJ = [
  'Análise personalizada por especialista humano',
  'Liminar coletiva para exclusão permanente',
  'Antecipação do prazo prescricional',
  'Exclusão em SPC, Serasa, SCPC, Boa Vista e mais',
  'Análise de protestos empresariais',
  'Orientação CADIN/PGFN',
  'Processo 100% jurídico e documentado',
  'Acompanhamento por 90 dias',
  '🎁 Bônus: Regularização de Score inclusa!',
];

type PlanType = 'pf' | 'pj';

const plans = {
  pf: {
    id: 'pf',
    name: 'Pessoa Física',
    description: 'Liminar coletiva para CPF',
    basePrice: 680,
    icon: User,
    iconColor: 'text-blue-500',
    bgColor: 'from-blue-500/20 to-blue-600/20',
    borderColor: 'border-blue-500/30',
    included: includedPF,
  },
  pj: {
    id: 'pj',
    name: 'Empresa (CNPJ)',
    description: 'Liminar coletiva para CNPJ',
    basePrice: 890,
    icon: Building2,
    iconColor: 'text-emerald-500',
    bgColor: 'from-emerald-500/20 to-emerald-600/20',
    borderColor: 'border-emerald-500/30',
    popular: true,
    included: includedPJ,
  }
};

export function LimpaNomeSection() {
  const { subscription } = useAuth();
  const isSubscribed = subscription.subscribed;
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.1 });
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('pf');
  const [showOnboarding, setShowOnboarding] = useState(false);

  const currentPlan = plans[selectedPlan];
  const discountPercent = 10;
  const basePrice = currentPlan.basePrice;
  const discountedPrice = isSubscribed ? Math.round(basePrice * (1 - discountPercent / 100)) : basePrice;
  const installmentPrice = Math.round(discountedPrice / 4);

  const formatPrice = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <>
      <section 
        ref={ref} 
        className="py-20 md:py-32 relative overflow-hidden"
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-primary/5" />
        
        {/* Animated Orbs */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Header - New Human-Focused Messaging */}
          <div className="text-center mb-12">
            <Badge className="mb-6 bg-rose-500/20 text-rose-600 border-rose-500/30 px-6 py-2">
              <Heart className="h-4 w-4 mr-2" />
              ATENDIMENTO HUMANO • PARCEIROS ESPECIALIZADOS
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-foreground">Limpe seu nome com</span>
              <span className="block mt-2 bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                análise humana e parceiros especializados
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Seu caso será analisado por <strong className="text-foreground">especialistas reais</strong>, 
              em parceria com profissionais confiáveis.
              <span className="block mt-2">Nada de robôs ou decisões automáticas.</span>
            </p>
            
            {/* Plan Selection Cards */}
            <div className="flex flex-wrap justify-center gap-6 mt-10 max-w-2xl mx-auto">
              {Object.values(plans).map((plan) => {
                const PlanIcon = plan.icon;
                const planPrice = isSubscribed ? Math.round(plan.basePrice * 0.9) : plan.basePrice;
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id as PlanType)}
                    className={`
                      relative flex-1 min-w-[200px] p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer text-left
                      bg-gradient-to-br ${plan.bgColor} ${plan.borderColor}
                      ${selectedPlan === plan.id ? 'ring-2 ring-rose-500 ring-offset-2 ring-offset-background scale-105 shadow-xl' : ''}
                      hover:scale-105 hover:shadow-lg
                    `}
                  >
                    {'popular' in plan && plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-500 text-white border-0 text-xs">
                        Mais Solicitado
                      </Badge>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <PlanIcon className={`h-6 w-6 ${plan.iconColor}`} />
                      <span className="font-bold text-foreground">{plan.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                    <div className="text-2xl font-bold text-foreground">
                      R$ {formatPrice(planPrice)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ou 4x de R$ {formatPrice(planPrice / 4)}
                    </p>
                    {selectedPlan === plan.id && (
                      <CheckCircle className="absolute top-4 right-4 h-6 w-6 text-rose-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {isSubscribed && (
              <Badge className="mt-6 bg-green-500/20 text-green-600 border-green-500/30 px-4 py-2">
                <TrendingDown className="h-4 w-4 mr-2" />
                10% de desconto exclusivo aplicado!
              </Badge>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Content - Benefits */}
            <div className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}>
              {/* Bureaus Tags */}
              <div className="flex flex-wrap gap-3 mb-8">
                <p className="w-full text-sm text-muted-foreground mb-2">Limpamos seu nome em:</p>
                {bureaus.map((bureau, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="px-4 py-2 text-sm font-medium border-2 bg-background"
                  >
                    <div className={`w-2 h-2 rounded-full ${bureau.color} mr-2`} />
                    {bureau.name}
                  </Badge>
                ))}
              </div>

              {/* Benefits Grid */}
              <div className="grid gap-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:border-rose-500/30 transition-colors"
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 shrink-0">
                      <benefit.icon className="h-6 w-6 text-rose-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-muted/50 border border-border">
                <div className="text-center">
                  <p className="text-3xl font-bold text-rose-500">500+</p>
                  <p className="text-xs text-muted-foreground">Clientes Atendidos</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-rose-500">98%</p>
                  <p className="text-xs text-muted-foreground">Taxa de Sucesso</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-rose-500">30</p>
                  <p className="text-xs text-muted-foreground">Dias em Média</p>
                </div>
              </div>
            </div>

            {/* Right Card - Pricing */}
            <div 
              id="limpa-nome-price-card"
              className={`transition-all duration-700 delay-200 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`}
            >
              <Card className="relative overflow-hidden border-2 border-rose-500/30 shadow-2xl">
                {/* Decorative Top */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500" />
                
                {/* Plan Badge */}
                <div className="absolute top-4 right-4">
                  <Badge className={`${selectedPlan === 'pj' ? 'bg-emerald-500' : 'bg-blue-500'} text-white border-0`}>
                    {selectedPlan === 'pj' && <Award className="h-3 w-3 mr-1" />}
                    {currentPlan.name}
                  </Badge>
                </div>
                
                <CardContent className="p-8 pt-10">
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">
                      4.9/5 • Avaliação dos clientes
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-2">Investimento único - {currentPlan.name}</p>
                    <div className="flex items-baseline gap-3">
                      {isSubscribed && (
                        <span className="text-2xl text-muted-foreground line-through">
                          R$ {formatPrice(basePrice)}
                        </span>
                      )}
                      <span className="text-5xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                        R$ {formatPrice(discountedPrice)}
                      </span>
                    </div>
                    <p className="text-lg text-foreground font-semibold mt-2">
                      ou <span className="text-rose-500">4x de R$ {formatPrice(installmentPrice)}</span> sem juros
                    </p>
                    {isSubscribed ? (
                      <Badge className="mt-2 bg-green-500/10 text-green-600 border-green-500/30">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        10% de desconto aplicado
                      </Badge>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">
                        ou até <span className="font-semibold text-foreground">12x de R$ {formatPrice(Math.round(discountedPrice / 12))}</span>
                      </p>
                    )}
                  </div>

                  {/* What's Included */}
                  <div className="space-y-3 mb-8">
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      <Zap className="h-4 w-4 text-rose-500" />
                      Tudo que está incluso:
                    </p>
                    <div className="grid gap-2">
                      {currentPlan.included.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA - New Human-Focused Button */}
                  <Button 
                    size="lg"
                    onClick={() => setShowOnboarding(true)}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 glow-accent group"
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Limpar meu nome agora
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  {/* Microcopy - Very Important */}
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Você será direcionado para o onboarding de conexão com um parceiro especializado.
                  </p>

                  {/* Human Analysis Info */}
                  <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Handshake className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">Atendimento 100% Humano</p>
                        <p className="text-xs text-muted-foreground">Análise feita por pessoas reais</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Seu caso será analisado por especialistas em parceria com profissionais confiáveis. 
                      Nada é automático – você receberá atenção personalizada.
                    </p>
                  </div>

                  {/* Trust Badge */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-green-500" />
                        Pagamento seguro
                      </div>
                      <div className="w-1 h-1 rounded-full bg-border" />
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-blue-500" />
                        Parceiros Verificados
                      </div>
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-3">
                      🔒 Garantia de resultado ou seu dinheiro de volta
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Connection Onboarding Modal */}
      <PartnerConnectionOnboarding 
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        selectedPlan={selectedPlan}
      />
    </>
  );
}
