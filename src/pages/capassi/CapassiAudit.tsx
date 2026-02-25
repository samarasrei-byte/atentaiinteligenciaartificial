import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Shield } from 'lucide-react';

export default function CapassiAudit() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setLogs(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Auditoria</h2>
        <p className="text-sm text-white/40">Logs de atividade — somente leitura</p>
      </div>

      <Card className="bg-[#0B0F1A] border-[#372938]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#55FFAA]" />
            {logs.length} registros
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-white/40">Carregando...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#372938' }}>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/40">Data</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/40">Ação</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/40">Rota</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/40">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: '#372938' }}>
                      <td className="py-3 px-4 text-sm text-white/60">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-sm text-white/80">{log.action_type}</td>
                      <td className="py-3 px-4 text-sm text-white/50">{log.route_attempted || '-'}</td>
                      <td className="py-3 px-4">
                        <Badge className={log.success ? 'bg-[#55FFAA]/10 text-[#55FFAA] border-[#55FFAA]/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}>
                          {log.success ? 'OK' : 'Falha'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
