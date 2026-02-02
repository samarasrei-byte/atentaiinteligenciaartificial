import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Star
} from 'lucide-react';
import { ServiceCheckoutModal } from '@/components/services/ServiceCheckoutModal';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice, SUBSCRIBER_DISCOUNTS } from '@/lib/stripe';

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
  /** Key for the ServiceCheckoutModal */
  serviceKey: string;
}

export const AllServicesHub: React.FC = () => {
  const navigate = useNavigate();
  const { subscription, hasRole } = useAuth();
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedServiceKey, setSelectedServiceKey] = useState<string>('');
  
  const isSubscriber = subscription?.subscribed || false;

  // Detect if user is Autônomo (PF) or Empresa (PJ) to set Limpa Nome type
  const isAutonomo = hasRole('autonomo');
  const limpaNomeKey = isAutonomo ? 'limpa-nome-pf' : 'limpa-nome-pj';
  const limpaNomePrice = isAutonomo 
    ? SUBSCRIBER_DISCOUNTS.credit_repair_pf.basePrice 
    : SUBSCRIBER_DISCOUNTS.credit_repair_pj.basePrice;

  const services: ServiceItem[] = [
    {
      id: 'limpa-nome',
      name: isAutonomo ? 'Limpa Nome (CPF)' : 'Limpa Nome (CNPJ)',
      description: 'Regularize restrições nos bureaus de crédito',
      icon: Shield,
      gradient: 'from-emerald-500 to-green-600',
      priceCents: limpaNomePrice,
      features: [
        'Análise completa do histórico',
        'Remoção de registros SERASA/SPC',
        'Acompanhamento em tempo real',
        'Bônus: Regularização de Score',
      ],
      isPopular: true,
      serviceKey: limpaNomeKey,
    },
    {
      id: 'analise-fiscal',
      name: 'Análise Fiscal',
      description: 'Recuperação de créditos tributários com taxa de sucesso',
      icon: Scale,
      gradient: 'from-blue-500 to-indigo-600',
      priceCents: 0,
      features: [
        'Análise 100% gratuita',
        'Identificação de oportunidades',
        'Relatório completo auditável',
        'Pague apenas no êxito (50%)',
      ],
      successFee: true,
      serviceKey: 'analise-fiscal',
    },
    {
      id: 'bi-contabilidade',
      name: 'BI+ Contabilidade',
      description: 'Inteligência financeira completa para sua empresa',
      icon: Brain,
      gradient: 'from-purple-500 to-pink-600',
      priceCents: 0,
      features: [
        'Dashboard em tempo real',
        'IA + Análise humana',
        'Insights automáticos',
        'Suporte especializado',
      ],
      isNew: true,
      serviceKey: 'bi-contabilidade',
    },
    {
      id: 'abertura-empresa',
      name: 'Abertura de Empresa',
      description: 'Abertura completa de CNPJ com suporte contábil',
      icon: Building2,
      gradient: 'from-amber-500 to-orange-600',
      priceCents: 78000,
      features: [
        'Análise do melhor regime',
        'Registro na Junta Comercial',
        'Alvará e licenças',
        'CNPJ ativo em até 7 dias',
      ],
      serviceKey: 'abertura-empresa',
    },
    {
      id: 'certidoes',
      name: 'Certidões',
      description: 'Emissão de certidões negativas e positivas',
      icon: ScrollText,
      gradient: 'from-cyan-500 to-teal-600',
      priceCents: 8000,
      features: [
        'Certidão Negativa de Débitos',
        'CND Federal, Estadual e Municipal',
        'FGTS e Trabalhista',
        'Entrega em até 24h',
      ],
      serviceKey: 'certidoes',
    },
  ];

  const handleContractService = (service: ServiceItem) => {
    // Services that use Premium Onboarding flow (success fee / sob consulta)
    const onboardingServices = ['analise-fiscal', 'bi-contabilidade'];
    
    if (onboardingServices.includes(service.serviceKey)) {
      navigate(`/onboarding/${service.serviceKey}`);
      return;
    }
    
    // Todos os outros serviços vão direto pro checkout
    navigate(`/checkout/${service.serviceKey}`);
  };

  const getDisplayPrice = (service: ServiceItem) => {
    if (service.successFee) {
      return 'Grátis + 50% êxito';
    }
    
    if (service.priceCents === 0) {
      return 'Sob Consulta';
    }

    // Check for subscriber discount
    const discountKey = service.id === 'limpa-nome' 
      ? (isAutonomo ? 'credit_repair_pf' : 'credit_repair_pj')
      : service.id.replace('-', '_') as keyof typeof SUBSCRIBER_DISCOUNTS;
    
    if (isSubscriber && SUBSCRIBER_DISCOUNTS[discountKey]) {
      const discountedPrice = SUBSCRIBER_DISCOUNTS[discountKey].discountedPrice;
      if (discountedPrice < service.priceCents) {
        return (
          <div className="flex items-center gap-2">
            <span className="line-through text-muted-foreground text-sm">
              {formatPrice(service.priceCents)}
            </span>
            <span className="text-foreground font-bold">
              {formatPrice(discountedPrice)}
            </span>
          </div>
        );
      }
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
                Aproveite descontos exclusivos em todos os serviços
              </p>
            </div>
            <Badge className="bg-primary">Até 20% OFF</Badge>
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
                    <span className="text-sm text-muted-foreground">A partir de</span>
                    <span className="text-lg font-bold">
                      {getDisplayPrice(service)}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={() => handleContractService(service)}
                    className={`w-full group-hover:translate-x-0 transition-transform bg-gradient-to-r ${service.gradient}`}
                  >
                    Contratar
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Checkout Modal */}
      <ServiceCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        serviceKey={selectedServiceKey}
        onSuccess={() => setCheckoutModalOpen(false)}
      />
    </div>
  );
};

export default AllServicesHub;
