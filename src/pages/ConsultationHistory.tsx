import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Loader2, 
  Calendar, 
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Star,
  FileText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Consultation {
  id: string;
  status: string;
  price_cents: number;
  scheduled_at: string | null;
  completed_at: string | null;
  created_at: string;
  rating: number | null;
  notes: string | null;
  contador_id: string;
  user_id: string;
  profile?: {
    full_name: string | null;
  };
}

const ConsultationHistory = () => {
  const navigate = useNavigate();
  const { user, hasRole, loading: authLoading } = useAuth();
  
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const isContador = hasRole('contador');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const loadConsultations = async () => {
      setIsLoading(true);

      let query = supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false });

      if (isContador) {
        query = query.eq('contador_id', user.id);
      } else {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading consultations:', error);
        setIsLoading(false);
        return;
      }

      // Fetch profiles for each consultation
      const consultationsWithProfiles = await Promise.all(
        (data || []).map(async (consultation) => {
          const otherUserId = isContador ? consultation.user_id : consultation.contador_id;
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', otherUserId)
            .maybeSingle();
          
          return { ...consultation, profile };
        })
      );

      setConsultations(consultationsWithProfiles);
      setIsLoading(false);
    };

    loadConsultations();
  }, [user, isContador]);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { class: string; icon: any; label: string }> = {
      pending: { class: 'bg-accent/10 text-accent border-accent/20', icon: Clock, label: 'Pendente' },
      scheduled: { class: 'bg-info/10 text-info border-info/20', icon: Calendar, label: 'Agendada' },
      completed: { class: 'bg-success/10 text-success border-success/20', icon: CheckCircle, label: 'Concluída' },
      cancelled: { class: 'bg-destructive/10 text-destructive border-destructive/20', icon: AlertCircle, label: 'Cancelada' },
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    return (
      <Badge variant="outline" className={c.class}>
        <Icon className="h-3 w-3 mr-1" />
        {c.label}
      </Badge>
    );
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const filteredConsultations = consultations.filter(c => {
    // Status filter
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    
    // Search filter
    if (searchTerm && !c.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const createdDate = new Date(c.created_at);
      const now = new Date();
      
      if (dateFilter === 'today') {
        if (createdDate.toDateString() !== now.toDateString()) return false;
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (createdDate < weekAgo) return false;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (createdDate < monthAgo) return false;
      }
    }
    
    return true;
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border px-4 lg:px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <img 
                src="/logo-atentai.png" 
                alt="AtentAI" 
                className="h-10 w-auto"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Histórico de Consultas</h1>
          <p className="text-muted-foreground">
            {isContador ? 'Todas as suas consultas com clientes' : 'Todas as suas consultas com contadores'}
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-card border-border">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="scheduled">Agendada</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center text-sm text-muted-foreground">
                {filteredConsultations.length} consulta(s) encontrada(s)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consultations List */}
        {filteredConsultations.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma consulta encontrada
              </h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou crie uma nova consulta.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredConsultations.map((consultation) => (
              <Card 
                key={consultation.id} 
                className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/chat/${consultation.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {consultation.profile?.full_name || (isContador ? 'Cliente' : 'Contador')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(consultation.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      {getStatusBadge(consultation.status)}
                      
                      <span className="font-semibold text-foreground">
                        {formatCurrency(consultation.price_cents)}
                      </span>
                      
                      {consultation.rating && (
                        <div className="flex items-center gap-1 text-accent">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm font-medium">{consultation.rating}</span>
                        </div>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Abrir Chat
                      </Button>
                    </div>
                  </div>
                  
                  {consultation.notes && (
                    <p className="mt-3 text-sm text-muted-foreground border-t border-border pt-3">
                      {consultation.notes.slice(0, 100)}{consultation.notes.length > 100 ? '...' : ''}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ConsultationHistory;
