import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Brain, Mail, Lock, User, Loader2, Building2, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Email inválido');
const passwordSchema = z.string().min(6, 'Senha deve ter pelo menos 6 caracteres');
const nameSchema = z.string().min(2, 'Nome deve ter pelo menos 2 caracteres');

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const fromOnboarding = searchParams.get('from') === 'onboarding';
  const pendingOnboardingData = sessionStorage.getItem('pendingOnboardingData');

  useEffect(() => {
    if (user && !authLoading) {
      // If there's pending onboarding data, save it
      if (pendingOnboardingData) {
        saveOnboardingData(user.id);
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, authLoading, navigate, pendingOnboardingData]);

  const saveOnboardingData = async (userId: string) => {
    try {
      const data = JSON.parse(pendingOnboardingData!);
      
      const { error } = await supabase
        .from('companies')
        .insert({
          user_id: userId,
          company_name: data.company_name,
          trade_name: data.trade_name || null,
          cnpj: data.cnpj || null,
          company_type: data.company_type as any,
          tax_regime: data.tax_regime as any,
          sector: data.sector as any,
          monthly_revenue_cents: data.monthly_revenue_cents,
          annual_revenue_cents: data.monthly_revenue_cents * 12,
          employee_count: data.employee_count,
          state: data.state,
          city: data.city || null,
          main_activity: data.main_activity || null,
          onboarding_completed: true,
        });

      if (error) throw error;

      // Clear the pending data
      sessionStorage.removeItem('pendingOnboardingData');
      
      toast({
        title: 'Empresa cadastrada!',
        description: 'Seus dados foram salvos com sucesso',
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error saving onboarding data:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao salvar dados da empresa',
      });
      navigate('/dashboard');
    }
  };

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      emailSchema.parse(loginEmail);
    } catch (e: any) {
      newErrors.loginEmail = e.errors[0].message;
    }
    
    try {
      passwordSchema.parse(loginPassword);
    } catch (e: any) {
      newErrors.loginPassword = e.errors[0].message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      nameSchema.parse(signupName);
    } catch (e: any) {
      newErrors.signupName = e.errors[0].message;
    }
    
    try {
      emailSchema.parse(signupEmail);
    } catch (e: any) {
      newErrors.signupEmail = e.errors[0].message;
    }
    
    try {
      passwordSchema.parse(signupPassword);
    } catch (e: any) {
      newErrors.signupPassword = e.errors[0].message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    
    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);
    
    if (error) {
      let message = 'Erro ao fazer login';
      if (error.message.includes('Invalid login credentials')) {
        message = 'Email ou senha incorretos';
      } else if (error.message.includes('Email not confirmed')) {
        message = 'Por favor, confirme seu email antes de fazer login';
      }
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: message,
      });
    } else {
      toast({
        title: 'Bem-vindo!',
        description: 'Login realizado com sucesso',
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignup()) return;
    
    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    setIsLoading(false);
    
    if (error) {
      let message = 'Erro ao criar conta';
      if (error.message.includes('User already registered')) {
        message = 'Este email já está cadastrado';
      }
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: message,
      });
    } else {
      toast({
        title: 'Conta criada!',
        description: 'Bem-vindo ao AtentAI',
      });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(forgotEmail);
    } catch {
      setErrors({ forgotEmail: 'Email inválido' });
      return;
    }
    
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/auth?reset=true`,
    });
    setIsLoading(false);
    
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao enviar email de recuperação',
      });
    } else {
      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada para redefinir a senha',
      });
      setShowForgotPassword(false);
      setForgotEmail('');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/logo-atentai.png" 
              alt="AtentAI" 
              className="h-16 w-auto"
            />
          </div>
          {fromOnboarding && pendingOnboardingData ? (
            <>
              <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                <Building2 className="h-5 w-5" />
                <span className="text-sm font-medium">Dados da empresa salvos!</span>
              </div>
              <CardTitle className="text-2xl text-white">Crie sua conta</CardTitle>
              <CardDescription className="text-slate-400">
                Finalize seu cadastro para acessar a plataforma
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="text-2xl text-white">Acesse sua conta</CardTitle>
              <CardDescription className="text-slate-400">
                Sua plataforma completa para a Reforma Tributária
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={fromOnboarding ? "signup" : "login"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
              <TabsTrigger value="login" className="data-[state=active]:bg-teal-600">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-teal-600">
                Cadastrar
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-slate-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  {errors.loginEmail && (
                    <p className="text-sm text-red-400">{errors.loginEmail}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-slate-300">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  {errors.loginPassword && (
                    <p className="text-sm text-red-400">{errors.loginPassword}</p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Entrar
                </Button>
                
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-teal-400 hover:text-teal-300"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Esqueceu sua senha?
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-slate-300">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  {errors.signupName && (
                    <p className="text-sm text-red-400">{errors.signupName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-slate-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  {errors.signupEmail && (
                    <p className="text-sm text-red-400">{errors.signupEmail}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-slate-300">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  {errors.signupPassword && (
                    <p className="text-sm text-red-400">{errors.signupPassword}</p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Criar Conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          {!fromOnboarding && (
            <div className="mt-6 pt-4 border-t border-slate-700">
              <p className="text-sm text-slate-400 text-center mb-3">
                Primeira vez aqui?
              </p>
              <Button
                variant="outline"
                className="w-full border-teal-500 text-teal-400 hover:bg-teal-500/10"
                onClick={() => navigate('/onboarding')}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Começar configurando minha empresa
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-white">Recuperar Senha</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Digite seu email para receber um link de recuperação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  {errors.forgotEmail && (
                    <p className="text-sm text-red-400">{errors.forgotEmail}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Enviar Link
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Auth;
