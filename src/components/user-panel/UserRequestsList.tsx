import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  FileText, 
  Shield, 
  Building2, 
  Scale,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronRight,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Request {
  id: string;
  type: 'credit_repair' | 'fiscal' | 'ir' | 'certificate' | 'company_opening';
  title: string;
  status: string;
  created_at: string;
  responsible: string;
}

interface UserRequestsListProps {
  onSelectRequest: (id: string, type: string) => void;
}

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  credit_repair: { label: 'Limpa Nome', icon: Shield, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  fiscal: { label: 'Análise Fiscal', icon: Scale, color: 'text-violet-600', bgColor: 'bg-violet-100' },
  ir: { label: 'Declaração IR', icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  certificate: { label: 'Certidão', icon: Award, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  company_opening: { label: 'Abertura Empresa', icon: Building2, color: 'text-pink-600', bgColor: 'bg-pink-100' },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  analyzing: { label: 'Em Análise', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: AlertCircle },
  in_progress: { label: 'Em Andamento', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: AlertCircle },
  documents_pending: { label: 'Docs Pendentes', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: FileText },
  negotiating: { label: 'Em Negociação', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: AlertCircle },
  completed: { label: 'Concluído', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  issued: { label: 'Emitido', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  processing: { label: 'Processando', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: AlertCircle },
};

export const UserRequestsList: React.FC<UserRequestsListProps> = ({ onSelectRequest }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const [creditRepair, fiscal, ir, certificates, companyOpening] = await Promise.all([
        supabase.from('credit_repair_requests').select('id, full_name, status, created_at').eq('user_id', user.id),
        supabase.from('fiscal_analysis_requests').select('id, full_name, company_name, status, created_at').eq('user_id', user.id),
        supabase.from('ir_requests').select('id, full_name, fiscal_year, status, created_at').eq('user_id', user.id),
        supabase.from('certificate_requests').select('id, certificate_type, status, created_at').eq('user_id', user.id),
        supabase.from('company_opening_requests').select('id, full_name, recommended_regime, status, created_at').eq('user_id', user.id),
      ]);

      const allRequests: Request[] = [
        ...(creditRepair.data || []).map(r => ({
          id: r.id,
          type: 'credit_repair' as const,
          title: `Limpa Nome - ${r.full_name}`,
          status: r.status,
          created_at: r.created_at,
          responsible: 'Guilherme Mesquita'
        })),
        ...(fiscal.data || []).map(r => ({
          id: r.id,
          type: 'fiscal' as const,
          title: `Análise Fiscal - ${r.company_name || r.full_name}`,
          status: r.status,
          created_at: r.created_at,
          responsible: 'Guilherme Mesquita'
        })),
        ...(ir.data || []).map(r => ({
          id: r.id,
          type: 'ir' as const,
          title: `IR ${r.fiscal_year} - ${r.full_name}`,
          status: r.status,
          created_at: r.created_at,
          responsible: 'Guilherme Mesquita'
        })),
        ...(certificates.data || []).map(r => ({
          id: r.id,
          type: 'certificate' as const,
          title: `Certidão - ${r.certificate_type?.replace('_', ' ').toUpperCase()}`,
          status: r.status,
          created_at: r.created_at,
          responsible: 'Guilherme Barros'
        })),
        ...(companyOpening.data || []).map(r => ({
          id: r.id,
          type: 'company_opening' as const,
          title: `Abertura - ${r.recommended_regime?.toUpperCase() || 'Análise Pendente'}`,
          status: r.status,
          created_at: r.created_at,
          responsible: 'Guilherme Barros'
        })),
      ];

      allRequests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRequests(allRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesType = typeFilter === 'all' || r.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          Minhas Solicitações
        </CardTitle>
        <CardDescription>
          Acompanhe o status de todos os seus serviços
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar solicitação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="analyzing">Em Análise</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="credit_repair">Limpa Nome</SelectItem>
              <SelectItem value="fiscal">Análise Fiscal</SelectItem>
              <SelectItem value="ir">Declaração IR</SelectItem>
              <SelectItem value="certificate">Certidão</SelectItem>
              <SelectItem value="company_opening">Abertura Empresa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Request List */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nenhuma solicitação encontrada</p>
              <p className="text-sm text-slate-400 mt-1">Solicite um novo serviço para começar</p>
            </div>
          ) : (
            filteredRequests.map(request => {
              const typeInfo = typeConfig[request.type];
              const statusInfo = statusConfig[request.status] || statusConfig.pending;
              const TypeIcon = typeInfo?.icon || FileText;
              const StatusIcon = statusInfo.icon;

              return (
                <button
                  key={`${request.type}-${request.id}`}
                  onClick={() => onSelectRequest(request.id, request.type)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${typeInfo?.bgColor} ${typeInfo?.color}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{request.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">
                          {format(new Date(request.created_at), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                        </span>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <User className="h-3 w-3" />
                          {request.responsible}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={`${statusInfo.color} border gap-1`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
