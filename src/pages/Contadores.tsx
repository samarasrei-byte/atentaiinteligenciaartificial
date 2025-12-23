import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Users,
  Star,
  Calendar,
  MessageSquare,
  Loader2,
  Clock,
  CreditCard
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

const Contadores = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [contadores, setContadores] = useState<ContadorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchContadores();
    }
  }, [user]);

  const fetchContadores = async () => {
    try {
      const { data, error } = await supabase
        .from('contador_profiles')
        .select(`
          *,
          profile:profiles!contador_profiles_user_id_fkey(full_name, avatar_url)
        `)
        .eq('available', true);

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

  const handleScheduleWithPayment = async (contador: ContadorProfile) => {
    setProcessingPayment(contador.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-consultation-payment', {
        body: {
          contadorId: contador.user_id,
          priceCents: contador.hourly_rate_cents,
          contadorName: contador.profile?.full_name || 'Contador',
        },
      });

      if (error) throw error;

      if (data?.url) {
        toast({
          title: 'Redirecionando para pagamento',
          description: `Taxa de serviço: 10% (${formatCurrency(data.platformFee)})`,
        });
        window.open(data.url, '_blank');
      } else {
        throw new Error('URL de pagamento não recebida');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro no pagamento',
        description: error.message || 'Erro ao processar pagamento',
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold text-white">Contadores Disponíveis</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Encontre um Contador Especializado
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Nossos contadores são especializados na Reforma Tributária e podem ajudar 
            sua empresa a se preparar para as mudanças.
          </p>
        </div>

        {contadores.length === 0 ? (
          <Card className="max-w-md mx-auto bg-slate-800/50 border-slate-700 text-center">
            <CardContent className="pt-12 pb-12">
              <Users className="h-16 w-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhum contador disponível
              </h3>
              <p className="text-slate-400 mb-6">
                No momento não há contadores cadastrados. Volte mais tarde!
              </p>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contadores.map((contador) => (
              <Card key={contador.id} className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition-colors">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={contador.profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-blue-600 text-white text-xl">
                        {contador.profile?.full_name?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-white">
                        {contador.profile?.full_name || 'Contador'}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        {contador.specialty || 'Especialista em Reforma Tributária'}
                      </CardDescription>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="text-amber-400 font-medium">
                          {Number(contador.rating).toFixed(1)}
                        </span>
                        <span className="text-slate-500 text-sm">
                          ({contador.total_consultations} consultas)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contador.crc_number && (
                    <Badge variant="outline" className="border-blue-500 text-blue-400">
                      CRC: {contador.crc_number}
                    </Badge>
                  )}
                  
                  {contador.bio && (
                    <p className="text-slate-400 text-sm line-clamp-3">
                      {contador.bio}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <div>
                      <span className="text-2xl font-bold text-white">
                        {formatCurrency(contador.hourly_rate_cents)}
                      </span>
                      <span className="text-slate-400 text-sm">/sessão</span>
                    </div>
                    <Button
                      onClick={() => handleScheduleWithPayment(contador)}
                      disabled={processingPayment === contador.id}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    >
                      {processingPayment === contador.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Contratar
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-slate-500 text-center">
                    Taxa de serviço: 10% • Pagamento seguro via Stripe
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Section */}
        <Card className="mt-12 bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <Clock className="h-8 w-8 text-teal-400 mx-auto mb-2" />
                <h3 className="font-semibold text-white mb-1">Resposta Rápida</h3>
                <p className="text-sm text-slate-400">
                  Contadores respondem em até 24 horas
                </p>
              </div>
              <div>
                <Star className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                <h3 className="font-semibold text-white mb-1">Profissionais Verificados</h3>
                <p className="text-sm text-slate-400">
                  Todos com registro CRC ativo
                </p>
              </div>
              <div>
                <MessageSquare className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h3 className="font-semibold text-white mb-1">Suporte Completo</h3>
                <p className="text-sm text-slate-400">
                  Tire todas as suas dúvidas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Contadores;
