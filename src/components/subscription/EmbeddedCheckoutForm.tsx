import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { MPTransparentCheckout } from '@/components/payments/MPTransparentCheckout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  const { user, session, profile } = useAuth();

  if (!user?.email || !session) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-sm text-destructive text-center">Você precisa estar logado para continuar.</p>
        <Button variant="outline" onClick={onCancel}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MPTransparentCheckout
        amountCents={amount}
        serviceName={serviceName}
        serviceType={serviceType}
        payerEmail={user.email}
        payerName={profile?.full_name || 'Cliente'}
        accessToken={session.access_token}
        metadata={metadata ? Object.fromEntries(
          Object.entries(metadata).map(([k, v]) => [k, String(v)])
        ) : undefined}
        onSuccess={() => {
          toast.success('Pagamento realizado com sucesso!');
          onSuccess();
        }}
      />

      <Button variant="outline" onClick={onCancel} className="w-full">
        Cancelar
      </Button>
    </div>
  );
};

export default EmbeddedCheckoutForm;
