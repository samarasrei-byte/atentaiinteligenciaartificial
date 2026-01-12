import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowRight, 
  Check, 
  Shield, 
  Lock, 
  Users,
  FileText,
  Calculator,
  Building2,
  TrendingUp,
  Star,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Sparkles,
  BadgeCheck
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AffiliateOfferPage = () => {
  const { affiliateCode } = useParams();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    companyName: '',
    termsAccepted: false,
  });

  const testimonials = [
    {
      text: "Recuperei R$ 148.000 e nem sabia que tinha direito. Incrível!",
      author: "Carlos M.",
      role: "Empresário - SP"
    },
    {
      text: "Meu CNPJ estava travado. Em 5 dias resolvemos tudo e voltei a operar.",
      author: "Amanda L.",
      role: "Comerciante - RJ"
    },
    {
      text: "Conseguimos crédito novamente após 2 anos parado. Salvou minha empresa.",
      author: "Roberto S.",
      role: "Indústria - MG"
    }
  ];

  const documents = [
    { icon: FileText, name: 'SPED Fiscal', description: 'Escrituração Fiscal Digital' },
    { icon: FileText, name: 'SPED Contribuições', description: 'PIS e COFINS' },
    { icon: FileText, name: 'Notas Fiscais', description: 'Últimas 60 notas entrada/saída' },
    { icon: Calculator, name: 'DCTF', description: 'Declaração de Débitos e Créditos' },
    { icon: Users, name: 'Folha/SEFIP', description: 'INSS e encargos' },
    { icon: Building2, name: 'PGDAS/DEFIS', description: 'Simples Nacional' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      toast.error('Aceite os termos para continuar');
      return;
    }

    setLoading(true);
    try {
      // Find affiliate by code
      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('id')
        .eq('affiliate_code', affiliateCode)
        .single();

      if (affiliate) {
        // Create lead for affiliate
        await supabase.from('affiliate_leads').insert({
          affiliate_id: affiliate.id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          company_name: formData.companyName,
          status: 'new',
          utm_source: 'affiliate_offer_page',
        });
      }

      toast.success('Análise solicitada com sucesso! Entraremos em contato em breve.');
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        companyName: '',
        termsAccepted: false,
      });
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error('Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent('Olá! Vim pela página de oferta e gostaria de fazer minha análise fiscal gratuita.');
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Análise 100% Gratuita
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Transforme sua empresa em até{' '}
              <span className="text-primary">7 dias</span> com Inteligência Fiscal e Limpa Nome Empresarial
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Você pode recuperar valores, eliminar dívidas, tirar restrições e voltar a crescer.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" className="gap-2 text-lg" onClick={() => document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' })}>
                Sim, quero fazer minha análise gratuita
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="xl" variant="outline" className="gap-2" onClick={openWhatsApp}>
                <MessageCircle className="h-5 w-5" />
                Falar com Especialista
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 pt-8">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-5 w-5 text-green-500" />
                <span>+ R$ 89 milhões recuperados</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-5 w-5 text-green-500" />
                <span>Empresas de todo Brasil</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-5 w-5 text-green-500" />
                <span>Atendimento humanizado</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">O Que Nossos Clientes Dizem</h2>
            <p className="text-muted-foreground">Histórias reais de empresários que transformaram seus negócios</p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Card className="p-8 md:p-12 relative">
              <div className="flex items-center justify-between absolute top-4 left-4 right-4">
                <Button variant="ghost" size="icon" onClick={prevTestimonial}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={nextTestimonial}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              <div className="text-center pt-8">
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-xl md:text-2xl font-medium mb-6">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
                <div>
                  <p className="font-semibold">{testimonials[currentTestimonial].author}</p>
                  <p className="text-sm text-muted-foreground">{testimonials[currentTestimonial].role}</p>
                </div>
              </div>

              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i === currentTestimonial ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
                    }`}
                    onClick={() => setCurrentTestimonial(i)}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">O Que Será Feito</h2>
            <p className="text-xl text-muted-foreground">Serviços completos para recuperar e proteger sua empresa</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 h-full bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <Calculator className="h-7 w-7 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Inteligência Fiscal</h3>
                <ul className="space-y-3">
                  {[
                    'Auditoria completa da sua tributação',
                    'Recuperação de créditos fiscais',
                    'Revisão ICMS/PIS/COFINS/INSS',
                    'Relatório detalhado com valores a receber',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 h-full bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <BadgeCheck className="h-7 w-7 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Limpa Nome Empresarial</h3>
                <ul className="space-y-3">
                  {[
                    'Negociação avançada com credores',
                    'Remoção de restrições no CNPJ',
                    'Redução agressiva de dívidas',
                    'Reativação do CNPJ no mercado',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="form-section" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto"
          >
            <Card className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Solicite Sua Análise Gratuita</h2>
                <p className="text-muted-foreground">
                  Preencha os dados abaixo e nossa equipe entrará em contato
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Seu nome"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Empresa (Opcional)</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Nome da empresa"
                  />
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: checked as boolean })}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    Aceito os termos de uso e política de privacidade
                  </Label>
                </div>

                <Button type="submit" size="xl" className="w-full gap-2" disabled={loading}>
                  {loading ? 'Enviando...' : 'Iniciar Minha Análise Gratuita'}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Documents Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Documentos Necessários</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A análise inicial é gratuita. Nossa equipe solicitará apenas os documentos necessários.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {documents.map((doc, i) => (
              <motion.div
                key={doc.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-5 text-center hover:shadow-lg transition-shadow">
                  <doc.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-1">{doc.name}</h3>
                  <p className="text-xs text-muted-foreground">{doc.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-8 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <div className="flex flex-wrap justify-center gap-8 text-center">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8" />
                  <span className="font-semibold">100% Seguro</span>
                </div>
                <div className="flex items-center gap-3">
                  <Lock className="h-8 w-8" />
                  <span className="font-semibold">100% Confidencial</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8" />
                  <span className="font-semibold">Auditado por Especialistas</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Sua empresa pode estar perdendo dinheiro — <span className="text-primary">sem saber</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Não deixe para depois. Faça sua análise gratuita agora.
            </p>
            <Button 
              size="xl" 
              className="gap-2 text-lg"
              onClick={() => document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Fazer Análise Gratuita Agora
              <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Fixed WhatsApp Button */}
      <Button
        onClick={openWhatsApp}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-green-500 hover:bg-green-600"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default AffiliateOfferPage;
