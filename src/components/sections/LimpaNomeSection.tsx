import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useMPCheckout } from "@/contexts/MPCheckoutContext";

const bureaus = [
  { name: 'SPC', color: 'bg-cyan-500' },
  { name: 'Serasa', color: 'bg-rose-500' },
  { name: 'SCPC', color: 'bg-emerald-500' },
  { name: 'Boa Vista', color: 'bg-violet-500' },
  { name: 'Quod', color: 'bg-amber-500' },
  { name: 'Cenprot', color: 'bg-cyan-400' },
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
    name: 'Para CPF negativado',
    shortName: 'Pessoa Física',
    description: 'Regularização de restrições com análise humana especializada.',
    basePrice: 824.50,
    originalPrice: 1238,
    icon: User,
    iconColor: 'text-cyan-400',
    gradientFrom: 'from-cyan-500',
    gradientTo: 'to-blue-600',
    included: includedPF,
    benefits: [
      'Análise individual por especialista',
      'Estratégia personalizada',
      'Acompanhamento humano',
    ],
    cta: 'Iniciar análise agora',
    microcopy: 'Atendimento humano • Parceria séria',
  },
  pj: {
    id: 'pj',
    name: 'Para empresas (CNPJ)',
    shortName: 'Empresa (CNPJ)',
    description: 'Regularização cadastral com análise fiscal e jurídica especializada.',
    basePrice: 1280,
    originalPrice: 1568,
    icon: Building2,
    iconColor: 'text-emerald-400',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-teal-600',
    popular: true,
    included: includedPJ,
    benefits: [
      'Avaliação completa do CNPJ',
      'Estratégia adequada ao porte',
      'Atendimento humano especializado',
    ],
    cta: 'Quero regularizar meu CNPJ',
    microcopy: 'Especialistas reais • Atendimento responsável',
  }
};

export function LimpaNomeSection() {
  const navigate = useNavigate();
  const { subscription, user } = useAuth();
  const { openCheckout } = useMPCheckout();
  const isSubscribed = subscription.subscribed;
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.1 });
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('pf');

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
        className="py-20 md:py-32 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      >
        {/* Animated Background Orbs */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-violet-500/10 rounded-full blur-[100px]" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Header - New Human-Focused Messaging */}
          <div className="text-center mb-12">
            <Badge className="mb-6 bg-gradient-to-r from-pink-900/95 to-rose-900/95 backdrop-blur-sm text-white font-bold border-2 border-pink-400 px-6 py-3 shadow-xl shadow-pink-500/30 text-sm tracking-wide">
              <Heart className="h-5 w-5 mr-2 text-pink-300 animate-pulse" />
              <span className="drop-shadow-[0_0_3px_rgba(236,72,153,0.8)]">ATENDIMENTO HUMANO • PARCEIROS ESPECIALIZADOS</span>
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-white">Limpe seu nome com</span>
              <span className="block mt-2 bg-gradient-to-r from-rose-400 via-pink-500 to-violet-500 bg-clip-text text-transparent">
                análise humana e parceiros especializados
              </span>
            </h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto">
              Seu caso será analisado por <strong className="text-white">especialistas reais</strong>, 
              em parceria com profissionais confiáveis.
              <span className="block mt-2">Nada de robôs ou decisões automáticas.</span>
            </p>
            
            {/* Premium Plan Selection Cards - Dark Theme */}
            <div className="flex flex-col lg:flex-row justify-center gap-6 mt-12 max-w-4xl mx-auto px-4">
              {Object.values(plans).map((plan) => {
                const PlanIcon = plan.icon;
                const planPrice = isSubscribed ? Math.round(plan.basePrice * 0.9) : plan.basePrice;
                const isSelected = selectedPlan === plan.id;
                const isPJ = plan.id === 'pj';
                
                const handleCardClick = () => {
                  setSelectedPlan(plan.id as PlanType);
                  // Scroll to price card on mobile for better UX
                  if (window.innerWidth < 1024) {
                    setTimeout(() => {
                      document.getElementById('limpa-nome-price-card')?.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                      });
                    }, 100);
                  }
                };

                const handleCTAClick = (e: React.MouseEvent) => {
                  e.stopPropagation();

                  openCheckout({
                    amountCents: planPrice * 100,
                    serviceName: `Limpa Nome ${plan.id === 'pf' ? 'CPF' : 'CNPJ'}`,
                    serviceType: `credit_repair_${plan.id}`,
                    description: plan.description,
                    gradient: `${plan.gradientFrom} ${plan.gradientTo}`,
                    metadata: { service_key: `credit_repair_${plan.id}` },
                    allowedMethods: ['pix', 'card'],
                    isRecurring: false,
                    requireGuestInfo: !user, // Show guest form if not logged in
                    onSuccess: () => navigate('/painel'),
                  });
                };
                
                return (
                  <button
                    key={plan.id}
                    onClick={handleCardClick}
                    className={`
                      group relative flex-1 min-w-[300px] p-8 rounded-3xl transition-all duration-500 cursor-pointer text-left
                      bg-white/5 backdrop-blur-sm border
                      ${isSelected 
                        ? `border-2 ${isPJ ? 'border-emerald-500' : 'border-cyan-500'} shadow-2xl scale-[1.02]` 
                        : 'border-white/10 hover:border-white/30'
                      }
                      hover:scale-[1.02] hover:-translate-y-1
                    `}
                  >
                    {/* Popular Badge - PJ only */}
                    {'popular' in plan && plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-4 py-1.5 text-xs font-semibold shadow-lg">
                          <Star className="h-3.5 w-3.5 mr-1.5 fill-white" />
                          Mais solicitado por empresas
                        </Badge>
                      </div>
                    )}
                    
                    {/* Selection Indicator */}
                    <div className={`
                      absolute top-6 right-6 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300
                      ${isSelected 
                        ? `bg-gradient-to-r ${plan.gradientFrom} ${plan.gradientTo} border-transparent` 
                        : 'border-white/30 bg-transparent'
                      }
                    `}>
                      {isSelected && <CheckCircle className="h-5 w-5 text-white" />}
                    </div>

                    {/* Icon + Title */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`
                        p-3 rounded-2xl bg-gradient-to-r ${plan.gradientFrom} ${plan.gradientTo} transition-all duration-300
                      `}>
                        <PlanIcon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                        <p className="text-sm text-white/50">{plan.shortName}</p>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-white/60 mb-6 leading-relaxed">{plan.description}</p>
                    
                    {/* Benefits List */}
                    <div className="space-y-3 mb-6">
                      {plan.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className={`
                            w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                            bg-gradient-to-r ${plan.gradientFrom} ${plan.gradientTo}
                          `}>
                            <CheckCircle className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span className="text-sm text-white/70 font-medium">{benefit}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Divider */}
                    <div className="border-t border-white/10 my-6" />
                    
                    {/* Price Section */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white">
                          R$ {formatPrice(planPrice)}
                        </span>
                        <span className="text-lg text-white/40 line-through">
                          R$ {formatPrice((plan as any).originalPrice || plan.basePrice)}
                        </span>
                      </div>
                      <p className="text-white/50 mt-1">
                        ou <span className="font-semibold text-white/70">4x de R$ {formatPrice(planPrice / 4)}</span> sem juros
                      </p>
                    </div>
                    
                    {/* CTA Button - Now clickable and navigates */}
                    <div 
                      onClick={handleCTAClick}
                      className={`
                        w-full py-4 px-6 rounded-2xl text-center font-semibold transition-all duration-300 cursor-pointer
                        ${isSelected 
                          ? `bg-gradient-to-r ${plan.gradientFrom} ${plan.gradientTo} text-white shadow-lg hover:opacity-90` 
                          : 'bg-white/10 text-white/60 group-hover:bg-white/20 hover:bg-white/30'
                        }
                      `}
                    >
                      {plan.cta}
                      <ArrowRight className={`inline-block h-5 w-5 ml-2 transition-transform ${isSelected ? 'translate-x-0' : 'group-hover:translate-x-1'}`} />
                    </div>
                    
                    {/* Microcopy */}
                    <p className="text-center text-xs text-white/40 mt-4">
                      {plan.microcopy}
                    </p>
                  </button>
                );
              })}
            </div>
            
            {/* Mobile CTA - Shows after card selection */}
            <div className="lg:hidden mt-8 px-4">
              <p className="text-center text-white/50 text-sm mb-4">
                👆 Toque no plano desejado para ver detalhes
              </p>
            </div>

            {isSubscribed && (
              <div className="mt-8">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-5 py-2.5 text-sm font-medium">
                  <TrendingDown className="h-4 w-4 mr-2" />
                  🎉 10% de desconto exclusivo de assinante aplicado!
                </Badge>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Content - Benefits */}
            <div className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}>
              {/* Bureaus Tags */}
              <div className="flex flex-wrap gap-3 mb-8">
                <p className="w-full text-sm text-white/50 mb-2">Limpamos seu nome em:</p>
                {bureaus.map((bureau, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="px-4 py-2 text-sm font-medium border-white/20 bg-white/5 text-white/80"
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
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-rose-500/30 transition-colors"
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 shrink-0">
                      <benefit.icon className="h-6 w-6 text-rose-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{benefit.title}</h4>
                      <p className="text-sm text-white/60">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-center">
                  <p className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">500+</p>
                  <p className="text-xs text-white/50">Clientes Atendidos</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">98%</p>
                  <p className="text-xs text-white/50">Taxa de Sucesso</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">30</p>
                  <p className="text-xs text-white/50">Dias em Média</p>
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
              <Card className="relative overflow-hidden border-0 bg-white/5 backdrop-blur-sm shadow-2xl">
                {/* Decorative Top */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${currentPlan.gradientFrom} ${currentPlan.gradientTo}`} />
                
                {/* Plan Badge */}
                <div className="absolute top-4 right-4">
                  <Badge className={`bg-gradient-to-r ${currentPlan.gradientFrom} ${currentPlan.gradientTo} text-white border-0`}>
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
                    <span className="text-sm text-white/80 font-medium">
                      4.9/5 • Avaliação dos clientes
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <p className="text-sm text-white/70 mb-2">Investimento único - {currentPlan.name}</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl text-white/50 line-through">
                        R$ {formatPrice(currentPlan.originalPrice || basePrice)}
                      </span>
                      <span className={`text-5xl font-bold bg-gradient-to-r ${currentPlan.gradientFrom} ${currentPlan.gradientTo} bg-clip-text text-transparent`}>
                        R$ {formatPrice(discountedPrice)}
                      </span>
                    </div>
                    <p className="text-lg text-white font-semibold mt-2">
                      ou <span className={`bg-gradient-to-r ${currentPlan.gradientFrom} ${currentPlan.gradientTo} bg-clip-text text-transparent`}>4x de R$ {formatPrice(installmentPrice)}</span> sem juros
                    </p>
                    {isSubscribed ? (
                      <Badge className="mt-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        10% de desconto aplicado
                      </Badge>
                    ) : (
                      <p className="text-sm text-white/70 mt-2">
                        ou até <span className="font-semibold text-white">12x de R$ {formatPrice(Math.round(discountedPrice / 12))}</span>
                      </p>
                    )}
                  </div>

                  {/* What's Included */}
                  <div className="space-y-3 mb-8">
                    <p className="font-semibold text-white flex items-center gap-2">
                      <Zap className="h-4 w-4 text-rose-400" />
                      Tudo que está incluso:
                    </p>
                    <div className="grid gap-2">
                      {currentPlan.included.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                          <span className="text-sm text-white/90">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA - Open MP Checkout */}
                  <Button 
                    size="lg"
                    onClick={() => {
                      if (!user) {
                        navigate('/auth');
                        return;
                      }
                      openCheckout({
                        amountCents: discountedPrice * 100,
                        serviceName: `Limpa Nome ${selectedPlan === 'pf' ? 'CPF' : 'CNPJ'}`,
                        serviceType: `limpa-nome-${selectedPlan}`,
                        description: currentPlan.description,
                        gradient: `${currentPlan.gradientFrom} ${currentPlan.gradientTo}`,
                        metadata: { service_key: `limpa-nome-${selectedPlan}` },
                        onSuccess: () => navigate('/painel'),
                      });
                    }}
                    className={`w-full h-16 text-lg font-semibold group transition-all duration-300 bg-gradient-to-r ${currentPlan.gradientFrom} ${currentPlan.gradientTo} hover:opacity-90 shadow-lg border-0`}
                  >
                    <Users className="h-5 w-5 mr-2" />
                    {currentPlan.cta}
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  {/* Microcopy - Very Important */}
                  <p className="text-xs text-center text-white/60 mt-4">
                    {currentPlan.microcopy}
                  </p>

                  {/* Human Analysis Info */}
                  <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Handshake className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-white">Atendimento 100% Humano</p>
                        <p className="text-xs text-white/70">Análise feita por pessoas reais</p>
                      </div>
                    </div>
                    <p className="text-xs text-white/70">
                      Seu caso será analisado por especialistas em parceria com profissionais confiáveis. 
                      Nada é automático – você receberá atenção personalizada.
                    </p>
                  </div>

                  {/* Trust Badge */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-center gap-4 text-sm text-white/80">
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-emerald-400" />
                        Pagamento seguro
                      </div>
                      <div className="w-1 h-1 rounded-full bg-white/30" />
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-cyan-400" />
                        Parceiros Verificados
                      </div>
                    </div>
                    <p className="text-center text-xs text-white/60 mt-3">
                      🔒 Garantia de resultado ou seu dinheiro de volta
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
