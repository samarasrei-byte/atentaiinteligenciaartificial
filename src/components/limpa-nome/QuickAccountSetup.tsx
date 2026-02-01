import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle
} from 'lucide-react';

interface QuickAccountSetupProps {
  requestId: string;
  email: string;
  fullName?: string;
  onComplete: (userId: string) => void;
}

export function QuickAccountSetup({ 
  requestId, 
  email,
  fullName,
  onComplete 
}: QuickAccountSetupProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = password.length >= 6;

  const handleCreateAccount = async () => {
    if (!canSubmit) return;
    
    setIsLoading(true);

    try {
      // 1. Try to create account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/chat/guilherme?servico=limpanome&request=${requestId}`,
          data: {
            full_name: fullName || '',
            created_from: 'limpa_nome_checkout',
          },
        },
      });

      if (authError) {
        // User already exists - try to login
        if (authError.message.includes('already registered')) {
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (loginError) {
            toast.error('Email já cadastrado. Se é sua conta, use a senha correta.');
            setIsLoading(false);
            return;
          }

          if (loginData.user) {
            await linkRequestToUser(loginData.user.id);
            onComplete(loginData.user.id);
            return;
          }
        }
        
        // Weak password
        if (authError.message.includes('weak') || authError.message.includes('password')) {
          toast.error('Senha muito curta. Use pelo menos 6 caracteres.');
          setIsLoading(false);
          return;
        }
        
        throw authError;
      }

      if (authData.user) {
        await linkRequestToUser(authData.user.id);
        
        // Auto-login if session exists
        if (authData.session) {
          onComplete(authData.user.id);
        } else {
          // Need email confirmation - still proceed
          toast.success('Conta criada! Verifique seu email para confirmar.');
          onComplete(authData.user.id);
        }
      }
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast.error(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const linkRequestToUser = async (userId: string) => {
    // Link credit repair request to user (replaces placeholder or guest user_id)
    const { error } = await supabase
      .from('credit_repair_requests')
      .update({
        user_id: userId,
        payment_status: 'paid',
        status: 'pending', // Aguardando documentos
      })
      .eq('id', requestId);

    if (error) {
      console.error('Error linking request to user:', error);
    }

    // Update/create profile
    await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        full_name: fullName || '',
        email: email,
      }, { onConflict: 'user_id' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        {/* Success Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">Pagamento confirmado</span>
          </div>
        </motion.div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Crie sua senha
              </h1>
              <p className="text-slate-400 text-sm">
                Para acompanhar seu atendimento e conversar com nossa equipe
              </p>
            </div>

            {/* Email Display */}
            <div className="mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-xs text-slate-500 mb-1">Seu email</p>
              <p className="text-white font-medium truncate">{email}</p>
            </div>

            {/* Password Input */}
            <div className="space-y-2 mb-6">
              <Label className="text-slate-300">Criar senha</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="pl-12 pr-12 h-14 bg-slate-800/50 border-slate-700 text-white text-lg placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-emerald-500/50"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && canSubmit && handleCreateAccount()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleCreateAccount}
              disabled={!canSubmit || isLoading}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-base border-0 shadow-lg shadow-emerald-500/25 disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Acessar meu painel
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>

            {/* Promise Banner */}
            <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-emerald-200">
                    Seu especialista já está te esperando
                  </p>
                  <p className="text-xs text-emerald-300/70 mt-1">
                    Em segundos você estará conversando com Guilherme
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          🔒 Conexão segura • Dados protegidos
        </p>
      </motion.div>
    </div>
  );
}
