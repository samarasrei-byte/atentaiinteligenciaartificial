import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';

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
}

interface HistoryEntry {
  id: string;
  action_type: string;
  action_description: string;
  created_at: string;
  metadata: Record<string, any> | null;
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

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel('admin-limpa-nome-spreadsheet')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'credit_repair_requests' }, () => fetchRequests())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('credit_repair_requests')
      .select('id, user_id, full_name, cpf, email, phone, birth_date, status, payment_status, contador_notes, created_at, data_submitted_at')
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
    const updates: Partial<CreditRepairRequest> = { status: newStatus };
    
    const { error } = await supabase
      .from('credit_repair_requests')
      .update(updates)
      .eq('id', requestId);

    if (error) {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
    } else {
      toast({ title: 'Status atualizado!' });
      fetchRequests();
    }
    setIsUpdating(false);
  };

  const handleSaveNotes = async () => {
    if (!selectedRequest) return;
    setIsUpdating(true);

    const { error } = await supabase
      .from('credit_repair_requests')
      .update({ contador_notes: notes })
      .eq('id', selectedRequest.id);

    if (error) {
      toast({ title: 'Erro ao salvar observações', variant: 'destructive' });
    } else {
      toast({ title: 'Observações salvas!' });
      setShowNotesDialog(false);
      fetchRequests();
    }
    setIsUpdating(false);
  };

  const openHistoryDialog = async (request: CreditRepairRequest) => {
    setSelectedRequest(request);
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
      pending: { class: 'bg-amber-500/10 text-amber-500', icon: Clock, label: 'Pendente' },
      in_progress: { class: 'bg-blue-500/10 text-blue-500', icon: AlertCircle, label: 'Em Andamento' },
      negotiating: { class: 'bg-purple-500/10 text-purple-500', icon: MessageCircle, label: 'Negociando' },
      completed: { class: 'bg-emerald-500/10 text-emerald-500', icon: CheckCircle, label: 'Concluído' },
      cancelled: { class: 'bg-red-500/10 text-red-500', icon: XCircle, label: 'Cancelado' },
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

  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cpf?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text('Relatório Limpa Nome - Clientes', 14, 22);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, 14, 30);
    doc.text(`Total de clientes: ${filteredRequests.length}`, 14, 36);

    // Table headers
    const startY = 45;
    const headers = ['Nome', 'CPF/CNPJ', 'Nascimento', 'Telefone', 'Envio', 'Status'];
    const colWidths = [45, 35, 25, 30, 25, 25];
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    let xPos = 14;
    headers.forEach((header, i) => {
      doc.text(header, xPos, startY);
      xPos += colWidths[i];
    });

    // Table rows
    doc.setFont('helvetica', 'normal');
    let yPos = startY + 8;
    
    filteredRequests.forEach((req, index) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }

      xPos = 14;
      const row = [
        req.full_name.substring(0, 25),
        req.cpf || '-',
        formatDate(req.birth_date),
        req.phone || '-',
        formatDate(req.data_submitted_at),
        req.status,
      ];

      row.forEach((cell, i) => {
        doc.text(cell, xPos, yPos);
        xPos += colWidths[i];
      });

      yPos += 7;
    });

    doc.save(`limpa-nome-clientes-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast({ title: 'PDF exportado com sucesso!' });
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
                Planilha Única - Limpa Nome
              </CardTitle>
              <CardDescription>{filteredRequests.length} clientes</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-10" 
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="negotiating">Negociando</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchRequests}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button onClick={exportToPDF} className="bg-emerald-600 hover:bg-emerald-700">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Nome</TableHead>
                  <TableHead className="font-semibold">CPF/CNPJ</TableHead>
                  <TableHead className="font-semibold">Data Nasc.</TableHead>
                  <TableHead className="font-semibold">Telefone</TableHead>
                  <TableHead className="font-semibold">Data Envio</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Observações</TableHead>
                  <TableHead className="font-semibold text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum cliente encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{request.full_name}</TableCell>
                      <TableCell className="font-mono text-sm">{request.cpf || '-'}</TableCell>
                      <TableCell>{formatDate(request.birth_date)}</TableCell>
                      <TableCell>{request.phone || '-'}</TableCell>
                      <TableCell>{formatDate(request.data_submitted_at)}</TableCell>
                      <TableCell>
                        <Select 
                          value={request.status} 
                          onValueChange={(v) => handleStatusChange(request.id, v)}
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="in_progress">Em Andamento</SelectItem>
                            <SelectItem value="negotiating">Negociando</SelectItem>
                            <SelectItem value="completed">Concluído</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {request.contador_notes ? (
                          <span className="text-sm text-muted-foreground">{request.contador_notes}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">-</span>
                        )}
                      </TableCell>
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
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-500" />
              Histórico - {selectedRequest?.full_name}
            </DialogTitle>
            <DialogDescription>
              Registro completo de ações e alterações
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Nenhum registro encontrado</p>
            ) : (
              history.map((entry) => (
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
