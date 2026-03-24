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
  Rocket,
  Brain,
} from 'lucide-react';
import { LimpaNomePromoCard } from '@/components/limpa-nome/LimpaNomePromoCard';
import { SUBSCRIBER_DISCOUNTS, formatPrice } from '@/lib/plans';

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
  isCustomPricing?: boolean; // For "Sob consulta" pricing
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
  isCustomPricing,
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
        ${popular ? 'p-[2px] bg-gradient-to-br from-primary via-success to-info' : 'p-[1px] bg-gradient-to-br from-border to-border/50'}
      `}>
        {/* Animated glow effect on hover (decorative only) */}
        <motion.div 
          className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl bg-gradient-to-br ${gradient}`}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        <Card className={`
          relative h-full bg-card border-0 transition-all duration-300 rounded-[22px]
          ${popular ? 'shadow-2xl shadow-primary/20' : 'shadow-lg'}
        `}>
          {/* Popular ribbon with glow */}
          {popular && (
            <div className="absolute -top-1 -right-1 z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-success blur-lg opacity-70" />
                <motion.div 
                  className="relative bg-gradient-to-r from-primary to-success text-primary-foreground text-xs font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5"
                  animate={{ boxShadow: ['0 0 20px rgba(var(--primary),0.3)', '0 0 40px rgba(var(--primary),0.6)', '0 0 20px rgba(var(--primary),0.3)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Star className="h-3 w-3 fill-current" />
                  MAIS VENDIDO
                </motion.div>
              </div>
            </div>
          )}
          
          {/* Badge with glow */}
          {badge && !popular && (
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-accent/20 text-accent-foreground border-accent/40 text-xs font-bold shadow-lg">
                {badge}
              </Badge>
            </div>
          )}

          <CardContent className="p-6 flex flex-col h-full">
            {/* Header with Icon */}
            <div className="flex items-start gap-4 mb-5">
              <motion.div 
                className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-xl`}
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 rounded-2xl bg-white/10" />
                <Icon className="h-7 w-7 text-white relative z-10" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-foreground leading-tight mb-1 group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {description}
                </p>
              </div>
            </div>
            
            {/* Pricing Card - Futuristic */}
            <div className={`
              relative mb-5 p-4 rounded-2xl overflow-hidden
              ${isCustomPricing ? 'bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200' :
                basePrice === 0 ? 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200' : 
                isSubscribed ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200' : 
                'bg-muted/50 border border-border'}
            `}>
              {isCustomPricing ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                      Sob consulta
                    </span>
                  </div>
                  <p className="text-xs text-indigo-700 font-medium">
                    Valor personalizado após análise
                  </p>
                </div>
              ) : basePrice === 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      GRÁTIS
                    </span>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs font-bold animate-pulse">
                      💰 Success Fee
                    </Badge>
                  </div>
                  <p className="text-xs text-amber-700 font-medium">
                    Pague apenas 50% do valor recuperado
                  </p>
                </div>
              ) : isSubscribed ? (
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-success">{formatPrice(discountedPrice)}</span>
                    <span className="text-base text-muted-foreground line-through">{formatPrice(basePrice)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-bold">
                      <Percent className="h-3.5 w-3.5" />
                      {discountPercent}% OFF
                    </div>
                    <span className="text-xs text-success/70">Desconto ativo</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-foreground">{formatPrice(basePrice)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent-foreground text-xs font-medium">
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
      title: 'Automação Financeira Completa',
      description: 'Receba e emita notas automaticamente. Pix, boleto e cartão integrados.',
      icon: Rocket,
      basePrice: 9700,
      discountedPrice: 9700,
      discountPercent: 0,
      features: [
        'Cobranças automáticas (Pix, boleto, cartão)',
        'Nota fiscal emitida sozinha',
        'Dashboard financeiro completo',
      ],
      gradient: 'from-emerald-500/40 to-green-500/40',
      iconGradient: 'from-emerald-500 to-green-500',
      onClick: () => navigate('/tentai'),
      badge: 'DESTAQUE',
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
      onClick: () => {
        // Redireciona para o chat dentro do painel ao invés do onboarding
        console.log('[ServicesHub ROUTING] Análise Fiscal → chat-fiscal tab');
        // Navigate to the chat tab by updating URL params
        const currentPath = window.location.pathname;
        const isPanelContext = currentPath.includes('/autonomo') || currentPath.includes('/empresa');

        if (isPanelContext) {
          navigate({ search: '?tab=chat-fiscal' });
          return;
        }

        navigate('/modulo-fiscal/onboarding'); // fora do painel
      },
      badge: 'Sem Custo Inicial',
    },
    {
      title: 'Emissão de NF',
      description: 'Emissão automatizada de notas fiscais com inteligência artificial e validação em tempo real',
      icon: FileText,
      basePrice: 0,
      discountedPrice: 0,
      discountPercent: 0,
      features: [
        'NF-e, NFS-e e NFC-e automatizadas',
        'Validação fiscal inteligente',
        'Integração com prefeituras',
      ],
      gradient: 'from-emerald-500/40 to-teal-500/40',
      iconGradient: 'from-emerald-500 to-teal-500',
      onClick: () => {
        const currentPath = window.location.pathname;
        const isPanelContext = currentPath.includes('/autonomo') || currentPath.includes('/empresa');

        if (isPanelContext) {
          navigate({ search: '?tab=chat-bi' });
          return;
        }

        navigate('/bi-contabilidade');
      },
      badge: 'Novo',
      isCustomPricing: true,
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
      {/* Ultra-Modern Futuristic Header */}
      <div className="relative">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-4">
            <motion.div 
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border border-emerald-500/30 backdrop-blur-sm"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <Rocket className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 text-sm font-semibold">MARKETPLACE PREMIUM</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </motion.div>
            
            <div className="flex items-center gap-4">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-success blur-xl opacity-40" />
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary to-success shadow-xl">
                  <Zap className="h-7 w-7 text-primary-foreground" />
                </div>
              </motion.div>
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                  Nossos Serviços
                </h2>
                <p className="text-muted-foreground text-base md:text-lg">
                  Especialistas <span className="text-primary font-semibold">certificados</span> na Reforma Tributária
                </p>
              </div>
            </div>
          </div>
          
          {isSubscribed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-success/10 border border-success/30"
            >
              <motion.div 
                className="p-3 rounded-xl bg-gradient-to-br from-success to-primary shadow-lg"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="h-5 w-5 text-success-foreground" />
              </motion.div>
              <div>
                <span className="text-foreground font-bold text-base">Descontos Ativados!</span>
                <p className="text-success text-sm font-medium">Até 30% OFF em todos os serviços</p>
              </div>
            </motion.div>
          )}
          
          {!isSubscribed && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-accent/10 border border-accent/30"
            >
              <motion.div 
                className="p-3 rounded-xl bg-gradient-to-br from-accent to-amber-500 shadow-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown className="h-5 w-5 text-accent-foreground" />
              </motion.div>
              <div>
                <span className="text-foreground font-bold text-base">Assine e Economize</span>
                <p className="text-amber-600 text-sm font-medium">Até 30% de desconto</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Trust Indicators - Futuristic Pills */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {[
          { icon: Shield, text: 'Pagamento Seguro', color: 'from-emerald-500 to-teal-500' },
          { icon: BadgeCheck, text: 'Especialistas Verificados', color: 'from-violet-500 to-purple-500' },
          { icon: Clock, text: 'Suporte 24h', color: 'from-cyan-500 to-blue-500' },
          { icon: Star, text: '4.9/5 Avaliação', color: 'from-amber-500 to-orange-500', fill: true },
          { icon: Users, text: '+10.000 Clientes', color: 'from-pink-500 to-rose-500' },
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-card border border-border text-sm shadow-sm cursor-pointer group"
          >
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
              <item.icon className={`h-3.5 w-3.5 text-white ${item.fill ? 'fill-current' : ''}`} />
            </div>
            <span className="text-foreground font-medium">{item.text}</span>
          </motion.div>
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

    </div>
  );
};
