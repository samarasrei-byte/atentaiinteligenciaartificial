import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Package, 
  RefreshCw,
  DollarSign,
  Tag,
  Loader2,
  Search,
  AlertCircle,
  CheckCircle,
  ShoppingBag,
  FileText,
  Shield,
  Scale,
  Brain,
  CreditCard,
  Building2,
  FileSpreadsheet,
  FileCheck,
  BarChart3,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Icon mapping for display
const iconMap: Record<string, React.ElementType> = {
  FileText,
  Shield,
  Scale,
  Brain,
  CreditCard,
  Package,
  ShoppingBag,
  Tag,
  Building2,
  FileSpreadsheet,
  FileCheck,
  BarChart3,
  User,
};

type ServiceResponsible = 'guilherme' | 'cesar' | 'contador';

interface AdminService {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  bg_color: string | null;
  is_active: boolean | null;
  price_cents: number | null;
  priority: string | null;
  responsible: ServiceResponsible;
  created_at: string | null;
  updated_at: string | null;
}

interface ServiceFormData {
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bg_color: string;
  is_active: boolean;
  price_cents: number;
  priority: string;
  responsible: ServiceResponsible;
}

const defaultFormData: ServiceFormData = {
  slug: '',
  name: '',
  description: '',
  icon: 'FileText',
  color: 'text-slate-600',
  bg_color: 'bg-slate-100',
  is_active: true,
  price_cents: 0,
  priority: 'medium',
  responsible: 'guilherme',
};

export const ServiceManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<AdminService | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(defaultFormData);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch services
  const { data: services, isLoading, refetch } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_services')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as AdminService[];
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      if (editingService) {
        const { error } = await supabase
          .from('admin_services')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingService.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('admin_services')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast({
        title: editingService ? 'Serviço atualizado!' : 'Serviço criado!',
        description: 'As alterações foram salvas com sucesso.',
      });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_services')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast({
        title: 'Serviço excluído!',
        description: 'O serviço foi removido do catálogo.',
      });
      setDeleteConfirmId(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('admin_services')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
    },
  });

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData(defaultFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (service: AdminService) => {
    setEditingService(service);
    setFormData({
      slug: service.slug,
      name: service.name,
      description: service.description || '',
      icon: service.icon || 'FileText',
      color: service.color || 'text-slate-600',
      bg_color: service.bg_color || 'bg-slate-100',
      is_active: service.is_active ?? true,
      price_cents: service.price_cents || 0,
      priority: service.priority || 'medium',
      responsible: service.responsible,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingService(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slug || !formData.name) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o slug e o nome do serviço.',
        variant: 'destructive',
      });
      return;
    }
    saveMutation.mutate(formData);
  };

  const filteredServices = services?.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (cents: number | null) => {
    if (cents === null || cents === 0) return 'Sob consulta';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  };

  const getResponsibleBadge = (responsible: ServiceResponsible) => {
    const config: Record<ServiceResponsible, { label: string; className: string }> = {
      guilherme: { label: 'Guilherme', className: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
      cesar: { label: 'César', className: 'bg-violet-100 text-violet-700 border-violet-300' },
      contador: { label: 'Contador', className: 'bg-blue-100 text-blue-700 border-blue-300' },
    };
    const c = config[responsible];
    return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Gestão de Serviços
          </h2>
          <p className="text-muted-foreground">
            Gerencie todos os serviços do marketplace e sincronize com a plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sincronizar
          </Button>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Serviço
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{services?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total de Serviços</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{services?.filter(s => s.is_active).length || 0}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{services?.filter(s => !s.is_active).length || 0}</p>
                <p className="text-xs text-muted-foreground">Inativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-100">
                <DollarSign className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {services?.filter(s => s.price_cents && s.price_cents > 0).length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Com Preço Fixo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar serviços..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices?.map((service) => {
            const IconComponent = iconMap[service.icon || 'FileText'] || Package;
            return (
              <Card key={service.id} className={cn(
                'relative transition-all',
                !service.is_active && 'opacity-60'
              )}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2.5 rounded-lg', service.bg_color || 'bg-slate-100')}>
                        <IconComponent className={cn('h-5 w-5', service.color || 'text-slate-600')} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{service.name}</CardTitle>
                        <code className="text-xs text-muted-foreground">{service.slug}</code>
                      </div>
                    </div>
                    <Switch
                      checked={service.is_active ?? true}
                      onCheckedChange={(checked) => 
                        toggleActiveMutation.mutate({ id: service.id, is_active: checked })
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {service.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-foreground">
                      {formatPrice(service.price_cents)}
                    </span>
                    {getResponsibleBadge(service.responsible)}
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleOpenEdit(service)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Editar
                    </Button>
                    <Dialog open={deleteConfirmId === service.id} onOpenChange={(o) => !o && setDeleteConfirmId(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteConfirmId(service.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Excluir Serviço</DialogTitle>
                        </DialogHeader>
                        <p className="text-muted-foreground">
                          Tem certeza que deseja excluir o serviço <strong>{service.name}</strong>? 
                          Esta ação não pode ser desfeita.
                        </p>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                            Cancelar
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={() => deleteMutation.mutate(service.id)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Excluir
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  placeholder="limpa-nome"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  disabled={!!editingService}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Limpa Nome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição do serviço..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="780.00"
                  value={formData.price_cents ? (formData.price_cents / 100).toFixed(2) : ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    price_cents: Math.round(parseFloat(e.target.value || '0') * 100) 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsible">Responsável</Label>
                <Select
                  value={formData.responsible}
                  onValueChange={(v) => setFormData({ ...formData, responsible: v as ServiceResponsible })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guilherme">Guilherme</SelectItem>
                    <SelectItem value="cesar">César</SelectItem>
                    <SelectItem value="contador">Contador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Ícone</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(v) => setFormData({ ...formData, icon: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FileText">FileText</SelectItem>
                    <SelectItem value="Shield">Shield</SelectItem>
                    <SelectItem value="Scale">Scale</SelectItem>
                    <SelectItem value="Brain">Brain</SelectItem>
                    <SelectItem value="CreditCard">CreditCard</SelectItem>
                    <SelectItem value="Package">Package</SelectItem>
                    <SelectItem value="ShoppingBag">ShoppingBag</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setFormData({ ...formData, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Serviço Ativo</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingService ? 'Salvar Alterações' : 'Criar Serviço'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceManagement;
