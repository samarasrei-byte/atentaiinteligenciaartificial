import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { MaskedInput } from '@/components/ui/masked-input';
import {
  Shield, Brain, TrendingUp, FileSearch, FileCheck, Calculator,
  Wallet, Users, AlertTriangle, Building, CheckCircle2, ArrowRight,
  Phone, Star, Quote, ChevronRight, Loader2, MessageCircle,
  FileText, Download, Check
} from 'lucide-react';

interface Affiliate {
  id: string;
  full_name: string;
  whatsapp_number: string | null;
  company_name: string | null;
}

const DOCUMENTS_CHECKLIST = [
  '60 notas de entrada',
  '60 notas de saída',
  'SPED Fiscal',
  'SPED Contribuições',
  'DCTF',
  'GIA',
  'GNRE / Gare',
  'PGDAS / DEFIS',
  'SEFIP',
  'Folha de Pagamento',
  'Cadastro Fiscal',
  'Contrato Social'
];

const TESTIMONIALS = [
  {
    name: 'Carlos Silva',
    company: 'Tech Solutions LTDA',
    text: 'Recuperamos R$ 850.000 em créditos tributários. Processo rápido e transparente.',
    savings: 'R$ 850.000'
  },
  {
    name: 'Maria Santos',
    company: 'Comércio ABC',
    text: 'A auditoria fiscal identificou diversos erros que estávamos cometendo. Economia significativa.',
    savings: 'R$ 320.000'
  },
  {
    name: 'João Pereira',
    company: 'Indústria XYZ',
    text: 'Excelente atendimento e resultados acima das expectativas. Recomendo fortemente.',
    savings: 'R$ 1.200.000'
  }
];

const TAX_REGIMES = [
  'Simples Nacional',
  'Lucro Presumido',
  'Lucro Real',
  'MEI'
];

const SEGMENTS = [
  'Comércio',
  'Serviços',
  'Indústria',
  'Tecnologia',
  'Saúde',
  'Educação',
  'Construção',
  'Alimentação',
  'Transporte',
  'Agronegócio',
  'Outro'
];

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function AffiliateLanding() {
  const { affiliateCode, serviceSlug } = useParams();
  const navigate = useNavigate();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [simulatorStep, setSimulatorStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [leadCreated, setLeadCreated] = useState(false);

  const [simulatorData, setSimulatorData] = useState({
    taxRegime: '',
    annualRevenue: '',
    state: '',
    segment: '',
    hasRestrictions: false,
    hasAuditedBefore: false
  });

  const [leadData, setLeadData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    cnpj: ''
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
        .select('id, full_name, whatsapp_number, company_name')
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
    const whatsappNumber = affiliate?.whatsapp_number || '5511999999999';
    const message = encodeURIComponent(`Olá! Vim pelo site do parceiro ${affiliate?.full_name || 'AtentAI'}. Gostaria de saber mais sobre os serviços fiscais.`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const submitLead = async () => {
    if (!affiliate) return;

    setSubmitting(true);

    try {
      const revenueCents = parseFloat(leadData.companyName ? simulatorData.annualRevenue.replace(/\D/g, '') : '0') * 100;

      await supabase.from('affiliate_leads').insert({
        affiliate_id: affiliate.id,
        full_name: leadData.fullName,
        email: leadData.email,
        phone: leadData.phone.replace(/\D/g, ''),
        company_name: leadData.companyName || null,
        cnpj: leadData.cnpj?.replace(/\D/g, '') || null,
        tax_regime: simulatorData.taxRegime || null,
        annual_revenue_cents: revenueCents || null,
        state: simulatorData.state || null,
        segment: simulatorData.segment || null,
        has_restrictions: simulatorData.hasRestrictions,
        has_audited_before: simulatorData.hasAuditedBefore,
        utm_source: 'affiliate',
        utm_medium: affiliateCode
      });

      setLeadCreated(true);
      toast.success('Cadastro realizado com sucesso!');
      
      // Open WhatsApp after a short delay
      setTimeout(() => {
        openWhatsApp();
      }, 1500);
    } catch (error) {
      console.error('Error creating lead:', error);
      toast.error('Erro ao enviar dados. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const services = [
    {
      icon: Shield,
      title: 'Limpa Nome Empresarial',
      description: 'Regularização de pendências fiscais e restrições empresariais',
      benefits: ['Remoção de protestos', 'Regularização de débitos', 'Limpeza de score empresarial']
    },
    {
      icon: Brain,
      title: 'Inteligência Fiscal',
      description: 'Análise avançada de dados fiscais com IA',
      benefits: ['Identificação de oportunidades', 'Redução de riscos', 'Otimização tributária']
    },
    {
      icon: TrendingUp,
      title: 'Recuperação Tributária',
      description: 'Recuperação de créditos e impostos pagos indevidamente',
      benefits: ['Análise de 5 anos retroativos', 'Identificação de créditos', 'Recuperação administrativa']
    },
    {
      icon: FileSearch,
      title: 'Auditoria Fiscal Completa',
      description: 'Revisão completa de toda estrutura fiscal da empresa',
      benefits: ['Análise de conformidade', 'Identificação de riscos', 'Relatório detalhado']
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Floating WhatsApp Button */}
      <button
        onClick={() => setLeadDialogOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
      >
        <MessageCircle className="w-8 h-8 text-white" />
      </button>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <TrendingUp className="w-4 h-4" />
                +R$ 89 milhões recuperados
              </span>

              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-tight">
                Economizamos mais de{' '}
                <span className="text-primary">R$ 89 milhões</span>{' '}
                em impostos para empresas no Brasil
              </h1>

              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Auditoria fiscal, inteligência tributária e recuperação de créditos com tecnologia avançada.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => setLeadDialogOpen(true)}
                  className="h-14 px-10 text-lg font-semibold rounded-xl"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Falar com Especialista
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' })}
                  className="h-14 px-10 text-lg font-semibold rounded-xl"
                >
                  Simular Economia
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { value: 'R$ 89M+', label: 'Recuperados' },
              { value: '500+', label: 'Empresas Atendidas' },
              { value: '98%', label: 'Satisfação' },
              { value: '5 anos', label: 'De Análise Retroativa' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Nossos Serviços
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Soluções completas para otimização fiscal e recuperação tributária
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <service.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{service.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                    <ul className="space-y-2">
                      {service.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Casos de Sucesso
            </h2>
            <p className="text-lg text-muted-foreground">
              Veja o que nossos clientes dizem
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-sm">
                  <CardContent className="p-6">
                    <Quote className="w-10 h-10 text-primary/20 mb-4" />
                    <p className="text-muted-foreground mb-6">{testimonial.text}</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm text-muted-foreground">Economia obtida</div>
                      <div className="text-2xl font-bold text-green-600">{testimonial.savings}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Simulator */}
      <section id="simulator" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Simulador Fiscal
              </h2>
              <p className="text-lg text-muted-foreground">
                Descubra quanto sua empresa pode economizar
              </p>
            </div>

            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                {simulatorStep === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <Label>Regime Tributário</Label>
                      <Select
                        value={simulatorData.taxRegime}
                        onValueChange={(value) => setSimulatorData({ ...simulatorData, taxRegime: value })}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Selecione o regime" />
                        </SelectTrigger>
                        <SelectContent>
                          {TAX_REGIMES.map((regime) => (
                            <SelectItem key={regime} value={regime}>{regime}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Faturamento Anual Estimado</Label>
                      <Input
                        className="h-12"
                        placeholder="R$ 0,00"
                        value={simulatorData.annualRevenue}
                        onChange={(e) => setSimulatorData({ ...simulatorData, annualRevenue: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Select
                        value={simulatorData.state}
                        onValueChange={(value) => setSimulatorData({ ...simulatorData, state: value })}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {BRAZILIAN_STATES.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      className="w-full h-12"
                      onClick={() => setSimulatorStep(1)}
                      disabled={!simulatorData.taxRegime || !simulatorData.annualRevenue}
                    >
                      Continuar <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                )}

                {simulatorStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <Label>Segmento de Atuação</Label>
                      <Select
                        value={simulatorData.segment}
                        onValueChange={(value) => setSimulatorData({ ...simulatorData, segment: value })}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Selecione o segmento" />
                        </SelectTrigger>
                        <SelectContent>
                          {SEGMENTS.map((segment) => (
                            <SelectItem key={segment} value={segment}>{segment}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="restrictions"
                          checked={simulatorData.hasRestrictions}
                          onCheckedChange={(checked) => setSimulatorData({ ...simulatorData, hasRestrictions: checked as boolean })}
                        />
                        <Label htmlFor="restrictions" className="cursor-pointer">
                          Minha empresa possui restrições ou pendências fiscais
                        </Label>
                      </div>

                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="audited"
                          checked={simulatorData.hasAuditedBefore}
                          onCheckedChange={(checked) => setSimulatorData({ ...simulatorData, hasAuditedBefore: checked as boolean })}
                        />
                        <Label htmlFor="audited" className="cursor-pointer">
                          Já realizei auditoria fiscal anteriormente
                        </Label>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" className="flex-1 h-12" onClick={() => setSimulatorStep(0)}>
                        Voltar
                      </Button>
                      <Button className="flex-1 h-12" onClick={() => setLeadDialogOpen(true)}>
                        Ver Resultado
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Documents Checklist */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Documentos para Auditoria
              </h2>
              <p className="text-lg text-muted-foreground">
                Prepare estes documentos para uma análise completa
              </p>
            </div>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-4">
                  {DOCUMENTS_CHECKLIST.map((doc, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm">{doc}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-6" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Checklist Completo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Pronto para economizar?
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Entre em contato agora e descubra quanto sua empresa pode recuperar em impostos pagos indevidamente.
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => setLeadDialogOpen(true)}
                className="h-14 px-10 text-lg font-semibold rounded-xl"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Falar com Especialista
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Lead Capture Dialog */}
      <Dialog open={leadDialogOpen} onOpenChange={setLeadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {leadCreated ? 'Cadastro Realizado!' : 'Fale com um Especialista'}
            </DialogTitle>
            <DialogDescription>
              {leadCreated 
                ? 'Você será redirecionado para o WhatsApp' 
                : 'Preencha seus dados para continuar'}
            </DialogDescription>
          </DialogHeader>

          {leadCreated ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-muted-foreground">Abrindo WhatsApp...</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); submitLead(); }} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  value={leadData.fullName}
                  onChange={(e) => setLeadData({ ...leadData, fullName: e.target.value })}
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>E-mail *</Label>
                <Input
                  type="email"
                  value={leadData.email}
                  onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Telefone *</Label>
                <MaskedInput
                  mask="(99) 99999-9999"
                  value={leadData.phone}
                  onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Empresa</Label>
                <Input
                  value={leadData.companyName}
                  onChange={(e) => setLeadData({ ...leadData, companyName: e.target.value })}
                  placeholder="Nome da empresa"
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full h-12">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Continuar para WhatsApp
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
