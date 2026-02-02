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
  /** Checkout route for direct payment services */
  checkoutRoute?: string;
  /** Onboarding route for services requiring analysis first */
  onboardingRoute?: string;
}

export const AllServicesHub: React.FC = () => {
  const { subscription, hasRole } = useAuth();
  const navigate = useNavigate();
  
  const isSubscriber = subscription?.subscribed || false;

  // Detect if user is Autônomo (PF) or Empresa (PJ) to set Limpa Nome type
  const isAutonomo = hasRole('autonomo');

  /**
   * OFFICIAL SERVICE CATALOG (Updated 2026-02-02)
   * All paid services go directly to Stripe Checkout
   * Removed: Consultoria Empresarial
   */
  const services: ServiceItem[] = [
    {
      id: 'limpa-nome',
      name: isAutonomo ? 'Limpa Nome (CPF)' : 'Limpa Nome (CNPJ)',
      description: 'Regularize restrições nos bureaus de crédito',
      icon: Shield,
      gradient: 'from-emerald-500 to-green-600',
      priceCents: 28000, // R$ 280,00 FIXED
      features: [
        'Análise completa do histórico',
        'Remoção de registros SERASA/SPC',
        'Acompanhamento em tempo real',
        'Bônus: Regularização de Score',
      ],
      isPopular: true,
      checkoutRoute: isAutonomo ? '/checkout/limpa-nome-pf' : '/checkout/limpa-nome-pj',
    },
    {
      id: 'consulta-contador',
      name: 'Consulta com Contador',
      description: 'Orientação tributária com especialista',
      icon: MessageSquare,
      gradient: 'from-primary to-cyan-600',
      priceCents: 28000, // R$ 280,00 FIXED
      features: [
        'Atendimento em até 24h',
        'Contador especializado',
        'Orientação personalizada',
        'Envio de documentos',
      ],
      checkoutRoute: '/checkout/consulta-contador',
    },
    {
      id: 'certidoes',
      name: 'Certidões Negativas',
      description: 'Emissão de certidões negativas de débitos',
      icon: ScrollText,
      gradient: 'from-cyan-500 to-teal-600',
      priceCents: 8000, // R$ 80,00 FIXED
      features: [
        'Federal, estadual e municipal',
        'Entrega digital rápida',
        'Suporte incluso',
      ],
      checkoutRoute: '/checkout/certidao',
    },
    {
      id: 'ir-simples',
      name: 'IR Simples (CLT)',
      description: 'Declaração para CLT sem investimentos',
      icon: FileText,
      gradient: 'from-rose-500 to-red-600',
      priceCents: 20000, // R$ 200,00 FIXED
      features: [
        'Declaração completa',
        'Revisão por especialista',
        'Envio à Receita Federal',
        'Recibo garantido',
      ],
      checkoutRoute: '/checkout/ir-simples',
    },
    {
      id: 'ir-completo',
      name: 'IR Completo',
      description: 'Para autônomos e investidores',
      icon: FileText,
      gradient: 'from-purple-500 to-pink-600',
      priceCents: 42000, // R$ 420,00 FIXED
      features: [
        'Múltiplas fontes de renda',
        'Investimentos inclusos',
        'Otimização fiscal',
        'Especialista dedicado',
      ],
      checkoutRoute: '/checkout/ir-completo',
    },
    {
      id: 'abertura-empresa',
      name: 'Abertura de Empresa',
      description: 'Abertura completa de CNPJ com suporte',
      icon: Building2,
      gradient: 'from-amber-500 to-orange-600',
      priceCents: 78000, // R$ 780,00
      features: [
        'Análise do melhor regime',
        'CNPJ em até 7 dias',
        'Documentação inclusa',
      ],
      checkoutRoute: '/checkout/abertura-empresa',
    },
    {
      id: 'analise-fiscal',
      name: 'Análise Fiscal',
      description: 'Recuperação de créditos tributários',
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
    {
      id: 'bi-contabilidade',
      name: 'BI+ Contabilidade',
      description: 'Inteligência financeira completa',
      icon: Brain,
      gradient: 'from-purple-500 to-pink-600',
      priceCents: 0,
      features: [
        'Dashboard em tempo real',
        'IA + Análise humana',
        'Insights automáticos',
      ],
      isNew: true,
      onboardingRoute: '/bi-contabilidade/onboarding',
    },
  ];

  const handleContractService = (service: ServiceItem) => {
    // Direct checkout for paid services
    if (service.checkoutRoute) {
      navigate(service.checkoutRoute);
      return;
    }
    
    // Onboarding for analysis/custom pricing services
    if (service.onboardingRoute) {
      navigate(service.onboardingRoute);
      return;
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
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
                  <Badge className="bg-amber-500/90">
                    <Star className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                )}
                {service.isNew && (
                  <Badge className="bg-primary/90">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Novo
                  </Badge>
                )}
                {service.successFee && (
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-600">
                    Taxa de Sucesso
                  </Badge>
                )}
              </div>

              {/* Gradient Header */}
              <div className={`h-2 bg-gradient-to-r ${service.gradient}`} />
              
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${service.gradient} text-white`}>
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
                      {service.successFee ? 'Valor' : 'A partir de'}
                    </span>
                    <span className="text-lg font-bold">
                      {getDisplayPrice(service)}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={() => handleContractService(service)}
                    className={`w-full group-hover:translate-x-0 transition-transform bg-gradient-to-r ${service.gradient}`}
                  >
                    {service.checkoutRoute ? 'Contratar' : 'Solicitar'}
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
