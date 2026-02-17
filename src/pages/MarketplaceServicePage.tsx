import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Building2, FileCheck, FileText, FileSpreadsheet,
  Check, ArrowRight, ArrowLeft, Shield, User, Scale, Briefcase, 
  Store, Loader2, CreditCard, Sparkles
} from 'lucide-react';
import { SUBSCRIBER_DISCOUNTS, formatPrice } from '@/lib/stripe';
import { MaskedInput } from '@/components/ui/masked-input';
import { 
  getChatUrl, 
  createLimpaNomeRequest, 
  createFiscalRequest, 
  createBIRequest,
  getResponsiblePerson,
  ServiceType 
} from '@/lib/serviceFlowUtils';

interface ServiceConfig {
  key: string;
  title: string;
  description: string;
  price: number;
  priceLabel: string;
  icon: any;
  color: string;
  features: string[];
  pitch?: string;
  requiresAuth: boolean;
  successFee?: boolean;
}

const serviceConfigs: Record<string, ServiceConfig> = {
  'abertura-empresa': {
    key: 'company_opening',
    title: 'Abertura de Empresa',
    description: 'Você não recebe apenas um CNPJ — você recebe decisão estratégica. Analisamos o melhor regime e cuidamos de tudo.',
    price: 78000,
    priceLabel: 'R$ 780,00',
    icon: Building2,
    color: 'blue',
    features: [
      'Análise do melhor regime tributário',
      'CNPJ em até 7 dias',
      'Alvará e licenças',
      'Inscrição estadual/municipal',
      'Certificado digital',
      'Acompanhamento completo'
    ],
    pitch: '👉 Abrir certo é mais barato do que corrigir depois.',
    requiresAuth: true,
  },
  'emissao-certidao': {
    key: 'certificate',
    title: 'Emissão de Certidão',
    description: 'Certidões oficiais, válidas e verificáveis. Tudo pronto, revisado por contador, sem dor de cabeça.',
    price: 8000,
    priceLabel: 'R$ 80,00',
    icon: FileCheck,
    color: 'green',
    features: [
      'Certidão negativa federal',
      'Certidão estadual',
      'Certidão municipal',
      'Revisão por contador',
      'Entrega digital rápida'
    ],
    pitch: '👉 Mais rápido que fazer sozinho. Mais seguro que tentar sem ajuda.',
    requiresAuth: true,
  },
  'declaracao-ir-simples': {
    key: 'ir_simples',
    title: 'Declaração IR Simples',
    description: 'Sua declaração feita por contador especializado, enviada corretamente à Receita e com comprovante.',
    price: 20000,
    priceLabel: 'R$ 200,00',
    icon: FileText,
    color: 'amber',
    features: [
      'Preenchimento completo',
      'Revisão de deduções',
      'Envio à Receita Federal',
      'Recibo de entrega',
      'Evite multas e retrabalho'
    ],
    pitch: '👉 Tranquilidade custa menos do que uma multa.',
    requiresAuth: true,
  },
  'declaracao-ir-completo': {
    key: 'ir_completo',
    title: 'Declaração IR Completo',
    description: 'Análise de todas as fontes de renda com otimização fiscal legal. Ideal para autônomos e investidores.',
    price: 42000,
    priceLabel: 'R$ 420,00',
    icon: FileSpreadsheet,
    color: 'orange',
    features: [
      'Todas as fontes de renda',
      'Bens e investimentos',
      'Ganho de capital',
      'Otimização fiscal legal',
      'Acompanhamento do envio'
    ],
    pitch: '👉 Pagar menos imposto começa com declarar certo.',
    requiresAuth: true,
  },
  'analise-fiscal': {
    key: 'fiscal_analysis',
    title: 'Análise Fiscal Inteligente',
    description: 'Análise 100% gratuita. Só cobramos se encontrarmos economia real — e apenas sobre o valor recuperado.',
    price: 0,
    priceLabel: 'Grátis',
    icon: Scale,
    color: 'emerald',
    features: [
      'Análise sem custo inicial',
      'Identificação de créditos',
      'Recuperação de impostos',
      'Pagamento apenas no êxito (50%)',
      'Sem risco para você'
    ],
    pitch: '👉 Ou você ganha, ou não paga. Simples assim.',
    requiresAuth: false,
    successFee: true,
  },
};

export default function MarketplaceServicePage() {
  const { serviceSlug } = useParams<{ serviceSlug: string }>();
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const { toast } = useToast();
  const isSubscriber = subscription.subscribed;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    cpf: '',
    phone: '',
    companyName: '',
    cnpj: '',
    notes: '',
  });

  const serviceConfig = serviceSlug ? serviceConfigs[serviceSlug] : null;

  useEffect(() => {
    if (user) {
      // Pre-fill with user data
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
      }));
    }
  }, [user]);

  if (!serviceConfig) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Store className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Serviço não encontrado</h2>
            <p className="text-slate-500 mb-4">O serviço solicitado não existe.</p>
            <Button onClick={() => navigate('/servicos')}>Ver Serviços</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const scrollToSection = (section: string) => {
    navigate('/');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Map service key to ServiceType
      const serviceTypeMap: Record<string, ServiceType> = {
        'company_opening': 'abertura-empresa',
        'certificate': 'certidao',
        'ir_simples': 'ir',
        'ir_completo': 'ir',
        'fiscal_analysis': 'analise-fiscal',
      };
      
      const serviceType = serviceTypeMap[serviceConfig.key] || 'limpanome';
      const responsible = getResponsiblePerson(serviceType);
      
      // Create request based on service type - ALL redirect to chat
      if (serviceConfig.key === 'fiscal_analysis') {
        const result = await createFiscalRequest({
          serviceType: 'analise-fiscal',
          userId: user?.id,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          cpf: formData.cpf,
          cnpj: formData.cnpj,
          additionalData: {
            companyName: formData.companyName,
            notes: formData.notes,
          },
        });
        
        toast({ 
          title: '✅ Solicitação enviada!', 
          description: `Abrindo chat com ${responsible === 'guilherme' ? 'Guilherme' : 'César'}...` 
        });
        navigate(result.chatUrl);
        
      
      } else {
        // For other services, redirect to their specific pages first OR directly to chat
        const redirectMap: Record<string, string> = {
          'ir_simples': '/ir',
          'ir_completo': '/ir',
          'company_opening': '/abertura-empresa',
          'certificate': '/certidoes',
        };
        
        const redirectUrl = redirectMap[serviceConfig.key] || '/chat/guilherme?servico=geral';
        toast({ title: 'Redirecionando...', description: 'Aguarde um momento.' });
        navigate(redirectUrl);
      }
    } catch (error) {
      console.error('Error creating request:', error);
      toast({ title: 'Erro ao enviar solicitação', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ServiceIcon = serviceConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header onNavigate={scrollToSection} />

      <main className="pt-24 pb-16">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate('/servicos')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Marketplace
          </Button>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Service Info - Left Column */}
            <div className="lg:col-span-2">
              <Card className="sticky top-24 bg-white border-slate-200">
                <CardContent className="p-6">
                  <div className={`h-16 w-16 rounded-2xl bg-${serviceConfig.color}-100 flex items-center justify-center mb-6`}>
                    <ServiceIcon className={`h-8 w-8 text-${serviceConfig.color}-600`} />
                  </div>

                  <h1 className="text-2xl font-bold text-slate-900 mb-3">{serviceConfig.title}</h1>
                  <p className="text-slate-600 mb-6">{serviceConfig.description}</p>

                  {/* Price */}
                  <div className="bg-slate-50 rounded-xl p-4 mb-6">
                    {serviceConfig.successFee ? (
                      <div>
                        <Badge className="bg-emerald-100 text-emerald-700 mb-2">Sem custo inicial</Badge>
                        <p className="text-lg font-bold text-slate-900">Análise 100% Gratuita</p>
                        <p className="text-sm text-slate-600">Pagamento apenas no êxito (50% do valor recuperado)</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-3xl font-bold text-slate-900">{serviceConfig.priceLabel}</p>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-slate-900">O que está incluso:</h3>
                    {serviceConfig.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Commercial Pitch */}
                  {serviceConfig.pitch && (
                    <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-sm font-medium text-primary">{serviceConfig.pitch}</p>
                    </div>
                  )}

                  {/* Trust Badge */}
                  <div className="mt-6 p-4 bg-primary/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Shield className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium text-slate-900">Atendimento Humano</p>
                        <p className="text-sm text-slate-600">Contadores verificados • Segurança jurídica</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Form - Right Column */}
            <div className="lg:col-span-3">
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Solicitar Serviço
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Personal Data */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-slate-900 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Seus Dados
                      </h3>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Nome Completo *</Label>
                          <Input
                            id="fullName"
                            name="fullName"
                            placeholder="Seu nome completo"
                            value={formData.fullName}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cpf">CPF</Label>
                          <MaskedInput
                            id="cpf"
                            name="cpf"
                            mask="cpf"
                            value={formData.cpf}
                            onChange={(value) => setFormData(prev => ({ ...prev, cpf: value }))}
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">E-mail *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">WhatsApp *</Label>
                          <MaskedInput
                            id="phone"
                            name="phone"
                            mask="phone"
                            value={formData.phone}
                            onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Company Data (for some services) */}
                    {(serviceConfig.key === 'fiscal_analysis' || serviceConfig.key === 'company_opening') && (
                      <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-medium text-slate-900 flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Dados da Empresa (se aplicável)
                        </h3>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="companyName">Nome da Empresa</Label>
                            <Input
                              id="companyName"
                              name="companyName"
                              placeholder="Razão social"
                              value={formData.companyName}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cnpj">CNPJ</Label>
                            <MaskedInput
                              id="cnpj"
                              name="cnpj"
                              mask="cnpj"
                              value={formData.cnpj}
                              onChange={(value) => setFormData(prev => ({ ...prev, cnpj: value }))}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes">Observações</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        placeholder="Descreva brevemente sua necessidade..."
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>

                    {/* Success Fee Notice */}
                    {serviceConfig.successFee && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <Scale className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-emerald-900">Pagamento apenas no êxito</h4>
                            <p className="text-sm text-emerald-700 mt-1">
                              A análise fiscal é 100% gratuita. Você só paga 50% do valor que identificarmos 
                              como economia ou crédito recuperável para sua empresa. Sem risco para você.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button 
                      className="w-full h-12 text-lg" 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          Solicitar Agora
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-center text-sm text-slate-500">
                      Ao solicitar, você concorda com nossos{' '}
                      <Link to="/termos-de-uso" className="text-primary hover:underline">termos de uso</Link>
                    </p>
                  </motion.div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer onNavigate={scrollToSection} />
    </div>
  );
}
