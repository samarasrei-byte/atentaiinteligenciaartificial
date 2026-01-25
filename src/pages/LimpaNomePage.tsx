import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { MaskedInput } from '@/components/ui/masked-input';
import { cleanDocument } from '@/lib/documentValidation';
import { AffiliateCouponInput, calculateAffiliateCouponDiscount, AppliedAffiliateCoupon } from '@/components/pricing/AffiliateCouponInput';
import { 
  ArrowLeft, 
  Shield, 
  CheckCircle, 
  MessageCircle, 
  Clock, 
  Sparkles,
  BadgeCheck,
  TrendingDown,
  Users,
  Star,
  Zap,
  FileText,
  Tag
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const bureaus = [
  { id: 'spc', name: 'SPC Brasil', description: 'Sistema de Proteção ao Crédito' },
  { id: 'serasa', name: 'Serasa Experian', description: 'Maior bureau de crédito do país' },
  { id: 'scpc', name: 'SCPC', description: 'Serviço Central de Proteção ao Crédito' },
  { id: 'boa_vista', name: 'Boa Vista SCPC', description: 'Cadastro Positivo e Score' },
  { id: 'quod', name: 'Quod', description: 'Bureau digital dos bancos' },
  { id: 'cenprot', name: 'Cenprot', description: 'Central de Protestos' },
  { id: 'bacen', name: 'Registrato', description: 'Sistema do Banco Central' },
  { id: 'cadin', name: 'CADIN', description: 'Cadastro de inadimplentes federais' },
];

const benefits = [
  {
    icon: Shield,
    title: 'Serviço 100% Jurídico',
    description: 'Entramos com liminar coletiva para exclusão permanente dos apontamentos'
  },
  {
    icon: MessageCircle,
    title: 'Sem Negociação de Dívidas',
    description: 'Antecipamos o prazo prescricional, não quitamos nem fazemos acordos'
  },
  {
    icon: Clock,
    title: 'Resultado em até 30 dias',
    description: 'Processo ágil com acompanhamento em tempo real via WhatsApp'
  },
  {
    icon: BadgeCheck,
    title: 'Bônus: Aumento de Score',
    description: 'Regularização do score inclusa para quem limpar o nome agora!'
  },
];

const testimonials = [
  {
    name: 'Carlos M.',
    role: 'Empresário',
    text: 'Tinha mais de R$ 50.000 em pendências. Em 25 dias estava com o nome limpo!',
    rating: 5
  },
  {
    name: 'Ana Paula S.',
    role: 'Autônoma',
    text: 'Atendimento excelente. O especialista me orientou em cada etapa do processo.',
    rating: 5
  },
  {
    name: 'Roberto F.',
    role: 'Empresário MEI',
    text: 'Limparam meu CPF e CNPJ ao mesmo tempo. Serviço completo e profissional!',
    rating: 5
  },
];

type PlanType = 'pf' | 'pj';

const plans = {
  pf: {
    id: 'pf',
    name: 'Pessoa Física',
    description: 'Liminar coletiva para CPF',
    basePrice: 78000, // R$ 780,00
    icon: '👤',
    features: [
      'Liminar coletiva em todos os bureaus',
      'Exclusão permanente de apontamentos',
      'Antecipação do prazo prescricional',
      'Acompanhamento jurídico completo',
      '🎁 Bônus: Regularização de Score',
    ]
  },
  pj: {
    id: 'pj',
    name: 'Empresa (CNPJ)',
    description: 'Liminar coletiva para CNPJ',
    basePrice: 97000, // R$ 970,00
    icon: '🏢',
    popular: true,
    features: [
      'Liminar coletiva em todos os bureaus',
      'Exclusão permanente de apontamentos',
      'Antecipação do prazo prescricional',
      'Análise de protestos empresariais',
      'Orientação CADIN/PGFN',
      'Acompanhamento jurídico completo',
      '🎁 Bônus: Regularização de Score',
    ]
  }
};

const LimpaNomePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, subscription } = useAuth();
  const isSubscribed = subscription.subscribed;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get plan from URL params (from onboarding)
  const planFromUrl = searchParams.get('plan');
  const isPrefilled = searchParams.get('prefilled') === 'true';
  
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(planFromUrl === 'pj' ? 'pj' : 'pf');
  const [selectedBureaus, setSelectedBureaus] = useState<string[]>(['spc', 'serasa', 'scpc', 'boa_vista']);
  
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    email: '',
    phone: '',
    debtAmount: '',
    debtDescription: '',
    creditors: '',
  });
  
  const [cpfValid, setCpfValid] = useState(false);
  const [phoneValid, setPhoneValid] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedAffiliateCoupon | null>(null);

  // Hydrate form data from localStorage (from onboarding)
  useEffect(() => {
    if (isPrefilled) {
      try {
        const savedLead = localStorage.getItem('limpa_nome_lead');
        if (savedLead) {
          const leadData = JSON.parse(savedLead);
          setFormData(prev => ({
            ...prev,
            fullName: leadData.name || '',
            cpf: leadData.cpf || '',
            phone: leadData.whatsapp || '',
            debtDescription: leadData.debtTypes?.join(', ') || '',
          }));
          // Update plan from saved data if available
          if (leadData.plan === 'pf' || leadData.plan === 'pj') {
            setSelectedPlan(leadData.plan);
          }
          // Clear localStorage after hydration
          localStorage.removeItem('limpa_nome_lead');
        }
      } catch (error) {
        console.error('Error loading saved lead data:', error);
      }
    }
  }, [isPrefilled]);

  const currentPlan = plans[selectedPlan];
  const subscriberDiscount = 0.10; // 10% discount
  const basePrice = currentPlan.basePrice;
  const priceAfterSubscription = isSubscribed ? basePrice * (1 - subscriberDiscount) : basePrice;
  
  // Apply affiliate coupon discount
  const { discountCents: couponDiscount, finalPriceCents } = calculateAffiliateCouponDiscount(
    priceAfterSubscription,
    appliedCoupon
  );
  const finalPrice = finalPriceCents;
  const installmentValue = Math.round(finalPrice / 4); // 4x sem juros

  const handleBureauToggle = (bureauId: string) => {
    setSelectedBureaus(prev => 
      prev.includes(bureauId) 
        ? prev.filter(id => id !== bureauId)
        : [...prev, bureauId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email) {
      toast.error('Preencha nome e email para continuar');
      return;
    }

    if (selectedBureaus.length === 0) {
      toast.error('Selecione pelo menos um bureau de crédito');
      return;
    }

    setIsSubmitting(true);

    try {
      const debtAmountCents = Math.round(
        parseFloat(formData.debtAmount.replace(/[^\d,]/g, '').replace(',', '.')) * 100
      ) || 0;

      const creditorsArray = formData.creditors
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      // Use guest checkout endpoint with plan type
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'create-guest-service-payment',
        {
          body: {
            serviceType: selectedPlan === 'pf' ? 'credit_repair_pf' : 'credit_repair_pj',
            email: formData.email || user?.email,
            fullName: formData.fullName,
            cpf: formData.cpf,
            phone: formData.phone,
            debtAmountCents,
            debtDescription: formData.debtDescription,
            creditors: creditorsArray,
            bureausSelected: selectedBureaus,
            planType: selectedPlan,
          }
        }
      );

      if (paymentError) throw paymentError;

      if (paymentData?.url) {
        toast.success(user ? 'Redirecionando para pagamento...' : 'Após o pagamento, sua conta será criada automaticamente!');
        window.open(paymentData.url, '_blank');
      }

    } catch (error: any) {
      console.error('Error creating credit repair request:', error);
      toast.error('Erro ao criar solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onNavigate={() => navigate('/')} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 hero-gradient overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary-glow/20 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-6 text-white/80 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold glow-accent">
                <Sparkles className="h-4 w-4 mr-2" />
                SERVIÇO PREMIUM
              </Badge>

              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Limpa Nome
                <span className="block text-primary-glow mt-2">Serviço Jurídico</span>
              </h1>

              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Serviço <strong className="text-white">100% jurídico</strong> com liminar coletiva para exclusão permanente 
                de todos os apontamentos nos Órgãos de Proteção ao Crédito. <strong className="text-accent">+ Bônus: Aumento de Score!</strong>
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {bureaus.map(bureau => (
                  <Badge 
                    key={bureau.id}
                    variant="secondary" 
                    className="bg-white/20 text-white border-white/30 px-4 py-2"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {bureau.name}
                  </Badge>
                ))}
              </div>

              {/* Plan Selection Cards */}
              <div className="grid md:grid-cols-2 gap-4 max-w-xl mx-auto mb-8">
                {Object.values(plans).map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id as PlanType)}
                    className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                      selectedPlan === plan.id
                        ? 'bg-white/20 border-2 border-primary-glow shadow-lg scale-105'
                        : 'bg-white/10 border border-white/20 hover:bg-white/15'
                    }`}
                  >
                    {'popular' in plan && plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs">
                        Mais Solicitado
                      </Badge>
                    )}
                    <div className="text-4xl mb-3">{plan.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-white/60 text-sm mb-4">{plan.description}</p>
                    <div className="text-3xl font-bold text-white">
                      {formatCurrency(isSubscribed ? plan.basePrice * 0.9 : plan.basePrice)}
                    </div>
                    <p className="text-white/80 text-sm mt-1">
                      ou 4x de {formatCurrency(Math.round((isSubscribed ? plan.basePrice * 0.9 : plan.basePrice) / 4))}
                    </p>
                    {selectedPlan === plan.id && (
                      <CheckCircle className="absolute top-4 right-4 h-6 w-6 text-primary-glow" />
                    )}
                  </div>
                ))}
              </div>
              
              {isSubscribed && (
                <Badge className="bg-success text-success-foreground">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  10% de desconto exclusivo aplicado
                </Badge>
              )}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Por que escolher nosso serviço?
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} variant="elevated" className="group hover:-translate-y-2 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-medium group-hover:scale-110 transition-transform">
                      <benefit.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Main Form Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Form */}
              <div className="lg:col-span-2">
                <Card className="shadow-strong">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Solicitar Limpa Nome
                    </CardTitle>
                    <CardDescription>
                      Preencha seus dados para iniciar o processo de regularização
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Nome Completo *</Label>
                          <Input
                            id="fullName"
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            placeholder="Seu nome completo"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cpf">CPF ou CNPJ *</Label>
                          <MaskedInput
                            id="cpf"
                            mask="cpf-cnpj"
                            value={formData.cpf}
                            onChange={(value, isValid) => {
                              setFormData({...formData, cpf: value});
                              setCpfValid(isValid);
                            }}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">E-mail</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            placeholder="seu@email.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone *</Label>
                          <MaskedInput
                            id="phone"
                            mask="phone"
                            value={formData.phone}
                            onChange={(value, isValid) => {
                              setFormData({...formData, phone: value});
                              setPhoneValid(isValid);
                            }}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="debtAmount">Valor Aproximado das Dívidas</Label>
                        <Input
                          id="debtAmount"
                          value={formData.debtAmount}
                          onChange={(e) => setFormData({...formData, debtAmount: e.target.value})}
                          placeholder="R$ 0,00"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="creditors">Credores (separados por vírgula)</Label>
                        <Input
                          id="creditors"
                          value={formData.creditors}
                          onChange={(e) => setFormData({...formData, creditors: e.target.value})}
                          placeholder="Banco X, Financeira Y, Loja Z"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="debtDescription">Descrição da Situação</Label>
                        <Textarea
                          id="debtDescription"
                          value={formData.debtDescription}
                          onChange={(e) => setFormData({...formData, debtDescription: e.target.value})}
                          placeholder="Descreva brevemente sua situação financeira e as dívidas que deseja regularizar..."
                          rows={4}
                        />
                      </div>

                      <div className="space-y-4">
                        <Label>Bureaus de Crédito para Verificação</Label>
                        <div className="grid md:grid-cols-2 gap-3">
                          {bureaus.map(bureau => (
                            <div
                              key={bureau.id}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedBureaus.includes(bureau.id)
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                              onClick={() => handleBureauToggle(bureau.id)}
                            >
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  checked={selectedBureaus.includes(bureau.id)}
                                  onCheckedChange={() => handleBureauToggle(bureau.id)}
                                />
                                <div>
                                  <p className="font-medium">{bureau.name}</p>
                                  <p className="text-sm text-muted-foreground">{bureau.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Affiliate Coupon Input */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-primary" />
                          Cupom de Desconto
                        </Label>
                        <AffiliateCouponInput
                          serviceType={selectedPlan === 'pf' ? 'credit_repair_pf' : 'credit_repair_pj'}
                          onCouponApplied={setAppliedCoupon}
                          onCouponRemoved={() => setAppliedCoupon(null)}
                          appliedCoupon={appliedCoupon}
                        />
                        {appliedCoupon && (
                          <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-success font-medium">Desconto do cupom:</span>
                              <span className="text-success font-bold">-{formatCurrency(couponDiscount)}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 glow-primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Zap className="h-5 w-5 mr-2 animate-pulse" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <Shield className="h-5 w-5 mr-2" />
                            Limpar Nome - 4x de {formatCurrency(installmentValue)}
                          </>
                        )}
                      </Button>
                      <p className="text-center text-sm text-muted-foreground mt-2">
                        ou {formatCurrency(finalPrice)} à vista
                        {appliedCoupon && (
                          <span className="text-success ml-2">(cupom aplicado!)</span>
                        )}
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Process Steps */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Como Funciona</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { step: 1, title: 'Envie seus dados', desc: 'Preencha o formulário com suas informações' },
                      { step: 2, title: 'Análise em 8 bureaus', desc: 'Verificamos SPC, Serasa, Quod, Cenprot e mais' },
                      { step: 3, title: 'Chat IA + Contador', desc: 'Atendimento 24h com especialista dedicado' },
                      { step: 4, title: 'Nome limpo!', desc: 'Carta de quitação digital + relatório final' },
                    ].map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">{item.step}</span>
                        </div>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Premium Features */}
                <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-violet-500/5">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      O que está incluso
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      '✓ Análise completa em 8 plataformas',
                      '✓ Contador humano dedicado ao seu caso',
                      '✓ Verificação CPF e CNPJ simultânea',
                      '✓ Consulta Registrato (Banco Central)',
                      '✓ Análise de protestos (Cenprot)',
                      '✓ Carta de quitação digital',
                      '✓ Relatório completo de regularização',
                      '✓ Acompanhamento por 90 dias',
                      '✓ Suporte prioritário WhatsApp',
                      '✓ Orientação para score positivo',
                    ].map((item, index) => (
                      <p key={index} className="text-sm text-muted-foreground">{item}</p>
                    ))}
                  </CardContent>
                </Card>

                {/* Testimonials */}
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      O que dizem nossos clientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {testimonials.map((testimonial, index) => (
                      <div key={index} className="p-4 bg-background rounded-lg">
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                          ))}
                        </div>
                        <p className="text-sm italic mb-2">"{testimonial.text}"</p>
                        <p className="text-xs text-muted-foreground">
                          <strong>{testimonial.name}</strong> • {testimonial.role}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Guarantee */}
                <Card className="bg-success/10 border-success/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-success rounded-full">
                        <Shield className="h-6 w-6 text-success-foreground" />
                      </div>
                      <div>
                        <p className="font-bold text-success">Garantia de Satisfação</p>
                        <p className="text-sm text-muted-foreground">
                          Se não resolvermos, devolvemos 100% do valor
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer onNavigate={() => navigate('/')} />
    </div>
  );
};

export default LimpaNomePage;