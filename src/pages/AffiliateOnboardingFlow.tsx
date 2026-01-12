import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { MaskedInput } from '@/components/ui/masked-input';
import {
  Eye, EyeOff, Loader2, Users, TrendingUp, Wallet, Shield, ArrowRight,
  ArrowLeft, CheckCircle2, Gift, Sparkles, Link as LinkIcon, MessageCircle,
  Copy, Check, ChevronRight, PartyPopper, Rocket
} from 'lucide-react';

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const SERVICES_INFO = [
  {
    icon: '🧠',
    name: 'Inteligência Fiscal',
    description: 'Análise com IA para recuperação de créditos tributários',
    commission: '15%'
  },
  {
    icon: '🛡️',
    name: 'Limpa Nome Premium',
    description: 'Regularização rápida com equipe jurídica especializada',
    commission: '20%'
  },
  {
    icon: '📈',
    name: 'Score Up Empresarial',
    description: 'Melhoria do score e reputação financeira',
    commission: '15%'
  },
  {
    icon: '🔒',
    name: 'Proteção Comercial',
    description: 'Monitoramento e proteção contra fraudes',
    commission: '12%'
  },
  {
    icon: '💼',
    name: 'Consultoria Empresarial',
    description: 'Planejamento tributário personalizado',
    commission: '18%'
  }
];

type OnboardingStep = 'register' | 'welcome' | 'commission' | 'services' | 'link' | 'whatsapp';

export default function AffiliateOnboardingFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('register');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState('');
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    email: '',
    phone: '',
    state: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (!formData.termsAccepted) {
      toast.error('Você precisa aceitar os termos');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/afiliado/painel`,
          data: { full_name: formData.fullName }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create affiliate profile
        const { data: affiliateData, error: affiliateError } = await supabase
          .from('affiliates')
          .insert({
            user_id: authData.user.id,
            full_name: formData.fullName,
            cpf: formData.cpf.replace(/\D/g, ''),
            email: formData.email,
            phone: formData.phone.replace(/\D/g, ''),
            state: formData.state,
            whatsapp_number: formData.phone.replace(/\D/g, ''),
            terms_accepted_at: new Date().toISOString()
          })
          .select('affiliate_code')
          .single();

        if (affiliateError) throw affiliateError;

        setAffiliateCode(affiliateData.affiliate_code);

        // Add affiliate role
        await supabase.from('user_roles').insert({
          user_id: authData.user.id,
          role: 'affiliate' as any
        });

        toast.success('Conta criada com sucesso!');
        setCurrentStep('welcome');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Erro ao realizar cadastro');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    const link = `${window.location.origin}/p/${affiliateCode}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const goToPanel = () => {
    navigate('/afiliado/painel');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'register':
        return (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md mx-auto"
          >
            <Card className="border-0 shadow-2xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">Cadastro de Afiliado</h1>
                  <p className="text-muted-foreground">Crie sua conta e comece a ganhar</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome Completo *</Label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>CPF *</Label>
                      <MaskedInput
                        mask="cpf"
                        value={formData.cpf}
                        onChange={(value) => setFormData({ ...formData, cpf: value })}
                        showValidation={false}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Celular *</Label>
                      <MaskedInput
                        mask="phone"
                        value={formData.phone}
                        onChange={(value) => setFormData({ ...formData, phone: value })}
                        showValidation={false}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>E-mail *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Estado *</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) => setFormData({ ...formData, state: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRAZILIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Senha *</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="••••••••"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Confirmar *</Label>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <Checkbox
                      id="terms"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: checked as boolean })}
                    />
                    <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                      Li e aceito os <a href="/termos-de-uso" className="text-primary hover:underline">Termos do Programa</a> e a{' '}
                      <a href="/politica-privacidade" className="text-primary hover:underline">Política de Privacidade</a>
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 text-base font-semibold rounded-xl mt-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      <>
                        Criar Minha Conta
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  Já tem uma conta?{' '}
                  <a href="/auth" className="text-primary hover:underline font-medium">
                    Fazer login
                  </a>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'welcome':
        return (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg mx-auto text-center"
          >
            <Card className="border-0 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-primary via-primary-glow to-accent p-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4"
                >
                  <PartyPopper className="w-12 h-12 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo ao Programa!</h1>
                <p className="text-white/80 text-lg">{formData.fullName}</p>
              </div>
              
              <CardContent className="p-8">
                <p className="text-lg text-muted-foreground mb-8">
                  Sua conta foi criada com sucesso! Agora vamos te mostrar como funciona o programa e como você pode começar a ganhar.
                </p>

                <Button
                  onClick={() => setCurrentStep('commission')}
                  className="w-full h-12 font-semibold rounded-xl"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'commission':
        return (
          <motion.div
            key="commission"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-lg mx-auto"
          >
            <Card className="border-0 shadow-2xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Como Funciona a Comissão</h2>
                  <p className="text-muted-foreground">Transparência total nos seus ganhos</p>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-medium text-foreground">Você recebe</span>
                      <span className="text-4xl font-bold text-green-600">90%</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Da comissão de cada venda realizada através do seu link
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-muted">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-medium text-foreground">Taxa da plataforma</span>
                      <span className="text-4xl font-bold text-muted-foreground">10%</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Retido para manutenção e suporte da plataforma
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                    <div className="flex items-start gap-3">
                      <Gift className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Saques via PIX</p>
                        <p className="text-sm text-muted-foreground">
                          Solicite saques a qualquer momento, processados em até 24h
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('welcome')}
                    className="flex-1 h-12 rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setCurrentStep('services')}
                    className="flex-1 h-12 font-semibold rounded-xl"
                  >
                    Continuar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'services':
        return (
          <motion.div
            key="services"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-2xl mx-auto"
          >
            <Card className="border-0 shadow-2xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Serviços que Você Pode Vender</h2>
                  <p className="text-muted-foreground">Produtos de alto valor com ótimas comissões</p>
                </div>

                <div className="space-y-3">
                  {SERVICES_INFO.map((service, index) => (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <span className="text-3xl">{service.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-primary">{service.commission}</span>
                        <p className="text-xs text-muted-foreground">comissão</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('commission')}
                    className="flex-1 h-12 rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setCurrentStep('link')}
                    className="flex-1 h-12 font-semibold rounded-xl"
                  >
                    Continuar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'link':
        return (
          <motion.div
            key="link"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-lg mx-auto"
          >
            <Card className="border-0 shadow-2xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-yellow-500 flex items-center justify-center mx-auto mb-4">
                    <LinkIcon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Seu Link Personalizado</h2>
                  <p className="text-muted-foreground">Use este link para indicar clientes</p>
                </div>

                <div className="p-4 rounded-xl bg-muted border-2 border-dashed border-primary/30 mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Seu link de afiliado</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm sm:text-base font-mono text-foreground break-all">
                      atentai.com/p/{affiliateCode}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyLink}
                      className="shrink-0"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="text-sm text-foreground">Todas as vendas são rastreadas automaticamente</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="text-sm text-foreground">Comissões liberadas após confirmação do pagamento</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="text-sm text-foreground">Dashboard em tempo real com todos os dados</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('services')}
                    className="flex-1 h-12 rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setCurrentStep('whatsapp')}
                    className="flex-1 h-12 font-semibold rounded-xl"
                  >
                    Continuar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'whatsapp':
        return (
          <motion.div
            key="whatsapp"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg mx-auto"
          >
            <Card className="border-0 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4"
                >
                  <MessageCircle className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">WhatsApp Integrado</h2>
                <p className="text-white/80">Suporte e vendas em um só lugar</p>
              </div>

              <CardContent className="p-8">
                <p className="text-center text-muted-foreground mb-6">
                  Todos os leads que você capturar serão direcionados para o WhatsApp oficial da empresa, onde nossa equipe dará sequência ao atendimento.
                </p>

                <div className="p-4 rounded-xl bg-muted mb-6">
                  <p className="text-sm text-muted-foreground mb-1">WhatsApp do Suporte</p>
                  <p className="text-lg font-mono font-semibold text-foreground">(11) 99999-9999</p>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="text-sm text-foreground">Atendimento profissional</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="text-sm text-foreground">Equipe treinada para converter</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="text-sm text-foreground">Você acompanha tudo pelo painel</span>
                  </div>
                </div>

                <Button
                  onClick={goToPanel}
                  className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-primary-glow"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Acessar Meu Painel
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );
    }
  };

  // Progress indicator
  const steps = ['register', 'welcome', 'commission', 'services', 'link', 'whatsapp'];
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex flex-col">
      {/* Progress Bar */}
      {currentStep !== 'register' && (
        <div className="p-4">
          <div className="max-w-lg mx-auto">
            <div className="flex justify-between mb-2">
              {steps.slice(1).map((step, index) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    index < currentIndex ? 'bg-primary text-primary-foreground' :
                    index === currentIndex - 1 ? 'bg-primary text-primary-foreground' :
                    'bg-muted text-muted-foreground'
                  }`}
                >
                  {index < currentIndex - 1 ? <Check className="w-4 h-4" /> : index + 1}
                </div>
              ))}
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex) / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
}
