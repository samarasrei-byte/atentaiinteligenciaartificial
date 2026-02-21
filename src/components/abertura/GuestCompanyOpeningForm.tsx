import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  User,
  Building2,
  Calculator,
  Sparkles,
  Scale,
  CreditCard,
  Loader2,
  Shield,
  Mail,
  Lock,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, parseCurrencyInput, formatCurrencyInput } from '@/lib/taxConstants';
import { AffiliateCouponInput, calculateAffiliateCouponDiscount, AppliedAffiliateCoupon } from '@/components/pricing/AffiliateCouponInput';

interface GuestCompanyOpeningFormProps {
  onBack?: () => void;
}

interface ProfileData {
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
  profession: string;
  annualRevenue: string;
  monthlyExpenses: string;
  hasEmployees: string;
  wantsPartner: string;
  currentSituation: string;
  city: string;
  state: string;
}

interface Recommendation {
  regime: 'mei' | 'me-simples' | 'me-presumido';
  title: string;
  description: string;
  reasons: string[];
  savings?: string;
  priceCents: number;
}

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const PROFESSIONS = [
  { value: 'medico', label: 'Médico(a)' },
  { value: 'advogado', label: 'Advogado(a)' },
  { value: 'engenheiro', label: 'Engenheiro(a)' },
  { value: 'arquiteto', label: 'Arquiteto(a)' },
  { value: 'contador', label: 'Contador(a)' },
  { value: 'dentista', label: 'Dentista' },
  { value: 'psicologo', label: 'Psicólogo(a)' },
  { value: 'nutricionista', label: 'Nutricionista' },
  { value: 'fisioterapeuta', label: 'Fisioterapeuta' },
  { value: 'consultor', label: 'Consultor(a)' },
  { value: 'desenvolvedor', label: 'Desenvolvedor(a) de Software' },
  { value: 'designer', label: 'Designer' },
  { value: 'marketing', label: 'Profissional de Marketing' },
  { value: 'fotografo', label: 'Fotógrafo(a)' },
  { value: 'personal', label: 'Personal Trainer' },
  { value: 'outro', label: 'Outra profissão' },
];

const GuestCompanyOpeningForm: React.FC<GuestCompanyOpeningFormProps> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedAffiliateCoupon | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    cpf: '',
    phone: '',
    email: '',
    profession: '',
    annualRevenue: '',
    monthlyExpenses: '',
    hasEmployees: '',
    wantsPartner: '',
    currentSituation: '',
    city: '',
    state: '',
  });

  // Calculate final price with coupon
  const getDiscountedPrice = () => {
    if (!recommendation) return { discountCents: 0, finalPriceCents: 0 };
    return calculateAffiliateCouponDiscount(recommendation.priceCents, appliedCoupon);
  };

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const updateData = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return profileData.fullName && profileData.email && profileData.cpf.length === 14 && profileData.phone.length >= 14;
      case 2:
        return profileData.profession && profileData.annualRevenue;
      case 3:
        return profileData.hasEmployees && profileData.wantsPartner && profileData.currentSituation;
      case 4:
        return recommendation !== null;
      case 5:
        return profileData.city && profileData.state;
      default:
        return false;
    }
  };

  const analyzeProfile = (): Recommendation => {
    const annualRevenue = parseCurrencyInput(profileData.annualRevenue);
    const monthlyExpenses = parseCurrencyInput(profileData.monthlyExpenses);
    const hasEmployees = profileData.hasEmployees === 'yes';
    const wantsPartner = profileData.wantsPartner === 'yes';

    // MEI eligibility check
    if (annualRevenue <= 81000 && !hasEmployees && !wantsPartner) {
      return {
        regime: 'mei',
        title: 'MEI - Microempreendedor Individual',
        description: 'Com base no seu perfil, o MEI é a melhor opção para você.',
        reasons: [
          'Faturamento dentro do limite de R$ 81.000/ano',
          'Sem funcionários',
          'Impostos fixos e baixos (DAS mensal)',
          'Processo de abertura simplificado',
        ],
        savings: 'Economia estimada de até 70% em impostos comparado a PF',
        priceCents: 15000, // MEI é serviço separado a R$ 150
      };
    }

    // Simples Nacional
    if (annualRevenue <= 4800000 && monthlyExpenses < annualRevenue * 0.4) {
      return {
        regime: 'me-simples',
        title: 'ME - Simples Nacional',
        description: 'O Simples Nacional oferece o melhor custo-benefício para o seu perfil.',
        reasons: [
          'Faturamento acima do limite MEI',
          'Impostos unificados em uma guia',
          'Alíquotas progressivas favoráveis',
          'Possibilidade de contratar funcionários',
        ],
        savings: 'Economia estimada de até 40% comparado ao Lucro Presumido',
        priceCents: 78000, // R$ 780,00 - Preço oficial 2025
      };
    }

    // Lucro Presumido
    return {
      regime: 'me-presumido',
      title: 'ME - Lucro Presumido',
      description: 'O Lucro Presumido é mais vantajoso considerando suas despesas.',
      reasons: [
        'Margem de lucro menor permite base de cálculo reduzida',
        'Dedução de despesas operacionais',
        'Flexibilidade tributária',
        'Ideal para serviços com alta margem de custos',
      ],
      savings: 'Possibilidade de otimização com créditos tributários',
      priceCents: 78000, // R$ 780,00 - Preço oficial 2025
    };
  };

  const handleAnalyze = () => {
    const result = analyzeProfile();
    setRecommendation(result);
    setStep(4);
  };

  const handleNext = () => {
    if (step === 3) {
      handleAnalyze();
    } else if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack?.();
    }
  };

  const handlePayment = async () => {
    if (!recommendation) return;

    setIsSubmitting(true);
    try {
      const annualRevenue = parseCurrencyInput(profileData.annualRevenue);
      const monthlyExpenses = parseCurrencyInput(profileData.monthlyExpenses);
      const profession = PROFESSIONS.find(p => p.value === profileData.profession)?.label || profileData.profession;

      const { data, error } = await supabase.functions.invoke('create-guest-service-payment', {
        body: {
          serviceType: 'company_opening',
          email: profileData.email,
          fullName: profileData.fullName,
          cpf: profileData.cpf,
          phone: profileData.phone,
          companyType: recommendation.regime === 'mei' ? 'mei' : 'me',
          profession: profession,
          annualRevenue: annualRevenue,
          monthlyExpenses: monthlyExpenses,
          hasEmployees: profileData.hasEmployees,
          wantsPartner: profileData.wantsPartner,
          currentSituation: profileData.currentSituation,
          recommendedRegime: recommendation.regime,
          recommendationReasons: recommendation.reasons,
          city: profileData.city,
          state: profileData.state,
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de pagamento não recebida');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Erro ao processar pagamento: ' + error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-white/60 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Abertura de Empresa</h1>
            <p className="text-sm text-white/60">Passo {step} de {totalSteps}</p>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            Sem Login
          </Badge>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 bg-slate-800" />
          <div className="flex justify-between mt-2">
            {['Dados', 'Perfil', 'Análise', 'Resultado', 'Pagamento'].map((label, i) => (
              <span 
                key={label}
                className={`text-xs ${i + 1 <= step ? 'text-primary' : 'text-white/40'}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          {step === 1 && (
            <>
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-white">Seus Dados</CardTitle>
                <CardDescription className="text-white/60">
                  Informe seus dados para iniciarmos a análise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white/80">Nome Completo *</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => updateData('fullName', e.target.value)}
                    placeholder="Seu nome completo"
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => updateData('email', e.target.value)}
                    placeholder="seu@email.com"
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-white/80">CPF *</Label>
                  <Input
                    id="cpf"
                    value={profileData.cpf}
                    onChange={(e) => updateData('cpf', formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white/80">Telefone/WhatsApp *</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => updateData('phone', formatPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>

                {/* Guest account notice */}
                <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div className="text-xs text-emerald-300">
                      <strong>Sem necessidade de criar conta!</strong>
                      <p className="mt-1 text-emerald-300/80">
                        Após o pagamento, você receberá um e-mail com acesso automático para acompanhar sua solicitação.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-white">Perfil Financeiro</CardTitle>
                <CardDescription className="text-white/60">
                  Essas informações ajudam a identificar o melhor regime
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profession" className="text-white/80">Profissão *</Label>
                  <Select value={profileData.profession} onValueChange={(v) => updateData('profession', v)}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                      <SelectValue placeholder="Selecione sua profissão" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFESSIONS.map(prof => (
                        <SelectItem key={prof.value} value={prof.value}>
                          {prof.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annualRevenue" className="text-white/80">Faturamento Anual Estimado *</Label>
                  <Input
                    id="annualRevenue"
                    value={profileData.annualRevenue}
                    onChange={(e) => updateData('annualRevenue', formatCurrencyInput(e.target.value))}
                    placeholder="R$ 0,00"
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyExpenses" className="text-white/80">Despesas Mensais Estimadas</Label>
                  <Input
                    id="monthlyExpenses"
                    value={profileData.monthlyExpenses}
                    onChange={(e) => updateData('monthlyExpenses', formatCurrencyInput(e.target.value))}
                    placeholder="R$ 0,00"
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                  <p className="text-xs text-white/40">Aluguel, materiais, ferramentas, etc.</p>
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <Scale className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-white">Questionário de Análise</CardTitle>
                <CardDescription className="text-white/60">
                  Responda para identificarmos o melhor regime tributário
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-white/80">Pretende ter funcionários?</Label>
                  <RadioGroup
                    value={profileData.hasEmployees}
                    onValueChange={(v) => updateData('hasEmployees', v)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="emp-yes" className="border-primary" />
                      <Label htmlFor="emp-yes" className="text-white/70">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="emp-no" className="border-primary" />
                      <Label htmlFor="emp-no" className="text-white/70">Não</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-white/80">Pretende ter sócios?</Label>
                  <RadioGroup
                    value={profileData.wantsPartner}
                    onValueChange={(v) => updateData('wantsPartner', v)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="partner-yes" className="border-primary" />
                      <Label htmlFor="partner-yes" className="text-white/70">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="partner-no" className="border-primary" />
                      <Label htmlFor="partner-no" className="text-white/70">Não</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-white/80">Situação atual</Label>
                  <RadioGroup
                    value={profileData.currentSituation}
                    onValueChange={(v) => updateData('currentSituation', v)}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-700 hover:border-primary/50 transition-colors">
                      <RadioGroupItem value="pf" id="sit-pf" className="border-primary" />
                      <Label htmlFor="sit-pf" className="text-white/70 cursor-pointer">
                        Trabalho como Pessoa Física
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-700 hover:border-primary/50 transition-colors">
                      <RadioGroupItem value="mei" id="sit-mei" className="border-primary" />
                      <Label htmlFor="sit-mei" className="text-white/70 cursor-pointer">
                        Já tenho MEI
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-700 hover:border-primary/50 transition-colors">
                      <RadioGroupItem value="clt" id="sit-clt" className="border-primary" />
                      <Label htmlFor="sit-clt" className="text-white/70 cursor-pointer">
                        Sou CLT e quero começar meu negócio
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-700 hover:border-primary/50 transition-colors">
                      <RadioGroupItem value="starting" id="sit-start" className="border-primary" />
                      <Label htmlFor="sit-start" className="text-white/70 cursor-pointer">
                        Estou começando do zero
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </>
          )}

          {step === 4 && recommendation && (
            <>
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white">Recomendação</CardTitle>
                <CardDescription className="text-white/60">
                  Com base na sua análise, identificamos a melhor opção
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <Building2 className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{recommendation.title}</h3>
                      <p className="text-sm text-white/70 mt-1">{recommendation.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    {recommendation.reasons.map((reason, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                  {recommendation.savings && (
                    <div className="mt-4 p-3 rounded-lg bg-emerald-500/10">
                      <p className="text-sm text-emerald-300 font-medium">
                        💰 {recommendation.savings}
                      </p>
                    </div>
                  )}
                </div>

                {/* Price display */}
                <div className="p-4 rounded-xl bg-slate-700/50 border border-slate-600/50">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Valor do serviço:</span>
                    <span className="text-2xl font-bold text-white">
                      {formatCurrency(recommendation.priceCents / 100)}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mt-2">
                    Inclui análise tributária, documentação e acompanhamento completo
                  </p>
                </div>

                {/* Location for step 4 */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-white/80">Estado *</Label>
                    <Select value={profileData.state} onValueChange={(v) => updateData('state', v)}>
                      <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-white/80">Cidade *</Label>
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={(e) => updateData('city', e.target.value)}
                      placeholder="Sua cidade"
                      className="bg-slate-900/50 border-slate-700 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {step === 5 && recommendation && (
            <>
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-white">Confirmar e Pagar</CardTitle>
                <CardDescription className="text-white/60">
                  Revise as informações e finalize o pagamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary */}
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-slate-700/30 flex justify-between items-center">
                    <span className="text-white/70">Serviço:</span>
                    <span className="text-white font-medium">{recommendation.title}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-700/30 flex justify-between items-center">
                    <span className="text-white/70">Nome:</span>
                    <span className="text-white">{profileData.fullName}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-700/30 flex justify-between items-center">
                    <span className="text-white/70">E-mail:</span>
                    <span className="text-white">{profileData.email}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-700/30 flex justify-between items-center">
                    <span className="text-white/70">Localização:</span>
                    <span className="text-white">{profileData.city}, {profileData.state}</span>
                  </div>
                </div>

                {/* Affiliate Coupon Input */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-white/80">
                    <Tag className="h-4 w-4 text-primary" />
                    Cupom de Desconto
                  </Label>
                  <AffiliateCouponInput
                    serviceType="company_opening"
                    onCouponApplied={setAppliedCoupon}
                    onCouponRemoved={() => setAppliedCoupon(null)}
                    appliedCoupon={appliedCoupon}
                  />
                </div>

                {/* Price */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30">
                  {appliedCoupon && (
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                      <span className="text-white/70">Preço original:</span>
                      <span className="text-lg text-white/50 line-through">
                        {formatCurrency(recommendation.priceCents / 100)}
                      </span>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="flex items-center justify-between mb-2 text-emerald-400">
                      <span className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Desconto ({appliedCoupon.code}):
                      </span>
                      <span className="font-semibold">
                        -{formatCurrency(getDiscountedPrice().discountCents / 100)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-white">Total a pagar:</span>
                    <span className="text-3xl font-bold text-white">
                      {formatCurrency(getDiscountedPrice().finalPriceCents / 100)}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-2">
                    Pagamento seguro via Mercado Pago
                  </p>
                </div>

                {/* Security notice */}
                <div className="flex items-start gap-2 text-xs text-white/50 bg-slate-800/50 p-3 rounded-lg">
                  <Shield className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>
                    Seus dados estão protegidos. O pagamento é processado de forma segura via Mercado Pago. 
                    Após a confirmação, você receberá um e-mail com acesso à sua conta.
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {/* Navigation */}
          <div className="p-6 pt-0 flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            {step < 4 && (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-primary hover:bg-primary/90"
              >
                {step === 3 ? 'Analisar Perfil' : 'Próximo'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {step === 4 && (
              <Button
                onClick={() => setStep(5)}
                disabled={!profileData.city || !profileData.state}
                className="bg-primary hover:bg-primary/90"
              >
                Continuar para Pagamento
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {step === 5 && recommendation && (
              <Button
                onClick={handlePayment}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pagar {formatCurrency(getDiscountedPrice().finalPriceCents / 100)}
                    {appliedCoupon && (
                      <Badge className="ml-2 bg-emerald-500/20 text-emerald-300 text-xs">
                        Desconto!
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GuestCompanyOpeningForm;
