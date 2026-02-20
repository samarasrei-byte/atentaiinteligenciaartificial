import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SplitLoginLayout } from '@/components/auth/SplitLoginLayout';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  ArrowRight, 
  Loader2, 
  CheckCircle,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type LoginState = 'idle' | 'authenticating' | 'checking_role' | 'success' | 'error';

const AdminLoginNew = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const [attempts, setAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingRedirect, setPendingRedirect] = useState(false);
  const { user, hasRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Single unified redirect effect: handles both "already logged in" and "just logged in"
  useEffect(() => {
    if (authLoading) return;
    if (user && (hasRole('admin') || hasRole('equipe_guilherme'))) {
      navigate('/admin', { replace: true });
    }
  }, [user, hasRole, authLoading, navigate]);

  // Direct database check for admin role
  const checkAdminRoleDirectly = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });
      if (error) return false;
      return data === true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (attempts >= 5) {
      setErrorMessage('Muitas tentativas. Aguarde 5 minutos.');
      return;
    }
    
    setLoginState('authenticating');
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      
      if (authError) {
        setAttempts(prev => prev + 1);
        setErrorMessage(
          authError.message.includes('Invalid login credentials')
            ? 'Email ou senha incorretos'
            : authError.message
        );
        setLoginState('error');
        return;
      }

      if (!authData.user) {
        setErrorMessage('Erro ao autenticar. Tente novamente.');
        setLoginState('error');
        return;
      }

      // Clear stale redirect flags
      sessionStorage.removeItem('pendingOnboardingData');
      sessionStorage.removeItem('selectedUserType');
      sessionStorage.removeItem('isNewSignup');
      sessionStorage.removeItem('postAuthRedirect');

      setLoginState('checking_role');

      // Check admin role directly in the database (doesn't depend on AuthContext)
      const isAdmin = await checkAdminRoleDirectly(authData.user.id);

      // Also accept known admin emails as fast-track
      const knownAdmins = ['admin@atentai.com.br', 'contato@atentai.com.br'];
      const isKnown = knownAdmins.includes(email.trim().toLowerCase());

      if (isAdmin || isKnown) {
        setLoginState('success');
        toast.success('Acesso autorizado!');
        setPendingRedirect(true);
        // The useEffect above will handle navigation once AuthContext finishes loading
        // But also set a fallback timeout in case AuthContext is slow
      } else {
        await supabase.auth.signOut();
        setAttempts(prev => prev + 1);
        setErrorMessage('Sua conta não possui permissão de administrador');
        setLoginState('error');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Erro inesperado. Tente novamente.');
      setAttempts(prev => prev + 1);
      setLoginState('error');
    }
  };

  // Fallback: if pendingRedirect is true for more than 3 seconds, force navigate
  useEffect(() => {
    if (!pendingRedirect) return;
    const timer = setTimeout(() => {
      navigate('/admin', { replace: true });
    }, 3000);
    return () => clearTimeout(timer);
  }, [pendingRedirect, navigate]);

  const isLoading = loginState === 'authenticating' || loginState === 'checking_role' || loginState === 'success';

  return (
    <SplitLoginLayout
      title="Painel Administrativo"
      subtitle="Área restrita para administradores do sistema AtentAI. Monitore operações, gerencie usuários e acompanhe métricas em tempo real."
      accentColor="red"
      features={[
        { icon: Shield, label: 'Acesso Monitorado' },
        { icon: Lock, label: 'Criptografia E2E' },
        { icon: AlertTriangle, label: 'Auditoria Completa' }
      ]}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center lg:text-left">
          <div className="lg:hidden mb-6">
            <img src="/logo-atentai.png" alt="AtentAI" className="h-10 w-auto mx-auto" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium mb-4">
            <Shield className="h-3.5 w-3.5" />
            Acesso Administrativo
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Bem-vindo de volta!
          </h1>
          <p className="text-muted-foreground">
            Entre para acessar o painel administrativo
          </p>
        </div>

        {/* Security warning */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-600 dark:text-amber-300/80">
            Esta área é monitorada. Tentativas não autorizadas são registradas.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@empresa.com"
                required
                disabled={isLoading || attempts >= 5}
                autoComplete="email"
                className="pl-12 h-14 text-base rounded-xl border-border bg-background focus:border-red-500 focus:ring-red-500/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading || attempts >= 5}
                autoComplete="current-password"
                className="pl-12 pr-12 h-14 text-base rounded-xl border-border bg-background focus:border-red-500 focus:ring-red-500/20"
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
                <p className="text-sm text-green-600 dark:text-green-400">Acesso autorizado! Redirecionando...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {attempts > 0 && attempts < 5 && !errorMessage && (
            <p className="text-xs text-amber-500 text-center">
              Tentativas restantes: {5 - attempts}
            </p>
          )}

          <Button
            type="submit"
            disabled={isLoading || attempts >= 5}
            className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-500/20 transition-all duration-300"
          >
            {loginState === 'authenticating' && (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Autenticando...
              </div>
            )}
            {loginState === 'checking_role' && (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Verificando permissões...
              </div>
            )}
            {loginState === 'success' && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
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

        {/* Footer */}
        <div className="pt-6 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            AtentAI © {new Date().getFullYear()} • Acesso restrito
          </p>
        </div>
      </div>
    </SplitLoginLayout>
  );
};

export default AdminLoginNew;
