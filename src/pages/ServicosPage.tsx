import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SUBSCRIBER_DISCOUNTS, formatPrice } from '@/lib/stripe';
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
  Users,
  Shield,
  Search,
  Calculator,
  FileBarChart,
  CreditCard,
  Briefcase,
  Scale,
  Wallet,
  Target
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  MessageSquare,
  Building2,
  FileCheck,
  FileText,
  FileSpreadsheet,
};

// Categories for services
const categories = [
  { id: 'all', label: 'Todos', icon: Briefcase },
  { id: 'declaracoes', label: 'Declarações', icon: FileText },
  { id: 'empresarial', label: 'Empresarial', icon: Building2 },
  { id: 'consultoria', label: 'Consultoria', icon: MessageSquare },
  { id: 'documentos', label: 'Documentos', icon: FileCheck },
];

// Map services to categories
const serviceCategoryMap: Record<string, string> = {
  consultation: 'consultoria',
  company_opening: 'empresarial',
  certificate: 'documentos',
  ir_simples: 'declaracoes',
  ir_completo: 'declaracoes',
  credit_repair: 'documentos',
};

// Free tools available
const freeTools = [
  {
    key: 'ferramentas-lc214',
    name: 'Ferramentas LC 214/2025',
    description: 'Alertas de transição, calculadora de split payment e simulador de cashback',
    icon: Calculator,
    href: '/ferramentas-lc214',
    badge: 'Gratuito',
    features: ['Alertas por ano', 'Split Payment', 'Cashback Famílias'],
  },
  {
    key: 'transicao',
    name: 'Simulador de Transição',
    description: 'Simule o impacto da reforma tributária na sua empresa até 2033',
    icon: Target,
    href: '/transicao',
    badge: 'Gratuito',
    features: ['Timeline 2026-2033', 'Comparativo', 'Relatório PDF'],
  },
  {
    key: 'timeline',
    name: 'Timeline da Reforma',
    description: 'Visualize todas as mudanças tributárias ano a ano',
    icon: FileBarChart,
    href: '/timeline-reforma',
    badge: 'Gratuito',
    features: ['Cronograma visual', 'Marcos importantes', 'Datas chave'],
  },
  {
    key: 'limpa-nome',
    name: 'Limpa Nome',
    description: 'Regularize sua situação cadastral e limpe restrições',
    icon: CreditCard,
    href: '/limpa-nome',
    badge: 'A partir de R$97',
    features: ['Análise de CPF', 'Negociação', 'Acompanhamento'],
  },
];

// Panel access info
const panelAccess = [
  {
    role: 'autonomo',
    name: 'Painel do Autônomo',
    description: 'Simulador PF vs PJ, metas financeiras e abertura de empresa',
    icon: Wallet,
    href: '/dashboard',
    color: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    role: 'contador',
    name: 'Painel do Contador',
    description: 'Gerencie clientes, consultas e serviços',
    icon: Scale,
    href: '/dashboard',
    color: 'from-blue-500/20 to-indigo-500/20',
  },
  {
    role: 'user',
    name: 'Painel da Empresa',
    description: 'Dashboard empresarial com simuladores e relatórios',
    icon: Building2,
    href: '/dashboard',
    color: 'from-purple-500/20 to-pink-500/20',
  },
];

const ServicosPage = () => {
  const { subscription, user } = useAuth();
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

  // Filter services based on search and category
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

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={scrollToSection} />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Serviços Contábeis
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Todos os Serviços que Você Precisa,{' '}
              <span className="text-primary">com Desconto</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Contadores especializados na Reforma Tributária prontos para ajudar 
              você a economizar. Assinantes têm descontos exclusivos em todos os serviços.
            </p>
            
            {!isSubscriber && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/pricing">
                    <Crown className="w-4 h-4 mr-2" />
                    Assinar e Economizar
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/contadores-publico">
                    <Users className="w-4 h-4 mr-2" />
                    Ver Contadores
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Panel Access Section */}
        {user && (
          <section className="py-8 bg-muted/20">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                Acesse seu Painel
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {panelAccess.map((panel) => (
                  <Card 
                    key={panel.role}
                    className={`relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br ${panel.color}`}
                  >
                    <Link to={panel.href}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-background/80 flex items-center justify-center">
                          <panel.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{panel.name}</h3>
                          <p className="text-sm text-muted-foreground">{panel.description}</p>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Free Tools Section */}
        <section className="py-12 bg-gradient-to-r from-success/5 to-primary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-success/20 text-success border-success/30">
                <Calculator className="w-3 h-3 mr-1" />
                Ferramentas Gratuitas
              </Badge>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Ferramentas da Reforma Tributária
              </h2>
              <p className="text-muted-foreground">
                Simule, calcule e prepare-se para as mudanças
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {freeTools.map((tool) => (
                <Card 
                  key={tool.key}
                  className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/50"
                >
                  <Link to={tool.href}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <tool.icon className="h-5 w-5 text-primary" />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {tool.badge}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-3">{tool.name}</CardTitle>
                      <CardDescription className="text-sm">{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <ul className="space-y-1">
                        {tool.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="h-3 w-3 text-success" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar serviços..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    <category.icon className="h-4 w-4" />
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => {
                const discountPercent = Math.round(service.discount * 100);
                const IconComponent = service.IconComponent;
                
                return (
                  <Card 
                    key={service.key} 
                    className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/50"
                  >
                    {isSubscriber && (
                      <div className="absolute top-0 right-0">
                        <Badge className="rounded-none rounded-bl-lg bg-success text-success-foreground">
                          -{discountPercent}% OFF
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {service.category}
                        </Badge>
                      </div>
                      <CardTitle className="mt-4">{service.name}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-baseline gap-2">
                        {isSubscriber ? (
                          <>
                            <span className="text-muted-foreground line-through text-sm">
                              {formatPrice(service.basePrice)}
                            </span>
                            <span className="text-3xl font-bold text-foreground">
                              {formatPrice(service.discountedPrice)}
                            </span>
                            <Badge variant="secondary" className="bg-success/20 text-success">
                              Assinante
                            </Badge>
                          </>
                        ) : (
                          <>
                            <span className="text-3xl font-bold text-foreground">
                              {formatPrice(service.basePrice)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ou {formatPrice(service.discountedPrice)} assinando
                            </span>
                          </>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Check className="h-4 w-4 text-success" />
                          <span>Contadores verificados com CRC</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Check className="h-4 w-4 text-success" />
                          <span>Pagamento seguro via Stripe</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Check className="h-4 w-4 text-success" />
                          <span>Suporte dedicado</span>
                        </div>
                      </div>

                      <Button className="w-full group" asChild>
                        <Link to={service.key.startsWith('ir_') ? '/ir' : service.key === 'company_opening' ? '/abertura-empresa' : `/certidoes`}>
                          Solicitar
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Nenhum serviço encontrado para "{searchTerm}"
                </p>
                <Button 
                  variant="ghost" 
                  onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                  className="mt-4"
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Compare os Descontos
              </h2>
              <p className="text-muted-foreground">
                Veja quanto você economiza sendo assinante
              </p>
            </div>

            <Card className="max-w-4xl mx-auto overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-4 font-medium">Serviço</th>
                        <th className="text-center p-4 font-medium">Preço Normal</th>
                        <th className="text-center p-4 font-medium">
                          <div className="flex items-center justify-center gap-2">
                            <Crown className="h-4 w-4 text-primary" />
                            Preço Assinante
                          </div>
                        </th>
                        <th className="text-center p-4 font-medium">Economia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((service, index) => {
                        const savings = service.basePrice - service.discountedPrice;
                        const IconComponent = service.IconComponent;
                        
                        return (
                          <tr 
                            key={service.key} 
                            className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <IconComponent className="h-5 w-5 text-primary" />
                                <span className="font-medium">{service.name}</span>
                              </div>
                            </td>
                            <td className="text-center p-4 text-muted-foreground">
                              {formatPrice(service.basePrice)}
                            </td>
                            <td className="text-center p-4">
                              <span className="font-bold text-primary">
                                {formatPrice(service.discountedPrice)}
                              </span>
                            </td>
                            <td className="text-center p-4">
                              <Badge className="bg-success/20 text-success border-success/30">
                                {formatPrice(savings)} ({Math.round(service.discount * 100)}%)
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {!isSubscriber && (
              <div className="text-center mt-8">
                <p className="text-muted-foreground mb-4">
                  Assine qualquer plano e comece a economizar em todos os serviços
                </p>
                <Button size="lg" asChild>
                  <Link to="/pricing">
                    Ver Planos e Assinar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">Profissionais Verificados</h3>
                    <p className="text-sm text-muted-foreground">
                      Todos os contadores têm registro CRC ativo e são especializados
                    </p>
                  </div>
                  <div>
                    <FileCheck className="h-10 w-10 text-success mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">Pagamento Seguro</h3>
                    <p className="text-sm text-muted-foreground">
                      Processamento via Stripe com proteção total dos seus dados
                    </p>
                  </div>
                  <div>
                    <MessageSquare className="h-10 w-10 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">Suporte Dedicado</h3>
                    <p className="text-sm text-muted-foreground">
                      Chat direto com o contador e suporte da plataforma
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer onNavigate={scrollToSection} />
    </div>
  );
};

export default ServicosPage;
