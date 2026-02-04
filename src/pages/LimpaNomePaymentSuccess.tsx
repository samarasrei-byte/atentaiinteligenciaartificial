import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { QuickAccountSetup } from '@/components/limpa-nome/QuickAccountSetup';
import { Loader2, CheckCircle, Shield, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function LimpaNomePaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, checkSubscription } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [showAccountSetup, setShowAccountSetup] = useState(false);
  const [requestData, setRequestData] = useState<{
    id: string;
    email: string;
    fullName?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');
  const requestIdParam = searchParams.get('request_id');

  useEffect(() => {
    const processPayment = async () => {
      if (!sessionId || !requestIdParam) {
        setError('Parâmetros de pagamento inválidos');
        setIsLoading(false);
        return;
      }

      try {
        // Verify payment with backend
        const { data, error: processError } = await supabase.functions.invoke('process-guest-payment', {
          body: { sessionId, requestId: requestIdParam },
        });

        if (processError) {
          console.error('Error processing payment:', processError);
          // Continue even if error - webhook might have processed
        }

        // Get request details
        const { data: request, error: requestError } = await supabase
          .from('credit_repair_requests')
          .select('id, email, full_name, user_id, payment_status')
          .eq('id', requestIdParam)
          .single();

        if (requestError || !request) {
          console.error('Error fetching request:', requestError);
          setError('Não foi possível verificar o pagamento');
          setIsLoading(false);
          return;
        }

        // Check if user is already logged in
        if (user) {
          // User has account - link request and redirect to data collection
          await supabase
            .from('credit_repair_requests')
            .update({ 
              user_id: user.id,
              payment_status: 'paid',
              payment_confirmed_at: new Date().toISOString(),
              status: 'pending',
            })
            .eq('id', requestIdParam);

          // Redirect to data collection page instead of chat
          navigate(`/limpa-nome/dados?request_id=${requestIdParam}`);
          return;
        }

        // No user - show quick account setup
        setRequestData({
          id: request.id,
          email: request.email || '',
          fullName: request.full_name || undefined,
        });
        setShowAccountSetup(true);
        setIsLoading(false);

        await checkSubscription();
      } catch (err) {
        console.error('Error:', err);
        setError('Erro ao processar pagamento');
        setIsLoading(false);
      }
    };

    processPayment();
  }, [sessionId, requestIdParam, user, navigate, checkSubscription]);

  const createWelcomeMessage = async (userId: string, reqId: string) => {
    await supabase.from('user_welcome_chats').upsert({
      user_id: userId,
      chat_type: 'guilherme',
      message_date: new Date().toISOString().split('T')[0],
      service_context: 'limpanome',
      message_content: `Olá! 👋
Seu pagamento foi confirmado com sucesso.

Para iniciarmos o processo de Limpa Nome, envie aqui no chat os documentos abaixo:

📄 Documento com foto (RG ou CNH)
📄 CPF
📄 Comprovante de residência

Assim que recebermos os documentos, nossa equipe dará andamento imediato no seu atendimento. 😊`,
      is_read: false,
    }, {
      onConflict: 'user_id,chat_type,message_date',
    });
  };

  const handleAccountCreated = async (userId: string) => {
    if (!requestData) return;

    // Navigate to data collection page instead of chat
    navigate(`/limpa-nome/dados?request_id=${requestData.id}`);
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="mx-auto w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
            <AlertCircle className="h-10 w-10 text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">
            Algo deu errado
          </h1>
          <p className="text-slate-400 mb-8">
            {error}
          </p>

          <Button
            onClick={() => navigate('/limpa-nome')}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold"
          >
            Voltar para Limpa Nome
          </Button>
        </motion.div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
            </div>
          </motion.div>
          <h2 className="text-xl font-semibold text-white">
            Confirmando pagamento...
          </h2>
          <p className="text-slate-400 text-sm">
            Aguarde enquanto processamos
          </p>
        </div>
      </div>
    );
  }

  // Show quick account setup (just password)
  if (showAccountSetup && requestData) {
    return (
      <QuickAccountSetup
        requestId={requestData.id}
        email={requestData.email}
        fullName={requestData.fullName}
        onComplete={handleAccountCreated}
      />
    );
  }

  // Fallback success screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="mx-auto w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6"
        >
          <CheckCircle className="h-10 w-10 text-emerald-400" />
        </motion.div>
        
        <h1 className="text-2xl font-bold text-white mb-2">
          Pagamento Confirmado!
        </h1>
        <p className="text-slate-400 mb-8">
          Seu processo de Limpa Nome foi iniciado.
        </p>

        <Button
          onClick={() => navigate(`/chat/guilherme?servico=limpanome&request=${requestData?.id}`)}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all"
        >
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-5 w-5" />
            Ir para o Chat
          </div>
        </Button>
      </motion.div>
    </div>
  );
}
