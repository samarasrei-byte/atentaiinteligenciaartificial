import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { MaskedInput } from '@/components/ui/masked-input';
import { useToast } from '@/hooks/use-toast';
import { SUBSCRIBER_DISCOUNTS, formatPrice } from '@/lib/stripe';
import { cleanDocument } from '@/lib/documentValidation';
import { 
  FileText, 
  FileSpreadsheet, 
  Loader2, 
  Check,
  TrendingUp,
  Home,
  Globe,
  Users,
  Lock,
  Sparkles
} from 'lucide-react';

interface IRRequestFormProps {
  onSuccess?: () => void;
}

export function IRRequestForm({ onSuccess }: IRRequestFormProps) {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [irType, setIrType] = useState<'simples' | 'completo'>('simples');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    email: user?.email || '',
    phone: '',
    fiscalYear: new Date().getFullYear() - 1,
    hasInvestments: false,
    hasRentalIncome: false,
    hasForeignIncome: false,
    incomeSourcesCount: 1,
    notes: '',
  });
  
  const [cpfValid, setCpfValid] = useState(false);
  const [phoneValid, setPhoneValid] = useState(false);

  const isSubscriber = subscription.subscribed;
  const serviceKey = irType === 'simples' ? 'ir_simples' : 'ir_completo';
  const service = SUBSCRIBER_DISCOUNTS[serviceKey];
  const finalPrice = isSubscriber ? service.discountedPrice : service.basePrice;
  const discountPercent = Math.round(service.discount * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.fullName || !formData.email) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Preencha nome e email para continuar.',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        variant: 'destructive',
        title: 'Email inválido',
        description: 'Informe um email válido.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Use guest checkout endpoint (works for both logged and guest users)
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-guest-service-payment', {
        body: {
          serviceType: 'ir',
          irType,
          email: formData.email,
          fullName: formData.fullName,
          cpf: formData.cpf,
          phone: formData.phone,
          fiscalYear: formData.fiscalYear,
          hasInvestments: formData.hasInvestments,
          hasRentalIncome: formData.hasRentalIncome,
          hasForeignIncome: formData.hasForeignIncome,
          incomeSourcesCount: formData.incomeSourcesCount,
          notes: formData.notes,
        },
      });

      if (paymentError) throw paymentError;

      if (paymentData?.url) {
        toast({
          title: 'Redirecionando para pagamento',
          description: isSubscriber 
            ? `Desconto de ${discountPercent}% aplicado!`
            : !user ? 'Após o pagamento, sua conta será criada automaticamente.' : 'Assine para obter 20% de desconto!',
        });
        window.open(paymentData.url, '_blank');
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Error creating IR request:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar solicitação',
        description: error.message || 'Tente novamente mais tarde.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* IR Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className={`cursor-pointer transition-all ${
            irType === 'simples' 
              ? 'border-primary ring-2 ring-primary/20' 
              : 'hover:border-primary/50'
          }`}
          onClick={() => setIrType('simples')}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <FileText className="h-8 w-8 text-primary" />
              {irType === 'simples' && (
                <Badge className="bg-primary">Selecionado</Badge>
              )}
            </div>
            <CardTitle className="text-lg">IR Simples</CardTitle>
            <CardDescription>
              Para CLT com poucos rendimentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                <span>1 fonte de renda (CLT)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                <span>Sem investimentos</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                <span>Deduções básicas</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-baseline gap-2">
                {isSubscriber && (
                  <span className="text-muted-foreground line-through text-sm">
                    {formatPrice(SUBSCRIBER_DISCOUNTS.ir_simples.basePrice)}
                  </span>
                )}
                <span className="text-2xl font-bold text-foreground">
                  {formatPrice(isSubscriber 
                    ? SUBSCRIBER_DISCOUNTS.ir_simples.discountedPrice 
                    : SUBSCRIBER_DISCOUNTS.ir_simples.basePrice
                  )}
                </span>
                {isSubscriber && (
                  <Badge variant="secondary" className="bg-success/20 text-success">
                    -{discountPercent}%
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${
            irType === 'completo' 
              ? 'border-primary ring-2 ring-primary/20' 
              : 'hover:border-primary/50'
          }`}
          onClick={() => setIrType('completo')}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              {irType === 'completo' && (
                <Badge className="bg-primary">Selecionado</Badge>
              )}
            </div>
            <CardTitle className="text-lg">IR Completo</CardTitle>
            <CardDescription>
              Para casos mais complexos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Investimentos (ações, FIIs)</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" />
                <span>Aluguéis recebidos</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <span>Renda do exterior</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Múltiplas fontes de renda</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-baseline gap-2">
                {isSubscriber && (
                  <span className="text-muted-foreground line-through text-sm">
                    {formatPrice(SUBSCRIBER_DISCOUNTS.ir_completo.basePrice)}
                  </span>
                )}
                <span className="text-2xl font-bold text-foreground">
                  {formatPrice(isSubscriber 
                    ? SUBSCRIBER_DISCOUNTS.ir_completo.discountedPrice 
                    : SUBSCRIBER_DISCOUNTS.ir_completo.basePrice
                  )}
                </span>
                {isSubscriber && (
                  <Badge variant="secondary" className="bg-success/20 text-success">
                    -{discountPercent}%
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>Dados para Declaração</CardTitle>
          <CardDescription>
            Preencha seus dados para iniciar a declaração de IR {formData.fiscalYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <MaskedInput
                  id="cpf"
                  mask="cpf"
                  value={formData.cpf}
                  onChange={(value, isValid) => {
                    setFormData({ ...formData, cpf: value });
                    setCpfValid(isValid);
                  }}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={user?.email || 'seu@email.com'}
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

            {irType === 'completo' && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium">Informações Adicionais</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hasInvestments">Possui investimentos?</Label>
                    <Switch
                      id="hasInvestments"
                      checked={formData.hasInvestments}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasInvestments: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hasRentalIncome">Recebe aluguéis?</Label>
                    <Switch
                      id="hasRentalIncome"
                      checked={formData.hasRentalIncome}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasRentalIncome: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hasForeignIncome">Renda do exterior?</Label>
                    <Switch
                      id="hasForeignIncome"
                      checked={formData.hasForeignIncome}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasForeignIncome: checked })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incomeSourcesCount">Fontes de renda</Label>
                    <Input
                      id="incomeSourcesCount"
                      type="number"
                      min={1}
                      max={10}
                      value={formData.incomeSourcesCount}
                      onChange={(e) => setFormData({ ...formData, incomeSourcesCount: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Informações adicionais relevantes para sua declaração..."
                rows={3}
              />
            </div>

            {!isSubscriber && (
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-foreground">
                  <strong>💡 Dica:</strong> Assinantes têm {discountPercent}% de desconto em declarações de IR!{' '}
                  <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/pricing')}>
                    Ver planos
                  </Button>
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Total a pagar:</p>
                <p className="text-2xl font-bold text-foreground">{formatPrice(finalPrice)}</p>
              </div>
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Ir para Pagamento'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
