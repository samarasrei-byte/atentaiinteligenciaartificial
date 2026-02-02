import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MaskedInput } from '@/components/ui/masked-input';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  CreditCard, Lock, ArrowRight, ArrowLeft, Shield, Check, 
  Loader2, Sparkles, Users, Star, Clock, BadgeCheck, Zap,
  Building2, FileText, FileCheck, MessageSquare, Scale, Briefcase
} from 'lucide-react';

// Service configurations - Single Source of Truth with FIXED prices
const serviceConfigs: Record<string, {
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  features: string[];
  basePriceCents: number;
  successUrl: string;
  serviceType: string;
  isCustomPricing?: boolean;
  isFree?: boolean;
  successFee?: boolean;
}> = {
  'limpa-nome-pf': {
    name: 'Limpa Nome Pessoa Física',
    description: 'Regularização completa de restrições em todos os bureaus de crédito',
    icon: CreditCard,
    color: 'accent',
    features: [
      'Exclusão permanente de apontamentos',
      'Análise individual por especialista',
      'Acompanhamento humano dedicado',
      'Todas as plataformas: SPC, Serasa, SCPC, Boa Vista',
    ],
    basePriceCents: 78000, // R$ 780,00 FIXED
    successUrl: '/limpa-nome/sucesso',
    serviceType: 'credit_repair_pf',
  },
  'limpa-nome-pj': {
    name: 'Limpa Nome Empresa (CNPJ)',
    description: 'Regularização cadastral com análise fiscal e jurídica especializada',
    icon: Building2,
    color: 'accent',
    features: [
      'Avaliação completa do CNPJ',
      'Estratégia adequada ao porte',
      'Atendimento humano especializado',
      'Regularização em todas as plataformas',
    ],
    basePriceCents: 97000, // R$ 970,00 FIXED
    successUrl: '/limpa-nome/sucesso',
    serviceType: 'credit_repair_pj',
  },
  'ir-simples': {
    name: 'Declaração IR Simples',
    description: 'Para CLT com poucos rendimentos e sem investimentos complexos',
    icon: FileText,
    color: 'primary',
    features: [
      'Declaração completa',
      'Revisão por especialista',
      'Envio à Receita Federal',
      'Recibo de entrega garantido',
    ],
    basePriceCents: 20000, // R$ 200,00 FIXED
    successUrl: '/payment-success?type=ir',
    serviceType: 'ir_simples',
  },
  'ir-completo': {
    name: 'Declaração IR Completo',
    description: 'Para autônomos, investidores ou múltiplas fontes de renda',
    icon: FileText,
    color: 'purple',
    features: [
      'Análise de todas as fontes de renda',
      'Bens e investimentos inclusos',
      'Otimização fiscal legal',
      'Especialista dedicado',
    ],
    basePriceCents: 42000, // R$ 420,00 FIXED
    successUrl: '/payment-success?type=ir',
    serviceType: 'ir_completo',
  },
  'abertura-empresa': {
    name: 'Abertura de Empresa',
    description: 'Abertura completa de CNPJ com suporte contábil especializado',
    icon: Building2,
    color: 'blue',
    features: [
      'Análise do melhor regime tributário',
      'CNPJ em até 7 dias',
      'Documentação inclusa',
      'Acompanhamento completo',
    ],
    basePriceCents: 78000, // R$ 780,00
    successUrl: '/payment-success?type=company_opening',
    serviceType: 'company_opening',
  },
  'certidao': {
    name: 'Emissão de Certidão',
    description: 'Certidões negativas de débitos fiscais',
    icon: FileCheck,
    color: 'emerald',
    features: [
      'Federal, estadual e municipal',
      'Entrega digital rápida',
      'Revisão por contador',
      'Suporte incluso',
    ],
    basePriceCents: 8000, // R$ 80,00 FIXED
    successUrl: '/payment-success?type=certificate',
    serviceType: 'certificate',
  },
  'bi-contabilidade': {
    name: 'BI+ Contabilidade™',
    description: 'Inteligência artificial com análise humana especializada',
    icon: Briefcase,
    color: 'purple',
    features: [
      'Diagnóstico fiscal completo',
      'Análise por especialista dedicado',
      'Relatórios personalizados',
      'Acompanhamento contínuo',
    ],
    basePriceCents: 0,
    successUrl: '/bi-contabilidade/sucesso',
    serviceType: 'bi_contabilidade',
    isCustomPricing: true, // Valor sob consulta
  },
};

const colorClasses: Record<string, { bg: string; icon: string; button: string; border: string }> = {
  primary: {
    bg: 'bg-primary/10',
    icon: 'text-primary',
    button: 'bg-primary hover:bg-primary/90',
    border: 'border-primary/30',
  },
  accent: {
    bg: 'bg-accent/10',
    icon: 'text-accent',
    button: 'bg-accent hover:bg-accent/90',
    border: 'border-accent/30',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-600',
    button: 'bg-emerald-500 hover:bg-emerald-600',
    border: 'border-emerald-500/30',
  },
  blue: {
    bg: 'bg-blue-500/10',
    icon: 'text-blue-600',
    button: 'bg-blue-500 hover:bg-blue-600',
    border: 'border-blue-500/30',
  },
  purple: {
    bg: 'bg-purple-500/10',
    icon: 'text-purple-600',
    button: 'bg-purple-500 hover:bg-purple-600',
    border: 'border-purple-500/30',
  },
};

const socialProof = [
  { value: '2.847+', label: 'Clientes atendidos' },
  { value: 'R$ 15M+', label: 'Economizados' },
  { value: '4.9/5', label: 'Avaliação média' },
];

export default function CheckoutPage() {
  const { serviceSlug } = useParams<{ serviceSlug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: searchParams.get('name') || '',
    email: searchParams.get('email') || '',
    phone: '',
    cpf: '',
  });
  const [phoneValid, setPhoneValid] = useState(false);
  const [cpfValid, setCpfValid] = useState(false);

  const service = serviceSlug ? serviceConfigs[serviceSlug] : null;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const finalPrice = service ? service.basePriceCents : 0;
  const installmentValue = Math.round(finalPrice / 4);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error('Preencha seu nome completo');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Preencha seu e-mail');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('E-mail inválido');
      return;
    }

    if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
      toast.error('Preencha um telefone válido');
      return;
    }

    if (!service) {
      toast.error('Serviço não encontrado');
      return;
    }

    setIsSubmitting(true);

    try {
      // Map service type for the backend
      let backendServiceType = service.serviceType;
      if (backendServiceType === 'ir_simples' || backendServiceType === 'ir_completo') {
        backendServiceType = 'ir';
      } else if (backendServiceType.startsWith('credit_repair')) {
        // Keep as-is
      }

      const { data, error } = await supabase.functions.invoke('create-guest-service-payment', {
        body: {
          serviceType: service.serviceType.startsWith('credit_repair') 
            ? service.serviceType 
            : service.serviceType === 'ir_simples' || service.serviceType === 'ir_completo'
              ? 'ir'
              : service.serviceType,
          email: formData.email.trim().toLowerCase(),
          fullName: formData.fullName.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          cpf: formData.cpf.replace(/\D/g, '') || undefined,
          irType: service.serviceType === 'ir_simples' ? 'simples' : service.serviceType === 'ir_completo' ? 'completo' : undefined,
          companyType: service.serviceType === 'company_opening' ? 'me' : undefined,
        },
      });

      if (error) throw error;

      if (data?.url) {
        toast.success('Redirecionando para pagamento seguro...');
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não retornada');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Erro ao processar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Serviço não encontrado</h2>
            <p className="text-slate-500 mb-4">O serviço solicitado não existe.</p>
            <Button onClick={() => navigate('/servicos')}>Ver Serviços</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const colors = colorClasses[service.color];
  const IconComponent = service.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-atentai.png" alt="AtentAI" className="h-8" />
          </Link>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Lock className="h-4 w-4" />
            <span>Pagamento Seguro</span>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6 text-white/60 hover:text-white hover:bg-white/10"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Service Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Service Card */}
            <Card className={`bg-white/5 backdrop-blur-xl border-white/10 overflow-hidden`}>
              <CardContent className="p-6 md:p-8">
                {/* Icon & Badge */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`h-16 w-16 rounded-2xl ${colors.bg} flex items-center justify-center`}>
                    <IconComponent className={`h-8 w-8 ${colors.icon}`} />
                  </div>
                  <Badge className="bg-accent text-white border-0">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Checkout Rápido
                  </Badge>
                </div>

                {/* Title & Description */}
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  {service.name}
                </h1>
                <p className="text-white/70 mb-6">
                  {service.description}
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {service.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Check className={`h-5 w-5 ${colors.icon} flex-shrink-0`} />
                      <span className="text-white/80 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Price */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-white">
                      {formatPrice(finalPrice)}
                    </span>
                  </div>
                  <p className="text-white/50 text-sm">
                    ou 4x de {formatPrice(installmentValue)} sem juros
                  </p>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {socialProof.map((item, i) => (
                    <div key={i} className="text-center">
                      <p className="text-lg font-bold text-white">{item.value}</p>
                      <p className="text-xs text-white/50">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Human Support Banner */}
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-accent" />
                <div>
                  <p className="font-semibold text-white">Atendimento Humano Garantido</p>
                  <p className="text-sm text-white/60">Especialistas reais cuidando do seu caso</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Checkout Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-white border-0 shadow-2xl">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Finalizar Pedido</h2>
                    <p className="text-sm text-slate-500">Preencha seus dados para continuar</p>
                  </div>
                </div>

                {/* Fast Checkout Message */}
                <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-slate-900">Checkout em 30 segundos</p>
                      <p className="text-xs text-slate-600">
                        Preencha apenas nome, e-mail e WhatsApp. Após o pagamento, sua conta será criada automaticamente.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-700">
                      Nome Completo *
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Seu nome completo"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="h-12 bg-slate-50 border-slate-200 focus:border-primary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">
                      E-mail *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="h-12 bg-slate-50 border-slate-200 focus:border-primary"
                      required
                    />
                    <p className="text-xs text-slate-500">
                      Você receberá o acesso neste e-mail
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-700">
                      WhatsApp *
                    </Label>
                    <MaskedInput
                      id="phone"
                      mask="phone"
                      value={formData.phone}
                      onChange={(value, isValid) => {
                        setFormData(prev => ({ ...prev, phone: value }));
                        setPhoneValid(isValid);
                      }}
                      className="h-12"
                    />
                    <p className="text-xs text-slate-500">
                      Entraremos em contato por aqui
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="text-slate-700">
                      CPF <span className="text-slate-400">(opcional)</span>
                    </Label>
                    <MaskedInput
                      id="cpf"
                      mask="cpf"
                      value={formData.cpf}
                      onChange={(value, isValid) => {
                        setFormData(prev => ({ ...prev, cpf: value }));
                        setCpfValid(isValid);
                      }}
                      className="h-12"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full h-14 text-lg font-semibold rounded-xl shadow-lg ${colors.button} text-white`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5 mr-2" />
                        Pagar {formatPrice(finalPrice)}
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>

                  {/* Security & Trust */}
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 pt-4">
                    <div className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Pagamento criptografado
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Dados protegidos
                    </div>
                    <div className="flex items-center gap-1">
                      <BadgeCheck className="h-3 w-3" />
                      Stripe verificado
                    </div>
                  </div>

                  <p className="text-[11px] text-center text-slate-400">
                    Ao clicar em Pagar, você será redirecionado para o checkout seguro do Stripe.
                    Após o pagamento, sua conta será criada automaticamente e você receberá as instruções por e-mail.
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Benefits */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                <Clock className="h-5 w-5 text-accent mb-2" />
                <p className="text-sm font-medium text-white">Acesso Imediato</p>
                <p className="text-xs text-white/50">Após o pagamento</p>
              </div>
              <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                <Star className="h-5 w-5 text-accent mb-2" />
                <p className="text-sm font-medium text-white">Experiência Premium</p>
                <p className="text-xs text-white/50">Sem burocracia</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 mt-12">
        <div className="container max-w-6xl mx-auto px-4 text-center text-white/40 text-sm">
          <p>© {new Date().getFullYear()} AtentAI — Inteligência tributária para todos.</p>
        </div>
      </footer>
    </div>
  );
}
