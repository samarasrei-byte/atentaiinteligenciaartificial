import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Zap, Rocket, Sparkles, ArrowRight,
  MessageSquare, Clock, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AILimitUpsellProps {
  currentUsage: number;
  limit: number;
  onUpgrade?: () => void;
  variant?: 'soft' | 'hard';
  className?: string;
}

const AILimitUpsell: React.FC<AILimitUpsellProps> = ({
  currentUsage,
  limit,
  onUpgrade,
  variant = 'soft',
  className,
}) => {
  const navigate = useNavigate();
  const percentage = Math.min((currentUsage / limit) * 100, 100);
  const isAtLimit = currentUsage >= limit;

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/pricing');
    }
  };

  // Soft wall - warning before limit
  if (variant === 'soft' && !isAtLimit) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4",
          className
        )}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-amber-500" />
          </div>
          
          <div className="flex-1">
            <p className="font-medium text-foreground mb-1">
              Você usou {currentUsage} de {limit} perguntas hoje
            </p>
            
            {/* Progress bar */}
            <div className="w-full h-2 bg-muted rounded-full mb-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "h-full rounded-full",
                  percentage >= 80 ? "bg-amber-500" : "bg-primary"
                )}
              />
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              Faça upgrade para perguntas ilimitadas e recursos premium.
            </p>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleUpgrade}
              className="border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
            >
              <Rocket className="h-4 w-4 mr-2" />
              Ver planos
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Hard wall - at or over limit
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "bg-card border border-border rounded-3xl shadow-2xl overflow-hidden",
        className
      )}
    >
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 p-6 text-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-4"
        >
          <Zap className="h-8 w-8 text-white" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-white mb-2">
          Você atingiu seu limite de IA 🚀
        </h2>
        <p className="text-white/80">
          Continue usando sem limites com um plano premium
        </p>
      </div>

      {/* Benefits */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { icon: Zap, text: 'Perguntas ilimitadas', desc: 'Sem restrições' },
            { icon: Clock, text: 'Respostas rápidas', desc: 'Prioridade na fila' },
            { icon: MessageSquare, text: 'IA especializada', desc: 'Tributária 24/7' },
            { icon: Shield, text: 'Suporte premium', desc: 'Atendimento VIP' },
          ].map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/50"
            >
              <benefit.icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">{benefit.text}</p>
                <p className="text-xs text-muted-foreground">{benefit.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <Button
          size="lg"
          onClick={handleUpgrade}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-purple-500 shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          Fazer upgrade agora
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Teste grátis por 3 dias • Cancele a qualquer momento
        </p>
      </div>
    </motion.div>
  );
};

export default AILimitUpsell;
