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
  FileText,
  Building2,
  Calculator,
  Users,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Scale,
  Clock,
  Shield,
  Phone,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, parseCurrencyInput, formatCurrencyInput } from '@/lib/taxConstants';

interface AutonomoMEFlowProps {
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

const AutonomoMEFlow: React.FC<AutonomoMEFlowProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    cpf: '',
    phone: '',
    email: user?.email || '',
    profession: '',
    annualRevenue: '',
    monthlyExpenses: '',
    hasEmployees: '',
    wantsPartner: '',
    currentSituation: '',
    city: '',
    state: '',
  });

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
        return profileData.fullName && profileData.cpf.length === 14 && profileData.phone.length >= 14;
      case 2:
        return profileData.profession && profileData.annualRevenue && profileData.monthlyExpenses;
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
      onBack();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const annualRevenue = parseCurrencyInput(profileData.annualRevenue);
      
      // Save profile data
      const { error } = await supabase.from('autonomo_profiles').upsert({
        user_id: user?.id,
        cpf: profileData.cpf,
        profession: PROFESSIONS.find(p => p.value === profileData.profession)?.label || profileData.profession,
        profession_category: profileData.profession,
        current_regime: recommendation?.regime || 'pendente',
        monthly_revenue_average_cents: Math.round(annualRevenue / 12 * 100),
        city: profileData.city,
        state: profileData.state,
        phone: profileData.phone,
      });

      if (error) throw error;

      toast.success('Solicitação enviada! Um contador entrará em contato em breve.');
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Erro ao enviar solicitação. Tente novamente.');
    } finally {
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
            <h1 className="text-xl font-bold text-white">Autônomo / ME</h1>
            <p className="text-sm text-white/60">Passo {step} de {totalSteps}</p>
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/30">
            Diagnóstico IA
          </Badge>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 bg-slate-800" />
          <div className="flex justify-between mt-2">
            {['Dados', 'Perfil', 'Análise', 'Resultado', 'Contador'].map((label, i) => (
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
                  <Label htmlFor="fullName" className="text-white/80">Nome Completo</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => updateData('fullName', e.target.value)}
                    placeholder="Seu nome completo"
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-white/80">CPF</Label>
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
                  <Label htmlFor="phone" className="text-white/80">Telefone/WhatsApp</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => updateData('phone', formatPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => updateData('email', e.target.value)}
                    placeholder="seu@email.com"
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
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
                  <Label htmlFor="profession" className="text-white/80">Profissão</Label>
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
                  <Label htmlFor="annualRevenue" className="text-white/80">Faturamento Anual Estimado</Label>
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
                  <Label className="text-white/80">Situação atual:</Label>
                  <RadioGroup
                    value={profileData.currentSituation}
                    onValueChange={(v) => updateData('currentSituation', v)}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="informal" id="sit-informal" className="border-primary" />
                      <Label htmlFor="sit-informal" className="text-white/70">Trabalho informal (sem CNPJ)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="clt" id="sit-clt" className="border-primary" />
                      <Label htmlFor="sit-clt" className="text-white/70">CLT (quer sair)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mei" id="sit-mei" className="border-primary" />
                      <Label htmlFor="sit-mei" className="text-white/70">Já sou MEI (quer migrar)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="starting" id="sit-starting" className="border-primary" />
                      <Label htmlFor="sit-starting" className="text-white/70">Ainda vou começar</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </>
          )}

          {step === 4 && recommendation && (
            <>
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-white">Resultado da Análise</CardTitle>
                <CardDescription className="text-white/60">
                  Com base no seu perfil, identificamos a melhor opção
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Recommendation Card */}
                <div className={`p-5 rounded-xl border ${
                  recommendation.regime === 'mei' 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : 'bg-primary/10 border-primary/30'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                      recommendation.regime === 'mei' 
                        ? 'bg-emerald-500/20' 
                        : 'bg-primary/20'
                    }`}>
                      {recommendation.regime === 'mei' ? (
                        <User className="h-6 w-6 text-emerald-400" />
                      ) : (
                        <Building2 className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{recommendation.title}</h3>
                      <p className="text-sm text-white/70 mt-1">{recommendation.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {recommendation.reasons.map((reason, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                        <CheckCircle2 className={`h-4 w-4 shrink-0 ${
                          recommendation.regime === 'mei' ? 'text-emerald-400' : 'text-primary'
                        }`} />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>

                  {recommendation.savings && (
                    <div className="mt-4 p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className={`h-4 w-4 ${
                          recommendation.regime === 'mei' ? 'text-emerald-400' : 'text-primary'
                        }`} />
                        <span className="text-sm font-medium text-white">{recommendation.savings}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reform Impact */}
                <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-white text-sm">Impacto da Reforma Tributária</h4>
                      <p className="text-xs text-white/60 mt-1">
                        {recommendation.regime === 'mei' 
                          ? 'O MEI terá benefícios mantidos no novo sistema tributário, com adaptações graduais até 2033.'
                          : 'Empresas do Simples Nacional terão possibilidade de aproveitar créditos do IBS/CBS, potencializando economia.'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {recommendation.regime === 'mei' && (
                  <Button
                    onClick={() => onBack()}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Ir para Fluxo MEI
                  </Button>
                )}
              </CardContent>
            </>
          )}

          {step === 5 && (
            <>
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-white">Encaminhamento para Contador</CardTitle>
                <CardDescription className="text-white/60">
                  Um contador parceiro entrará em contato para abrir sua empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-white/80">Cidade</Label>
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={(e) => updateData('city', e.target.value)}
                      placeholder="Sua cidade"
                      className="bg-slate-900/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-white/80">Estado</Label>
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
                </div>

                <div className="bg-slate-900/50 rounded-xl p-4 space-y-3">
                  <h4 className="font-medium text-white text-sm">O que acontece agora:</h4>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <p className="text-sm text-white/70">Você envia sua solicitação</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">2</span>
                    </div>
                    <p className="text-sm text-white/70">Um contador parceiro analisa seu perfil</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">3</span>
                    </div>
                    <p className="text-sm text-white/70">Você recebe contato em até 24h úteis</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">4</span>
                    </div>
                    <p className="text-sm text-white/70">Acompanhe o status aqui no sistema</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-xl border border-primary/30">
                  <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-white/70">
                    Contadores parceiros são verificados e especializados na Reforma Tributária.
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {/* Footer Actions */}
          <div className="p-6 pt-0">
            <div className="flex gap-3">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 border-slate-600 text-white hover:bg-slate-700"
                >
                  Voltar
                </Button>
              )}
              {step < 3 && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white gap-2"
                >
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              {step === 3 && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white gap-2"
                >
                  Analisar Perfil
                  <Sparkles className="h-4 w-4" />
                </Button>
              )}
              {step === 4 && recommendation?.regime !== 'mei' && (
                <Button
                  onClick={() => setStep(5)}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white gap-2"
                >
                  Falar com Contador
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              {step === 5 && (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white gap-2"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AutonomoMEFlow;
