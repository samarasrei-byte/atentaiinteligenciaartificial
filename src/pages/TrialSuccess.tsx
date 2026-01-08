import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, Sparkles, Rocket, ArrowRight, 
  MessageSquare, Calculator, FileText, Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import OnboardingParticles from '@/components/onboarding/OnboardingParticles';

const TrialSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [userData, setUserData] = useState<{
    email?: string;
    plan?: string;
    trialEnd?: string;
    userType?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processSuccess = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setError('Sessão não encontrada');
        setIsProcessing(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('process-trial-success', {
          body: { sessionId },
        });

        if (error) throw error;

        setUserData(data);
        
        // Sign in the user automatically
        if (data.email) {
          // Wait a moment for the account to be fully created
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // The user needs to sign in manually for security
          toast.success('Conta criada! Faça login para continuar.');
        }

        // Celebrate!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

      } catch (err: any) {
        console.error('Error processing trial:', err);
        setError(err.message || 'Erro ao processar trial');
      } finally {
        setIsProcessing(false);
      }
    };

    processSuccess();
  }, [searchParams]);

  const handleContinue = () => {
    navigate('/auth');
  };

  const handleExplore = () => {
    navigate('/');
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        <OnboardingParticles />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center z-10"
        >
          <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Configurando sua conta...</h2>
          <p className="text-muted-foreground">Isso levará apenas alguns segundos</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
        <OnboardingParticles />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md z-10"
        >
          <div className="w-20 h-20 rounded-2xl bg-destructive/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">😕</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Ops, algo deu errado</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={handleExplore}>
            Voltar para o início
          </Button>
        </motion.div>
      </div>
    );
  }

  const trialEndDate = userData?.trialEnd 
    ? new Date(userData.trialEnd).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <OnboardingParticles />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl z-10"
      >
        {/* Success card */}
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl p-8 md:p-12 text-center">
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="relative w-24 h-24 mx-auto mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl animate-pulse opacity-30" />
            <div className="relative w-full h-full bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/30">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="h-6 w-6 text-yellow-400" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Bem-vindo ao AtentAI! 🎉
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-muted-foreground mb-2"
          >
            Seu período de teste de <strong className="text-foreground">3 dias</strong> começou!
          </motion.p>
          
          {trialEndDate && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-muted-foreground mb-8"
            >
              Teste válido até {trialEndDate}
            </motion.p>
          )}

          {/* Trial counter badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 mb-8"
          >
            <span className="text-3xl font-bold text-primary">Dia 1</span>
            <span className="text-muted-foreground">de 3 do seu teste</span>
          </motion.div>

          {/* Features unlocked */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
          >
            {[
              { icon: MessageSquare, text: 'IA Tributária' },
              { icon: Calculator, text: 'Simuladores' },
              { icon: FileText, text: 'Relatórios' },
              { icon: Zap, text: 'Suporte' },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50"
              >
                <feature.icon className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              size="lg"
              onClick={handleContinue}
              className="w-full md:w-auto min-w-[280px] h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all"
            >
              <Rocket className="h-5 w-5 mr-2" />
              Fazer login e começar
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            
            <p className="text-sm text-muted-foreground mt-4">
              Use o email <strong>{userData?.email}</strong> para fazer login
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default TrialSuccess;
