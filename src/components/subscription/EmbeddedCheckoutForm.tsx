import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Initialize Stripe with publishable key
const stripePromise = loadStripe('pk_live_51S0qx03MU3lG84GwgNAJASwKRb2IkUFLJCmzpYxLt26fCXjlvTSPawqmf6CfUVTTyA4CUEzYUFEqLDBBbnMxEKdP00g5XspmSR');

interface CheckoutFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutFormContent: React.FC<CheckoutFormProps> = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setPaymentStatus('failed');
        setErrorMessage(error.message || 'Ocorreu um erro no pagamento.');
        toast.error(error.message || 'Erro no pagamento');
      } else if (paymentIntent?.status === 'succeeded') {
        setPaymentStatus('succeeded');
        toast.success('Pagamento realizado com sucesso!');
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else if (paymentIntent?.status === 'requires_action') {
        // 3D Secure or other action required - Stripe handles this automatically
        setPaymentStatus('processing');
      } else {
        setPaymentStatus('idle');
      }
    } catch (err: any) {
      setPaymentStatus('failed');
      setErrorMessage(err.message || 'Erro inesperado');
      toast.error('Erro ao processar pagamento');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStatus === 'succeeded') {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <CheckCircle className="w-16 h-16 text-green-500 animate-pulse" />
        <p className="text-lg font-semibold text-green-600">Pagamento Confirmado!</p>
        <p className="text-sm text-muted-foreground">Redirecionando...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-4 border">
        <PaymentElement 
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-gradient-to-r from-primary to-primary/80"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Pagar Agora
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" />
        Pagamento seguro e criptografado
      </p>
    </form>
  );
};

interface EmbeddedCheckoutFormProps {
  amount: number;
  serviceType: string;
  serviceName: string;
  onSuccess: () => void;
  onCancel: () => void;
  metadata?: Record<string, any>;
}

export const EmbeddedCheckoutForm: React.FC<EmbeddedCheckoutFormProps> = ({
  amount,
  serviceType,
  serviceName,
  onSuccess,
  onCancel,
  metadata,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('Você precisa estar logado para continuar.');
        }

        const { data, error: fnError } = await supabase.functions.invoke('create-payment-intent', {
          body: {
            amount,
            serviceType,
            serviceName,
            metadata,
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (fnError) throw fnError;
        if (!data?.clientSecret) throw new Error('Erro ao iniciar pagamento');

        setClientSecret(data.clientSecret);
      } catch (err: any) {
        console.error('Error creating payment intent:', err);
        setError(err.message || 'Erro ao iniciar pagamento');
        toast.error(err.message || 'Erro ao iniciar pagamento');
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [amount, serviceType, serviceName, metadata]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Preparando pagamento seguro...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-sm text-destructive text-center">{error}</p>
        <Button variant="outline" onClick={onCancel}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#6366f1',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444',
            fontFamily: 'Inter, system-ui, sans-serif',
            borderRadius: '8px',
          },
        },
        locale: 'pt-BR',
      }}
    >
      <CheckoutFormContent onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
};

export default EmbeddedCheckoutForm;
