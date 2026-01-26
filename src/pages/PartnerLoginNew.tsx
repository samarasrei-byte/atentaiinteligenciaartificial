import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SplitLoginLayout } from '@/components/auth/SplitLoginLayout';
import { 
  Building2, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  CheckCircle,
  Mail,
  Briefcase,
  Users,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type LoginState = 'idle' | 'authenticating' | 'checking_access' | 'success' | 'error';

const PartnerLoginNew = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if already logged in as partner
  useEffect(() => {
    if (!authLoading && user) {
      checkExistingPartnerAccess();
    }
  }, [user, authLoading]);

  const checkExistingPartnerAccess = async () => {
    if (!user) return;
    
    setLoginState('checking_access');
    
    try {
      const { data: partnerLink } = await supabase
        .from('credit_repair_partner_users')
        .select('partner_id, role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (partnerLink) {
        navigate('/parceiro', { replace: true });
      } else {
        setLoginState('idle');
      }
    } catch (err) {
      console.error('Error checking partner access:', err);
      setLoginState('idle');
    }
  };

  const checkPartnerAccessDirectly = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('credit_repair_partner_users')
        .select('partner_id, role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking partner access:', error);
        return false;
      }

      return !!data;
    } catch (err) {
      console.error('Exception checking partner access:', err);
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoginState('authenticating');

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setErrorMessage('Email ou senha incorretos');
        } else {
          setErrorMessage(authError.message);
        }
        setLoginState('error');
        return;
      }

      if (!authData.user) {
        setErrorMessage('Erro ao autenticar. Tente novamente.');
        setLoginState('error');
        return;
      }

      setLoginState('checking_access');

      const isPartner = await checkPartnerAccessDirectly(authData.user.id);

      if (isPartner) {
        setLoginState('success');
        toast.success('Bem-vindo! Redirecionando...');
        
        setTimeout(() => {
          navigate('/parceiro', { replace: true });
        }, 500);
      } else {
        await supabase.auth.signOut();
        setErrorMessage('Sua conta não está vinculada a nenhum parceiro.');
        setLoginState('error');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('Erro inesperado. Tente novamente.');
      setLoginState('error');
    }
  };

  const isLoading = loginState === 'authenticating' || loginState === 'checking_access' || loginState === 'success';

  if (authLoading || (user && loginState === 'checking_access')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  return (
    <SplitLoginLayout
      title="Portal do Parceiro"
      subtitle="Gerencie suas solicitações de Limpa Nome e Módulo Fiscal. Acompanhe seus ganhos e métricas de performance em tempo real."
      accentColor="blue"
      features={[
        { icon: Briefcase, label: 'Gestão de Serviços' },
        { icon: Users, label: 'Clientes em Tempo Real' },
        { icon: TrendingUp, label: 'Métricas de Performance' }
      ]}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center lg:text-left">
          {/* Mobile logo */}
          <div className="lg:hidden mb-6">
            <img 
              src="/logo-atentai.png" 
              alt="AtentAI" 
              className="h-10 w-auto mx-auto"
            />
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 text-xs font-medium mb-4">
            <Building2 className="h-3.5 w-3.5" />
            Portal do Parceiro
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Bem-vindo de volta!
          </h1>
          <p className="text-muted-foreground">
            Entre para acessar sua conta
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={isLoading}
                autoComplete="email"
                className="pl-12 h-14 text-base rounded-xl border-border bg-background focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                autoComplete="current-password"
                className="pl-12 pr-12 h-14 text-base rounded-xl border-border bg-background focus:border-blue-500 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Status feedback */}
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 rounded-xl bg-destructive/10 border border-destructive/20"
              >
                <p className="text-sm text-destructive text-center">{errorMessage}</p>
              </motion.div>
            )}

            {loginState === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="text-sm text-green-600 dark:text-green-400">Acesso autorizado!</p>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/20 transition-all duration-300"
          >
            {loginState === 'authenticating' && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Autenticando...
              </div>
            )}
            {loginState === 'checking_access' && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Verificando acesso...
              </div>
            )}
            {loginState === 'success' && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Redirecionando...
              </div>
            )}
            {(loginState === 'idle' || loginState === 'error') && (
              <div className="flex items-center gap-2">
                Entrar
                <ArrowRight className="h-5 w-5" />
              </div>
            )}
          </Button>
        </form>

        {/* Separator */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        {/* Help text */}
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Não é parceiro?{' '}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-primary hover:underline font-medium"
            >
              Voltar ao site
            </button>
          </p>
          <p className="text-xs text-muted-foreground">
            Se você recebeu um convite, use o link enviado para criar sua conta.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            AtentAI © {new Date().getFullYear()} • Portal do Parceiro
          </p>
        </div>
      </div>
    </SplitLoginLayout>
  );
};

export default PartnerLoginNew;
