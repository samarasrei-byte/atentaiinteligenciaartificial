import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Users, TrendingUp, Wallet, Link as LinkIcon, QrCode, Copy, Check,
  Calendar, Phone, Mail, Building, ChevronRight, Download, RefreshCw,
  Shield, Brain, FileSearch, FileCheck, Calculator, AlertTriangle,
  Loader2, LogOut, User, Settings, Bell, MessageSquare, DollarSign,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, XCircle, Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Affiliate {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  company_name: string | null;
  affiliate_code: string;
  whatsapp_number: string | null;
  pix_key: string | null;
  pix_key_type: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company_name: string | null;
  status: string;
  potential_value_cents: number | null;
  created_at: string;
  service_id: string | null;
}

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  benefits: string[];
  commission_percent: number;
  icon: string;
  is_active: boolean;
}

interface Commission {
  id: string;
  total_value_cents: number;
  affiliate_value_cents: number;
  platform_fee_cents: number;
  status: string;
  created_at: string;
}

interface Withdrawal {
  id: string;
  amount_cents: number;
  platform_fee_cents: number;
  net_amount_cents: number;
  status: string;
  created_at: string;
}

const iconMap: Record<string, any> = {
  Shield, Brain, TrendingUp, FileSearch, FileCheck, Calculator, Wallet, Users, AlertTriangle, Building
};

export default function AffiliatePanel() {
  const { user, signOut } = useAuth();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activatedServices, setActivatedServices] = useState<string[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch affiliate profile
      const { data: affiliateData, error: affiliateError } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (affiliateError) throw affiliateError;
      setAffiliate(affiliateData);

      // Fetch leads
      const { data: leadsData } = await supabase
        .from('affiliate_leads')
        .select('*')
        .eq('affiliate_id', affiliateData.id)
        .order('created_at', { ascending: false });

      setLeads(leadsData || []);

      // Fetch services
      const { data: servicesData } = await supabase
        .from('affiliate_services')
        .select('*')
        .eq('is_active', true);

      setServices(servicesData || []);

      // Fetch activated services
      const { data: activationsData } = await supabase
        .from('affiliate_service_activations')
        .select('service_id')
        .eq('affiliate_id', affiliateData.id)
        .eq('is_enabled', true);

      setActivatedServices(activationsData?.map(a => a.service_id) || []);

      // Fetch commissions
      const { data: commissionsData } = await supabase
        .from('affiliate_commissions')
        .select('*')
        .eq('affiliate_id', affiliateData.id)
        .order('created_at', { ascending: false });

      setCommissions(commissionsData || []);

      // Fetch withdrawals
      const { data: withdrawalsData } = await supabase
        .from('affiliate_withdrawals')
        .select('*')
        .eq('affiliate_id', affiliateData.id)
        .order('created_at', { ascending: false });

      setWithdrawals(withdrawalsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!affiliate) return;
    const link = `${window.location.origin}/afiliado/${affiliate.affiliate_code}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleService = async (serviceId: string, enabled: boolean) => {
    if (!affiliate) return;

    try {
      if (enabled) {
        await supabase.from('affiliate_service_activations').insert({
          affiliate_id: affiliate.id,
          service_id: serviceId,
          is_enabled: true
        });
        setActivatedServices([...activatedServices, serviceId]);
      } else {
        await supabase.from('affiliate_service_activations')
          .delete()
          .eq('affiliate_id', affiliate.id)
          .eq('service_id', serviceId);
        setActivatedServices(activatedServices.filter(id => id !== serviceId));
      }
      toast.success(enabled ? 'Serviço ativado!' : 'Serviço desativado');
    } catch (error) {
      toast.error('Erro ao atualizar serviço');
    }
  };

  const requestWithdrawal = async () => {
    if (!affiliate || !withdrawalAmount) return;
    
    const amountCents = Math.round(parseFloat(withdrawalAmount.replace(',', '.')) * 100);
    
    if (amountCents > availableBalance) {
      toast.error('Saldo insuficiente');
      return;
    }

    if (!affiliate.pix_key || !affiliate.pix_key_type) {
      toast.error('Configure sua chave PIX no perfil');
      return;
    }

    setWithdrawalLoading(true);

    try {
      const platformFee = Math.round(amountCents * 0.10);
      const netAmount = amountCents - platformFee;

      await supabase.from('affiliate_withdrawals').insert({
        affiliate_id: affiliate.id,
        amount_cents: amountCents,
        platform_fee_cents: platformFee,
        net_amount_cents: netAmount,
        pix_key: affiliate.pix_key,
        pix_key_type: affiliate.pix_key_type
      });

      toast.success('Solicitação de saque enviada!');
      setWithdrawalDialogOpen(false);
      setWithdrawalAmount('');
      fetchData();
    } catch (error) {
      toast.error('Erro ao solicitar saque');
    } finally {
      setWithdrawalLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  // Calculate metrics
  const totalLeads = leads.length;
  const monthlyLeads = leads.filter(l => {
    const date = new Date(l.created_at);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;
  const conversions = leads.filter(l => l.status === 'converted').length;
  const pendingCommissions = commissions.filter(c => c.status === 'pending').reduce((acc, c) => acc + c.affiliate_value_cents, 0);
  const availableBalance = commissions.filter(c => c.status === 'available').reduce((acc, c) => acc + c.affiliate_value_cents, 0);
  const paidCommissions = commissions.filter(c => c.status === 'paid').reduce((acc, c) => acc + c.affiliate_value_cents, 0);
  const totalEarnings = commissions.reduce((acc, c) => acc + c.affiliate_value_cents, 0);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Perfil não encontrado</h2>
            <p className="text-muted-foreground mb-4">Você ainda não possui um perfil de afiliado.</p>
            <Button onClick={() => window.location.href = '/afiliado/cadastro'}>
              Criar Perfil de Afiliado
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">{affiliate.full_name}</h1>
              <p className="text-sm text-muted-foreground">Afiliado</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { title: 'Leads Totais', value: totalLeads, icon: Users, trend: '+12%' },
                { title: 'Leads do Mês', value: monthlyLeads, icon: Calendar, trend: '+8%' },
                { title: 'Conversões', value: conversions, icon: CheckCircle2, trend: '+15%' },
                { title: 'Comissões Pendentes', value: formatCurrency(pendingCommissions), icon: Clock }
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <stat.icon className="w-5 h-5 text-primary" />
                        </div>
                        {stat.trend && (
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            {stat.trend}
                          </Badge>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.title}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Balance Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-5 h-5 opacity-80" />
                    <span className="text-sm opacity-80">Disponível para Saque</span>
                  </div>
                  <div className="text-3xl font-bold">{formatCurrency(availableBalance)}</div>
                  <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="secondary" size="sm" className="mt-4 bg-white/20 hover:bg-white/30 border-0">
                        Solicitar Saque
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Solicitar Saque</DialogTitle>
                        <DialogDescription>
                          Uma taxa de 10% será retida pela plataforma
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="p-4 rounded-lg bg-muted">
                          <div className="text-sm text-muted-foreground">Saldo disponível</div>
                          <div className="text-2xl font-bold">{formatCurrency(availableBalance)}</div>
                        </div>
                        <div className="space-y-2">
                          <Label>Valor do saque</Label>
                          <Input
                            type="text"
                            placeholder="0,00"
                            value={withdrawalAmount}
                            onChange={(e) => setWithdrawalAmount(e.target.value)}
                          />
                        </div>
                        {withdrawalAmount && (
                          <div className="p-4 rounded-lg border space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Valor solicitado</span>
                              <span>{formatCurrency(parseFloat(withdrawalAmount.replace(',', '.')) * 100 || 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Taxa da plataforma (10%)</span>
                              <span className="text-destructive">-{formatCurrency(parseFloat(withdrawalAmount.replace(',', '.')) * 10 || 0)}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-semibold">
                              <span>Você receberá</span>
                              <span className="text-green-600">{formatCurrency(parseFloat(withdrawalAmount.replace(',', '.')) * 90 || 0)}</span>
                            </div>
                          </div>
                        )}
                        <Button 
                          onClick={requestWithdrawal} 
                          disabled={withdrawalLoading || !withdrawalAmount}
                          className="w-full"
                        >
                          {withdrawalLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Confirmar Saque
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-sm">Comissões Pagas</span>
                  </div>
                  <div className="text-3xl font-bold text-foreground">{formatCurrency(paidCommissions)}</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm">Ganho Total</span>
                  </div>
                  <div className="text-3xl font-bold text-foreground">{formatCurrency(totalEarnings)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Affiliate Link */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Seu Link Exclusivo</CardTitle>
                <CardDescription>Compartilhe este link para capturar leads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-center">
                  <div className="flex-1 p-3 rounded-lg bg-muted font-mono text-sm truncate">
                    {window.location.origin}/afiliado/{affiliate.affiliate_code}
                  </div>
                  <Button onClick={copyLink} variant="outline" className="shrink-0">
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </Button>
                  <Button variant="outline" className="shrink-0">
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Leads */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Leads Recentes</CardTitle>
                  <CardDescription>Últimos leads capturados</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('leads')}>
                  Ver todos <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads.slice(0, 5).map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{lead.full_name}</div>
                          <div className="text-sm text-muted-foreground">{lead.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {lead.potential_value_cents && (
                          <span className="text-sm font-medium">{formatCurrency(lead.potential_value_cents)}</span>
                        )}
                        {getStatusBadge(lead.status)}
                      </div>
                    </div>
                  ))}
                  {leads.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum lead capturado ainda. Compartilhe seu link!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Meus Leads</CardTitle>
                <CardDescription>Todos os leads capturados através do seu link</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nome</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Contato</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Data</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Valor Potencial</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => (
                        <tr key={lead.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-medium">{lead.full_name}</div>
                            {lead.company_name && (
                              <div className="text-sm text-muted-foreground">{lead.company_name}</div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-3 h-3" />
                              {lead.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm">
                            {format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </td>
                          <td className="py-4 px-4 font-medium">
                            {lead.potential_value_cents ? formatCurrency(lead.potential_value_cents) : '-'}
                          </td>
                          <td className="py-4 px-4">
                            {getStatusBadge(lead.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {leads.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      Nenhum lead capturado ainda
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const IconComponent = iconMap[service.icon] || Shield;
                const isActive = activatedServices.includes(service.id);

                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className={`border-0 shadow-sm transition-all ${isActive ? 'ring-2 ring-primary' : ''}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-primary" />
                          </div>
                          <Switch
                            checked={isActive}
                            onCheckedChange={(checked) => toggleService(service.id, checked)}
                          />
                        </div>

                        <h3 className="text-lg font-semibold text-foreground mb-2">{service.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{service.description}</p>

                        <div className="space-y-2 mb-4">
                          {service.benefits?.slice(0, 3).map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <span className="text-muted-foreground">{benefit}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Sua comissão</span>
                            <span className="text-lg font-bold text-primary">{service.commission_percent}%</span>
                          </div>
                        </div>

                        {isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-4"
                            onClick={() => {
                              const link = `${window.location.origin}/afiliado/${affiliate.affiliate_code}/${service.slug}`;
                              navigator.clipboard.writeText(link);
                              toast.success('Link do serviço copiado!');
                            }}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar Link do Serviço
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground mb-1">Total Acumulado</div>
                  <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-green-50 dark:bg-green-950/20">
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground mb-1">Disponível para Saque</div>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(availableBalance)}</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground mb-1">Pendente</div>
                  <div className="text-2xl font-bold">{formatCurrency(pendingCommissions)}</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground mb-1">Total Pago</div>
                  <div className="text-2xl font-bold">{formatCurrency(paidCommissions)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Commissions History */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Histórico de Comissões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commissions.map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div>
                        <div className="font-medium">Comissão</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(commission.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">+{formatCurrency(commission.affiliate_value_cents)}</div>
                        <div className="text-xs text-muted-foreground">
                          Taxa: {formatCurrency(commission.platform_fee_cents)}
                        </div>
                      </div>
                      {getStatusBadge(commission.status)}
                    </div>
                  ))}
                  {commissions.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      Nenhuma comissão ainda
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Withdrawals History */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Histórico de Saques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div>
                        <div className="font-medium">Saque via PIX</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(withdrawal.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(withdrawal.net_amount_cents)}</div>
                        <div className="text-xs text-muted-foreground">
                          Taxa: {formatCurrency(withdrawal.platform_fee_cents)}
                        </div>
                      </div>
                      {getStatusBadge(withdrawal.status)}
                    </div>
                  ))}
                  {withdrawals.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      Nenhum saque realizado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Meu Perfil</CardTitle>
                <CardDescription>Gerencie suas informações pessoais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    {affiliate.avatar_url ? (
                      <img src={affiliate.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{affiliate.full_name}</h3>
                    <p className="text-muted-foreground">{affiliate.email}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input value={affiliate.full_name} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input value={affiliate.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input value={affiliate.phone} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Cidade / Estado</Label>
                    <Input value={`${affiliate.city || ''} / ${affiliate.state || ''}`} disabled />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4">Dados para Pagamento</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Tipo de Chave PIX</Label>
                      <Select value={affiliate.pix_key_type || ''}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cpf">CPF</SelectItem>
                          <SelectItem value="cnpj">CNPJ</SelectItem>
                          <SelectItem value="email">E-mail</SelectItem>
                          <SelectItem value="phone">Telefone</SelectItem>
                          <SelectItem value="random">Chave Aleatória</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Chave PIX</Label>
                      <Input value={affiliate.pix_key || ''} placeholder="Sua chave PIX" />
                    </div>
                  </div>
                  <Button className="mt-4">Salvar Alterações</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
