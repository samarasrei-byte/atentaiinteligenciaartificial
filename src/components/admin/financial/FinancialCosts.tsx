import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus,
  Trash2,
  Edit2,
  Download,
  RefreshCw,
  Calendar,
  DollarSign,
  TrendingDown
} from 'lucide-react';

interface Cost {
  id: string;
  date: string;
  type: string;
  service: string | null;
  amount: number;
  description: string | null;
  notes: string | null;
  category: string;
  is_recurring: boolean;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

const formatDate = (date: string) => 
  new Date(date).toLocaleDateString('pt-BR');

const costTypes = [
  { value: 'operacional', label: 'Operacional' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'infraestrutura', label: 'Infraestrutura' },
  { value: 'pessoal', label: 'Pessoal' },
  { value: 'impostos', label: 'Impostos' },
  { value: 'outros', label: 'Outros' },
];

const serviceOptions = [
  { value: '', label: 'Nenhum (Geral)' },
  { value: 'limpa-nome', label: 'Limpa Nome' },
  { value: 'analise-fiscal', label: 'Análise Fiscal' },
  { value: 'emissao-nf', label: 'Emissão de NF' },
  { value: 'assinaturas', label: 'Assinaturas' },
];

export const FinancialCosts: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [costs, setCosts] = useState<Cost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<Cost | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'operacional',
    service: '',
    amount: '',
    description: '',
    notes: '',
    category: 'operational',
    is_recurring: false
  });

  useEffect(() => {
    fetchCosts();
  }, []);

  const fetchCosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('financial_costs')
        .select('*')
        .order('cost_date', { ascending: false });

      if (error) throw error;

      const formattedCosts: Cost[] = (data || []).map((c: any) => ({
        id: c.id,
        date: c.cost_date,
        type: c.cost_type,
        service: c.service_slug,
        amount: c.amount_cents,
        description: c.description,
        notes: c.notes,
        category: c.category || 'operational',
        is_recurring: c.is_recurring || false
      }));

      setCosts(formattedCosts);
    } catch (error) {
      console.error('Erro ao buscar custos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não autenticado' });
      return;
    }

    try {
      const costData = {
        user_id: user.id,
        cost_date: formData.date,
        cost_type: formData.type,
        service_slug: formData.service || null,
        amount_cents: Math.round(parseFloat(formData.amount) * 100),
        description: formData.description || null,
        notes: formData.notes || null,
        category: formData.category,
        is_recurring: formData.is_recurring
      };

      if (editingCost) {
        const { error } = await supabase
          .from('financial_costs')
          .update(costData)
          .eq('id', editingCost.id);
        
        if (error) throw error;
        toast({ title: 'Custo atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('financial_costs')
          .insert([costData]);
        
        if (error) throw error;
        toast({ title: 'Custo cadastrado com sucesso!' });
      }

      setIsDialogOpen(false);
      setEditingCost(null);
      resetForm();
      fetchCosts();
    } catch (error) {
      console.error('Erro ao salvar custo:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao salvar custo' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este custo?')) return;

    try {
      const { error } = await supabase
        .from('financial_costs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: 'Custo excluído com sucesso!' });
      fetchCosts();
    } catch (error) {
      console.error('Erro ao excluir custo:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao excluir custo' });
    }
  };

  const handleEdit = (cost: Cost) => {
    setEditingCost(cost);
    setFormData({
      date: cost.date,
      type: cost.type,
      service: cost.service || '',
      amount: (cost.amount / 100).toFixed(2),
      description: cost.description || '',
      notes: cost.notes || '',
      category: cost.category,
      is_recurring: cost.is_recurring
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'operacional',
      service: '',
      amount: '',
      description: '',
      notes: '',
      category: 'operational',
      is_recurring: false
    });
  };

  const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0);

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'operacional': 'bg-blue-500/10 text-blue-600 border-blue-500/30',
      'marketing': 'bg-purple-500/10 text-purple-600 border-purple-500/30',
      'infraestrutura': 'bg-amber-500/10 text-amber-600 border-amber-500/30',
      'pessoal': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
      'impostos': 'bg-red-500/10 text-red-600 border-red-500/30',
      'outros': 'bg-slate-500/10 text-slate-600 border-slate-500/30',
    };
    return colors[type] || colors['outros'];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Custos</h2>
          <p className="text-sm text-muted-foreground">Gerenciamento de custos e despesas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchCosts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingCost(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Custo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingCost ? 'Editar Custo' : 'Cadastrar Novo Custo'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor (R$)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Custo</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(v) => setFormData({ ...formData, type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {costTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service">Serviço Relacionado</Label>
                    <Select 
                      value={formData.service} 
                      onValueChange={(v) => setFormData({ ...formData, service: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceOptions.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    placeholder="Descrição do custo"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações adicionais..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-red-600 hover:bg-red-700">
                    {editingCost ? 'Salvar Alterações' : 'Cadastrar Custo'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabela de custos */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Histórico de Custos
            </CardTitle>
            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
              {costs.length} registros
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : costs.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">Nenhum custo cadastrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Clique em "Novo Custo" para começar
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Data</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Serviço</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Descrição</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Valor</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {costs.map((cost) => (
                    <tr key={cost.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(cost.date)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={getTypeBadge(cost.type)}>
                          {cost.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {cost.service || 'Geral'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{cost.description || '-'}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-red-600">
                          {formatCurrency(cost.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEdit(cost)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => handleDelete(cost.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50">
                    <td colSpan={4} className="py-4 px-4 text-right font-semibold">
                      Total:
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-lg font-bold text-red-600">
                        {formatCurrency(totalCosts)}
                      </span>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
