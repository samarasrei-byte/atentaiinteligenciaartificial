import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { 
  History, 
  Search, 
  Filter,
  LogIn,
  LogOut,
  FileText,
  CheckCircle,
  XCircle,
  User,
  Shield,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditLog {
  id: string;
  user_id: string | null;
  action_type: string;
  resource_type: string | null;
  resource_id: string | null;
  route_attempted: string | null;
  success: boolean;
  failure_reason: string | null;
  metadata: any;
  created_at: string;
}

const actionConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  login_success: { icon: LogIn, label: 'Login realizado', color: 'bg-emerald-100 text-emerald-700' },
  login_failed: { icon: XCircle, label: 'Login falhou', color: 'bg-red-100 text-red-700' },
  logout: { icon: LogOut, label: 'Logout', color: 'bg-slate-100 text-slate-700' },
  route_access_allowed: { icon: CheckCircle, label: 'Acesso permitido', color: 'bg-emerald-100 text-emerald-700' },
  route_access_denied: { icon: XCircle, label: 'Acesso negado', color: 'bg-red-100 text-red-700' },
  dashboard_route: { icon: FileText, label: 'Navegação', color: 'bg-blue-100 text-blue-700' },
  profile_update: { icon: User, label: 'Perfil atualizado', color: 'bg-indigo-100 text-indigo-700' },
  service_purchase: { icon: Shield, label: 'Serviço contratado', color: 'bg-violet-100 text-violet-700' },
  admin_action: { icon: Shield, label: 'Ação admin', color: 'bg-amber-100 text-amber-700' },
  document_expiration_cron: { icon: FileText, label: 'Expiração docs', color: 'bg-orange-100 text-orange-700' },
};

export const AuditActionHistory: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [successFilter, setSuccessFilter] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (!error && data) {
        setLogs(data);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.metadata?.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.route_attempted?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action_type === actionFilter;
    const matchesSuccess = successFilter === 'all' || 
      (successFilter === 'true' ? log.success : !log.success);
    
    return matchesSearch && matchesAction && matchesSuccess;
  });

  // Group by date
  const groupedLogs = filteredLogs.reduce((groups, log) => {
    const date = format(new Date(log.created_at), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {} as Record<string, AuditLog[]>);

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-600" />
              Histórico Completo de Ações
            </CardTitle>
            <CardDescription>
              Quem fez o quê, quando e em qual serviço • Auditoria 100% rastreável
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por email, ação ou rota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200"
            />
          </div>
          
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tipo de ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              {Object.entries(actionConfig).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={successFilter} onValueChange={setSuccessFilter}>
            <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Resultado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Sucesso</SelectItem>
              <SelectItem value="false">Falha</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Timeline */}
        <ScrollArea className="h-[600px]">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Carregando histórico...</div>
          ) : Object.keys(groupedLogs).length === 0 ? (
            <div className="text-center py-8 text-slate-500">Nenhuma ação encontrada</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedLogs).map(([date, dayLogs]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-slate-500 mb-3 sticky top-0 bg-white py-2">
                    {format(new Date(date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    <Badge variant="outline" className="ml-2 text-xs">
                      {dayLogs.length} ações
                    </Badge>
                  </h3>
                  <div className="space-y-2">
                    {dayLogs.map(log => {
                      const config = actionConfig[log.action_type] || {
                        icon: FileText,
                        label: log.action_type,
                        color: 'bg-slate-100 text-slate-700'
                      };
                      const Icon = config.icon;

                      return (
                        <div
                          key={log.id}
                          className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                        >
                          <div className={`p-2 rounded-lg ${config.color} shrink-0`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-slate-900 text-sm">{config.label}</p>
                              {log.success ? (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  OK
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Falhou
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                              <User className="h-3 w-3" />
                              <span>{log.metadata?.user_email || 'Sistema'}</span>
                              {log.route_attempted && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono">{log.route_attempted}</span>
                                </>
                              )}
                            </div>
                            {log.failure_reason && (
                              <p className="text-xs text-red-600 mt-1">{log.failure_reason}</p>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 shrink-0">
                            {format(new Date(log.created_at), 'HH:mm:ss')}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="text-center text-slate-500 text-sm mt-4">
          Mostrando {filteredLogs.length} de {logs.length} ações (últimas 500)
        </div>
      </CardContent>
    </Card>
  );
};
