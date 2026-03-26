import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMPCheckout } from '@/contexts/MPCheckoutContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { MaskedInput } from '@/components/ui/masked-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { SUBSCRIBER_DISCOUNTS, formatPrice } from '@/lib/plans';
import { 
  FileText, 
  FileSpreadsheet, 
  Loader2, 
  Check,
  TrendingUp,
  Home,
  Globe,
  Users,
} from 'lucide-react';

interface IRRequestFormProps {
  onSuccess?: () => void;
}

export function IRRequestForm({ onSuccess }: IRRequestFormProps) {
  const { user } = useAuth();
  const { openCheckout } = useMPCheckout();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [irType, setIrType] = useState<'simples' | 'completo'>('simples');
  
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

  const serviceKey = irType === 'simples' ? 'ir_simples' : 'ir_completo';
  const service = SUBSCRIBER_DISCOUNTS[serviceKey];
  const finalPrice = service.basePrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.cpf) {
      toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'Preencha nome, email e CPF para continuar.' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({ variant: 'destructive', title: 'Email inválido', description: 'Informe um email válido.' });
      return;
    }

    if (!cpfValid) {
      toast({ variant: 'destructive', title: 'CPF inválido', description: 'Informe um CPF válido para continuar.' });
      return;
    }

    openCheckout({
      amountCents: finalPrice,
      serviceName: service.name,
      serviceType: serviceKey,
      description: `${service.description} - Ano ${formData.fiscalYear}`,
      gradient: 'from-violet-600 to-purple-700',
      icon: irType === 'simples' ? FileText : FileSpreadsheet,
      metadata: {
        ir_type: irType,
        fiscal_year: String(formData.fiscalYear),
        full_name: formData.fullName,
        cpf: formData.cpf,
        phone: formData.phone,
        email: formData.email,
        has_investments: String(formData.hasInvestments),
        has_rental_income: String(formData.hasRentalIncome),
        has_foreign_income: String(formData.hasForeignIncome),
        income_sources_count: String(formData.incomeSourcesCount),
        notes: formData.notes || '',
      },
      guestEmail: formData.email,
      guestName: formData.fullName,
      requireGuestInfo: !user,
      onSuccess: () => {
        toast({ title: 'Pagamento aprovado! ✅', description: 'Sua declaração será processada em breve.' });
        onSuccess?.();
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* IR Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className={`cursor-pointer transition-all ${irType === 'simples' ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
          onClick={() => setIrType('simples')}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <FileText className="h-8 w-8 text-primary" />
              {irType === 'simples' && <Badge className="bg-primary">Selecionado</Badge>}
            </div>
            <CardTitle className="text-lg">IR Simples</CardTitle>
            <CardDescription>Para CLT com poucos rendimentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /><span>1 fonte de renda (CLT)</span></div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /><span>Sem investimentos</span></div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /><span>Deduções básicas</span></div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <span className="text-2xl font-bold text-foreground">
                {formatPrice(SUBSCRIBER_DISCOUNTS.ir_simples.basePrice)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${irType === 'completo' ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
          onClick={() => setIrType('completo')}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              {irType === 'completo' && <Badge className="bg-primary">Selecionado</Badge>}
            </div>
            <CardTitle className="text-lg">IR Completo</CardTitle>
            <CardDescription>Para casos mais complexos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /><span>Investimentos (ações, FIIs)</span></div>
              <div className="flex items-center gap-2"><Home className="h-4 w-4 text-primary" /><span>Aluguéis recebidos</span></div>
              <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /><span>Renda do exterior</span></div>
              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /><span>Múltiplas fontes de renda</span></div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <span className="text-2xl font-bold text-foreground">
                {formatPrice(SUBSCRIBER_DISCOUNTS.ir_completo.basePrice)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>Dados para Declaração</CardTitle>
          <CardDescription>Preencha seus dados para iniciar a declaração de IR {formData.fiscalYear}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF <span className="text-destructive">*</span></Label>
                <MaskedInput id="cpf" mask="cpf" value={formData.cpf} onChange={(value, isValid) => { setFormData({ ...formData, cpf: value }); setCpfValid(isValid); }} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder={user?.email || 'seu@email.com'} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <MaskedInput id="phone" mask="phone" value={formData.phone} onChange={(value) => setFormData({ ...formData, phone: value })} />
              </div>
            </div>

            {irType === 'completo' && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium">Informações Adicionais</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fiscalYear">Ano-Base (Exercício) *</Label>
                <Select
                  value={String(formData.fiscalYear)}
                  onValueChange={(val) => setFormData({ ...formData, fiscalYear: parseInt(val) })}
                >
                  <SelectTrigger id="fiscalYear">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4].map(offset => {
                      const year = new Date().getFullYear() - 1 - offset;
                      return (
                        <SelectItem key={year} value={String(year)}>
                          {year} (Declaração {year + 1})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hasInvestments">Possui investimentos?</Label>
                    <Switch id="hasInvestments" checked={formData.hasInvestments} onCheckedChange={(checked) => setFormData({ ...formData, hasInvestments: checked })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hasRentalIncome">Recebe aluguéis?</Label>
                    <Switch id="hasRentalIncome" checked={formData.hasRentalIncome} onCheckedChange={(checked) => setFormData({ ...formData, hasRentalIncome: checked })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hasForeignIncome">Renda do exterior?</Label>
                    <Switch id="hasForeignIncome" checked={formData.hasForeignIncome} onCheckedChange={(checked) => setFormData({ ...formData, hasForeignIncome: checked })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incomeSourcesCount">Fontes de renda</Label>
                    <Input id="incomeSourcesCount" type="number" min={1} max={10} value={formData.incomeSourcesCount} onChange={(e) => setFormData({ ...formData, incomeSourcesCount: parseInt(e.target.value) || 1 })} />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Informações adicionais relevantes para sua declaração..." rows={3} />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Total a pagar:</p>
                <p className="text-2xl font-bold text-foreground">{formatPrice(finalPrice)}</p>
              </div>
              <Button type="submit" size="lg">
                Ir para Pagamento
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
