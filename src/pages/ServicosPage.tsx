import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SUBSCRIBER_DISCOUNTS, formatPrice } from '@/lib/stripe';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Building2, 
  FileCheck, 
  FileText, 
  FileSpreadsheet,
  Check,
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
  TrendingUp,
  Users,
  Clock,
  BadgeCheck,
  Sparkles,
  Award,
  Flame
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  MessageSquare,
  Building2,
  FileCheck,
  FileText,
  FileSpreadsheet,
  BarChart: FileBarChart,
  Briefcase,
  CreditCard,
};

const categories = [
  { id: 'all', label: 'Todos', icon: Briefcase },
  { id: 'declaracoes', label: 'Declarações', icon: FileText },
  { id: 'empresarial', label: 'Empresarial', icon: Building2 },
  { id: 'consultoria', label: 'Consultoria', icon: MessageSquare },
];

const serviceCategoryMap: Record<string, string> = {
  consultation: 'consultoria',
  company_opening: 'empresarial',
  certificate: 'documentos',
  ir_simples: 'declaracoes',
  ir_completo: 'declaracoes',
  credit_repair: 'documentos',
  fiscal_analysis: 'empresarial',
  business_consulting: 'consultoria',
};

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

const ServicosPage = () => {
  const { subscription, user } = useAuth();
  const navigate = useNavigate();
  const isSubscriber = subscription.subscribed;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const scrollToSection = (section: string) => {
    window.location.href = '/';
  };

  const services = Object.entries(SUBSCRIBER_DISCOUNTS).map(([key, service]) => ({
    key,
    ...service,
    IconComponent: iconMap[service.icon] || FileText,
    category: serviceCategoryMap[key] || 'outros',
  }));

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'all' || service.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [services, searchTerm, selectedCategory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header onNavigate={scrollToSection} />
      
      <main className="pt-20">
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

        {/* Search & Filter Bar */}
        <section className="py-8 bg-white border-b border-slate-100 sticky top-16 z-40 shadow-sm">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 items-center w-full lg:w-auto">
                <h2 className="text-2xl font-bold text-slate-900 hidden lg:block">
                  Nossos Serviços
                </h2>
                <p className="text-slate-500 text-sm hidden lg:block">
                  {isSubscriber ? '' : 'Assine para desbloquear descontos'}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className={`whitespace-nowrap ${
                        selectedCategory === category.id 
                          ? 'bg-primary text-white' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
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
          <section className="py-8 bg-slate-50/50">
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredServices.map((service) => {
                const discountPercent = Math.round(service.discount * 100);
                const IconComponent = service.IconComponent;
                const isLimpaNome = service.key === 'credit_repair';
                const installmentValue = isLimpaNome ? Math.round(service.basePrice / 4) : 0;
                
                return (
                  <motion.div key={service.key} variants={itemVariants}>
                    <Card className={`h-full bg-white border transition-all duration-300 hover:shadow-xl group relative overflow-hidden ${
                      isLimpaNome 
                        ? 'border-accent ring-2 ring-accent/20' 
                        : 'border-slate-200 hover:border-primary/30'
                    }`}>
                      {/* Popular Badge for Limpa Nome */}
                      {isLimpaNome && (
                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-accent to-emerald-500 text-white text-center text-xs font-bold py-2 flex items-center justify-center gap-2">
                          <Flame className="w-3.5 h-3.5" />
                          MAIS VENDIDO
                        </div>
                      )}
                      
                      <CardContent className={`p-6 ${isLimpaNome ? 'pt-12' : ''}`}>
                        {/* Icon */}
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-5 ${
                          isLimpaNome 
                            ? 'bg-accent/10' 
                            : 'bg-primary/5'
                        }`}>
                          <IconComponent className={`h-7 w-7 ${isLimpaNome ? 'text-accent' : 'text-primary'}`} />
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{service.name}</h3>
                        <p className="text-sm text-slate-500 mb-5 line-clamp-2">{service.description}</p>
                        
                        {/* Pricing - Marketplace Style */}
                        <div className="mb-5">
                          {isLimpaNome ? (
                            <div className="space-y-1">
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-slate-900">
                                  {formatPrice(service.basePrice)}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-accent">
                                ou 4x de {formatPrice(installmentValue)} sem juros
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-slate-900">
                                {formatPrice(service.basePrice)}
                              </span>
                              {!isSubscriber && (
                                <span className="text-sm text-accent font-medium">
                                  {formatPrice(service.discountedPrice)} p/ assinantes
                                </span>
                              )}
                              {isSubscriber && (
                                <Badge className="bg-accent/10 text-accent border-0 text-xs">
                                  -{discountPercent}%
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Features */}
                        <ul className="space-y-2.5 mb-6">
                          <li className="flex items-center gap-2.5 text-slate-600 text-sm">
                            <Check className="h-4 w-4 text-accent flex-shrink-0" />
                            Profissionais verificados
                          </li>
                          <li className="flex items-center gap-2.5 text-slate-600 text-sm">
                            <Check className="h-4 w-4 text-accent flex-shrink-0" />
                            Pagamento seguro
                          </li>
                        </ul>

                        <Button 
                          className={`w-full rounded-xl h-11 font-semibold ${
                            isLimpaNome 
                              ? 'bg-accent hover:bg-accent/90 text-white' 
                              : 'bg-primary hover:bg-primary/90 text-white'
                          }`}
                          asChild
                        >
                          <Link to={
                            service.key.startsWith('ir_') ? '/ir' : 
                            service.key === 'company_opening' ? '/abertura-empresa' : 
                            service.key === 'credit_repair' ? '/limpa-nome' :
                            service.key === 'fiscal_analysis' ? '/modulo-fiscal' :
                            service.key === 'business_consulting' ? '/contadores-publico' :
                            `/certidoes`
                          }>
                            Solicitar
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
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

      <Footer onNavigate={scrollToSection} />
    </div>
  );
};

export default ServicosPage;
