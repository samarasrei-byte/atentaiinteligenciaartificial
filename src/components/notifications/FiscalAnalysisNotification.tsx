import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Scale, 
  X, 
  ArrowRight, 
  Sparkles,
  TrendingDown,
  Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FiscalAnalysisNotificationProps {
  className?: string;
  onDismiss?: () => void;
}

export const FiscalAnalysisNotification: React.FC<FiscalAnalysisNotificationProps> = ({
  className,
  onDismiss
}) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user should see this notification
    const dismissed = localStorage.getItem('fiscalNotificationDismissed');
    const hasPendingAnalysis = sessionStorage.getItem('pendingFiscalAnalysis');
    
    // Show notification if not dismissed or if there's a pending analysis
    if (!dismissed || hasPendingAnalysis) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('fiscalNotificationDismissed', 'true');
    sessionStorage.removeItem('pendingFiscalAnalysis');
    onDismiss?.();
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleAccept = () => {
    sessionStorage.removeItem('pendingFiscalAnalysis');
    navigate('/modulo-fiscal/onboarding');
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className={cn("relative", className)}
        >
          <Card className="relative overflow-hidden border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-background">
            {/* Decorative gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted/50 transition-colors z-10"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            <CardContent className="p-4 md:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Icon */}
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  className="flex-shrink-0"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Scale className="h-6 w-6 text-white" />
                  </div>
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-xs">
                      <Gift className="h-3 w-3 mr-1" />
                      Recomendado
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-foreground">
                    Faça uma Análise Fiscal
                  </h4>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Identifique oportunidades de economia tributária. Você só paga no êxito!
                  </p>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    onClick={handleAccept}
                    size="sm"
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md flex-1 sm:flex-none"
                  >
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    Solicitar Análise
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FiscalAnalysisNotification;
