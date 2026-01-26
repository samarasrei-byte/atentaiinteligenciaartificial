import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Lock, 
  User, 
  Loader2, 
  Building2, 
  ArrowLeft, 
  Briefcase, 
  Calculator, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Shield,
  TrendingUp,
  Zap,
  Globe,
  BarChart3
} from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { logAuditEvent } from '@/hooks/useAuditLog';
import { motion, AnimatePresence } from 'framer-motion';

// Validation schemas
const emailSchema = z.string().email('Email inválido');
const passwordSchema = z.string().min(6, 'Senha deve ter pelo menos 6 caracteres');
const nameSchema = z.string().min(2, 'Nome deve ter pelo menos 2 caracteres');

type UserType = 'empresa' | 'autonomo' | 'contador';
type AuthMode = 'login' | 'signup';

interface UserTypeOption {
  type: UserType;
  label: string;
  icon: React.ElementType;
  gradient: string;
  description: string;
}

const userTypes: UserTypeOption[] = [
  { 
    type: 'empresa', 
    label: 'Empresa', 
    icon: Building2, 
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Empresas de todos os portes' 
  },
  { 
    type: 'autonomo', 
    label: 'Autônomo', 
    icon: Briefcase, 
    gradient: 'from-purple-500 to-pink-500',
    description: 'Profissionais liberais' 
  },
  { 
    type: 'contador', 
    label: 'Contador', 
    icon: Calculator, 
    gradient: 'from-emerald-500 to-teal-500',
    description: 'Contadores parceiros' 
  },
];

// Features for left panel carousel
const features = [
  {
    icon: TrendingUp,
    title: 'Simulador Tributário',
    description: 'Compare regimes e economize até 40%'
  },
  {
    icon: BarChart3,
    title: 'IA Especializada',
    description: 'Tire dúvidas sobre a Reforma Tributária'
  },
  {
    icon: Shield,
    title: 'Consultoria Premium',
    description: 'Contadores especialistas à sua disposição'
  },
  {
    icon: Zap,
    title: 'Limpa Nome Empresarial',
    description: 'Recupere seu crédito de forma legal'
  },
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
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const fromOnboarding = searchParams.get('from') === 'onboarding';
  const pendingOnboardingData = sessionStorage.getItem('pendingOnboardingData');

  // Feature carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
              navigate('/dashboard');
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
        
        await logAuditEvent({
          userEmail: email,
          actionType: 'login_failed',
          routeAttempted: '/auth',
          success: false,
          failureReason: message,
          metadata: { error_type: error.message }
        });
        
        toast({
          variant: 'destructive',
          title: 'Erro no login',
          description: message,
        });
      } else {
        const { data: sessionData } = await supabase.auth.getSession();
        await logAuditEvent({
          userId: sessionData.session?.user?.id,
          userEmail: email,
          actionType: 'login_success',
          routeAttempted: '/auth',
          success: true,
          metadata: { login_method: 'email_password' }
        });
        
        toast({
          title: 'Bem-vindo de volta!',
          description: 'Redirecionando para seu painel...',
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
          title: 'Conta criada com sucesso!',
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Forgot Password Modal
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <button
              onClick={() => setShowForgotPassword(false)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Recuperar senha</h2>
            <p className="text-slate-500 mb-6">
              Digite seu email para receber o link de recuperação
            </p>
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgotEmail" className="text-slate-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="forgotEmail"
                    type="email"
                    placeholder="seu@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="pl-12 h-12 bg-slate-50 border-slate-200"
                  />
                </div>
                {errors.forgotEmail && (
                  <p className="text-sm text-red-500">{errors.forgotEmail}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Enviar link de recuperação'
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Dark Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-slate-950 flex-col justify-between p-10 xl:p-16">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(45,212,191,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[150px]" />
        </div>
        
        {/* Back button */}
        <div className="relative z-10">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white hover:bg-white/10 gap-2 -ml-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
        
        {/* Main Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-lg">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src="/logo-atentai.png" 
              alt="AtentAI" 
              className="h-12 w-auto drop-shadow-[0_0_25px_rgba(45,212,191,0.5)]"
            />
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">
            AtentAI
          </h1>
          <p className="text-lg text-slate-400 mb-10">
            A plataforma mais inteligente para gestão tributária e financeira empresarial
          </p>
          
          {/* Feature Carousel */}
          <div className="relative h-[100px] mb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <div className="flex items-start gap-4 p-5 rounded-xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center flex-shrink-0">
                    {React.createElement(features[currentFeature].icon, { 
                      className: "h-6 w-6 text-white" 
                    })}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg mb-1">
                      {features[currentFeature].title}
                    </h3>
                    <p className="text-slate-400">
                      {features[currentFeature].description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Carousel indicators */}
            <div className="absolute -bottom-6 left-0 flex gap-2">
              {features.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentFeature(idx)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    idx === currentFeature 
                      ? "w-8 bg-primary" 
                      : "w-1.5 bg-slate-700 hover:bg-slate-600"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Trust badges */}
        <div className="relative z-10 flex items-center gap-8 text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="text-sm">Dados Protegidos</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="text-sm">100% Cloud</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="text-sm">Alta Performance</span>
          </div>
        </div>
      </div>
      
      {/* Right Panel - White Form Section */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col justify-center bg-white p-6 md:p-10 xl:p-16">
        {/* Mobile back button */}
        <div className="lg:hidden mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-slate-700 gap-2 -ml-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
        
        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Mobile logo */}
            <div className="lg:hidden mb-6">
              <img 
                src="/logo-atentai.png" 
                alt="AtentAI" 
                className="h-10 w-auto mx-auto"
              />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              {mode === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta grátis'}
            </h2>
            <p className="text-slate-500">
              {mode === 'login' 
                ? 'Entre para acessar sua conta' 
                : 'Comece a economizar em minutos'}
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {/* User Type Selection (only for signup) */}
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <Label className="text-sm font-medium text-slate-700">Eu sou</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {userTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = userType === type.type;
                      return (
                        <button
                          key={type.type}
                          type="button"
                          onClick={() => setUserType(type.type)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                            isSelected
                              ? "border-primary bg-primary/5 text-slate-900"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                            isSelected 
                              ? `bg-gradient-to-br ${type.gradient}` 
                              : "bg-slate-200"
                          )}>
                            <Icon className={cn("h-5 w-5", isSelected ? "text-white" : "text-slate-500")} />
                          </div>
                          <span className="text-xs font-medium">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Name field (only for signup) */}
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                    Nome completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-12 h-12 bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            
            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            
            {/* Forgot password (login only) */}
            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}
            
            {/* Submit button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary via-cyan-500 to-blue-500 hover:opacity-90 transition-opacity text-white font-semibold rounded-xl shadow-lg shadow-primary/25"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  {mode === 'login' ? 'Entrar' : 'Criar conta'}
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
          
          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">OU</span>
            </div>
          </div>
          
          {/* Toggle mode */}
          <div className="text-center">
            <p className="text-slate-600">
              {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              {' '}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="font-semibold text-primary hover:text-primary/80"
              >
                {mode === 'login' ? 'Criar conta grátis' : 'Fazer login'}
              </button>
            </p>
          </div>
          
          {/* Terms */}
          <p className="text-center text-xs text-slate-400 mt-8">
            Ao continuar, você concorda com nossos{' '}
            <Link to="/termos" className="text-primary hover:underline">Termos de Uso</Link>
            {' '}e{' '}
            <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
