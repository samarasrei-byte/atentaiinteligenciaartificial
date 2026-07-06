
-- 1. Add validation columns
ALTER TABLE public.mentoria_cartas_leads
  ADD COLUMN IF NOT EXISTS partner_validated boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS partner_validation_status text,
  ADD COLUMN IF NOT EXISTS partner_validation_notes text,
  ADD COLUMN IF NOT EXISTS partner_validated_at timestamptz,
  ADD COLUMN IF NOT EXISTS partner_validated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Partner-identification function (email based, avoids enum change)
CREATE OR REPLACE FUNCTION public.is_carta_partner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = _user_id
      AND lower(email) = 'parceiro@atentai.com.br'
  )
$$;

GRANT EXECUTE ON FUNCTION public.is_carta_partner(uuid) TO authenticated;

-- 3. RLS policies for partner
DROP POLICY IF EXISTS "Carta partner can view all leads" ON public.mentoria_cartas_leads;
CREATE POLICY "Carta partner can view all leads"
  ON public.mentoria_cartas_leads
  FOR SELECT
  TO authenticated
  USING (public.is_carta_partner(auth.uid()));

DROP POLICY IF EXISTS "Carta partner can update validation" ON public.mentoria_cartas_leads;
CREATE POLICY "Carta partner can update validation"
  ON public.mentoria_cartas_leads
  FOR UPDATE
  TO authenticated
  USING (public.is_carta_partner(auth.uid()))
  WITH CHECK (public.is_carta_partner(auth.uid()));
