import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, Loader2, Building2, ArrowLeft, Briefcase, Calculator, Eye, EyeOff, Sparkles, ArrowRight, Check } from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const emailSchema = z.string().email('Email inválido');
const passwordSchema = z.string().min(6, 'Senha deve ter pelo menos 6 caracteres');
const nameSchema = z.string().min(2, 'Nome deve ter pelo menos 2 caracteres');

type UserType = 'empresa' | 'autonomo' | 'contador';
type AuthMode = 'login' | 'signup';

interface UserTypeOption {
  type: UserType;
  label: string;
  icon: React.ElementType;
  color: string;
}

interface UserTypeOptionWithDesc extends UserTypeOption {
  description: string;
}

const userTypes: UserTypeOptionWithDesc[] = [
  { type: 'empresa', label: 'Empresa', icon: Building2, color: 'text-blue-500 bg-blue-500/10 border-blue-500', description: 'Para empresas de todos os portes que buscam otimizar sua carga tributária' },
  { type: 'autonomo', label: 'Autônomo', icon: Briefcase, color: 'text-purple-500 bg-purple-500/10 border-purple-500', description: 'Para profissionais liberais e prestadores de serviço autônomos' },
  { type: 'contador', label: 'Contador', icon: Calculator, color: 'text-teal-500 bg-teal-500/10 border-teal-500', description: 'Para contadores que desejam atender clientes na plataforma' },
];

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<UserType>('empresa');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const fromOnboarding = searchParams.get('from') === 'onboarding';
  const pendingOnboardingData = sessionStorage.getItem('pendingOnboardingData');

  useEffect(() => {
    if (fromOnboarding) {
      setMode('signup');
    }
  }, [fromOnboarding]);

  useEffect(() => {
    if (user && !authLoading) {
      if (pendingOnboardingData) {
        saveOnboardingData(user.id);
      } else {
        const selectedType = sessionStorage.getItem('selectedUserType');
        if (selectedType) {
          sessionStorage.removeItem('selectedUserType');
          switch (selectedType) {
            case 'autonomo':
              navigate('/autonomo-onboarding');
              break;
            case 'contador':
              navigate('/contador-onboarding');
              break;
            default:
              navigate('/onboarding');
          }
        } else {
          navigate('/dashboard');
        }
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      emailSchema.parse(email);
    } catch (e: any) {
      newErrors.email = e.errors[0].message;
    }
    
    try {
      passwordSchema.parse(password);
    } catch (e: any) {
      newErrors.password = e.errors[0].message;
    }
    
    if (mode === 'signup') {
      try {
        nameSchema.parse(name);
      } catch (e: any) {
        newErrors.name = e.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    if (mode === 'login') {
      const { error } = await signIn(email, password);
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
    } else {
      const { error } = await signUp(email, password, name);
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
        sessionStorage.setItem('selectedUserType', userType);
      }
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

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setErrors({});
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <div className="p-4 md:p-6">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <img 
              src="/logo-atentai.png" 
              alt="AtentAI" 
              className="h-14 w-auto mx-auto mb-6"
            />
            {fromOnboarding && pendingOnboardingData ? (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <Check className="h-4 w-4" />
                  Dados salvos
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Finalize seu cadastro
                </h1>
                <p className="text-muted-foreground">
                  Crie sua conta para acessar a plataforma
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
                </h1>
                <p className="text-muted-foreground">
                  {mode === 'login' 
                    ? 'Entre para acessar sua conta' 
                    : 'Comece sua jornada com o AtentAI'}
                </p>
                {/* Profile type indicators */}
                {mode === 'login' && (
                  <TooltipProvider>
                    <div className="flex items-center justify-center gap-2 xs:gap-3 sm:gap-4 mt-4">
                      {userTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <Tooltip key={type.type}>
                            <TooltipTrigger asChild>
                              <div className="flex flex-col items-center gap-1 sm:gap-1.5 cursor-pointer">
                                <div className={cn(
                                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-transform hover:scale-110",
                                  type.color
                                )}>
                                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <span className="text-[10px] sm:text-xs text-muted-foreground">{type.label}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-[200px] text-center">
                              <p className="text-xs">{type.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </TooltipProvider>
                )}
              </>
            )}
          </div>

          {/* Auth Card */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
            <CardContent className="p-6 md:p-8">
              {/* Mode Toggle */}
              <div className="flex rounded-xl bg-muted/50 p-1 mb-6">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={cn(
                    "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all",
                    mode === 'login' 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={cn(
                    "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all",
                    mode === 'signup' 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Cadastrar
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* User Type Selection (only for signup) */}
                {mode === 'signup' && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Eu sou</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {userTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = userType === type.type;
                        return (
                          <button
                            key={type.type}
                            type="button"
                            onClick={() => setUserType(type.type)}
                            className={cn(
                              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                              isSelected
                                ? type.color
                                : "border-border bg-muted/30 text-muted-foreground hover:border-muted-foreground/50"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs font-medium">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Name field (only for signup) */}
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-12"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>
                )}

                {/* Email field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                {/* Forgot password link (only for login) */}
                {mode === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {mode === 'login' ? 'Entrar' : 'Criar conta'}
                  {!isLoading && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </form>

              {/* Switch mode link */}
              {!fromOnboarding && (
                <div className="mt-6 pt-6 border-t border-border/50 text-center">
                  <p className="text-sm text-muted-foreground">
                    {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                    <button
                      type="button"
                      onClick={switchMode}
                      className="ml-1 text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      {mode === 'login' ? 'Cadastre-se' : 'Entre'}
                    </button>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* First time CTA */}
          {!fromOnboarding && mode === 'login' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Primeira vez aqui?
              </p>
              <Button
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary/5"
                onClick={() => navigate('/comecar')}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Descobrir o AtentAI
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md border-border shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowForgotPassword(false)}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h2 className="font-semibold text-foreground">Recuperar Senha</h2>
                  <p className="text-sm text-muted-foreground">
                    Enviaremos um link de recuperação
                  </p>
                </div>
              </div>
              
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                  {errors.forgotEmail && (
                    <p className="text-sm text-destructive">{errors.forgotEmail}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full h-12"
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
