import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Shield,
  RefreshCw,
  Lock,
  Calendar
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DocumentStats {
  total: number;
  active: number;
  expiringSoon: number;
  expired: number;
  expirationLogs: number;
}

interface ExpirationLog {
  id: string;
  document_name: string;
  document_type: string;
  expired_at: string;
  deleted_from_storage: boolean;
  user_id: string;
}

export const AuditDocumentGovernance: React.FC = () => {
  const [stats, setStats] = useState<DocumentStats>({
    total: 0,
    active: 0,
    expiringSoon: 0,
    expired: 0,
    expirationLogs: 0
  });
  const [expirationLogs, setExpirationLogs] = useState<ExpirationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocumentStats();
  }, []);

  const fetchDocumentStats = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Fetch document counts
      const [allDocs, expiringDocs, expiredDocs, logs] = await Promise.all([
        supabase
          .from('company_opening_documents')
          .select('id', { count: 'exact', head: true })
          .is('deleted_at', null),
        supabase
          .from('company_opening_documents')
          .select('id', { count: 'exact', head: true })
          .is('deleted_at', null)
          .lte('expires_at', sevenDaysFromNow.toISOString())
          .gt('expires_at', now.toISOString()),
        supabase
          .from('company_opening_documents')
          .select('id', { count: 'exact', head: true })
          .not('deleted_at', 'is', null),
        supabase
          .from('document_expiration_logs')
          .select('*')
          .order('expired_at', { ascending: false })
          .limit(50)
      ]);

      setStats({
        total: (allDocs.count || 0) + (expiredDocs.count || 0),
        active: allDocs.count || 0,
        expiringSoon: expiringDocs.count || 0,
        expired: expiredDocs.count || 0,
        expirationLogs: logs.data?.length || 0
      });

      setExpirationLogs(logs.data || []);
    } catch (error) {
      console.error('Error fetching document stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const activePercentage = stats.total > 0 ? (stats.active / stats.total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Governance Header */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-white/10">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Governança de Documentos</h2>
              <p className="text-white/60">Regra fixa: 60 dias após conclusão do serviço</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-white/60" />
                <span className="text-sm text-white/60">Total Docs</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            
            <div className="bg-emerald-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-emerald-300">Ativos</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
            </div>
            
            <div className="bg-amber-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-amber-300">Expirando (7d)</span>
              </div>
              <p className="text-2xl font-bold text-amber-400">{stats.expiringSoon}</p>
            </div>
            
            <div className="bg-red-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-300">Expirados</span>
              </div>
              <p className="text-2xl font-bold text-red-400">{stats.expired}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules Card */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5 text-slate-600" />
            Regras de Retenção de Documentos
          </CardTitle>
          <CardDescription>
            Política de governança LGPD-compliant implementada automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold text-emerald-800">60 Dias</span>
              </div>
              <p className="text-sm text-emerald-700">
                Documentos disponíveis por 60 dias após conclusão do serviço
              </p>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span className="font-semibold text-amber-800">Aviso 7 Dias</span>
              </div>
              <p className="text-sm text-amber-700">
                Notificações automáticas 7 dias antes da expiração
              </p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-red-800">Após Expiração</span>
              </div>
              <p className="text-sm text-red-700">
                Documento indisponível. Apenas metadados visíveis. <strong>Nenhum admin pode baixar.</strong>
              </p>
            </div>
          </div>

          {/* Active vs Expired Progress */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Taxa de Documentos Ativos</span>
              <span className="text-sm font-bold text-emerald-600">{activePercentage.toFixed(1)}%</span>
            </div>
            <Progress value={activePercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Expiration Logs */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Log de Expirações
              </CardTitle>
              <CardDescription>
                Registro auditável de todos os documentos expirados
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchDocumentStats} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Carregando...</div>
          ) : expirationLogs.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
              <p className="text-slate-500">Nenhum documento expirado ainda</p>
              <p className="text-sm text-slate-400">O sistema está funcionando corretamente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expirationLogs.map(log => (
                <div 
                  key={log.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-100">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{log.document_name}</p>
                      <p className="text-xs text-slate-500">
                        Tipo: {log.document_type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">
                      {format(new Date(log.expired_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={log.deleted_from_storage 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                      }
                    >
                      {log.deleted_from_storage ? 'Removido do storage' : 'Pendente remoção'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
