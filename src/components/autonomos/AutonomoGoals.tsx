import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Target, 
  Plus, 
  Trash2, 
  TrendingUp, 
  PiggyBank, 
  Receipt,
  CheckCircle2,
  Calendar,
  Edit2
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  goal_type: string;
  target_value_cents: number;
  current_value_cents: number;
  target_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

const goalTypeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  revenue: { label: 'Faturamento', icon: TrendingUp, color: 'text-primary' },
  savings: { label: 'Economia', icon: PiggyBank, color: 'text-emerald-500' },
  tax_reduction: { label: 'Redução de Impostos', icon: Receipt, color: 'text-amber-500' },
};

export function AutonomoGoals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_type: 'revenue',
    target_value: '',
    current_value: '',
    target_date: '',
  });

  const { data: goals, isLoading } = useQuery({
    queryKey: ['autonomo-goals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('autonomo_financial_goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!user,
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'completed_at'>) => {
      const { data, error } = await supabase
        .from('autonomo_financial_goals')
        .insert({
          ...goalData,
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autonomo-goals'] });
      toast.success('Meta criada com sucesso!');
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error('Erro ao criar meta');
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, ...goalData }: Partial<Goal> & { id: string }) => {
      const { data, error } = await supabase
        .from('autonomo_financial_goals')
        .update(goalData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autonomo-goals'] });
      toast.success('Meta atualizada!');
      resetForm();
      setEditingGoal(null);
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error('Erro ao atualizar meta');
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('autonomo_financial_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autonomo-goals'] });
      toast.success('Meta excluída');
    },
    onError: () => {
      toast.error('Erro ao excluir meta');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      goal_type: 'revenue',
      target_value: '',
      current_value: '',
      target_date: '',
    });
    setEditingGoal(null);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      goal_type: goal.goal_type,
      target_value: (goal.target_value_cents / 100).toString(),
      current_value: (goal.current_value_cents / 100).toString(),
      target_date: goal.target_date || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetValueCents = Math.round(parseFloat(formData.target_value) * 100);
    const currentValueCents = Math.round(parseFloat(formData.current_value || '0') * 100);
    const isCompleted = currentValueCents >= targetValueCents;

    const goalData = {
      title: formData.title,
      description: formData.description || null,
      goal_type: formData.goal_type,
      target_value_cents: targetValueCents,
      current_value_cents: currentValueCents,
      target_date: formData.target_date || null,
      is_completed: isCompleted,
    };

    if (editingGoal) {
      updateGoalMutation.mutate({ id: editingGoal.id, ...goalData });
    } else {
      createGoalMutation.mutate(goalData);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const getProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Metas Financeiras
          </h3>
          <p className="text-sm text-muted-foreground">
            Acompanhe seu progresso em direção aos seus objetivos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? 'Editar Meta' : 'Criar Nova Meta'}
              </DialogTitle>
              <DialogDescription>
                Defina uma meta financeira para acompanhar seu progresso
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Meta</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Faturar R$ 10.000/mês"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva sua meta..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal_type">Tipo de Meta</Label>
                <Select
                  value={formData.goal_type}
                  onValueChange={(value) => setFormData({ ...formData, goal_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Faturamento</SelectItem>
                    <SelectItem value="savings">Economia</SelectItem>
                    <SelectItem value="tax_reduction">Redução de Impostos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_value">Valor Alvo (R$)</Label>
                  <Input
                    id="target_value"
                    type="number"
                    step="0.01"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                    placeholder="10000.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current_value">Valor Atual (R$)</Label>
                  <Input
                    id="current_value"
                    type="number"
                    step="0.01"
                    value={formData.current_value}
                    onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_date">Data Limite (opcional)</Label>
                <Input
                  id="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createGoalMutation.isPending || updateGoalMutation.isPending}
                >
                  {editingGoal ? 'Salvar' : 'Criar Meta'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!goals?.length ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma meta definida</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira meta financeira para começar a acompanhar seu progresso.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeira Meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const config = goalTypeConfig[goal.goal_type] || goalTypeConfig.revenue;
            const progress = getProgress(goal.current_value_cents, goal.target_value_cents);
            const IconComponent = config.icon;

            return (
              <Card 
                key={goal.id} 
                className={`transition-all ${goal.is_completed ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg bg-muted`}>
                        <IconComponent className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                          {goal.title}
                          {goal.is_completed && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          )}
                        </CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(goal)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deleteGoalMutation.mutate(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goal.description && (
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatCurrency(goal.current_value_cents)}
                      </span>
                      <span className="font-medium text-primary">
                        {formatCurrency(goal.target_value_cents)}
                      </span>
                    </div>
                  </div>

                  {goal.target_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Prazo: {format(new Date(goal.target_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
