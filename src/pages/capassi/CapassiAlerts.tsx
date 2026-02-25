import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useCapassi } from '@/contexts/CapassiContext';
import { Bell, AlertTriangle, Info, CheckCircle2, Filter, RefreshCw, Clock } from 'lucide-react';

export default function CapassiAlerts() {
  const { currentOrg, currentCompany } = useCapassi();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchAlerts = async () => {
    if (!currentOrg) return;
    setLoading(true);
    let query = supabase.from('capassi_financial_alerts' as any).select('*').eq('organization_id', currentOrg.id).order('created_at', { ascending: false }).limit(100);
    if (currentCompany) query = query.eq('company_id', currentCompany.id);
    const { data } = await query;
    setAlerts((data || []) as any[]);
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, [currentOrg?.id, currentCompany?.id]);

  const getIcon = (severity: string) => {
    if (severity === 'critico') return <AlertTriangle className="h-5 w-5 text-red-400" />;
    if (severity === 'alto') return <Bell className="h-5 w-5 text-amber-400" />;
    if (severity === 'medio') return <Info className="h-5 w-5 text-[#33DDFF]" />;
    return <CheckCircle2 className="h-5 w-5 text-[#55FFAA]" />;
  };

  const getPriority = (severity: string) => {
    if (severity === 'critico') return { label: 'Crítico', class: 'bg-red-500/10 text-red-400 border-red-500/20' };
    if (severity === 'alto') return { label: 'Alto', class: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    if (severity === 'medio') return { label: 'Médio', class: 'bg-[#33DDFF]/10 text-[#33DDFF] border-[#33DDFF]/20' };
    return { label: 'Baixo', class: 'bg-[#55FFAA]/10 text-[#55FFAA] border-[#55FFAA]/20' };
  };

  const filtered = alerts.filter((a: any) => {
    if (filter === 'all') return true;
    return a.severity === filter;
  });

  const criticalCount = alerts.filter((a: any) => a.severity === 'critico').length;
  const highCount = alerts.filter((a: any) => a.severity === 'alto').length;
  const unreadCount = alerts.filter((a: any) => !a.is_read).length;

  if (!currentOrg) return <div className="py-20 text-center text-white/30">Selecione uma organização</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Central de Alertas</h2>
          <p className="text-sm text-white/30">Alertas financeiros — {currentOrg.name}</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAlerts} className="border-white/10 text-white/50 hover:text-white bg-transparent hover:bg-white/5">
          <RefreshCw className="h-3.5 w-3.5 mr-2" /> Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <div><p className="text-lg font-bold text-red-400">{criticalCount}</p><p className="text-[10px] text-white/30 uppercase">Críticos</p></div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <Bell className="h-4 w-4 text-amber-400" />
          <div><p className="text-lg font-bold text-amber-400">{highCount}</p><p className="text-[10px] text-white/30 uppercase">Altos</p></div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#33DDFF]/5 border border-[#33DDFF]/10">
          <Info className="h-4 w-4 text-[#33DDFF]" />
          <div><p className="text-lg font-bold text-white">{unreadCount}</p><p className="text-[10px] text-white/30 uppercase">Não lidos</p></div>
        </div>
      </div>

      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger className="w-[160px] bg-white/[0.03] border-white/10 text-white/70 h-9 text-xs">
          <Filter className="h-3.5 w-3.5 mr-2" /><SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="critico">Críticos</SelectItem>
          <SelectItem value="alto">Altos</SelectItem>
          <SelectItem value="medio">Médios</SelectItem>
          <SelectItem value="baixo">Baixos</SelectItem>
        </SelectContent>
      </Select>

      <div className="space-y-2">
        {loading ? (
          <div className="p-12 text-center text-white/30">Carregando...</div>
        ) : filtered.length === 0 ? (
          <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-[#55FFAA]/20" />
              <p className="text-white/30 text-sm">Nenhum alerta no momento ✨</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((alert: any) => {
            const priority = getPriority(alert.severity);
            return (
              <Card key={alert.id} className="bg-white/[0.02] border-white/[0.06] hover:border-white/10 transition-all">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="mt-0.5">{getIcon(alert.severity)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-white">{alert.title}</p>
                      <Badge className={`${priority.class} text-[10px] px-1.5 py-0`}>{priority.label}</Badge>
                      {alert.action_required && <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] px-1.5 py-0">Ação Necessária</Badge>}
                    </div>
                    <p className="text-sm text-white/40">{alert.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-white/20" />
                        <p className="text-[11px] text-white/20">{new Date(alert.created_at).toLocaleString('pt-BR')}</p>
                      </div>
                      <Badge className="bg-white/[0.03] text-white/30 border-white/[0.06] text-[10px]">{alert.category?.replace(/_/g, ' ')}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
