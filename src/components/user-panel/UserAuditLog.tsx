import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  History, 
  LogIn, 
  LogOut, 
  FileText, 
  Settings,
  CreditCard,
  Shield,
  User,
  Check,
  X,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditEntry {
  id: string;
  action_type: string;
  resource_type: string | null;
  success: boolean;
  created_at: string;
  metadata: any;
}

const actionConfig: Record<string, { icon: React.ElementType; label: string; color: string; bgColor: string }> = {
  login_success: { icon: LogIn, label: 'Login realizado', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  login_failed: { icon: X, label: 'Tentativa de login falhou', color: 'text-red-600', bgColor: 'bg-red-100' },
  logout: { icon: LogOut, label: 'Logout realizado', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  profile_update: { icon: User, label: 'Perfil atualizado', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  service_purchase: { icon: CreditCard, label: 'Serviço contratado', color: 'text-violet-600', bgColor: 'bg-violet-100' },
  subscription_change: { icon: Shield, label: 'Assinatura alterada', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  dashboard_route: { icon: FileText, label: 'Acesso ao painel', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  route_access_allowed: { icon: Check, label: 'Acesso permitido', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  route_access_denied: { icon: X, label: 'Acesso negado', color: 'text-red-600', bgColor: 'bg-red-100' },
};

export const UserAuditLog: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAuditLog();
    }
  }, [user]);

  const fetchAuditLog = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('id, action_type, resource_type, success, created_at, metadata')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setEntries(data);
      }
    } catch (error) {
      console.error('Error fetching audit log:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group entries by date
  const groupedEntries = entries.reduce((groups, entry) => {
    const date = format(new Date(entry.created_at), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, AuditEntry[]>);

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5 text-indigo-600" />
          Histórico de Atividades
        </CardTitle>
        <CardDescription>
          Registro completo de ações na sua conta - 100% auditável pelo BI+ Contabilidade™
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Nenhuma atividade registrada</p>
            <p className="text-sm text-slate-400 mt-1">
              Suas ações serão registradas aqui automaticamente
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEntries).map(([date, dayEntries]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-slate-500 mb-3">
                  {format(new Date(date), "EEEE, d 'de' MMMM", { locale: ptBR })}
                </h3>
                <div className="space-y-2">
                  {dayEntries.map(entry => {
                    const config = actionConfig[entry.action_type] || {
                      icon: FileText,
                      label: entry.action_type,
                      color: 'text-slate-600',
                      bgColor: 'bg-slate-100'
                    };
                    const Icon = config.icon;

                    return (
                      <div
                        key={entry.id}
                        className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200"
                      >
                        <div className={`p-2 rounded-lg ${config.bgColor} shrink-0`}>
                          <Icon className={`h-4 w-4 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900 text-sm">{config.label}</p>
                            {entry.success ? (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                                <Check className="h-3 w-3 mr-1" />
                                Sucesso
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                <X className="h-3 w-3 mr-1" />
                                Falhou
                              </Badge>
                            )}
                          </div>
                          {entry.resource_type && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              Recurso: {entry.resource_type}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 shrink-0">
                          {format(new Date(entry.created_at), 'HH:mm')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
