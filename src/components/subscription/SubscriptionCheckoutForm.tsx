import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard, Lock, Check, AlertCircle } from 'lucide-react';
import { loadMercadoPago } from '@/lib/mercadopago';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/plans';

interface SubscriptionCheckoutFormProps {
  planType: string;
  planName: string;
  amountCents: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const SubscriptionCheckoutForm: React.FC<SubscriptionCheckoutFormProps> = ({
  planType,
  planName,
  amountCents,
  onSuccess,
  onCancel,
}) => {
  const { user, session, profile, checkSubscription } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardholderName: '',
    expirationMonth: '',
    expirationYear: '',
    securityCode: '',
    identificationType: 'CPF',
    identificationNumber: '',
  });

  if (!user?.email || !session) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-sm text-destructive text-center">Você precisa estar logado para continuar.</p>
        <Button variant="outline" onClick={onCancel}>Voltar</Button>
      </div>
    );
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 16);
    return v.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatCPF = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 11);
    return v.replace(/(\d{3})(\d{3})?(\d{3})?(\d{2})?/, (_, a, b, c, d) => {
      let r = a;
      if (b) r += `.${b}`;
      if (c) r += `.${c}`;
      if (d) r += `-${d}`;
      return r;
    });
  };

  const handleSubscribe = async () => {
    if (!cardForm.identificationNumber || cardForm.identificationNumber.replace(/\D/g, '').length < 11) {
      toast.error('CPF é obrigatório para assinatura');
      return;
    }
    if (!cardForm.cardNumber || cardForm.cardNumber.replace(/\s/g, '').length < 13) {
      toast.error('Número do cartão inválido');
      return;
    }

    setIsLoading(true);
    setLoadingStep('Tokenizando cartão...');

    try {
      const mp = await loadMercadoPago();

      const tokenResponse = await mp.createCardToken({
        cardNumber: cardForm.cardNumber.replace(/\s/g, ''),
        cardholderName: cardForm.cardholderName,
        cardExpirationMonth: cardForm.expirationMonth,
        cardExpirationYear: cardForm.expirationYear,
        securityCode: cardForm.securityCode,
        identificationType: cardForm.identificationType,
        identificationNumber: cardForm.identificationNumber.replace(/\D/g, ''),
      });

      if (tokenResponse.error) {
        throw new Error('Erro ao tokenizar cartão. Verifique os dados.');
      }

      setLoadingStep('Criando assinatura...');

      const { data, error } = await supabase.functions.invoke('create-mp-subscription', {
        body: {
          planType,
          planName,
          amountCents,
          cardTokenId: tokenResponse.id,
          payerEmail: user.email,
          payerName: profile?.full_name || 'Cliente',
          payerIdentification: {
            type: cardForm.identificationType,
            number: cardForm.identificationNumber.replace(/\D/g, ''),
          },
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || 'Erro ao criar assinatura');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success('Assinatura ativada com sucesso! 🎉');
      await checkSubscription();
      onSuccess();
    } catch (err: any) {
      console.error('[SubscriptionCheckout] Error:', err);
      toast.error(err.message || 'Erro ao processar assinatura');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-3 text-center">
        <p className="text-sm font-medium">Assinatura mensal com renovação automática</p>
        <p className="text-xs text-muted-foreground mt-1">
          Cobrado {formatPrice(amountCents)}/mês no cartão de crédito
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="sub-cardNumber">Número do Cartão</Label>
          <Input
            id="sub-cardNumber"
            placeholder="0000 0000 0000 0000"
            value={cardForm.cardNumber}
            onChange={(e) => setCardForm(prev => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))}
            maxLength={19}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sub-cardholderName">Nome no Cartão</Label>
          <Input
            id="sub-cardholderName"
            placeholder="NOME COMO NO CARTÃO"
            value={cardForm.cardholderName}
            onChange={(e) => setCardForm(prev => ({ ...prev, cardholderName: e.target.value.toUpperCase() }))}
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2">
            <Label htmlFor="sub-expMonth">Mês</Label>
            <Input
              id="sub-expMonth"
              placeholder="MM"
              value={cardForm.expirationMonth}
              onChange={(e) => setCardForm(prev => ({ ...prev, expirationMonth: e.target.value.replace(/\D/g, '').slice(0, 2) }))}
              maxLength={2}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sub-expYear">Ano</Label>
            <Input
              id="sub-expYear"
              placeholder="AA"
              value={cardForm.expirationYear}
              onChange={(e) => setCardForm(prev => ({ ...prev, expirationYear: e.target.value.replace(/\D/g, '').slice(0, 2) }))}
              maxLength={2}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sub-cvv">CVV</Label>
            <Input
              id="sub-cvv"
              placeholder="123"
              value={cardForm.securityCode}
              onChange={(e) => setCardForm(prev => ({ ...prev, securityCode: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
              maxLength={4}
              type="password"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sub-cpf">CPF</Label>
          <Input
            id="sub-cpf"
            placeholder="000.000.000-00"
            value={cardForm.identificationNumber}
            onChange={(e) => setCardForm(prev => ({ ...prev, identificationNumber: formatCPF(e.target.value) }))}
            maxLength={14}
            disabled={isLoading}
          />
        </div>
      </div>

      <Button
        onClick={handleSubscribe}
        disabled={isLoading}
        className="w-full h-14 text-base font-semibold"
        size="lg"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{loadingStep || 'Processando...'}</span>
          </div>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Assinar {formatPrice(amountCents)}/mês
          </>
        )}
      </Button>

      <div className="flex items-center justify-center text-xs text-muted-foreground gap-2">
        <Lock className="h-3 w-3" />
        Renovação automática • Cancele quando quiser
      </div>

      <Button variant="outline" onClick={onCancel} className="w-full" disabled={isLoading}>
        Cancelar
      </Button>
    </div>
  );
};

export default SubscriptionCheckoutForm;
