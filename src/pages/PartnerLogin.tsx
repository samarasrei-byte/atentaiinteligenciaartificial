import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Building2, Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PartnerLogin() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);

  useEffect(() => {
    if (user && !authLoading && !isCheckingAccess) {
      checkPartnerAccess();
    }
  }, [user, authLoading]);

  const checkPartnerAccess = async () => {
    if (!user) return;
    setIsCheckingAccess(true);

    try {
      // Check if user is linked to any partner
      const { data: partnerLink, error: linkError } = await supabase
        .from('credit_repair_partner_users')
        .select('partner_id, role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (linkError) {
        console.error('Error checking partner link:', linkError);
        setIsCheckingAccess(false);
        return;
      }

      if (partnerLink) {
        // User is a partner, redirect to partner panel
        navigate('/parceiro');
      } else {
        // User is logged in but not a partner
        setError('Sua conta não está vinculada a nenhum parceiro. Entre em contato com o administrador para receber um convite.');
        // Sign out since they don't have partner access
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Error checking partner access:', err);
    } finally {
      setIsCheckingAccess(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (loginError) {
        if (loginError.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos.');
        } else {
          setError(loginError.message);
        }
        return;
      }

      if (data.user) {
        // Check if user is a partner
        const { data: partnerLink, error: linkError } = await supabase
          .from('credit_repair_partner_users')
          .select('partner_id, role')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (linkError) {
          console.error('Error checking partner link:', linkError);
          setError('Erro ao verificar acesso de parceiro.');
          return;
        }

        if (partnerLink) {
          toast({ title: 'Bem-vindo!', description: 'Redirecionando para o painel...' });
          navigate('/parceiro');
        } else {
          setError('Sua conta não está vinculada a nenhum parceiro. Entre em contato com o administrador para receber um convite.');
          // Sign out since they don't have partner access
          await supabase.auth.signOut();
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isCheckingAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-white">Portal do Parceiro</CardTitle>
            <CardDescription>
              Acesso exclusivo para parceiros credenciados
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-10 bg-slate-800/50 border-white/10 text-white placeholder:text-white/40"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 bg-slate-800/50 border-white/10 text-white placeholder:text-white/40"
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading} 
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-center text-sm text-muted-foreground">
                Não é parceiro?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-primary hover:underline"
                >
                  Voltar ao site
                </button>
              </p>
              <p className="text-center text-xs text-muted-foreground mt-2">
                Se você recebeu um convite, use o link enviado para criar sua conta.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
