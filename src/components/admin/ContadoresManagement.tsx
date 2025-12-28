import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Loader2, 
  Star, 
  CheckCircle, 
  Clock, 
  XCircle,
  User,
  Mail,
  Phone,
  Award,
  DollarSign,
  Calendar,
} from 'lucide-react';

interface ContadorProfile {
  id: string;
  user_id: string;
  crc_number: string | null;
  specialty: string | null;
  bio: string | null;
  hourly_rate_cents: number | null;
  rating: number | null;
  total_consultations: number | null;
  available: boolean | null;
  stripe_account_status: string | null;
  stripe_onboarding_completed: boolean | null;
  created_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  };
}

export const ContadoresManagement = () => {
  const [contadores, setContadores] = useState<ContadorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchContadores();
  }, []);

  const fetchContadores = async () => {
    try {
      setIsLoading(true);
      
      // Fetch contador profiles
      const { data: contadorData, error } = await supabase
        .from('contador_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch associated profiles
      const userIds = contadorData?.map(c => c.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, phone')
        .in('user_id', userIds);

      // Merge data
      const merged = contadorData?.map(contador => ({
        ...contador,
        profile: profilesData?.find(p => p.user_id === contador.user_id) || undefined
      })) || [];

      setContadores(merged);
    } catch (error: any) {
      console.error('Error fetching contadores:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao carregar contadores',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (available: boolean | null, stripeStatus: string | null) => {
    if (stripeStatus === 'active' && available) {
      return <Badge className="bg-success/10 text-success border-success/20"><CheckCircle className="h-3 w-3 mr-1" />Ativo</Badge>;
    }
    if (stripeStatus === 'pending') {
      return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
    }
    if (!available) {
      return <Badge className="bg-muted text-muted-foreground"><XCircle className="h-3 w-3 mr-1" />Indisponível</Badge>;
    }
    return <Badge className="bg-muted text-muted-foreground">Configurando</Badge>;
  };

  const formatCurrency = (cents: number | null) => {
    if (!cents) return 'Não definido';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const filteredContadores = contadores.filter(c => 
    c.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.crc_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border shadow-soft">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Gestão de Contadores
              </CardTitle>
              <CardDescription>
                {contadores.length} contadores cadastrados na plataforma
              </CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar contador..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-10" 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredContadores.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum contador encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContadores.map((contador) => (
                <div 
                  key={contador.id} 
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-muted/30 rounded-xl border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">
                        {contador.profile?.full_name?.[0]?.toUpperCase() || 'C'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">
                          {contador.profile?.full_name || 'Contador'}
                        </p>
                        {getStatusBadge(contador.available, contador.stripe_account_status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {contador.profile?.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {contador.profile.email}
                          </span>
                        )}
                        {contador.crc_number && (
                          <span className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            CRC: {contador.crc_number}
                          </span>
                        )}
                      </div>
                      {contador.specialty && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {contador.specialty.split(',').map((spec, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {spec.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatCurrency(contador.hourly_rate_cents)}/hora</span>
                    </div>
                    {contador.rating && (
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span>{contador.rating.toFixed(1)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{contador.total_consultations || 0} consultas</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{contadores.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {contadores.filter(c => c.available && c.stripe_account_status === 'active').length}
                </p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {contadores.filter(c => c.stripe_account_status === 'pending' || !c.stripe_onboarding_completed).length}
                </p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Calendar className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {contadores.reduce((sum, c) => sum + (c.total_consultations || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Consultas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
