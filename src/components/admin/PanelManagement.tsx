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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  LayoutDashboard, 
  RefreshCw,
  Users,
  Loader2,
  Search,
  Eye,
  Settings2,
  Building2,
  Scale,
  UserCheck,
  Briefcase,
  GraduationCap,
  Stethoscope
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Predefined panel types with their configurations
const panelPresets = [
  { 
    id: 'parceiro-limpa-nome', 
    name: 'Parceiro Limpa Nome', 
    icon: Building2, 
    color: 'bg-emerald-100 text-emerald-700',
    description: 'Painel para parceiros do serviço Limpa Nome',
    roleRequired: 'partner'
  },
  { 
    id: 'contador', 
    name: 'Contador', 
    icon: UserCheck, 
    color: 'bg-blue-100 text-blue-700',
    description: 'Painel para contadores com gestão de clientes',
    roleRequired: 'contador'
  },
  { 
    id: 'advogado', 
    name: 'Advogado', 
    icon: Scale, 
    color: 'bg-violet-100 text-violet-700',
    description: 'Painel jurídico para advogados parceiros',
    roleRequired: 'advogado'
  },
  { 
    id: 'afiliado', 
    name: 'Afiliado', 
    icon: Users, 
    color: 'bg-amber-100 text-amber-700',
    description: 'Painel de marketing e comissões para afiliados',
    roleRequired: 'affiliate'
  },
  { 
    id: 'empresa', 
    name: 'Empresa', 
    icon: Briefcase, 
    color: 'bg-indigo-100 text-indigo-700',
    description: 'Dashboard corporativo para empresas clientes',
    roleRequired: 'empresa'
  },
  { 
    id: 'educacao', 
    name: 'Educação', 
    icon: GraduationCap, 
    color: 'bg-pink-100 text-pink-700',
    description: 'Painel para instituições de ensino parceiras',
    roleRequired: 'educacao'
  },
  { 
    id: 'saude', 
    name: 'Saúde', 
    icon: Stethoscope, 
    color: 'bg-teal-100 text-teal-700',
    description: 'Painel para profissionais e clínicas de saúde',
    roleRequired: 'saude'
  },
];

interface PanelConfig {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  is_active: boolean;
  role_required: string;
  features: string[];
  created_at: string;
  users_count?: number;
}

export const PanelManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<typeof panelPresets[0] | null>(null);
  
  // Mock data for demonstration - in production, this would come from a panels_config table
  const [activePanels, setActivePanels] = useState<string[]>(['contador', 'afiliado', 'empresa']);

  // Get user counts per role
  const { data: roleCounts } = useQuery({
    queryKey: ['role-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role');
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach(r => {
        counts[r.role] = (counts[r.role] || 0) + 1;
      });
      return counts;
    },
  });

  const handleTogglePanel = (panelId: string) => {
    setActivePanels(prev => 
      prev.includes(panelId) 
        ? prev.filter(id => id !== panelId)
        : [...prev, panelId]
    );
    toast({
      title: activePanels.includes(panelId) ? 'Painel desativado' : 'Painel ativado',
      description: `O painel foi ${activePanels.includes(panelId) ? 'desativado' : 'ativado'} com sucesso.`,
    });
  };

  const handleCreatePanel = (preset: typeof panelPresets[0]) => {
    setSelectedPreset(preset);
    setIsDialogOpen(true);
  };

  const handleConfirmCreate = () => {
    if (selectedPreset) {
      setActivePanels(prev => [...prev, selectedPreset.id]);
      toast({
        title: 'Painel criado!',
        description: `O painel ${selectedPreset.name} foi configurado com sucesso.`,
      });
    }
    setIsDialogOpen(false);
    setSelectedPreset(null);
  };

  const filteredPanels = panelPresets.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activePanelsList = panelPresets.filter(p => activePanels.includes(p.id));
  const availablePanels = panelPresets.filter(p => !activePanels.includes(p.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            Gestão de Painéis
          </h2>
          <p className="text-muted-foreground">
            Crie e gerencie painéis personalizados para diferentes tipos de usuários
          </p>
        </div>
        <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['role-counts'] })}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activePanels.length}</p>
                <p className="text-xs text-muted-foreground">Painéis Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Settings2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{panelPresets.length - activePanels.length}</p>
                <p className="text-xs text-muted-foreground">Disponíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Object.values(roleCounts || {}).reduce((a, b) => a + b, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Usuários com Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-100">
                <Eye className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{panelPresets.length}</p>
                <p className="text-xs text-muted-foreground">Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar painéis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Active Panels */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          Painéis Ativos ({activePanelsList.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activePanelsList.map((panel) => {
            const Icon = panel.icon;
            const userCount = roleCounts?.[panel.roleRequired] || 0;
            return (
              <Card key={panel.id} className="relative">
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={true}
                    onCheckedChange={() => handleTogglePanel(panel.id)}
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2.5 rounded-lg', panel.color.split(' ')[0])}>
                      <Icon className={cn('h-5 w-5', panel.color.split(' ')[1])} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{panel.name}</CardTitle>
                      <code className="text-xs text-muted-foreground">/painel/{panel.id}</code>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {panel.description}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                      <Users className="h-3 w-3 mr-1" />
                      {userCount} usuários
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Settings2 className="h-4 w-4 mr-1" />
                      Configurar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Available Panels */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-muted-foreground" />
          Painéis Disponíveis ({availablePanels.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availablePanels.map((panel) => {
            const Icon = panel.icon;
            return (
              <Card key={panel.id} className="relative opacity-75 hover:opacity-100 transition-opacity">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2.5 rounded-lg', panel.color.split(' ')[0])}>
                      <Icon className={cn('h-5 w-5', panel.color.split(' ')[1])} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{panel.name}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        Role: {panel.roleRequired}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {panel.description}
                  </p>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleCreatePanel(panel)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ativar Painel
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Create Panel Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPreset && (
                <>
                  <selectedPreset.icon className="h-5 w-5" />
                  Ativar Painel: {selectedPreset.name}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">
              {selectedPreset?.description}
            </p>
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <p className="text-sm font-medium">Este painel incluirá:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Dashboard personalizado</li>
                <li>• Rota exclusiva: <code>/painel/{selectedPreset?.id}</code></li>
                <li>• Role associada: <code>{selectedPreset?.roleRequired}</code></li>
                <li>• Sidebar e menu customizados</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/50">
              <p className="text-sm text-amber-700">
                <strong>Nota:</strong> Após ativar, você poderá configurar as features específicas 
                e permissões deste painel.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Ativar Painel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PanelManagement;
