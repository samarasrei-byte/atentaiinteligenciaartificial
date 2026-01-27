import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  Users,
  Star,
  Calendar,
  MessageSquare,
  Loader2,
  Clock
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

export function EmbeddedContadoresList() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [contadores, setContadores] = useState<ContadorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchContadores();
    }
  }, [user]);

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

  const handleSchedule = async (contador: ContadorProfile) => {
    try {
      const { error } = await supabase.from('consultations').insert({
        user_id: user!.id,
        contador_id: contador.user_id,
        price_cents: contador.hourly_rate_cents,
        platform_fee_cents: Math.round(contador.hourly_rate_cents * 0.1),
        status: 'pending',
      });

      if (error) throw error;

      toast({
        title: 'Consulta solicitada!',
        description: 'O contador entrará em contato para agendar.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao solicitar consulta',
      });
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Contadores Disponíveis</h2>
        <p className="text-muted-foreground">Encontre um contador especializado na Reforma Tributária</p>
      </div>

      {contadores.length === 0 ? (
        <Card className="bg-card border-border text-center">
          <CardContent className="py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum contador disponível
            </h3>
            <p className="text-muted-foreground mb-4">
              No momento não há contadores cadastrados. Volte mais tarde!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contadores.map((contador) => (
              <Card key={contador.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={contador.profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {contador.profile?.full_name?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base text-foreground truncate">
                        {contador.profile?.full_name || 'Contador'}
                      </CardTitle>
                      <CardDescription className="text-xs truncate">
                        {contador.specialty || 'Especialista em Reforma Tributária'}
                      </CardDescription>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span className="text-amber-500 font-medium text-xs">
                          {Number(contador.rating).toFixed(1)}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          ({contador.total_consultations})
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contador.crc_number && (
                    <Badge variant="outline" className="border-primary/50 text-primary text-xs">
                      CRC: {contador.crc_number}
                    </Badge>
                  )}
                  
                  {contador.bio && (
                    <p className="text-muted-foreground text-xs line-clamp-2">
                      {contador.bio}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div>
                      <span className="text-lg font-bold text-foreground">
                        {formatCurrency(contador.hourly_rate_cents)}
                      </span>
                      <span className="text-muted-foreground text-xs">/sessão</span>
                    </div>
                    <Button
                      onClick={() => handleSchedule(contador)}
                      size="sm"
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Agendar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-card border-border">
            <CardContent className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <Clock className="h-6 w-6 text-primary mb-1" />
                  <h3 className="font-medium text-foreground text-sm">Resposta Rápida</h3>
                  <p className="text-xs text-muted-foreground">Em até 24 horas</p>
                </div>
                <div className="flex flex-col items-center">
                  <Star className="h-6 w-6 text-amber-500 mb-1" />
                  <h3 className="font-medium text-foreground text-sm">Verificados</h3>
                  <p className="text-xs text-muted-foreground">CRC ativo</p>
                </div>
                <div className="flex flex-col items-center">
                  <MessageSquare className="h-6 w-6 text-info mb-1" />
                  <h3 className="font-medium text-foreground text-sm">Suporte</h3>
                  <p className="text-xs text-muted-foreground">Chat completo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}