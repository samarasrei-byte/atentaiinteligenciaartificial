import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  CheckCircle, ArrowRight, Lock, Mail, User, Sparkles,
  MessageCircle, Loader2, Eye, EyeOff
} from 'lucide-react';

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const requestId = searchParams.get('request_id');
  const serviceType = searchParams.get('type') || 'service';
  const isGuest = searchParams.get('guest') === 'true';
  const email = searchParams.get('email') || '';

  const [step, setStep] = useState<'success' | 'create_account' | 'done'>('success');
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userEmail, setUserEmail] = useState(email);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // Auto-advance to account creation after 2 seconds
    const timer = setTimeout(() => {
      if (isGuest) {
        setStep('create_account');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isGuest]);

  const getServiceName = () => {
    const serviceNames: Record<string, string> = {
      'credit_repair': 'Limpa Nome',
      'credit_repair_pf': 'Limpa Nome Pessoa Física',
      'credit_repair_pj': 'Limpa Nome Empresa',
      'ir': 'Declaração de IR',
      'ir_simples': 'Declaração IR Simples',
      'ir_completo': 'Declaração IR Completo',
      'certificate': 'Emissão de Certidão',
      'company_opening': 'Abertura de Empresa',
    };
    return serviceNames[serviceType] || 'Serviço';
  };

  const getChatRoute = () => {
    // IR services are 100% AI - redirect to Contador IA panel
    if (serviceType === 'ir_simples' || serviceType === 'ir_completo' || serviceType === 'ir') {
      return '/contador-ia';
    }
    if (serviceType.includes('credit_repair') || serviceType === 'certificate') {
      return '/chat/guilherme';
    }
    if (serviceType === 'company_opening' || serviceType.includes('bi')) {
      return '/chat/guilherme';
    }
    return '/dashboard';
  };

  const handleCreateAccount = async () => {
    if (!userEmail) {
      toast.error('E-mail é obrigatório');
      return;
    }

    if (password.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Senhas não conferem');
      return;
    }

    setIsLoading(true);

    try {
      // Create the user account
      const { data, error } = await supabase.auth.signUp({
        email: userEmail.toLowerCase().trim(),
        password,
        options: {
          data: {
            source: 'checkout_first',
            service_type: serviceType,
            request_id: requestId,
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          // User already exists, try to sign in
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: userEmail.toLowerCase().trim(),
            password,
          });

          if (signInError) {
            toast.error('E-mail já cadastrado. Use a senha correta ou recupere sua senha.');
            return;
          }
        } else {
          throw error;
        }
      }

      // Update the request with the new user ID if we have one
      if (data?.user && requestId) {
        // Try to update the request record for each possible table
        // We use individual calls since we don't know which table the request is in
        try {
          await supabase
            .from('credit_repair_requests')
            .update({ user_id: data.user.id })
            .eq('id', requestId)
            .eq('user_id', '00000000-0000-0000-0000-000000000000');
        } catch (e) { /* ignore */ }
        
        try {
          await supabase
            .from('ir_requests')
            .update({ user_id: data.user.id })
            .eq('id', requestId)
            .eq('user_id', '00000000-0000-0000-0000-000000000000');
        } catch (e) { /* ignore */ }
        
        try {
          await supabase
            .from('certificate_requests')
            .update({ user_id: data.user.id })
            .eq('id', requestId)
            .eq('user_id', '00000000-0000-0000-0000-000000000000');
        } catch (e) { /* ignore */ }
        
        try {
          await supabase
            .from('company_opening_requests')
            .update({ user_id: data.user.id })
            .eq('id', requestId)
            .eq('user_id', '00000000-0000-0000-0000-000000000000');
        } catch (e) { /* ignore */ }
      }

      toast.success('Conta criada com sucesso!');
      setStep('done');

      // Redirect to chat after brief delay
      setTimeout(() => {
        navigate(getChatRoute());
      }, 1500);

    } catch (error: any) {
      console.error('Account creation error:', error);
      toast.error(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipAccountCreation = () => {
    toast.info('Você pode criar sua conta depois acessando o link enviado por e-mail.');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Success State */}
        {step === 'success' && (
          <Card className="bg-white border-0 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              >
                <CheckCircle className="h-20 w-20 text-white mx-auto mb-4" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2">Pagamento Confirmado!</h1>
              <p className="text-white/80">{getServiceName()}</p>
            </div>

            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-slate-600">Preparando seu acesso...</span>
              </div>
              <p className="text-slate-500 text-sm">
                Aguarde um momento enquanto configuramos sua conta.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Account Creation State */}
        {step === 'create_account' && (
          <Card className="bg-white border-0 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-center">
              <Sparkles className="h-12 w-12 text-white mx-auto mb-3" />
              <h1 className="text-xl font-bold text-white mb-1">Seu acesso está liberado!</h1>
              <p className="text-white/80 text-sm">Vamos configurar sua conta</p>
            </div>

            <CardContent className="p-6">
              <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-900 text-sm">Pagamento confirmado</p>
                    <p className="text-xs text-emerald-700">
                      {getServiceName()} • Acesso garantido
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Criar Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="h-12 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-700">
                    Confirmar Senha
                  </Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="h-12"
                  />
                </div>

                <Button
                  onClick={handleCreateAccount}
                  disabled={isLoading}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 mr-2" />
                      Criar Minha Conta
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>

                <button
                  onClick={handleSkipAccountCreation}
                  className="w-full text-sm text-slate-500 hover:text-slate-700 py-2"
                >
                  Criar conta depois
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Done State */}
        {step === 'done' && (
          <Card className="bg-white border-0 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-accent p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <CheckCircle className="h-20 w-20 text-white mx-auto mb-4" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2">Tudo Pronto!</h1>
              <p className="text-white/80">Sua conta foi criada com sucesso</p>
            </div>

            <CardContent className="p-6 text-center space-y-4">
              <p className="text-slate-600">
                Redirecionando você para o chat com seu especialista...
              </p>

              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-primary font-medium">Aguarde...</span>
              </div>

              <Button
                onClick={() => navigate(getChatRoute())}
                className="w-full h-12 bg-primary hover:bg-primary/90"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Ir para o Chat Agora
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
