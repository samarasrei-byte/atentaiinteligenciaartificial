import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2,
  AlertCircle,
  Download
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DocumentUploadProps {
  requestId: string;
}

const DOCUMENT_TYPES = [
  { value: 'cpf', label: 'CPF', description: 'Cadastro de Pessoa Física' },
  { value: 'rg', label: 'RG', description: 'Documento de Identidade' },
  { value: 'comprovante_residencia', label: 'Comprovante de Residência', description: 'Conta de luz, água ou telefone' },
  { value: 'iptu', label: 'IPTU', description: 'Comprovante de endereço comercial' },
  { value: 'contrato_social', label: 'Contrato Social', description: 'Se já possui empresa' },
  { value: 'other', label: 'Outro', description: 'Documento adicional' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Em Análise',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: <Clock className="h-3 w-3" />,
  },
  approved: {
    label: 'Aprovado',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  rejected: {
    label: 'Rejeitado',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: <XCircle className="h-3 w-3" />,
  },
};

// Calculate days until expiration
const getDaysUntilExpiration = (expiresAt: string | null): number | null => {
  if (!expiresAt) return null;
  const now = new Date();
  const expires = new Date(expiresAt);
  const diffTime = expires.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getExpirationBadge = (expiresAt: string | null) => {
  const days = getDaysUntilExpiration(expiresAt);
  if (days === null) return null;
  
  if (days <= 0) {
    return { label: 'Expirado', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
  }
  if (days <= 7) {
    return { label: `Expira em ${days}d`, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
  }
  return { label: `${days}d restantes`, color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
};

const DocumentUpload: React.FC<DocumentUploadProps> = ({ requestId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedType, setSelectedType] = useState<string>('');

  // Fetch uploaded documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['company-opening-documents', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_opening_documents')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!requestId,
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, documentType }: { file: File; documentType: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${requestId}/${documentType}_${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('company-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Save document record
      const { error: dbError } = await supabase
        .from('company_opening_documents')
        .insert({
          request_id: requestId,
          user_id: user?.id,
          document_type: documentType,
          document_name: file.name,
          file_path: fileName,
          file_size_bytes: file.size,
          mime_type: file.type,
        });

      if (dbError) throw dbError;

      return fileName;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-opening-documents', requestId] });
      toast.success('Documento enviado com sucesso!');
      setSelectedType('');
      setUploadProgress(0);
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar documento. Tente novamente.');
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (document: { id: string; file_path: string }) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('company-documents')
        .remove([document.file_path]);

      if (storageError) console.error('Storage delete error:', storageError);

      // Delete from database
      const { error: dbError } = await supabase
        .from('company_opening_documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-opening-documents', requestId] });
      toast.success('Documento removido.');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error('Erro ao remover documento.');
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedType) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB.');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido. Use PDF, JPG ou PNG.');
      return;
    }

    setUploading(true);
    setUploadProgress(30);

    try {
      await uploadMutation.mutateAsync({ file, documentType: selectedType });
      setUploadProgress(100);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage
      .from('company-documents')
      .download(filePath);

    if (error) {
      toast.error('Erro ao baixar documento.');
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find(d => d.value === type)?.label || type;
  };

  const uploadedTypes = documents?.map(d => d.document_type) || [];

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <FileText className="h-5 w-5 text-primary" />
          Documentos
        </CardTitle>
        <CardDescription>
          Envie os documentos necessários para continuar o processo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Selecione o tipo de documento:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DOCUMENT_TYPES.map((type) => {
              const isUploaded = uploadedTypes.includes(type.value);
              return (
                <Button
                  key={type.value}
                  variant={selectedType === type.value ? 'default' : 'outline'}
                  size="sm"
                  className={`justify-start ${isUploaded ? 'border-emerald-500/50' : ''}`}
                  onClick={() => setSelectedType(type.value)}
                  disabled={uploading}
                >
                  {isUploaded && <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" />}
                  {type.label}
                </Button>
              );
            })}
          </div>

          {selectedType && (
            <div className="p-4 border border-dashed border-border rounded-lg text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                {DOCUMENT_TYPES.find(d => d.value === selectedType)?.description}
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                size="sm"
              >
                {uploading ? 'Enviando...' : 'Selecionar Arquivo'}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                PDF, JPG ou PNG (máx. 10MB)
              </p>
              {uploading && (
                <Progress value={uploadProgress} className="mt-2 h-1" />
              )}
            </div>
          )}
        </div>

        {/* Uploaded Documents */}
        {documents && documents.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Documentos enviados:</p>
            {documents.map((doc) => {
              const statusConfig = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending;
              const expirationBadge = getExpirationBadge((doc as any).expires_at);
              const isExpired = getDaysUntilExpiration((doc as any).expires_at) !== null && 
                               getDaysUntilExpiration((doc as any).expires_at)! <= 0;
              
              return (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isExpired ? 'bg-red-500/10 border border-red-500/20' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className={`h-5 w-5 shrink-0 ${isExpired ? 'text-red-400' : 'text-muted-foreground'}`} />
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {getDocumentTypeLabel(doc.document_type)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {doc.document_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {expirationBadge && (
                      <Badge className={`${expirationBadge.color} text-xs border`}>
                        <Clock className="h-3 w-3 mr-1" />
                        {expirationBadge.label}
                      </Badge>
                    )}
                    <Badge className={`${statusConfig.color} text-xs`}>
                      {statusConfig.icon}
                      <span className="ml-1">{statusConfig.label}</span>
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDownload(doc.file_path, doc.document_name)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {doc.status !== 'approved' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                        onClick={() => deleteMutation.mutate({ id: doc.id, file_path: doc.file_path })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info about rejection */}
        {documents?.some(d => d.status === 'rejected') && (
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-400">Documento rejeitado</p>
              <p className="text-xs text-red-400/70">
                {documents.find(d => d.status === 'rejected')?.rejection_reason || 
                  'Por favor, envie novamente o documento com as correções necessárias.'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
