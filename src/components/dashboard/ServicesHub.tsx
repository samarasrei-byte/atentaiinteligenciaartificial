import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  FileText, 
  MessageSquare, 
  ArrowRight,
  Percent,
  Crown,
  Users,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { SUBSCRIBER_DISCOUNTS, formatPrice } from '@/lib/stripe';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  basePrice: number;
  discountedPrice: number;
  discountPercent: number;
  isSubscribed: boolean;
  features: string[];
  gradient: string;
  onClick: () => void;
  badge?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  icon: Icon,
  basePrice,
  discountedPrice,
  discountPercent,
  isSubscribed,
  features,
  gradient,
  onClick,
  badge,
}) => {
  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-all group overflow-hidden relative">
      {badge && (
        <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs">
          {badge}
        </Badge>
      )}
      <CardHeader className="pb-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pricing */}
        <div className="space-y-1">
          {isSubscribed ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-success">{formatPrice(discountedPrice)}</span>
              <span className="text-sm text-muted-foreground line-through">{formatPrice(basePrice)}</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{formatPrice(basePrice)}</span>
            </div>
          )}
          {isSubscribed && (
            <div className="flex items-center gap-1.5">
              <Percent className="h-3.5 w-3.5 text-success" />
              <span className="text-xs text-success font-medium">
                {discountPercent}% de desconto para assinantes
              </span>
            </div>
          )}
          {!isSubscribed && (
            <div className="flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs text-accent font-medium">
                Assine e ganhe {discountPercent}% de desconto
              </span>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <Button 
          onClick={onClick} 
          className="w-full group-hover:bg-primary/90"
        >
          Solicitar
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export const ServicesHub: React.FC = () => {
  const navigate = useNavigate();
  const { subscription } = useAuth();
  
  const isSubscribed = subscription?.subscribed || false;

  const services = [
    {
      title: 'Consulta com Contador',
      description: 'Tire suas dúvidas tributárias com um profissional especializado',
      icon: MessageSquare,
      basePrice: SUBSCRIBER_DISCOUNTS.consultation.basePrice,
      discountedPrice: SUBSCRIBER_DISCOUNTS.consultation.discountedPrice,
      discountPercent: Math.round(SUBSCRIBER_DISCOUNTS.consultation.discount * 100),
      features: [
        'Chat em tempo real',
        'Envio de documentos',
        'Resposta em até 24h',
      ],
      gradient: 'from-primary to-teal-500',
      onClick: () => navigate('/contadores'),
    },
    {
      title: 'Abertura de Empresa',
      description: 'Formalize seu negócio com suporte especializado',
      icon: Building2,
      basePrice: SUBSCRIBER_DISCOUNTS.company_opening.basePrice,
      discountedPrice: SUBSCRIBER_DISCOUNTS.company_opening.discountedPrice,
      discountPercent: Math.round(SUBSCRIBER_DISCOUNTS.company_opening.discount * 100),
      features: [
        'Análise do melhor regime',
        'Documentação completa',
        'Acompanhamento do processo',
      ],
      gradient: 'from-emerald-500 to-green-500',
      onClick: () => navigate('/abertura-empresa'),
      badge: 'Popular',
    },
    {
      title: 'Emissão de Certidões',
      description: 'Certidões fiscais emitidas por contadores verificados',
      icon: FileText,
      basePrice: SUBSCRIBER_DISCOUNTS.certificate.basePrice,
      discountedPrice: SUBSCRIBER_DISCOUNTS.certificate.discountedPrice,
      discountPercent: Math.round(SUBSCRIBER_DISCOUNTS.certificate.discount * 100),
      features: [
        'CND Federal, Estadual e Municipal',
        'Entrega em até 7 dias úteis',
        'Documento oficial verificável',
      ],
      gradient: 'from-violet-500 to-purple-500',
      onClick: () => navigate('/certificates'),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Serviços com Contadores</h2>
        </div>
        {isSubscribed && (
          <Badge className="bg-success/10 text-success border-success/20">
            <Sparkles className="h-3 w-3 mr-1" />
            Descontos ativos
          </Badge>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground">
        Contrate serviços de contadores especializados na Reforma Tributária
        {isSubscribed 
          ? ' e aproveite seus descontos exclusivos de assinante!' 
          : '. Assinantes têm descontos em todos os serviços.'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.map((service) => (
          <ServiceCard
            key={service.title}
            {...service}
            isSubscribed={isSubscribed}
          />
        ))}
      </div>

      {!isSubscribed && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Quer economizar em todos os serviços?</p>
                  <p className="text-sm text-muted-foreground">
                    Assine o Business Pro e ganhe até 20% de desconto
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/pricing')}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                Ver Planos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
