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
  Sparkles,
  Phone
} from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { logAuditEvent } from '@/hooks/useAuditLog';
import { motion, AnimatePresence } from 'framer-motion';

// Validation schemas
const emailSchema = z.string().email('Email inválido');
const passwordSchema = z.string().min(6, 'Senha deve ter pelo menos 6 caracteres');
const nameSchema = z.string().min(2, 'Nome deve ter pelo menos 2 caracteres');
const phoneSchema = z.string().min(10, 'WhatsApp inválido').optional();

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
  const [phone, setPhone] = useState('');
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
          <p className="text-white/60">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/30 rounded-full blur-[150px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px]" 
        />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Back Button */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-6 z-20"
      >
        <Button
          variant="ghost"
          size="sm"
          className="text-white/60 hover:text-white hover:bg-white/10"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <motion.img 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              src="/logo-atentai.png" 
              alt="AtentAI" 
              className="h-16 w-auto mx-auto mb-8"
            />
            
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold text-white mb-3"
            >
              {mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-white/60 text-lg"
            >
              {mode === 'login' 
                ? 'Entre com seus dados para continuar' 
                : 'Junte-se a milhares de profissionais'}
            </motion.p>
          </div>

          {/* Auth Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative"
          >
            {/* Glassmorphism Card */}
            <div className="relative rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 p-8">
              {/* Subtle gradient border effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-accent/10 opacity-50 pointer-events-none" />
              
              <div className="relative z-10">
                {/* Mode Toggle */}
                <div className="flex rounded-2xl bg-white/5 p-1.5 mb-8">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className={cn(
                      "flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300",
                      mode === 'login' 
                        ? "bg-primary text-white shadow-lg shadow-primary/30" 
                        : "text-white/60 hover:text-white"
                    )}
                  >
                    Entrar
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className={cn(
                      "flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300",
                      mode === 'signup' 
                        ? "bg-primary text-white shadow-lg shadow-primary/30" 
                        : "text-white/60 hover:text-white"
                    )}
                  >
                    Cadastrar
                  </button>
                </div>

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
                        <Label className="text-sm font-medium text-white/80">Eu sou</Label>
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
                                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300",
                                  isSelected
                                    ? `border-primary bg-primary/20 text-white`
                                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white"
                                )}
                              >
                                <div className={cn(
                                  "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                                  isSelected 
                                    ? `bg-gradient-to-br ${type.gradient}` 
                                    : "bg-white/10"
                                )}>
                                  <Icon className="h-5 w-5 text-white" />
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
                        <Label htmlFor="name" className="text-sm font-medium text-white/80">Nome completo</Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                          <Input
                            id="name"
                            type="text"
                            placeholder="Seu nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl focus:border-primary focus:ring-primary/20"
                          />
                        </div>
                        {errors.name && (
                          <p className="text-sm text-red-400">{errors.name}</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-white/80">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-400">{errors.email}</p>
                    )}
                  </div>

                  {/* WhatsApp field (only for signup) */}
                  <AnimatePresence>
                    {mode === 'signup' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="phone" className="text-sm font-medium text-white/80">WhatsApp</Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="(11) 99999-9999"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl focus:border-primary focus:ring-primary/20"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Password field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-white/80">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 pr-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl focus:border-primary focus:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-400">{errors.password}</p>
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
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button
                      type="submit"
                      className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30 transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : null}
                      {mode === 'login' ? 'Entrar no meu painel' : 'Criar conta e acessar'}
                      {!isLoading && <ArrowRight className="h-5 w-5 ml-2" />}
                    </Button>
                  </motion.div>
                </form>

                {/* Switch mode link */}
                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                  <p className="text-sm text-white/60">
                    {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                    <button
                      type="button"
                      onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                      className="ml-2 text-primary hover:text-primary/80 font-semibold transition-colors"
                    >
                      {mode === 'login' ? 'Criar conta' : 'Entrar'}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex items-center justify-center gap-2 text-white/40"
          >
            <Shield className="h-4 w-4" />
            <span className="text-xs">Conexão segura e criptografada</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowForgotPassword(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl bg-slate-900 border border-white/10 shadow-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowForgotPassword(false)}
                  className="h-10 w-10 text-white/60 hover:text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h2 className="font-semibold text-white text-lg">Recuperar Senha</h2>
                  <p className="text-sm text-white/60">
                    Enviaremos um link de recuperação
                  </p>
                </div>
              </div>
              
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white/80">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl"
                    />
                  </div>
                  {errors.forgotEmail && (
                    <p className="text-sm text-red-400">{errors.forgotEmail}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full h-14 rounded-xl font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  Enviar Link de Recuperação
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Auth;
