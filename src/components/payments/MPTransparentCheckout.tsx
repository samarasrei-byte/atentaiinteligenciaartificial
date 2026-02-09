import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, QrCode, Copy, Check, RefreshCw } from 'lucide-react';
import { loadMercadoPago, MP_STATUS_MAP } from '@/lib/mercadopago';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/stripe';

interface MPTransparentCheckoutProps {
  amountCents: number;
  serviceName: string;
  serviceType: string;
  description?: string;
  payerEmail: string;
  payerName: string;
  metadata?: Record<string, string>;
  onSuccess: (paymentId: number) => void;
  onError?: (error: string) => void;
  accessToken?: string;
}

type PaymentTab = 'pix' | 'card';

interface PixData {
  qr_code_base64: string;
  copy_paste: string;
  ticket_url?: string;
  paymentId: number;
}

export const MPTransparentCheckout: React.FC<MPTransparentCheckoutProps> = ({
  amountCents,
  serviceName,
  serviceType,
  description,
  payerEmail,
  payerName,
  metadata,
  onSuccess,
  onError,
  accessToken,
}) => {
  const [activeTab, setActiveTab] = useState<PaymentTab>('pix');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [pollingStatus, setPollingStatus] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Card form state
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardholderName: '',
    expirationMonth: '',
    expirationYear: '',
    securityCode: '',
    identificationType: 'CPF',
    identificationNumber: '',
    installments: 1,
  });

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const startPolling = useCallback((paymentId: number) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes at 5s intervals
    
    pollingRef.current = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setPollingStatus('timeout');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('mp-payment-status', {
          body: { paymentId },
        });

        if (error) return;

        setPollingStatus(data.status);
        
        if (data.status === 'approved') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          onSuccess(paymentId);
          toast.success('Pagamento aprovado! 🎉');
        } else if (['rejected', 'cancelled', 'refunded'].includes(data.status)) {
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch {
        // Silently continue polling
      }
    }, 5000);
  }, [onSuccess]);

  const createPayment = async (paymentMethodId: string, extraBody: Record<string, unknown> = {}) => {
    setIsLoading(true);
    try {
      const [firstName, ...rest] = payerName.split(' ');
      const lastName = rest.join(' ') || firstName;

      const headers: Record<string, string> = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const { data, error } = await supabase.functions.invoke('create-mp-payment', {
        body: {
          amount: amountCents,
          description: description || serviceName,
          serviceType,
          serviceName,
          paymentMethodId,
          payer: {
            email: payerEmail,
            first_name: firstName,
            last_name: lastName,
            identification: cardForm.identificationNumber ? {
              type: cardForm.identificationType,
              number: cardForm.identificationNumber.replace(/\D/g, ''),
            } : undefined,
          },
          metadata,
          ...extraBody,
        },
        headers,
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return data;
    } catch (err: any) {
      const msg = err.message || 'Erro ao processar pagamento';
      toast.error(msg);
      onError?.(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // =================== PIX ===================
  const handlePix = async () => {
    try {
      const data = await createPayment('pix');

      if (data.pix_qr_code_base64 && data.pix_copy_paste) {
        setPixData({
          qr_code_base64: data.pix_qr_code_base64,
          copy_paste: data.pix_copy_paste,
          ticket_url: data.ticket_url,
          paymentId: data.id,
        });
        startPolling(data.id);
        toast.info('PIX gerado! Escaneie o QR Code ou copie o código.');
      } else {
        throw new Error('Dados do PIX não retornados');
      }
    } catch {
      // Error already handled
    }
  };

  // =================== CARD ===================
  const handleCard = async () => {
    if (!cardForm.identificationNumber) {
      toast.error('CPF é obrigatório para pagamento com cartão');
      return;
    }

    try {
      const mp = await loadMercadoPago();
      
      // Create card token via SDK
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

      const data = await createPayment('card', {
        token: tokenResponse.id,
        installments: cardForm.installments,
      });

      if (data.status === 'approved') {
        onSuccess(data.id);
        toast.success('Pagamento aprovado! 🎉');
      } else if (data.status === 'in_process' || data.status === 'pending') {
        startPolling(data.id);
        toast.info('Pagamento em processamento...');
      } else {
        const statusInfo = MP_STATUS_MAP[data.status] || { label: data.status };
        toast.error(`Pagamento ${statusInfo.label}: ${data.status_detail || ''}`);
      }
    } catch (err: any) {
      if (!err.message?.includes('Erro ao processar')) {
        toast.error(err.message || 'Erro no pagamento com cartão');
      }
    }
  };

  const copyPixCode = () => {
    if (pixData?.copy_paste) {
      navigator.clipboard.writeText(pixData.copy_paste);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

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

  // If PIX was generated, show QR code + polling
  if (pixData) {
    const statusInfo = pollingStatus ? MP_STATUS_MAP[pollingStatus] : null;

    return (
      <div className="space-y-4">
        <div className="text-center space-y-3">
          <h3 className="font-semibold text-lg">Pague com PIX</h3>
          <p className="text-sm text-muted-foreground">
            Escaneie o QR Code ou copie o código abaixo
          </p>
          
          {/* QR Code */}
          <div className="flex justify-center">
            <img
              src={`data:image/png;base64,${pixData.qr_code_base64}`}
              alt="QR Code PIX"
              className="w-48 h-48 rounded-lg border"
            />
          </div>

          {/* Copy-paste code */}
          <div className="flex gap-2">
            <Input
              value={pixData.copy_paste}
              readOnly
              className="text-xs font-mono"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyPixCode}
              className="flex-shrink-0"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          {/* Polling status */}
          <div className="flex items-center justify-center gap-2 text-sm">
            {pollingStatus === 'approved' ? (
              <Badge className="bg-green-100 text-green-700">✅ Pagamento Aprovado!</Badge>
            ) : pollingStatus === 'timeout' ? (
              <Badge variant="outline" className="text-yellow-600">
                ⏳ Tempo expirado - verifique manualmente
              </Badge>
            ) : statusInfo ? (
              <Badge variant="outline" className={statusInfo.color}>
                {statusInfo.icon} {statusInfo.label}
              </Badge>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Aguardando pagamento...
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Valor: <strong>{formatPrice(amountCents)}</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PaymentTab)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pix" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            PIX
          </TabsTrigger>
          <TabsTrigger value="card" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Cartão
          </TabsTrigger>
        </TabsList>

        {/* PIX Tab */}
        <TabsContent value="pix" className="space-y-4 mt-4">
          <div className="text-center p-4 rounded-lg bg-muted/50 space-y-2">
            <QrCode className="h-10 w-10 mx-auto text-primary" />
            <p className="text-sm font-medium">Pagamento instantâneo via PIX</p>
            <p className="text-xs text-muted-foreground">
              Ao clicar, será gerado um QR Code para pagamento
            </p>
          </div>
          
          <Button
            onClick={handlePix}
            disabled={isLoading}
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <QrCode className="h-5 w-5 mr-2" />
                Gerar PIX - {formatPrice(amountCents)}
              </>
            )}
          </Button>
        </TabsContent>

        {/* Card Tab */}
        <TabsContent value="card" className="space-y-3 mt-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Número do Cartão</Label>
            <Input
              id="cardNumber"
              placeholder="0000 0000 0000 0000"
              value={cardForm.cardNumber}
              onChange={(e) => setCardForm(prev => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))}
              maxLength={19}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardholderName">Nome no Cartão</Label>
            <Input
              id="cardholderName"
              placeholder="NOME COMPLETO"
              value={cardForm.cardholderName}
              onChange={(e) => setCardForm(prev => ({ ...prev, cardholderName: e.target.value.toUpperCase() }))}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label htmlFor="expMonth">Mês</Label>
              <Input
                id="expMonth"
                placeholder="MM"
                value={cardForm.expirationMonth}
                onChange={(e) => setCardForm(prev => ({ ...prev, expirationMonth: e.target.value.replace(/\D/g, '').slice(0, 2) }))}
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expYear">Ano</Label>
              <Input
                id="expYear"
                placeholder="AA"
                value={cardForm.expirationYear}
                onChange={(e) => setCardForm(prev => ({ ...prev, expirationYear: e.target.value.replace(/\D/g, '').slice(0, 2) }))}
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                type="password"
                value={cardForm.securityCode}
                onChange={(e) => setCardForm(prev => ({ ...prev, securityCode: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                maxLength={4}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF do Titular</Label>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              value={cardForm.identificationNumber}
              onChange={(e) => setCardForm(prev => ({ ...prev, identificationNumber: formatCPF(e.target.value) }))}
              maxLength={14}
            />
          </div>

          {amountCents >= 50000 && (
            <div className="space-y-2">
              <Label htmlFor="installments">Parcelas</Label>
              <select
                id="installments"
                value={cardForm.installments}
                onChange={(e) => setCardForm(prev => ({ ...prev, installments: Number(e.target.value) }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                  <option key={n} value={n}>
                    {n}x de {formatPrice(Math.ceil(amountCents / n))}
                    {n === 1 ? ' (à vista)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            onClick={handleCard}
            disabled={isLoading || !cardForm.cardNumber || !cardForm.cardholderName || !cardForm.securityCode}
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Pagar {formatPrice(amountCents)}
              </>
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MPTransparentCheckout;
