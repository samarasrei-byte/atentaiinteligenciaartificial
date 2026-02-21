import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MaskedInput } from '@/components/ui/masked-input';
import { Loader2, CreditCard, Lock, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface GuestCheckoutFormProps {
  serviceType: 'ir' | 'credit_repair' | 'certificate';
  serviceName: string;
  basePriceCents: number;
  discountPercent: number;
  // Service-specific data
  serviceData?: Record<string, any>;
  onSuccess?: () => void;
}

export function GuestCheckoutForm({
  serviceType,
  serviceName,
  basePriceCents,
  discountPercent,
  serviceData = {},
  onSuccess,
}: GuestCheckoutFormProps) {
  const { user, subscription } = useAuth();
  const isSubscriber = subscription.subscribed;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    cpf: '',
    phone: '',
  });
  const [cpfValid, setCpfValid] = useState(false);
  const [phoneValid, setPhoneValid] = useState(false);

  const discountCents = isSubscriber ? Math.round(basePriceCents * (discountPercent / 100)) : 0;
  const finalPriceCents = basePriceCents - discountCents;

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email) {
      toast.error('Preencha nome e email');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Email inválido');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-guest-service-payment', {
        body: {
          serviceType,
          email: formData.email,
          fullName: formData.fullName,
          cpf: formData.cpf,
          phone: formData.phone,
          ...serviceData,
        },
      });

      if (error) throw error;

      if (data?.url) {
        toast.success('Redirecionando para pagamento seguro...');
        window.open(data.url, '_blank');
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Erro ao processar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Finalizar Pedido
            </CardTitle>
            <CardDescription className="mt-1">
              Preencha seus dados para prosseguir com o pagamento
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            Pagamento Seguro
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {/* Price Summary */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Serviço</span>
            <span className="font-medium">{serviceName}</span>
          </div>
          {isSubscriber && discountCents > 0 && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Preço original</span>
                <span className="line-through text-muted-foreground">
                  {formatPrice(basePriceCents)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-success">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Desconto assinante
                </span>
                <span>-{formatPrice(discountCents)}</span>
              </div>
            </>
          )}
          <div className="flex items-center justify-between pt-2 border-t mt-2">
            <span className="font-semibold">Total</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">
                {formatPrice(finalPriceCents)}
              </span>
              <p className="text-xs text-muted-foreground">
                ou 4x de {formatPrice(Math.round(finalPriceCents / 4))}
              </p>
            </div>
          </div>
        </div>

        {!user && (
          <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Checkout rápido</p>
                <p className="text-xs text-muted-foreground">
                  Após o pagamento, criaremos automaticamente sua conta para acompanhar o pedido.
                  Você receberá as credenciais por email.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Seu nome completo"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <MaskedInput
                id="cpf"
                mask="cpf"
                value={formData.cpf}
                onChange={(value, isValid) => {
                  setFormData({ ...formData, cpf: value });
                  setCpfValid(isValid);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <MaskedInput
                id="phone"
                mask="phone"
                value={formData.phone}
                onChange={(value, isValid) => {
                  setFormData({ ...formData, phone: value });
                  setPhoneValid(isValid);
                }}
              />
            </div>
          </div>

          {!isSubscriber && (
            <div className="p-3 bg-accent/10 rounded-lg text-sm">
              <p className="text-muted-foreground">
                💡 <strong>Dica:</strong> Assinantes têm até {discountPercent}% de desconto neste serviço!
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 text-lg font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Lock className="h-5 w-5 mr-2" />
                Pagar {formatPrice(finalPriceCents)}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Ao clicar em Pagar, você será redirecionado para o checkout seguro do Mercado Pago.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
