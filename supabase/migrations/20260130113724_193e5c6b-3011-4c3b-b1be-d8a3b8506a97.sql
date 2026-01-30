-- Fix Security Definer View: Usar SECURITY INVOKER (padrão) ao invés de DEFINER
-- Isso garante que as políticas RLS do usuário que consulta sejam aplicadas

DROP VIEW IF EXISTS public.active_company_documents;

CREATE VIEW public.active_company_documents 
WITH (security_invoker = true) AS
SELECT * FROM public.company_opening_documents
WHERE deleted_at IS NULL;