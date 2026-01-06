import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Building2, 
  FileText, 
  MessageSquare, 
  ArrowRight,
  Percent,
  Crown,
  CheckCircle2,
  Sparkles,
  Shield,
  Zap,
  Star,
  Clock,
  BadgeCheck,
  TrendingUp,
  FileSearch,
} from 'lucide-react';
import { LimpaNomePromoCard } from '@/components/limpa-nome/LimpaNomePromoCard';
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
  popular?: boolean;
  index: number;
  isSuccessFee?: boolean;
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
  popular,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className={`
        h-full bg-card border-border/50 transition-all duration-300 overflow-hidden relative group
        hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10
        ${popular ? 'ring-2 ring-primary/50 shadow-lg shadow-primary/20' : ''}
      `}>
        {/* Popular badge */}
        {popular && (
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground text-xs font-medium py-1.5 text-center">
            ⭐ Mais Popular
          </div>
        )}
        
        {/* Discount badge */}
        {badge && !popular && (
          <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs shadow-md">
            {badge}
          </Badge>
        )}

        <CardContent className={`p-6 ${popular ? 'pt-10' : ''}`}>
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          
          {/* Title & Description */}
          <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-5 line-clamp-2">
            {description}
          </p>
          
          {/* Pricing */}
          <div className="mb-5 p-4 rounded-xl bg-muted/50 border border-border/50">
            {basePrice === 0 ? (
              // Success Fee Model
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-success">Grátis</span>
                  <Badge className="bg-success/10 text-success border-success/30 text-xs">
                    Success Fee
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium">
                    <Sparkles className="h-3 w-3" />
                    Pague apenas no êxito
                  </div>
                </div>
              </div>
            ) : isSubscribed ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-success">{formatPrice(discountedPrice)}</span>
                  <span className="text-sm text-muted-foreground line-through">{formatPrice(basePrice)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
                    <Percent className="h-3 w-3" />
                    -{discountPercent}% de desconto
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-3xl font-bold text-foreground">{formatPrice(basePrice)}</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                    <Crown className="h-3 w-3" />
                    {formatPrice(discountedPrice)} p/ assinantes
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          <ul className="space-y-2.5 mb-6">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Button 
            onClick={onClick} 
            className={`w-full group/btn ${popular ? 'bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 shadow-lg' : ''}`}
          >
            Solicitar
            <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const ServicesHubModern: React.FC = () => {
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
      popular: true,
    },
    {
      title: 'Análise Fiscal',
      description: 'Identifique oportunidades de economia tributária',
      icon: FileSearch,
      basePrice: 0,
      discountedPrice: 0,
      discountPercent: 50,
      features: [
        'Análise 100% gratuita',
        'Pague apenas no êxito',
        'Taxa de 50% do recuperado',
      ],
      gradient: 'from-amber-500 to-orange-500',
      onClick: () => navigate('/modulo-fiscal'),
      badge: 'Sem Custo',
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
    {
      title: 'Declaração IR Simples',
      description: 'Para CLT com poucos rendimentos e sem investimentos',
      icon: FileText,
      basePrice: SUBSCRIBER_DISCOUNTS.ir_simples.basePrice,
      discountedPrice: SUBSCRIBER_DISCOUNTS.ir_simples.discountedPrice,
      discountPercent: Math.round(SUBSCRIBER_DISCOUNTS.ir_simples.discount * 100),
      features: [
        'Contadores especializados',
        'Envio ao sistema da Receita',
        'Comprovante de entrega',
      ],
      gradient: 'from-blue-500 to-indigo-500',
      onClick: () => navigate('/ir'),
    },
    {
      title: 'Declaração IR Completo',
      description: 'Para autônomos, investidores ou múltiplas fontes',
      icon: FileText,
      basePrice: SUBSCRIBER_DISCOUNTS.ir_completo.basePrice,
      discountedPrice: SUBSCRIBER_DISCOUNTS.ir_completo.discountedPrice,
      discountPercent: Math.round(SUBSCRIBER_DISCOUNTS.ir_completo.discount * 100),
      features: [
        'Análise completa de rendimentos',
        'Otimização fiscal',
        'Acompanhamento pós-envio',
      ],
      gradient: 'from-rose-500 to-pink-500',
      onClick: () => navigate('/ir'),
      badge: 'Completo',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Serviços Contábeis</h2>
          </div>
          <p className="text-muted-foreground">
            Contrate serviços de contadores especializados na Reforma Tributária
          </p>
        </div>
        
        {isSubscribed && (
          <Badge className="bg-gradient-to-r from-success/20 to-emerald-500/20 text-success border-success/30 px-4 py-2">
            <Sparkles className="h-4 w-4 mr-2" />
            Descontos Ativos
          </Badge>
        )}
      </div>

      {/* Trust indicators */}
      <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-success" />
          <span>Pagamento 100% seguro</span>
        </div>
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-4 w-4 text-primary" />
          <span>Contadores verificados</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-accent" />
          <span>Suporte em até 24h</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          <span>4.9/5 avaliação</span>
        </div>
      </div>

      {/* Limpa Nome Banner */}
      <LimpaNomePromoCard variant="banner" />

      {/* Services Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {services.map((service, index) => (
          <ServiceCard
            key={service.title}
            {...service}
            isSubscribed={isSubscribed}
            index={index}
          />
        ))}
      </motion.div>

      {/* CTA for non-subscribers */}
      {!isSubscribed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
            <CardContent className="relative py-8 px-6">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
                    <TrendingUp className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      Economize até 30% em todos os serviços
                    </h3>
                    <p className="text-muted-foreground">
                      Assine o AtentAI Premium e desbloqueie descontos exclusivos
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/pricing')}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25 px-8 group"
                >
                  <Crown className="h-5 w-5 mr-2" />
                  Ver Planos
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
