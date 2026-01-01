import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const bureaus = [
  { id: 'spc', name: 'SPC Brasil', description: 'Sistema de Proteção ao Crédito' },
  { id: 'serasa', name: 'Serasa Experian', description: 'Maior bureau de crédito do país' },
  { id: 'scpc', name: 'SCPC', description: 'Serviço Central de Proteção ao Crédito' },
  { id: 'boa_vista', name: 'Boa Vista SCPC', description: 'Cadastro Positivo e Score' },
];

const benefits = [
  {
    icon: MessageCircle,
    title: 'Chat Direto com Especialista',
    description: 'Converse em tempo real com contador especializado em regularização'
  },
  {
    icon: Shield,
    title: 'Análise Completa',
    description: 'Verificamos todas as pendências em SPC, Serasa, SCPC e Boa Vista'
  },
  {
    icon: Clock,
    title: 'Resultado em até 30 dias',
    description: 'Processo ágil com acompanhamento em tempo real'
  },
  {
    icon: BadgeCheck,
    title: 'Garantia de Resultado',
    description: 'Se não conseguirmos resolver, devolvemos seu dinheiro'
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
    text: 'Atendimento excelente. O contador me orientou em cada etapa do processo.',
    rating: 5
  },
  {
    name: 'Roberto F.',
    role: 'Empresário MEI',
    text: 'Limparam meu CPF e CNPJ ao mesmo tempo. Serviço completo e profissional!',
    rating: 5
  },
];

const LimpaNomePage = () => {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const isSubscribed = subscription.subscribed;
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const basePrice = 99900; // R$ 999,00
  const subscriberDiscount = 0.15; // 15% discount
  const finalPrice = isSubscribed ? basePrice * (1 - subscriberDiscount) : basePrice;

  const handleBureauToggle = (bureauId: string) => {
    setSelectedBureaus(prev => 
      prev.includes(bureauId) 
        ? prev.filter(id => id !== bureauId)
        : [...prev, bureauId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa estar logado para solicitar este serviço');
      navigate('/auth');
      return;
    }

    if (selectedBureaus.length === 0) {
      toast.error('Selecione pelo menos um bureau de crédito');
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse debt amount to cents
      const debtAmountCents = Math.round(
        parseFloat(formData.debtAmount.replace(/[^\d,]/g, '').replace(',', '.')) * 100
      ) || 0;

      // Parse creditors to array
      const creditorsArray = formData.creditors
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      const { data, error } = await supabase
        .from('credit_repair_requests')
        .insert({
          user_id: user.id,
          full_name: formData.fullName,
          cpf: formData.cpf,
          email: formData.email || user.email,
          phone: formData.phone,
          debt_amount_cents: debtAmountCents,
          debt_description: formData.debtDescription,
          creditors: creditorsArray,
          bureaus_selected: selectedBureaus,
          service_price_cents: basePrice,
          discount_applied: isSubscribed,
          final_price_cents: Math.round(finalPrice),
        })
        .select()
        .single();

      if (error) throw error;

      // Create payment session
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'create-credit-repair-payment',
        {
          body: { requestId: data.id }
        }
      );

      if (paymentError) throw paymentError;

      if (paymentData?.url) {
        window.open(paymentData.url, '_blank');
        toast.success('Redirecionando para pagamento...');
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
                <span className="block text-primary-glow mt-2">CPF e CNPJ</span>
              </h1>

              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Regularize seu CPF ou CNPJ em todos os bureaus de crédito.
                Chat direto com IA + especialista para resolver suas pendências.
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

              <div className="glass-card rounded-2xl p-6 inline-block">
                <div className="flex items-center justify-center gap-4">
                  {isSubscribed && (
                    <span className="text-white/60 line-through text-2xl">
                      {formatCurrency(basePrice)}
                    </span>
                  )}
                  <span className="text-4xl md:text-5xl font-bold text-white">
                    {formatCurrency(finalPrice)}
                  </span>
                </div>
                {isSubscribed && (
                  <Badge className="mt-2 bg-success text-success-foreground">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    15% de desconto exclusivo
                  </Badge>
                )}
              </div>
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
                          <Input
                            id="cpf"
                            value={formData.cpf}
                            onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                            placeholder="CPF: 000.000.000-00 ou CNPJ: 00.000.000/0001-00"
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
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            placeholder="(00) 00000-0000"
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
                            Iniciar Limpa Nome - {formatCurrency(finalPrice)}
                          </>
                        )}
                      </Button>
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
                      { step: 2, title: 'Análise inicial', desc: 'Verificamos todas as pendências nos bureaus' },
                      { step: 3, title: 'Chat com especialista', desc: 'Converse em tempo real com nosso contador' },
                      { step: 4, title: 'Nome limpo!', desc: 'Receba a confirmação de regularização' },
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