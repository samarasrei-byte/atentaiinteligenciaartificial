import { AlertTriangle, CreditCard } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { toast } from 'sonner';

export function PastDueAlert() {
  const { subscription, session } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!subscription.isPastDue) {
    return null;
  }

  const handleUpdatePayment = () => {
    toast.info('Entre em contato com o suporte para atualizar sua forma de pagamento.');
  };

  return (
    <Alert variant="destructive" className="mb-4 border-destructive/50 bg-destructive/10">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="text-lg font-semibold">
        Pagamento Pendente
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">
          Sua assinatura está com pagamento pendente. As funcionalidades premium estão 
          temporariamente bloqueadas até a regularização do pagamento.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleUpdatePayment} 
            disabled={loading}
            variant="destructive"
            className="gap-2"
          >
            <CreditCard className="h-4 w-4" />
            {loading ? 'Abrindo...' : 'Atualizar Forma de Pagamento'}
          </Button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Seu plano: <strong className="text-foreground">{subscription.plan}</strong>
          {subscription.subscriptionEnd && (
            <> • Vence em: <strong className="text-foreground">
              {new Date(subscription.subscriptionEnd).toLocaleDateString('pt-BR')}
            </strong></>
          )}
        </p>
      </AlertDescription>
    </Alert>
  );
}
