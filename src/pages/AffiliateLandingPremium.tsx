import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { MaskedInput } from '@/components/ui/masked-input';
import {
  Shield, Brain, TrendingUp, FileSearch, Calculator, Wallet, Users,
  Building, CheckCircle2, ArrowRight, Star, Quote, Loader2, MessageCircle,
  Sparkles, Zap, Award, Target, ChartBar, Lock, BadgeCheck, PhoneCall,
  Gift, Clock, ChevronDown, Play, DollarSign, Check
} from 'lucide-react';

const WHATSAPP_GLOBAL = '5511999999999'; // Número global do parceiro

interface Affiliate {
  id: string;
  full_name: string;
  company_name: string | null;
}

const TESTIMONIALS = [
  {
    name: 'Ricardo Mendes',
    role: 'CEO',
    company: 'Tech Solutions',
    text: 'Já gerei mais de R$ 20 mil em comissões. O sistema é transparente e os pagamentos sempre em dia.',
    avatar: 'RM',
    rating: 5
  },
  {
    name: 'Fernanda Costa',
    role: 'Consultora Financeira',
    company: 'FC Consulting',
    text: 'Consegui meus primeiros clientes em 48h. A plataforma facilita muito a captação.',
    avatar: 'FC',
    rating: 5
  },
  {
    name: 'André Oliveira',
    role: 'Contador',
    company: 'Oliveira Contabilidade',
    text: 'A inteligência fiscal gerou mais de R$ 89 milhões em créditos recuperados para nossos indicados.',
    avatar: 'AO',
    rating: 5
  }
];

const SERVICES = [
  {
    icon: Brain,
    title: 'Inteligência Fiscal',
    subtitle: 'Mais popular',
    description: 'Descubra créditos ocultos, pague menos impostos e receba de volta valores pagos indevidamente.',
    features: ['Análise com IA', 'Recuperação de créditos', 'Relatório completo', 'Suporte jurídico'],
    cta: 'Simular Crédito Fiscal',
    color: 'from-blue-500 to-cyan-500',
    popular: true
  },
  {
    icon: Shield,
    title: 'Limpa Nome Premium',
    subtitle: 'Resultado rápido',
    description: 'A regularização mais rápida do mercado com IA e equipe jurídica especializada.',
    features: ['IA para negociação', 'Equipe jurídica', 'Score empresarial', 'Regularização completa'],
    cta: 'Começar Regularização',
    color: 'from-emerald-500 to-green-500',
    popular: false
  },
  {
    icon: TrendingUp,
    title: 'Proteção Comercial + Score Up',
    subtitle: 'Pacote completo',
    description: 'Serviço completo de reputação financeira para sua empresa.',
    features: ['Monitoramento ativo', 'Proteção de score', 'Alertas em tempo real', 'Consultoria dedicada'],
    cta: 'Quero Melhorar Meu Score',
    color: 'from-purple-500 to-violet-500',
    popular: false
  }
];

const TAX_REGIMES = ['Simples Nacional', 'Lucro Presumido', 'Lucro Real', 'MEI'];
const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function AffiliateLandingPremium() {
  const { affiliateCode, serviceSlug } = useParams();
  const navigate = useNavigate();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [simulatorDialogOpen, setSimulatorDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [leadCreated, setLeadCreated] = useState(false);

  const [leadData, setLeadData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    cnpj: '',
    taxRegime: '',
    annualRevenue: '',
    state: ''
  });

  useEffect(() => {
    fetchAffiliate();
  }, [affiliateCode]);

  const fetchAffiliate = async () => {
    if (!affiliateCode) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select('id, full_name, company_name')
        .eq('affiliate_code', affiliateCode)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setAffiliate(data);
    } catch (error) {
      console.error('Affiliate not found:', error);
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (message?: string) => {
    const defaultMessage = `Olá! Vim pelo site do parceiro ${affiliate?.full_name || 'AtentAI'}. Gostaria de saber mais sobre os serviços fiscais.`;
    const encodedMessage = encodeURIComponent(message || defaultMessage);
    window.open(`https://wa.me/${WHATSAPP_GLOBAL}?text=${encodedMessage}`, '_blank');
  };

  const submitLead = async () => {
    if (!affiliate) return;
    setSubmitting(true);

    try {
      const revenueCents = parseFloat(leadData.annualRevenue.replace(/\D/g, '') || '0') * 100;

      await supabase.from('affiliate_leads').insert({
        affiliate_id: affiliate.id,
        full_name: leadData.fullName,
        email: leadData.email,
        phone: leadData.phone.replace(/\D/g, ''),
        company_name: leadData.companyName || null,
        cnpj: leadData.cnpj?.replace(/\D/g, '') || null,
        tax_regime: leadData.taxRegime || null,
        annual_revenue_cents: revenueCents || null,
        state: leadData.state || null,
        utm_source: 'affiliate_landing',
        utm_medium: affiliateCode,
        utm_campaign: selectedService || 'general'
      });

      setLeadCreated(true);
      toast.success('Cadastro realizado com sucesso! Redirecionando para WhatsApp...');
      
      setTimeout(() => {
        openWhatsApp(`Olá! Me chamo ${leadData.fullName}, vim pelo parceiro ${affiliate?.full_name}. Tenho interesse no serviço de ${selectedService || 'consultoria fiscal'}.`);
        setLeadDialogOpen(false);
      }, 1500);
    } catch (error) {
      console.error('Error creating lead:', error);
      toast.error('Erro ao enviar dados. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Fixed WhatsApp Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        onClick={() => openWhatsApp()}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl transition-all hover:scale-105 group"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="font-semibold hidden sm:inline group-hover:inline">Fale Conosco</span>
      </motion.button>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 hero-gradient opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAyMmMtNS41MjMgMC0xMC00LjQ3Ny0xMC0xMHM0LjQ3Ny0xMCAxMC0xMCAxMCA0LjQ3NyAxMCAxMC00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L2c+PC9zdmc+')] opacity-30" />
        
        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-20 left-10 w-20 h-20 rounded-full bg-accent/20 blur-xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute bottom-32 right-20 w-32 h-32 rounded-full bg-primary/20 blur-2xl"
        />

        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-8"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                Programa de Afiliados Premium
                <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-bold">NOVO</span>
              </motion.div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
                Ganhe até{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-accent via-yellow-300 to-accent bg-clip-text text-transparent">
                    R$ 2.500
                  </span>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-accent/30 blur-2xl"
                  />
                </span>
                {' '}por venda
              </h1>

              <p className="text-xl sm:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
                Afiliados do AtentAI lucram com serviços de alto valor como{' '}
                <span className="text-accent font-semibold">Inteligência Fiscal</span> e{' '}
                <span className="text-accent font-semibold">Limpa Nome</span> — com comissões automáticas e saques rápidos.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Button
                  size="lg"
                  onClick={() => navigate('/afiliado/cadastro')}
                  className="h-16 px-10 text-lg font-bold rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-gold group"
                >
                  <Gift className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                  Quero Começar Agora – Cadastro Gratuito
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-6 text-white/70">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">100% Seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm">Ativação Imediata</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm">Saques via PIX</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="w-8 h-8 text-white/50" />
          </motion.div>
        </div>
      </section>

      {/* Big Number Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <DollarSign className="w-8 h-8 text-accent" />
              <span className="text-lg font-medium text-muted-foreground">Resultados Comprovados</span>
            </div>
            <div className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                + R$ 89.000.000
              </span>
            </div>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto">
              já devolvidos em créditos legais para empresas brasileiras
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mt-16 max-w-5xl mx-auto">
            {[
              { icon: Users, value: '500+', label: 'Empresas Atendidas' },
              { icon: BadgeCheck, value: '98%', label: 'Satisfação' },
              { icon: Clock, value: '48h', label: 'Primeiro Resultado' },
              { icon: Award, value: '5 anos', label: 'Análise Retroativa' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-soft bg-card/50 backdrop-blur-sm hover:shadow-medium transition-all">
                  <CardContent className="p-6 text-center">
                    <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof - Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Quote className="w-4 h-4" />
              Prova Social
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
              O que nossos afiliados dizem
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Histórias reais de parceiros que transformaram suas indicações em renda
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Card className="h-full border-0 shadow-soft hover:shadow-medium transition-all bg-card">
                  <CardContent className="p-8">
                    {/* Rating */}
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                      ))}
                    </div>
                    
                    {/* Quote */}
                    <p className="text-lg text-foreground mb-8 leading-relaxed">
                      "{testimonial.text}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role} • {testimonial.company}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <Target className="w-4 h-4" />
              Serviços de Maior Conversão
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
              Ofereça serviços que realmente convertem
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Produtos de alto valor que resolvem problemas reais das empresas
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {SERVICES.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                {service.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-bold shadow-gold">
                      Mais Popular
                    </span>
                  </div>
                )}
                
                <Card className={`h-full border-2 ${service.popular ? 'border-accent shadow-gold' : 'border-transparent shadow-soft'} hover:shadow-medium transition-all bg-card overflow-hidden`}>
                  {/* Header */}
                  <div className={`p-6 bg-gradient-to-r ${service.color}`}>
                    <service.icon className="w-12 h-12 text-white mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-1">{service.title}</h3>
                    <p className="text-white/80 text-sm">{service.subtitle}</p>
                  </div>

                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-6">{service.description}</p>
                    
                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => {
                        setSelectedService(service.title);
                        setLeadDialogOpen(true);
                      }}
                      className={`w-full h-12 font-semibold rounded-xl ${service.popular ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : ''}`}
                      variant={service.popular ? 'default' : 'outline'}
                    >
                      {service.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary via-secondary to-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAyMmMtNS41MjMgMC0xMC00LjQ3Ny0xMC0xMHM0LjQ3Ny0xMCAxMC0xMCAxMCA0LjQ3NyAxMCAxMC00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Pronto para começar a ganhar?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Cadastro gratuito, suporte dedicado e comissões que fazem a diferença no seu bolso.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/afiliado/cadastro')}
                className="h-16 px-10 text-lg font-bold rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-gold"
              >
                <Gift className="w-5 h-5 mr-2" />
                Criar Minha Conta Grátis
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => openWhatsApp()}
                className="h-16 px-10 text-lg font-bold rounded-2xl bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <PhoneCall className="w-5 h-5 mr-2" />
                Falar com Especialista
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p className="mb-4">© 2024 AtentAI. Todos os direitos reservados.</p>
            <div className="flex justify-center gap-6 text-sm">
              <a href="/termos-de-uso" className="hover:text-foreground transition-colors">Termos de Uso</a>
              <a href="/politica-privacidade" className="hover:text-foreground transition-colors">Política de Privacidade</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Lead Capture Dialog */}
      <Dialog open={leadDialogOpen} onOpenChange={setLeadDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {leadCreated ? 'Cadastro Realizado!' : 'Fale com um Especialista'}
            </DialogTitle>
          </DialogHeader>

          {leadCreated ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Redirecionando para WhatsApp...</h3>
              <p className="text-muted-foreground">Você será atendido por nossa equipe</p>
            </motion.div>
          ) : (
            <div className="space-y-4 pt-4">
              {selectedService && (
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Serviço selecionado</p>
                  <p className="font-semibold text-primary">{selectedService}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    value={leadData.fullName}
                    onChange={(e) => setLeadData({ ...leadData, fullName: e.target.value })}
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Celular *</Label>
                  <MaskedInput
                    mask="phone"
                    value={leadData.phone}
                    onChange={(value) => setLeadData({ ...leadData, phone: value })}
                    showValidation={false}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>E-mail *</Label>
                <Input
                  type="email"
                  value={leadData.email}
                  onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <Input
                    value={leadData.companyName}
                    onChange={(e) => setLeadData({ ...leadData, companyName: e.target.value })}
                    placeholder="Nome da empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={leadData.state}
                    onValueChange={(value) => setLeadData({ ...leadData, state: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAZILIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={submitLead}
                disabled={submitting || !leadData.fullName || !leadData.email || !leadData.phone}
                className="w-full h-12 font-semibold rounded-xl mt-4"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Continuar no WhatsApp
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Ao continuar, você concorda com nossa Política de Privacidade
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
