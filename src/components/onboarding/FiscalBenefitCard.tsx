import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Gift, 
  TrendingDown, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  Shield,
  Calculator
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FiscalBenefitCardProps {
  onAccept?: () => void;
  onSkip?: () => void;
  className?: string;
}

export const FiscalBenefitCard: React.FC<FiscalBenefitCardProps> = ({
  onAccept,
  onSkip,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn("relative", className)}
    >
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-cyan-500/30 rounded-3xl blur-xl opacity-70" />
      
      <Card className="relative border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-background overflow-hidden">
        {/* Decorative corner badge */}
        <div className="absolute top-0 right-0">
          <div className="bg-gradient-to-l from-emerald-500 to-teal-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center gap-1.5">
            <Gift className="h-3.5 w-3.5" />
            BENEFÍCIO EXCLUSIVO
          </div>
        </div>

        <CardContent className="p-6 pt-10 md:p-8 md:pt-12">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Icon section */}
            <motion.div 
              className="flex-shrink-0"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                <Calculator className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
            </motion.div>

            {/* Content section */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Pague apenas no êxito
                  </Badge>
                </div>
                
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                  Análise Fiscal Personalizada
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Sua empresa pode estar pagando impostos a mais.</strong>
                  {' '}Oferecemos uma Análise Fiscal completa para identificar oportunidades de economia tributária. Você só paga no êxito!
                </p>
              </div>

              {/* Benefits list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Diagnóstico tributário completo',
                  'Identificação de créditos fiscais',
                  'Comparativo de regimes',
                  'Recomendações personalizadas'
                ].map((benefit, idx) => (
                  <motion.div 
                    key={idx}
                    className="flex items-center gap-2 text-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              {/* Potential savings highlight */}
              <motion.div 
                className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                animate={{ 
                  borderColor: ['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.4)', 'rgba(16, 185, 129, 0.2)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingDown className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-medium text-foreground">
                  Potencial de economia: até <strong className="text-emerald-500">R$ 50.000+/ano</strong> em impostos
                </span>
              </motion.div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={onAccept}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30 h-12"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Quero minha Análise Fiscal
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Continuar sem análise
                </Button>
              </div>

              {/* Trust badge */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                <Shield className="h-3.5 w-3.5" />
                <span>Sem compromisso • Seus dados estão protegidos</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FiscalBenefitCard;