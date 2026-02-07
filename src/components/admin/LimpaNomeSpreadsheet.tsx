import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Search,
  Loader2,
  Shield,
  MessageCircle,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  History,
  FileText,
  Filter,
  CalendarIcon,
  FileSpreadsheet,
} from 'lucide-react';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';

interface CreditRepairRequest {
  id: string;
  user_id: string;
  full_name: string;
  cpf: string | null;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  status: string;
  payment_status: string;
  contador_notes: string | null;
  created_at: string;
  data_submitted_at: string | null;
  updated_at: string;
  final_price_cents: number;
  contador_id: string | null;
}

interface HistoryEntry {
  id: string;
  action_type: string;
  action_description: string;
  created_at: string;
  metadata: Record<string, any> | null;
  performed_by: string | null;
}

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export function LimpaNomeSpreadsheet() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<CreditRepairRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<CreditRepairRequest | null>(null);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [contadores, setContadores] = useState<Record<string, string>>({});
  const [historyDateRange, setHistoryDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  useEffect(() => {
    fetchRequests();
    fetchContadores();

    const channel = supabase
      .channel('admin-limpa-nome-spreadsheet')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'credit_repair_requests' }, () => fetchRequests())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchContadores = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .not('full_name', 'is', null);
    
    if (data) {
      const map: Record<string, string> = {};
      data.forEach(p => { map[p.id] = p.full_name || 'Sem nome'; });
      setContadores(map);
    }
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('credit_repair_requests')
      .select('id, user_id, full_name, cpf, email, phone, birth_date, status, payment_status, contador_notes, created_at, data_submitted_at, updated_at, final_price_cents, contador_id')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requests:', error);
      toast({ title: 'Erro ao carregar dados', variant: 'destructive' });
    } else {
      setRequests(data || []);
    }
    setIsLoading(false);
  };

  const fetchHistory = async (requestId: string) => {
    const { data, error } = await supabase
      .from('credit_repair_history')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching history:', error);
    } else {
      setHistory((data || []).map(item => ({
        ...item,
        metadata: typeof item.metadata === 'object' ? item.metadata as Record<string, any> : {}
      })));
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    setIsUpdating(true);
    const oldRequest = requests.find(r => r.id === requestId);
    
    const { error } = await supabase
      .from('credit_repair_requests')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (error) {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
    } else {
      // Log history
      await supabase.from('credit_repair_history').insert({
        request_id: requestId,
        action_type: 'status_change',
        action_description: `Status alterado de "${oldRequest?.status}" para "${newStatus}"`,
        metadata: { old_status: oldRequest?.status, new_status: newStatus }
      });
      
      toast({ title: 'Status atualizado!' });
      fetchRequests();
    }
    setIsUpdating(false);
  };

  const handleResponsibleChange = async (requestId: string, contadorId: string) => {
    setIsUpdating(true);
    const oldRequest = requests.find(r => r.id === requestId);
    
    const { error } = await supabase
      .from('credit_repair_requests')
      .update({ contador_id: contadorId === 'none' ? null : contadorId, updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (error) {
      toast({ title: 'Erro ao atualizar responsável', variant: 'destructive' });
    } else {
      // Log history
      await supabase.from('credit_repair_history').insert({
        request_id: requestId,
        action_type: 'responsible_change',
        action_description: `Responsável alterado para "${contadores[contadorId] || 'Nenhum'}"`,
        metadata: { 
          old_responsible: oldRequest?.contador_id, 
          new_responsible: contadorId === 'none' ? null : contadorId 
        }
      });
      
      toast({ title: 'Responsável atualizado!' });
      fetchRequests();
    }
    setIsUpdating(false);
  };

  const handleSaveNotes = async () => {
    if (!selectedRequest) return;
    setIsUpdating(true);

    const { error } = await supabase
      .from('credit_repair_requests')
      .update({ contador_notes: notes, updated_at: new Date().toISOString() })
      .eq('id', selectedRequest.id);

    if (error) {
      toast({ title: 'Erro ao salvar observações', variant: 'destructive' });
    } else {
      // Log history
      await supabase.from('credit_repair_history').insert({
        request_id: selectedRequest.id,
        action_type: 'notes_update',
        action_description: 'Observações atualizadas',
        metadata: { notes_preview: notes?.substring(0, 100) }
      });
      
      toast({ title: 'Observações salvas!' });
      setShowNotesDialog(false);
      fetchRequests();
    }
    setIsUpdating(false);
  };

  const openHistoryDialog = async (request: CreditRepairRequest) => {
    setSelectedRequest(request);
    setHistoryDateRange({ from: undefined, to: undefined });
    await fetchHistory(request.id);
    setShowHistoryDialog(true);
  };

  const openNotesDialog = (request: CreditRepairRequest) => {
    setSelectedRequest(request);
    setNotes(request.contador_notes || '');
    setShowNotesDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { class: string; icon: any; label: string }> = {
      pending: { class: 'bg-amber-500/10 text-amber-500', icon: Clock, label: 'Novo' },
      in_progress: { class: 'bg-blue-500/10 text-blue-500', icon: AlertCircle, label: 'Em Análise' },
      negotiating: { class: 'bg-purple-500/10 text-purple-500', icon: MessageCircle, label: 'Aprovado' },
      completed: { class: 'bg-emerald-500/10 text-emerald-500', icon: CheckCircle, label: 'Concluído' },
      cancelled: { class: 'bg-red-500/10 text-red-500', icon: XCircle, label: 'Recusado' },
    };
    const cfg = config[status] || config.pending;
    const Icon = cfg.icon;
    return <Badge variant="outline" className={cfg.class}><Icon className="h-3 w-3 mr-1" />{cfg.label}</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchesSearch = 
        r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cpf?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone?.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      
      // Date range filter
      let matchesDate = true;
      if (dateRange.from || dateRange.to) {
        const entryDate = r.data_submitted_at ? new Date(r.data_submitted_at) : new Date(r.created_at);
        if (dateRange.from && dateRange.to) {
          matchesDate = isWithinInterval(entryDate, { 
            start: startOfDay(dateRange.from), 
            end: endOfDay(dateRange.to) 
          });
        } else if (dateRange.from) {
          matchesDate = entryDate >= startOfDay(dateRange.from);
        } else if (dateRange.to) {
          matchesDate = entryDate <= endOfDay(dateRange.to);
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [requests, searchTerm, statusFilter, dateRange]);

  const filteredHistory = useMemo(() => {
    if (!historyDateRange.from && !historyDateRange.to) return history;
    
    return history.filter(entry => {
      const entryDate = new Date(entry.created_at);
      if (historyDateRange.from && historyDateRange.to) {
        return isWithinInterval(entryDate, { 
          start: startOfDay(historyDateRange.from), 
          end: endOfDay(historyDateRange.to) 
        });
      } else if (historyDateRange.from) {
        return entryDate >= startOfDay(historyDateRange.from);
      } else if (historyDateRange.to) {
        return entryDate <= endOfDay(historyDateRange.to);
      }
      return true;
    });
  }, [history, historyDateRange]);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Novo',
      in_progress: 'Em Análise',
      negotiating: 'Aprovado',
      completed: 'Concluído',
      cancelled: 'Recusado',
    };
    return labels[status] || status;
  };

  const prepareExportData = () => {
    return filteredRequests.map(req => ({
      'Nome Completo': req.full_name,
      'CPF': req.cpf || '-',
      'Data de Nascimento': formatDate(req.birth_date),
      'Email': req.email || '-',
      'Telefone': req.phone || '-',
      'Preço': formatCurrency(req.final_price_cents),
      'Status': getStatusLabel(req.status),
      'Responsável': req.contador_id ? (contadores[req.contador_id] || '-') : '-',
      'Data de Entrada': formatDate(req.data_submitted_at || req.created_at),
      'Última Atualização': formatDateTime(req.updated_at),
    }));
  };

  const exportToCSV = () => {
    const data = prepareExportData();
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws, { FS: ';' });
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `limpa-nome-leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    
    toast({ title: 'CSV exportado com sucesso!' });
  };

  const exportToXLSX = () => {
    const data = prepareExportData();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads Limpa Nome');
    
    // Auto-width columns
    const colWidths = Object.keys(data[0] || {}).map(key => ({ wch: Math.max(key.length, 15) }));
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, `limpa-nome-leads-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    
    toast({ title: 'XLSX exportado com sucesso!' });
  };

  const exportHistoryToXLSX = () => {
    const data = filteredHistory.map(entry => ({
      'Tipo de Ação': entry.action_type.replace('_', ' ').toUpperCase(),
      'Descrição': entry.action_description,
      'Data/Hora': formatDateTime(entry.created_at),
      'Realizado Por': entry.performed_by ? (contadores[entry.performed_by] || entry.performed_by) : 'Sistema',
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Histórico');
    
    XLSX.writeFile(wb, `historico-${selectedRequest?.full_name || 'lead'}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    
    toast({ title: 'Histórico exportado!' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-500" />
                Tabela de Leads - Limpa Nome
              </CardTitle>
              <CardDescription>{filteredRequests.length} leads encontrados</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-10" 
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Novo</SelectItem>
                  <SelectItem value="in_progress">Em Análise</SelectItem>
                  <SelectItem value="negotiating">Aprovado</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Recusado</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Date Range Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[200px] justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        `${format(dateRange.from, "dd/MM")} - ${format(dateRange.to, "dd/MM")}`
                      ) : format(dateRange.from, "dd/MM/yyyy")
                    ) : "Filtrar período"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                  <div className="p-2 border-t">
                    <Button variant="ghost" size="sm" onClick={() => setDateRange({ from: undefined, to: undefined })}>
                      Limpar filtro
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button variant="outline" size="icon" onClick={fetchRequests}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <Button onClick={exportToCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button onClick={exportToXLSX} className="bg-emerald-600 hover:bg-emerald-700">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                XLSX
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Nome Completo</TableHead>
                  <TableHead className="font-semibold">CPF</TableHead>
                  <TableHead className="font-semibold">Data Nasc.</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Telefone</TableHead>
                  <TableHead className="font-semibold">Preço</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Responsável</TableHead>
                  <TableHead className="font-semibold">Data Entrada</TableHead>
                  <TableHead className="font-semibold">Última Atualização</TableHead>
                  <TableHead className="font-semibold text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      Nenhum lead encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{request.full_name}</TableCell>
                      <TableCell className="font-mono text-sm">{request.cpf || '-'}</TableCell>
                      <TableCell>{formatDate(request.birth_date)}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{request.email || '-'}</TableCell>
                      <TableCell>{request.phone || '-'}</TableCell>
                      <TableCell className="font-medium text-emerald-600">
                        {formatCurrency(request.final_price_cents)}
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={request.status} 
                          onValueChange={(v) => handleStatusChange(request.id, v)}
                        >
                          <SelectTrigger className="w-[130px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Novo</SelectItem>
                            <SelectItem value="in_progress">Em Análise</SelectItem>
                            <SelectItem value="negotiating">Aprovado</SelectItem>
                            <SelectItem value="completed">Concluído</SelectItem>
                            <SelectItem value="cancelled">Recusado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={request.contador_id || 'none'} 
                          onValueChange={(v) => handleResponsibleChange(request.id, v)}
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue placeholder="Selecionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            {Object.entries(contadores).map(([id, name]) => (
                              <SelectItem key={id} value={id}>{name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{formatDate(request.data_submitted_at || request.created_at)}</TableCell>
                      <TableCell>{formatDateTime(request.updated_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openNotesDialog(request)}
                            title="Editar observações"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openHistoryDialog(request)}
                            title="Ver histórico"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(`/chat/guilherme?servico=limpanome&request=${request.id}`, '_blank')}
                            title="Abrir chat"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-500" />
              Histórico - {selectedRequest?.full_name}
            </DialogTitle>
            <DialogDescription>
              Registro completo de ações e alterações (nunca sobrescrito)
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center gap-2 mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("justify-start text-left font-normal", !historyDateRange.from && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {historyDateRange.from ? (
                    historyDateRange.to ? (
                      `${format(historyDateRange.from, "dd/MM")} - ${format(historyDateRange.to, "dd/MM")}`
                    ) : format(historyDateRange.from, "dd/MM/yyyy")
                  ) : "Filtrar período"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  selected={{ from: historyDateRange.from, to: historyDateRange.to }}
                  onSelect={(range) => setHistoryDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={2}
                  locale={ptBR}
                />
                <div className="p-2 border-t">
                  <Button variant="ghost" size="sm" onClick={() => setHistoryDateRange({ from: undefined, to: undefined })}>
                    Limpar
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" size="sm" onClick={exportHistoryToXLSX}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar XLSX
            </Button>
          </div>
          
          <div className="space-y-3">
            {filteredHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Nenhum registro encontrado</p>
            ) : (
              filteredHistory.map((entry) => (
                <div key={entry.id} className="p-3 bg-muted/30 rounded-lg border">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="text-xs">
                      {entry.action_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(entry.created_at)}
                    </span>
                  </div>
                  <p className="text-sm">{entry.action_description}</p>
                  {entry.performed_by && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Por: {contadores[entry.performed_by] || entry.performed_by}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Observações</DialogTitle>
            <DialogDescription>{selectedRequest?.full_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações internas..."
              rows={5}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveNotes} disabled={isUpdating}>
                {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}