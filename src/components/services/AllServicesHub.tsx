import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Scale, 
  Brain, 
  Building2, 
  FileText, 
  ScrollText,
  Crown,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Star,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { isFeatureEnabled } from '@/lib/featureFlags';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  priceCents: number;
  features: string[];
  isPopular?: boolean;
  isNew?: boolean;
  successFee?: boolean;
  comingSoon?: boolean;
  checkoutRoute?: string;
  onboardingRoute?: string;
}

export const AllServicesHub: React.FC = () => {
  const { subscription, hasRole } = useAuth();
  const navigate = useNavigate();
  
  const isSubscriber = subscription?.subscribed || false;
  const showLegacyServices = isFeatureEnabled('LEGACY_SERVICES');

  // Detect if user is Autônomo (PF) or Empresa (PJ) to set Limpa Nome type
  const isAutonomo = hasRole('autonomo');

  /**
   * OFFICIAL SERVICE CATALOG (Updated 2026-02-02)
   * All paid services go directly to Stripe Checkout
   * Removed: Consultoria Empresarial
   * Hidden by flag: Abertura de Empresa, Certidões, IR Simples, IR Completo
   */
  /**
   * MANDATORY ROUTING TABLE - DO NOT MODIFY WITHOUT AUTHORIZATION
   * Each service MUST have exactly ONE route - either checkoutRoute OR onboardingRoute
   * NEVER mix them. Routes are ABSOLUTE and IMMUTABLE.
   */
  const services: ServiceItem[] = [
    // ===== CONTADOR IA — IMPOSTO DE RENDA =====
    {
      id: 'ir-simples',
      name: 'Contador IA — Imposto de Renda',
      description: 'Envie seus documentos e a IA mais avançada do Brasil faz sua declaração de IR em minutos.',
      icon: Brain,
      gradient: 'from-violet-500 to-purple-600',
      priceCents: 8900,
      features: [
        'Análise automática de documentos',
        'Extração de dados por IA',
        'Cálculo automático de imposto',
        'Dicas de otimização fiscal',
        'Alertas de inconsistências',
      ],
      isNew: true,
      checkoutRoute: '/checkout/ir-simples',
    },

    // ===== LIMPA NOME PF (CPF) =====
    ...(isAutonomo ? [{
      id: 'limpa-nome-pf',
      name: 'Limpa Nome (CPF)',
      description: 'Regularize restrições nos bureaus de crédito com apoio especializado.',
      icon: Shield,
      gradient: 'from-emerald-500 to-green-600',
      priceCents: 84000,
      features: [
        'Análise completa do histórico',
        'Remoção de registros SERASA/SPC',
        'Acompanhamento em tempo real',
        'Bônus: Regularização de Score',
      ],
      isPopular: true,
      checkoutRoute: '/checkout/limpa-nome-pf',
    }] : []),
    
    // ===== LIMPA NOME PJ (CNPJ) =====
    ...(!isAutonomo ? [{
      id: 'limpa-nome-pj',
      name: 'Limpa Nome (CNPJ)',
      description: 'Regularize restrições nos bureaus de crédito da sua empresa.',
      icon: Shield,
      gradient: 'from-emerald-500 to-green-600',
      priceCents: 128000,
      features: [
        'Análise completa do histórico',
        'Remoção de registros SERASA/SPC',
        'Acompanhamento em tempo real',
        'Bônus: Regularização de Score',
      ],
      isPopular: true,
      checkoutRoute: '/checkout/limpa-nome-pj',
    }] : []),

    // ===== EMISSÃO DE NF =====
    {
      id: 'emissao-nf',
      name: 'Emissão de NF',
      description: 'Emissão automatizada de notas fiscais com validação inteligente e integração com prefeituras.',
      icon: FileText,
      gradient: 'from-emerald-500 to-teal-600',
      priceCents: 9700,
      features: [
        'NF-e, NFS-e e NFC-e automatizadas',
        'Validação fiscal em tempo real',
        'Integração com prefeituras',
      ],
      isNew: true,
      onboardingRoute: '/emissao-nf',
    },

    // ===== ANÁLISE FISCAL =====
    {
      id: 'analise-fiscal',
      name: 'Análise Fiscal Inteligente',
      description: 'Recuperação de créditos tributários com IA — pague apenas no êxito.',
      icon: Scale,
      gradient: 'from-blue-500 to-indigo-600',
      priceCents: 0,
      features: [
        'Análise 100% gratuita',
        'Identificação de oportunidades',
        'Pague apenas no êxito (50%)',
      ],
      successFee: true,
      onboardingRoute: '/modulo-fiscal/onboarding',
    },

    // ===== ABERTURA DE EMPRESA — Em Breve =====
    {
      id: 'abertura-empresa',
      name: 'Abertura de Empresa',
      description: 'Abertura completa de CNPJ com análise do melhor regime tributário.',
      icon: Building2,
      gradient: 'from-amber-500 to-orange-600',
      priceCents: 78000,
      features: [
        'Análise do melhor regime',
        'CNPJ em até 7 dias úteis',
        'Documentação inclusa',
      ],
      comingSoon: true,
    },

    // ===== CERTIDÃO NEGATIVA — Em Breve =====
    {
      id: 'certidao',
      name: 'Certidão Negativa',
      description: 'Emissão de certidões negativas de débitos federais, estaduais e municipais.',
      icon: ScrollText,
      gradient: 'from-cyan-500 to-teal-600',
      priceCents: 8000,
      features: [
        'Federal, estadual e municipal',
        'Entrega digital rápida',
        'Suporte especializado incluso',
      ],
      comingSoon: true,
    },
  ];

  /**
   * CRITICAL ROUTING FUNCTION
   * RULE: If inside panel context (Autônomo/Empresa), Fiscal/BI go to chat tab. Limpa Nome goes to checkout.
   * Outside panels, uses external onboarding routes.
   */
  const handleContractService = (service: ServiceItem) => {
    const isPanelContext = window.location.pathname.includes('/autonomo') || 
                           window.location.pathname.includes('/empresa') ||
                           window.location.pathname.includes('/dashboard');

    // RULE 1: Paid services (Limpa Nome) → ALWAYS go to checkout
    if (service.checkoutRoute) {
      console.log(`[ROUTING] ${service.id} → ${service.checkoutRoute}`);
      navigate(service.checkoutRoute);
      return;
    }

    // RULE 2: Fiscal/BI inside panel context → Navigate to embedded chat tab
    if (isPanelContext && service.id === 'analise-fiscal') {
      console.log(`[ROUTING PANEL] ${service.id} → ?tab=chat-fiscal`);
      navigate({ search: `?tab=chat-fiscal` });
      return;
    }

    if (service.id === 'emissao-nf') {
      console.log(`[ROUTING] emissao-nf → /emissao-nf`);
      navigate('/emissao-nf');
      return;
    }
    
    // RULE 3: Free/analysis services outside panels → External onboarding
    if (service.onboardingRoute) {
      console.log(`[ROUTING] ${service.id} → ${service.onboardingRoute}`);
      navigate(service.onboardingRoute);
      return;
    }
    
    // ERROR: Misconfigured service
    console.error(`[ROUTING ERROR] Service ${service.id} has no valid route!`);
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  };

  const getDisplayPrice = (service: ServiceItem) => {
    if (service.successFee) {
      return 'Grátis + 50% êxito';
    }
    
    if (service.priceCents === 0) {
      return 'Sob Consulta';
    }
    
    return formatPrice(service.priceCents);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-foreground">Todos os Serviços</h2>
        <p className="text-muted-foreground">
          Explore nossa linha completa de serviços especializados
        </p>
      </div>

      {/* Subscriber Banner */}
      {isSubscriber && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-full bg-primary/20">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Você é assinante!</p>
              <p className="text-sm text-muted-foreground">
                Acesse todos os serviços com prioridade
              </p>
            </div>
            <Badge className="bg-primary">Assinante</Badge>
          </CardContent>
        </Card>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const Icon = service.icon;
          
          return (
            <Card 
              key={service.id}
              className="relative overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* Badges */}
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                {service.isPopular && (
                  <Badge className="bg-amber-500/90 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                )}
                {service.isNew && (
                  <Badge className="bg-primary/90 text-primary-foreground">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Novo
                  </Badge>
                )}
                {service.successFee && (
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    Taxa de Sucesso
                  </Badge>
                )}
                {service.comingSoon && (
                  <Badge variant="outline" className="border-muted-foreground/50 text-muted-foreground">
                    Em Breve
                  </Badge>
                )}
              </div>

              {/* Gradient Header */}
              <div className={`h-2 bg-gradient-to-r ${service.gradient} ${service.comingSoon ? 'opacity-50' : ''}`} />
              
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${service.gradient} text-white ${service.comingSoon ? 'opacity-60' : ''}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {service.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Features */}
                <ul className="space-y-2">
                  {service.features.slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Price & CTA */}
                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {service.successFee ? 'Valor' : service.id === 'emissao-nf' ? 'Mensal' : 'A partir de'}
                    </span>
                    <span className="text-lg font-bold">
                      {service.id === 'emissao-nf' ? 'R$ 97,00/mês' : getDisplayPrice(service)}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={() => !service.comingSoon && handleContractService(service)}
                    disabled={service.comingSoon}
                    className={`w-full transition-transform bg-gradient-to-r ${service.gradient} ${service.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {service.comingSoon ? 'Em Breve' : service.checkoutRoute ? 'Contratar' : 'Solicitar'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AllServicesHub;
