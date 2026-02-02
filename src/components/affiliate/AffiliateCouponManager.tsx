import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Tag, Plus, Copy, Check, Trash2, Edit2, Percent, DollarSign,
  Calendar, Users, TrendingUp, Eye, Loader2, Sparkles, Gift,
  CheckCircle2, XCircle, Clock, RefreshCw, BarChart3
} from 'lucide-react';

interface AffiliateCoupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  applicable_services: string[];
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface CouponUse {
  id: string;
  user_email: string;
  service_type: string;
  original_amount_cents: number;
  discount_amount_cents: number;
  final_amount_cents: number;
  created_at: string;
}

interface Props {
  affiliateId: string;
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

export function AffiliateCouponManager({ affiliateId }: Props) {
  const [coupons, setCoupons] = useState<AffiliateCoupon[]>([]);
  const [couponUses, setCouponUses] = useState<CouponUse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [usageDialogOpen, setUsageDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<AffiliateCoupon | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percent' as 'percent' | 'fixed',
    discount_value: '',
    max_uses: '',
    applicable_services: [] as string[],
    expires_at: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, [affiliateId]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('affiliate_coupons')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Erro ao carregar cupons');
    } finally {
      setLoading(false);
    }
  };

  const fetchCouponUses = async (couponId: string) => {
    try {
      const { data, error } = await supabase
        .from('affiliate_coupon_uses')
        .select('*')
        .eq('coupon_id', couponId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCouponUses(data || []);
    } catch (error) {
      console.error('Error fetching coupon uses:', error);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.discount_value) {
      toast.error('Preencha código e valor do desconto');
      return;
    }

    setSubmitting(true);
    try {
      const couponData = {
        affiliate_id: affiliateId,
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        applicable_services: formData.applicable_services.length > 0 ? formData.applicable_services : [],
        expires_at: formData.expires_at || null,
        is_active: true
      };

      if (selectedCoupon) {
        const { error } = await supabase
          .from('affiliate_coupons')
          .update(couponData)
          .eq('id', selectedCoupon.id);
        if (error) throw error;
        toast.success('Cupom atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('affiliate_coupons')
          .insert(couponData);
        if (error) throw error;
        toast.success('Cupom criado com sucesso!');
      }

      setDialogOpen(false);
      resetForm();
      fetchCoupons();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      if (error.code === '23505') {
        toast.error('Este código de cupom já existe');
      } else {
        toast.error('Erro ao salvar cupom');
      }
    } finally {
      setSubmitting(false);
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
      fetchCoupons();
    } catch (error) {
      console.error('Error toggling coupon:', error);
      toast.error('Erro ao atualizar cupom');
    }
  };

  const deleteCoupon = async (couponId: string) => {
    if (!confirm('Tem certeza que deseja excluir este cupom?')) return;
    
    try {
      const { error } = await supabase
        .from('affiliate_coupons')
        .delete()
        .eq('id', couponId);

      if (error) throw error;
      toast.success('Cupom excluído');
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Erro ao excluir cupom');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percent',
      discount_value: '',
      max_uses: '',
      applicable_services: [],
      expires_at: ''
    });
    setSelectedCoupon(null);
  };

  const openEditDialog = (coupon: AffiliateCoupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: (coupon.discount_type === 'fixed' ? 'fixed' : 'percent') as 'percent' | 'fixed',
      discount_value: coupon.discount_value.toString(),
      max_uses: coupon.max_uses?.toString() || '',
      applicable_services: coupon.applicable_services || [],
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : ''
    });
    setDialogOpen(true);
  };

  const openUsageDialog = (coupon: AffiliateCoupon) => {
    setSelectedCoupon(coupon);
    fetchCouponUses(coupon.id);
    setUsageDialogOpen(true);
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const totalDiscountGiven = coupons.reduce((acc, c) => {
    return acc + (c.current_uses * (c.discount_type === 'percent' ? 0 : c.discount_value));
  }, 0);

  const totalUses = coupons.reduce((acc, c) => acc + c.current_uses, 0);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Tag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cupons Ativos</p>
                <p className="text-2xl font-bold">{coupons.filter(c => c.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Usos</p>
                <p className="text-2xl font-bold">{totalUses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversões</p>
                <p className="text-2xl font-bold">{totalUses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Meus Cupons de Desconto
            </CardTitle>
            <CardDescription>
              Crie cupons exclusivos para oferecer descontos aos seus indicados
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchCoupons}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Cupom
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{selectedCoupon ? 'Editar Cupom' : 'Criar Novo Cupom'}</DialogTitle>
                  <DialogDescription>
                    Configure o desconto que seus indicados receberão
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Código do Cupom</Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.code}
                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        placeholder="Ex: DESCONTO10"
                        className="uppercase"
                        maxLength={20}
                      />
                      <Button type="button" variant="outline" onClick={generateCode}>
                        <Sparkles className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de Desconto</Label>
                      <Select
                        value={formData.discount_type}
                        onValueChange={(value: 'percent' | 'fixed') => 
                          setFormData(prev => ({ ...prev, discount_type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">
                            <span className="flex items-center gap-2">
                              <Percent className="h-4 w-4" /> Porcentagem
                            </span>
                          </SelectItem>
                          <SelectItem value="fixed">
                            <span className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" /> Valor Fixo
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        {formData.discount_type === 'percent' ? 'Desconto (%)' : 'Desconto (R$)'}
                      </Label>
                      <Input
                        type="number"
                        value={formData.discount_value}
                        onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                        placeholder={formData.discount_type === 'percent' ? '10' : '50'}
                        min="1"
                        max={formData.discount_type === 'percent' ? '100' : undefined}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Limite de Usos (opcional)</Label>
                      <Input
                        type="number"
                        value={formData.max_uses}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_uses: e.target.value }))}
                        placeholder="Ilimitado"
                        min="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Validade (opcional)</Label>
                      <Input
                        type="date"
                        value={formData.expires_at}
                        onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Serviços Aplicáveis (vazio = todos)</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                      {SERVICE_OPTIONS.map(service => (
                        <label key={service.value} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.applicable_services.includes(service.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  applicable_services: [...prev.applicable_services, service.value]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  applicable_services: prev.applicable_services.filter(s => s !== service.value)
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          {service.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {selectedCoupon ? 'Salvar' : 'Criar Cupom'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {coupons.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-2">Nenhum cupom criado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crie cupons de desconto para atrair mais clientes
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Cupom
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.map(coupon => (
                <div
                  key={coupon.id}
                  className={`p-4 rounded-lg border transition-all ${
                    coupon.is_active 
                      ? 'bg-card hover:bg-accent/50' 
                      : 'bg-muted/50 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Tag className="h-5 w-5 text-primary" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-lg">{coupon.code}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => copyCode(coupon.code)}
                          >
                            {copied === coupon.code ? (
                              <Check className="h-4 w-4 text-success" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                            {coupon.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
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
                        
                        {coupon.applicable_services?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {coupon.applicable_services.map(service => (
                              <Badge key={service} variant="outline" className="text-xs">
                                {SERVICE_OPTIONS.find(s => s.value === service)?.label || service}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openUsageDialog(coupon)}
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(coupon)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Switch
                        checked={coupon.is_active}
                        onCheckedChange={() => toggleCouponStatus(coupon)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteCoupon(coupon.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Dialog */}
      <Dialog open={usageDialogOpen} onOpenChange={setUsageDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Histórico de Uso - {selectedCoupon?.code}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[400px]">
            {couponUses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum uso registrado ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {couponUses.map(use => (
                  <div key={use.id} className="p-3 rounded-lg bg-muted/50 border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{use.user_email}</p>
                        <p className="text-xs text-muted-foreground">
                          {SERVICE_OPTIONS.find(s => s.value === use.service_type)?.label || use.service_type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-success">
                          -{formatPrice(use.discount_amount_cents)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(use.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
