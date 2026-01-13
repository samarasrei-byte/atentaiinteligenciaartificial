import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, EyeOff, AlertTriangle, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type LoginState = 'idle' | 'authenticating' | 'checking_role' | 'success' | 'error';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const [attempts, setAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user, hasRole, loading: authLoading, refreshUserData } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!authLoading && user && hasRole('admin')) {
      navigate('/admin', { replace: true });
    }
  }, [user, hasRole, navigate, authLoading]);

  // Direct database check for admin role (bypass state timing issues)
  const checkAdminRoleDirectly = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });
      
      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      
      return data === true;
    } catch (err) {
      console.error('Exception checking admin role:', err);
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
      // Step 1: Authenticate
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      
      if (authError) {
        setAttempts(prev => prev + 1);
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

      setLoginState('checking_role');
      
      // Step 2: Check admin role directly from database (not from state)
      const isAdmin = await checkAdminRoleDirectly(authData.user.id);
      
      if (isAdmin) {
        setLoginState('success');
        toast.success('Acesso autorizado! Redirecionando...');
        
        // Refresh user data in context
        await refreshUserData();
        
        // Small delay for visual feedback
        setTimeout(() => {
          navigate('/admin', { replace: true });
        }, 500);
      } else {
        // Not an admin - sign out and show error
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

  const isLoading = loginState === 'authenticating' || loginState === 'checking_role' || loginState === 'success';

  // Show loading while checking initial auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-500/3 to-orange-500/3 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Back button */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white hover:bg-slate-800/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao site
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl shadow-2xl">
            <CardHeader className="text-center pb-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center"
              >
                <Shield className="h-10 w-10 text-red-400" />
              </motion.div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Acesso Administrativo
              </CardTitle>
              <CardDescription className="text-slate-400">
                Área restrita para administradores
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {/* Security warning */}
              <div className="mb-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300/80">
                  Esta área é monitorada. Tentativas não autorizadas são registradas.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                    Email do Administrador
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@empresa.com"
                    required
                    disabled={isLoading || attempts >= 5}
                    autoComplete="email"
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-red-500/20 h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={isLoading || attempts >= 5}
                      autoComplete="current-password"
                      className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-red-500/20 h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
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
                      className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                    >
                      <p className="text-sm text-red-400 text-center">{errorMessage}</p>
                    </motion.div>
                  )}

                  {loginState === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <p className="text-sm text-green-400">Acesso autorizado!</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {attempts > 0 && attempts < 5 && !errorMessage && (
                  <p className="text-xs text-amber-400 text-center">
                    Tentativas restantes: {5 - attempts}
                  </p>
                )}

                {attempts >= 5 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <p className="text-sm text-red-400 text-center">
                      Acesso temporariamente bloqueado
                    </p>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || attempts >= 5}
                  className="w-full h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-semibold shadow-lg shadow-red-500/20 transition-all duration-300"
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
                      <Lock className="h-5 w-5" />
                      Acessar Painel
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <p className="text-xs text-center text-slate-500">
                  Atent.AI © {new Date().getFullYear()} • Acesso restrito
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;
