
ALTER TABLE public.mentoria_cartas_leads
  ADD COLUMN IF NOT EXISTS score integer,
  ADD COLUMN IF NOT EXISTS score_band text,
  ADD COLUMN IF NOT EXISTS lost_reason text;

CREATE OR REPLACE FUNCTION public.compute_score_band(_score integer)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN _score IS NULL THEN NULL
    WHEN _score >= 80 THEN 'A'
    WHEN _score >= 60 THEN 'B'
    WHEN _score >= 40 THEN 'C'
    ELSE 'D'
  END
$$;

CREATE OR REPLACE FUNCTION public.set_lead_score_band()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.score IS NULL AND NEW.metadata ? 'score' THEN
    BEGIN
      NEW.score := (NEW.metadata->>'score')::int;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
  NEW.score_band := public.compute_score_band(NEW.score);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_lead_score_band ON public.mentoria_cartas_leads;
CREATE TRIGGER trg_set_lead_score_band
BEFORE INSERT OR UPDATE ON public.mentoria_cartas_leads
FOR EACH ROW EXECUTE FUNCTION public.set_lead_score_band();

CREATE TABLE IF NOT EXISTS public.lead_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.mentoria_cartas_leads(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  reason text,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_by_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.lead_status_history TO authenticated;
GRANT ALL ON public.lead_status_history TO service_role;

ALTER TABLE public.lead_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view lead history"
  ON public.lead_status_history FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_carta_partner(auth.uid()));

CREATE POLICY "Admins can insert lead history"
  ON public.lead_status_history FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_carta_partner(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_lead_status_history_lead ON public.lead_status_history(lead_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.log_lead_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email text;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
    INSERT INTO public.lead_status_history (lead_id, from_status, to_status, reason, changed_by, changed_by_email)
    VALUES (NEW.id, OLD.status, NEW.status, NEW.lost_reason, auth.uid(), v_email);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_lead_status_change ON public.mentoria_cartas_leads;
CREATE TRIGGER trg_log_lead_status_change
AFTER UPDATE OF status ON public.mentoria_cartas_leads
FOR EACH ROW EXECUTE FUNCTION public.log_lead_status_change();
