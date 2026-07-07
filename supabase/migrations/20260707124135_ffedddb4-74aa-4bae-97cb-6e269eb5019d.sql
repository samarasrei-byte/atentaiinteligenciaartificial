
-- 1. Revoke EXECUTE from anon/authenticated on internal SECURITY DEFINER functions
--    (triggers + admin/cron utilities). RLS helper functions and client-callable
--    RPCs are intentionally left executable.
REVOKE EXECUTE ON FUNCTION public.assign_special_roles() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auto_create_capassi_membership() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_tax_limits_and_notify() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_credit_repair_history() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_admins_carta_partner_approved() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_admins_carta_partner_rejected() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_admins_new_carta_lead() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_company_opening_status_change() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_contador_client_limits() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_new_contador() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_partner_carta_admin_released() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_partner_new_credit_repair() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_carta_partner_action() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_fiscal_request_user_id() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_document_expiration() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_rate_limits() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_expiring_documents() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.soft_delete_expired_documents() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.calculate_partner_share(text, bigint, date) FROM anon, authenticated, PUBLIC;

-- 2. Remove overly permissive policy on nf_webhook_logs
--    (service_role bypasses RLS; no need for a USING(true) ALL policy)
DROP POLICY IF EXISTS "Service role can manage webhook logs" ON public.nf_webhook_logs;

-- 3. Tighten public insert on mentoria_cartas_leads: require basic anti-spam fields
DROP POLICY IF EXISTS "anon_auth_can_insert_mentoria_leads" ON public.mentoria_cartas_leads;
CREATE POLICY "public_can_insert_valid_mentoria_leads"
  ON public.mentoria_cartas_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    full_name IS NOT NULL AND length(btrim(full_name)) >= 3
    AND phone IS NOT NULL AND length(regexp_replace(phone, '\D', '', 'g')) >= 10
  );
