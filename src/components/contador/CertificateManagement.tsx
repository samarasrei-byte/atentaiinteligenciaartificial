import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Loader2,
  Download,
  RefreshCw,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface CertificateRequest {
  id: string;
  user_id: string;
  certificate_type: string;
  status: string;
  payment_status: string;
  amount_cents: number;
  document_url: string | null;
  document_name: string | null;
  notes: string | null;
  rejection_reason: string | null;
  requested_at: string;
  processed_at: string | null;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

const CERTIFICATE_TYPES: Record<string, string> = {
  negativa_debitos_federais: 'Certidão Negativa de Débitos Federais',
  regularidade_fiscal_estadual: 'Certidão de Regularidade Fiscal Estadual',
  regularidade_fiscal_municipal: 'Certidão de Regularidade Fiscal Municipal',
  cndt_trabalhista: 'Certidão Negativa de Débitos Trabalhistas',
  fgts: 'Certidão de Regularidade do FGTS',
  simples_nacional: 'Certidão Simples Nacional',
};

export function CertificateManagement() {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CertificateRequest | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const isAdmin = hasRole('admin');

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('certificate_requests')
        .select('*')
        .order('created_at', { ascending: false });

      // Admins see all, contadores see assigned
      if (!isAdmin) {
        query = query.eq('contador_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch user profiles for display
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, email, full_name')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        
        const enrichedData = data.map(r => ({
          ...r,
          user_email: profileMap.get(r.user_id)?.email || '',
          user_name: profileMap.get(r.user_id)?.full_name || '',
        }));

        setRequests(enrichedData);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching certificate requests:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar as solicitações',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRequests();
    toast({ title: 'Dados atualizados!' });
  };

  const handleAssignToMe = async (requestId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('certificate_requests')
        .update({ 
          contador_id: user.id,
          status: 'processing',
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({ title: 'Certidão atribuída a você!' });
      fetchRequests();
    } catch (error) {
      console.error('Error assigning certificate:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível atribuir a certidão',
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedRequest || !file || !user) return;

    setIsUploading(true);
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedRequest.user_id}/${selectedRequest.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Store file path only - signed URLs will be generated on-demand for security
      // Update request with file path (not public URL)
      const { error: updateError } = await supabase
        .from('certificate_requests')
        .update({
          status: 'completed',
          document_url: fileName, // Store file path, not public URL
          document_name: file.name,
          processed_at: new Date().toISOString(),
        })
        .eq('id', selectedRequest.id);

      if (updateError) throw updateError;

      toast({ title: 'Certidão enviada com sucesso!' });
      setShowUploadDialog(false);
      setSelectedRequest(null);
      setFile(null);
      fetchRequests();
    } catch (error) {
      console.error('Error uploading certificate:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível enviar a certidão',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason) return;

    try {
      const { error } = await supabase
        .from('certificate_requests')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          processed_at: new Date().toISOString(),
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({ title: 'Solicitação rejeitada' });
      setShowRejectDialog(false);
      setSelectedRequest(null);
      setRejectionReason('');
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível rejeitar a solicitação',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { class: string; icon: any; label: string }> = {
      pending: { class: 'bg-amber-500/10 text-amber-500 border-amber-500/30', icon: Clock, label: 'Pendente' },
      processing: { class: 'bg-blue-500/10 text-blue-500 border-blue-500/30', icon: Loader2, label: 'Em Processamento' },
      completed: { class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30', icon: CheckCircle, label: 'Concluída' },
      rejected: { class: 'bg-red-500/10 text-red-500 border-red-500/30', icon: XCircle, label: 'Rejeitada' },
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={config.class}>
        <Icon className={`h-3 w-3 mr-1 ${status === 'processing' ? 'animate-spin' : ''}`} />
        {config.label}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    if (status === 'paid') {
      return <Badge className="bg-emerald-500/20 text-emerald-600">Pago</Badge>;
    }
    return <Badge variant="outline" className="text-muted-foreground">Pendente</Badge>;
  };

  const formatCurrency = (cents: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  const filteredRequests = requests.filter(r => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    processing: requests.filter(r => r.status === 'processing').length,
    completed: requests.filter(r => r.status === 'completed').length,
    total: requests.length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Loader2 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.processing}</p>
                <p className="text-xs text-muted-foreground">Processando</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card className="bg-card border-border shadow-soft">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Solicitações de Certidões
              </CardTitle>
              <CardDescription>Gerencie as solicitações de certidões dos clientes</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-md border border-border bg-background text-sm"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendentes</option>
                <option value="processing">Em Processamento</option>
                <option value="completed">Concluídas</option>
                <option value="rejected">Rejeitadas</option>
              </select>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhuma solicitação encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo de Certidão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.user_name || 'Cliente'}</p>
                          <p className="text-xs text-muted-foreground">{request.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{CERTIFICATE_TYPES[request.certificate_type] || request.certificate_type}</p>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{getPaymentBadge(request.payment_status)}</TableCell>
                      <TableCell>
                        <p className="text-sm">{new Date(request.created_at).toLocaleDateString('pt-BR')}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {request.status === 'pending' && request.payment_status === 'paid' && isAdmin && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAssignToMe(request.id)}
                            >
                              Assumir
                            </Button>
                          )}
                          {(request.status === 'pending' || request.status === 'processing') && request.payment_status === 'paid' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowUploadDialog(true);
                                }}
                              >
                                <Upload className="h-4 w-4 mr-1" />
                                Enviar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowRejectDialog(true);
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {request.status === 'completed' && request.document_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  // Generate signed URL on-demand for security
                                  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                                    .from('certificates')
                                    .createSignedUrl(request.document_url!, 3600); // 1 hour expiry
                                  
                                  if (signedUrlError) throw signedUrlError;
                                  if (signedUrlData?.signedUrl) {
                                    window.open(signedUrlData.signedUrl, '_blank');
                                  }
                                } catch (error) {
                                  console.error('Error generating download URL:', error);
                                  toast({
                                    variant: 'destructive',
                                    title: 'Erro',
                                    description: 'Não foi possível gerar o link de download',
                                  });
                                }
                              }}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Baixar
                            </Button>
                          )}
                          {request.status === 'rejected' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                toast({
                                  title: 'Motivo da Rejeição',
                                  description: request.rejection_reason || 'Não especificado',
                                });
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Certidão</DialogTitle>
            <DialogDescription>
              Faça upload do documento da certidão para o cliente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRequest && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-medium">{CERTIFICATE_TYPES[selectedRequest.certificate_type]}</p>
                <p className="text-sm text-muted-foreground">
                  Cliente: {selectedRequest.user_name || selectedRequest.user_email}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Arquivo da Certidão</Label>
              <Input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: PDF, PNG, JPG
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpload} disabled={!file || isUploading}>
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Enviar Certidão
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Rejeitar Solicitação
            </DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição para o cliente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Motivo da Rejeição</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Descreva o motivo da rejeição..."
                className="min-h-[100px]"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
              >
                Confirmar Rejeição
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
