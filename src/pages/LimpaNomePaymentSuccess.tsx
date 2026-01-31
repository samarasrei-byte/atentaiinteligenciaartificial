import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LimpaNomeOnboardingFlow } from '@/components/limpa-nome/LimpaNomeOnboardingFlow';
import { Loader2, CheckCircle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LimpaNomePaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, checkSubscription } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [prefillData, setPrefillData] = useState<{ email?: string; name?: string }>({});

  const sessionId = searchParams.get('session_id');
  const requestIdParam = searchParams.get('request_id');

  useEffect(() => {
    const processPayment = async () => {
      if (!sessionId) {
        navigate('/');
        return;
      }

      try {
        // Process guest payment to update request status
        const { data, error } = await supabase.functions.invoke('process-guest-payment', {
          body: { sessionId },
        });

        if (error) {
          console.error('Error processing payment:', error);
        }

        // Get request details
        if (requestIdParam) {
          setRequestId(requestIdParam);
          
          const { data: request } = await supabase
            .from('credit_repair_requests')
            .select('email, full_name, user_id, payment_status')
            .eq('id', requestIdParam)
            .single();

          if (request) {
            setPrefillData({
              email: request.email || undefined,
              name: request.full_name || undefined,
            });

            // If already logged in and payment confirmed, go to chat
            if (user && request.payment_status === 'paid') {
              navigate(`/chat/guilherme?servico=limpanome&request=${requestIdParam}`);
              return;
            }

            // If no user yet, show onboarding
            if (!request.user_id || data?.accountCreated) {
              setShowOnboarding(true);
            }
          }
        }

        await checkSubscription();
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    processPayment();
  }, [sessionId, requestIdParam, user, navigate, checkSubscription]);

  const handleOnboardingComplete = async (userId: string) => {
    // Create welcome message in chat
    await createWelcomeMessage(userId);
    
    // Navigate to chat
    navigate(`/chat/guilherme?servico=limpanome&request=${requestId}`);
  };

  const createWelcomeMessage = async (userId: string) => {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', userId)
      .single();

    const userName = profile?.full_name?.split(' ')[0] || 'Cliente';

    // Create welcome chat entry
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

    // Update request status to awaiting documents
    if (requestId) {
      await supabase
        .from('credit_repair_requests')
        .update({ 
          status: 'pending',
          // Status semanticamente = aguardando documentos
        })
        .eq('id', requestId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-400 mx-auto" />
          <p className="text-slate-400">Confirmando pagamento...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding && requestId) {
    return (
      <LimpaNomeOnboardingFlow
        requestId={requestId}
        prefillEmail={prefillData.email}
        prefillName={prefillData.name}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // Success screen for logged-in users
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
          <CheckCircle className="h-10 w-10 text-emerald-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">
          Pagamento Confirmado!
        </h1>
        <p className="text-slate-400 mb-8">
          Seu processo de Limpa Nome foi iniciado com sucesso.
        </p>

        <button
          onClick={() => navigate(`/chat/guilherme?servico=limpanome&request=${requestId}`)}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all"
        >
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-5 w-5" />
            Ir para o Chat
          </div>
        </button>
      </motion.div>
    </div>
  );
}
