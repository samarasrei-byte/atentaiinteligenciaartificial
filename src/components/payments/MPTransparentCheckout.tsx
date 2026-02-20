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
  payerPhone?: string;
  metadata?: Record<string, string>;
  onSuccess: (paymentId: number, processResult?: PostPaymentResult) => void;
  onError?: (error: string) => void;
  accessToken?: string;
  /** If true, will call process-approved-payment to create account + link service */
  autoProcessPayment?: boolean;
  /** Request ID to link to user after payment */
  requestId?: string;
  /** Allowed payment methods. Defaults to ['pix', 'card'] */
  allowedMethods?: PaymentTab[];
  /** If true, disables installments (subscription = 1x only) */
  isRecurring?: boolean;
}

interface PostPaymentResult {
  userId: string;
  isNewUser: boolean;
  tempPassword?: string;
  email: string;
  redirectPath: string;
  specialist: string;
  chatType: string;
  accessToken?: string;
  refreshToken?: string;
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
  payerPhone,
  metadata,
  onSuccess,
  onError,
  accessToken,
  autoProcessPayment = true,
  requestId,
  allowedMethods = ['pix', 'card'],
  isRecurring = false,
}) => {
  const [activeTab, setActiveTab] = useState<PaymentTab>(allowedMethods[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [pollingStatus, setPollingStatus] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warmupDoneRef = useRef(false);
  
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

  // Pre-warm edge function on mount (fire-and-forget OPTIONS request)
  useEffect(() => {
    if (warmupDoneRef.current) return;
    warmupDoneRef.current = true;
    const url = (import.meta.env.VITE_SUPABASE_URL || 'https://wtiexyrawenxckctbwzn.supabase.co') + '/functions/v1/create-mp-payment';
    fetch(url, { method: 'OPTIONS' }).catch(() => {});
    console.log('[PIX] Pre-warming edge function');
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const processApprovedPayment = useCallback(async (paymentId: number) => {
    if (!autoProcessPayment) {
      onSuccess(paymentId);
      return;
    }

    try {
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const { data, error } = await supabase.functions.invoke('process-approved-payment', {
        body: {
          paymentId,
          serviceType,
          serviceName,
          email: payerEmail,
          fullName: payerName,
          phone: payerPhone || '',
          requestId,
          metadata,
        },
        headers,
      });

      if (error) {
        console.error('[MPCheckout] Process error:', error);
        // Still call onSuccess even if process fails - payment was approved
        onSuccess(paymentId);
        return;
      }

      onSuccess(paymentId, data as PostPaymentResult);
    } catch (err) {
      console.error('[MPCheckout] Process error:', err);
      onSuccess(paymentId);
    }
  }, [autoProcessPayment, onSuccess, accessToken, serviceType, serviceName, payerEmail, payerName, payerPhone, requestId, metadata]);

  const startPolling = useCallback((paymentId: number) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    let attempts = 0;
    const maxAttempts = 60;
    
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
          toast.success('Pagamento aprovado! 🎉');
          await processApprovedPayment(paymentId);
        } else if (['rejected', 'cancelled', 'refunded'].includes(data.status)) {
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch {
        // Silently continue polling
      }
    }, 5000);
  }, [processApprovedPayment]);

  const createPayment = async (paymentMethodId: string, extraBody: Record<string, unknown> = {}, retryCount = 0): Promise<any> => {
    if (retryCount === 0) setIsLoading(true);
    const startTime = Date.now();
    
    try {
      setLoadingStep(retryCount > 0 ? 'Tentando novamente...' : 'Conectando ao servidor...');

      const [firstName, ...rest] = payerName.split(' ');
      const lastName = rest.join(' ') || firstName;

      const requestBody = {
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
      };

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wtiexyrawenxckctbwzn.supabase.co';
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aWV4eXJhd2VueGNrY3Rid3puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNTMzMTksImV4cCI6MjA4MTkyOTMxOX0.487e8ymS3oOol5AKlnPb-eCau7Jjr5i48OpE9WV5GjY';
      const endpoint = `${supabaseUrl}/functions/v1/create-mp-payment`;

      console.log('[PIX] Calling', endpoint, 'attempt:', retryCount + 1);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      setLoadingStep('Gerando pagamento...');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const elapsed = Date.now() - startTime;
      console.log('[PIX] Response in', elapsed, 'ms, status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP ${response.status}`);
      }

      setLoadingStep('Processando resposta...');
      const data = await response.json();
      console.log('[PIX] Payment created:', data.id, 'status:', data.status, 'in', Date.now() - startTime, 'ms');

      if (data.error) throw new Error(data.error);

      return data;
    } catch (err: any) {
      const elapsed = Date.now() - startTime;
      console.error('[PIX] Error after', elapsed, 'ms:', err.name, err.message, 'attempt:', retryCount + 1);

      // Auto-retry once on timeout or network error
      if (retryCount === 0 && (err.name === 'AbortError' || err.name === 'TypeError')) {
        console.log('[PIX] Auto-retrying...');
        setLoadingStep('Reconectando...');
        return createPayment(paymentMethodId, extraBody, 1);
      }

      const msg = err.name === 'AbortError' 
        ? 'Tempo esgotado. Tente novamente.' 
        : (err.message || 'Erro ao processar pagamento');
      toast.error(msg);
      onError?.(msg);
      throw err;
    } finally {
      if (retryCount === 0 || true) {
        setIsLoading(false);
        setLoadingStep('');
      }
    }
  };

  // =================== PIX ===================
  const handlePix = async () => {
    try {
      const data = await createPayment('pix');

      if (data.pix_qr_code_base64 && (data.pix_copy_paste || data.pix_qr_code)) {
        setPixData({
          qr_code_base64: data.pix_qr_code_base64,
          copy_paste: data.pix_copy_paste || data.pix_qr_code,
          ticket_url: data.ticket_url,
          paymentId: data.id,
        });
        startPolling(data.id);
        toast.success('PIX gerado! Escaneie o QR Code ou copie o código.');
      } else {
        console.error('[PIX] Missing data:', JSON.stringify(data));
        throw new Error('Dados do PIX não retornados. Tente novamente.');
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
        toast.success('Pagamento aprovado! 🎉');
        await processApprovedPayment(data.id);
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
        {allowedMethods.length > 1 && (
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
        )}

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
            className="w-full h-14 text-base font-semibold relative overflow-hidden"
            size="lg"
          >
            {isLoading ? (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{loadingStep || 'Gerando PIX...'}</span>
                </div>
                <div className="w-full h-1 bg-primary/20 rounded-full overflow-hidden absolute bottom-0 left-0">
                  <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
              </div>
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

          {!isRecurring && (
          <div className="space-y-2">
            <Label htmlFor="installments">Parcelas</Label>
            <select
              id="installments"
              value={cardForm.installments}
              onChange={(e) => setCardForm(prev => ({ ...prev, installments: Number(e.target.value) }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}x de {formatPrice(Math.ceil(amountCents / n))}
                  {n === 1 ? ' (à vista)' : ' sem juros'}
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
