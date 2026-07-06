
-- 1. Approval workflow columns
ALTER TABLE public.mentoria_cartas_leads
  ADD COLUMN IF NOT EXISTS approval_stage text NOT NULL DEFAULT 'pending_partner',
  ADD COLUMN IF NOT EXISTS partner_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS partner_rejection_reason text,
  ADD COLUMN IF NOT EXISTS admin_released_at timestamptz,
  ADD COLUMN IF NOT EXISTS admin_released_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS admin_release_notes text;

-- Ensure valid stage values
DO $$ BEGIN
  ALTER TABLE public.mentoria_cartas_leads
    ADD CONSTRAINT mentoria_cartas_leads_approval_stage_check
    CHECK (approval_stage IN ('pending_partner','partner_approved','partner_rejected','admin_released','admin_denied'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_mentoria_cartas_leads_approval_stage
  ON public.mentoria_cartas_leads(approval_stage);

-- 2. Realtime
ALTER TABLE public.mentoria_cartas_leads REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.mentoria_cartas_leads;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Trigger: notify admins when partner approves
CREATE OR REPLACE FUNCTION public.notify_admins_carta_partner_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_row RECORD;
BEGIN
  IF NEW.approval_stage = 'partner_approved'
     AND (OLD.approval_stage IS DISTINCT FROM NEW.approval_stage) THEN

    FOR admin_row IN
      SELECT user_id FROM public.user_roles WHERE role = 'admin'
    LOOP
      INSERT INTO public.service_notifications (
        user_id, title, message, notification_type, service_type, metadata
      ) VALUES (
        admin_row.user_id,
        '🛡️ Parceiro aprovou carta — liberar contato',
        'O parceiro validou a carta de ' || COALESCE(NEW.full_name, 'Cliente') ||
          ' (' || COALESCE(NEW.carta_type, 'carta') || ', ' ||
          COALESCE(NEW.credit_range, 's/valor') || '). ' ||
          'Autorize o contato no painel para o parceiro fechar o negócio.',
        'carta_partner_approved',
        'cartas_contempladas',
        jsonb_build_object(
          'lead_id', NEW.id,
          'partner_notes', NEW.partner_validation_notes,
          'carta_type', NEW.carta_type,
          'credit_range', NEW.credit_range
        )
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admins_carta_partner_approved ON public.mentoria_cartas_leads;
CREATE TRIGGER trg_notify_admins_carta_partner_approved
AFTER UPDATE ON public.mentoria_cartas_leads
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_carta_partner_approved();

-- 4. Trigger: notify partner when admin releases contact
CREATE OR REPLACE FUNCTION public.notify_partner_carta_admin_released()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  partner_user_id uuid;
BEGIN
  IF NEW.approval_stage = 'admin_released'
     AND (OLD.approval_stage IS DISTINCT FROM NEW.approval_stage) THEN

    SELECT id INTO partner_user_id
    FROM auth.users
    WHERE lower(email) = 'parceiro@atentai.com.br'
    LIMIT 1;

    IF partner_user_id IS NOT NULL THEN
      INSERT INTO public.service_notifications (
        user_id, title, message, notification_type, service_type, metadata
      ) VALUES (
        partner_user_id,
        '✅ Contato liberado pelo admin',
        'O admin liberou o contato de ' || COALESCE(NEW.full_name, 'Cliente') ||
          '. Você já pode entrar em contato para fechar o negócio.',
        'carta_admin_released',
        'cartas_contempladas',
        jsonb_build_object('lead_id', NEW.id)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_partner_carta_admin_released ON public.mentoria_cartas_leads;
CREATE TRIGGER trg_notify_partner_carta_admin_released
AFTER UPDATE ON public.mentoria_cartas_leads
FOR EACH ROW
EXECUTE FUNCTION public.notify_partner_carta_admin_released();
