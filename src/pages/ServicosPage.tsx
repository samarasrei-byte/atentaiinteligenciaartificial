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
import { isFeatureEnabled } from '@/lib/featureFlags';
import { PLANS } from '@/lib/plans';
import { 
  MessageSquare, 
  Building2, 
  FileCheck, 
  FileText, 
  FileSpreadsheet,
  ArrowRight,
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
  Clock,
  Receipt,
  Sparkles,
} from 'lucide-react';

// ===== SERVICE CONFIGS =====

// ONE-TIME services (serviços avulsos)
const oneTimeServices: ServiceCardConfig[] = [
  {
    key: 'company_opening',
    name: 'Abertura de Empresa',
    description: 'Abertura completa de CNPJ com suporte especializado e orientação tributária.',
    targetAudience: 'Para quem quer abrir empresa',
    features: [
      'Registro completo do CNPJ',
      'Escolha do melhor regime tributário',
      'Contrato social e documentação',
      'Alvará e inscrições fiscais',
    ],
    guarantees: ['Atendimento humano', 'Suporte completo'],
    basePrice: 78000,
    discountPercent: 0,
    badge: 'coming_soon',
    cta: 'Em Breve',
    color: 'primary',
    icon: Building2,
    serviceType: 'company_opening',
    category: 'empresarial',
    isDisabled: true,
  },
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
    basePrice: 82450,
    originalPrice: 123800,
    discountPercent: 10,
    installments: 4,
    badge: 'popular',
    cta: 'Limpar meu nome agora',
    color: 'accent',
    icon: CreditCard,
    serviceType: 'credit_repair_pf',
    category: 'documentos',
  },
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
    basePrice: 128000,
    originalPrice: 156800,
    discountPercent: 10,
    installments: 4,
    badge: 'popular',
    cta: 'Regularizar meu CNPJ',
    color: 'accent',
    icon: Building2,
    serviceType: 'credit_repair_pj',
    category: 'empresarial',
  },
  {
    key: 'certificate',
    name: 'Certidão Negativa de Débitos',
    description: 'Emissão de certidões fiscais para sua empresa ou pessoa física.',
    targetAudience: 'Para quem precisa de certidão',
    features: [
      'Certidão Federal (RFB)',
      'Certidão Estadual (SEFAZ)',
      'Certidão Municipal',
      'Entrega digital rápida',
    ],
    guarantees: ['Entrega ágil', 'Suporte incluso'],
    basePrice: 8000,
    discountPercent: 0,
    badge: 'coming_soon',
    cta: 'Em Breve',
    color: 'blue',
    icon: FileCheck,
    serviceType: 'certificate',
    category: 'documentos',
    isDisabled: true,
  },
  {
    key: 'fiscal_analysis',
    name: 'Análise Fiscal Inteligente',
    description: 'Recuperação de créditos tributários e otimização fiscal com análise especializada.',
    targetAudience: 'Para empresas que querem economizar',
    features: [
      'Análise completa gratuita',
      'Identificação de créditos tributários',
      'Pagamento apenas no êxito (50%)',
    ],
    guarantees: ['Sem risco', 'Pagamento no êxito'],
    basePrice: 0,
    discountPercent: 0,
    badge: 'free',
    cta: 'Solicitar análise',
    color: 'emerald',
    icon: Scale,
    serviceType: 'fiscal_analysis',
    isFree: true,
    successFee: true,
    isCustomPricing: true,
    checkoutRoute: '/chat/guilherme?servico=fiscal',
    category: 'empresarial',
  },
];

// AI-POWERED services
const aiServices: ServiceCardConfig[] = [
  {
    key: 'contador_ia',
    name: 'Contador IA — Imposto de Renda',
    description: 'Envie seus documentos e a IA mais avançada do Brasil faz sua declaração de IR em minutos.',
    targetAudience: 'Para quem quer declarar sem complicação',
    features: [
      'Análise automática de documentos',
      'Extração de dados por IA',
      'Cálculo automático de imposto',
      'Dicas de otimização fiscal',
      'Alertas de inconsistências',
    ],
    guarantees: ['IA de última geração', '97% de precisão'],
    basePrice: 8900,
    discountPercent: 0,
    badge: 'new' as const,
    cta: 'Fazer minha declaração',
    color: 'purple' as const,
    icon: Brain,
    serviceType: 'contador_ia',
    checkoutRoute: '/ir',
    category: 'declaracoes',
    isFree: false,
  },
];

// SUBSCRIPTION plans
const subscriptionPlans: ServiceCardConfig[] = [
  {
    key: 'simulator',
    name: 'Simulador Tributário',
    description: 'Simule o impacto da reforma tributária na sua empresa com IA.',
    targetAudience: 'Para entender a reforma',
    features: [
      'Simulador tributário completo',
      'Comparação de regimes',
      'Exportação em PDF',
      '5 perguntas à IA por dia',
    ],
    guarantees: ['Atualizado 2026', 'IBS + CBS'],
    basePrice: PLANS.simulator.price,
    discountPercent: 0,
    cta: 'Assinar Agora',
    color: 'blue',
    icon: Calculator,
    serviceType: 'simulator',
    checkoutRoute: '/#pricing',
    category: 'consultoria',
    isFree: false,
    isSubscription: true,
  },
  {
    key: 'autonomo',
    name: 'Plano Autônomo',
    description: 'Dashboard financeiro completo para profissionais autônomos.',
    targetAudience: 'Para profissionais liberais',
    features: [
      'Tudo do Simulador +',
      'Dashboard financeiro',
      'Metas financeiras',
      '10 perguntas à IA por dia',
      'Comparador PF vs PJ',
    ],
    guarantees: ['Painel dedicado', 'Suporte IA'],
    basePrice: PLANS.autonomo.price,
    discountPercent: 0,
    badge: 'popular',
    cta: 'Assinar Agora',
    color: 'primary',
    icon: Wallet,
    serviceType: 'autonomo',
    checkoutRoute: '/#pricing',
    category: 'consultoria',
    isFree: false,
    isSubscription: true,
  },
  {
    key: 'premium',
    name: 'AtentAI Premium',
    description: 'Recursos completos para empresas com IA ilimitada.',
    targetAudience: 'Para empresas',
    features: [
      'Tudo do Autônomo +',
      'IA ilimitada',
      'Simulador de locação',
      'Exportação Excel',
      'Suporte prioritário',
    ],
    guarantees: ['IA sem limites', 'Prioridade total'],
    basePrice: PLANS.premium.price,
    discountPercent: 0,
    cta: 'Assinar Agora',
    color: 'accent',
    icon: Star,
    serviceType: 'premium',
    checkoutRoute: '/#pricing',
    category: 'consultoria',
    isFree: false,
    isSubscription: true,
  },
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
    role: 'user',
    name: 'Empresa',
    description: 'Dashboard completo',
    icon: Building2,
    href: '/dashboard',
  },
];

const ServicosPage = () => {
  const { subscription, user } = useAuth();
  const navigate = useNavigate();
  const isSubscriber = subscription.subscribed;
  const [searchTerm, setSearchTerm] = useState('');

  // Merge all services for search
  const allServices = useMemo(() => [
    ...oneTimeServices, ...aiServices, ...subscriptionPlans,
  ], []);

  // Filter by search
  const filterBySearch = (services: ServiceCardConfig[]) => {
    if (!searchTerm) return services;
    const term = searchTerm.toLowerCase();
    return services.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.description.toLowerCase().includes(term) ||
      s.targetAudience.toLowerCase().includes(term)
    );
  };

  const filteredOneTime = filterBySearch(oneTimeServices);
  const filteredAI = filterBySearch(aiServices);
  const filteredSubs = filterBySearch(subscriptionPlans);
  const hasResults = filteredOneTime.length + filteredAI.length + filteredSubs.length > 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
        <main>
          {/* Hero — Emissão de NF (produto core) */}
          <section className="relative py-16 lg:py-24 overflow-hidden bg-gradient-to-br from-foreground via-foreground/95 to-foreground">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[150px]" />
              <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/15 rounded-full blur-[120px]" />
            </div>

            <div className="container max-w-6xl mx-auto px-4 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid lg:grid-cols-2 gap-12 items-center"
              >
                {/* Left — Copy */}
                <div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-4 px-3 py-1.5">
                    <Zap className="w-3 h-3 mr-1.5" /> Produto Principal
                  </Badge>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                    Receba no Pix e a nota
                    <span className="block text-emerald-400">sai sozinha</span>
                  </h1>
                  <p className="text-lg text-white/70 mb-6 max-w-lg">
                    Automatize cobranças, pagamentos e emissão de nota fiscal. Sem retrabalho. Sem erro. Sem estresse.
                  </p>
                  <div className="flex flex-wrap gap-3 mb-8">
                    <Button
                      size="lg"
                      onClick={() => navigate('/emissao-nf')}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8 h-12 font-semibold shadow-lg shadow-emerald-500/25"
                    >
                      <Receipt className="w-5 h-5 mr-2" />
                      Ativar agora — R$ 97/mês
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-white/50 text-sm">
                    <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-400" /> Segurança bancária</span>
                    <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-emerald-400" /> Setup em 2 min</span>
                    <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-emerald-400" /> NF automática</span>
                  </div>
                </div>

                {/* Right — Feature summary card */}
                <div className="hidden lg:block">
                  <Card className="bg-white/5 border-white/10 backdrop-blur-sm rounded-3xl">
                    <CardContent className="p-8 space-y-5">
                      {[
                        { icon: CreditCard, text: 'Cobranças via Pix, boleto e cartão', color: 'text-blue-400' },
                        { icon: Receipt, text: 'Nota fiscal emitida automaticamente', color: 'text-emerald-400' },
                        { icon: FileBarChart, text: 'Dashboard financeiro em tempo real', color: 'text-purple-400' },
                        { icon: Users, text: 'Gestão de clientes integrada', color: 'text-amber-400' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <item.icon className={`w-5 h-5 ${item.color}`} />
                          </div>
                          <span className="text-white/80 text-sm font-medium">{item.text}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Search Bar */}
          <section className="sticky top-0 z-40 bg-background/98 backdrop-blur-xl border-b border-border shadow-sm">
            <div className="container max-w-6xl mx-auto px-4 py-3">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-foreground whitespace-nowrap hidden sm:block">
                  Marketplace
                </h2>
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar serviço..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-muted border-border focus:bg-background transition-colors"
                  />
                </div>
                {user && (
                  <div className="hidden md:flex items-center gap-2 ml-auto">
                    <span className="text-xs text-muted-foreground">Acesso rápido:</span>
                    {panelAccess.map((panel) => (
                      <Link key={panel.role} to={panel.href}>
                        <Button variant="outline" size="sm" className="text-xs">
                          <panel.icon className="h-3 w-3 mr-1.5 text-primary" />
                          {panel.name}
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Free Tools — Lead magnets on top */}
          <section className="py-8 bg-background">
            <div className="container max-w-6xl mx-auto px-4">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className="border-primary/30 text-primary text-xs">
                  <Sparkles className="w-3 h-3 mr-1" /> Gratuito
                </Badge>
                <h3 className="text-sm font-semibold text-foreground">Ferramentas Gratuitas</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {freeTools.map((tool) => (
                  <Link key={tool.key} to={tool.href}>
                    <Card className="bg-muted border-border hover:border-primary/30 hover:bg-background transition-all duration-300 hover:shadow-md">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <tool.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-foreground text-sm">{tool.name}</h4>
                          <p className="text-xs text-muted-foreground">{tool.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Section 1: IA-POWERED — featured single card */}
          {filteredAI.length > 0 && (
            <section className="py-10 bg-gradient-to-b from-purple-50/50 to-background dark:from-purple-950/20 dark:to-background">
              <div className="container max-w-6xl mx-auto px-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Inteligência Artificial</h2>
                    <p className="text-xs text-muted-foreground">Serviços automatizados com IA</p>
                  </div>
                </div>
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className={`grid gap-6 ${filteredAI.length === 1 ? 'grid-cols-1 max-w-md' : filteredAI.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                  {filteredAI.map((service) => (
                    <ServiceCardPremium key={service.key} service={service} isSubscriber={isSubscriber} />
                  ))}
                </motion.div>
              </div>
            </section>
          )}

          {/* Section 2: SERVIÇOS AVULSOS */}
          {filteredOneTime.length > 0 && (
            <section className="py-10 bg-muted/50">
              <div className="container max-w-6xl mx-auto px-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Serviços Avulsos</h2>
                    <p className="text-xs text-muted-foreground">Contrate sem assinatura, pague uma vez</p>
                  </div>
                </div>
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className={`grid gap-6 ${filteredOneTime.length <= 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                  {filteredOneTime.map((service) => (
                    <ServiceCardPremium key={service.key} service={service} isSubscriber={isSubscriber} />
                  ))}
                </motion.div>
              </div>
            </section>
          )}

          {/* Section 3: PLANOS DE ASSINATURA */}
          {filteredSubs.length > 0 && (
            <section className="py-10 bg-background">
              <div className="container max-w-6xl mx-auto px-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Crown className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Planos de Assinatura</h2>
                    <p className="text-xs text-muted-foreground">Ferramentas e dashboards com cobrança mensal</p>
                  </div>
                </div>
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredSubs.map((service) => (
                    <ServiceCardPremium key={service.key} service={service} isSubscriber={isSubscriber} />
                  ))}
                </motion.div>
              </div>
            </section>
          )}

          {/* No results */}
          {!hasResults && searchTerm && (
            <section className="py-16">
              <div className="container max-w-6xl mx-auto px-4 text-center">
                <p className="text-muted-foreground mb-4">
                  Nenhum serviço encontrado para "{searchTerm}"
                </p>
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Limpar busca
                </Button>
              </div>
            </section>
          )}

          {/* CTA — Non-subscribers */}
          {!isSubscriber && (
            <section className="py-16 bg-gradient-to-br from-primary via-primary/95 to-foreground">
              <div className="container max-w-4xl mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6">
                  <Crown className="w-4 h-4 text-accent" />
                  Acesso completo à plataforma
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                  Desbloqueie IA ilimitada e dashboards
                </h2>
                <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                  Assinantes têm acesso ao simulador tributário, dashboards financeiros e suporte prioritário com IA.
                </p>
                <Button
                  size="lg"
                  variant="accent"
                  onClick={() => navigate('/pricing')}
                  className="px-8 group"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Ver Planos a partir de R$ 39,99
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </section>
          )}
        </main>
      </div>
    </PublicLayout>
  );
};

export default ServicosPage;
