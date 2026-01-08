import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Clock, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TrialBannerProps {
  trialEndDate: string;
  className?: string;
}

const TrialBanner: React.FC<TrialBannerProps> = ({ trialEndDate, className }) => {
  const navigate = useNavigate();
  
  const endDate = new Date(trialEndDate);
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const currentDay = 4 - daysRemaining; // Assuming 3-day trial

  const isLastDay = daysRemaining <= 1;
  const isExpired = daysRemaining === 0;

  if (isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-gradient-to-r from-destructive/20 to-red-500/20 border border-destructive/30 rounded-xl p-4",
          className
        )}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="font-semibold text-destructive">Seu período de teste terminou</p>
              <p className="text-sm text-muted-foreground">
                Assine agora para continuar usando todos os recursos
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => navigate('/pricing')}
            className="bg-destructive hover:bg-destructive/90"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Assinar agora
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl p-4",
        isLastDay 
          ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
          : "bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20",
        className
      )}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <motion.div 
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isLastDay ? "bg-amber-500/20" : "bg-primary/20"
            )}
            animate={isLastDay ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: isLastDay ? Infinity : 0 }}
          >
            <Clock className={cn(
              "h-5 w-5",
              isLastDay ? "text-amber-500" : "text-primary"
            )} />
          </motion.div>
          
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">
                Dia {currentDay} de 3 do seu teste
              </p>
              {isLastDay && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 text-xs font-medium">
                  Último dia!
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {isLastDay 
                ? 'Seu teste termina hoje. Assine para não perder acesso.'
                : `${daysRemaining} dias restantes. Aproveite ao máximo!`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Days indicator */}
          <div className="hidden md:flex items-center gap-1">
            {[1, 2, 3].map((day) => (
              <div
                key={day}
                className={cn(
                  "w-3 h-3 rounded-full transition-all",
                  currentDay >= day 
                    ? "bg-primary" 
                    : "bg-muted"
                )}
              />
            ))}
          </div>

          <Button
            variant={isLastDay ? "default" : "outline"}
            size="sm"
            onClick={() => navigate('/pricing')}
            className={cn(
              isLastDay && "bg-amber-500 hover:bg-amber-600 text-white"
            )}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isLastDay ? 'Assinar agora' : 'Ver planos'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default TrialBanner;
