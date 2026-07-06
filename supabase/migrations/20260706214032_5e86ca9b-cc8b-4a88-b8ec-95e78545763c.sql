
-- 1) Validation trigger: block partner approve/reject if lead data is incomplete
CREATE OR REPLACE FUNCTION public.validate_carta_partner_action()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sim jsonb;
BEGIN
  -- Only run when moving to partner_approved or partner_rejected
  IF NEW.approval_stage IN ('partner_approved','partner_rejected')
     AND (OLD.approval_stage IS DISTINCT FROM NEW.approval_stage) THEN

    -- Basic identity
    IF NEW.full_name IS NULL OR length(btrim(NEW.full_name)) < 3 THEN
      RAISE EXCEPTION 'Nome do cliente incompleto — não é possível validar a carta.'
        USING ERRCODE = '23514';
    END IF;
    IF NEW.email IS NULL OR NEW.email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
      RAISE EXCEPTION 'E-mail do cliente inválido — não é possível validar a carta.'
        USING ERRCODE = '23514';
    END IF;
    IF NEW.phone IS NULL OR length(regexp_replace(NEW.phone, '\D', '', 'g')) < 10 THEN
      RAISE EXCEPTION 'WhatsApp do cliente inválido — não é possível validar a carta.'
        USING ERRCODE = '23514';
    END IF;

    -- Product basics
    IF NEW.carta_type IS NULL OR length(btrim(NEW.carta_type)) = 0 THEN
      RAISE EXCEPTION 'Tipo de carta ausente — quiz incompleto.'
        USING ERRCODE = '23514';
    END IF;

    -- Simulation payload
    v_sim := COALESCE(NEW.metadata -> 'simulacao', '{}'::jsonb);
    IF NOT (v_sim ? 'credito' AND v_sim ? 'prazo_meses' AND v_sim ? 'parcela_estimada') THEN
      RAISE EXCEPTION 'Simulação incompleta (crédito, prazo ou parcela ausente) — quiz precisa ser refeito.'
        USING ERRCODE = '23514';
    END IF;
    IF (v_sim ->> 'credito')::numeric <= 0
       OR (v_sim ->> 'prazo_meses')::numeric <= 0
       OR (v_sim ->> 'parcela_estimada')::numeric <= 0 THEN
      RAISE EXCEPTION 'Valores da simulação inconsistentes (zero ou negativos).'
        USING ERRCODE = '23514';
    END IF;

    -- Rejection requires a reason
    IF NEW.approval_stage = 'partner_rejected'
       AND (NEW.partner_rejection_reason IS NULL OR length(btrim(NEW.partner_rejection_reason)) < 5) THEN
      RAISE EXCEPTION 'Motivo da rejeição obrigatório (mínimo 5 caracteres).'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_carta_partner_action ON public.mentoria_cartas_leads;
CREATE TRIGGER trg_validate_carta_partner_action
BEFORE UPDATE ON public.mentoria_cartas_leads
FOR EACH ROW EXECUTE FUNCTION public.validate_carta_partner_action();


-- 2) Notify admins when a NEW lead is submitted from the quiz
CREATE OR REPLACE FUNCTION public.notify_admins_new_carta_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_row RECORD;
BEGIN
  FOR admin_row IN SELECT user_id FROM public.user_roles WHERE role = 'admin' LOOP
    INSERT INTO public.service_notifications (
      user_id, title, message, notification_type, service_type, metadata
    ) VALUES (
      admin_row.user_id,
      '🆕 Novo lead — Cartas Contempladas',
      'Novo quiz concluído por ' || COALESCE(NEW.full_name,'Cliente') ||
        ' (' || COALESCE(NEW.carta_type,'carta') ||
        COALESCE(', ' || NEW.credit_range, '') || ').',
      'carta_new_lead',
      'cartas_contempladas',
      jsonb_build_object('lead_id', NEW.id, 'carta_type', NEW.carta_type, 'credit_range', NEW.credit_range)
    );
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admins_new_carta_lead ON public.mentoria_cartas_leads;
CREATE TRIGGER trg_notify_admins_new_carta_lead
AFTER INSERT ON public.mentoria_cartas_leads
FOR EACH ROW EXECUTE FUNCTION public.notify_admins_new_carta_lead();


-- 3) Notify admins when partner REJECTS a lead
CREATE OR REPLACE FUNCTION public.notify_admins_carta_partner_rejected()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_row RECORD;
BEGIN
  IF NEW.approval_stage = 'partner_rejected'
     AND (OLD.approval_stage IS DISTINCT FROM NEW.approval_stage) THEN
    FOR admin_row IN SELECT user_id FROM public.user_roles WHERE role = 'admin' LOOP
      INSERT INTO public.service_notifications (
        user_id, title, message, notification_type, service_type, metadata
      ) VALUES (
        admin_row.user_id,
        '❌ Parceiro rejeitou carta',
        'Lead ' || COALESCE(NEW.full_name,'Cliente') || ' foi rejeitado pelo parceiro. Motivo: ' ||
          COALESCE(NEW.partner_rejection_reason, 'não informado'),
        'carta_partner_rejected',
        'cartas_contempladas',
        jsonb_build_object('lead_id', NEW.id, 'reason', NEW.partner_rejection_reason)
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admins_carta_partner_rejected ON public.mentoria_cartas_leads;
CREATE TRIGGER trg_notify_admins_carta_partner_rejected
AFTER UPDATE ON public.mentoria_cartas_leads
FOR EACH ROW EXECUTE FUNCTION public.notify_admins_carta_partner_rejected();


-- 4) Ensure existing notification triggers (partner_approved / admin_released) are attached
DROP TRIGGER IF EXISTS trg_notify_admins_carta_partner_approved ON public.mentoria_cartas_leads;
CREATE TRIGGER trg_notify_admins_carta_partner_approved
AFTER UPDATE ON public.mentoria_cartas_leads
FOR EACH ROW EXECUTE FUNCTION public.notify_admins_carta_partner_approved();

DROP TRIGGER IF EXISTS trg_notify_partner_carta_admin_released ON public.mentoria_cartas_leads;
CREATE TRIGGER trg_notify_partner_carta_admin_released
AFTER UPDATE ON public.mentoria_cartas_leads
FOR EACH ROW EXECUTE FUNCTION public.notify_partner_carta_admin_released();


-- 5) Ensure Realtime broadcasts row-level updates for the timeline
ALTER TABLE public.mentoria_cartas_leads REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'mentoria_cartas_leads'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.mentoria_cartas_leads';
  END IF;
END $$;
