import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { MaskedInput } from '@/components/ui/masked-input';
import {
  Brain, TrendingUp, FileSearch, Calculator, Shield, CheckCircle2,
  ArrowRight, Star, Quote, Loader2, MessageCircle, Sparkles, DollarSign,
  FileText, Upload, Clock, Award, Users, Zap, Lock, ChevronDown,
  Check, Building, BarChart3, PiggyBank, Receipt
} from 'lucide-react';

const WHATSAPP_GLOBAL = '5511999999999';

interface Affiliate {
  id: string;
  full_name: string;
  company_name: string | null;
}

const DOCUMENTS_REQUIRED = [
  { icon: Building, name: 'CNPJ', desc: 'Cartão CNPJ atualizado' },
  { icon: FileText, name: 'Contrato Social', desc: 'Última alteração consolidada' },
  { icon: BarChart3, name: 'Faturamento 5 anos', desc: 'Relatórios de vendas' },
  { icon: Receipt, name: 'Guias de Impostos', desc: 'DARF, DAS, GPS, GNRE' },
  { icon: FileSearch, name: 'SPED Fiscal', desc: 'Escrituração Digital' },
  { icon: Calculator, name: 'SPED Contribuições', desc: 'PIS/COFINS' },
  { icon: FileText, name: 'Notas Fiscais', desc: 'Entrada e saída' },
  { icon: Users, name: 'Folha de Pagamento', desc: 'Se houver funcionários' },
  { icon: PiggyBank, name: 'Balanço e DRE', desc: 'Últimos exercícios' }
];

const TESTIMONIALS = [
  {
    name: 'Carlos Ferreira',
    company: 'Ferreira Comercial LTDA',
    text: 'Recebi R$ 148.900 em créditos que eu nem sabia que tinha direito. Processo 100% profissional.',
    savings: 'R$ 148.900',
    avatar: 'CF'
  },
  {
    name: 'Mariana Santos',
    company: 'Tech Solutions ME',
    text: 'Jamais imaginei que estava pagando imposto a mais. A análise mostrou tudo detalhadamente.',
    savings: 'R$ 67.500',
    avatar: 'MS'
  },
  {
    name: 'Roberto Lima',
    company: 'Indústria Lima S/A',
    text: 'Processo rápido e muito profissional. Recuperamos valores significativos para o caixa da empresa.',
    savings: 'R$ 320.000',
    avatar: 'RL'
  }
];

const STEPS = [
  { icon: Users, title: 'Você se cadastra', desc: 'Preencha seus dados em poucos minutos' },
  { icon: Upload, title: 'Envia os documentos', desc: 'Upload seguro dos documentos fiscais' },
  { icon: Brain, title: 'IA + especialistas analisam', desc: 'Tecnologia avançada identifica oportunidades' },
  { icon: FileSearch, title: 'Recebe o relatório', desc: 'Detalhamento de créditos e devoluções' },
  { icon: DollarSign, title: 'Só paga se tiver resultado', desc: 'Modelo de sucesso garantido' }
];

export default function AffiliateFiscalLanding() {
  const { affiliateCode } = useParams();
  const navigate = useNavigate();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    cnpj: '',
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
    const message = `Olá! Vim pelo site do parceiro ${affiliate?.full_name || 'AtentAI'}. Gostaria de saber mais sobre a análise fiscal.`;
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
      // Create lead for affiliate
      if (affiliate) {
        await supabase.from('affiliate_leads').insert({
          affiliate_id: affiliate.id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone.replace(/\D/g, ''),
          company_name: formData.companyName,
          cnpj: formData.cnpj.replace(/\D/g, ''),
          utm_source: 'fiscal_landing',
          utm_medium: affiliateCode,
          utm_campaign: 'inteligencia_fiscal'
        });
      }

      // Create fiscal analysis request
      await supabase.from('fiscal_analysis_requests').insert({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone.replace(/\D/g, ''),
        company_name: formData.companyName,
        cnpj: formData.cnpj.replace(/\D/g, ''),
        tax_regime: 'a_definir',
        status: 'pending'
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
        <span className="font-semibold hidden sm:inline">Falar com Especialista</span>
      </motion.button>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-95" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAyMmMtNS41MjMgMC0xMC00LjQ3Ny0xMC0xMHM0LjQ3Ny0xMCAxMC0xMCAxMCA0LjQ3NyAxMCAxMC00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L2c+PC9zdmc+')] opacity-30" />
        
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-20 left-10 w-24 h-24 rounded-full bg-accent/20 blur-2xl"
        />
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-32 right-20 w-40 h-40 rounded-full bg-primary/20 blur-3xl"
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
                <Sparkles className="w-4 h-4 text-accent" />
                Análise 100% Gratuita
                <span className="px-2 py-0.5 rounded-full bg-green-500 text-white text-xs font-bold">GRÁTIS</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
                Sua empresa pode estar{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-accent via-yellow-300 to-accent bg-clip-text text-transparent">
                    pagando impostos a mais
                  </span>
                </span>
                <br />
                <span className="text-white/90">Descubra agora.</span>
              </h1>

              <p className="text-xl sm:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
                Empresas brasileiras recuperaram mais de{' '}
                <span className="text-accent font-bold">R$ 89 milhões</span> usando tecnologia fiscal inteligente. 
                Verifique se você também tem direito.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  size="lg"
                  onClick={() => setFormOpen(true)}
                  className="h-16 px-10 text-lg font-bold rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-gold group"
                >
                  <FileSearch className="w-5 h-5 mr-2" />
                  Quero Fazer Minha Análise Fiscal
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={openWhatsApp}
                  className="h-16 px-10 text-lg font-bold rounded-2xl bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Falar com Especialista
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-6 text-white/70">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">100% Seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Sem Compromisso</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm">Resultado em 15 dias</span>
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
              devolvidos para empresários em todo o Brasil
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Como Funciona
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
              5 passos simples para recuperar seus créditos
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-6 mb-8"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-bold text-xl shadow-glow">
                    {index + 1}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="absolute left-1/2 top-full w-0.5 h-8 bg-gradient-to-b from-primary to-transparent -translate-x-1/2" />
                  )}
                </div>
                <div className="flex-1 p-6 rounded-2xl bg-card shadow-soft">
                  <h3 className="text-lg font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <FileText className="w-4 h-4" />
              Documentos Necessários
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              O que você vai precisar enviar
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nossa equipe vai guiar você em cada etapa do processo
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {DOCUMENTS_REQUIRED.map((doc, index) => (
              <motion.div
                key={doc.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-soft hover:shadow-medium transition-all h-full">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <doc.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{doc.name}</h3>
                      <p className="text-sm text-muted-foreground">{doc.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => setFormOpen(true)}
              className="h-14 px-10 text-lg font-semibold rounded-xl"
            >
              <Upload className="w-5 h-5 mr-2" />
              Enviar Documentos Após Cadastro
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Quote className="w-4 h-4" />
              Depoimentos
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              O que nossos clientes dizem
            </h2>
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
                <Card className="h-full border-0 shadow-soft hover:shadow-medium transition-all">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                      ))}
                    </div>
                    
                    <p className="text-lg text-foreground mb-8 leading-relaxed">
                      "{testimonial.text}"
                    </p>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">Créditos recuperados</p>
                      <p className="text-2xl font-bold text-green-600">{testimonial.savings}</p>
                    </div>
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
              Pronto para descobrir seus créditos?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Análise gratuita, sem compromisso. Você só paga se tiver resultado.
            </p>

            <Button
              size="lg"
              onClick={() => setFormOpen(true)}
              className="h-16 px-12 text-lg font-bold rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-gold"
            >
              <FileSearch className="w-5 h-5 mr-2" />
              Iniciar Análise Fiscal Gratuita
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="mb-4">© 2024 AtentAI. Todos os direitos reservados.</p>
          {affiliate && (
            <p className="text-sm">Indicação: {affiliate.full_name}</p>
          )}
        </div>
      </footer>

      {/* Registration Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {success ? 'Cadastro Realizado!' : 'Análise Fiscal Gratuita'}
            </DialogTitle>
          </DialogHeader>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Obrigado, {formData.fullName}!</h3>
              <p className="text-muted-foreground mb-4">
                Sua solicitação foi recebida. Vamos te redirecionar para o WhatsApp.
              </p>
              <p className="text-sm text-muted-foreground">
                Nossa equipe entrará em contato em breve.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label>Telefone *</Label>
                  <MaskedInput
                    mask="phone"
                    value={formData.phone}
                    onChange={(value) => setFormData({ ...formData, phone: value })}
                    showValidation={false}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nome da Empresa *</Label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Razão social ou nome fantasia"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>CNPJ *</Label>
                <MaskedInput
                  mask="cnpj"
                  value={formData.cnpj}
                  onChange={(value) => setFormData({ ...formData, cnpj: value })}
                  showValidation={false}
                />
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: checked as boolean })}
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  Li e aceito os <a href="/termos-de-uso" className="text-primary hover:underline">Termos de Uso</a> e a{' '}
                  <a href="/politica-privacidade" className="text-primary hover:underline">Política de Privacidade</a>
                </Label>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 font-semibold rounded-xl mt-4"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <FileSearch className="w-4 h-4 mr-2" />
                    Iniciar Análise Fiscal Gratuita
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Seus dados estão seguros e protegidos
              </p>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
