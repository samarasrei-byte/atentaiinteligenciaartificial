import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { 
  Users,
  Star,
  MessageSquare,
  Loader2,
  Clock,
  Briefcase,
  ArrowRight,
  UserPlus,
  Shield
} from 'lucide-react';

interface ContadorProfile {
  id: string;
  user_id: string;
  crc_number: string | null;
  specialty: string | null;
  bio: string | null;
  hourly_rate_cents: number;
  rating: number;
  total_consultations: number;
  available: boolean;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const ContadoresPublic = () => {
  const navigate = useNavigate();
  const [contadores, setContadores] = useState<ContadorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const scrollToSection = (section: string) => {
    if (section === "hero") {
      navigate('/');
      return;
    }
    navigate('/');
  };

  useEffect(() => {
    fetchContadores();
  }, []);

  const fetchContadores = async () => {
    try {
      // Use the secure view that excludes sensitive Stripe information
      const { data: contadorData, error } = await supabase
        .from('contador_profiles_public')
        .select('*');
      
      if (error) throw error;

      // Fetch profile info separately to get names/avatars
      const userIds = (contadorData || []).map(c => c.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      // Join the data
      const data = (contadorData || []).map(contador => ({
        ...contador,
        profile: profilesData?.find(p => p.user_id === contador.user_id)
      }));

      if (error) throw error;
      
      const transformedData = (data || []).map(item => ({
        ...item,
        profile: Array.isArray(item.profile) ? item.profile[0] : item.profile
      }));
      
      setContadores(transformedData);
    } catch (error) {
      console.error('Error fetching contadores:', error);
      setContadores([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        <main>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Users className="w-3 h-3 mr-1" />
              Contadores Especializados
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Encontre um Contador para a{' '}
              <span className="text-primary">Reforma Tributária</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Conecte-se com profissionais especializados que podem ajudar sua 
              empresa ou seu negócio a se adaptar às mudanças tributárias.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/auth">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Contratar Contador
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contador-onboarding">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sou Contador - Quero me Cadastrar
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Contadores List */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Contadores Disponíveis
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Todos os nossos contadores possuem registro CRC ativo e são 
                especializados em tributação.
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : contadores.length === 0 ? (
              <Card className="max-w-md mx-auto text-center">
                <CardContent className="pt-12 pb-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Nenhum contador disponível no momento
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Estamos ampliando nossa rede de contadores. Volte em breve 
                    ou cadastre-se como contador!
                  </p>
                  <Button asChild>
                    <Link to="/contador-onboarding">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Cadastrar como Contador
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contadores.map((contador) => (
                  <Card key={contador.id} className="hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={contador.profile?.avatar_url || ''} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                            {contador.profile?.full_name?.charAt(0) || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {contador.profile?.full_name || 'Contador'}
                          </CardTitle>
                          <CardDescription>
                            {contador.specialty || 'Especialista em Reforma Tributária'}
                          </CardDescription>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                            <span className="text-amber-600 font-medium">
                              {Number(contador.rating).toFixed(1)}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              ({contador.total_consultations} consultas)
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {contador.crc_number && (
                        <Badge variant="outline" className="border-primary/50 text-primary">
                          <Shield className="w-3 h-3 mr-1" />
                          CRC: {contador.crc_number}
                        </Badge>
                      )}
                      
                      {contador.bio && (
                        <p className="text-muted-foreground text-sm line-clamp-3">
                          {contador.bio}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <span className="text-2xl font-bold text-foreground">
                            {formatCurrency(contador.hourly_rate_cents)}
                          </span>
                          <span className="text-muted-foreground text-sm">/sessão</span>
                        </div>
                        <Button asChild>
                          <Link to="/auth">
                            Contratar
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA for Contadores */}
        <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto overflow-hidden">
              <div className="md:flex">
                <div className="md:w-2/3 p-8">
                  <Badge className="mb-4 bg-success/20 text-success border-success/30">
                    <Briefcase className="w-3 h-3 mr-1" />
                    Oportunidade para Contadores
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    É Contador? Cadastre-se e Amplie sua Base de Clientes
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Junte-se à nossa plataforma e conecte-se com empresas e 
                    autônomos que precisam de orientação especializada sobre 
                    a Reforma Tributária. Receba pagamentos de forma segura e 
                    construa sua reputação.
                  </p>
                  <ul className="space-y-2 mb-6 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" />
                      Receba avaliações e construa sua reputação
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      Pagamentos seguros via Stripe
                    </li>
                    <li className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      Chat integrado para comunicação com clientes
                    </li>
                  </ul>
                  <Button size="lg" asChild>
                    <Link to="/contador-onboarding">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Cadastrar como Contador
                    </Link>
                  </Button>
                </div>
                <div className="md:w-1/3 bg-gradient-to-br from-primary to-primary/80 p-8 flex flex-col items-center justify-center text-center text-primary-foreground">
                  <Users className="w-16 h-16 mb-4 opacity-80" />
                  <div className="text-4xl font-bold mb-2">100%</div>
                  <div className="text-sm opacity-80">Gratuito para Cadastro</div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold text-foreground mb-1">Resposta Rápida</h3>
                    <p className="text-sm text-muted-foreground">
                      Contadores respondem em até 24 horas
                    </p>
                  </div>
                  <div>
                    <Star className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-foreground mb-1">Profissionais Verificados</h3>
                    <p className="text-sm text-muted-foreground">
                      Todos com registro CRC ativo
                    </p>
                  </div>
                  <div>
                    <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold text-foreground mb-1">Suporte Completo</h3>
                    <p className="text-sm text-muted-foreground">
                      Tire todas as suas dúvidas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      </div>
    </PublicLayout>
  );
};

export default ContadoresPublic;
