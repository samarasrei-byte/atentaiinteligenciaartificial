import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Users, TrendingUp, Wallet, Search, RefreshCw, Eye, Check, X,
  Download, Filter, ChevronRight, Phone, Mail, Building, Calendar,
  DollarSign, Loader2, CheckCircle2, XCircle, Clock, User
} from 'lucide-react';

interface Affiliate {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string | null;
  state: string | null;
  company_name: string | null;
  affiliate_code: string;
  is_active: boolean;
  created_at: string;
}

interface Lead {
  id: string;
  affiliate_id: string;
  full_name: string;
  email: string;
  phone: string;
  company_name: string | null;
  status: string;
  potential_value_cents: number | null;
  created_at: string;
  affiliate?: Affiliate;
}

interface Commission {
  id: string;
  affiliate_id: string;
  total_value_cents: number;
  affiliate_value_cents: number;
  platform_fee_cents: number;
  status: string;
  created_at: string;
  affiliate?: Affiliate;
}

interface Withdrawal {
  id: string;
  affiliate_id: string;
  amount_cents: number;
  platform_fee_cents: number;
  net_amount_cents: number;
  pix_key: string;
  pix_key_type: string;
  status: string;
  created_at: string;
  affiliate?: Affiliate;
}

export function AffiliateManagement() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAffiliate, setSelectedAffiliate] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('affiliates');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch affiliates
      const { data: affiliatesData } = await supabase
        .from('affiliates')
        .select('*')
        .order('created_at', { ascending: false });
      setAffiliates(affiliatesData || []);

      // Fetch leads
      const { data: leadsData } = await supabase
        .from('affiliate_leads')
        .select('*')
        .order('created_at', { ascending: false });
      setLeads(leadsData || []);

      // Fetch commissions
      const { data: commissionsData } = await supabase
        .from('affiliate_commissions')
        .select('*')
        .order('created_at', { ascending: false });
      setCommissions(commissionsData || []);

      // Fetch withdrawals
      const { data: withdrawalsData } = await supabase
        .from('affiliate_withdrawals')
        .select('*')
        .order('created_at', { ascending: false });
      setWithdrawals(withdrawalsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const toggleAffiliateStatus = async (affiliateId: string, currentStatus: boolean) => {
    try {
      await supabase
        .from('affiliates')
        .update({ is_active: !currentStatus })
        .eq('id', affiliateId);
      
      toast.success(currentStatus ? 'Afiliado desativado' : 'Afiliado ativado');
      fetchData();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'converted') {
        updates.converted_at = new Date().toISOString();
      }
      
      await supabase
        .from('affiliate_leads')
        .update(updates)
        .eq('id', leadId);
      
      toast.success('Status atualizado');
      fetchData();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const processWithdrawal = async (withdrawalId: string, approve: boolean, reason?: string) => {
    try {
      const updates: any = {
        status: approve ? 'approved' : 'rejected',
        processed_at: new Date().toISOString()
      };
      if (!approve && reason) {
        updates.rejection_reason = reason;
      }

      await supabase
        .from('affiliate_withdrawals')
        .update(updates)
        .eq('id', withdrawalId);
      
      toast.success(approve ? 'Saque aprovado' : 'Saque rejeitado');
      fetchData();
    } catch (error) {
      toast.error('Erro ao processar saque');
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      new: { label: 'Novo', variant: 'default' },
      analyzing: { label: 'Em análise', variant: 'secondary' },
      converted: { label: 'Convertido', variant: 'default' },
      lost: { label: 'Perdido', variant: 'destructive' },
      pending: { label: 'Pendente', variant: 'secondary' },
      available: { label: 'Disponível', variant: 'default' },
      paid: { label: 'Pago', variant: 'outline' },
      approved: { label: 'Aprovado', variant: 'default' },
      rejected: { label: 'Rejeitado', variant: 'destructive' }
    };
    const config = configs[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getAffiliateName = (affiliateId: string) => {
    const affiliate = affiliates.find(a => a.id === affiliateId);
    return affiliate?.full_name || 'Desconhecido';
  };

  // Calculate metrics
  const totalAffiliates = affiliates.length;
  const activeAffiliates = affiliates.filter(a => a.is_active).length;
  const totalLeads = leads.length;
  const convertedLeads = leads.filter(l => l.status === 'converted').length;
  const totalCommissions = commissions.reduce((acc, c) => acc + c.total_value_cents, 0);
  const platformEarnings = commissions.reduce((acc, c) => acc + c.platform_fee_cents, 0);
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
  const pendingWithdrawalAmount = withdrawals.filter(w => w.status === 'pending').reduce((acc, w) => acc + w.amount_cents, 0);

  // Filter data
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAffiliate = selectedAffiliate === 'all' || lead.affiliate_id === selectedAffiliate;
    return matchesSearch && matchesAffiliate;
  });

  const filteredWithdrawals = withdrawals.filter(w => {
    const matchesAffiliate = selectedAffiliate === 'all' || w.affiliate_id === selectedAffiliate;
    return matchesAffiliate;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão de Afiliados</h2>
          <p className="text-muted-foreground">Gerencie afiliados, leads, comissões e saques</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalAffiliates}</div>
                <div className="text-sm text-muted-foreground">
                  Afiliados ({activeAffiliates} ativos)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalLeads}</div>
                <div className="text-sm text-muted-foreground">
                  Leads ({convertedLeads} convertidos)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formatCurrency(totalCommissions)}</div>
                <div className="text-sm text-muted-foreground">Total em comissões</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-950/30 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{pendingWithdrawals}</div>
                <div className="text-sm text-muted-foreground">
                  Saques pendentes ({formatCurrency(pendingWithdrawalAmount)})
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Earnings Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Receita da Plataforma (10% de retenção)</div>
              <div className="text-3xl font-bold text-primary">{formatCurrency(platformEarnings)}</div>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="affiliates">Afiliados</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="withdrawals">
            Saques
            {pendingWithdrawals > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                {pendingWithdrawals}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="commissions">Comissões</TabsTrigger>
        </TabsList>

        {/* Affiliates Tab */}
        <TabsContent value="affiliates" className="mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Afiliados</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      className="pl-9 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Afiliado</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Contato</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Localização</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Leads</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {affiliates
                      .filter(a => a.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((affiliate) => {
                        const affiliateLeads = leads.filter(l => l.affiliate_id === affiliate.id);
                        return (
                          <tr key={affiliate.id} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <div className="font-medium">{affiliate.full_name}</div>
                                  {affiliate.company_name && (
                                    <div className="text-sm text-muted-foreground">{affiliate.company_name}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-3 h-3" />
                                {affiliate.email}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {affiliate.phone}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm">
                              {affiliate.city && affiliate.state 
                                ? `${affiliate.city}, ${affiliate.state}` 
                                : '-'}
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-medium">{affiliateLeads.length}</div>
                              <div className="text-sm text-muted-foreground">
                                {affiliateLeads.filter(l => l.status === 'converted').length} convertidos
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant={affiliate.is_active ? 'default' : 'secondary'}>
                                {affiliate.is_active ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleAffiliateStatus(affiliate.id, affiliate.is_active)}
                                >
                                  {affiliate.is_active ? (
                                    <X className="w-4 h-4" />
                                  ) : (
                                    <Check className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Todos os Leads</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={selectedAffiliate} onValueChange={setSelectedAffiliate}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por afiliado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os afiliados</SelectItem>
                      {affiliates.map((affiliate) => (
                        <SelectItem key={affiliate.id} value={affiliate.id}>
                          {affiliate.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar lead..."
                      className="pl-9 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Lead</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Afiliado</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Data</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Valor Potencial</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium">{lead.full_name}</div>
                          <div className="text-sm text-muted-foreground">{lead.email}</div>
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {getAffiliateName(lead.affiliate_id)}
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {format(new Date(lead.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </td>
                        <td className="py-4 px-4 font-medium">
                          {lead.potential_value_cents ? formatCurrency(lead.potential_value_cents) : '-'}
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(lead.status)}
                        </td>
                        <td className="py-4 px-4">
                          <Select
                            value={lead.status}
                            onValueChange={(value) => updateLeadStatus(lead.id, value)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">Novo</SelectItem>
                              <SelectItem value="analyzing">Em análise</SelectItem>
                              <SelectItem value="converted">Convertido</SelectItem>
                              <SelectItem value="lost">Perdido</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLeads.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    Nenhum lead encontrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals" className="mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Solicitações de Saque</CardTitle>
              <CardDescription>Aprove ou rejeite solicitações de saque dos afiliados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {withdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className={`p-4 rounded-lg border ${
                      withdrawal.status === 'pending' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800' : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Wallet className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{getAffiliateName(withdrawal.affiliate_id)}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(withdrawal.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold">{formatCurrency(withdrawal.amount_cents)}</div>
                        <div className="text-sm text-muted-foreground">
                          Líquido: {formatCurrency(withdrawal.net_amount_cents)}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <div className="text-muted-foreground">PIX ({withdrawal.pix_key_type})</div>
                          <div className="font-mono">{withdrawal.pix_key}</div>
                        </div>

                        {getStatusBadge(withdrawal.status)}

                        {withdrawal.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => processWithdrawal(withdrawal.id, true)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => processWithdrawal(withdrawal.id, false, 'Rejeitado pelo admin')}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Rejeitar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {withdrawals.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    Nenhuma solicitação de saque
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commissions Tab */}
        <TabsContent value="commissions" className="mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Histórico de Comissões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Afiliado</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Data</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Valor Total</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Comissão Afiliado</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Taxa Plataforma</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((commission) => (
                      <tr key={commission.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4 font-medium">
                          {getAffiliateName(commission.affiliate_id)}
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {format(new Date(commission.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </td>
                        <td className="py-4 px-4">{formatCurrency(commission.total_value_cents)}</td>
                        <td className="py-4 px-4 text-green-600 font-medium">
                          {formatCurrency(commission.affiliate_value_cents)}
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {formatCurrency(commission.platform_fee_cents)}
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(commission.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {commissions.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    Nenhuma comissão registrada
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
