import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { MaskedInput } from '@/components/ui/masked-input';
import {
  Shield, CheckCircle2, ArrowRight, Star, Quote, Loader2, MessageCircle,
  Sparkles, Zap, Lock, ChevronDown, Check, Clock, TrendingUp, Users,
  Scale, Bot, Headphones, Target, Percent, FileCheck
} from 'lucide-react';

const WHATSAPP_GLOBAL = '5511999999999';

interface Affiliate {
  id: string;
  full_name: string;
  company_name: string | null;
}

const BENEFITS = [
  {
    icon: Bot,
    title: 'Negociação automática com credores',
    description: 'Nossa IA negocia diretamente com bancos e financeiras'
  },
  {
    icon: Target,
    title: 'IA encontra oportunidades de redução',
    description: 'Algoritmos identificam as melhores condições para você'
  },
  {
    icon: Scale,
    title: 'Suporte jurídico incluso',
    description: 'Equipe de advogados especializados em direito do consumidor'
  },
  {
    icon: Headphones,
    title: 'Acompanhamento 24h',
    description: 'Consultor dedicado durante todo o processo'
  },
  {
    icon: Percent,
    title: 'Renegociação até 90% menor',
    description: 'Desconto médio de 70% nas dívidas negociadas'
  },
  {
    icon: TrendingUp,
    title: 'Score protegido e orientado',
    description: 'Estratégias para recuperar e proteger seu score'
  }
];

const STEPS = [
  { icon: Users, title: 'Cadastro rápido', desc: 'Processo simples e seguro' },
  { icon: FileCheck, title: 'Análise de dívidas', desc: 'Verificação automática em todos os birôs' },
  { icon: Bot, title: 'IA sugere negociações', desc: 'Melhores condições identificadas' },
  { icon: Headphones, title: 'Consultor acompanha', desc: 'Suporte dedicado em cada etapa' },
  { icon: CheckCircle2, title: 'Nome limpo', desc: 'Regularização completa' }
];

const TESTIMONIALS = [
  {
    name: 'Juliana Mendes',
    text: 'Meu nome saiu do Serasa em menos de 48h. Não acreditei na velocidade!',
    result: '48h para limpar',
    avatar: 'JM'
  },
  {
    name: 'Marcos Silva',
    text: 'Negociei uma dívida de R$ 12.000 por R$ 1.100. Economia incrível!',
    result: '91% de desconto',
    avatar: 'MS'
  },
  {
    name: 'Carla Oliveira',
    text: 'Profissionalismo e rapidez. Recomendo para todos que precisam.',
    result: 'Score +200 pts',
    avatar: 'CO'
  }
];

const FAQ_ITEMS = [
  {
    question: 'Em quanto tempo meu nome é limpo?',
    answer: 'O tempo varia de acordo com cada caso, mas a maioria dos nossos clientes consegue limpar o nome em 24 a 72 horas após a quitação da dívida negociada.'
  },
  {
    question: 'O serviço é seguro?',
    answer: 'Sim, 100% seguro. Somos uma empresa registrada, com equipe jurídica própria e processos em conformidade com a LGPD.'
  },
  {
    question: 'Qual o custo do serviço?',
    answer: 'Trabalhamos no modelo de performance: você só paga uma taxa após conseguirmos negociar sua dívida com sucesso. Não há taxas antecipadas.'
  }
];

export default function AffiliateLimpaNomeLanding() {
  const { affiliateCode } = useParams();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cpf: '',
    termsAccepted: false
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

  const openWhatsApp = () => {
    const message = `Olá! Gostaria de saber mais sobre o serviço Limpa Nome.`;
    window.open(`https://wa.me/${WHATSAPP_GLOBAL}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.termsAccepted) {
      toast.error('Você precisa aceitar os termos');
      return;
    }

    setSubmitting(true);

    try {
      // Create lead for affiliate (silently)
      if (affiliate) {
        await supabase.from('affiliate_leads').insert({
          affiliate_id: affiliate.id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone.replace(/\D/g, ''),
          utm_source: 'limpa_nome_landing',
          utm_medium: affiliateCode,
          utm_campaign: 'limpa_nome_premium'
        });
      }

      // Create credit repair request
      await supabase.from('credit_repair_requests').insert({
        user_id: affiliate?.id || '00000000-0000-0000-0000-000000000000',
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone.replace(/\D/g, ''),
        cpf: formData.cpf.replace(/\D/g, ''),
        status: 'pending',
        payment_status: 'pending'
      });

      setSuccess(true);
      toast.success('Cadastro realizado com sucesso!');
      
      setTimeout(() => {
        openWhatsApp();
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao enviar. Tente novamente.');
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
    <div className="min-h-screen bg-background">
      {/* Fixed WhatsApp Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        onClick={openWhatsApp}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl transition-all hover:scale-105"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="font-semibold hidden sm:inline">Atendimento WhatsApp</span>
      </motion.button>

      {/* Hero Section - Clean for clients */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800 opacity-95" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAyMmMtNS41MjMgMC0xMC00LjQ3Ny0xMC0xMHM0LjQ3Ny0xMCAxMC0xMCAxMCA0LjQ3NyAxMCAxMC00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L2c+PC9zdmc+')] opacity-30" />
        
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-20 left-10 w-24 h-24 rounded-full bg-white/10 blur-2xl"
        />
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-32 right-20 w-40 h-40 rounded-full bg-emerald-300/20 blur-3xl"
        />

        <div className="container relative z-10 mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-8"
              >
                <Shield className="w-4 h-4 text-emerald-300" />
                Limpa Nome com IA
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold">ATÉ 90% OFF</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
                Limpe seu nome{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-emerald-300 via-green-200 to-emerald-300 bg-clip-text text-transparent">
                    em até 48 horas
                  </span>
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-white/80 mb-6 max-w-3xl mx-auto leading-relaxed">
                Negocie suas dívidas com até 90% de desconto usando tecnologia de ponta e equipe jurídica especializada.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                  <Clock className="w-5 h-5 text-emerald-300" />
                  <span className="text-white font-medium">Resultado em até 48h</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                  <Percent className="w-5 h-5 text-emerald-300" />
                  <span className="text-white font-medium">Até 90% de desconto</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  size="lg"
                  onClick={() => setFormOpen(true)}
                  className="h-16 px-10 text-lg font-bold rounded-2xl bg-white hover:bg-white/90 text-emerald-700 shadow-lg group"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Limpar Meu Nome Agora
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={openWhatsApp}
                  className="h-16 px-10 text-lg font-bold rounded-2xl bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Atendimento no WhatsApp
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-6 text-white/70">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">100% Seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Sem taxas antecipadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  <span className="text-sm">Equipe jurídica inclusa</span>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="w-8 h-8 text-white/50" />
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Por que escolher o AtentAI?
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
              Tecnologia que resolve
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {BENEFITS.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-soft hover:shadow-medium transition-all">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-4">
                      <benefit.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Como Funciona
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Processo simples e rápido
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-5 gap-4">
              {STEPS.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-emerald-500 to-transparent" />
                  )}
                  <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Quote className="w-4 h-4" />
              Clientes Satisfeitos
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Resultados reais de clientes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Card className="h-full border-0 shadow-soft hover:shadow-medium transition-all">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-emerald-500 text-emerald-500" />
                      ))}
                    </div>
                    
                    <p className="text-lg text-foreground mb-8 leading-relaxed">
                      "{testimonial.text}"
                    </p>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{testimonial.name}</div>
                        <div className="text-sm font-medium text-emerald-600">{testimonial.result}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-xl px-6 bg-card shadow-soft">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800 opacity-95" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Pronto para limpar seu nome?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Comece agora e negocie suas dívidas com até 90% de desconto. Sem taxas antecipadas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setFormOpen(true)}
                className="h-16 px-12 text-lg font-bold rounded-2xl bg-white hover:bg-white/90 text-emerald-700 shadow-lg"
              >
                <Shield className="w-5 h-5 mr-2" />
                Limpar Meu Nome Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={openWhatsApp}
                className="h-16 px-12 text-lg font-bold rounded-2xl bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Tirar Dúvidas
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-background border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} AtentAI. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Lead Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {success ? '✅ Cadastro Realizado!' : 'Limpar Meu Nome'}
            </DialogTitle>
          </DialogHeader>

          {success ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Obrigado pelo interesse!</h3>
              <p className="text-muted-foreground mb-6">
                Um especialista entrará em contato em breve. Você será redirecionado para o WhatsApp.
              </p>
              <Button onClick={openWhatsApp} className="w-full bg-emerald-600 hover:bg-emerald-700">
                <MessageCircle className="w-5 h-5 mr-2" />
                Falar Agora no WhatsApp
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo *</Label>
                  <Input
                    id="fullName"
                    placeholder="Seu nome"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                  <MaskedInput
                    id="phone"
                    mask="phone"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(value) => setFormData({ ...formData, phone: value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <MaskedInput
                    id="cpf"
                    mask="cpf"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(value) => setFormData({ ...formData, cpf: value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-start space-x-2 pt-4">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, termsAccepted: checked as boolean })
                  }
                />
                <Label htmlFor="terms" className="text-sm leading-tight">
                  Concordo com os termos de uso e política de privacidade
                </Label>
              </div>

              <Button type="submit" className="w-full h-12 bg-emerald-600 hover:bg-emerald-700" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Limpar Meu Nome
                  </>
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
