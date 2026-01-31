-- Migração: Atualizar expiração de documentos para 7 dias
-- Contexto: Documentos de Gestão da Plataforma (Guilherme Admin) expiram em 7 dias

-- 1. Alterar default de expires_at para 7 dias em company_opening_documents
ALTER TABLE public.company_opening_documents 
ALTER COLUMN expires_at SET DEFAULT (now() + interval '7 days');

-- 2. Atualizar documentos existentes que ainda não expiraram para nova política de 7 dias
UPDATE public.company_opening_documents
SET expires_at = created_at + interval '7 days'
WHERE deleted_at IS NULL 
  AND expires_at > now();

-- 3. Criar ou substituir função para notificar documentos que expiram em 3 dias (ajustado de 7)
CREATE OR REPLACE FUNCTION notify_expiring_documents()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notified_count integer := 0;
BEGIN
  -- Notificar documentos que expiram em 3 dias (para política de 7 dias)
  UPDATE company_opening_documents
  SET expiration_notified_at = now()
  WHERE deleted_at IS NULL
    AND expires_at IS NOT NULL
    AND expires_at <= now() + interval '3 days'
    AND expires_at > now()
    AND expiration_notified_at IS NULL;
  
  GET DIAGNOSTICS notified_count = ROW_COUNT;
  RETURN notified_count;
END;
$$;

-- 4. Criar ou substituir função para soft-delete de documentos expirados
CREATE OR REPLACE FUNCTION soft_delete_expired_documents()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer := 0;
  doc RECORD;
BEGIN
  -- Processar documentos expirados
  FOR doc IN 
    SELECT id, document_name, document_type, file_path, request_id, user_id, created_at
    FROM company_opening_documents
    WHERE deleted_at IS NULL
      AND expires_at IS NOT NULL
      AND expires_at <= now()
  LOOP
    -- Registrar no log de expiração
    INSERT INTO document_expiration_logs (
      document_id,
      document_name,
      document_type,
      file_path,
      request_id,
      user_id,
      original_created_at,
      expired_at
    ) VALUES (
      doc.id,
      doc.document_name,
      doc.document_type,
      doc.file_path,
      doc.request_id,
      doc.user_id,
      doc.created_at,
      now()
    );
    
    -- Soft-delete o documento
    UPDATE company_opening_documents
    SET deleted_at = now()
    WHERE id = doc.id;
    
    deleted_count := deleted_count + 1;
  END LOOP;
  
  RETURN deleted_count;
END;
$$;