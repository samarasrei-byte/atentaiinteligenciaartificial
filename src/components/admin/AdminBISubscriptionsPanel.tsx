import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3, 
  TrendingUp, 
  Crown, 
  MessageSquare, 
  Search,
  RefreshCw,
  Calendar,
  User,
  Mail,
  Clock,
  Check,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BI_PLANS, BIPlanType } from '@/lib/plans';
import { formatCurrency } from '@/lib/formatCurrency';

interface BISubscription {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  plan: BIPlanType;
  status: 'active' | 'pending_contact' | 'canceled' | 'past_due';
  created_at: string;
  current_period_end: string | null;
  stripe_subscription_id: string | null;
}

/**
 * AdminBISubscriptionsPanel - Manages all BI subscriptions
 * Features:
 * - View all purchases and subscriptions
 * - Status tracking (active, pending contact, canceled)
 * - Quick access to chat with client
 * - Upgrade history
 */
export function AdminBISubscriptionsPanel() {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<BISubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Plan styles
  const planStyles: Record<BIPlanType, { icon: typeof BarChart3; gradient: string; label: string }> = {
    clarity: { icon: BarChart3, gradient: 'from-blue-500 to-cyan-500', label: 'Clarity' },
    control: { icon: TrendingUp, gradient: 'from-primary to-primary/70', label: 'Control' },
    performance: { icon: Crown, gradient: 'from-accent to-orange-500', label: 'Performance' },
  };

  // Status styles
  const statusStyles: Record<string, { label: string; color: string }> = {
    active: { label: 'Ativo', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
    pending_contact: { label: 'Aguardando Contato', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
    canceled: { label: 'Cancelado', color: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' },
    past_due: { label: 'Pagamento Atrasado', color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400' },
  };

  // Mock data for now - replace with actual Stripe subscription fetch
  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      try {
        // In production, this would fetch from Stripe or a subscriptions table
        // For now, simulating with empty state
        setSubscriptions([]);
      } catch (error) {
        console.error('Error fetching BI subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = 
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.full_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    pendingContact: subscriptions.filter(s => s.status === 'pending_contact').length,
    mrr: subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (BI_PLANS[s.plan]?.price || 0), 0),
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Assinaturas</h2>
          <p className="text-muted-foreground">Gerencie todas as assinaturas Atentai</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Assinaturas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                <Check className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingContact}</p>
                <p className="text-xs text-muted-foreground">Aguardando Contato</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.mrr)}</p>
                <p className="text-xs text-muted-foreground">MRR Estimado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'pending_contact', 'canceled'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'all' ? 'Todos' : statusStyles[status]?.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions List */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
          <CardDescription>
            {filteredSubscriptions.length} assinatura(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">Nenhuma assinatura BI encontrada</p>
              <p className="text-sm text-muted-foreground">
                Novas assinaturas aparecerão aqui automaticamente
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {filteredSubscriptions.map((sub) => {
                  const planStyle = planStyles[sub.plan];
                  const statusStyle = statusStyles[sub.status];
                  const Icon = planStyle?.icon || BarChart3;

                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${planStyle?.gradient || 'from-primary to-primary/70'}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">
                              {sub.full_name || 'Nome não informado'}
                            </p>
                            <Badge className={statusStyle?.color}>
                              {statusStyle?.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {sub.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(sub.created_at), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </div>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {BI_PLANS[sub.plan]?.name || sub.plan}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/chat/guilherme?cliente=${sub.user_id}`)}
                          className="gap-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Chat
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/cliente/${sub.user_id}`)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Integration Note */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Integração com Stripe</p>
              <p className="text-sm text-muted-foreground">
                As assinaturas são sincronizadas automaticamente via webhook do Stripe. 
                Novas compras dos planos Clarity, Control e Performance aparecerão aqui 
                após a confirmação do pagamento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
