import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { 
  Inbox, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User,
  Building2,
  Scale,
  Shield,
  FileText,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Request {
  id: string;
  type: 'credit_repair' | 'fiscal' | 'ir' | 'certificate' | 'company_opening';
  client_name: string;
  status: string;
  created_at: string;
  responsible?: string;
  priority: 'low' | 'medium' | 'high';
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  analyzing: { label: 'Em Análise', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: AlertCircle },
  completed: { label: 'Concluído', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  in_progress: { label: 'Em Andamento', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: AlertCircle },
};

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  credit_repair: { label: 'Limpa Nome', icon: Shield, color: 'text-emerald-600' },
  fiscal: { label: 'Análise Fiscal', icon: Scale, color: 'text-violet-600' },
  ir: { label: 'Declaração IR', icon: FileText, color: 'text-blue-600' },
  certificate: { label: 'Certidão', icon: FileText, color: 'text-orange-600' },
  company_opening: { label: 'Abertura Empresa', icon: Building2, color: 'text-pink-600' },
};

export const BIRequestsInbox: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      
      // Fetch all types of requests
      const [creditRepair, fiscal, ir, certificates, companyOpening] = await Promise.all([
        supabase.from('credit_repair_requests').select('id, full_name, status, created_at').order('created_at', { ascending: false }).limit(50),
        supabase.from('fiscal_analysis_requests').select('id, full_name, status, created_at').order('created_at', { ascending: false }).limit(50),
        supabase.from('ir_requests').select('id, full_name, status, created_at').order('created_at', { ascending: false }).limit(50),
        supabase.from('certificate_requests').select('id, status, created_at, user_id').order('created_at', { ascending: false }).limit(50),
        supabase.from('company_opening_requests').select('id, full_name, status, created_at').order('created_at', { ascending: false }).limit(50),
      ]);

      const allRequests: Request[] = [
        ...(creditRepair.data || []).map(r => ({
          id: r.id,
          type: 'credit_repair' as const,
          client_name: r.full_name,
          status: r.status,
          created_at: r.created_at,
          responsible: 'Guilherme', // Limpa Nome é responsabilidade do Guilherme
          priority: 'high' as const
        })),
        ...(fiscal.data || []).map(r => ({
          id: r.id,
          type: 'fiscal' as const,
          client_name: r.full_name,
          status: r.status,
          created_at: r.created_at,
          responsible: 'Guilherme',
          priority: 'medium' as const
        })),
        ...(ir.data || []).map(r => ({
          id: r.id,
          type: 'ir' as const,
          client_name: r.full_name,
          status: r.status,
          created_at: r.created_at,
          responsible: 'Guilherme',
          priority: 'medium' as const
        })),
        ...(certificates.data || []).map(r => ({
          id: r.id,
          type: 'certificate' as const,
          client_name: 'Cliente',
          status: r.status,
          created_at: r.created_at,
          responsible: 'Guilherme',
          priority: 'low' as const
        })),
        ...(companyOpening.data || []).map(r => ({
          id: r.id,
          type: 'company_opening' as const,
          client_name: r.full_name,
          status: r.status,
          created_at: r.created_at,
          responsible: 'Guilherme',
          priority: 'high' as const
        })),
      ];

      // Sort by date
      allRequests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setRequests(allRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesType = typeFilter === 'all' || r.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const inProgressCount = requests.filter(r => ['analyzing', 'in_progress'].includes(r.status)).length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100">
                <Inbox className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{requests.length}</p>
                <p className="text-sm text-slate-500">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
                <p className="text-sm text-slate-500">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{inProgressCount}</p>
                <p className="text-sm text-slate-500">Em Análise</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <User className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">Guilherme</p>
                <p className="text-sm text-slate-500">Limpa Nome • Fiscal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Inbox className="h-5 w-5 text-indigo-600" />
            Inbox de Solicitações
          </CardTitle>
          <CardDescription>
            Todas as solicitações dos usuários em um só lugar • Supervisão humana obrigatória
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-50 border-slate-200"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200">
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
              <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200">
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
              <div className="text-center py-8 text-slate-500">Carregando...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-slate-500">Nenhuma solicitação encontrada</div>
            ) : (
              filteredRequests.map((request) => {
                const TypeIcon = typeConfig[request.type]?.icon || FileText;
                const typeInfo = typeConfig[request.type];
                const statusInfo = statusConfig[request.status] || statusConfig.pending;
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={`${request.type}-${request.id}`}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-lg bg-white border border-slate-200 ${typeInfo?.color}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{request.client_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">{typeInfo?.label}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-500">
                            {format(new Date(request.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-slate-500">Responsável</p>
                        <p className="text-sm font-medium text-slate-700">{request.responsible}</p>
                      </div>
                      <Badge className={`${statusInfo.color} border gap-1`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </Badge>
                      <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
