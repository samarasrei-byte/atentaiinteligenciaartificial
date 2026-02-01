import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CreditCard, Link2, Send, Loader2, Check,
  DollarSign, Copy, ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PaymentLinkGeneratorProps {
  requestId: string;
  clientName: string;
  clientEmail: string;
  serviceType: string;
  onLinkGenerated?: (paymentLink: string) => void;
  className?: string;
}

const SERVICE_LABELS: Record<string, { name: string; defaultPrice: number }> = {
  'limpanome': { name: 'Limpa Nome PF', defaultPrice: 78000 },
  'limpanome-pj': { name: 'Limpa Nome CNPJ', defaultPrice: 97000 },
  'analise-fiscal': { name: 'Análise Fiscal', defaultPrice: 0 },
  'bi-contabilidade': { name: 'BI+ Contabilidade', defaultPrice: 0 },
  'abertura-empresa': { name: 'Abertura de Empresa', defaultPrice: 78000 },
  'ir': { name: 'Declaração IR', defaultPrice: 20000 },
  'certidao': { name: 'Certidão', defaultPrice: 8000 },
};

/**
 * PaymentLinkGenerator - Gerador de links de pagamento para operadores
 * 
 * Permite que Guilherme/César definam valores manualmente e gerem
 * links de pagamento Stripe para enviar aos clientes pelo chat.
 */
export const PaymentLinkGenerator: React.FC<PaymentLinkGeneratorProps> = ({
  requestId,
  clientName,
  clientEmail,
  serviceType,
  onLinkGenerated,
  className,
}) => {
  const { session } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  
  const [customAmount, setCustomAmount] = useState(
    (SERVICE_LABELS[serviceType]?.defaultPrice || 0) / 100
  );
  const [description, setDescription] = useState(
    SERVICE_LABELS[serviceType]?.name || 'Serviço Personalizado'
  );

  const serviceLabel = SERVICE_LABELS[serviceType] || { name: 'Serviço', defaultPrice: 0 };

  const handleGenerateLink = async () => {
    if (!customAmount || customAmount < 1) {
      toast.error('Informe um valor válido (mínimo R$ 1,00)');
      return;
    }

    if (!session) {
      toast.error('Você precisa estar autenticado');
      return;
    }

    setIsGenerating(true);
    setGeneratedLink(null);

    try {
      const amountCents = Math.round(customAmount * 100);

      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: amountCents,
          serviceType,
          serviceName: description,
          metadata: {
            request_id: requestId,
            client_name: clientName,
            client_email: clientEmail,
            generated_by: 'admin',
          },
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // For now, we'll create a payment link message format
      // In production, this would use Stripe Payment Links API
      const paymentLink = `${window.location.origin}/checkout/${serviceType}?request=${requestId}&amount=${amountCents}`;
      
      setGeneratedLink(paymentLink);
      
      // Record the payment link in audit
      await supabase.from('audit_logs').insert({
        action_type: 'payment_link_generated',
        resource_type: 'payment',
        resource_id: requestId,
        metadata: {
          amount_cents: amountCents,
          service_type: serviceType,
          client_email: clientEmail,
          description,
        },
      });

      toast.success('Link de pagamento gerado!');
      onLinkGenerated?.(paymentLink);
    } catch (error: any) {
      console.error('Payment link generation error:', error);
      toast.error(error.message || 'Erro ao gerar link de pagamento');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast.success('Link copiado!');
    }
  };

  const handleSendInChat = () => {
    if (generatedLink) {
      // This will be handled by the parent component
      onLinkGenerated?.(generatedLink);
      toast.success('Link enviado no chat!');
      setIsOpen(false);
      setGeneratedLink(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={`gap-2 ${className}`}>
          <CreditCard className="h-4 w-4" />
          Gerar Link de Pagamento
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Gerar Link de Pagamento
          </DialogTitle>
          <DialogDescription>
            Defina o valor e envie o link para o cliente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Client Info */}
          <div className="bg-slate-50 rounded-lg p-3 space-y-1">
            <p className="text-sm text-muted-foreground">Cliente</p>
            <p className="font-medium">{clientName}</p>
            <p className="text-sm text-muted-foreground">{clientEmail}</p>
          </div>

          {/* Service */}
          <div className="space-y-2">
            <Label>Serviço</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nome do serviço"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                min={1}
                step={0.01}
                value={customAmount}
                onChange={(e) => setCustomAmount(parseFloat(e.target.value) || 0)}
                className="pl-9"
                placeholder="0,00"
              />
            </div>
            {serviceLabel.defaultPrice > 0 && (
              <p className="text-xs text-muted-foreground">
                Preço padrão: R$ {(serviceLabel.defaultPrice / 100).toFixed(2)}
              </p>
            )}
          </div>

          {/* Generated Link */}
          {generatedLink && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center gap-2 text-emerald-700">
                <Check className="h-4 w-4" />
                <span className="font-medium">Link gerado com sucesso!</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Input
                  value={generatedLink}
                  readOnly
                  className="text-xs bg-white"
                />
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href={generatedLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              
              <Button 
                className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSendInChat}
              >
                <Send className="h-4 w-4" />
                Enviar no Chat
              </Button>
            </motion.div>
          )}

          {/* Generate Button */}
          {!generatedLink && (
            <Button 
              onClick={handleGenerateLink}
              disabled={isGenerating || customAmount < 1}
              className="w-full gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              {isGenerating ? 'Gerando...' : 'Gerar Link'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentLinkGenerator;
