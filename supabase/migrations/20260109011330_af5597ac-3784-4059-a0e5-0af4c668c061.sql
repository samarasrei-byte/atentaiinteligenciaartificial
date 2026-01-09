-- Fix the RLS policy for credit_repair_partners to correctly reference the table column
DROP POLICY IF EXISTS "Partner users can view their partner" ON public.credit_repair_partners;

CREATE POLICY "Partner users can view their partner"
ON public.credit_repair_partners
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT partner_id FROM credit_repair_partner_users 
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Primary partner users can update their partner" ON public.credit_repair_partners;

CREATE POLICY "Primary partner users can update their partner"
ON public.credit_repair_partners
FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT partner_id FROM credit_repair_partner_users 
    WHERE user_id = auth.uid() AND is_primary = true
  )
);