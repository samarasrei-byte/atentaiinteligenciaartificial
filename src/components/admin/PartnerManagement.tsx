import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Loader2, Building, Plus, Users, Mail, Phone, MapPin,
  CheckCircle, XCircle, Clock, Percent, DollarSign, RefreshCw,
  Edit, Trash2, UserPlus, Eye, Send
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PartnerInviteButton } from './PartnerInviteButton';

interface Partner {
  id: string;
  company_name: string;
  trade_name: string | null;
  cnpj: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  contact_person: string;
  commission_percent: number;
  status: string;
  is_active: boolean;
  total_requests: number;
  total_revenue_cents: number;
  notes: string | null;
  created_at: string;
}

interface PartnerFormData {
  company_name: string;
  trade_name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  contact_person: string;
  commission_percent: number;
  notes: string;
}

const initialFormData: PartnerFormData = {
  company_name: '',
  trade_name: '',
  cnpj: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  contact_person: '',
  commission_percent: 15,
  notes: '',
};

export function PartnerManagement() {
  const { toast } = useToast();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState<PartnerFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchPartners();

    const channel = supabase
      .channel('admin-partners')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'credit_repair_partners' }, () => fetchPartners())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchPartners = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('credit_repair_partners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching partners:', error);
      toast({ title: 'Erro ao carregar parceiros', variant: 'destructive' });
    } else {
      setPartners(data || []);
    }
    setIsLoading(false);
  };

  const handleCreatePartner = async () => {
    if (!formData.company_name || !formData.email || !formData.contact_person) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase
      .from('credit_repair_partners')
      .insert([{
        company_name: formData.company_name,
        trade_name: formData.trade_name || null,
        cnpj: formData.cnpj || null,
        email: formData.email,
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        contact_person: formData.contact_person,
        commission_percent: formData.commission_percent,
        notes: formData.notes || null,
        status: 'pending',
        is_active: false,
      }]);

    if (error) {
      toast({ title: 'Erro ao criar parceiro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Parceiro criado com sucesso!' });
      setShowCreateDialog(false);
      setFormData(initialFormData);
      fetchPartners();
    }
    setIsSubmitting(false);
  };

  const handleUpdatePartner = async () => {
    if (!selectedPartner) return;

    setIsSubmitting(true);
    const { error } = await supabase
      .from('credit_repair_partners')
      .update({
        company_name: formData.company_name,
        trade_name: formData.trade_name || null,
        cnpj: formData.cnpj || null,
        email: formData.email,
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        contact_person: formData.contact_person,
        commission_percent: formData.commission_percent,
        notes: formData.notes || null,
      })
      .eq('id', selectedPartner.id);

    if (error) {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Parceiro atualizado!' });
      setShowDetailsDialog(false);
      setIsEditing(false);
      fetchPartners();
    }
    setIsSubmitting(false);
  };

  const handleToggleActive = async (partner: Partner) => {
    const { error } = await supabase
      .from('credit_repair_partners')
      .update({ 
        is_active: !partner.is_active,
        status: !partner.is_active ? 'active' : 'inactive'
      })
      .eq('id', partner.id);

    if (error) {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
    } else {
      toast({ title: partner.is_active ? 'Parceiro desativado' : 'Parceiro ativado!' });
      fetchPartners();
    }
  };

  const handleDeletePartner = async (id: string) => {
    const { error } = await supabase
      .from('credit_repair_partners')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Parceiro excluído!' });
      fetchPartners();
    }
  };

  const openDetails = (partner: Partner) => {
    setSelectedPartner(partner);
    setFormData({
      company_name: partner.company_name,
      trade_name: partner.trade_name || '',
      cnpj: partner.cnpj || '',
      email: partner.email,
      phone: partner.phone || '',
      address: partner.address || '',
      city: partner.city || '',
      state: partner.state || '',
      contact_person: partner.contact_person,
      commission_percent: partner.commission_percent,
      notes: partner.notes || '',
    });
    setShowDetailsDialog(true);
    setIsEditing(false);
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (isActive) return <Badge className="bg-success/10 text-success border-success/20"><CheckCircle className="h-3 w-3 mr-1" />Ativo</Badge>;
    if (status === 'pending') return <Badge className="bg-accent/10 text-accent border-accent/20"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
    return <Badge className="bg-muted/50 text-muted-foreground border-muted"><XCircle className="h-3 w-3 mr-1" />Inativo</Badge>;
  };

  const filteredPartners = partners.filter(p => {
    const matchesSearch = 
      p.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cnpj?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && p.is_active) ||
      (statusFilter === 'pending' && p.status === 'pending') ||
      (statusFilter === 'inactive' && !p.is_active && p.status !== 'pending');
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: partners.length,
    active: partners.filter(p => p.is_active).length,
    pending: partners.filter(p => p.status === 'pending').length,
    totalRevenue: partners.reduce((sum, p) => sum + p.total_revenue_cents, 0),
    totalRequests: partners.reduce((sum, p) => sum + p.total_requests, 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
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
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Users className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalRequests}</p>
                <p className="text-xs text-muted-foreground">Solicitações</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
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

      {/* Main Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-success" />
                Empresas Parceiras
              </CardTitle>
              <CardDescription>{filteredPartners.length} parceiros</CardDescription>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchPartners}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button onClick={() => { setFormData(initialFormData); setShowCreateDialog(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Parceiro
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {filteredPartners.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum parceiro encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPartners.map((partner, index) => (
                  <motion.div
                    key={partner.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-muted/30 rounded-xl border border-border hover:border-primary/30 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Building className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{partner.company_name}</h3>
                            {getStatusBadge(partner.status, partner.is_active)}
                          </div>
                          {partner.trade_name && (
                            <p className="text-sm text-muted-foreground">{partner.trade_name}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />{partner.email}
                            </span>
                            {partner.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />{partner.phone}
                              </span>
                            )}
                            {partner.city && partner.state && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />{partner.city}, {partner.state}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-lg font-bold text-primary">{partner.commission_percent}%</p>
                            <p className="text-xs text-muted-foreground">Comissão</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">{partner.total_requests}</p>
                            <p className="text-xs text-muted-foreground">Pedidos</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-success">{formatCurrency(partner.total_revenue_cents)}</p>
                            <p className="text-xs text-muted-foreground">Receita</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <PartnerInviteButton 
                            partnerId={partner.id} 
                            partnerName={partner.trade_name || partner.company_name} 
                          />
                          <Button variant="outline" size="sm" onClick={() => openDetails(partner)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Detalhes
                          </Button>
                          <Button
                            variant={partner.is_active ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleToggleActive(partner)}
                          >
                            {partner.is_active ? 'Desativar' : 'Ativar'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Nova Empresa Parceira
            </DialogTitle>
            <DialogDescription>
              Cadastre uma nova empresa parceira para o serviço Limpa Nome
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome da Empresa *</Label>
              <Input
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Razão Social"
              />
            </div>
            <div className="space-y-2">
              <Label>Nome Fantasia</Label>
              <Input
                value={formData.trade_name}
                onChange={(e) => setFormData({ ...formData, trade_name: e.target.value })}
                placeholder="Nome Fantasia"
              />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contato@empresa.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label>Pessoa de Contato *</Label>
              <Input
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                placeholder="Nome do responsável"
              />
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Cidade"
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="UF"
                maxLength={2}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Endereço</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Endereço completo"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Percent className="h-4 w-4" /> Comissão (%)
              </Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={formData.commission_percent}
                onChange={(e) => setFormData({ ...formData, commission_percent: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas internas sobre o parceiro"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreatePartner} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Criar Parceiro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details/Edit Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={(open) => { setShowDetailsDialog(open); if (!open) setIsEditing(false); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                {selectedPartner?.company_name}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                <Edit className="h-4 w-4 mr-1" />
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
            </DialogTitle>
          </DialogHeader>

          {selectedPartner && (
            <div className="space-y-4">
              {!isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Nome Fantasia</Label>
                      <p className="font-medium">{selectedPartner.trade_name || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">CNPJ</Label>
                      <p className="font-medium">{selectedPartner.cnpj || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">E-mail</Label>
                      <p className="font-medium">{selectedPartner.email}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Telefone</Label>
                      <p className="font-medium">{selectedPartner.phone || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Contato</Label>
                      <p className="font-medium">{selectedPartner.contact_person}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Comissão</Label>
                      <p className="font-medium text-primary">{selectedPartner.commission_percent}%</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Localização</Label>
                      <p className="font-medium">{selectedPartner.city && selectedPartner.state ? `${selectedPartner.city}, ${selectedPartner.state}` : '-'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Cadastrado em</Label>
                      <p className="font-medium">{format(new Date(selectedPartner.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
                    </div>
                  </div>
                  {selectedPartner.notes && (
                    <div>
                      <Label className="text-muted-foreground">Observações</Label>
                      <p className="font-medium whitespace-pre-wrap">{selectedPartner.notes}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{selectedPartner.total_requests}</p>
                      <p className="text-sm text-muted-foreground">Solicitações</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-success">{formatCurrency(selectedPartner.total_revenue_cents)}</p>
                      <p className="text-sm text-muted-foreground">Receita Total</p>
                    </div>
                    <div className="text-center">
                      {getStatusBadge(selectedPartner.status, selectedPartner.is_active)}
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome da Empresa</Label>
                    <Input
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome Fantasia</Label>
                    <Input
                      value={formData.trade_name}
                      onChange={(e) => setFormData({ ...formData, trade_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CNPJ</Label>
                    <Input
                      value={formData.cnpj}
                      onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contato</Label>
                    <Input
                      value={formData.contact_person}
                      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Comissão (%)</Label>
                    <Input
                      type="number"
                      value={formData.commission_percent}
                      onChange={(e) => setFormData({ ...formData, commission_percent: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Observações</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                <Button onClick={handleUpdatePartner} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Salvar Alterações
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>Fechar</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
