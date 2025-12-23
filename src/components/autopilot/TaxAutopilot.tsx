import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2,
  RefreshCw,
  Bell
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AutopilotData {
  id: string;
  is_active: boolean;
  monthly_revenue_cents: number;
  activity_type: string;
  monthly_expenses_cents: number;
  current_structure: string;
  accumulated_savings_cents: number;
  last_optimization_at: string | null;
  last_optimization_description: string | null;
  next_reevaluation_at: string | null;
}

interface AutopilotAlert {
  id: string;
  alert_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatCurrencyInput = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  const amount = parseInt(numbers || '0') / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

const parseCurrencyInput = (value: string): number => {
  const numbers = value.replace(/\D/g, '');
  return parseInt(numbers || '0');
};

export const TaxAutopilot = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autopilotData, setAutopilotData] = useState<AutopilotData | null>(null);
  const [alerts, setAlerts] = useState<AutopilotAlert[]>([]);
  
  // Form states
  const [monthlyRevenue, setMonthlyRevenue] = useState('R$ 0,00');
  const [activityType, setActivityType] = useState('residential');
  const [monthlyExpenses, setMonthlyExpenses] = useState('R$ 0,00');
  const [currentStructure, setCurrentStructure] = useState('pf');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAutopilotData();
      fetchAlerts();
    }
  }, [user]);

  const fetchAutopilotData = async () => {
    try {
      const { data, error } = await supabase
        .from('tax_autopilot')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setAutopilotData(data);
        setIsActive(data.is_active);
        setMonthlyRevenue(formatCurrency(data.monthly_revenue_cents / 100));
        setActivityType(data.activity_type);
        setMonthlyExpenses(formatCurrency(data.monthly_expenses_cents / 100));
        setCurrentStructure(data.current_structure);
      }
    } catch (error) {
      console.error('Error fetching autopilot data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('tax_autopilot_alerts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const calculateOptimalScenario = (
    revenue: number, 
    expenses: number, 
    currentStruct: string
  ) => {
    // PF calculation: 26.5% flat rate
    const pfTax = revenue * 0.265;

    // PJ calculation (Lucro Presumido)
    const presumedBase = revenue * 0.32;
    const irpjCsll = presumedBase * 0.1133;
    const cbs = revenue * 0.12;
    const cbsCredit = expenses * 0.12;
    const pjTax = Math.max(0, irpjCsll + cbs - cbsCredit);

    const bestScenario = pfTax <= pjTax ? 'pf' : 'pj';
    const bestTax = Math.min(pfTax, pjTax);
    const currentTax = currentStruct === 'pf' ? pfTax : pjTax;
    const savings = Math.max(0, currentTax - bestTax);
    const shouldChange = bestScenario !== currentStruct && savings > 0;

    return {
      pfTax,
      pjTax,
      bestScenario,
      bestTax,
      currentTax,
      savings,
      shouldChange
    };
  };

  const handleToggleAutopilot = async (active: boolean) => {
    if (!user) return;

    setSaving(true);
    try {
      const revenue = parseCurrencyInput(monthlyRevenue);
      const expenses = parseCurrencyInput(monthlyExpenses);

      if (active && (revenue === 0)) {
        toast.error('Preencha o faturamento mensal para ativar o Piloto Automático');
        setSaving(false);
        return;
      }

      const nextReevaluation = addMonths(new Date(), 1);
      const optimization = calculateOptimalScenario(revenue / 100, expenses / 100, currentStructure);

      let alertMessage = '';
      let alertType = '';
      let optimizationDescription = '';

      if (active) {
        if (optimization.shouldChange) {
          alertType = 'structure_change';
          alertMessage = optimization.bestScenario === 'pj' 
            ? 'Agora vale a pena migrar para Pessoa Jurídica'
            : 'Agora vale a pena migrar para Pessoa Física';
          optimizationDescription = `Estrutura otimizada: ${optimization.bestScenario === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}`;
        } else if (optimization.savings > 0) {
          alertType = 'savings_opportunity';
          alertMessage = 'Nova estrutura gera economia estimada';
          optimizationDescription = 'Estratégia atual é a mais eficiente';
        } else {
          optimizationDescription = 'Estratégia atual já é a mais eficiente';
        }
      }

      const autopilotPayload = {
        user_id: user.id,
        is_active: active,
        monthly_revenue_cents: revenue,
        activity_type: activityType,
        monthly_expenses_cents: expenses,
        current_structure: currentStructure,
        accumulated_savings_cents: active ? Math.round(optimization.savings * 100) : 0,
        last_optimization_at: active ? new Date().toISOString() : null,
        last_optimization_description: active ? optimizationDescription : null,
        next_reevaluation_at: active ? nextReevaluation.toISOString() : null
      };

      if (autopilotData) {
        const { error } = await supabase
          .from('tax_autopilot')
          .update(autopilotPayload)
          .eq('id', autopilotData.id);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('tax_autopilot')
          .insert(autopilotPayload)
          .select()
          .single();
        
        if (error) throw error;
        setAutopilotData(data);

        // Create initial alert if there's an optimization opportunity
        if (alertMessage && data) {
          await supabase.from('tax_autopilot_alerts').insert({
            user_id: user.id,
            autopilot_id: data.id,
            alert_type: alertType,
            message: alertMessage
          });
        }
      }

      setIsActive(active);
      await fetchAutopilotData();
      await fetchAlerts();
      
      toast.success(active 
        ? 'Piloto Automático ativado com sucesso!' 
        : 'Piloto Automático desativado'
      );
    } catch (error) {
      console.error('Error toggling autopilot:', error);
      toast.error('Erro ao atualizar Piloto Automático');
    } finally {
      setSaving(false);
    }
  };

  const handleRecalculate = async () => {
    if (!user || !autopilotData) return;

    setSaving(true);
    try {
      const revenue = parseCurrencyInput(monthlyRevenue) / 100;
      const expenses = parseCurrencyInput(monthlyExpenses) / 100;
      const optimization = calculateOptimalScenario(revenue, expenses, currentStructure);

      const newAccumulated = (autopilotData.accumulated_savings_cents / 100) + optimization.savings;
      
      let alertMessage = '';
      let alertType = '';

      if (optimization.shouldChange) {
        alertType = 'structure_change';
        alertMessage = optimization.bestScenario === 'pj' 
          ? 'Agora vale a pena migrar para Pessoa Jurídica'
          : 'Agora vale a pena migrar para Pessoa Física';
      } else if (optimization.savings === 0 && expenses < revenue * 0.1) {
        alertType = 'lost_credits';
        alertMessage = 'Você perdeu créditos este mês - despesas muito baixas';
      }

      await supabase
        .from('tax_autopilot')
        .update({
          monthly_revenue_cents: Math.round(revenue * 100),
          activity_type: activityType,
          monthly_expenses_cents: Math.round(expenses * 100),
          current_structure: currentStructure,
          accumulated_savings_cents: Math.round(newAccumulated * 100),
          last_optimization_at: new Date().toISOString(),
          last_optimization_description: `Reavaliação: Economia de ${formatCurrency(optimization.savings)}/mês`,
          next_reevaluation_at: addMonths(new Date(), 1).toISOString()
        })
        .eq('id', autopilotData.id);

      if (alertMessage) {
        await supabase.from('tax_autopilot_alerts').insert({
          user_id: user.id,
          autopilot_id: autopilotData.id,
          alert_type: alertType,
          message: alertMessage
        });
      }

      await fetchAutopilotData();
      await fetchAlerts();
      toast.success('Reavaliação concluída!');
    } catch (error) {
      console.error('Error recalculating:', error);
      toast.error('Erro ao recalcular');
    } finally {
      setSaving(false);
    }
  };

  const markAlertAsRead = async (alertId: string) => {
    try {
      await supabase
        .from('tax_autopilot_alerts')
        .update({ is_read: true })
        .eq('id', alertId);
      
      setAlerts(alerts.filter(a => a.id !== alertId));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Toggle Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Piloto Automático Tributário</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Otimização contínua da sua estratégia tributária
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="autopilot-toggle" className="text-sm font-medium">
                {isActive ? 'Ativo' : 'Inativo'}
              </Label>
              <Switch
                id="autopilot-toggle"
                checked={isActive}
                onCheckedChange={handleToggleAutopilot}
                disabled={saving}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Card when Active */}
          {isActive && autopilotData && (
            <div className="p-4 rounded-lg bg-background/80 border border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Piloto Automático Ativo
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-primary/5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4" />
                    Economia Acumulada
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(autopilotData.accumulated_savings_cents / 100)}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Última Otimização
                  </div>
                  <p className="text-sm font-medium">
                    {autopilotData.last_optimization_description || 'Nenhuma ainda'}
                  </p>
                  {autopilotData.last_optimization_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(autopilotData.last_optimization_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    Próxima Reavaliação
                  </div>
                  <p className="text-sm font-medium">
                    {autopilotData.next_reevaluation_at 
                      ? format(new Date(autopilotData.next_reevaluation_at), "dd/MM/yyyy", { locale: ptBR })
                      : 'Não agendada'
                    }
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-4 text-center">
                Sua estratégia tributária está sendo otimizada automaticamente.
              </p>
            </div>
          )}

          {/* Configuration Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revenue">Faturamento Mensal</Label>
              <Input
                id="revenue"
                value={monthlyRevenue}
                onChange={(e) => setMonthlyRevenue(formatCurrencyInput(e.target.value))}
                placeholder="R$ 0,00"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expenses">Despesas Mensais Médias</Label>
              <Input
                id="expenses"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(formatCurrencyInput(e.target.value))}
                placeholder="R$ 0,00"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity">Tipo de Atividade</Label>
              <Select value={activityType} onValueChange={setActivityType} disabled={saving}>
                <SelectTrigger id="activity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Locação Residencial</SelectItem>
                  <SelectItem value="commercial">Locação Comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="structure">Estrutura Atual</Label>
              <Select value={currentStructure} onValueChange={setCurrentStructure} disabled={saving}>
                <SelectTrigger id="structure">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pf">Pessoa Física</SelectItem>
                  <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isActive && (
            <Button 
              onClick={handleRecalculate} 
              className="w-full" 
              variant="outline"
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Forçar Reavaliação Agora
            </Button>
          )}

          {/* Alerts Section */}
          {alerts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Bell className="h-4 w-4 text-amber-500" />
                Alertas Automáticos
              </div>
              {alerts.map((alert) => (
                <Alert key={alert.id} className="border-amber-500/20 bg-amber-500/5">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>{alert.message}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => markAlertAsRead(alert.id)}
                    >
                      Dispensar
                    </Button>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Legal Disclaimer */}
          <p className="text-xs text-muted-foreground text-center pt-4 border-t">
            Recomendações automáticas baseadas em simulações estimadas da EC 132/2023. 
            Não substitui contador.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
