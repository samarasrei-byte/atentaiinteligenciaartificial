import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMPCheckout } from '@/contexts/MPCheckoutContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { supabase } from '@/integrations/supabase/client';
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
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Shield,
  CheckCircle2,
} from 'lucide-react';

interface IRRequestFormProps {
  onSuccess?: () => void;
}

export function IRRequestForm({ onSuccess }: IRRequestFormProps) {
  const { user, signUp } = useAuth();
  const { openCheckout } = useMPCheckout();
  const { toast } = useToast();

  const [irType, setIrType] = useState<'simples' | 'completo'>('simples');
  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    email: user?.email || '',
    phone: '',
    password: '',
    confirmPassword: '',
    fiscalYear: new Date().getFullYear() - 1,
    hasInvestments: false,
    hasRentalIncome: false,
    hasForeignIncome: false,
    incomeSourcesCount: 1,
    notes: '',
  });

  const [cpfValid, setCpfValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData((prev) => ({ ...prev, email: user.email || '' }));
    }
  }, [user?.email, formData.email]);

  useEffect(() => {
    if (irType === 'simples') {
      setFormData((prev) => ({
        ...prev,
        hasInvestments: false,
        hasRentalIncome: false,
        hasForeignIncome: false,
        incomeSourcesCount: 1,
      }));
    }
  }, [irType]);

  const serviceKey = irType === 'simples' ? 'ir_simples' : 'ir_completo';
  const service = SUBSCRIBER_DISCOUNTS[serviceKey];
  const finalPrice = service.basePrice;
  const isGuest = !user;

  const proceedToCheckout = () => {
    const normalizedCpf = formData.cpf.replace(/\D/g, '');

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
        cpf: normalizedCpf,
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
      requireGuestInfo: false,
      onSuccess: () => {
        // Save redirect target for post-auth
        sessionStorage.setItem('postAuthRedirect', '/empresa?tab=ir-declaracao');
        toast({ title: 'Pagamento aprovado! ✅', description: 'Redirecionando para upload de documentos...' });
        onSuccess?.();
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const normalizedCpf = formData.cpf.replace(/\D/g, '');

    // Validation
    if (!formData.fullName || !formData.email || !formData.cpf) {
      toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'Preencha nome, email e CPF.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({ variant: 'destructive', title: 'Email inválido', description: 'Informe um email válido.' });
      return;
    }
    if (!cpfValid || normalizedCpf.length !== 11) {
      toast({ variant: 'destructive', title: 'CPF inválido', description: 'Informe um CPF válido.' });
      return;
    }

    // Guest: validate password
    if (isGuest) {
      if (!formData.password || formData.password.length < 6) {
        toast({ variant: 'destructive', title: 'Senha fraca', description: 'A senha deve ter no mínimo 6 caracteres.' });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({ variant: 'destructive', title: 'Senhas diferentes', description: 'A senha e a confirmação não coincidem.' });
        return;
      }
    }

    // Auto-upgrade to completo if needed
    if (irType === 'simples' && (formData.hasInvestments || formData.hasRentalIncome || formData.hasForeignIncome || formData.incomeSourcesCount > 1)) {
      toast({ variant: 'destructive', title: 'Perfil incompatível', description: 'Seu cenário exige IR Completo. Ajustamos para você.' });
      setIrType('completo');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isGuest) {
        // Step 1: Create account
        setIsCreatingAccount(true);
        const { error: signUpError } = await signUp(formData.email, formData.password, formData.fullName);

        if (signUpError) {
          // Check if user already exists
          if (signUpError.message?.includes('already registered') || signUpError.message?.includes('already been registered')) {
            // Try to sign in instead
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: formData.email,
              password: formData.password,
            });
            if (signInError) {
              toast({ variant: 'destructive', title: 'Email já cadastrado', description: 'Faça login com sua senha ou use "Esqueci minha senha".' });
              setIsCreatingAccount(false);
              setIsSubmitting(false);
              return;
            }
          } else {
            toast({ variant: 'destructive', title: 'Erro ao criar conta', description: signUpError.message });
            setIsCreatingAccount(false);
            setIsSubmitting(false);
            return;
          }
        }

        setIsCreatingAccount(false);

        // Small delay to let auth state propagate
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Step 2: Open checkout
      proceedToCheckout();
    } catch (err) {
      console.error('IR form error:', err);
      toast({ variant: 'destructive', title: 'Erro', description: 'Tente novamente.' });
    } finally {
      setIsSubmitting(false);
      setIsCreatingAccount(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ═══ IR Type Selection ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* IR Simples */}
        <button
          type="button"
          onClick={() => setIrType('simples')}
          className={`text-left rounded-2xl p-6 border-2 transition-all duration-300 ${
            irType === 'simples'
              ? 'border-blue-500/50 bg-blue-500/5 shadow-lg shadow-blue-500/10'
              : 'border-border/30 bg-card/20 hover:border-border/60'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            {irType === 'simples' && (
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <h3 className="font-bold text-foreground text-lg">IR Simples</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">CLT com poucos rendimentos</p>
          <div className="mt-4 pt-3 border-t border-border/20">
            <span className="text-2xl font-black text-foreground">{formatPrice(SUBSCRIBER_DISCOUNTS.ir_simples.basePrice)}</span>
            <span className="text-muted-foreground/50 text-xs ml-1">único</span>
          </div>
        </button>

        {/* IR Completo */}
        <button
          type="button"
          onClick={() => setIrType('completo')}
          className={`text-left rounded-2xl p-6 border-2 transition-all duration-300 relative ${
            irType === 'completo'
              ? 'border-purple-500/50 bg-purple-500/5 shadow-lg shadow-purple-500/10'
              : 'border-border/30 bg-card/20 hover:border-border/60'
          }`}
        >
          <Badge className="absolute top-3 right-3 bg-purple-600 text-white text-[10px] font-bold">POPULAR</Badge>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-purple-400" />
            </div>
            {irType === 'completo' && (
              <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <h3 className="font-bold text-foreground text-lg">IR Completo</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">Investimentos, aluguéis, múltiplas fontes</p>
          <div className="mt-4 pt-3 border-t border-border/20">
            <span className="text-2xl font-black text-foreground">{formatPrice(SUBSCRIBER_DISCOUNTS.ir_completo.basePrice)}</span>
            <span className="text-muted-foreground/50 text-xs ml-1">único</span>
          </div>
        </button>
      </div>

      {/* ═══ Unified Form ═══ */}
      <Card className="bg-card/30 backdrop-blur-sm border-border/30 rounded-3xl overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-foreground">
              {isGuest ? 'Crie sua conta e contrate' : 'Dados para Declaração'}
            </h3>
            <p className="text-sm text-muted-foreground/60 mt-1">
              {isGuest
                ? 'Tudo em uma única etapa: cadastro + pagamento'
                : `Preencha para iniciar a declaração de IR ${formData.fiscalYear}`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account creation fields (guests only) */}
            {isGuest && (
              <div className="space-y-4 pb-5 border-b border-border/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Criar sua conta</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm text-muted-foreground">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Mínimo 6 caracteres"
                        className="pr-10 bg-background/50 border-border/30"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm text-muted-foreground">Confirmar Senha *</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Repita a senha"
                      className="bg-background/50 border-border/30"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Personal data */}
            <div className="space-y-4">
              {isGuest && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Seus dados</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm text-muted-foreground">Nome Completo *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Seu nome completo"
                    className="bg-background/50 border-border/30"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-sm text-muted-foreground">CPF *</Label>
                  <MaskedInput
                    id="cpf"
                    mask="cpf"
                    value={formData.cpf}
                    onChange={(value, isValid) => { setFormData({ ...formData, cpf: value }); setCpfValid(isValid); }}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-muted-foreground">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                    className="bg-background/50 border-border/30"
                    required
                    readOnly={!!user}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm text-muted-foreground">Telefone</Label>
                  <MaskedInput
                    id="phone"
                    mask="phone"
                    value={formData.phone}
                    onChange={(value) => setFormData({ ...formData, phone: value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fiscalYear" className="text-sm text-muted-foreground">Ano-Base *</Label>
                  <Select
                    value={String(formData.fiscalYear)}
                    onValueChange={(val) => setFormData({ ...formData, fiscalYear: parseInt(val) })}
                  >
                    <SelectTrigger id="fiscalYear" className="bg-background/50 border-border/30">
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
              </div>
            </div>

            {/* Completo extras */}
            {irType === 'completo' && (
              <div className="space-y-4 p-5 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                <h4 className="font-semibold text-sm text-foreground">Informações Adicionais</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="hasInvestments" className="text-sm text-muted-foreground">Investimentos?</Label>
                    <Switch id="hasInvestments" checked={formData.hasInvestments} onCheckedChange={(checked) => setFormData({ ...formData, hasInvestments: checked })} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="hasRentalIncome" className="text-sm text-muted-foreground">Aluguéis?</Label>
                    <Switch id="hasRentalIncome" checked={formData.hasRentalIncome} onCheckedChange={(checked) => setFormData({ ...formData, hasRentalIncome: checked })} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="hasForeignIncome" className="text-sm text-muted-foreground">Renda exterior?</Label>
                    <Switch id="hasForeignIncome" checked={formData.hasForeignIncome} onCheckedChange={(checked) => setFormData({ ...formData, hasForeignIncome: checked })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="incomeSourcesCount" className="text-sm text-muted-foreground">Fontes de renda</Label>
                    <Input
                      id="incomeSourcesCount"
                      type="number"
                      min={1}
                      max={10}
                      value={formData.incomeSourcesCount}
                      onChange={(e) => setFormData({ ...formData, incomeSourcesCount: parseInt(e.target.value) || 1 })}
                      className="bg-background/50 border-border/30"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm text-muted-foreground">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Informações adicionais relevantes..."
                rows={3}
                className="bg-background/50 border-border/30 resize-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-border/20">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground/50 uppercase tracking-wider font-bold">Total</p>
                  <p className="text-3xl font-black text-foreground">{formatPrice(finalPrice)}</p>
                  <p className="text-xs text-muted-foreground/40">pagamento único</p>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto h-14 px-10 rounded-2xl text-base font-bold bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-600/25 hover:shadow-purple-500/35 hover:-translate-y-0.5 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {isCreatingAccount ? 'Criando conta...' : 'Abrindo pagamento...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      {isGuest ? 'Criar conta e pagar' : 'Ir para pagamento'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              {/* Trust signals */}
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground/40">
                <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> LGPD</span>
                <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Dados criptografados</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Pix ou Cartão</span>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
