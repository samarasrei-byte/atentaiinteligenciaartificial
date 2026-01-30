-- ============================================================================
-- GOVERNANÇA DE DOCUMENTOS: EXPIRAÇÃO AUTOMÁTICA EM 60 DIAS
-- ============================================================================

-- 1. Adicionar colunas de expiração e soft-delete em company_opening_documents
ALTER TABLE public.company_opening_documents 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expiration_notified_at TIMESTAMP WITH TIME ZONE;

-- 2. Atualizar documentos existentes: expires_at = created_at + 60 dias
UPDATE public.company_opening_documents 
SET expires_at = created_at + INTERVAL '60 days'
WHERE expires_at IS NULL;

-- 3. Trigger para definir expires_at automaticamente em novos documentos
CREATE OR REPLACE FUNCTION public.set_document_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- Define expiração para 60 dias após criação
  NEW.expires_at := COALESCE(NEW.expires_at, NOW() + INTERVAL '60 days');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trigger_set_document_expiration ON public.company_opening_documents;

CREATE TRIGGER trigger_set_document_expiration
BEFORE INSERT ON public.company_opening_documents
FOR EACH ROW
EXECUTE FUNCTION public.set_document_expiration();

-- 4. Criar tabela de auditoria de documentos (preserva metadados após soft-delete)
CREATE TABLE IF NOT EXISTS public.document_expiration_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  request_id UUID NOT NULL,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  original_created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expired_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_from_storage BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Habilitar RLS na tabela de logs
ALTER TABLE public.document_expiration_logs ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS para logs de expiração
CREATE POLICY "Block anonymous access to document_expiration_logs"
ON public.document_expiration_logs FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can view all document logs"
ON public.document_expiration_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own document logs"
ON public.document_expiration_logs FOR SELECT
USING (auth.uid() = user_id);

-- 7. Índices para performance
CREATE INDEX IF NOT EXISTS idx_documents_expires_at 
ON public.company_opening_documents(expires_at) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_documents_expiration_notified 
ON public.company_opening_documents(expiration_notified_at) 
WHERE deleted_at IS NULL;

-- 8. Função para soft-delete de documentos expirados (será chamada pelo cron)
CREATE OR REPLACE FUNCTION public.soft_delete_expired_documents()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  doc RECORD;
BEGIN
  -- Processa documentos expirados que ainda não foram deletados
  FOR doc IN 
    SELECT * FROM public.company_opening_documents 
    WHERE expires_at <= NOW() 
    AND deleted_at IS NULL
  LOOP
    -- Registra no log de auditoria
    INSERT INTO public.document_expiration_logs (
      document_id, request_id, user_id, document_type, 
      document_name, file_path, original_created_at, metadata
    ) VALUES (
      doc.id, doc.request_id, doc.user_id, doc.document_type,
      doc.document_name, doc.file_path, doc.created_at,
      jsonb_build_object(
        'file_size_bytes', doc.file_size_bytes,
        'mime_type', doc.mime_type,
        'status', doc.status
      )
    );
    
    -- Marca como deletado (soft-delete)
    UPDATE public.company_opening_documents 
    SET deleted_at = NOW()
    WHERE id = doc.id;
    
    deleted_count := deleted_count + 1;
  END LOOP;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. Função para notificar documentos próximos de expirar (7 dias)
CREATE OR REPLACE FUNCTION public.notify_expiring_documents()
RETURNS INTEGER AS $$
DECLARE
  notified_count INTEGER := 0;
  doc RECORD;
BEGIN
  -- Documentos que expiram em 7 dias e ainda não foram notificados
  FOR doc IN 
    SELECT cod.*, cor.full_name, cor.email
    FROM public.company_opening_documents cod
    JOIN public.company_opening_requests cor ON cod.request_id = cor.id
    WHERE cod.expires_at <= NOW() + INTERVAL '7 days'
    AND cod.expires_at > NOW()
    AND cod.deleted_at IS NULL
    AND cod.expiration_notified_at IS NULL
  LOOP
    -- Cria notificação para o usuário
    INSERT INTO public.service_notifications (
      user_id, title, message, notification_type, service_type, metadata
    ) VALUES (
      doc.user_id,
      '⚠️ Documento expira em breve',
      'O documento "' || doc.document_name || '" expira em 7 dias. Faça o download se necessário.',
      'document_expiring',
      'company_opening',
      jsonb_build_object(
        'document_id', doc.id,
        'document_name', doc.document_name,
        'expires_at', doc.expires_at
      )
    );
    
    -- Marca como notificado
    UPDATE public.company_opening_documents 
    SET expiration_notified_at = NOW()
    WHERE id = doc.id;
    
    notified_count := notified_count + 1;
  END LOOP;
  
  RETURN notified_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. View para documentos ativos (exclui soft-deleted)
CREATE OR REPLACE VIEW public.active_company_documents AS
SELECT * FROM public.company_opening_documents
WHERE deleted_at IS NULL;