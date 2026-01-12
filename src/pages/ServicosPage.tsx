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
  Sparkles,
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
  BadgeCheck
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
  { id: 'documentos', label: 'Documentos', icon: FileCheck },
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
    description: 'Calculadoras e alertas da reforma',
    icon: Calculator,
    href: '/ferramentas-lc214',
  },
  {
    key: 'transicao',
    name: 'Simulador de Transição',
    description: 'Impacto até 2033',
    icon: Target,
    href: '/transicao',
  },
  {
    key: 'timeline',
    name: 'Timeline da Reforma',
    description: 'Mudanças ano a ano',
    icon: FileBarChart,
    href: '/timeline-reforma',
  },
  {
    key: 'limpa-nome',
    name: 'Limpa Nome Premium',
    description: 'R$970 ou 4x de R$243',
    icon: CreditCard,
    href: '/limpa-nome',
    highlight: true,
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
  { value: '24h', label: 'Tempo de resposta' },
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
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={scrollToSection} />
      
      <main className="pt-20">
        {/* Hero Section - Ultra Clean */}
        <section className="relative py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 hero-gradient" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
          </div>
          
          <div className="container max-w-6xl mx-auto px-4 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm mb-8"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Serviços contábeis especializados na reforma tributária</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
                Simplifique sua
                <span className="block text-accent mt-2">contabilidade</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                Todos os serviços que você precisa em um só lugar. 
                {!isSubscriber && (
                  <span className="text-accent font-medium"> Assinantes economizam até 30%.</span>
                )}
              </p>

              {/* Social Proof Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-12"
              >
                {socialProof.map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/60">{stat.label}</p>
                  </div>
                ))}
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                {!isSubscriber ? (
                  <>
                    <Button 
                      size="lg" 
                      variant="accent"
                      onClick={() => navigate('/pricing')}
                      className="text-lg px-8 py-6 shadow-xl shadow-accent/20 group"
                    >
                      <Crown className="w-5 h-5 mr-2" />
                      Assinar e Economizar
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => document.getElementById('servicos')?.scrollIntoView({ behavior: 'smooth' })}
                      className="border-white/30 text-white hover:bg-white/10 py-6"
                    >
                      Ver Serviços
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="lg" 
                    variant="accent"
                    onClick={() => document.getElementById('servicos')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-lg px-8 py-6 shadow-xl shadow-accent/20 group"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Explorar Serviços
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="py-6 border-y border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-success" />
                <span>Pagamento 100% seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-primary" />
                <span>Contadores verificados</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                <span>Suporte em até 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-accent" />
                <span>4.9 de avaliação</span>
              </div>
            </div>
          </div>
        </section>

        {/* Panel Access - If logged in */}
        {user && (
          <section className="py-12 bg-muted/30">
            <div className="container max-w-5xl mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground">Acesse seu Painel</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {panelAccess.map((panel) => (
                  <motion.div
                    key={panel.role}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link to={panel.href}>
                      <Card className="h-full hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                        <CardContent className="p-6 flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <panel.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{panel.name}</h3>
                            <p className="text-sm text-muted-foreground">{panel.description}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground ml-auto" />
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Free Tools - Compact Grid */}
        <section className="py-16">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4 px-4 py-2">
                <Zap className="w-3 h-3 mr-2" />
                Gratuito
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
                Ferramentas Gratuitas
              </h2>
              <p className="text-muted-foreground">
                Simule, calcule e prepare-se para a reforma tributária
              </p>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {freeTools.map((tool) => (
                <motion.div key={tool.key} variants={itemVariants}>
                  <Link to={tool.href}>
                    <Card className="h-full hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
                      <CardContent className="p-5">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                          <tool.icon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{tool.name}</h3>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section id="servicos" className="py-20 bg-gradient-to-b from-muted/30 to-background">
          <div className="container max-w-6xl mx-auto px-4">
            {/* Search & Filter */}
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  Nossos Serviços
                </h2>
                <p className="text-muted-foreground">
                  {isSubscriber ? 'Seus descontos exclusivos estão aplicados' : 'Assine para desbloquear descontos'}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 4).map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="text-xs"
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Services Grid */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredServices.map((service) => {
                const discountPercent = Math.round(service.discount * 100);
                const IconComponent = service.IconComponent;
                const isLimpaNome = service.key === 'credit_repair';
                const installmentValue = isLimpaNome ? Math.round(service.basePrice / 4) : 0;
                
                return (
                  <motion.div key={service.key} variants={itemVariants}>
                    <Card className={`h-full transition-all duration-300 hover:shadow-2xl group relative overflow-hidden ${
                      isLimpaNome 
                        ? 'border-2 border-accent hover:border-accent' 
                        : 'hover:border-primary/50'
                    }`}>
                      {/* Popular Badge for Limpa Nome */}
                      {isLimpaNome && (
                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-accent to-primary text-white text-center text-xs font-bold py-1.5">
                          🔥 MAIS VENDIDO
                        </div>
                      )}
                      
                      {isSubscriber && !isLimpaNome && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-success text-success-foreground text-xs">
                            -{discountPercent}%
                          </Badge>
                        </div>
                      )}
                      
                      <CardContent className={`p-6 ${isLimpaNome ? 'pt-10' : ''}`}>
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-5 transition-colors ${
                          isLimpaNome 
                            ? 'bg-gradient-to-br from-accent to-primary shadow-lg' 
                            : 'bg-primary/10 group-hover:bg-primary/20'
                        }`}>
                          <IconComponent className={`h-7 w-7 ${isLimpaNome ? 'text-white' : 'text-primary'}`} />
                        </div>
                        
                        <h3 className="text-xl font-bold text-foreground mb-2">{service.name}</h3>
                        <p className="text-sm text-muted-foreground mb-5 line-clamp-2">{service.description}</p>
                        
                        {/* Pricing */}
                        <div className="mb-5">
                          {isLimpaNome ? (
                            <div className="space-y-1">
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-foreground">
                                  {formatPrice(service.basePrice)}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-accent">
                                ou 4x de {formatPrice(installmentValue)} sem juros
                              </p>
                              {isSubscriber && (
                                <p className="text-xs text-success">
                                  Você economiza {formatPrice(service.basePrice - service.discountedPrice)}
                                </p>
                              )}
                            </div>
                          ) : isSubscriber ? (
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-foreground">
                                {formatPrice(service.discountedPrice)}
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(service.basePrice)}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-foreground">
                                {formatPrice(service.basePrice)}
                              </span>
                              <span className="text-xs text-success">
                                {formatPrice(service.discountedPrice)} p/ assinantes
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Features */}
                        <ul className="space-y-2 mb-6 text-sm">
                          <li className="flex items-center gap-2 text-muted-foreground">
                            <Check className="h-4 w-4 text-success flex-shrink-0" />
                            Profissionais verificados
                          </li>
                          <li className="flex items-center gap-2 text-muted-foreground">
                            <Check className="h-4 w-4 text-success flex-shrink-0" />
                            Pagamento seguro
                          </li>
                          {isLimpaNome && (
                            <li className="flex items-center gap-2 text-muted-foreground">
                              <Check className="h-4 w-4 text-success flex-shrink-0" />
                              Consultoria especializada
                            </li>
                          )}
                        </ul>

                        <Button 
                          className={`w-full group/btn ${isLimpaNome ? 'bg-gradient-to-r from-accent to-primary hover:opacity-90' : ''}`}
                          size={isLimpaNome ? 'lg' : 'default'}
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
                            {isLimpaNome ? 'Limpar meu Nome' : 'Solicitar'}
                            <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
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
                <p className="text-muted-foreground mb-4">
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

        {/* CTA Section - Non-subscribers */}
        {!isSubscriber && (
          <section className="py-20">
            <div className="container max-w-4xl mx-auto px-4">
              <Card className="relative overflow-hidden border-2 border-primary/20">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
                <CardContent className="relative p-8 lg:p-12 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent text-sm font-medium mb-6">
                    <TrendingUp className="w-4 h-4" />
                    Economize até 30%
                  </div>
                  
                  <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                    Desbloqueie descontos exclusivos
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Assinantes têm acesso a preços especiais em todos os serviços, 
                    ferramentas premium e suporte prioritário.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg" 
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
                    >
                      <Users className="w-5 h-5 mr-2" />
                      Ver Contadores
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Final Social Proof */}
        <section className="py-16 border-t border-border/50">
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <p className="text-muted-foreground mb-6">Confiado por empresas de todo o Brasil</p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                      {['CM', 'AR', 'RS', 'JP', 'ML'][i - 1]}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground ml-2">+2.847 clientes</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
                <span className="text-sm text-muted-foreground ml-1">4.9/5</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer onNavigate={scrollToSection} />
    </div>
  );
};

export default ServicosPage;
