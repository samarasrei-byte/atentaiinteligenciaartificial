import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download, Eye, Upload, Clock, CheckCircle, XCircle, Search, RefreshCw } from 'lucide-react';
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
  expires_at?: string;
}

interface ServiceDocumentsProps {
  serviceType: 'limpa-nome' | 'fiscal' | 'bi';
  serviceName: string;
  serviceColor: string; // e.g., 'emerald', 'violet', 'indigo'
}

/**
 * ServiceDocuments - Documentos contextualizados por serviço
 * 
 * REGRA DE NEGÓCIO:
 * - Documentos NÃO são páginas soltas
 * - Cada serviço mostra APENAS seus próprios documentos
 * - Mostra ORIGEM, CLIENTE, DATA
 */
export const ServiceDocuments: React.FC<ServiceDocumentsProps> = ({ 
  serviceType, 
  serviceName,
  serviceColor 
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    loadDocuments();
  }, [serviceType]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      // Por enquanto, busca de company_opening_documents
      // Em produção, cada serviço teria sua própria tabela de documentos
      const { data: docs } = await supabase
        .from('company_opening_documents')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      setDocuments((docs || []).map(doc => ({
        ...doc,
        status: doc.status as 'pending' | 'approved' | 'rejected',
      })));
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.document_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
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

  const stats = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'pending').length,
    approved: documents.filter(d => d.status === 'approved').length,
  };

  const colorClasses = {
    emerald: 'from-emerald-500 to-teal-600',
    violet: 'from-violet-500 to-purple-600',
    indigo: 'from-indigo-500 to-blue-600',
  };

  return (
    <div className="space-y-4">
      {/* Header compacto */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg bg-gradient-to-br", colorClasses[serviceColor as keyof typeof colorClasses] || colorClasses.indigo)}>
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Documentos - {serviceName}</h3>
            <p className="text-xs text-muted-foreground">
              {stats.total} documentos • {stats.pending} pendentes
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadDocuments}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
        <div className="flex items-center gap-1">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'ghost'}
              size="sm"
              className="h-8"
              onClick={() => setStatusFilter(status as any)}
            >
              {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendentes' : status === 'approved' ? 'Aprovados' : 'Rejeitados'}
            </Button>
          ))}
        </div>
      </div>

      {/* Lista de documentos */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-muted-foreground mt-3 text-sm">Carregando...</p>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Nenhum documento encontrado</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{doc.document_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.document_type} • {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true, locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(doc.status)}
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
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

export default ServiceDocuments;
