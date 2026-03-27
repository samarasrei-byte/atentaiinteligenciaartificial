import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { 
  User, Mail, KeyRound, Eye, EyeOff, 
  ArrowRight, Shield, Check, Sparkles, Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PostOnboardingAuthProps {
  serviceType: 'limpanome' | 'fiscal';
  requestId: string;
  prefillData?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  onSuccess: (userId: string) => void;
  onSkip?: () => void;
}

/**
 * PostOnboardingAuth - Componente de criação de conta APÓS onboarding
 * 
 * REGRA SaaS: Usuário já investiu tempo no onboarding → maior conversão
 * Cria conta → Auto-login → Redireciona para painel com chat aberto
 */
export const PostOnboardingAuth: React.FC<PostOnboardingAuthProps> = ({
  serviceType,
  requestId,
  prefillData,
  onSuccess,
  onSkip,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'register' | 'login'>('register');
  
  const [formData, setFormData] = useState({
    fullName: prefillData?.fullName || '',
    email: prefillData?.email || '',
    password: '',
  });

  const serviceLabels = {
    'limpanome': 'Limpa Nome',
    'fiscal': 'Análise Fiscal',
    'bi-contabilidade': 'BI+ Contabilidade',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'register') {
        // Create account
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: formData.fullName,
            },
          },
        });

        if (signUpError) throw signUpError;
        
        if (authData.user) {
          // Auto-login happens automatically with Supabase
          // Update the service request with user_id
          await linkRequestToUser(authData.user.id);
          
          toast.success('Conta criada! Redirecionando para seu painel...');
          onSuccess(authData.user.id);
        }
      } else {
        // Login existing account
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw signInError;
        
        if (authData.user) {
          await linkRequestToUser(authData.user.id);
          
          toast.success('Login realizado! Redirecionando...');
          onSuccess(authData.user.id);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      if (error.message?.includes('already registered')) {
        toast.error('Este email já está cadastrado. Faça login.');
        setMode('login');
      } else {
        toast.error(error.message || 'Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const linkRequestToUser = async (userId: string) => {
    // Link the service request to the newly created user
    try {
      if (serviceType === 'limpanome') {
        const { error } = await supabase
          .from('credit_repair_requests')
          .update({ user_id: userId })
          .eq('id', requestId);
        if (error) console.error('Error linking limpa nome request:', error);
      } else {
        // fiscal and bi-contabilidade use fiscal_analysis_requests
        const { error } = await supabase
          .from('fiscal_analysis_requests')
          .update({ user_id: userId })
          .eq('id', requestId);
        if (error) console.error('Error linking fiscal request:', error);
      }
    } catch (error) {
      console.error('Error linking request to user:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border-2 border-primary/20 shadow-2xl bg-card/95 backdrop-blur-xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-primary to-purple-600 mb-6 shadow-2xl shadow-primary/40"
              animate={{ 
                rotateY: [0, 10, -10, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <User className="h-10 w-10 text-primary-foreground" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {mode === 'register' ? 'Crie sua conta' : 'Faça login'}
            </h2>
            <p className="text-muted-foreground text-sm">
              Para acompanhar sua solicitação de <strong className="text-primary">{serviceLabels[serviceType]}</strong>
            </p>
          </div>

          {/* Benefits reminder */}
          <div className="bg-muted/50 rounded-xl p-4 mb-6 space-y-2">
            <p className="text-xs font-medium text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Com sua conta você terá:
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-primary" />
                Chat direto com seu especialista
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-primary" />
                Acompanhamento em tempo real
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-primary" />
                Documentos já anexados ao caso
              </li>
            </ul>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Nome completo
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="h-12"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-sm">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === 'register' ? "Mínimo 6 caracteres" : "Sua senha"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="h-12 pr-12"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:shadow-xl hover:shadow-primary/30 transition-all group"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {mode === 'register' ? 'Criar conta e continuar' : 'Entrar e continuar'}
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle mode */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {mode === 'register' ? 'Já tem conta? Faça login' : 'Não tem conta? Crie agora'}
            </button>
          </div>

          {/* Security badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4" />
            Dados protegidos com criptografia
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PostOnboardingAuth;
