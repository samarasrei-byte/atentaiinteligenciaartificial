import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Loader2, Mail, Lock, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

type LoginState = 'idle' | 'authenticating' | 'checking_access' | 'success' | 'error';

export default function PartnerLogin() {
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
        // User is logged in but not a partner - reset state
        setLoginState('idle');
      }
    } catch (err) {
      console.error('Error checking partner access:', err);
      setLoginState('idle');
    }
  };

  // Direct database check for partner access
  const checkPartnerAccessDirectly = async (userId: string): Promise<{ isPartner: boolean; partnerId?: string; role?: string }> => {
    try {
      const { data, error } = await supabase
        .from('credit_repair_partner_users')
        .select('partner_id, role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking partner access:', error);
        return { isPartner: false };
      }

      return {
        isPartner: !!data,
        partnerId: data?.partner_id,
        role: data?.role
      };
    } catch (err) {
      console.error('Exception checking partner access:', err);
      return { isPartner: false };
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoginState('authenticating');

    try {
      // Step 1: Authenticate
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

      // Step 2: Check partner access directly from database
      const { isPartner } = await checkPartnerAccessDirectly(authData.user.id);

      if (isPartner) {
        setLoginState('success');
        toast.success('Bem-vindo! Redirecionando...');
        
        // Small delay for visual feedback
        setTimeout(() => {
          navigate('/parceiro', { replace: true });
        }, 500);
      } else {
        // Not a partner - sign out and show error
        await supabase.auth.signOut();
        setErrorMessage('Sua conta não está vinculada a nenhum parceiro. Entre em contato com o administrador para receber um convite.');
        setLoginState('error');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('Erro inesperado. Tente novamente.');
      setLoginState('error');
    }
  };

  const isLoading = loginState === 'authenticating' || loginState === 'checking_access' || loginState === 'success';

  // Show loading while checking initial auth state
  if (authLoading || (user && loginState === 'checking_access')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
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
          className="w-full"
        >
          <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl shadow-2xl">
            <CardHeader className="text-center pb-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/30 flex items-center justify-center"
              >
                <Building2 className="h-10 w-10 text-primary" />
              </motion.div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Portal do Parceiro
              </CardTitle>
              <CardDescription className="text-slate-400">
                Acesso exclusivo para parceiros credenciados
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="pl-11 h-12 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary/20"
                      required
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-11 pr-12 h-12 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary/20"
                      required
                      disabled={isLoading}
                      autoComplete="current-password"
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

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold shadow-lg shadow-primary/20 transition-all duration-300" 
                  disabled={isLoading} 
                  size="lg"
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
                    'Entrar'
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-3">
                <p className="text-center text-sm text-slate-400">
                  Não é parceiro?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="text-primary hover:underline font-medium"
                  >
                    Voltar ao site
                  </button>
                </p>
                <p className="text-center text-xs text-slate-500">
                  Se você recebeu um convite, use o link enviado para criar sua conta.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
