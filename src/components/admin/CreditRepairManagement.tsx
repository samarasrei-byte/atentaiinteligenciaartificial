import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CreditRepairChat } from '@/components/limpa-nome/CreditRepairChat';
import { CreditRepairMetrics } from './CreditRepairMetrics';
import { PartnerUserManagement } from './PartnerUserManagement';
import { PartnerWithdrawalPanel } from './PartnerWithdrawalPanel';
import { PartnerFinancialDashboard } from './PartnerFinancialDashboard';
import {
  Search,
  Loader2,
  Shield,
  MessageCircle,
  User,
  Phone,
  Mail,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  CreditCard,
  RefreshCw,
  BarChart3,
  Users,
  Wallet,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CreditRepairRequest {
  id: string;
  user_id: string;
  full_name: string;
  cpf: string | null;
  email: string | null;
  phone: string | null;
  debt_amount_cents: number;
  debt_description: string | null;
  bureaus_selected: string[] | null;
  creditors: string[] | null;
  status: string;
  payment_status: string;
  service_price_cents: number;
  final_price_cents: number;
  discount_applied: boolean | null;
  contador_id: string | null;
  contador_notes: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface ContadorProfile {
  user_id: string;
  full_name: string | null;
  specialty: string | null;
  available: boolean | null;
}

export function CreditRepairManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<CreditRepairRequest[]>([]);
  const [contadores, setContadores] = useState<ContadorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<CreditRepairRequest | null>(null);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [contadorNotes, setContadorNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchContadores();

    const channel = supabase
      .channel('admin-credit-repair')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'credit_repair_requests' }, () => fetchRequests())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('credit_repair_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requests:', error);
      toast({ title: 'Erro ao carregar solicitações', variant: 'destructive' });
    } else {
      setRequests(data || []);
    }
    setIsLoading(false);
  };

  const fetchContadores = async () => {
    const { data: contadorData } = await supabase
      .from('contador_profiles')
      .select('user_id, specialty, available');

    if (contadorData) {
      const userIds = contadorData.map(c => c.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      const merged = contadorData.map(c => ({
        ...c,
        full_name: profilesData?.find(p => p.user_id === c.user_id)?.full_name || 'Sem nome'
      }));
      setContadores(merged);
    }
  };

  const updateRequest = async (requestId: string, updates: Partial<CreditRepairRequest>) => {
    setIsUpdating(true);
    const { error } = await supabase
      .from('credit_repair_requests')
      .update(updates)
      .eq('id', requestId);

    if (error) {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Atualizado com sucesso!' });
      fetchRequests();
    }
    setIsUpdating(false);
  };

  const handleAssignContador = async (requestId: string, contadorId: string) => {
    await updateRequest(requestId, { 
      contador_id: contadorId,
      status: 'in_progress' 
    });
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    const updates: Partial<CreditRepairRequest> = { status: newStatus };
    if (newStatus === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    await updateRequest(requestId, updates);
  };

  const handleSaveNotes = async () => {
    if (!selectedRequest) return;
    await updateRequest(selectedRequest.id, { contador_notes: contadorNotes });
    setShowDetailsDialog(false);
  };

  const formatCurrency = (cents: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { class: string; icon: any; label: string }> = {
      pending: { class: 'bg-accent/10 text-accent', icon: Clock, label: 'Pendente' },
      in_progress: { class: 'bg-info/10 text-info', icon: AlertCircle, label: 'Em Andamento' },
      negotiating: { class: 'bg-primary/10 text-primary', icon: MessageCircle, label: 'Negociando' },
      completed: { class: 'bg-success/10 text-success', icon: CheckCircle, label: 'Concluído' },
      cancelled: { class: 'bg-destructive/10 text-destructive', icon: XCircle, label: 'Cancelado' },
    };
    const cfg = config[status] || config.pending;
    const Icon = cfg.icon;
    return <Badge variant="outline" className={cfg.class}><Icon className="h-3 w-3 mr-1" />{cfg.label}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    if (status === 'paid') return <Badge className="bg-success text-success-foreground">Pago</Badge>;
    if (status === 'pending') return <Badge variant="outline" className="text-accent">Aguardando</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cpf?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in_progress' || r.status === 'negotiating').length,
    completed: requests.filter(r => r.status === 'completed').length,
    totalRevenue: requests.filter(r => r.payment_status === 'paid').reduce((sum, r) => sum + r.final_price_cents, 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="requests" className="space-y-6">
      <TabsList className="grid w-full max-w-3xl grid-cols-5">
        <TabsTrigger value="requests" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Solicitações
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Usuários
        </TabsTrigger>
        <TabsTrigger value="withdrawals" className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Saques
        </TabsTrigger>
        <TabsTrigger value="financial" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Financeiro
        </TabsTrigger>
        <TabsTrigger value="metrics" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Métricas
        </TabsTrigger>
      </TabsList>

      <TabsContent value="users">
        <PartnerUserManagement />
      </TabsContent>

      <TabsContent value="withdrawals">
        <PartnerWithdrawalPanel />
      </TabsContent>

      <TabsContent value="financial">
        <PartnerFinancialDashboard />
      </TabsContent>

      <TabsContent value="metrics">
        <CreditRepairMetrics />
      </TabsContent>

      <TabsContent value="requests" className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <AlertCircle className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">Em Andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">Receita</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-success" />
                Gestão Limpa Nome
              </CardTitle>
              <CardDescription>{filteredRequests.length} solicitações</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por nome, email, CPF..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-10" 
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="negotiating">Negociando</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchRequests}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma solicitação encontrada
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div key={request.id} className="p-4 bg-muted/30 rounded-lg border space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <p className="font-semibold">{request.full_name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {request.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />{request.email}
                            </span>
                          )}
                          {request.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />{request.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.status)}
                      {getPaymentBadge(request.payment_status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Dívida Total</p>
                      <p className="font-semibold text-destructive">{formatCurrency(request.debt_amount_cents)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Serviço</p>
                      <p className="font-semibold text-success">{formatCurrency(request.final_price_cents)}</p>
                      {request.discount_applied && <Badge variant="outline" className="text-xs">15% OFF</Badge>}
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bureaus</p>
                      <div className="flex flex-wrap gap-1">
                        {request.bureaus_selected?.map(b => (
                          <Badge key={b} variant="outline" className="text-xs uppercase">{b}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Data</p>
                      <p className="font-medium">{format(new Date(request.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-3">
                      <Select 
                        value={request.contador_id || ''} 
                        onValueChange={(v) => handleAssignContador(request.id, v)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Atribuir especialista" />
                        </SelectTrigger>
                        <SelectContent>
                          {contadores.map(c => (
                            <SelectItem key={c.user_id} value={c.user_id}>
                              {c.full_name} {c.specialty && `(${c.specialty})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select 
                        value={request.status} 
                        onValueChange={(v) => handleStatusChange(request.id, v)}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="in_progress">Em Andamento</SelectItem>
                          <SelectItem value="negotiating">Negociando</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setContadorNotes(request.contador_notes || '');
                          setShowDetailsDialog(true);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Detalhes
                      </Button>
                      {request.contador_id && (
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowChatDialog(true);
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Chat
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Dialog */}
      <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
        <DialogContent className="max-w-2xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Chat - {selectedRequest?.full_name}</DialogTitle>
            <DialogDescription>Converse com o cliente sobre a limpeza de nome</DialogDescription>
          </DialogHeader>
          {selectedRequest && user && (
            <div className="flex-1 h-[calc(100%-80px)]">
              <CreditRepairChat
                requestId={selectedRequest.id}
                otherUserId={selectedRequest.user_id}
                otherUserName={selectedRequest.full_name}
                isAdmin={true}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
            <DialogDescription>{selectedRequest?.full_name}</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">CPF</p>
                  <p className="font-medium">{selectedRequest.cpf || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Telefone</p>
                  <p className="font-medium">{selectedRequest.phone || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedRequest.email || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Descrição da Dívida</p>
                  <p className="font-medium">{selectedRequest.debt_description || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Credores</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedRequest.creditors?.map((c, i) => (
                      <Badge key={i} variant="outline">{c}</Badge>
                    )) || '-'}
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-muted-foreground mb-2">Notas do Especialista</p>
                <Textarea
                  value={contadorNotes}
                  onChange={(e) => setContadorNotes(e.target.value)}
                  placeholder="Adicione notas sobre o andamento..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveNotes} disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Salvar Notas
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </TabsContent>
    </Tabs>
  );
}
