import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Check,
  Bot,
  Calculator,
  Users,
  FileText,
  MessageSquare,
  History,
  Crown,
  Sparkles,
  TrendingUp,
  Loader2,
  Shield,
  Zap,
  HelpCircle,
  Headphones,
  Star,
  User,
} from 'lucide-react';

const PlanoAutonomo: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const basePrice = 6500; // R$ 65,00 in cents
  const finalPrice = basePrice - appliedDiscount;

  const features = [
    { icon: Bot, text: 'Simulador IA ilimitado', highlight: true },
    { icon: Calculator, text: 'Comparação PF vs MEI vs PJ' },
    { icon: TrendingUp, text: 'Alertas de economia automáticos' },
    { icon: MessageSquare, text: 'Chat IA tributário ilimitado' },
    { icon: FileText, text: 'Relatórios PDF personalizados' },
    { icon: History, text: 'Histórico completo de simulações' },
    { icon: Users, text: 'Acesso a contadores especializados' },
    { icon: HelpCircle, text: 'Glossário tributário completo' },
    { icon: Headphones, text: 'Suporte prioritário' },
    { icon: Shield, text: 'Dados seguros e protegidos' },
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Economia Real',
      description: 'Descubra quanto você pode economizar escolhendo o regime certo',
    },
    {
      icon: Bot,
      title: 'IA Especializada',
      description: 'Análise inteligente baseada na sua profissão e faturamento',
    },
    {
      icon: User,
      title: 'Para Autônomos',
      description: 'Feito especialmente para profissionais liberais e autônomos',
    },
  ];

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: 'Faça login primeiro',
        description: 'Você precisa estar logado para assinar',
      });
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: 'price_1Shc3X3MU3lG84Gw1OR6C7yf', // Autônomo Master price
          couponId: couponCode || undefined,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao iniciar checkout',
        description: 'Tente novamente em alguns instantes',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCouponApplied = (_couponId: string, discount: { type: 'percent' | 'amount'; value: number }) => {
    if (discount.type === 'percent') {
      setAppliedDiscount(Math.round(basePrice * discount.value / 100));
    } else {
      setAppliedDiscount(discount.value);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={() => {}} />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">
            <User className="h-3 w-3 mr-1" />
            Para Autônomos
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Plano Autônomo <span className="text-primary">Master</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tudo que você precisa para pagar menos impostos de forma legal e inteligente
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="bg-card border-border text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto">
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/30 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Autônomo Master</CardTitle>
              <CardDescription>Acesso completo a todas as ferramentas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Price */}
              <div className="text-center">
                {appliedDiscount > 0 && (
                  <div className="text-lg text-muted-foreground line-through mb-1">
                    {formatPrice(basePrice)}
                  </div>
                )}
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-foreground">
                    {formatPrice(finalPrice)}
                  </span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                {appliedDiscount > 0 && (
                  <Badge className="mt-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    Desconto de {formatPrice(appliedDiscount)} aplicado!
                  </Badge>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      feature.highlight ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div
                      className={`p-1 rounded-full ${
                        feature.highlight ? 'bg-primary/20' : 'bg-muted'
                      }`}
                    >
                      <feature.icon
                        className={`h-4 w-4 ${
                          feature.highlight ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-sm ${
                        feature.highlight ? 'font-medium text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {feature.text}
                    </span>
                    {feature.highlight && (
                      <Sparkles className="h-3 w-3 text-primary ml-auto" />
                    )}
                  </div>
                ))}
              </div>

              {/* Coupon - simplified input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Cupom de desconto</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Digite o cupom"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full h-14 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Crown className="h-5 w-5 mr-2" />
                    Assinar Agora
                  </>
                )}
              </Button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-4">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>Pagamento seguro</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonial */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <Card className="bg-muted/30 border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-lg text-foreground mb-4">
                "Descobri que estava pagando quase R$ 500 a mais por ano como PF. 
                Com a simulação, mudei para MEI e já economizei muito!"
              </p>
              <p className="text-sm text-muted-foreground">
                — Maria S., Desenvolvedora Freelancer
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer onNavigate={() => {}} />
    </div>
  );
};

export default PlanoAutonomo;
