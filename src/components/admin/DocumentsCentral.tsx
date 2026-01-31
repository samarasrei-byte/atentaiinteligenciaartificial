import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download, Eye, Filter, Search, Shield, Scale, BarChart3, Upload, Clock, CheckCircle, XCircle, User, Calendar, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Document {
  id: string;
  document_name: string;
  document_type: string;
  file_path: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  request_id: string;
  user_id: string;
  origin: 'limpa-nome' | 'fiscal' | 'bi' | 'abertura';
  client_name?: string;
  expires_at?: string;
}

interface DocumentsCentralProps {
  filter?: 'all' | 'limpa-nome' | 'fiscal' | 'bi';
}

/**
 * DocumentsCentral - Central Única de Documentos
 * 
 * REGRA DE NEGÓCIO:
 * - Documentos NÃO são páginas soltas
 * - Documentos são RESULTADO de ações (enviados via chat)
 * - Mostra ORIGEM (qual chat), SERVIÇO, CLIENTE, DATA
 * - Permite download, reenvio no chat, reclassificação
 */
export const DocumentsCentral: React.FC<DocumentsCentralProps> = ({ filter = 'all' }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [serviceFilter, setServiceFilter] = useState<'all' | 'limpa-nome' | 'fiscal' | 'bi'>(filter);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      // Buscar documentos de company_opening_documents
      const { data: openingDocs } = await supabase
        .from('company_opening_documents')
        .select(`
          id,
          document_name,
          document_type,
          file_path,
          status,
          created_at,
          request_id,
          user_id,
          expires_at
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      const mappedDocs: Document[] = (openingDocs || []).map(doc => ({
        ...doc,
        status: doc.status as 'pending' | 'approved' | 'rejected',
        origin: 'abertura' as const,
      }));

      setDocuments(mappedDocs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.document_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeFilter === 'all' || doc.status === activeFilter;
    const matchesService = serviceFilter === 'all' || doc.origin === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  });

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { label: 'Pendente', icon: Clock, class: 'bg-amber-100 text-amber-700 border-amber-200' },
      approved: { label: 'Aprovado', icon: CheckCircle, class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      rejected: { label: 'Rejeitado', icon: XCircle, class: 'bg-red-100 text-red-700 border-red-200' },
    };
    const config = configs[status as keyof typeof configs] || configs.pending;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={cn('gap-1', config.class)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getOriginBadge = (origin: string) => {
    const configs = {
      'limpa-nome': { label: 'Limpa Nome', icon: Shield, class: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
      'fiscal': { label: 'Fiscal', icon: Scale, class: 'bg-violet-50 text-violet-600 border-violet-200' },
      'bi': { label: 'BI/Contábil', icon: BarChart3, class: 'bg-blue-50 text-blue-600 border-blue-200' },
      'abertura': { label: 'Abertura', icon: FileText, class: 'bg-slate-50 text-slate-600 border-slate-200' },
    };
    const config = configs[origin as keyof typeof configs] || configs.abertura;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={cn('gap-1', config.class)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const stats = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'pending').length,
    approved: documents.filter(d => d.status === 'approved').length,
    rejected: documents.filter(d => d.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Central de Documentos</h1>
            <p className="text-muted-foreground">Todos os documentos centralizados por origem e serviço</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2" onClick={loadDocuments}>
          <Upload className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700">Pendentes</p>
                <p className="text-2xl font-bold text-amber-900">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700">Aprovados</p>
                <p className="text-2xl font-bold text-emerald-900">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Rejeitados</p>
                <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <Button
                  key={status}
                  variant={activeFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter(status as any)}
                >
                  {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendentes' : status === 'approved' ? 'Aprovados' : 'Rejeitados'}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Serviço:</span>
              {['all', 'limpa-nome', 'fiscal', 'bi'].map((service) => (
                <Button
                  key={service}
                  variant={serviceFilter === service ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setServiceFilter(service as any)}
                >
                  {service === 'all' ? 'Todos' : service === 'limpa-nome' ? 'Limpa Nome' : service === 'fiscal' ? 'Fiscal' : 'BI'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos ({filteredDocs.length})</CardTitle>
          <CardDescription>Fluxo: Chat → Documento → Serviço → Cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-muted-foreground mt-4">Carregando documentos...</p>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum documento encontrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{doc.document_name}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <span>{doc.document_type}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(doc.created_at), { addSuffix: true, locale: ptBR })}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {getOriginBadge(doc.origin)}
                      {getStatusBadge(doc.status)}
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsCentral;
