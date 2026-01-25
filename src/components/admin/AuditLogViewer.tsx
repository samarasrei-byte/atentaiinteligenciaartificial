import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  Filter
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
  ip_address: string | null;
  user_agent: string | null;
  success: boolean;
  failure_reason: string | null;
  metadata: any;
  created_at: string;
}

const actionTypeLabels: Record<string, { label: string; color: string }> = {
  login_success: { label: 'Login OK', color: 'bg-green-500' },
  login_failed: { label: 'Login Falhou', color: 'bg-red-500' },
  logout: { label: 'Logout', color: 'bg-slate-500' },
  route_access_allowed: { label: 'Acesso Permitido', color: 'bg-blue-500' },
  route_access_denied: { label: 'Acesso Negado', color: 'bg-red-500' },
  admin_action: { label: 'Ação Admin', color: 'bg-purple-500' },
  role_change: { label: 'Mudança de Papel', color: 'bg-orange-500' },
  profile_update: { label: 'Atualização Perfil', color: 'bg-cyan-500' },
  subscription_change: { label: 'Mudança Assinatura', color: 'bg-emerald-500' },
  service_purchase: { label: 'Compra Serviço', color: 'bg-pink-500' },
  partner_action: { label: 'Ação Parceiro', color: 'bg-indigo-500' },
  affiliate_action: { label: 'Ação Afiliado', color: 'bg-violet-500' },
};

const AuditLogViewer = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterSuccess, setFilterSuccess] = useState<string>('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filterAction !== 'all') {
        query = query.eq('action_type', filterAction);
      }

      if (filterSuccess !== 'all') {
        query = query.eq('success', filterSuccess === 'true');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit logs:', error);
        return;
      }

      setLogs(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('audit_logs_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_logs' },
        (payload) => {
          setLogs(prev => [payload.new as AuditLog, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filterAction, filterSuccess]);

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.metadata?.user_email?.toLowerCase().includes(searchLower) ||
      log.action_type?.toLowerCase().includes(searchLower) ||
      log.route_attempted?.toLowerCase().includes(searchLower) ||
      log.resource_type?.toLowerCase().includes(searchLower)
    );
  });

  const getActionBadge = (actionType: string) => {
    const config = actionTypeLabels[actionType] || { label: actionType, color: 'bg-gray-500' };
    return (
      <Badge className={`${config.color} text-white text-xs`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-white">Logs de Auditoria</CardTitle>
              <CardDescription className="text-white/60">
                Monitoramento de acessos e ações do sistema
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Buscar por email, rota ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
          </div>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tipo de ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              {Object.entries(actionTypeLabels).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterSuccess} onValueChange={setFilterSuccess}>
            <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Sucesso</SelectItem>
              <SelectItem value="false">Falha</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs Table */}
        <ScrollArea className="h-[500px] rounded-lg border border-white/10">
          <Table>
            <TableHeader className="sticky top-0 bg-slate-900/95 backdrop-blur">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/60">Status</TableHead>
                <TableHead className="text-white/60">Ação</TableHead>
                <TableHead className="text-white/60">Usuário</TableHead>
                <TableHead className="text-white/60">Rota/Recurso</TableHead>
                <TableHead className="text-white/60">Data/Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-white/40 py-8">
                    Nenhum log encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="border-white/5 hover:bg-white/5">
                    <TableCell>
                      {log.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      {getActionBadge(log.action_type)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-white/40" />
                        <span className="text-white/80 text-sm truncate max-w-[150px]">
                          {log.metadata?.user_email || 'Anônimo'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-white/60 text-sm font-mono">
                        {log.route_attempted || log.resource_type || '-'}
                      </span>
                      {log.failure_reason && (
                        <p className="text-red-400 text-xs mt-1">{log.failure_reason}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-white/50 text-sm">
                        <Clock className="h-3.5 w-3.5" />
                        {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        <div className="text-center text-white/40 text-sm">
          Mostrando {filteredLogs.length} de {logs.length} logs (últimos 100)
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditLogViewer;
