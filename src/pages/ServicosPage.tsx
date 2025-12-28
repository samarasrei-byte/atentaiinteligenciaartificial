import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SUBSCRIBER_DISCOUNTS, formatPrice, STRIPE_PLANS } from '@/lib/stripe';
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
  Shield
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  MessageSquare,
  Building2,
  FileCheck,
  FileText,
  FileSpreadsheet,
};

const ServicosPage = () => {
  const { subscription } = useAuth();
  const isSubscriber = subscription.subscribed;

  const scrollToSection = (section: string) => {
    window.location.href = '/';
  };

  const services = Object.entries(SUBSCRIBER_DISCOUNTS).map(([key, service]) => ({
    key,
    ...service,
    IconComponent: iconMap[service.icon] || FileText,
  }));

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

        {/* Services Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
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
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>{service.name}</CardTitle>
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

                      <Button className="w-full" asChild>
                        <Link to={service.key.startsWith('ir_') ? '/ir' : '/auth'}>
                          Solicitar
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
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
