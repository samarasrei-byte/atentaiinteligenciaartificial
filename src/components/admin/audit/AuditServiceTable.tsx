import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  Download,
  FileText,
  Shield,
  Scale,
  Building2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface AuditServiceRecord {
  id: string;
  service_label: '[LIMPA_NOME]' | '[ANALISE_FISCAL]' | '[BI]' | '[IR]' | '[CERTIDAO]' | '[ABERTURA]';
  service_type: string;
  client_name: string;
  client_email: string;
  status: string;
  payment_status: string;
  amount_cents: number;
  created_at: string;
  completed_at: string | null;
  responsible: string;
}

interface AuditServiceTableProps {
  records: AuditServiceRecord[];
  loading: boolean;
  onExport?: () => void;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  analyzing: { label: 'Em Análise', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: AlertCircle },
  in_progress: { label: 'Em Andamento', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: AlertCircle },
  completed: { label: 'Concluído', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  paid: { label: 'Pago', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  failed: { label: 'Falhou', color: 'bg-red-50 text-red-600 border-red-200' },
  refunded: { label: 'Reembolsado', color: 'bg-slate-50 text-slate-600 border-slate-200' },
};

const serviceLabelConfig: Record<string, { color: string; icon: React.ElementType }> = {
  '[LIMPA_NOME]': { color: 'bg-emerald-100 text-emerald-700', icon: Shield },
  '[ANALISE_FISCAL]': { color: 'bg-violet-100 text-violet-700', icon: Scale },
  '[BI]': { color: 'bg-indigo-100 text-indigo-700', icon: FileText },
  '[IR]': { color: 'bg-blue-100 text-blue-700', icon: FileText },
  '[CERTIDAO]': { color: 'bg-orange-100 text-orange-700', icon: FileText },
  '[ABERTURA]': { color: 'bg-pink-100 text-pink-700', icon: Building2 },
};

const formatCurrency = (cents: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

export const AuditServiceTable: React.FC<AuditServiceTableProps> = ({ 
  records, 
  loading,
  onExport 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesService = serviceFilter === 'all' || record.service_label === serviceFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || record.payment_status === paymentFilter;
    const matchesDate = !dateFilter || record.created_at.startsWith(dateFilter);
    
    return matchesSearch && matchesService && matchesStatus && matchesPayment && matchesDate;
  });

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Auditoria Detalhada de Serviços
            </CardTitle>
            <CardDescription>
              Todos os serviços executados com filtros por etiqueta, cliente, status e pagamento
            </CardDescription>
          </div>
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por cliente, email ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200"
            />
          </div>
          
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Serviço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os serviços</SelectItem>
              <SelectItem value="[LIMPA_NOME]">[LIMPA_NOME]</SelectItem>
              <SelectItem value="[ANALISE_FISCAL]">[ANALISE_FISCAL]</SelectItem>
              <SelectItem value="[BI]">[BI]</SelectItem>
              <SelectItem value="[IR]">[IR]</SelectItem>
              <SelectItem value="[CERTIDAO]">[CERTIDAO]</SelectItem>
              <SelectItem value="[ABERTURA]">[ABERTURA]</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="analyzing">Em Análise</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="failed">Falhou</SelectItem>
              <SelectItem value="refunded">Reembolsado</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-[160px] bg-slate-50 border-slate-200"
          />
        </div>

        {/* Table */}
        <ScrollArea className="h-[500px] rounded-lg border border-slate-200">
          <Table>
            <TableHeader className="sticky top-0 bg-slate-50">
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-600 font-semibold">Etiqueta</TableHead>
                <TableHead className="text-slate-600 font-semibold">Cliente</TableHead>
                <TableHead className="text-slate-600 font-semibold">Status</TableHead>
                <TableHead className="text-slate-600 font-semibold">Pagamento</TableHead>
                <TableHead className="text-slate-600 font-semibold">Valor</TableHead>
                <TableHead className="text-slate-600 font-semibold">Data</TableHead>
                <TableHead className="text-slate-600 font-semibold">Responsável</TableHead>
                <TableHead className="text-slate-600 font-semibold w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => {
                  const labelConfig = serviceLabelConfig[record.service_label];
                  const LabelIcon = labelConfig?.icon || FileText;
                  const status = statusConfig[record.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  const payment = paymentStatusConfig[record.payment_status] || paymentStatusConfig.pending;

                  return (
                    <TableRow key={record.id} className="border-slate-100 hover:bg-slate-50">
                      <TableCell>
                        <Badge className={`${labelConfig?.color} border-0 text-xs font-mono gap-1`}>
                          <LabelIcon className="h-3 w-3" />
                          {record.service_label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{record.client_name}</p>
                          <p className="text-xs text-slate-500">{record.client_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${status.color} border gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${payment.color} text-xs`}>
                          {payment.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {formatCurrency(record.amount_cents)}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {format(new Date(record.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        <br />
                        <span className="text-xs text-slate-400">
                          {format(new Date(record.created_at), "HH:mm", { locale: ptBR })}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {record.responsible}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        <div className="text-center text-slate-500 text-sm mt-4">
          Mostrando {filteredRecords.length} de {records.length} registros
        </div>
      </CardContent>
    </Card>
  );
};
