import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Building, Loader2, CheckCircle, XCircle, Mail, Lock, User, Shield } from 'lucide-react';

interface InvitationData {
  id: string;
  partner_id: string;
  email: string | null;
  status: string;
  expires_at: string;
  partner?: {
    company_name: string;
    trade_name: string | null;
  };
}

export default function PartnerInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignup, setShowSignup] = useState(false);

  // Form states for signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (token) {
      fetchInvitation();
    }
  }, [token]);

  useEffect(() => {
    // If user is already logged in and invitation is valid, accept it directly
    if (user && invitation && !showSignup) {
      handleAcceptInvitation();
    }
  }, [user, invitation]);

  const fetchInvitation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First get invitation
      const { data: invData, error: invError } = await supabase
        .from('partner_invitations')
        .select('*')
        .eq('invitation_token', token)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (invError || !invData) {
        setError('Convite inválido, expirado ou já utilizado.');
        setIsLoading(false);
        return;
      }

      // Get partner info
      const { data: partnerData } = await supabase
        .from('credit_repair_partners')
        .select('company_name, trade_name')
        .eq('id', invData.partner_id)
        .single();

      setInvitation({
        ...invData,
        partner: partnerData || undefined
      });

      if (invData.email) {
        setEmail(invData.email);
      }
    } catch (err) {
      console.error('Error fetching invitation:', err);
      setError('Erro ao carregar convite.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: 'Senhas não coincidem', variant: 'destructive' });
      return;
    }

    if (password.length < 6) {
      toast({ title: 'Senha deve ter pelo menos 6 caracteres', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      const redirectUrl = `${window.location.origin}/partner/invite/${token}`;

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          toast({ 
            title: 'Email já cadastrado', 
            description: 'Faça login com sua conta existente.',
            variant: 'destructive' 
          });
          setShowSignup(false);
        } else {
          toast({ title: 'Erro ao criar conta', description: signUpError.message, variant: 'destructive' });
        }
        return;
      }

      if (signUpData.user) {
        // Wait for session to be established
        toast({ title: 'Conta criada!', description: 'Vinculando você ao parceiro...' });
        
        // The useEffect will trigger handleAcceptInvitation when user state updates
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast({ title: 'Erro ao criar conta', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (loginError) {
        toast({ title: 'Erro ao fazer login', description: loginError.message, variant: 'destructive' });
        return;
      }

      // The useEffect will trigger handleAcceptInvitation when user state updates
    } catch (err) {
      console.error('Login error:', err);
      toast({ title: 'Erro ao fazer login', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!user || !invitation) return;

    setIsSubmitting(true);

    try {
      // Check if user is already linked to this partner
      const { data: existingLink } = await supabase
        .from('credit_repair_partner_users')
        .select('id')
        .eq('user_id', user.id)
        .eq('partner_id', invitation.partner_id)
        .single();

      if (existingLink) {
        toast({ title: 'Você já está vinculado a este parceiro!' });
        navigate('/parceiro');
        return;
      }

      // Create partner user link
      const { error: linkError } = await supabase
        .from('credit_repair_partner_users')
        .insert({
          user_id: user.id,
          partner_id: invitation.partner_id,
          role: 'operator',
          is_primary: false
        });

      if (linkError) {
        console.error('Link error:', linkError);
        toast({ title: 'Erro ao vincular', description: linkError.message, variant: 'destructive' });
        return;
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('partner_invitations')
        .update({
          status: 'accepted',
          accepted_by: user.id,
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      if (updateError) {
        console.error('Update invitation error:', updateError);
      }

      toast({ title: 'Bem-vindo!', description: 'Você foi vinculado ao parceiro com sucesso!' });
      navigate('/parceiro');
    } catch (err) {
      console.error('Accept invitation error:', err);
      toast({ title: 'Erro ao aceitar convite', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="w-full max-w-md bg-slate-900/50 border-destructive/30">
            <CardContent className="pt-6 text-center">
              <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Convite Inválido</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => navigate('/')} variant="outline">
                Voltar ao Início
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (user && isSubmitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white">Vinculando sua conta ao parceiro...</p>
        </motion.div>
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
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center mx-auto mb-4">
              <Building className="h-8 w-8 text-success" />
            </div>
            <CardTitle className="text-2xl text-white">Convite de Parceiro</CardTitle>
            <CardDescription>
              Você foi convidado para fazer parte da empresa parceira
            </CardDescription>
            {invitation?.partner && (
              <div className="mt-4 p-4 bg-success/10 rounded-xl border border-success/20">
                <p className="text-lg font-semibold text-success">
                  {invitation.partner.trade_name || invitation.partner.company_name}
                </p>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {user ? (
              // User is logged in, show accept button
              <div className="text-center space-y-4">
                <div className="p-4 bg-muted/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Logado como</p>
                  <p className="font-medium text-white">{user.email}</p>
                </div>
                <Button
                  onClick={handleAcceptInvitation}
                  disabled={isSubmitting}
                  className="w-full bg-success hover:bg-success/90"
                  size="lg"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Aceitar Convite
                </Button>
              </div>
            ) : showSignup ? (
              // Signup form
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="pl-10 bg-slate-800/50 border-white/10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="pl-10 bg-slate-800/50 border-white/10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 bg-slate-800/50 border-white/10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">Confirmar Senha</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 bg-slate-800/50 border-white/10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Criar Conta e Aceitar
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Já tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => setShowSignup(false)}
                    className="text-primary hover:underline"
                  >
                    Fazer login
                  </button>
                </p>
              </form>
            ) : (
              // Login form
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="pl-10 bg-slate-800/50 border-white/10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 bg-slate-800/50 border-white/10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Entrar e Aceitar Convite
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Não tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => setShowSignup(true)}
                    className="text-primary hover:underline"
                  >
                    Criar conta
                  </button>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
