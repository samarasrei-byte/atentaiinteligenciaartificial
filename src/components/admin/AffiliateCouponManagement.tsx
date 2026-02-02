import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Tag, Search, RefreshCw, Eye, Loader2, Users, TrendingUp,
  Calendar, Percent, DollarSign, CheckCircle2, XCircle, Clock,
  BarChart3, Gift, Filter, Download, User
} from 'lucide-react';

interface AffiliateCoupon {
  id: string;
  affiliate_id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  applicable_services: string[];
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  affiliate?: {
    full_name: string;
    email: string;
    affiliate_code: string;
  } | null;
}

interface CouponUse {
  id: string;
  user_email: string;
  service_type: string;
  original_amount_cents: number;
  discount_amount_cents: number;
  final_amount_cents: number;
  created_at: string;
  coupon?: {
    code: string;
    affiliate?: {
      full_name: string;
    };
  };
}

const SERVICE_OPTIONS = [
  { value: 'ir_simples', label: 'IR Simples' },
  { value: 'ir_completo', label: 'IR Completo' },
  { value: 'credit_repair_pf', label: 'Limpa Nome PF' },
  { value: 'credit_repair_pj', label: 'Limpa Nome PJ' },
  { value: 'certificate', label: 'Certidões' },
  { value: 'company_opening', label: 'Abertura de Empresa' },
  { value: 'fiscal_analysis', label: 'Análise Fiscal' },
];

export function AffiliateCouponManagement() {
  const [coupons, setCoupons] = useState<AffiliateCoupon[]>([]);
  const [couponUses, setCouponUses] = useState<CouponUse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedCoupon, setSelectedCoupon] = useState<AffiliateCoupon | null>(null);
  const [usageDialogOpen, setUsageDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch coupons with affiliate info
      const { data: couponsData, error: couponsError } = await supabase
        .from('affiliate_coupons')
        .select(`
          *,
          affiliate:affiliates (
            full_name,
            email,
            affiliate_code
          )
        `)
        .order('created_at', { ascending: false });

      if (couponsError) throw couponsError;
      setCoupons(couponsData || []);

      // Fetch recent coupon uses
      const { data: usesData } = await supabase
        .from('affiliate_coupon_uses')
        .select(`
          *,
          coupon:affiliate_coupons (
            code,
            affiliate:affiliates (
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      setCouponUses(usesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const fetchCouponHistory = async (couponId: string) => {
    try {
      const { data, error } = await supabase
        .from('affiliate_coupon_uses')
        .select('*')
        .eq('coupon_id', couponId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching history:', error);
      return [];
    }
  };

  const toggleCouponStatus = async (coupon: AffiliateCoupon) => {
    try {
      const { error } = await supabase
        .from('affiliate_coupons')
        .update({ is_active: !coupon.is_active })
        .eq('id', coupon.id);

      if (error) throw error;
      toast.success(coupon.is_active ? 'Cupom desativado' : 'Cupom ativado');
      fetchData();
    } catch (error) {
      console.error('Error toggling coupon:', error);
      toast.error('Erro ao atualizar cupom');
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = 
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.affiliate?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.affiliate?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && coupon.is_active) ||
      (statusFilter === 'inactive' && !coupon.is_active);
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.is_active).length;
  const totalUses = coupons.reduce((acc, c) => acc + c.current_uses, 0);
  const totalDiscountGiven = couponUses.reduce((acc, u) => acc + u.discount_amount_cents, 0);

  const openUsageDialog = async (coupon: AffiliateCoupon) => {
    setSelectedCoupon(coupon);
    setUsageDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Tag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cupons</p>
                <p className="text-2xl font-bold">{totalCoupons}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold">{activeCoupons}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Usos Totais</p>
                <p className="text-2xl font-bold">{totalUses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Descontos Dados</p>
                <p className="text-2xl font-bold">{formatPrice(totalDiscountGiven)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Cupons de Afiliados
            </CardTitle>
            <CardDescription>
              Gerencie todos os cupons criados pelos afiliados
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, afiliado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Coupons Table */}
          {filteredCoupons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum cupom encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCoupons.map(coupon => (
                <div
                  key={coupon.id}
                  className={`p-4 rounded-lg border transition-all ${
                    coupon.is_active ? 'bg-card' : 'bg-muted/50 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Tag className="h-5 w-5 text-primary" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold">{coupon.code}</code>
                          <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                            {coupon.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{coupon.affiliate?.full_name || 'Afiliado desconhecido'}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            {coupon.discount_type === 'percent' ? (
                              <Percent className="h-3 w-3" />
                            ) : (
                              <DollarSign className="h-3 w-3" />
                            )}
                            {coupon.discount_type === 'percent' 
                              ? `${coupon.discount_value}% off`
                              : formatPrice(coupon.discount_value * 100)
                            }
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {coupon.current_uses}{coupon.max_uses ? `/${coupon.max_uses}` : ''} usos
                          </span>
                          {coupon.expires_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(coupon.expires_at), 'dd/MM/yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openUsageDialog(coupon)}
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Ver Usos
                      </Button>
                      <Switch
                        checked={coupon.is_active}
                        onCheckedChange={() => toggleCouponStatus(coupon)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Uses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Usos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {couponUses.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nenhum uso registrado</p>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {couponUses.map(use => (
                  <div key={use.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm font-medium">{use.coupon?.code}</code>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-sm">{use.user_email}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{SERVICE_OPTIONS.find(s => s.value === use.service_type)?.label || use.service_type}</span>
                        <span>•</span>
                        <span>{use.coupon?.affiliate?.full_name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-success">
                        -{formatPrice(use.discount_amount_cents)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(use.created_at), "dd/MM HH:mm")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Usage Dialog */}
      <Dialog open={usageDialogOpen} onOpenChange={setUsageDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Histórico - {selectedCoupon?.code}
            </DialogTitle>
            <DialogDescription>
              Afiliado: {selectedCoupon?.affiliate?.full_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">{selectedCoupon?.current_uses || 0}</p>
                <p className="text-xs text-muted-foreground">Usos</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">
                  {selectedCoupon?.discount_type === 'percent' 
                    ? `${selectedCoupon.discount_value}%`
                    : formatPrice((selectedCoupon?.discount_value || 0) * 100)
                  }
                </p>
                <p className="text-xs text-muted-foreground">Desconto</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Para ver o histórico completo de usos,</p>
              <p>filtre os usos recentes pelo código do cupom.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
