import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Sparkles, 
  Bell, 
  ArrowLeft,
  Construction,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComingSoonSectionProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  expectedDate?: string;
  features?: string[];
  onBack?: () => void;
  className?: string;
}

/**
 * ComingSoonSection - Placeholder para funcionalidades em desenvolvimento
 * 
 * Usado quando uma rota existe mas o conteúdo ainda não está pronto.
 * Mantém o usuário no contexto do app com design consistente.
 */
export const ComingSoonSection: React.FC<ComingSoonSectionProps> = ({
  title,
  description = 'Esta funcionalidade está sendo desenvolvida e estará disponível em breve.',
  icon: Icon = Construction,
  expectedDate,
  features = [],
  onBack,
  className,
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              {title}
              <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10">
                <Clock className="h-3 w-3 mr-1" />
                Em breve
              </Badge>
            </h2>
            <p className="text-muted-foreground text-sm mt-1">{description}</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="relative overflow-hidden border-2 border-dashed border-muted-foreground/20">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5" />
          
          <CardContent className="relative py-16 px-8 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-500/20 mb-6"
            >
              <Icon className="h-10 w-10 text-primary" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Estamos trabalhando nisso!
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Nossa equipe está desenvolvendo esta funcionalidade para oferecer 
                a melhor experiência possível para você.
              </p>

              {expectedDate && (
                <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Previsão: {expectedDate}
                </Badge>
              )}
            </motion.div>

            {/* Features preview */}
            {features.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 pt-8 border-t border-border"
              >
                <p className="text-sm font-medium text-foreground mb-4 flex items-center justify-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  O que está por vir
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground"
                    >
                      <Sparkles className="h-3 w-3 text-primary flex-shrink-0" />
                      {feature}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Notify CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => {
                  // Could integrate with notifications
                }}
              >
                <Bell className="h-4 w-4" />
                Receber aviso quando estiver pronto
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ComingSoonSection;
