import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Bell, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export default function CapassiAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('service_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      setAlerts(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const getIcon = (type: string) => {
    if (type.includes('exceeded')) return <AlertTriangle className="h-5 w-5 text-red-400" />;
    if (type.includes('warning')) return <Bell className="h-5 w-5 text-amber-400" />;
    return <Info className="h-5 w-5 text-blue-400" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Alertas</h2>
        <p className="text-sm text-white/40">Notificações e alertas do sistema</p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-white/40">Carregando...</p>
        ) : alerts.length === 0 ? (
          <Card className="bg-[#0B0F1A] border-[#372938]">
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-[#55FFAA]/30" />
              <p className="text-white/40">Nenhum alerta no momento</p>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className="bg-[#0B0F1A] border-[#372938] hover:border-[#55FFAA]/20 transition-colors">
              <CardContent className="p-4 flex items-start gap-4">
                {getIcon(alert.notification_type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{alert.title}</p>
                  <p className="text-sm text-white/50 mt-1">{alert.message}</p>
                  <p className="text-xs text-white/30 mt-2">
                    {new Date(alert.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <Badge className="bg-white/5 text-white/40 border-[#372938] shrink-0">
                  {alert.service_type}
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
