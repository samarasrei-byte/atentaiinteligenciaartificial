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
  CreditCard,
  Users,
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
  iconGradient: string;
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
  iconGradient,
  onClick,
  badge,
  popular,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -12, transition: { duration: 0.25 } }}
      className="h-full"
    >
      <div className={`
        relative h-full rounded-3xl overflow-hidden group cursor-pointer
        ${popular ? 'p-[2px] bg-gradient-to-br from-primary via-emerald-400 to-teal-500' : 'p-[1px] bg-gradient-to-br from-border/50 to-border/20'}
      `}>
        {/* Glowing effect on hover */}
        <div className={`
          absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl
          bg-gradient-to-br ${gradient}
        `} />
        
        <Card className={`
          relative h-full bg-card/95 backdrop-blur-sm border-0 transition-all duration-300 rounded-[22px]
          ${popular ? 'shadow-2xl shadow-primary/20' : 'shadow-lg'}
        `}>
          {/* Popular ribbon */}
          {popular && (
            <div className="absolute -top-1 -right-1 z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-500 blur-lg opacity-60" />
                <div className="relative bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                  <Star className="h-3 w-3 fill-current" />
                  MAIS VENDIDO
                </div>
              </div>
            </div>
          )}
          
          {/* Badge */}
          {badge && !popular && (
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 border-amber-500/30 text-xs font-medium shadow-sm">
                {badge}
              </Badge>
            </div>
          )}

          <CardContent className="p-6 flex flex-col h-full">
            {/* Header with Icon */}
            <div className="flex items-start gap-4 mb-5">
              <div className={`
                relative w-14 h-14 rounded-2xl bg-gradient-to-br ${iconGradient} 
                flex items-center justify-center shadow-lg
                group-hover:scale-110 group-hover:shadow-xl transition-all duration-300
              `}>
                <div className="absolute inset-0 rounded-2xl bg-white/10" />
                <Icon className="h-7 w-7 text-white relative z-10" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-foreground leading-tight mb-1 group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {description}
                </p>
              </div>
            </div>
            
            {/* Pricing Card */}
            <div className={`
              relative mb-5 p-4 rounded-2xl overflow-hidden
              ${basePrice === 0 ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20' : 
                isSubscribed ? 'bg-gradient-to-br from-success/10 to-emerald-500/10 border border-success/20' : 
                'bg-gradient-to-br from-muted/80 to-muted/40 border border-border/50'}
            `}>
              {basePrice === 0 ? (
                // Success Fee Model
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                      GRÁTIS
                    </span>
                    <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-xs font-bold animate-pulse">
                      💰 Success Fee
                    </Badge>
                  </div>
                  <p className="text-xs text-amber-600/80 font-medium">
                    Pague apenas 50% do valor recuperado
                  </p>
                </div>
              ) : isSubscribed ? (
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-success">{formatPrice(discountedPrice)}</span>
                    <span className="text-base text-muted-foreground/70 line-through">{formatPrice(basePrice)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/20 text-success text-xs font-bold">
                      <Percent className="h-3.5 w-3.5" />
                      {discountPercent}% OFF
                    </div>
                    <span className="text-xs text-success/80">Desconto de assinante</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-foreground">{formatPrice(basePrice)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      <Crown className="h-3.5 w-3.5" />
                      {formatPrice(discountedPrice)} p/ assinantes
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Features with modern styling */}
            <ul className="space-y-3 mb-6 flex-1">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-muted-foreground group/item">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  </div>
                  <span className="group-hover/item:text-foreground transition-colors">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Button 
              onClick={onClick} 
              className={`
                w-full h-12 font-semibold text-base rounded-xl group/btn relative overflow-hidden
                ${popular 
                  ? 'bg-gradient-to-r from-primary via-emerald-500 to-teal-500 hover:from-primary/90 hover:via-emerald-500/90 hover:to-teal-500/90 shadow-lg shadow-primary/30' 
                  : 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70'
                }
              `}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Solicitar Serviço
                <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
              </span>
            </Button>
          </CardContent>
        </Card>
      </div>
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
      gradient: 'from-primary/40 to-teal-500/40',
      iconGradient: 'from-primary to-teal-500',
      onClick: () => navigate('/contadores-publico'),
    },
    {
      title: 'Abertura de Empresa',
      description: 'Formalize seu negócio com suporte contábil completo',
      icon: Building2,
      basePrice: SUBSCRIBER_DISCOUNTS.company_opening.basePrice,
      discountedPrice: SUBSCRIBER_DISCOUNTS.company_opening.discountedPrice,
      discountPercent: Math.round(SUBSCRIBER_DISCOUNTS.company_opening.discount * 100),
      features: [
        'Análise do melhor regime',
        'Documentação completa',
        'Acompanhamento do processo',
      ],
      gradient: 'from-emerald-500/40 to-green-500/40',
      iconGradient: 'from-emerald-500 to-green-500',
      onClick: () => navigate('/abertura-empresa'),
      popular: true,
    },
    {
      title: 'Análise Fiscal Inteligente',
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
      gradient: 'from-amber-500/40 to-orange-500/40',
      iconGradient: 'from-amber-500 to-orange-500',
      onClick: () => navigate('/modulo-fiscal'),
      badge: 'Sem Custo Inicial',
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
      gradient: 'from-violet-500/40 to-purple-500/40',
      iconGradient: 'from-violet-500 to-purple-500',
      onClick: () => navigate('/certidoes'),
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
      gradient: 'from-blue-500/40 to-indigo-500/40',
      iconGradient: 'from-blue-500 to-indigo-500',
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
      gradient: 'from-rose-500/40 to-pink-500/40',
      iconGradient: 'from-rose-500 to-pink-500',
      onClick: () => navigate('/ir'),
      badge: 'Completo',
    },
    {
      title: 'Consultoria Empresarial',
      description: 'Planejamento tributário e otimização fiscal estratégica',
      icon: TrendingUp,
      basePrice: 45000,
      discountedPrice: 36000,
      discountPercent: 20,
      features: [
        'Análise tributária completa',
        'Planejamento estratégico',
        'Relatório personalizado',
      ],
      gradient: 'from-cyan-500/40 to-sky-500/40',
      iconGradient: 'from-cyan-500 to-sky-500',
      onClick: () => navigate('/contadores-publico'),
      badge: 'Premium',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  return (
    <div className="space-y-10">
      {/* Modern Header */}
      <div className="relative">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent blur-xl opacity-40" />
                <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
                  <Zap className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black text-foreground tracking-tight">
                  Nossos Serviços
                </h2>
                <p className="text-muted-foreground text-base">
                  Contadores especializados na Reforma Tributária
                </p>
              </div>
            </div>
          </div>
          
          {isSubscribed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-success/10 to-emerald-500/10 border border-success/20"
            >
              <div className="p-2 rounded-xl bg-success/20">
                <Sparkles className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-bold text-success">Descontos Ativos</p>
                <p className="text-xs text-success/70">Até 30% em todos os serviços</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Trust Indicators - Modern Pills */}
      <div className="flex flex-wrap items-center gap-3">
        {[
          { icon: Shield, text: 'Pagamento Seguro', color: 'text-success' },
          { icon: BadgeCheck, text: 'Contadores Verificados', color: 'text-primary' },
          { icon: Clock, text: 'Suporte 24h', color: 'text-accent' },
          { icon: Star, text: '4.9/5 Avaliação', color: 'text-amber-500', fill: true },
          { icon: Users, text: '+10.000 Clientes', color: 'text-violet-500' },
        ].map((item, idx) => (
          <div 
            key={idx}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 text-sm shadow-sm hover:shadow-md transition-shadow"
          >
            <item.icon className={`h-4 w-4 ${item.color} ${item.fill ? 'fill-current' : ''}`} />
            <span className="text-muted-foreground font-medium">{item.text}</span>
          </div>
        ))}
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

      {/* CTA for non-subscribers - Premium Design */}
      {!isSubscribed && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="relative rounded-3xl overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-emerald-500 opacity-90" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-black/20 via-transparent to-transparent" />
            
            {/* Content */}
            <div className="relative py-10 px-8">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/30 blur-xl" />
                    <div className="relative p-5 rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30">
                      <CreditCard className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <div className="text-white">
                    <h3 className="text-2xl lg:text-3xl font-black mb-2">
                      Economize até 30% em todos os serviços
                    </h3>
                    <p className="text-white/80 text-lg">
                      Assine o AtentAI Premium e desbloqueie descontos exclusivos em toda plataforma
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/pricing')}
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 shadow-2xl shadow-black/20 px-10 h-14 text-lg font-bold rounded-2xl group whitespace-nowrap"
                >
                  <Crown className="h-6 w-6 mr-3" />
                  Ver Planos Premium
                  <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
