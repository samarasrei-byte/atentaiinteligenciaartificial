import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ServiceCardPremium, ServiceCardConfig } from '@/components/services/ServiceCardPremium';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Building2, 
  FileCheck, 
  FileText, 
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  Crown,
  Shield,
  Search,
  Calculator,
  FileBarChart,
  CreditCard,
  Briefcase,
  Scale,
  Wallet,
  Target,
  Zap,
  Star,
  Users,
  BadgeCheck,
  Brain,
} from 'lucide-react';

const categories = [
  { id: 'all', label: 'Todos', icon: Briefcase },
  { id: 'declaracoes', label: 'Declarações', icon: FileText },
  { id: 'empresarial', label: 'Empresarial', icon: Building2 },
  { id: 'consultoria', label: 'Consultoria', icon: MessageSquare },
];

const freeTools = [
  {
    key: 'ferramentas-lc214',
    name: 'Ferramentas LC 214',
    description: 'Calculadoras e alertas',
    icon: Calculator,
    href: '/ferramentas-lc214',
  },
  {
    key: 'transicao',
    name: 'Simulador Transição',
    description: 'Impacto até 2033',
    icon: Target,
    href: '/transicao',
  },
  {
    key: 'timeline',
    name: 'Timeline Reforma',
    description: 'Mudanças ano a ano',
    icon: FileBarChart,
    href: '/timeline-reforma',
  },
];

const panelAccess = [
  {
    role: 'autonomo',
    name: 'Autônomo',
    description: 'Simulador e metas',
    icon: Wallet,
    href: '/dashboard',
  },
  {
    role: 'contador',
    name: 'Contador',
    description: 'Gestão de clientes',
    icon: Scale,
    href: '/dashboard',
  },
  {
    role: 'user',
    name: 'Empresa',
    description: 'Dashboard completo',
    icon: Building2,
    href: '/dashboard',
  },
];

const socialProof = [
  { value: '2.847+', label: 'Clientes atendidos' },
  { value: 'R$ 15M+', label: 'Economizados' },
  { value: '4.9/5', label: 'Avaliação média' },
  { value: '24h', label: 'Tempo resposta' },
];

// Service configurations with all information needed
const serviceConfigs: ServiceCardConfig[] = [
  // BI+ Contabilidade - SEM PREÇO FIXO (Sob consulta via chat)
  {
    key: 'bi_contabilidade',
    name: 'BI+ Contabilidade',
    description: 'Inteligência financeira com IA + análise humana especializada.',
    targetAudience: 'Para empresas que querem controle total',
    features: [
      'Dashboard em tempo real',
      'IA + Análise humana dedicada',
      'Insights automáticos e alertas',
      'Suporte especializado do César',
    ],
    guarantees: ['Atendimento humano', 'IA + Especialista'],
    basePrice: 0, // Sem preço fixo - sob consulta
    discountPercent: 0,
    badge: 'popular',
    cta: 'Falar com César',
    color: 'purple',
    icon: Brain,
    serviceType: 'bi_contabilidade',
    checkoutRoute: '/chat/cesar?servico=bi-contabilidade', // Redireciona para chat
    category: 'consultoria',
    isFree: false,
    successFee: false,
    isCustomPricing: true, // Flag para indicar preço sob consulta
  },
  // Limpa Nome PF
  {
    key: 'credit_repair_pf',
    name: 'Limpa Nome Pessoa Física',
    description: 'Regularização de restrições com análise humana especializada.',
    targetAudience: 'Para CPF negativado',
    features: [
      'Análise individual por especialista',
      'Estratégia personalizada',
      'Acompanhamento humano dedicado',
    ],
    guarantees: ['Atendimento humano', 'Parceria séria'],
    basePrice: 78000,
    discountPercent: 10,
    installments: 4,
    badge: 'popular',
    cta: 'Limpar meu nome agora',
    color: 'accent',
    icon: CreditCard,
    serviceType: 'credit_repair_pf',
    category: 'documentos',
  },
  // Limpa Nome PJ
  {
    key: 'credit_repair_pj',
    name: 'Limpa Nome Empresa (CNPJ)',
    description: 'Regularização cadastral com análise fiscal e jurídica especializada.',
    targetAudience: 'Para empresas com restrições',
    features: [
      'Avaliação completa do CNPJ',
      'Estratégia adequada ao porte da empresa',
      'Atendimento humano especializado',
    ],
    guarantees: ['Especialistas reais', 'Atendimento responsável'],
    basePrice: 97000,
    discountPercent: 10,
    installments: 4,
    badge: 'popular',
    cta: 'Regularizar meu CNPJ',
    color: 'accent',
    icon: Building2,
    serviceType: 'credit_repair_pj',
    category: 'empresarial',
  },
  // Análise Fiscal - FREE
  {
    key: 'fiscal_analysis',
    name: 'Análise Fiscal',
    description: 'Entenda seus riscos fiscais e descubra oportunidades de economia.',
    targetAudience: 'Para empresas que querem economizar',
    features: [
      'Análise completa gratuita',
      'Identificação de créditos tributários',
      'Relatório detalhado',
    ],
    guarantees: ['Sem risco', 'Pagamento no êxito'],
    basePrice: 0,
    discountPercent: 0,
    badge: 'free',
    cta: 'Solicitar análise gratuita',
    color: 'emerald',
    icon: Scale,
    serviceType: 'fiscal_analysis',
    isFree: true,
    successFee: true,
    checkoutRoute: '/modulo-fiscal',
    category: 'empresarial',
  },
  // Consulta com Contador
  {
    key: 'consultation',
    name: 'Consulta com Contador',
    description: 'Tire suas dúvidas tributárias com um contador especializado.',
    targetAudience: 'Para quem precisa de orientação',
    features: [
      'Atendimento com contador especializado',
      'Orientação clara e prática',
      'Resposta em até 24h',
    ],
    guarantees: ['Profissionais verificados', 'Pagamento seguro'],
    basePrice: 15000,
    discountPercent: 20,
    cta: 'Solicitar agora',
    color: 'primary',
    icon: MessageSquare,
    serviceType: 'consultation',
    checkoutRoute: '/contadores-publico',
    category: 'consultoria',
  },
  // Abertura de Empresa
  {
    key: 'company_opening',
    name: 'Abertura de Empresa',
    description: 'Abertura completa de CNPJ com suporte contábil especializado.',
    targetAudience: 'Para quem quer abrir CNPJ',
    features: [
      'Abertura completa de CNPJ',
      'Suporte contábil especializado',
      'Documentação inclusa',
    ],
    guarantees: ['Processo simplificado', 'Acompanhamento total'],
    basePrice: 78000,
    discountPercent: 15,
    cta: 'Abrir minha empresa',
    color: 'blue',
    icon: Building2,
    serviceType: 'company_opening',
    checkoutRoute: '/abertura-empresa',
    category: 'empresarial',
  },
  // Certidão
  {
    key: 'certificate',
    name: 'Emissão de Certidão',
    description: 'Certidões negativas de débitos fiscais para sua empresa ou CPF.',
    targetAudience: 'Para regularização fiscal',
    features: [
      'Emissão de certidões negativas',
      'Federal, estadual e municipal',
      'Entrega digital rápida',
    ],
    guarantees: ['Processo ágil', 'Suporte incluso'],
    basePrice: 8000,
    discountPercent: 10,
    cta: 'Solicitar certidão',
    color: 'primary',
    icon: FileCheck,
    serviceType: 'certificate',
    category: 'documentos',
  },
  // IR Simples
  {
    key: 'ir_simples',
    name: 'Declaração IR Simples',
    description: 'Para CLT com poucos rendimentos e sem investimentos complexos.',
    targetAudience: 'Para CLT sem investimentos',
    features: [
      'Declaração completa',
      'Revisão por especialista',
      'Envio à Receita Federal',
    ],
    guarantees: ['Sem erros', 'Recibo garantido'],
    basePrice: 20000,
    discountPercent: 20,
    cta: 'Fazer minha declaração',
    color: 'primary',
    icon: FileText,
    serviceType: 'ir_simples',
    checkoutRoute: '/ir',
    category: 'declaracoes',
  },
  // IR Completo
  {
    key: 'ir_completo',
    name: 'Declaração IR Completo',
    description: 'Para autônomos, investidores ou quem tem múltiplas fontes de renda.',
    targetAudience: 'Para autônomos e investidores',
    features: [
      'Declaração detalhada',
      'Análise completa de rendimentos',
      'Otimização fiscal inclusa',
    ],
    guarantees: ['Maximiza restituição', 'Especialista dedicado'],
    basePrice: 42000,
    discountPercent: 20,
    cta: 'Fazer minha declaração',
    color: 'purple',
    icon: FileSpreadsheet,
    serviceType: 'ir_completo',
    checkoutRoute: '/ir',
    category: 'declaracoes',
  },
  // Consultoria Empresarial
  {
    key: 'business_consulting',
    name: 'Consultoria Empresarial',
    description: 'Planejamento tributário estratégico para pagar menos impostos legalmente.',
    targetAudience: 'Para empresas que querem economizar',
    features: [
      'Planejamento tributário completo',
      'Estratégia personalizada',
      'Acompanhamento mensal',
    ],
    guarantees: ['ROI garantido', 'Especialistas sênior'],
    basePrice: 45000,
    discountPercent: 20,
    cta: 'Contratar consultoria',
    color: 'purple',
    icon: Briefcase,
    serviceType: 'business_consulting',
    checkoutRoute: '/contadores-publico',
    category: 'consultoria',
  },
];

const ServicosPage = () => {
  const { subscription, user } = useAuth();
  const navigate = useNavigate();
  const isSubscriber = subscription.subscribed;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const scrollToSection = (section: string) => {
    window.location.href = '/';
  };

  const filteredServices = useMemo(() => {
    return serviceConfigs.filter((service) => {
      const matchesSearch = 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.targetAudience.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'all' || service.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <main>
        {/* Hero Section - Clean & Modern */}
        <section className="relative py-16 lg:py-20 overflow-hidden bg-gradient-to-br from-slate-900 via-primary to-slate-800">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[150px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/30 rounded-full blur-[120px]" />
          </div>
          
          <div className="container max-w-6xl mx-auto px-4 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                Marketplace de Serviços
                <span className="block text-accent mt-1">Contábeis & Fiscais</span>
              </h1>
              
              <p className="text-base lg:text-lg text-white/80 max-w-xl mx-auto mb-8">
                {!isSubscriber ? (
                  <>Assine e economize <span className="text-accent font-semibold">até 30%</span> em todos os serviços</>
                ) : (
                  <span className="text-accent">✓ Seus descontos exclusivos estão aplicados</span>
                )}
              </p>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-white/70 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent" />
                  <span>100% Seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-accent" />
                  <span>Profissionais Verificados</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent" />
                  <span>4.9 Avaliação</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Search & Filter Bar - STICKY */}
        <section className="sticky top-0 z-40 bg-white/98 backdrop-blur-xl border-b border-slate-200 shadow-md">
          <div className="container max-w-6xl mx-auto px-4 py-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 items-center w-full lg:w-auto">
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 whitespace-nowrap">
                  Nossos Serviços
                </h2>
                {!isSubscriber && (
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 whitespace-nowrap">
                    Assine para descontos
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar serviço..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className={`whitespace-nowrap transition-all ${
                        selectedCategory === category.id 
                          ? 'bg-primary text-white shadow-md' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-primary/30'
                      }`}
                    >
                      <category.icon className="h-3.5 w-3.5 mr-1.5" />
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Panel Access - If logged in */}
        {user && (
          <section className="py-6 bg-slate-50/50">
            <div className="container max-w-6xl mx-auto px-4">
              <div className="flex items-center gap-4 overflow-x-auto pb-2">
                <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Acesso rápido:</span>
                {panelAccess.map((panel) => (
                  <Link key={panel.role} to={panel.href}>
                    <Button variant="outline" size="sm" className="whitespace-nowrap bg-white">
                      <panel.icon className="h-4 w-4 mr-2 text-primary" />
                      {panel.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Main Services Grid */}
        <section className="py-12 bg-slate-50">
          <div className="container max-w-6xl mx-auto px-4">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredServices.map((service) => (
                <ServiceCardPremium
                  key={service.key}
                  service={service}
                  isSubscriber={isSubscriber}
                />
              ))}
            </motion.div>

            {filteredServices.length === 0 && (
              <div className="text-center py-16">
                <p className="text-slate-500 mb-4">
                  Nenhum serviço encontrado para "{searchTerm}"
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Free Tools Section */}
        <section className="py-12 bg-white">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-3 px-3 py-1.5 border-primary/30 text-primary">
                <Zap className="w-3 h-3 mr-1.5" />
                Gratuito
              </Badge>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Ferramentas Gratuitas
              </h2>
              <p className="text-slate-500 text-sm">
                Prepare-se para a reforma tributária
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {freeTools.map((tool) => (
                <Link key={tool.key} to={tool.href}>
                  <Card className="h-full bg-slate-50 border-slate-200 hover:border-primary/30 hover:bg-white transition-all duration-300 hover:shadow-md">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <tool.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{tool.name}</h3>
                        <p className="text-sm text-slate-500">{tool.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 ml-auto" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Non-subscribers */}
        {!isSubscriber && (
          <section className="py-16 bg-gradient-to-br from-primary via-primary/95 to-slate-800">
            <div className="container max-w-4xl mx-auto px-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6">
                <Crown className="w-4 h-4 text-accent" />
                Economia de até 30%
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Desbloqueie descontos exclusivos
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Assinantes têm acesso a preços especiais em todos os serviços e suporte prioritário.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="accent"
                  onClick={() => navigate('/pricing')}
                  className="px-8 group"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Ver Planos
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/contadores-publico')}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Ver Contadores
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Social Proof */}
        <section className="py-12 bg-white border-t border-slate-100">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {socialProof.map((stat, i) => (
                <div key={i}>
                  <p className="text-2xl lg:text-3xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      </div>
    </PublicLayout>
  );
};

export default ServicosPage;
